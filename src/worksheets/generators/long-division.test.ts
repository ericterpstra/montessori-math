import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def } from './long-division'
import type { LongDivisionParams } from './long-division'

const SEEDS = [1, 2, 3, 42, 99, 1234, 987654] as const

function gen(overrides: Partial<LongDivisionParams>, seed: number) {
  return def.generate({ ...def.defaults, ...overrides } as LongDivisionParams, createRng(seed))
}

/** Every dividendDigits × divisorDigits × remainders combination. */
const COMBOS: Partial<LongDivisionParams>[] = []
for (const dividendDigits of [2, 3, 4]) {
  for (const divisorDigits of [1, 2]) {
    for (const remainders of [true, false]) {
      COMBOS.push({ dividendDigits, divisorDigits, remainders, count: 10 })
    }
  }
}

describe('long-division generate', () => {
  it('answer key is correct for every problem across seeds and param combos', () => {
    for (const combo of COMBOS) {
      for (const seed of SEEDS) {
        for (const p of gen(combo, seed).problems) {
          expect(Number.isInteger(p.dividend)).toBe(true)
          expect(Number.isInteger(p.divisor)).toBe(true)
          expect(Number.isInteger(p.quotient)).toBe(true)
          expect(Number.isInteger(p.remainder)).toBe(true)
          // The division identity, recomputed independently.
          expect(p.quotient * p.divisor + p.remainder).toBe(p.dividend)
          expect(p.quotient).toBe(Math.floor(p.dividend / p.divisor))
          expect(p.remainder).toBeGreaterThanOrEqual(0)
          expect(p.remainder).toBeLessThan(p.divisor)
          // Quotient is always at least 1 digit (dividend >= divisor).
          expect(p.quotient).toBeGreaterThanOrEqual(1)
          expect(p.dividend).toBeGreaterThanOrEqual(p.divisor)
        }
      }
    }
  })

  it('honors dividendDigits and divisorDigits exactly', () => {
    for (const combo of COMBOS) {
      for (const seed of SEEDS) {
        for (const p of gen(combo, seed).problems) {
          expect(String(p.dividend)).toHaveLength(combo.dividendDigits as number)
          expect(String(p.divisor)).toHaveLength(combo.divisorDigits as number)
        }
      }
    }
  })

  it('remainders=false means every problem divides exactly', () => {
    for (const divisorDigits of [1, 2]) {
      for (const dividendDigits of [2, 3, 4]) {
        for (const seed of SEEDS) {
          for (const p of gen({ remainders: false, divisorDigits, dividendDigits, count: 10 }, seed).problems) {
            expect(p.remainder).toBe(0)
            expect(p.dividend % p.divisor).toBe(0)
          }
        }
      }
    }
  })

  it('remainders=true actually produces remainders (across seeds)', () => {
    const remainders = SEEDS.flatMap(
      (seed) => gen({ remainders: true, dividendDigits: 4, divisorDigits: 1, count: 10 }, seed).problems,
    ).map((p) => p.remainder)
    expect(remainders.some((r) => r > 0)).toBe(true)
  })

  it('one-digit divisors are 2–9, never the trivial 1', () => {
    for (const dividendDigits of [2, 3, 4]) {
      for (const seed of SEEDS) {
        for (const p of gen({ divisorDigits: 1, dividendDigits, count: 10 }, seed).problems) {
          expect(p.divisor).toBeGreaterThanOrEqual(2)
          expect(p.divisor).toBeLessThanOrEqual(9)
        }
      }
    }
  })

  it('two-digit divisors are 11–99 and mix round tens with non-multiples of ten', () => {
    const divisors = SEEDS.flatMap(
      (seed) => gen({ divisorDigits: 2, dividendDigits: 4, count: 10 }, seed).problems,
    ).map((p) => p.divisor)
    for (const d of divisors) {
      expect(d).toBeGreaterThanOrEqual(11)
      expect(d).toBeLessThanOrEqual(99)
    }
    // Half the time a round ten, half the time not: both kinds must appear.
    expect(divisors.some((d) => d % 10 === 0)).toBe(true)
    expect(divisors.some((d) => d % 10 !== 0)).toBe(true)
  })

  it('honors count exactly', () => {
    for (let count = 4; count <= 10; count++) {
      expect(gen({ count }, 7).problems).toHaveLength(count)
    }
  })

  it('is deterministic: same seed + params => identical data', () => {
    for (const combo of COMBOS) {
      for (const seed of SEEDS) {
        expect(gen(combo, seed)).toEqual(gen(combo, seed))
      }
    }
  })

  it('different seeds produce different sheets', () => {
    const a = JSON.stringify(gen({}, 1))
    const b = JSON.stringify(gen({}, 2))
    expect(a).not.toBe(b)
  })
})

describe('long-division def shape', () => {
  it('has the required slug, presets, and defaults within schema bounds', () => {
    expect(def.slug).toBe('long-division')
    expect(def.strand).toBe('abstraction')
    expect(def.presets.length).toBeGreaterThanOrEqual(2)
    expect(def.presets.map((p) => p.id)).toEqual(['first-long-division', 'two-digit-divisors'])
    for (const field of def.schema) {
      if (field.kind === 'number') {
        const v = def.defaults[field.key] as number
        expect(v).toBeGreaterThanOrEqual(field.min)
        expect(v).toBeLessThanOrEqual(field.max)
      }
    }
  })

  it('preset params generate valid sheets (first-long-division is exact, recording)', () => {
    const preset = def.presets.find((p) => p.id === 'first-long-division')!
    const params = { ...def.defaults, ...preset.params }
    expect(params.format).toBe('recording')
    for (const seed of SEEDS) {
      for (const p of def.generate(params, createRng(seed)).problems) {
        expect(p.remainder).toBe(0)
        expect(String(p.dividend)).toHaveLength(4)
        expect(p.divisor).toBeGreaterThanOrEqual(2)
        expect(p.divisor).toBeLessThanOrEqual(9)
      }
    }
  })
})
