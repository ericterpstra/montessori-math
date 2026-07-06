import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def } from './math-facts'
import type { MathFactProblem, MathFactsParams, OperationParam } from './math-facts'

const SEEDS = [1, 7, 42, 1234, 987654] as const
const ALL_OPERATIONS: OperationParam[] = ['add', 'subtract', 'multiply', 'divide', 'mixed']
const SINGLE_OPERATIONS: OperationParam[] = ['add', 'subtract', 'multiply', 'divide']

function gen(overrides: Partial<MathFactsParams> = {}, seed = 42) {
  const params: MathFactsParams = { ...def.defaults, ...overrides }
  return { params, data: def.generate(params, createRng(seed)) }
}

/** Recompute the answer independently of the generator. */
function recompute(p: MathFactProblem): number {
  switch (p.op) {
    case 'add':
      return p.a + p.b
    case 'subtract':
      return p.a - p.b
    case 'multiply':
      return p.a * p.b
    case 'divide':
      return p.a / p.b
  }
}

/** Solve for the blank using only the two visible numbers, as a child would. */
function solveForBlank(p: MathFactProblem): number {
  if (p.blank === 'answer') return recompute(p)
  switch (p.op) {
    case 'add':
      return p.blank === 'a' ? p.answer - p.b : p.answer - p.a
    case 'subtract':
      return p.blank === 'a' ? p.answer + p.b : p.a - p.answer
    case 'multiply':
      return p.blank === 'a' ? p.answer / p.b : p.answer / p.a
    case 'divide':
      return p.blank === 'a' ? p.answer * p.b : p.a / p.answer
  }
}

describe('math-facts: answer-key correctness', () => {
  it('every problem answer recomputes correctly across all operations and seeds', () => {
    for (const operation of ALL_OPERATIONS) {
      for (const seed of SEEDS) {
        const { data } = gen({ operation, count: 40, missing: 'mixed' }, seed)
        for (const p of data.problems) {
          expect(recompute(p)).toBe(p.answer)
          expect(Number.isInteger(p.answer)).toBe(true)
          expect(p.blankValue).toBe(p.blank === 'a' ? p.a : p.blank === 'b' ? p.b : p.answer)
        }
      }
    }
  })

  it('subtraction never goes negative', () => {
    for (const seed of SEEDS) {
      const { data } = gen({ operation: 'subtract', count: 60 }, seed)
      for (const p of data.problems) {
        expect(p.a).toBeGreaterThanOrEqual(p.b)
        expect(p.answer).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('division is always exact with divisor and quotient at least 1', () => {
    for (const seed of SEEDS) {
      const { data } = gen({ operation: 'divide', count: 60 }, seed)
      for (const p of data.problems) {
        expect(p.b).toBeGreaterThanOrEqual(1)
        expect(p.a % p.b).toBe(0)
        expect(p.answer).toBeGreaterThanOrEqual(1)
      }
    }
  })
})

describe('math-facts: parameter respect', () => {
  it('honors count exactly', () => {
    for (const count of [10, 23, 47, 60]) {
      const { data } = gen({ count })
      expect(data.problems).toHaveLength(count)
    }
  })

  it('honors the operation parameter', () => {
    for (const operation of SINGLE_OPERATIONS) {
      for (const seed of SEEDS) {
        const { data } = gen({ operation, count: 30 }, seed)
        for (const p of data.problems) expect(p.op).toBe(operation)
      }
    }
  })

  it('mixed operation produces more than one operation type', () => {
    for (const seed of SEEDS) {
      const { data } = gen({ operation: 'mixed', count: 60 }, seed)
      const ops = new Set(data.problems.map((p) => p.op))
      expect(ops.size).toBeGreaterThan(1)
    }
  })

  it('honors maxOperand for every operation', () => {
    for (const maxOperand of [5, 12]) {
      for (const seed of SEEDS) {
        const add = gen({ operation: 'add', maxOperand, count: 60 }, seed).data
        for (const p of add.problems) {
          expect(p.a).toBeGreaterThanOrEqual(0)
          expect(p.a).toBeLessThanOrEqual(maxOperand)
          expect(p.b).toBeGreaterThanOrEqual(0)
          expect(p.b).toBeLessThanOrEqual(maxOperand)
        }
        const sub = gen({ operation: 'subtract', maxOperand, count: 60 }, seed).data
        for (const p of sub.problems) {
          expect(p.b).toBeLessThanOrEqual(maxOperand)
          expect(p.answer).toBeLessThanOrEqual(maxOperand)
          expect(p.a).toBeLessThanOrEqual(2 * maxOperand)
        }
        const mul = gen({ operation: 'multiply', maxOperand, count: 60 }, seed).data
        for (const p of mul.problems) {
          expect(p.a).toBeGreaterThanOrEqual(1)
          expect(p.a).toBeLessThanOrEqual(maxOperand)
          expect(p.b).toBeGreaterThanOrEqual(1)
          expect(p.b).toBeLessThanOrEqual(maxOperand)
        }
        const div = gen({ operation: 'divide', maxOperand, count: 60 }, seed).data
        for (const p of div.problems) {
          expect(p.b).toBeGreaterThanOrEqual(1)
          expect(p.b).toBeLessThanOrEqual(maxOperand)
          expect(p.answer).toBeGreaterThanOrEqual(1)
          expect(p.answer).toBeLessThanOrEqual(maxOperand)
          expect(p.a).toBeLessThanOrEqual(maxOperand * maxOperand)
        }
      }
    }
  })

  it('missing=answer blanks only the answer', () => {
    for (const seed of SEEDS) {
      const { data } = gen({ operation: 'mixed', missing: 'answer', count: 40 }, seed)
      for (const p of data.problems) expect(p.blank).toBe('answer')
    }
  })

  it('missing=operand blanks only operands, each with a unique solution', () => {
    for (const operation of SINGLE_OPERATIONS) {
      for (const seed of SEEDS) {
        const { data } = gen({ operation, missing: 'operand', count: 40 }, seed)
        for (const p of data.problems) {
          expect(['a', 'b']).toContain(p.blank)
          // Uniqueness: for × the visible factor must be non-zero, and for ÷
          // the visible quotient/divisor must be non-zero, or the equation
          // would have many solutions.
          if (p.op === 'multiply') expect(p.blank === 'a' ? p.b : p.a).toBeGreaterThanOrEqual(1)
          if (p.op === 'divide') expect(p.blank === 'a' ? p.b : p.answer).toBeGreaterThanOrEqual(1)
          // Solving from the two visible numbers must reproduce the blank value.
          const solved = solveForBlank(p)
          expect(Number.isInteger(solved)).toBe(true)
          expect(solved).toBe(p.blankValue)
        }
      }
    }
  })

  it('missing=mixed uses both answer and operand blanks', () => {
    const { data } = gen({ operation: 'mixed', missing: 'mixed', count: 60 })
    const blanks = new Set(data.problems.map((p) => p.blank))
    expect(blanks.has('answer')).toBe(true)
    expect(blanks.has('a') || blanks.has('b')).toBe(true)
  })

  it('vertical layout always blanks the answer, regardless of the missing setting', () => {
    for (const missing of ['answer', 'operand', 'mixed'] as const) {
      for (const seed of SEEDS) {
        const { data } = gen({ layout: 'vertical', missing, count: 30 }, seed)
        for (const p of data.problems) expect(p.blank).toBe('answer')
      }
    }
  })

  it('avoids immediate duplicate problems when the fact space is large', () => {
    for (const seed of SEEDS) {
      const { data } = gen({ operation: 'multiply', maxOperand: 12, count: 40 }, seed)
      for (let i = 1; i < data.problems.length; i++) {
        const prev = data.problems[i - 1]
        const cur = data.problems[i]
        expect(cur.op === prev.op && cur.a === prev.a && cur.b === prev.b).toBe(false)
      }
    }
  })

  it('every preset generates a valid, correct sheet with its count honored', () => {
    expect(def.presets.length).toBeGreaterThanOrEqual(2)
    for (const preset of def.presets) {
      const params = { ...def.defaults, ...preset.params } as MathFactsParams
      const data = def.generate(params, createRng(7))
      expect(data.problems).toHaveLength(params.count)
      for (const p of data.problems) expect(recompute(p)).toBe(p.answer)
    }
  })
})

describe('math-facts: seed determinism', () => {
  it('same seed and params produce identical data', () => {
    const params: MathFactsParams = { ...def.defaults, operation: 'mixed', missing: 'mixed' }
    const first = def.generate(params, createRng(2026))
    const second = def.generate(params, createRng(2026))
    expect(second).toEqual(first)
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
  })

  it('different seeds produce different data', () => {
    const params: MathFactsParams = { ...def.defaults }
    const first = def.generate(params, createRng(1))
    const second = def.generate(params, createRng(2))
    expect(JSON.stringify(second)).not.toBe(JSON.stringify(first))
  })
})
