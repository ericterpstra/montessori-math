import { useMemo, useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { randomSeed } from '../../lib/rng'
import {
  BOARD_COLUMNS,
  EMPTY_BOARD,
  RED_LINE_AFTER,
  STRIP_MAX,
  STRIP_MIN,
  answerColumn,
  checkAnswer,
  clearStrip,
  placeStrip,
  placements,
  practiceProblem,
  recordWay,
  waysComplete,
  waysToMake,
} from './model'
import type { BoardState, StripColor, Way } from './model'
import './addition-strip-board.css'

const P = 'addition-strip-board'
const WORK_ROWS = 4

type Mode = 'free' | 'practice' | 'ways'

/** The face of a strip: unit-square segments on red strips, numeral at the right end. */
function StripFace({ color, n }: { color: StripColor; n: number }) {
  return (
    <>
      {color === 'red' && (
        <span className={`${P}-segs`} aria-hidden="true">
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className={`${P}-seg`} />
          ))}
        </span>
      )}
      <span className={`${P}-strip-num`}>{n}</span>
    </>
  )
}

function Rack({ color, label, onPick }: { color: StripColor; label: string; onPick: (n: number) => void }) {
  return (
    <div className={`${P}-rack`}>
      <span className={`${P}-rack-label`}>{label}</span>
      {Array.from({ length: STRIP_MAX }, (_, i) => {
        const n = i + 1
        return (
          <button
            key={n}
            type="button"
            className={`${P}-strip ${P}-strip-${color}`}
            style={{ width: `calc(var(--asb-rack-unit) * ${n})` }}
            onClick={() => onPick(n)}
            aria-label={`lay the ${color} ${n} strip on the board`}
          >
            <StripFace color={color} n={n} />
          </button>
        )
      })}
    </div>
  )
}

export default function AdditionStripBoard() {
  const [mode, setMode] = useState<Mode>('free')
  const [board, setBoard] = useState<BoardState>(EMPTY_BOARD)
  // Practice mode
  const [seed, setSeed] = useState(() => randomSeed())
  const [problemIndex, setProblemIndex] = useState(0)
  const [attempt, setAttempt] = useState<{ column: number; correct: boolean } | null>(null)
  // Ways-to-make mode
  const [target, setTarget] = useState(11)
  const [found, setFound] = useState<Way[]>([])

  const problem = useMemo(() => practiceProblem(seed, problemIndex), [seed, problemIndex])
  const sum = answerColumn(board)
  const allWays = waysToMake(target)
  const complete = waysComplete(found, target)

  function switchMode(next: Mode) {
    setMode(next)
    setBoard(EMPTY_BOARD)
    setAttempt(null)
    setFound([])
    if (next === 'practice') {
      setSeed(randomSeed())
      setProblemIndex(0)
    }
  }

  function reset() {
    setBoard(EMPTY_BOARD)
    setAttempt(null)
    setFound([])
  }

  function changeTarget(n: number) {
    setTarget(n)
    setBoard(EMPTY_BOARD)
    setFound([])
  }

  function nextProblem() {
    setProblemIndex((i) => i + 1)
    setBoard(EMPTY_BOARD)
    setAttempt(null)
  }

  function pickStrip(color: StripColor, length: number) {
    const next = placeStrip(board, color, length)
    setBoard(next)
    if (mode === 'ways' && next.blue !== null && next.red !== null && next.blue + next.red === target) {
      const way: Way = { blue: next.blue, red: next.red }
      setFound((f) => recordWay(f, way, target))
    }
  }

  function removeStrip(color: StripColor) {
    setBoard(clearStrip(board, color))
  }

  function tapHeader(column: number) {
    if (mode !== 'practice' || attempt?.correct) return
    setAttempt({ column, correct: checkAnswer(problem, column) })
  }

  function headerClasses(column: number): string {
    const cls = [`${P}-head`, column <= RED_LINE_AFTER ? `${P}-head-red` : `${P}-head-blue`]
    if (column === RED_LINE_AFTER) cls.push(`${P}-tenline`)
    if (mode !== 'practice' && sum === column) cls.push(`${P}-head-answer`)
    if (mode === 'ways' && column === target) cls.push(`${P}-head-target`)
    if (mode === 'practice' && attempt?.column === column) {
      cls.push(attempt.correct ? `${P}-head-correct` : `${P}-head-wrong`)
    }
    return cls.join(' ')
  }

  const controls = (
    <>
      <label>
        Mode{' '}
        <select value={mode} onChange={(e) => switchMode(e.target.value as Mode)}>
          <option value="free">Free exploration</option>
          <option value="practice">Practice</option>
          <option value="ways">Ways to make a number</option>
        </select>
      </label>
      {mode === 'ways' && (
        <label>
          Make{' '}
          <select value={target} onChange={(e) => changeTarget(Number(e.target.value))}>
            {Array.from({ length: STRIP_MAX * 2 - STRIP_MIN * 2 + 1 }, (_, i) => i + STRIP_MIN * 2).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      {mode === 'practice' && (
        <button type="button" className="btn" onClick={nextProblem}>
          New problem
        </button>
      )}
      <button type="button" className="btn" onClick={reset}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Tap a blue strip to lay it on the board, then tap a red strip to lay it end-to-end after the blue one — the
      number above the end of the red strip is the sum. Tap a strip on the board to take it back off. In Practice
      mode, build the problem with strips and then tap your answer in the number row across the top. In Ways to make
      a number, find every blue-and-red pair that reaches the dashed target number.
    </p>
  )

  return (
    <MaterialShell mat="wood" help={help} controls={controls}>
      <div className={`${P}-statusbar`} aria-live="polite">
        {mode === 'free' &&
          (board.blue !== null && board.red !== null && sum !== null ? (
            <span className={`${P}-problem`}>
              <span className={`${P}-blue-num`}>{board.blue}</span> + <span className={`${P}-red-num`}>{board.red}</span> ={' '}
              {sum}
            </span>
          ) : (
            <span className="stage-note">Tap a blue strip, then a red strip, and read the sum from the top row.</span>
          ))}
        {mode === 'practice' && (
          <>
            <span className={`${P}-problem`}>
              <span className={`${P}-blue-num`}>{problem.a}</span> + <span className={`${P}-red-num`}>{problem.b}</span> ={' '}
              {attempt?.correct ? problem.a + problem.b : '?'}
            </span>
            {attempt && !attempt.correct && (
              <span className="stage-note">
                {attempt.column} is not it — lay the strips and read the number above the end of the red strip, then
                try again.
              </span>
            )}
            {attempt?.correct && (
              <button type="button" className="btn primary" onClick={nextProblem}>
                Next problem
              </button>
            )}
          </>
        )}
        {mode === 'ways' && (
          <span className="stage-note">
            Lay a blue strip and a red strip that together reach {target}. Each pair you build is added to the list.
          </span>
        )}
      </div>

      <div className={`${P}-layout`}>
        <div className={`${P}-board`} role="group" aria-label="addition strip board">
          {Array.from({ length: BOARD_COLUMNS }, (_, i) => {
            const col = i + 1
            if (mode === 'practice') {
              return (
                <button
                  key={col}
                  type="button"
                  className={headerClasses(col)}
                  onClick={() => tapHeader(col)}
                  aria-label={`answer ${col}`}
                >
                  {col}
                  {attempt?.column === col && (
                    <span className={`${P}-mark`} aria-hidden="true">
                      {attempt.correct ? '✓' : '✗'}
                    </span>
                  )}
                </button>
              )
            }
            return (
              <div key={col} className={headerClasses(col)}>
                {col}
              </div>
            )
          })}
          {Array.from({ length: WORK_ROWS * BOARD_COLUMNS }, (_, i) => {
            const col = (i % BOARD_COLUMNS) + 1
            const row = Math.floor(i / BOARD_COLUMNS) + 2
            return (
              <div
                key={`c${i}`}
                className={`${P}-cell${col === RED_LINE_AFTER ? ` ${P}-tenline` : ''}`}
                style={{ gridColumn: col, gridRow: row }}
              />
            )
          })}
          {placements(board).map((p) => (
            <button
              key={p.color}
              type="button"
              className={`${P}-strip ${P}-strip-${p.color} ${P}-strip-on-board`}
              style={{ gridColumn: `${p.startColumn} / span ${p.length}` }}
              onClick={() => removeStrip(p.color)}
              aria-label={`take the ${p.color} ${p.length} strip off the board`}
            >
              <StripFace color={p.color} n={p.length} />
            </button>
          ))}
        </div>

        {mode === 'ways' && (
          <div className={`${P}-ways`}>
            <p className={`${P}-ways-title`}>Ways to make {target}</p>
            <ul>
              {found.map((w) => (
                <li key={w.blue}>
                  <span className={`${P}-blue-num`}>{w.blue}</span> + <span className={`${P}-red-num`}>{w.red}</span> ={' '}
                  {target}
                </li>
              ))}
            </ul>
            <p className={`${P}-ways-count`} aria-live="polite">
              {complete
                ? `You have found all ${allWays.length} ways.`
                : `${found.length} of ${allWays.length} ways found.`}
            </p>
          </div>
        )}
      </div>

      <div className={`${P}-racks`}>
        <Rack color="blue" label="Blue strips" onPick={(n) => pickStrip('blue', n)} />
        <Rack color="red" label="Red strips" onPick={(n) => pickStrip('red', n)} />
      </div>
    </MaterialShell>
  )
}
