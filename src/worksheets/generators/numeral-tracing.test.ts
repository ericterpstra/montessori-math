import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def } from './numeral-tracing'
import type { NumeralTracingData, NumeralTracingParams, TracingRow } from './numeral-tracing'

const SEEDS = [1, 7, 42, 999, 123456]

function gen(overrides: Partial<NumeralTracingParams> = {}, seed = 42): NumeralTracingData {
  return def.generate({ ...def.defaults, ...overrides }, createRng(seed))
}

function allRows(data: NumeralTracingData): TracingRow[] {
  return data.pages.flatMap((p) => p.rows)
}

describe('numeral-tracing: answer-key correctness', () => {
  it('bead count equals the numeral for every row, across seeds (zero => none)', () => {
    for (const seed of SEEDS) {
      const data = gen({ focus: 'all', counting: true }, seed)
      for (const row of allRows(data)) {
        expect(row.beadCount).toBe(row.numeral) // the count IS the answer
        expect(row.jitter).toHaveLength(row.beadCount) // one drawn bead per counted bead
        if (row.numeral === 0) expect(row.beadCount).toBe(0)
      }
    }
  })

  it('jitter offsets are integers within ±3px (beads stay inside the frame)', () => {
    for (const seed of SEEDS) {
      for (const row of allRows(gen({ focus: 'all', counting: true }, seed))) {
        for (const j of row.jitter) {
          expect(Number.isInteger(j)).toBe(true)
          expect(j).toBeGreaterThanOrEqual(-3)
          expect(j).toBeLessThanOrEqual(3)
        }
      }
    }
  })

  it('every row leads with a model glyph: glyphCount is 8 with beads, 10 without', () => {
    for (const row of allRows(gen({ counting: true }))) expect(row.glyphCount).toBe(8)
    for (const row of allRows(gen({ counting: false }))) expect(row.glyphCount).toBe(10)
  })
})

describe('numeral-tracing: parameter respect', () => {
  it('single-focus sheets contain only that numeral, on one page', () => {
    for (let n = 0; n <= 9; n++) {
      const data = gen({ focus: `${n}` })
      expect(data.pages).toHaveLength(1)
      const rows = allRows(data)
      expect(rows.length).toBeGreaterThan(0)
      for (const row of rows) expect(row.numeral).toBe(n)
    }
  })

  it('rowsPerNumeral is honored exactly for every numeral', () => {
    for (const rowsPerNumeral of [1, 2, 3]) {
      const rows = allRows(gen({ focus: 'all', rowsPerNumeral }))
      expect(rows).toHaveLength(10 * rowsPerNumeral)
      for (let n = 0; n <= 9; n++) {
        expect(rows.filter((r) => r.numeral === n)).toHaveLength(rowsPerNumeral)
      }
      const single = allRows(gen({ focus: '4', rowsPerNumeral }))
      expect(single).toHaveLength(rowsPerNumeral)
    }
  })

  it('all-numerals mode with 2 rows paginates 0–4 then 5–9', () => {
    const data = gen({ focus: 'all', rowsPerNumeral: 2 })
    expect(data.pages).toHaveLength(2)
    expect(data.pages[0].rows.map((r) => r.numeral)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])
    expect(data.pages[1].rows.map((r) => r.numeral)).toEqual([5, 5, 6, 6, 7, 7, 8, 8, 9, 9])
    expect(data.pages[0].label).toBe('0 to 4')
    expect(data.pages[1].label).toBe('5 to 9')
  })

  it('no page ever exceeds 10 rows, and numerals stay whole per page', () => {
    for (const rowsPerNumeral of [1, 2, 3]) {
      const data = gen({ focus: 'all', rowsPerNumeral })
      for (const page of data.pages) {
        expect(page.rows.length).toBeLessThanOrEqual(10)
        // a numeral's rows never split across pages
        expect(page.rows.length % rowsPerNumeral).toBe(0)
      }
    }
    expect(gen({ focus: 'all', rowsPerNumeral: 1 }).pages).toHaveLength(1)
    expect(gen({ focus: 'all', rowsPerNumeral: 3 }).pages).toHaveLength(4)
  })

  it('counting=false: no beads, no jitter, wider glyph rows', () => {
    const data = gen({ focus: 'all', counting: false })
    expect(data.counting).toBe(false)
    for (const row of allRows(data)) {
      expect(row.beadCount).toBe(0)
      expect(row.jitter).toEqual([])
      expect(row.glyphCount).toBe(10)
    }
  })

  it('focus 0 with counting on yields the empty frame (zero beads)', () => {
    const data = gen({ focus: '0', counting: true })
    expect(data.counting).toBe(true)
    for (const row of allRows(data)) {
      expect(row.numeral).toBe(0)
      expect(row.beadCount).toBe(0)
      expect(row.jitter).toEqual([])
    }
  })

  it('rowsPerNumeral is clamped to the schema range 1–3', () => {
    expect(allRows(gen({ focus: '4', rowsPerNumeral: 0 }))).toHaveLength(1)
    expect(allRows(gen({ focus: '4', rowsPerNumeral: 99 }))).toHaveLength(3)
  })
})

describe('numeral-tracing: seed determinism', () => {
  it('same seed + params produce identical data (byte-identical JSON)', () => {
    for (const seed of SEEDS) {
      const a = gen({ focus: 'all', rowsPerNumeral: 2, counting: true }, seed)
      const b = gen({ focus: 'all', rowsPerNumeral: 2, counting: true }, seed)
      expect(b).toEqual(a)
      expect(JSON.stringify(b)).toBe(JSON.stringify(a))
    }
  })

  it('different seeds produce different data (bead jitter differs)', () => {
    const a = gen({ focus: 'all', counting: true }, 1)
    const b = gen({ focus: 'all', counting: true }, 2)
    expect(b).not.toEqual(a)
  })
})

describe('numeral-tracing: row count honored exactly', () => {
  it('total rows = numerals × rowsPerNumeral for every combination', () => {
    for (const focus of ['all', '0', '3', '9']) {
      for (const rowsPerNumeral of [1, 2, 3]) {
        const expected = (focus === 'all' ? 10 : 1) * rowsPerNumeral
        expect(allRows(gen({ focus, rowsPerNumeral }))).toHaveLength(expected)
      }
    }
  })
})

describe('numeral-tracing: presets', () => {
  it('ships the two lesson presets and both generate valid sheets', () => {
    expect(def.presets.map((p) => p.id)).toEqual(['first-numerals', 'focus-practice'])

    const first = def.generate(
      { ...def.defaults, ...def.presets[0].params } as NumeralTracingParams,
      createRng(5),
    )
    expect(allRows(first)).toHaveLength(20)
    expect(first.counting).toBe(true)

    const focusPractice = def.generate(
      { ...def.defaults, ...def.presets[1].params } as NumeralTracingParams,
      createRng(5),
    )
    const rows = allRows(focusPractice)
    expect(rows).toHaveLength(3)
    for (const row of rows) {
      expect(row.numeral).toBe(4)
      expect(row.beadCount).toBe(4)
    }
  })
})
