/**
 * Hundred board model — pure logic, no React.
 *
 * The board is a 10×10 grid of cells numbered 1–100 (left to right, top to
 * bottom) and a set of tiles numbered 1–100. A tile is correctly placed iff
 * its value equals its cell number. Skip-count mode works on a pre-filled
 * board: the child taps the multiples of a chosen number and the evaluation
 * reports exact hits, misses, and wrong taps.
 */
import { createRng } from '../../lib/rng'

export const ROWS = 10
export const COLS = 10
export const TILE_COUNT = 100

/** All tile values (equivalently, all cell numbers), 1–100 ascending. */
export const ALL_TILES: readonly number[] = Array.from({ length: TILE_COUNT }, (_, i) => i + 1)

/** Map from cell number (1–100) to the tile value placed there. */
export type Placements = ReadonlyMap<number, number>

function assertInRange(kind: 'cell' | 'tile', n: number): void {
  if (!Number.isInteger(n) || n < 1 || n > TILE_COUNT) {
    throw new Error(`hundred-board: ${kind} out of range (${n})`)
  }
}

export function emptyPlacements(): Placements {
  return new Map()
}

/** Immutably place `tile` on `cell`. Throws if the cell is occupied or the tile is already on the board. */
export function placeTile(placements: Placements, cell: number, tile: number): Placements {
  assertInRange('cell', cell)
  assertInRange('tile', tile)
  if (placements.has(cell)) throw new Error(`hundred-board: cell ${cell} is already occupied`)
  for (const t of placements.values()) {
    if (t === tile) throw new Error(`hundred-board: tile ${tile} is already on the board`)
  }
  const next = new Map(placements)
  next.set(cell, tile)
  return next
}

/** Immutably return the tile at `cell` to the tray. Throws if the cell is empty. */
export function removeTileAt(placements: Placements, cell: number): Placements {
  assertInRange('cell', cell)
  if (!placements.has(cell)) throw new Error(`hundred-board: cell ${cell} is empty`)
  const next = new Map(placements)
  next.delete(cell)
  return next
}

/** Values of every tile currently on the board. */
export function placedTileSet(placements: Placements): ReadonlySet<number> {
  return new Set(placements.values())
}

/** A tile is correct iff its value equals its cell number. */
export function isCorrectPlacement(cell: number, tile: number): boolean {
  return cell === tile
}

/** Cells holding a tile that does not belong there, ascending. */
export function misplacedCells(placements: Placements): number[] {
  const out: number[] = []
  for (const [cell, tile] of placements) {
    if (!isCorrectPlacement(cell, tile)) out.push(cell)
  }
  return out.sort((a, b) => a - b)
}

/** True iff all 100 tiles are placed and every one is correct. */
export function isBoardComplete(placements: Placements): boolean {
  return placements.size === TILE_COUNT && misplacedCells(placements).length === 0
}

/** Tiles not yet on the board, ascending — the tray for "in order" mode. */
export function remainingTilesInOrder(placements: Placements): number[] {
  const placed = placedTileSet(placements)
  return ALL_TILES.filter((t) => !placed.has(t))
}

/** The next tile the "in order" tray offers, or null when the tray is empty. */
export function nextTileInOrder(placements: Placements): number | null {
  const remaining = remainingTilesInOrder(placements)
  return remaining.length > 0 ? remaining[0] : null
}

/** Deterministic seeded shuffle of all 100 tiles (the authentic mixed pile). */
export function shuffledTileOrder(seed: number): number[] {
  return createRng(seed).shuffle(ALL_TILES)
}

/** Tiles not yet on the board, in seeded shuffled order — the tray for "shuffled" mode. */
export function remainingTilesShuffled(placements: Placements, seed: number): number[] {
  const placed = placedTileSet(placements)
  return shuffledTileOrder(seed).filter((t) => !placed.has(t))
}

/** Multiples of n on the board: n, 2n, … up to 100. */
export function multiplesOf(n: number): ReadonlySet<number> {
  assertInRange('tile', n)
  const out = new Set<number>()
  for (let m = n; m <= TILE_COUNT; m += n) out.add(m)
  return out
}

export interface SkipCountEvaluation {
  /** Tapped cells that are multiples of n, ascending. */
  correctHits: number[]
  /** Multiples of n the child did not tap, ascending. */
  misses: number[]
  /** Tapped cells that are not multiples of n, ascending. */
  wrongTaps: number[]
}

/** Honest evaluation of a skip-count attempt: which taps hit, which multiples were missed, which taps were wrong. */
export function evaluateSkipCount(n: number, taps: Iterable<number>): SkipCountEvaluation {
  const multiples = multiplesOf(n)
  const tapSet = new Set<number>()
  for (const t of taps) {
    assertInRange('cell', t)
    tapSet.add(t)
  }
  const correctHits: number[] = []
  const wrongTaps: number[] = []
  for (const t of [...tapSet].sort((a, b) => a - b)) {
    if (multiples.has(t)) correctHits.push(t)
    else wrongTaps.push(t)
  }
  const misses = [...multiples].filter((m) => !tapSet.has(m)).sort((a, b) => a - b)
  return { correctHits, misses, wrongTaps }
}
