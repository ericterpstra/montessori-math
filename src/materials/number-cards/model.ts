/**
 * Large Number Cards — pure model.
 *
 * The material is the classic set of 36 cards: 1–9 (units, green),
 * 10–90 (tens, blue), 100–900 (hundreds, red), 1000–9000 (thousands, green).
 * At most one card may be chosen per place; composing the chosen cards
 * (stacked, right edges aligned) reads as a single number.
 */

import { compose, countsFromNumber, formatNumber } from '../../lib/placeValue'
import type { PlaceDigit } from '../../lib/placeValue'
import type { RNG } from '../../lib/rng'

/** The four places covered by the card set: units through thousands. */
export type CardPlace = 0 | 1 | 2 | 3

/** All card places, highest first (matches reading order left → right). */
export const CARD_PLACES_DESC: readonly CardPlace[] = [3, 2, 1, 0]

export const PLACE_LABELS: Record<CardPlace, string> = {
  3: 'Thousands',
  2: 'Hundreds',
  1: 'Tens',
  0: 'Units',
}

/** Value of the card for `digit` in `place`, e.g. (2, 5) → 500. */
export function cardValue(place: CardPlace, digit: number): number {
  return digit * 10 ** place
}

export interface BankColumn {
  place: CardPlace
  label: string
  /** Card values 1×10^place … 9×10^place. */
  cards: number[]
}

/** The bird's-eye bank layout: one column per place, thousands → units. */
export function bankColumns(): BankColumn[] {
  return CARD_PLACES_DESC.map((place) => ({
    place,
    label: PLACE_LABELS[place],
    cards: Array.from({ length: 9 }, (_, i) => cardValue(place, i + 1)),
  }))
}

/**
 * The chosen card per place, stored as the digit 1–9.
 * An absent place means no card is on the mat there.
 */
export type Selection = Partial<Record<CardPlace, number>>

function assertDigit(digit: number): void {
  if (!Number.isInteger(digit) || digit < 1 || digit > 9) {
    throw new Error(`selectCard: digit must be 1–9, got ${digit}`)
  }
}

/**
 * Tap a bank card. Only one card per place is allowed: choosing a second
 * tens card replaces the first. Tapping the already-chosen card returns
 * it to the bank (removes it).
 */
export function selectCard(sel: Selection, place: CardPlace, digit: number): Selection {
  assertDigit(digit)
  const next: Selection = { ...sel }
  if (next[place] === digit) delete next[place]
  else next[place] = digit
  return next
}

/** Return the card in `place` (if any) to the bank. */
export function removeCard(sel: Selection, place: CardPlace): Selection {
  const next: Selection = { ...sel }
  delete next[place]
  return next
}

function selectionDigits(sel: Selection): PlaceDigit[] {
  return CARD_PLACES_DESC.filter((p) => sel[p] !== undefined).map((p) => ({
    power: p,
    digit: sel[p]!,
  }))
}

/** The number the chosen cards compose, e.g. {3:3,2:2,1:5,0:1} → 3251. */
export function composedValue(sel: Selection): number {
  return compose(selectionDigits(sel))
}

/** Chosen card values, largest place first, e.g. [3000, 200, 50, 1]. */
export function expandedParts(sel: Selection): number[] {
  return CARD_PLACES_DESC.filter((p) => sel[p] !== undefined).map((p) => cardValue(p, sel[p]!))
}

/** Prose form of the expansion, e.g. '3,000 + 200 + 50 + 1'. */
export function expansionText(sel: Selection): string {
  return expandedParts(sel).map(formatNumber).join(' + ')
}

/** The one selection of cards that builds `n` (1 ≤ n ≤ 9999). */
export function selectionFromNumber(n: number): Selection {
  if (!Number.isInteger(n) || n < 0 || n > 9999) {
    throw new Error(`selectionFromNumber: expected an integer 0–9999, got ${n}`)
  }
  const counts = countsFromNumber(n)
  const sel: Selection = {}
  for (const p of CARD_PLACES_DESC) {
    const digit = counts[p]
    if (digit) sel[p] = digit
  }
  return sel
}

/**
 * What the physical stack reads when the chosen cards are piled largest
 * on the bottom with right edges aligned: each smaller card covers the
 * trailing digits of the cards beneath it, and the zeros of a larger card
 * show through wherever no smaller card sits (so 4000 + 50 + 3 reads 4053).
 */
export function stackReading(sel: Selection): string {
  let chars: string[] = []
  for (const value of expandedParts(sel)) {
    const s = String(value).split('')
    if (chars.length === 0) chars = s
    else chars.splice(chars.length - s.length, s.length, ...s)
  }
  return chars.join('')
}

export interface PlaceCheck {
  place: CardPlace
  label: string
  /** Digit the target requires in this place (0 = no card belongs here). */
  expected: number
  /** Digit of the chosen card (0 = no card chosen). */
  actual: number
  correct: boolean
}

/** Compare the chosen cards with `target`, place by place. */
export function checkSelection(sel: Selection, target: number): PlaceCheck[] {
  const want = selectionFromNumber(target)
  return CARD_PLACES_DESC.map((place) => {
    const expected = want[place] ?? 0
    const actual = sel[place] ?? 0
    return { place, label: PLACE_LABELS[place], expected, actual, correct: expected === actual }
  })
}

export function allCorrect(checks: readonly PlaceCheck[]): boolean {
  return checks.every((c) => c.correct)
}

/**
 * A target for Read & Build / Expand It: 11–9999, preferring numbers made
 * of at least two cards so there is something to compose.
 */
export function randomTarget(rng: RNG): number {
  let n = 0
  for (let i = 0; i < 30; i++) {
    n = rng.int(11, 9999)
    if (expandedParts(selectionFromNumber(n)).length >= 2) return n
  }
  return n
}
