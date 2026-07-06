import { useRef, useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { Bead, Skittle } from '../../components/beads'
import { createRng, randomSeed } from '../../lib/rng'
import {
  BOARD_COLS,
  BOARD_ROWS,
  MAX_DIVIDEND,
  canDealAnotherRound,
  createBoard,
  createProblem,
  dealRound,
  dividendChoices,
  drawProblem,
  evaluateAnswer,
  formatReading,
  skittleCount,
  supplyRemaining,
  toggleSkittle,
  undoRound,
} from './model'
import type { BoardState, DivisionProblem, Evaluation } from './model'
import './division-board.css'

const GREEN = 'var(--pv-unit)'

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

export default function DivisionBoard() {
  const rngRef = useRef(createRng(randomSeed()))
  const [board, setBoard] = useState<BoardState>(() => createBoard(createProblem(27, 4)))
  const [recordedQuotient, setRecordedQuotient] = useState<number | null>(null)
  const [recordedRemainder, setRecordedRemainder] = useState<number | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)

  const { problem } = board
  const placed = skittleCount(board)
  const supply = supplyRemaining(board)
  const dealable = canDealAnotherRound(board)

  function startProblem(p: DivisionProblem) {
    setBoard(createBoard(p))
    setRecordedQuotient(null)
    setRecordedRemainder(null)
    setEvaluation(null)
  }

  function updateBoard(next: BoardState) {
    setBoard(next)
    setEvaluation(null)
  }

  function onDivisorChange(divisor: number) {
    const dividend = Math.min(Math.max(problem.dividend, divisor), 10 * divisor - 1, MAX_DIVIDEND)
    startProblem(createProblem(dividend, divisor))
  }

  const stageNote =
    placed === 0
      ? `Stand up ${problem.divisor} skittles: tap ${problem.divisor} of the slots across the top — one skittle for each share.`
      : board.rowsDealt === 0
        ? 'Now deal: tap “Deal a round” to give one bead to each skittle.'
        : dealable
          ? 'Keep dealing rounds while the tray still holds enough beads for everyone.'
          : 'No more full rounds. Count the beads under one skittle, then the beads left in the tray, and record your answer below.'

  const quotientMark = evaluation === null ? null : evaluation.quotientCorrect ? '✓' : '✗'
  const remainderMark = evaluation === null ? null : evaluation.remainderCorrect ? '✓' : '✗'

  return (
    <MaterialShell
      mat="felt"
      help={
        <p>
          Choose a division problem (or draw one), then tap slots across the top to stand up as many green skittles as the
          divisor — the skittles are the sharers. Tap “Deal a round” to give one bead to each skittle, and keep dealing until the
          tray can no longer fill a full round. The answer is what one skittle receives; the beads left in the tray are the
          remainder. Record the quotient and remainder on the answer pad and tap Check — then read the whole equation aloud.
        </p>
      }
      controls={
        <>
          <label>
            Dividend
            <select
              value={problem.dividend}
              onChange={(e) => startProblem(createProblem(Number(e.target.value), problem.divisor))}
              aria-label="dividend"
            >
              {dividendChoices(problem.divisor).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label>
            ÷ Divisor
            <select
              value={problem.divisor}
              onChange={(e) => onDivisorChange(Number(e.target.value))}
              aria-label="divisor"
            >
              {range(1, 9).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn" onClick={() => startProblem(drawProblem(rngRef.current))}>
            Draw a problem
          </button>
          <button type="button" className="btn" onClick={() => startProblem(problem)}>
            Reset
          </button>
        </>
      }
    >
      <div className="division-board-problem">
        {problem.dividend} ÷ {problem.divisor} = ?
      </div>
      <p className="stage-note">{stageNote}</p>

      <div className="division-board-layout">
        <div className="division-board-board">
          <div className="division-board-slots" role="group" aria-label="skittle slots">
            {board.skittles.map((placedHere, slot) => (
              <button
                key={slot}
                type="button"
                className="division-board-slot"
                aria-pressed={placedHere}
                aria-label={`skittle slot ${slot + 1}${placedHere ? ', skittle placed' : ', empty'}`}
                onClick={() => updateBoard(toggleSkittle(board, slot))}
              >
                {placedHere ? <Skittle height={54} fill={GREEN} /> : <span className="division-board-slot-empty" />}
              </button>
            ))}
          </div>
          <div className="division-board-grid" aria-label={`board with ${board.rowsDealt} rounds dealt`}>
            {range(0, BOARD_ROWS * BOARD_COLS - 1).map((i) => {
              const row = Math.floor(i / BOARD_COLS)
              const col = i % BOARD_COLS
              return (
                <div key={i} className="division-board-hole">
                  {board.skittles[col] && row < board.rowsDealt && <Bead size={26} fill={GREEN} />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="division-board-side">
          <div className="division-board-deal">
            <button type="button" className="btn primary" onClick={() => updateBoard(dealRound(board))} disabled={!dealable}>
              Deal a round
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => updateBoard(undoRound(board))}
              disabled={board.rowsDealt === 0}
            >
              Pick a round back up
            </button>
          </div>
          <div className="division-board-tray">
            <p className="division-board-tray-label">Bead tray (the supply)</p>
            <div className="division-board-tray-beads" aria-label={`${supply} beads in the tray`}>
              {supply === 0 ? (
                <span className="division-board-tray-empty">empty — every bead has been dealt</span>
              ) : (
                range(1, supply).map((i) => <Bead key={i} size={18} fill={GREEN} />)
              )}
            </div>
            {placed > 0 && board.rowsDealt > 0 && !dealable && (
              <p className="division-board-tray-note">
                Not enough beads here for another full round — what is left is the remainder.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="division-board-pad">
        <p className="division-board-pad-title">Answer pad</p>
        <div className="division-board-pad-row">
          <span className="division-board-pad-label">Quotient — count the beads under any one skittle:</span>
          <div className="division-board-keys" role="group" aria-label="record the quotient">
            {range(0, 9).map((n) => (
              <button
                key={n}
                type="button"
                className="division-board-key"
                aria-pressed={recordedQuotient === n}
                onClick={() => {
                  setRecordedQuotient(n)
                  setEvaluation(null)
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="division-board-pad-row">
          <span className="division-board-pad-label">Remainder — count the beads left in the tray:</span>
          <div className="division-board-keys" role="group" aria-label="record the remainder">
            {range(0, 8).map((n) => (
              <button
                key={n}
                type="button"
                className="division-board-key"
                aria-pressed={recordedRemainder === n}
                onClick={() => {
                  setRecordedRemainder(n)
                  setEvaluation(null)
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="division-board-reading" aria-live="polite">
          <span>
            {problem.dividend} ÷ {problem.divisor} =
          </span>
          <span className="division-board-blank">{recordedQuotient ?? ''}</span>
          {quotientMark && (
            <span className={evaluation?.quotientCorrect ? 'division-board-mark-ok' : 'division-board-mark-bad'}>
              {quotientMark}
            </span>
          )}
          <span>r</span>
          <span className="division-board-blank">{recordedRemainder ?? ''}</span>
          {remainderMark && (
            <span className={evaluation?.remainderCorrect ? 'division-board-mark-ok' : 'division-board-mark-bad'}>
              {remainderMark}
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn primary"
          disabled={recordedQuotient === null || recordedRemainder === null}
          onClick={() => {
            if (recordedQuotient !== null && recordedRemainder !== null) {
              setEvaluation(evaluateAnswer(board, { quotient: recordedQuotient, remainder: recordedRemainder }))
            }
          }}
        >
          Check
        </button>

        {evaluation && (
          <ul className="division-board-check-notes">
            {evaluation.correct && (
              <li className="division-board-note-ok">
                Correct: {formatReading(problem, { quotient: recordedQuotient ?? 0, remainder: recordedRemainder ?? 0 })}. Read
                it aloud.
              </li>
            )}
            {!evaluation.skittlesMatchDivisor && (
              <li className="division-board-note-hint">
                Count your skittles — this problem shares among {problem.divisor}, and the board has {placed} standing.
              </li>
            )}
            {evaluation.canDealAnotherRound && (
              <li className="division-board-note-hint">The tray still holds enough beads to deal another full round.</li>
            )}
            {!evaluation.correct && evaluation.skittlesMatchDivisor && !evaluation.canDealAnotherRound && (
              <li className="division-board-note-hint">
                Count again — the board holds the answer. The quotient is under one skittle; the remainder is in the tray.
              </li>
            )}
          </ul>
        )}
      </div>
    </MaterialShell>
  )
}
