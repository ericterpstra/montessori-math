import { describe, expect, it } from 'vitest'
import { createRng } from '../../lib/rng'
import { def } from './command-cards'
import type { CardMaterial, CommandCard, CommandCardsParams, Difficulty } from './command-cards'

const SEEDS = [1, 7, 42, 1234, 987654] as const
const MATERIALS: CardMaterial[] = [
  'golden-beads', 'stamp-game', 'hundred-board', 'bead-frame', 'fraction-circles', 'checkerboard',
]
const DIFFS: Difficulty[] = ['gentle', 'steady', 'challenge']
const TEMPLATE_MATERIALS = MATERIALS.filter((m) => m !== 'fraction-circles')

function gen(overrides: Partial<CommandCardsParams> = {}, seed = 42) {
  const params: CommandCardsParams = { ...def.defaults, ...overrides }
  return { params, data: def.generate(params, createRng(seed)) }
}

/* ---------- independent parsing helpers (recompute answers from the text) ---------- */

/** Every integer in the text, commas stripped, in order. */
function nums(text: string): number[] {
  return (text.match(/\d[\d,]*/g) ?? []).map((m) => Number(m.replace(/,/g, '')))
}

const PLACE_WORD_VALUE: Record<string, number> = {
  million: 1_000_000,
  'hundred-thousand': 100_000,
  'ten-thousand': 10_000,
  thousand: 1000,
  hundred: 100,
  ten: 10,
  unit: 1,
}

/** '(count, place)' pairs like '14 tens' → { count: 14, value: 10 }. */
function parseCounts(text: string): { count: number; value: number }[] {
  const out: { count: number; value: number }[] = []
  const re = /(\d+) (million|hundred-thousand|ten-thousand|thousand|hundred|ten|unit)s?\b/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out.push({ count: Number(m[1]), value: PLACE_WORD_VALUE[m[2]] })
  return out
}

/** US-formatted number, written independently of the generator. */
function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

const PLACES = [
  { value: 1_000_000, singular: 'million', plural: 'millions' },
  { value: 100_000, singular: 'hundred-thousand', plural: 'hundred-thousands' },
  { value: 10_000, singular: 'ten-thousand', plural: 'ten-thousands' },
  { value: 1000, singular: 'thousand', plural: 'thousands' },
  { value: 100, singular: 'hundred', plural: 'hundreds' },
  { value: 10, singular: 'ten', plural: 'tens' },
  { value: 1, singular: 'unit', plural: 'units' },
] as const

/** Independently-built place words: 2467 → '2 thousands, 4 hundreds, 6 tens, 7 units'. */
function expectedPlaceWords(n: number): string {
  const parts: string[] = []
  let rest = n
  for (const p of PLACES) {
    const d = Math.floor(rest / p.value)
    rest -= d * p.value
    if (d > 0) parts.push(`${d} ${d === 1 ? p.singular : p.plural}`)
  }
  return parts.join(', ')
}

const FAMILY_DEN: Record<string, number> = {
  half: 2, halves: 2, third: 3, thirds: 3, fourth: 4, fourths: 4, fifth: 5, fifths: 5,
  sixth: 6, sixths: 6, seventh: 7, sevenths: 7, eighth: 8, eighths: 8, ninth: 9, ninths: 9,
  tenth: 10, tenths: 10,
}

/** Recompute a card's answer from its printed text alone, dispatching on the template. */
function recomputeAnswer(card: CommandCard): string {
  const t = card.text
  const ns = nums(t)
  switch (card.template) {
    case 'build-a-number':
      return expectedPlaceWords(ns[0])
    case 'exchange-till-legal':
      return fmt(parseCounts(t).reduce((sum, c) => sum + c.count * c.value, 0))
    case 'make-then-add':
    case 'add-with-carry':
      return fmt(ns[0] + ns[1])
    case 'take-away':
      return fmt(ns[0] - ns[1])
    case 'find-the-tile': {
      const n = ns[0]
      if (t.includes('down, then one tile right')) return String(n + 11)
      if (t.includes('up, then one tile left')) return String(n - 11)
      if (t.includes('below')) return String(n + 10)
      if (t.includes('above')) return String(n - 10)
      if (t.includes('right')) return String(n + 1)
      return String(n - 1)
    }
    case 'skip-count-path':
      return String(ns[0] * ns[ns.length - 1])
    case 'fill-the-whole': {
      const m = t.match(/How many ([a-z]+) make one whole\?/)
      return String(FAMILY_DEN[m![1]])
    }
    case 'equivalence': {
      const target = t.match(/Lift out one ([a-z]+)\./)
      const cover = t.match(/How many ([a-z]+) cover it exactly\?/)
      return String(FAMILY_DEN[cover![1]] / FAMILY_DEN[target![1]])
    }
    case 'place-the-bar':
      return fmt(ns[0] * ns[1])
  }
}

/** Number of borrows when subtracting b from a right-to-left, as a child would. */
function countBorrows(a: number, b: number): number {
  let borrows = 0
  let carry = 0
  while (a > 0 || b > 0) {
    const da = a % 10
    const db = (b % 10) + carry
    if (da < db) {
      borrows++
      carry = 1
    } else {
      carry = 0
    }
    a = Math.floor(a / 10)
    b = Math.floor(b / 10)
  }
  return borrows
}

/* ---------------- tests ---------------- */

describe('command-cards: answer-key correctness', () => {
  it('every card answer recomputes independently across 5 seeds × 6 materials × 3 difficulties', () => {
    for (const seed of SEEDS) {
      for (const material of MATERIALS) {
        for (const difficulty of DIFFS) {
          const { data } = gen({ material, difficulty, count: 16 }, seed)
          for (const card of data.cards) {
            expect(card.answer, `${material}/${difficulty}/seed ${seed}: "${card.text}"`).toBe(recomputeAnswer(card))
          }
        }
      }
    }
  })

  it('exchange cards always start illegal: at least one parsed count is 10 or more', () => {
    for (const seed of SEEDS) {
      for (const material of ['golden-beads', 'stamp-game'] as const) {
        for (const difficulty of DIFFS) {
          const { data } = gen({ material, difficulty, count: 16 }, seed)
          for (const card of data.cards) {
            if (card.template !== 'exchange-till-legal') continue
            const counts = parseCounts(card.text)
            expect(counts.length).toBeGreaterThan(0)
            expect(counts.some((c) => c.count >= 10), `"${card.text}"`).toBe(true)
          }
        }
      }
    }
  })
})

describe('command-cards: parameter respect', () => {
  it('honors count exactly for 8, 13, 16, 24 across all six materials', () => {
    for (const material of MATERIALS) {
      for (const count of [8, 13, 16, 24]) {
        const { data } = gen({ material, count })
        expect(data.cards).toHaveLength(count)
        expect(data.cards.map((c) => c.id)).toEqual(Array.from({ length: count }, (_, i) => i + 1))
      }
    }
  })

  it('gentle golden-beads cards keep every number under 1,000', () => {
    for (const seed of SEEDS) {
      const { data } = gen({ material: 'golden-beads', difficulty: 'gentle', count: 16 }, seed)
      for (const card of data.cards) {
        for (const n of [...nums(card.text), ...nums(card.answer)]) {
          expect(n, `"${card.text}" → "${card.answer}"`).toBeLessThan(1000)
        }
      }
    }
  })

  it('steady and challenge golden-beads and stamp-game numbers never exceed 9,999', () => {
    for (const seed of SEEDS) {
      for (const material of ['golden-beads', 'stamp-game'] as const) {
        for (const difficulty of ['steady', 'challenge'] as const) {
          const { data } = gen({ material, difficulty, count: 16 }, seed)
          for (const card of data.cards) {
            for (const n of [...nums(card.text), ...nums(card.answer)]) {
              expect(n, `"${card.text}" → "${card.answer}"`).toBeLessThanOrEqual(9999)
            }
          }
        }
      }
    }
  })

  it('challenge make-then-add always carries in the units', () => {
    for (const seed of SEEDS) {
      for (const material of ['golden-beads', 'stamp-game'] as const) {
        const { data } = gen({ material, difficulty: 'challenge', count: 16 }, seed)
        for (const card of data.cards) {
          if (card.template !== 'make-then-add') continue
          const [a, b] = nums(card.text)
          expect((a % 10) + (b % 10), `"${card.text}"`).toBeGreaterThanOrEqual(10)
        }
      }
    }
  })

  it('stamp-game take-away respects the borrowing rules per difficulty', () => {
    for (const seed of SEEDS) {
      for (const difficulty of DIFFS) {
        const { data } = gen({ material: 'stamp-game', difficulty, count: 16 }, seed)
        for (const card of data.cards) {
          if (card.template !== 'take-away') continue
          const [a, b] = nums(card.text)
          expect(a).toBeGreaterThan(b)
          if (difficulty === 'gentle') {
            expect(countBorrows(a, b), `no borrow expected in ${a} − ${b}`).toBe(0)
          } else if (difficulty === 'steady') {
            expect(countBorrows(a, b), `exactly one borrow expected in ${a} − ${b}`).toBe(1)
          } else {
            expect(Math.floor(a / 10) % 10, `minuend tens digit of ${a}`).toBe(0)
            expect(Math.floor(a / 100) % 10, `minuend hundreds digit of ${a}`).toBe(0)
            expect(b % 10, `units borrow in ${a} − ${b}`).toBeGreaterThan(a % 10)
          }
        }
      }
    }
  })

  it('hundred-board cards never leave the board', () => {
    for (const seed of SEEDS) {
      for (const difficulty of DIFFS) {
        const { data } = gen({ material: 'hundred-board', difficulty, count: 16 }, seed)
        for (const card of data.cards) {
          for (const n of nums(card.text)) {
            expect(n).toBeGreaterThanOrEqual(1)
            expect(n).toBeLessThanOrEqual(100)
          }
          const answer = Number(card.answer)
          expect(answer).toBeGreaterThanOrEqual(1)
          expect(answer).toBeLessThanOrEqual(100)
          if (card.template !== 'find-the-tile') continue
          const n = nums(card.text)[0]
          const t = card.text
          if (t.includes('down, then one tile right')) {
            expect(n).toBeLessThanOrEqual(89)
            expect(n % 10).not.toBe(0)
          } else if (t.includes('up, then one tile left')) {
            expect(n).toBeGreaterThanOrEqual(12)
            expect(n % 10).not.toBe(1)
          } else if (t.includes('below')) {
            expect(n).toBeLessThanOrEqual(90)
          } else if (t.includes('above')) {
            expect(n).toBeGreaterThanOrEqual(11)
          } else if (t.includes('right')) {
            expect(n % 10).not.toBe(0)
          } else {
            expect(t).toContain('left')
            expect(n % 10).not.toBe(1)
          }
        }
      }
    }
  })

  it('skip-count products stay within 100 and match the difficulty ranges', () => {
    const RANGES: Record<Difficulty, { n: [number, number]; k: [number, number] }> = {
      gentle: { n: [2, 6], k: [3, 6] },
      steady: { n: [2, 9], k: [5, 8] },
      challenge: { n: [2, 9], k: [8, 10] },
    }
    for (const seed of SEEDS) {
      for (const difficulty of DIFFS) {
        const { data } = gen({ material: 'hundred-board', difficulty, count: 16 }, seed)
        for (const card of data.cards) {
          if (card.template !== 'skip-count-path') continue
          const ns = nums(card.text)
          const n = ns[0]
          const k = ns[ns.length - 1]
          const r = RANGES[difficulty]
          expect(n).toBeGreaterThanOrEqual(r.n[0])
          expect(n).toBeLessThanOrEqual(r.n[1])
          expect(k).toBeGreaterThanOrEqual(r.k[0])
          expect(k).toBeLessThanOrEqual(r.k[1])
          expect(n * k).toBeLessThanOrEqual(100)
        }
      }
    }
  })

  it('bead-frame difficulty picks the right frame and range', () => {
    for (const seed of SEEDS) {
      for (const difficulty of DIFFS) {
        const { data } = gen({ material: 'bead-frame', difficulty, count: 16 }, seed)
        for (const card of data.cards) {
          if (difficulty === 'challenge') {
            expect(card.text).toContain('large bead frame')
            if (card.template === 'build-a-number') {
              expect(nums(card.text)[0]).toBeGreaterThanOrEqual(1_000_000)
              expect(nums(card.text)[0]).toBeLessThanOrEqual(9_999_999)
            } else {
              const [a, b] = nums(card.text)
              expect(a + b).toBeGreaterThanOrEqual(1_000_000)
              expect(a + b).toBeLessThanOrEqual(9_999_999)
            }
          } else {
            expect(card.text).toContain('small bead frame')
            const cap = difficulty === 'gentle' ? 99 : 9999
            for (const n of nums(card.text)) expect(n).toBeLessThanOrEqual(cap)
            if (card.template === 'add-with-carry') {
              const [a, b] = nums(card.text)
              expect(a + b).toBeLessThanOrEqual(difficulty === 'gentle' ? 98 : 9998)
            }
          }
        }
      }
    }
  })

  it('fraction equivalence cards only use exact-integer pairs', () => {
    for (const seed of SEEDS) {
      for (const difficulty of DIFFS) {
        const { data } = gen({ material: 'fraction-circles', difficulty, count: 16 }, seed)
        for (const card of data.cards) {
          expect(['fill-the-whole', 'equivalence']).toContain(card.template)
          if (card.template !== 'equivalence') continue
          const targetDen = FAMILY_DEN[card.text.match(/Lift out one ([a-z]+)\./)![1]]
          const coverDen = FAMILY_DEN[card.text.match(/How many ([a-z]+) cover it exactly\?/)![1]]
          expect(coverDen % targetDen).toBe(0)
          expect(card.answer).toBe(String(coverDen / targetDen))
          if (difficulty === 'gentle') expect(targetDen).toBe(2)
        }
      }
    }
  })

  it('checkerboard squares match the difficulty power ranges', () => {
    const SQUARES: Record<Difficulty, number[]> = {
      gentle: [1, 10, 100, 1000],
      steady: [100, 1000, 10_000, 100_000, 1_000_000],
      challenge: [10_000, 100_000, 1_000_000, 10_000_000, 100_000_000],
    }
    for (const seed of SEEDS) {
      for (const difficulty of DIFFS) {
        const { data } = gen({ material: 'checkerboard', difficulty, count: 16 }, seed)
        for (const card of data.cards) {
          expect(card.template).toBe('place-the-bar')
          const [bar, square] = nums(card.text)
          expect(bar).toBeGreaterThanOrEqual(2)
          expect(bar).toBeLessThanOrEqual(9)
          expect(SQUARES[difficulty]).toContain(square)
        }
      }
    }
  })
})

describe('command-cards: deck construction', () => {
  it('no duplicate card texts within a deck', () => {
    for (const seed of SEEDS) {
      for (const difficulty of DIFFS) {
        for (const material of TEMPLATE_MATERIALS) {
          const { data } = gen({ material, difficulty, count: 16 }, seed)
          expect(new Set(data.cards.map((c) => c.text)).size).toBe(data.cards.length)
        }
        // Fraction pools hold 13 (gentle) / 17 (steady, challenge) distinct cards.
        const count = difficulty === 'gentle' ? 12 : 16
        const { data } = gen({ material: 'fraction-circles', difficulty, count }, seed)
        expect(new Set(data.cards.map((c) => c.text)).size).toBe(data.cards.length)
      }
    }
  })

  it('fraction decks cycle their pool deterministically when count exceeds it', () => {
    const { data } = gen({ material: 'fraction-circles', difficulty: 'gentle', count: 24 }, 42)
    expect(data.cards).toHaveLength(24)
    const freq = new Map<string, number>()
    for (const card of data.cards) freq.set(card.text, (freq.get(card.text) ?? 0) + 1)
    expect(freq.size).toBe(13)
    const twice = [...freq.values()].filter((n) => n === 2).length
    expect(twice).toBe(24 - 13)
    for (const n of freq.values()) expect(n).toBeLessThanOrEqual(2)
  })

  it('decks are template-balanced', () => {
    for (const seed of SEEDS) {
      const golden = gen({ material: 'golden-beads', count: 16 }, seed).data
      const goldenFreq = new Map<string, number>()
      for (const c of golden.cards) goldenFreq.set(c.template, (goldenFreq.get(c.template) ?? 0) + 1)
      expect(goldenFreq.get('build-a-number')).toBe(6)
      expect(goldenFreq.get('exchange-till-legal')).toBe(5)
      expect(goldenFreq.get('make-then-add')).toBe(5)

      const stamp = gen({ material: 'stamp-game', count: 16 }, seed).data
      const stampFreq = new Map<string, number>()
      for (const c of stamp.cards) stampFreq.set(c.template, (stampFreq.get(c.template) ?? 0) + 1)
      for (const t of ['build-a-number', 'exchange-till-legal', 'make-then-add', 'take-away']) {
        expect(stampFreq.get(t), t).toBe(4)
      }
    }
  })

  it('every card carries its material slug and difficulty', () => {
    for (const material of MATERIALS) {
      for (const difficulty of DIFFS) {
        const { data } = gen({ material, difficulty, count: 8 }, 7)
        for (const card of data.cards) {
          expect(card.materialSlug).toBe(material)
          expect(card.difficulty).toBe(difficulty)
        }
      }
    }
  })

  it('every preset generates a valid deck with its count honored', () => {
    expect(def.presets.length).toBeGreaterThanOrEqual(2)
    for (const preset of def.presets) {
      const params = { ...def.defaults, ...preset.params } as CommandCardsParams
      const data = def.generate(params, createRng(7))
      expect(data.cards).toHaveLength(params.count)
      expect(new Set(data.cards.map((c) => c.text)).size).toBe(data.cards.length)
      for (const card of data.cards) expect(card.answer.trim()).not.toBe('')
    }
  })
})

describe('command-cards: seed determinism', () => {
  it('same seed and params produce identical decks', () => {
    const first = def.generate(def.defaults, createRng(2026))
    const second = def.generate(def.defaults, createRng(2026))
    expect(second).toEqual(first)
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
  })

  it('different seeds produce different decks', () => {
    const first = def.generate(def.defaults, createRng(1))
    const second = def.generate(def.defaults, createRng(2))
    expect(JSON.stringify(second)).not.toBe(JSON.stringify(first))
  })
})
