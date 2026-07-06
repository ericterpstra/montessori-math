/**
 * Seeded random number generator (mulberry32). Every worksheet is generated
 * from a seed so the same seed + parameters always reproduce the same sheet.
 */

export interface RNG {
  /** Uniform float in [0, 1). */
  next(): number
  /** Uniform integer in [min, max] (inclusive). */
  int(min: number, max: number): number
  pick<T>(arr: readonly T[]): T
  /** Fisher-Yates shuffle; returns a new array. */
  shuffle<T>(arr: readonly T[]): T[]
  bool(probability?: number): boolean
}

export function createRng(seed: number): RNG {
  let a = seed >>> 0
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int(min, max) {
      if (max < min) throw new Error(`rng.int: max (${max}) < min (${min})`)
      return min + Math.floor(next() * (max - min + 1))
    },
    pick(arr) {
      if (arr.length === 0) throw new Error('rng.pick: empty array')
      return arr[Math.floor(next() * arr.length)]
    },
    shuffle(arr) {
      const out = [...arr]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
    bool(probability = 0.5) {
      return next() < probability
    },
  }
}

export function randomSeed(): number {
  return (Math.random() * 0x7fffffff) | 0
}
