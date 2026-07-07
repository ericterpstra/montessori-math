import { describe, it, expect } from 'vitest'
import {
  CHAIN_MIN,
  CHAIN_MAX,
  chainBars,
  chainTotal,
  correctValue,
  createChain,
  createLongChain,
  evaluate,
  evaluateLong,
  isComplete,
  isLongComplete,
  longChain,
  longCorrectValue,
  placeLongTicket,
  placeTicket,
  removeLongTicket,
  removeTicket,
  slotValues,
  visibleBarRange,
} from './model'
import type { LongChainKind } from './model'

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

describe('long chain structure', () => {
  it('longChain(100) is 10 ten-bars labeled 10…100 with one milestone at 100', () => {
    const spec = longChain(100)
    expect(spec.bars).toBe(10)
    expect(spec.labelValues).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    expect(spec.milestones).toEqual([100])
  })

  it('longChain(1000) is 100 ten-bars, 100 labels ending at 1000, milestones 100…1000', () => {
    const spec = longChain(1000)
    expect(spec.bars).toBe(100)
    expect(spec.labelValues).toHaveLength(100)
    expect(spec.labelValues[0]).toBe(10)
    expect(spec.labelValues[99]).toBe(1000)
    expect(spec.milestones).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000])
  })

  it('rejects long-chain kinds other than 100 and 1000', () => {
    expect(() => longChain(50 as LongChainKind)).toThrow()
    expect(() => longCorrectValue(10 as LongChainKind, 0)).toThrow()
  })

  it('long slot k takes (k+1)·10 and out-of-range slots throw', () => {
    expect(longCorrectValue(100, 0)).toBe(10)
    expect(longCorrectValue(100, 9)).toBe(100)
    expect(longCorrectValue(1000, 42)).toBe(430)
    expect(longCorrectValue(1000, 99)).toBe(1000)
    expect(() => longCorrectValue(100, 10)).toThrow()
    expect(() => longCorrectValue(1000, -1)).toThrow()
  })
})

describe('long chain tickets', () => {
  it('createLongChain starts with an ascending tray and all slots empty', () => {
    const s = createLongChain(1000)
    expect(s.tray).toHaveLength(100)
    expect(s.tray).toEqual(longChain(1000).labelValues)
    expect(s.placements).toHaveLength(100)
    expect(s.placements.every((p) => p === null)).toBe(true)
  })

  it('placing and displacing long tickets keeps the tray ascending', () => {
    const s0 = createLongChain(100)
    const s1 = placeLongTicket(s0, 1, 0) // 20 onto slot 0 (wrong)
    expect(s1.placements[0]).toBe(20)
    expect(s1.tray).toEqual([10, 30, 40, 50, 60, 70, 80, 90, 100])
    const s2 = placeLongTicket(s1, 0, 0) // 10 displaces 20; 20 re-sorts to the front
    expect(s2.placements[0]).toBe(10)
    expect(s2.tray[0]).toBe(20)
    const s3 = removeLongTicket(s2, 0)
    expect(s3.tray).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
  })

  it('evaluateLong flags a misplaced ticket and nothing else', () => {
    const s0 = createLongChain(100)
    const s1 = placeLongTicket(s0, 0, 0) // 10 at slot 0 — correct
    const s2 = placeLongTicket(s1, 1, 1) // tray is now [20,30,…]; index 1 = 30 at slot 1 — wrong
    expect(evaluateLong(s2)).toEqual([
      'correct', 'wrong', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty',
    ])
    expect(isLongComplete(s2)).toBe(false)
  })

  it('a fully labeled hundred chain is complete', () => {
    let s = createLongChain(100)
    for (let k = 0; k < 10; k++) s = placeLongTicket(s, 0, k) // tray is ascending: front ticket is always next
    expect(evaluateLong(s).every((r) => r === 'correct')).toBe(true)
    expect(isLongComplete(s)).toBe(true)
  })
})

describe('windowing (visibleBarRange)', () => {
  it('windows the start, the middle, and a small viewport', () => {
    // start: first = ⌊0/130⌋ = 0, last = ⌊900/130⌋ = 6 → [0−5→0, 6+5=11]
    expect(visibleBarRange(0, 900, 130, 100, 5)).toEqual([0, 11])
    // middle: first = ⌊6500/130⌋ = 50, last = ⌊7400/130⌋ = 56 → [45, 61]
    expect(visibleBarRange(6500, 900, 130, 100, 5)).toEqual([45, 61])
    // 375px mobile viewport: first = 0, last = ⌊375/130⌋ = 2 → [0, 7]
    expect(visibleBarRange(0, 375, 130, 100, 5)).toEqual([0, 7])
  })

  it('clamps at both ends', () => {
    // far end: first = ⌊12800/130⌋ = 98, last = ⌊13700/130⌋ = 105 → [93, min(99,110)=99]
    expect(visibleBarRange(12800, 900, 130, 100, 5)).toEqual([93, 99])
    // elastic overscroll: first = ⌊−50/130⌋ = −1 → start clamps to 0
    expect(visibleBarRange(-50, 900, 130, 100, 5)).toEqual([0, 11])
    // short chain, wide window: everything → [0, 9]
    expect(visibleBarRange(0, 900, 130, 10, 5)).toEqual([0, 9])
  })

  it('defaults the buffer to 5 and rejects nonsense geometry', () => {
    expect(visibleBarRange(6500, 900, 130, 100)).toEqual([45, 61])
    expect(() => visibleBarRange(0, 900, 0, 100)).toThrow()
    expect(() => visibleBarRange(0, 900, 130, 0)).toThrow()
  })
})
