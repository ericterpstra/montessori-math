/**
 * Decimal board model — pure logic, no React.
 *
 * The decimal fraction board extends place value to the right of the unit:
 * pale blue tenths, pale rose hundredths, pale green thousandths. Regions of
 * pieces are PlaceCounts from lib/placeValue and every quantity is carried as
 * an integer number of thousandths (a "scaled" value) — never a raw float.
 * That is the whole point of the material: here 0.1 + 0.2 is exactly 0.3.
 *
 * Guarded moves return a Result instead of throwing so the UI can show the
 * refusal message — the board refuses to hand over pieces that are not there,
 * prompting an exchange instead, exactly like the physical material.
 */
import {
  addToCounts,
  canExchangeDown,
  canExchangeUp,
  exchangeDown,
  exchangeUp,
  placeInfo,
} from '../../lib/placeValue'
import type { PlaceCounts, PlacePower } from '../../lib/placeValue'
import type { RNG } from '../../lib/rng'

/** The four decimal-board places: units, tenths, hundredths, thousandths (display order). */
export type DecimalPlace = 0 | -1 | -2 | -3
export const DECIMAL_PLACES: readonly DecimalPlace[] = [0, -1, -2, -3]

/** One thousandth is the atom: every value is an integer count of thousandths. */
export const SCALE = 1000

/** The tray holds a finite supply of each piece. */
export const MAX_PER_PLACE = 30

/** Largest buildable target/result: 9.999 (no tens column on this board). */
export const MAX_SCALED = 9999

export type Mode = 'free' | 'make' | 'compare' | 'add' | 'subtract'
export type OperationMode = 'add' | 'subtract'

/** An operation problem; both operands are scaled (integer thousandths). */
export interface DecimalProblem {
  a: number
  b: number
}

export type Result<T> = { ok: true; value: T } | { ok: false; message: string }

function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

function refuse<T>(message: string): Result<T> {
  return { ok: false, message }
}

/* ------------------------------------------------------------------
   Exact scaled arithmetic — integers only, never floats
   ------------------------------------------------------------------ */

/** Worth of one piece of `place`, in thousandths: 1000, 100, 10, 1. */
export function pieceScaled(place: DecimalPlace): number {
  return 10 ** (place + 3)
}

export function countAt(region: PlaceCounts, place: DecimalPlace): number {
  return region[place] ?? 0
}

/** A region's exact value in integer thousandths. */
export function scaledValue(region: PlaceCounts): number {
  let s = 0
  for (const p of DECIMAL_PLACES) s += countAt(region, p) * pieceScaled(p)
  return s
}

/** The digit a scaled value shows in `place` (values ≤ 9.999). */
export function digitAtScaled(scaled: number, place: DecimalPlace): number {
  return Math.floor(scaled / pieceScaled(place)) % 10
}

/** Piece counts that read a scaled value exactly (one digit per column). */
export function countsFromScaled(scaled: number): PlaceCounts {
  if (!Number.isInteger(scaled) || scaled < 0 || scaled > MAX_SCALED) {
    throw new Error(`countsFromScaled: ${scaled} is outside 0…${MAX_SCALED} thousandths`)
  }
  const counts: PlaceCounts = {}
  for (const p of DECIMAL_PLACES) {
    const d = digitAtScaled(scaled, p)
    if (d > 0) counts[p] = d
  }
  return counts
}

/** '2.347', '0.3', '1.75', '5' — written from the integer, never a float. */
export function formatScaled(scaled: number): string {
  if (!Number.isInteger(scaled) || scaled < 0) {
    throw new Error(`formatScaled: expected a non-negative integer, got ${scaled}`)
  }
  const whole = Math.floor(scaled / SCALE)
  const frac = scaled % SCALE
  if (frac === 0) return String(whole)
  return `${whole}.${String(frac).padStart(3, '0').replace(/0+$/, '')}`
}

/** True when every column holds at most 9 pieces (the number is readable). */
export function isNormalized(region: PlaceCounts): boolean {
  return DECIMAL_PLACES.every((p) => countAt(region, p) <= 9)
}

/** True when the board shows exactly this scaled value, one readable digit per column. */
export function readsExactly(region: PlaceCounts, scaled: number): boolean {
  return isNormalized(region) && scaledValue(region) === scaled
}

/* ------------------------------------------------------------------
   Comparison — on scaled integers, so 0.3 > 0.25 comes out right
   ------------------------------------------------------------------ */

export type ComparisonSymbol = '<' | '=' | '>'

export function compareScaled(a: number, b: number): ComparisonSymbol {
  return a < b ? '<' : a > b ? '>' : '='
}

/** Exact comparison of two boards by true value (normalized or not). */
export function compareRegions(a: PlaceCounts, b: PlaceCounts): ComparisonSymbol {
  return compareScaled(scaledValue(a), scaledValue(b))
}

export function comparisonWords(symbol: ComparisonSymbol): string {
  return symbol === '<' ? 'less than' : symbol === '>' ? 'greater than' : 'equal to'
}

/* ------------------------------------------------------------------
   Guarded moves
   ------------------------------------------------------------------ */

/** Take one piece from the tray into a region. */
export function takeFromBank(region: PlaceCounts, place: DecimalPlace): Result<PlaceCounts> {
  if (countAt(region, place) >= MAX_PER_PLACE) {
    return refuse(`The tray holds only ${MAX_PER_PLACE} ${placeInfo(place).name} — exchange some instead.`)
  }
  return ok(addToCounts(region, place, 1))
}

/** Return one piece from a region to the tray. */
export function returnToBank(region: PlaceCounts, place: DecimalPlace): Result<PlaceCounts> {
  if (countAt(region, place) === 0) {
    return refuse(`There are no ${placeInfo(place).name} here to put back.`)
  }
  return ok(addToCounts(region, place, -1))
}

/** Trade ten pieces of `place` for one piece of the next column to the left. */
export function exchangeUpIn(region: PlaceCounts, place: DecimalPlace): Result<PlaceCounts> {
  if (place >= 0) {
    return refuse('The unit is the largest place on this board — there is no tens column to trade into.')
  }
  const upper = placeInfo((place + 1) as PlacePower)
  if (!canExchangeUp(region, place)) {
    return refuse(
      `You need ten ${placeInfo(place).name} to trade for one ${upper.singular} — there are only ${countAt(region, place)}.`,
    )
  }
  return ok(exchangeUp(region, place))
}

/** Break one piece of `place` into ten pieces of the next column to the right. */
export function exchangeDownIn(region: PlaceCounts, place: DecimalPlace): Result<PlaceCounts> {
  if (place <= -3) {
    return refuse('The thousandth is the smallest piece on this board — it cannot be broken up.')
  }
  const info = placeInfo(place)
  const lower = (place - 1) as DecimalPlace
  if (!canExchangeDown(region, place)) {
    return refuse(`There are no ${info.name} here to break into ${placeInfo(lower).name}.`)
  }
  if (countAt(region, lower) + 10 > MAX_PER_PLACE) {
    return refuse(`The tray holds only ${MAX_PER_PLACE} ${placeInfo(lower).name} — trade some back up first.`)
  }
  return ok(exchangeDown(region, place))
}

/**
 * Subtraction: take one piece of `place` off the board into the removed pile.
 * Refuses when the column is empty and points to the nearest column that can
 * be exchanged down — this is what forces the borrow, even straight across
 * the decimal point (1 unit → 10 tenths).
 */
export function removePiece(
  board: PlaceCounts,
  removed: PlaceCounts,
  place: DecimalPlace,
): Result<{ board: PlaceCounts; removed: PlaceCounts }> {
  if (countAt(board, place) === 0) {
    const info = placeInfo(place)
    let source: DecimalPlace | null = null
    for (let p = place + 1; p <= 0; p++) {
      if (countAt(board, p as DecimalPlace) > 0) {
        source = p as DecimalPlace
        break
      }
    }
    if (source === null) {
      return refuse('There are no pieces left to take away.')
    }
    if (source === place + 1) {
      return refuse(
        `The ${info.name} column is empty. Exchange one ${placeInfo(source).singular} for ten ${info.name} first.`,
      )
    }
    return refuse(
      `The ${info.name} column is empty — and so is the next one. Start by exchanging one ${placeInfo(source).singular} down.`,
    )
  }
  return ok({ board: addToCounts(board, place, -1), removed: addToCounts(removed, place, 1) })
}

/** Put a taken-away piece back on the board (undo one removal). */
export function undoRemove(
  board: PlaceCounts,
  removed: PlaceCounts,
  place: DecimalPlace,
): Result<{ board: PlaceCounts; removed: PlaceCounts }> {
  if (countAt(removed, place) === 0) {
    return refuse(`No ${placeInfo(place).name} have been taken away yet.`)
  }
  if (countAt(board, place) >= MAX_PER_PLACE) {
    return refuse(`That column already holds ${MAX_PER_PLACE} ${placeInfo(place).name}.`)
  }
  return ok({ board: addToCounts(board, place, 1), removed: addToCounts(removed, place, -1) })
}

/** Slide addend rows together into one region (values add exactly). */
export function combineRegions(rows: readonly PlaceCounts[]): PlaceCounts {
  let out: PlaceCounts = {}
  for (const row of rows) {
    for (const p of DECIMAL_PLACES) {
      const c = countAt(row, p)
      if (c > 0) out = addToCounts(out, p, c)
    }
  }
  return out
}

/* ------------------------------------------------------------------
   Honest checking — per-place ✓/✗ like recounting the real material
   ------------------------------------------------------------------ */

export interface PlaceCheck {
  place: DecimalPlace
  /** The digit this column should show. */
  expected: number
  /** How many pieces are actually there. */
  actual: number
  ok: boolean
  /** Ten or more pieces: right or wrong, it cannot be read until exchanged. */
  needsExchange: boolean
}

/** Compare a region, column by column, against a scaled target value. */
export function checkAgainstScaled(region: PlaceCounts, targetScaled: number): PlaceCheck[] {
  if (!Number.isInteger(targetScaled) || targetScaled < 0 || targetScaled > MAX_SCALED) {
    throw new Error(`checkAgainstScaled: target ${targetScaled} is outside 0…${MAX_SCALED} thousandths`)
  }
  return DECIMAL_PLACES.map((place) => {
    const expected = digitAtScaled(targetScaled, place)
    const actual = countAt(region, place)
    return { place, expected, actual, ok: actual === expected, needsExchange: actual > 9 }
  })
}

export function allOk(checks: readonly PlaceCheck[]): boolean {
  return checks.every((c) => c.ok)
}

/* ------------------------------------------------------------------
   Seeded targets and problems
   ------------------------------------------------------------------ */

/** A make-the-number target: 0.001 … 9.999, as integer thousandths. */
export function generateTarget(rng: RNG): number {
  return rng.int(1, MAX_SCALED)
}

function digitsOverlapCarry(a: number, b: number): boolean {
  return DECIMAL_PLACES.some((p) => digitAtScaled(a, p) + digitAtScaled(b, p) > 9)
}

function digitsNeedBorrow(a: number, b: number): boolean {
  return DECIMAL_PLACES.some((p) => digitAtScaled(b, p) > digitAtScaled(a, p))
}

/** At least one column of a + b sums past nine (an exchange will be needed). */
export function hasCarryScaled(a: number, b: number): boolean {
  return digitsOverlapCarry(a, b)
}

/** At least one column of a − b needs a borrow. */
export function hasBorrowScaled(a: number, b: number): boolean {
  return digitsNeedBorrow(a, b)
}

/** Seeded problems — dynamic (exchange-requiring) wherever possible. */
export function generateProblem(mode: OperationMode, rng: RNG): DecimalProblem {
  if (mode === 'add') {
    let a = 1234
    let b = 2345
    for (let i = 0; i < 500; i++) {
      a = rng.int(111, 4999)
      b = rng.int(111, MAX_SCALED - a)
      if (hasCarryScaled(a, b)) break
    }
    return { a, b }
  }
  let a = 2100
  let b = 350
  for (let i = 0; i < 500; i++) {
    a = rng.int(1000, MAX_SCALED)
    b = rng.int(111, a - 1)
    if (hasBorrowScaled(a, b)) break
  }
  return { a, b }
}

/** '1.4 + 0.75' / '2.1 − 0.35' style formatting. */
export function formatProblem(mode: OperationMode, p: DecimalProblem): string {
  return `${formatScaled(p.a)} ${mode === 'add' ? '+' : '−'} ${formatScaled(p.b)}`
}

/** The exact scaled result of a problem. */
export function expectedScaled(mode: OperationMode, p: DecimalProblem): number {
  return mode === 'add' ? p.a + p.b : p.a - p.b
}
