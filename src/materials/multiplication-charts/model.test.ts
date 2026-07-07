import { describe, it, expect } from 'vitest'
import {
  cellKey,
  checkPlacements,
  createWorkingState,
  fact,
  isComplete,
  multiplicationChart1,
  multiplicationChart2,
  placeTile,
  removeTile,
} from './model'
import type { WorkingState } from './model'

function fillCorrectly(): WorkingState {
  let s = createWorkingState()
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) s = placeTile(s, a, b, fact(a, b))
  return s
}

describe('multiplication charts model', () => {
  it('chart 1 holds all 81 facts in row-major order', () => {
    const cells = multiplicationChart1()
    expect(cells.length).toBe(81)
    expect(cells[0]).toEqual({ a: 1, b: 1, value: 1 })
    expect(cells[cells.length - 1]).toEqual({ a: 9, b: 9, value: 81 })
    expect(cells.find((c) => c.a === 7 && c.b === 8)?.value).toBe(56)
    for (const c of cells) expect(c.value).toBe(c.a * c.b)
  })

  it('chart 2 keeps exactly the 45 a ≤ b facts', () => {
    const cells = multiplicationChart2()
    expect(cells.length).toBe(45)
    expect(cells).toContainEqual({ a: 7, b: 8, value: 56 })
    expect(cells.some((c) => c.a === 8 && c.b === 7)).toBe(false)
    for (let a = 1; a <= 9; a++) expect(cells).toContainEqual({ a, b: a, value: a * a })
  })

  it('the bank starts with one tile per fact — 81 tiles, sorted, right multiset', () => {
    const s = createWorkingState()
    expect(s.bank.length).toBe(81)
    expect([...s.bank]).toEqual([...s.bank].sort((x, y) => x - y))
    expect(s.placed.size).toBe(0)
    expect([...s.bank]).toEqual(multiplicationChart1().map((c) => c.value).sort((x, y) => x - y))
    expect(s.bank.filter((t) => t === 12).length).toBe(4) // 2×6, 6×2, 3×4, 4×3
    expect(s.bank.filter((t) => t === 36).length).toBe(3) // 4×9, 9×4, 6×6
    expect(s.bank.filter((t) => t === 1).length).toBe(1)
    expect(s.bank.filter((t) => t === 81).length).toBe(1)
  })

  it('placeTile moves one tile from bank to an empty cell', () => {
    const fresh = createWorkingState()
    expect(fresh.bank.filter((t) => t === 56).length).toBe(2) // (7,8) and (8,7)
    const s = placeTile(fresh, 7, 8, 56)
    expect(s.placed.get('7,8')).toBe(56)
    expect(s.bank.length).toBe(80)
    expect(s.bank.filter((t) => t === 56).length).toBe(1)
  })

  it('placeTile rejects an occupied cell and a tile not in the bank', () => {
    const fresh = createWorkingState()
    const s = placeTile(fresh, 7, 8, 56)
    expect(placeTile(s, 7, 8, 42)).toBe(s)
    expect(placeTile(fresh, 1, 1, 11)).toBe(fresh) // 11 is prime > 9, never a product here
    // place all four 12-tiles; a fifth attempt finds no 12 left in the bank
    let four = fresh
    four = placeTile(four, 2, 6, 12)
    four = placeTile(four, 6, 2, 12)
    four = placeTile(four, 3, 4, 12)
    four = placeTile(four, 4, 3, 12)
    expect(four.bank.filter((t) => t === 12).length).toBe(0)
    expect(placeTile(four, 1, 1, 12)).toBe(four)
  })

  it('removeTile puts the tile back and keeps the bank sorted', () => {
    const placed = placeTile(createWorkingState(), 7, 8, 56)
    const s = removeTile(placed, 7, 8)
    expect(s.bank.length).toBe(81)
    expect([...s.bank]).toEqual([...s.bank].sort((x, y) => x - y))
    expect(s.placed.size).toBe(0)
    expect(removeTile(s, 3, 3)).toBe(s)
  })

  it('checkPlacements flags exactly the wrong cells', () => {
    let s = createWorkingState()
    s = placeTile(s, 2, 2, 4)
    s = placeTile(s, 3, 3, 9)
    s = placeTile(s, 9, 9, 81)
    s = placeTile(s, 4, 5, 24) // fact is 20
    s = placeTile(s, 6, 7, 48) // fact is 42
    const check = checkPlacements(s)
    expect(check.correct).toEqual([
      [2, 2],
      [3, 3],
      [9, 9],
    ])
    expect(check.wrong).toEqual([
      [4, 5],
      [6, 7],
    ])
  })

  it('isComplete only when all 81 tiles are placed correctly', () => {
    expect(isComplete(createWorkingState())).toBe(false)
    const full = fillCorrectly()
    expect(isComplete(full)).toBe(true)
    expect(full.bank.length).toBe(0)
    // swap fixture: 2 on (1,1) (fact 1) and 1 on (1,2) (fact 2), rest correct
    let swapped = createWorkingState()
    swapped = placeTile(swapped, 1, 1, 2)
    swapped = placeTile(swapped, 1, 2, 1)
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        if (a === 1 && (b === 1 || b === 2)) continue
        swapped = placeTile(swapped, a, b, fact(a, b))
      }
    }
    expect(swapped.placed.size).toBe(81)
    expect(isComplete(swapped)).toBe(false)
    expect(checkPlacements(swapped).wrong).toEqual([
      [1, 1],
      [1, 2],
    ])
  })

  it('out-of-range coordinates throw', () => {
    const s = createWorkingState()
    expect(() => placeTile(s, 0, 5, 7)).toThrow()
    expect(() => placeTile(s, 10, 1, 7)).toThrow()
    expect(() => cellKey(2.5, 3)).toThrow()
    expect(() => fact(1, 10)).toThrow()
  })
})
