import { describe, it, expect } from 'vitest'
import {
  BOARD_ROWS,
  EMPTY_SYMBOL,
  TEN_BOARD_MAX,
  addTenBar,
  addUnitBead,
  beadValue,
  beadsMatchSymbol,
  beadsMatchValue,
  canAddTenBar,
  canAddUnitBead,
  canCountUp,
  checkTarget,
  countUp,
  countingExchange,
  countingPrompt,
  exchangeUnits,
  isCountingDone,
  needsExchange,
  nthTarget,
  numberWord,
  removeTenBar,
  removeUnitBead,
  startCounting,
  symbolValue,
} from './model'

describe('symbol side (board rows + unit cards)', () => {
  it('reads tens*10 + unit card: card 4 on the 30 row is 34', () => {
    expect(symbolValue({ tens: 3, unit: 4 })).toBe(34)
    expect(symbolValue({ tens: 9, unit: 9 })).toBe(99)
  })

  it('a row with no card reads the printed ten', () => {
    expect(symbolValue({ tens: 5, unit: 0 })).toBe(50)
  })

  it('a unit card with no row selected reads nothing', () => {
    expect(symbolValue({ tens: 0, unit: 4 })).toBeNull()
    expect(symbolValue(EMPTY_SYMBOL)).toBeNull()
  })

  it('the board prints exactly the tens 10 through 90', () => {
    expect(BOARD_ROWS).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90])
  })
})

describe('quantity side (ten-bars + unit beads)', () => {
  it('bead value comes from place value: 3 bars + 4 units = 34', () => {
    expect(beadValue({ tenBars: 3, unitBeads: 4 })).toBe(34)
    expect(beadValue({ tenBars: 0, unitBeads: 0 })).toBe(0)
  })

  it('beads match iff tenBars === tens AND unitBeads === units', () => {
    expect(beadsMatchValue({ tenBars: 3, unitBeads: 4 }, 34)).toBe(true)
    // 2 bars + 14 units totals 34 but is not canonical — no match
    expect(beadValue({ tenBars: 2, unitBeads: 14 })).toBe(34)
    expect(beadsMatchValue({ tenBars: 2, unitBeads: 14 }, 34)).toBe(false)
    expect(beadsMatchValue({ tenBars: 3, unitBeads: 5 }, 34)).toBe(false)
  })

  it('beads match the symbol only when a row is chosen', () => {
    expect(beadsMatchSymbol({ tenBars: 3, unitBeads: 4 }, { tens: 3, unit: 4 })).toBe(true)
    expect(beadsMatchSymbol({ tenBars: 3, unitBeads: 4 }, { tens: 0, unit: 4 })).toBe(false)
  })

  it('exchanging gathers exactly ten units into one ten-bar', () => {
    expect(needsExchange({ tenBars: 1, unitBeads: 10 })).toBe(true)
    expect(exchangeUnits({ tenBars: 1, unitBeads: 10 })).toEqual({ tenBars: 2, unitBeads: 0 })
    expect(() => exchangeUnits({ tenBars: 2, unitBeads: 3 })).toThrow()
  })

  it('the supply respects the board maximum of 99', () => {
    expect(canAddUnitBead({ tenBars: 1, unitBeads: 9 })).toBe(true)
    expect(addUnitBead({ tenBars: 1, unitBeads: 9 })).toEqual({ tenBars: 1, unitBeads: 10 })
    expect(canAddUnitBead({ tenBars: 1, unitBeads: 10 })).toBe(false)
    expect(canAddUnitBead({ tenBars: 9, unitBeads: 9 })).toBe(false) // 99 is the max
    expect(canAddTenBar({ tenBars: 8, unitBeads: 9 })).toBe(true) // 89 → 99
    expect(canAddTenBar({ tenBars: 9, unitBeads: 0 })).toBe(false)
    expect(addTenBar({ tenBars: 2, unitBeads: 5 })).toEqual({ tenBars: 3, unitBeads: 5 })
  })

  it('pieces cannot be removed from an empty mat', () => {
    expect(removeUnitBead({ tenBars: 0, unitBeads: 2 })).toEqual({ tenBars: 0, unitBeads: 1 })
    expect(removeTenBar({ tenBars: 1, unitBeads: 0 })).toEqual({ tenBars: 0, unitBeads: 0 })
    expect(() => removeUnitBead({ tenBars: 3, unitBeads: 0 })).toThrow()
    expect(() => removeTenBar({ tenBars: 0, unitBeads: 3 })).toThrow()
  })
})

describe('counting mode', () => {
  it('starts at 10 with one ten-bar and no loose units', () => {
    expect(startCounting()).toEqual({ current: 10, beads: { tenBars: 1, unitBeads: 0 } })
  })

  it('counting on adds one unit bead and advances by one', () => {
    const s = countUp(startCounting())
    expect(s.current).toBe(11)
    expect(s.beads).toEqual({ tenBars: 1, unitBeads: 1 })
  })

  it('stepping 19 → 20 requires the exchange action first', () => {
    let s = startCounting()
    for (let i = 0; i < 9; i++) s = countUp(s)
    expect(s.current).toBe(19)
    expect(s.beads).toEqual({ tenBars: 1, unitBeads: 9 })

    s = countUp(s) // the tenth loose unit goes down…
    expect(s.current).toBe(19) // …but the count has NOT advanced
    expect(s.beads.unitBeads).toBe(10)
    expect(needsExchange(s.beads)).toBe(true)
    expect(canCountUp(s)).toBe(false)
    expect(() => countUp(s)).toThrow()
    expect(countingPrompt(s)).toContain('ten-bar')

    s = countingExchange(s) // the ceremony: ten units become a ten-bar
    expect(s.current).toBe(20)
    expect(s.beads).toEqual({ tenBars: 2, unitBeads: 0 })
  })

  it('exchange is refused when there are not ten loose units', () => {
    expect(() => countingExchange(startCounting())).toThrow()
  })

  it('99 is the maximum: the count stops with 9 bars and 9 units', () => {
    const s: ReturnType<typeof startCounting> = { current: 98, beads: { tenBars: 9, unitBeads: 8 } }
    const at99 = countUp(s)
    expect(at99.current).toBe(99)
    expect(isCountingDone(at99)).toBe(true)
    expect(canCountUp(at99)).toBe(false)
    expect(() => countUp(at99)).toThrow()
    expect(countingPrompt(at99)).toContain('Ninety-nine')
  })

  it('counts every number from 10 to 99 exactly once, exchanging at each ten', () => {
    let s = startCounting()
    const seen = [s.current]
    let exchanges = 0
    let guard = 0
    while (!isCountingDone(s)) {
      if (needsExchange(s.beads)) {
        s = countingExchange(s)
        exchanges++
      } else {
        s = countUp(s)
      }
      if (s.current !== seen[seen.length - 1]) seen.push(s.current)
      // beads always agree with the count (except mid-exchange, when they lead by 1)
      const v = beadValue(s.beads)
      expect(v === s.current || (needsExchange(s.beads) && v === s.current + 1)).toBe(true)
      if (++guard > 500) throw new Error('counting never finished')
    }
    expect(seen).toEqual(Array.from({ length: 90 }, (_, i) => i + 10))
    expect(exchanges).toBe(8) // at 20, 30, … 90
    expect(s.beads).toEqual({ tenBars: 9, unitBeads: 9 })
  })
})

describe('make-the-number mode', () => {
  it('targets are seed-deterministic and within 11–99', () => {
    const a = Array.from({ length: 30 }, (_, i) => nthTarget(1234, i))
    const b = Array.from({ length: 30 }, (_, i) => nthTarget(1234, i))
    expect(a).toEqual(b)
    for (const t of a) {
      expect(t).toBeGreaterThanOrEqual(11)
      expect(t).toBeLessThanOrEqual(TEN_BOARD_MAX)
    }
    const other = Array.from({ length: 30 }, (_, i) => nthTarget(4321, i))
    expect(other).not.toEqual(a)
  })

  it('check marks symbol and beads independently', () => {
    expect(checkTarget(47, { tens: 4, unit: 7 }, { tenBars: 4, unitBeads: 7 })).toEqual({
      symbolCorrect: true,
      beadsCorrect: true,
    })
    expect(checkTarget(47, { tens: 4, unit: 1 }, { tenBars: 4, unitBeads: 7 })).toEqual({
      symbolCorrect: false,
      beadsCorrect: true,
    })
    // right total, wrong form: 3 bars + 17 units is not 47 on the ten board
    expect(checkTarget(47, { tens: 4, unit: 7 }, { tenBars: 3, unitBeads: 17 })).toEqual({
      symbolCorrect: true,
      beadsCorrect: false,
    })
  })
})

describe('number words', () => {
  it('names teens, tens, and composed numbers', () => {
    expect(numberWord(10)).toBe('ten')
    expect(numberWord(17)).toBe('seventeen')
    expect(numberWord(20)).toBe('twenty')
    expect(numberWord(34)).toBe('thirty-four')
    expect(numberWord(99)).toBe('ninety-nine')
  })

  it('refuses numbers not on the board', () => {
    expect(() => numberWord(9)).toThrow()
    expect(() => numberWord(100)).toThrow()
  })
})
