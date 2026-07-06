import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { compose, decompose } from '../../lib/placeValue'
import type { PlacePower } from '../../lib/placeValue'
import { def, describeQuantity, MAX_PIECES } from './golden-bead-pictures'
import type { GoldenBeadPicturesData, GoldenBeadPicturesParams } from './golden-bead-pictures'

const SEEDS = [1, 2, 42, 999, 123456, 987654321]
const MAXES = ['99', '999', '9999'] as const

function gen(overrides: Partial<GoldenBeadPicturesParams> = {}, seed = 1): GoldenBeadPicturesData {
  return def.generate({ ...def.defaults, ...overrides }, createRng(seed))
}

/** Independent wording, deliberately not reusing the module's placeInfo path. */
const WORDS: Partial<Record<PlacePower, [string, string]>> = {
  0: ['unit', 'units'],
  1: ['ten', 'tens'],
  2: ['hundred', 'hundreds'],
  3: ['thousand', 'thousands'],
}

function expectedBreakdown(n: number): string {
  return decompose(n)
    .filter((d) => d.digit > 0)
    .map((d) => `${d.digit} ${WORDS[d.power]![d.digit === 1 ? 0 : 1]}`)
    .join(', ')
}

describe('golden-bead-pictures: answer-key correctness', () => {
  it('every problem: places match decompose, value recomposes, pieces and breakdown are right', () => {
    for (const seed of SEEDS) {
      for (const max of MAXES) {
        const data = gen({ max, count: 9 }, seed)
        for (const p of data.problems) {
          expect(p.places).toEqual(decompose(p.value).filter((d) => d.digit > 0))
          expect(compose(p.places)).toBe(p.value)
          expect(p.pieces).toBe(p.places.reduce((s, d) => s + d.digit, 0))
          expect(p.breakdown).toBe(expectedBreakdown(p.value))
        }
      }
    }
  })

  it('breakdown wording uses singular for 1 and plural otherwise', () => {
    expect(describeQuantity(decompose(3251).filter((d) => d.digit > 0))).toBe(
      '3 thousands, 2 hundreds, 5 tens, 1 unit',
    )
    expect(describeQuantity(decompose(300).filter((d) => d.digit > 0))).toBe('3 hundreds')
    expect(describeQuantity(decompose(1010).filter((d) => d.digit > 0))).toBe('1 thousand, 1 ten')
  })
})

describe('golden-bead-pictures: pictured pieces stay printable', () => {
  it(`total pieces per problem is 1..${MAX_PIECES} across many seeds`, () => {
    for (let seed = 1; seed <= 30; seed++) {
      for (const max of MAXES) {
        for (const p of gen({ max, count: 9 }, seed).problems) {
          expect(p.pieces).toBeGreaterThanOrEqual(1)
          expect(p.pieces).toBeLessThanOrEqual(MAX_PIECES)
        }
      }
    }
  })
})

describe('golden-bead-pictures: parameters respected', () => {
  it('max bounds values and always uses the top place', () => {
    const bounds = { '99': [10, 99], '999': [100, 999], '9999': [1000, 9999] } as const
    for (const seed of SEEDS) {
      for (const max of MAXES) {
        const [lo, hi] = bounds[max]
        for (const p of gen({ max, count: 9 }, seed).problems) {
          expect(p.value).toBeGreaterThanOrEqual(lo)
          expect(p.value).toBeLessThanOrEqual(hi)
        }
      }
    }
  })

  it('mode read → all read; draw → all draw; mixed → alternates and includes both', () => {
    for (const seed of SEEDS) {
      expect(gen({ mode: 'read', count: 8 }, seed).problems.every((p) => p.kind === 'read')).toBe(true)
      expect(gen({ mode: 'draw', count: 8 }, seed).problems.every((p) => p.kind === 'draw')).toBe(true)
      const mixed = gen({ mode: 'mixed', count: 6 }, seed).problems
      expect(mixed.map((p) => p.kind)).toEqual(['read', 'draw', 'read', 'draw', 'read', 'draw'])
    }
  })

  it('count honored exactly for the whole 4–9 range', () => {
    for (let count = 4; count <= 9; count++) {
      for (const max of MAXES) {
        expect(gen({ count, max }, 7).problems).toHaveLength(count)
      }
    }
  })

  it('perPage is 4 at 9,999 and 6 otherwise', () => {
    expect(gen({ max: '99' }).perPage).toBe(6)
    expect(gen({ max: '999' }).perPage).toBe(6)
    expect(gen({ max: '9999' }).perPage).toBe(4)
  })

  it('problems on one sheet are distinct', () => {
    for (const seed of SEEDS) {
      const values = gen({ count: 9 }, seed).problems.map((p) => p.value)
      expect(new Set(values).size).toBe(values.length)
    }
  })
})

describe('golden-bead-pictures: seed determinism', () => {
  it('same seed + params twice → identical data', () => {
    for (const seed of SEEDS) {
      for (const max of MAXES) {
        const params = { ...def.defaults, max, mode: 'mixed' as const, count: 7 }
        const a = def.generate(params, createRng(seed))
        const b = def.generate(params, createRng(seed))
        expect(a).toEqual(b)
      }
    }
  })

  it('different seeds → different sheets', () => {
    const a = gen({}, 1)
    const b = gen({}, 2)
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b))
  })
})
