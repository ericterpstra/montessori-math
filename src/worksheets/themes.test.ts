import { describe, expect, it } from 'vitest'
import { SHEET_THEMES, THEME_LABELS, isSheetTheme } from './themes'

describe('sheet themes: data contract', () => {
  it("SHEET_THEMES is exactly ['none', 'space', 'baking', 'dinos'] with 'none' first", () => {
    expect(SHEET_THEMES).toEqual(['none', 'space', 'baking', 'dinos'])
    expect(SHEET_THEMES[0]).toBe('none')
    expect(SHEET_THEMES).toHaveLength(4)
  })

  it('every theme has a non-empty human label', () => {
    for (const t of SHEET_THEMES) {
      expect(THEME_LABELS[t].trim().length).toBeGreaterThan(0)
    }
    expect(THEME_LABELS.none).toBe('None')
    expect(THEME_LABELS.dinos).toBe('Dinosaurs')
  })

  it('isSheetTheme accepts every theme and rejects null, empty, unknown, and wrong-case values', () => {
    for (const t of SHEET_THEMES) {
      expect(isSheetTheme(t)).toBe(true)
    }
    expect(isSheetTheme(null)).toBe(false)
    expect(isSheetTheme('')).toBe(false)
    expect(isSheetTheme('pirates')).toBe(false)
    expect(isSheetTheme('Space')).toBe(false)
  })
})
