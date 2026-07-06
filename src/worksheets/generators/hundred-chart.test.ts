import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def } from './hundred-chart'
import type { FillData, FragmentsData, HundredChartParams } from './hundred-chart'

const SEEDS = [1, 2, 7, 42, 999, 123456]

function fillParams(missing = 30): HundredChartParams {
  return { mode: 'fill', missing, pieces: 6 }
}

function fragParams(pieces = 6): HundredChartParams {
  return { mode: 'fragment', missing: 30, pieces }
}

function genFill(seed: number, missing = 30): FillData {
  const data = def.generate(fillParams(missing), createRng(seed))
  if (data.mode !== 'fill') throw new Error('expected fill data')
  return data
}

function genFrag(seed: number, pieces = 6): FragmentsData {
  const data = def.generate(fragParams(pieces), createRng(seed))
  if (data.mode !== 'fragment') throw new Error('expected fragment data')
  return data
}

describe('hundred-chart fill mode', () => {
  it('lays out all 100 cells with value = index + 1 (reading order)', () => {
    for (const seed of SEEDS) {
      const data = genFill(seed)
      expect(data.cells).toHaveLength(100)
      data.cells.forEach((cell, i) => expect(cell.value).toBe(i + 1))
    }
  })

  it("answer key lists exactly the blank cells' values (index + 1), ascending", () => {
    for (const seed of SEEDS) {
      const data = genFill(seed)
      // Independent recompute: the answer for a blank at chart position i is i + 1.
      const expected = data.cells
        .map((cell, i) => ({ blank: cell.blank, answer: i + 1 }))
        .filter((c) => c.blank)
        .map((c) => c.answer)
      expect(data.answers).toEqual(expected)
      // Ascending & unique
      expect([...data.answers].sort((a, b) => a - b)).toEqual(data.answers)
      expect(new Set(data.answers).size).toBe(data.answers.length)
      // Every answer is a valid chart number
      for (const a of data.answers) {
        expect(a).toBeGreaterThanOrEqual(1)
        expect(a).toBeLessThanOrEqual(100)
      }
    }
  })

  it('blank count equals round(missing% of 100) for every missing setting', () => {
    for (const missing of [10, 25, 30, 47, 55, 70]) {
      for (const seed of SEEDS) {
        const data = genFill(seed, missing)
        const blanks = data.cells.filter((c) => c.blank).length
        expect(blanks).toBe(Math.round(missing))
        expect(data.answers).toHaveLength(Math.round(missing))
      }
    }
  })
})

describe('hundred-chart fragment mode', () => {
  it('piece count honored exactly for every allowed setting', () => {
    for (const pieces of [4, 5, 6, 7, 8]) {
      for (const seed of SEEDS) {
        expect(genFrag(seed, pieces).fragments).toHaveLength(pieces)
      }
    }
  })

  it('each piece prints exactly one anchor number, matching the anchor field', () => {
    for (const seed of SEEDS) {
      for (const piece of genFrag(seed).fragments) {
        const given = piece.cells.filter((c) => c.given)
        expect(given).toHaveLength(1)
        expect(given[0].value).toBe(piece.anchor)
      }
    }
  })

  it('every cell value follows chart geometry from the anchor (±1 across, ±10 down)', () => {
    for (const seed of SEEDS) {
      for (const piece of genFrag(seed).fragments) {
        const anchor = piece.cells.find((c) => c.given)
        expect(anchor).toBeDefined()
        if (!anchor) continue
        for (const cell of piece.cells) {
          // Independent recompute of the answer from the printed number alone.
          const expected = anchor.value + (cell.r - anchor.r) * 10 + (cell.c - anchor.c)
          expect(cell.value).toBe(expected)
        }
      }
    }
  })

  it('pieces stay inside 1–100 and never wrap across a chart edge', () => {
    for (const seed of SEEDS) {
      for (const piece of genFrag(seed).fragments) {
        const anchor = piece.cells.find((c) => c.given)
        if (!anchor) throw new Error('missing anchor')
        // Top-left of the bounding box on the real chart.
        const row0 = Math.floor((anchor.value - 1) / 10) - anchor.r
        const col0 = ((anchor.value - 1) % 10) - anchor.c
        expect(row0).toBeGreaterThanOrEqual(0)
        expect(col0).toBeGreaterThanOrEqual(0)
        expect(row0 + piece.rows).toBeLessThanOrEqual(10)
        expect(col0 + piece.cols).toBeLessThanOrEqual(10)
        for (const cell of piece.cells) {
          expect(cell.value).toBeGreaterThanOrEqual(1)
          expect(cell.value).toBeLessThanOrEqual(100)
          // Column derived from the value must match the piece geometry — no wrap.
          expect((cell.value - 1) % 10).toBe(col0 + cell.c)
          expect(Math.floor((cell.value - 1) / 10)).toBe(row0 + cell.r)
        }
      }
    }
  })

  it('pieces are 4–6 orthogonally connected cells inside their bounding box', () => {
    for (const seed of SEEDS) {
      for (const piece of genFrag(seed).fragments) {
        expect(piece.cells.length).toBeGreaterThanOrEqual(4)
        expect(piece.cells.length).toBeLessThanOrEqual(6)
        for (const cell of piece.cells) {
          expect(cell.r).toBeGreaterThanOrEqual(0)
          expect(cell.r).toBeLessThan(piece.rows)
          expect(cell.c).toBeGreaterThanOrEqual(0)
          expect(cell.c).toBeLessThan(piece.cols)
        }
        // Flood fill from the first cell must reach every cell (solvable from one clue).
        const key = (r: number, c: number) => `${r},${c}`
        const present = new Set(piece.cells.map((c) => key(c.r, c.c)))
        expect(present.size).toBe(piece.cells.length) // no duplicate positions
        const seen = new Set<string>([key(piece.cells[0].r, piece.cells[0].c)])
        const queue = [piece.cells[0]]
        while (queue.length > 0) {
          const cur = queue.pop()
          if (!cur) break
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
            const k = key(cur.r + dr, cur.c + dc)
            if (present.has(k) && !seen.has(k)) {
              seen.add(k)
              const next = piece.cells.find((c) => key(c.r, c.c) === k)
              if (next) queue.push(next)
            }
          }
        }
        expect(seen.size).toBe(piece.cells.length)
      }
    }
  })

  it('pieces on one sheet never overlap on the chart', () => {
    for (const seed of [...SEEDS, 11, 12, 13, 14, 15]) {
      const data = genFrag(seed, 8)
      const all = data.fragments.flatMap((p) => p.cells.map((c) => c.value))
      expect(new Set(all).size).toBe(all.length)
    }
  })
})

describe('hundred-chart determinism and parameter respect', () => {
  it('same seed + params produce identical data (both modes)', () => {
    for (const seed of SEEDS) {
      expect(genFill(seed, 35)).toEqual(genFill(seed, 35))
      expect(genFrag(seed, 7)).toEqual(genFrag(seed, 7))
    }
  })

  it('different seeds produce different sheets (both modes)', () => {
    expect(JSON.stringify(genFill(1))).not.toBe(JSON.stringify(genFill(2)))
    expect(JSON.stringify(genFrag(1))).not.toBe(JSON.stringify(genFrag(2)))
  })

  it('mode parameter selects the puzzle type', () => {
    expect(def.generate(fillParams(), createRng(5)).mode).toBe('fill')
    expect(def.generate(fragParams(), createRng(5)).mode).toBe('fragment')
  })

  it('defaults and presets stay within the declared schema ranges', () => {
    expect(def.defaults.mode).toBe('fill')
    expect(def.defaults.missing).toBeGreaterThanOrEqual(10)
    expect(def.defaults.missing).toBeLessThanOrEqual(70)
    expect(def.defaults.pieces).toBeGreaterThanOrEqual(4)
    expect(def.defaults.pieces).toBeLessThanOrEqual(8)
    const first = def.presets.find((p) => p.id === 'first-fill')
    const puzzles = def.presets.find((p) => p.id === 'chart-puzzles')
    expect(first?.params.mode).toBe('fill')
    expect(first?.params.missing).toBe(20)
    expect(puzzles?.params.mode).toBe('fragment')
    expect(puzzles?.params.pieces).toBe(6)
  })
})
