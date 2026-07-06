import { describe, it, expect } from 'vitest'
import {
  CARD_VALUES,
  SLOT_COUNT,
  TOTAL_COUNTERS,
  addCounter,
  canAddCounter,
  checkAll,
  checkSlot,
  classifyOddEven,
  counterPositions,
  counterRows,
  countersPlaced,
  createState,
  isLayoutCorrect,
  newGame,
  pickUpCard,
  placeSelected,
  removeCounter,
  supplyRemaining,
  toggleSelect,
} from './model'
import type { CardsAndCountersState } from './model'

/** Place cards left to right per `order`, giving each the counts in `counts`. */
function build(order: readonly number[], counts: readonly number[]): CardsAndCountersState {
  let s = createState(order)
  for (let i = 0; i < order.length; i++) {
    s = placeSelected(toggleSelect(s, order[i]), i)
    for (let k = 0; k < counts[i]; k++) s = addCounter(s, i)
  }
  return s
}

const IN_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

describe('supply', () => {
  it('holds exactly 55 counters — the sum of the cards 1 through 10', () => {
    expect(TOTAL_COUNTERS).toBe(55)
    expect(CARD_VALUES.reduce((a, b) => a + b, 0)).toBe(TOTAL_COUNTERS)
    expect(supplyRemaining(newGame(7))).toBe(TOTAL_COUNTERS)
  })

  it('never goes negative: adding with an empty bowl is refused', () => {
    let s = build(IN_ORDER, IN_ORDER) // perfect layout consumes all 55
    expect(supplyRemaining(s)).toBe(0)
    expect(canAddCounter(s, 0)).toBe(false)
    expect(addCounter(s, 0)).toBe(s) // same reference: no-op
    s = removeCounter(s, 9)
    expect(supplyRemaining(s)).toBe(1)
    expect(canAddCounter(s, 0)).toBe(true)
  })

  it('runs out early iff any card was given excess counters', () => {
    // Correct counts under 1–9 except ONE extra under card 1 (46 used)…
    const counts = [2, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    let s = build(IN_ORDER, counts)
    expect(supplyRemaining(s)).toBe(9)
    // …so card 10 can only receive 9 of its 10 counters.
    for (let k = 0; k < 9; k++) {
      expect(canAddCounter(s, 9)).toBe(true)
      s = addCounter(s, 9)
    }
    expect(supplyRemaining(s)).toBe(0)
    expect(canAddCounter(s, 9)).toBe(false)
    expect(checkSlot(s, 9).countCorrect).toBe(false)
    expect(checkSlot(s, 0).countCorrect).toBe(false) // the excess card is also wrong
    expect(isLayoutCorrect(s)).toBe(false)

    // With no excess anywhere, the bowl is never empty until the last counter.
    const perfect = build(IN_ORDER, IN_ORDER)
    expect(supplyRemaining(perfect)).toBe(0)
    expect(countersPlaced(perfect)).toBe(TOTAL_COUNTERS)
  })
})

describe('cards', () => {
  it('newGame shuffles the tray deterministically by seed', () => {
    const a = newGame(42)
    const b = newGame(42)
    expect(a.tray).toEqual(b.tray)
    expect([...a.tray].sort((x, y) => x - y)).toEqual(IN_ORDER)
    expect(newGame(1).tray).not.toEqual(newGame(2).tray)
    expect(a.slots).toEqual(new Array(SLOT_COUNT).fill(null))
  })

  it('select-then-place moves a card from tray to slot; picking it up returns it with its counters', () => {
    let s = createState(IN_ORDER)
    s = toggleSelect(s, 5)
    expect(s.selected).toBe(5)
    s = placeSelected(s, 2)
    expect(s.slots[2]).toBe(5)
    expect(s.tray).not.toContain(5)
    expect(s.selected).toBeNull()
    s = addCounter(addCounter(addCounter(s, 2), 2), 2)
    expect(s.counters[2]).toBe(3)
    expect(supplyRemaining(s)).toBe(52)
    s = pickUpCard(s, 2)
    expect(s.slots[2]).toBeNull()
    expect(s.counters[2]).toBe(0)
    expect(s.tray).toContain(5)
    expect(supplyRemaining(s)).toBe(55) // counters go back in the bowl
  })

  it('refuses invalid moves without changing state', () => {
    const s0 = createState(IN_ORDER)
    expect(placeSelected(s0, 0)).toBe(s0) // nothing selected
    expect(toggleSelect(s0, 11)).toBe(s0) // no such card
    expect(addCounter(s0, 0)).toBe(s0) // no card in the slot yet
    expect(removeCounter(s0, 0)).toBe(s0) // nothing to remove
    const s1 = placeSelected(toggleSelect(s0, 3), 0)
    const s2 = placeSelected(toggleSelect(s1, 4), 0)
    expect(s2.slots[0]).toBe(3) // occupied slot keeps its card
    expect(s2.tray).toContain(4)
    expect(() => createState([1, 2, 3])).toThrow()
    expect(() => createState([1, 1, 3, 4, 5, 6, 7, 8, 9, 10])).toThrow()
  })
})

describe('control of error and Check', () => {
  it('layout is correct iff every card n lies in order with exactly n counters', () => {
    const perfect = build(IN_ORDER, IN_ORDER)
    expect(isLayoutCorrect(perfect)).toBe(true)
    expect(checkAll(perfect).every((c) => c.cardPlaced && c.cardCorrect && c.countCorrect)).toBe(true)

    // One counter short under 4 → that slot alone fails the count check.
    const short = removeCounter(perfect, 3)
    expect(isLayoutCorrect(short)).toBe(false)
    expect(checkSlot(short, 3)).toEqual({ cardPlaced: true, cardCorrect: true, countCorrect: false })
    expect(checkSlot(short, 4)).toEqual({ cardPlaced: true, cardCorrect: true, countCorrect: true })
  })

  it('marks misordered cards even when their counter counts match the cards', () => {
    // Cards 2 and 3 swapped, counters matching each card as it lies.
    const order = [1, 3, 2, 4, 5, 6, 7, 8, 9, 10]
    const s = build(order, order)
    expect(supplyRemaining(s)).toBe(0)
    expect(isLayoutCorrect(s)).toBe(false)
    const checks = checkAll(s)
    expect(checks[1]).toEqual({ cardPlaced: true, cardCorrect: false, countCorrect: true })
    expect(checks[2]).toEqual({ cardPlaced: true, cardCorrect: false, countCorrect: true })
    expect(checks[0]).toEqual({ cardPlaced: true, cardCorrect: true, countCorrect: true })
    expect(checks[9].cardCorrect).toBe(true)
  })
})

describe('odd and even', () => {
  it('classification matches parity for 1–10', () => {
    for (const n of CARD_VALUES) {
      expect(classifyOddEven(n)).toBe(n % 2 === 0 ? 'even' : 'odd')
    }
    expect(classifyOddEven(1)).toBe('odd')
    expect(classifyOddEven(10)).toBe('even')
  })

  it('the counter pattern stacks pairs: rows = ceil(n/2), lone counter centered only for odd n', () => {
    for (const n of CARD_VALUES) {
      const positions = counterPositions(n)
      expect(counterRows(n)).toBe(Math.ceil(n / 2))
      expect(positions.length).toBe(n)
      expect(Math.max(...positions.map((p) => p.row))).toBe(counterRows(n) - 1)
      const centered = positions.filter((p) => p.centered)
      if (n % 2 === 1) {
        expect(centered).toEqual([{ row: (n - 1) / 2, col: 0, centered: true }])
      } else {
        expect(centered).toEqual([])
        // every row is a full left/right pair
        for (let r = 0; r < counterRows(n); r++) {
          expect(positions.filter((p) => p.row === r).map((p) => p.col)).toEqual([0, 1])
        }
      }
    }
    expect(counterRows(0)).toBe(0)
    expect(counterPositions(0)).toEqual([])
  })
})
