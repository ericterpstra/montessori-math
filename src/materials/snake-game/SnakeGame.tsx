import { useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { BeadBar, BeadShape, TenBar } from '../../components/beads'
import { randomSeed } from '../../lib/rng'
import {
  addBar,
  canCount,
  countToTen,
  createState,
  proof,
  remainingBeads,
  removeLastBar,
  startPlay,
  surpriseSnake,
} from './model'
import type { CountStep, SnakeBar, SnakeState } from './model'
import './snake-game.css'

const BAR_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

/**
 * Black-and-white "bridge" bar from the snake-game bead stair:
 * beads 1–5 are black, beads 6–9 are white.
 */
function BridgeBar({ value, beadSize = 20 }: { value: number; beadSize?: number }) {
  const u = 20
  const length = value * u
  return (
    <svg
      width={(beadSize / u) * length}
      height={beadSize}
      viewBox={`0 0 ${length} ${u}`}
      role="img"
      aria-label={`black-and-white bar of ${value}`}
    >
      <line x1={4} y1={u / 2} x2={length - 4} y2={u / 2} stroke="var(--ink-soft)" strokeWidth={1.5} />
      {Array.from({ length: value }, (_, i) => (
        <BeadShape key={i} cx={i * u + u / 2} cy={u / 2} r={9} fill={i < 5 ? 'var(--ink)' : 'var(--bead-7)'} />
      ))}
    </svg>
  )
}

function BarView({ bar, beadSize = 20 }: { bar: SnakeBar; beadSize?: number }) {
  if (bar.kind === 'bridge') return <BridgeBar value={bar.value} beadSize={beadSize} />
  return <BeadBar n={bar.value} beadSize={beadSize} title={`colored bar of ${bar.value}`} />
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

function narrate(step: CountStep): string {
  const sum = step.taken.map((b) => b.value).join(' + ')
  let text = `Counted ${sum} = ${step.count} beads and traded ten of them for one golden ten-bar.`
  if (step.remainder > 0) {
    text += ` The ${plural(step.remainder, 'bead')} past ten came back as a black-and-white ${step.remainder}.`
  } else {
    text += ' Exactly ten — no black-and-white bar needed.'
  }
  if (step.taken.some((b) => b.kind === 'bridge')) {
    text += ' The old black-and-white bar went back in the box.'
  }
  return text
}

function ProofPanel({ state }: { state: SnakeState }) {
  const p = proof(state)
  return (
    <div className="snake-game-proof">
      <h3>The proof</h3>
      <p>
        In the tray: {plural(p.setAsideBars, 'colored bar')} holding {plural(p.setAsideBeads, 'bead')}. Recounted into
        tens, that makes {plural(p.tensInSetAside, 'ten')} and {p.leftoverInSetAside} more.
      </p>
      <p>
        On the mat: {plural(p.goldenBars, 'golden ten-bar')}
        {p.bridgeValue > 0 ? ` and a black-and-white ${p.bridgeValue}` : ''}.
      </p>
      <p className={`snake-game-verdict${p.matches ? '' : ' mismatch'}`}>
        {p.matches
          ? `Both sides show ${p.tensInSetAside} tens and ${p.leftoverInSetAside} — the recount matches the gold.`
          : 'The two counts do not agree — count the tray again.'}
      </p>
    </div>
  )
}

export default function SnakeGame() {
  const [state, setState] = useState<SnakeState>(createState)
  const [showProof, setShowProof] = useState(false)

  const beads = remainingBeads(state)
  const building = state.phase === 'build'

  function reset() {
    setState(createState())
    setShowProof(false)
  }

  const controls = (
    <>
      {building && (
        <>
          <button type="button" className="btn" onClick={() => setState(surpriseSnake(randomSeed()))}>
            Surprise snake
          </button>
          <button type="button" className="btn primary" onClick={() => setState(startPlay)} disabled={beads < 10}>
            Start counting
          </button>
        </>
      )}
      {state.phase === 'play' && (
        <button type="button" className="btn primary" onClick={() => setState(countToTen)} disabled={!canCount(state)}>
          Count to 10
        </button>
      )}
      {state.phase === 'done' && (
        <button type="button" className="btn primary" onClick={() => setShowProof((v) => !v)} aria-pressed={showProof}>
          {showProof ? 'Hide the proof' : 'Prove it'}
        </button>
      )}
      <button type="button" className="btn" onClick={reset}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Build a snake by tapping the colored bead bars (tap a bar as many times as you like), or let “Surprise snake”
      build one for you. Then tap “Count to 10” to count beads from the snake’s head: every full ten is traded for a
      golden ten-bar, and any beads counted past ten come back as a black-and-white bar that keeps their place. When
      fewer than ten beads remain, tap “Prove it” to recount the set-aside bars against the golden snake — the two
      counts should match.
    </p>
  )

  return (
    <MaterialShell help={help} controls={controls} mat="felt">
      {building ? (
        <>
          <div className="bank-tray">
            {BAR_VALUES.map((n) => (
              <button
                key={n}
                type="button"
                className="bank-item"
                onClick={() => setState((s) => addBar(s, n))}
                aria-label={`add a bar of ${n} to the snake`}
              >
                <BeadBar n={n} beadSize={16} />
              </button>
            ))}
          </div>
          <p className="stage-note">
            {state.snake.length === 0
              ? 'Tap the colored bars above to build a snake — or tap “Surprise snake.”'
              : beads < 10
                ? `${plural(state.snake.length, 'bar')} so far. Keep going — the snake needs at least ten beads before it can be counted.`
                : `${plural(state.snake.length, 'bar')} so far. Add more, or tap “Start counting.”`}
          </p>
          <div className="snake-game-snake">
            {state.snake.map((bar) => (
              <span key={bar.id} className="snake-game-bar">
                <BarView bar={bar} />
              </span>
            ))}
          </div>
          {state.snake.length > 0 && (
            <button type="button" className="btn snake-game-takeback" onClick={() => setState(removeLastBar)}>
              Take back last bar
            </button>
          )}
        </>
      ) : (
        <>
          <section className="snake-game-section">
            <h3 className="snake-game-label">Golden snake</h3>
            <div className="snake-game-snake">
              {state.golden === 0 && <span className="stage-note">No golden tens yet — count the snake below.</span>}
              {Array.from({ length: state.golden }, (_, i) => (
                <span key={i} className="snake-game-bar">
                  <TenBar beadSize={20} title="golden ten-bar" />
                </span>
              ))}
            </div>
          </section>

          <section className="snake-game-section">
            <h3 className="snake-game-label">
              {state.phase === 'done' ? 'What remains (fewer than ten beads)' : 'Colored snake'}
            </h3>
            <div className="snake-game-snake">
              {state.snake.length === 0 && <span className="stage-note">Nothing left — the whole snake turned to gold.</span>}
              {state.phase === 'play' && state.snake.length > 0 && (
                <span className="snake-game-marker">count from here ▸</span>
              )}
              {state.snake.map((bar) => (
                <span key={bar.id} className="snake-game-bar">
                  <BarView bar={bar} />
                </span>
              ))}
            </div>
          </section>

          <section className="snake-game-section">
            <h3 className="snake-game-label">Set aside for the proof</h3>
            <div className="snake-game-snake snake-game-aside">
              {state.setAside.length === 0 && <span className="stage-note">Counted colored bars will wait here.</span>}
              {state.setAside.map((bar) => (
                <span key={bar.id} className="snake-game-bar">
                  <BarView bar={bar} beadSize={14} />
                </span>
              ))}
            </div>
          </section>

          {state.lastStep && !showProof && <p className="stage-note snake-game-story">{narrate(state.lastStep)}</p>}

          {state.phase === 'done' && showProof && <ProofPanel state={state} />}
        </>
      )}
    </MaterialShell>
  )
}
