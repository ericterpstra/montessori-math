/**
 * Racks & Tubes (test-tube long division) — pure model, no React.
 *
 * The physical material: racks of test tubes hold the bead supply in place
 * colors (units green, tens blue, hundreds red — white racks; thousands
 * green in a gray rack). The dividend is laid out as bead stocks per place.
 * Skittles stand for the divisor: a one-digit divisor puts green skittles
 * on the units board; a two-digit divisor adds blue skittles on a tens
 * board to the left — each blue skittle receives beads worth ten times
 * what a green skittle receives.
 *
 * The child finds one quotient digit at a time, highest place first:
 *
 *   bring    — carry the current place's beads to the board(s); with a
 *              two-digit divisor the next place up goes to the tens board
 *   deal     — one bead per skittle per round, while a full round fits
 *   exchange — during dealing (two-digit divisor): trade one tens-board
 *              bead for ten units-board beads when the greens run short;
 *              between places: trade each leftover bead for ten of the
 *              next place down, back at the racks
 *   record   — the quotient digit for this place = full rounds dealt
 *
 * Invariant after every action:
 *   (recorded quotient + current rounds at this place) · divisor
 *   + beads on the boards + beads in the racks === original dividend
 * (see accountedValue).
 */

import { formatNumber, placeInfo } from '../../lib/placeValue'
import type { PlacePower } from '../../lib/placeValue'
import type { RNG } from '../../lib/rng'

export const MAX_DIVIDEND = 9999
export const MAX_DIVISOR = 99
/** Each board has 9 rows of holes — a quotient digit can never exceed 9. */
export const MAX_ROUNDS = 9

export type Phase = 'bring' | 'work' | 'exchange' | 'done'
export type ActionType = 'bring' | 'deal' | 'exchange' | 'record'
export type Mode = 'guided' | 'free'

/** One line of the paper long-division record, mirrored from the beads. */
export interface StepRecord {
  /** Place power (0 = units … 3 = thousands) whose digit this step finds. */
  place: number
  /** The working figure brought to the board(s), read at this place's scale. */
  working: number
  /** Quotient digit, once recorded. */
  digit: number | null
  /** digit × divisor, once recorded. */
  subtracted: number | null
  /** working − subtracted, once recorded. */
  leftover: number | null
}

export interface RunState {
  dividend: number
  divisor: number
  divisorTens: number
  divisorUnits: number
  /** Bead stock in each place's rack cup; index = power of ten (0–4). */
  stocks: number[]
  /** Place of the quotient digit currently being worked. */
  place: number
  startPlace: number
  phase: Phase
  /** Beads waiting on the tens board — each worth 10^(place+1). */
  boardTens: number
  /** Beads waiting on the units board — each worth 10^place. */
  boardUnits: number
  /** Full rounds dealt at this place so far (= beads under each skittle). */
  roundsDealt: number
  /** Recorded quotient digits; index = place power. */
  quotientDigits: Array<number | null>
  steps: StepRecord[]
}

export interface RunResult {
  quotient: number
  remainder: number
}

export type AttemptResult = { ok: true; state: RunState } | { ok: false; message: string }

function placeName(power: number): string {
  return placeInfo(power as PlacePower).name
}

function placeSingular(power: number): string {
  return placeInfo(power as PlacePower).singular
}

function beadWord(count: number): string {
  return count === 1 ? 'bead' : 'beads'
}

export function createRun(dividend: number, divisor: number): RunState {
  if (!Number.isInteger(dividend) || dividend < 1 || dividend > MAX_DIVIDEND) {
    throw new Error(`createRun: dividend must be an integer 1–${MAX_DIVIDEND} (got ${dividend})`)
  }
  if (!Number.isInteger(divisor) || divisor < 1 || divisor > MAX_DIVISOR) {
    throw new Error(`createRun: divisor must be an integer 1–${MAX_DIVISOR} (got ${divisor})`)
  }
  const stocks = [0, 0, 0, 0, 0]
  let rest = dividend
  for (let q = 0; q < stocks.length && rest > 0; q++) {
    stocks[q] = rest % 10
    rest = Math.floor(rest / 10)
  }
  const highest = String(dividend).length - 1
  const divisorDigits = divisor >= 10 ? 2 : 1
  const startPlace = Math.max(0, highest - (divisorDigits - 1))
  return {
    dividend,
    divisor,
    divisorTens: Math.floor(divisor / 10),
    divisorUnits: divisor % 10,
    stocks,
    place: startPlace,
    startPlace,
    phase: 'bring',
    boardTens: 0,
    boardUnits: 0,
    roundsDealt: 0,
    quotientDigits: Array.from({ length: startPlace + 1 }, (): number | null => null),
    steps: [],
  }
}

/** Two-digit divisors put blue skittles on a tens board to the left. */
export function usesTensBoard(s: RunState): boolean {
  return s.divisor >= 10
}

/** The highest place currently holding leftover stock after a record. */
export function topPlace(s: RunState): number {
  return s.place + (usesTensBoard(s) ? 1 : 0)
}

/** Total value of the beads still in the racks. */
export function stockValue(s: RunState): number {
  return s.stocks.reduce((sum, count, power) => sum + count * 10 ** power, 0)
}

/**
 * Honest control of error: everything must always account for the dividend.
 * Quotient value dealt so far + beads on the boards + beads in the racks.
 */
export function accountedValue(s: RunState): number {
  let total = stockValue(s)
  for (let p = 0; p < s.quotientDigits.length; p++) {
    const d = s.quotientDigits[p]
    if (d !== null) total += d * s.divisor * 10 ** p
  }
  if (s.phase !== 'done') {
    total += s.boardTens * 10 ** (s.place + 1) + s.boardUnits * 10 ** s.place
    total += s.roundsDealt * s.divisor * 10 ** s.place
  }
  return total
}

/**
 * Another full round can (eventually) be dealt at this place: the boards
 * still hold at least the divisor's worth, the blue skittles can be served
 * from the tens board, and the board has rows left.
 */
export function roundPossible(s: RunState): boolean {
  return (
    s.phase === 'work' &&
    s.roundsDealt < MAX_ROUNDS &&
    s.boardTens * 10 + s.boardUnits >= s.divisor &&
    s.boardTens >= s.divisorTens
  )
}

/** A round is due but the units board cannot serve every green skittle. */
export function needsBoardExchange(s: RunState): boolean {
  return roundPossible(s) && s.boardUnits < s.divisorUnits
}

/** A round can be dealt right now, without exchanging first. */
export function canDealNow(s: RunState): boolean {
  return (
    s.phase === 'work' &&
    s.roundsDealt < MAX_ROUNDS &&
    s.boardTens >= s.divisorTens &&
    s.boardUnits >= s.divisorUnits
  )
}

/** No more full rounds fit — the digit is ready to be written down. */
export function readyToRecord(s: RunState): boolean {
  return s.phase === 'work' && !roundPossible(s)
}

/** The single correct next action (the guided sequence), or null when done. */
export function nextAction(s: RunState): ActionType | null {
  switch (s.phase) {
    case 'bring':
      return 'bring'
    case 'work':
      if (needsBoardExchange(s)) return 'exchange'
      if (roundPossible(s)) return 'deal'
      return 'record'
    case 'exchange':
      return 'exchange'
    case 'done':
      return null
  }
}

/** Actions a tap may perform. Guided: only the correct next one. Free: anything physically sensible. */
export function allowedActions(s: RunState, mode: Mode): ActionType[] {
  if (s.phase === 'done') return []
  if (mode === 'guided') {
    const a = nextAction(s)
    return a ? [a] : []
  }
  const out: ActionType[] = []
  if (s.phase === 'bring') out.push('bring')
  if (canDealNow(s)) out.push('deal')
  if (s.phase === 'exchange' || (s.phase === 'work' && s.boardTens > 0)) out.push('exchange')
  if (readyToRecord(s)) out.push('record')
  return out
}

/** Coaching text for the correct next step (shown as the stage note in guided mode). */
export function nextHint(s: RunState): string {
  switch (s.phase) {
    case 'bring': {
      if (usesTensBoard(s)) {
        const upper = s.stocks[s.place + 1]
        const lower = s.stocks[s.place]
        return `Bring the beads to the boards: ${upper} ${placeName(s.place + 1)} ${beadWord(upper)} to the tens board and ${lower} ${placeName(s.place)} ${beadWord(lower)} to the units board.`
      }
      const count = s.stocks[s.place]
      return count === 0
        ? `The ${placeName(s.place)} cup is empty — bring it to the board anyway and see what can be dealt.`
        : `Bring the ${count} ${placeName(s.place)} ${beadWord(count)} to the board.`
    }
    case 'work': {
      if (needsBoardExchange(s)) {
        return `The units board cannot serve every green skittle — exchange one ${placeSingular(s.place + 1)} bead for ten ${placeName(s.place)}.`
      }
      if (roundPossible(s)) {
        return s.roundsDealt === 0
          ? 'Deal a round: one bead under every skittle — every share must be fair.'
          : `Deal another round — the board can still give one bead to every skittle. (${s.roundsDealt} dealt so far.)`
      }
      return `No more full rounds fit. Every skittle holds ${s.roundsDealt} — record ${s.roundsDealt} in the ${placeName(s.place)} place of the quotient.`
    }
    case 'exchange': {
      const top = topPlace(s)
      const count = s.stocks[top]
      return `Exchange the ${count} leftover ${placeName(top)} ${beadWord(count)} at the racks — each becomes ten ${placeName(top - 1)}.`
    }
    case 'done': {
      const res = finalResult(s)
      if (!res) return 'Finished.'
      const r = res.remainder > 0 ? `, remainder ${formatNumber(res.remainder)}` : ''
      return `Finished. Read it aloud: ${formatNumber(s.dividend)} ÷ ${formatNumber(s.divisor)} = ${formatNumber(res.quotient)}${r}.`
    }
  }
}

/** The calm out-of-sequence refusal: "Not yet — first …". */
function refusalMessage(s: RunState): string {
  switch (nextAction(s)) {
    case 'bring':
      return `Not yet — first bring the ${placeName(s.place)} beads to the board.`
    case 'deal':
      return 'Not yet — first deal a round: the board can still give one bead to every skittle.'
    case 'exchange':
      return s.phase === 'work'
        ? `Not yet — the units board is short. First exchange one ${placeSingular(s.place + 1)} bead for ten ${placeName(s.place)}.`
        : `Not yet — first exchange the leftover ${placeName(topPlace(s))} beads down: each becomes ten ${placeName(topPlace(s) - 1)}.`
    case 'record':
      return `Not yet — no more full rounds fit. First record ${s.roundsDealt} in the ${placeName(s.place)} place.`
    default:
      return 'This problem is finished — tap Reset or start a new one.'
  }
}

function applyBring(s: RunState): RunState {
  const boardTens = s.stocks[s.place + 1]
  const boardUnits = s.stocks[s.place]
  const stocks = [...s.stocks]
  stocks[s.place + 1] = 0
  stocks[s.place] = 0
  return {
    ...s,
    stocks,
    boardTens,
    boardUnits,
    phase: 'work',
    steps: [...s.steps, { place: s.place, working: boardTens * 10 + boardUnits, digit: null, subtracted: null, leftover: null }],
  }
}

function applyDeal(s: RunState): RunState {
  return {
    ...s,
    boardTens: s.boardTens - s.divisorTens,
    boardUnits: s.boardUnits - s.divisorUnits,
    roundsDealt: s.roundsDealt + 1,
  }
}

/** During dealing: one tens-board bead becomes ten units-board beads. */
function applyBoardExchange(s: RunState): RunState {
  return { ...s, boardTens: s.boardTens - 1, boardUnits: s.boardUnits + 10 }
}

/** Between places: every leftover bead of the top place becomes ten of the next place down. */
function applyLeftoverExchange(s: RunState): RunState {
  const top = topPlace(s)
  const stocks = [...s.stocks]
  stocks[top - 1] += stocks[top] * 10
  stocks[top] = 0
  return { ...s, stocks, place: s.place - 1, phase: 'bring' }
}

function applyRecord(s: RunState): RunState {
  const digit = s.roundsDealt
  const lastIndex = s.steps.length - 1
  const steps = s.steps.map((st, i) =>
    i === lastIndex ? { ...st, digit, subtracted: digit * s.divisor, leftover: st.working - digit * s.divisor } : st,
  )
  const stocks = [...s.stocks]
  stocks[s.place + 1] += s.boardTens
  stocks[s.place] += s.boardUnits
  const quotientDigits = s.quotientDigits.map((d, p) => (p === s.place ? digit : d))
  const base: RunState = { ...s, steps, stocks, quotientDigits, boardTens: 0, boardUnits: 0, roundsDealt: 0 }
  if (s.place === 0) return { ...base, phase: 'done' }
  if (stocks[topPlace(s)] > 0) return { ...base, phase: 'exchange' }
  return { ...base, place: s.place - 1, phase: 'bring' }
}

/**
 * Try to perform an action. Guided mode accepts only the correct next
 * action; free mode accepts anything physically sensible. Refused actions
 * return a calm hint and leave the state untouched.
 */
export function attempt(s: RunState, action: ActionType, mode: Mode = 'guided'): AttemptResult {
  if (s.phase === 'done') {
    return { ok: false, message: 'This problem is finished — tap Reset or start a new one.' }
  }
  if (!allowedActions(s, mode).includes(action)) {
    return { ok: false, message: refusalMessage(s) }
  }
  switch (action) {
    case 'bring':
      return { ok: true, state: applyBring(s) }
    case 'deal':
      return { ok: true, state: applyDeal(s) }
    case 'exchange':
      return { ok: true, state: s.phase === 'work' ? applyBoardExchange(s) : applyLeftoverExchange(s) }
    case 'record':
      return { ok: true, state: applyRecord(s) }
  }
}

/** The finished reading, or null while work is still under way. */
export function finalResult(s: RunState): RunResult | null {
  if (s.phase !== 'done') return null
  let quotient = 0
  s.quotientDigits.forEach((d, p) => {
    quotient += (d ?? 0) * 10 ** p
  })
  return { quotient, remainder: stockValue(s) }
}

export interface RunTrace {
  actions: ActionType[]
  /** states[0] is the fresh run; states[i+1] follows actions[i]. */
  states: RunState[]
  final: RunState
}

/** Play the whole guided sequence — for tests and demonstrations. */
export function runAll(dividend: number, divisor: number): RunTrace {
  let s = createRun(dividend, divisor)
  const states: RunState[] = [s]
  const actions: ActionType[] = []
  let guard = 0
  while (s.phase !== 'done') {
    const a = nextAction(s)
    if (!a) break
    const result = attempt(s, a, 'guided')
    if (!result.ok) throw new Error(`runAll: guided action '${a}' refused: ${result.message}`)
    actions.push(a)
    s = result.state
    states.push(s)
    if (++guard > 1000) throw new Error(`runAll: ${dividend} ÷ ${divisor} did not terminate`)
  }
  return { actions, states, final: s }
}

export type ProblemKind = 'one-digit' | 'two-digit'

export interface Problem {
  dividend: number
  divisor: number
}

/** Draw a seeded practice problem. Two-digit problems keep the quotient interesting (≥ 11). */
export function drawProblem(rng: RNG, kind: ProblemKind): Problem {
  if (kind === 'one-digit') {
    return { divisor: rng.int(2, 9), dividend: rng.int(100, MAX_DIVIDEND) }
  }
  const divisor = rng.int(11, MAX_DIVISOR)
  return { divisor, dividend: rng.int(divisor * 11, MAX_DIVIDEND) }
}
