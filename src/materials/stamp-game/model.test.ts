import { describe, it, expect } from 'vitest'
import { countsFromNumber, totalValue, normalize } from '../../lib/placeValue'
import type { PlaceCounts } from '../../lib/placeValue'
import { createRng } from '../../lib/rng'
import {
  MAX_PER_PLACE,
  MAX_VALUE,
  STAMP_PLACES,
  allOk,
  checkAgainst,
  checkDivision,
  combineRegions,
  dealRound,
  exchangeDownIn,
  exchangeUpIn,
  expectedResult,
  formatProblem,
  generateProblem,
  hasBorrow,
  hasCarry,
  isNormalized,
  moveStamp,
  regionValue,
  removeStamp,
  returnToBank,
  rowCount,
  takeFromBank,
  validateProblem,
} from './model'
import type { StampPlace } from './model'

function expectOk<T>(r: { ok: true; value: T } | { ok: false; message: string }): T {
  if (!r.ok) throw new Error(`expected ok, got refusal: ${r.message}`)
  return r.value
}

describe('stamp game subtraction — 4,053 − 1,278 borrows across the zero', () => {
  it('walks the full cascade and reads 2,775', () => {
    let mat = countsFromNumber(4053)
    let removed: PlaceCounts = {}
    const remove = (place: StampPlace, times: number) => {
      for (let i = 0; i < times; i++) {
        const r = expectOk(removeStamp(mat, removed, place))
        mat = r.mat
        removed = r.removed
      }
    }

    // Units: need 8, only 3 present.
    remove(0, 3)
    const overdraw = removeStamp(mat, removed, 0)
    expect(overdraw.ok).toBe(false)
    if (!overdraw.ok) expect(overdraw.message).toMatch(/[Ee]xchange/)
    mat = expectOk(exchangeDownIn(mat, 1)) // 1 ten → 10 units
    remove(0, 5)

    // Tens: need 7, only 4 remain after the exchange above.
    remove(1, 4)
    expect(removeStamp(mat, removed, 1).ok).toBe(false)
    // Hundreds column is zero — exchanging a hundred down must refuse...
    expect(exchangeDownIn(mat, 2).ok).toBe(false)
    // ...forcing the cascade: 1 thousand → 10 hundreds → then 1 hundred → 10 tens.
    mat = expectOk(exchangeDownIn(mat, 3))
    expect(mat[2]).toBe(10)
    mat = expectOk(exchangeDownIn(mat, 2))
    expect(mat[2]).toBe(9)
    expect(mat[1]).toBe(10)
    remove(1, 3)

    // Hundreds: need 2 of the 9 now present; thousands: need 1 of 3.
    remove(2, 2)
    remove(3, 1)

    expect(regionValue(mat)).toBe(2775)
    expect(mat).toEqual({ 3: 2, 2: 7, 1: 7, 0: 5 })
    expect(regionValue(removed)).toBe(1278)
    expect(allOk(checkAgainst(mat, 2775))).toBe(true)
    expect(allOk(checkAgainst(removed, 1278))).toBe(true)
  })

  it('refuses removal only when truly empty, with a helpful message', () => {
    const mat: PlaceCounts = { 3: 2 } // 2,000 — tens AND hundreds empty
    const r = removeStamp(mat, {}, 1)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/thousand/)
    const none = removeStamp({}, {}, 0)
    expect(none.ok).toBe(false)
  })
})

describe('dynamic addition — combine, exchange, value preserved', () => {
  it('1,568 + 1,679 normalizes to 3,247 with value preserved at every step', () => {
    const rows = [countsFromNumber(1568), countsFromNumber(1679)]
    let mat = combineRegions(rows)
    expect(mat).toEqual({ 3: 2, 2: 11, 1: 13, 0: 17 })
    expect(regionValue(mat)).toBe(3247)
    expect(isNormalized(mat)).toBe(false)

    // Exchange up the units, tens, hundreds — value must never change.
    for (const place of [0, 1, 2] as const) {
      while ((mat[place] ?? 0) >= 10) {
        mat = expectOk(exchangeUpIn(mat, place))
        expect(regionValue(mat)).toBe(3247)
      }
    }
    expect(isNormalized(mat)).toBe(true)
    expect(mat).toEqual({ 3: 3, 2: 2, 1: 4, 0: 7 })
    expect(mat).toEqual(normalize(combineRegions(rows)))
    expect(allOk(checkAgainst(mat, 3247))).toBe(true)
  })

  it('per-place check is honest: unexchanged columns are marked, not excused', () => {
    // 12 tens + 3 units is worth 123, but it does not READ 123 yet.
    const region: PlaceCounts = { 1: 12, 0: 3 }
    expect(totalValue(region)).toBe(123)
    const checks = checkAgainst(region, 123)
    const byPlace = new Map(checks.map((c) => [c.place, c]))
    expect(byPlace.get(0)).toMatchObject({ ok: true, expected: 3, actual: 3 })
    expect(byPlace.get(1)).toMatchObject({ ok: false, expected: 2, actual: 12, needsExchange: true })
    expect(byPlace.get(2)).toMatchObject({ ok: false, expected: 1, actual: 0 })
    expect(allOk(checks)).toBe(false)
  })
})

describe('multiplication — the multiplicand taken b times', () => {
  it('1,234 × 3 combines three identical rows into 3,702', () => {
    const p = { a: 1234, b: 3 }
    expect(rowCount('multiplication', p)).toBe(3)
    const rows = Array.from({ length: p.b }, () => countsFromNumber(p.a))
    const mat = normalize(combineRegions(rows))
    expect(regionValue(mat)).toBe(3702)
    expect(expectedResult('multiplication', p)).toBe(3702)
    expect(allOk(checkAgainst(mat, 3702))).toBe(true)
  })
})

describe('division — dealing to skittles with remainder < divisor', () => {
  it('725 ÷ 3: deals fair shares of 241 and leaves remainder 2', () => {
    const p = { a: 725, b: 3 }
    let supply = countsFromNumber(p.a)
    let rows: PlaceCounts[] = Array.from({ length: p.b }, () => ({}))
    const deal = (place: StampPlace) => {
      const r = expectOk(dealRound(supply, rows, place))
      supply = r.supply
      rows = r.rows
    }

    deal(2)
    deal(2) // 6 hundreds dealt, 1 left — a third round must refuse
    const short = dealRound(supply, rows, 2)
    expect(short.ok).toBe(false)
    if (!short.ok) expect(short.message).toMatch(/[Ee]xchange/)
    supply = expectOk(exchangeDownIn(supply, 2)) // 1 hundred → 10 tens (now 12)
    for (let i = 0; i < 4; i++) deal(1)
    expect(dealRound(supply, rows, 1).ok).toBe(false) // tens exhausted
    deal(0) // 5 units → one round leaves 2
    const leftover = dealRound(supply, rows, 0)
    expect(leftover.ok).toBe(false)
    if (!leftover.ok) expect(leftover.message).toMatch(/remainder/)

    for (const row of rows) expect(regionValue(row)).toBe(241)
    expect(regionValue(supply)).toBe(2)
    expect(regionValue(supply)).toBeLessThan(p.b)

    const check = checkDivision(rows, supply, p)
    expect(check.equalShares).toBe(true)
    expect(check.quotientValue).toBe(241)
    expect(check.remainderValue).toBe(2)
    expect(allOk(check.quotient)).toBe(true)
    expect(allOk(check.remainder)).toBe(true)
  })

  it('flags unfair shares', () => {
    const p = { a: 9, b: 2 }
    const rows: PlaceCounts[] = [{ 0: 5 }, { 0: 3 }]
    const check = checkDivision(rows, { 0: 1 }, p)
    expect(check.equalShares).toBe(false)
    expect(allOk(check.quotient)).toBe(false)
  })
})

describe('guarded moves refuse overdraw and over-supply', () => {
  it('cannot take from an empty region or overfill from the bank', () => {
    expect(returnToBank({}, 0).ok).toBe(false)
    expect(moveStamp({}, {}, 2).ok).toBe(false)
    let region: PlaceCounts = { 0: MAX_PER_PLACE - 1 }
    region = expectOk(takeFromBank(region, 0))
    expect(region[0]).toBe(MAX_PER_PLACE)
    expect(takeFromBank(region, 0).ok).toBe(false)
  })

  it('exchange is guarded in both directions', () => {
    expect(exchangeUpIn({ 0: 9 }, 0).ok).toBe(false) // nine is not ten
    const up = expectOk(exchangeUpIn({ 0: 10 }, 0))
    expect(up).toEqual({ 1: 1 })
    expect(regionValue(up)).toBe(10)
    expect(exchangeUpIn({ 3: 10 }, 3).ok).toBe(false) // nothing above thousands
    expect(exchangeDownIn({ 1: 0 }, 1).ok).toBe(false)
    expect(exchangeDownIn({ 0: 5 }, 0).ok).toBe(false) // units cannot break down
    const down = expectOk(exchangeDownIn({ 2: 1, 1: 2 }, 2))
    expect(down).toEqual({ 1: 12 })
    expect(regionValue(down)).toBe(120)
    // Cap guard: breaking a ten when the units column is nearly full refuses.
    expect(exchangeDownIn({ 1: 1, 0: MAX_PER_PLACE - 5 }, 1).ok).toBe(false)
  })
})

describe('problems — seeded generation, validation, formatting', () => {
  it('is deterministic for the same seed and mode', () => {
    for (const mode of ['addition', 'subtraction', 'multiplication', 'division'] as const) {
      const p1 = generateProblem(mode, createRng(42))
      const p2 = generateProblem(mode, createRng(42))
      expect(p1).toEqual(p2)
    }
  })

  it('generates workable problems within stamp-game limits', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const add = generateProblem('addition', createRng(seed))
      expect(add.a + add.b).toBeLessThanOrEqual(MAX_VALUE)
      expect(hasCarry(add.a, add.b)).toBe(true)

      const sub = generateProblem('subtraction', createRng(seed))
      expect(sub.a).toBeGreaterThan(sub.b)
      expect(sub.a).toBeLessThanOrEqual(MAX_VALUE)
      expect(hasBorrow(sub.a, sub.b)).toBe(true)

      const mul = generateProblem('multiplication', createRng(seed))
      expect(mul.b).toBeGreaterThanOrEqual(2)
      expect(mul.b).toBeLessThanOrEqual(4)
      expect(mul.a * mul.b).toBeLessThanOrEqual(MAX_VALUE)

      const div = generateProblem('division', createRng(seed))
      expect(div.b).toBeGreaterThanOrEqual(2)
      expect(div.b).toBeLessThanOrEqual(9)
      expect(div.a).toBeLessThanOrEqual(MAX_VALUE)
      expect(div.a % div.b).toBeLessThan(div.b)
      expect(Math.floor(div.a / div.b)).toBeGreaterThanOrEqual(100)
    }
  })

  it('validates manual problems', () => {
    expect(validateProblem('addition', 5000, 5000)).toMatch(/ten-thousand/)
    expect(validateProblem('addition', 1234, 2345)).toBeNull()
    expect(validateProblem('subtraction', 100, 200)).toMatch(/take away/)
    expect(validateProblem('subtraction', 4053, 1278)).toBeNull()
    expect(validateProblem('multiplication', 4000, 3)).toMatch(/9,999/)
    expect(validateProblem('multiplication', 1234, 1)).toMatch(/multiplier/)
    expect(validateProblem('division', 725, 10)).toMatch(/skittles/)
    expect(validateProblem('division', 725, 3)).toBeNull()
    expect(validateProblem('addition', 1.5, 2)).toMatch(/whole numbers/)
  })

  it('formats problems with US-style commas', () => {
    expect(formatProblem('addition', { a: 1568, b: 1679 })).toBe('1,568 + 1,679')
    expect(formatProblem('subtraction', { a: 4053, b: 1278 })).toBe('4,053 − 1,278')
    expect(formatProblem('division', { a: 725, b: 3 })).toBe('725 ÷ 3')
  })

  it('exposes the stamp places highest-first for display', () => {
    expect([...STAMP_PLACES]).toEqual([3, 2, 1, 0])
    expect(rowCount('addition', { a: 1, b: 2 })).toBe(2)
    expect(rowCount('division', { a: 725, b: 3 })).toBe(3)
    expect(rowCount('free', null)).toBe(0)
  })
})
