import { describe, it, expect } from 'vitest'
import { createRng } from '../../lib/rng'
import {
  COLS,
  ROWS,
  barsFor,
  boardValue,
  buildAllPartials,
  combineAll,
  combineSquare,
  compactValueLabel,
  digitsOf,
  emptyBoard,
  expectedCells,
  isCombined,
  isSlid,
  needsCombine,
  placeFamily,
  placePartial,
  product,
  randomProblem,
  readout,
  readoutDigits,
  slideAll,
  slideRow,
  splitIntoBars,
  squarePower,
  squareValue,
} from './model'

describe('board geometry', () => {
  it('square value is 10^(row+col): bottom-right 1, top-left 100 billion', () => {
    expect(squareValue(0, 0)).toBe(1)
    expect(squareValue(0, 8)).toBe(100_000_000)
    expect(squarePower(3, 8)).toBe(11)
    expect(squareValue(1, 2)).toBe(1000)
  })

  it('place color family repeats green/blue/red per family', () => {
    expect(placeFamily(0)).toBe('unit')
    expect(placeFamily(1)).toBe('ten')
    expect(placeFamily(2)).toBe('hundred')
    expect(placeFamily(3)).toBe('unit')
    expect(placeFamily(8)).toBe('hundred')
  })

  it('compact labels cover every square on the board', () => {
    expect(compactValueLabel(0)).toBe('1')
    expect(compactValueLabel(3)).toBe('1k')
    expect(compactValueLabel(8)).toBe('100M')
    expect(compactValueLabel(11)).toBe('100B')
  })
})

describe('digits and bar placement', () => {
  it('digitsOf is little-endian', () => {
    expect(digitsOf(4357)).toEqual([7, 5, 3, 4])
    expect(digitsOf(0)).toEqual([0])
    expect(digitsOf(90)).toEqual([0, 9])
  })

  it('barsFor repeats the multiplicand digit multiplier-digit times', () => {
    expect(barsFor(7, 3)).toEqual([7, 7, 7])
    expect(barsFor(0, 3)).toEqual([])
    expect(barsFor(7, 0)).toEqual([])
  })

  it('buildAllPartials(4357, 23) places correct bars and total value', () => {
    const board = buildAllPartials(4357, 23)
    // units row (×3): 3 bars of each multiplicand digit
    expect(board[0][0]).toEqual([7, 7, 7])
    expect(board[0][3]).toEqual([4, 4, 4])
    // tens row (×2): 2 bars of each multiplicand digit
    expect(board[1][0]).toEqual([7, 7])
    expect(board[1][3]).toEqual([4, 4])
    expect(boardValue(board)).toBe(4357 * 23)
  })

  it('zero digits produce no expected cells', () => {
    const cells = expectedCells(4057, 23)
    expect(cells).toHaveLength(6) // 3 non-zero multiplicand digits × 2 multiplier digits
    expect(cells.some((c) => c.col === 2)).toBe(false) // the 0 in the tens place
  })

  it('placePartial fills exactly one square without mutating the input board', () => {
    const before = emptyBoard()
    const after = placePartial(before, 1, 3, 4357, 23)
    expect(after[1][3]).toEqual([4, 4])
    expect(before[1][3]).toEqual([])
    expect(boardValue(after)).toBe(4 * 2 * 10 ** 4)
  })
})

describe('slide', () => {
  it('slideRow moves bars down-left along equal-value diagonals', () => {
    const board = buildAllPartials(4357, 23)
    const slid = slideRow(board, 1)
    expect(slid[1].every((bars) => bars.length === 0)).toBe(true)
    expect(slid[0][4]).toEqual([4, 4]) // (1,3) → (0,4), still worth 8 × 10^4
    expect(boardValue(slid)).toBe(4357 * 23)
  })

  it('slideAll preserves total value on several seeded boards', () => {
    const rng = createRng(7)
    for (let i = 0; i < 12; i++) {
      const { a, b } = randomProblem(rng, rng.int(1, 4), rng.int(1, 4))
      const board = buildAllPartials(a, b)
      const slid = slideAll(board)
      expect(boardValue(slid)).toBe(a * b)
      expect(isSlid(slid)).toBe(true)
    }
  })
})

describe('combine', () => {
  it('combineSquare keeps t mod 10 and carries floor(t/10) one square left', () => {
    const board = slideAll(buildAllPartials(999, 9)) // bottom: [9×9] [9×9] [9×9]
    const { board: after, total, kept, carried } = combineSquare(board, 0)
    expect(total).toBe(81)
    expect(kept).toBe(1)
    expect(carried).toBe(8)
    expect(after[0][0]).toEqual([1])
    expect(after[0][1].reduce((s, n) => s + n, 0)).toBe(81 + 8)
    expect(boardValue(after)).toBe(999 * 9)
  })

  it('combineSquare with a small total just merges bars, no carry', () => {
    const board = emptyBoard()
    board[0][2] = [2, 3]
    const { board: after, carried } = combineSquare(board, 2)
    expect(after[0][2]).toEqual([5])
    expect(carried).toBe(0)
  })

  it('carries cascade: 999 × 9 = 8,991', () => {
    const board = combineAll(slideAll(buildAllPartials(999, 9)))
    expect(isCombined(board)).toBe(true)
    expect(readoutDigits(board).slice(0, 4)).toEqual([1, 9, 9, 8])
    expect(readout(board)).toBe(8991)
    expect(product(999, 9)).toBe(8991)
  })

  it('combineAll preserves total value', () => {
    const rng = createRng(99)
    for (let i = 0; i < 8; i++) {
      const { a, b } = randomProblem(rng, 4, rng.int(1, 4))
      const slid = slideAll(buildAllPartials(a, b))
      expect(boardValue(combineAll(slid))).toBe(a * b)
    }
  })

  it('combineAll refuses an unslid board; readout refuses an uncombined one', () => {
    const built = buildAllPartials(25, 34)
    expect(() => combineAll(built)).toThrow()
    expect(() => readout(slideAll(built))).toThrow()
  })
})

describe('full pipeline', () => {
  it('acceptance: 4,357 × 23 = 100,211 step by step', () => {
    const built = buildAllPartials(4357, 23)
    expect(boardValue(built)).toBe(100_211)
    const slid = slideAll(built)
    expect(boardValue(slid)).toBe(100_211)
    const combined = combineAll(slid)
    expect(readoutDigits(combined).slice(0, 6)).toEqual([1, 1, 2, 0, 0, 1])
    expect(readout(combined)).toBe(100_211)
    expect(product(4357, 23)).toBe(100_211)
  })

  it('≥20 seeded random pipelines (a ≤ 9999, b ≤ 99): readout === a·b', () => {
    const rng = createRng(20260706)
    for (let i = 0; i < 25; i++) {
      const a = rng.int(2, 9999)
      const b = rng.int(2, 99)
      expect(product(a, b)).toBe(a * b)
    }
  })

  it('handles 4-digit × 4-digit within the 9 columns', () => {
    expect(product(9999, 9999)).toBe(99_980_001)
    expect(product(4357, 6089)).toBe(4357 * 6089)
  })

  it('edge factors: ones and powers of ten', () => {
    expect(product(1, 1)).toBe(1)
    expect(product(4357, 1)).toBe(4357)
    expect(product(1000, 10)).toBe(10_000)
  })
})

describe('helpers', () => {
  it('splitIntoBars never makes a bar longer than 9', () => {
    expect(splitIntoBars(32).every((n) => n >= 1 && n <= 9)).toBe(true)
    expect(splitIntoBars(32).reduce((s, n) => s + n, 0)).toBe(32)
    expect(splitIntoBars(0)).toEqual([])
    expect(splitIntoBars(9)).toEqual([9])
  })

  it('randomProblem is deterministic for a seed and honors digit counts', () => {
    const p1 = randomProblem(createRng(42), 4, 2)
    const p2 = randomProblem(createRng(42), 4, 2)
    expect(p1).toEqual(p2)
    expect(p1.a).toBeGreaterThanOrEqual(1000)
    expect(p1.a).toBeLessThanOrEqual(9999)
    expect(p1.b).toBeGreaterThanOrEqual(10)
    expect(p1.b).toBeLessThanOrEqual(99)
  })

  it('board dimensions and needsCombine', () => {
    const board = emptyBoard()
    expect(board).toHaveLength(ROWS)
    expect(board[0]).toHaveLength(COLS)
    board[0][1] = [4]
    expect(needsCombine(board, 1)).toBe(false)
    board[0][1] = [4, 5]
    expect(needsCombine(board, 1)).toBe(true)
  })
})
