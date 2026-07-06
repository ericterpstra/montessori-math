/**
 * Ten Board (Seguin Board B) — pure model, no React.
 *
 * The board's slats print the tens 10, 20, … 90; a unit card 1–9 slid over a
 * zero makes any number up to 99 (card 4 on the 30 row reads 34). The symbol
 * side (board + card) and the quantity side (golden ten-bars + loose unit
 * beads) are modeled separately so the child builds both and compares them,
 * exactly like the physical material.
 */

import { exchangeUp, totalValue, type PlaceCounts } from '../../lib/placeValue'
import { createRng } from '../../lib/rng'

export const TEN_BOARD_MIN = 10
export const TEN_BOARD_MAX = 99

/** The tens printed down the board's slats, split over two wooden panels. */
export const BOARD_ROWS: readonly number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90]

/* ------------------------------------------------------------------
   Symbol side: the board rows and the unit cards
   ------------------------------------------------------------------ */

export interface SymbolState {
  /** Selected row as its tens digit, 1–9; 0 = no row chosen yet. */
  tens: number
  /** Unit card slid over the zero, 1–9; 0 = the printed zero still shows. */
  unit: number
}

export const EMPTY_SYMBOL: SymbolState = { tens: 0, unit: 0 }

/** What the board reads, or null if no row has been chosen. */
export function symbolValue(s: SymbolState): number | null {
  if (s.tens < 1) return null
  return s.tens * 10 + s.unit
}

/* ------------------------------------------------------------------
   Quantity side: golden ten-bars and loose unit beads
   ------------------------------------------------------------------ */

export interface BeadState {
  tenBars: number
  unitBeads: number
}

export const EMPTY_BEADS: BeadState = { tenBars: 0, unitBeads: 0 }

/** The physical supply: nine ten-bars; a tenth loose unit forces an exchange. */
export const MAX_TEN_BARS = 9
export const MAX_UNIT_BEADS = 10

function toCounts(b: BeadState): PlaceCounts {
  return { 1: b.tenBars, 0: b.unitBeads }
}

export function beadValue(b: BeadState): number {
  return totalValue(toCounts(b))
}

/**
 * Beads match a number only in canonical form — exactly as many ten-bars as
 * the tens digit and as many loose units as the units digit. Two bars and
 * fourteen units may total 34, but on the ten board that is not yet 34.
 */
export function beadsMatchValue(b: BeadState, value: number): boolean {
  return b.tenBars === Math.floor(value / 10) && b.unitBeads === value % 10
}

export function beadsMatchSymbol(b: BeadState, s: SymbolState): boolean {
  const v = symbolValue(s)
  return v !== null && beadsMatchValue(b, v)
}

/** True when ten loose units lie on the mat and must become a ten-bar. */
export function needsExchange(b: BeadState): boolean {
  return b.unitBeads >= MAX_UNIT_BEADS
}

/** Gather ten loose units into one golden ten-bar. */
export function exchangeUnits(b: BeadState): BeadState {
  if (!needsExchange(b)) {
    throw new Error('exchangeUnits: need ten loose units to exchange')
  }
  const counts = exchangeUp(toCounts(b), 0)
  return { tenBars: counts[1] ?? 0, unitBeads: counts[0] ?? 0 }
}

export function canAddUnitBead(b: BeadState): boolean {
  return b.unitBeads < MAX_UNIT_BEADS && beadValue(b) < TEN_BOARD_MAX
}

export function addUnitBead(b: BeadState): BeadState {
  if (!canAddUnitBead(b)) throw new Error('addUnitBead: no more unit beads fit')
  return { ...b, unitBeads: b.unitBeads + 1 }
}

export function canRemoveUnitBead(b: BeadState): boolean {
  return b.unitBeads > 0
}

export function removeUnitBead(b: BeadState): BeadState {
  if (!canRemoveUnitBead(b)) throw new Error('removeUnitBead: none on the mat')
  return { ...b, unitBeads: b.unitBeads - 1 }
}

export function canAddTenBar(b: BeadState): boolean {
  return b.tenBars < MAX_TEN_BARS && beadValue(b) + 10 <= TEN_BOARD_MAX
}

export function addTenBar(b: BeadState): BeadState {
  if (!canAddTenBar(b)) throw new Error('addTenBar: no more ten-bars fit')
  return { ...b, tenBars: b.tenBars + 1 }
}

export function canRemoveTenBar(b: BeadState): boolean {
  return b.tenBars > 0
}

export function removeTenBar(b: BeadState): BeadState {
  if (!canRemoveTenBar(b)) throw new Error('removeTenBar: none on the mat')
  return { ...b, tenBars: b.tenBars - 1 }
}

/* ------------------------------------------------------------------
   Counting mode: step 10, 11, … 99 with the exchange ceremony
   ------------------------------------------------------------------ */

export interface CountingState {
  /** The number the board currently shows, 10–99. */
  current: number
  beads: BeadState
}

export function startCounting(): CountingState {
  return { current: TEN_BOARD_MIN, beads: { tenBars: 1, unitBeads: 0 } }
}

export function isCountingDone(s: CountingState): boolean {
  return s.current >= TEN_BOARD_MAX
}

/** Counting on is allowed unless the board is full or an exchange is due. */
export function canCountUp(s: CountingState): boolean {
  return !isCountingDone(s) && !needsExchange(s.beads)
}

/**
 * Add one unit bead. If nine loose units become ten, the count pauses on the
 * same number until the child performs the exchange — stepping x9 → (x+1)0
 * always passes through the exchange ceremony.
 */
export function countUp(s: CountingState): CountingState {
  if (!canCountUp(s)) throw new Error('countUp: exchange first or the board is full')
  const beads: BeadState = { ...s.beads, unitBeads: s.beads.unitBeads + 1 }
  const current = needsExchange(beads) ? s.current : s.current + 1
  return { current, beads }
}

/** Gather the ten loose units into a ten-bar; the count lands on the new ten. */
export function countingExchange(s: CountingState): CountingState {
  const beads = exchangeUnits(s.beads)
  return { current: beadValue(beads), beads }
}

export function countingPrompt(s: CountingState): string {
  if (isCountingDone(s)) {
    return 'Ninety-nine — the last number on the board. Press Reset to count again from ten.'
  }
  if (needsExchange(s.beads)) {
    return 'Ten loose unit beads! Gather them into one golden ten-bar.'
  }
  return `Add a unit bead to make ${numberWord(s.current + 1)}.`
}

/* ------------------------------------------------------------------
   Make-the-number mode: seeded targets and honest checking
   ------------------------------------------------------------------ */

/**
 * Deterministic target for round n (0-based) of a seeded game: the same seed
 * always produces the same sequence of numbers 11–99.
 */
export function nthTarget(seed: number, round: number): number {
  const rng = createRng(seed)
  let target = TEN_BOARD_MIN + 1
  for (let i = 0; i <= round; i++) target = rng.int(TEN_BOARD_MIN + 1, TEN_BOARD_MAX)
  return target
}

export interface CheckResult {
  symbolCorrect: boolean
  beadsCorrect: boolean
}

/** Compare the built symbol and the laid-out beads against the target. */
export function checkTarget(target: number, symbol: SymbolState, beads: BeadState): CheckResult {
  return {
    symbolCorrect: symbolValue(symbol) === target,
    beadsCorrect: beadsMatchValue(beads, target),
  }
}

/* ------------------------------------------------------------------
   Number names 10–99 (for the readout and the names-of-tens lesson)
   ------------------------------------------------------------------ */

const UNIT_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
const TEEN_WORDS = [
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]
const TENS_WORDS = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

export function numberWord(n: number): string {
  if (!Number.isInteger(n) || n < TEN_BOARD_MIN || n > TEN_BOARD_MAX) {
    throw new Error(`numberWord: ${n} is not on the ten board (10–99)`)
  }
  if (n < 20) return TEEN_WORDS[n - 10]
  const tens = Math.floor(n / 10)
  const unit = n % 10
  return unit === 0 ? TENS_WORDS[tens] : `${TENS_WORDS[tens]}-${UNIT_WORDS[unit]}`
}
