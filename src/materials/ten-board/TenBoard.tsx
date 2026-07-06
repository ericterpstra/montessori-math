import { useMemo, useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { NumberCard } from '../../components/NumberCard'
import { Bead, TenBar } from '../../components/beads'
import { randomSeed } from '../../lib/rng'
import {
  BOARD_ROWS,
  EMPTY_BEADS,
  EMPTY_SYMBOL,
  addTenBar,
  addUnitBead,
  beadValue,
  beadsMatchSymbol,
  canAddTenBar,
  canAddUnitBead,
  canCountUp,
  checkTarget,
  countUp,
  countingExchange,
  countingPrompt,
  exchangeUnits,
  needsExchange,
  nthTarget,
  numberWord,
  removeTenBar,
  removeUnitBead,
  startCounting,
  symbolValue,
  type BeadState,
  type CheckResult,
  type CountingState,
  type SymbolState,
} from './model'
import './ten-board.css'

type Mode = 'free' | 'counting' | 'make'

const UNIT_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export default function TenBoard() {
  const [mode, setMode] = useState<Mode>('free')
  const [symbol, setSymbol] = useState<SymbolState>(EMPTY_SYMBOL)
  const [beads, setBeads] = useState<BeadState>(EMPTY_BEADS)
  const [showReadout, setShowReadout] = useState(true)
  const [counting, setCounting] = useState<CountingState>(() => startCounting())
  const [seed] = useState(() => randomSeed())
  const [round, setRound] = useState(0)
  const [checked, setChecked] = useState<CheckResult | null>(null)

  const target = useMemo(() => nthTarget(seed, round), [seed, round])

  const building = mode !== 'counting'
  const shownBeads = building ? beads : counting.beads
  const displayTens = building ? symbol.tens : Math.floor(counting.current / 10)
  const displayUnit = building ? symbol.unit : counting.current % 10
  const sv = symbolValue(symbol)

  function switchMode(next: Mode) {
    setMode(next)
    setSymbol(EMPTY_SYMBOL)
    setBeads(EMPTY_BEADS)
    setCounting(startCounting())
    setChecked(null)
  }

  function reset() {
    if (mode === 'counting') {
      setCounting(startCounting())
    } else {
      setSymbol(EMPTY_SYMBOL)
      setBeads(EMPTY_BEADS)
      setChecked(null)
    }
  }

  function newNumber() {
    setRound((r) => r + 1)
    setSymbol(EMPTY_SYMBOL)
    setBeads(EMPTY_BEADS)
    setChecked(null)
  }

  function pickRow(tensDigit: number) {
    if (!building) return
    setChecked(null)
    setSymbol((s) => ({ ...s, tens: s.tens === tensDigit ? 0 : tensDigit }))
  }

  function pickCard(n: number) {
    setChecked(null)
    setSymbol((s) => ({ ...s, unit: s.unit === n ? 0 : n }))
  }

  function changeBeads(fn: (b: BeadState) => BeadState, guard: (b: BeadState) => boolean) {
    setChecked(null)
    setBeads((b) => (guard(b) ? fn(b) : b))
  }

  const controls = (
    <>
      <label>
        Mode{' '}
        <select value={mode} onChange={(e) => switchMode(e.target.value as Mode)}>
          <option value="free">Free build</option>
          <option value="counting">Counting 10–99</option>
          <option value="make">Make the number</option>
        </select>
      </label>
      {mode === 'free' && (
        <label>
          <input type="checkbox" checked={showReadout} onChange={(e) => setShowReadout(e.target.checked)} /> Show the
          number
        </label>
      )}
      {mode === 'make' && (
        <button type="button" className="btn" onClick={newNumber}>
          New number
        </button>
      )}
      <button type="button" className="btn" onClick={reset}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Tap a row of the board to choose the tens, then tap a unit card from the tray to slide it over the zero — card 4
      on the 30 row makes 34. Take golden ten-bars and unit beads to lay out the same amount on the work mat; tap a
      bead or bar to put it back. In Counting mode, add one unit bead at a time, and when ten loose units pile up,
      exchange them for a ten-bar to reach the next ten. In Make the number, read the number words aloud to your child,
      then press Check when both the board and the beads are ready.
    </p>
  )

  return (
    <MaterialShell controls={controls} help={help}>
      <div className="ten-board-layout">
        <div className="ten-board-boards">
          {[BOARD_ROWS.slice(0, 5), BOARD_ROWS.slice(5)].map((panel, p) => (
            <div className="ten-board-panel" key={p}>
              {panel.map((rowValue) => {
                const tensDigit = rowValue / 10
                const active = displayTens === tensDigit
                return (
                  <button
                    type="button"
                    key={rowValue}
                    className={`ten-board-row${active ? ' selected' : ''}`}
                    onClick={() => pickRow(tensDigit)}
                    disabled={!building}
                    aria-pressed={building ? active : undefined}
                    aria-label={`${rowValue} row${active && displayUnit > 0 ? `, unit card ${displayUnit} makes ${tensDigit * 10 + displayUnit}` : ''}`}
                  >
                    <span className="ten-board-row-digits" aria-hidden="true">
                      <span>{tensDigit}</span>
                      <span className="ten-board-zero">
                        0
                        {active && displayUnit > 0 && <span className="ten-board-card">{displayUnit}</span>}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="ten-board-side">
          {mode === 'counting' && (
            <>
              <div className="ten-board-count">
                {counting.current} — {numberWord(counting.current)}
              </div>
              <p className="stage-note">{countingPrompt(counting)}</p>
              <div className="ten-board-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setCounting((s) => (canCountUp(s) ? countUp(s) : s))}
                  disabled={!canCountUp(counting)}
                >
                  Add a unit bead
                </button>
                <button
                  type="button"
                  className={`btn${needsExchange(counting.beads) ? ' primary' : ''}`}
                  onClick={() => setCounting((s) => (needsExchange(s.beads) ? countingExchange(s) : s))}
                  disabled={!needsExchange(counting.beads)}
                >
                  Exchange: 10 units → 1 ten-bar
                </button>
              </div>
            </>
          )}

          {mode === 'make' && (
            <>
              <div className="ten-board-note ten-board-target">Make “{numberWord(target)}”</div>
              <p className="stage-note">Read the words aloud, then build the number with the board and the beads.</p>
            </>
          )}

          {building && (
            <div className="bank-tray" role="group" aria-label="unit cards 1 to 9">
              {UNIT_CARDS.map((n) => (
                <button
                  type="button"
                  key={n}
                  className="bank-item"
                  onClick={() => pickCard(n)}
                  aria-pressed={symbol.unit === n}
                  aria-label={`unit card ${n}`}
                >
                  <NumberCard value={n} height={44} asDiv className={symbol.unit === n ? 'selected' : ''} />
                </button>
              ))}
            </div>
          )}

          {building && (
            <div className="bank-tray" role="group" aria-label="bead supply">
              <button
                type="button"
                className="bank-item ten-board-bank-item"
                onClick={() => changeBeads(addTenBar, canAddTenBar)}
                disabled={!canAddTenBar(beads)}
                aria-label="take a golden ten-bar"
              >
                <TenBar beadSize={13} />
                <span className="ten-board-bank-label">ten-bar</span>
              </button>
              <button
                type="button"
                className="bank-item ten-board-bank-item"
                onClick={() => changeBeads(addUnitBead, canAddUnitBead)}
                disabled={!canAddUnitBead(beads)}
                aria-label="take a unit bead"
              >
                <Bead size={20} />
                <span className="ten-board-bank-label">unit</span>
              </button>
            </div>
          )}

          <div className="ten-board-workmat" aria-label="bead work mat">
            {shownBeads.tenBars === 0 && shownBeads.unitBeads === 0 && building && (
              <p className="stage-note">Lay the beads here: take ten-bars and unit beads from the tray above.</p>
            )}
            {shownBeads.tenBars > 0 && (
              <div className="ten-board-bars">
                {Array.from({ length: shownBeads.tenBars }, (_, i) =>
                  building ? (
                    <button
                      type="button"
                      key={i}
                      className="ten-board-piece"
                      onClick={() => changeBeads(removeTenBar, (b) => b.tenBars > 0)}
                      aria-label="put back a ten-bar"
                    >
                      <TenBar vertical beadSize={16} title="ten-bar" />
                    </button>
                  ) : (
                    <span key={i} className="ten-board-piece">
                      <TenBar vertical beadSize={16} title="ten-bar" />
                    </span>
                  ),
                )}
              </div>
            )}
            {shownBeads.unitBeads > 0 && (
              <div className="ten-board-units">
                {Array.from({ length: shownBeads.unitBeads }, (_, i) =>
                  building ? (
                    <button
                      type="button"
                      key={i}
                      className="ten-board-piece"
                      onClick={() => changeBeads(removeUnitBead, (b) => b.unitBeads > 0)}
                      aria-label="put back a unit bead"
                    >
                      <Bead size={20} title="unit bead" />
                    </button>
                  ) : (
                    <span key={i} className="ten-board-piece">
                      <Bead size={20} title="unit bead" />
                    </span>
                  ),
                )}
              </div>
            )}
            {building && needsExchange(beads) && (
              <div className="ten-board-actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => changeBeads(exchangeUnits, needsExchange)}
                >
                  Exchange: 10 units → 1 ten-bar
                </button>
              </div>
            )}
          </div>

          {mode === 'free' && showReadout && (
            <div className="ten-board-note">
              <span>Board: {sv !== null ? `${sv} — ${numberWord(sv)}` : 'tap a row to begin'}</span>
              <span>Beads: {beadValue(beads)}</span>
              {sv !== null &&
                (beadValue(beads) > 0 || beadsMatchSymbol(beads, symbol)) &&
                (beadsMatchSymbol(beads, symbol) ? (
                  <span className="ten-board-ok">✓ the beads match the board</span>
                ) : (
                  <span className="ten-board-err">✗ the beads do not match yet</span>
                ))}
            </div>
          )}

          {mode === 'make' && (
            <div className="ten-board-actions">
              <button
                type="button"
                className="btn primary"
                onClick={() => setChecked(checkTarget(target, symbol, beads))}
              >
                Check
              </button>
              {checked && (
                <div className="ten-board-note">
                  <span className={checked.symbolCorrect ? 'ten-board-ok' : 'ten-board-err'}>
                    {checked.symbolCorrect ? '✓ board is right' : '✗ board — look again'}
                  </span>
                  <span className={checked.beadsCorrect ? 'ten-board-ok' : 'ten-board-err'}>
                    {checked.beadsCorrect ? '✓ beads are right' : '✗ beads — count again'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MaterialShell>
  )
}
