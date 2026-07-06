/**
 * Short bead chains model (pure logic, no React).
 *
 * The chain of n (for n = 2…10) is n bars of n beads joined end to end,
 * n² beads in all. An arrow label ("ticket") belongs at the end of each
 * bar: slot k (0-indexed) reads (k + 1) · n, so the final ticket is the
 * square n². Tickets start shuffled in a tray; the child places them one
 * by one, and evaluation marks each placed ticket right or wrong.
 */

import { createRng } from '../../lib/rng'

export const CHAIN_MIN = 2
export const CHAIN_MAX = 10

export interface ChainState {
  /** Which chain, 2–10. */
  n: number
  /** Ticket values still in the tray, in display order. */
  tray: number[]
  /** Ticket value placed at each slot (slot k = end of bar k), or null. */
  placements: (number | null)[]
}

/** Per-slot evaluation: right, wrong, or nothing placed yet. */
export type SlotResult = 'correct' | 'wrong' | 'empty'

function assertChainSize(n: number): void {
  if (!Number.isInteger(n) || n < CHAIN_MIN || n > CHAIN_MAX) {
    throw new Error(`bead-chains: chain size must be an integer ${CHAIN_MIN}–${CHAIN_MAX}, got ${n}`)
  }
}

/** The bars of the chain of n: exactly n bars, each of n beads. */
export function chainBars(n: number): number[] {
  assertChainSize(n)
  return Array.from({ length: n }, () => n)
}

/** Total beads on the chain of n (always the square, n²). */
export function chainTotal(n: number): number {
  assertChainSize(n)
  return n * n
}

/** The correct ticket for slot k (0-indexed): (k + 1) · n. */
export function correctValue(n: number, slotIndex: number): number {
  assertChainSize(n)
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= n) {
    throw new Error(`bead-chains: slot index out of range for chain of ${n}: ${slotIndex}`)
  }
  return (slotIndex + 1) * n
}

/** All ticket values for the chain of n, in order: n, 2n, …, n². */
export function slotValues(n: number): number[] {
  assertChainSize(n)
  return Array.from({ length: n }, (_, k) => (k + 1) * n)
}

/** A fresh chain with every slot empty and the tray shuffled by seed. */
export function createChain(n: number, seed: number): ChainState {
  assertChainSize(n)
  return {
    n,
    tray: createRng(seed).shuffle(slotValues(n)),
    placements: Array.from({ length: n }, () => null),
  }
}

/**
 * Move the ticket at `trayIndex` onto slot `slotIndex`. If the slot already
 * holds a ticket, that ticket returns to the end of the tray.
 */
export function placeTicket(state: ChainState, trayIndex: number, slotIndex: number): ChainState {
  if (trayIndex < 0 || trayIndex >= state.tray.length) {
    throw new Error(`bead-chains: no ticket at tray index ${trayIndex}`)
  }
  if (slotIndex < 0 || slotIndex >= state.placements.length) {
    throw new Error(`bead-chains: no slot at index ${slotIndex}`)
  }
  const value = state.tray[trayIndex]
  const displaced = state.placements[slotIndex]
  const tray = state.tray.filter((_, i) => i !== trayIndex)
  if (displaced !== null) tray.push(displaced)
  return {
    ...state,
    tray,
    placements: state.placements.map((v, i) => (i === slotIndex ? value : v)),
  }
}

/** Take the ticket off slot `slotIndex` and return it to the end of the tray. */
export function removeTicket(state: ChainState, slotIndex: number): ChainState {
  if (slotIndex < 0 || slotIndex >= state.placements.length) {
    throw new Error(`bead-chains: no slot at index ${slotIndex}`)
  }
  const value = state.placements[slotIndex]
  if (value === null) return state
  return {
    ...state,
    tray: [...state.tray, value],
    placements: state.placements.map((v, i) => (i === slotIndex ? null : v)),
  }
}

/**
 * Check every slot: 'correct' when the placed ticket matches (k + 1) · n,
 * 'wrong' for any misplacement, 'empty' when nothing is placed. Flags every
 * misplacement and nothing else.
 */
export function evaluate(state: ChainState): SlotResult[] {
  return state.placements.map((v, k) => {
    if (v === null) return 'empty'
    return v === correctValue(state.n, k) ? 'correct' : 'wrong'
  })
}

/** True when every slot holds its correct ticket. */
export function isComplete(state: ChainState): boolean {
  return evaluate(state).every((r) => r === 'correct')
}
