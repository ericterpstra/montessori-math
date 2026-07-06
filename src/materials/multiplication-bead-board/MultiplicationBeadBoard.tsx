import { useMemo, useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { NumberCard } from '../../components/NumberCard'
import { BeadShape } from '../../components/beads'
import { randomSeed } from '../../lib/rng'
import {
  BOARD_SIZE,
  beadCount,
  canPlaceColumn,
  checkBuild,
  createBoard,
  discColumn,
  hasBead,
  placeColumn,
  practiceProblem,
  removeColumn,
  setMultiplicand,
  stepAt,
  tableRows,
} from './model'
import type { BuildCheck } from './model'
import './multiplication-bead-board.css'

type Mode = 'table' | 'practice'

/* --- SVG board geometry (viewBox units) --- */
const CELL = 36
const PAD = 18
const DISC_ROW = 44
const NUM_ROW = 28
const GRID_TOP = DISC_ROW + NUM_ROW
const W = PAD * 2 + BOARD_SIZE * CELL
const H = GRID_TOP + BOARD_SIZE * CELL + PAD

const colX = (col: number) => PAD + (col - 1) * CELL + CELL / 2
const rowY = (row: number) => GRID_TOP + (row - 1) * CELL + CELL / 2

const CARDS = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1)

export default function MultiplicationBeadBoard() {
  const [mode, setMode] = useState<Mode>('table')
  const [board, setBoard] = useState(() => createBoard(4))
  const [recorded, setRecorded] = useState(0)
  const [countMode, setCountMode] = useState(false)
  const [counted, setCounted] = useState(0)
  const [showProduct, setShowProduct] = useState(false)
  const [seed] = useState(() => randomSeed())
  const [problemIndex, setProblemIndex] = useState(0)
  const [checkResult, setCheckResult] = useState<BuildCheck | null>(null)

  const problem = useMemo(() => practiceProblem(seed, problemIndex), [seed, problemIndex])
  const total = beadCount(board)
  const countDone = countMode && total > 0 && counted === total

  const stopCounting = () => {
    setCountMode(false)
    setCounted(0)
  }

  const selectCard = (n: number) => {
    setBoard(setMultiplicand(board, n))
    setRecorded(0)
    setCheckResult(null)
    stopCounting()
  }

  const handlePlace = () => {
    if (!canPlaceColumn(board)) return
    setBoard(placeColumn(board))
    setCheckResult(null)
    stopCounting()
  }

  const handleTakeBack = () => {
    const next = removeColumn(board)
    setBoard(next)
    setRecorded((r) => Math.min(r, next.columns))
    setCheckResult(null)
    stopCounting()
  }

  const handleReset = () => {
    setBoard(createBoard(board.multiplicand))
    setRecorded(0)
    setCheckResult(null)
    stopCounting()
  }

  const handleModeChange = (m: Mode) => {
    setMode(m)
    setBoard(createBoard(board.multiplicand))
    setRecorded(0)
    setCheckResult(null)
    stopCounting()
  }

  const handleCountTap = () => {
    if (counted < total) setCounted(counted + 1)
  }

  const handleRecord = () => {
    if (recorded < board.columns) setRecorded(recorded + 1)
  }

  const handleNewProblem = () => {
    setProblemIndex(problemIndex + 1)
    setBoard(createBoard(board.multiplicand))
    setRecorded(0)
    setCheckResult(null)
    stopCounting()
  }

  const rows = tableRows(board.multiplicand, recorded)

  const boardSvg = (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="multiplication-bead-board-svg"
      role="img"
      aria-label={`Board showing ${board.columns} column${board.columns === 1 ? '' : 's'} of ${board.multiplicand} red beads`}
    >
      {/* board face */}
      <rect x={2} y={DISC_ROW - 4} width={W - 4} height={H - DISC_ROW + 2} rx={10} className="multiplication-bead-board-face" />
      {/* disc track above the numbers */}
      <rect x={PAD - 14} y={4} width={W - PAD * 2 + 28} height={DISC_ROW - 12} rx={16} className="multiplication-bead-board-track" />
      {/* red disc marking the current multiple */}
      <circle cx={colX(discColumn(board))} cy={(DISC_ROW - 10) / 2 + 4} r={14} className="multiplication-bead-board-disc" fill="var(--bead-1)" />
      {/* numbers 1–10 across the top */}
      {CARDS.map((c) => (
        <text key={c} x={colX(c)} y={DISC_ROW + 18} className="multiplication-bead-board-num">
          {c}
        </text>
      ))}
      {/* holes and beads */}
      {CARDS.map((row) =>
        CARDS.map((col) => {
          const filled = hasBead(board, row, col)
          const step = stepAt(board, row, col)
          const isCounted = countMode && step > 0 && step <= counted
          const isCurrent = countMode && counted > 0 && step === counted
          return (
            <g key={`${row}-${col}`}>
              {!filled && <circle cx={colX(col)} cy={rowY(row)} r={4.5} className="multiplication-bead-board-hole" />}
              {filled && <BeadShape cx={colX(col)} cy={rowY(row)} r={14} fill="var(--bead-1)" />}
              {isCounted && !isCurrent && <circle cx={colX(col)} cy={rowY(row)} r={16.5} className="multiplication-bead-board-ring-counted" />}
              {isCurrent && (
                <>
                  <circle cx={colX(col)} cy={rowY(row)} r={17} className="multiplication-bead-board-ring-current" />
                  <text x={colX(col)} y={rowY(row) + 4.5} className="multiplication-bead-board-count-label">
                    {counted}
                  </text>
                </>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )

  return (
    <MaterialShell
      help={
        <>
          Tap a number card to put it in the slot — that is the number you are multiplying. Tap <em>Place a column</em> to
          set that many red beads under the next number at the top; the red disc shows how many times you have taken it.
          Tap <em>Count the beads</em>, then keep tapping the board to count every bead — the total is the product, so
          have your child write each fact on paper as they find it. In Practice mode, build the problem shown, tap{' '}
          <em>Check my build</em>, then count for the answer.
        </>
      }
      controls={
        <>
          <label>
            Mode{' '}
            <select value={mode} onChange={(e) => handleModeChange(e.target.value as Mode)}>
              <option value="table">Build a table</option>
              <option value="practice">Practice</option>
            </select>
          </label>
          <label className="multiplication-bead-board-check-label">
            <input type="checkbox" checked={showProduct} onChange={(e) => setShowProduct(e.target.checked)} /> Show product
          </label>
          <button type="button" className="multiplication-bead-board-btn" onClick={handleReset}>
            Reset
          </button>
        </>
      }
    >
      <div className="multiplication-bead-board-layout">
        <div className="multiplication-bead-board-main">
          {mode === 'practice' && (
            <div className="multiplication-bead-board-panel">
              <div className="multiplication-bead-board-problem">
                {problem.a} × {problem.b}
              </div>
              <p>Put the first number's card in the slot, then place a column for each time it is taken.</p>
              {checkResult && (
                <>
                  <ul className="multiplication-bead-board-checklist">
                    <li className={checkResult.multiplicandCorrect ? 'multiplication-bead-board-mark-ok' : 'multiplication-bead-board-mark-err'}>
                      {checkResult.multiplicandCorrect ? '✓' : '✗'} Card in the slot
                    </li>
                    <li className={checkResult.columnsCorrect ? 'multiplication-bead-board-mark-ok' : 'multiplication-bead-board-mark-err'}>
                      {checkResult.columnsCorrect ? '✓' : '✗'} Columns placed
                    </li>
                  </ul>
                  <p>
                    {checkResult.allCorrect
                      ? 'The build matches. Now count every bead — the total is your answer. Write it on your paper.'
                      : 'Look at the ✗ line, fix the board, and check again.'}
                  </p>
                </>
              )}
            </div>
          )}

          <div className="bank-tray" role="group" aria-label="Multiplicand cards 1 to 10">
            {CARDS.map((n) => (
              <button
                key={n}
                type="button"
                className="bank-item"
                onClick={() => selectCard(n)}
                aria-pressed={n === board.multiplicand}
                aria-label={`put the ${n} card in the slot`}
              >
                <NumberCard value={n} height={40} selected={n === board.multiplicand} asDiv />
              </button>
            ))}
          </div>

          <div className="multiplication-bead-board-boardrow">
            <div className="multiplication-bead-board-slot">
              <span className="multiplication-bead-board-slot-label">Card</span>
              <NumberCard value={board.multiplicand} height={56} asDiv />
            </div>
            {countMode ? (
              <button type="button" className="multiplication-bead-board-tapboard" onClick={handleCountTap} aria-label="Count the next bead">
                {boardSvg}
              </button>
            ) : (
              <div className="multiplication-bead-board-tapboard">{boardSvg}</div>
            )}
          </div>

          <div className="multiplication-bead-board-actions">
            <button type="button" className="multiplication-bead-board-btn" onClick={handlePlace} disabled={!canPlaceColumn(board)}>
              Place a column
            </button>
            <button type="button" className="multiplication-bead-board-btn" onClick={handleTakeBack} disabled={board.columns === 0}>
              Take one back
            </button>
            {countMode ? (
              <button type="button" className="multiplication-bead-board-btn" onClick={stopCounting}>
                Done counting
              </button>
            ) : (
              <button
                type="button"
                className="multiplication-bead-board-btn"
                onClick={() => {
                  setCounted(0)
                  setCountMode(true)
                }}
                disabled={total === 0}
              >
                Count the beads
              </button>
            )}
            {mode === 'table' && (
              <button type="button" className="multiplication-bead-board-btn" onClick={handleRecord} disabled={recorded >= board.columns}>
                Record {board.multiplicand} × {Math.min(recorded + 1, Math.max(board.columns, 1))}
              </button>
            )}
            {mode === 'practice' && (
              <>
                <button type="button" className="multiplication-bead-board-btn" onClick={() => setCheckResult(checkBuild(board, problem))}>
                  Check my build
                </button>
                <button type="button" className="multiplication-bead-board-btn" onClick={handleNewProblem}>
                  New problem
                </button>
              </>
            )}
          </div>

          {countMode && !countDone && (
            <p className="stage-note">{counted === 0 ? 'Tap the board to count the first bead.' : `Counted so far: ${counted}. Keep tapping.`}</p>
          )}
          {countDone && (
            <p className="stage-note">
              That is every bead: {counted} in all. So {board.multiplicand} × {board.columns} = {counted}.
            </p>
          )}
          {!countMode && showProduct && board.columns > 0 && (
            <p className="stage-note">
              {board.multiplicand} × {board.columns} = {total}
            </p>
          )}
          {!countMode && !showProduct && board.columns > 0 && <p className="stage-note">Count the beads to find the product.</p>}
        </div>

        {mode === 'table' && (
          <div className="multiplication-bead-board-record">
            <h3>Table of {board.multiplicand}</h3>
            <ol>
              {rows.map((r) => (
                <li key={r.multiplier}>
                  {board.multiplicand} × {r.multiplier} = {r.product}
                </li>
              ))}
              {rows.length === 0 && <li className="multiplication-bead-board-record-empty">Place a column, count, then record the fact here — and on paper.</li>}
              {rows.length === BOARD_SIZE && <li className="multiplication-bead-board-record-empty">The whole table — copy it onto paper and read it aloud.</li>}
            </ol>
          </div>
        )}
      </div>
    </MaterialShell>
  )
}
