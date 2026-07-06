/**
 * Cards & Counters — pure model.
 *
 * Ten numeral cards (1–10) drawn from a shuffled tray into ten ordered
 * slots, plus a shared supply of exactly 55 red counters (1+2+…+10).
 * The supply is the control of error: any card with the wrong count means
 * the child runs out early or has counters left over at the end.
 *
 * All functions are pure; invalid moves return the SAME state object so
 * callers can cheaply detect no-ops.
 */

import { createRng } from '../../lib/rng'

/** The numeral cards, in numeric order. */
export const CARD_VALUES: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/** Number of card slots laid left to right; slot i expects card i + 1. */
export const SLOT_COUNT = 10

/** Exactly 55 counters in the box: 1 + 2 + … + 10. */
export const TOTAL_COUNTERS = 55

export type Parity = 'odd' | 'even'

export interface CardsAndCountersState {
  /** Cards not yet placed, in shuffled tray order. */
  tray: readonly number[]
  /** slots[i] is the card lying in position i (expected: i + 1), or null. */
  slots: readonly (number | null)[]
  /** counters[i] = red counters laid below slot i. */
  counters: readonly number[]
  /** Card currently picked up from the tray, or null. */
  selected: number | null
}

/** Per-slot verdict returned by the Check control. */
export interface SlotCheck {
  cardPlaced: boolean
  /** The card in this slot is the one the sequence calls for. */
  cardCorrect: boolean
  /** The counters below match the card actually lying there. */
  countCorrect: boolean
}

/** Where counter k of n sits in the traditional pattern. */
export interface CounterPosition {
  /** 0-based row, pairs filled top to bottom. */
  row: number
  /** 0 = left, 1 = right; ignored when centered. */
  col: 0 | 1
  /** True only for the lone final counter of an odd number. */
  centered: boolean
}

/** Start a game from an explicit tray order (must be a permutation of 1–10). */
export function createState(trayOrder: readonly number[]): CardsAndCountersState {
  const sorted = [...trayOrder].sort((a, b) => a - b)
  if (sorted.length !== SLOT_COUNT || sorted.some((v, i) => v !== i + 1)) {
    throw new Error('createState: tray must be a permutation of the cards 1–10')
  }
  return {
    tray: [...trayOrder],
    slots: new Array<number | null>(SLOT_COUNT).fill(null),
    counters: new Array<number>(SLOT_COUNT).fill(0),
    selected: null,
  }
}

/** Start a game with the cards shuffled deterministically by seed. */
export function newGame(seed: number): CardsAndCountersState {
  return createState(createRng(seed).shuffle(CARD_VALUES))
}

export function countersPlaced(state: CardsAndCountersState): number {
  return state.counters.reduce((sum, c) => sum + c, 0)
}

/** Counters still in the bowl. Never negative — addCounter refuses at zero. */
export function supplyRemaining(state: CardsAndCountersState): number {
  return TOTAL_COUNTERS - countersPlaced(state)
}

/** Pick up (or put back down) a card in the tray. */
export function toggleSelect(state: CardsAndCountersState, value: number): CardsAndCountersState {
  if (!state.tray.includes(value)) return state
  return { ...state, selected: state.selected === value ? null : value }
}

/** Lay the selected card in an empty slot. */
export function placeSelected(state: CardsAndCountersState, slotIndex: number): CardsAndCountersState {
  const card = state.selected
  if (card === null || slotIndex < 0 || slotIndex >= SLOT_COUNT) return state
  if (state.slots[slotIndex] !== null) return state
  return {
    ...state,
    tray: state.tray.filter((v) => v !== card),
    slots: state.slots.map((c, i) => (i === slotIndex ? card : c)),
    selected: null,
  }
}

/** Return a placed card to the tray; its counters go back to the supply. */
export function pickUpCard(state: CardsAndCountersState, slotIndex: number): CardsAndCountersState {
  const card = state.slots[slotIndex]
  if (card === null || card === undefined) return state
  return {
    ...state,
    tray: [...state.tray, card],
    slots: state.slots.map((c, i) => (i === slotIndex ? null : c)),
    counters: state.counters.map((c, i) => (i === slotIndex ? 0 : c)),
  }
}

export function canAddCounter(state: CardsAndCountersState, slotIndex: number): boolean {
  return state.slots[slotIndex] != null && supplyRemaining(state) > 0
}

/** Take one counter from the bowl and lay it under a card. No-op when empty. */
export function addCounter(state: CardsAndCountersState, slotIndex: number): CardsAndCountersState {
  if (!canAddCounter(state, slotIndex)) return state
  return { ...state, counters: state.counters.map((c, i) => (i === slotIndex ? c + 1 : c)) }
}

/** Put one counter from under a card back in the bowl. */
export function removeCounter(state: CardsAndCountersState, slotIndex: number): CardsAndCountersState {
  if ((state.counters[slotIndex] ?? 0) <= 0) return state
  return { ...state, counters: state.counters.map((c, i) => (i === slotIndex ? c - 1 : c)) }
}

export function checkSlot(state: CardsAndCountersState, slotIndex: number): SlotCheck {
  const card = state.slots[slotIndex]
  return {
    cardPlaced: card !== null,
    cardCorrect: card === slotIndex + 1,
    countCorrect: card !== null && state.counters[slotIndex] === card,
  }
}

export function checkAll(state: CardsAndCountersState): SlotCheck[] {
  return state.slots.map((_, i) => checkSlot(state, i))
}

/**
 * True iff the cards read 1–10 left to right AND every card n has exactly
 * n counters — which also means the bowl is exactly empty.
 */
export function isLayoutCorrect(state: CardsAndCountersState): boolean {
  return checkAll(state).every((c) => c.cardCorrect && c.countCorrect)
}

export function classifyOddEven(n: number): Parity {
  return n % 2 === 0 ? 'even' : 'odd'
}

/** Rows in the traditional counter pattern: pairs stacked, so ceil(n / 2). */
export function counterRows(n: number): number {
  return Math.ceil(n / 2)
}

/**
 * The traditional layout for n counters: pairs side by side filling rows
 * top to bottom, with the odd counter alone and centered at the bottom.
 */
export function counterPositions(n: number): CounterPosition[] {
  const out: CounterPosition[] = []
  for (let k = 0; k < n; k++) {
    out.push({
      row: Math.floor(k / 2),
      col: (k % 2) as 0 | 1,
      centered: n % 2 === 1 && k === n - 1,
    })
  }
  return out
}
