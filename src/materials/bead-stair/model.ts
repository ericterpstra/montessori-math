/**
 * Colored Bead Stair — pure model.
 *
 * Nine colored bead bars (1–9) are placed onto a triangular stair of
 * outlined rows; row n fits exactly the bar of n beads. A bar in the wrong
 * row overhangs the outline or falls short — that mismatch (surfaced via
 * `overhang`) is the control of error. A second activity pairs shuffled
 * numeral tiles 1–9 with the placed bars.
 */

import { createRng } from '../../lib/rng'

/** The nine stair rows, top (1) to bottom (9). */
export const STAIR_ROWS: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export type BeadStairMode = 'build' | 'match'

export interface BeadStairState {
  /** All nine bar sizes in seed-shuffled bank display order (fixed for the session). */
  bankOrder: readonly number[]
  /** All nine numeral tiles in seed-shuffled tray display order (fixed for the session). */
  numeralOrder: readonly number[]
  /** Bar size occupying each row (rows 1–9); a missing key means the row is empty. */
  placed: Readonly<Record<number, number>>
  /** Numeral tile paired with each row; a missing key means no numeral there. */
  numerals: Readonly<Record<number, number>>
}

function assertRow(row: number): void {
  if (!Number.isInteger(row) || row < 1 || row > 9) throw new Error(`bead-stair: invalid row ${row}`)
}

function assertBar(barSize: number): void {
  if (!Number.isInteger(barSize) || barSize < 1 || barSize > 9) throw new Error(`bead-stair: invalid bar size ${barSize}`)
}

/** Fresh state: full bank, empty stair, both shuffles deterministic in the seed. */
export function createState(seed: number): BeadStairState {
  const rng = createRng(seed)
  return {
    bankOrder: rng.shuffle(STAIR_ROWS),
    numeralOrder: rng.shuffle(STAIR_ROWS),
    placed: {},
    numerals: {},
  }
}

/** A bar fits a row exactly when its bead count equals the row number. */
export function fits(row: number, barSize: number): boolean {
  return row === barSize
}

/**
 * How far a bar sticks out past a row's outline, in beads.
 * Positive = overhangs, negative = falls short, 0 = fits exactly.
 */
export function overhang(row: number, barSize: number): number {
  return barSize - row
}

/** Bars still in the bank, in their shuffled display order. */
export function bankBars(state: BeadStairState): number[] {
  const used = new Set(Object.values(state.placed))
  return state.bankOrder.filter((n) => !used.has(n))
}

/** Numeral tiles still in the tray, in their shuffled display order. */
export function trayNumerals(state: BeadStairState): number[] {
  const used = new Set(Object.values(state.numerals))
  return state.numeralOrder.filter((n) => !used.has(n))
}

/**
 * Place a bar onto a row. The bar leaves the bank (or the row it was on);
 * any bar already on the target row returns to the bank. Wrong rows are
 * allowed — the misfit is visible, like the physical material.
 */
export function placeBar(state: BeadStairState, barSize: number, row: number): BeadStairState {
  assertBar(barSize)
  assertRow(row)
  const placed: Record<number, number> = { ...state.placed }
  for (const r of STAIR_ROWS) {
    if (placed[r] === barSize) delete placed[r]
  }
  placed[row] = barSize
  return { ...state, placed }
}

/** Return a row's bar to the bank; any numeral paired with that row returns to the tray. */
export function removeBar(state: BeadStairState, row: number): BeadStairState {
  assertRow(row)
  if (state.placed[row] === undefined) return state
  const placed: Record<number, number> = { ...state.placed }
  delete placed[row]
  const numerals: Record<number, number> = { ...state.numerals }
  delete numerals[row]
  return { ...state, placed, numerals }
}

/** True iff all nine bars are placed and every one fits its row. */
export function isStairComplete(state: BeadStairState): boolean {
  return STAIR_ROWS.every((r) => state.placed[r] === r)
}

/** The stair built correctly (used when entering numeral-matching mode). */
export function withStairBuilt(state: BeadStairState): BeadStairState {
  const placed: Record<number, number> = {}
  for (const r of STAIR_ROWS) placed[r] = r
  return { ...state, placed }
}

/**
 * Pair a numeral tile with a row. Numerals may only sit next to a placed
 * bar; a tile already elsewhere moves, and a tile already on the target
 * row returns to the tray. Mismatches are allowed — counting reveals them.
 */
export function placeNumeral(state: BeadStairState, numeral: number, row: number): BeadStairState {
  assertBar(numeral)
  assertRow(row)
  if (state.placed[row] === undefined) return state
  const numerals: Record<number, number> = { ...state.numerals }
  for (const r of STAIR_ROWS) {
    if (numerals[r] === numeral) delete numerals[r]
  }
  numerals[row] = numeral
  return { ...state, numerals }
}

/** Return a row's numeral tile to the tray. */
export function removeNumeral(state: BeadStairState, row: number): BeadStairState {
  assertRow(row)
  if (state.numerals[row] === undefined) return state
  const numerals: Record<number, number> = { ...state.numerals }
  delete numerals[row]
  return { ...state, numerals }
}

/** True iff every row holds a bar with its matching numeral tile beside it. */
export function allNumeralsMatched(state: BeadStairState): boolean {
  return STAIR_ROWS.every((r) => state.placed[r] !== undefined && state.numerals[r] === state.placed[r])
}

export interface RowCheck {
  row: number
  /** Bar on this row, if any. */
  bar?: number
  /** True when a bar is present and fits the row exactly. */
  barCorrect: boolean
  /** Numeral paired with this row, if any. */
  numeral?: number
  /** True when a numeral is present and names the bar it sits beside. */
  numeralCorrect: boolean
}

/** Per-row verdicts for the Check control. */
export function checkRows(state: BeadStairState): RowCheck[] {
  return STAIR_ROWS.map((row) => {
    const bar = state.placed[row]
    const numeral = state.numerals[row]
    return {
      row,
      bar,
      barCorrect: bar !== undefined && fits(row, bar),
      numeral,
      numeralCorrect: numeral !== undefined && bar !== undefined && numeral === bar,
    }
  })
}
