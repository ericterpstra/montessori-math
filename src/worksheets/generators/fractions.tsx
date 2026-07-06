import type { CSSProperties, ReactNode } from 'react'
import type { RNG } from '../../lib/rng'
import type { GeneratorDef, ParamValues, SheetProps } from '../types'
import { AnswerKeyPage, SheetPage } from '../SheetPage'
import './fractions.css'

/* ---------- Types ---------- */

export type FractionMode = 'identify' | 'shade' | 'add' | 'subtract' | 'equivalent' | 'mixed'

export interface FractionsParams extends ParamValues {
  mode: FractionMode
  maxDenominator: number
  count: number
}

/** Shaded circle shown; child writes the fraction. Answer is num/den. */
export interface IdentifyProblem {
  kind: 'identify'
  num: number
  den: number
}

/** Fraction shown; child shades num of den sectors. */
export interface ShadeProblem {
  kind: 'shade'
  num: number
  den: number
}

/** a/den + b/den, pictures for both addends. Answer: whole + rem/den (whole may be 0). */
export interface AddProblem {
  kind: 'add'
  a: number
  b: number
  den: number
  sumNum: number
  whole: number
  rem: number
}

/** a/den − b/den (a > b), picture of the minuend. Answer: diff/den. */
export interface SubtractProblem {
  kind: 'subtract'
  a: number
  b: number
  den: number
  diff: number
}

/** baseNum/baseDen = ?/bigDen where bigDen = baseDen·k. Answer: answerNum = baseNum·k. */
export interface EquivalentProblem {
  kind: 'equivalent'
  baseNum: number
  baseDen: number
  k: number
  bigDen: number
  answerNum: number
}

export type FractionProblem = IdentifyProblem | ShadeProblem | AddProblem | SubtractProblem | EquivalentProblem

export interface FractionsData {
  problems: FractionProblem[]
}

/* ---------- Generation (pure) ---------- */

const PROBLEM_KINDS = ['identify', 'shade', 'add', 'subtract', 'equivalent'] as const
type ProblemKind = (typeof PROBLEM_KINDS)[number]

interface EqPair {
  den: number
  k: number
}

/** All (base denominator, multiplier) pairs with both denominators ≤ maxDen. */
function equivalentPairs(maxDen: number): EqPair[] {
  const pairs: EqPair[] = []
  for (let den = 2; den * 2 <= maxDen; den++) {
    for (let k = 2; den * k <= maxDen; k++) {
      pairs.push({ den, k })
    }
  }
  return pairs
}

function makeProblem(kind: ProblemKind, maxDen: number, pairs: readonly EqPair[], rng: RNG): FractionProblem {
  switch (kind) {
    case 'identify': {
      const den = rng.int(2, maxDen)
      const num = rng.int(1, den - 1)
      return { kind, num, den }
    }
    case 'shade': {
      const den = rng.int(2, maxDen)
      const num = rng.int(1, den - 1)
      return { kind, num, den }
    }
    case 'add': {
      const den = rng.int(2, maxDen)
      const a = rng.int(1, den - 1)
      const b = rng.int(1, den - 1)
      const sumNum = a + b
      return { kind, a, b, den, sumNum, whole: Math.floor(sumNum / den), rem: sumNum % den }
    }
    case 'subtract': {
      const den = rng.int(2, maxDen)
      const a = rng.int(2, den)
      const b = rng.int(1, a - 1)
      return { kind, a, b, den, diff: a - b }
    }
    case 'equivalent': {
      const { den, k } = rng.pick(pairs)
      const baseNum = rng.int(1, den - 1)
      return { kind, baseNum, baseDen: den, k, bigDen: den * k, answerNum: baseNum * k }
    }
  }
}

function generate(params: FractionsParams, rng: RNG): FractionsData {
  const maxDen = params.maxDenominator
  const pairs = equivalentPairs(maxDen)
  if (params.mode === 'equivalent' && pairs.length === 0) {
    throw new Error('fractions: equivalent mode requires maxDenominator >= 4')
  }
  const kinds: readonly ProblemKind[] =
    pairs.length > 0 ? PROBLEM_KINDS : PROBLEM_KINDS.filter((k) => k !== 'equivalent')
  const problems: FractionProblem[] = []
  for (let i = 0; i < params.count; i++) {
    const kind: ProblemKind = params.mode === 'mixed' ? rng.pick(kinds) : params.mode
    problems.push(makeProblem(kind, maxDen, pairs, rng))
  }
  return { problems }
}

/* ---------- Rendering ---------- */

/** SVG pie-sector path for sector i of den equal sectors, starting at 12 o'clock. */
function sectorPath(den: number, i: number): string {
  const c = 50
  const r = 45
  const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / den
  const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / den
  const x0 = (c + r * Math.cos(a0)).toFixed(2)
  const y0 = (c + r * Math.sin(a0)).toFixed(2)
  const x1 = (c + r * Math.cos(a1)).toFixed(2)
  const y1 = (c + r * Math.sin(a1)).toFixed(2)
  return `M ${c} ${c} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`
}

/**
 * A circle divided into `den` equal sectors with the first `shaded` filled red
 * (like the fraction insets). In B&W mode --bead-1 goes black: shaded vs.
 * unshaded stays fully readable — no color-only information.
 */
function FractionCircle({ den, shaded, size }: { den: number; shaded: number; size: number }) {
  const sectors = []
  for (let i = 0; i < den; i++) {
    sectors.push(
      <path
        key={i}
        d={sectorPath(den, i)}
        fill={i < shaded ? 'var(--bead-1)' : 'none'}
        stroke="var(--ink-soft)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />,
    )
  }
  return (
    <svg
      className="fractions-circle"
      viewBox="0 0 100 100"
      style={{ width: `${size}in`, height: `${size}in` }}
      aria-hidden="true"
    >
      {sectors}
      <circle cx={50} cy={50} r={45} fill="none" stroke="var(--ink-soft)" strokeWidth={2.5} />
    </svg>
  )
}

/** Stacked fraction with a horizontal bar (how children write fractions). */
function Frac({ num, den }: { num: number; den: number }) {
  return (
    <span className="fractions-frac">
      <span className="fractions-num">{num}</span>
      <span className="fractions-den">{den}</span>
    </span>
  )
}

/** Empty stacked-fraction frame: bar with writing space above and below. */
function BlankFrac() {
  return (
    <span className="fractions-frac">
      <span className="fractions-num fractions-slot" />
      <span className="fractions-den fractions-slot" />
    </span>
  )
}

/** Fraction with a blank numerator over a printed denominator. */
function MissingNumFrac({ den }: { den: number }) {
  return (
    <span className="fractions-frac">
      <span className="fractions-num fractions-slot" />
      <span className="fractions-den">{den}</span>
    </span>
  )
}

function ProblemBody({ p }: { p: FractionProblem }) {
  switch (p.kind) {
    case 'identify':
      return (
        <span className="fractions-col">
          <FractionCircle den={p.den} shaded={p.num} size={0.85} />
          <BlankFrac />
        </span>
      )
    case 'shade':
      return (
        <span className="fractions-row">
          <Frac num={p.num} den={p.den} />
          <FractionCircle den={p.den} shaded={0} size={0.85} />
        </span>
      )
    case 'add':
      return (
        <span className="fractions-col fractions-col-left">
          <span className="fractions-row">
            <FractionCircle den={p.den} shaded={p.a} size={0.7} />
            <span className="fractions-op">+</span>
            <FractionCircle den={p.den} shaded={p.b} size={0.7} />
          </span>
          <span className="fractions-expr">
            <Frac num={p.a} den={p.den} />
            <span className="fractions-op">+</span>
            <Frac num={p.b} den={p.den} />
            <span className="fractions-op">=</span>
            <span className="fractions-ansbox" />
          </span>
        </span>
      )
    case 'subtract':
      return (
        <span className="fractions-col fractions-col-left">
          <FractionCircle den={p.den} shaded={p.a} size={0.7} />
          <span className="fractions-expr">
            <Frac num={p.a} den={p.den} />
            <span className="fractions-op">−</span>
            <Frac num={p.b} den={p.den} />
            <span className="fractions-op">=</span>
            <BlankFrac />
          </span>
        </span>
      )
    case 'equivalent':
      return (
        <span className="fractions-col fractions-col-left">
          <span className="fractions-row">
            <FractionCircle den={p.baseDen} shaded={p.baseNum} size={0.7} />
            <span className="fractions-op">=</span>
            <FractionCircle den={p.bigDen} shaded={p.answerNum} size={0.7} />
          </span>
          <span className="fractions-expr">
            <Frac num={p.baseNum} den={p.baseDen} />
            <span className="fractions-op">=</span>
            <MissingNumFrac den={p.bigDen} />
          </span>
        </span>
      )
  }
}

const MODE_TITLES: Record<FractionMode, string> = {
  identify: 'Name the Fraction',
  shade: 'Shade the Fraction',
  add: 'Fraction Addition',
  subtract: 'Fraction Subtraction',
  equivalent: 'Equivalent Fractions',
  mixed: 'Fractions Review',
}

const INSTRUCTIONS: Record<FractionMode, string> = {
  identify:
    'Count the shaded parts of each circle. Write the fraction: shaded parts on top, total parts on the bottom.',
  shade: 'Read each fraction. Shade that many parts of the circle.',
  add: 'Add the fractions. The pictures show each part. If the answer is more than one whole, write it as a mixed number.',
  subtract: 'Subtract the fractions. Use the picture to help you count the parts.',
  equivalent: 'The two circles show the same amount. Write the missing number on top to complete the equivalent fraction.',
  mixed: 'Read each problem carefully. Shade, write, or solve as each picture shows.',
}

/** Compact modes (one small picture each) fit 3 across; the rest get 2 columns. */
function layoutFor(mode: FractionMode): { cols: number; perPage: number } {
  return mode === 'identify' || mode === 'shade' ? { cols: 3, perPage: 12 } : { cols: 2, perPage: 8 }
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

function Sheet({ data, params }: SheetProps<FractionsParams, FractionsData>) {
  const { cols, perPage } = layoutFor(params.mode)
  const pages = chunk(data.problems, perPage)
  return (
    <>
      {pages.map((page, pi) => (
        <SheetPage key={pi} title={MODE_TITLES[params.mode]} instructions={INSTRUCTIONS[params.mode]}>
          <div className="problems-grid" style={{ '--cols': cols } as CSSProperties}>
            {page.map((p, i) => (
              <div key={i} className="problem fractions-problem">
                <span className="problem-number">{pi * perPage + i + 1}.</span>
                <ProblemBody p={p} />
              </div>
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function answerFor(p: FractionProblem): ReactNode {
  switch (p.kind) {
    case 'identify':
      return <Frac num={p.num} den={p.den} />
    case 'shade':
      return (
        <>
          {p.num} of {p.den} parts shaded
        </>
      )
    case 'add':
      if (p.whole >= 1) {
        return (
          <>
            <Frac num={p.sumNum} den={p.den} /> = <span className="fractions-whole">{p.whole}</span>
            {p.rem > 0 && <Frac num={p.rem} den={p.den} />}
          </>
        )
      }
      return <Frac num={p.sumNum} den={p.den} />
    case 'subtract':
      return <Frac num={p.diff} den={p.den} />
    case 'equivalent':
      return (
        <>
          <Frac num={p.baseNum} den={p.baseDen} /> = <Frac num={p.answerNum} den={p.bigDen} />
        </>
      )
  }
}

function AnswerKey({ data, params }: SheetProps<FractionsParams, FractionsData>) {
  return (
    <AnswerKeyPage title={MODE_TITLES[params.mode]}>
      <ol className="answer-list fractions-key">
        {data.problems.map((p, i) => (
          <li key={i}>
            <span className="problem-number">{i + 1}.</span> {answerFor(p)}
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------- Definition ---------- */

export const def: GeneratorDef<FractionsParams, FractionsData> = {
  slug: 'fractions',
  name: 'Fractions',
  description:
    'Circle-picture fraction practice: naming, shading, same-denominator addition and subtraction, and equivalent fractions.',
  strand: 'fractions',
  ages: [6, 10],
  schema: [
    {
      kind: 'select',
      key: 'mode',
      label: 'Problem type',
      options: [
        { value: 'identify', label: 'Name the fraction (picture → fraction)' },
        { value: 'shade', label: 'Shade the circle (fraction → picture)' },
        { value: 'add', label: 'Addition (same denominator)' },
        { value: 'subtract', label: 'Subtraction (same denominator)' },
        { value: 'equivalent', label: 'Equivalent fractions' },
        { value: 'mixed', label: 'Mixed review' },
      ],
    },
    {
      kind: 'number',
      key: 'maxDenominator',
      label: 'Largest denominator',
      min: 4,
      max: 10,
      help: 'The fraction circles go from halves up to tenths.',
    },
    { kind: 'number', key: 'count', label: 'Number of problems', min: 6, max: 12 },
  ],
  defaults: { mode: 'identify', maxDenominator: 8, count: 8 },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'name-the-fraction',
      name: 'Name the fraction',
      description: 'After the fraction circles introduction: count the shaded parts and write the fraction, halves through tenths.',
      params: { mode: 'identify', maxDenominator: 10, count: 12 },
    },
    {
      id: 'same-family-sums',
      name: 'Same-family sums',
      description: 'After the fraction addition lesson: add fractions in the same family (same denominator), up to eighths.',
      params: { mode: 'add', maxDenominator: 8, count: 8 },
    },
  ],
}
