import { useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { BeadBar } from '../../components/beads'
import { formatNumber } from '../../lib/placeValue'
import { createRng, randomSeed } from '../../lib/rng'
import type { Board, Problem } from './model'
import {
  COLS,
  ROWS,
  combineAll,
  combineSquare,
  compactValueLabel,
  digitsOf,
  emptyBoard,
  expectedCells,
  isCombined,
  isSlid,
  needsCombine,
  placeFamily,
  placePartial,
  randomProblem,
  readout,
  slideAll,
  slideRow,
  squareValue,
} from './model'
import './checkerboard.css'

const PRESETS = [
  { id: '4x1', label: '4-digit × 1-digit', aDigits: 4, bDigits: 1 },
  { id: '4x2', label: '4-digit × 2-digit', aDigits: 4, bDigits: 2 },
  { id: '2x2', label: '2-digit × 2-digit', aDigits: 2, bDigits: 2 },
  { id: '3x3', label: '3-digit × 3-digit', aDigits: 3, bDigits: 3 },
  { id: '4x4', label: '4-digit × 4-digit', aDigits: 4, bDigits: 4 },
] as const

type Phase = 'build' | 'slide' | 'combine' | 'done'

/** Rows top-to-bottom and columns left-to-right, as rendered on screen. */
const ROW_INDEXES = Array.from({ length: ROWS }, (_, i) => ROWS - 1 - i)
const COL_INDEXES = Array.from({ length: COLS }, (_, i) => COLS - 1 - i)

export default function Checkerboard() {
  const [problem, setProblem] = useState<Problem>({ a: 4357, b: 23 })
  const [board, setBoard] = useState<Board>(emptyBoard)
  const [placed, setPlaced] = useState<ReadonlySet<string>>(new Set())
  const [note, setNote] = useState('')
  const [presetId, setPresetId] = useState<string>('4x2')
  const [aText, setAText] = useState('4357')
  const [bText, setBText] = useState('23')

  const aDigits = digitsOf(problem.a)
  const bDigits = digitsOf(problem.b)
  const expected = expectedCells(problem.a, problem.b)
  const remaining = expected.filter(({ row, col }) => !placed.has(`${row},${col}`)).length
  const phase: Phase = remaining > 0 ? 'build' : !isSlid(board) ? 'slide' : !isCombined(board) ? 'combine' : 'done'

  function startProblem(a: number, b: number) {
    setProblem({ a, b })
    setBoard(emptyBoard())
    setPlaced(new Set())
    setAText(String(a))
    setBText(String(b))
    setNote('')
  }

  function newProblem() {
    const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[1]
    const { a, b } = randomProblem(createRng(randomSeed()), preset.aDigits, preset.bDigits)
    startProblem(a, b)
  }

  function setCustomProblem() {
    const a = Number(aText)
    const b = Number(bText)
    if (!Number.isInteger(a) || a < 1 || a > 9999 || !Number.isInteger(b) || b < 1 || b > 9999) {
      setNote('Enter whole numbers from 1 to 9,999 for both factors.')
      return
    }
    startProblem(a, b)
  }

  function reset() {
    setBoard(emptyBoard())
    setPlaced(new Set())
    setNote('Board cleared — same problem, start again from the first square.')
  }

  function tapCell(row: number, col: number) {
    if (phase === 'build') {
      const key = `${row},${col}`
      const aDigit = aDigits[col] ?? 0
      const bDigit = bDigits[row] ?? 0
      if (aDigit === 0 || bDigit === 0 || placed.has(key)) return
      setBoard(placePartial(board, row, col, problem.a, problem.b))
      setPlaced((prev) => new Set(prev).add(key))
      setNote(
        `${bDigit} bar${bDigit > 1 ? 's' : ''} of ${aDigit}: ${aDigit} × ${bDigit} = ${aDigit * bDigit}, worth ${formatNumber(
          aDigit * bDigit * squareValue(row, col),
        )} on this square.`,
      )
    } else if (phase === 'combine' && row === 0 && needsCombine(board, col)) {
      const { board: next, total, kept, carried } = combineSquare(board, col)
      setBoard(next)
      if (carried > 0) {
        setNote(
          `${total} beads on the ${formatNumber(squareValue(0, col))} square: ${
            kept > 0 ? `a ${kept}-bar stays` : 'nothing stays'
          } and ${carried} carries left to the ${formatNumber(squareValue(0, col + 1))} square.`,
        )
      } else {
        setNote(`${total} beads combine into a single ${total}-bar.`)
      }
    }
  }

  function doSlideRow(row: number) {
    setBoard(slideRow(board, row))
    setNote('The bars slid down-left along their diagonals — every square on a diagonal is worth the same, so the total did not change.')
  }

  function doSlideAll() {
    setBoard(slideAll(board))
    setNote('All bars slid to the bottom row. The total is unchanged.')
  }

  function doCombineAll() {
    setBoard(combineAll(board))
    setNote('Every square was summed and its tens carried one square left.')
  }

  const hint =
    phase === 'build'
      ? `Tap each square where a bottom card lines up with a side card — ${remaining} square${remaining === 1 ? '' : 's'} to go.`
      : phase === 'slide'
        ? 'Slide each row down its diagonal to the bottom row (or slide them all at once).'
        : phase === 'combine'
          ? 'Tap any square holding more than one bar to combine it. Ten or more beads send a carry to the next square left.'
          : `Read the answer along the bottom row, right to left: ${formatNumber(readout(board))}.`

  function renderCell(row: number, col: number) {
    const bars = board[row][col]
    const key = `${row},${col}`
    const family = placeFamily(row + col)
    const isTodo = phase === 'build' && (aDigits[col] ?? 0) > 0 && (bDigits[row] ?? 0) > 0 && !placed.has(key)
    const canCombine = phase === 'combine' && row === 0 && needsCombine(board, col)
    const actionable = isTodo || canCombine
    const beadTotal = bars.reduce((sum, n) => sum + n, 0)
    const label =
      `Square worth ${formatNumber(squareValue(row, col))}` +
      (bars.length > 0 ? `, holding ${bars.length} bar${bars.length > 1 ? 's' : ''} with ${beadTotal} beads` : ', empty') +
      (isTodo ? '. Tap to place bead bars.' : canCombine ? '. Tap to combine.' : '.')
    return (
      <button
        key={key}
        type="button"
        className={`checkerboard-cell checkerboard-cell--${family}${actionable ? ' checkerboard-cell--active' : ''}`}
        onClick={() => tapCell(row, col)}
        disabled={!actionable}
        aria-label={label}
      >
        <span className="checkerboard-cell-value" aria-hidden="true">
          {compactValueLabel(row + col)}
        </span>
        <span className="checkerboard-bars">
          {bars.map((n, i) => (
            <BeadBar key={i} n={n} beadSize={7} />
          ))}
        </span>
      </button>
    )
  }

  const controls = (
    <>
      <label>
        Problem size{' '}
        <select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="btn primary" onClick={newProblem}>
        New problem
      </button>
      <label>
        Multiplicand{' '}
        <input
          type="number"
          className="checkerboard-factor-input"
          min={1}
          max={9999}
          value={aText}
          onChange={(e) => setAText(e.target.value)}
        />
      </label>
      <span aria-hidden="true">×</span>
      <label>
        Multiplier{' '}
        <input
          type="number"
          className="checkerboard-factor-input"
          min={1}
          max={9999}
          value={bText}
          onChange={(e) => setBText(e.target.value)}
        />
      </label>
      <button type="button" className="btn" onClick={setCustomProblem}>
        Set
      </button>
      <button type="button" className="btn" onClick={reset}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Choose a problem, then tap each square where a bottom number card lines up with a side number card — the bead bars for that
      piece of the product appear on the square. When every crossing is filled, slide the bars down their diagonals to the bottom
      row; every square on a diagonal has the same value, so nothing is lost. Then tap any square holding more than one bar to
      combine its beads — ten or more send a bar to the next square left. Read the answer along the bottom row, right to left.
    </p>
  )

  return (
    <MaterialShell controls={controls} help={help} mat="felt">
      <div className="checkerboard-actions">
        <span className="checkerboard-problem">
          {formatNumber(problem.a)} × {formatNumber(problem.b)}
        </span>
        {phase === 'slide' && (
          <button type="button" className="btn" onClick={doSlideAll}>
            Slide all diagonals ↙
          </button>
        )}
        {phase === 'combine' && (
          <button type="button" className="btn" onClick={doCombineAll}>
            Combine all squares
          </button>
        )}
        {phase === 'done' && <span className="checkerboard-answer">= {formatNumber(readout(board))}</span>}
      </div>
      <p className="stage-note">{hint}</p>
      {note !== '' && <p className="stage-note checkerboard-note">{note}</p>}

      <div className="checkerboard-frame">
        {ROW_INDEXES.map((row) => (
          <div className="checkerboard-row" key={row}>
            <div className="checkerboard-slide-slot">
              {phase === 'slide' && row > 0 && board[row].some((bars) => bars.length > 0) && (
                <button
                  type="button"
                  className="btn checkerboard-slide-btn"
                  onClick={() => doSlideRow(row)}
                  aria-label={`Slide the ${formatNumber(squareValue(row, 0))} row down to the bottom row`}
                >
                  ↙
                </button>
              )}
            </div>
            {COL_INDEXES.map((col) => renderCell(row, col))}
            <div className="checkerboard-edge-right">
              <span className="checkerboard-edge-value">{formatNumber(squareValue(row, 0))}</span>
              {row < bDigits.length && (
                <span className="checkerboard-card checkerboard-card--gray" aria-label={`multiplier digit ${bDigits[row]}`}>
                  {bDigits[row]}
                </span>
              )}
            </div>
          </div>
        ))}

        <div className="checkerboard-row">
          <div className="checkerboard-slide-slot" />
          {COL_INDEXES.map((col) => (
            <div key={col} className="checkerboard-edge-bottom">
              {formatNumber(squareValue(0, col))}
            </div>
          ))}
          <div className="checkerboard-edge-right" />
        </div>

        <div className="checkerboard-row">
          <div className="checkerboard-slide-slot" />
          {COL_INDEXES.map((col) => (
            <div key={col} className="checkerboard-cardslot">
              {col < aDigits.length && (
                <span
                  className="checkerboard-card"
                  style={{ color: `var(--pv-${placeFamily(col)})` }}
                  aria-label={`multiplicand digit ${aDigits[col]}`}
                >
                  {aDigits[col]}
                </span>
              )}
            </div>
          ))}
          <div className="checkerboard-edge-right" />
        </div>
      </div>
    </MaterialShell>
  )
}
