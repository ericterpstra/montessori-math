/**
 * Fraction Circles (the fraction metal insets) — pure model.
 *
 * Ten circles, whole through tenths; family n is cut into exactly n equal
 * sectors. All arithmetic here is exact rational math on integer
 * numerators/denominators — never floating point.
 */

/** The ten families: 1 (the whole) through 10 (tenths). */
export const DENOMINATORS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/**
 * In Add & subtract mode the family's box holds spare pieces (as if a second
 * set were borrowed): enough for this many whole circles.
 */
export const BANK_WHOLES = 2

export interface Fraction {
  num: number
  den: number
}

export interface MixedNumber {
  whole: number
  /** Leftover sectors, always < den. The denominator is kept, never simplified. */
  num: number
  den: number
}

function assertInt(n: number, what: string): void {
  if (!Number.isInteger(n)) throw new Error(`${what} must be an integer, got ${n}`)
}

function assertFamily(den: number): void {
  assertInt(den, 'denominator')
  if (den < 1 || den > 10) throw new Error(`no fraction-circle family for denominator ${den}`)
}

export function fraction(num: number, den: number): Fraction {
  assertInt(num, 'numerator')
  assertInt(den, 'denominator')
  if (den < 1) throw new Error(`denominator must be at least 1, got ${den}`)
  if (num < 0) throw new Error(`numerator must be at least 0, got ${num}`)
  return { num, den }
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    const t = a % b
    a = b
    b = t
  }
  return a
}

/** Lowest terms; zero is normalized to 0/1. */
export function simplify(f: Fraction): Fraction {
  if (f.num === 0) return { num: 0, den: 1 }
  const g = gcd(f.num, f.den)
  return { num: f.num / g, den: f.den / g }
}

/** −1 if a < b, 0 if equal, 1 if a > b — by cross-multiplication, exact. */
export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const d = a.num * b.den - b.num * a.den
  return d < 0 ? -1 : d > 0 ? 1 : 0
}

export function equals(a: Fraction, b: Fraction): boolean {
  return compare(a, b) === 0
}

/** Exact sum, in lowest terms. */
export function add(a: Fraction, b: Fraction): Fraction {
  return simplify({ num: a.num * b.den + b.num * a.den, den: a.den * b.den })
}

/** Exact difference, in lowest terms. Throws if the result would be negative. */
export function subtract(a: Fraction, b: Fraction): Fraction {
  const num = a.num * b.den - b.num * a.den
  if (num < 0) throw new Error('subtract: cannot take away more than is on the mat')
  return simplify({ num, den: a.den * b.den })
}

/** 11/8 → 1 whole and 3/8. The family denominator is kept as-is. */
export function toMixed(f: Fraction): MixedNumber {
  return { whole: Math.floor(f.num / f.den), num: f.num % f.den, den: f.den }
}

/* ------------------------------------------------------------------ *
 * The work mat
 * ------------------------------------------------------------------ */

/** Sectors on the mat in placement order; each entry is its family denominator. */
export type Mat = readonly number[]

export function countOf(mat: Mat, den: number): number {
  return mat.reduce((n, d) => (d === den ? n + 1 : n), 0)
}

/** Distinct families present on the mat, smallest denominator first. */
export function familiesOn(mat: Mat): number[] {
  return [...new Set(mat)].sort((a, b) => a - b)
}

/** How many sectors of this family remain in the frame (each frame holds exactly den). */
export function remainingInFrame(mat: Mat, den: number): number {
  assertFamily(den)
  return den - countOf(mat, den)
}

export function canLift(mat: Mat, den: number): boolean {
  return remainingInFrame(mat, den) > 0
}

/** Lift one sector out of its frame onto the mat. */
export function lift(mat: Mat, den: number): number[] {
  if (!canLift(mat, den)) {
    throw new Error(`lift: every ${familyName(den)} sector is already out of its frame`)
  }
  return [...mat, den]
}

export function canLiftFromBank(mat: Mat, den: number, maxWholes: number = BANK_WHOLES): boolean {
  assertFamily(den)
  return countOf(mat, den) < maxWholes * den
}

/** Lift a piece from the family's box of spares (Add & subtract mode). */
export function liftFromBank(mat: Mat, den: number, maxWholes: number = BANK_WHOLES): number[] {
  if (!canLiftFromBank(mat, den, maxWholes)) {
    throw new Error(`liftFromBank: the ${familyName(den, true)} box is empty`)
  }
  return [...mat, den]
}

/** Return the sector at this mat index to its frame. */
export function returnAt(mat: Mat, index: number): number[] {
  if (index < 0 || index >= mat.length) throw new Error(`returnAt: no sector at index ${index}`)
  return mat.filter((_, i) => i !== index)
}

/** Return the most recently placed sector of this family. */
export function returnLast(mat: Mat, den: number): number[] {
  const index = mat.lastIndexOf(den)
  if (index === -1) throw new Error(`returnLast: no ${familyName(den)} on the mat`)
  return returnAt(mat, index)
}

/** Exact total of everything on the mat, in lowest terms. */
export function matSum(mat: Mat): Fraction {
  return mat.reduce<Fraction>((sum, den) => add(sum, { num: 1, den }), { num: 0, den: 1 })
}

/* ------------------------------------------------------------------ *
 * Names and notation
 * ------------------------------------------------------------------ */

const SINGULAR = ['', 'whole', 'half', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'] as const
const PLURAL = ['', 'wholes', 'halves', 'thirds', 'fourths', 'fifths', 'sixths', 'sevenths', 'eighths', 'ninths', 'tenths'] as const
const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
] as const

/** 'fifth' / 'fifths'; family 1 is 'whole' / 'wholes'. */
export function familyName(den: number, plural = false): string {
  assertFamily(den)
  return plural ? PLURAL[den] : SINGULAR[den]
}

function numberWord(n: number): string {
  return n >= 0 && n < NUMBER_WORDS.length ? NUMBER_WORDS[n] : String(n)
}

/** 'one fifth', 'three eighths', 'two wholes', 'eleven eighths'. */
export function fractionName(num: number, den: number): string {
  return `${numberWord(num)} ${familyName(den, num !== 1)}`
}

/** '3/8' (wholes read 'n/1'). */
export function formatFraction(f: Fraction): string {
  return `${f.num}/${f.den}`
}

/** 'one whole and three eighths', 'two wholes', 'three eighths'. */
export function mixedName(m: MixedNumber): string {
  if (m.whole === 0) return fractionName(m.num, m.den)
  const wholes = fractionName(m.whole, 1)
  return m.num === 0 ? wholes : `${wholes} and ${fractionName(m.num, m.den)}`
}

/** '1 whole + 3/8', '2 wholes', '3/8'. */
export function formatMixed(m: MixedNumber): string {
  if (m.whole === 0) return `${m.num}/${m.den}`
  const wholes = `${m.whole} ${m.whole === 1 ? 'whole' : 'wholes'}`
  return m.num === 0 ? wholes : `${wholes} + ${m.num}/${m.den}`
}

/* ------------------------------------------------------------------ *
 * Equivalence exercise
 * ------------------------------------------------------------------ */

/** Target sectors for the equivalence exercise: unit sectors some other family can rebuild. */
export const EQUIVALENCE_TARGETS: readonly Fraction[] = [
  { num: 1, den: 2 },
  { num: 1, den: 3 },
  { num: 1, den: 4 },
  { num: 1, den: 5 },
]

export interface Fill {
  den: number
  count: number
}

/**
 * Every family (2..maxDen, other than the target's own) whose sectors rebuild
 * the target exactly using pieces from a single frame.
 * equivalentFills(1/2) → 2/4, 3/6, 4/8, 5/10.
 */
export function equivalentFills(target: Fraction, maxDen = 10): Fill[] {
  const fills: Fill[] = []
  for (let den = 2; den <= maxDen; den++) {
    if (den === target.den) continue
    const scaled = target.num * den
    if (scaled % target.den !== 0) continue
    const count = scaled / target.den
    if (count >= 1 && count <= den) fills.push({ den, count })
  }
  return fills
}

export type FillComparison = 'empty' | 'under' | 'exact' | 'over'

export interface EquivalenceCheck {
  /** Distinct families on the mat, smallest first. */
  families: number[]
  singleFamily: boolean
  usesTargetFamily: boolean
  comparison: FillComparison
  /** True only for an exact fill from a single family other than the target's. */
  correct: boolean
}

/** Honest check, like laying pieces over the real inset: exact fit or visibly not. */
export function checkEquivalence(target: Fraction, mat: Mat): EquivalenceCheck {
  const families = familiesOn(mat)
  const singleFamily = families.length === 1
  const usesTargetFamily = families.includes(target.den)
  const cmp = mat.length === 0 ? null : compare(matSum(mat), target)
  const comparison: FillComparison = cmp === null ? 'empty' : cmp < 0 ? 'under' : cmp > 0 ? 'over' : 'exact'
  return {
    families,
    singleFamily,
    usesTargetFamily,
    comparison,
    correct: singleFamily && !usesTargetFamily && comparison === 'exact',
  }
}
