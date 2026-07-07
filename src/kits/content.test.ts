import { describe, expect, it } from 'vitest'
import { KITS, kitBySlug, kitsForMaterial } from './registry'
import { MATERIALS } from '../materials/registry'
import { ALL_TILES } from '../materials/hundred-board/model'
import { CARD_VALUES, PAGES, cardWidthIn } from './kits/large-number-cards'
import { STRIP_UNIT_IN, naturalSegments, stripWidthIn } from './kits/strip-boards'
import { TILE_VALUES } from './kits/hundred-board-tiles'
import { STAMP_PLACES, TILES_PER_PAGE } from './kits/stamp-game-tiles'
import { BEAD_CARD_COUNTS } from './kits/golden-bead-cards'
import { BILLS_PER_DENOM, DENOMINATIONS } from './kits/play-money'
import { CIRCLE_FAMILIES } from './kits/paper-fraction-circles'

describe('kits registry', () => {
  it('has the seven wave-2 kits', () => {
    expect(KITS.length).toBe(7)
    expect(kitBySlug('stamp-game-tiles')?.name).toBe('Stamp Game Tiles')
    expect(kitBySlug('nope')).toBeUndefined()
  })

  it('slugs are unique', () => {
    expect(new Set(KITS.map((k) => k.slug)).size).toBe(KITS.length)
  })

  it('every kit fills every field', () => {
    for (const kit of KITS) {
      expect(kit.slug.trim(), kit.slug).not.toBe('')
      expect(kit.name.trim(), kit.slug).not.toBe('')
      expect(kit.description.trim(), kit.slug).not.toBe('')
      expect(kit.pieces.trim(), kit.slug).not.toBe('')
      expect(kit.assembly.length, kit.slug).toBeGreaterThan(0)
      for (const step of kit.assembly) {
        expect(step.trim(), kit.slug).not.toBe('')
      }
      expect(kit.forMaterials.length, kit.slug).toBeGreaterThan(0)
      expect(typeof kit.Pages, kit.slug).toBe('function')
    }
  })

  it('every forMaterials slug resolves against MATERIALS', () => {
    for (const kit of KITS) {
      for (const slug of kit.forMaterials) {
        expect(
          MATERIALS.some((m) => m.slug === slug),
          `${kit.slug} → ${slug}`,
        ).toBe(true)
      }
    }
  })

  it('kitsForMaterial looks up from the material side', () => {
    const stampGame = kitsForMaterial('stamp-game').map((k) => k.slug)
    expect(stampGame).toContain('stamp-game-tiles')
    expect(stampGame).toContain('play-money')
    const goldenBeads = kitsForMaterial('golden-beads').map((k) => k.slug)
    expect(goldenBeads).toContain('golden-bead-cards')
    expect(goldenBeads).toContain('large-number-cards')
    expect(goldenBeads).toContain('play-money')
    expect(kitsForMaterial('checkerboard')).toEqual([])
  })
})

describe('large number cards', () => {
  it('has all 36 card values in order', () => {
    expect(CARD_VALUES.length).toBe(36)
    expect(CARD_VALUES[0]).toBe(1)
    expect(CARD_VALUES).toContain(90)
    expect(CARD_VALUES).toContain(600)
    expect(CARD_VALUES).toContain(9000)
    for (let i = 1; i < CARD_VALUES.length; i++) {
      expect(CARD_VALUES[i]).toBeGreaterThan(CARD_VALUES[i - 1])
    }
  })

  it('card width is 1.5in per digit', () => {
    expect(cardWidthIn(7)).toBe(1.5)
    expect(cardWidthIn(40)).toBe(3)
    expect(cardWidthIn(600)).toBeCloseTo(4.5)
    expect(cardWidthIn(9000)).toBe(6)
  })

  it('page manifest covers every card exactly once', () => {
    expect(PAGES.flat().sort((a, b) => a - b)).toEqual(CARD_VALUES)
  })
})

describe('strip boards', () => {
  it('strip n is n half-inches wide', () => {
    expect(STRIP_UNIT_IN).toBe(0.5)
    expect(stripWidthIn(1)).toBe(0.5)
    expect(stripWidthIn(9)).toBe(4.5)
    expect(stripWidthIn(17)).toBe(8.5)
    for (let n = 1; n <= 17; n++) {
      expect(stripWidthIn(n)).toBeCloseTo(n * 0.5)
    }
  })

  it('long natural strips split into printable taped segments', () => {
    expect(naturalSegments(9)).toEqual([9])
    expect(naturalSegments(15)).toEqual([15])
    expect(naturalSegments(16)).toEqual([9, 7])
    expect(naturalSegments(17)).toEqual([9, 8])
    for (let n = 1; n <= 17; n++) {
      const segments = naturalSegments(n)
      expect(segments.reduce((a, b) => a + b, 0)).toBe(n)
      for (const seg of segments) {
        expect(seg).toBeLessThanOrEqual(15)
      }
    }
  })
})

describe('hundred board tiles', () => {
  it('tiles run 1..100 and match the virtual material', () => {
    expect(TILE_VALUES.length).toBe(100)
    expect(TILE_VALUES[0]).toBe(1)
    expect(TILE_VALUES[99]).toBe(100)
    expect(TILE_VALUES).toEqual([...ALL_TILES])
  })
})

describe('fixed piece inventories', () => {
  it('stamp tiles: four places, 48 per page, B&W tags', () => {
    expect(STAMP_PLACES.map((p) => p.value)).toEqual([1, 10, 100, 1000])
    expect(STAMP_PLACES.map((p) => p.tag)).toEqual(['U', 'T', 'H', 'Th'])
    expect(TILES_PER_PAGE).toBe(48)
  })

  it('bead cards: nine of each place', () => {
    expect(BEAD_CARD_COUNTS).toEqual({ unit: 9, ten: 9, hundred: 9, thousand: 9 })
  })

  it('play money: three denominations, ten bills each', () => {
    expect([...DENOMINATIONS]).toEqual([1, 10, 100])
    expect(BILLS_PER_DENOM).toBe(10)
  })

  it('fraction circles: whole through tenths, 55 sectors', () => {
    expect(CIRCLE_FAMILIES).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(CIRCLE_FAMILIES.reduce((a, b) => a + b, 0)).toBe(55)
  })
})
