/**
 * Presentation mode — pure types, replay planner, demo interpreters, and the
 * demo scripts themselves. No React imports: everything here runs in Vitest's
 * node environment.
 *
 * A DemoScript's outer array is index-aligned with a lesson's `presentation`
 * steps; a presentation step with no material action gets `[]`. Demos drive
 * the materials through their existing pure model functions — never through
 * the seeded problem generators — so replay is deterministic with no RNG.
 * Exchanges in a demo commit instantly (no ceremony animation, no sound);
 * the child's own taps keep the ceremony.
 */
import { countsFromNumber, formatNumber, totalValue } from '../lib/placeValue'
import type { PlaceCounts } from '../lib/placeValue'
import {
  MAX_TOTAL,
  canExchangeDownGolden,
  canExchangeUpGolden,
  checkAgainstNumber,
  exchangeDownGolden,
  exchangeUpGolden,
  sumCounts,
  validateBuildTarget,
} from '../materials/golden-beads/model'
import type { CheckResult, GoldenPower, Mode as GoldenMode } from '../materials/golden-beads/model'
import {
  MAX_VALUE,
  allOk,
  checkAgainst,
  combineRegions,
  exchangeDownIn,
  exchangeUpIn,
  regionValue,
} from '../materials/stamp-game/model'
import type { Mode as StampMode, PlaceCheck as StampPlaceCheck, StampPlace } from '../materials/stamp-game/model'

/** One material action performed while a presentation step is shown. */
export interface DemoAction {
  do: 'reset' | 'setMode' | 'build' | 'add' | 'exchangeUp' | 'exchangeDown' | 'check' | 'none'
  payload?: string | number
}

/** Outer index aligns 1:1 with lesson.presentation; steps with no action are []. */
export type DemoScript = DemoAction[][]

/**
 * Which steps to (re)apply to move a material from `lastApplied` to `target`.
 * Backward moves reset to initial state and replay 0..target — Prev is deterministic.
 */
export function planReplay(lastApplied: number, target: number): { reset: boolean; apply: number[] } {
  if (target > lastApplied) {
    return { reset: false, apply: Array.from({ length: target - lastApplied }, (_, i) => lastApplied + 1 + i) }
  }
  if (target < lastApplied) {
    return { reset: true, apply: Array.from({ length: target + 1 }, (_, i) => i) }
  }
  return { reset: false, apply: [] }
}

/* ------------------------------------------------------------------
   Golden beads demo interpreter
   ------------------------------------------------------------------ */

const GOLDEN_DEMO_MODES: readonly GoldenMode[] = [
  'free',
  'build',
  'addition',
  'subtraction',
  'multiplication',
  'division',
]

/** Everything presentation mode drives on the golden-beads screen, as one immutable view. */
export interface GoldenDemoView {
  mode: GoldenMode
  mat: PlaceCounts
  check: CheckResult | null
  status: string | null
}

export const GOLDEN_DEMO_INITIAL: GoldenDemoView = { mode: 'free', mat: {}, check: null, status: null }

/**
 * Apply one presentation step's actions. Pure and total: an action that cannot
 * apply (illegal exchange, bad payload) is ignored, so any script prefix replays safely.
 */
export function applyGoldenDemoActions(view: GoldenDemoView, actions: readonly DemoAction[]): GoldenDemoView {
  let v = view
  for (const a of actions) {
    switch (a.do) {
      case 'reset':
        v = GOLDEN_DEMO_INITIAL
        break
      case 'setMode':
        if (typeof a.payload === 'string' && (GOLDEN_DEMO_MODES as readonly string[]).includes(a.payload)) {
          v = { ...v, mode: a.payload as GoldenMode }
        }
        break
      case 'build':
        if (typeof a.payload === 'number' && validateBuildTarget(a.payload) === null) {
          v = { ...v, mat: countsFromNumber(a.payload), check: null, status: null }
        }
        break
      case 'add':
        if (typeof a.payload === 'number' && a.payload >= 1 && totalValue(v.mat) + a.payload <= MAX_TOTAL) {
          v = { ...v, mat: sumCounts(v.mat, countsFromNumber(a.payload)), check: null, status: null }
        }
        break
      case 'exchangeUp':
        if (typeof a.payload === 'number' && canExchangeUpGolden(v.mat, a.payload as GoldenPower)) {
          v = { ...v, mat: exchangeUpGolden(v.mat, a.payload as GoldenPower), check: null, status: null }
        }
        break
      case 'exchangeDown':
        if (typeof a.payload === 'number' && canExchangeDownGolden(v.mat, a.payload as GoldenPower)) {
          v = { ...v, mat: exchangeDownGolden(v.mat, a.payload as GoldenPower), check: null, status: null }
        }
        break
      case 'check':
        if (typeof a.payload === 'number') {
          const result = checkAgainstNumber(v.mat, a.payload)
          v = {
            ...v,
            check: result,
            status: result.allOk
              ? `It matches — the mat shows ${formatNumber(a.payload)}.`
              : 'Not yet — compare the marked columns.',
          }
        }
        break
      case 'none':
        break
    }
  }
  return v
}

/* ------------------------------------------------------------------
   Stamp game demo interpreter
   ------------------------------------------------------------------ */

const STAMP_DEMO_MODES: readonly StampMode[] = ['free', 'addition', 'subtraction', 'multiplication', 'division']

/** Everything presentation mode drives on the stamp-game screen, as one immutable view. */
export interface StampDemoView {
  mode: StampMode
  mat: PlaceCounts
  checks: StampPlaceCheck[] | null
  message: string | null
}

export const STAMP_DEMO_INITIAL: StampDemoView = { mode: 'free', mat: {}, checks: null, message: null }

/** Apply one presentation step's actions — same contract as the golden-beads interpreter. */
export function applyStampDemoActions(view: StampDemoView, actions: readonly DemoAction[]): StampDemoView {
  let v = view
  for (const a of actions) {
    switch (a.do) {
      case 'reset':
        v = STAMP_DEMO_INITIAL
        break
      case 'setMode':
        if (typeof a.payload === 'string' && (STAMP_DEMO_MODES as readonly string[]).includes(a.payload)) {
          v = { ...v, mode: a.payload as StampMode }
        }
        break
      case 'build':
        if (typeof a.payload === 'number' && a.payload >= 1 && a.payload <= MAX_VALUE) {
          v = { ...v, mat: countsFromNumber(a.payload), checks: null, message: null }
        }
        break
      case 'add':
        if (typeof a.payload === 'number' && a.payload >= 1 && regionValue(v.mat) + a.payload <= MAX_VALUE) {
          v = { ...v, mat: combineRegions([v.mat, countsFromNumber(a.payload)]), checks: null, message: null }
        }
        break
      case 'exchangeUp': {
        if (typeof a.payload !== 'number') break
        const res = exchangeUpIn(v.mat, a.payload as StampPlace)
        if (res.ok) v = { ...v, mat: res.value, checks: null, message: null }
        break
      }
      case 'exchangeDown': {
        if (typeof a.payload !== 'number') break
        const res = exchangeDownIn(v.mat, a.payload as StampPlace)
        if (res.ok) v = { ...v, mat: res.value, checks: null, message: null }
        break
      }
      case 'check':
        if (typeof a.payload === 'number') {
          const cs = checkAgainst(v.mat, a.payload)
          v = {
            ...v,
            checks: cs,
            message: allOk(cs)
              ? `Every column matches — the stamps read ${formatNumber(a.payload)}.`
              : 'Some columns do not match yet — recount the ones marked ✗.',
          }
        }
        break
      case 'none':
        break
    }
  }
  return v
}

/* ------------------------------------------------------------------
   Demo scripts, keyed by lesson slug, index-aligned with each lesson's
   presentation steps (src/materials/<slug>/lessons.ts).
   ------------------------------------------------------------------ */

/** Presentation-mode scripts for the Golden Beads & Mat. */
export const goldenBeadsDemos: Record<string, DemoScript> = {
  'golden-beads-addition': [
    /* 0: build the first number, 1,234            */ [{ do: 'reset' }, { do: 'build', payload: 1234 }],
    /* 1: build the second "below or beside" — not automatable faithfully:
          the virtual mat has one column per place; the overlay text carries
          this step and the quantities merge at step 2                       */ [],
    /* 2: push together, count columns             */ [{ do: 'add', payload: 2345 }],
    /* 3: read the answer 3,579                    */ [{ do: 'check', payload: 3579 }],
    /* 4: another day — 1,568 + 1,679, 17 units!   */ [
      { do: 'reset' },
      { do: 'build', payload: 1568 },
      { do: 'add', payload: 1679 },
    ],
    /* 5: trade ten units for a ten-bar            */ [{ do: 'exchangeUp', payload: 0 }],
    /* 6: repeat in the tens, then the hundreds    */ [
      { do: 'exchangeUp', payload: 1 },
      { do: 'exchangeUp', payload: 2 },
    ],
    /* 7: read the answer 3,247                    */ [{ do: 'check', payload: 3247 }],
    /* 8: "in the virtual material, choose Addition" — deliberately not
          setMode: switching would seed a random problem and clear the mat   */ [],
  ],
}

/** Presentation-mode scripts for the Stamp Game. */
export const stampGameDemos: Record<string, DemoScript> = {
  'stamp-game-addition': [
    /* 0: write 1,325 + 2,143 on a slip            */ [{ do: 'reset' }],
    /* 1: build 1,325 near the top                 */ [{ do: 'build', payload: 1325 }],
    /* 2: build 2,143 below, "two separate numbers" — the free-mode mat is a
          single set of columns; the overlay text carries this step and the
          merge happens at step 3                                            */ [],
    /* 3: slide each column together               */ [{ do: 'add', payload: 2143 }],
    /* 4: count columns; read the sum 3,468        */ [{ do: 'check', payload: 3468 }],
    /* 5: dynamic 1,568 + 1,679 — "seventeen!"     */ [
      { do: 'reset' },
      { do: 'build', payload: 1568 },
      { do: 'add', payload: 1679 },
    ],
    /* 6: trade up through the columns; read 3,247 */ [
      { do: 'exchangeUp', payload: 0 },
      { do: 'exchangeUp', payload: 1 },
      { do: 'exchangeUp', payload: 2 },
      { do: 'check', payload: 3247 },
    ],
    /* 7: same problem on paper — the carried 1s (✓ marks stay on screen)    */ [],
  ],
}
