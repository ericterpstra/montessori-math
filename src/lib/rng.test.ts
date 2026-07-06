import { describe, it, expect } from 'vitest'
import { createRng } from './rng'

describe('createRng (mulberry32)', () => {
  it('is deterministic: same seed, same sequence', () => {
    const a = createRng(42)
    const b = createRng(42)
    for (let i = 0; i < 20; i++) {
      expect(a.next()).toBe(b.next())
    }
  })

  it('different seeds diverge', () => {
    const a = createRng(1)
    const b = createRng(2)
    const seqA = Array.from({ length: 5 }, () => a.next())
    const seqB = Array.from({ length: 5 }, () => b.next())
    expect(seqA).not.toEqual(seqB)
  })

  it('next() stays in [0, 1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 1000; i++) {
      const x = rng.next()
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })

  it('int() is inclusive at both bounds and never outside', () => {
    const rng = createRng(99)
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i++) {
      const v = rng.int(1, 6)
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(6)
      seen.add(v)
    }
    expect(seen.has(1)).toBe(true)
    expect(seen.has(6)).toBe(true)
    expect(rng.int(5, 5)).toBe(5)
    expect(() => rng.int(3, 2)).toThrow()
  })

  it('shuffle() permutes without adding or dropping elements', () => {
    const rng = createRng(123)
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const shuffled = rng.shuffle(original)
    expect(shuffled).not.toBe(original)
    expect([...shuffled].sort((x, y) => x - y)).toEqual(original)
  })

  it('shuffle() is deterministic under a seed', () => {
    const a = createRng(55).shuffle([1, 2, 3, 4, 5, 6])
    const b = createRng(55).shuffle([1, 2, 3, 4, 5, 6])
    expect(a).toEqual(b)
  })

  it('pick() draws from the array and rejects empty input', () => {
    const rng = createRng(9)
    const arr = ['a', 'b', 'c'] as const
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(rng.pick(arr))
    }
    expect(() => rng.pick([])).toThrow()
  })

  it('bool() respects probability extremes', () => {
    const rng = createRng(31)
    for (let i = 0; i < 100; i++) {
      expect(rng.bool(0)).toBe(false)
      expect(rng.bool(1)).toBe(true)
    }
  })
})
