/**
 * Unit Division Board — pure model.
 *
 * The physical material: a board with 81 holes (9 rows × 9 columns) and 9
 * slots across the top for green skittles. The dividend is a supply of green
 * beads; the divisor is how many skittles stand at the top. The child deals
 * the supply one round at a time — one bead under each skittle — until a
 * full round is no longer possible. The quotient is the number of beads
 * under any one skittle (the rounds dealt); whatever cannot be dealt stays
 * in the tray as the remainder.
 */

import type { RNG } from '../../lib/rng'

export const BOARD_ROWS = 9
export const BOARD_COLS = 9
export const MAX_DIVIDEND = 81

export interface DivisionProblem {
  dividend: number
  divisor: number
}

export interface DivisionResult {
  quotient: number
  remainder: number
}

/** Euclidean division. Always satisfies q·divisor + r === dividend, 0 ≤ r < divisor. */
export function divide(dividend: number, divisor: number): DivisionResult {
  if (!Number.isInteger(dividend) || dividend < 0) {
    throw new Error(`divide: dividend must be a non-negative integer (got ${dividend})`)
  }
  if (!Number.isInteger(divisor) || divisor < 1) {
    throw new Error(`divide: divisor must be a positive integer (got ${divisor})`)
  }
  const quotient = Math.floor(dividend / divisor)
  return { quotient, remainder: dividend - quotient * divisor }
}

/**
 * A problem fits on the board when every bead dealt has a hole: at most
 * 9 rounds of dealing, i.e. quotient ≤ 9 (so dividend < 10 × divisor).
 */
export function fitsOnBoard(dividend: number, divisor: number): boolean {
  return (
    Number.isInteger(dividend) &&
    Number.isInteger(divisor) &&
    dividend >= 1 &&
    dividend <= MAX_DIVIDEND &&
    divisor >= 1 &&
    divisor <= BOARD_COLS &&
    divide(dividend, divisor).quotient <= BOARD_ROWS
  )
}

export function createProblem(dividend: number, divisor: number): DivisionProblem {
  if (!fitsOnBoard(dividend, divisor)) {
    throw new Error(`createProblem: ${dividend} ÷ ${divisor} does not fit on the unit division board`)
  }
  return { dividend, divisor }
}

/** All dividends the board can show for a given divisor (divisor … min(81, 10·divisor − 1)). */
export function dividendChoices(divisor: number): number[] {
  const out: number[] = []
  for (let d = divisor; d <= MAX_DIVIDEND; d++) {
    if (fitsOnBoard(d, divisor)) out.push(d)
  }
  return out
}

/** Draw a seeded problem that fits on the board (divisor 2–9 keeps it interesting). */
export function drawProblem(rng: RNG): DivisionProblem {
  const divisor = rng.int(2, BOARD_COLS)
  const dividend = rng.int(divisor, Math.min(MAX_DIVIDEND, 10 * divisor - 1))
  return { dividend, divisor }
}

export interface BoardState {
  problem: DivisionProblem
  /** Which of the 9 top slots hold a skittle. */
  skittles: boolean[]
  /** Full rounds dealt so far — also the number of beads under each skittle. */
  rowsDealt: number
}

export function createBoard(problem: DivisionProblem): BoardState {
  return {
    problem,
    skittles: Array.from({ length: BOARD_COLS }, () => false),
    rowsDealt: 0,
  }
}

export function skittleCount(state: BoardState): number {
  return state.skittles.filter(Boolean).length
}

export function beadsDealt(state: BoardState): number {
  return state.rowsDealt * skittleCount(state)
}

/** Undealt beads remaining in the tray. */
export function supplyRemaining(state: BoardState): number {
  return state.problem.dividend - beadsDealt(state)
}

/**
 * Stand up or take away the skittle in a slot. Changing the number of
 * sharers returns all dealt beads to the tray — dealing starts over,
 * exactly as it must with the physical material.
 */
export function toggleSkittle(state: BoardState, slot: number): BoardState {
  if (!Number.isInteger(slot) || slot < 0 || slot >= BOARD_COLS) {
    throw new Error(`toggleSkittle: slot must be 0–${BOARD_COLS - 1} (got ${slot})`)
  }
  return {
    ...state,
    skittles: state.skittles.map((s, i) => (i === slot ? !s : s)),
    rowsDealt: 0,
  }
}

/**
 * A full round is possible only while every skittle can receive a bead:
 * there is at least one skittle, the supply covers one bead per skittle,
 * and the columns still have empty holes.
 */
export function canDealAnotherRound(state: BoardState): boolean {
  const k = skittleCount(state)
  return k > 0 && state.rowsDealt < BOARD_ROWS && supplyRemaining(state) >= k
}

/** Deal one round — one bead under each skittle. No-op once a full round is impossible. */
export function dealRound(state: BoardState): BoardState {
  if (!canDealAnotherRound(state)) return state
  return { ...state, rowsDealt: state.rowsDealt + 1 }
}

/** Pick the last round back up into the tray (for recounting). No-op at zero. */
export function undoRound(state: BoardState): BoardState {
  if (state.rowsDealt === 0) return state
  return { ...state, rowsDealt: state.rowsDealt - 1 }
}

/** Deal every possible round. */
export function dealAll(state: BoardState): BoardState {
  let s = state
  while (canDealAnotherRound(s)) s = dealRound(s)
  return s
}

/** What the board shows: quotient = beads under any one skittle, remainder = beads left in the tray. */
export function readBoard(state: BoardState): DivisionResult {
  return { quotient: state.rowsDealt, remainder: supplyRemaining(state) }
}

export interface Evaluation {
  quotientCorrect: boolean
  remainderCorrect: boolean
  correct: boolean
  /** Honest control of error: another full round could still be dealt. */
  canDealAnotherRound: boolean
  /** The skittles standing match the divisor of the problem. */
  skittlesMatchDivisor: boolean
}

/** Check a recorded answer against the true division — like turning the chart over. */
export function evaluateAnswer(state: BoardState, recorded: DivisionResult): Evaluation {
  const truth = divide(state.problem.dividend, state.problem.divisor)
  const quotientCorrect = recorded.quotient === truth.quotient
  const remainderCorrect = recorded.remainder === truth.remainder
  return {
    quotientCorrect,
    remainderCorrect,
    correct: quotientCorrect && remainderCorrect,
    canDealAnotherRound: canDealAnotherRound(state),
    skittlesMatchDivisor: skittleCount(state) === state.problem.divisor,
  }
}

/** '27 ÷ 4 = 6 r 3' (the 'r 0' is dropped when nothing remains). */
export function formatReading(problem: DivisionProblem, result: DivisionResult): string {
  const base = `${problem.dividend} ÷ ${problem.divisor} = ${result.quotient}`
  return result.remainder > 0 ? `${base} r ${result.remainder}` : base
}
