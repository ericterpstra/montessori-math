import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def } from './fractions'
import type { FractionMode, FractionProblem, FractionsParams } from './fractions'

const SEEDS = [1, 42, 777, 2026, 31337]
const ALL_MODES: FractionMode[] = ['identify', 'shade', 'add', 'subtract', 'equivalent', 'mixed']

function gen(overrides: Partial<FractionsParams> = {}, seed = 1) {
  const params = { ...def.defaults, ...overrides } as FractionsParams
  return def.generate(params, createRng(seed))
}

/** Every denominator that appears in a problem. */
function denominatorsOf(p: FractionProblem): number[] {
  switch (p.kind) {
    case 'identify':
    case 'shade':
      return [p.den]
    case 'add':
    case 'subtract':
      return [p.den]
    case 'equivalent':
      return [p.baseDen, p.bigDen]
  }
}

describe('fractions generator', () => {
  describe('answer-key correctness (recomputed independently)', () => {
    for (const mode of ALL_MODES) {
      it(`mode=${mode}: every stored answer matches an independent recomputation`, () => {
        for (const seed of SEEDS) {
          const data = gen({ mode, maxDenominator: 10, count: 12 }, seed)
          for (const p of data.problems) {
            switch (p.kind) {
              case 'identify':
              case 'shade': {
                // The picture shades `num` of `den` sectors; the fraction is num/den.
                expect(Number.isInteger(p.num)).toBe(true)
                expect(Number.isInteger(p.den)).toBe(true)
                expect(p.num).toBeGreaterThanOrEqual(1)
                expect(p.num).toBeLessThan(p.den)
                break
              }
              case 'add': {
                expect(p.sumNum).toBe(p.a + p.b)
                expect(p.whole).toBe(Math.floor((p.a + p.b) / p.den))
                expect(p.rem).toBe((p.a + p.b) % p.den)
                // Mixed-number form recomposes exactly: whole·den + rem = a + b.
                expect(p.whole * p.den + p.rem).toBe(p.a + p.b)
                break
              }
              case 'subtract': {
                expect(p.diff).toBe(p.a - p.b)
                expect(p.diff).toBeGreaterThanOrEqual(1)
                break
              }
              case 'equivalent': {
                // Verify by cross-multiplication.
                expect(p.baseNum * p.bigDen).toBe(p.answerNum * p.baseDen)
                expect(p.bigDen).toBe(p.baseDen * p.k)
                expect(p.answerNum).toBe(p.baseNum * p.k)
                expect(p.bigDen).not.toBe(p.baseDen)
                break
              }
            }
          }
        }
      })
    }
  })

  describe('parameter respect', () => {
    it('mode is honored: non-mixed modes produce only that kind', () => {
      for (const mode of ALL_MODES.filter((m) => m !== 'mixed')) {
        for (const seed of SEEDS) {
          const data = gen({ mode, count: 10 }, seed)
          for (const p of data.problems) {
            expect(p.kind).toBe(mode)
          }
        }
      }
    })

    it('mixed mode draws from all five kinds (valid kinds only, with real variety)', () => {
      const seen = new Set<string>()
      for (const seed of SEEDS) {
        const data = gen({ mode: 'mixed', count: 12 }, seed)
        for (const p of data.problems) {
          expect(['identify', 'shade', 'add', 'subtract', 'equivalent']).toContain(p.kind)
          seen.add(p.kind)
        }
      }
      expect(seen.size).toBeGreaterThanOrEqual(3)
    })

    it('maxDenominator bounds every denominator (all modes, 4 through 10)', () => {
      for (let maxDen = 4; maxDen <= 10; maxDen++) {
        for (const mode of ALL_MODES) {
          const data = gen({ mode, maxDenominator: maxDen, count: 12 }, 99 + maxDen)
          for (const p of data.problems) {
            for (const den of denominatorsOf(p)) {
              expect(den).toBeGreaterThanOrEqual(2)
              expect(den).toBeLessThanOrEqual(maxDen)
            }
          }
        }
      }
    })

    it('addends are proper fractions of the same family', () => {
      for (const seed of SEEDS) {
        const data = gen({ mode: 'add', maxDenominator: 8, count: 12 }, seed)
        for (const p of data.problems) {
          if (p.kind !== 'add') throw new Error('expected add problem')
          expect(p.a).toBeGreaterThanOrEqual(1)
          expect(p.a).toBeLessThan(p.den)
          expect(p.b).toBeGreaterThanOrEqual(1)
          expect(p.b).toBeLessThan(p.den)
        }
      }
    })

    it('subtraction stays positive and within one whole: 1 <= b < a <= den', () => {
      for (const seed of SEEDS) {
        const data = gen({ mode: 'subtract', maxDenominator: 10, count: 12 }, seed)
        for (const p of data.problems) {
          if (p.kind !== 'subtract') throw new Error('expected subtract problem')
          expect(p.b).toBeGreaterThanOrEqual(1)
          expect(p.b).toBeLessThan(p.a)
          expect(p.a).toBeLessThanOrEqual(p.den)
        }
      }
    })

    it('equivalent pairs use a whole-number multiplier k >= 2 and a proper base fraction', () => {
      for (const seed of SEEDS) {
        const data = gen({ mode: 'equivalent', maxDenominator: 10, count: 12 }, seed)
        for (const p of data.problems) {
          if (p.kind !== 'equivalent') throw new Error('expected equivalent problem')
          expect(Number.isInteger(p.k)).toBe(true)
          expect(p.k).toBeGreaterThanOrEqual(2)
          expect(p.baseNum).toBeGreaterThanOrEqual(1)
          expect(p.baseNum).toBeLessThan(p.baseDen)
        }
      }
    })

    it('equivalent mode rejects a maxDenominator too small to form any pair', () => {
      expect(() => gen({ mode: 'equivalent', maxDenominator: 3 })).toThrow()
    })
  })

  describe('seed determinism', () => {
    it('same seed + params => identical data', () => {
      for (const mode of ALL_MODES) {
        for (const seed of SEEDS) {
          const a = gen({ mode, maxDenominator: 9, count: 10 }, seed)
          const b = gen({ mode, maxDenominator: 9, count: 10 }, seed)
          expect(a).toEqual(b)
        }
      }
    })

    it('different seeds => different data', () => {
      const a = gen({ mode: 'mixed', maxDenominator: 10, count: 12 }, 1)
      const b = gen({ mode: 'mixed', maxDenominator: 10, count: 12 }, 2)
      expect(a).not.toEqual(b)
    })
  })

  describe('count honored', () => {
    it('produces exactly `count` problems for every allowed count and mode', () => {
      for (const mode of ALL_MODES) {
        for (let count = 6; count <= 12; count++) {
          const data = gen({ mode, count }, 7)
          expect(data.problems).toHaveLength(count)
        }
      }
    })
  })
})
