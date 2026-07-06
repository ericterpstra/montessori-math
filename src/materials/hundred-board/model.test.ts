import { describe, it, expect } from 'vitest'
import {
  ALL_TILES,
  TILE_COUNT,
  emptyPlacements,
  evaluateSkipCount,
  isBoardComplete,
  isCorrectPlacement,
  misplacedCells,
  multiplesOf,
  nextTileInOrder,
  placeTile,
  placedTileSet,
  remainingTilesInOrder,
  remainingTilesShuffled,
  removeTileAt,
  shuffledTileOrder,
} from './model'

describe('placement correctness', () => {
  it('a tile is correct iff its value equals its cell number', () => {
    expect(isCorrectPlacement(37, 37)).toBe(true)
    expect(isCorrectPlacement(37, 73)).toBe(false)
    expect(isCorrectPlacement(1, 1)).toBe(true)
    expect(isCorrectPlacement(100, 100)).toBe(true)
    expect(isCorrectPlacement(100, 99)).toBe(false)
  })

  it('misplacedCells reports exactly the wrong cells, ascending', () => {
    let p = emptyPlacements()
    p = placeTile(p, 5, 5) // correct
    p = placeTile(p, 12, 21) // wrong
    p = placeTile(p, 3, 30) // wrong
    p = placeTile(p, 88, 88) // correct
    expect(misplacedCells(p)).toEqual([3, 12])
  })

  it('placeTile and removeTileAt are immutable and validated', () => {
    const empty = emptyPlacements()
    const one = placeTile(empty, 42, 42)
    expect(empty.size).toBe(0)
    expect(one.get(42)).toBe(42)
    expect(() => placeTile(one, 42, 7)).toThrow() // cell occupied
    expect(() => placeTile(one, 7, 42)).toThrow() // tile already used
    expect(() => placeTile(one, 101, 1)).toThrow() // cell out of range
    expect(() => placeTile(one, 1, 0)).toThrow() // tile out of range
    const back = removeTileAt(one, 42)
    expect(back.size).toBe(0)
    expect(one.get(42)).toBe(42)
    expect(() => removeTileAt(back, 42)).toThrow() // cell empty
  })
})

describe('tray order', () => {
  it('in-order tray offers the lowest unplaced tile next', () => {
    let p = emptyPlacements()
    expect(nextTileInOrder(p)).toBe(1)
    p = placeTile(p, 1, 1)
    p = placeTile(p, 2, 2)
    p = placeTile(p, 4, 4) // 3 skipped
    expect(nextTileInOrder(p)).toBe(3)
    expect(remainingTilesInOrder(p).slice(0, 3)).toEqual([3, 5, 6])
    expect(remainingTilesInOrder(p)).toHaveLength(97)
  })

  it('shuffle is deterministic under seed and a full permutation of 1–100', () => {
    const a = shuffledTileOrder(12345)
    const b = shuffledTileOrder(12345)
    const c = shuffledTileOrder(54321)
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
    expect(a).toHaveLength(TILE_COUNT)
    expect([...a].sort((x, y) => x - y)).toEqual([...ALL_TILES])
    expect(a).not.toEqual([...ALL_TILES]) // vanishingly unlikely to shuffle into order
  })

  it('shuffled tray keeps seeded order and excludes placed tiles', () => {
    const seed = 99
    const order = shuffledTileOrder(seed)
    let p = emptyPlacements()
    p = placeTile(p, 1, order[0]) // tiles land on arbitrary cells; only their values leave the tray
    p = placeTile(p, 2, order[3])
    const placedValues = placedTileSet(p)
    expect(placedValues).toEqual(new Set([order[0], order[3]]))
    const tray = remainingTilesShuffled(p, seed)
    expect(tray).toEqual(order.filter((t) => !placedValues.has(t)))
    expect(tray).toHaveLength(TILE_COUNT - 2)
  })
})

describe('board completion', () => {
  it('board is complete iff all 100 tiles sit on their own cells', () => {
    const perfect = new Map(ALL_TILES.map((t) => [t, t]))
    expect(isBoardComplete(perfect)).toBe(true)

    const missingOne = new Map(perfect)
    missingOne.delete(50)
    expect(isBoardComplete(missingOne)).toBe(false)

    const swapped = new Map(perfect)
    swapped.set(50, 51)
    swapped.set(51, 50)
    expect(isBoardComplete(swapped)).toBe(false)
    expect(misplacedCells(swapped)).toEqual([50, 51])
  })
})

describe('multiples', () => {
  it('multiples of 7 are exactly 7, 14, …, 98', () => {
    const sevens = [...multiplesOf(7)].sort((a, b) => a - b)
    expect(sevens).toEqual([7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98])
  })

  it('multiples sets are exact for every n from 2 to 10', () => {
    for (let n = 2; n <= 10; n++) {
      const set = multiplesOf(n)
      expect(set.size).toBe(Math.floor(TILE_COUNT / n))
      for (const m of set) {
        expect(m % n).toBe(0)
        expect(m).toBeGreaterThanOrEqual(n)
        expect(m).toBeLessThanOrEqual(TILE_COUNT)
      }
      // every multiple in range is present
      for (let m = n; m <= TILE_COUNT; m += n) expect(set.has(m)).toBe(true)
    }
  })
})

describe('skip-count evaluation', () => {
  it('counts hits, misses, and wrong taps exactly', () => {
    // Counting by 3: taps hit 3, 6, 9, wrongly include 10 and 20, and miss the rest.
    const result = evaluateSkipCount(3, [3, 6, 9, 10, 20])
    expect(result.correctHits).toEqual([3, 6, 9])
    expect(result.wrongTaps).toEqual([10, 20])
    expect(result.misses).toEqual([
      12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93,
      96, 99,
    ])
  })

  it('a perfect skip count has no misses and no wrong taps', () => {
    const tens = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    const result = evaluateSkipCount(10, tens)
    expect(result.correctHits).toEqual(tens)
    expect(result.misses).toEqual([])
    expect(result.wrongTaps).toEqual([])
  })

  it('no taps means every multiple is a miss', () => {
    const result = evaluateSkipCount(9, [])
    expect(result.correctHits).toEqual([])
    expect(result.wrongTaps).toEqual([])
    expect(result.misses).toEqual([9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 99])
  })

  it('duplicate taps are counted once', () => {
    const result = evaluateSkipCount(5, [5, 5, 7, 7])
    expect(result.correctHits).toEqual([5])
    expect(result.wrongTaps).toEqual([7])
    expect(result.misses).toHaveLength(19)
  })
})
