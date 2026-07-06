import { describe, it, expect } from 'vitest'
import {
  ROW_COUNT,
  TEN_BAR_SUPPLY,
  UNIT_VALUES,
  createBoard,
  placeCard,
  removeCard,
  addTenBar,
  removeTenBar,
  placeColoredBar,
  removeColoredBar,
  rowSymbolValue,
  rowBeadValue,
  rowBeadsComplete,
  rowMatches,
  cardInCorrectRow,
  sequenceComplete,
  allRowsMatch,
  availableCards,
  availableColoredBars,
  availableTenBars,
} from './model'
import type { TeenBoardState } from './model'

/** Build the full board: card i+1, one ten-bar, colored bar i+1 in each row. */
function buildFullBoard(): TeenBoardState {
  let s = createBoard()
  for (let i = 0; i < ROW_COUNT; i++) {
    s = placeCard(s, i + 1, i)
    s = addTenBar(s, i)
    s = placeColoredBar(s, i + 1, i)
  }
  return s
}

describe('teen-board model', () => {
  it('starts with nine empty rows all reading 10 and full supplies', () => {
    const s = createBoard()
    expect(s.rows).toHaveLength(9)
    expect(s.rows.every((r) => rowSymbolValue(r) === 10)).toBe(true)
    expect(s.rows.every((r) => rowBeadValue(r) === 0)).toBe(true)
    expect(availableCards(s)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(availableColoredBars(s)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(availableTenBars(s)).toBe(TEN_BAR_SUPPLY)
  })

  it('shows 10 + n when card n is placed, and only on that row', () => {
    const s = placeCard(createBoard(), 4, 3)
    expect(rowSymbolValue(s.rows[3])).toBe(14)
    s.rows.forEach((r, i) => {
      if (i !== 3) expect(rowSymbolValue(r)).toBe(10)
    })
  })

  it('restores the slat to 10 when the card is removed', () => {
    let s = placeCard(createBoard(), 7, 0)
    expect(rowSymbolValue(s.rows[0])).toBe(17)
    s = removeCard(s, 0)
    expect(s.rows[0].card).toBeNull()
    expect(rowSymbolValue(s.rows[0])).toBe(10)
    expect(availableCards(s)).toContain(7)
  })

  it('does not mutate the previous state (moves are immutable)', () => {
    const before = createBoard()
    placeCard(before, 5, 2)
    addTenBar(before, 2)
    expect(before.rows[2]).toEqual({ card: null, tenBars: 0, coloredBar: null })
  })

  it('keeps exactly one of each unit card: placing moves the card', () => {
    let s = placeCard(createBoard(), 4, 0)
    expect(availableCards(s)).not.toContain(4)
    // moving card 4 to another row vacates the first row
    s = placeCard(s, 4, 5)
    expect(s.rows[0].card).toBeNull()
    expect(s.rows[5].card).toBe(4)
    // placing a different card on an occupied row returns the old card to the tray
    s = placeCard(s, 9, 5)
    expect(s.rows[5].card).toBe(9)
    expect(availableCards(s)).toContain(4)
  })

  it('computes bead value as ten-bars plus the colored bar', () => {
    let s = createBoard()
    s = addTenBar(s, 2)
    expect(rowBeadValue(s.rows[2])).toBe(10)
    s = placeColoredBar(s, 7, 2)
    expect(rowBeadValue(s.rows[2])).toBe(17)
    expect(rowBeadsComplete(s.rows[2])).toBe(true)
    s = removeColoredBar(s, 2)
    expect(rowBeadValue(s.rows[2])).toBe(10)
    expect(rowBeadsComplete(s.rows[2])).toBe(false)
  })

  it('matches a row only when quantity equals symbol with exactly one ten-bar', () => {
    // card 4 + one ten-bar + four-bar → match
    let s = placeCard(createBoard(), 4, 0)
    s = addTenBar(s, 0)
    s = placeColoredBar(s, 4, 0)
    expect(rowMatches(s.rows[0])).toBe(true)

    // wrong colored bar → no match
    const wrongBar = placeColoredBar(s, 3, 0)
    expect(rowMatches(wrongBar.rows[0])).toBe(false)

    // two ten-bars → no match even though the colored bar agrees with the card
    const twoTens = addTenBar(s, 0)
    expect(rowMatches(twoTens.rows[0])).toBe(false)

    // no ten-bar → no match
    const noTen = removeTenBar(s, 0)
    expect(rowMatches(noTen.rows[0])).toBe(false)

    // no card (slat reads 10) → never a match, even with beads laid out
    const noCard = removeCard(s, 0)
    expect(rowMatches(noCard.rows[0])).toBe(false)
  })

  it('keeps one colored bar of each size: placing moves the bar', () => {
    let s = placeColoredBar(createBoard(), 6, 1)
    expect(availableColoredBars(s)).not.toContain(6)
    s = placeColoredBar(s, 6, 8)
    expect(s.rows[1].coloredBar).toBeNull()
    expect(s.rows[8].coloredBar).toBe(6)
    // replacing a row's bar returns the old one to the supply
    s = placeColoredBar(s, 2, 8)
    expect(s.rows[8].coloredBar).toBe(2)
    expect(availableColoredBars(s)).toContain(6)
  })

  it('tracks the ten-bar supply and refuses impossible moves', () => {
    let s = createBoard()
    for (let i = 0; i < ROW_COUNT; i++) s = addTenBar(s, i)
    expect(availableTenBars(s)).toBe(0)
    expect(() => addTenBar(s, 0)).toThrow()
    s = removeTenBar(s, 4)
    expect(availableTenBars(s)).toBe(1)
    expect(s.rows[4].tenBars).toBe(0)
    expect(() => removeTenBar(s, 4)).toThrow()
  })

  it('validates card values and row indexes', () => {
    const s = createBoard()
    expect(() => placeCard(s, 0, 0)).toThrow()
    expect(() => placeCard(s, 10, 0)).toThrow()
    expect(() => placeCard(s, 3, -1)).toThrow()
    expect(() => placeCard(s, 3, 9)).toThrow()
    expect(() => placeColoredBar(s, 12, 0)).toThrow()
  })

  it('accepts the sequence only when rows read 11..19 downward', () => {
    let s = createBoard()
    expect(sequenceComplete(s)).toBe(false)
    for (let i = 0; i < ROW_COUNT; i++) s = placeCard(s, i + 1, i)
    expect(sequenceComplete(s)).toBe(true)
    expect(s.rows.map(rowSymbolValue)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19])
    expect(cardInCorrectRow(s.rows[2], 2)).toBe(true)

    // swapping two cards breaks the sequence
    const swapped = placeCard(placeCard(s, 5, 3), 4, 4)
    expect(sequenceComplete(swapped)).toBe(false)
    expect(cardInCorrectRow(swapped.rows[3], 3)).toBe(false)
  })

  it('marks the whole board matched only when every row is 11..19 with beads', () => {
    const s = buildFullBoard()
    expect(allRowsMatch(s)).toBe(true)
    expect(sequenceComplete(s)).toBe(true)
    expect(availableCards(s)).toEqual([])
    expect(availableColoredBars(s)).toEqual([])
    expect(availableTenBars(s)).toBe(0)
    // 11 + 12 + … + 19 = 135
    expect(s.rows.reduce((sum, r) => sum + rowBeadValue(r), 0)).toBe(135)

    const broken = removeColoredBar(s, 6)
    expect(allRowsMatch(broken)).toBe(false)
  })

  it('exposes the nine unit values used for both cards and colored bars', () => {
    expect(UNIT_VALUES).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})
