import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def, pageCapacity } from './skip-counting'
import type { SkipCountingData, SkipCountingMode, SkipCountingParams } from './skip-counting'

const SEEDS = [1, 42, 777, 2026, 31415]
const MODES: SkipCountingMode[] = ['chains', 'beyond', 'table']

function gen(overrides: Partial<SkipCountingParams> = {}, seed = 42): SkipCountingData {
  const params: SkipCountingParams = { ...def.defaults, ...overrides }
  return def.generate(params, createRng(seed))
}

describe('skip-counting: answer-key correctness', () => {
  it('every value in every sequence is the exact multiple n × (position + 1), across seeds and modes', () => {
    for (const seed of SEEDS) {
      for (const mode of MODES) {
        for (const n of ['2', '5', '9', 'mixed'] as const) {
          const data = gen({ mode, n, count: 8 }, seed)
          for (const seq of data.sequences) {
            seq.values.forEach((value, i) => {
              expect(value).toBe(seq.n * (i + 1))
            })
          }
        }
      }
    }
  })

  it('the square index (when set) points at n × n', () => {
    for (const seed of SEEDS) {
      for (const mode of ['chains', 'beyond'] as const) {
        const data = gen({ mode, n: 'mixed', count: 9 }, seed)
        for (const seq of data.sequences) {
          expect(seq.squareIndex).not.toBeNull()
          expect(seq.values[seq.squareIndex as number]).toBe(seq.n * seq.n)
        }
      }
    }
  })
})

describe('skip-counting: parameter respect', () => {
  it('fixed n gives every sequence that n', () => {
    for (const n of ['2', '3', '7', '10'] as const) {
      for (const mode of MODES) {
        const data = gen({ n, mode })
        for (const seq of data.sequences) {
          expect(seq.n).toBe(Number(n))
        }
      }
    }
  })

  it('chains mode stops at the square: length n, last value n², square at position n', () => {
    for (const seed of SEEDS) {
      const data = gen({ mode: 'chains', n: 'mixed', count: 9 }, seed)
      for (const seq of data.sequences) {
        expect(seq.values).toHaveLength(seq.n)
        expect(seq.values[seq.values.length - 1]).toBe(seq.n * seq.n)
        expect(seq.squareIndex).toBe(seq.n - 1)
      }
    }
  })

  it('beyond mode continues to 10n: length 10, last value 10 × n, square still marked', () => {
    for (const seed of SEEDS) {
      const data = gen({ mode: 'beyond', n: 'mixed', count: 9 }, seed)
      for (const seq of data.sequences) {
        expect(seq.values).toHaveLength(10)
        expect(seq.values[9]).toBe(seq.n * 10)
        expect(seq.squareIndex).toBe(seq.n - 1)
      }
    }
  })

  it('table mode gives n × 1 … n × 10 with no square emphasis', () => {
    for (const seed of SEEDS) {
      const data = gen({ mode: 'table', n: 'mixed', count: 9 }, seed)
      for (const seq of data.sequences) {
        expect(seq.values).toHaveLength(10)
        expect(seq.values[9]).toBe(seq.n * 10)
        expect(seq.squareIndex).toBeNull()
      }
    }
  })

  it('honors blanks exactly (clamped only when a short chain has fewer non-first tickets)', () => {
    for (const seed of SEEDS) {
      for (const blanks of [2, 3, 4, 5, 6]) {
        for (const mode of MODES) {
          const data = gen({ mode, n: 'mixed', blanks, count: 9 }, seed)
          for (const seq of data.sequences) {
            const expected = Math.min(blanks, seq.values.length - 1)
            expect(seq.blankIndexes).toHaveLength(expected)
          }
        }
      }
    }
  })

  it('with ten tickets available (beyond/table), blanks is honored exactly, unclamped', () => {
    for (const blanks of [2, 4, 6]) {
      for (const mode of ['beyond', 'table'] as const) {
        const data = gen({ mode, n: '3', blanks })
        for (const seq of data.sequences) {
          expect(seq.blankIndexes).toHaveLength(blanks)
        }
      }
    }
  })

  it('blanks are distinct, in range, and never the first ticket', () => {
    for (const seed of SEEDS) {
      for (const mode of MODES) {
        const data = gen({ mode, n: 'mixed', blanks: 6, count: 10 }, seed)
        for (const seq of data.sequences) {
          expect(new Set(seq.blankIndexes).size).toBe(seq.blankIndexes.length)
          for (const i of seq.blankIndexes) {
            expect(i).toBeGreaterThanOrEqual(1)
            expect(i).toBeLessThan(seq.values.length)
          }
        }
      }
    }
  })

  it('mixed mode keeps n values distinct while count allows, all within 2–10', () => {
    for (const seed of SEEDS) {
      for (const count of [4, 6, 9]) {
        const data = gen({ n: 'mixed', mode: 'beyond', count }, seed)
        const ns = data.sequences.map((s) => s.n)
        expect(new Set(ns).size).toBe(count)
        for (const n of ns) {
          expect(n).toBeGreaterThanOrEqual(2)
          expect(n).toBeLessThanOrEqual(10)
        }
      }
      // count 10 exceeds the 9 available values: all 9 appear, one repeats.
      const data = gen({ n: 'mixed', mode: 'beyond', count: 10 }, seed)
      expect(new Set(data.sequences.map((s) => s.n)).size).toBe(9)
    }
  })
})

describe('skip-counting: count honored', () => {
  it('generates exactly count sequences for every allowed count', () => {
    for (const count of [4, 5, 6, 7, 8, 9, 10]) {
      for (const mode of MODES) {
        expect(gen({ count, mode }).sequences).toHaveLength(count)
        expect(gen({ count, mode, n: 'mixed' }).sequences).toHaveLength(count)
      }
    }
  })
})

describe('skip-counting: page capacity', () => {
  it('table pages hold nine rows regardless of n', () => {
    expect(pageCapacity({ mode: 'table', n: '2' })).toBe(9)
    expect(pageCapacity({ mode: 'table', n: '10' })).toBe(9)
    expect(pageCapacity({ mode: 'table', n: 'mixed' })).toBe(9)
  })

  it('ten-ticket chain pages (beyond mode, or chains of 10s) hold six rows', () => {
    expect(pageCapacity({ mode: 'beyond', n: '2' })).toBe(6)
    expect(pageCapacity({ mode: 'beyond', n: '10' })).toBe(6)
    expect(pageCapacity({ mode: 'beyond', n: 'mixed' })).toBe(6)
    expect(pageCapacity({ mode: 'chains', n: '10' })).toBe(6)
  })

  it('shorter chain pages hold eight rows', () => {
    expect(pageCapacity({ mode: 'chains', n: '5' })).toBe(8)
    expect(pageCapacity({ mode: 'chains', n: '9' })).toBe(8)
    expect(pageCapacity({ mode: 'chains', n: 'mixed' })).toBe(8)
  })
})

describe('skip-counting: seed determinism', () => {
  it('same seed + params produce identical data', () => {
    for (const seed of SEEDS) {
      for (const mode of MODES) {
        const params: SkipCountingParams = { ...def.defaults, mode, n: 'mixed', count: 8 }
        const a = def.generate(params, createRng(seed))
        const b = def.generate(params, createRng(seed))
        expect(a).toEqual(b)
      }
    }
  })

  it('different seeds produce different data', () => {
    const a = gen({}, 42)
    const b = gen({}, 43)
    expect(a).not.toEqual(b)
    const c = gen({ n: 'mixed', mode: 'table' }, 1)
    const d = gen({ n: 'mixed', mode: 'table' }, 2)
    expect(c).not.toEqual(d)
  })
})

describe('skip-counting: presets', () => {
  it('has the two lesson presets with unique ids and valid params', () => {
    const ids = def.presets.map((p) => p.id)
    expect(ids).toContain('fives-chain')
    expect(ids).toContain('all-the-tables')
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('fives-chain: six five-chains to the square, three blanks each', () => {
    const preset = def.presets.find((p) => p.id === 'fives-chain')!
    const data = def.generate(preset.params as SkipCountingParams, createRng(7))
    expect(data.sequences).toHaveLength(6)
    for (const seq of data.sequences) {
      expect(seq.n).toBe(5)
      expect(seq.values).toEqual([5, 10, 15, 20, 25])
      expect(seq.blankIndexes).toHaveLength(3)
      expect(seq.squareIndex).toBe(4)
    }
  })

  it('all-the-tables: nine distinct multiples tables covering 2 through 10', () => {
    const preset = def.presets.find((p) => p.id === 'all-the-tables')!
    const data = def.generate(preset.params as SkipCountingParams, createRng(7))
    expect(data.sequences).toHaveLength(9)
    const ns = data.sequences.map((s) => s.n).sort((a, b) => a - b)
    expect(ns).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10])
    for (const seq of data.sequences) {
      expect(seq.values).toHaveLength(10)
      expect(seq.blankIndexes).toHaveLength(4)
      expect(seq.squareIndex).toBeNull()
    }
  })
})
