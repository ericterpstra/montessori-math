import { useRef, useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { Bead, Skittle } from '../../components/beads'
import { formatNumber, placeInfo } from '../../lib/placeValue'
import type { PlacePower } from '../../lib/placeValue'
import { createRng, randomSeed } from '../../lib/rng'
import {
  MAX_DIVIDEND,
  MAX_DIVISOR,
  allowedActions,
  attempt,
  createRun,
  drawProblem,
  finalResult,
  nextAction,
  nextHint,
  topPlace,
  usesTensBoard,
} from './model'
import type { ActionType, Mode, RunState } from './model'
import './racks-and-tubes.css'

const RACK_PLACES = [3, 2, 1, 0] as const

const ACTION_LABELS: Record<ActionType, string> = {
  bring: 'Bring the beads',
  deal: 'Deal a round',
  exchange: 'Exchange',
  record: 'Record the digit',
}

function colorOf(power: number): string {
  return placeInfo(power as PlacePower).colorVar
}

function nameOf(power: number): string {
  return placeInfo(power as PlacePower).name
}

/** A short status line for free mode (guided mode shows the full hint). */
function statusLine(run: RunState): string {
  switch (run.phase) {
    case 'bring':
      return `Ready to work the ${nameOf(run.place)}.`
    case 'work':
      return `Working the ${nameOf(run.place)} — ${run.roundsDealt} ${run.roundsDealt === 1 ? 'round' : 'rounds'} dealt.`
    case 'exchange':
      return `Leftover ${nameOf(topPlace(run))} beads to exchange down.`
    case 'done':
      return nextHint(run)
  }
}

interface BoardViewProps {
  title: string
  kind: 'units' | 'tens'
  skittleCount: number
  skittleFill: string
  supplyCount: number
  beadFill: string
  rounds: number
  placeLabel: string
}

/** One flat division board: a supply cup, a row of skittles, and the dealt rounds beneath. */
function BoardView({ title, kind, skittleCount, skittleFill, supplyCount, beadFill, rounds, placeLabel }: BoardViewProps) {
  const cols = Math.max(skittleCount, 1)
  return (
    <div className={`racks-and-tubes-board racks-and-tubes-board-${kind}`}>
      <p className="racks-and-tubes-board-title">
        {title} <span className="racks-and-tubes-board-place">{placeLabel}</span>
      </p>
      <div className="racks-and-tubes-board-supply" aria-label={`${supplyCount} beads waiting to be dealt`}>
        {supplyCount === 0 ? (
          <span className="racks-and-tubes-board-supply-empty">no beads waiting</span>
        ) : (
          Array.from({ length: supplyCount }, (_, i) => <Bead key={i} size={15} fill={beadFill} />)
        )}
      </div>
      {skittleCount === 0 ? (
        <p className="racks-and-tubes-board-noskittles">no skittles on this board</p>
      ) : (
        <div
          className="racks-and-tubes-board-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 34px)` }}
          aria-label={`${skittleCount} skittles, ${rounds} rounds dealt`}
        >
          {Array.from({ length: skittleCount }, (_, c) => (
            <div key={`s${c}`} className="racks-and-tubes-skittle-cell">
              <Skittle height={44} fill={skittleFill} />
            </div>
          ))}
          {Array.from({ length: rounds }, (_, r) =>
            Array.from({ length: skittleCount }, (_, c) => (
              <div key={`b${r}-${c}`} className="racks-and-tubes-bead-cell">
                <Bead size={20} fill={beadFill} />
              </div>
            )),
          )}
        </div>
      )}
      {rounds > 0 && skittleCount > 0 && (
        <p className="racks-and-tubes-board-count">
          each skittle holds {rounds} {rounds === 1 ? 'bead' : 'beads'}
        </p>
      )}
    </div>
  )
}

interface QuotientCell {
  ch: string
  color?: string
  ghost?: boolean
  counting?: boolean
}

interface WorkRow {
  text: string
  underline: boolean
}

/** Build the paper long-division panel: quotient cells and aligned work rows. */
function buildPaper(run: RunState): { cols: number; quotientCells: QuotientCell[]; workRows: WorkRow[] } {
  const dividendStr = String(run.dividend)
  const cols = dividendStr.length
  const highest = cols - 1

  // Column 0 is a sign column; digit column c (place = highest − c) sits at index c + 1.
  const line = (numStr: string, endDigitCol: number, sign?: string): string => {
    const chars: string[] = Array.from({ length: cols + 1 }, () => ' ')
    const start = Math.max(0, endDigitCol + 2 - numStr.length)
    for (let i = 0; i < numStr.length; i++) chars[start + i] = numStr[i]
    if (sign && start > 0) chars[start - 1] = sign
    return chars.join('')
  }

  const quotientCells: QuotientCell[] = [{ ch: ' ' }]
  for (let c = 0; c < cols; c++) {
    const place = highest - c
    if (place > run.startPlace) {
      quotientCells.push({ ch: ' ' })
      continue
    }
    const digit = run.quotientDigits[place]
    if (digit !== null) {
      const higherAllZero = run.quotientDigits.slice(place + 1).every((d) => d === null || d === 0)
      quotientCells.push({
        ch: String(digit),
        color: colorOf(place),
        ghost: digit === 0 && place > 0 && higherAllZero,
      })
    } else if (place === run.place && run.phase === 'work') {
      quotientCells.push({ ch: String(run.roundsDealt), counting: true })
    } else {
      quotientCells.push({ ch: ' ' })
    }
  }

  const workRows: WorkRow[] = []
  run.steps.forEach((st, i) => {
    if (i > 0) workRows.push({ text: line(String(st.working), highest - st.place), underline: false })
    if (st.digit !== null && st.digit > 0 && st.subtracted !== null) {
      workRows.push({ text: line(String(st.subtracted), highest - st.place, '−'), underline: true })
    }
  })
  const result = finalResult(run)
  if (result) workRows.push({ text: line(String(result.remainder), highest), underline: false })

  return { cols, quotientCells, workRows }
}

export default function RacksAndTubes() {
  const rngRef = useRef(createRng(randomSeed()))
  const [mode, setMode] = useState<Mode>('guided')
  const [problem, setProblem] = useState({ dividend: 9764, divisor: 4 })
  const [run, setRun] = useState<RunState>(() => createRun(9764, 4))
  const [notice, setNotice] = useState<string | null>(null)
  const [dividendInput, setDividendInput] = useState('9764')
  const [divisorInput, setDivisorInput] = useState('4')

  const twoDigit = usesTensBoard(run)
  const done = run.phase === 'done'
  const result = finalResult(run)
  const allowed = allowedActions(run, mode)
  const expected = nextAction(run)

  function start(dividend: number, divisor: number) {
    setProblem({ dividend, divisor })
    setRun(createRun(dividend, divisor))
    setNotice(null)
    setDividendInput(String(dividend))
    setDivisorInput(String(divisor))
  }

  function startFromInputs() {
    const clamp = (raw: string, min: number, max: number, fallback: number) => {
      const n = Math.round(Number(raw))
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
    }
    start(clamp(dividendInput, 1, MAX_DIVIDEND, problem.dividend), clamp(divisorInput, 1, MAX_DIVISOR, problem.divisor))
  }

  function draw() {
    const kind = rngRef.current.bool() ? 'two-digit' : 'one-digit'
    const p = drawProblem(rngRef.current, kind)
    start(p.dividend, p.divisor)
  }

  function onAction(action: ActionType) {
    const res = attempt(run, action, mode)
    if (res.ok) {
      setRun(res.state)
      setNotice(null)
    } else {
      setNotice(res.message)
    }
  }

  // Rack panels light up when they are about to give or receive beads.
  function rackActive(power: number): boolean {
    if (run.phase === 'bring') return power === run.place || (twoDigit && power === run.place + 1)
    if (run.phase === 'exchange') return power === topPlace(run) || power === topPlace(run) - 1
    return false
  }

  const paper = buildPaper(run)
  const gutter = ' '.repeat(String(run.divisor).length)

  return (
    <MaterialShell
      mat="felt"
      help={
        <p>
          This is the Montessori material for long division: the racks hold each place's beads, the skittles are the equal
          shares, and the written record on the right fills in exactly like paper long division. Work one place at a time,
          largest first — bring that place's beads to the board, deal rounds of one bead per skittle, record how many rounds
          each skittle received, then exchange the leftovers for ten each of the next place down. With a two-digit divisor,
          blue skittles stand on the tens board and receive beads worth ten times the green skittles'. Guided mode points to
          the correct next step; Free mode leaves the child to work alone.
        </p>
      }
      controls={
        <>
          <label>
            Mode
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} aria-label="mode">
              <option value="guided">Guided</option>
              <option value="free">Free</option>
            </select>
          </label>
          <label>
            Dividend
            <input
              type="number"
              min={1}
              max={MAX_DIVIDEND}
              value={dividendInput}
              onChange={(e) => setDividendInput(e.target.value)}
              aria-label="dividend"
            />
          </label>
          <label>
            ÷ Divisor
            <input
              type="number"
              min={1}
              max={MAX_DIVISOR}
              value={divisorInput}
              onChange={(e) => setDivisorInput(e.target.value)}
              aria-label="divisor"
            />
          </label>
          <button type="button" className="btn" onClick={startFromInputs}>
            Start
          </button>
          <button type="button" className="btn" onClick={draw}>
            Draw a problem
          </button>
          <button type="button" className="btn" onClick={() => start(problem.dividend, problem.divisor)}>
            Reset
          </button>
        </>
      }
    >
      <div className="racks-and-tubes-problem">
        {formatNumber(run.dividend)} ÷ {formatNumber(run.divisor)}
        {result && (
          <>
            {' '}
            = {formatNumber(result.quotient)}
            {result.remainder > 0 && ` r ${formatNumber(result.remainder)}`}
          </>
        )}
      </div>
      <p className="stage-note" aria-live="polite">
        {mode === 'guided' ? nextHint(run) : statusLine(run)}
      </p>
      {notice && (
        <p className="racks-and-tubes-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}

      <div className="racks-and-tubes-racks" role="group" aria-label="bead racks">
        {RACK_PLACES.map((power) => (
          <div
            key={power}
            className={`racks-and-tubes-rack${power === 3 ? ' racks-and-tubes-rack-gray' : ''}${
              rackActive(power) ? ' racks-and-tubes-rack-active' : ''
            }`}
          >
            <p className="racks-and-tubes-rack-name" style={{ color: colorOf(power) }}>
              {nameOf(power)}
            </p>
            <div className="racks-and-tubes-rack-beads" aria-label={`${run.stocks[power]} ${nameOf(power)} beads in the rack`}>
              {run.stocks[power] === 0 ? (
                <span className="racks-and-tubes-rack-empty">empty</span>
              ) : (
                Array.from({ length: run.stocks[power] }, (_, i) => <Bead key={i} size={13} fill={colorOf(power)} />)
              )}
            </div>
            <p className="racks-and-tubes-rack-count">{run.stocks[power]}</p>
          </div>
        ))}
      </div>

      <div className="racks-and-tubes-workrow">
        <div className="racks-and-tubes-left">
          <div className="racks-and-tubes-actions" role="group" aria-label="division actions">
            {(['bring', 'deal', 'exchange', 'record'] as const).map((action) => (
              <button
                key={action}
                type="button"
                className={`btn${!done && (mode === 'guided' ? action === expected : allowed.includes(action)) ? ' primary' : ''}`}
                onClick={() => onAction(action)}
                disabled={done}
              >
                {ACTION_LABELS[action]}
              </button>
            ))}
          </div>

          <div className="racks-and-tubes-boards">
            {twoDigit && (
              <BoardView
                title="Tens board"
                kind="tens"
                skittleCount={run.divisorTens}
                skittleFill="var(--pv-ten)"
                supplyCount={done ? 0 : run.boardTens}
                beadFill={colorOf(Math.min(run.place + 1, 3))}
                rounds={run.roundsDealt}
                placeLabel={done ? 'finished' : `dealing ${nameOf(run.place + 1)}`}
              />
            )}
            <BoardView
              title="Units board"
              kind="units"
              skittleCount={run.divisorUnits}
              skittleFill="var(--pv-unit)"
              supplyCount={done ? 0 : run.boardUnits}
              beadFill={colorOf(run.place)}
              rounds={run.roundsDealt}
              placeLabel={done ? 'finished' : `dealing ${nameOf(run.place)}`}
            />
          </div>
        </div>

        <div className="racks-and-tubes-paper">
          <p className="racks-and-tubes-paper-title no-print">The written record</p>
          <div className="racks-and-tubes-paper-sheet">
            <div className="racks-and-tubes-paper-line">
              <span className="racks-and-tubes-paper-gutter">{gutter}</span>
              <span className="racks-and-tubes-paper-cells">
                {paper.quotientCells.map((cell, i) => (
                  <span
                    key={i}
                    className={`racks-and-tubes-paper-digit${cell.ghost ? ' racks-and-tubes-paper-ghost' : ''}${
                      cell.counting ? ' racks-and-tubes-paper-counting' : ''
                    }`}
                    style={cell.color ? { color: cell.color } : undefined}
                  >
                    {cell.ch}
                  </span>
                ))}
                {result && result.remainder > 0 && (
                  <span className="racks-and-tubes-paper-rem"> r {result.remainder}</span>
                )}
              </span>
            </div>
            <div className="racks-and-tubes-paper-line">
              <span className="racks-and-tubes-paper-gutter">{run.divisor}</span>
              <span className="racks-and-tubes-paper-cells racks-and-tubes-paper-dividend">{` ${run.dividend}`}</span>
            </div>
            {paper.workRows.map((row, i) => (
              <div key={i} className="racks-and-tubes-paper-line">
                <span className="racks-and-tubes-paper-gutter">{gutter}</span>
                <span
                  className={`racks-and-tubes-paper-cells${row.underline ? ' racks-and-tubes-paper-underline' : ''}`}
                >
                  {row.text}
                </span>
              </div>
            ))}
          </div>
          {result && (
            <div className="racks-and-tubes-paper-check">
              <p>
                Check it: {formatNumber(result.quotient)} × {formatNumber(run.divisor)}
                {result.remainder > 0 && ` + ${formatNumber(result.remainder)}`} = {formatNumber(run.dividend)} — every bead
                is accounted for.
              </p>
              {result.remainder >= run.divisor && (
                <p className="racks-and-tubes-paper-warn">
                  The remainder is bigger than the divisor — more rounds could have been dealt. Reset and try again.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </MaterialShell>
  )
}
