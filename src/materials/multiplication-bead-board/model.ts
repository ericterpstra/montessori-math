/**
 * Multiplication bead board — pure model.
 *
 * The physical material is a 10×10 perforated board with the numbers 1–10
 * printed across the top, a slot on the left for the multiplicand card, a
 * red disc that marks the current multiple, and a box of 100 red beads.
 * The child places one column of `multiplicand` beads for each multiple
 * taken, then counts every bead on the board to find the product.
 */

import { createRng } from '../../lib/rng'

export const BOARD_SIZE = 10
export const MAX_BEADS = BOARD_SIZE * BOARD_SIZE

export interface BoardState {
  /** The number being multiplied (1–10) — the card in the slot. */
  readonly multiplicand: number
  /** How many columns of beads have been placed so far (0–10). */
  readonly columns: number
}

function assertFactor(n: number, label: string): void {
  if (!Number.isInteger(n) || n < 1 || n > BOARD_SIZE) {
    throw new Error(`${label} must be a whole number from 1 to ${BOARD_SIZE}, got ${n}`)
  }
}

export function createBoard(multiplicand: number): BoardState {
  assertFactor(multiplicand, 'multiplicand')
  return { multiplicand, columns: 0 }
}

/** Swap the card in the slot. The beads go back in the box (columns reset). */
export function setMultiplicand(state: BoardState, multiplicand: number): BoardState {
  assertFactor(multiplicand, 'multiplicand')
  if (multiplicand === state.multiplicand) return state
  return { multiplicand, columns: 0 }
}

export function canPlaceColumn(state: BoardState): boolean {
  return state.columns < BOARD_SIZE
}

/** Fill the next column with `multiplicand` beads and advance the disc. */
export function placeColumn(state: BoardState): BoardState {
  if (!canPlaceColumn(state)) {
    throw new Error(`the board only has ${BOARD_SIZE} columns`)
  }
  return { ...state, columns: state.columns + 1 }
}

/** Take back the most recently placed column (no-op on an empty board). */
export function removeColumn(state: BoardState): BoardState {
  if (state.columns === 0) return state
  return { ...state, columns: state.columns - 1 }
}

/** Return every bead to the box, keeping the card in the slot. */
export function clearColumns(state: BoardState): BoardState {
  if (state.columns === 0) return state
  return { ...state, columns: 0 }
}

/** Total red beads on the board — always multiplicand × columns, never > 100. */
export function beadCount(state: BoardState): number {
  return state.multiplicand * state.columns
}

/** The product shown by the board: multiplicand × columns placed. */
export function product(state: BoardState): number {
  return beadCount(state)
}

/**
 * The column the red disc sits above. It starts above the 1 and then marks
 * the last multiple taken, so after b columns it sits above the b.
 */
export function discColumn(state: BoardState): number {
  return state.columns === 0 ? 1 : state.columns
}

/** Is there a bead at (row, col)? Both 1-indexed from the top-left. */
export function hasBead(state: BoardState, row: number, col: number): boolean {
  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 1 &&
    row <= state.multiplicand &&
    col >= 1 &&
    col <= state.columns
  )
}

export interface BeadPosition {
  row: number
  col: number
}

/**
 * Where the nth counted bead sits (1-indexed step). Counting order matches
 * how a child counts the physical board: down the first column, then down
 * the second, left to right.
 */
export function beadAtStep(state: BoardState, step: number): BeadPosition {
  const total = beadCount(state)
  if (!Number.isInteger(step) || step < 1 || step > total) {
    throw new Error(`beadAtStep: step ${step} out of range 1–${total}`)
  }
  return {
    row: ((step - 1) % state.multiplicand) + 1,
    col: Math.floor((step - 1) / state.multiplicand) + 1,
  }
}

/** Counting step (1-indexed) of the bead at (row, col), or 0 if no bead there. */
export function stepAt(state: BoardState, row: number, col: number): number {
  if (!hasBead(state, row, col)) return 0
  return (col - 1) * state.multiplicand + row
}

/** The full counting order: every bead exactly once, ending at bead multiplicand × columns. */
export function countSequence(state: BoardState): BeadPosition[] {
  return Array.from({ length: beadCount(state) }, (_, i) => beadAtStep(state, i + 1))
}

export interface TableRow {
  multiplier: number
  product: number
}

/** The written record rows for a table: multiplicand × 1 … multiplicand × upTo. */
export function tableRows(multiplicand: number, upTo: number): TableRow[] {
  assertFactor(multiplicand, 'multiplicand')
  if (!Number.isInteger(upTo) || upTo < 0 || upTo > BOARD_SIZE) {
    throw new Error(`tableRows: upTo must be a whole number from 0 to ${BOARD_SIZE}, got ${upTo}`)
  }
  return Array.from({ length: upTo }, (_, i) => ({
    multiplier: i + 1,
    product: multiplicand * (i + 1),
  }))
}

export interface PracticeProblem {
  /** Multiplicand — the card the child should put in the slot. */
  a: number
  /** Multiplier — how many columns the child should place. */
  b: number
}

/**
 * The nth practice problem (0-indexed) for a seed. Deterministic: the same
 * seed and index always give the same problem.
 */
export function practiceProblem(seed: number, index: number): PracticeProblem {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`practiceProblem: index must be a non-negative integer, got ${index}`)
  }
  const rng = createRng(seed)
  let a = rng.int(1, BOARD_SIZE)
  let b = rng.int(1, BOARD_SIZE)
  for (let i = 0; i < index; i++) {
    a = rng.int(1, BOARD_SIZE)
    b = rng.int(1, BOARD_SIZE)
  }
  return { a, b }
}

export interface BuildCheck {
  /** Does the card in the slot match the problem's first factor? */
  multiplicandCorrect: boolean
  /** Were exactly b columns placed? */
  columnsCorrect: boolean
  allCorrect: boolean
}

/**
 * Honest check for practice mode: confirms the build matches the problem
 * (right card, right number of columns) without revealing the product —
 * the child finds that by counting the beads.
 */
export function checkBuild(state: BoardState, problem: PracticeProblem): BuildCheck {
  const multiplicandCorrect = state.multiplicand === problem.a
  const columnsCorrect = state.columns === problem.b
  return {
    multiplicandCorrect,
    columnsCorrect,
    allCorrect: multiplicandCorrect && columnsCorrect,
  }
}
