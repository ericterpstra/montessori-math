import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { Bead } from '../../components/beads'
import { decompose, formatNumber, placeInfo } from '../../lib/placeValue'
import type { PlaceCounts, PlacePower } from '../../lib/placeValue'
import { createRng, randomSeed } from '../../lib/rng'
import {
  BEADS_PER_WIRE,
  applyTaskExchange,
  applyTaskMove,
  canTaskExchange,
  checkTarget,
  createAdditionTask,
  createSubtractionTask,
  emptyFrame,
  frameFromNumber,
  framePowers,
  frameValue,
  isTaskComplete,
  randomAdditionProblem,
  randomSubtractionProblem,
  randomTarget,
  setWire,
  tapBead,
  wireActive,
} from './model'
import type { FrameSize, OpTask, WireCheck } from './model'
import './bead-frame.css'

type Mode = 'free' | 'make' | 'add' | 'subtract'

/** Empty slots between the resting (left) and counted (right) bead clusters. */
const GAP_SLOTS = 3

interface Stage {
  counts: PlaceCounts
  task: OpTask | null
  target: number | null
}

function buildStage(mode: Mode, size: FrameSize, seed: number): Stage {
  const rng = createRng(seed)
  if (mode === 'make') {
    return { counts: emptyFrame(), task: null, target: randomTarget(rng, size) }
  }
  if (mode === 'add') {
    const { a, b } = randomAdditionProblem(rng, size)
    return { counts: frameFromNumber(a, size), task: createAdditionTask(size, a, b), target: null }
  }
  if (mode === 'subtract') {
    const { a, b } = randomSubtractionProblem(rng, size)
    return { counts: frameFromNumber(a, size), task: createSubtractionTask(size, a, b), target: null }
  }
  return { counts: emptyFrame(), task: null, target: null }
}

function bandClass(power: PlacePower): string {
  if (power >= 6) return 'bead-frame-band-black'
  if (power >= 3) return 'bead-frame-band-gray'
  return 'bead-frame-band-white'
}

/** The frame's value with each digit printed in its place color. */
function ValueDigits({ value }: { value: number }) {
  const digits = decompose(value)
  return (
    <span aria-label={`the frame shows ${formatNumber(value)}`}>
      {digits.map((d, i) => (
        <span key={d.power}>
          <span style={{ color: placeInfo(d.power).colorVar }}>{d.digit}</span>
          {d.power > 0 && d.power % 3 === 0 && i < digits.length - 1 ? ',' : ''}
        </span>
      ))}
    </span>
  )
}

export default function BeadFrame() {
  const [mode, setMode] = useState<Mode>('free')
  const [size, setSize] = useState<FrameSize>('small')
  const [seed, setSeed] = useState(() => randomSeed())
  const [stage, setStage] = useState<Stage>(() => buildStage('free', 'small', seed))
  const [showValue, setShowValue] = useState(true)
  const [checks, setChecks] = useState<WireCheck[] | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function start(nextMode: Mode, nextSize: FrameSize, nextSeed: number) {
    setMode(nextMode)
    setSize(nextSize)
    setSeed(nextSeed)
    setStage(buildStage(nextMode, nextSize, nextSeed))
    setChecks(null)
    setMessage(null)
    setShowValue(nextMode !== 'make')
  }

  function onTapBead(power: PlacePower, position: number) {
    const nextActive = tapBead(wireActive(stage.counts, power), position)
    if (stage.task) {
      const r = applyTaskMove(stage.task, stage.counts, power, nextActive)
      if (!r.ok) {
        setMessage(r.reason ?? null)
        return
      }
      setStage({ ...stage, counts: r.counts, task: r.task })
    } else {
      setStage({ ...stage, counts: setWire(stage.counts, power, nextActive) })
      setChecks(null)
    }
    setMessage(null)
  }

  function onExchange(power: PlacePower) {
    if (!stage.task) return
    const r = applyTaskExchange(stage.task, stage.counts, power)
    if (!r.ok) {
      setMessage(r.reason ?? null)
      return
    }
    setStage({ ...stage, counts: r.counts, task: r.task })
    setMessage(null)
  }

  function onCheck() {
    if (stage.target == null) return
    setChecks(checkTarget(stage.counts, stage.target, size))
  }

  const powers = framePowers(size)
  const value = frameValue(stage.counts)
  const task = stage.task
  const complete = task !== null && isTaskComplete(task, stage.counts)
  const taskResult = task ? (task.kind === 'add' ? task.a + task.b : task.a - task.b) : 0

  const banner: ReactNode[] = []
  if (stage.target != null) {
    banner.push(
      <span key="target-label" className="bead-frame-banner-label">
        Make this number
      </span>,
      <span key="target">{formatNumber(stage.target)}</span>,
    )
  }
  if (task) {
    banner.push(
      <span key="problem">
        {formatNumber(task.a)} {task.kind === 'add' ? '+' : '−'} {formatNumber(task.b)}
      </span>,
    )
    if (complete) {
      banner.push(
        <span key="result" className="bead-frame-result">
          = {formatNumber(taskResult)} ✓
        </span>,
      )
    }
  }
  if (showValue) {
    banner.push(
      <span key="value-label" className="bead-frame-banner-label">
        The frame shows
      </span>,
      <ValueDigits key="value" value={value} />,
    )
  }

  const controls = (
    <>
      <label>
        Frame{' '}
        <select value={size} onChange={(e) => start(mode, e.target.value as FrameSize, seed)}>
          <option value="small">Small — to 9,999</option>
          <option value="large">Large — to 9,999,999</option>
        </select>
      </label>
      <label>
        Activity{' '}
        <select value={mode} onChange={(e) => start(e.target.value as Mode, size, seed)}>
          <option value="free">Free exploration</option>
          <option value="make">Make a number</option>
          <option value="add">Addition</option>
          <option value="subtract">Subtraction</option>
        </select>
      </label>
      {mode === 'make' && (
        <button type="button" className="bead-frame-btn" onClick={onCheck}>
          Check
        </button>
      )}
      {mode !== 'free' && (
        <button type="button" className="bead-frame-btn" onClick={() => start(mode, size, seed + 1)}>
          {mode === 'make' ? 'New number' : 'New problem'}
        </button>
      )}
      <button type="button" className="bead-frame-btn" onClick={() => setShowValue((v) => !v)}>
        {showValue ? 'Hide number' : 'Show number'}
      </button>
      <button type="button" className="bead-frame-btn" onClick={() => start(mode, size, seed)}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Each wire is one place: green units at the top, then blue tens, red hundreds, and so on down the frame. Beads
      rest on the left; tap a bead to slide it (and the beads between it and the gap) to the right, where it counts —
      tap a counted bead to slide it back. In Addition and Subtraction, work one wire at a time, and when a wire fills
      up (or runs empty), press its Exchange button to trade ten beads for one bead on the wire below — exactly like
      carrying and borrowing on paper.
    </p>
  )

  return (
    <MaterialShell mat="felt" controls={controls} help={help}>
      {banner.length > 0 && <div className="bead-frame-banner">{banner}</div>}
      {mode === 'free' && !showValue && value === 0 && (
        <p className="stage-note">Tap a bead to slide it to the right and count it.</p>
      )}
      <div className="bead-frame-layout">
        <div className="bead-frame-frame">
          {powers.map((power) => {
            const info = placeInfo(power)
            const active = wireActive(stage.counts, power)
            const inactive = BEADS_PER_WIRE - active
            return (
              <div className={`bead-frame-wire-row ${bandClass(power)}`} key={power}>
                <div className="bead-frame-label" style={{ color: info.colorVar }}>
                  {formatNumber(info.value)}
                </div>
                <div
                  className="bead-frame-wire"
                  role="group"
                  aria-label={`${info.name} wire, ${active} of ${BEADS_PER_WIRE} beads counted`}
                >
                  <div className="bead-frame-wire-line" />
                  {Array.from({ length: BEADS_PER_WIRE }, (_, i) => {
                    const isActive = i >= inactive
                    return (
                      <button
                        key={i}
                        type="button"
                        className="bead-frame-bead"
                        style={{ '--slot': isActive ? i + GAP_SLOTS : i } as CSSProperties}
                        onClick={() => onTapBead(power, i)}
                        aria-label={`${info.singular} bead ${i + 1} of ${BEADS_PER_WIRE}, ${
                          isActive ? 'counted' : 'not counted'
                        }`}
                      >
                        <Bead size={32} fill={info.colorVar} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        {(task !== null || mode === 'make') && (
          <div className="bead-frame-side">
            {powers.map((power) => {
              const info = placeInfo(power)
              const remaining = task ? (task.remaining[power] ?? 0) : 0
              const mark = checks?.find((c) => c.power === power)
              return (
                <div className="bead-frame-side-row" key={power}>
                  {task && (
                    <>
                      <span
                        className="bead-frame-remaining"
                        style={{ color: info.colorVar, visibility: remaining > 0 ? 'visible' : 'hidden' }}
                        aria-hidden={remaining === 0}
                      >
                        {task.kind === 'add' ? '+' : '−'}
                        {remaining}
                      </span>
                      <button
                        type="button"
                        className="bead-frame-btn"
                        disabled={!canTaskExchange(task, stage.counts, power)}
                        onClick={() => onExchange(power)}
                      >
                        Exchange
                      </button>
                    </>
                  )}
                  {mode === 'make' && mark && (
                    <span
                      className={`bead-frame-check ${mark.correct ? 'is-correct' : 'is-wrong'}`}
                      role="img"
                      aria-label={`${info.name}: ${mark.correct ? 'correct' : 'not yet'}`}
                    >
                      {mark.correct ? '✓' : '✗'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <p className="stage-note bead-frame-message" aria-live="polite">
        {message ??
          (complete
            ? `Every bead is in place — the frame reads ${formatNumber(taskResult)}. Check it against your paper.`
            : '')}
      </p>
    </MaterialShell>
  )
}
