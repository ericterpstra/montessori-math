/**
 * Golden Beads & Mat — pure model (no React).
 *
 * The mat holds golden-bead pieces in the four whole-number places
 * (units, tens, hundreds, thousands). A place may freely hold more than
 * 9 pieces — exchanging them is the work — but the total value on the
 * mat is capped at 9,999, like the physical bank.
 */
import {
  addToCounts,
  countsFromNumber,
  exchangeDown,
  exchangeUp,
  formatNumber,
  placeInfo,
  totalValue,
} from '../../lib/placeValue'
import type { PlaceCounts } from '../../lib/placeValue'
import type { RNG } from '../../lib/rng'

export type GoldenPower = 0 | 1 | 2 | 3

/** Display order on the mat: thousands on the left, units on the right. */
export const GOLDEN_POWERS: readonly GoldenPower[] = [3, 2, 1, 0]

/** Largest value the mat (and any problem) may hold. */
export const MAX_TOTAL = 9999

export type Mode = 'free' | 'build' | 'addition' | 'subtraction' | 'multiplication' | 'division'
export type OpMode = 'addition' | 'subtraction' | 'multiplication' | 'division'

export function isOpMode(mode: Mode): mode is OpMode {
  return mode === 'addition' || mode === 'subtraction' || mode === 'multiplication' || mode === 'division'
}

/** The digit of n in the given place: digitAt(3247, 2) === 2. */
export function digitAt(n: number, power: GoldenPower): number {
  return Math.floor(n / placeInfo(power).value) % 10
}

/* ---------- pieces on the mat ---------- */

export function canAddPiece(mat: PlaceCounts, power: GoldenPower): boolean {
  return totalValue(mat) + placeInfo(power).value <= MAX_TOTAL
}

export function addPiece(mat: PlaceCounts, power: GoldenPower): PlaceCounts {
  if (!canAddPiece(mat, power)) {
    throw new Error(`addPiece: the mat cannot hold more than ${MAX_TOTAL}`)
  }
  return addToCounts(mat, power, 1)
}

export function canRemovePiece(mat: PlaceCounts, power: GoldenPower): boolean {
  return (mat[power] ?? 0) >= 1
}

export function removePiece(mat: PlaceCounts, power: GoldenPower): PlaceCounts {
  return addToCounts(mat, power, -1)
}

/* ---------- exchanging (whole-number places 0..3 only) ---------- */

export function canExchangeUpGolden(mat: PlaceCounts, power: GoldenPower): boolean {
  return power < 3 && (mat[power] ?? 0) >= 10
}

/** Trade 10 pieces of `power` for 1 piece of the next place up. */
export function exchangeUpGolden(mat: PlaceCounts, power: GoldenPower): PlaceCounts {
  if (!canExchangeUpGolden(mat, power)) {
    throw new Error(`exchangeUpGolden: need 10 ${placeInfo(power).name} (and a place above) to exchange`)
  }
  return exchangeUp(mat, power)
}

export function canExchangeDownGolden(mat: PlaceCounts, power: GoldenPower): boolean {
  return power > 0 && (mat[power] ?? 0) >= 1
}

/** Trade 1 piece of `power` for 10 pieces of the next place down. */
export function exchangeDownGolden(mat: PlaceCounts, power: GoldenPower): PlaceCounts {
  if (!canExchangeDownGolden(mat, power)) {
    throw new Error(`exchangeDownGolden: need 1 ${placeInfo(power).singular} (above the units) to exchange`)
  }
  return exchangeDown(mat, power)
}

/** How many 10-for-1 exchanges bring every place down to 9 or fewer. */
export function countRequiredExchanges(mat: PlaceCounts): number {
  let c: PlaceCounts = { ...mat }
  let n = 0
  for (const p of [0, 1, 2] as const) {
    while (canExchangeUpGolden(c, p)) {
      c = exchangeUpGolden(c, p)
      n += 1
    }
  }
  return n
}

/** Exchange everything up: same value, every place ≤ 9. */
export function normalizeGolden(mat: PlaceCounts): PlaceCounts {
  let c: PlaceCounts = { ...mat }
  for (const p of [0, 1, 2] as const) {
    while (canExchangeUpGolden(c, p)) c = exchangeUpGolden(c, p)
  }
  return c
}

/* ---------- combining quantities ---------- */

/** Piecewise union of two layouts (no exchanging). */
export function sumCounts(a: PlaceCounts, b: PlaceCounts): PlaceCounts {
  let out: PlaceCounts = { ...a }
  for (const p of GOLDEN_POWERS) {
    const add = b[p] ?? 0
    if (add > 0) out = addToCounts(out, p, add)
  }
  return out
}

/** The same layout taken `times` times (no exchanging). */
export function scaleCounts(counts: PlaceCounts, times: number): PlaceCounts {
  const out: PlaceCounts = {}
  for (const p of GOLDEN_POWERS) {
    const c = (counts[p] ?? 0) * times
    if (c > 0) out[p] = c
  }
  return out
}

/* ---------- checking (the control of error) ---------- */

export interface PlaceCheck {
  power: GoldenPower
  expected: number
  actual: number
  ok: boolean
}

export interface CheckResult {
  places: PlaceCheck[]
  /** Some place holds 10 or more pieces — exchange before reading the answer. */
  needsExchange: boolean
  allOk: boolean
}

export const EXCHANGE_FIRST_MESSAGE = 'A column still has 10 or more — exchange first.'

/** Compare the mat against a finished number, place by place. */
export function checkAgainstNumber(mat: PlaceCounts, target: number): CheckResult {
  const needsExchange = GOLDEN_POWERS.some((p) => (mat[p] ?? 0) >= 10)
  const places = GOLDEN_POWERS.map((p) => {
    const expected = digitAt(target, p)
    const actual = mat[p] ?? 0
    return { power: p, expected, actual, ok: expected === actual }
  })
  return { places, needsExchange, allOk: !needsExchange && places.every((pl) => pl.ok) }
}

/** Compare the mat against an expected raw layout (counts may exceed 9). */
export function checkLayout(mat: PlaceCounts, expected: PlaceCounts): CheckResult {
  const places = GOLDEN_POWERS.map((p) => {
    const want = expected[p] ?? 0
    const actual = mat[p] ?? 0
    return { power: p, expected: want, actual, ok: want === actual }
  })
  return { places, needsExchange: false, allOk: places.every((pl) => pl.ok) }
}

/* ---------- operation state: layout steps before the work ---------- */

/** How many separate quantities the child lays out before working. */
export function layoutStepCount(mode: OpMode, y: number): number {
  switch (mode) {
    case 'addition':
      return 2
    case 'multiplication':
      return y
    case 'subtraction':
    case 'division':
      return 1
  }
}

/** What the whole mat should hold once layout step `step` is complete. */
export function layoutTarget(mode: OpMode, x: number, y: number, step: number): PlaceCounts {
  switch (mode) {
    case 'addition':
      return step === 0 ? countsFromNumber(x) : sumCounts(countsFromNumber(x), countsFromNumber(y))
    case 'multiplication':
      return scaleCounts(countsFromNumber(x), Math.min(step + 1, y))
    case 'subtraction':
    case 'division':
      return countsFromNumber(x)
  }
}

/** The finished answer (for division this is the quotient; remainder is separate). */
export function opAnswer(mode: OpMode, x: number, y: number): number {
  switch (mode) {
    case 'addition':
      return x + y
    case 'subtraction':
      return x - y
    case 'multiplication':
      return x * y
    case 'division':
      return Math.floor(x / y)
  }
}

/* ---------- subtraction borrows ---------- */

/**
 * The places the child must borrow FROM (exchange one piece down) when
 * subtracting right to left. requiredBorrows(4053, 1278) → [1, 2, 3]:
 * the zero in the hundreds forces the borrow chain into the thousands.
 */
export function requiredBorrows(minuend: number, subtrahend: number): GoldenPower[] {
  if (subtrahend > minuend) throw new Error('requiredBorrows: subtrahend exceeds minuend')
  const from: GoldenPower[] = []
  let borrow = 0
  for (const p of [0, 1, 2] as const) {
    const d = digitAt(minuend, p) - digitAt(subtrahend, p) - borrow
    if (d < 0) {
      from.push((p + 1) as GoldenPower)
      borrow = 1
    } else {
      borrow = 0
    }
  }
  return from
}

/* ---------- division onto skittle rows ---------- */

export function canDeal(mat: PlaceCounts, power: GoldenPower, divisor: number): boolean {
  return (mat[power] ?? 0) >= divisor
}

/** Give one piece of `power` to each of the `divisor` skittle rows. */
export function deal(
  mat: PlaceCounts,
  perRow: PlaceCounts,
  power: GoldenPower,
  divisor: number,
): { mat: PlaceCounts; perRow: PlaceCounts } {
  if (!canDeal(mat, power, divisor)) {
    throw new Error('deal: not enough pieces to give one to every skittle')
  }
  return { mat: addToCounts(mat, power, -divisor), perRow: addToCounts(perRow, power, 1) }
}

export function canTakeBack(perRow: PlaceCounts, power: GoldenPower): boolean {
  return (perRow[power] ?? 0) >= 1
}

/** Take one piece of `power` back from every row onto the mat. */
export function takeBack(
  mat: PlaceCounts,
  perRow: PlaceCounts,
  power: GoldenPower,
  divisor: number,
): { mat: PlaceCounts; perRow: PlaceCounts } {
  if (!canTakeBack(perRow, power)) {
    throw new Error('takeBack: no dealt piece of that place to take back')
  }
  return { mat: addToCounts(mat, power, divisor), perRow: addToCounts(perRow, power, -1) }
}

export interface DivisionCheck {
  /** What ONE skittle row holds vs the quotient digit, place by place. */
  places: PlaceCheck[]
  expectedRemainder: number
  remainderOk: boolean
  /** A place on the mat still has enough pieces to deal one to every skittle. */
  canDealMore: boolean
  /** Leftover pieces above the units remain — exchange them down and keep dealing. */
  needsExchange: boolean
  allOk: boolean
}

export function checkDivision(
  mat: PlaceCounts,
  perRow: PlaceCounts,
  dividend: number,
  divisor: number,
): DivisionCheck {
  const quotient = Math.floor(dividend / divisor)
  const expectedRemainder = dividend % divisor
  const places = GOLDEN_POWERS.map((p) => {
    const expected = digitAt(quotient, p)
    const actual = perRow[p] ?? 0
    return { power: p, expected, actual, ok: expected === actual }
  })
  const canDealMore = GOLDEN_POWERS.some((p) => canDeal(mat, p, divisor))
  const needsExchange = ([3, 2, 1] as const).some((p) => (mat[p] ?? 0) > 0)
  const remainderOk = !canDealMore && !needsExchange && (mat[0] ?? 0) === expectedRemainder
  return {
    places,
    expectedRemainder,
    remainderOk,
    canDealMore,
    needsExchange,
    allOk: places.every((pl) => pl.ok) && remainderOk,
  }
}

/** Deal the whole dividend fairly, exchanging as needed — the finished result. */
export function simulateDivision(dividend: number, divisor: number): { perRow: PlaceCounts; remainder: number } {
  const perRow: PlaceCounts = {}
  let carry = 0
  for (const p of GOLDEN_POWERS) {
    const available = carry * 10 + digitAt(dividend, p)
    const share = Math.floor(available / divisor)
    if (share > 0) perRow[p] = share
    carry = available % divisor
  }
  return { perRow, remainder: carry }
}

/* ---------- problem generation ---------- */

export interface Operands {
  x: number
  y: number
}

/** True when adding a and b needs at least one 10-for-1 exchange. */
export function hasCarry(a: number, b: number): boolean {
  return GOLDEN_POWERS.some((p) => digitAt(a, p) + digitAt(b, p) >= 10)
}

/** True when subtracting needs at least one borrow (exchange down). */
export function hasBorrow(minuend: number, subtrahend: number): boolean {
  return requiredBorrows(minuend, subtrahend).length > 0
}

export function makeBuildTarget(rng: RNG): number {
  return rng.int(1000, MAX_TOTAL)
}

const TRIES = 100

/**
 * A seeded problem for the given operation. Addition and subtraction always
 * include at least one exchange; multiplication uses small multipliers (2–4)
 * as the physical presentation does.
 */
export function makeProblem(mode: OpMode, rng: RNG): Operands {
  switch (mode) {
    case 'addition': {
      for (let i = 0; i < TRIES; i++) {
        const x = rng.int(1112, 8887)
        const y = rng.int(1112, MAX_TOTAL - x)
        if (hasCarry(x, y)) return { x, y }
      }
      return { x: 1568, y: 1679 }
    }
    case 'subtraction': {
      for (let i = 0; i < TRIES; i++) {
        const x = rng.int(2223, MAX_TOTAL)
        const y = rng.int(1112, x - 1111)
        if (hasBorrow(x, y)) return { x, y }
      }
      return { x: 4053, y: 1278 }
    }
    case 'multiplication': {
      for (let i = 0; i < TRIES; i++) {
        const y = rng.int(2, 4)
        const x = rng.int(1112, Math.floor(MAX_TOTAL / y))
        if (GOLDEN_POWERS.some((p) => digitAt(x, p) * y >= 10)) return { x, y }
      }
      return { x: 1234, y: 3 }
    }
    case 'division': {
      return { x: rng.int(5000, MAX_TOTAL), y: rng.int(2, 9) }
    }
  }
}

/** null when the operands make a fair problem; otherwise a parent-facing message. */
export function validateOperands(mode: OpMode, x: number, y: number): string | null {
  if (!Number.isInteger(x) || !Number.isInteger(y)) return 'Please enter whole numbers.'
  switch (mode) {
    case 'addition': {
      if (x < 1 || y < 1) return 'Both numbers must be at least 1.'
      if (x + y > MAX_TOTAL) return `The sum must be ${formatNumber(MAX_TOTAL)} or less.`
      return null
    }
    case 'subtraction': {
      if (x < 1 || x > MAX_TOTAL) return `Start with a number from 1 to ${formatNumber(MAX_TOTAL)}.`
      if (y < 1) return 'Take away at least 1.'
      if (y >= x) return 'The amount taken away must be smaller than the starting number.'
      return null
    }
    case 'multiplication': {
      if (y < 2 || y > 9) return 'Take the number 2 to 9 times.'
      if (x < 1) return 'The number to repeat must be at least 1.'
      if (x * y > MAX_TOTAL) return `The answer must stay at ${formatNumber(MAX_TOTAL)} or less — try a smaller number.`
      return null
    }
    case 'division': {
      if (y < 2 || y > 9) return 'Share among 2 to 9 skittles.'
      if (x < 1 || x > MAX_TOTAL) return `Share a number from 1 to ${formatNumber(MAX_TOTAL)}.`
      return null
    }
  }
}

export function validateBuildTarget(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > MAX_TOTAL) {
    return `Enter a whole number from 1 to ${formatNumber(MAX_TOTAL)}.`
  }
  return null
}
