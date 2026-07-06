import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def, generate } from './place-value'
import type { PlaceValueMax, PlaceValueMode, PlaceValueParams } from './place-value'

const SEEDS = [1, 42, 777, 2026, 987654]

function params(overrides: Partial<PlaceValueParams> = {}): PlaceValueParams {
  return { mode: 'mixed', max: '9999', count: 12, ...overrides }
}

/** Recompute the expansion straight from the decimal string, independent of src/lib/placeValue. */
function expectedParts(value: number): number[] {
  const s = String(value)
  const parts: number[] = []
  for (let i = 0; i < s.length; i++) {
    const d = Number(s[i])
    if (d > 0) parts.push(d * 10 ** (s.length - 1 - i))
  }
  return parts
}

describe('answer-key correctness', () => {
  const modes: PlaceValueMode[] = ['expand', 'compose', 'digits', 'mixed']
  for (const mode of modes) {
    it(`recomputes every answer independently (mode=${mode}, several seeds)`, () => {
      for (const seed of SEEDS) {
        const { problems } = generate(params({ mode, count: 20 }), createRng(seed))
        for (const p of problems) {
          // The expansion parts exactly reconstruct the number, largest first.
          expect(p.parts).toEqual(expectedParts(p.value))
          expect(p.parts.reduce((a, b) => a + b, 0)).toBe(p.value)

          if (p.kind === 'digits') {
            const s = String(p.value)
            const digit = Number(s[s.length - 1 - p.underlinePower])
            expect(digit).toBeGreaterThan(0) // never underlines a zero
            expect(p.underlineDigit).toBe(digit)
            expect(p.answer).toBe(digit * 10 ** p.underlinePower) // digit × place value
          } else {
            expect(p.answer).toBe(p.value)
          }
        }
      }
    })
  }

  it('never emits a zero place as a part, and every problem has ≥ 2 parts', () => {
    let sawValueContainingZero = false
    for (const seed of SEEDS) {
      for (const mode of ['expand', 'compose', 'digits', 'mixed'] as const) {
        const { problems } = generate(params({ mode, count: 20 }), createRng(seed))
        for (const p of problems) {
          if (String(p.value).includes('0')) sawValueContainingZero = true
          for (const part of p.parts) {
            expect(part).toBeGreaterThan(0)
            // Each part is a single non-zero digit times a power of ten.
            expect(String(part)).toMatch(/^[1-9]0*$/)
          }
          expect(p.parts.length).toBeGreaterThanOrEqual(2)
        }
      }
    }
    // Make sure the zero-skipping assertions actually exercised numbers with zeros.
    expect(sawValueContainingZero).toBe(true)
  })
})

describe('parameter respect', () => {
  it('keeps every number within max, for each range option', () => {
    const maxes: PlaceValueMax[] = ['99', '999', '9999']
    for (const max of maxes) {
      for (const seed of SEEDS) {
        const { problems } = generate(params({ max, count: 20 }), createRng(seed))
        for (const p of problems) {
          expect(p.value).toBeLessThanOrEqual(Number(max))
          expect(p.value).toBeGreaterThanOrEqual(10)
        }
      }
    }
  })

  it('a fixed mode produces only that problem kind', () => {
    for (const mode of ['expand', 'compose', 'digits'] as const) {
      for (const seed of SEEDS) {
        const { problems } = generate(params({ mode }), createRng(seed))
        expect(problems).toHaveLength(12)
        for (const p of problems) expect(p.kind).toBe(mode)
      }
    }
  })

  it('mixed mode produces all three kinds (across seeds)', () => {
    const kinds = new Set<string>()
    for (const seed of SEEDS) {
      for (const p of generate(params({ mode: 'mixed', count: 20 }), createRng(seed)).problems) {
        kinds.add(p.kind)
      }
    }
    expect(kinds).toEqual(new Set(['expand', 'compose', 'digits']))
  })

  it('honors count exactly', () => {
    for (const count of [8, 12, 15, 20]) {
      for (const seed of SEEDS) {
        expect(generate(params({ count }), createRng(seed)).problems).toHaveLength(count)
      }
    }
  })
})

describe('seed determinism', () => {
  it('same seed + params → identical data', () => {
    for (const seed of SEEDS) {
      const a = generate(params(), createRng(seed))
      const b = generate(params(), createRng(seed))
      expect(b).toEqual(a)
      expect(JSON.stringify(b)).toBe(JSON.stringify(a))
    }
  })

  it('different seeds → different sheets', () => {
    const a = generate(params(), createRng(1))
    const b = generate(params(), createRng(2))
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b))
  })
})

describe('def contract', () => {
  it('has the right slug, strand, and defaults that satisfy its own schema', () => {
    expect(def.slug).toBe('place-value')
    expect(def.strand).toBe('decimal-system')
    expect(def.ages).toEqual([5, 8])
    validateAgainstSchema(def.defaults)
  })

  it('ships ≥ 2 presets whose params satisfy the schema and generate cleanly', () => {
    expect(def.presets.length).toBeGreaterThanOrEqual(2)
    expect(def.presets.map((p) => p.id)).toEqual(['first-expansions', 'digit-detective'])
    for (const preset of def.presets) {
      validateAgainstSchema(preset.params)
      const merged = { ...def.defaults, ...preset.params } as PlaceValueParams
      const { problems } = generate(merged, createRng(7))
      expect(problems).toHaveLength(merged.count)
      for (const p of problems) {
        if (merged.mode !== 'mixed') expect(p.kind).toBe(merged.mode)
        expect(p.value).toBeLessThanOrEqual(Number(merged.max))
      }
    }
  })
})

function validateAgainstSchema(values: Record<string, number | string | boolean>): void {
  for (const [key, value] of Object.entries(values)) {
    const field = def.schema.find((f) => f.key === key)
    expect(field, `schema has a field for param '${key}'`).toBeDefined()
    if (!field) continue
    if (field.kind === 'select') {
      expect(field.options.map((o) => o.value)).toContain(value)
    } else if (field.kind === 'number') {
      expect(typeof value).toBe('number')
      expect(value as number).toBeGreaterThanOrEqual(field.min)
      expect(value as number).toBeLessThanOrEqual(field.max)
    }
  }
}
