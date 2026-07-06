import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def, formatScaled, formatScaledMin } from './decimals'
import type {
  DecimalProblem,
  DecimalValue,
  DecimalsMode,
  DecimalsParams,
  OpProblem,
} from './decimals'

/* ------------------------------------------------------------------
   Independent re-computation helpers — deliberately NOT the module's
   own code paths, so the answer key is verified from scratch.
   ------------------------------------------------------------------ */

const ALL_MODES: DecimalsMode[] = ['value', 'expanded', 'compare', 'order', 'add', 'subtract', 'mixed']

function gen(over: Partial<DecimalsParams> = {}, seed = 42) {
  return def.generate({ ...def.defaults, ...over }, createRng(seed))
}

/** Minimal exact decimal string from a ×1000 scaled integer (independent of the module). */
function fmt(scaled: number): string {
  const whole = Math.floor(scaled / 1000)
  const rem = scaled % 1000
  if (rem === 0) return String(whole)
  let frac = String(rem).padStart(3, '0')
  while (frac.endsWith('0')) frac = frac.slice(0, -1)
  return `${whole}.${frac}`
}

/** Digit at 10^power for a ×1000 scaled integer (power −3 … 0). */
function digitAt(scaled: number, power: number): number {
  return Math.floor(scaled / 10 ** (3 + power)) % 10
}

/** Parse a printed decimal back to its exact ×1000 scaled integer. */
function parseScaled(text: string): number {
  return Math.round(parseFloat(text.replace(/,/g, '')) * 1000)
}

function valuesOf(p: DecimalProblem): DecimalValue[] {
  switch (p.kind) {
    case 'value':
    case 'expanded':
      return [p.value]
    case 'compare':
    case 'add':
    case 'subtract':
      return [p.a, p.b]
    case 'order':
      return p.items
  }
}

const SEEDS = [1, 2, 3, 4, 5]

/* ------------------------------------------------------------------ */

describe('decimals: definition', () => {
  it('exports sane metadata and the required presets', () => {
    expect(def.slug).toBe('decimals')
    expect(def.strand).toBe('decimals')
    expect(def.ages).toEqual([9, 12])
    expect(def.presets.length).toBeGreaterThanOrEqual(2)
    const ids = def.presets.map((p) => p.id)
    expect(ids).toContain('reading-decimals')
    expect(ids).toContain('decimal-sums')
  })

  it('every preset generates a valid sheet with its own count', () => {
    for (const preset of def.presets) {
      const params = { ...def.defaults, ...preset.params } as DecimalsParams
      const data = def.generate(params, createRng(7))
      expect(data.problems.length).toBe(params.count)
    }
  })
})

describe('decimals: seed determinism and count', () => {
  it('same seed + params ⇒ byte-identical data, for every mode', () => {
    for (const mode of ALL_MODES) {
      const a = gen({ mode }, 123)
      const b = gen({ mode }, 123)
      expect(JSON.stringify(a)).toBe(JSON.stringify(b))
      expect(a).toEqual(b)
    }
  })

  it('different seeds ⇒ different sheets', () => {
    expect(JSON.stringify(gen({ mode: 'add' }, 1))).not.toBe(JSON.stringify(gen({ mode: 'add' }, 2)))
    expect(JSON.stringify(gen({ mode: 'mixed' }, 1))).not.toBe(JSON.stringify(gen({ mode: 'mixed' }, 2)))
  })

  it('honors count exactly for every mode', () => {
    for (const mode of ALL_MODES) {
      for (const count of [6, 10, 14]) {
        for (const seed of [11, 12]) {
          expect(gen({ mode, count }, seed).problems.length).toBe(count)
        }
      }
    }
  })
})

describe('decimals: places parameter', () => {
  it('no value anywhere is deeper than the requested places, and text matches the exact value', () => {
    for (const mode of ALL_MODES) {
      for (const places of [1, 2, 3]) {
        for (const seed of [3, 9]) {
          for (const p of gen({ mode, places, count: 14 }, seed).problems) {
            for (const v of valuesOf(p)) {
              expect(v.displayPlaces).toBeGreaterThanOrEqual(1)
              expect(v.displayPlaces).toBeLessThanOrEqual(places)
              // Exactness: nothing lives below the allowed smallest place.
              expect(v.scaled % 10 ** (3 - places)).toBe(0)
              // The printed string is exactly the scaled value, at its printed depth.
              expect(parseScaled(v.text)).toBe(v.scaled)
              expect(v.text.split('.')[1]?.length ?? 0).toBe(v.displayPlaces)
            }
          }
        }
      }
    }
  })

  it('value and expanded problems use the full requested depth', () => {
    for (const mode of ['value', 'expanded'] as const) {
      for (const places of [1, 2, 3]) {
        for (const p of gen({ mode, places, count: 10 }, 21).problems) {
          for (const v of valuesOf(p)) expect(v.displayPlaces).toBe(places)
        }
      }
    }
  })
})

describe('decimals: value of the underlined digit', () => {
  it('the underlined digit, its place, and its value are all correct', () => {
    const words: Record<number, [string, string]> = {
      [-1]: ['tenth', 'tenths'],
      [-2]: ['hundredth', 'hundredths'],
      [-3]: ['thousandth', 'thousandths'],
    }
    for (const seed of SEEDS) {
      for (const places of [1, 2, 3]) {
        const data = gen({ mode: 'value', places, count: 14 }, seed)
        for (const p of data.problems) {
          if (p.kind !== 'value') throw new Error('mode not respected')
          // Underline is always a fractional place within range, on a nonzero digit.
          expect(p.underlinePower).toBeLessThanOrEqual(-1)
          expect(p.underlinePower).toBeGreaterThanOrEqual(-places)
          expect(p.digit).toBeGreaterThanOrEqual(1)
          expect(p.digit).toBeLessThanOrEqual(9)
          // Recompute the digit and its value independently.
          expect(digitAt(p.value.scaled, p.underlinePower)).toBe(p.digit)
          expect(p.answerScaled).toBe(p.digit * 10 ** (3 + p.underlinePower))
          expect(p.answerText).toBe(fmt(p.answerScaled))
          // The underline index marks that exact character in the printed number.
          expect(p.value.text[p.underlineIndex]).toBe(String(p.digit))
          const fracIndex = p.value.text.indexOf('.') + -p.underlinePower
          expect(p.underlineIndex).toBe(fracIndex)
          // Spoken form, e.g. '7 hundredths' / '1 tenth'.
          const [singular, plural] = words[p.underlinePower]
          expect(p.answerWords).toBe(`${p.digit} ${p.digit === 1 ? singular : plural}`)
        }
      }
    }
  })

  it('spec example shape: a 7 in the hundredths place is worth 0.07', () => {
    expect(digitAt(2371, -2)).toBe(7)
    expect(fmt(7 * 10)).toBe('0.07')
    expect(formatScaledMin(70)).toBe('0.07')
  })
})

describe('decimals: expanded form', () => {
  it('parts are exactly the nonzero place values and sum back to the number', () => {
    for (const seed of SEEDS) {
      for (const places of [1, 2, 3]) {
        for (const p of gen({ mode: 'expanded', places, count: 14 }, seed).problems) {
          if (p.kind !== 'expanded') throw new Error('mode not respected')
          expect(p.parts.length).toBeGreaterThanOrEqual(2)
          let sum = 0
          let lastPower = 1
          for (const part of p.parts) {
            expect(part.digit).toBeGreaterThanOrEqual(1)
            expect(part.digit).toBeLessThanOrEqual(9)
            expect(part.power).toBeLessThan(lastPower) // strictly descending, no repeats
            lastPower = part.power
            expect(digitAt(p.value.scaled, part.power)).toBe(part.digit)
            expect(part.text).toBe(fmt(part.digit * 10 ** (3 + part.power)))
            sum += part.digit * 10 ** (3 + part.power)
          }
          expect(sum).toBe(p.value.scaled) // exact — no float drift
          expect(p.answerText).toBe(p.parts.map((part) => part.text).join(' + '))
        }
      }
    }
  })
})

describe('decimals: comparing', () => {
  it('every <, =, > answer matches the exact integer comparison', () => {
    for (const seed of SEEDS) {
      for (const places of [1, 2, 3]) {
        for (const p of gen({ mode: 'compare', places, count: 14 }, seed).problems) {
          if (p.kind !== 'compare') throw new Error('mode not respected')
          const expected = p.a.scaled < p.b.scaled ? '<' : p.a.scaled > p.b.scaled ? '>' : '='
          expect(p.answer).toBe(expected)
        }
      }
    }
  })

  it('at least 30% of pairs are the shorter-but-larger misconception trap', () => {
    for (const places of [2, 3]) {
      for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
        for (const count of [10, 14]) {
          const problems = gen({ mode: 'compare', places, count }, seed).problems
          let traps = 0
          for (const p of problems) {
            if (p.kind !== 'compare' || !p.misconception) continue
            traps++
            // Verify the trap really is a trap: fewer printed digits, larger value.
            const shorter = p.a.displayPlaces < p.b.displayPlaces ? p.a : p.b
            const longer = shorter === p.a ? p.b : p.a
            expect(shorter.displayPlaces).toBeLessThan(longer.displayPlaces)
            expect(shorter.scaled).toBeGreaterThan(longer.scaled)
          }
          expect(traps).toBeGreaterThanOrEqual(Math.ceil(count * 0.3))
        }
      }
    }
  })

  it('equal pairs exist and differ only by trailing zeros', () => {
    let equalsSeen = 0
    for (let seed = 1; seed <= 40; seed++) {
      for (const p of gen({ mode: 'compare', places: 3, count: 14 }, seed).problems) {
        if (p.kind !== 'compare' || p.answer !== '=') continue
        equalsSeen++
        expect(p.a.scaled).toBe(p.b.scaled)
        expect(p.a.displayPlaces).not.toBe(p.b.displayPlaces)
      }
    }
    expect(equalsSeen).toBeGreaterThan(0)
  })

  it('places=1 never produces = answers or misconception flags', () => {
    for (const seed of SEEDS) {
      for (const p of gen({ mode: 'compare', places: 1, count: 14 }, seed).problems) {
        if (p.kind !== 'compare') throw new Error('mode not respected')
        expect(p.answer).not.toBe('=')
        expect(p.misconception).toBe(false)
      }
    }
  })
})

describe('decimals: ordering', () => {
  it('sorted is the ascending permutation of the four printed items', () => {
    for (const seed of SEEDS) {
      for (const places of [1, 2, 3]) {
        for (const p of gen({ mode: 'order', places, count: 12 }, seed).problems) {
          if (p.kind !== 'order') throw new Error('mode not respected')
          expect(p.items.length).toBe(4)
          expect(p.sorted.length).toBe(4)
          // All distinct.
          expect(new Set(p.items.map((v) => v.scaled)).size).toBe(4)
          // Same multiset, strictly ascending.
          const resorted = [...p.items].sort((x, y) => x.scaled - y.scaled)
          expect(p.sorted.map((v) => v.scaled)).toEqual(resorted.map((v) => v.scaled))
          for (let i = 1; i < 4; i++) {
            expect(p.sorted[i].scaled).toBeGreaterThan(p.sorted[i - 1].scaled)
          }
          expect(p.answerText).toBe(p.sorted.map((v) => v.text).join(' < '))
          // Never handed out already solved.
          expect(p.items.some((v, i) => i > 0 && p.items[i - 1].scaled > v.scaled)).toBe(true)
        }
      }
    }
  })

  it('mixes printed depths when places allows, so length ≠ size', () => {
    for (const p of gen({ mode: 'order', places: 3, count: 12 }, 5).problems) {
      if (p.kind !== 'order') throw new Error('mode not respected')
      expect(new Set(p.items.map((v) => v.displayPlaces)).size).toBeGreaterThan(1)
    }
  })
})

describe('decimals: addition and subtraction', () => {
  function opProblems(mode: 'add' | 'subtract', places: number, seed: number): OpProblem[] {
    return gen({ mode, places, count: 14 }, seed).problems.map((p) => {
      if (p.kind !== mode) throw new Error('mode not respected')
      return p
    })
  }

  it('answers are exact integer-scaled arithmetic — no float drift ever', () => {
    let driftCasesSeen = 0
    for (let seed = 1; seed <= 40; seed++) {
      for (const mode of ['add', 'subtract'] as const) {
        for (const p of opProblems(mode, 3, seed)) {
          const expected = mode === 'add' ? p.a.scaled + p.b.scaled : p.a.scaled - p.b.scaled
          expect(p.answerScaled).toBe(expected)
          expect(p.answerText).toBe(fmt(expected))
          // The printed answer never carries float garbage.
          expect(p.answerText).toMatch(/^\d+(\.\d{1,3})?$/)
          // Count the 0.1 + 0.2 style cases where naive float math would drift.
          const naive = p.a.scaled / 1000 + p.b.scaled / 1000
          if (mode === 'add' && naive !== expected / 1000) driftCasesSeen++
        }
      }
    }
    // The classic trap must actually be exercised by the data, not just avoided.
    expect(driftCasesSeen).toBeGreaterThan(0)
  })

  it('0.1 + 0.2 formats as exactly 0.3', () => {
    expect(0.1 + 0.2).not.toBe(0.3) // the reason the module works on scaled integers
    expect(formatScaledMin(100 + 200)).toBe('0.3')
    expect(formatScaled(100 + 200, 1)).toBe('0.3')
    expect(formatScaledMin(7050)).toBe('7.05')
    expect(formatScaled(500, 2)).toBe('0.50')
  })

  it('subtraction never goes negative', () => {
    for (const seed of SEEDS) {
      for (const places of [1, 2, 3]) {
        for (const p of opProblems('subtract', places, seed)) {
          expect(p.a.scaled).toBeGreaterThanOrEqual(p.b.scaled)
          expect(p.answerScaled).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })

  it('printed rows line up on the decimal point without fake trailing zeros', () => {
    for (const seed of SEEDS) {
      for (const mode of ['add', 'subtract'] as const) {
        for (const p of opProblems(mode, 3, seed)) {
          const [rowA, rowB] = p.rows
          expect(rowA.length).toBe(rowB.length)
          expect(rowA.indexOf('.')).toBe(rowB.indexOf('.'))
          expect(rowB[0]).toBe(mode === 'add' ? '+' : '−')
          // The rows print the numbers exactly as given — spaces only, no padding zeros.
          expect(rowA.trim()).toBe(p.a.text)
          expect(rowB.slice(1).trim()).toBe(p.b.text)
        }
      }
    }
  })
})

describe('decimals: mode parameter', () => {
  it('single modes produce only their own kind', () => {
    for (const mode of ['value', 'expanded', 'compare', 'order', 'add', 'subtract'] as const) {
      for (const p of gen({ mode, count: 10 }, 33).problems) {
        expect(p.kind).toBe(mode)
      }
    }
  })

  it('mixed mode covers all six kinds and re-numbers problems 0..n-1', () => {
    const data = gen({ mode: 'mixed', count: 12 }, 44)
    expect(new Set(data.problems.map((p) => p.kind)).size).toBe(6)
    expect(data.problems.map((p) => p.index)).toEqual(data.problems.map((_, i) => i))
  })

  it('every mode numbers its problems 0..n-1 (compare shuffles, so verify)', () => {
    for (const mode of ALL_MODES) {
      const data = gen({ mode, count: 10 }, 55)
      expect(data.problems.map((p) => p.index)).toEqual(data.problems.map((_, i) => i))
    }
  })
})
