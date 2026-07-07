import { describe, expect, it } from 'vitest'
import { imposeBooklet } from './booklet'
import type { BookletSheet } from './booklet'

describe('imposeBooklet: locked vectors', () => {
  it('8 pages -> 2 sheets, exact imposition', () => {
    expect(imposeBooklet(8)).toEqual([
      { front: [8, 1], back: [2, 7] },
      { front: [6, 3], back: [4, 5] },
    ])
  })

  it('5 pages pad to 8; pages 6, 7, 8 render blank (0) at the end of the book', () => {
    expect(imposeBooklet(5)).toEqual([
      { front: [0, 1], back: [2, 0] },
      { front: [0, 3], back: [4, 5] },
    ])
  })

  it('4 pages -> a single sheet', () => {
    expect(imposeBooklet(4)).toEqual([{ front: [4, 1], back: [2, 3] }])
  })

  it('12 pages (My Book of Numbers) -> exactly 3 duplex sheets', () => {
    expect(imposeBooklet(12)).toEqual([
      { front: [12, 1], back: [2, 11] },
      { front: [10, 3], back: [4, 9] },
      { front: [8, 5], back: [6, 7] },
    ])
  })
})

describe('imposeBooklet: properties', () => {
  it('every content page 1..pageCount appears exactly once across fronts and backs, for 1..40 pages', () => {
    for (let pageCount = 1; pageCount <= 40; pageCount++) {
      const sheets = imposeBooklet(pageCount)
      const pages = sheets
        .flatMap((s: BookletSheet) => [...s.front, ...s.back])
        .filter((p) => p !== 0)
        .sort((a, b) => a - b)
      expect(pages).toEqual(Array.from({ length: pageCount }, (_, i) => i + 1))
    }
  })

  it('0 (blank) appears only when padding is needed, exactly N - pageCount times', () => {
    for (let pageCount = 1; pageCount <= 40; pageCount++) {
      const n = Math.ceil(pageCount / 4) * 4
      const zeros = imposeBooklet(pageCount)
        .flatMap((s: BookletSheet) => [...s.front, ...s.back])
        .filter((p) => p === 0)
      expect(zeros).toHaveLength(n - pageCount)
    }
    // Spot-checks
    expect(
      imposeBooklet(8)
        .flatMap((s) => [...s.front, ...s.back])
        .filter((p) => p === 0),
    ).toHaveLength(0)
    expect(
      imposeBooklet(5)
        .flatMap((s) => [...s.front, ...s.back])
        .filter((p) => p === 0),
    ).toHaveLength(3)
  })

  it('sheet count is ceil(pageCount / 4)', () => {
    expect(imposeBooklet(9)).toHaveLength(3)
    expect(imposeBooklet(12)).toHaveLength(3)
    expect(imposeBooklet(13)).toHaveLength(4)
  })

  it('0 pages -> no sheets', () => {
    expect(imposeBooklet(0)).toEqual([])
  })
})
