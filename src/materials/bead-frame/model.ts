/**
 * Bead frame model — the small (4-wire) and large (7-wire) Montessori bead
 * frames. Pure logic only: wire state, abacus tap semantics, exchange rules,
 * and the guided addition/subtraction ceremonies with their carrying and
 * borrowing exchanges.
 *
 * Frame orientation (matching the physical material): wires run top → bottom
 * from units to the highest place. Beads rest on the LEFT (not counted) and
 * slide RIGHT to count. A wire physically holds exactly 10 beads, so a wire
 * may transiently show 10 active beads, but a settled (readable) frame has
 * at most 9 per wire — a full wire must be exchanged.
 */

import type { PlaceCounts, PlacePower } from '../../lib/placeValue'
import {
  addToCounts,
  countsFromNumber,
  exchangeDown,
  exchangeUp,
  placeInfo,
  totalValue,
} from '../../lib/placeValue'
import type { RNG } from '../../lib/rng'

export type FrameSize = 'small' | 'large'

export const BEADS_PER_WIRE = 10

const SMALL_POWERS: readonly PlacePower[] = [0, 1, 2, 3]
const LARGE_POWERS: readonly PlacePower[] = [0, 1, 2, 3, 4, 5, 6]

/** Wire powers in top → bottom order (units at the top, like the material). */
export function framePowers(size: FrameSize): readonly PlacePower[] {
  return size === 'small' ? SMALL_POWERS : LARGE_POWERS
}

/** Largest number the frame can show when settled (≤9 per wire). */
export function maxFrameValue(size: FrameSize): number {
  return size === 'small' ? 9_999 : 9_999_999
}

export function emptyFrame(): PlaceCounts {
  return {}
}

/** Active beads on one wire (0 when the wire has no entry). */
export function wireActive(counts: PlaceCounts, power: PlacePower): number {
  return counts[power] ?? 0
}

/** Value read off the frame: Σ active × place value across every wire. */
export function frameValue(counts: PlaceCounts): number {
  return totalValue(counts)
}

/** Set a whole number onto the frame. Throws if it does not fit. */
export function frameFromNumber(n: number, size: FrameSize): PlaceCounts {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`frameFromNumber: expected a non-negative integer, got ${n}`)
  }
  if (n > maxFrameValue(size)) {
    throw new Error(`frameFromNumber: ${n} does not fit on the ${size} frame (max ${maxFrameValue(size)})`)
  }
  return countsFromNumber(n)
}

/**
 * Standard abacus tap. Bead positions are 0..9 left → right: the not-counted
 * beads rest in a left cluster (positions 0..(10−active−1)) and the counted
 * beads sit in a right cluster. Tapping a resting bead pushes it and every
 * resting bead to its right across (they are between it and the gap);
 * tapping a counted bead pushes it and every counted bead to its left back.
 * Returns the wire's new active count.
 */
export function tapBead(active: number, position: number): number {
  if (!Number.isInteger(active) || active < 0 || active > BEADS_PER_WIRE) {
    throw new Error(`tapBead: active must be 0–${BEADS_PER_WIRE}, got ${active}`)
  }
  if (!Number.isInteger(position) || position < 0 || position >= BEADS_PER_WIRE) {
    throw new Error(`tapBead: position must be 0–${BEADS_PER_WIRE - 1}, got ${position}`)
  }
  const inactive = BEADS_PER_WIRE - active
  return position < inactive ? BEADS_PER_WIRE - position : BEADS_PER_WIRE - 1 - position
}

/** Replace one wire's active count (0–10). Used by free/make-a-number modes. */
export function setWire(counts: PlaceCounts, power: PlacePower, active: number): PlaceCounts {
  if (!Number.isInteger(active) || active < 0 || active > BEADS_PER_WIRE) {
    throw new Error(`setWire: active must be 0–${BEADS_PER_WIRE}, got ${active}`)
  }
  const next: PlaceCounts = { ...counts }
  if (active === 0) delete next[power]
  else next[power] = active
  return next
}

/* ------------------------------------------------------------------ */
/* Exchanges                                                           */
/* ------------------------------------------------------------------ */

/**
 * Carrying exchange (used while adding): allowed only when the wire is
 * full-active (all 10 slid right), a next wire exists on THIS frame, and the
 * next wire has room to receive one bead.
 */
export function canExchange(counts: PlaceCounts, power: PlacePower, size: FrameSize): boolean {
  const powers = framePowers(size)
  if (power >= 6 || !powers.includes(power)) return false
  const upper = (power + 1) as PlacePower
  if (!powers.includes(upper)) return false
  return wireActive(counts, power) === BEADS_PER_WIRE && wireActive(counts, upper) < BEADS_PER_WIRE
}

/** Slide all 10 beads back and bring 1 forward on the next wire. Value-preserving. */
export function applyExchange(counts: PlaceCounts, power: PlacePower, size: FrameSize): PlaceCounts {
  if (!canExchange(counts, power, size)) {
    throw new Error(`applyExchange: the ${placeInfo(power).name} wire is not ready to exchange`)
  }
  return exchangeUp(counts, power)
}

/**
 * Borrowing exchange (used while subtracting): allowed only when this wire is
 * completely empty (all 10 beads can come forward), and the next wire up the
 * hierarchy has at least one active bead to give.
 */
export function canBorrow(counts: PlaceCounts, power: PlacePower, size: FrameSize): boolean {
  const powers = framePowers(size)
  if (power >= 6 || !powers.includes(power)) return false
  const upper = (power + 1) as PlacePower
  if (!powers.includes(upper)) return false
  return wireActive(counts, power) === 0 && wireActive(counts, upper) >= 1
}

/** Take 1 bead from the next place and bring all 10 forward here. Value-preserving. */
export function applyBorrow(counts: PlaceCounts, power: PlacePower, size: FrameSize): PlaceCounts {
  if (!canBorrow(counts, power, size)) {
    throw new Error(`applyBorrow: the ${placeInfo(power).name} wire is not ready to borrow`)
  }
  return exchangeDown(counts, (power + 1) as PlacePower)
}

/* ------------------------------------------------------------------ */
/* Guided addition / subtraction tasks                                 */
/* ------------------------------------------------------------------ */

export type TaskKind = 'add' | 'subtract'

export interface OpTask {
  kind: TaskKind
  size: FrameSize
  /** First operand — already on the frame when the task starts. */
  a: number
  /** Second operand — slid on (add) or off (subtract) place by place. */
  b: number
  /** Beads of `b` still to slide, per wire. */
  remaining: PlaceCounts
  /** Exchanges performed so far. */
  exchanges: number
}

function createTask(kind: TaskKind, size: FrameSize, a: number, b: number): OpTask {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
    throw new Error(`createTask: operands must be non-negative integers (${a}, ${b})`)
  }
  if (a > maxFrameValue(size)) {
    throw new Error(`createTask: ${a} does not fit on the ${size} frame`)
  }
  if (kind === 'add' && a + b > maxFrameValue(size)) {
    throw new Error(
      `createTask: ${a} + ${b} = ${a + b} exceeds the ${size} frame (max ${maxFrameValue(size)})` +
        (size === 'small' ? ' — this sum needs the large frame' : ''),
    )
  }
  if (kind === 'subtract' && b > a) {
    throw new Error(`createTask: cannot take ${b} from ${a} on the frame`)
  }
  return { kind, size, a, b, remaining: countsFromNumber(b), exchanges: 0 }
}

export function createAdditionTask(size: FrameSize, a: number, b: number): OpTask {
  return createTask('add', size, a, b)
}

export function createSubtractionTask(size: FrameSize, a: number, b: number): OpTask {
  return createTask('subtract', size, a, b)
}

export interface MoveResult {
  ok: boolean
  /** Child-readable explanation when a move is refused. */
  reason?: string
  counts: PlaceCounts
  task: OpTask
}

function refuse(task: OpTask, counts: PlaceCounts, reason: string): MoveResult {
  return { ok: false, reason, counts, task }
}

/**
 * Attempt to move one wire to `newActive` beads during a task (the result of
 * a tap). Addition only slides beads right, never more than are left to add;
 * subtraction only slides beads back, never more than are left to take away.
 */
export function applyTaskMove(task: OpTask, counts: PlaceCounts, power: PlacePower, newActive: number): MoveResult {
  if (!framePowers(task.size).includes(power)) {
    return refuse(task, counts, 'That wire is not on this frame.')
  }
  if (!Number.isInteger(newActive) || newActive < 0 || newActive > BEADS_PER_WIRE) {
    return refuse(task, counts, `A wire holds 0–${BEADS_PER_WIRE} beads.`)
  }
  const current = wireActive(counts, power)
  const delta = newActive - current
  if (delta === 0) return { ok: true, counts, task }
  const info = placeInfo(power)
  const need = task.remaining[power] ?? 0

  if (task.kind === 'add') {
    if (delta < 0) {
      return refuse(task, counts, 'When adding, beads only slide right. When a wire is full, use its Exchange button.')
    }
    if (delta > need) {
      return refuse(
        task,
        counts,
        need === 0
          ? `Nothing more to add on the ${info.name} wire.`
          : `Only ${need} more ${need === 1 ? info.singular : info.name} to add — that slides too many.`,
      )
    }
    return {
      ok: true,
      counts: setWire(counts, power, newActive),
      task: { ...task, remaining: addToCounts(task.remaining, power, -delta) },
    }
  }

  // subtract
  if (delta > 0) {
    return refuse(
      task,
      counts,
      'When taking away, beads slide back left. When a wire is empty, use its Exchange button to borrow.',
    )
  }
  const taking = -delta
  if (taking > need) {
    return refuse(
      task,
      counts,
      need === 0
        ? `Nothing more to take away on the ${info.name} wire.`
        : `Only ${need} more ${need === 1 ? info.singular : info.name} to take away — that slides back too many.`,
    )
  }
  return {
    ok: true,
    counts: setWire(counts, power, newActive),
    task: { ...task, remaining: addToCounts(task.remaining, power, -taking) },
  }
}

/** Is a borrow at this wire useful — something at or below still to take away? */
export function borrowNeeded(task: OpTask, power: PlacePower): boolean {
  return framePowers(task.size).some((q) => q <= power && (task.remaining[q] ?? 0) > 0)
}

/** Can the task's per-wire Exchange button fire right now? */
export function canTaskExchange(task: OpTask, counts: PlaceCounts, power: PlacePower): boolean {
  if (task.kind === 'add') return canExchange(counts, power, task.size)
  return canBorrow(counts, power, task.size) && borrowNeeded(task, power)
}

/**
 * The exchange ceremony during a task. Adding: 10 beads back, 1 forward on
 * the next wire. Subtracting: 1 bead back on the next wire, all 10 forward
 * here (only when something at or below still needs taking away).
 */
export function applyTaskExchange(task: OpTask, counts: PlaceCounts, power: PlacePower): MoveResult {
  const info = placeInfo(power)
  if (task.kind === 'add') {
    if (!canExchange(counts, power, task.size)) {
      return refuse(task, counts, `Exchange only when the ${info.name} wire is full — all ten beads slid right.`)
    }
    return { ok: true, counts: exchangeUp(counts, power), task: { ...task, exchanges: task.exchanges + 1 } }
  }
  if (!canBorrow(counts, power, task.size)) {
    return refuse(
      task,
      counts,
      `Borrow only when the ${info.name} wire is empty and the next wire has a bead to give.`,
    )
  }
  if (!borrowNeeded(task, power)) {
    return refuse(task, counts, `Nothing left to take away near the ${info.name} wire — no borrow is needed.`)
  }
  return {
    ok: true,
    counts: exchangeDown(counts, (power + 1) as PlacePower),
    task: { ...task, exchanges: task.exchanges + 1 },
  }
}

/** Done: nothing left to slide, and every wire settled at ≤9 (no full wire awaiting exchange). */
export function isTaskComplete(task: OpTask, counts: PlaceCounts): boolean {
  const powers = framePowers(task.size)
  return (
    powers.every((p) => (task.remaining[p] ?? 0) === 0) &&
    powers.every((p) => wireActive(counts, p) <= BEADS_PER_WIRE - 1)
  )
}

/* ------------------------------------------------------------------ */
/* Make-a-number checking                                              */
/* ------------------------------------------------------------------ */

export interface WireCheck {
  power: PlacePower
  expected: number
  actual: number
  correct: boolean
}

/** Honest per-wire check of the frame against a target, top wire first. */
export function checkTarget(counts: PlaceCounts, target: number, size: FrameSize): WireCheck[] {
  const digits = countsFromNumber(target)
  return framePowers(size).map((power) => {
    const expected = digits[power] ?? 0
    const actual = wireActive(counts, power)
    return { power, expected, actual, correct: expected === actual }
  })
}

/* ------------------------------------------------------------------ */
/* Seeded problems                                                     */
/* ------------------------------------------------------------------ */

/**
 * Exchanges the frame will force for a ± b: the number of carries (add) or
 * borrows (subtract) in the written algorithm — each one is one exchange
 * ceremony on the frame.
 */
export function requiredExchanges(kind: TaskKind, a: number, b: number): number {
  let count = 0
  let x = a
  let y = b
  if (kind === 'add') {
    let carry = 0
    while (x > 0 || y > 0 || carry > 0) {
      const s = (x % 10) + (y % 10) + carry
      carry = s >= BEADS_PER_WIRE ? 1 : 0
      if (carry) count++
      x = Math.floor(x / 10)
      y = Math.floor(y / 10)
    }
    return count
  }
  if (b > a) throw new Error(`requiredExchanges: cannot subtract ${b} from ${a}`)
  let borrow = 0
  while (y > 0 || borrow > 0) {
    const d = (x % 10) - (y % 10) - borrow
    borrow = d < 0 ? 1 : 0
    if (borrow) count++
    x = Math.floor(x / 10)
    y = Math.floor(y / 10)
  }
  return count
}

/** Seeded target for Make-a-number: uses several wires of the chosen frame. */
export function randomTarget(rng: RNG, size: FrameSize): number {
  return size === 'small' ? rng.int(101, 9_999) : rng.int(10_001, 9_999_999)
}

const MAX_TRIES = 60

/** Seeded addition problem that fits the frame and forces at least one exchange. */
export function randomAdditionProblem(rng: RNG, size: FrameSize): { a: number; b: number } {
  const max = maxFrameValue(size)
  const [aLo, aHi, bLo] = size === 'small' ? [1_000, 4_999, 1_000] : [100_000, 4_999_999, 100_000]
  for (let i = 0; i < MAX_TRIES; i++) {
    const a = rng.int(aLo, aHi)
    const b = rng.int(bLo, max - a)
    if (requiredExchanges('add', a, b) >= 1) return { a, b }
  }
  return size === 'small' ? { a: 2_647, b: 1_585 } : { a: 2_647_853, b: 1_585_279 }
}

/** Seeded subtraction problem on the frame that forces at least one borrow. */
export function randomSubtractionProblem(rng: RNG, size: FrameSize): { a: number; b: number } {
  const [aLo, aHi, bLo] = size === 'small' ? [3_000, 9_999, 1_000] : [3_000_000, 9_999_999, 1_000_000]
  for (let i = 0; i < MAX_TRIES; i++) {
    const a = rng.int(aLo, aHi)
    const b = rng.int(bLo, a - 1)
    if (requiredExchanges('subtract', a, b) >= 1) return { a, b }
  }
  return size === 'small' ? { a: 4_232, b: 1_585 } : { a: 4_233_132, b: 1_585_279 }
}
