import { describe, it, expect } from 'vitest'
import {
  STAIR_ROWS,
  allNumeralsMatched,
  bankBars,
  checkRows,
  createState,
  fits,
  isStairComplete,
  overhang,
  placeBar,
  placeNumeral,
  removeBar,
  removeNumeral,
  trayNumerals,
  withStairBuilt,
} from './model'

describe('fits / overhang (control of error)', () => {
  it('bar n fits only row n, across all 81 combinations', () => {
    for (let row = 1; row <= 9; row++) {
      for (let bar = 1; bar <= 9; bar++) {
        expect(fits(row, bar)).toBe(row === bar)
      }
    }
  })

  it('overhang is positive for a too-long bar, negative for a too-short one, zero when it fits', () => {
    expect(overhang(3, 5)).toBe(2)
    expect(overhang(7, 4)).toBe(-3)
    expect(overhang(6, 6)).toBe(0)
  })
})

describe('createState', () => {
  it('starts with all nine bars in the bank, all nine numerals in the tray, and an empty stair', () => {
    const s = createState(123)
    expect([...s.bankOrder].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect([...s.numeralOrder].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(bankBars(s)).toEqual([...s.bankOrder])
    expect(trayNumerals(s)).toEqual([...s.numeralOrder])
    expect(s.placed).toEqual({})
    expect(isStairComplete(s)).toBe(false)
  })

  it('shuffle is seed-deterministic: same seed same order, different seed different order', () => {
    expect(createState(42)).toEqual(createState(42))
    expect(createState(1).bankOrder).not.toEqual(createState(2).bankOrder)
  })
})

describe('placing bars', () => {
  it('moves a bar from the bank to a row', () => {
    const s = placeBar(createState(7), 4, 4)
    expect(s.placed[4]).toBe(4)
    expect(bankBars(s)).toHaveLength(8)
    expect(bankBars(s)).not.toContain(4)
  })

  it('allows a wrong placement, which fits() and checkRows() flag', () => {
    const s = placeBar(createState(7), 5, 3)
    expect(s.placed[3]).toBe(5)
    expect(fits(3, 5)).toBe(false)
    expect(checkRows(s).find((c) => c.row === 3)?.barCorrect).toBe(false)
  })

  it('returns the previous occupant to the bank when placing onto an occupied row', () => {
    let s = placeBar(createState(7), 5, 3)
    s = placeBar(s, 3, 3)
    expect(s.placed[3]).toBe(3)
    expect(bankBars(s)).toContain(5)
    expect(bankBars(s)).toHaveLength(8)
  })

  it('moves a bar off its old row when re-placed elsewhere', () => {
    let s = placeBar(createState(7), 6, 2)
    s = placeBar(s, 6, 6)
    expect(s.placed[2]).toBeUndefined()
    expect(s.placed[6]).toBe(6)
  })

  it('rejects out-of-range rows and bar sizes', () => {
    expect(() => placeBar(createState(7), 10, 1)).toThrow()
    expect(() => placeBar(createState(7), 1, 0)).toThrow()
  })
})

describe('stair completeness', () => {
  it('is complete iff all nine bars sit on their own rows', () => {
    let s = createState(99)
    for (const r of STAIR_ROWS) {
      expect(isStairComplete(s)).toBe(false)
      s = placeBar(s, r, r)
    }
    expect(isStairComplete(s)).toBe(true)
    expect(checkRows(s).every((c) => c.barCorrect)).toBe(true)
  })

  it('is not complete when two bars are swapped, even though all rows are filled', () => {
    let s = withStairBuilt(createState(99))
    s = placeBar(s, 8, 9)
    s = placeBar(s, 9, 8)
    expect(isStairComplete(s)).toBe(false)
    const checks = checkRows(s)
    expect(checks.filter((c) => !c.barCorrect).map((c) => c.row)).toEqual([8, 9])
  })
})

describe('reset and removal restore the full bank', () => {
  it('removeBar returns the bar to its shuffled bank position and its numeral to the tray', () => {
    const fresh = createState(7)
    let s = withStairBuilt(fresh)
    s = placeNumeral(s, 5, 5)
    s = removeBar(s, 5)
    expect(s.placed[5]).toBeUndefined()
    expect(s.numerals[5]).toBeUndefined()
    expect(bankBars(s)).toEqual(fresh.bankOrder.filter((n) => n === 5))
    expect(trayNumerals(s)).toEqual([...fresh.numeralOrder])
  })

  it('a fresh state from the same seed restores the full bank exactly (Reset)', () => {
    let s = createState(31)
    s = placeBar(s, 1, 1)
    s = placeBar(s, 7, 2)
    expect(bankBars(s)).toHaveLength(7)
    const reset = createState(31)
    expect(bankBars(reset)).toHaveLength(9)
    expect(reset).toEqual(createState(31))
  })
})

describe('numeral matching', () => {
  it('pairs a numeral with a placed bar and flags a correct match', () => {
    let s = withStairBuilt(createState(5))
    s = placeNumeral(s, 4, 4)
    expect(s.numerals[4]).toBe(4)
    expect(trayNumerals(s)).not.toContain(4)
    expect(checkRows(s).find((c) => c.row === 4)?.numeralCorrect).toBe(true)
  })

  it('flags a mismatched numeral', () => {
    let s = withStairBuilt(createState(5))
    s = placeNumeral(s, 7, 5)
    expect(checkRows(s).find((c) => c.row === 5)?.numeralCorrect).toBe(false)
    expect(allNumeralsMatched(s)).toBe(false)
  })

  it('ignores placing a numeral on an empty row', () => {
    const s = createState(5)
    expect(placeNumeral(s, 3, 3)).toEqual(s)
  })

  it('moves a numeral when it is placed on a second row, and removeNumeral returns it to the tray', () => {
    let s = withStairBuilt(createState(5))
    s = placeNumeral(s, 2, 6)
    s = placeNumeral(s, 2, 2)
    expect(s.numerals[6]).toBeUndefined()
    expect(s.numerals[2]).toBe(2)
    s = removeNumeral(s, 2)
    expect(s.numerals[2]).toBeUndefined()
    expect(trayNumerals(s)).toContain(2)
  })

  it('allNumeralsMatched only when all nine tiles sit beside their bars', () => {
    let s = withStairBuilt(createState(5))
    for (const r of STAIR_ROWS) {
      expect(allNumeralsMatched(s)).toBe(false)
      s = placeNumeral(s, r, r)
    }
    expect(allNumeralsMatched(s)).toBe(true)
    expect(checkRows(s).every((c) => c.numeralCorrect)).toBe(true)
  })
})
