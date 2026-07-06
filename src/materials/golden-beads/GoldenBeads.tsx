import { useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { Bead, HundredSquare, Skittle, TenBar, ThousandCube } from '../../components/beads'
import { NumberCard } from '../../components/NumberCard'
import { decompose, formatNumber, placeInfo, totalValue } from '../../lib/placeValue'
import type { PlaceCounts } from '../../lib/placeValue'
import { createRng, randomSeed } from '../../lib/rng'
import {
  EXCHANGE_FIRST_MESSAGE,
  GOLDEN_POWERS,
  MAX_TOTAL,
  addPiece,
  canAddPiece,
  canDeal,
  canExchangeDownGolden,
  canExchangeUpGolden,
  canRemovePiece,
  canTakeBack,
  checkAgainstNumber,
  checkDivision,
  checkLayout,
  deal,
  exchangeDownGolden,
  exchangeUpGolden,
  isOpMode,
  layoutStepCount,
  layoutTarget,
  makeBuildTarget,
  makeProblem,
  opAnswer,
  removePiece,
  takeBack,
  validateBuildTarget,
  validateOperands,
} from './model'
import type { CheckResult, DivisionCheck, GoldenPower, Mode, OpMode, Operands } from './model'
import './golden-beads.css'

const MODE_LABELS: Record<Mode, string> = {
  free: 'Free build',
  build: 'Build a number',
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
}

const OP_SYMBOL: Record<OpMode, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
}

const PIECE_SIZES = {
  bank: { cube: 54, square: 48, tenBead: 5.2, bead: 16 },
  mat: { cube: 88, square: 80, tenBead: 8.6, bead: 13 },
  small: { cube: 38, square: 34, tenBead: 4.2, bead: 9 },
} as const

function PieceArt({ power, variant = 'mat' }: { power: GoldenPower; variant?: keyof typeof PIECE_SIZES }) {
  const s = PIECE_SIZES[variant]
  switch (power) {
    case 3:
      return <ThousandCube size={s.cube} />
    case 2:
      return <HundredSquare size={s.square} />
    case 1:
      return <TenBar vertical beadSize={s.tenBead} />
    default:
      return <Bead size={s.bead} />
  }
}

/** The composed number-card stack: smaller cards cover the zeros of larger ones. */
function CardStack({ value }: { value: number }) {
  const parts = decompose(value)
    .filter((d) => d.digit > 0)
    .map((d) => d.digit * placeInfo(d.power).value)
  if (parts.length === 0) return null
  const height = 46
  const width = Math.round(height * 0.62 * String(parts[0]).length)
  return (
    <span
      className="golden-beads-cardstack"
      style={{ width, height }}
      role="img"
      aria-label={`number cards stacked to show ${formatNumber(value)}`}
    >
      {parts.map((v, i) => (
        <span key={v} className="golden-beads-cardpos" style={{ zIndex: i + 1 }}>
          <NumberCard value={v} asDiv height={height} />
        </span>
      ))}
    </span>
  )
}

export default function GoldenBeads() {
  const [mode, setMode] = useState<Mode>('free')
  const [mat, setMat] = useState<PlaceCounts>({})
  const [perRow, setPerRow] = useState<PlaceCounts>({})
  const [showTotal, setShowTotal] = useState(true)
  const [seed, setSeed] = useState(() => randomSeed())
  const [manual, setManual] = useState<Operands | null>(null)
  const [manualTarget, setManualTarget] = useState<number | null>(null)
  const [step, setStep] = useState(0)
  const [check, setCheck] = useState<CheckResult | null>(null)
  const [divCheck, setDivCheck] = useState<DivisionCheck | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [inputX, setInputX] = useState('')
  const [inputY, setInputY] = useState('')

  const opMode: OpMode | null = isOpMode(mode) ? mode : null
  const problem: Operands | null = opMode ? (manual ?? makeProblem(opMode, createRng(seed))) : null
  const buildTarget: number | null = mode === 'build' ? (manualTarget ?? makeBuildTarget(createRng(seed))) : null
  const totalSteps = opMode && problem ? layoutStepCount(opMode, problem.y) : 0
  const inWork = opMode !== null && step >= totalSteps
  const exchangesEnabled = mode === 'free' || mode === 'build' || inWork
  const matTotal = totalValue(mat)

  function clearFeedback() {
    setCheck(null)
    setDivCheck(null)
    setStatus(null)
  }

  function resetWork() {
    setMat({})
    setPerRow({})
    setStep(0)
    clearFeedback()
  }

  function switchMode(next: Mode) {
    setMode(next)
    setManual(null)
    setManualTarget(null)
    setSeed(randomSeed())
    setInputX('')
    setInputY('')
    setMat({})
    setPerRow({})
    setStep(0)
    setCheck(null)
    setDivCheck(null)
    setStatus(null)
  }

  function newProblem() {
    setManual(null)
    setManualTarget(null)
    setSeed(randomSeed())
    resetWork()
  }

  function handleBank(p: GoldenPower) {
    if (!canAddPiece(mat, p)) return
    setMat(addPiece(mat, p))
    clearFeedback()
  }

  function handleMatPiece(p: GoldenPower) {
    if (!canRemovePiece(mat, p)) return
    setMat(removePiece(mat, p))
    clearFeedback()
  }

  function handleExchange(p: GoldenPower, dir: 'up' | 'down') {
    setMat(dir === 'up' ? exchangeUpGolden(mat, p) : exchangeDownGolden(mat, p))
    clearFeedback()
  }

  function handleDeal(p: GoldenPower) {
    if (!problem || !canDeal(mat, p, problem.y)) return
    const next = deal(mat, perRow, p, problem.y)
    setMat(next.mat)
    setPerRow(next.perRow)
    clearFeedback()
  }

  function handleTakeBack(p: GoldenPower) {
    if (!problem || !canTakeBack(perRow, p)) return
    const next = takeBack(mat, perRow, p, problem.y)
    setMat(next.mat)
    setPerRow(next.perRow)
    clearFeedback()
  }

  function setManualProblem() {
    if (mode === 'build') {
      const n = Number(inputX)
      const err = validateBuildTarget(n)
      if (err) {
        setStatus(err)
        return
      }
      setManualTarget(n)
      resetWork()
      return
    }
    if (!opMode) return
    const x = Number(inputX)
    const y = Number(inputY)
    const err = validateOperands(opMode, x, y)
    if (err) {
      setStatus(err)
      return
    }
    setManual({ x, y })
    resetWork()
  }

  function runCheck() {
    if (mode === 'build' && buildTarget !== null) {
      const result = checkAgainstNumber(mat, buildTarget)
      if (result.needsExchange) {
        setCheck(null)
        setStatus(EXCHANGE_FIRST_MESSAGE)
        return
      }
      setCheck(result)
      setStatus(
        result.allOk
          ? `Yes — the mat shows ${formatNumber(buildTarget)}.`
          : 'Not yet — compare each marked column with the number.',
      )
      return
    }
    if (!opMode || !problem) return
    if (!inWork) {
      const result = checkLayout(mat, layoutTarget(opMode, problem.x, problem.y, step))
      if (result.allOk) {
        setCheck(null)
        setStep(step + 1)
        setStatus('Laid out correctly — on to the next step.')
      } else {
        setCheck(result)
        setStatus('Check the marked columns — count the pieces again.')
      }
      return
    }
    if (opMode === 'division') {
      const result = checkDivision(mat, perRow, problem.x, problem.y)
      if (result.canDealMore) {
        setDivCheck(null)
        setStatus('A column on the mat still has enough to give one to every skittle — keep dealing.')
        return
      }
      if (result.needsExchange) {
        setDivCheck(null)
        setStatus('Exchange the leftover pieces for the next smaller place, then keep dealing.')
        return
      }
      setDivCheck(result)
      const quotient = opAnswer('division', problem.x, problem.y)
      setStatus(
        result.allOk
          ? result.expectedRemainder > 0
            ? `Every skittle received ${formatNumber(quotient)}, and ${result.expectedRemainder} ${
                result.expectedRemainder === 1 ? 'unit is' : 'units are'
              } left on the mat.`
            : `Every skittle received ${formatNumber(quotient)} with nothing left over.`
          : 'Not yet — check the marked places below.',
      )
      return
    }
    const answer = opAnswer(opMode, problem.x, problem.y)
    const result = checkAgainstNumber(mat, answer)
    if (result.needsExchange) {
      setCheck(null)
      setStatus(EXCHANGE_FIRST_MESSAGE)
      return
    }
    setCheck(result)
    setStatus(
      result.allOk
        ? `It matches: ${formatNumber(problem.x)} ${OP_SYMBOL[opMode]} ${formatNumber(problem.y)} = ${formatNumber(answer)}.`
        : 'Not yet — check the marked columns.',
    )
  }

  function stepPrompt(): string | null {
    if (!opMode || !problem) return null
    const { x, y } = problem
    if (!inWork) {
      switch (opMode) {
        case 'addition':
          return step === 0
            ? `Lay out the first number: ${formatNumber(x)}.`
            : `Now lay out the second number on the same mat: ${formatNumber(y)}.`
        case 'multiplication':
          return `Lay out ${formatNumber(x)} — time ${step + 1} of ${y}.`
        case 'subtraction':
        case 'division':
          return `Lay out ${formatNumber(x)}.`
      }
    }
    switch (opMode) {
      case 'addition':
        return 'Push the two amounts together: exchange until every column has 9 or fewer, then check your answer.'
      case 'subtraction':
        return `Take away ${formatNumber(y)}: tap pieces to return them to the bank, exchanging a bigger piece whenever a column runs short.`
      case 'multiplication':
        return 'Combine the layouts: exchange until every column has 9 or fewer, then check your answer.'
      case 'division':
        return `Share everything among the ${y} skittles: deal each column, exchanging leftovers down until fewer than ${y} units remain.`
    }
  }

  const checkLabel = mode === 'build' ? 'Check' : inWork ? 'Check answer' : 'Check layout'

  return (
    <MaterialShell
      mat="felt"
      help={
        <>
          <p>
            Tap a piece in the bank to place it on the mat, and tap a piece on the mat to send it back. The exchange
            buttons trade ten of one place for one of the next — the heart of the decimal system.
          </p>
          <p>
            Pick a mode to build a target number or work a problem: your child lays out the quantities step by step,
            exchanges, and presses <em>{checkLabel}</em> so the material itself marks each place ✓ or ✗. Hide the
            running total for challenge work.
          </p>
        </>
      }
      controls={
        <>
          <label>
            Mode{' '}
            <select value={mode} onChange={(e) => switchMode(e.target.value as Mode)}>
              {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                <option key={m} value={m}>
                  {MODE_LABELS[m]}
                </option>
              ))}
            </select>
          </label>
          {mode !== 'free' && (
            <button type="button" className="btn" onClick={newProblem}>
              New problem
            </button>
          )}
          {mode === 'build' && (
            <span className="golden-beads-manual">
              <input
                type="number"
                min={1}
                max={MAX_TOTAL}
                value={inputX}
                onChange={(e) => setInputX(e.target.value)}
                aria-label="number to build"
                placeholder="your number"
              />
              <button type="button" className="btn" onClick={setManualProblem}>
                Set
              </button>
            </span>
          )}
          {opMode && (
            <span className="golden-beads-manual">
              <input
                type="number"
                min={1}
                max={MAX_TOTAL}
                value={inputX}
                onChange={(e) => setInputX(e.target.value)}
                aria-label="first number"
                placeholder="first"
              />
              <span aria-hidden="true">{OP_SYMBOL[opMode]}</span>
              <input
                type="number"
                min={1}
                max={opMode === 'multiplication' || opMode === 'division' ? 9 : MAX_TOTAL}
                value={inputY}
                onChange={(e) => setInputY(e.target.value)}
                aria-label="second number"
                placeholder="second"
              />
              <button type="button" className="btn" onClick={setManualProblem}>
                Set
              </button>
            </span>
          )}
          <button type="button" className="btn" onClick={() => setShowTotal((s) => !s)} aria-pressed={showTotal}>
            {showTotal ? 'Hide total' : 'Show total'}
          </button>
          <button type="button" className="btn" onClick={resetWork}>
            Reset
          </button>
        </>
      }
    >
      <div className="bank-tray golden-beads-bank" role="group" aria-label="golden bead bank">
        <span className="golden-beads-bank-title">Bank</span>
        {GOLDEN_POWERS.map((p) => (
          <button
            key={p}
            type="button"
            className="bank-item golden-beads-bank-item"
            onClick={() => handleBank(p)}
            disabled={!canAddPiece(mat, p)}
            aria-label={`add one ${placeInfo(p).singular} to the mat`}
          >
            <PieceArt power={p} variant="bank" />
            <span className="golden-beads-bank-label">{placeInfo(p).singular}</span>
          </button>
        ))}
      </div>

      {mode === 'build' && buildTarget !== null && (
        <div className="golden-beads-problem">
          <span className="golden-beads-problem-text">Build {formatNumber(buildTarget)}</span>
          <CardStack value={buildTarget} />
          <span className="golden-beads-prompt">Fetch the beads from the bank, then check.</span>
        </div>
      )}
      {opMode && problem && (
        <div className="golden-beads-problem">
          <span className="golden-beads-problem-text">
            {formatNumber(problem.x)} {OP_SYMBOL[opMode]} {formatNumber(problem.y)}
          </span>
          <span className="golden-beads-prompt">{stepPrompt()}</span>
        </div>
      )}
      {mode === 'free' && matTotal === 0 && (
        <p className="stage-note">Tap the bank to bring golden beads onto the mat.</p>
      )}

      <div className="golden-beads-mat">
        {GOLDEN_POWERS.map((p) => {
          const count = mat[p] ?? 0
          const mark = check?.places.find((pl) => pl.power === p)
          return (
            <div key={p} className="golden-beads-col">
              <div className="golden-beads-col-head">
                <span className="golden-beads-dot" style={{ background: placeInfo(p).colorVar }} aria-hidden="true" />
                <span className="golden-beads-col-name">{placeInfo(p).name}</span>
                {mark && (
                  <span
                    className={`golden-beads-mark ${mark.ok ? 'golden-beads-mark-ok' : 'golden-beads-mark-bad'}`}
                    role="img"
                    aria-label={mark.ok ? `${placeInfo(p).name} correct` : `${placeInfo(p).name} needs another look`}
                  >
                    {mark.ok ? '✓' : '✗'}
                  </span>
                )}
                <span className="golden-beads-col-count">{count}</span>
              </div>
              <div className="golden-beads-pieces">
                {Array.from({ length: count }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="golden-beads-piece"
                    onClick={() => handleMatPiece(p)}
                    aria-label={`return one ${placeInfo(p).singular} to the bank`}
                  >
                    <PieceArt power={p} />
                  </button>
                ))}
              </div>
              <div className="golden-beads-col-actions">
                {exchangesEnabled && p < 3 && (
                  <button
                    type="button"
                    className="golden-beads-action"
                    onClick={() => handleExchange(p, 'up')}
                    disabled={!canExchangeUpGolden(mat, p)}
                  >
                    10 {placeInfo(p).name} → 1 {placeInfo((p + 1) as GoldenPower).singular}
                  </button>
                )}
                {exchangesEnabled && p > 0 && (
                  <button
                    type="button"
                    className="golden-beads-action"
                    onClick={() => handleExchange(p, 'down')}
                    disabled={!canExchangeDownGolden(mat, p)}
                  >
                    1 {placeInfo(p).singular} → 10 {placeInfo((p - 1) as GoldenPower).name}
                  </button>
                )}
                {mode === 'division' && inWork && problem && (
                  <button
                    type="button"
                    className="golden-beads-action golden-beads-deal"
                    onClick={() => handleDeal(p)}
                    disabled={!canDeal(mat, p, problem.y)}
                  >
                    Deal 1 to each skittle
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {mode === 'division' && inWork && problem && (
        <div className="golden-beads-rows" role="group" aria-label="skittle rows">
          <p className="stage-note">
            Every skittle must receive exactly the same amount. Tap a dealt piece to take one back from every row.
          </p>
          {Array.from({ length: problem.y }, (_, r) => (
            <div key={r} className="golden-beads-row">
              <Skittle height={44} title={`skittle ${r + 1}`} />
              <div className="golden-beads-row-pieces">
                {GOLDEN_POWERS.map((p) =>
                  Array.from({ length: perRow[p] ?? 0 }, (_, i) => (
                    <button
                      key={`${p}-${i}`}
                      type="button"
                      className="golden-beads-piece golden-beads-piece-row"
                      onClick={() => handleTakeBack(p)}
                      aria-label={`take one ${placeInfo(p).singular} back from every skittle`}
                    >
                      <PieceArt power={p} variant="small" />
                    </button>
                  )),
                )}
              </div>
            </div>
          ))}
          {divCheck && (
            <div className="golden-beads-divcheck">
              <span>Each skittle:</span>
              {divCheck.places.map((pl) => (
                <span
                  key={pl.power}
                  className={`golden-beads-mark ${pl.ok ? 'golden-beads-mark-ok' : 'golden-beads-mark-bad'}`}
                >
                  {placeInfo(pl.power).name} {pl.ok ? '✓' : '✗'}
                </span>
              ))}
              <span
                className={`golden-beads-mark ${divCheck.remainderOk ? 'golden-beads-mark-ok' : 'golden-beads-mark-bad'}`}
              >
                remainder {divCheck.remainderOk ? '✓' : '✗'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="golden-beads-checkrow">
        {mode !== 'free' && (
          <button type="button" className="btn primary" onClick={runCheck}>
            {checkLabel}
          </button>
        )}
        {status && (
          <span className="golden-beads-status" role="status">
            {status}
          </span>
        )}
      </div>

      <div className="golden-beads-total">
        {showTotal ? (
          <>
            Total on the mat: <strong>{formatNumber(matTotal)}</strong>
          </>
        ) : (
          <em>Total hidden — count and exchange to find it.</em>
        )}
      </div>
    </MaterialShell>
  )
}
