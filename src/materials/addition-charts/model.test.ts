import { describe, it, expect } from 'vitest'
import {
  additionChart1,
  additionChart2,
  cellKey,
  checkPlacements,
  createWorkingState,
  fact,
  isComplete,
  placeTile,
  removeTile,
} from './model'
import type { WorkingState } from './model'

function fillCorrectly(): WorkingState {
  let s = createWorkingState()
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) s = placeTile(s, a, b, fact(a, b))
  return s
}

describe('addition charts model', () => {
  it('chart 1 holds all 81 facts in row-major order', () => {
    const cells = additionChart1()
    expect(cells.length).toBe(81)
    expect(cells[0]).toEqual({ a: 1, b: 1, value: 2 })
    expect(cells[cells.length - 1]).toEqual({ a: 9, b: 9, value: 18 })
    expect(cells.find((c) => c.a === 7 && c.b === 8)?.value).toBe(15)
    for (const c of cells) expect(c.value).toBe(c.a + c.b)
  })

  it('chart 2 keeps exactly the 45 a ≤ b facts', () => {
    const cells = additionChart2()
    expect(cells.length).toBe(45)
    expect(cells).toContainEqual({ a: 7, b: 8, value: 15 })
    expect(cells.some((c) => c.a === 8 && c.b === 7)).toBe(false)
    for (let a = 1; a <= 9; a++) expect(cells).toContainEqual({ a, b: a, value: a + a })
  })

  it('the bank starts with one tile per fact — 81 tiles, sorted, right multiset', () => {
    const s = createWorkingState()
    expect(s.bank.length).toBe(81)
    expect([...s.bank]).toEqual([...s.bank].sort((x, y) => x - y))
    expect(s.placed.size).toBe(0)
    expect([...s.bank]).toEqual(additionChart1().map((c) => c.value).sort((x, y) => x - y))
    expect(s.bank.filter((t) => t === 2).length).toBe(1)
    expect(s.bank.filter((t) => t === 10).length).toBe(9)
    expect(s.bank.filter((t) => t === 18).length).toBe(1)
  })

  it('placeTile moves one tile from bank to an empty cell', () => {
    const fresh = createWorkingState()
    expect(fresh.bank.filter((t) => t === 15).length).toBe(4)
    const s = placeTile(fresh, 7, 8, 15)
    expect(s.placed.get('7,8')).toBe(15)
    expect(s.bank.length).toBe(80)
    expect(s.bank.filter((t) => t === 15).length).toBe(3)
  })

  it('placeTile rejects an occupied cell and a tile not in the bank', () => {
    const fresh = createWorkingState()
    const s = placeTile(fresh, 7, 8, 15)
    expect(placeTile(s, 7, 8, 10)).toBe(s)
    expect(placeTile(fresh, 1, 1, 1)).toBe(fresh)
    // place all four 15-tiles; a fifth attempt finds no 15 left in the bank
    let four = fresh
    four = placeTile(four, 6, 9, 15)
    four = placeTile(four, 7, 8, 15)
    four = placeTile(four, 8, 7, 15)
    four = placeTile(four, 9, 6, 15)
    expect(four.bank.filter((t) => t === 15).length).toBe(0)
    expect(placeTile(four, 1, 1, 15)).toBe(four)
  })

  it('removeTile puts the tile back and keeps the bank sorted', () => {
    const placed = placeTile(createWorkingState(), 7, 8, 15)
    const s = removeTile(placed, 7, 8)
    expect(s.bank.length).toBe(81)
    expect([...s.bank]).toEqual([...s.bank].sort((x, y) => x - y))
    expect(s.placed.size).toBe(0)
    expect(removeTile(s, 3, 3)).toBe(s)
  })

  it('checkPlacements flags exactly the wrong cells', () => {
    let s = createWorkingState()
    s = placeTile(s, 1, 1, 2)
    s = placeTile(s, 2, 3, 5)
    s = placeTile(s, 9, 9, 18)
    s = placeTile(s, 4, 4, 9) // fact is 8
    s = placeTile(s, 5, 6, 12) // fact is 11
    const check = checkPlacements(s)
    expect(check.correct).toEqual([
      [1, 1],
      [2, 3],
      [9, 9],
    ])
    expect(check.wrong).toEqual([
      [4, 4],
      [5, 6],
    ])
  })

  it('isComplete only when all 81 tiles are placed correctly', () => {
    expect(isComplete(createWorkingState())).toBe(false)
    const full = fillCorrectly()
    expect(isComplete(full)).toBe(true)
    expect(full.bank.length).toBe(0)
    // swap fixture: 3 on (1,1) and 2 on (1,2), rest correct
    let swapped = createWorkingState()
    swapped = placeTile(swapped, 1, 1, 3)
    swapped = placeTile(swapped, 1, 2, 2)
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
