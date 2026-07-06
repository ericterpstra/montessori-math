import { describe, it, expect } from 'vitest'
import {
  CHAIN_MIN,
  CHAIN_MAX,
  chainBars,
  chainTotal,
  correctValue,
  createChain,
  evaluate,
  isComplete,
  placeTicket,
  removeTicket,
  slotValues,
} from './model'

describe('chain structure', () => {
  it('chain n has exactly n bars of n beads, n² beads in all', () => {
    for (let n = CHAIN_MIN; n <= CHAIN_MAX; n++) {
      const bars = chainBars(n)
      expect(bars).toHaveLength(n)
      expect(bars.every((b) => b === n)).toBe(true)
      expect(bars.reduce((a, b) => a + b, 0)).toBe(n * n)
      expect(chainTotal(n)).toBe(n * n)
    }
  })

  it('the 10-chain totals 100', () => {
    expect(chainTotal(10)).toBe(100)
    expect(chainBars(10)).toEqual([10, 10, 10, 10, 10, 10, 10, 10, 10, 10])
  })

  it("slot k's correct value is (k+1)·n and the last slot is the square", () => {
    expect(slotValues(5)).toEqual([5, 10, 15, 20, 25])
    expect(slotValues(2)).toEqual([2, 4])
    for (let n = CHAIN_MIN; n <= CHAIN_MAX; n++) {
      for (let k = 0; k < n; k++) {
        expect(correctValue(n, k)).toBe((k + 1) * n)
      }
      expect(correctValue(n, n - 1)).toBe(n * n)
    }
  })

  it('rejects chain sizes outside 2–10 and bad slot indexes', () => {
    expect(() => chainBars(1)).toThrow()
    expect(() => chainBars(11)).toThrow()
    expect(() => createChain(3.5, 1)).toThrow()
    expect(() => correctValue(5, 5)).toThrow()
    expect(() => correctValue(5, -1)).toThrow()
  })
})

describe('createChain / tray shuffle', () => {
  it('is seed-deterministic: same seed reproduces the same tray order', () => {
    const a = createChain(7, 12345)
    const b = createChain(7, 12345)
    expect(a.tray).toEqual(b.tray)
    expect(a.placements).toEqual([null, null, null, null, null, null, null])
  })

  it('different seeds shuffle the 10-chain tray differently', () => {
    const a = createChain(10, 1)
    const b = createChain(10, 2)
    expect(a.tray).not.toEqual(b.tray)
  })

  it('the shuffled tray holds exactly the ticket values n, 2n, …, n²', () => {
    for (let n = CHAIN_MIN; n <= CHAIN_MAX; n++) {
      const { tray } = createChain(n, 99)
      expect([...tray].sort((x, y) => x - y)).toEqual(slotValues(n))
    }
  })
})

describe('placing and removing tickets', () => {
  it('placing a ticket moves it from tray to slot', () => {
    const s0 = createChain(4, 7)
    const value = s0.tray[2]
    const s1 = placeTicket(s0, 2, 0)
    expect(s1.placements[0]).toBe(value)
    expect(s1.tray).toHaveLength(3)
    expect(s1.tray).not.toContain(value)
    // original state untouched
    expect(s0.tray).toHaveLength(4)
    expect(s0.placements[0]).toBeNull()
  })

  it('placing onto an occupied slot returns the displaced ticket to the tray', () => {
    const s0 = createChain(3, 5)
    const first = s0.tray[0]
    const s1 = placeTicket(s0, 0, 1)
    const next = s1.tray[0]
    const s2 = placeTicket(s1, 0, 1)
    expect(s2.placements[1]).toBe(next)
    expect(s2.tray).toContain(first)
    expect(s2.tray).toHaveLength(2)
  })

  it('removing a ticket returns it to the tray; removing from an empty slot is a no-op', () => {
    const s0 = createChain(3, 5)
    const value = s0.tray[1]
    const s1 = placeTicket(s0, 1, 2)
    const s2 = removeTicket(s1, 2)
    expect(s2.placements[2]).toBeNull()
    expect(s2.tray).toContain(value)
    expect(s2.tray).toHaveLength(3)
    expect(removeTicket(s2, 0)).toBe(s2)
  })

  it('rejects out-of-range tray and slot indexes', () => {
    const s = createChain(3, 5)
    expect(() => placeTicket(s, 3, 0)).toThrow()
    expect(() => placeTicket(s, 0, 3)).toThrow()
    expect(() => removeTicket(s, 9)).toThrow()
  })
})

describe('evaluation (control of error)', () => {
  /** Build a 5-chain with chosen values placed directly. */
  function withPlacements(placements: (number | null)[]) {
    const base = createChain(5, 1)
    const placed = placements.filter((v): v is number => v !== null)
    return {
      ...base,
      tray: slotValues(5).filter((v) => !placed.includes(v)),
      placements,
    }
  }

  it('flags every misplacement and nothing else', () => {
    // slot 0 correct (5), slot 1 wrong (25 instead of 10), slot 2 empty,
    // slot 3 correct (20), slot 4 wrong (10 instead of 25)
    const s = withPlacements([5, 25, null, 20, 10])
    expect(evaluate(s)).toEqual(['correct', 'wrong', 'empty', 'correct', 'wrong'])
  })

  it('a fully correct chain evaluates all-correct and is complete', () => {
    const s = withPlacements([5, 10, 15, 20, 25])
    expect(evaluate(s)).toEqual(['correct', 'correct', 'correct', 'correct', 'correct'])
    expect(isComplete(s)).toBe(true)
  })

  it('is not complete while any slot is empty or wrong', () => {
    expect(isComplete(withPlacements([5, 10, 15, 20, null]))).toBe(false)
    expect(isComplete(withPlacements([10, 5, 15, 20, 25]))).toBe(false)
    expect(isComplete(createChain(5, 1))).toBe(false)
  })
})
