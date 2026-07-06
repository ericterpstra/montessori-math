import { describe, it, expect } from 'vitest'
import {
  BANK_WHOLES,
  DENOMINATORS,
  add,
  canLift,
  canLiftFromBank,
  checkEquivalence,
  compare,
  countOf,
  equals,
  equivalentFills,
  familiesOn,
  familyName,
  formatFraction,
  formatMixed,
  fraction,
  fractionName,
  lift,
  liftFromBank,
  matSum,
  mixedName,
  remainingInFrame,
  returnAt,
  returnLast,
  simplify,
  subtract,
  toMixed,
} from './model'

describe('exact rational arithmetic', () => {
  it('recognizes the halves equivalence chain 1/2 = 2/4 = 3/6 = 4/8 = 5/10', () => {
    const half = fraction(1, 2)
    expect(equals(half, fraction(2, 4))).toBe(true)
    expect(equals(half, fraction(3, 6))).toBe(true)
    expect(equals(half, fraction(4, 8))).toBe(true)
    expect(equals(half, fraction(5, 10))).toBe(true)
  })

  it('recognizes 1/3 = 2/6 = 3/9', () => {
    expect(equals(fraction(1, 3), fraction(2, 6))).toBe(true)
    expect(equals(fraction(1, 3), fraction(3, 9))).toBe(true)
    expect(equals(fraction(1, 3), fraction(3, 10))).toBe(false)
  })

  it('adds 5/8 + 6/8 = 11/8 exactly', () => {
    const sum = add(fraction(5, 8), fraction(6, 8))
    expect(equals(sum, fraction(11, 8))).toBe(true)
    expect(sum).toEqual({ num: 11, den: 8 })
  })

  it('converts 11/8 to 1 whole and 3/8, keeping the family denominator', () => {
    expect(toMixed(fraction(11, 8))).toEqual({ whole: 1, num: 3, den: 8 })
    expect(toMixed(fraction(16, 8))).toEqual({ whole: 2, num: 0, den: 8 })
    expect(toMixed(fraction(3, 8))).toEqual({ whole: 0, num: 3, den: 8 })
  })

  it('subtracts exactly and refuses to go negative', () => {
    expect(subtract(fraction(11, 8), fraction(6, 8))).toEqual({ num: 5, den: 8 })
    expect(() => subtract(fraction(1, 8), fraction(2, 8))).toThrow()
  })

  it('compares by cross-multiplication with no floating point', () => {
    expect(compare(fraction(2, 5), fraction(1, 2))).toBe(-1)
    expect(compare(fraction(3, 5), fraction(1, 2))).toBe(1)
    expect(compare(fraction(5, 10), fraction(1, 2))).toBe(0)
    expect(simplify(fraction(6, 8))).toEqual({ num: 3, den: 4 })
  })

  it('sums ten tenths (and seven sevenths) to exactly one whole', () => {
    expect(matSum(Array(10).fill(10))).toEqual({ num: 1, den: 1 })
    expect(matSum(Array(7).fill(7))).toEqual({ num: 1, den: 1 })
    expect(matSum([2, 4])).toEqual({ num: 3, den: 4 })
    expect(matSum([])).toEqual({ num: 0, den: 1 })
  })
})

describe('frames and the mat', () => {
  it('each circle has exactly n sectors of family n', () => {
    for (const den of DENOMINATORS) {
      let mat: number[] = []
      expect(remainingInFrame(mat, den)).toBe(den)
      for (let i = 0; i < den; i++) mat = lift(mat, den)
      expect(countOf(mat, den)).toBe(den)
      expect(remainingInFrame(mat, den)).toBe(0)
      expect(canLift(mat, den)).toBe(false)
      expect(() => lift(mat, den)).toThrow()
      expect(equals(matSum(mat), fraction(1, 1))).toBe(true)
    }
  })

  it('returning a sector puts it back in its frame', () => {
    let mat = lift(lift(lift([], 5), 3), 5)
    expect(familiesOn(mat)).toEqual([3, 5])
    mat = returnLast(mat, 5)
    expect(countOf(mat, 5)).toBe(1)
    expect(remainingInFrame(mat, 5)).toBe(4)
    mat = returnAt(mat, 0)
    expect(mat).toEqual([3])
    expect(() => returnLast(mat, 7)).toThrow()
    expect(() => returnAt(mat, 4)).toThrow()
  })

  it('the add-mode bank holds spare pieces up to the cap, then stops', () => {
    let mat: number[] = []
    for (let i = 0; i < 11; i++) mat = liftFromBank(mat, 8)
    expect(countOf(mat, 8)).toBe(11) // more than one frame holds — spares in use
    expect(canLiftFromBank(mat, 8)).toBe(true)
    for (let i = 11; i < BANK_WHOLES * 8; i++) mat = liftFromBank(mat, 8)
    expect(canLiftFromBank(mat, 8)).toBe(false)
    expect(() => liftFromBank(mat, 8)).toThrow()
  })

  it('placing 5/8 then 6/8 and removing sectors adds and subtracts exactly', () => {
    let mat: number[] = []
    for (let i = 0; i < 5; i++) mat = liftFromBank(mat, 8)
    for (let i = 0; i < 6; i++) mat = liftFromBank(mat, 8)
    const total = fraction(countOf(mat, 8), 8)
    expect(total).toEqual({ num: 11, den: 8 })
    expect(formatMixed(toMixed(total))).toBe('1 whole + 3/8')
    mat = returnLast(returnLast(returnLast(mat, 8), 8), 8)
    expect(fraction(countOf(mat, 8), 8)).toEqual({ num: 8, den: 8 })
    expect(formatMixed(toMixed(fraction(countOf(mat, 8), 8)))).toBe('1 whole')
    mat = returnLast(mat, 8)
    expect(equals(matSum(mat), fraction(7, 8))).toBe(true)
  })
})

describe('equivalence exercise', () => {
  it('lists every exact fill of 1/2: 2/4, 3/6, 4/8, 5/10', () => {
    expect(equivalentFills(fraction(1, 2))).toEqual([
      { den: 4, count: 2 },
      { den: 6, count: 3 },
      { den: 8, count: 4 },
      { den: 10, count: 5 },
    ])
  })

  it('lists every exact fill of 1/3 (2/6, 3/9) and of 1/4 and 1/5', () => {
    expect(equivalentFills(fraction(1, 3))).toEqual([
      { den: 6, count: 2 },
      { den: 9, count: 3 },
    ])
    expect(equivalentFills(fraction(1, 4))).toEqual([{ den: 8, count: 2 }])
    expect(equivalentFills(fraction(1, 5))).toEqual([{ den: 10, count: 2 }])
  })

  it('accepts 3/6 as an exact fill of 1/2', () => {
    const check = checkEquivalence(fraction(1, 2), [6, 6, 6])
    expect(check.comparison).toBe('exact')
    expect(check.correct).toBe(true)
  })

  it('rejects fifths as a fill of 1/2: 2/5 is under, 3/5 is over', () => {
    const under = checkEquivalence(fraction(1, 2), [5, 5])
    expect(under.comparison).toBe('under')
    expect(under.correct).toBe(false)
    const over = checkEquivalence(fraction(1, 2), [5, 5, 5])
    expect(over.comparison).toBe('over')
    expect(over.correct).toBe(false)
  })

  it('rejects a fill that mixes families even when the total is exact', () => {
    const check = checkEquivalence(fraction(1, 2), [4, 8, 8]) // 1/4 + 2/8 = 1/2
    expect(check.comparison).toBe('exact')
    expect(check.singleFamily).toBe(false)
    expect(check.correct).toBe(false)
  })

  it("rejects using the target's own family, and reports an empty mat", () => {
    const own = checkEquivalence(fraction(1, 2), [2])
    expect(own.usesTargetFamily).toBe(true)
    expect(own.correct).toBe(false)
    expect(checkEquivalence(fraction(1, 2), []).comparison).toBe('empty')
  })
})

describe('names and notation', () => {
  it('names pieces and quantities in family language', () => {
    expect(fractionName(1, 5)).toBe('one fifth')
    expect(fractionName(3, 8)).toBe('three eighths')
    expect(fractionName(1, 2)).toBe('one half')
    expect(fractionName(2, 2)).toBe('two halves')
    expect(fractionName(1, 1)).toBe('one whole')
    expect(fractionName(2, 1)).toBe('two wholes')
    expect(fractionName(11, 8)).toBe('eleven eighths')
  })

  it('writes symbols and mixed forms', () => {
    expect(formatFraction(fraction(1, 5))).toBe('1/5')
    expect(mixedName(toMixed(fraction(11, 8)))).toBe('one whole and three eighths')
    expect(mixedName(toMixed(fraction(3, 8)))).toBe('three eighths')
    expect(formatMixed(toMixed(fraction(16, 8)))).toBe('2 wholes')
    expect(familyName(10, true)).toBe('tenths')
  })
})
