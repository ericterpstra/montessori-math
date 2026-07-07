import { Fragment, useEffect, useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { PrintButton } from '../../components/PrintButton'
import { SheetPreview } from '../../components/SheetPreview'
import {
  cellKey,
  checkPlacements,
  createWorkingState,
  fact,
  isComplete,
  placeTile,
  removeTile,
} from './model'
import type { PlacementCheck } from './model'
import './addition-charts.css'

type Mode = 'chart1' | 'chart2' | 'working'

const OPERANDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function AdditionCharts() {
  const [mode, setMode] = useState<Mode>('chart1')
  const [working, setWorking] = useState(() => createWorkingState())
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null) // index into working.bank
  const [check, setCheck] = useState<PlacementCheck | null>(null)
  const [hiRow, setHiRow] = useState<number | null>(null) // finger highlight, chart1/chart2 only
  const [hiCol, setHiCol] = useState<number | null>(null)
  const [showPrint, setShowPrint] = useState(false)
  const [bw, setBw] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('addition-charts-print-mode', showPrint)
    return () => document.body.classList.remove('addition-charts-print-mode')
  }, [showPrint])

  const clearTransient = () => {
    setSelectedIndex(null)
    setCheck(null)
    setHiRow(null)
    setHiCol(null)
  }

  const handleModeChange = (m: Mode) => {
    setMode(m)
    clearTransient() // working state is kept; only Reset clears the child's chart
  }

  const handleReset = () => {
    setWorking(createWorkingState())
    clearTransient()
  }

  const handleWorkingCell = (a: number, b: number) => {
    const placed = working.placed.get(cellKey(a, b))
    if (placed !== undefined) {
      setWorking(removeTile(working, a, b))
      setSelectedIndex(null)
      setCheck(null)
      return
    }
    if (selectedIndex === null) return
    const tile = working.bank[selectedIndex]
    if (tile === undefined) return
    setWorking(placeTile(working, a, b, tile))
    setSelectedIndex(null)
    setCheck(null)
  }

  const wrongSet = new Set((check?.wrong ?? []).map(([a, b]) => cellKey(a, b)))
  const complete = isComplete(working)

  const chartGrid = (chart: 'chart1' | 'chart2') => {
    const half = chart === 'chart2'
    return (
      <div className="addition-charts-grid-scroll">
        <div className="addition-charts-grid" role="grid" aria-label={half ? 'Addition chart 2, half chart' : 'Addition chart 1, control chart'}>
          <div className="addition-charts-corner" aria-hidden="true">
            +
          </div>
          {OPERANDS.map((b) => (
            <button
              key={`top-${b}`}
              type="button"
              className="addition-charts-header"
              aria-pressed={hiCol === b}
              aria-label={`highlight the column under ${b}`}
              onClick={() => setHiCol(hiCol === b ? null : b)}
            >
              {b}
            </button>
          ))}
          {OPERANDS.map((a) => (
            <Fragment key={`row-${a}`}>
              <button
                type="button"
                className="addition-charts-header"
                aria-pressed={hiRow === a}
                aria-label={`highlight the row beside ${a}`}
                onClick={() => setHiRow(hiRow === a ? null : a)}
              >
                {a}
              </button>
              {OPERANDS.map((b) =>
                half && a > b ? (
                  <div key={`${a},${b}`} className="addition-charts-cell gap" aria-hidden="true" />
                ) : (
                  <div
                    key={`${a},${b}`}
                    className={
                      'addition-charts-cell' +
                      (a === hiRow || b === hiCol ? ' hi' : '') +
                      (a === hiRow && b === hiCol ? ' meet' : '')
                    }
                  >
                    {fact(a, b)}
                  </div>
                ),
              )}
            </Fragment>
          ))}
        </div>
      </div>
    )
  }

  const workingGrid = (
    <div className="addition-charts-grid-scroll">
      <div className="addition-charts-grid" role="grid" aria-label="Addition chart 3, working chart">
        <div className="addition-charts-corner" aria-hidden="true">
          +
        </div>
        {OPERANDS.map((b) => (
          <div key={`top-${b}`} className="addition-charts-header">
            {b}
          </div>
        ))}
        {OPERANDS.map((a) => (
          <Fragment key={`row-${a}`}>
            <div className="addition-charts-header">{a}</div>
            {OPERANDS.map((b) => {
              const tile = working.placed.get(cellKey(a, b))
              const wrong = wrongSet.has(cellKey(a, b))
              return (
                <button
                  key={`${a},${b}`}
                  type="button"
                  className={'addition-charts-cell' + (wrong ? ' wrong' : '')}
                  onClick={() => handleWorkingCell(a, b)}
                  aria-label={tile === undefined ? `put a tile on ${a} plus ${b}` : `take the ${tile} tile off ${a} plus ${b}`}
                >
                  {tile !== undefined && (
                    <>
                      {tile}
                      {wrong && <span aria-hidden="true"> ✗</span>}
                    </>
                  )}
                </button>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div className="addition-charts-app">
        <MaterialShell
          help={
            <>
              Chart 1 holds every addition fact from 1 + 1 to 9 + 9. Tap a number down the side and a number across the
              top — the row and column shade, and the answer is outlined where your two fingers meet. Chart 2 shows only
              half the facts, because 3 + 5 and 5 + 3 share an answer — the smaller number always comes first. On the
              working chart the grid is blank: tap an answer tile in the box, then tap the square where it belongs, and
              tap a placed tile to take it back. Press <em>Check my chart</em> whenever you like — it marks only the
              tiles that do not match the control chart, and the marks clear as soon as you keep working.
            </>
          }
          controls={
            <>
              <label>
                Mode{' '}
                <select value={mode} onChange={(e) => handleModeChange(e.target.value as Mode)}>
                  <option value="chart1">Chart 1 — control chart</option>
                  <option value="chart2">Chart 2 — half chart</option>
                  <option value="working">Chart 3 — working chart</option>
                </select>
              </label>
              <button type="button" className="addition-charts-btn" onClick={() => setShowPrint(!showPrint)}>
                Print control charts
              </button>
              <button type="button" className="addition-charts-btn" onClick={handleReset}>
                Reset
              </button>
            </>
          }
        >
          {mode === 'chart1' && chartGrid('chart1')}
          {mode === 'chart2' && chartGrid('chart2')}
          {mode === 'working' && workingGrid}

          {mode !== 'working' && hiRow !== null && hiCol !== null && (
            <p className="stage-note">
              {hiRow} + {hiCol} = {fact(hiRow, hiCol)} — where your two fingers meet.
            </p>
          )}

          {mode === 'working' && (
            <>
              <div className="addition-charts-bank" role="group" aria-label="Answer tiles">
                {working.bank.map((tile, i) => (
                  <button
                    key={i}
                    type="button"
                    className={'addition-charts-tile' + (selectedIndex === i ? ' selected' : '')}
                    aria-pressed={selectedIndex === i}
                    aria-label={`${tile} tile`}
                    onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                  >
                    {tile}
                  </button>
                ))}
                {working.bank.length === 0 && <p className="stage-note">The tile box is empty.</p>}
              </div>
              <div className="addition-charts-actions">
                <button
                  type="button"
                  className="addition-charts-btn"
                  onClick={() => setCheck(checkPlacements(working))}
                  disabled={working.placed.size === 0}
                >
                  Check my chart
                </button>
              </div>
              {check && (
                <p className="stage-note">
                  {check.correct.length} placed tiles match the control chart · {check.wrong.length} need another look.
                </p>
              )}
              {complete && <p className="stage-note">Every fact matches the control chart — all 81 tiles are placed.</p>}
            </>
          )}
        </MaterialShell>
      </div>
      {showPrint && (
        <SheetPreview bw={bw} className="addition-charts-print">
          <div className="addition-charts-print-controls no-print">
            <label>
              <input type="checkbox" checked={bw} onChange={(e) => setBw(e.target.checked)} /> Ink-friendly B&amp;W
            </label>
            <PrintButton label="Print control charts" />
            <button type="button" className="addition-charts-btn" onClick={() => setShowPrint(false)}>
              Close
            </button>
          </div>
          <section className="sheet-page">
            <header className="sheet-header">
              <h2 className="sheet-title">Addition Chart 1 — Control Chart</h2>
            </header>
            <p className="sheet-instructions">
              Every addition fact from 1 + 1 to 9 + 9. Slide one finger down from the top number and one finger in from
              the side number — the answer is where they meet.
            </p>
            <table className="addition-charts-print-table">
              <thead>
                <tr>
                  <th>+</th>
                  {OPERANDS.map((b) => (
                    <th key={b}>{b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OPERANDS.map((a) => (
                  <tr key={a}>
                    <th>{a}</th>
                    {OPERANDS.map((b) => (
                      <td key={b}>{fact(a, b)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="sheet-page">
            <header className="sheet-header">
              <h2 className="sheet-title">Addition Chart 2 — Half Chart</h2>
            </header>
            <p className="sheet-instructions">
              Only the facts where the smaller number comes first — because 3 + 5 and 5 + 3 share an answer.
            </p>
            <table className="addition-charts-print-table">
              <thead>
                <tr>
                  <th>+</th>
                  {OPERANDS.map((b) => (
                    <th key={b}>{b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {OPERANDS.map((a) => (
                  <tr key={a}>
                    <th>{a}</th>
                    {OPERANDS.map((b) => (a > b ? <td key={b} className="gap" /> : <td key={b}>{fact(a, b)}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </SheetPreview>
      )}
    </>
  )
}
