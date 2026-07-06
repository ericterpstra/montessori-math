import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def, generate } from './multi-digit-ops'
import type { MultiDigitOpsData, MultiDigitOpsParams, Operation } from './multi-digit-ops'

const SEEDS = [1, 7, 42, 1234, 987654]
const OPERATIONS: Operation[] = ['add', 'subtract', 'multiply']

function gen(overrides: Partial<MultiDigitOpsParams>, seed: number): MultiDigitOpsData {
  return generate({ ...def.defaults, ...overrides }, createRng(seed))
}

/* ---------- independent re-implementations (kept separate from the module
   under test so answer-key checks do not share its code paths) ---------- */

/** Digits of a non-negative integer, least significant first. */
function digitsLsd(n: number): number[] {
  const out: number[] = []
  let x = n
  do {
    out.push(x % 10)
    x = Math.floor(x / 10)
  } while (x > 0)
  return out
}

function additionHasCarry(a: number, b: number): boolean {
  const A = digitsLsd(a)
  const B = digitsLsd(b)
  let carry = 0
  for (let i = 0; i < Math.max(A.length, B.length); i++) {
    const s = (A[i] ?? 0) + (B[i] ?? 0) + carry
    if (s >= 10) return true
    carry = 0
  }
  return false
}

function subtractionHasBorrow(a: number, b: number): boolean {
  const A = digitsLsd(a)
  const B = digitsLsd(b)
  let borrow = 0
  for (let i = 0; i < A.length; i++) {
    if ((A[i] ?? 0) - borrow < (B[i] ?? 0)) return true
    borrow = 0
  }
  return false
}

function multiplicationHasCarry(a: number, m: number): boolean {
  let carry = 0
  for (const d of digitsLsd(a)) {
    const p = d * m + carry
    carry = Math.floor(p / 10)
    if (carry > 0) return true
  }
  return false
}

/* ---------- answer-key correctness ---------- */

describe('answer-key correctness', () => {
  it('every addition answer equals a + b (all digits, both regrouping modes, several seeds)', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        for (const regrouping of [true, false]) {
          const data = gen({ operation: 'add', digits, regrouping }, seed)
          for (const p of data.problems) expect(p.answer).toBe(p.a + p.b)
        }
      }
    }
  })

  it('every subtraction answer equals a − b and is never negative', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        for (const regrouping of [true, false]) {
          const data = gen({ operation: 'subtract', digits, regrouping }, seed)
          for (const p of data.problems) {
            expect(p.answer).toBe(p.a - p.b)
            expect(p.answer).toBeGreaterThan(0)
            expect(p.a).toBeGreaterThan(p.b)
          }
        }
      }
    }
  })

  it('every multiplication answer equals a × b', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        for (const regrouping of [true, false]) {
          const data = gen({ operation: 'multiply', digits, regrouping }, seed)
          for (const p of data.problems) expect(p.answer).toBe(p.a * p.b)
        }
      }
    }
  })
})

/* ---------- parameter respect ---------- */

describe('digits parameter', () => {
  it('operands have exactly the requested number of digits', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        const lo = 10 ** (digits - 1)
        const hi = 10 ** digits
        for (const operation of OPERATIONS) {
          for (const regrouping of [true, false]) {
            const data = gen({ operation, digits, regrouping }, seed)
            expect(data.digits).toBe(digits)
            for (const p of data.problems) {
              expect(p.a).toBeGreaterThanOrEqual(lo)
              expect(p.a).toBeLessThan(hi)
              if (operation === 'multiply') {
                expect(Number.isInteger(p.b)).toBe(true)
                expect(p.b).toBeGreaterThanOrEqual(2)
                expect(p.b).toBeLessThanOrEqual(9)
              } else {
                expect(p.b).toBeGreaterThanOrEqual(lo)
                expect(p.b).toBeLessThan(hi)
              }
            }
          }
        }
      }
    }
  })
})

describe('regrouping parameter — addition', () => {
  it('off: no column sum ever exceeds 9 (no carrying anywhere)', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        const data = gen({ operation: 'add', digits, regrouping: false }, seed)
        for (const p of data.problems) {
          const A = digitsLsd(p.a)
          const B = digitsLsd(p.b)
          for (let i = 0; i < Math.max(A.length, B.length); i++) {
            expect((A[i] ?? 0) + (B[i] ?? 0)).toBeLessThanOrEqual(9)
          }
          expect(additionHasCarry(p.a, p.b)).toBe(false)
        }
      }
    }
  })

  it('on: every problem needs at least one carry', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        const data = gen({ operation: 'add', digits, regrouping: true }, seed)
        for (const p of data.problems) {
          expect(additionHasCarry(p.a, p.b)).toBe(true)
        }
      }
    }
  })
})

describe('regrouping parameter — subtraction', () => {
  it('off: every minuend digit is at least the subtrahend digit below it', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        const data = gen({ operation: 'subtract', digits, regrouping: false }, seed)
        for (const p of data.problems) {
          const A = digitsLsd(p.a)
          const B = digitsLsd(p.b)
          for (let i = 0; i < B.length; i++) {
            expect(A[i] ?? 0).toBeGreaterThanOrEqual(B[i] ?? 0)
          }
          expect(subtractionHasBorrow(p.a, p.b)).toBe(false)
        }
      }
    }
  })

  it('on: every problem needs at least one borrow', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        const data = gen({ operation: 'subtract', digits, regrouping: true }, seed)
        for (const p of data.problems) {
          expect(subtractionHasBorrow(p.a, p.b)).toBe(true)
        }
      }
    }
  })
})

describe('regrouping parameter — multiplication', () => {
  it('off: every digit × multiplier stays below 10 (no carries at all)', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        const data = gen({ operation: 'multiply', digits, regrouping: false }, seed)
        for (const p of data.problems) {
          for (const d of digitsLsd(p.a)) {
            expect(d * p.b).toBeLessThanOrEqual(9)
          }
          expect(multiplicationHasCarry(p.a, p.b)).toBe(false)
        }
      }
    }
  })

  it('on: every problem needs at least one carry', () => {
    for (const seed of SEEDS) {
      for (const digits of [2, 3, 4]) {
        const data = gen({ operation: 'multiply', digits, regrouping: true }, seed)
        for (const p of data.problems) {
          expect(multiplicationHasCarry(p.a, p.b)).toBe(true)
        }
      }
    }
  })
})

describe('count parameter', () => {
  it('generates exactly the requested number of problems', () => {
    for (const count of [6, 9, 13, 20]) {
      for (const operation of OPERATIONS) {
        const data = gen({ operation, count }, 42)
        expect(data.problems).toHaveLength(count)
      }
    }
  })

  it('honors count even in the tightest problem space (2-digit static multiplication)', () => {
    const data = gen({ operation: 'multiply', digits: 2, regrouping: false, count: 20 }, 7)
    expect(data.problems).toHaveLength(20)
  })
})

/* ---------- seed determinism ---------- */

describe('seed determinism', () => {
  it('same seed and params produce byte-identical data', () => {
    for (const operation of OPERATIONS) {
      for (const regrouping of [true, false]) {
        const params = { operation, regrouping }
        const first = gen(params, 20260706)
        const second = gen(params, 20260706)
        expect(second).toEqual(first)
        expect(JSON.stringify(second)).toBe(JSON.stringify(first))
      }
    }
  })

  it('different seeds produce different sheets', () => {
    for (const operation of OPERATIONS) {
      const one = gen({ operation }, 1)
      const two = gen({ operation }, 2)
      expect(JSON.stringify(one)).not.toBe(JSON.stringify(two))
    }
  })
})

/* ---------- presets ---------- */

describe('presets', () => {
  it('ships the three lesson-linked presets', () => {
    expect(def.presets.map((p) => p.id)).toEqual(['static-addition', 'dynamic-subtraction', 'times-by-one-digit'])
  })

  it('static-addition: 3-digit addition with no carries', () => {
    const params = def.presets[0].params as MultiDigitOpsParams
    expect(params.operation).toBe('add')
    expect(params.digits).toBe(3)
    expect(params.regrouping).toBe(false)
    const data = generate(params, createRng(5))
    for (const p of data.problems) {
      expect(p.answer).toBe(p.a + p.b)
      expect(additionHasCarry(p.a, p.b)).toBe(false)
    }
  })

  it('dynamic-subtraction: 4-digit subtraction, borrow in every problem, place columns on', () => {
    const preset = def.presets[1]
    const params = preset.params as MultiDigitOpsParams
    expect(params.operation).toBe('subtract')
    expect(params.digits).toBe(4)
    expect(params.regrouping).toBe(true)
    expect(params.placeColumns).toBe(true)
    const data = generate(params, createRng(5))
    for (const p of data.problems) {
      expect(p.answer).toBe(p.a - p.b)
      expect(p.answer).toBeGreaterThan(0)
      expect(subtractionHasBorrow(p.a, p.b)).toBe(true)
    }
  })

  it('times-by-one-digit: 3-digit × 1-digit with carrying', () => {
    const params = def.presets[2].params as MultiDigitOpsParams
    expect(params.operation).toBe('multiply')
    expect(params.digits).toBe(3)
    expect(params.regrouping).toBe(true)
    const data = generate(params, createRng(5))
    for (const p of data.problems) {
      expect(p.answer).toBe(p.a * p.b)
      expect(multiplicationHasCarry(p.a, p.b)).toBe(true)
    }
  })
})

/* ---------- def shape ---------- */

describe('generator definition', () => {
  it('has the expected slug, strand, and schema keys', () => {
    expect(def.slug).toBe('multi-digit-ops')
    expect(def.strand).toBe('abstraction')
    expect(def.ages).toEqual([5, 9])
    expect(def.schema.map((f) => f.key)).toEqual(['operation', 'digits', 'count', 'regrouping', 'placeColumns'])
  })

  it('defaults generate a valid dynamic-addition sheet', () => {
    const data = generate(def.defaults, createRng(99))
    expect(data.operation).toBe('add')
    expect(data.problems).toHaveLength(def.defaults.count)
    for (const p of data.problems) {
      expect(p.answer).toBe(p.a + p.b)
      expect(additionHasCarry(p.a, p.b)).toBe(true)
    }
  })
})
