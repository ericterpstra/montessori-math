import { describe, it, expect } from 'vitest'
import {
  BOARD_COLUMNS,
  EMPTY_BOARD,
  answerColumn,
  checkAnswer,
  clearStrip,
  placeStrip,
  placements,
  practiceProblem,
  recordWay,
  waysComplete,
  waysToMake,
} from './model'
import type { Way } from './model'

describe('strip placement', () => {
  it('for every a, b in 1–9 the red strip ends at column a+b and never past 18', () => {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const state = placeStrip(placeStrip(EMPTY_BOARD, 'blue', a), 'red', b)
        const [blue, red] = placements(state)
        expect(blue).toEqual({ color: 'blue', length: a, startColumn: 1, endColumn: a })
        expect(red.startColumn).toBe(a + 1)
        expect(red.endColumn).toBe(a + b)
        expect(red.endColumn).toBeLessThanOrEqual(BOARD_COLUMNS)
        expect(answerColumn(state)).toBe(a + b)
      }
    }
  })

  it('longest combination (9 + 9) exactly fills the board', () => {
    const state = placeStrip(placeStrip(EMPTY_BOARD, 'blue', 9), 'red', 9)
    const red = placements(state)[1]
    expect(red.endColumn).toBe(BOARD_COLUMNS)
  })

  it('a red strip laid alone starts at column 1 and there is no answer column yet', () => {
    const state = placeStrip(EMPTY_BOARD, 'red', 5)
    expect(placements(state)).toEqual([{ color: 'red', length: 5, startColumn: 1, endColumn: 5 }])
    expect(answerColumn(state)).toBeNull()
  })

  it('replacing the blue strip repositions the red strip', () => {
    let state = placeStrip(placeStrip(EMPTY_BOARD, 'blue', 4), 'red', 3)
    state = placeStrip(state, 'blue', 7)
    const red = placements(state)[1]
    expect(red.startColumn).toBe(8)
    expect(red.endColumn).toBe(10)
    expect(answerColumn(state)).toBe(10)
  })

  it('clearStrip removes exactly one strip', () => {
    const both = placeStrip(placeStrip(EMPTY_BOARD, 'blue', 6), 'red', 2)
    const noRed = clearStrip(both, 'red')
    expect(placements(noRed)).toEqual([{ color: 'blue', length: 6, startColumn: 1, endColumn: 6 }])
    expect(answerColumn(noRed)).toBeNull()
    expect(placements(clearStrip(noRed, 'blue'))).toEqual([])
  })

  it('rejects strip lengths outside 1–9', () => {
    expect(() => placeStrip(EMPTY_BOARD, 'blue', 0)).toThrow()
    expect(() => placeStrip(EMPTY_BOARD, 'red', 10)).toThrow()
    expect(() => placeStrip(EMPTY_BOARD, 'blue', 2.5)).toThrow()
  })
})

describe('waysToMake', () => {
  it('11 has exactly the 8 ways (2,9), (3,8), … (9,2)', () => {
    const ways = waysToMake(11)
    expect(ways).toHaveLength(8)
    expect(ways).toEqual([
      { blue: 2, red: 9 },
      { blue: 3, red: 8 },
      { blue: 4, red: 7 },
      { blue: 5, red: 6 },
      { blue: 6, red: 5 },
      { blue: 7, red: 4 },
      { blue: 8, red: 3 },
      { blue: 9, red: 2 },
    ])
  })

  it('handles the edges: 2, 10, and 18', () => {
    expect(waysToMake(2)).toEqual([{ blue: 1, red: 1 }])
    expect(waysToMake(18)).toEqual([{ blue: 9, red: 9 }])
    const ten = waysToMake(10)
    expect(ten).toHaveLength(9)
    for (const w of ten) expect(w.blue + w.red).toBe(10)
  })

  it('numbers that cannot be made from two strips have no ways', () => {
    expect(waysToMake(1)).toEqual([])
    expect(waysToMake(19)).toEqual([])
    expect(waysToMake(0)).toEqual([])
  })

  it('every way uses legal strip lengths for all targets 2–18', () => {
    for (let n = 2; n <= 18; n++) {
      const ways = waysToMake(n)
      expect(ways.length).toBeGreaterThan(0)
      for (const w of ways) {
        expect(w.blue).toBeGreaterThanOrEqual(1)
        expect(w.blue).toBeLessThanOrEqual(9)
        expect(w.red).toBeGreaterThanOrEqual(1)
        expect(w.red).toBeLessThanOrEqual(9)
        expect(w.blue + w.red).toBe(n)
      }
    }
  })
})

describe('recordWay / waysComplete', () => {
  it('records valid new ways, sorted by blue strip, and ignores duplicates', () => {
    let found: Way[] = []
    found = recordWay(found, { blue: 9, red: 2 }, 11)
    found = recordWay(found, { blue: 2, red: 9 }, 11)
    found = recordWay(found, { blue: 9, red: 2 }, 11) // duplicate
    expect(found).toEqual([
      { blue: 2, red: 9 },
      { blue: 9, red: 2 },
    ])
  })

  it('refuses pairs that do not make the target', () => {
    const found = recordWay([], { blue: 3, red: 4 }, 11)
    expect(found).toEqual([])
  })

  it('completes exactly when every decomposition is found', () => {
    let found: Way[] = []
    for (const w of waysToMake(11)) {
      expect(waysComplete(found, 11)).toBe(false)
      found = recordWay(found, w, 11)
    }
    expect(found).toHaveLength(8)
    expect(waysComplete(found, 11)).toBe(true)
  })
})

describe('practice problems', () => {
  it('is seed-deterministic: same seed and index always give the same problem', () => {
    for (let i = 0; i < 12; i++) {
      expect(practiceProblem(42, i)).toEqual(practiceProblem(42, i))
    }
  })

  it('different seeds give different sequences', () => {
    const a = Array.from({ length: 10 }, (_, i) => practiceProblem(1, i))
    const b = Array.from({ length: 10 }, (_, i) => practiceProblem(2, i))
    expect(a).not.toEqual(b)
  })

  it('every problem keeps both addends in 1–9', () => {
    for (let i = 0; i < 50; i++) {
      const { a, b } = practiceProblem(123, i)
      expect(a).toBeGreaterThanOrEqual(1)
      expect(a).toBeLessThanOrEqual(9)
      expect(b).toBeGreaterThanOrEqual(1)
      expect(b).toBeLessThanOrEqual(9)
    }
  })

  it('checkAnswer accepts only the true sum column', () => {
    const problem = { a: 7, b: 5 }
    expect(checkAnswer(problem, 12)).toBe(true)
    expect(checkAnswer(problem, 11)).toBe(false)
    expect(checkAnswer(problem, 13)).toBe(false)
  })
})
