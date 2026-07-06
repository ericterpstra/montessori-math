import { describe, it, expect } from 'vitest'
import {
  BOARD_MAX,
  MAX_SUBTRAHEND,
  answerColumn,
  coverSpan,
  evaluateTap,
  headerColor,
  isValidProblem,
  practiceProblems,
  stripSpan,
  waysToTakeFrom,
} from './model'

describe('cover strip', () => {
  it('hides exactly columns a+1 … 18 for every minuend', () => {
    for (let a = 1; a <= BOARD_MAX; a++) {
      const span = coverSpan(a)
      expect(span.start).toBe(a + 1)
      expect(span.end).toBe(BOARD_MAX)
    }
  })

  it('covers nothing when the whole board is in use (a = 18)', () => {
    const span = coverSpan(BOARD_MAX)
    expect(span.start).toBeGreaterThan(span.end)
  })

  it('rejects minuends that are not on the board', () => {
    expect(() => coverSpan(0)).toThrow()
    expect(() => coverSpan(19)).toThrow()
    expect(() => coverSpan(7.5)).toThrow()
  })
})

describe('blue strip placement', () => {
  it('occupies exactly a−b+1 … a and answers a−b for every valid a, b', () => {
    for (let a = 2; a <= BOARD_MAX; a++) {
      for (let b = 1; b <= Math.min(MAX_SUBTRAHEND, a - 1); b++) {
        expect(isValidProblem(a, b)).toBe(true)
        const span = stripSpan(a, b)
        expect(span.start).toBe(a - b + 1)
        expect(span.end).toBe(a)
        // The strip is b squares long and the answer sits just left of it.
        expect(span.end - span.start + 1).toBe(b)
        expect(answerColumn(a, b)).toBe(a - b)
        expect(answerColumn(a, b)).toBe(span.start - 1)
      }
    }
  })

  it('rejects b ≥ a — the board answers 1 and up', () => {
    expect(isValidProblem(5, 5)).toBe(false)
    expect(isValidProblem(3, 7)).toBe(false)
    expect(() => stripSpan(9, 9)).toThrow()
    expect(() => answerColumn(4, 6)).toThrow()
  })

  it('rejects subtrahends that are not blue strips (1–9)', () => {
    expect(isValidProblem(15, 10)).toBe(false)
    expect(isValidProblem(12, 0)).toBe(false)
    expect(isValidProblem(12, -3)).toBe(false)
    expect(() => stripSpan(15, 10)).toThrow()
  })

  it('rejects minuends off the board', () => {
    expect(isValidProblem(19, 4)).toBe(false)
    expect(isValidProblem(1, 1)).toBe(false)
    expect(() => stripSpan(19, 4)).toThrow()
  })
})

describe('header numerals', () => {
  it('are blue through 9 and red from 10 to 18', () => {
    expect(headerColor(1)).toBe('blue')
    expect(headerColor(9)).toBe('blue')
    expect(headerColor(10)).toBe('red')
    expect(headerColor(18)).toBe('red')
  })
})

describe('practice evaluation', () => {
  it('marks only the true difference as correct', () => {
    const problem = { a: 13, b: 5, answer: 8 }
    expect(evaluateTap(problem, 8)).toEqual({ correct: true, expected: 8 })
    expect(evaluateTap(problem, 9)).toEqual({ correct: false, expected: 8 })
    expect(evaluateTap(problem, 13).correct).toBe(false)
  })
})

describe('ways to take from N', () => {
  it('runs b = 1 … 9 when the minuend is 10 or more', () => {
    const ways = waysToTakeFrom(12)
    expect(ways).toHaveLength(9)
    expect(ways[0]).toEqual({ a: 12, b: 1, answer: 11 })
    expect(ways[8]).toEqual({ a: 12, b: 9, answer: 3 })
  })

  it('stops at b = a−1 for small minuends', () => {
    const ways = waysToTakeFrom(5)
    expect(ways.map((w) => w.b)).toEqual([1, 2, 3, 4])
    expect(ways.map((w) => w.answer)).toEqual([4, 3, 2, 1])
  })

  it('has no ways for 1', () => {
    expect(waysToTakeFrom(1)).toHaveLength(0)
  })
})

describe('seeded practice problems', () => {
  it('are deterministic for a seed and prefix-stable as more are requested', () => {
    expect(practiceProblems(42, 20)).toEqual(practiceProblems(42, 20))
    expect(practiceProblems(42, 30).slice(0, 20)).toEqual(practiceProblems(42, 20))
  })

  it('differ across seeds', () => {
    expect(practiceProblems(1, 20)).not.toEqual(practiceProblems(2, 20))
  })

  it('honor the count and only pose problems the board can work', () => {
    const problems = practiceProblems(7, 50)
    expect(problems).toHaveLength(50)
    for (const p of problems) {
      expect(isValidProblem(p.a, p.b)).toBe(true)
      expect(p.answer).toBe(p.a - p.b)
    }
  })

  it('never repeat the same fact back-to-back', () => {
    const problems = practiceProblems(99, 100)
    for (let i = 1; i < problems.length; i++) {
      const same = problems[i].a === problems[i - 1].a && problems[i].b === problems[i - 1].b
      expect(same).toBe(false)
    }
  })
})
