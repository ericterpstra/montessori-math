/**
 * Subtraction strip board — pure model.
 *
 * The board has the numbers 1–18 across the top (1–9 in blue, 10–18 in red).
 * To work a − b, the natural-wood cover strip slides in from the right to
 * hide every number past the minuend a, then the blue strip b is laid
 * right-aligned against the cover so it occupies columns a−b+1 … a. The
 * answer is read from the number just left of the blue strip: column a−b.
 */

import { createRng } from '../../lib/rng'

/** Highest number printed on the board. */
export const BOARD_MAX = 18

/** The blue strips run 1–9, so subtrahends are single digits. */
export const MAX_SUBTRAHEND = 9

/** An inclusive run of board columns. `start > end` means the run is empty. */
export interface Span {
  start: number
  end: number
}

/** One subtraction fact as worked on the board. */
export interface Problem {
  /** Minuend — the number the child starts with, 2–18. */
  a: number
  /** Subtrahend — the blue strip, 1–9, always less than `a`. */
  b: number
  /** The difference a − b, always at least 1. */
  answer: number
}

function assertInteger(n: number, name: string): void {
  if (!Number.isInteger(n)) throw new Error(`${name} must be a whole number, got ${n}`)
}

/**
 * Columns hidden by the natural-wood cover strip when the minuend is `a`:
 * exactly a+1 … 18. For a = 18 the span is empty (nothing is covered).
 */
export function coverSpan(a: number): Span {
  assertInteger(a, 'minuend')
  if (a < 1 || a > BOARD_MAX) throw new Error(`minuend must be 1–${BOARD_MAX}, got ${a}`)
  return { start: a + 1, end: BOARD_MAX }
}

/**
 * True when a − b can be worked on the board: `b` is one of the blue strips
 * (1–9) and the difference is at least 1 (the board's answers start at 1,
 * so b must be strictly less than a).
 */
export function isValidProblem(a: number, b: number): boolean {
  return (
    Number.isInteger(a) &&
    Number.isInteger(b) &&
    a >= 2 &&
    a <= BOARD_MAX &&
    b >= 1 &&
    b <= MAX_SUBTRAHEND &&
    b < a
  )
}

/**
 * Where the blue strip lies for a − b: right-aligned against the cover
 * strip, occupying columns a−b+1 … a (exactly b columns).
 */
export function stripSpan(a: number, b: number): Span {
  if (!isValidProblem(a, b)) throw new Error(`cannot work ${a} − ${b} on the subtraction strip board`)
  return { start: a - b + 1, end: a }
}

/** The column the answer is read from: just left of the blue strip, a−b. */
export function answerColumn(a: number, b: number): number {
  if (!isValidProblem(a, b)) throw new Error(`cannot work ${a} − ${b} on the subtraction strip board`)
  return a - b
}

/** Header numeral color, as on the physical board: 1–9 blue, 10–18 red. */
export function headerColor(n: number): 'blue' | 'red' {
  assertInteger(n, 'header number')
  if (n < 1 || n > BOARD_MAX) throw new Error(`header numbers run 1–${BOARD_MAX}, got ${n}`)
  return n <= MAX_SUBTRAHEND ? 'blue' : 'red'
}

export interface TapResult {
  correct: boolean
  expected: number
}

/** Honest check of a header number the child tapped as their answer. */
export function evaluateTap(problem: Problem, tapped: number): TapResult {
  return { correct: tapped === problem.answer, expected: problem.answer }
}

/**
 * Every way to take from `a` on the board: b = 1 … min(9, a−1), in order.
 * Returns an empty list for a = 1 (nothing can be taken away).
 */
export function waysToTakeFrom(a: number): Problem[] {
  assertInteger(a, 'minuend')
  if (a < 1 || a > BOARD_MAX) throw new Error(`minuend must be 1–${BOARD_MAX}, got ${a}`)
  const out: Problem[] = []
  const maxB = Math.min(MAX_SUBTRAHEND, a - 1)
  for (let b = 1; b <= maxB; b++) out.push({ a, b, answer: a - b })
  return out
}

/**
 * The first `count` practice problems for a seed. The sequence is
 * deterministic and prefix-stable: the same seed always yields the same
 * problems, and asking for more simply extends the list. The same fact is
 * never asked twice in a row.
 */
export function practiceProblems(seed: number, count: number): Problem[] {
  const rng = createRng(seed)
  const out: Problem[] = []
  let prev: Problem | undefined
  while (out.length < count) {
    const a = rng.int(3, BOARD_MAX)
    const b = rng.int(1, Math.min(MAX_SUBTRAHEND, a - 1))
    if (prev && prev.a === a && prev.b === b) continue
    const problem: Problem = { a, b, answer: a - b }
    out.push(problem)
    prev = problem
  }
  return out
}
