import { useMemo, useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { randomSeed } from '../../lib/rng'
import {
  BOARD_MAX,
  MAX_SUBTRAHEND,
  answerColumn,
  coverSpan,
  evaluateTap,
  headerColor,
  isValidProblem,
  practiceProblems,
  stripSpan,
  waysToTakeFrom,
} from './model'
import './subtraction-strip-board.css'

type Mode = 'free' | 'practice' | 'ways'

const COLUMNS = Array.from({ length: BOARD_MAX }, (_, i) => i + 1)
const STRIPS = Array.from({ length: MAX_SUBTRAHEND }, (_, i) => i + 1)

interface BoardProps {
  /** The minuend a; null when nothing is set — the cover stays out. */
  minuend: number | null
  /** The blue strip b; null when no strip is laid. */
  subtrahend: number | null
  /** Highlight the answer column (just left of the blue strip). */
  showAnswer: boolean
  /** Green highlight (a confirmed practice answer) vs. neutral blue. */
  answerTone: 'neutral' | 'ok'
  /** Header number the child tapped that was not the answer. */
  wrongTap: number | null
  onHeaderTap: (n: number) => void
}

function Board({ minuend, subtrahend, showAnswer, answerTone, wrongTap, onHeaderTap }: BoardProps) {
  const cover = minuend === null ? null : coverSpan(minuend)
  const hasStrip = minuend !== null && subtrahend !== null && isValidProblem(minuend, subtrahend)
  const strip = hasStrip ? stripSpan(minuend, subtrahend) : null
  const answer = hasStrip ? answerColumn(minuend, subtrahend) : null

  return (
    <div className="subtraction-strip-board-board">
      <div className="subtraction-strip-board-row" role="group" aria-label="board numbers 1 to 18 — tap one">
        {COLUMNS.map((n) => {
          const covered = cover !== null && n >= cover.start && n <= cover.end
          const classes = ['subtraction-strip-board-cell']
          classes.push(headerColor(n) === 'blue' ? 'subtraction-strip-board-blue' : 'subtraction-strip-board-red')
          if (covered) {
            classes.push('subtraction-strip-board-covered')
            if (cover !== null && n === cover.start) classes.push('subtraction-strip-board-cover-edge')
          }
          if (showAnswer && answer === n) {
            classes.push(answerTone === 'ok' ? 'subtraction-strip-board-answer-ok' : 'subtraction-strip-board-answer')
          }
          if (wrongTap === n) classes.push('subtraction-strip-board-wrong')
          return (
            <button
              key={n}
              type="button"
              className={classes.join(' ')}
              onClick={() => onHeaderTap(n)}
              aria-label={covered ? `${n}, covered by the wood strip` : `${n}`}
            >
              {covered ? '' : n}
            </button>
          )
        })}
      </div>
      <div className="subtraction-strip-board-row" aria-hidden="true">
        {COLUMNS.map((n) => {
          const inStrip = strip !== null && n >= strip.start && n <= strip.end
          const classes = ['subtraction-strip-board-cell', 'subtraction-strip-board-square']
          if (inStrip) classes.push('subtraction-strip-board-stripcell')
          return (
            <div key={n} className={classes.join(' ')}>
              {inStrip && strip !== null && n === strip.end ? subtrahend : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SubtractionStripBoard() {
  const [mode, setMode] = useState<Mode>('free')

  // Free exploration
  const [minuend, setMinuend] = useState<number | null>(null)
  const [subtrahend, setSubtrahend] = useState<number | null>(null)

  // Practice
  const [seed, setSeed] = useState(() => randomSeed())
  const [problemIndex, setProblemIndex] = useState(0)
  const [wrongTap, setWrongTap] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)

  // Ways to take from N
  const [waysMinuend, setWaysMinuend] = useState<number | null>(null)
  const [waysShown, setWaysShown] = useState(0)

  // The seeded stream is prefix-stable, so extending the count as the child
  // advances always replays the same earlier problems.
  const problems = useMemo(() => practiceProblems(seed, problemIndex + 1), [seed, problemIndex])
  const problem = problems[problemIndex]
  const ways = useMemo(() => (waysMinuend === null ? [] : waysToTakeFrom(waysMinuend)), [waysMinuend])
  const currentWay = waysShown > 0 ? ways[waysShown - 1] : undefined

  function reset(nextMode: Mode) {
    setMode(nextMode)
    setMinuend(null)
    setSubtrahend(null)
    setSeed(randomSeed())
    setProblemIndex(0)
    setWrongTap(null)
    setSolved(false)
    setWaysMinuend(null)
    setWaysShown(0)
  }

  function handleHeaderTap(n: number) {
    if (mode === 'free') {
      setMinuend(n)
      if (subtrahend !== null && !isValidProblem(n, subtrahend)) setSubtrahend(null)
    } else if (mode === 'practice') {
      if (solved) return
      if (evaluateTap(problem, n).correct) {
        setSolved(true)
        setWrongTap(null)
      } else {
        setWrongTap(n)
      }
    } else {
      setWaysMinuend(n)
      setWaysShown(0)
    }
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1)
    setSolved(false)
    setWrongTap(null)
  }

  let boardMinuend: number | null = null
  let boardSubtrahend: number | null = null
  let showAnswer = false
  let answerTone: 'neutral' | 'ok' = 'neutral'
  if (mode === 'free') {
    boardMinuend = minuend
    boardSubtrahend = subtrahend
    showAnswer = subtrahend !== null
  } else if (mode === 'practice') {
    boardMinuend = problem.a
    boardSubtrahend = problem.b
    showAnswer = solved
    answerTone = 'ok'
  } else {
    boardMinuend = waysMinuend
    boardSubtrahend = currentWay?.b ?? null
    showAnswer = currentWay !== undefined
  }

  const controls = (
    <>
      <label>
        Mode{' '}
        <select value={mode} onChange={(e) => reset(e.target.value as Mode)}>
          <option value="free">Free exploration</option>
          <option value="practice">Practice problems</option>
          <option value="ways">Ways to take from a number</option>
        </select>
      </label>
      <button type="button" className="subtraction-strip-board-button" onClick={() => reset(mode)}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Tap a number along the top to choose how many you start with — the wooden cover slides in to hide everything
      past it. Then tap a blue strip to take that many away: the strip lies under the numbers, and the answer is the
      number just to the left of it. Practice mode poses problems for your child to answer by tapping the number row,
      and &ldquo;Ways to take from a number&rdquo; builds a whole subtraction table one strip at a time. The board
      itself is the check — if a fact is in doubt, count the uncovered squares.
    </p>
  )

  return (
    <MaterialShell help={help} controls={controls} mat="wood">
      <div className="subtraction-strip-board-stage">
        {mode === 'free' &&
          (minuend === null ? (
            <p className="stage-note">Tap a number at the top. The wooden cover will slide in to hide everything past it.</p>
          ) : subtrahend === null ? (
            <p className="stage-note">You start with {minuend}. Now tap a blue strip below to take some away.</p>
          ) : (
            <p className="subtraction-strip-board-chip">
              <span className="subtraction-strip-board-equation">
                {minuend} − {subtrahend} = {minuend - subtrahend}
              </span>{' '}
              — the answer is the number just left of the blue strip.
            </p>
          ))}

        {mode === 'practice' && (
          <p className="subtraction-strip-board-chip">
            Problem {problemIndex + 1}:{' '}
            <span className="subtraction-strip-board-equation">
              {problem.a} − {problem.b} = {solved ? problem.answer : '?'}
            </span>
          </p>
        )}

        {mode === 'ways' &&
          (waysMinuend === null ? (
            <p className="stage-note">
              Tap a number at the top — you will take away 1, then 2, then 3… and build its whole subtraction table.
            </p>
          ) : ways.length === 0 ? (
            <p className="stage-note">Nothing can be taken away from 1 — tap a bigger number.</p>
          ) : (
            <div className="subtraction-strip-board-waysbar">
              {currentWay ? (
                <p className="subtraction-strip-board-chip">
                  <span className="subtraction-strip-board-equation">
                    {currentWay.a} − {currentWay.b} = {currentWay.answer}
                  </span>
                </p>
              ) : (
                <p className="stage-note">Ready? Take away 1 first.</p>
              )}
              {waysShown < ways.length ? (
                <button
                  type="button"
                  className="subtraction-strip-board-button subtraction-strip-board-primary"
                  onClick={() => setWaysShown((s) => s + 1)}
                >
                  Take away {waysShown + 1}
                </button>
              ) : (
                <p className="stage-note">That is every way to take from {waysMinuend} on this board.</p>
              )}
            </div>
          ))}

        <Board
          minuend={boardMinuend}
          subtrahend={boardSubtrahend}
          showAnswer={showAnswer}
          answerTone={answerTone}
          wrongTap={mode === 'practice' && !solved ? wrongTap : null}
          onHeaderTap={handleHeaderTap}
        />

        {mode === 'free' && (
          <div className="bank-tray subtraction-strip-board-tray" role="group" aria-label="blue strips 1 to 9">
            {STRIPS.map((b) => {
              const usable = minuend !== null && isValidProblem(minuend, b)
              return (
                <button
                  key={b}
                  type="button"
                  className="bank-item"
                  disabled={!usable}
                  aria-pressed={subtrahend === b}
                  aria-label={`blue strip ${b}`}
                  onClick={() => setSubtrahend(b)}
                >
                  <span className="subtraction-strip-board-ministrip" style={{ width: b * 16 }}>
                    {b}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {mode === 'practice' && (
          <>
            <div aria-live="polite">
              {solved ? (
                <p className="subtraction-strip-board-chip subtraction-strip-board-ok">
                  That is right — {problem.a} − {problem.b} = {problem.answer}.
                </p>
              ) : wrongTap !== null ? (
                <p className="subtraction-strip-board-chip subtraction-strip-board-error">
                  Not {wrongTap}. Find the number just left of the blue strip and try again.
                </p>
              ) : (
                <p className="stage-note">Read the board, then tap your answer in the number row.</p>
              )}
            </div>
            {solved && (
              <button
                type="button"
                className="subtraction-strip-board-button subtraction-strip-board-primary"
                onClick={nextProblem}
              >
                Next problem
              </button>
            )}
          </>
        )}

        {mode === 'ways' && waysMinuend !== null && waysShown > 0 && (
          <table className="subtraction-strip-board-record">
            <caption>Taking away from {waysMinuend} — copy each line onto your own paper</caption>
            <tbody>
              {ways.slice(0, waysShown).map((w) => (
                <tr key={w.b}>
                  <td>
                    {w.a} − {w.b} = {w.answer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MaterialShell>
  )
}
