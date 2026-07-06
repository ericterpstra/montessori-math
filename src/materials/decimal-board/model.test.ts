import { describe, it, expect } from 'vitest'
import { totalValue } from '../../lib/placeValue'
import type { PlaceCounts } from '../../lib/placeValue'
import { createRng } from '../../lib/rng'
import {
  DECIMAL_PLACES,
  MAX_PER_PLACE,
  MAX_SCALED,
  allOk,
  checkAgainstScaled,
  combineRegions,
  compareRegions,
  compareScaled,
  comparisonWords,
  countsFromScaled,
  digitAtScaled,
  exchangeDownIn,
  exchangeUpIn,
  expectedScaled,
  formatProblem,
  formatScaled,
  generateProblem,
  generateTarget,
  hasBorrowScaled,
  hasCarryScaled,
  isNormalized,
  readsExactly,
  removePiece,
  returnToBank,
  scaledValue,
  takeFromBank,
  undoRemove,
} from './model'
import type { DecimalPlace } from './model'

function expectOk<T>(r: { ok: true; value: T } | { ok: false; message: string }): T {
  if (!r.ok) throw new Error(`expected ok, got refusal: ${r.message}`)
  return r.value
}

describe('exact decimal arithmetic — the whole point of the board', () => {
  it('0.1 + 0.2 === 0.3 exactly through the model, where floats drift', () => {
    expect(0.1 + 0.2).not.toBe(0.3) // raw floats get this wrong…
    const tenth = countsFromScaled(100) // …the board counts pieces instead
    const twoTenths = countsFromScaled(200)
    const together = combineRegions([tenth, twoTenths])
    expect(scaledValue(together)).toBe(300)
    expect(compareRegions(together, countsFromScaled(300))).toBe('=')
    expect(formatScaled(scaledValue(together))).toBe('0.3')
  })

  it('scaled counts round-trip exactly for every value 0.001–9.999', () => {
    for (let s = 1; s <= MAX_SCALED; s++) {
      if (scaledValue(countsFromScaled(s)) !== s) {
        throw new Error(`round-trip failed at ${s}`)
      }
    }
    expect(scaledValue(countsFromScaled(MAX_SCALED))).toBe(MAX_SCALED)
    expect(countsFromScaled(2347)).toEqual({ 0: 2, '-1': 3, '-2': 4, '-3': 7 })
    expect(() => countsFromScaled(10000)).toThrow()
  })

  it('agrees with the shared lib totalValue on decimal regions', () => {
    const region: PlaceCounts = { 0: 2, '-1': 3, '-2': 4, '-3': 7 }
    expect(scaledValue(region)).toBe(2347)
    expect(totalValue(region)).toBe(2.347)
  })

  it('formats values from the integer, never a float', () => {
    expect(formatScaled(2347)).toBe('2.347')
    expect(formatScaled(300)).toBe('0.3')
    expect(formatScaled(1750)).toBe('1.75')
    expect(formatScaled(25)).toBe('0.025')
    expect(formatScaled(5000)).toBe('5')
    expect(formatScaled(0)).toBe('0')
    expect(() => formatScaled(1.5)).toThrow()
  })
})

describe('exchange across the decimal point preserves value', () => {
  it('1 unit ↔ 10 tenths, both directions, value unchanged', () => {
    let region: PlaceCounts = { 0: 1 }
    region = expectOk(exchangeDownIn(region, 0))
    expect(region).toEqual({ '-1': 10 })
    expect(scaledValue(region)).toBe(1000)
    region = expectOk(exchangeUpIn(region, -1))
    expect(region).toEqual({ 0: 1 })
    expect(scaledValue(region)).toBe(1000)
  })

  it('every adjacent boundary trades 10-for-1 without changing the value', () => {
    for (const upper of [0, -1, -2] as const) {
      const lower = (upper - 1) as DecimalPlace
      let region: PlaceCounts = { [upper]: 3 }
      const before = scaledValue(region)
      region = expectOk(exchangeDownIn(region, upper))
      expect(region[lower]).toBe(10)
      expect(scaledValue(region)).toBe(before)
      region = expectOk(exchangeUpIn(region, lower))
      expect(scaledValue(region)).toBe(before)
      expect(region[upper]).toBe(3)
    }
  })

  it('guards the edges of the board and the ten-piece rule', () => {
    expect(exchangeUpIn({ 0: 10 }, 0).ok).toBe(false) // no tens column
    expect(exchangeDownIn({ '-3': 5 }, -3).ok).toBe(false) // nothing smaller
    expect(exchangeUpIn({ '-1': 9 }, -1).ok).toBe(false) // nine is not ten
    expect(exchangeDownIn({ '-1': 0 }, -1).ok).toBe(false) // nothing to break
    // Cap guard: breaking a unit when the tenths column is nearly full refuses.
    expect(exchangeDownIn({ 0: 1, '-1': MAX_PER_PLACE - 5 }, 0).ok).toBe(false)
  })
})

describe('comparison on scaled integers', () => {
  it('0.3 > 0.25 despite “25 looks bigger”', () => {
    expect(compareRegions(countsFromScaled(300), countsFromScaled(250))).toBe('>')
    expect(compareScaled(300, 250)).toBe('>')
    expect(comparisonWords('>')).toBe('greater than')
  })

  it('handles <, =, and unnormalized boards by true value', () => {
    expect(compareRegions(countsFromScaled(250), countsFromScaled(300))).toBe('<')
    expect(compareRegions(countsFromScaled(1750), countsFromScaled(1750))).toBe('=')
    // 12 tenths (1.2) beats 1 unit 1 tenth (1.1) even before exchanging.
    expect(compareRegions({ '-1': 12 }, { 0: 1, '-1': 1 })).toBe('>')
    // 0.4 vs 0.399: the shorter numeral wins.
    expect(compareRegions(countsFromScaled(400), countsFromScaled(399))).toBe('>')
  })
})

describe('subtraction — 2.1 − 0.35 borrows across the decimal point', () => {
  it('forces both exchanges and reads 1.75', () => {
    let board = countsFromScaled(2100) // 2 units, 1 tenth
    let removed: PlaceCounts = {}
    const take = (place: DecimalPlace, times: number) => {
      for (let i = 0; i < times; i++) {
        const r = expectOk(removePiece(board, removed, place))
        board = r.board
        removed = r.removed
      }
    }

    // Hundredths: need 5, have 0 — the board refuses and points at the tenth.
    const noHundredths = removePiece(board, removed, -2)
    expect(noHundredths.ok).toBe(false)
    if (!noHundredths.ok) expect(noHundredths.message).toMatch(/tenth/)
    board = expectOk(exchangeDownIn(board, -1)) // 1 tenth → 10 hundredths
    take(-2, 5)

    // Tenths: need 3, have 0 — the borrow must cross the decimal point.
    const noTenths = removePiece(board, removed, -1)
    expect(noTenths.ok).toBe(false)
    if (!noTenths.ok) expect(noTenths.message).toMatch(/unit/)
    board = expectOk(exchangeDownIn(board, 0)) // 1 unit → 10 tenths
    expect(scaledValue(board)).toBe(2100 - 50) // value preserved through it all
    take(-1, 3)

    expect(scaledValue(board)).toBe(1750)
    expect(board).toEqual({ 0: 1, '-1': 7, '-2': 5 })
    expect(formatScaled(scaledValue(board))).toBe('1.75')
    expect(scaledValue(removed)).toBe(350)
    expect(allOk(checkAgainstScaled(board, 1750))).toBe(true)
    expect(allOk(checkAgainstScaled(removed, 350))).toBe(true)
  })

  it('refuses honestly when everything is empty, and undoes removals', () => {
    expect(removePiece({}, {}, 0).ok).toBe(false)
    // Empty tenths AND hundredths: the hint names the unit, two columns up.
    const r = removePiece({ 0: 2 }, {}, -2)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/unit/)

    const step = expectOk(removePiece({ '-1': 3 }, {}, -1))
    expect(step.removed).toEqual({ '-1': 1 })
    const undone = expectOk(undoRemove(step.board, step.removed, -1))
    expect(undone.board).toEqual({ '-1': 3 })
    expect(undone.removed).toEqual({})
    expect(undoRemove({}, {}, -1).ok).toBe(false)
  })
})

describe('make the number — the check flags exactly the wrong places', () => {
  it('marks a correct build all-✓', () => {
    const checks = checkAgainstScaled(countsFromScaled(2347), 2347)
    expect(checks).toHaveLength(4)
    expect(allOk(checks)).toBe(true)
    expect(checks.map((c) => c.place)).toEqual([...DECIMAL_PLACES])
  })

  it('flags only the wrong columns, with expected vs actual', () => {
    // Target 2.347 built with 4 tenths instead of 3: only the tenths are wrong.
    const oneOff: PlaceCounts = { 0: 2, '-1': 4, '-2': 4, '-3': 7 }
    const checks = checkAgainstScaled(oneOff, 2347)
    const wrong = checks.filter((c) => !c.ok)
    expect(wrong).toHaveLength(1)
    expect(wrong[0]).toMatchObject({ place: -1, expected: 3, actual: 4, needsExchange: false })
  })

  it('is honest about unexchanged columns even when the value matches', () => {
    // 2 units + 2 tenths + 14 hundredths + 7 thousandths is WORTH 2.347…
    const unexchanged: PlaceCounts = { 0: 2, '-1': 2, '-2': 14, '-3': 7 }
    expect(scaledValue(unexchanged)).toBe(2347)
    // …but it does not READ 2.347 until the hundredths are traded up.
    const checks = checkAgainstScaled(unexchanged, 2347)
    const byPlace = new Map(checks.map((c) => [c.place, c]))
    expect(byPlace.get(-1)).toMatchObject({ ok: false, expected: 3, actual: 2 })
    expect(byPlace.get(-2)).toMatchObject({ ok: false, expected: 4, actual: 14, needsExchange: true })
    expect(byPlace.get(0)?.ok).toBe(true)
    expect(byPlace.get(-3)?.ok).toBe(true)
    expect(isNormalized(unexchanged)).toBe(false)
    expect(readsExactly(unexchanged, 2347)).toBe(false)
    expect(readsExactly(countsFromScaled(2347), 2347)).toBe(true)
  })
})

describe('addition — combine then exchange, value preserved throughout', () => {
  it('1.4 + 0.75: eleven tenths trade into a unit, reading 2.15', () => {
    const rows = [countsFromScaled(1400), countsFromScaled(750)]
    let board = combineRegions(rows)
    expect(board).toEqual({ 0: 1, '-1': 11, '-2': 5 })
    expect(scaledValue(board)).toBe(2150)
    expect(isNormalized(board)).toBe(false)
    board = expectOk(exchangeUpIn(board, -1)) // ten tenths → one unit
    expect(scaledValue(board)).toBe(2150)
    expect(board).toEqual({ 0: 2, '-1': 1, '-2': 5 })
    expect(readsExactly(board, 2150)).toBe(true)
    expect(formatScaled(scaledValue(board))).toBe('2.15')
  })

  it('0.999 + 0.001 cascades three exchanges up to a single unit', () => {
    let board = combineRegions([countsFromScaled(999), countsFromScaled(1)])
    for (const place of [-3, -2, -1] as const) {
      board = expectOk(exchangeUpIn(board, place))
      expect(scaledValue(board)).toBe(1000)
    }
    expect(board).toEqual({ 0: 1 })
  })
})

describe('bank guards', () => {
  it('caps the supply and refuses to give back what is not there', () => {
    let region: PlaceCounts = { '-3': MAX_PER_PLACE - 1 }
    region = expectOk(takeFromBank(region, -3))
    expect(region['-3']).toBe(MAX_PER_PLACE)
    expect(takeFromBank(region, -3).ok).toBe(false)
    expect(returnToBank({}, -1).ok).toBe(false)
    const back = expectOk(returnToBank({ '-1': 2 }, -1))
    expect(back).toEqual({ '-1': 1 })
  })
})

describe('seeded targets and problems', () => {
  it('is deterministic for the same seed', () => {
    expect(generateTarget(createRng(7))).toBe(generateTarget(createRng(7)))
    expect(generateProblem('add', createRng(42))).toEqual(generateProblem('add', createRng(42)))
    expect(generateProblem('subtract', createRng(42))).toEqual(generateProblem('subtract', createRng(42)))
  })

  it('generates workable problems inside the board’s range', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const target = generateTarget(createRng(seed))
      expect(target).toBeGreaterThanOrEqual(1)
      expect(target).toBeLessThanOrEqual(MAX_SCALED)

      const add = generateProblem('add', createRng(seed))
      expect(add.a + add.b).toBeLessThanOrEqual(MAX_SCALED)
      expect(hasCarryScaled(add.a, add.b)).toBe(true)
      expect(expectedScaled('add', add)).toBe(add.a + add.b)

      const sub = generateProblem('subtract', createRng(seed))
      expect(sub.a).toBeGreaterThan(sub.b)
      expect(sub.a).toBeLessThanOrEqual(MAX_SCALED)
      expect(hasBorrowScaled(sub.a, sub.b)).toBe(true)
      expect(expectedScaled('subtract', sub)).toBe(sub.a - sub.b)
    }
  })

  it('formats problems and digits from scaled integers', () => {
    expect(formatProblem('subtract', { a: 2100, b: 350 })).toBe('2.1 − 0.35')
    expect(formatProblem('add', { a: 1400, b: 750 })).toBe('1.4 + 0.75')
    expect(digitAtScaled(2347, 0)).toBe(2)
    expect(digitAtScaled(2347, -1)).toBe(3)
    expect(digitAtScaled(2347, -2)).toBe(4)
    expect(digitAtScaled(2347, -3)).toBe(7)
    expect(hasBorrowScaled(2100, 350)).toBe(true)
    expect(hasCarryScaled(1230, 450)).toBe(false)
  })
})
