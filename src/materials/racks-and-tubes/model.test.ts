import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import {
  MAX_ROUNDS,
  accountedValue,
  allowedActions,
  attempt,
  canDealNow,
  createRun,
  drawProblem,
  finalResult,
  needsBoardExchange,
  nextAction,
  readyToRecord,
  runAll,
  usesTensBoard,
} from './model'
import type { RunState } from './model'

/** Apply a guided action that must succeed, or fail the test loudly. */
function step(s: RunState, action: Parameters<typeof attempt>[1]): RunState {
  const result = attempt(s, action, 'guided')
  if (!result.ok) throw new Error(`expected '${action}' to be accepted: ${result.message}`)
  return result.state
}

describe('racks & tubes: acceptance problems', () => {
  it('9764 ÷ 4 = 2441 with per-place digits 2, 4, 4, 1 discovered in order', () => {
    const { final } = runAll(9764, 4)
    expect(finalResult(final)).toEqual({ quotient: 2441, remainder: 0 })
    // Steps are pushed as the child works, highest place first.
    expect(final.steps.map((st) => st.place)).toEqual([3, 2, 1, 0])
    expect(final.steps.map((st) => st.digit)).toEqual([2, 4, 4, 1])
    // The paper record mirrors written long division: 9 → 17 → 16 → 4.
    expect(final.steps.map((st) => st.working)).toEqual([9, 17, 16, 4])
    expect(final.steps.map((st) => st.subtracted)).toEqual([8, 16, 16, 4])
    expect(final.steps.map((st) => st.leftover)).toEqual([1, 1, 0, 0])
  })

  it('9765 ÷ 4 = 2441 r 1', () => {
    const { final } = runAll(9765, 4)
    expect(finalResult(final)).toEqual({ quotient: 2441, remainder: 1 })
    // The remainder is honest stock: one unit bead left in the racks.
    expect(final.stocks[0]).toBe(1)
  })

  it('7644 ÷ 84 = 91 using the tens board and blue skittles', () => {
    const run = createRun(7644, 84)
    expect(usesTensBoard(run)).toBe(true)
    expect(run.divisorTens).toBe(8)
    expect(run.divisorUnits).toBe(4)

    const { actions, states, final } = runAll(7644, 84)
    expect(finalResult(final)).toEqual({ quotient: 91, remainder: 0 })
    // Hundreds place cannot deal a single round (76 < 84) → digit 0, then 9, then 1.
    expect(final.steps.map((st) => st.place)).toEqual([2, 1, 0])
    expect(final.steps.map((st) => st.digit)).toEqual([0, 9, 1])
    expect(final.steps.map((st) => st.working)).toEqual([76, 764, 84])

    // At least one mid-deal board exchange happened: a tens-board bead
    // was traded for ten units-board beads when the greens ran short.
    const boardExchanges = actions.filter((a, i) => a === 'exchange' && states[i].phase === 'work')
    expect(boardExchanges.length).toBeGreaterThan(0)
  })

  it('handles remainders with two-digit divisors: 5000 ÷ 84 = 59 r 44', () => {
    const { final } = runAll(5000, 84)
    expect(finalResult(final)).toEqual({ quotient: 59, remainder: 44 })
  })

  it('handles dividends smaller than the divisor: 5 ÷ 8 and 50 ÷ 84', () => {
    expect(finalResult(runAll(5, 8).final)).toEqual({ quotient: 0, remainder: 5 })
    expect(finalResult(runAll(50, 84).final)).toEqual({ quotient: 0, remainder: 50 })
  })
})

describe('racks & tubes: guided action guards', () => {
  it('refuses every out-of-sequence action on a fresh run', () => {
    const s = createRun(9764, 4)
    for (const action of ['deal', 'exchange', 'record'] as const) {
      const result = attempt(s, action, 'guided')
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.message).toMatch(/^Not yet — first bring/)
    }
    expect(attempt(s, 'bring', 'guided').ok).toBe(true)
  })

  it('refuses bringing twice, recording early, and exchanging before recording', () => {
    let s = createRun(9764, 4)
    s = step(s, 'bring') // 9 thousands on the board
    expect(attempt(s, 'bring', 'guided').ok).toBe(false)
    expect(attempt(s, 'record', 'guided').ok).toBe(false) // rounds still possible
    expect(attempt(s, 'exchange', 'guided').ok).toBe(false)

    s = step(s, 'deal')
    s = step(s, 'deal') // 2 rounds of 4 → 1 thousand left, no more rounds
    expect(canDealNow(s)).toBe(false)
    expect(readyToRecord(s)).toBe(true)
    expect(attempt(s, 'deal', 'guided').ok).toBe(false)

    s = step(s, 'record') // thousands digit = 2
    expect(s.quotientDigits[3]).toBe(2)
    expect(s.phase).toBe('exchange')
    expect(attempt(s, 'bring', 'guided').ok).toBe(false) // leftover must exchange first

    s = step(s, 'exchange') // 1 thousand → 10 hundreds
    expect(s.stocks[3]).toBe(0)
    expect(s.stocks[2]).toBe(17) // 7 + 10
    expect(s.place).toBe(2)
    expect(s.phase).toBe('bring')
  })

  it('walks the guided sequence one correct action at a time', () => {
    let s = createRun(9764, 4)
    // Only ever one allowed action in guided mode.
    while (s.phase !== 'done') {
      const allowed = allowedActions(s, 'guided')
      expect(allowed).toHaveLength(1)
      expect(allowed[0]).toBe(nextAction(s))
      s = step(s, allowed[0])
    }
    expect(finalResult(s)).toEqual({ quotient: 2441, remainder: 0 })
  })
})

describe('racks & tubes: free mode', () => {
  it('allows an early board exchange that guided mode refuses', () => {
    let s = createRun(7644, 84)
    s = step(s, 'bring') // tens board: 7 thousands, units board: 6 hundreds
    expect(needsBoardExchange(s)).toBe(false)
    expect(attempt(s, 'exchange', 'guided').ok).toBe(false)
    const free = attempt(s, 'exchange', 'free')
    expect(free.ok).toBe(true)
    if (free.ok) {
      expect(free.state.boardTens).toBe(6)
      expect(free.state.boardUnits).toBe(16)
      expect(accountedValue(free.state)).toBe(7644)
    }
  })

  it('still refuses physically impossible moves in free mode', () => {
    const s = createRun(9764, 4)
    expect(attempt(s, 'deal', 'free').ok).toBe(false) // nothing on the board yet
    expect(attempt(s, 'record', 'free').ok).toBe(false)
  })
})

describe('racks & tubes: invariants across full runs', () => {
  it('after every action, dealt·divisor + boards + racks === the dividend', () => {
    const failures: string[] = []
    const divisors = [2, 3, 4, 7, 9, 10, 12, 84, 99]
    for (const divisor of divisors) {
      for (let dividend = 1; dividend <= 9999; dividend += 397) {
        const { states, final } = runAll(dividend, divisor)
        for (const st of states) {
          if (accountedValue(st) !== dividend) {
            failures.push(`${dividend} ÷ ${divisor}: invariant broke at phase ${st.phase}, place ${st.place}`)
            break
          }
          if (st.roundsDealt > MAX_ROUNDS) {
            failures.push(`${dividend} ÷ ${divisor}: dealt more than ${MAX_ROUNDS} rounds`)
            break
          }
        }
        const res = finalResult(final)
        if (!res || res.quotient !== Math.floor(dividend / divisor) || res.remainder !== dividend % divisor) {
          failures.push(`${dividend} ÷ ${divisor}: wrong result ${JSON.stringify(res)}`)
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('every recorded quotient digit fits the board (0–9)', () => {
    for (const [dividend, divisor] of [
      [9999, 2],
      [9999, 11],
      [9899, 99],
      [1000, 3],
      [9764, 4],
    ] as const) {
      const { final } = runAll(dividend, divisor)
      for (const d of final.quotientDigits) {
        expect(d).not.toBeNull()
        expect(d ?? -1).toBeGreaterThanOrEqual(0)
        expect(d ?? 10).toBeLessThanOrEqual(9)
      }
    }
  })
})

describe('racks & tubes: setup and problem drawing', () => {
  it('rejects out-of-range problems', () => {
    expect(() => createRun(0, 4)).toThrow()
    expect(() => createRun(10000, 4)).toThrow()
    expect(() => createRun(100, 0)).toThrow()
    expect(() => createRun(100, 100)).toThrow()
    expect(() => createRun(12.5, 4)).toThrow()
    expect(() => createRun(100, 4.5)).toThrow()
  })

  it('draws seeded problems deterministically and within range', () => {
    const a = createRng(42)
    const b = createRng(42)
    expect(drawProblem(a, 'two-digit')).toEqual(drawProblem(b, 'two-digit'))
    expect(drawProblem(a, 'one-digit')).toEqual(drawProblem(b, 'one-digit'))

    const rng = createRng(7)
    for (let i = 0; i < 50; i++) {
      const one = drawProblem(rng, 'one-digit')
      expect(one.divisor).toBeGreaterThanOrEqual(2)
      expect(one.divisor).toBeLessThanOrEqual(9)
      expect(one.dividend).toBeGreaterThanOrEqual(100)
      expect(one.dividend).toBeLessThanOrEqual(9999)
      const two = drawProblem(rng, 'two-digit')
      expect(two.divisor).toBeGreaterThanOrEqual(11)
      expect(two.divisor).toBeLessThanOrEqual(99)
      expect(two.dividend).toBeGreaterThanOrEqual(two.divisor * 11)
      expect(two.dividend).toBeLessThanOrEqual(9999)
    }
  })
})
