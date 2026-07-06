/**
 * Place value & expanded form worksheet generator.
 *
 * Three problem kinds, drawn from the decimal-system work with golden beads
 * and number cards:
 *  - expand:  3,251 = ____ + ____ + ____ + ____   (write the expanded form)
 *  - compose: 3,000 + 200 + 50 + 1 = ____          (write the number)
 *  - digits:  what is the underlined digit worth?  (3,2̲51 → the 2 is worth 200)
 *
 * Expanded forms always skip zero places (4,053 = 4,000 + 50 + 3), and the
 * underlined digit is always a non-zero digit.
 */

import type { CSSProperties } from 'react'
import type { GeneratorDef, ParamField, SheetProps, WorksheetPreset } from '../types'
import type { RNG } from '../../lib/rng'
import type { PlacePower } from '../../lib/placeValue'
import { decompose, formatNumber, placeInfo } from '../../lib/placeValue'
import { SheetPage, AnswerKeyPage } from '../SheetPage'
import './place-value.css'

/* ---------- Types ---------- */

export type PlaceValueMode = 'expand' | 'compose' | 'digits' | 'mixed'
export type PlaceValueMax = '99' | '999' | '9999'
export type PlaceValueProblemKind = Exclude<PlaceValueMode, 'mixed'>

export type PlaceValueParams = {
  mode: PlaceValueMode
  max: PlaceValueMax
  count: number
}

interface ProblemBase {
  /** The whole number, e.g. 4053. Always has ≥ 2 non-zero digits. */
  value: number
  /** Non-zero place-value parts, largest first: 4,053 → [4000, 50, 3]. */
  parts: number[]
  /** Computed answer: `value` for expand/compose, digit × place value for digits. */
  answer: number
}

export interface ExpandProblem extends ProblemBase {
  kind: 'expand'
}

export interface ComposeProblem extends ProblemBase {
  kind: 'compose'
}

export interface DigitsProblem extends ProblemBase {
  kind: 'digits'
  /** Place of the underlined digit (0 = units … 3 = thousands). */
  underlinePower: PlacePower
  /** The underlined digit itself; never 0. */
  underlineDigit: number
}

export type PlaceValueProblem = ExpandProblem | ComposeProblem | DigitsProblem

export interface PlaceValueData {
  problems: PlaceValueProblem[]
}

/* ---------- Generation (pure) ---------- */

const KINDS: readonly PlaceValueProblemKind[] = ['expand', 'compose', 'digits']

/**
 * A number with `2..maxDigits` digits and at least two non-zero digits, so
 * expansions and compositions always have ≥ 2 parts (never the trivial
 * "300 = 300").
 */
function makeValue(rng: RNG, maxDigits: number): number {
  const numDigits = rng.int(2, maxDigits)
  const digits: number[] = [rng.int(1, 9)]
  for (let i = 1; i < numDigits; i++) digits.push(rng.int(0, 9))
  if (digits.slice(1).every((d) => d === 0)) {
    digits[rng.int(1, numDigits - 1)] = rng.int(1, 9)
  }
  return digits.reduce((acc, d) => acc * 10 + d, 0)
}

export function generate(params: PlaceValueParams, rng: RNG): PlaceValueData {
  const maxDigits = params.max.length
  const used = new Set<number>()
  const problems: PlaceValueProblem[] = []

  for (let i = 0; i < params.count; i++) {
    const kind: PlaceValueProblemKind = params.mode === 'mixed' ? rng.pick(KINDS) : params.mode

    let value = makeValue(rng, maxDigits)
    for (let tries = 0; used.has(value) && tries < 20; tries++) value = makeValue(rng, maxDigits)
    used.add(value)

    const nonzero = decompose(value).filter((d) => d.digit > 0)
    const parts = nonzero.map((d) => d.digit * placeInfo(d.power).value)

    if (kind === 'digits') {
      const target = rng.pick(nonzero)
      problems.push({
        kind,
        value,
        parts,
        underlinePower: target.power,
        underlineDigit: target.digit,
        answer: target.digit * placeInfo(target.power).value,
      })
    } else {
      problems.push({ kind, value, parts, answer: value })
    }
  }

  return { problems }
}

/* ---------- Rendering ---------- */

const TITLE = 'Place Value & Expanded Form'
const PER_PAGE = 16

const INSTRUCTIONS: Record<PlaceValueMode, string> = {
  expand: 'Stretch each number into expanded form — one place value on each blank. Example: 4,053 = 4,000 + 50 + 3.',
  compose: 'Add the place values together and write the number they make. Example: 4,000 + 50 + 3 = 4,053.',
  digits: 'Write what the underlined digit is worth. Example: in 425, the underlined 2 is worth 20.',
  mixed:
    'Three kinds of problems: stretch numbers into expanded form, put place values back together, and write what each underlined digit is worth.',
}

function chunkPages<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size))
  return pages
}

/** The number with US commas and one digit underlined (shape, not color — B&W safe). */
function NumberWithUnderline({ value, power }: { value: number; power: PlacePower }) {
  const digits = decompose(value)
  return (
    <span>
      {digits.map((d, i) => (
        <span key={d.power}>
          {d.power === power ? <span className="place-value-under">{d.digit}</span> : d.digit}
          {d.power > 0 && d.power % 3 === 0 && i < digits.length - 1 ? ',' : ''}
        </span>
      ))}
    </span>
  )
}

function ProblemView({ n, problem }: { n: number; problem: PlaceValueProblem }) {
  return (
    <div className="problem">
      <div className="place-value-prompt">
        <span className="problem-number">{n}.</span>
        {problem.kind === 'expand' && <>{formatNumber(problem.value)} =</>}
        {problem.kind === 'compose' && <>{problem.parts.map(formatNumber).join(' + ')} =</>}
        {problem.kind === 'digits' && <NumberWithUnderline value={problem.value} power={problem.underlinePower} />}
      </div>
      <div className="place-value-work">
        {problem.kind === 'expand' &&
          problem.parts.map((_, i) => (
            <span key={i}>
              {i > 0 && ' + '}
              <span className="write-line place-value-blank-part" />
            </span>
          ))}
        {problem.kind === 'compose' && <span className="write-line place-value-blank-number" />}
        {problem.kind === 'digits' && (
          <>
            the <span className="place-value-under">{problem.underlineDigit}</span> is worth{' '}
            <span className="write-line place-value-blank-value" />
          </>
        )}
      </div>
    </div>
  )
}

function Sheet({ data, params }: SheetProps<PlaceValueParams, PlaceValueData>) {
  const pages = chunkPages(data.problems, PER_PAGE)
  return (
    <>
      {pages.map((page, p) => (
        <SheetPage key={p} title={TITLE} instructions={INSTRUCTIONS[params.mode]}>
          <div className="problems-grid place-value-grid" style={{ '--cols': 2 } as CSSProperties}>
            {page.map((problem, i) => (
              <ProblemView key={i} n={p * PER_PAGE + i + 1} problem={problem} />
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function answerText(p: PlaceValueProblem): string {
  switch (p.kind) {
    case 'expand':
      return `${formatNumber(p.value)} = ${p.parts.map(formatNumber).join(' + ')}`
    case 'compose':
      return formatNumber(p.value)
    case 'digits': {
      const info = placeInfo(p.underlinePower)
      const placeName = p.underlineDigit === 1 ? info.singular : info.name
      return `${formatNumber(p.answer)} (${p.underlineDigit} ${placeName})`
    }
  }
}

function AnswerKey({ data }: SheetProps<PlaceValueParams, PlaceValueData>) {
  return (
    <AnswerKeyPage title={TITLE}>
      <ol className="answer-list place-value-key">
        {data.problems.map((p, i) => (
          <li key={i}>
            <span className="problem-number">{i + 1}.</span> {answerText(p)}
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------- Definition ---------- */

const schema: ParamField[] = [
  {
    kind: 'select',
    key: 'mode',
    label: 'Problem type',
    options: [
      { value: 'expand', label: 'Expanded form (3,251 = 3,000 + …)' },
      { value: 'compose', label: 'Compose (3,000 + … = ?)' },
      { value: 'digits', label: 'Value of the underlined digit' },
      { value: 'mixed', label: 'Mixed practice' },
    ],
    help: 'Expanded form stretches a number out; compose puts it back together.',
  },
  {
    kind: 'select',
    key: 'max',
    label: 'Numbers up to',
    options: [
      { value: '99', label: '99 — tens' },
      { value: '999', label: '999 — hundreds' },
      { value: '9999', label: '9,999 — thousands' },
    ],
  },
  { kind: 'number', key: 'count', label: 'Number of problems', min: 8, max: 20 },
]

const presets: WorksheetPreset[] = [
  {
    id: 'first-expansions',
    name: 'First expansions',
    description:
      'After forming quantities with the golden beads: stretch two- and three-digit numbers into expanded form.',
    params: { mode: 'expand', max: '999', count: 10 },
  },
  {
    id: 'digit-detective',
    name: 'Digit detective',
    description:
      "After the bird's-eye view with the large number cards: write what each underlined digit is worth, up to 9,999.",
    params: { mode: 'digits', max: '9999', count: 12 },
  },
]

export const def: GeneratorDef<PlaceValueParams, PlaceValueData> = {
  slug: 'place-value',
  name: TITLE,
  description:
    'Stretch numbers into expanded form, compose them back together, and name the value of underlined digits.',
  strand: 'decimal-system',
  ages: [5, 8],
  schema,
  defaults: { mode: 'mixed', max: '9999', count: 12 },
  generate,
  Sheet,
  AnswerKey,
  presets,
}
