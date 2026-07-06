/**
 * Positive Snake Game — pure model (no React).
 *
 * A snake of colored bead bars (values 1–9) is counted from the head in
 * passes of ten. Each full ten is exchanged for a golden ten-bar; beads
 * counted past ten return to the head as a black-and-white "bridge" bar.
 * The colored bars counted out are kept in a set-aside tray so the result
 * can be proved by recounting. Invariant throughout play:
 *
 *   10 × golden + (beads still in the snake) === original snake total
 */
import { createRng } from '../../lib/rng'

export type Phase = 'build' | 'play' | 'done'

export type BarKind = 'colored' | 'bridge'

export interface SnakeBar {
  id: number
  kind: BarKind
  /** Bead count: 1–9 for colored bars, 1–8 for bridge bars. */
  value: number
}

/** Result of one "count to ten" pass, kept for the UI narration. */
export interface CountStep {
  /** Bars removed from the head, in the order they were counted. */
  taken: SnakeBar[]
  /** Beads counted in this pass — always reaches or passes 10. */
  count: number
  /** Beads counted past ten (0 when the pass lands exactly on 10). */
  remainder: number
  /** The black-and-white bar placed back at the head, or null. */
  bridge: SnakeBar | null
}

export interface SnakeState {
  phase: Phase
  /** The snake, head first. Holds at most one bridge bar, always at the head. */
  snake: SnakeBar[]
  /** Golden ten-bars earned so far. */
  golden: number
  /** Original colored bars counted out — the evidence for the proof. */
  setAside: SnakeBar[]
  /** The most recent counting pass, for narration. */
  lastStep: CountStep | null
  nextId: number
}

export function createState(): SnakeState {
  return { phase: 'build', snake: [], golden: 0, setAside: [], lastStep: null, nextId: 1 }
}

export function sumBars(bars: readonly SnakeBar[]): number {
  return bars.reduce((sum, b) => sum + b.value, 0)
}

/** Beads still in the snake (colored bars plus any bridge bar). */
export function remainingBeads(state: SnakeState): number {
  return sumBars(state.snake)
}

/** The conserved quantity: golden tens plus everything still in the snake. */
export function totalBeads(state: SnakeState): number {
  return state.golden * 10 + remainingBeads(state)
}

/** Append a colored bar (1–9) to the tail of the snake. Build phase only. */
export function addBar(state: SnakeState, value: number): SnakeState {
  if (state.phase !== 'build') throw new Error('addBar: bars can only be added while building')
  if (!Number.isInteger(value) || value < 1 || value > 9) {
    throw new Error(`addBar: colored bead bars run 1–9, got ${value}`)
  }
  const bar: SnakeBar = { id: state.nextId, kind: 'colored', value }
  return { ...state, snake: [...state.snake, bar], nextId: state.nextId + 1 }
}

/** Undo the last added bar. No-op outside the build phase or on an empty snake. */
export function removeLastBar(state: SnakeState): SnakeState {
  if (state.phase !== 'build' || state.snake.length === 0) return state
  return { ...state, snake: state.snake.slice(0, -1) }
}

/** A ready-made snake of 6–10 random colored bars, deterministic per seed. */
export function surpriseSnake(seed: number): SnakeState {
  const rng = createRng(seed)
  const barCount = rng.int(6, 10)
  let state = createState()
  for (let i = 0; i < barCount; i++) {
    state = addBar(state, rng.int(1, 9))
  }
  return state
}

/** Move from building to counting. A snake under 10 beads is already done. */
export function startPlay(state: SnakeState): SnakeState {
  if (state.phase !== 'build') throw new Error('startPlay: counting has already started')
  if (state.snake.length === 0) throw new Error('startPlay: the snake is empty')
  return { ...state, phase: remainingBeads(state) >= 10 ? 'play' : 'done' }
}

export function canCount(state: SnakeState): boolean {
  return state.phase === 'play' && remainingBeads(state) >= 10
}

/**
 * Count beads from the head until the running count reaches or passes 10.
 * The counted bars leave the snake (colored ones to the set-aside tray, an
 * old bridge bar back to the box), one golden ten-bar is earned, and any
 * remainder returns to the head as a new black-and-white bridge bar. When
 * fewer than 10 beads remain afterward, the game is done and the tail stays.
 */
export function countToTen(state: SnakeState): SnakeState {
  if (!canCount(state)) throw new Error('countToTen: fewer than 10 beads remain to count')
  const snake = [...state.snake]
  const taken: SnakeBar[] = []
  let count = 0
  while (count < 10) {
    const bar = snake.shift()
    if (!bar) throw new Error('countToTen: ran out of bars mid-count')
    taken.push(bar)
    count += bar.value
  }
  const remainder = count - 10
  let nextId = state.nextId
  let bridge: SnakeBar | null = null
  if (remainder > 0) {
    bridge = { id: nextId, kind: 'bridge', value: remainder }
    nextId += 1
    snake.unshift(bridge)
  }
  const setAside = [...state.setAside, ...taken.filter((b) => b.kind === 'colored')]
  const golden = state.golden + 1
  const phase: Phase = sumBars(snake) >= 10 ? 'play' : 'done'
  return { phase, snake, golden, setAside, lastStep: { taken, count, remainder, bridge }, nextId }
}

/** The honest recount: set-aside colored beads against the golden result. */
export interface Proof {
  /** Colored bars waiting in the set-aside tray. */
  setAsideBars: number
  /** Total beads on those bars. */
  setAsideBeads: number
  /** Whole tens in the recount. */
  tensInSetAside: number
  /** Beads left over after the tens (0–9). */
  leftoverInSetAside: number
  /** Golden ten-bars on the mat. */
  goldenBars: number
  /** Value of the bridge bar currently at the snake's head, 0 if none. */
  bridgeValue: number
  /** True when the recount agrees with the golden tens plus the bridge. */
  matches: boolean
}

export function proof(state: SnakeState): Proof {
  const setAsideBeads = sumBars(state.setAside)
  const head = state.snake[0]
  const bridgeValue = head !== undefined && head.kind === 'bridge' ? head.value : 0
  return {
    setAsideBars: state.setAside.length,
    setAsideBeads,
    tensInSetAside: Math.floor(setAsideBeads / 10),
    leftoverInSetAside: setAsideBeads % 10,
    goldenBars: state.golden,
    bridgeValue,
    matches: setAsideBeads === state.golden * 10 + bridgeValue,
  }
}
