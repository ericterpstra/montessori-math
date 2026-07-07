import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { runCeremony } from '../../lib/ceremony'
import { playTap } from '../../lib/sound'
import { StampTile } from '../../components/StampTile'
import type { StampValue } from '../../components/StampTile'
import { Skittle } from '../../components/beads'
import { formatNumber, placeInfo } from '../../lib/placeValue'
import type { PlaceCounts } from '../../lib/placeValue'
import { createRng, randomSeed } from '../../lib/rng'
import {
  STAMP_PLACES,
  allOk,
  checkAgainst,
  checkDivision,
  combineRegions,
  dealRound,
  exchangeDownIn,
  exchangeUpIn,
  expectedResult,
  formatProblem,
  generateProblem,
  moveStamp,
  regionValue,
  removeStamp,
  returnToBank,
  rowCount,
  takeFromBank,
  validateProblem,
} from './model'
import type { DivisionCheck, Mode, OperationMode, PlaceCheck, Problem, Result, StampPlace } from './model'
import './stamp-game.css'

const STAMP_VALUES: Record<StampPlace, StampValue> = { 0: 1, 1: 10, 2: 100, 3: 1000 }

const OPERAND_LABELS: Record<OperationMode, [string, string]> = {
  addition: ['First number', 'Second number'],
  subtraction: ['Start with', 'Take away'],
  multiplication: ['Number', 'Times'],
  division: ['To share', 'Skittles'],
}

function summaryFor(cs: readonly PlaceCheck[]): string {
  if (cs.some((c) => c.needsExchange)) {
    return 'A column holds ten or more — trade ten of them for one of the next size up, then check again.'
  }
  return 'Some columns do not match yet — recount the ones marked ✗.'
}

interface ColumnsProps {
  region: PlaceCounts
  onStampTap?: (place: StampPlace) => void
  checks?: PlaceCheck[] | null
  footer?: (place: StampPlace) => ReactNode
  compact?: boolean
}

/** The four place columns of a region, stamps rendered as tappable tiles. */
function Columns({ region, onStampTap, checks, footer, compact }: ColumnsProps) {
  return (
    <div className="stamp-game-columns">
      {STAMP_PLACES.map((place) => {
        const info = placeInfo(place)
        const n = region[place] ?? 0
        const check = checks?.find((c) => c.place === place)
        return (
          <div key={place} className={`stamp-game-column${compact ? ' stamp-game-compact' : ''}`} data-place={place}>
            <div className="stamp-game-col-head">
              <span className="stamp-game-col-dot" style={{ background: info.colorVar }} aria-hidden="true" />
              <span>{info.name}</span>
              <span className="stamp-game-col-count">{n}</span>
              {check && (
                <span
                  className={`stamp-game-check ${check.ok ? 'stamp-game-ok' : 'stamp-game-bad'}`}
                  role="img"
                  aria-label={check.ok ? `${info.name} column correct` : `${info.name} column not right yet`}
                >
                  {check.ok ? '✓' : '✗'}
                </span>
              )}
            </div>
            <div className="stamp-game-stamps">
              {Array.from({ length: n }, (_, i) =>
                onStampTap ? (
                  <StampTile key={i} value={STAMP_VALUES[place]} onClick={() => onStampTap(place)} />
                ) : (
                  <StampTile key={i} value={STAMP_VALUES[place]} asDiv />
                ),
              )}
            </div>
            {footer?.(place)}
          </div>
        )
      })}
    </div>
  )
}

export default function StampGame() {
  const [mode, setMode] = useState<Mode>('free')
  const [problem, setProblem] = useState<Problem | null>(null)
  /** Build rows (addends / times) or skittle rows in division. */
  const [rows, setRows] = useState<PlaceCounts[]>([])
  /** The work mat: free build, combined pile, minuend, or division supply. */
  const [mat, setMat] = useState<PlaceCounts>({})
  /** Subtraction: stamps taken away so far. */
  const [removed, setRemoved] = useState<PlaceCounts>({})
  const [activeRow, setActiveRow] = useState(0)
  const [combined, setCombined] = useState(false)
  /** Subtraction phase: false = building the minuend, true = taking away. */
  const [taking, setTaking] = useState(false)
  const [showValue, setShowValue] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [checks, setChecks] = useState<PlaceCheck[] | null>(null)
  const [removedChecks, setRemovedChecks] = useState<PlaceCheck[] | null>(null)
  const [divCheck, setDivCheck] = useState<DivisionCheck | null>(null)
  const [inputA, setInputA] = useState('')
  const [inputB, setInputB] = useState('')
  const [ceremonyActive, setCeremonyActive] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const isOp = mode !== 'free'
  const showRows = (mode === 'addition' || mode === 'multiplication') && !combined
  const showMat = !showRows

  function clearFeedback() {
    setChecks(null)
    setRemovedChecks(null)
    setDivCheck(null)
  }

  function start(m: Mode, p: Problem | null, note: string | null = null) {
    setMode(m)
    setProblem(p)
    setRows(Array.from({ length: rowCount(m, p) }, () => ({})))
    setMat({})
    setRemoved({})
    setActiveRow(0)
    setCombined(false)
    setTaking(false)
    setChecks(null)
    setRemovedChecks(null)
    setDivCheck(null)
    setMessage(note)
  }

  function onModeChange(m: Mode) {
    if (m === 'free') start(m, null)
    else start(m, generateProblem(m, createRng(randomSeed())))
  }

  function onNewProblem() {
    if (mode === 'free') return
    start(mode, generateProblem(mode, createRng(randomSeed())))
  }

  function onSetProblem() {
    if (mode === 'free') return
    if (inputA.trim() === '' || inputB.trim() === '') {
      setMessage('Type both numbers first.')
      return
    }
    const a = Number(inputA)
    const b = Number(inputB)
    const err = validateProblem(mode, a, b)
    if (err) {
      setMessage(err)
      return
    }
    start(mode, { a, b })
  }

  function onReset() {
    start(mode, problem)
  }

  /** Commit a guarded single-region move, or surface its refusal. */
  function applyRegion(res: Result<PlaceCounts>, commit: (v: PlaceCounts) => void) {
    if (!res.ok) {
      setMessage(res.message)
      return
    }
    commit(res.value)
    playTap()
    setMessage(null)
    clearFeedback()
  }

  function commitRow(i: number) {
    return (v: PlaceCounts) => setRows((rs) => rs.map((r, j) => (j === i ? v : r)))
  }

  function onBankTap(place: StampPlace) {
    if (ceremonyActive) return
    if (mode === 'subtraction' && taking) {
      setMessage('In subtraction you only build the starting number — take stamps away from the mat instead.')
      return
    }
    if (showRows) {
      applyRegion(takeFromBank(rows[activeRow] ?? {}, place), commitRow(activeRow))
      return
    }
    applyRegion(takeFromBank(mat, place), setMat)
  }

  function onMatTap(place: StampPlace) {
    if (ceremonyActive) return
    if (mode === 'subtraction' && taking) {
      const res = removeStamp(mat, removed, place)
      if (!res.ok) {
        setMessage(res.message)
        return
      }
      setMat(res.value.mat)
      setRemoved(res.value.removed)
      playTap()
      setMessage(null)
      clearFeedback()
      return
    }
    applyRegion(returnToBank(mat, place), setMat)
  }

  function onRemovedTap(place: StampPlace) {
    if (ceremonyActive) return
    const res = moveStamp(removed, mat, place)
    if (!res.ok) {
      setMessage(res.message)
      return
    }
    setRemoved(res.value.from)
    setMat(res.value.to)
    playTap()
    setMessage(null)
    clearFeedback()
  }

  function onRowStampTap(i: number, place: StampPlace) {
    if (ceremonyActive) return
    if (mode === 'division') {
      // Undo a deal: the stamp goes back to the supply, not the bank.
      const res = moveStamp(rows[i], mat, place)
      if (!res.ok) {
        setMessage(res.message)
        return
      }
      setRows((rs) => rs.map((r, j) => (j === i ? res.value.from : r)))
      setMat(res.value.to)
      playTap()
      setMessage(null)
      clearFeedback()
      return
    }
    applyRegion(returnToBank(rows[i], place), commitRow(i))
  }

  async function onExchange(place: StampPlace, dir: 'up' | 'down') {
    if (ceremonyActive) return
    const probe = dir === 'up' ? exchangeUpIn(mat, place) : exchangeDownIn(mat, place)
    if (!probe.ok) {
      setMessage(probe.message)
      return
    }
    const commit = () => {
      setMat((m) => {
        const r = dir === 'up' ? exchangeUpIn(m, place) : exchangeDownIn(m, place)
        return r.ok ? r.value : m
      })
      setMessage(null)
      clearFeedback()
    }
    const stageEl = rootRef.current?.closest<HTMLElement>('.material-stage') ?? null
    const toPlace = (dir === 'up' ? place + 1 : place - 1) as StampPlace
    const outCount = dir === 'up' ? 10 : 1
    const sourceEls = stageEl
      ? Array.from(
          stageEl.querySelectorAll<HTMLElement>(
            `[data-region="mat"] [data-place="${place}"] .stamp-game-stamps .stamp-tile`,
          ),
        ).slice(-outCount)
      : []
    const bankEl = stageEl?.querySelector<HTMLElement>('.bank-tray') ?? null
    const destEl = stageEl?.querySelector<HTMLElement>(
      `[data-region="mat"] [data-place="${toPlace}"] .stamp-game-stamps`,
    ) ?? null
    if (!stageEl || !bankEl || !destEl || sourceEls.length < outCount) {
      commit()
      return
    }
    const makeGhost = () => {
      const tile = stageEl.querySelector(`[data-bank-place="${toPlace}"] .stamp-tile`)
      return (tile?.cloneNode(true) as HTMLElement | undefined) ?? document.createElement('div')
    }
    setCeremonyActive(true)
    try {
      await runCeremony({ direction: dir, stageEl, sourceEls, bankEl, destEl, makeGhost, onCommit: commit })
    } finally {
      setCeremonyActive(false)
    }
  }

  function onDeal(place: StampPlace) {
    if (ceremonyActive) return
    const res = dealRound(mat, rows, place)
    if (!res.ok) {
      setMessage(res.message)
      return
    }
    setMat(res.value.supply)
    setRows(res.value.rows)
    playTap()
    setMessage(null)
    clearFeedback()
  }

  function onCombine() {
    if (rows.every((r) => regionValue(r) === 0)) {
      setMessage('Build the numbers first — tap stamps in the bank.')
      return
    }
    setMat(combineRegions(rows))
    setRows([])
    setCombined(true)
    clearFeedback()
    setMessage('All together now. Whenever a column holds ten or more, trade ten of them for one of the next size up.')
  }

  function onStartTaking() {
    if (regionValue(mat) === 0) {
      setMessage('Build the starting number first — tap stamps in the bank.')
      return
    }
    setTaking(true)
    setMessage('Now take away: tap stamps on the mat to remove them. If a column runs out, exchange from the next column up.')
  }

  function onCheck() {
    if (!isOp || !problem) return
    if (mode === 'division') {
      const dc = checkDivision(rows, mat, problem)
      setChecks(null)
      setRemovedChecks(null)
      setDivCheck(dc)
      if (!dc.equalShares) {
        setMessage('The skittles do not all have the same amount — division means fair shares. Deal again or tap stamps to undo.')
      } else if (allOk(dc.quotient) && allOk(dc.remainder)) {
        setMessage(
          `Each skittle received ${formatNumber(dc.quotientValue)} and ${formatNumber(dc.remainderValue)} left over — ${formatProblem(mode, problem)} = ${formatNumber(dc.quotientValue)} remainder ${formatNumber(dc.remainderValue)}.`,
        )
      } else {
        setMessage(summaryFor([...dc.quotient, ...dc.remainder]))
      }
      return
    }
    if (showRows) {
      setMessage('Slide the rows together first — tap Combine.')
      return
    }
    const expected = expectedResult(mode, problem)
    const cs = checkAgainst(mat, expected)
    setDivCheck(null)
    setChecks(cs)
    if (mode === 'subtraction') {
      const rcs = checkAgainst(removed, problem.b)
      setRemovedChecks(rcs)
      setMessage(
        allOk(cs) && allOk(rcs)
          ? `Every column matches — ${formatProblem(mode, problem)} = ${formatNumber(expected)}.`
          : summaryFor([...cs, ...rcs]),
      )
      return
    }
    setRemovedChecks(null)
    setMessage(
      allOk(cs)
        ? `Every column matches — ${formatProblem(mode, problem)} = ${formatNumber(expected)}.`
        : summaryFor(cs),
    )
  }

  const exchangeFooter = (place: StampPlace) => (
    <>
      {place < 3 && (
        <button
          type="button"
          className="stamp-game-xbtn"
          onClick={() => onExchange(place, 'up')}
          disabled={ceremonyActive}
          aria-label={`trade ten ${placeInfo(place).name} for one ${placeInfo((place + 1) as StampPlace).singular}`}
        >
          10 → 1 {placeInfo((place + 1) as StampPlace).singular}
        </button>
      )}
      {place > 0 && (
        <button
          type="button"
          className="stamp-game-xbtn"
          onClick={() => onExchange(place, 'down')}
          disabled={ceremonyActive}
          aria-label={`break one ${placeInfo(place).singular} into ten ${placeInfo((place - 1) as StampPlace).name}`}
        >
          1 → 10 {placeInfo((place - 1) as StampPlace).name}
        </button>
      )}
    </>
  )

  const supplyFooter = (place: StampPlace) => (
    <>
      <button
        type="button"
        className="stamp-game-xbtn stamp-game-deal"
        onClick={() => onDeal(place)}
        disabled={ceremonyActive}
        aria-label={`deal one ${placeInfo(place).singular} to each skittle`}
      >
        Deal 1 each
      </button>
      {exchangeFooter(place)}
    </>
  )

  const matLabel =
    mode === 'free'
      ? 'Work mat — tap a stamp to put it back'
      : mode === 'division'
        ? 'To be shared — whatever cannot be dealt fairly is the remainder'
        : mode === 'subtraction'
          ? taking
            ? 'Take away — tap stamps to remove them'
            : `Build ${problem ? formatNumber(problem.a) : 'the starting number'} here`
          : 'All together — exchange until every column reads 9 or less'

  function rowLabel(i: number): string {
    if (mode === 'addition') return i === 0 ? OPERAND_LABELS.addition[0] : OPERAND_LABELS.addition[1]
    return `${problem ? formatNumber(problem.a) : ''} — row ${i + 1} of ${rows.length}`
  }

  const controls = (
    <>
      <label>
        Mode
        <select value={mode} onChange={(e) => onModeChange(e.target.value as Mode)}>
          <option value="free">Free build</option>
          <option value="addition">Addition</option>
          <option value="subtraction">Subtraction</option>
          <option value="multiplication">Multiplication</option>
          <option value="division">Division</option>
        </select>
      </label>
      {isOp && (
        <>
          <button type="button" className="btn" onClick={onNewProblem}>
            New problem
          </button>
          <label>
            {OPERAND_LABELS[mode][0]}
            <input
              className="stamp-game-num"
              type="number"
              min={1}
              max={9999}
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
            />
          </label>
          <label>
            {OPERAND_LABELS[mode][1]}
            <input
              className="stamp-game-num"
              type="number"
              min={1}
              max={9999}
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
            />
          </label>
          <button type="button" className="btn" onClick={onSetProblem}>
            Set problem
          </button>
        </>
      )}
      <label>
        <input type="checkbox" checked={showValue} onChange={(e) => setShowValue(e.target.checked)} />
        Show values
      </label>
      <button type="button" className="btn" onClick={onReset}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      The stamp game is the golden beads shrunk down to tiles: green 1s, blue 10s, red 100s, and green 1,000s. Tap a
      stamp in the bank to take it, and tap a stamp on the mat to put it back. Whenever a column collects ten stamps,
      trade them for one stamp of the next size up using the buttons under each column — and trade one down into ten
      when you need more to take away. Pick an operation for a problem, work it with the stamps just as with the golden
      beads, then tap Check to recount each column together.
    </p>
  )

  return (
    <MaterialShell mat="wood" help={help} controls={controls}>
      <div className="stamp-game" ref={rootRef}>
        {isOp && problem && (
          <p className="stamp-game-problem">
            {formatProblem(mode, problem)}
            {mode === 'division' && (
              <span className="stamp-game-problem-note">
                {' '}
                — share {formatNumber(problem.a)} fairly among {problem.b} skittles
              </span>
            )}
          </p>
        )}

        <div className="bank-tray" role="group" aria-label="stamp bank">
          {STAMP_PLACES.map((place) => (
            <button
              key={place}
              type="button"
              className="bank-item stamp-game-bank-item"
              data-bank-place={place}
              onClick={() => onBankTap(place)}
              aria-label={`take one ${placeInfo(place).singular} stamp`}
            >
              <span className="stamp-game-bank-stack">
                <StampTile value={STAMP_VALUES[place]} asDiv />
              </span>
              <span className="stamp-game-bank-label">{placeInfo(place).name}</span>
            </button>
          ))}
          <span className="stamp-game-bank-hint">the bank — tap to take a stamp</span>
        </div>

        <div className="stamp-game-message-wrap" aria-live="polite">
          {message && <p className="stamp-game-message">{message}</p>}
        </div>

        {showRows && (
          <>
            {rows.map((row, i) => (
              <div key={i} className="stamp-game-region">
                <div className="stamp-game-region-head">
                  <button
                    type="button"
                    className="stamp-game-row-btn"
                    aria-pressed={activeRow === i}
                    onClick={() => setActiveRow(i)}
                  >
                    {rowLabel(i)}
                    {activeRow === i ? ' · building here' : ''}
                  </button>
                  {showValue && <span className="stamp-game-value">{formatNumber(regionValue(row))}</span>}
                </div>
                <Columns region={row} compact onStampTap={(p) => onRowStampTap(i, p)} />
              </div>
            ))}
            <div className="stamp-game-actions">
              <button type="button" className="btn primary" onClick={onCombine}>
                Combine — slide the rows together
              </button>
            </div>
          </>
        )}

        {showMat && (
          <div className="stamp-game-region" data-region="mat">
            <div className="stamp-game-region-head stage-note">
              <span>{matLabel}</span>
              {showValue && <span className="stamp-game-value">{formatNumber(regionValue(mat))}</span>}
            </div>
            <Columns
              region={mat}
              onStampTap={onMatTap}
              checks={mode === 'division' ? (divCheck?.remainder ?? null) : checks}
              footer={mode === 'division' ? supplyFooter : exchangeFooter}
            />
          </div>
        )}

        {mode === 'subtraction' && (taking || regionValue(removed) > 0) && (
          <div className="stamp-game-region">
            <div className="stamp-game-region-head stage-note">
              <span>Taken away — tap a stamp to put it back</span>
              {showValue && <span className="stamp-game-value">{formatNumber(regionValue(removed))}</span>}
            </div>
            <Columns region={removed} compact onStampTap={onRemovedTap} checks={removedChecks} />
          </div>
        )}

        {mode === 'division' &&
          rows.map((row, i) => (
            <div key={i} className="stamp-game-skittle-row">
              <div className="stamp-game-skittle">
                <Skittle height={44} title={`skittle ${i + 1}`} />
                <span className="stamp-game-skittle-num">{i + 1}</span>
              </div>
              <div>
                <div className="stamp-game-region-head stage-note">
                  <span>skittle {i + 1}&rsquo;s share</span>
                  {showValue && <span className="stamp-game-value">{formatNumber(regionValue(row))}</span>}
                </div>
                <Columns region={row} compact onStampTap={(p) => onRowStampTap(i, p)} checks={divCheck?.quotient ?? null} />
              </div>
            </div>
          ))}

        {isOp && (
          <div className="stamp-game-actions">
            {mode === 'subtraction' && !taking && (
              <button type="button" className="btn primary" onClick={onStartTaking}>
                I built it — start taking away
              </button>
            )}
            <button type="button" className="btn" onClick={onCheck}>
              Check my work
            </button>
          </div>
        )}
      </div>
    </MaterialShell>
  )
}
