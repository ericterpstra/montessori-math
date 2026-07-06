/**
 * Place-value model shared by all materials and worksheet generators.
 *
 * Powers of ten from millions (6) down to thousandths (-3). All arithmetic
 * on values with decimal places is done on integers scaled by 1000 to avoid
 * floating-point drift.
 */

export type PlacePower = -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface PlaceInfo {
  power: PlacePower
  /** Numeric value of one item in this place (10^power). */
  value: number
  /** Plural name, e.g. 'tens'. */
  name: string
  /** Singular name, e.g. 'ten'. */
  singular: string
  /** CSS color for this place, e.g. 'var(--pv-ten)'. */
  colorVar: string
}

/** All places, highest to lowest. */
export const PLACE_ORDER: readonly PlacePower[] = [6, 5, 4, 3, 2, 1, 0, -1, -2, -3]

const INFO: Record<PlacePower, PlaceInfo> = {
  6: { power: 6, value: 1_000_000, name: 'millions', singular: 'million', colorVar: 'var(--pv-million)' },
  5: { power: 5, value: 100_000, name: 'hundred-thousands', singular: 'hundred-thousand', colorVar: 'var(--pv-hundred-thousand)' },
  4: { power: 4, value: 10_000, name: 'ten-thousands', singular: 'ten-thousand', colorVar: 'var(--pv-ten-thousand)' },
  3: { power: 3, value: 1_000, name: 'thousands', singular: 'thousand', colorVar: 'var(--pv-thousand)' },
  2: { power: 2, value: 100, name: 'hundreds', singular: 'hundred', colorVar: 'var(--pv-hundred)' },
  1: { power: 1, value: 10, name: 'tens', singular: 'ten', colorVar: 'var(--pv-ten)' },
  0: { power: 0, value: 1, name: 'units', singular: 'unit', colorVar: 'var(--pv-unit)' },
  '-1': { power: -1, value: 0.1, name: 'tenths', singular: 'tenth', colorVar: 'var(--pv-tenth)' },
  '-2': { power: -2, value: 0.01, name: 'hundredths', singular: 'hundredth', colorVar: 'var(--pv-hundredth)' },
  '-3': { power: -3, value: 0.001, name: 'thousandths', singular: 'thousandth', colorVar: 'var(--pv-thousandth)' },
}

export function placeInfo(power: PlacePower): PlaceInfo {
  return INFO[power]
}

/** Scale factor for exact decimal arithmetic (supports down to thousandths). */
const SCALE = 1000

function toScaled(n: number): number {
  return Math.round(n * SCALE)
}

export interface PlaceDigit {
  power: PlacePower
  digit: number
}

/**
 * Break a non-negative number into place digits, highest non-zero place
 * down to `minPower` (default 0, i.e. whole numbers).
 * decompose(3251) => [{3,3},{2,2},{1,5},{0,1}]
 */
export function decompose(n: number, opts: { minPower?: PlacePower } = {}): PlaceDigit[] {
  const minPower = opts.minPower ?? 0
  if (n < 0) throw new Error(`decompose: negative numbers unsupported (${n})`)
  let scaled = toScaled(n)
  const out: PlaceDigit[] = []
  for (const p of PLACE_ORDER) {
    if (p < minPower) break
    const pv = toScaled(INFO[p].value)
    const digit = Math.floor(scaled / pv)
    if (digit > 9 && out.length === 0) throw new Error(`decompose: ${n} exceeds supported range`)
    scaled -= digit * pv
    out.push({ power: p, digit })
  }
  while (out.length > 1 && out[0].digit === 0) out.shift()
  if (out.length === 1 && out[0].digit === 0 && out[0].power !== minPower) {
    return [{ power: minPower, digit: 0 }]
  }
  return out
}

export function compose(digits: readonly PlaceDigit[]): number {
  let scaled = 0
  for (const d of digits) scaled += d.digit * toScaled(INFO[d.power].value)
  return scaled / SCALE
}

/**
 * A bag of material pieces per place (e.g. golden beads on the mat,
 * stamps on the table). Counts may exceed 9 — that is what exchanging
 * is for.
 */
export type PlaceCounts = Partial<Record<PlacePower, number>>

export function countsFromNumber(n: number, opts: { minPower?: PlacePower } = {}): PlaceCounts {
  const counts: PlaceCounts = {}
  for (const { power, digit } of decompose(n, opts)) {
    if (digit > 0) counts[power] = digit
  }
  return counts
}

export function totalValue(counts: PlaceCounts): number {
  let scaled = 0
  for (const p of PLACE_ORDER) {
    const c = counts[p]
    if (c) scaled += c * toScaled(INFO[p].value)
  }
  return scaled / SCALE
}

/** Immutable add/remove of pieces. Throws if a count would go negative. */
export function addToCounts(counts: PlaceCounts, power: PlacePower, delta: number): PlaceCounts {
  const next: PlaceCounts = { ...counts }
  const c = (next[power] ?? 0) + delta
  if (c < 0) throw new Error(`addToCounts: cannot remove ${-delta} ${INFO[power].name}, only ${next[power] ?? 0} present`)
  if (c === 0) delete next[power]
  else next[power] = c
  return next
}

export function canExchangeUp(counts: PlaceCounts, power: PlacePower): boolean {
  return power < 6 && (counts[power] ?? 0) >= 10
}

/** Trade 10 pieces of `power` for 1 piece of the next place up. */
export function exchangeUp(counts: PlaceCounts, power: PlacePower): PlaceCounts {
  if (!canExchangeUp(counts, power)) {
    throw new Error(`exchangeUp: need 10 ${INFO[power].name} to exchange`)
  }
  const upper = (power + 1) as PlacePower
  return addToCounts(addToCounts(counts, power, -10), upper, 1)
}

export function canExchangeDown(counts: PlaceCounts, power: PlacePower): boolean {
  return power > -3 && (counts[power] ?? 0) >= 1
}

/** Trade 1 piece of `power` for 10 pieces of the next place down. */
export function exchangeDown(counts: PlaceCounts, power: PlacePower): PlaceCounts {
  if (!canExchangeDown(counts, power)) {
    throw new Error(`exchangeDown: need 1 ${INFO[power].singular} to exchange`)
  }
  const lower = (power - 1) as PlacePower
  return addToCounts(addToCounts(counts, power, -1), lower, 10)
}

/** Carry everything: returns equivalent counts with ≤9 per place. */
export function normalize(counts: PlaceCounts): PlaceCounts {
  let next: PlaceCounts = { ...counts }
  for (let i = PLACE_ORDER.length - 1; i >= 0; i--) {
    const p = PLACE_ORDER[i]
    while (canExchangeUp(next, p)) next = exchangeUp(next, p)
  }
  return next
}

/** '3,251' / '0.75' style formatting (US conventions, up to 3 decimals). */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 3 })
}
