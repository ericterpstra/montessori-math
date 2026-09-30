import { describe, expect, it } from 'vitest'
import { STRANDS } from '../lib/strands'
import { strandMeta } from './Contents'

describe('strandMeta', () => {
  it('formats a strand as the chapter-head meta', () => {
    expect(strandMeta(STRANDS[0])).toBe('Ages 4–6 · PK–K')
    expect(strandMeta(STRANDS[6])).toBe('Ages 9–12 · 4–6')
  })
})
