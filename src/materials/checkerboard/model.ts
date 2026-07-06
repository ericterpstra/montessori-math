/**
 * Checkerboard for multiplication — pure model, no React.
 *
 * The board is 4 rows × 9 columns of place-value colored squares. Rows are
 * indexed from the bottom (row 0), columns from the right (col 0), so the
 * square at (row, col) is worth 10^(row + col). A bead bar of b beads placed
 * on that square stands for b · 10^(row + col).
 *
 * Multiplication pipeline:
 *   1. build   — for multiplier digit m at row r and multiplicand digit d at
 *                column c, the square (r, c) receives m bars of d beads.
 *   2. slide   — bars move down-left along their equal-value diagonal to the
 *                bottom row: (r, c) → (0, c + r). Total value is invariant.
 *   3. combine — each bottom square's bars are summed; t mod 10 stays as one
 *                bar, floor(t / 10) carries one square left. Repeated until
 *                every square holds at most one bar.
 *   4. readout — bottom-row digits read right to left are the product.
 */

import type { RNG } from '../../lib/rng'

export const ROWS = 4
export const COLS = 9

/** Bead-bar values (1–9) sitting on one square. */
export type Bars = number[]

/** board[row][col] — row 0 is the bottom row, col 0 the rightmost column. */
export type Board = Bars[][]

export interface Cell {
  row: number
  col: number
}

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => [] as Bars))
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((bars) => [...bars]))
}

/** The power of ten a square stands for: 10^(row + col). */
export function squarePower(row: number, col: number): number {
  return row + col
}

export function squareValue(row: number, col: number): number {
  return 10 ** squarePower(row, col)
}

/** Compact edge/corner labels for powers 0–11: 1, 10, 100, 1k … 100B. */
export function compactValueLabel(power: number): string {
  const labels = ['1', '10', '100', '1k', '10k', '100k', '1M', '10M', '100M', '1B', '10B', '100B']
  if (power < 0 || power >= labels.length) throw new Error(`compactValueLabel: power ${power} out of range`)
  return labels[power]
}

/** Place-value color family for a power of ten (repeats every 3 places). */
export function placeFamily(power: number): 'unit' | 'ten' | 'hundred' {
  return (['unit', 'ten', 'hundred'] as const)[((power % 3) + 3) % 3]
}

/** Little-endian digits: digitsOf(4357) → [7, 5, 3, 4]. digitsOf(0) → [0]. */
export function digitsOf(n: number): number[] {
  if (!Number.isInteger(n) || n < 0) throw new Error(`digitsOf: expected a non-negative integer, got ${n}`)
  if (n === 0) return [0]
  const out: number[] = []
  while (n > 0) {
    out.push(n % 10)
    n = Math.floor(n / 10)
  }
  return out
}

function assertFactor(n: number, name: string): void {
  if (!Number.isInteger(n) || n < 1 || n > 9999) {
    throw new Error(`${name} must be a whole number from 1 to 9,999 (got ${n})`)
  }
}

/** Total value represented by every bar on the board. */
export function boardValue(board: Board): number {
  let total = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const bar of board[r][c]) total += bar * 10 ** (r + c)
    }
  }
  return total
}

/**
 * The bars for one intersection square: the multiplicand digit taken
 * multiplier-digit times (7-bar × 3 → [7, 7, 7]). Empty if either digit is 0.
 */
export function barsFor(aDigit: number, bDigit: number): Bars {
  if (aDigit === 0 || bDigit === 0) return []
  return Array.from({ length: bDigit }, () => aDigit)
}

/** Every square that receives bars when building a × b. */
export function expectedCells(a: number, b: number): Cell[] {
  assertFactor(a, 'multiplicand')
  assertFactor(b, 'multiplier')
  const aDigits = digitsOf(a)
  const bDigits = digitsOf(b)
  const cells: Cell[] = []
  for (let row = 0; row < bDigits.length; row++) {
    for (let col = 0; col < aDigits.length; col++) {
      if (aDigits[col] > 0 && bDigits[row] > 0) cells.push({ row, col })
    }
  }
  return cells
}

/** Place the partial product for one intersection square of a × b. */
export function placePartial(board: Board, row: number, col: number, a: number, b: number): Board {
  const aDigits = digitsOf(a)
  const bDigits = digitsOf(b)
  const next = cloneBoard(board)
  next[row][col] = barsFor(aDigits[col] ?? 0, bDigits[row] ?? 0)
  return next
}

/** The fully built board for a × b: every partial product placed. */
export function buildAllPartials(a: number, b: number): Board {
  let board = emptyBoard()
  for (const { row, col } of expectedCells(a, b)) {
    board = placePartial(board, row, col, a, b)
  }
  return board
}

/**
 * Slide one row's bars down-left along their diagonals to the bottom row:
 * (row, c) → (0, c + row). Value is invariant because 10^(row+c) = 10^(0+c+row).
 */
export function slideRow(board: Board, row: number): Board {
  if (row <= 0 || row >= ROWS) throw new Error(`slideRow: row must be 1–${ROWS - 1}, got ${row}`)
  const next = cloneBoard(board)
  for (let c = COLS - 1; c >= 0; c--) {
    const bars = next[row][c]
    if (bars.length === 0) continue
    const target = c + row
    if (target >= COLS) throw new Error('slideRow: bars would slide past the leftmost square')
    next[0][target].push(...bars)
    next[row][c] = []
  }
  return next
}

export function slideAll(board: Board): Board {
  let next = board
  for (let r = 1; r < ROWS; r++) {
    if (next[r].some((bars) => bars.length > 0)) next = slideRow(next, r)
  }
  return next
}

/** True when every bar sits on the bottom row. */
export function isSlid(board: Board): boolean {
  for (let r = 1; r < ROWS; r++) {
    if (board[r].some((bars) => bars.length > 0)) return false
  }
  return true
}

/** Split a non-negative value into bar values of at most 9 beads each. */
export function splitIntoBars(value: number): Bars {
  if (!Number.isInteger(value) || value < 0) throw new Error(`splitIntoBars: expected non-negative integer, got ${value}`)
  const bars: Bars = []
  while (value > 9) {
    bars.push(9)
    value -= 9
  }
  if (value > 0) bars.push(value)
  return bars
}

export interface CombineResult {
  board: Board
  /** Sum of the beads that were on the square. */
  total: number
  /** Digit that stays on the square (total mod 10). */
  kept: number
  /** Value carried one square left (floor(total / 10)). */
  carried: number
}

/** True if the bottom square at `col` still needs combining (2+ bars). */
export function needsCombine(board: Board, col: number): boolean {
  return board[0][col].length >= 2
}

/**
 * Combine one bottom square: sum its bars, keep total mod 10 as a single bar,
 * carry floor(total / 10) one square left.
 */
export function combineSquare(board: Board, col: number): CombineResult {
  if (col < 0 || col >= COLS) throw new Error(`combineSquare: col out of range (${col})`)
  const next = cloneBoard(board)
  const total = next[0][col].reduce((sum, bar) => sum + bar, 0)
  const kept = total % 10
  const carried = Math.floor(total / 10)
  next[0][col] = kept > 0 ? [kept] : []
  if (carried > 0) {
    if (col + 1 >= COLS) throw new Error('combineSquare: carry past the leftmost square')
    next[0][col + 1].push(...splitIntoBars(carried))
  }
  return { board: next, total, kept, carried }
}

/**
 * Combine every bottom square, right to left, cascading carries, until each
 * square holds at most one bar. Requires an already-slid board.
 */
export function combineAll(board: Board): Board {
  if (!isSlid(board)) throw new Error('combineAll: slide all rows to the bottom first')
  let next = board
  for (let c = 0; c < COLS; c++) {
    if (needsCombine(next, c)) next = combineSquare(next, c).board
  }
  return next
}

/** True when the board is slid and every bottom square holds ≤ 1 bar. */
export function isCombined(board: Board): boolean {
  return isSlid(board) && board[0].every((bars) => bars.length <= 1)
}

/** Bottom-row digits, rightmost first. Requires a combined board. */
export function readoutDigits(board: Board): number[] {
  if (!isCombined(board)) throw new Error('readoutDigits: combine the board first')
  return board[0].map((bars) => bars[0] ?? 0)
}

/** The number the bottom row shows, read right to left. */
export function readout(board: Board): number {
  return readoutDigits(board).reduce((sum, digit, col) => sum + digit * 10 ** col, 0)
}

/** Full pipeline: build partial products, slide diagonals, combine, read. */
export function product(a: number, b: number): number {
  return readout(combineAll(slideAll(buildAllPartials(a, b))))
}

export interface Problem {
  a: number
  b: number
}

/** Seeded random problem with the given digit counts (1–4 each). */
export function randomProblem(rng: RNG, aDigitCount: number, bDigitCount: number): Problem {
  const factor = (digits: number): number => {
    if (digits < 1 || digits > 4) throw new Error(`randomProblem: digit count must be 1–4, got ${digits}`)
    if (digits === 1) return rng.int(2, 9)
    return rng.int(10 ** (digits - 1), 10 ** digits - 1)
  }
  return { a: factor(aDigitCount), b: factor(bDigitCount) }
}
