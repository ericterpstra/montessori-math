import { describe, it, expect } from 'vitest'
import {
  BOARD_SIZE,
  MAX_BEADS,
  beadAtStep,
  beadCount,
  canPlaceColumn,
  checkBuild,
  clearColumns,
  countSequence,
  createBoard,
  discColumn,
  hasBead,
  placeColumn,
  practiceProblem,
  product,
  removeColumn,
  setMultiplicand,
  stepAt,
  tableRows,
} from './model'
import type { BoardState } from './model'

function buildBoard(a: number, b: number): BoardState {
  let s = createBoard(a)
  for (let i = 0; i < b; i++) s = placeColumn(s)
  return s
}

describe('multiplication bead board model', () => {
  it('shows a·b beads after placing b columns of a, for every a and b in 1–10', () => {
    for (let a = 1; a <= BOARD_SIZE; a++) {
      for (let b = 1; b <= BOARD_SIZE; b++) {
        const s = buildBoard(a, b)
        expect(beadCount(s)).toBe(a * b)
        expect(product(s)).toBe(a * b)
      }
    }
  })

  it('never exceeds 100 beads and refuses an eleventh column', () => {
    const full = buildBoard(BOARD_SIZE, BOARD_SIZE)
    expect(beadCount(full)).toBe(MAX_BEADS)
    expect(canPlaceColumn(full)).toBe(false)
    expect(() => placeColumn(full)).toThrow()
    // even a full board of a smaller table cannot go past column 10
    const smaller = buildBoard(3, BOARD_SIZE)
    expect(canPlaceColumn(smaller)).toBe(false)
    expect(beadCount(smaller)).toBeLessThanOrEqual(MAX_BEADS)
  })

  it('starts the red disc above column 1 and keeps it over the last column placed', () => {
    let s = createBoard(6)
    expect(discColumn(s)).toBe(1)
    for (let b = 1; b <= BOARD_SIZE; b++) {
      s = placeColumn(s)
      expect(discColumn(s)).toBe(b)
      expect(discColumn(s)).toBe(s.columns)
    }
  })

  it('count-stepper visits every bead exactly once, ending at bead a·b', () => {
    for (const [a, b] of [
      [4, 3],
      [7, 10],
      [1, 1],
      [10, 10],
      [9, 6],
    ] as const) {
      const s = buildBoard(a, b)
      const seq = countSequence(s)
      expect(seq.length).toBe(a * b)
      const seen = new Set(seq.map((p) => `${p.row},${p.col}`))
      expect(seen.size).toBe(a * b) // no bead visited twice
      for (const p of seq) {
        expect(hasBead(s, p.row, p.col)).toBe(true) // only real beads visited
      }
      // counting runs down each column, left to right, ending at the last bead
      expect(seq[0]).toEqual({ row: 1, col: 1 })
      expect(seq[seq.length - 1]).toEqual({ row: a, col: b })
      expect(beadAtStep(s, a * b)).toEqual({ row: a, col: b })
      expect(() => beadAtStep(s, a * b + 1)).toThrow()
    }
  })

  it('maps board positions to counting steps and back', () => {
    const s = buildBoard(4, 3)
    expect(hasBead(s, 2, 3)).toBe(true)
    expect(hasBead(s, 5, 1)).toBe(false) // below the band of 4
    expect(hasBead(s, 1, 4)).toBe(false) // column not placed yet
    expect(stepAt(s, 1, 1)).toBe(1)
    expect(stepAt(s, 4, 1)).toBe(4)
    expect(stepAt(s, 1, 2)).toBe(5)
    expect(stepAt(s, 4, 3)).toBe(12)
    expect(stepAt(s, 5, 1)).toBe(0) // empty hole has no counting step
    for (let step = 1; step <= beadCount(s); step++) {
      const p = beadAtStep(s, step)
      expect(stepAt(s, p.row, p.col)).toBe(step)
    }
  })

  it('table record mirrors the paper: a×1 up through a×upTo', () => {
    expect(tableRows(4, 0)).toEqual([])
    expect(tableRows(4, 3)).toEqual([
      { multiplier: 1, product: 4 },
      { multiplier: 2, product: 8 },
      { multiplier: 3, product: 12 },
    ])
    const full = tableRows(7, 10)
    expect(full.length).toBe(10)
    expect(full[9]).toEqual({ multiplier: 10, product: 70 })
    expect(() => tableRows(4, 11)).toThrow()
  })

  it('practice problems are seed-deterministic and always within 1–10', () => {
    for (let i = 0; i < 20; i++) {
      const p1 = practiceProblem(42, i)
      const p2 = practiceProblem(42, i)
      expect(p2).toEqual(p1) // same seed + index → same problem
      expect(p1.a).toBeGreaterThanOrEqual(1)
      expect(p1.a).toBeLessThanOrEqual(10)
      expect(p1.b).toBeGreaterThanOrEqual(1)
      expect(p1.b).toBeLessThanOrEqual(10)
    }
    // different seeds produce different problem sequences (not a constant)
    const seqA = Array.from({ length: 10 }, (_, i) => practiceProblem(1, i))
    const seqB = Array.from({ length: 10 }, (_, i) => practiceProblem(2, i))
    expect(seqA).not.toEqual(seqB)
    expect(() => practiceProblem(42, -1)).toThrow()
  })

  it('checkBuild marks the card and the columns honestly, part by part', () => {
    const problem = { a: 7, b: 4 }
    expect(checkBuild(buildBoard(7, 4), problem)).toEqual({
      multiplicandCorrect: true,
      columnsCorrect: true,
      allCorrect: true,
    })
    expect(checkBuild(buildBoard(6, 4), problem)).toEqual({
      multiplicandCorrect: false,
      columnsCorrect: true,
      allCorrect: false,
    })
    expect(checkBuild(buildBoard(7, 5), problem)).toEqual({
      multiplicandCorrect: true,
      columnsCorrect: false,
      allCorrect: false,
    })
    expect(checkBuild(buildBoard(4, 7), problem).allCorrect).toBe(false)
  })

  it('swapping the card resets the beads; take-back and clear behave like the real box', () => {
    const s = buildBoard(4, 3)
    const swapped = setMultiplicand(s, 9)
    expect(swapped).toEqual({ multiplicand: 9, columns: 0 })
    expect(setMultiplicand(s, 4)).toBe(s) // same card → nothing moves
    expect(removeColumn(s)).toEqual({ multiplicand: 4, columns: 2 })
    expect(removeColumn(createBoard(4))).toEqual({ multiplicand: 4, columns: 0 })
    expect(clearColumns(s)).toEqual({ multiplicand: 4, columns: 0 })
    expect(() => createBoard(0)).toThrow()
    expect(() => createBoard(11)).toThrow()
    expect(() => createBoard(2.5)).toThrow()
  })
})
