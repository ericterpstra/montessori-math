import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def, RUN_LENGTH } from './teens-tens'
import type { TeensTensData, TeensTensMode, TeensTensParams, TeensTensRange } from './teens-tens'

const SEEDS = [1, 2, 42, 99, 12345]
const MODES: TeensTensMode[] = ['bead-to-numeral', 'numeral-to-bead', 'sequences', 'mixed']
const RANGES: TeensTensRange[] = ['teens', 'tens']

function gen(params: TeensTensParams, seed: number): TeensTensData {
  return def.generate(params, createRng(seed))
}

function everyCombo(count: number, fn: (params: TeensTensParams, data: TeensTensData) => void) {
  for (const mode of MODES) {
    for (const range of RANGES) {
      for (const seed of SEEDS) {
        const params: TeensTensParams = { mode, range, count }
        fn(params, gen(params, seed))
      }
    }
  }
}

describe('teens-tens: answer-key correctness', () => {
  it('every bead problem decomposes value into tens and units correctly', () => {
    let checked = 0
    everyCombo(12, (_params, data) => {
      for (const p of data.problems) {
        if (p.kind === 'sequence') continue
        checked++
        // Independent recomputation of the decomposition.
        expect(p.tens).toBe(Math.floor(p.value / 10))
        expect(p.units).toBe(p.value % 10)
        expect(p.tens * 10 + p.units).toBe(p.value)
        expect(p.tens).toBeGreaterThanOrEqual(1)
        expect(p.tens).toBeLessThanOrEqual(9)
        expect(p.units).toBeGreaterThanOrEqual(0)
        expect(p.units).toBeLessThanOrEqual(9)
      }
    })
    expect(checked).toBeGreaterThan(0)
  })

  it('every sequence is a consecutive run and answers are exactly the missing numbers', () => {
    let checked = 0
    everyCombo(12, (_params, data) => {
      for (const p of data.problems) {
        if (p.kind !== 'sequence') continue
        checked++
        expect(p.numbers).toHaveLength(RUN_LENGTH)
        // Independent recomputation of the run.
        expect(p.numbers).toEqual(
          Array.from({ length: RUN_LENGTH }, (_, i) => p.start + i),
        )
        expect(p.answers).toEqual(p.blanks.map((b) => p.start + b))
      }
    })
    expect(checked).toBeGreaterThan(0)
  })

  it('sequence blanks: 2-3 per run, distinct, sorted, never the first number', () => {
    everyCombo(15, (_params, data) => {
      for (const p of data.problems) {
        if (p.kind !== 'sequence') continue
        expect(p.blanks.length).toBeGreaterThanOrEqual(2)
        expect(p.blanks.length).toBeLessThanOrEqual(3)
        expect(new Set(p.blanks).size).toBe(p.blanks.length)
        expect([...p.blanks].sort((a, b) => a - b)).toEqual(p.blanks)
        for (const b of p.blanks) {
          expect(b).toBeGreaterThanOrEqual(1) // anchor (index 0) always visible
          expect(b).toBeLessThanOrEqual(RUN_LENGTH - 1)
        }
      }
    })
  })
})

describe('teens-tens: parameter respect', () => {
  it('teens range keeps every number in 11-19', () => {
    for (const mode of MODES) {
      for (const seed of SEEDS) {
        const data = gen({ mode, range: 'teens', count: 15 }, seed)
        for (const p of data.problems) {
          const nums = p.kind === 'sequence' ? p.numbers : [p.value]
          for (const n of nums) {
            expect(n).toBeGreaterThanOrEqual(11)
            expect(n).toBeLessThanOrEqual(19)
          }
        }
      }
    }
  })

  it('tens range keeps every number in 10-99', () => {
    for (const mode of MODES) {
      for (const seed of SEEDS) {
        const data = gen({ mode, range: 'tens', count: 15 }, seed)
        for (const p of data.problems) {
          const nums = p.kind === 'sequence' ? p.numbers : [p.value]
          for (const n of nums) {
            expect(n).toBeGreaterThanOrEqual(10)
            expect(n).toBeLessThanOrEqual(99)
          }
        }
      }
    }
  })

  it('single-kind modes produce only their own kind of problem', () => {
    const expected: Record<Exclude<TeensTensMode, 'mixed'>, string> = {
      'bead-to-numeral': 'bead-to-numeral',
      'numeral-to-bead': 'numeral-to-bead',
      sequences: 'sequence',
    }
    for (const mode of ['bead-to-numeral', 'numeral-to-bead', 'sequences'] as const) {
      for (const range of RANGES) {
        for (const seed of SEEDS) {
          const data = gen({ mode, range, count: 10 }, seed)
          for (const p of data.problems) expect(p.kind).toBe(expected[mode])
        }
      }
    }
  })

  it('mixed mode includes all three kinds on every sheet', () => {
    for (const range of RANGES) {
      for (const seed of SEEDS) {
        const data = gen({ mode: 'mixed', range, count: 6 }, seed)
        const kinds = new Set(data.problems.map((p) => p.kind))
        expect(kinds).toEqual(new Set(['bead-to-numeral', 'numeral-to-bead', 'sequence']))
      }
    }
  })

  it('count is honored exactly across the whole 6-15 range', () => {
    for (const count of [6, 10, 15]) {
      everyCombo(count, (params, data) => {
        expect(data.problems).toHaveLength(params.count)
      })
    }
  })
})

describe('teens-tens: seed determinism', () => {
  it('same seed + params produce byte-identical data', () => {
    everyCombo(10, (params, data) => {
      // everyCombo already generated once per seed; regenerate with each seed
      // and compare against a fresh run.
      void data
      for (const seed of SEEDS) {
        const a = gen(params, seed)
        const b = gen(params, seed)
        expect(a).toEqual(b)
        expect(JSON.stringify(a)).toBe(JSON.stringify(b))
      }
    })
  })

  it('different seeds produce different sheets', () => {
    const params: TeensTensParams = { mode: 'mixed', range: 'tens', count: 10 }
    const a = gen(params, 1)
    const b = gen(params, 2)
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b))
  })
})

describe('teens-tens: presets and defaults', () => {
  it('exposes the two spec presets with valid, generatable params', () => {
    expect(def.presets.map((p) => p.id)).toEqual(['teen-beads', 'counting-runs'])

    const teenBeads = def.presets[0].params as TeensTensParams
    expect(teenBeads.mode).toBe('bead-to-numeral')
    expect(teenBeads.range).toBe('teens')

    const countingRuns = def.presets[1].params as TeensTensParams
    expect(countingRuns.mode).toBe('sequences')
    expect(countingRuns.range).toBe('tens')

    for (const preset of def.presets) {
      const params = preset.params as TeensTensParams
      expect(params.count).toBeGreaterThanOrEqual(6)
      expect(params.count).toBeLessThanOrEqual(15)
      const data = gen(params, 7)
      expect(data.problems).toHaveLength(params.count)
    }
  })

  it('defaults are within schema bounds and generate a valid sheet', () => {
    expect(def.slug).toBe('teens-tens')
    expect(def.defaults.count).toBeGreaterThanOrEqual(6)
    expect(def.defaults.count).toBeLessThanOrEqual(15)
    const data = gen(def.defaults, 3)
    expect(data.problems).toHaveLength(def.defaults.count)
  })
})
