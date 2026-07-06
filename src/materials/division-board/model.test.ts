import { describe, it, expect } from 'vitest'
import { createRng } from '../../lib/rng'
import {
  BOARD_COLS,
  BOARD_ROWS,
  MAX_DIVIDEND,
  beadsDealt,
  canDealAnotherRound,
  createBoard,
  createProblem,
  dealAll,
  dealRound,
  divide,
  dividendChoices,
  drawProblem,
  evaluateAnswer,
  fitsOnBoard,
  formatReading,
  readBoard,
  skittleCount,
  supplyRemaining,
  toggleSkittle,
  undoRound,
} from './model'
import type { BoardState } from './model'

/** Stand up the first `n` skittles. */
function placeSkittles(board: BoardState, n: number): BoardState {
  let b = board
  for (let i = 0; i < n; i++) b = toggleSkittle(b, i)
  return b
}

describe('divide', () => {
  it('satisfies q·divisor + r === dividend and r < divisor for every dividend 1–81 ÷ divisor 1–9', () => {
    for (let dividend = 1; dividend <= MAX_DIVIDEND; dividend++) {
      for (let divisor = 1; divisor <= 9; divisor++) {
        const { quotient, remainder } = divide(dividend, divisor)
        expect(quotient * divisor + remainder).toBe(dividend)
        expect(remainder).toBeGreaterThanOrEqual(0)
        expect(remainder).toBeLessThan(divisor)
      }
    }
  })

  it('rejects invalid inputs', () => {
    expect(() => divide(-1, 4)).toThrow()
    expect(() => divide(10, 0)).toThrow()
    expect(() => divide(10.5, 2)).toThrow()
  })
})

describe('board dealing', () => {
  it('deals every fitting problem to the exact quotient and remainder of the true division', () => {
    for (let dividend = 1; dividend <= MAX_DIVIDEND; dividend++) {
      for (let divisor = 1; divisor <= 9; divisor++) {
        if (!fitsOnBoard(dividend, divisor)) continue
        const board = dealAll(placeSkittles(createBoard(createProblem(dividend, divisor)), divisor))
        const truth = divide(dividend, divisor)
        expect(readBoard(board)).toEqual(truth)
        // dealing stopped exactly when a full round became impossible
        expect(canDealAnotherRound(board)).toBe(false)
        expect(supplyRemaining(board)).toBeLessThan(divisor)
      }
    }
  })

  it('27 ÷ 4: dealing proceeds round by round and stops when only 3 beads remain', () => {
    let board = placeSkittles(createBoard(createProblem(27, 4)), 4)
    for (let round = 1; round <= 6; round++) {
      expect(canDealAnotherRound(board)).toBe(true)
      board = dealRound(board)
      expect(board.rowsDealt).toBe(round)
      expect(supplyRemaining(board)).toBe(27 - round * 4)
    }
    // 3 beads left — not enough for a full round of 4
    expect(supplyRemaining(board)).toBe(3)
    expect(canDealAnotherRound(board)).toBe(false)
    const stopped = dealRound(board)
    expect(stopped).toBe(board) // dealing is a no-op once a full round is impossible
    expect(readBoard(board)).toEqual({ quotient: 6, remainder: 3 })
    expect(formatReading(board.problem, readBoard(board))).toBe('27 ÷ 4 = 6 r 3')
  })

  it('81 ÷ 9 = 9 r 0 fills the whole board', () => {
    const board = dealAll(placeSkittles(createBoard(createProblem(81, 9)), 9))
    expect(board.rowsDealt).toBe(BOARD_ROWS)
    expect(skittleCount(board)).toBe(BOARD_COLS)
    expect(beadsDealt(board)).toBe(81)
    expect(readBoard(board)).toEqual({ quotient: 9, remainder: 0 })
    expect(canDealAnotherRound(board)).toBe(false)
    expect(formatReading(board.problem, readBoard(board))).toBe('81 ÷ 9 = 9')
  })

  it('changing the skittles returns all dealt beads to the tray', () => {
    let board = placeSkittles(createBoard(createProblem(24, 6)), 6)
    board = dealRound(dealRound(board))
    expect(board.rowsDealt).toBe(2)
    board = toggleSkittle(board, 8)
    expect(board.rowsDealt).toBe(0)
    expect(skittleCount(board)).toBe(7)
    expect(supplyRemaining(board)).toBe(24)
  })

  it('undoRound picks one round back up and is a no-op at zero', () => {
    let board = placeSkittles(createBoard(createProblem(20, 5)), 5)
    board = dealRound(dealRound(board))
    board = undoRound(board)
    expect(board.rowsDealt).toBe(1)
    expect(supplyRemaining(board)).toBe(15)
    board = undoRound(board)
    expect(undoRound(board)).toBe(board)
  })

  it('cannot deal without skittles', () => {
    const board = createBoard(createProblem(27, 4))
    expect(canDealAnotherRound(board)).toBe(false)
    expect(dealRound(board)).toBe(board)
  })
})

describe('problem validation and choices', () => {
  it('rejects problems that cannot fit under 9 rounds or exceed 81', () => {
    expect(() => createProblem(82, 9)).toThrow()
    expect(() => createProblem(81, 8)).toThrow() // 81 ÷ 8 = 10 r 1 needs a tenth round
    expect(() => createProblem(20, 0)).toThrow()
    expect(fitsOnBoard(79, 8)).toBe(true) // 79 ÷ 8 = 9 r 7 exactly fills the columns
    expect(fitsOnBoard(80, 8)).toBe(false)
  })

  it('offers only fitting dividends for each divisor', () => {
    expect(dividendChoices(9)).toHaveLength(81 - 9 + 1)
    const forTwo = dividendChoices(2)
    expect(forTwo[0]).toBe(2)
    expect(forTwo[forTwo.length - 1]).toBe(19)
    for (const divisor of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      for (const dividend of dividendChoices(divisor)) {
        expect(divide(dividend, divisor).quotient).toBeLessThanOrEqual(BOARD_ROWS)
      }
    }
  })
})

describe('drawProblem', () => {
  it('is deterministic for a given seed and always fits the board', () => {
    const a = createRng(42)
    const b = createRng(42)
    for (let i = 0; i < 50; i++) {
      const pa = drawProblem(a)
      const pb = drawProblem(b)
      expect(pa).toEqual(pb)
      expect(fitsOnBoard(pa.dividend, pa.divisor)).toBe(true)
      expect(pa.dividend).toBeGreaterThanOrEqual(pa.divisor)
    }
    // different seeds diverge somewhere in the run
    const c = createRng(7)
    const fromC = Array.from({ length: 50 }, () => drawProblem(c))
    const d = createRng(42)
    const fromD = Array.from({ length: 50 }, () => drawProblem(d))
    expect(fromC).not.toEqual(fromD)
  })
})

describe('evaluateAnswer', () => {
  it('marks quotient and remainder independently against the true division', () => {
    const board = dealAll(placeSkittles(createBoard(createProblem(27, 4)), 4))
    expect(evaluateAnswer(board, { quotient: 6, remainder: 3 })).toEqual({
      quotientCorrect: true,
      remainderCorrect: true,
      correct: true,
      canDealAnotherRound: false,
      skittlesMatchDivisor: true,
    })
    const wrongQuotient = evaluateAnswer(board, { quotient: 5, remainder: 3 })
    expect(wrongQuotient.quotientCorrect).toBe(false)
    expect(wrongQuotient.remainderCorrect).toBe(true)
    expect(wrongQuotient.correct).toBe(false)
  })

  it('honestly reports when another round could still be dealt (remainder not yet < divisor)', () => {
    let board = placeSkittles(createBoard(createProblem(27, 4)), 4)
    board = dealRound(dealRound(board)) // stopped early: 2 rounds, 19 beads in the tray
    const evaln = evaluateAnswer(board, { quotient: 2, remainder: 19 })
    expect(evaln.canDealAnotherRound).toBe(true)
    expect(evaln.correct).toBe(false)
  })

  it('reports when the skittles standing do not match the divisor', () => {
    const board = dealAll(placeSkittles(createBoard(createProblem(27, 4)), 3))
    const evaln = evaluateAnswer(board, { quotient: 9, remainder: 0 })
    expect(evaln.skittlesMatchDivisor).toBe(false)
    expect(evaln.correct).toBe(false) // 27 ÷ 4 is 6 r 3 no matter how it was dealt
  })
})
