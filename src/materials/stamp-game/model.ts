/**
 * Stamp game model — pure logic, no React.
 *
 * The stamp game carries the decimal system on identical small tiles:
 * green 1, blue 10, red 100, green 1000. Regions of stamps (the work mat,
 * addend rows, skittle rows in division) are PlaceCounts from lib/placeValue,
 * and all exchanging goes through the shared exchange helpers.
 *
 * Every guarded move returns a Result instead of throwing so the UI can show
 * the refusal message — the model refuses to hand out stamps that are not
 * there, prompting an exchange instead, exactly like the physical box.
 */
import {
  addToCounts,
  canExchangeDown,
  canExchangeUp,
  decompose,
  exchangeDown,
  exchangeUp,
  formatNumber,
  placeInfo,
} from '../../lib/placeValue'
import type { PlaceCounts, PlacePower } from '../../lib/placeValue'
import type { RNG } from '../../lib/rng'

/** The four stamp places: thousands, hundreds, tens, units (display order). */
export type StampPlace = 0 | 1 | 2 | 3
export const STAMP_PLACES: readonly StampPlace[] = [3, 2, 1, 0]

/** The physical box holds a finite supply of each stamp. */
export const MAX_PER_PLACE = 40

/** Largest number the stamp game can show (no ten-thousand stamp exists). */
export const MAX_VALUE = 9999

export type Mode = 'free' | 'addition' | 'subtraction' | 'multiplication' | 'division'
export type OperationMode = Exclude<Mode, 'free'>

export interface Problem {
  /** First operand: addend, minuend, multiplicand, or dividend. */
  a: number
  /** Second operand: addend, subtrahend, multiplier, or divisor. */
  b: number
}

export type Result<T> = { ok: true; value: T } | { ok: false; message: string }

function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

function refuse<T>(message: string): Result<T> {
  return { ok: false, message }
}

export function countAt(region: PlaceCounts, place: StampPlace): number {
  return region[place] ?? 0
}

/** Sum of a region's stamps as a number (uses only stamp places). */
export function regionValue(region: PlaceCounts): number {
  let v = 0
  for (const p of STAMP_PLACES) v += countAt(region, p) * 10 ** p
  return v
}

/** True when every place holds at most 9 stamps (the number is readable). */
export function isNormalized(region: PlaceCounts): boolean {
  return STAMP_PLACES.every((p) => countAt(region, p) <= 9)
}

/* ------------------------------------------------------------------
   Guarded moves
   ------------------------------------------------------------------ */

/** Take one stamp from the (unlimited-feeling but finite) bank into a region. */
export function takeFromBank(region: PlaceCounts, place: StampPlace): Result<PlaceCounts> {
  if (countAt(region, place) >= MAX_PER_PLACE) {
    return refuse(`The box holds only ${MAX_PER_PLACE} ${placeInfo(place).name} stamps — exchange some instead.`)
  }
  return ok(addToCounts(region, place, 1))
}

/** Return one stamp from a region to the bank. */
export function returnToBank(region: PlaceCounts, place: StampPlace): Result<PlaceCounts> {
  if (countAt(region, place) === 0) {
    return refuse(`There are no ${placeInfo(place).name} stamps here to put back.`)
  }
  return ok(addToCounts(region, place, -1))
}

/** Move one stamp between two regions (e.g. undo a removal or a deal). */
export function moveStamp(
  from: PlaceCounts,
  to: PlaceCounts,
  place: StampPlace,
): Result<{ from: PlaceCounts; to: PlaceCounts }> {
  if (countAt(from, place) === 0) {
    return refuse(`There are no ${placeInfo(place).name} stamps here to move.`)
  }
  if (countAt(to, place) >= MAX_PER_PLACE) {
    return refuse(`That column already holds ${MAX_PER_PLACE} ${placeInfo(place).name} stamps.`)
  }
  return ok({ from: addToCounts(from, place, -1), to: addToCounts(to, place, 1) })
}

/** Trade ten stamps of `place` for one stamp of the next place up. */
export function exchangeUpIn(region: PlaceCounts, place: StampPlace): Result<PlaceCounts> {
  if (place >= 3) {
    return refuse('There is no stamp bigger than the thousand.')
  }
  const upper = placeInfo((place + 1) as PlacePower)
  if (!canExchangeUp(region, place)) {
    return refuse(
      `You need ten ${placeInfo(place).name} to trade for one ${upper.singular} — there are only ${countAt(region, place)}.`,
    )
  }
  return ok(exchangeUp(region, place))
}

/** Break one stamp of `place` into ten stamps of the next place down. */
export function exchangeDownIn(region: PlaceCounts, place: StampPlace): Result<PlaceCounts> {
  if (place <= 0) {
    return refuse('The unit is the smallest stamp — it cannot be broken into smaller ones.')
  }
  const info = placeInfo(place)
  if (!canExchangeDown(region, place)) {
    return refuse(`There are no ${info.name} here to break into ${placeInfo((place - 1) as PlacePower).name}.`)
  }
  const lower = (place - 1) as StampPlace
  if (countAt(region, lower) + 10 > MAX_PER_PLACE) {
    return refuse(`The box holds only ${MAX_PER_PLACE} ${placeInfo(lower).name} stamps — trade some back up first.`)
  }
  return ok(exchangeDown(region, place))
}

/**
 * Subtraction: take one stamp of `place` off the mat into the removed pile.
 * Refuses when the column is empty and points to the nearest column that can
 * be exchanged down — this is what forces the borrow (even across a zero).
 */
export function removeStamp(
  mat: PlaceCounts,
  removed: PlaceCounts,
  place: StampPlace,
): Result<{ mat: PlaceCounts; removed: PlaceCounts }> {
  if (countAt(mat, place) === 0) {
    const info = placeInfo(place)
    let source: StampPlace | null = null
    for (let p = place + 1; p <= 3; p++) {
      if (countAt(mat, p as StampPlace) > 0) {
        source = p as StampPlace
        break
      }
    }
    if (source === null) {
      return refuse(`There are no stamps left to take away.`)
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
  return ok({ mat: addToCounts(mat, place, -1), removed: addToCounts(removed, place, 1) })
}

/** Merge several regions (addend rows sliding together on the mat). */
export function combineRegions(rows: readonly PlaceCounts[]): PlaceCounts {
  let out: PlaceCounts = {}
  for (const row of rows) {
    for (const p of STAMP_PLACES) {
      const c = countAt(row, p)
      if (c > 0) out = addToCounts(out, p, c)
    }
  }
  return out
}

/**
 * Division: give one stamp of `place` to every skittle row.
 * Refuses when there are not enough stamps for a full fair round — the child
 * must exchange down (or, at the units, leave the rest as the remainder).
 */
export function dealRound(
  supply: PlaceCounts,
  rows: readonly PlaceCounts[],
  place: StampPlace,
): Result<{ supply: PlaceCounts; rows: PlaceCounts[] }> {
  const info = placeInfo(place)
  const have = countAt(supply, place)
  const need = rows.length
  if (need === 0) {
    return refuse('There are no skittles to deal to.')
  }
  if (have === 0) {
    return refuse(`There are no ${info.name} stamps left to deal.`)
  }
  if (have < need) {
    if (place > 0) {
      return refuse(
        `Only ${have} ${have === 1 ? info.singular : info.name} left — not enough to give one to every skittle. Exchange ${have === 1 ? 'it' : 'them'} into ${placeInfo((place - 1) as PlacePower).name}.`,
      )
    }
    return refuse(
      `Only ${have} unit${have === 1 ? '' : 's'} left — not enough to give one to every skittle. ${have === 1 ? 'It stays' : 'They stay'} as the remainder.`,
    )
  }
  let nextSupply = supply
  const nextRows = rows.map((r) => addToCounts(r, place, 1))
  nextSupply = addToCounts(nextSupply, place, -need)
  return ok({ supply: nextSupply, rows: nextRows })
}

/* ------------------------------------------------------------------
   Problems
   ------------------------------------------------------------------ */

const SYMBOLS: Record<OperationMode, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
}

export function formatProblem(mode: OperationMode, p: Problem): string {
  return `${formatNumber(p.a)} ${SYMBOLS[mode]} ${formatNumber(p.b)}`
}

function digitAt(n: number, place: StampPlace): number {
  return Math.floor(n / 10 ** place) % 10
}

/** At least one column of a + b sums past nine (an exchange will be needed). */
export function hasCarry(a: number, b: number): boolean {
  return STAMP_PLACES.some((p) => digitAt(a, p) + digitAt(b, p) > 9)
}

/** At least one column of a − b needs a borrow. */
export function hasBorrow(a: number, b: number): boolean {
  return STAMP_PLACES.some((p) => digitAt(b, p) > digitAt(a, p))
}

/** What the finished work should read (per skittle for division). */
export function expectedResult(mode: OperationMode, p: Problem): number {
  switch (mode) {
    case 'addition':
      return p.a + p.b
    case 'subtraction':
      return p.a - p.b
    case 'multiplication':
      return p.a * p.b
    case 'division':
      return Math.floor(p.a / p.b)
  }
}

/** Seeded problem generation — dynamic (exchange-requiring) where sensible. */
export function generateProblem(mode: OperationMode, rng: RNG): Problem {
  switch (mode) {
    case 'addition': {
      let a = 1234
      let b = 2345
      for (let i = 0; i < 500; i++) {
        a = rng.int(1112, 4999)
        b = rng.int(1112, MAX_VALUE - a)
        if (hasCarry(a, b)) break
      }
      return { a, b }
    }
    case 'subtraction': {
      let a = 4053
      let b = 1278
      for (let i = 0; i < 500; i++) {
        a = rng.int(2000, MAX_VALUE)
        b = rng.int(1111, a - 1)
        if (hasBorrow(a, b)) break
      }
      return { a, b }
    }
    case 'multiplication': {
      const b = rng.int(2, 4)
      const a = rng.int(112, Math.floor(MAX_VALUE / b))
      return { a, b }
    }
    case 'division': {
      const b = rng.int(2, 9)
      const q = rng.int(112, Math.floor((MAX_VALUE - (b - 1)) / b))
      const r = rng.int(0, b - 1)
      return { a: q * b + r, b }
    }
  }
}

/** null when the manually entered problem is workable; otherwise a reason. */
export function validateProblem(mode: OperationMode, a: number, b: number): string | null {
  if (!Number.isInteger(a) || !Number.isInteger(b)) return 'Please use whole numbers.'
  if (a < 1 || a > MAX_VALUE) return `The first number must be between 1 and ${formatNumber(MAX_VALUE)}.`
  switch (mode) {
    case 'addition':
      if (b < 1 || b > MAX_VALUE) return `The second number must be between 1 and ${formatNumber(MAX_VALUE)}.`
      if (a + b > MAX_VALUE) return `The sum must be ${formatNumber(MAX_VALUE)} or less — there is no ten-thousand stamp.`
      return null
    case 'subtraction':
      if (b < 1) return 'The number taken away must be at least 1.'
      if (b > a) return 'You cannot take away more than you start with.'
      return null
    case 'multiplication':
      if (b < 2 || b > 9) return 'The multiplier must be between 2 and 9.'
      if (a * b > MAX_VALUE) return `The answer must be ${formatNumber(MAX_VALUE)} or less — there is no ten-thousand stamp.`
      return null
    case 'division':
      if (b < 2 || b > 9) return 'The number of skittles must be between 2 and 9.'
      return null
  }
}

/* ------------------------------------------------------------------
   Honest checking — per-place ✓/✗ like recounting the real material
   ------------------------------------------------------------------ */

export interface PlaceCheck {
  place: StampPlace
  /** The digit this place should show. */
  expected: number
  /** How many stamps are actually there. */
  actual: number
  ok: boolean
  /** Ten or more stamps: right or wrong, it cannot be read until exchanged. */
  needsExchange: boolean
}

/** Compare a region, place by place, against a target number. */
export function checkAgainst(region: PlaceCounts, target: number): PlaceCheck[] {
  const digits = new Map(decompose(target).map((d) => [d.power, d.digit]))
  return STAMP_PLACES.map((place) => {
    const expected = digits.get(place) ?? 0
    const actual = countAt(region, place)
    return { place, expected, actual, ok: actual === expected, needsExchange: actual > 9 }
  })
}

export function allOk(checks: readonly PlaceCheck[]): boolean {
  return checks.every((c) => c.ok)
}

export interface DivisionCheck {
  /** Every skittle row holds exactly the same stamps (fair shares). */
  equalShares: boolean
  /** Per place: does every row hold the expected quotient digit? */
  quotient: PlaceCheck[]
  /** The undealt supply, checked against the true remainder. */
  remainder: PlaceCheck[]
  quotientValue: number
  remainderValue: number
}

export function checkDivision(rows: readonly PlaceCounts[], supply: PlaceCounts, problem: Problem): DivisionCheck {
  const quotientValue = Math.floor(problem.a / problem.b)
  const remainderValue = problem.a % problem.b
  const first = rows[0] ?? {}
  const equalShares = rows.every((row) => STAMP_PLACES.every((p) => countAt(row, p) === countAt(first, p)))
  const digits = new Map(decompose(quotientValue).map((d) => [d.power, d.digit]))
  const quotient = STAMP_PLACES.map((place) => {
    const expected = digits.get(place) ?? 0
    const actual = countAt(first, place)
    const everyRow = rows.every((row) => countAt(row, place) === expected)
    return { place, expected, actual, ok: everyRow, needsExchange: actual > 9 }
  })
  return {
    equalShares,
    quotient,
    remainder: checkAgainst(supply, remainderValue),
    quotientValue,
    remainderValue,
  }
}

/** How many build rows a mode starts with. */
export function rowCount(mode: Mode, problem: Problem | null): number {
  if (!problem) return 0
  if (mode === 'addition') return 2
  if (mode === 'multiplication' || mode === 'division') return problem.b
  return 0
}
