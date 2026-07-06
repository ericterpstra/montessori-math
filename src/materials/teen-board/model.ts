/**
 * Teen Board (Seguin Board A) — pure model, no React.
 *
 * Nine slats each print '10'. Unit cards 1–9 slide over the zero to make
 * 11–19. Beside each row the child lays one golden ten-bar plus the colored
 * bead-stair bar that matches the unit card. The control of error is the
 * match between quantity (beads) and symbol (the numeral the row shows).
 */

import { totalValue } from '../../lib/placeValue'

export type TeenBoardMode = 'symbols' | 'symbols-beads'

export const ROW_COUNT = 9

/** Golden ten-bars in the supply (one per row, as in the physical box). */
export const TEN_BAR_SUPPLY = 9

/** The unit values 1–9: one card and one colored bar exist for each. */
export const UNIT_VALUES: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export interface RowState {
  /** Unit card 1–9 covering the zero, or null (the slat reads '10'). */
  card: number | null
  /** Golden ten-bars laid beside the row. */
  tenBars: number
  /** Size (1–9) of the colored bead bar laid beside the row, or null. */
  coloredBar: number | null
}

export interface TeenBoardState {
  /** Nine rows, top (index 0) to bottom (index 8). */
  rows: RowState[]
}

export function createBoard(): TeenBoardState {
  return {
    rows: Array.from({ length: ROW_COUNT }, () => ({ card: null, tenBars: 0, coloredBar: null })),
  }
}

function assertRow(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= ROW_COUNT) {
    throw new Error(`teen-board: row index out of range (${index})`)
  }
}

function assertUnit(n: number, what: string): void {
  if (!Number.isInteger(n) || n < 1 || n > 9) {
    throw new Error(`teen-board: ${what} must be 1–9 (got ${n})`)
  }
}

/* ---------- reading a row ---------- */

/** The number the slat shows: 10, or 10 + card when a card covers the zero. */
export function rowSymbolValue(row: RowState): number {
  return 10 + (row.card ?? 0)
}

/** The quantity of beads laid beside the row. */
export function rowBeadValue(row: RowState): number {
  return totalValue({ 1: row.tenBars, 0: row.coloredBar ?? 0 })
}

/** The child has finished laying beads: at least a ten-bar and a colored bar. */
export function rowBeadsComplete(row: RowState): boolean {
  return row.tenBars >= 1 && row.coloredBar !== null
}

/**
 * Control of error for Symbols & Beads mode: a row matches only when a card
 * is placed, exactly one ten-bar is present, and the colored bar's size
 * equals the card — i.e. the bead quantity equals the symbol shown.
 */
export function rowMatches(row: RowState): boolean {
  return (
    row.card !== null &&
    row.tenBars === 1 &&
    row.coloredBar !== null &&
    rowBeadValue(row) === rowSymbolValue(row)
  )
}

/** Sequence check: card n belongs in row n (row index 0 holds card 1 → 11). */
export function cardInCorrectRow(row: RowState, rowIndex: number): boolean {
  assertRow(rowIndex)
  return row.card === rowIndex + 1
}

/** True when the rows read 11, 12, … 19 from top to bottom. */
export function sequenceComplete(state: TeenBoardState): boolean {
  return state.rows.every((row, i) => cardInCorrectRow(row, i))
}

/** True when every row's beads match its numeral (Symbols & Beads mode). */
export function allRowsMatch(state: TeenBoardState): boolean {
  return state.rows.every(rowMatches)
}

/* ---------- supplies ---------- */

/** Unit cards still in the tray (each card exists exactly once). */
export function availableCards(state: TeenBoardState): number[] {
  const placed = new Set(state.rows.map((r) => r.card))
  return UNIT_VALUES.filter((n) => !placed.has(n))
}

/** Colored bead bars still in the supply (one of each size 1–9). */
export function availableColoredBars(state: TeenBoardState): number[] {
  const placed = new Set(state.rows.map((r) => r.coloredBar))
  return UNIT_VALUES.filter((n) => !placed.has(n))
}

/** Golden ten-bars remaining in the supply. */
export function availableTenBars(state: TeenBoardState): number {
  return TEN_BAR_SUPPLY - state.rows.reduce((sum, r) => sum + r.tenBars, 0)
}

/* ---------- moves (all immutable) ---------- */

function withRow(state: TeenBoardState, index: number, patch: Partial<RowState>): TeenBoardState {
  return { rows: state.rows.map((r, i) => (i === index ? { ...r, ...patch } : r)) }
}

/**
 * Slide a unit card over the zero of a row. There is only one of each card:
 * if it sits on another row it moves from there, and any card already on the
 * target row goes back to the tray.
 */
export function placeCard(state: TeenBoardState, card: number, rowIndex: number): TeenBoardState {
  assertUnit(card, 'card')
  assertRow(rowIndex)
  return {
    rows: state.rows.map((r, i) => {
      if (i === rowIndex) return { ...r, card }
      if (r.card === card) return { ...r, card: null }
      return r
    }),
  }
}

/** Take the card off a row: the slat reads '10' again. */
export function removeCard(state: TeenBoardState, rowIndex: number): TeenBoardState {
  assertRow(rowIndex)
  return withRow(state, rowIndex, { card: null })
}

/** Lay one golden ten-bar beside a row (from the shared supply). */
export function addTenBar(state: TeenBoardState, rowIndex: number): TeenBoardState {
  assertRow(rowIndex)
  if (availableTenBars(state) < 1) throw new Error('teen-board: no ten-bars left in the supply')
  return withRow(state, rowIndex, { tenBars: state.rows[rowIndex].tenBars + 1 })
}

/** Put one ten-bar from a row back in the supply. */
export function removeTenBar(state: TeenBoardState, rowIndex: number): TeenBoardState {
  assertRow(rowIndex)
  const n = state.rows[rowIndex].tenBars
  if (n < 1) throw new Error('teen-board: no ten-bar in this row to remove')
  return withRow(state, rowIndex, { tenBars: n - 1 })
}

/**
 * Lay a colored bead bar beside a row. One bar of each size exists: it moves
 * from any other row holding it, and a bar already on the target row returns
 * to the supply.
 */
export function placeColoredBar(state: TeenBoardState, size: number, rowIndex: number): TeenBoardState {
  assertUnit(size, 'colored bar')
  assertRow(rowIndex)
  return {
    rows: state.rows.map((r, i) => {
      if (i === rowIndex) return { ...r, coloredBar: size }
      if (r.coloredBar === size) return { ...r, coloredBar: null }
      return r
    }),
  }
}

/** Put a row's colored bar back in the supply. */
export function removeColoredBar(state: TeenBoardState, rowIndex: number): TeenBoardState {
  assertRow(rowIndex)
  return withRow(state, rowIndex, { coloredBar: null })
}
