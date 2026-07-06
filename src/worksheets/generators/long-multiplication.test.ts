import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def, ZERO_UNITS_RATE } from './long-multiplication'
import type {
  LongMultiplicationData,
  LongMultiplicationParams,
} from './long-multiplication'

const SEEDS = [1, 2, 3, 42, 99, 1234, 987654]

const DIGIT_COMBOS: Array<{ multiplicandDigits: number; multiplierDigits: number }> = [
  { multiplicandDigits: 2, multiplierDigits: 1 },
  { multiplicandDigits: 2, multiplierDigits: 2 },
  { multiplicandDigits: 3, multiplierDigits: 1 },
  { multiplicandDigits: 3, multiplierDigits: 2 },
  { multiplicandDigits: 4, multiplierDigits: 1 },
  { multiplicandDigits: 4, multiplierDigits: 2 },
]

function gen(
  overrides: Partial<LongMultiplicationParams> = {},
  seed = 42,
): { params: LongMultiplicationParams; data: LongMultiplicationData } {
  const params = { ...def.defaults, ...overrides }
  return { params, data: def.generate(params, createRng(seed)) }
}

/* ---------- element-tree helpers (pure function calls, no DOM) ---------- */

interface Collected {
  classNames: string[]
  text: string[]
}

/**
 * Walk a React element tree, invoking function components as plain
 * functions (none of ours use hooks), collecting classNames and text.
 */
function collect(node: unknown, out: Collected = { classNames: [], text: [] }): Collected {
  if (node == null || typeof node === 'boolean') return out
  if (typeof node === 'string') {
    out.text.push(node)
    return out
  }
  if (typeof node === 'number') {
    out.text.push(String(node))
    return out
  }
  if (Array.isArray(node)) {
    for (const child of node) collect(child, out)
    return out
  }
  if (typeof node === 'object') {
    const el = node as { type?: unknown; props?: { className?: unknown; children?: unknown } }
    if (typeof el.type === 'function') {
      return collect((el.type as (props: unknown) => unknown)(el.props), out)
    }
    if (el.props && typeof el.props === 'object') {
      if (typeof el.props.className === 'string') out.classNames.push(el.props.className)
      collect(el.props.children, out)
    }
  }
  return out
}

function renderSheet(params: LongMultiplicationParams, data: LongMultiplicationData): Collected {
  const Sheet = def.Sheet as (props: { params: LongMultiplicationParams; data: LongMultiplicationData }) => unknown
  return collect(Sheet({ params, data }))
}

function renderKey(params: LongMultiplicationParams, data: LongMultiplicationData): Collected {
  const Key = def.AnswerKey as (props: { params: LongMultiplicationParams; data: LongMultiplicationData }) => unknown
  return collect(Key({ params, data }))
}

function countClass(collected: Collected, cls: string): number {
  return collected.classNames.filter((c) => c.split(' ').includes(cls)).length
}

/* ---------- tests ---------- */

describe('long-multiplication generate', () => {
  it('every answer is mathematically correct, including each partial product', () => {
    for (const combo of DIGIT_COMBOS) {
      for (const seed of SEEDS) {
        const { data } = gen({ ...combo, count: 10 }, seed)
        for (const p of data.problems) {
          // Final product recomputed independently.
          expect(p.product).toBe(p.multiplicand * p.multiplier)

          // One partial product per multiplier digit, units place first.
          expect(p.partialProducts).toHaveLength(combo.multiplierDigits)
          p.partialProducts.forEach((pp, i) => {
            expect(pp.place).toBe(i)
            const expectedDigit = Math.floor(p.multiplier / 10 ** pp.place) % 10
            expect(pp.digit).toBe(expectedDigit)
            expect(pp.value).toBe(p.multiplicand * expectedDigit * 10 ** pp.place)
          })

          // The partials must add up to the product (that IS the algorithm).
          const sum = p.partialProducts.reduce((acc, pp) => acc + pp.value, 0)
          expect(sum).toBe(p.product)
        }
      }
    }
  })

  it('honors multiplicandDigits and multiplierDigits exactly', () => {
    for (const combo of DIGIT_COMBOS) {
      for (const seed of SEEDS) {
        const { data } = gen({ ...combo, count: 10 }, seed)
        for (const p of data.problems) {
          expect(p.multiplicand).toBeGreaterThanOrEqual(10 ** (combo.multiplicandDigits - 1))
          expect(p.multiplicand).toBeLessThanOrEqual(10 ** combo.multiplicandDigits - 1)
          expect(p.multiplier).toBeGreaterThanOrEqual(
            combo.multiplierDigits === 1 ? 2 : 10 ** (combo.multiplierDigits - 1),
          )
          expect(p.multiplier).toBeLessThanOrEqual(10 ** combo.multiplierDigits - 1)
        }
      }
    }
  })

  it('honors count exactly', () => {
    for (let count = 4; count <= 10; count++) {
      for (const seed of [7, 21]) {
        const { data } = gen({ count }, seed)
        expect(data.problems).toHaveLength(count)
      }
    }
  })

  it('2-digit multipliers rarely end in 0 (degenerate units line <= ~20%)', () => {
    let total = 0
    let endsInZero = 0
    for (let seed = 1; seed <= 60; seed++) {
      const { data } = gen({ multiplierDigits: 2, count: 10 }, seed)
      for (const p of data.problems) {
        total++
        if (p.multiplier % 10 === 0) endsInZero++
      }
    }
    expect(total).toBe(600)
    const rate = endsInZero / total
    // Deterministic given fixed seeds; the configured rate is ZERO_UNITS_RATE.
    expect(ZERO_UNITS_RATE).toBeLessThanOrEqual(0.2)
    expect(rate).toBeLessThanOrEqual(0.27)
    // ...but it does still happen sometimes, per the material's honesty.
    expect(endsInZero).toBeGreaterThan(0)
  })

  it('1-digit multipliers are between 2 and 9', () => {
    for (const seed of SEEDS) {
      const { data } = gen({ multiplierDigits: 1, count: 10 }, seed)
      for (const p of data.problems) {
        expect(p.multiplier).toBeGreaterThanOrEqual(2)
        expect(p.multiplier).toBeLessThanOrEqual(9)
      }
    }
  })

  it('same seed + params reproduce byte-identical data', () => {
    for (const seed of SEEDS) {
      const a = gen({}, seed).data
      const b = gen({}, seed).data
      expect(a).toEqual(b)
      expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    }
  })

  it('different seeds produce different sheets', () => {
    const a = gen({}, 1).data
    const b = gen({}, 2).data
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b))
  })

  it('scaffold and placeColors are presentation-only: data is unchanged', () => {
    const base = gen({ scaffold: true, placeColors: true }, 42).data
    const bare = gen({ scaffold: false, placeColors: false }, 42).data
    expect(bare).toEqual(base)
  })
})

describe('long-multiplication rendering (pure element trees)', () => {
  it('scaffold=on prints one labeled partial line per multiplier digit', () => {
    const { params, data } = gen({ scaffold: true, multiplierDigits: 2, count: 6 })
    const sheet = renderSheet(params, data)
    // 6 problems × 2 multiplier digits = 12 partial lines and labels.
    expect(countClass(sheet, 'long-multiplication-partial')).toBe(12)
    expect(countClass(sheet, 'long-multiplication-partial-label')).toBe(12)
    const text = sheet.text.join('')
    expect(text).toContain('units')
    expect(text).toContain('tens')
  })

  it('scaffold=off prints no partial lines', () => {
    const { params, data } = gen({ scaffold: false, count: 6 })
    const sheet = renderSheet(params, data)
    expect(countClass(sheet, 'long-multiplication-partial')).toBe(0)
  })

  it('scaffold is suppressed for 1-digit multipliers (line would repeat the answer)', () => {
    const { params, data } = gen({ scaffold: true, multiplierDigits: 1, count: 6 })
    const sheet = renderSheet(params, data)
    expect(countClass(sheet, 'long-multiplication-partial')).toBe(0)
  })

  it('placeColors toggles the column-head letters', () => {
    const on = gen({ placeColors: true, count: 6 })
    const off = gen({ placeColors: false, count: 6 })
    // 3 + 2 digit columns + 1 comma cell = 6 head cells per problem.
    expect(countClass(renderSheet(on.params, on.data), 'long-multiplication-head-cell')).toBe(36)
    expect(countClass(renderSheet(off.params, off.data), 'long-multiplication-head-cell')).toBe(0)
  })

  it('chunks scaffolded sheets at 6 problems per page', () => {
    const tall = gen({ scaffold: true, count: 10 })
    expect(countClass(renderSheet(tall.params, tall.data), 'sheet-page')).toBe(2)
    const flat = gen({ scaffold: false, count: 10 })
    expect(countClass(renderSheet(flat.params, flat.data), 'sheet-page')).toBe(1)
  })

  it('answer key shows every partial product and the final product', () => {
    for (const seed of SEEDS) {
      const { params, data } = gen({}, seed)
      const key = renderKey(params, data)
      const text = key.text.join(' ')
      for (const p of data.problems) {
        expect(text).toContain(p.product.toLocaleString('en-US'))
        for (const pp of p.partialProducts) {
          expect(text).toContain(pp.value.toLocaleString('en-US'))
        }
      }
    }
  })
})

describe('long-multiplication definition', () => {
  it('exposes the required presets with schema-legal params', () => {
    const ids = def.presets.map((p) => p.id)
    expect(ids).toContain('checkerboard-follow-up')
    expect(ids).toContain('toward-abstraction')
    expect(def.presets.length).toBeGreaterThanOrEqual(2)

    const follow = def.presets.find((p) => p.id === 'checkerboard-follow-up')!
    expect(follow.params.multiplicandDigits).toBe(3)
    expect(follow.params.multiplierDigits).toBe(2)
    expect(follow.params.scaffold).toBe(true)
    expect(follow.params.placeColors).toBe(true)

    const abstraction = def.presets.find((p) => p.id === 'toward-abstraction')!
    expect(abstraction.params.multiplicandDigits).toBe(4)
    expect(abstraction.params.multiplierDigits).toBe(2)
    expect(abstraction.params.scaffold).toBe(false)

    // Every preset key exists in the schema and stays inside number bounds.
    const fields = new Map(def.schema.map((f) => [f.key, f]))
    for (const preset of def.presets) {
      for (const [key, value] of Object.entries(preset.params)) {
        const field = fields.get(key)
        expect(field, `schema field for preset param '${key}'`).toBeDefined()
        if (field!.kind === 'number' && typeof value === 'number') {
          expect(value).toBeGreaterThanOrEqual(field!.min)
          expect(value).toBeLessThanOrEqual(field!.max)
        }
      }
    }
  })

  it('defaults cover exactly the schema keys', () => {
    const schemaKeys = def.schema.map((f) => f.key).sort()
    const defaultKeys = Object.keys(def.defaults).sort()
    expect(defaultKeys).toEqual(schemaKeys)
  })
})
