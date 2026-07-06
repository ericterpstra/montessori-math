import { Fragment } from 'react'
import type { CSSProperties } from 'react'
import type { RNG } from '../../lib/rng'
import type { PlacePower } from '../../lib/placeValue'
import { formatNumber, placeInfo } from '../../lib/placeValue'
import type { GeneratorDef, SheetProps } from '../types'
import { AnswerKeyPage, SheetPage } from '../SheetPage'
import './decimals.css'

/* ------------------------------------------------------------------
   Decimal fractions practice — tenths, hundredths, thousandths.
   ALL arithmetic is done on integers scaled by 1,000 (the same trick
   as src/lib/placeValue.ts), so 0.1 + 0.2 is exactly 0.3 — never
   0.30000000000000004. Pure generation: every random choice goes
   through the injected RNG.
   ------------------------------------------------------------------ */

export type DecimalsMode = 'value' | 'expanded' | 'compare' | 'order' | 'add' | 'subtract' | 'mixed'
export type DecimalKind = Exclude<DecimalsMode, 'mixed'>

export type DecimalsParams = {
  mode: DecimalsMode
  /** How many decimal places the numbers go to: 1 = tenths … 3 = thousandths. */
  places: number
  count: number
}

/** A decimal number as an exact scaled integer plus how it is printed. */
export interface DecimalValue {
  /** The number × 1,000 (exact integer — all math happens here). */
  scaled: number
  /** How many digits are shown after the point (0.50 vs 0.5). */
  displayPlaces: number
  /** The exact string printed on the sheet. */
  text: string
}

export interface ValueProblem {
  kind: 'value'
  index: number
  value: DecimalValue
  /** The place of the underlined digit (−1 tenths … −3 thousandths). */
  underlinePower: PlacePower
  /** Character position of the underlined digit inside `value.text`. */
  underlineIndex: number
  digit: number
  answerScaled: number
  /** e.g. '0.07' */
  answerText: string
  /** e.g. '7 hundredths' */
  answerWords: string
}

export interface ExpandedPart {
  power: PlacePower
  digit: number
  /** e.g. '0.05' */
  text: string
}

export interface ExpandedProblem {
  kind: 'expanded'
  index: number
  value: DecimalValue
  parts: ExpandedPart[]
  /** e.g. '4 + 0.2 + 0.05 + 0.003' */
  answerText: string
}

export interface CompareProblem {
  kind: 'compare'
  index: number
  a: DecimalValue
  b: DecimalValue
  answer: '<' | '=' | '>'
  /** True when the pair is engineered so the SHORTER decimal is the LARGER one (0.3 vs 0.25). */
  misconception: boolean
}

export interface OrderProblem {
  kind: 'order'
  index: number
  /** As printed on the sheet (never already in ascending order). */
  items: DecimalValue[]
  /** Smallest → largest. */
  sorted: DecimalValue[]
  /** e.g. '0.204 < 0.24 < 0.3 < 0.42' */
  answerText: string
}

export interface OpProblem {
  kind: 'add' | 'subtract'
  index: number
  a: DecimalValue
  b: DecimalValue
  /** Monospace lines padded with spaces so the decimal points line up. */
  rows: [string, string]
  answerScaled: number
  answerText: string
}

export type DecimalProblem = ValueProblem | ExpandedProblem | CompareProblem | OrderProblem | OpProblem

export interface DecimalsData {
  problems: DecimalProblem[]
}

/* ---------------- exact scaled-integer helpers ---------------- */

/** Scaled value of one unit of a place: 10^(3+power) — tenths → 100, thousandths → 1. */
function placeScaled(power: PlacePower): number {
  return 10 ** (3 + power)
}

function digitAt(scaled: number, power: PlacePower): number {
  return Math.floor(scaled / placeScaled(power)) % 10
}

/** Print a scaled integer with a fixed number of decimal places ('0.50' when places = 2). */
export function formatScaled(scaled: number, places: number): string {
  const whole = Math.floor(scaled / 1000)
  if (places <= 0) return formatNumber(whole)
  const frac = String(scaled % 1000).padStart(3, '0').slice(0, places)
  return `${formatNumber(whole)}.${frac}`
}

/** Print a scaled integer with no trailing zeros — the exact, minimal answer form. */
export function formatScaledMin(scaled: number): string {
  const rem = scaled % 1000
  const places = rem === 0 ? 0 : rem % 100 === 0 ? 1 : rem % 10 === 0 ? 2 : 3
  return formatScaled(scaled, places)
}

function makeValue(scaled: number, displayPlaces: number): DecimalValue {
  return { scaled, displayPlaces, text: formatScaled(scaled, displayPlaces) }
}

/* ---------------- generation ---------------- */

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

/**
 * A random decimal: whole part 0–9 plus `d` decimal digits, the last of
 * which is never 0 (so the printed length is honest — no silent 0.30).
 */
function randomDecimal(rng: RNG, maxPlaces: number, exactPlaces?: number): DecimalValue {
  const d = exactPlaces ?? rng.int(1, maxPlaces)
  const whole = rng.int(0, 9)
  let frac = 0
  for (let i = 1; i <= d; i++) {
    const digit = i === d ? rng.int(1, 9) : rng.int(0, 9)
    frac += digit * 10 ** (3 - i)
  }
  return makeValue(whole * 1000 + frac, d)
}

function nonzeroDigits(scaled: number): number {
  let count = 0
  for (let n = scaled; n > 0; n = Math.floor(n / 10)) {
    if (n % 10 !== 0) count++
  }
  return count
}

function makeValueProblem(rng: RNG, places: number): ValueProblem {
  const value = randomDecimal(rng, places, places)
  const candidates: PlacePower[] = []
  for (let i = 1; i <= places; i++) {
    const power = -i as PlacePower
    if (digitAt(value.scaled, power) !== 0) candidates.push(power)
  }
  // Non-empty: the last decimal digit is never 0 by construction.
  const underlinePower = rng.pick(candidates)
  const digit = digitAt(value.scaled, underlinePower)
  const answerScaled = digit * placeScaled(underlinePower)
  const info = placeInfo(underlinePower)
  const wholeText = formatNumber(Math.floor(value.scaled / 1000))
  return {
    kind: 'value',
    index: 0,
    value,
    underlinePower,
    // text is `<whole>.<frac>`: the '.' sits at wholeText.length, tenths right after.
    underlineIndex: wholeText.length + -underlinePower,
    digit,
    answerScaled,
    answerText: formatScaledMin(answerScaled),
    answerWords: `${digit} ${digit === 1 ? info.singular : info.name}`,
  }
}

function makeExpandedProblem(rng: RNG, places: number): ExpandedProblem {
  let value = randomDecimal(rng, places, places)
  for (let t = 0; t < 60 && nonzeroDigits(value.scaled) < 2; t++) {
    value = randomDecimal(rng, places, places)
  }
  if (nonzeroDigits(value.scaled) < 2) {
    // Deterministic fallback (astronomically unlikely): 1 + one smallest-place unit.
    value = makeValue(1000 + 10 ** (3 - places), places)
  }
  const parts: ExpandedPart[] = []
  for (let i = 0; i <= places; i++) {
    const power = -i as PlacePower
    const digit = digitAt(value.scaled, power)
    if (digit > 0) parts.push({ power, digit, text: formatScaledMin(digit * placeScaled(power)) })
  }
  return {
    kind: 'expanded',
    index: 0,
    value,
    parts,
    answerText: parts.map((p) => p.text).join(' + '),
  }
}

/**
 * The classic trap: the number with FEWER decimal digits is the LARGER one
 * (0.3 vs 0.25) — a child comparing "25 > 3" gets it wrong; a child reading
 * tenths first gets it right.
 */
function makeMisconceptionPair(rng: RNG, places: number): { a: DecimalValue; b: DecimalValue } {
  const whole = rng.int(0, 9)
  const shortTenths = rng.int(2, 9)
  const dLong = places >= 3 ? rng.int(2, 3) : 2
  let frac = rng.int(1, shortTenths - 1) * 100
  for (let i = 2; i <= dLong; i++) {
    frac += (i === dLong ? rng.int(1, 9) : rng.int(0, 9)) * 10 ** (3 - i)
  }
  const short = makeValue(whole * 1000 + shortTenths * 100, 1)
  const long = makeValue(whole * 1000 + frac, dLong)
  return rng.bool() ? { a: short, b: long } : { a: long, b: short }
}

/** Equal values printed differently — 0.5 vs 0.50 (trailing zeros change nothing). */
function makeEqualPair(rng: RNG, places: number): { a: DecimalValue; b: DecimalValue } {
  const d = rng.int(1, places - 1)
  const base = randomDecimal(rng, places, d)
  const padded = makeValue(base.scaled, rng.int(d + 1, places))
  return rng.bool() ? { a: base, b: padded } : { a: padded, b: base }
}

function makePlainPair(rng: RNG, places: number): { a: DecimalValue; b: DecimalValue } {
  const a = randomDecimal(rng, places)
  let b = randomDecimal(rng, places)
  for (let t = 0; t < 30 && b.scaled === a.scaled; t++) b = randomDecimal(rng, places)
  if (b.scaled === a.scaled) b = makeValue(a.scaled + 10 ** (3 - places), places)
  return { a, b }
}

function makeCompareProblem(rng: RNG, places: number, engineered: boolean): CompareProblem {
  const misconception = engineered && places >= 2
  const pair = misconception
    ? makeMisconceptionPair(rng, places)
    : places >= 2 && rng.bool(0.15)
      ? makeEqualPair(rng, places)
      : makePlainPair(rng, places)
  const answer = pair.a.scaled < pair.b.scaled ? '<' : pair.a.scaled > pair.b.scaled ? '>' : '='
  return { kind: 'compare', index: 0, a: pair.a, b: pair.b, answer, misconception }
}

function makeOrderProblem(rng: RNG, places: number): OrderProblem {
  let items: DecimalValue[] = []
  for (let t = 0; t < 60; t++) {
    // Mixed printed lengths (when places allows) make the ordering worth doing.
    const ds =
      places === 1 ? [1, 1, 1, 1] : rng.shuffle([1, places, rng.int(1, places), rng.int(1, places)])
    items = ds.map((d) => randomDecimal(rng, places, d))
    if (new Set(items.map((v) => v.scaled)).size === 4) break
  }
  // Deterministic fallback dedupe (bump by one smallest displayed unit).
  const seen = new Set<number>()
  items = items.map((v) => {
    let s = v.scaled
    while (seen.has(s)) s += 10 ** (3 - v.displayPlaces)
    seen.add(s)
    return s === v.scaled ? v : makeValue(s, v.displayPlaces)
  })
  const sorted = [...items].sort((x, y) => x.scaled - y.scaled)
  if (items.every((v, i) => v.scaled === sorted[i].scaled)) {
    // Never hand out an already-solved problem.
    ;[items[0], items[3]] = [items[3], items[0]]
  }
  return {
    kind: 'order',
    index: 0,
    items,
    sorted,
    answerText: sorted.map((v) => v.text).join(' < '),
  }
}

/** Space-padded monospace rows that line up on the decimal point — no fake trailing zeros. */
function opRows(a: DecimalValue, b: DecimalValue, op: '+' | '−'): [string, string] {
  const [aInt, aFrac] = a.text.split('.')
  const [bInt, bFrac] = b.text.split('.')
  const intW = Math.max(aInt.length, bInt.length)
  const fracW = Math.max(aFrac.length, bFrac.length)
  const row = (prefix: string, int: string, frac: string): string =>
    prefix + ' '.repeat(intW - int.length) + int + '.' + frac + ' '.repeat(fracW - frac.length)
  return [row('  ', aInt, aFrac), row(op + ' ', bInt, bFrac)]
}

function makeOpProblem(rng: RNG, places: number, kind: 'add' | 'subtract'): OpProblem {
  let a = randomDecimal(rng, places)
  let b = randomDecimal(rng, places)
  if (kind === 'subtract') {
    for (let t = 0; t < 30 && a.scaled === b.scaled; t++) b = randomDecimal(rng, places)
    if (a.scaled === b.scaled) a = makeValue(a.scaled + 1000, a.displayPlaces)
    if (a.scaled < b.scaled) [a, b] = [b, a]
  }
  const answerScaled = kind === 'add' ? a.scaled + b.scaled : a.scaled - b.scaled
  return {
    kind,
    index: 0,
    a,
    b,
    rows: opRows(a, b, kind === 'add' ? '+' : '−'),
    answerScaled,
    answerText: formatScaledMin(answerScaled),
  }
}

const MIX_KINDS: readonly DecimalKind[] = ['value', 'expanded', 'compare', 'order', 'add', 'subtract']

function makeProblem(rng: RNG, places: number, kind: DecimalKind): DecimalProblem {
  switch (kind) {
    case 'value':
      return makeValueProblem(rng, places)
    case 'expanded':
      return makeExpandedProblem(rng, places)
    case 'compare':
      return makeCompareProblem(rng, places, rng.bool(0.4))
    case 'order':
      return makeOrderProblem(rng, places)
    case 'add':
    case 'subtract':
      return makeOpProblem(rng, places, kind)
  }
}

function generate(params: DecimalsParams, rng: RNG): DecimalsData {
  const places = clamp(params.places, 1, 3)
  const count = clamp(params.count, 1, 40)
  let problems: DecimalProblem[] = []
  if (params.mode === 'compare') {
    // Guarantee the shorter-but-larger trap shows up on at least 30% of the pairs.
    const engineered = places >= 2 ? Math.ceil(count * 0.3) : 0
    for (let i = 0; i < count; i++) {
      problems.push(makeCompareProblem(rng, places, i < engineered))
    }
    problems = rng.shuffle(problems)
  } else if (params.mode === 'mixed') {
    const sequence: DecimalKind[] = []
    while (sequence.length < count) sequence.push(...rng.shuffle(MIX_KINDS))
    for (const kind of sequence.slice(0, count)) problems.push(makeProblem(rng, places, kind))
  } else {
    for (let i = 0; i < count; i++) problems.push(makeProblem(rng, places, params.mode))
  }
  problems.forEach((p, i) => {
    p.index = i
  })
  return { problems }
}

/* ---------------- rendering ---------------- */

const MODE_TITLE: Record<DecimalsMode, string> = {
  value: 'Value of the Underlined Digit',
  expanded: 'Expanded Form',
  compare: 'Comparing',
  order: 'Ordering',
  add: 'Addition',
  subtract: 'Subtraction',
  mixed: 'Mixed Review',
}

const INSTRUCTIONS: Record<DecimalsMode, string> = {
  value: 'Write the value of the underlined digit as a decimal. Example: the 7 in 2.371 is 7 hundredths, so you would write 0.07.',
  expanded: 'Write each number in expanded form, one part for each place. Example: 4.253 = 4 + 0.2 + 0.05 + 0.003.',
  compare: 'Write <, =, or > in each circle. The open side of the sign faces the larger number.',
  order: 'Write the four decimals in order from smallest to largest.',
  add: 'Add. The decimal points are lined up — keep them lined up in your answer, too.',
  subtract: 'Subtract. The decimal points are lined up — keep them lined up in your answer, too.',
  mixed: 'Read the small note above each problem to see what to do. Stack your addition and subtraction answers with the points lined up.',
}

/** How many problems comfortably fit one US Letter page, per mode. */
const CAPACITY: Record<DecimalsMode, number> = {
  value: 14,
  expanded: 14,
  compare: 14,
  order: 12,
  add: 16,
  subtract: 16,
  mixed: 12,
}

const CUE: Partial<Record<DecimalProblem['kind'], string>> = {
  value: 'value of the underlined digit',
  expanded: 'write in expanded form',
  compare: 'write <, =, or > in the circle',
  order: 'order smallest to largest',
}

/** Split into pages of at most `cap`, balanced so no page ends up nearly empty. */
function paginate<T>(items: readonly T[], cap: number): T[][] {
  const pageCount = Math.max(1, Math.ceil(items.length / cap))
  const perPage = Math.ceil(items.length / pageCount)
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage))
  return pages.length > 0 ? pages : [[]]
}

function Underlined({ problem: p }: { problem: ValueProblem }) {
  const t = p.value.text
  return (
    <span className="decimals-num">
      {t.slice(0, p.underlineIndex)}
      <span className="decimals-underline">{t[p.underlineIndex]}</span>
      {t.slice(p.underlineIndex + 1)}
    </span>
  )
}

function ProblemBody({ p }: { p: DecimalProblem }) {
  switch (p.kind) {
    case 'value':
      return (
        <>
          <Underlined problem={p} />
          {' = '}
          <span className="write-line decimals-line-med" />
        </>
      )
    case 'expanded':
      return (
        <>
          <span className="decimals-num">{p.value.text}</span>
          {' = '}
          <span className="write-line decimals-line-long" />
        </>
      )
    case 'compare':
      return (
        <>
          <span className="decimals-num">{p.a.text}</span>
          <span className="decimals-compare-circle" />
          <span className="decimals-num">{p.b.text}</span>
        </>
      )
    case 'order':
      return (
        <>
          <span className="decimals-order-items">
            {p.items.map((v, i) => (
              <span key={i} className="decimals-num">
                {v.text}
              </span>
            ))}
          </span>
          <span className="decimals-order-blanks">
            {p.items.map((_, i) => (
              <Fragment key={i}>
                {i > 0 && <span> {'<'} </span>}
                <span className="write-line decimals-line-order" />
              </Fragment>
            ))}
          </span>
        </>
      )
    case 'add':
    case 'subtract':
      return (
        <span className="vertical-op">
          <span className="op-row">{p.rows[0]}</span>
          <span className="op-row">{p.rows[1]}</span>
          <span className="op-rule" />
          <span className="op-answer-space" />
        </span>
      )
  }
}

function Problem({ p, showCue }: { p: DecimalProblem; showCue: boolean }) {
  const cue = showCue ? CUE[p.kind] : undefined
  return (
    <div className="problem">
      {cue && <span className="decimals-cue">{cue}</span>}
      <span className="problem-number">{p.index + 1}.</span> <ProblemBody p={p} />
    </div>
  )
}

function Sheet({ data, params }: SheetProps<DecimalsParams, DecimalsData>) {
  const mode = params.mode
  const pages = paginate(data.problems, CAPACITY[mode])
  const title = `Decimals — ${MODE_TITLE[mode]}`
  const cols = mode === 'add' || mode === 'subtract' ? 4 : 2
  const gridStyle = { '--cols': cols } as CSSProperties
  return (
    <>
      {pages.map((page, pageIndex) => (
        <SheetPage
          key={pageIndex}
          title={pages.length > 1 ? `${title} (page ${pageIndex + 1} of ${pages.length})` : title}
          instructions={INSTRUCTIONS[mode]}
        >
          <div className="problems-grid" style={gridStyle}>
            {page.map((p) => (
              <Problem key={p.index} p={p} showCue={mode === 'mixed'} />
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function KeyContent({ p }: { p: DecimalProblem }) {
  switch (p.kind) {
    case 'value':
      return (
        <>
          <Underlined problem={p} /> — {p.answerWords} = <strong>{p.answerText}</strong>
        </>
      )
    case 'expanded':
      return (
        <>
          {p.value.text} = <strong>{p.answerText}</strong>
        </>
      )
    case 'compare':
      return (
        <>
          {p.a.text} <strong>{p.answer}</strong> {p.b.text}
        </>
      )
    case 'order':
      return <strong>{p.answerText}</strong>
    case 'add':
    case 'subtract':
      return (
        <>
          {p.a.text} {p.kind === 'add' ? '+' : '−'} {p.b.text} = <strong>{p.answerText}</strong>
        </>
      )
  }
}

function AnswerKey({ data, params }: SheetProps<DecimalsParams, DecimalsData>) {
  return (
    <AnswerKeyPage title={`Decimals — ${MODE_TITLE[params.mode]}`}>
      <ol className="answer-list decimals-key">
        {data.problems.map((p) => (
          <li key={p.index}>
            <span className="problem-number">{p.index + 1}.</span> <KeyContent p={p} />
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------------- definition ---------------- */

export const def: GeneratorDef<DecimalsParams, DecimalsData> = {
  slug: 'decimals',
  name: 'Decimal Fractions',
  description:
    'Decimal place value to thousandths — digit values, expanded form, comparing and ordering, and adding or subtracting with the points lined up.',
  strand: 'decimals',
  ages: [9, 12],
  schema: [
    {
      kind: 'select',
      key: 'mode',
      label: 'Practice type',
      options: [
        { value: 'value', label: 'Value of the underlined digit' },
        { value: 'expanded', label: 'Expanded form with decimal places' },
        { value: 'compare', label: 'Compare with <, =, >' },
        { value: 'order', label: 'Order 4 decimals smallest → largest' },
        { value: 'add', label: 'Addition' },
        { value: 'subtract', label: 'Subtraction' },
        { value: 'mixed', label: 'Mixed review' },
      ],
    },
    {
      kind: 'number',
      key: 'places',
      label: 'Decimal places',
      min: 1,
      max: 3,
      help: 'How far past the point the numbers go: 1 = tenths, 2 = hundredths, 3 = thousandths.',
    },
    { kind: 'number', key: 'count', label: 'Number of problems', min: 6, max: 14 },
  ],
  defaults: {
    mode: 'mixed',
    places: 3,
    count: 10,
  },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'reading-decimals',
      name: 'Reading decimals',
      description:
        'Name the value of each underlined digit down to thousandths — follow-up work after the decimal board introduction.',
      params: { mode: 'value', places: 3, count: 10 },
    },
    {
      id: 'decimal-sums',
      name: 'Decimal sums',
      description:
        'Column addition to hundredths with the decimal points lined up — after the decimal board operations lesson.',
      params: { mode: 'add', places: 2, count: 12 },
    },
    {
      id: 'compare-and-order',
      name: 'Compare & order',
      description:
        'Comparing pairs built to catch the "longer means larger" trap — once tenths, hundredths, and thousandths have all been named.',
      params: { mode: 'compare', places: 3, count: 12 },
    },
  ],
}
