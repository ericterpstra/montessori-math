import { describe, it, expect } from 'vitest'
import { LESSONS } from './registry'
import { MATERIALS } from '../materials/registry'
import { GENERATORS } from '../worksheets/registry'
import { STRANDS } from '../lib/strands'

/**
 * Content contract for the whole site: every album lesson is complete, every
 * cross-reference resolves, sequences are coherent, and every material and
 * generator meets its metadata obligations.
 */

const lessonSlugs = new Set(LESSONS.map((l) => l.slug))
const materialSlugs = new Set(MATERIALS.map((m) => m.slug))
const generatorSlugs = new Set(GENERATORS.map((g) => g.slug))

describe('registries are populated', () => {
  it('has lessons, materials, and generators', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(30)
    expect(MATERIALS.length).toBeGreaterThanOrEqual(19)
    expect(GENERATORS.length).toBeGreaterThanOrEqual(12)
  })

  it('has unique slugs everywhere', () => {
    expect(lessonSlugs.size).toBe(LESSONS.length)
    expect(materialSlugs.size).toBe(MATERIALS.length)
    expect(generatorSlugs.size).toBe(GENERATORS.length)
  })
})

describe('every lesson is a complete album entry', () => {
  for (const lesson of LESSONS) {
    describe(lesson.slug, () => {
      it('fills every field', () => {
        expect(lesson.name.trim()).not.toBe('')
        expect(lesson.overview.trim()).not.toBe('')
        expect(lesson.grades.trim()).not.toBe('')
        expect(lesson.whatComesNext.trim()).not.toBe('')
        expect(lesson.materialsNeeded.length).toBeGreaterThan(0)
        expect(lesson.directAims.length).toBeGreaterThan(0)
        expect(lesson.indirectAims.length).toBeGreaterThan(0)
        expect(lesson.presentation.length).toBeGreaterThanOrEqual(4)
        expect(lesson.pointsOfInterest.length).toBeGreaterThan(0)
        expect(lesson.controlOfError.length).toBeGreaterThan(0)
        expect(lesson.vocabulary.length).toBeGreaterThan(0)
        expect(lesson.followUpWork.length).toBeGreaterThan(0)
        for (const step of lesson.presentation) expect(step.text.trim()).not.toBe('')
        for (const f of lesson.followUpWork) expect(f.description.trim()).not.toBe('')
      })

      it('has sane ages and a valid strand', () => {
        expect(lesson.ages[0]).toBeLessThanOrEqual(lesson.ages[1])
        expect(lesson.ages[0]).toBeGreaterThanOrEqual(3)
        expect(lesson.ages[1]).toBeLessThanOrEqual(12)
        expect(STRANDS.some((s) => s.id === lesson.strand)).toBe(true)
      })

      it('cross-references resolve', () => {
        for (const p of lesson.prerequisites) expect(lessonSlugs, `prereq ${p}`).toContain(p)
        for (const v of lesson.virtualMaterials) expect(materialSlugs, `material ${v}`).toContain(v)
        for (const f of lesson.followUpWork) {
          if (f.worksheetSlug) {
            expect(generatorSlugs, `worksheet ${f.worksheetSlug}`).toContain(f.worksheetSlug)
            if (f.presetId) {
              const gen = GENERATORS.find((g) => g.slug === f.worksheetSlug)
              expect(gen?.presets.some((p) => p.id === f.presetId), `preset ${f.presetId}`).toBe(true)
            }
          }
        }
      })
    })
  }
})

describe('strand sequences are coherent', () => {
  for (const strand of STRANDS) {
    it(`${strand.id} runs 1..n with no gaps or duplicates`, () => {
      const seqs = LESSONS.filter((l) => l.strand === strand.id)
        .map((l) => l.sequence)
        .sort((a, b) => a - b)
      expect(seqs.length).toBeGreaterThan(0)
      expect(seqs).toEqual(Array.from({ length: seqs.length }, (_, i) => i + 1))
    })
  }
})

describe('every material meets its metadata obligations', () => {
  for (const m of MATERIALS) {
    describe(m.slug, () => {
      it('has complete metadata', () => {
        expect(m.name.trim()).not.toBe('')
        expect(m.summary.trim()).not.toBe('')
        expect(m.parentNote.trim().length).toBeGreaterThan(60)
        expect(m.grades.trim()).not.toBe('')
        expect(m.ages[0]).toBeLessThanOrEqual(m.ages[1])
        expect(STRANDS.some((s) => s.id === m.strand)).toBe(true)
      })

      it('links at least one lesson and its links resolve', () => {
        expect(m.lessonSlugs.length).toBeGreaterThan(0)
        for (const s of m.lessonSlugs) expect(lessonSlugs, `lesson ${s}`).toContain(s)
        for (const s of m.worksheetSlugs) expect(generatorSlugs, `worksheet ${s}`).toContain(s)
      })
    })
  }
})

describe('every generator meets its contract', () => {
  for (const g of GENERATORS) {
    describe(g.slug, () => {
      it('has complete metadata and ≥2 presets', () => {
        expect(g.name.trim()).not.toBe('')
        expect(g.description.trim()).not.toBe('')
        expect(g.presets.length).toBeGreaterThanOrEqual(2)
        expect(STRANDS.some((s) => s.id === g.strand)).toBe(true)
      })

      it('defaults satisfy the schema', () => {
        for (const field of g.schema) {
          expect(g.defaults, `default for ${field.key}`).toHaveProperty(field.key)
          const v = g.defaults[field.key]
          if (field.kind === 'number') {
            expect(typeof v).toBe('number')
            expect(v as number).toBeGreaterThanOrEqual(field.min)
            expect(v as number).toBeLessThanOrEqual(field.max)
          } else if (field.kind === 'select') {
            expect(field.options.some((o) => o.value === v)).toBe(true)
          } else {
            expect(typeof v).toBe('boolean')
          }
        }
      })

      it('preset params are valid schema values', () => {
        const keys = new Set(g.schema.map((f) => f.key))
        for (const preset of g.presets) {
          expect(preset.description.trim()).not.toBe('')
          for (const [k, v] of Object.entries(preset.params)) {
            expect(keys, `preset key ${k}`).toContain(k)
            const field = g.schema.find((f) => f.key === k)
            if (field?.kind === 'number') {
              expect(v as number).toBeGreaterThanOrEqual(field.min)
              expect(v as number).toBeLessThanOrEqual(field.max)
            } else if (field?.kind === 'select') {
              expect(field.options.some((o) => o.value === v)).toBe(true)
            }
          }
        }
      })

      it('generates deterministically from the defaults', async () => {
        const { createRng } = await import('../lib/rng')
        const a = g.generate(g.defaults, createRng(12345))
        const b = g.generate(g.defaults, createRng(12345))
        expect(a).toEqual(b)
      })
    })
  }
})
