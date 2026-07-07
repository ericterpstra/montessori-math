/**
 * Multiplication charts (Charts 1–3) — pure model.
 *
 * Chart 1 is the full control chart: every fact a × b for a, b in 1..9.
 * Chart 2 is the half chart: only a ≤ b, because 3 × 5 and 5 × 3 share an
 * answer. Chart 3 is the working chart: a blank grid the child fills with
 * answer tiles from memory, then checks against the control chart.
 */

export const CHART_MIN = 1
export const CHART_MAX = 9
/** Cells in Chart 1 / tiles in the working-chart bank. */
export const CELL_COUNT = 81
/** Cells in Chart 2 (a ≤ b half). */
export const HALF_COUNT = 45

export interface ChartCell {
  /** Row operand (left header), 1–9. */
  a: number
  /** Column operand (top header), 1–9. */
  b: number
  /** The fact's answer: a × b. */
  value: number
}

function assertOperand(n: number, label: string): void {
  if (!Number.isInteger(n) || n < CHART_MIN || n > CHART_MAX) {
    throw new Error(`${label} must be a whole number from 1 to ${CHART_MAX}, got ${n}`)
  }
}

/** The fact this material memorizes. */
export function fact(a: number, b: number): number {
  assertOperand(a, 'a')
  assertOperand(b, 'b')
  return a * b
}

/** Chart 1 — the full control chart, row-major: (1,1), (1,2) … (9,9). */
export function multiplicationChart1(): ChartCell[] {
  const cells: ChartCell[] = []
  for (let a = CHART_MIN; a <= CHART_MAX; a++)
    for (let b = CHART_MIN; b <= CHART_MAX; b++) cells.push({ a, b, value: fact(a, b) })
  return cells
}

/** Chart 2 — the commutativity half chart: only cells with a ≤ b. */
export function multiplicationChart2(): ChartCell[] {
  return multiplicationChart1().filter((c) => c.a <= c.b)
}

export type CellKey = `${number},${number}`

export function cellKey(a: number, b: number): CellKey {
  assertOperand(a, 'a')
  assertOperand(b, 'b')
  return `${a},${b}`
}

export interface WorkingState {
  /** Answer tiles placed so far, keyed 'a,b'. */
  readonly placed: ReadonlyMap<CellKey, number>
  /** Tiles still in the box, always sorted ascending; duplicates expected. */
  readonly bank: readonly number[]
}

/** A fresh working chart: empty grid, one tile per fact (81) in the bank. */
export function createWorkingState(): WorkingState {
  const bank = multiplicationChart1().map((c) => c.value).sort((x, y) => x - y)
  return { placed: new Map(), bank }
}

export function canPlaceTile(state: WorkingState, a: number, b: number, tile: number): boolean {
  return !state.placed.has(cellKey(a, b)) && state.bank.includes(tile)
}

/** Place `tile` on empty cell (a,b); unchanged state if occupied or tile not in bank. */
export function placeTile(state: WorkingState, a: number, b: number, tile: number): WorkingState {
  if (!canPlaceTile(state, a, b, tile)) return state
  const placed = new Map(state.placed)
  placed.set(cellKey(a, b), tile)
  const i = state.bank.indexOf(tile)
  const bank = [...state.bank.slice(0, i), ...state.bank.slice(i + 1)]
  return { placed, bank }
}

/** Take the tile off cell (a,b) and put it back in the bank (no-op if empty). */
export function removeTile(state: WorkingState, a: number, b: number): WorkingState {
  const key = cellKey(a, b)
  const tile = state.placed.get(key)
  if (tile === undefined) return state
  const placed = new Map(state.placed)
  placed.delete(key)
  const bank = [...state.bank, tile].sort((x, y) => x - y)
  return { placed, bank }
}

export interface PlacementCheck {
  /** [a, b] of placed tiles matching the fact table, row-major order. */
  correct: Array<[number, number]>
  /** [a, b] of placed tiles that do not match, row-major order. */
  wrong: Array<[number, number]>
}

/** Honest check: compares only what the child has placed, cell by cell. */
export function checkPlacements(state: WorkingState): PlacementCheck {
  const correct: Array<[number, number]> = []
  const wrong: Array<[number, number]> = []
  for (const { a, b, value } of multiplicationChart1()) {
    const tile = state.placed.get(cellKey(a, b))
    if (tile === undefined) continue
    ;(tile === value ? correct : wrong).push([a, b])
  }
  return { correct, wrong }
}

/** True only when all 81 cells are filled and every tile matches its fact. */
export function isComplete(state: WorkingState): boolean {
  return state.placed.size === CELL_COUNT && checkPlacements(state).wrong.length === 0
}
