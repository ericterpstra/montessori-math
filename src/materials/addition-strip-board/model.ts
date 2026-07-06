/**
 * Addition Strip Board — pure model.
 *
 * The board has 18 columns headed 1–18 with a red line after 10. A blue
 * strip of length a lays from column 1 to a; a red strip of length b lays
 * end-to-end after it, from column a+1 to a+b. The sum is read from the
 * number above the column where the red strip ends. Because both strips
 * are at most 9 long, no combination can ever pass column 18.
 */
import { createRng } from '../../lib/rng'

export const BOARD_COLUMNS = 18
export const STRIP_MIN = 1
export const STRIP_MAX = 9
/** Column after which the red line falls on the physical board. */
export const RED_LINE_AFTER = 10

export type StripColor = 'blue' | 'red'

export interface BoardState {
  /** Length of the blue strip laid from column 1, or null if none. */
  blue: number | null
  /** Length of the red strip laid immediately after the blue strip, or null. */
  red: number | null
}

export const EMPTY_BOARD: BoardState = { blue: null, red: null }

export interface StripPlacement {
  color: StripColor
  length: number
  /** First column the strip covers, 1-indexed. */
  startColumn: number
  /** Last column the strip covers, 1-indexed. */
  endColumn: number
}

function assertLength(length: number): void {
  if (!Number.isInteger(length) || length < STRIP_MIN || length > STRIP_MAX) {
    throw new Error(`strip length must be an integer ${STRIP_MIN}–${STRIP_MAX}, got ${length}`)
  }
}

/** Lay (or replace) a strip. The red strip always re-derives its position from the blue. */
export function placeStrip(state: BoardState, color: StripColor, length: number): BoardState {
  assertLength(length)
  return color === 'blue' ? { ...state, blue: length } : { ...state, red: length }
}

/** Take a strip back off the board. */
export function clearStrip(state: BoardState, color: StripColor): BoardState {
  return color === 'blue' ? { ...state, blue: null } : { ...state, red: null }
}

/**
 * Concrete positions of the strips on the board. The blue strip starts at
 * column 1; the red strip starts in the column right after the blue strip
 * ends (or column 1 if no blue strip is down).
 */
export function placements(state: BoardState): StripPlacement[] {
  const out: StripPlacement[] = []
  if (state.blue !== null) {
    out.push({ color: 'blue', length: state.blue, startColumn: 1, endColumn: state.blue })
  }
  if (state.red !== null) {
    const start = (state.blue ?? 0) + 1
    out.push({ color: 'red', length: state.red, startColumn: start, endColumn: start + state.red - 1 })
  }
  return out
}

/**
 * The column whose header shows the sum — where the red strip ends.
 * Null until both strips are on the board.
 */
export function answerColumn(state: BoardState): number | null {
  if (state.blue === null || state.red === null) return null
  return state.blue + state.red
}

/* ---------- Ways to make N ---------- */

export interface Way {
  /** The blue (first) strip length. */
  blue: number
  /** The red (second) strip length. */
  red: number
}

/**
 * Every ordered pair (blue, red) with both in 1–9 summing to n, ascending
 * by blue strip. waysToMake(11) → (2,9), (3,8), … (9,2). Numbers outside
 * 2–18 have no ways.
 */
export function waysToMake(n: number): Way[] {
  const out: Way[] = []
  if (!Number.isInteger(n)) return out
  const lo = Math.max(STRIP_MIN, n - STRIP_MAX)
  const hi = Math.min(STRIP_MAX, n - STRIP_MIN)
  for (let blue = lo; blue <= hi; blue++) {
    out.push({ blue, red: n - blue })
  }
  return out
}

/**
 * Record a way the child has laid. Only records pairs that genuinely make
 * the target with legal strips, and never records the same pair twice.
 * Returns the list sorted by blue strip length.
 */
export function recordWay(found: readonly Way[], way: Way, target: number): Way[] {
  const valid =
    Number.isInteger(way.blue) &&
    Number.isInteger(way.red) &&
    way.blue >= STRIP_MIN &&
    way.blue <= STRIP_MAX &&
    way.red >= STRIP_MIN &&
    way.red <= STRIP_MAX &&
    way.blue + way.red === target
  if (!valid) return [...found]
  if (found.some((w) => w.blue === way.blue && w.red === way.red)) return [...found]
  return [...found, { ...way }].sort((a, b) => a.blue - b.blue)
}

/** True when every decomposition of the target has been found. */
export function waysComplete(found: readonly Way[], target: number): boolean {
  const all = waysToMake(target)
  return all.length > 0 && all.every((w) => found.some((f) => f.blue === w.blue && f.red === w.red))
}

/* ---------- Practice ---------- */

export interface PracticeProblem {
  a: number
  b: number
}

/**
 * The index-th problem of the seeded practice sequence: a + b with both
 * addends in 1–9. The same seed always reproduces the same sequence.
 */
export function practiceProblem(seed: number, index: number): PracticeProblem {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`practice problem index must be a non-negative integer, got ${index}`)
  }
  const rng = createRng(seed)
  let a = 1
  let b = 1
  for (let i = 0; i <= index; i++) {
    a = rng.int(STRIP_MIN, STRIP_MAX)
    b = rng.int(STRIP_MIN, STRIP_MAX)
  }
  return { a, b }
}

/** Honest check: did the child tap the header column equal to the sum? */
export function checkAnswer(problem: PracticeProblem, column: number): boolean {
  return column === problem.a + problem.b
}
