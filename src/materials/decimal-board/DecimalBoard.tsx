import { Fragment, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { Bead } from '../../components/beads'
import { placeInfo } from '../../lib/placeValue'
import type { PlaceCounts } from '../../lib/placeValue'
import { createRng, randomSeed } from '../../lib/rng'
import {
  DECIMAL_PLACES,
  allOk,
  checkAgainstScaled,
  combineRegions,
  compareRegions,
  comparisonWords,
  countAt,
  exchangeDownIn,
  exchangeUpIn,
  expectedScaled,
  formatProblem,
  formatScaled,
  generateProblem,
  generateTarget,
  isNormalized,
  readsExactly,
  removePiece,
  returnToBank,
  scaledValue,
  takeFromBank,
  undoRemove,
} from './model'
import type { ComparisonSymbol, DecimalPlace, DecimalProblem, Mode, PlaceCheck, Result } from './model'
import './decimal-board.css'

/* ------------------------------------------------------------------
   Board — four labeled columns with a bold decimal point after units
   ------------------------------------------------------------------ */

interface BoardProps {
  region: PlaceCounts
  label?: string
  /** Tap the tray button at the top of a column to add one piece. */
  onAdd?: (place: DecimalPlace) => void
  /** Tap a piece to act on it (put back / take away). */
  onPieceTap?: (place: DecimalPlace) => void
  /** Verb for the piece buttons' accessible labels. */
  pieceVerb?: string
  checks?: PlaceCheck[] | null
  /** Value readout string, or null to hide it. */
  value?: string | null
  compact?: boolean
}

function Board({ region, label, onAdd, onPieceTap, pieceVerb = 'put back one', checks, value, compact }: BoardProps) {
  const beadSize = compact ? 18 : 22
  return (
    <div className={`decimal-board-board${compact ? ' decimal-board-compact' : ''}`}>
      {label && <p className="decimal-board-board-label">{label}</p>}
      <div className="decimal-board-columns">
        {DECIMAL_PLACES.map((place) => {
          const info = placeInfo(place)
          const n = countAt(region, place)
          const check = checks?.find((c) => c.place === place) ?? null
          return (
            <Fragment key={place}>
              {place === -1 && (
                <div className="decimal-board-point" aria-hidden="true">
                  .
                </div>
              )}
              <div
                className="decimal-board-col"
                style={{ '--decimal-board-col-color': info.colorVar } as CSSProperties}
              >
                <div className="decimal-board-col-head">{info.name}</div>
                {onAdd && (
                  <button
                    type="button"
                    className="decimal-board-add"
                    onClick={() => onAdd(place)}
                    aria-label={`add one ${info.singular}`}
                  >
                    <Bead size={14} fill={info.colorVar} />
                    <span aria-hidden="true">+</span>
                  </button>
                )}
                <div
                  className="decimal-board-pieces"
                  role="group"
                  aria-label={`${n} ${n === 1 ? info.singular : info.name}`}
                >
                  {Array.from({ length: n }, (_, i) =>
                    onPieceTap ? (
                      <button
                        key={i}
                        type="button"
                        className="decimal-board-piece"
                        onClick={() => onPieceTap(place)}
                        aria-label={`${pieceVerb} ${info.singular}`}
                      >
                        <Bead size={beadSize} fill={info.colorVar} />
                      </button>
                    ) : (
                      <span key={i} className="decimal-board-piece decimal-board-piece-static">
                        <Bead size={beadSize} fill={info.colorVar} />
                      </span>
                    ),
                  )}
                </div>
                <div className="decimal-board-col-count" aria-hidden="true">
                  {n}
                </div>
                {check && (
                  <div className={`decimal-board-col-mark ${check.ok ? 'decimal-board-ok' : 'decimal-board-bad'}`}>
                    {check.ok ? '✓' : '✗'}
                    {check.needsExchange && <span className="decimal-board-col-note">exchange</span>}
                  </div>
                )}
              </div>
            </Fragment>
          )
        })}
      </div>
      {value != null && <p className="decimal-board-value">= {value}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------
   Exchange strip — guarded trades between adjacent columns
   ------------------------------------------------------------------ */

const BOUNDARIES: readonly [DecimalPlace, DecimalPlace][] = [
  [0, -1],
  [-1, -2],
  [-2, -3],
]

function ExchangeStrip({
  region,
  onResult,
}: {
  region: PlaceCounts
  onResult: (r: Result<PlaceCounts>) => void
}) {
  return (
    <div className="decimal-board-exchanges" role="group" aria-label="exchange pieces between columns">
      {BOUNDARIES.map(([upper, lower]) => {
        const u = placeInfo(upper)
        const l = placeInfo(lower)
        return (
          <div key={upper} className="decimal-board-exchange-group">
            <span className="decimal-board-exchange-label">
              {u.name} · {l.name}
            </span>
            <button
              type="button"
              className="btn"
              onClick={() => onResult(exchangeUpIn(region, lower))}
              aria-label={`trade ten ${l.name} for one ${u.singular}`}
            >
              ◀ 10 {l.name} → 1 {u.singular}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => onResult(exchangeDownIn(region, upper))}
              aria-label={`trade one ${u.singular} for ten ${l.name}`}
            >
              1 {u.singular} → 10 {l.name} ▶
            </button>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------
   The material
   ------------------------------------------------------------------ */

export default function DecimalBoard() {
  const rngRef = useRef(createRng(randomSeed()))
  const [mode, setMode] = useState<Mode>('free')
  const [showValue, setShowValue] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Free build + make the number share one board.
  const [region, setRegion] = useState<PlaceCounts>({})
  const [target, setTarget] = useState<number>(() => generateTarget(rngRef.current))
  const [makeChecks, setMakeChecks] = useState<PlaceCheck[] | null>(null)

  // Compare.
  const [regionA, setRegionA] = useState<PlaceCounts>({})
  const [regionB, setRegionB] = useState<PlaceCounts>({})
  const [choice, setChoice] = useState<ComparisonSymbol | null>(null)
  const [verdict, setVerdict] = useState<boolean | null>(null)

  // Add.
  const [addProblem, setAddProblem] = useState<DecimalProblem>(() => generateProblem('add', rngRef.current))
  const [rows, setRows] = useState<[PlaceCounts, PlaceCounts]>([{}, {}])
  const [combined, setCombined] = useState<PlaceCounts | null>(null)
  const [addChecks, setAddChecks] = useState<PlaceCheck[] | null>(null)

  // Subtract.
  const [subProblem, setSubProblem] = useState<DecimalProblem>(() => generateProblem('subtract', rngRef.current))
  const [mat, setMat] = useState<PlaceCounts>({})
  const [removed, setRemoved] = useState<PlaceCounts>({})
  const [phase, setPhase] = useState<'build' | 'takeaway'>('build')
  const [subChecks, setSubChecks] = useState<{ mat: PlaceCheck[]; removed: PlaceCheck[] } | null>(null)

  function apply<T>(r: Result<T>, commit: (value: T) => void) {
    if (r.ok) {
      commit(r.value)
      setMessage(null)
    } else {
      setMessage(r.message)
    }
  }

  function clearAll() {
    setMessage(null)
    setRegion({})
    setMakeChecks(null)
    setRegionA({})
    setRegionB({})
    setChoice(null)
    setVerdict(null)
    setRows([{}, {}])
    setCombined(null)
    setAddChecks(null)
    setMat({})
    setRemoved({})
    setPhase('build')
    setSubChecks(null)
  }

  function switchMode(next: Mode) {
    setMode(next)
    clearAll()
  }

  function newTarget() {
    setTarget(generateTarget(rngRef.current))
    setRegion({})
    setMakeChecks(null)
    setMessage(null)
  }

  function newProblem() {
    if (mode === 'add') {
      setAddProblem(generateProblem('add', rngRef.current))
      setRows([{}, {}])
      setCombined(null)
      setAddChecks(null)
    } else {
      setSubProblem(generateProblem('subtract', rngRef.current))
      setMat({})
      setRemoved({})
      setPhase('build')
      setSubChecks(null)
    }
    setMessage(null)
  }

  /* ----- free / make handlers ----- */

  function regionAdd(place: DecimalPlace) {
    apply(takeFromBank(region, place), setRegion)
    setMakeChecks(null)
  }

  function regionRemove(place: DecimalPlace) {
    apply(returnToBank(region, place), setRegion)
    setMakeChecks(null)
  }

  function regionExchange(r: Result<PlaceCounts>) {
    apply(r, setRegion)
    setMakeChecks(null)
  }

  function checkMake() {
    const checks = checkAgainstScaled(region, target)
    setMakeChecks(checks)
    setMessage(
      allOk(checks)
        ? `Every column matches — the board reads ${formatScaled(target)}.`
        : 'Recount the columns marked ✗, and exchange any column holding ten or more.',
    )
  }

  /* ----- compare handlers ----- */

  function compareEdit(which: 'A' | 'B', act: (r: PlaceCounts) => Result<PlaceCounts>) {
    const current = which === 'A' ? regionA : regionB
    apply(act(current), which === 'A' ? setRegionA : setRegionB)
    setChoice(null)
    setVerdict(null)
  }

  function chooseSymbol(sym: ComparisonSymbol) {
    const actual = compareRegions(regionA, regionB)
    const correct = actual === sym
    setChoice(sym)
    setVerdict(correct)
    setMessage(
      correct
        ? `Yes — ${formatScaled(scaledValue(regionA))} is ${comparisonWords(actual)} ${formatScaled(scaledValue(regionB))}.`
        : 'Look again — compare the units first, then tenths, then hundredths, then thousandths.',
    )
  }

  /* ----- add handlers ----- */

  function rowEdit(index: 0 | 1, act: (r: PlaceCounts) => Result<PlaceCounts>) {
    apply(act(rows[index]), (next) => {
      setRows(index === 0 ? [next, rows[1]] : [rows[0], next])
    })
  }

  function slideTogether() {
    const labels = ['first', 'second'] as const
    const operands = [addProblem.a, addProblem.b]
    for (const i of [0, 1] as const) {
      if (!readsExactly(rows[i], operands[i])) {
        const fix = isNormalized(rows[i]) ? '' : ' (exchange any column holding ten or more)'
        setMessage(`The ${labels[i]} quantity does not read ${formatScaled(operands[i])} yet — recount each column${fix}.`)
        return
      }
    }
    setCombined(combineRegions(rows))
    setMessage('The two quantities are together now. Exchange until no column holds ten or more, then read the sum.')
  }

  function combinedExchange(r: Result<PlaceCounts>) {
    apply(r, setCombined)
    setAddChecks(null)
  }

  function checkAdd() {
    if (!combined) return
    const checks = checkAgainstScaled(combined, expectedScaled('add', addProblem))
    setAddChecks(checks)
    setMessage(
      allOk(checks)
        ? `The sum reads ${formatScaled(expectedScaled('add', addProblem))} — every column matches.`
        : 'Recount the columns marked ✗ — and exchange wherever ten or more pieces share a column.',
    )
  }

  /* ----- subtract handlers ----- */

  function matBuildAdd(place: DecimalPlace) {
    apply(takeFromBank(mat, place), setMat)
  }

  function matBuildRemove(place: DecimalPlace) {
    apply(returnToBank(mat, place), setMat)
  }

  function startTakingAway() {
    if (!readsExactly(mat, subProblem.a)) {
      const fix = isNormalized(mat) ? '' : ' (exchange any column holding ten or more)'
      setMessage(`The board does not read ${formatScaled(subProblem.a)} yet — recount each column${fix}.`)
      return
    }
    setPhase('takeaway')
    setMessage(`Now take away ${formatScaled(subProblem.b)}: tap pieces to remove them, and exchange when a column runs empty.`)
  }

  function takeAway(place: DecimalPlace) {
    apply(removePiece(mat, removed, place), ({ board, removed: nextRemoved }) => {
      setMat(board)
      setRemoved(nextRemoved)
    })
    setSubChecks(null)
  }

  function putBack(place: DecimalPlace) {
    apply(undoRemove(mat, removed, place), ({ board, removed: nextRemoved }) => {
      setMat(board)
      setRemoved(nextRemoved)
    })
    setSubChecks(null)
  }

  function matExchange(r: Result<PlaceCounts>) {
    apply(r, setMat)
    setSubChecks(null)
  }

  function checkSubtract() {
    const checks = {
      mat: checkAgainstScaled(mat, expectedScaled('subtract', subProblem)),
      removed: checkAgainstScaled(removed, subProblem.b),
    }
    setSubChecks(checks)
    setMessage(
      allOk(checks.mat) && allOk(checks.removed)
        ? `Exactly ${formatScaled(subProblem.b)} was taken away, and what remains reads ${formatScaled(expectedScaled('subtract', subProblem))}.`
        : !allOk(checks.removed)
          ? `Check the taken-away tray against ${formatScaled(subProblem.b)} — its marks show which places are off.`
          : 'Recount the columns marked ✗ on the board.',
    )
  }

  /* ----- shared bits ----- */

  const defaultHint: Record<Mode, string> = {
    free: 'Tap a + button to place a piece; tap a piece to put it back. Ten of any column always trade for one of the column to its left.',
    make: 'Build the target number, one column at a time, then tap Check to see a ✓ or ✗ under every column.',
    compare: 'Build a quantity on each board, then choose <, =, or > between them.',
    add: 'Build each quantity on its own board, slide them together, then exchange until every column reads a single digit.',
    subtract:
      phase === 'build'
        ? `Build ${formatScaled(subProblem.a)} on the board first, then tap “Start taking away”.`
        : 'Tap pieces to take them away. When a column runs empty, exchange one piece from the column to its left — even across the decimal point.',
  }

  const valueOf = (r: PlaceCounts) => (showValue ? formatScaled(scaledValue(r)) : null)

  return (
    <MaterialShell
      mat="felt"
      help={
        <p>
          The decimal board extends place value to the right of the unit: pale blue tenths, pale rose hundredths, and pale
          green thousandths, each worth one tenth of the column to its left. Tap a column&rsquo;s + button to place a piece, tap a
          piece to pick it up, and use the exchange buttons to trade ten of one column for one of the next. Choose a mode to
          build a target number, compare two quantities, or add and subtract with real exchanging across the decimal point.
          Turn on &ldquo;Show value&rdquo; to read the board as a number, like 2.347.
        </p>
      }
      controls={
        <>
          <label>
            Mode
            <select value={mode} onChange={(e) => switchMode(e.target.value as Mode)} aria-label="mode">
              <option value="free">Free build</option>
              <option value="make">Make the number</option>
              <option value="compare">Compare</option>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={showValue} onChange={(e) => setShowValue(e.target.checked)} />
            Show value
          </label>
          {mode === 'make' && (
            <button type="button" className="btn" onClick={newTarget}>
              New number
            </button>
          )}
          {(mode === 'add' || mode === 'subtract') && (
            <button type="button" className="btn" onClick={newProblem}>
              New problem
            </button>
          )}
          <button type="button" className="btn" onClick={clearAll}>
            Reset
          </button>
        </>
      }
    >
      {mode === 'make' && (
        <div className="decimal-board-problem">
          Make <strong>{formatScaled(target)}</strong>
        </div>
      )}
      {mode === 'add' && <div className="decimal-board-problem">{formatProblem('add', addProblem)} = ?</div>}
      {mode === 'subtract' && <div className="decimal-board-problem">{formatProblem('subtract', subProblem)} = ?</div>}

      <p className="stage-note" aria-live="polite">
        {message ?? defaultHint[mode]}
      </p>

      {(mode === 'free' || mode === 'make') && (
        <>
          <Board
            region={region}
            onAdd={regionAdd}
            onPieceTap={regionRemove}
            checks={mode === 'make' ? makeChecks : null}
            value={valueOf(region)}
          />
          <ExchangeStrip region={region} onResult={regionExchange} />
          {mode === 'make' && (
            <div className="decimal-board-actions">
              <button type="button" className="btn primary" onClick={checkMake}>
                Check
              </button>
            </div>
          )}
        </>
      )}

      {mode === 'compare' && (
        <div className="decimal-board-compare">
          <Board
            region={regionA}
            label="First quantity"
            onAdd={(p) => compareEdit('A', (r) => takeFromBank(r, p))}
            onPieceTap={(p) => compareEdit('A', (r) => returnToBank(r, p))}
            value={valueOf(regionA)}
            compact
          />
          <div className="decimal-board-compare-middle" role="group" aria-label="choose a comparison symbol">
            {(['<', '=', '>'] as const).map((sym) => (
              <button
                key={sym}
                type="button"
                className="decimal-board-symbol"
                aria-pressed={choice === sym}
                onClick={() => chooseSymbol(sym)}
              >
                {sym}
              </button>
            ))}
            {verdict !== null && (
              <span
                className={`decimal-board-verdict ${verdict ? 'decimal-board-ok' : 'decimal-board-bad'}`}
                aria-live="polite"
              >
                {verdict ? '✓' : '✗'}
              </span>
            )}
          </div>
          <Board
            region={regionB}
            label="Second quantity"
            onAdd={(p) => compareEdit('B', (r) => takeFromBank(r, p))}
            onPieceTap={(p) => compareEdit('B', (r) => returnToBank(r, p))}
            value={valueOf(regionB)}
            compact
          />
        </div>
      )}

      {mode === 'add' &&
        (combined === null ? (
          <>
            <div className="decimal-board-compare">
              <Board
                region={rows[0]}
                label={`First quantity: ${formatScaled(addProblem.a)}`}
                onAdd={(p) => rowEdit(0, (r) => takeFromBank(r, p))}
                onPieceTap={(p) => rowEdit(0, (r) => returnToBank(r, p))}
                value={valueOf(rows[0])}
                compact
              />
              <Board
                region={rows[1]}
                label={`Second quantity: ${formatScaled(addProblem.b)}`}
                onAdd={(p) => rowEdit(1, (r) => takeFromBank(r, p))}
                onPieceTap={(p) => rowEdit(1, (r) => returnToBank(r, p))}
                value={valueOf(rows[1])}
                compact
              />
            </div>
            <div className="decimal-board-actions">
              <button type="button" className="btn primary" onClick={slideTogether}>
                Slide together
              </button>
            </div>
          </>
        ) : (
          <>
            <Board region={combined} label="Together" checks={addChecks} value={valueOf(combined)} />
            <ExchangeStrip region={combined} onResult={combinedExchange} />
            <div className="decimal-board-actions">
              <button type="button" className="btn primary" onClick={checkAdd}>
                Check
              </button>
            </div>
          </>
        ))}

      {mode === 'subtract' &&
        (phase === 'build' ? (
          <>
            <Board region={mat} onAdd={matBuildAdd} onPieceTap={matBuildRemove} value={valueOf(mat)} />
            <div className="decimal-board-actions">
              <button type="button" className="btn primary" onClick={startTakingAway}>
                Start taking away
              </button>
            </div>
          </>
        ) : (
          <>
            <Board
              region={mat}
              label="On the board"
              onPieceTap={takeAway}
              pieceVerb="take away one"
              checks={subChecks?.mat ?? null}
              value={valueOf(mat)}
            />
            <ExchangeStrip region={mat} onResult={matExchange} />
            <Board
              region={removed}
              label={`Taken away (goal: ${formatScaled(subProblem.b)})`}
              onPieceTap={putBack}
              pieceVerb="put back one"
              checks={subChecks?.removed ?? null}
              value={valueOf(removed)}
              compact
            />
            <div className="decimal-board-actions">
              <button type="button" className="btn primary" onClick={checkSubtract}>
                Check
              </button>
            </div>
          </>
        ))}
    </MaterialShell>
  )
}
