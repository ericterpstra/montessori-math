import { describe, it, expect } from 'vitest'
import { playClink, playSlide, playTap, setSoundEnabled, soundEnabled } from './sound'

describe('sound in a windowless (node) environment', () => {
  it('defaults to enabled', () => {
    expect(soundEnabled()).toBe(true)
  })

  it('every play function is a silent no-op that never throws', () => {
    expect(() => {
      playClink()
      playTap()
      playSlide()
    }).not.toThrow()
  })

  it('setSoundEnabled/soundEnabled round-trips and plays stay safe while muted', () => {
    setSoundEnabled(false)
    expect(soundEnabled()).toBe(false)
    expect(() => playClink()).not.toThrow()
    setSoundEnabled(true)
    expect(soundEnabled()).toBe(true)
  })
})
