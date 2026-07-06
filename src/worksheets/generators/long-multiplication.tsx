/**
 * Long multiplication worksheet — checkerboard follow-up work (passage to
 * abstraction).
 *
 * Stacked multi-digit × 1–2-digit problems in the standard written form.
 * Two optional supports mirror the checkerboard material:
 *  - scaffold: one labeled partial-product line per multiplier digit
 *    ('× units', '× tens') plus the addition rule — training wheels for
 *    the written algorithm
 *  - placeColors: small u/t/h column-head letters colored like the
 *    checkerboard's place values (letters stay readable in B&W)
 */
import type { CSSProperties, ReactNode } from 'react'
import type { RNG } from '../../lib/rng'
import type { GeneratorDef, SheetProps } from '../types'
import { SheetPage, AnswerKeyPage } from '../SheetPage'
import { formatNumber, placeInfo } from '../../lib/placeValue'
import type { PlacePower } from '../../lib/placeValue'
import './long-multiplication.css'

export type LongMultiplicationParams = {
  multiplicandDigits: number
  multiplierDigits: number
  count: number
  scaffold: boolean
  placeColors: boolean
}

export interface PartialProduct {
  /** Place of the multiplier digit: 0 = units, 1 = tens. */
  place: number
  /** The multiplier digit at that place. */
  digit: number
  /** multiplicand × digit × 10^place. */
  value: number
}

export interface LongMultiplicationProblem {
  multiplicand: number
  multiplier: number
  /** One entry per multiplier digit, units place first. */
  partialProducts: PartialProduct[]
  product: number
}

export interface LongMultiplicationData {
  problems: LongMultiplicationProblem[]
}

/**
 * A 2-digit multiplier ending in 0 makes the units partial-product line
 * degenerate (all zeros), so the RNG only allows it this often.
 */
export const ZERO_UNITS_RATE = 0.2

function clampInt(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, Math.round(n)))
}

/** Uniform random integer with exactly `digits` digits (no leading zero). */
function withDigits(digits: number, rng: RNG): number {
  let n = rng.int(1, 9)
  for (let i = 1; i < digits; i++) n = n * 10 + rng.int(0, 9)
  return n
}

function generate(params: LongMultiplicationParams, rng: RNG): LongMultiplicationData {
  const multiplicandDigits = clampInt(params.multiplicandDigits, 2, 4)
  const multiplierDigits = clampInt(params.multiplierDigits, 1, 2)
  const count = clampInt(params.count, 4, 10)

  const problems: LongMultiplicationProblem[] = []
  for (let i = 0; i < count; i++) {
    const multiplicand = withDigits(multiplicandDigits, rng)

    let multiplier: number
    if (multiplierDigits === 1) {
      multiplier = rng.int(2, 9)
    } else {
      const tens = rng.int(1, 9)
      const units = rng.bool(ZERO_UNITS_RATE) ? 0 : rng.int(1, 9)
      multiplier = tens * 10 + units
    }

    const partialProducts: PartialProduct[] = []
    for (let place = 0, rest = multiplier; rest > 0; place++, rest = Math.floor(rest / 10)) {
      const digit = rest % 10
      partialProducts.push({ place, digit, value: multiplicand * digit * 10 ** place })
    }

    problems.push({ multiplicand, multiplier, partialProducts, product: multiplicand * multiplier })
  }

  return { problems }
}

/* ---------- rendering ---------- */

const TITLE = 'Long Multiplication'

/** Scaffold-line labels by multiplier-digit place. */
const PLACE_WORDS = ['units', 'tens', 'hundreds', 'thousands'] as const

/** Column-head letters repeat per family, as the checkerboard colors do. */
const FAMILY_LETTERS = ['u', 't', 'h'] as const

/** Printed width in characters of a d-digit number with comma grouping. */
function charWidth(digits: number): number {
  return digits + Math.floor((digits - 1) / 3)
}

function colStyle(cols: number): CSSProperties {
  return { '--cols': cols } as CSSProperties
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Checkerboard-colored column heads: one small letter per digit column of
 * the widest possible product, right-aligned over the digits, with an empty
 * cell where the comma falls. The letters themselves carry the place, so
 * nothing is lost in B&W.
 */
function HeadRow({ digits }: { digits: number }) {
  const cells: ReactNode[] = []
  for (let p = digits - 1; p >= 0; p--) {
    const info = placeInfo(p as PlacePower)
    cells.push(
      <span key={`d${p}`} className="long-multiplication-head-cell">
        <span className="long-multiplication-head-letter" style={{ color: info.colorVar }}>
          {FAMILY_LETTERS[p % 3]}
        </span>
      </span>,
    )
    if (p > 0 && p % 3 === 0) {
      cells.push(<span key={`c${p}`} className="long-multiplication-head-cell" aria-hidden="true" />)
    }
  }
  return <span className="long-multiplication-head-row">{cells}</span>
}

function ProblemBlock({
  problem,
  number,
  params,
}: {
  problem: LongMultiplicationProblem
  number: number
  params: LongMultiplicationParams
}) {
  // With a 1-digit multiplier the single partial product IS the product,
  // so the scaffold would just have the child write the answer twice.
  const scaffolded = params.scaffold && problem.partialProducts.length > 1
  const answerChars = charWidth(params.multiplicandDigits + params.multiplierDigits)

  return (
    <div className="problem long-multiplication-problem">
      <span className="problem-number">{number}.</span>
      <span className="vertical-op">
        {params.placeColors && (
          <HeadRow digits={params.multiplicandDigits + params.multiplierDigits} />
        )}
        <span className="op-row">{formatNumber(problem.multiplicand)}</span>
        <span className="op-row">× {formatNumber(problem.multiplier)}</span>
        <span className="op-rule" />
        {scaffolded ? (
          <>
            {problem.partialProducts.map((pp) => (
              <span key={pp.place} className="op-row long-multiplication-partial">
                <span className="long-multiplication-partial-label">× {PLACE_WORDS[pp.place]}</span>
                <span
                  className="long-multiplication-partial-space"
                  style={{ width: `${answerChars}ch` }}
                />
              </span>
            ))}
            <span className="op-rule" />
            <span className="op-answer-space" style={{ minWidth: `${answerChars}ch` }} />
          </>
        ) : (
          <span className="op-answer-space" style={{ minWidth: `${answerChars}ch` }} />
        )}
      </span>
    </div>
  )
}

/** Scaffolded problems are tall; give them fewer per page and wider cells. */
function pageShape(params: LongMultiplicationParams): { perPage: number; cols: number } {
  const scaffolded = params.scaffold && params.multiplierDigits > 1
  return scaffolded ? { perPage: 6, cols: 2 } : { perPage: 10, cols: 3 }
}

function Sheet({ data, params }: SheetProps<LongMultiplicationParams, LongMultiplicationData>) {
  const scaffolded = params.scaffold && params.multiplierDigits > 1
  const { perPage, cols } = pageShape(params)
  const pages = chunk(data.problems, perPage)

  let instructions = scaffolded
    ? 'Multiply. Write one partial product on each line — start with the units — then add the lines to find the product.'
    : 'Multiply. Show your work.'
  if (params.placeColors) {
    instructions +=
      ' The small letters mark the unit (u), ten (t), and hundred (h) columns, as on the checkerboard.'
  }

  return (
    <>
      {pages.map((page, pi) => (
        <SheetPage key={pi} title={TITLE} instructions={instructions}>
          <div className="problems-grid" style={colStyle(cols)}>
            {page.map((problem, i) => (
              <ProblemBlock
                key={pi * perPage + i}
                problem={problem}
                number={pi * perPage + i + 1}
                params={params}
              />
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function AnswerKey({ data }: SheetProps<LongMultiplicationParams, LongMultiplicationData>) {
  return (
    <AnswerKeyPage title={TITLE}>
      <ol className="answer-list long-multiplication-key">
        {data.problems.map((p, i) => (
          <li key={i}>
            {i + 1}. {formatNumber(p.multiplicand)} × {formatNumber(p.multiplier)} ={' '}
            <strong>{formatNumber(p.product)}</strong>
            {p.partialProducts.length > 1 && (
              <span className="long-multiplication-key-partials">
                {p.partialProducts.map((pp) => formatNumber(pp.value)).join(' + ')}
              </span>
            )}
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------- definition ---------- */

export const def: GeneratorDef<LongMultiplicationParams, LongMultiplicationData> = {
  slug: 'long-multiplication',
  name: 'Long Multiplication',
  description:
    'Multi-digit multiplication in written form, with an optional partial-product scaffold and checkerboard place colors for the child moving off the material.',
  strand: 'abstraction',
  ages: [7, 11],
  schema: [
    {
      kind: 'number',
      key: 'multiplicandDigits',
      label: 'Digits in the top number',
      min: 2,
      max: 4,
      step: 1,
    },
    {
      kind: 'number',
      key: 'multiplierDigits',
      label: 'Digits in the multiplier',
      min: 1,
      max: 2,
      step: 1,
      help: 'The bottom number. Two digits gives one partial product per digit, as on the checkerboard.',
    },
    { kind: 'number', key: 'count', label: 'Problems', min: 4, max: 10, step: 1 },
    {
      kind: 'boolean',
      key: 'scaffold',
      label: 'Partial-product scaffold',
      help: 'Prints a labeled line for each multiplier digit plus the addition rule — training wheels for the algorithm. Applies with a 2-digit multiplier.',
    },
    {
      kind: 'boolean',
      key: 'placeColors',
      label: 'Checkerboard place colors',
      help: 'Colors small column letters (u, t, h) like the checkerboard place values. The letters stay readable in black & white.',
    },
  ],
  defaults: { multiplicandDigits: 3, multiplierDigits: 2, count: 6, scaffold: true, placeColors: true },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'checkerboard-follow-up',
      name: 'Checkerboard follow-up',
      description:
        'After multiplication on the checkerboard — 3-digit × 2-digit with the partial-product scaffold and checkerboard place colors.',
      params: { multiplicandDigits: 3, multiplierDigits: 2, count: 6, scaffold: true, placeColors: true },
    },
    {
      id: 'toward-abstraction',
      name: 'Toward abstraction',
      description:
        'For the child leaving the material behind — 4-digit × 2-digit with no scaffold, worked entirely on paper.',
      params: { multiplicandDigits: 4, multiplierDigits: 2, count: 8, scaffold: false, placeColors: false },
    },
  ],
}
