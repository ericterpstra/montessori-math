/**
 * Long division worksheet generator.
 *
 * Two printed formats: the classic long-division bracket (room to work
 * underneath) and the racks & tubes recording sheet — a small place-value
 * table per problem with colored/lettered column headers, a quotient row,
 * and empty working rows, like the paper used alongside the material.
 */
import type { CSSProperties } from 'react'
import type { GeneratorDef, SheetProps } from '../types'
import type { RNG } from '../../lib/rng'
import type { PlacePower } from '../../lib/placeValue'
import { formatNumber, placeInfo } from '../../lib/placeValue'
import { SheetPage, AnswerKeyPage } from '../SheetPage'
import './long-division.css'

export interface LongDivisionParams extends Record<string, number | string | boolean> {
  /** Digits in the dividend, 2–4. */
  dividendDigits: number
  /** Digits in the divisor, 1 (2–9) or 2 (11–99). */
  divisorDigits: number
  /** When false, every problem divides exactly (remainder 0). */
  remainders: boolean
  count: number
  format: 'bracket' | 'recording'
}

export interface DivisionProblem {
  dividend: number
  divisor: number
  quotient: number
  remainder: number
}

export interface LongDivisionData {
  problems: DivisionProblem[]
}

/** Divisor 1 is never used — dividing by one teaches nothing here. */
function makeDivisor(divisorDigits: number, rng: RNG): number {
  if (divisorDigits <= 1) return rng.int(2, 9)
  // Two-digit divisors: a round ten half the time (the gentler first step),
  // otherwise any two-digit divisor that is not a multiple of ten.
  if (rng.bool()) return rng.int(2, 9) * 10
  return rng.int(1, 9) * 10 + rng.int(1, 9)
}

function generate(params: LongDivisionParams, rng: RNG): LongDivisionData {
  const lo = 10 ** (params.dividendDigits - 1)
  const hi = 10 ** params.dividendDigits - 1
  const problems: DivisionProblem[] = []
  for (let i = 0; i < params.count; i++) {
    const divisor = makeDivisor(params.divisorDigits, rng)
    let dividend: number
    if (params.remainders) {
      // Dividend keeps its digit count and is never below the divisor,
      // so the quotient is always at least 1.
      dividend = rng.int(Math.max(lo, divisor), hi)
    } else {
      // Build the dividend as divisor × quotient so it divides exactly,
      // choosing the quotient so the dividend keeps its digit count.
      const qMin = Math.ceil(lo / divisor)
      const qMax = Math.floor(hi / divisor)
      dividend = divisor * rng.int(qMin, qMax)
    }
    const quotient = Math.floor(dividend / divisor)
    problems.push({ dividend, divisor, quotient, remainder: dividend - quotient * divisor })
  }
  return { problems }
}

/* ---------------------------------------------------------------- render */

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function BracketProblem({ n, problem }: { n: number; problem: DivisionProblem }) {
  return (
    <div className="problem long-division-problem">
      <span className="problem-number">{n}.</span>
      <div className="long-division-bracket">
        <div className="long-division-quotient-space" />
        <div className="long-division-body">
          <span className="long-division-divisor">{formatNumber(problem.divisor)}</span>
          <span className="long-division-dividend">{formatNumber(problem.dividend)}</span>
        </div>
        <div className="long-division-work" />
      </div>
    </div>
  )
}

/** Conventional Montessori column letters for whole-number places. */
const PLACE_LETTERS: Record<number, string> = { 0: 'U', 1: 'T', 2: 'H', 3: 'Th' }

function RecordingProblem({
  n,
  problem,
  params,
}: {
  n: number
  problem: DivisionProblem
  params: LongDivisionParams
}) {
  const powers: PlacePower[] = []
  for (let p = params.dividendDigits - 1; p >= 0; p--) powers.push(p as PlacePower)
  const digits = String(problem.dividend).split('').map(Number)
  const workRows = params.dividendDigits + 2
  return (
    <div className="problem long-division-problem">
      <div className="long-division-eq">
        <span className="problem-number">{n}.</span> {formatNumber(problem.dividend)} ÷{' '}
        {formatNumber(problem.divisor)} = <span className="write-line long-division-answer-line" />
        {params.remainders && (
          <>
            {' '}
            R <span className="write-line" />
          </>
        )}
      </div>
      <table className="long-division-table">
        <thead>
          <tr>
            <th className="long-division-row-label" />
            {powers.map((p) => {
              const info = placeInfo(p)
              return (
                <th
                  key={p}
                  className="long-division-place-head"
                  style={{ color: info.colorVar } as CSSProperties}
                  title={info.name}
                >
                  {PLACE_LETTERS[p]}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="long-division-row-label" scope="row">
              quotient
            </th>
            {powers.map((p) => (
              <td key={p} />
            ))}
          </tr>
          <tr>
            <th className="long-division-row-label" scope="row">
              dividend
            </th>
            {digits.map((d, i) => (
              <td key={i} className="long-division-given">
                {d}
              </td>
            ))}
          </tr>
          {Array.from({ length: workRows }, (_, r) => (
            <tr key={r}>
              <th className="long-division-row-label" scope="row">
                {r === 0 ? 'work' : ''}
              </th>
              {powers.map((p) => (
                <td key={p} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Sheet({ data, params }: SheetProps<LongDivisionParams, LongDivisionData>) {
  const recording = params.format === 'recording'
  const perPage = recording ? 4 : 6
  const pages = chunk(data.problems, perPage)
  const remainderNote = params.remainders
    ? ' If something is left over, write it as the remainder.'
    : ' Every problem comes out even.'
  const instructions = recording
    ? `Divide just as you would with the racks and tubes: share out the largest place first, exchange what is left, and record each step in the working rows. Write the quotient in the top row.${remainderNote}`
    : `Divide. Write the quotient above the bar and show your work underneath.${remainderNote}`
  return (
    <>
      {pages.map((problems, pageIndex) => (
        <SheetPage key={pageIndex} title="Long Division" instructions={instructions}>
          <div className="problems-grid" style={{ '--cols': 2 } as CSSProperties}>
            {problems.map((problem, i) => {
              const n = pageIndex * perPage + i + 1
              return recording ? (
                <RecordingProblem key={n} n={n} problem={problem} params={params} />
              ) : (
                <BracketProblem key={n} n={n} problem={problem} />
              )
            })}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function AnswerKey({ data }: SheetProps<LongDivisionParams, LongDivisionData>) {
  return (
    <AnswerKeyPage title="Long Division">
      <ol className="answer-list" style={{ columns: 2 }}>
        {data.problems.map((p, i) => (
          <li key={i}>
            <span className="problem-number">{i + 1}.</span> {formatNumber(p.dividend)} ÷ {formatNumber(p.divisor)} ={' '}
            {formatNumber(p.quotient)}
            {p.remainder > 0 && <> R {p.remainder}</>}
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ------------------------------------------------------------------ def */

export const def: GeneratorDef<LongDivisionParams, LongDivisionData> = {
  slug: 'long-division',
  name: 'Long Division',
  description:
    'Long division practice in the classic bracket layout or the racks & tubes recording format, with or without remainders.',
  strand: 'abstraction',
  ages: [8, 11],
  schema: [
    { kind: 'number', key: 'count', label: 'Problems', min: 4, max: 10 },
    {
      kind: 'number',
      key: 'dividendDigits',
      label: 'Dividend digits',
      min: 2,
      max: 4,
      help: 'How large the number being divided is (2–4 digits).',
    },
    {
      kind: 'number',
      key: 'divisorDigits',
      label: 'Divisor digits',
      min: 1,
      max: 2,
      help: '1 gives divisors 2–9; 2 gives divisors 11–99.',
    },
    {
      kind: 'boolean',
      key: 'remainders',
      label: 'Allow remainders',
      help: 'Off: every problem divides exactly.',
    },
    {
      kind: 'select',
      key: 'format',
      label: 'Format',
      options: [
        { value: 'bracket', label: 'Long-division bracket' },
        { value: 'recording', label: 'Racks & tubes recording sheet' },
      ],
      help: 'The recording sheet mirrors the paper used with the racks & tubes material.',
    },
  ],
  defaults: {
    dividendDigits: 4,
    divisorDigits: 1,
    remainders: true,
    count: 6,
    format: 'bracket',
  },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'first-long-division',
      name: 'First long division',
      description:
        'After the first racks & tubes presentation: 4-digit dividends, one-digit divisors, no remainders, on the place-value recording sheet.',
      params: { dividendDigits: 4, divisorDigits: 1, remainders: false, count: 4, format: 'recording' },
    },
    {
      id: 'two-digit-divisors',
      name: 'Two-digit divisors',
      description:
        'For the move to full abstraction: 4-digit dividends and two-digit divisors with remainders, in the classic bracket layout.',
      params: { dividendDigits: 4, divisorDigits: 2, remainders: true, count: 6, format: 'bracket' },
    },
  ],
}
