/**
 * Multi-digit vertical operations — the pencil-and-paper follow-up to
 * golden bead, stamp game, and bead frame work.
 *
 * Static (regrouping off) problems never need a carry or borrow; dynamic
 * (regrouping on) problems always need at least one. Optional place-value
 * column guides mimic stamp-game recording paper.
 */
import type { CSSProperties } from 'react'
import type { GeneratorDef, SheetProps } from '../types'
import type { RNG } from '../../lib/rng'
import type { PlacePower } from '../../lib/placeValue'
import { formatNumber, placeInfo } from '../../lib/placeValue'
import { AnswerKeyPage, SheetPage } from '../SheetPage'
import './multi-digit-ops.css'

export type Operation = 'add' | 'subtract' | 'multiply'

export type MultiDigitOpsParams = {
  operation: Operation
  /** Digits per operand (the multiplier is always a single digit). */
  digits: number
  count: number
  /** On: every problem needs a carry/borrow. Off: none do. */
  regrouping: boolean
  /** Colored U/T/H/Th column headings over each digit column. */
  placeColumns: boolean
}

export interface MultiDigitProblem {
  /** Top operand: addend, minuend, or multiplicand. */
  a: number
  /** Bottom operand: addend, subtrahend, or single-digit multiplier (2–9). */
  b: number
  answer: number
}

export interface MultiDigitOpsData {
  operation: Operation
  digits: number
  problems: MultiDigitProblem[]
}

/* ---------- pure helpers ---------- */

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

/** Digits of a non-negative integer, least significant first. */
function digitsOf(n: number): number[] {
  const out: number[] = []
  let x = n
  do {
    out.push(x % 10)
    x = Math.floor(x / 10)
  } while (x > 0)
  return out
}

/** Rebuild a number from least-significant-first digits. */
function fromDigits(ds: readonly number[]): number {
  let v = 0
  for (let i = ds.length - 1; i >= 0; i--) v = v * 10 + ds[i]
  return v
}

/** Carries needed by the standard column algorithm for a + b. */
export function additionCarries(a: number, b: number): number {
  let carries = 0
  let carry = 0
  let x = a
  let y = b
  while (x > 0 || y > 0) {
    const s = (x % 10) + (y % 10) + carry
    carry = s >= 10 ? 1 : 0
    if (carry === 1) carries++
    x = Math.floor(x / 10)
    y = Math.floor(y / 10)
  }
  return carries
}

/** Borrows needed by the standard column algorithm for a − b (a ≥ b). */
export function subtractionBorrows(a: number, b: number): number {
  let borrows = 0
  let borrow = 0
  let x = a
  let y = b
  while (y > 0 || borrow === 1) {
    const top = (x % 10) - borrow
    if (top < y % 10) {
      borrows++
      borrow = 1
    } else {
      borrow = 0
    }
    x = Math.floor(x / 10)
    y = Math.floor(y / 10)
  }
  return borrows
}

/** Carries needed by the single-digit column algorithm for a × multiplier. */
export function multiplicationCarries(a: number, multiplier: number): number {
  let carries = 0
  let carry = 0
  let x = a
  while (x > 0) {
    const p = (x % 10) * multiplier + carry
    carry = Math.floor(p / 10)
    if (carry > 0) carries++
    x = Math.floor(x / 10)
  }
  return carries
}

/* ---------- problem construction ---------- */

interface OperandPair {
  a: number
  b: number
}

const REJECT_ATTEMPTS = 60

function makeAddition(digits: number, regrouping: boolean, rng: RNG): OperandPair {
  if (!regrouping) {
    // Build column by column so every column sum stays ≤ 9. Index 0 = units;
    // the highest column keeps both leading digits ≥ 1.
    const aDs: number[] = []
    const bDs: number[] = []
    for (let i = 0; i < digits; i++) {
      const lead = i === digits - 1
      const aD = lead ? rng.int(1, 8) : rng.int(0, 9)
      const bD = lead ? rng.int(1, 9 - aD) : rng.int(0, 9 - aD)
      aDs.push(aD)
      bDs.push(bD)
    }
    const a = fromDigits(aDs)
    const b = fromDigits(bDs)
    // The construction biases a ≥ b; swap half the time for variety.
    return rng.bool() ? { a: b, b: a } : { a, b }
  }
  // Dynamic: random addends, then force a carry column if none appeared.
  const lo = 10 ** (digits - 1)
  const hi = 10 ** digits - 1
  const a = rng.int(lo, hi)
  const b = rng.int(lo, hi)
  if (additionCarries(a, b) > 0) return { a, b }
  const aDs = digitsOf(a)
  const bDs = digitsOf(b)
  const col = rng.int(0, digits - 1)
  const aD = rng.int(1, 9)
  aDs[col] = aD
  bDs[col] = rng.int(10 - aD, 9) // column sum ≥ 10 ⇒ guaranteed carry
  return { a: fromDigits(aDs), b: fromDigits(bDs) }
}

function makeSubtraction(digits: number, regrouping: boolean, rng: RNG): OperandPair {
  if (!regrouping) {
    // Static: every minuend digit ≥ the subtrahend digit below it.
    const aDs: number[] = []
    const bDs: number[] = []
    for (let i = 0; i < digits; i++) {
      const lead = i === digits - 1
      const bD = lead ? rng.int(1, 9) : rng.int(0, 9)
      aDs.push(rng.int(bD, 9))
      bDs.push(bD)
    }
    if (fromDigits(aDs) === fromDigits(bDs)) {
      // Avoid a − a = 0; nudging a units digit preserves every column pair.
      if (aDs[0] < 9) aDs[0] += 1
      else bDs[0] -= 1
    }
    return { a: fromDigits(aDs), b: fromDigits(bDs) }
  }
  // Dynamic: sample pairs until one needs a borrow (nearly always immediate).
  const lo = 10 ** (digits - 1)
  const hi = 10 ** digits - 1
  for (let attempt = 0; attempt < REJECT_ATTEMPTS; attempt++) {
    const p = rng.int(lo, hi)
    const q = rng.int(lo, hi)
    const a = Math.max(p, q)
    const b = Math.min(p, q)
    if (a > b && subtractionBorrows(a, b) > 0) return { a, b }
  }
  // Constructive fallback: leading digits a > b keep the difference positive;
  // one lower column is forced to borrow.
  const aDs: number[] = []
  const bDs: number[] = []
  for (let i = 0; i < digits; i++) {
    aDs.push(rng.int(0, 9))
    bDs.push(rng.int(0, 9))
  }
  aDs[digits - 1] = rng.int(2, 9)
  bDs[digits - 1] = rng.int(1, aDs[digits - 1] - 1)
  const col = rng.int(0, digits - 2)
  bDs[col] = rng.int(1, 9)
  aDs[col] = rng.int(0, bDs[col] - 1)
  return { a: fromDigits(aDs), b: fromDigits(bDs) }
}

function makeMultiplication(digits: number, regrouping: boolean, rng: RNG): OperandPair {
  if (!regrouping) {
    // Static: every digit × multiplier stays ≤ 9, so no column ever carries.
    const m = rng.int(2, 9)
    const maxDigit = Math.floor(9 / m)
    const ds: number[] = []
    for (let i = 0; i < digits; i++) {
      const lead = i === digits - 1
      ds.push(lead ? rng.int(1, maxDigit) : rng.int(0, maxDigit))
    }
    return { a: fromDigits(ds), b: m }
  }
  const lo = 10 ** (digits - 1)
  const hi = 10 ** digits - 1
  for (let attempt = 0; attempt < REJECT_ATTEMPTS; attempt++) {
    const a = rng.int(lo, hi)
    const m = rng.int(2, 9)
    if (multiplicationCarries(a, m) > 0) return { a, b: m }
  }
  // Constructive fallback: force the units product to reach 10.
  const m = rng.int(2, 9)
  const ds = digitsOf(rng.int(lo, hi))
  ds[0] = rng.int(Math.ceil(10 / m), 9)
  return { a: fromDigits(ds), b: m }
}

function makePair(operation: Operation, digits: number, regrouping: boolean, rng: RNG): OperandPair {
  switch (operation) {
    case 'add':
      return makeAddition(digits, regrouping, rng)
    case 'subtract':
      return makeSubtraction(digits, regrouping, rng)
    case 'multiply':
      return makeMultiplication(digits, regrouping, rng)
  }
}

function computeAnswer(operation: Operation, pair: OperandPair): number {
  switch (operation) {
    case 'add':
      return pair.a + pair.b
    case 'subtract':
      return pair.a - pair.b
    case 'multiply':
      return pair.a * pair.b
  }
}

export function generate(params: MultiDigitOpsParams, rng: RNG): MultiDigitOpsData {
  const operation = params.operation
  const digits = clampInt(params.digits, 2, 4)
  const count = clampInt(params.count, 6, 20)
  const problems: MultiDigitProblem[] = []
  const seen = new Set<string>()
  for (let i = 0; i < count; i++) {
    let pair = makePair(operation, digits, params.regrouping, rng)
    // Soft dedupe: retry a few times, then accept a repeat (tiny spaces exist).
    for (let retry = 0; retry < 8 && seen.has(`${pair.a}|${pair.b}`); retry++) {
      pair = makePair(operation, digits, params.regrouping, rng)
    }
    seen.add(`${pair.a}|${pair.b}`)
    problems.push({ a: pair.a, b: pair.b, answer: computeAnswer(operation, pair) })
  }
  return { operation, digits, problems }
}

/* ---------- rendering ---------- */

const PROBLEMS_PER_PAGE = 12
const GRID_COLS = 3

const OP_SYMBOL: Record<Operation, string> = { add: '+', subtract: '−', multiply: '×' }
const OP_TITLE: Record<Operation, string> = {
  add: 'Addition',
  subtract: 'Subtraction',
  multiply: 'Multiplication',
}
const OP_INSTRUCTIONS: Record<Operation, string> = {
  add: 'Add. Start with the units and work toward the left.',
  subtract: 'Subtract. Start with the units and work toward the left.',
  multiply: 'Multiply. Start with the units and work toward the left.',
}

const PLACE_LABEL: Partial<Record<PlacePower, string>> = { 0: 'U', 1: 'T', 2: 'H', 3: 'Th' }

function sheetTitle(data: MultiDigitOpsData): string {
  return `${data.digits}-Digit ${OP_TITLE[data.operation]}`
}

function ColumnHeads({ digits }: { digits: number }) {
  const powers: PlacePower[] = []
  for (let p = digits - 1; p >= 0; p--) powers.push(p as PlacePower)
  return (
    <span className="multi-digit-ops-heads" aria-hidden="true">
      {powers.map((p) => (
        <span key={p} className="multi-digit-ops-head" style={{ color: placeInfo(p).colorVar } as CSSProperties}>
          <span className="multi-digit-ops-head-label">{PLACE_LABEL[p]}</span>
        </span>
      ))}
    </span>
  )
}

function VerticalProblem({
  problem,
  index,
  operation,
  digits,
  placeColumns,
}: {
  problem: MultiDigitProblem
  index: number
  operation: Operation
  digits: number
  placeColumns: boolean
}) {
  const aStr = String(problem.a).padStart(digits, ' ')
  const bStr = String(problem.b).padStart(digits, ' ')
  return (
    <div className="problem multi-digit-ops-problem">
      <span className="problem-number">{index + 1}.</span>
      <div className="vertical-op multi-digit-ops-op">
        {placeColumns && <ColumnHeads digits={digits} />}
        <span className="op-row">
          <span className="multi-digit-ops-sign" />
          {aStr}
        </span>
        <span className="op-row">
          <span className="multi-digit-ops-sign">{OP_SYMBOL[operation]}</span>
          {bStr}
        </span>
        <span className="op-rule" />
        <span className="op-answer-space" />
      </div>
    </div>
  )
}

function Sheet({ data, params }: SheetProps<MultiDigitOpsParams, MultiDigitOpsData>) {
  const pages: MultiDigitProblem[][] = []
  for (let i = 0; i < data.problems.length; i += PROBLEMS_PER_PAGE) {
    pages.push(data.problems.slice(i, i + PROBLEMS_PER_PAGE))
  }
  return (
    <>
      {pages.map((page, pageIndex) => (
        <SheetPage key={pageIndex} title={sheetTitle(data)} instructions={OP_INSTRUCTIONS[data.operation]}>
          <div className="problems-grid" style={{ '--cols': GRID_COLS } as CSSProperties}>
            {page.map((problem, i) => (
              <VerticalProblem
                key={i}
                problem={problem}
                index={pageIndex * PROBLEMS_PER_PAGE + i}
                operation={data.operation}
                digits={data.digits}
                placeColumns={params.placeColumns}
              />
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function AnswerKey({ data }: SheetProps<MultiDigitOpsParams, MultiDigitOpsData>) {
  const sym = OP_SYMBOL[data.operation]
  return (
    <AnswerKeyPage title={sheetTitle(data)}>
      <ol className="answer-list">
        {data.problems.map((p, i) => (
          <li key={i}>
            <span className="problem-number">{i + 1}.</span>
            {formatNumber(p.a)} {sym} {formatNumber(p.b)} = <strong>{formatNumber(p.answer)}</strong>
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------- generator definition ---------- */

export const def: GeneratorDef<MultiDigitOpsParams, MultiDigitOpsData> = {
  slug: 'multi-digit-ops',
  name: 'Multi-Digit Operations',
  description:
    'Vertical addition, subtraction, and multiplication — the pencil-and-paper follow-up to golden bead, stamp game, and bead frame work.',
  strand: 'abstraction',
  ages: [5, 9],
  schema: [
    {
      kind: 'select',
      key: 'operation',
      label: 'Operation',
      options: [
        { value: 'add', label: 'Addition' },
        { value: 'subtract', label: 'Subtraction' },
        { value: 'multiply', label: 'Multiplication (× 1 digit)' },
      ],
    },
    {
      kind: 'number',
      key: 'digits',
      label: 'Digits',
      min: 2,
      max: 4,
      help: 'Digits in each number (the multiplier is always a single digit).',
    },
    { kind: 'number', key: 'count', label: 'Problems', min: 6, max: 20 },
    {
      kind: 'boolean',
      key: 'regrouping',
      label: 'Regrouping',
      help: 'On: every problem needs a carry or borrow (dynamic). Off: none do (static).',
    },
    {
      kind: 'boolean',
      key: 'placeColumns',
      label: 'Place-value columns',
      help: 'Color-coded U / T / H / Th column headings, like stamp-game recording paper.',
    },
  ],
  defaults: { operation: 'add', digits: 3, count: 9, regrouping: true, placeColumns: false },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'static-addition',
      name: 'Static addition',
      description: 'Three-digit addition with no exchanges — after the golden bead static addition lesson.',
      params: { operation: 'add', digits: 3, count: 9, regrouping: false, placeColumns: true },
    },
    {
      id: 'dynamic-subtraction',
      name: 'Dynamic subtraction',
      description: 'Four-digit subtraction with borrowing — after the stamp game subtraction lesson.',
      params: { operation: 'subtract', digits: 4, count: 9, regrouping: true, placeColumns: true },
    },
    {
      id: 'times-by-one-digit',
      name: 'Times by one digit',
      description: 'Three-digit × one-digit with carrying — alongside bead frame or checkerboard multiplication.',
      params: { operation: 'multiply', digits: 3, count: 9, regrouping: true, placeColumns: false },
    },
  ],
}
