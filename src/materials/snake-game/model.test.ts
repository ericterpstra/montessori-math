import { describe, it, expect } from 'vitest'
import {
  addBar,
  canCount,
  countToTen,
  createState,
  proof,
  remainingBeads,
  removeLastBar,
  startPlay,
  sumBars,
  surpriseSnake,
  totalBeads,
} from './model'
import type { SnakeState } from './model'

function buildSnake(values: number[]): SnakeState {
  let state = createState()
  for (const v of values) state = addBar(state, v)
  return state
}

describe('building the snake', () => {
  it('appends colored bars 1–9 in order and rejects bad values', () => {
    const state = buildSnake([3, 7, 1])
    expect(state.snake.map((b) => b.value)).toEqual([3, 7, 1])
    expect(state.snake.every((b) => b.kind === 'colored')).toBe(true)
    expect(remainingBeads(state)).toBe(11)
    expect(() => addBar(state, 0)).toThrow()
    expect(() => addBar(state, 10)).toThrow()
    expect(() => addBar(state, 2.5)).toThrow()
  })

  it('removeLastBar undoes the last bar and is a no-op on an empty snake', () => {
    const state = buildSnake([5, 4])
    expect(removeLastBar(state).snake.map((b) => b.value)).toEqual([5])
    const empty = createState()
    expect(removeLastBar(empty)).toBe(empty)
  })

  it('surpriseSnake is deterministic per seed with 6–10 bars of 1–9 beads', () => {
    const a = surpriseSnake(42)
    const b = surpriseSnake(42)
    expect(a.snake.map((bar) => bar.value)).toEqual(b.snake.map((bar) => bar.value))
    for (let seed = 1; seed <= 25; seed++) {
      const s = surpriseSnake(seed)
      expect(s.snake.length).toBeGreaterThanOrEqual(6)
      expect(s.snake.length).toBeLessThanOrEqual(10)
      expect(s.snake.every((bar) => bar.kind === 'colored' && bar.value >= 1 && bar.value <= 9)).toBe(true)
    }
  })

  it('refuses to add bars or undo once counting starts', () => {
    const playing = startPlay(buildSnake([6, 4, 5]))
    expect(playing.phase).toBe('play')
    expect(() => addBar(playing, 3)).toThrow()
    expect(removeLastBar(playing)).toBe(playing)
    expect(() => startPlay(playing)).toThrow()
  })

  it('a snake under 10 beads is done before any counting', () => {
    const tiny = startPlay(buildSnake([4, 3]))
    expect(tiny.phase).toBe('done')
    expect(canCount(tiny)).toBe(false)
    expect(() => countToTen(tiny)).toThrow()
    expect(() => startPlay(createState())).toThrow()
  })
})

describe('countToTen — worked example [9, 4, 6, 8, 3] (total 30)', () => {
  it('walks the snake exchanging tens, bridging remainders, and preserving the total', () => {
    let state = startPlay(buildSnake([9, 4, 6, 8, 3]))
    expect(totalBeads(state)).toBe(30)

    // Pass 1: 9 + 4 = 13 → one golden ten, bridge 3 at the head.
    state = countToTen(state)
    expect(state.lastStep?.taken.map((b) => b.value)).toEqual([9, 4])
    expect(state.lastStep?.count).toBe(13)
    expect(state.lastStep?.remainder).toBe(3)
    expect(state.golden).toBe(1)
    expect(state.snake.map((b) => `${b.kind}:${b.value}`)).toEqual(['bridge:3', 'colored:6', 'colored:8', 'colored:3'])
    expect(sumBars(state.setAside)).toBe(13)
    expect(totalBeads(state)).toBe(30)
    // Mid-game proof is already honest: 13 set aside = 1 golden ten + bridge 3.
    const mid = proof(state)
    expect(mid.matches).toBe(true)
    expect(mid.goldenBars).toBe(1)
    expect(mid.bridgeValue).toBe(3)

    // Pass 2: bridge 3 + 6 + 8 = 17 → second golden ten, new bridge 7.
    // The consumed bridge returns to the box, NOT the set-aside tray.
    state = countToTen(state)
    expect(state.lastStep?.taken.map((b) => `${b.kind}:${b.value}`)).toEqual(['bridge:3', 'colored:6', 'colored:8'])
    expect(state.lastStep?.remainder).toBe(7)
    expect(state.golden).toBe(2)
    expect(state.snake.map((b) => `${b.kind}:${b.value}`)).toEqual(['bridge:7', 'colored:3'])
    expect(state.setAside.every((b) => b.kind === 'colored')).toBe(true)
    expect(sumBars(state.setAside)).toBe(27)
    expect(totalBeads(state)).toBe(30)
    expect(state.phase).toBe('play') // exactly 10 beads remain

    // Pass 3: bridge 7 + 3 = 10 exactly → no bridge, snake exhausted, done.
    state = countToTen(state)
    expect(state.lastStep?.count).toBe(10)
    expect(state.lastStep?.remainder).toBe(0)
    expect(state.lastStep?.bridge).toBeNull()
    expect(state.golden).toBe(3)
    expect(state.snake).toEqual([])
    expect(state.phase).toBe('done')
    expect(totalBeads(state)).toBe(30)

    const final = proof(state)
    expect(final.setAsideBeads).toBe(30)
    expect(final.tensInSetAside).toBe(3)
    expect(final.leftoverInSetAside).toBe(0)
    expect(final.goldenBars).toBe(3)
    expect(final.bridgeValue).toBe(0)
    expect(final.matches).toBe(true)
  })

  it('a snake of exact tens needs no bridges at any pass', () => {
    let state = startPlay(buildSnake([1, 9, 2, 8, 5, 5]))
    let passes = 0
    while (canCount(state)) {
      state = countToTen(state)
      passes++
      expect(state.lastStep?.count).toBe(10)
      expect(state.lastStep?.remainder).toBe(0)
      expect(state.lastStep?.bridge).toBeNull()
      expect(state.snake.some((b) => b.kind === 'bridge')).toBe(false)
    }
    expect(passes).toBe(3)
    expect(state.golden).toBe(3)
    expect(remainingBeads(state)).toBe(0)
    expect(state.phase).toBe('done')
  })
})

describe('invariants over many seeded surprise snakes', () => {
  it('preserves 10·golden + remaining === original at every step, for 30 seeds', () => {
    for (let seed = 1; seed <= 30; seed++) {
      let state = startPlay(surpriseSnake(seed))
      const original = totalBeads(state)
      let guard = 0
      while (canCount(state)) {
        state = countToTen(state)
        guard++
        expect(guard).toBeLessThan(100)
        // The step consumed at least one bar and counted to 10 or past it.
        expect(state.lastStep!.taken.length).toBeGreaterThanOrEqual(1)
        expect(state.lastStep!.count).toBeGreaterThanOrEqual(10)
        // Bridge bar values are always 1–9.
        if (state.lastStep!.bridge) {
          expect(state.lastStep!.bridge.value).toBeGreaterThanOrEqual(1)
          expect(state.lastStep!.bridge.value).toBeLessThanOrEqual(9)
        }
        // At most one bridge in the snake, and only ever at the head.
        const bridgeCount = state.snake.filter((b) => b.kind === 'bridge').length
        expect(bridgeCount).toBeLessThanOrEqual(1)
        if (bridgeCount === 1) expect(state.snake[0].kind).toBe('bridge')
        // Only original colored bars ever reach the set-aside tray.
        expect(state.setAside.every((b) => b.kind === 'colored')).toBe(true)
        // The invariant: nothing is created or lost by the exchange.
        expect(10 * state.golden + remainingBeads(state)).toBe(original)
      }
      // Done state: fewer than 10 beads remain, and the proof recount matches.
      expect(state.phase).toBe('done')
      expect(remainingBeads(state)).toBeLessThan(10)
      expect(10 * state.golden + remainingBeads(state)).toBe(original)
      const p = proof(state)
      expect(p.matches).toBe(true)
      expect(p.setAsideBeads).toBe(10 * p.goldenBars + p.bridgeValue)
      expect(p.tensInSetAside).toBe(p.goldenBars)
      expect(p.leftoverInSetAside).toBe(p.bridgeValue)
    }
  })
})
