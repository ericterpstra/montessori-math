import { describe, expect, it } from 'vitest'
import { AGE_BANDS, overlapsBand } from './ageBands'
import { hasThumb } from '../components/MaterialThumb'

describe('age bands', () => {
  it('are the three bands, in order, with unique ids', () => {
    expect(AGE_BANDS.map((b) => b.id)).toEqual(['4-6', '6-9', '9-12'])
  })

  it('each shows a signature material that has a plate', () => {
    for (const b of AGE_BANDS) expect(hasThumb(b.thumb), b.id).toBe(true)
  })

  it('overlapsBand is inclusive at both ends', () => {
    const band = AGE_BANDS[1] // 6–9
    expect(overlapsBand([4, 6], band)).toBe(true)
    expect(overlapsBand([9, 12], band)).toBe(true)
    expect(overlapsBand([7, 8], band)).toBe(true)
    expect(overlapsBand([4, 5], band)).toBe(false)
    expect(overlapsBand([10, 12], band)).toBe(false)
  })
})
