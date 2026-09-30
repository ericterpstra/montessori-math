import { describe, expect, it } from 'vitest'
import { ICON_NAMES, IconGlyph } from './Icon'

describe('Icon set', () => {
  it('is the 14-glyph album line set, each name once', () => {
    expect(ICON_NAMES).toEqual([
      'print',
      'refresh',
      'sound',
      'sound-off',
      'focus',
      'close',
      'play',
      'book',
      'pencil',
      'scissors',
      'link',
      'help',
      'chevron',
      'arrow',
    ])
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length)
  })

  it('has a drawing for every name', () => {
    for (const name of ICON_NAMES) {
      expect(IconGlyph({ name })).toBeTruthy()
    }
  })
})

describe('no emoji icons in src/', () => {
  // Every source and stylesheet as raw text (Vite glob, so no Node types needed).
  const files = import.meta.glob<string>(['../**/*.{ts,tsx,css}', '!../**/*.test.{ts,tsx}'], {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  // Pictographic emoji, the emoji variation selector, and the two glyphs the
  // material toolbar used as icons (U+26F6 and U+2715). Text marks the
  // materials rely on (✓ ✗ ✂ × ÷ → −) are allowed.
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{FE0F}\u{26F6}\u{2715}]/u

  it('scans the whole source tree', () => {
    expect(Object.keys(files).length).toBeGreaterThan(100)
  })

  it('finds no emoji: use <Icon> with a text label instead', () => {
    const offenders = Object.entries(files)
      .filter(([, text]) => EMOJI.test(text))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })
})
