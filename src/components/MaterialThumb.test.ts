import { describe, expect, it } from 'vitest'
import { MATERIALS } from '../materials/registry'
import { THUMB_ART, THUMB_GLYPHS, hasThumb } from './MaterialThumb'

describe('MaterialThumb coverage', () => {
  it('draws a plate for every registered material', () => {
    const missing = MATERIALS.map((m) => m.slug).filter((slug) => !hasThumb(slug))
    expect(missing).toEqual([])
  })

  it('has the sheet, kit and album glyphs', () => {
    for (const g of THUMB_GLYPHS) expect(hasThumb(g), g).toBe(true)
  })

  it('has no drawing for unknown slugs or inherited keys (they get the fallback plate)', () => {
    expect(hasThumb('no-such-material')).toBe(false)
    expect(hasThumb('toString')).toBe(false)
  })

  it('holds exactly the materials plus the three glyphs (no stale drawings)', () => {
    expect(Object.keys(THUMB_ART).sort()).toEqual([...MATERIALS.map((m) => m.slug), ...THUMB_GLYPHS].sort())
  })
})
