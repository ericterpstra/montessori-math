import { describe, expect, it } from 'vitest'
import { clamp, commitNumber, draftNumber, resolveParams } from './params'
import { GENERATORS } from './registry'
import { createRng } from '../lib/rng'

describe('clamp', () => {
  it('holds a value inside its bounds', () => {
    expect(clamp(5, 1, 10)).toBe(5)
    expect(clamp(0, 1, 10)).toBe(1)
    expect(clamp(99, 1, 10)).toBe(10)
  })

  it('rounds to a whole count', () => {
    expect(clamp(6.5, 1, 10)).toBe(7)
    expect(clamp(6.4, 1, 10)).toBe(6)
    expect(clamp(2.5, 1, 10)).toBe(3)
  })

  it('rounds before clamping, so a fractional bound still lands in range', () => {
    expect(clamp(10.7, 1, 10)).toBe(10)
    expect(clamp(0.4, 1, 10)).toBe(1)
  })
})

/**
 * Regression: the builder's number inputs clamped on every keystroke, so typing
 * 25 into math-facts "Number of problems" (10–60) turned "2" into 10, then "105"
 * into 60, and clearing the field snapped it to the minimum.
 */
describe('number field editing', () => {
  const count = GENERATORS.find((g) => g.slug === 'math-facts')!.schema.find((f) => f.key === 'count')!
  if (count.kind !== 'number') throw new Error('math-facts count should be a number field')
  const { min, max } = count

  it('leaves the sheet alone while a keystroke is only a prefix, then applies the full number', () => {
    expect([min, max]).toEqual([10, 60])
    expect(draftNumber('2', min, max)).toBeNull()
    expect(draftNumber('25', min, max)).toBe(25)
    expect(commitNumber('25', min, max)).toBe(25)
  })

  it('never applies empty, junk, or out-of-range text mid-edit', () => {
    for (const text of ['', '   ', '-', 'abc', 'Infinity', '9', '61', '600']) {
      expect(draftNumber(text, min, max)).toBeNull()
    }
  })

  it('applies an in-range value as a whole count, like the URL path', () => {
    expect(draftNumber('10', min, max)).toBe(10)
    expect(draftNumber('60', min, max)).toBe(60)
    expect(draftNumber('20.5', min, max)).toBe(21)
  })

  it('clamps only when editing ends', () => {
    expect(commitNumber('2', min, max)).toBe(10)
    expect(commitNumber('600', min, max)).toBe(60)
    expect(commitNumber('20.4', min, max)).toBe(20)
  })

  it('keeps the current value when the field is left empty or junk, instead of snapping to the minimum', () => {
    for (const text of ['', '   ', 'abc', 'NaN']) {
      expect(commitNumber(text, min, max)).toBeNull()
    }
  })
})

describe('resolveParams', () => {
  const def = GENERATORS[0]!

  it('falls back to the generator defaults with an empty query', () => {
    expect(resolveParams(def, new URLSearchParams())).toEqual(def.defaults)
  })

  it('ignores a number param that is not a finite number', () => {
    const field = def.schema.find((f) => f.kind === 'number')
    if (!field) return
    for (const junk of ['abc', 'Infinity', '-Infinity', 'NaN']) {
      const resolved = resolveParams(def, new URLSearchParams(`${field.key}=${junk}`))
      expect(Number.isInteger(resolved[field.key])).toBe(true)
    }
  })

  it('layers defaults ← preset ← individual params', () => {
    const withPreset = GENERATORS.find((g) => g.presets.length > 0 && g.schema.some((f) => f.kind === 'number'))
    if (!withPreset) return
    const preset = withPreset.presets[0]!
    const numberField = withPreset.schema.find((f) => f.kind === 'number')!
    const resolved = resolveParams(
      withPreset,
      new URLSearchParams(`preset=${preset.id}&${numberField.key}=${numberField.min}`),
    )
    // The explicit param wins over the preset's value for that one key…
    expect(resolved[numberField.key]).toBe(numberField.min)
    // …while the preset still supplies everything the URL did not mention.
    for (const [key, value] of Object.entries(preset.params)) {
      if (key !== numberField.key) expect(resolved[key]).toEqual(value)
    }
  })
})

/**
 * Regression: a fractional count reaching a generator used to hang the tab.
 * `/worksheets/skip-counting?n=mixed&count=6.5` spun forever in a
 * `while (ns.length < params.count)` loop that could push zero elements.
 * Every number param must arrive at generate() as a whole number.
 */
describe('fractional URL params never reach a generator', () => {
  it('the exact URL that used to hang the tab now generates', () => {
    const def = GENERATORS.find((g) => g.slug === 'skip-counting')!
    const params = resolveParams(def, new URLSearchParams('n=mixed&count=6.5'))
    expect(params.count).toBe(7)
    // Before the fix this call never returned.
    const data = def.generate(params, createRng(1)) as { sequences: unknown[] }
    expect(data.sequences).toHaveLength(7)
  }, 5000)

  for (const def of GENERATORS) {
    const numberFields = def.schema.filter((f) => f.kind === 'number')
    if (numberFields.length === 0) continue

    it(`${def.slug} resolves fractional params to whole numbers and still generates`, () => {
      const query = new URLSearchParams()
      for (const field of numberFields) {
        // A value that is in range but deliberately not a whole number.
        query.set(field.key, String(Math.min(field.max, field.min + 0.5)))
      }
      const params = resolveParams(def, query)
      for (const field of numberFields) {
        expect(Number.isInteger(params[field.key])).toBe(true)
      }
      expect(() => def.generate(params, createRng(1))).not.toThrow()
    })
  }
})
