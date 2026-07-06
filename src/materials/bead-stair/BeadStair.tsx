import { useId, useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { BeadBar } from '../../components/beads'
import { NumberCard } from '../../components/NumberCard'
import { randomSeed } from '../../lib/rng'
import {
  STAIR_ROWS,
  allNumeralsMatched,
  bankBars,
  checkRows,
  createState,
  isStairComplete,
  placeBar,
  placeNumeral,
  removeBar,
  removeNumeral,
  trayNumerals,
  withStairBuilt,
} from './model'
import type { BeadStairMode, BeadStairState } from './model'
import './bead-stair.css'

/** Bead diameter in px; a row-n slot outline is exactly n beads wide. */
const BEAD = 26

export default function BeadStair() {
  const [mode, setMode] = useState<BeadStairMode>('build')
  const [state, setState] = useState<BeadStairState>(() => createState(randomSeed()))
  const [selectedBar, setSelectedBar] = useState<number | null>(null)
  const [selectedNumeral, setSelectedNumeral] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const modeId = useId()

  function update(next: BeadStairState) {
    setState(next)
    setChecked(false)
  }

  function switchMode(next: BeadStairMode) {
    setMode(next)
    setSelectedBar(null)
    setSelectedNumeral(null)
    setChecked(false)
    if (next === 'match') {
      // Keep a correctly built stair; otherwise set it up ready for numeral work.
      setState((s) => (isStairComplete(s) ? s : withStairBuilt(createState(randomSeed()))))
    } else {
      setState(createState(randomSeed()))
    }
  }

  function reset() {
    const fresh = createState(randomSeed())
    setState(mode === 'match' ? withStairBuilt(fresh) : fresh)
    setSelectedBar(null)
    setSelectedNumeral(null)
    setChecked(false)
  }

  function onRowTap(row: number) {
    if (mode === 'build') {
      if (selectedBar !== null) {
        update(placeBar(state, selectedBar, row))
        setSelectedBar(null)
      } else if (state.placed[row] !== undefined) {
        update(removeBar(state, row))
      }
    } else {
      if (selectedNumeral !== null) {
        update(placeNumeral(state, selectedNumeral, row))
        setSelectedNumeral(null)
      } else if (state.numerals[row] !== undefined) {
        update(removeNumeral(state, row))
      }
    }
  }

  const checks = checkRows(state)

  let note: string
  if (checked) {
    if (mode === 'build') {
      note = isStairComplete(state)
        ? 'Every bar fits its outline — the stair is built.'
        : 'Not yet — look for beads that stick out past an outline, a gap left inside one, or an empty row.'
    } else {
      note = allNumeralsMatched(state)
        ? 'Every bar has its own numeral.'
        : 'Not yet — count the beads in each bar and check the numeral beside it.'
    }
  } else if (mode === 'build') {
    note =
      selectedBar !== null
        ? `Now tap the row where the bar of ${selectedBar} belongs.`
        : 'Tap a bar in the tray, then tap a row of the stair.'
  } else {
    note =
      selectedNumeral !== null
        ? `Now tap the bar with ${selectedNumeral} beads.`
        : 'Tap a numeral in the tray, then tap its bar on the stair.'
  }

  const controls = (
    <>
      <label htmlFor={modeId}>
        Activity
        <select id={modeId} value={mode} onChange={(e) => switchMode(e.target.value as BeadStairMode)}>
          <option value="build">Build the stair</option>
          <option value="match">Match the numerals</option>
        </select>
      </label>
      <button type="button" className="btn" onClick={() => setChecked(true)}>
        Check
      </button>
      <button type="button" className="btn" onClick={reset}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Tap a colored bar in the tray, then tap a row of the stair to lay it down; tap a placed bar to send it back. A bar
      on the wrong row sticks out past the dashed outline or leaves a gap — let your child notice that and try another
      row. Switch the activity to <em>Match the numerals</em> and your child pairs the number tiles 1–9 with the bars
      the same way. Check marks each row, and Reset scatters everything back to the tray.
    </p>
  )

  return (
    <MaterialShell controls={controls} help={help} mat="felt">
      <div className="bank-tray bead-stair-bank">
        {mode === 'build' ? (
          <>
            {bankBars(state).map((n) => (
              <button
                key={n}
                type="button"
                className={`bank-item bead-stair-bar${selectedBar === n ? ' bead-stair-selected' : ''}`}
                aria-pressed={selectedBar === n}
                aria-label={`bar of ${n}`}
                onClick={() => {
                  setSelectedBar(selectedBar === n ? null : n)
                  setChecked(false)
                }}
              >
                <BeadBar n={n} beadSize={BEAD} />
              </button>
            ))}
            {bankBars(state).length === 0 && <span className="bead-stair-tray-empty">All the bars are on the stair.</span>}
          </>
        ) : (
          <>
            {trayNumerals(state).map((n) => (
              <NumberCard
                key={n}
                value={n}
                height={72}
                selected={selectedNumeral === n}
                onClick={() => {
                  setSelectedNumeral(selectedNumeral === n ? null : n)
                  setChecked(false)
                }}
              />
            ))}
            {trayNumerals(state).length === 0 && (
              <span className="bead-stair-tray-empty">All the numerals are on the stair.</span>
            )}
          </>
        )}
      </div>

      <p className="stage-note bead-stair-note" aria-live="polite">
        {note}
      </p>

      <div className="bead-stair-stair">
        {STAIR_ROWS.map((row) => {
          const bar = state.placed[row]
          const numeral = state.numerals[row]
          const check = checks[row - 1]
          const showMark = checked && (mode === 'build' ? bar !== undefined : numeral !== undefined)
          const correct = mode === 'build' ? check.barCorrect : check.numeralCorrect
          let label = `row ${row}: ${bar === undefined ? 'empty' : `bar of ${bar}`}`
          if (mode === 'match') label += numeral === undefined ? ', no numeral yet' : `, numeral ${numeral}`
          return (
            <div key={row} className="bead-stair-rowwrap">
              <button type="button" className="bead-stair-row" aria-label={label} onClick={() => onRowTap(row)}>
                <span className="bead-stair-slot" style={{ width: row * BEAD }}>
                  {bar !== undefined && <BeadBar n={bar} beadSize={BEAD} />}
                </span>
                {mode === 'match' &&
                  (numeral !== undefined ? (
                    <NumberCard value={numeral} asDiv height={42} className="bead-stair-numeral" />
                  ) : (
                    <span className="bead-stair-numeral-slot" aria-hidden="true" />
                  ))}
              </button>
              {showMark && (
                <span
                  className={`bead-stair-mark ${correct ? 'bead-stair-mark-ok' : 'bead-stair-mark-err'}`}
                  role="img"
                  aria-label={correct ? 'correct' : 'not right yet'}
                >
                  {correct ? '✓' : '✗'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </MaterialShell>
  )
}
