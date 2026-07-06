import { describe, it, expect } from 'vitest'
import { countsFromNumber, totalValue } from '../../lib/placeValue'
import { createRng } from '../../lib/rng'
import {
  MAX_TOTAL,
  addPiece,
  canAddPiece,
  canDeal,
  canExchangeDownGolden,
  canExchangeUpGolden,
  canTakeBack,
  checkAgainstNumber,
  checkDivision,
  checkLayout,
  countRequiredExchanges,
  deal,
  digitAt,
  exchangeDownGolden,
  exchangeUpGolden,
  hasBorrow,
  hasCarry,
  layoutStepCount,
  layoutTarget,
  makeProblem,
  normalizeGolden,
  opAnswer,
  removePiece,
  requiredBorrows,
  scaleCounts,
  simulateDivision,
  sumCounts,
  takeBack,
} from './model'

describe('exchanging preserves value in both directions', () => {
  it('trades exactly 10 units for exactly 1 ten', () => {
    const before = { 0: 12 }
    expect(totalValue(before)).toBe(12)
    const after = exchangeUpGolden(before, 0)
    expect(after).toEqual({ 1: 1, 0: 2 })
    expect(totalValue(after)).toBe(12)
  })

  it('trades exactly 1 ten back for exactly 10 units', () => {
    const before = { 1: 1 }
    const after = exchangeDownGolden(before, 1)
    expect(after).toEqual({ 0: 10 })
    expect(totalValue(after)).toBe(10)
  })

  it('only allows legal exchanges', () => {
    expect(canExchangeUpGolden({ 0: 9 }, 0)).toBe(false)
    expect(canExchangeUpGolden({ 0: 10 }, 0)).toBe(true)
    expect(canExchangeUpGolden({ 3: 10 }, 3)).toBe(false) // no place above thousands here
    expect(canExchangeDownGolden({ 0: 5 }, 0)).toBe(false) // nothing below units
    expect(canExchangeDownGolden({ 2: 1 }, 2)).toBe(true)
    expect(() => exchangeUpGolden({ 0: 3 }, 0)).toThrow()
    expect(() => exchangeDownGolden({}, 1)).toThrow()
  })
})

describe('acceptance: addition 1,568 + 1,679', () => {
  const combined = sumCounts(countsFromNumber(1568), countsFromNumber(1679))

  it('lays out as the raw digit-wise combination', () => {
    expect(combined).toEqual({ 3: 2, 2: 11, 1: 13, 0: 17 })
  })

  it('requires exactly 3 exchanges to normalize', () => {
    expect(countRequiredExchanges(combined)).toBe(3)
  })

  it('totals 3,247 before and after exchanging', () => {
    expect(totalValue(combined)).toBe(3247)
    const done = normalizeGolden(combined)
    expect(done).toEqual({ 3: 3, 2: 2, 1: 4, 0: 7 })
    expect(totalValue(done)).toBe(3247)
  })

  it('the check refuses to grade an unexchanged mat, then confirms per place', () => {
    const early = checkAgainstNumber(combined, 3247)
    expect(early.needsExchange).toBe(true)
    expect(early.allOk).toBe(false)
    const done = checkAgainstNumber(normalizeGolden(combined), 3247)
    expect(done.needsExchange).toBe(false)
    expect(done.allOk).toBe(true)
    expect(done.places.map((p) => p.ok)).toEqual([true, true, true, true])
  })
})

describe('acceptance: subtraction 4,053 − 1,278', () => {
  it('forces borrowing across the zero-hundreds column', () => {
    const borrows = requiredBorrows(4053, 1278)
    expect(borrows).toEqual([1, 2, 3]) // borrow from tens, hundreds, and thousands
    expect(borrows).toContain(3) // the empty hundreds sends the child to the thousands
  })

  it('yields 2,775, which the check confirms per place', () => {
    expect(opAnswer('subtraction', 4053, 1278)).toBe(2775)
    const result = checkAgainstNumber(countsFromNumber(2775), 2775)
    expect(result.allOk).toBe(true)
  })

  it('flags a wrong place honestly', () => {
    const wrong = checkAgainstNumber(countsFromNumber(2765), 2775)
    expect(wrong.allOk).toBe(false)
    expect(wrong.places.find((p) => p.power === 1)?.ok).toBe(false)
    expect(wrong.places.find((p) => p.power === 0)?.ok).toBe(true)
  })
})

describe('acceptance: division deals equally to skittles', () => {
  it('9,764 ÷ 4 → exactly 2,441 each, nothing left', () => {
    const { perRow, remainder } = simulateDivision(9764, 4)
    expect(perRow).toEqual({ 3: 2, 2: 4, 1: 4, 0: 1 })
    expect(totalValue(perRow)).toBe(2441)
    expect(remainder).toBe(0)
  })

  it('9,765 ÷ 4 → 2,441 each with remainder 1', () => {
    const { perRow, remainder } = simulateDivision(9765, 4)
    expect(totalValue(perRow)).toBe(2441)
    expect(remainder).toBe(1)
  })

  it('checkDivision confirms the finished layout, remainder on the mat', () => {
    const done = checkDivision({ 0: 1 }, countsFromNumber(2441), 9765, 4)
    expect(done.allOk).toBe(true)
    expect(done.remainderOk).toBe(true)
    expect(done.expectedRemainder).toBe(1)
  })

  it('checkDivision insists on dealing and exchanging before grading', () => {
    // dividend laid out, nothing dealt yet
    const start = checkDivision(countsFromNumber(9764), {}, 9764, 4)
    expect(start.canDealMore).toBe(true)
    expect(start.allOk).toBe(false)
    // a leftover thousand that cannot be dealt to 4 skittles must be exchanged
    const leftover = checkDivision({ 3: 1 }, { 3: 2 }, 9764, 4)
    expect(leftover.canDealMore).toBe(false)
    expect(leftover.needsExchange).toBe(true)
    expect(leftover.allOk).toBe(false)
  })

  it('deal and takeBack move pieces between mat and rows symmetrically', () => {
    expect(canDeal({ 0: 8 }, 0, 4)).toBe(true)
    expect(canDeal({ 0: 3 }, 0, 4)).toBe(false)
    const dealt = deal({ 0: 8 }, {}, 0, 4)
    expect(dealt.mat).toEqual({ 0: 4 })
    expect(dealt.perRow).toEqual({ 0: 1 })
    expect(canTakeBack(dealt.perRow, 0)).toBe(true)
    const back = takeBack(dealt.mat, dealt.perRow, 0, 4)
    expect(back.mat).toEqual({ 0: 8 })
    expect(back.perRow).toEqual({})
  })
})

describe('operation layout steps (step-limited work)', () => {
  it('addition lays out two quantities, one at a time', () => {
    expect(layoutStepCount('addition', 1679)).toBe(2)
    expect(layoutTarget('addition', 1568, 1679, 0)).toEqual(countsFromNumber(1568))
    expect(layoutTarget('addition', 1568, 1679, 1)).toEqual({ 3: 2, 2: 11, 1: 13, 0: 17 })
  })

  it('multiplication lays the multiplicand out once per count', () => {
    expect(layoutStepCount('multiplication', 3)).toBe(3)
    expect(layoutTarget('multiplication', 1234, 3, 1)).toEqual(scaleCounts(countsFromNumber(1234), 2))
    expect(layoutTarget('multiplication', 1234, 3, 2)).toEqual({ 3: 3, 2: 6, 1: 9, 0: 12 })
  })

  it('subtraction and division lay out one starting quantity', () => {
    expect(layoutStepCount('subtraction', 1278)).toBe(1)
    expect(layoutTarget('division', 9764, 4, 0)).toEqual(countsFromNumber(9764))
  })

  it('checkLayout matches raw counts exactly and points at the wrong place', () => {
    const target = layoutTarget('addition', 1568, 1679, 1)
    expect(checkLayout({ 3: 2, 2: 11, 1: 13, 0: 17 }, target).allOk).toBe(true)
    const off = checkLayout({ 3: 2, 2: 11, 1: 12, 0: 17 }, target)
    expect(off.allOk).toBe(false)
    expect(off.places.find((p) => p.power === 1)?.ok).toBe(false)
  })
})

describe('mat cap and piece handling', () => {
  it('caps the mat at 9,999 but allows more than 9 per column below the cap', () => {
    expect(canAddPiece({ 0: 15 }, 0)).toBe(true) // 15 units is fine before exchanging
    expect(canAddPiece({ 3: 9, 2: 9, 1: 9, 0: 9 }, 0)).toBe(false)
    expect(canAddPiece({ 3: 9, 2: 9, 1: 9, 0: 8 }, 0)).toBe(true)
    expect(canAddPiece({ 3: 9 }, 3)).toBe(false) // a tenth thousand would pass 9,999
    expect(() => addPiece({ 3: 9, 2: 9, 1: 9, 0: 9 }, 0)).toThrow()
  })

  it('adds and removes single pieces', () => {
    const one = addPiece({}, 2)
    expect(one).toEqual({ 2: 1 })
    expect(removePiece(one, 2)).toEqual({})
    expect(() => removePiece({}, 0)).toThrow()
  })

  it('digitAt reads single places', () => {
    expect(digitAt(3247, 3)).toBe(3)
    expect(digitAt(3247, 2)).toBe(2)
    expect(digitAt(47, 3)).toBe(0)
  })
})

describe('seeded problem generation', () => {
  it('is deterministic for the same seed', () => {
    for (const mode of ['addition', 'subtraction', 'multiplication', 'division'] as const) {
      expect(makeProblem(mode, createRng(42))).toEqual(makeProblem(mode, createRng(42)))
    }
  })

  it('addition problems fit the mat and always need an exchange', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const { x, y } = makeProblem('addition', createRng(seed))
      expect(x + y).toBeLessThanOrEqual(MAX_TOTAL)
      expect(hasCarry(x, y)).toBe(true)
    }
  })

  it('subtraction problems always need a borrow and stay positive', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const { x, y } = makeProblem('subtraction', createRng(seed))
      expect(x).toBeGreaterThan(y)
      expect(x).toBeLessThanOrEqual(MAX_TOTAL)
      expect(hasBorrow(x, y)).toBe(true)
    }
  })

  it('multiplication uses small multipliers and fits the mat', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const { x, y } = makeProblem('multiplication', createRng(seed))
      expect(y).toBeGreaterThanOrEqual(2)
      expect(y).toBeLessThanOrEqual(4)
      expect(x * y).toBeLessThanOrEqual(MAX_TOTAL)
    }
  })

  it('division shares a 4-digit amount among 2–9 skittles', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const { x, y } = makeProblem('division', createRng(seed))
      expect(x).toBeGreaterThanOrEqual(5000)
      expect(x).toBeLessThanOrEqual(MAX_TOTAL)
      expect(y).toBeGreaterThanOrEqual(2)
      expect(y).toBeLessThanOrEqual(9)
      const { perRow, remainder } = simulateDivision(x, y)
      expect(totalValue(perRow) * y + remainder).toBe(x)
    }
  })
})
