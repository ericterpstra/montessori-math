import { describe, it, expect } from 'vitest'
import {
  decompose,
  compose,
  countsFromNumber,
  totalValue,
  addToCounts,
  canExchangeUp,
  exchangeUp,
  canExchangeDown,
  exchangeDown,
  normalize,
  formatNumber,
  placeInfo,
  type PlaceCounts,
} from './placeValue'

describe('decompose', () => {
  it('breaks a whole number into place digits, highest first', () => {
    expect(decompose(3251)).toEqual([
      { power: 3, digit: 3 },
      { power: 2, digit: 2 },
      { power: 1, digit: 5 },
      { power: 0, digit: 1 },
    ])
  })

  it('keeps interior zeros', () => {
    expect(decompose(4053)).toEqual([
      { power: 3, digit: 4 },
      { power: 2, digit: 0 },
      { power: 1, digit: 5 },
      { power: 0, digit: 3 },
    ])
  })

  it('handles zero', () => {
    expect(decompose(0)).toEqual([{ power: 0, digit: 0 }])
  })

  it('reaches the millions', () => {
    const d = decompose(1_000_000)
    expect(d[0]).toEqual({ power: 6, digit: 1 })
    expect(d).toHaveLength(7)
  })

  it('supports decimal places', () => {
    expect(decompose(0.75, { minPower: -2 })).toEqual([
      { power: -1, digit: 7 },
      { power: -2, digit: 5 },
    ])
    expect(decompose(2.107, { minPower: -3 })).toEqual([
      { power: 0, digit: 2 },
      { power: -1, digit: 1 },
      { power: -2, digit: 0 },
      { power: -3, digit: 7 },
    ])
  })

  it('rejects negatives and out-of-range values', () => {
    expect(() => decompose(-5)).toThrow()
    expect(() => decompose(10_000_000)).toThrow()
  })
})

describe('compose', () => {
  it('is the inverse of decompose', () => {
    for (const n of [0, 7, 19, 305, 3251, 9999, 480_062]) {
      expect(compose(decompose(n))).toBe(n)
    }
  })

  it('round-trips decimals exactly', () => {
    expect(compose(decompose(48_062.107, { minPower: -3 }))).toBe(48_062.107)
    expect(compose(decompose(0.1, { minPower: -1 }))).toBe(0.1)
  })
})

describe('counts and total value', () => {
  it('countsFromNumber omits zero places', () => {
    expect(countsFromNumber(305)).toEqual({ 2: 3, 0: 5 })
  })

  it('totalValue sums mixed counts (more than 9 allowed per place)', () => {
    expect(totalValue({ 0: 27, 1: 14 })).toBe(167)
  })

  it('totalValue is exact for decimals', () => {
    const counts: PlaceCounts = { [-1]: 1, [-2]: 2 }
    expect(totalValue(counts)).toBe(0.12)
  })

  it('addToCounts is immutable and drops zeroed places', () => {
    const before: PlaceCounts = { 0: 2 }
    const after = addToCounts(before, 0, -2)
    expect(before).toEqual({ 0: 2 })
    expect(after).toEqual({})
    expect(() => addToCounts(before, 0, -3)).toThrow()
  })
})

describe('exchanging', () => {
  it('exchanges 10 units up to 1 ten', () => {
    expect(exchangeUp({ 0: 10 }, 0)).toEqual({ 1: 1 })
    expect(exchangeUp({ 0: 13, 1: 2 }, 0)).toEqual({ 0: 3, 1: 3 })
  })

  it('guards exchanges up', () => {
    expect(canExchangeUp({ 0: 9 }, 0)).toBe(false)
    expect(canExchangeUp({ 6: 10 }, 6)).toBe(false)
    expect(() => exchangeUp({ 0: 9 }, 0)).toThrow()
  })

  it('exchanges 1 ten down to 10 units, and units down to tenths', () => {
    expect(exchangeDown({ 1: 1 }, 1)).toEqual({ 0: 10 })
    expect(exchangeDown({ 0: 1 }, 0)).toEqual({ [-1]: 10 })
  })

  it('guards exchanges down at thousandths', () => {
    expect(canExchangeDown({ [-3]: 5 }, -3)).toBe(false)
  })

  it('preserves total value through exchanges', () => {
    const start: PlaceCounts = { 0: 12, 1: 3 }
    expect(totalValue(exchangeUp(start, 0))).toBe(totalValue(start))
    expect(totalValue(exchangeDown(start, 1))).toBe(totalValue(start))
  })
})

describe('normalize', () => {
  it('carries everything to ≤9 per place', () => {
    expect(normalize({ 0: 27, 1: 14 })).toEqual({ 2: 1, 1: 6, 0: 7 })
  })

  it('carries across multiple places (golden bead style)', () => {
    // 1,568 + 1,679 laid out as combined counts
    const combined: PlaceCounts = { 3: 2, 2: 11, 1: 13, 0: 17 }
    expect(normalize(combined)).toEqual(countsFromNumber(3247))
  })

  it('preserves value', () => {
    const messy: PlaceCounts = { 0: 45, 1: 23, 2: 10 }
    expect(totalValue(normalize(messy))).toBe(totalValue(messy))
  })
})

describe('placeInfo and formatting', () => {
  it('knows names and colors', () => {
    expect(placeInfo(1).name).toBe('tens')
    expect(placeInfo(0).colorVar).toBe('var(--pv-unit)')
    expect(placeInfo(-1).singular).toBe('tenth')
    expect(placeInfo(3).value).toBe(1000)
  })

  it('formats with US commas and up to 3 decimals', () => {
    expect(formatNumber(1_234_567)).toBe('1,234,567')
    expect(formatNumber(0.125)).toBe('0.125')
    expect(formatNumber(3251)).toBe('3,251')
  })
})
