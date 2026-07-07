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

/* ---------- Long chains: the golden 100 chain and 1,000 chain ---------- */

export type LongChainKind = 100 | 1000

export interface LongChainSpec {
  /** Number of golden ten-bars: 10 or 100. */
  bars: number
  /** Arrow-label values in order: 10, 20, …, kind. */
  labelValues: number[]
  /** Multiples of 100 up to kind: [100] or [100, 200, …, 1000]. */
  milestones: number[]
}

function assertLongKind(kind: number): void {
  if (kind !== 100 && kind !== 1000) {
    throw new Error(`bead-chains: long chain must be 100 or 1000, got ${kind}`)
  }
}

export function longChain(kind: LongChainKind): LongChainSpec {
  assertLongKind(kind)
  const bars = kind / 10
  return {
    bars,
    labelValues: Array.from({ length: bars }, (_, k) => (k + 1) * 10),
    milestones: Array.from({ length: kind / 100 }, (_, i) => (i + 1) * 100),
  }
}

export interface LongChainState {
  kind: LongChainKind
  /** Unplaced ticket values — always ascending (arrows come boxed in order). */
  tray: number[]
  /** Ticket placed at each slot (slot k = end of ten-bar k), or null. */
  placements: (number | null)[]
}

export function createLongChain(kind: LongChainKind): LongChainState {
  const spec = longChain(kind)
  return {
    kind,
    tray: [...spec.labelValues],
    placements: Array.from({ length: spec.bars }, () => null),
  }
}

/** The correct ticket for long-chain slot k (0-indexed): (k + 1) · 10. */
export function longCorrectValue(kind: LongChainKind, slotIndex: number): number {
  assertLongKind(kind)
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= kind / 10) {
    throw new Error(`bead-chains: slot index out of range for the ${kind} chain: ${slotIndex}`)
  }
  return (slotIndex + 1) * 10
}

/** Mirrors placeTicket, but the tray stays ascending when a displaced ticket returns. */
export function placeLongTicket(state: LongChainState, trayIndex: number, slotIndex: number): LongChainState {
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
  tray.sort((a, b) => a - b)
  return {
    ...state,
    tray,
    placements: state.placements.map((v, i) => (i === slotIndex ? value : v)),
  }
}

/** Mirrors removeTicket; the returned ticket re-enters the tray in ascending position. */
export function removeLongTicket(state: LongChainState, slotIndex: number): LongChainState {
  if (slotIndex < 0 || slotIndex >= state.placements.length) {
    throw new Error(`bead-chains: no slot at index ${slotIndex}`)
  }
  const value = state.placements[slotIndex]
  if (value === null) return state
  return {
    ...state,
    tray: [...state.tray, value].sort((a, b) => a - b),
    placements: state.placements.map((v, i) => (i === slotIndex ? null : v)),
  }
}

/** Same contract as evaluate(): flags every misplacement and nothing else. */
export function evaluateLong(state: LongChainState): SlotResult[] {
  return state.placements.map((v, k) => {
    if (v === null) return 'empty'
    return v === longCorrectValue(state.kind, k) ? 'correct' : 'wrong'
  })
}

export function isLongComplete(state: LongChainState): boolean {
  return evaluateLong(state).every((r) => r === 'correct')
}

/**
 * Windowing for the scrolling stage: the inclusive [start, end] bar indices
 * worth rendering, i.e. the bars intersecting the viewport plus `buffer`
 * bars on each side, clamped to [0, totalBars - 1].
 */
export function visibleBarRange(
  scrollLeft: number,
  viewportWidth: number,
  barWidth: number,
  totalBars: number,
  buffer = 5,
): [number, number] {
  if (barWidth <= 0 || totalBars <= 0) {
    throw new Error(`bead-chains: visibleBarRange needs positive barWidth and totalBars`)
  }
  const first = Math.floor(scrollLeft / barWidth)
  const last = Math.floor((scrollLeft + viewportWidth) / barWidth)
  const start = Math.max(0, Math.min(first, totalBars - 1) - buffer)
  const end = Math.min(totalBars - 1, last + buffer)
  return [start, Math.max(start, end)]
}
