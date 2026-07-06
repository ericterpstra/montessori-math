import { describe, it, expect } from 'vitest'
import { createRng } from '../../lib/rng'
import type { PlaceCounts, PlacePower } from '../../lib/placeValue'
import {
  applyBorrow,
  applyExchange,
  applyTaskExchange,
  applyTaskMove,
  canBorrow,
  canExchange,
  canTaskExchange,
  checkTarget,
  createAdditionTask,
  createSubtractionTask,
  frameFromNumber,
  framePowers,
  frameValue,
  isTaskComplete,
  maxFrameValue,
  randomAdditionProblem,
  randomSubtractionProblem,
  randomTarget,
  requiredExchanges,
  tapBead,
  wireActive,
  type OpTask,
} from './model'

describe('frame geometry and value', () => {
  it('small frame has 4 wires units→thousands, large has 7 up to millions (top→bottom)', () => {
    expect(framePowers('small')).toEqual([0, 1, 2, 3])
    expect(framePowers('large')).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(maxFrameValue('small')).toBe(9_999)
    expect(maxFrameValue('large')).toBe(9_999_999)
  })

  it('value = Σ active × place across all 7 wires of the large frame', () => {
    const counts: PlaceCounts = { 0: 3, 1: 2, 2: 1, 3: 4, 4: 5, 5: 6, 6: 7 }
    expect(frameValue(counts)).toBe(7_654_123)
  })

  it('value = Σ active × place across the 4 wires of the small frame', () => {
    expect(frameValue({ 0: 7, 1: 4, 2: 6, 3: 2 })).toBe(2_647)
    expect(frameValue({})).toBe(0)
  })

  it('frameFromNumber round-trips and rejects numbers that do not fit', () => {
    expect(frameFromNumber(3_251, 'small')).toEqual({ 0: 1, 1: 5, 2: 2, 3: 3 })
    expect(frameValue(frameFromNumber(9_999_999, 'large'))).toBe(9_999_999)
    expect(() => frameFromNumber(10_000, 'small')).toThrow()
    expect(() => frameFromNumber(10_000_000, 'large')).toThrow()
  })
})

describe('tap-position semantics (beads rest left, slide right to count)', () => {
  it('tapping a resting bead slides it and every resting bead to its right across', () => {
    // empty wire: positions 0..9 all resting
    expect(tapBead(0, 9)).toBe(1) // rightmost resting bead → just that one
    expect(tapBead(0, 0)).toBe(10) // leftmost → all ten slide right
    expect(tapBead(0, 4)).toBe(6)
    // 3 active (positions 7,8,9): tapping resting position 6 adds exactly one
    expect(tapBead(3, 6)).toBe(4)
    expect(tapBead(3, 0)).toBe(10)
  })

  it('tapping a counted bead slides it and every counted bead to its left back', () => {
    // 3 active at positions 7,8,9
    expect(tapBead(3, 7)).toBe(2) // leftmost active goes back alone
    expect(tapBead(3, 9)).toBe(0) // rightmost active takes all three back
    expect(tapBead(10, 0)).toBe(9)
    expect(tapBead(10, 9)).toBe(0)
  })

  it('rejects impossible taps', () => {
    expect(() => tapBead(0, 10)).toThrow()
    expect(() => tapBead(-1, 0)).toThrow()
    expect(() => tapBead(11, 0)).toThrow()
    expect(() => tapBead(2, 3.5)).toThrow()
  })
})

describe('exchange rules preserve value both ways', () => {
  it('carrying: 10 beads back, 1 forward on the next wire — value unchanged', () => {
    const before: PlaceCounts = { 0: 10, 1: 2 }
    expect(canExchange(before, 0, 'small')).toBe(true)
    const after = applyExchange(before, 0, 'small')
    expect(after).toEqual({ 1: 3 })
    expect(frameValue(after)).toBe(frameValue(before))
  })

  it('borrowing: 1 bead back on the next wire, 10 forward here — value unchanged', () => {
    const before: PlaceCounts = { 1: 1 }
    expect(canBorrow(before, 0, 'small')).toBe(true)
    const after = applyBorrow(before, 0, 'small')
    expect(after).toEqual({ 0: 10 })
    expect(frameValue(after)).toBe(10)
  })

  it('exchange needs a full wire, room on the next wire, and a next wire on this frame', () => {
    expect(canExchange({ 0: 9 }, 0, 'small')).toBe(false) // not full
    expect(canExchange({ 0: 10, 1: 10 }, 0, 'small')).toBe(false) // no room above
    expect(canExchange({ 3: 10 }, 3, 'small')).toBe(false) // thousands is the small frame's last wire
    expect(canExchange({ 3: 10 }, 3, 'large')).toBe(true) // large frame continues upward
    expect(canExchange({ 6: 10 }, 6, 'large')).toBe(false) // millions is the last wire
    expect(() => applyExchange({ 0: 9 }, 0, 'small')).toThrow()
  })

  it('borrow needs an empty wire and an active bead on the next wire', () => {
    expect(canBorrow({ 0: 1, 1: 5 }, 0, 'small')).toBe(false) // wire not empty
    expect(canBorrow({}, 0, 'small')).toBe(false) // nothing to give
    expect(canBorrow({ 4: 1 }, 3, 'large')).toBe(true)
    expect(() => applyBorrow({ 0: 1, 1: 5 }, 0, 'small')).toThrow()
  })
})

describe('capacity guard', () => {
  it('9,999 + 1 is impossible on the small frame but fine on the large', () => {
    expect(() => createAdditionTask('small', 9_999, 1)).toThrow(/large frame/)
    const task = createAdditionTask('large', 9_999, 1)
    expect(task.remaining).toEqual({ 0: 1 })
  })

  it('rejects subtraction below zero and operands that do not fit', () => {
    expect(() => createSubtractionTask('small', 1_585, 4_232)).toThrow()
    expect(() => createAdditionTask('small', 12_000, 1)).toThrow()
  })
})

/** Slide one wire to a new count, asserting the model accepts it. */
function move(state: { task: OpTask; counts: PlaceCounts }, power: PlacePower, newActive: number) {
  const r = applyTaskMove(state.task, state.counts, power, newActive)
  expect(r.ok).toBe(true)
  state.task = r.task
  state.counts = r.counts
}

/** Run the exchange ceremony on one wire, asserting the model accepts it. */
function exchange(state: { task: OpTask; counts: PlaceCounts }, power: PlacePower) {
  const r = applyTaskExchange(state.task, state.counts, power)
  expect(r.ok).toBe(true)
  state.task = r.task
  state.counts = r.counts
}

describe('addition ceremony: 2,647 + 1,585 = 4,232 with exactly 3 exchanges', () => {
  it('walks each wire, forcing an exchange whenever a wire fills', () => {
    const s = { task: createAdditionTask('small', 2_647, 1_585), counts: frameFromNumber(2_647, 'small') }

    // units: 7 active, 5 to add — the wire fills at 10 with 2 still to go
    move(s, 0, 10)
    expect(s.task.remaining[0]).toBe(2)
    // beads may not slide back during addition; only the exchange resolves a full wire
    expect(applyTaskMove(s.task, s.counts, 0, 8).ok).toBe(false)
    expect(canTaskExchange(s.task, s.counts, 0)).toBe(true)
    exchange(s, 0)
    expect(wireActive(s.counts, 0)).toBe(0)
    expect(wireActive(s.counts, 1)).toBe(5) // the carried ten
    move(s, 0, 2)

    // tens: 5 active, 8 to add
    move(s, 1, 10)
    exchange(s, 1)
    move(s, 1, 3)

    // hundreds: 7 active, 5 to add
    move(s, 2, 10)
    exchange(s, 2)
    move(s, 2, 2)

    // thousands: 3 active, 1 to add — no exchange
    expect(canTaskExchange(s.task, s.counts, 3)).toBe(false)
    move(s, 3, 4)

    expect(s.task.exchanges).toBe(3)
    expect(frameValue(s.counts)).toBe(4_232)
    expect(isTaskComplete(s.task, s.counts)).toBe(true)
  })

  it('requiredExchanges counts the carries, including cascades', () => {
    expect(requiredExchanges('add', 2_647, 1_585)).toBe(3)
    expect(requiredExchanges('add', 9_999, 1)).toBe(4)
    expect(requiredExchanges('add', 2_341, 1_423)).toBe(0)
  })

  it('is not complete while a wire is still full and waiting to exchange', () => {
    const s = { task: createAdditionTask('small', 5, 5), counts: frameFromNumber(5, 'small') }
    move(s, 0, 10)
    expect(isTaskComplete(s.task, s.counts)).toBe(false) // ten beads on a wire is unreadable
    exchange(s, 0)
    expect(isTaskComplete(s.task, s.counts)).toBe(true)
    expect(frameValue(s.counts)).toBe(10)
  })

  it('refuses sliding more beads than remain to add', () => {
    const s = { task: createAdditionTask('small', 2_000, 130), counts: frameFromNumber(2_000, 'small') }
    expect(applyTaskMove(s.task, s.counts, 0, 1).ok).toBe(false) // no units to add
    expect(applyTaskMove(s.task, s.counts, 1, 4).ok).toBe(false) // only 3 tens to add
    move(s, 1, 3)
    move(s, 2, 1)
    expect(isTaskComplete(s.task, s.counts)).toBe(true)
    expect(frameValue(s.counts)).toBe(2_130)
  })
})

describe('subtraction ceremony: borrowing exchanges', () => {
  it('4,232 − 1,585 = 2,647 needs exactly 3 borrows', () => {
    const s = { task: createSubtractionTask('small', 4_232, 1_585), counts: frameFromNumber(4_232, 'small') }

    // units: 2 active but 5 to take — slide off both, then borrow
    move(s, 0, 0)
    expect(applyTaskMove(s.task, s.counts, 0, 1).ok).toBe(false) // forward slides refused
    expect(canTaskExchange(s.task, s.counts, 0)).toBe(true)
    exchange(s, 0)
    expect(wireActive(s.counts, 0)).toBe(10)
    expect(wireActive(s.counts, 1)).toBe(2)
    move(s, 0, 7) // take the remaining 3 units

    // tens: 2 active, 8 to take
    move(s, 1, 0)
    exchange(s, 1)
    move(s, 1, 4)

    // hundreds: 1 active, 5 to take
    move(s, 2, 0)
    exchange(s, 2)
    move(s, 2, 6)

    // thousands: 3 active (one lent), 1 to take
    move(s, 3, 2)

    expect(s.task.exchanges).toBe(3)
    expect(frameValue(s.counts)).toBe(2_647)
    expect(isTaskComplete(s.task, s.counts)).toBe(true)
  })

  it('borrows cascade across empty wires: 100 − 1 takes two exchanges', () => {
    const s = { task: createSubtractionTask('small', 100, 1), counts: frameFromNumber(100, 'small') }
    // units cannot borrow yet — the tens wire has nothing to give
    expect(canTaskExchange(s.task, s.counts, 0)).toBe(false)
    // but tens can borrow from hundreds because units still need taking away
    expect(canTaskExchange(s.task, s.counts, 1)).toBe(true)
    exchange(s, 1)
    exchange(s, 0)
    expect(wireActive(s.counts, 1)).toBe(9)
    move(s, 0, 9)
    expect(s.task.exchanges).toBe(2)
    expect(frameValue(s.counts)).toBe(99)
    expect(isTaskComplete(s.task, s.counts)).toBe(true)
    expect(requiredExchanges('subtract', 100, 1)).toBe(2)
  })

  it('refuses a borrow no wire needs', () => {
    const s = { task: createSubtractionTask('small', 4_210, 10), counts: frameFromNumber(4_210, 'small') }
    // units wire is empty and tens has beads, but nothing at or below units remains to take
    expect(canBorrow(s.counts, 0, 'small')).toBe(true)
    expect(canTaskExchange(s.task, s.counts, 0)).toBe(false)
    expect(applyTaskExchange(s.task, s.counts, 0).ok).toBe(false)
    move(s, 1, 0)
    expect(frameValue(s.counts)).toBe(4_200)
    expect(isTaskComplete(s.task, s.counts)).toBe(true)
  })
})

describe('make a number: honest per-wire check', () => {
  it('marks every wire correct when the frame matches the target', () => {
    const checks = checkTarget(frameFromNumber(3_251, 'small'), 3_251, 'small')
    expect(checks).toHaveLength(4)
    expect(checks.every((c) => c.correct)).toBe(true)
  })

  it('marks exactly the wrong wires, including empty ones', () => {
    const checks = checkTarget(frameFromNumber(3_241, 'small'), 3_251, 'small')
    const byPower = Object.fromEntries(checks.map((c) => [c.power, c.correct]))
    expect(byPower[0]).toBe(true)
    expect(byPower[1]).toBe(false) // 4 tens built, 5 needed
    expect(byPower[2]).toBe(true)
    expect(byPower[3]).toBe(true)
    // an untouched frame against 7,000,000 is wrong only on the millions wire
    const empty = checkTarget({}, 7_000_000, 'large')
    expect(empty.filter((c) => !c.correct).map((c) => c.power)).toEqual([6])
  })
})

describe('seeded problems are deterministic and respect the frame', () => {
  it('the same seed reproduces the same target and problems', () => {
    expect(randomTarget(createRng(42), 'small')).toBe(randomTarget(createRng(42), 'small'))
    expect(randomAdditionProblem(createRng(7), 'large')).toEqual(randomAdditionProblem(createRng(7), 'large'))
    expect(randomSubtractionProblem(createRng(7), 'small')).toEqual(randomSubtractionProblem(createRng(7), 'small'))
  })

  it('generated problems fit the frame and force at least one exchange', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const rng = createRng(seed)
      for (const size of ['small', 'large'] as const) {
        const t = randomTarget(rng, size)
        expect(t).toBeGreaterThanOrEqual(1)
        expect(t).toBeLessThanOrEqual(maxFrameValue(size))
        const add = randomAdditionProblem(rng, size)
        expect(add.a + add.b).toBeLessThanOrEqual(maxFrameValue(size))
        expect(requiredExchanges('add', add.a, add.b)).toBeGreaterThanOrEqual(1)
        const sub = randomSubtractionProblem(rng, size)
        expect(sub.b).toBeLessThan(sub.a)
        expect(requiredExchanges('subtract', sub.a, sub.b)).toBeGreaterThanOrEqual(1)
      }
    }
  })
})
