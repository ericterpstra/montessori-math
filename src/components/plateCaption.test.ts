import { describe, expect, it } from 'vitest'
import { MAT_PHRASE, plateCaption } from './plateCaption'
import { MATERIALS } from '../materials/registry'

describe('plateCaption', () => {
  it('names the material and its surface', () => {
    expect(plateCaption('Golden Beads & Mat', 'felt')).toBe('Golden Beads & Mat, on the felt work mat.')
    expect(plateCaption('Stamp Game', 'wood')).toBe('Stamp Game, on the wooden table.')
    expect(plateCaption('Hundred Board', 'paper')).toBe('Hundred Board, on paper.')
  })

  it('stands alone, capitalised, without a name', () => {
    expect(plateCaption(null, 'felt')).toBe('On the felt work mat.')
    expect(plateCaption('   ', 'wood')).toBe('On the wooden table.')
  })

  it('has a phrase for every surface', () => {
    for (const mat of ['felt', 'wood', 'paper'] as const) expect(MAT_PHRASE[mat]).toMatch(/^on /)
  })

  it('reads cleanly for every registered material', () => {
    for (const m of MATERIALS) {
      const caption = plateCaption(m.name, 'felt')
      expect(caption.startsWith(`${m.name}, `)).toBe(true)
      expect(caption.endsWith('.')).toBe(true)
      expect(caption).not.toMatch(/\.\.$/)
    }
  })
})
