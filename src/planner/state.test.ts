import { describe, expect, it } from 'vitest'
import { LESSONS } from '../lessons/registry'
import { GENERATORS } from '../worksheets/registry'
import { MATERIALS } from '../materials/registry'
import { chunkJournal, parsePlan, serializePlan } from './state'
import type { PlanItem, PlanValidity } from './state'

// Fixture slugs deliberately match real registry slugs; see the 'real registries' test.
const VALID: PlanValidity = {
  lessons: new Set(['golden-beads-intro', 'golden-beads-addition', 'bead-stair-intro']),
  sheets: new Set(['math-facts', 'numeral-tracing']),
  presets: new Map([
    ['math-facts', new Set(['first-facts', 'times-tables'])],
    ['numeral-tracing', new Set<string>()],
  ]),
  materials: new Set(['stamp-game', 'bead-stair']),
}

const parse = (q: string) => parsePlan(new URLSearchParams(q), VALID)

describe('parsePlan', () => {
  it('parses the full example URL into the exact Plan', () => {
    expect(parse('l=golden-beads-intro:mon&s=math-facts.first-facts&m=stamp-game&w=2026-07-13')).toEqual({
      items: [
        { kind: 'lesson', slug: 'golden-beads-intro', day: 'mon' },
        { kind: 'sheet', slug: 'math-facts', presetId: 'first-facts' },
        { kind: 'material', slug: 'stamp-game' },
      ],
      weekOf: '2026-07-13',
    })
  })

  it('drops items with unknown slugs', () => {
    expect(parse('l=not-a-lesson&m=stamp-game&s=fake-sheet.first-facts')).toEqual({
      items: [{ kind: 'material', slug: 'stamp-game' }],
    })
  })

  it('keeps the item but drops an invalid day', () => {
    expect(parse('l=golden-beads-intro:funday')).toEqual({
      items: [{ kind: 'lesson', slug: 'golden-beads-intro' }],
    })
  })

  it('keeps the sheet but drops a presetId the generator does not have', () => {
    expect(parse('s=math-facts.not-a-preset:tue')).toEqual({
      items: [{ kind: 'sheet', slug: 'math-facts', day: 'tue' }],
    })
  })

  it('drops a malformed weekOf', () => {
    expect(parse('w=next-week&m=bead-stair')).toEqual({
      items: [{ kind: 'material', slug: 'bead-stair' }],
    })
  })

  it('ignores unrelated params like bw and seed', () => {
    expect(parse('bw=1&seed=42&m=stamp-game')).toEqual({
      items: [{ kind: 'material', slug: 'stamp-game' }],
    })
  })

  it('preserves interleaved item order', () => {
    const { items } = parse('m=stamp-game&l=golden-beads-intro&s=math-facts&l=bead-stair-intro')
    expect(items.map((i) => i.kind)).toEqual(['material', 'lesson', 'sheet', 'lesson'])
    expect(items[3].slug).toBe('bead-stair-intro')
  })

  it('returns an empty plan for an empty query', () => {
    expect(parse('')).toEqual({ items: [] })
  })
})

describe('serializePlan', () => {
  it('is a string-stable round trip for canonical URLs', () => {
    const fixtures = [
      'l=golden-beads-intro:mon&s=math-facts.first-facts&m=stamp-game&w=2026-07-13',
      'm=bead-stair&l=bead-stair-intro&s=numeral-tracing',
      's=math-facts:sun&s=math-facts.times-tables&l=golden-beads-addition:wed',
    ]
    for (const x of fixtures) {
      expect(serializePlan(parse(x))).toBe(x)
    }
  })

  it('serializes w last regardless of item count', () => {
    expect(serializePlan({ items: [{ kind: 'lesson', slug: 'x' }], weekOf: '2026-07-13' })).toBe(
      'l=x&w=2026-07-13',
    )
  })

  it('serializes an empty plan to an empty string', () => {
    expect(serializePlan({ items: [] })).toBe('')
  })
})

describe('chunkJournal', () => {
  const items = (n: number): PlanItem[] =>
    Array.from({ length: n }, (_, i) => ({ kind: 'lesson' as const, slug: `l${i}` }))

  it('paginates 0, 12, 13, 25 items as [], [12], [12,1], [12,12,1]', () => {
    expect(chunkJournal(items(0))).toEqual([])
    expect(chunkJournal(items(12)).map((p) => p.length)).toEqual([12])
    expect(chunkJournal(items(13)).map((p) => p.length)).toEqual([12, 1])
    expect(chunkJournal(items(25)).map((p) => p.length)).toEqual([12, 12, 1])
  })

  it('preserves item order across pages', () => {
    const pages = chunkJournal(items(13))
    expect(pages[1][0].slug).toBe('l12')
  })

  it('honors a custom page size', () => {
    expect(chunkJournal(items(11), 5).map((p) => p.length)).toEqual([5, 5, 1])
  })
})

describe('real registries', () => {
  it('accepts real site slugs', () => {
    const realValid: PlanValidity = {
      lessons: new Set(LESSONS.map((l) => l.slug)),
      sheets: new Set(GENERATORS.map((g) => g.slug)),
      presets: new Map(GENERATORS.map((g) => [g.slug, new Set(g.presets.map((p) => p.id))])),
      materials: new Set(MATERIALS.map((m) => m.slug)),
    }
    const plan = parsePlan(
      new URLSearchParams('l=golden-beads-intro:mon&s=math-facts.first-facts&m=stamp-game'),
      realValid,
    )
    expect(plan.items).toHaveLength(3)
  })
})
