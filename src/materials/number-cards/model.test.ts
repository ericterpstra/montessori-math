import { describe, it, expect } from 'vitest'
import { createRng } from '../../lib/rng'
import {
  allCorrect,
  bankColumns,
  cardValue,
  checkSelection,
  composedValue,
  expandedParts,
  expansionText,
  randomTarget,
  removeCard,
  selectCard,
  selectionFromNumber,
  stackReading,
} from './model'
import type { Selection } from './model'

describe('bank layout', () => {
  it('lays out four columns of nine cards, thousands to units', () => {
    const cols = bankColumns()
    expect(cols.map((c) => c.place)).toEqual([3, 2, 1, 0])
    expect(cols.map((c) => c.label)).toEqual(['Thousands', 'Hundreds', 'Tens', 'Units'])
    for (const col of cols) expect(col.cards).toHaveLength(9)
    expect(cols[0].cards).toEqual([1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000])
    expect(cols[3].cards).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(cardValue(2, 7)).toBe(700)
  })
})

describe('composing cards', () => {
  it('composing {3000, 200, 50, 1} reads 3251', () => {
    let sel: Selection = {}
    sel = selectCard(sel, 3, 3)
    sel = selectCard(sel, 2, 2)
    sel = selectCard(sel, 1, 5)
    sel = selectCard(sel, 0, 1)
    expect(expandedParts(sel)).toEqual([3000, 200, 50, 1])
    expect(composedValue(sel)).toBe(3251)
    expect(stackReading(sel)).toBe('3251')
    expect(expansionText(sel)).toBe('3,000 + 200 + 50 + 1')
  })

  it('keeps at most one card per place — a second ten replaces the first', () => {
    let sel: Selection = { 3: 3, 1: 5 }
    sel = selectCard(sel, 1, 2)
    expect(sel[1]).toBe(2)
    expect(expandedParts(sel)).toEqual([3000, 20])
    expect(composedValue(sel)).toBe(3020)
  })

  it('tapping the chosen card again returns it to the bank, as does removeCard', () => {
    let sel: Selection = selectCard({}, 2, 4)
    expect(sel[2]).toBe(4)
    sel = selectCard(sel, 2, 4)
    expect(sel[2]).toBeUndefined()
    expect(removeCard({ 3: 9, 0: 6 }, 3)).toEqual({ 0: 6 })
  })

  it('rejects digits outside 1–9', () => {
    expect(() => selectCard({}, 0, 0)).toThrow()
    expect(() => selectCard({}, 0, 10)).toThrow()
    expect(() => selectCard({}, 0, 2.5)).toThrow()
  })

  it('zero-place numbers use no card in the zero place (4053 has no hundreds card)', () => {
    const sel = selectionFromNumber(4053)
    expect(sel).toEqual({ 3: 4, 1: 5, 0: 3 })
    expect(sel[2]).toBeUndefined()
    expect(composedValue(sel)).toBe(4053)
  })
})

describe('expanded and composed views always agree', () => {
  it('stack reading equals the composed value for every number 1–9999', () => {
    for (let n = 1; n <= 9999; n++) {
      const sel = selectionFromNumber(n)
      expect(composedValue(sel)).toBe(n)
      expect(stackReading(sel)).toBe(String(n))
    }
  })

  it('handles zeros anywhere: 4053, 4003, 4050, 1000', () => {
    expect(expandedParts(selectionFromNumber(4053))).toEqual([4000, 50, 3])
    expect(stackReading(selectionFromNumber(4053))).toBe('4053')
    expect(expandedParts(selectionFromNumber(4003))).toEqual([4000, 3])
    expect(stackReading(selectionFromNumber(4003))).toBe('4003')
    expect(expandedParts(selectionFromNumber(4050))).toEqual([4000, 50])
    expect(stackReading(selectionFromNumber(4050))).toBe('4050')
    expect(expandedParts(selectionFromNumber(1000))).toEqual([1000])
    expect(stackReading(selectionFromNumber(1000))).toBe('1000')
  })
})

describe('check (control of error)', () => {
  it('flags exactly the wrong places', () => {
    // target 3251, child chose 3000, 200, 40, 1 — only the tens are wrong
    const checks = checkSelection({ 3: 3, 2: 2, 1: 4, 0: 1 }, 3251)
    expect(checks.map((c) => c.correct)).toEqual([true, true, false, true])
    expect(checks[2]).toMatchObject({ label: 'Tens', expected: 5, actual: 4 })
    expect(allCorrect(checks)).toBe(false)
  })

  it('flags a missing card and an extra card in a zero place', () => {
    // target 4053: no hundreds card belongs; child added 200 and forgot the units
    const checks = checkSelection({ 3: 4, 2: 2, 1: 5 }, 4053)
    const byLabel = Object.fromEntries(checks.map((c) => [c.label, c]))
    expect(byLabel['Thousands'].correct).toBe(true)
    expect(byLabel['Tens'].correct).toBe(true)
    expect(byLabel['Hundreds']).toMatchObject({ correct: false, expected: 0, actual: 2 })
    expect(byLabel['Units']).toMatchObject({ correct: false, expected: 3, actual: 0 })
  })

  it('passes a fully correct build', () => {
    const checks = checkSelection(selectionFromNumber(9080), 9080)
    expect(allCorrect(checks)).toBe(true)
    expect(checks).toHaveLength(4)
  })
})

describe('random targets', () => {
  it('is deterministic for a seed and stays in range with at least two cards', () => {
    const a = createRng(42)
    const b = createRng(42)
    const seqA = Array.from({ length: 25 }, () => randomTarget(a))
    const seqB = Array.from({ length: 25 }, () => randomTarget(b))
    expect(seqA).toEqual(seqB)
    for (const n of seqA) {
      expect(n).toBeGreaterThanOrEqual(11)
      expect(n).toBeLessThanOrEqual(9999)
      expect(expandedParts(selectionFromNumber(n)).length).toBeGreaterThanOrEqual(2)
    }
  })
})
