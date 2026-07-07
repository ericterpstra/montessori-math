import type { ReactNode } from 'react'
import type { RNG } from '../../lib/rng'
import type { GeneratorDef, SheetProps } from '../types'
import type { PlaceCounts, PlacePower } from '../../lib/placeValue'
import { PLACE_ORDER, countsFromNumber, formatNumber, placeInfo, totalValue } from '../../lib/placeValue'
import { EQUIVALENCE_TARGETS, equivalentFills, familyName } from '../../materials/fraction-circles/model'
import { BeadShape, TenBar } from '../../components/beads'
import { StampTile } from '../../components/StampTile'
import { AnswerKeyPage } from '../SheetPage'
import './command-cards.css'

/* ------------------------------------------------------------------
   Command cards — printable task-card decks for six materials.
   A parent prints a deck, cuts it apart, and the child draws one card
   at a time and does the work with the (virtual or paper) material.
   Pure generation: every random choice goes through the injected RNG.
   ------------------------------------------------------------------ */

export type CardMaterial =
  | 'golden-beads' | 'stamp-game' | 'hundred-board'
  | 'bead-frame' | 'fraction-circles' | 'checkerboard'
export type Difficulty = 'gentle' | 'steady' | 'challenge'

export type CommandCardsParams = {
  material: CardMaterial
  difficulty: Difficulty
  count: number
}

export type TemplateId =
  | 'build-a-number' | 'exchange-till-legal' | 'make-then-add' | 'take-away'
  | 'find-the-tile' | 'skip-count-path' | 'add-with-carry'
  | 'fill-the-whole' | 'equivalence' | 'place-the-bar'

export interface CommandCard {
  id: number // 1-based card number as printed on the deck
  materialSlug: CardMaterial
  template: TemplateId
  text: string
  answer: string // formatted for the key, e.g. '2,467' or '2 thousands, 4 hundreds…'
  difficulty: Difficulty
}

export interface CommandCardsData {
  cards: CommandCard[]
}

export const CARDS_PER_PAGE = 8

type Draft = Omit<CommandCard, 'id'>

/* ---------------- shared helpers ---------------- */

/** '2 hundreds, 14 tens, 3 units' — highest place first, zero counts skipped. */
function countWords(counts: PlaceCounts): string {
  const parts: string[] = []
  for (const p of PLACE_ORDER) {
    const c = counts[p]
    if (!c) continue
    parts.push(`${c} ${c === 1 ? placeInfo(p).singular : placeInfo(p).name}`)
  }
  return parts.join(', ')
}

/** placeWords(2467) → '2 thousands, 4 hundreds, 6 tens, 7 units'. */
function placeWords(n: number): string {
  return countWords(countsFromNumber(n))
}

/** ordinal(3) → '3rd'. Only needs 1..10. */
function ordinal(n: number): string {
  return n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`
}

const MATERIAL_LABEL: Record<CardMaterial, string> = {
  'golden-beads': 'Golden Beads', 'stamp-game': 'Stamp Game', 'hundred-board': 'Hundred Board',
  'bead-frame': 'Bead Frame', 'fraction-circles': 'Fraction Circles', 'checkerboard': 'Checkerboard',
}

/* ---------------- number builders ---------------- */

/** build-a-number for golden beads and stamp game. */
function buildNumberValue(difficulty: Difficulty, rng: RNG): number {
  return difficulty === 'gentle' ? rng.int(100, 999) : rng.int(1000, 9999)
}

/** An intentionally illegal pile of pieces (some place holds 10+). */
function exchangeCounts(difficulty: Difficulty, rng: RNG): PlaceCounts {
  const counts: PlaceCounts = {}
  const set = (p: PlacePower, c: number): void => {
    if (c > 0) counts[p] = c
  }
  if (difficulty === 'gentle') {
    // 1 over-nine column; total stays < 1,000 (max 8·100 + 19·10 + 9 = 999).
    const over = rng.pick([0, 1] as PlacePower[])
    for (const p of [0, 1] as PlacePower[]) set(p, p === over ? rng.int(11, 19) : rng.int(0, 9))
    set(2, rng.int(0, 8))
  } else if (difficulty === 'steady') {
    // 2 over-nine columns; max total 9,099 ≤ 9,999.
    const overs = rng.shuffle([0, 1, 2] as PlacePower[]).slice(0, 2)
    for (const p of [0, 1, 2] as PlacePower[]) set(p, overs.includes(p) ? rng.int(11, 19) : rng.int(0, 9))
    set(3, rng.int(0, 7))
  } else {
    // 3 over-nine columns; max total 9,109 ≤ 9,999.
    for (const p of [0, 1, 2] as PlacePower[]) set(p, rng.int(11, 19))
    set(3, rng.int(0, 7))
  }
  return counts
}

/** Addends for make-then-add (golden beads / stamp game). */
function addPair(difficulty: Difficulty, rng: RNG): [number, number] {
  if (difficulty === 'gentle') {
    // Each addend 100–499, so every sum stays ≤ 998 (< 1,000).
    return [rng.int(100, 499), rng.int(100, 499)]
  }
  if (difficulty === 'steady') return [rng.int(1000, 4999), rng.int(1000, 4999)]
  // challenge: forced units carry, sum ≤ 9,998.
  const u1 = rng.int(5, 9)
  const u2 = rng.int(10 - u1, 9)
  const a = rng.int(1, 4) * 1000 + rng.int(0, 9) * 100 + rng.int(0, 9) * 10 + u1
  const b = rng.int(1, 4) * 1000 + rng.int(0, 9) * 100 + rng.int(0, 9) * 10 + u2
  return [a, b]
}

/** Minuend/subtrahend for stamp-game take-away; always positive by construction. */
function takeAwayPair(difficulty: Difficulty, rng: RNG): [number, number] {
  if (difficulty === 'gentle') {
    // 3-digit, no borrow anywhere: b ≤ a digit by digit.
    const a2 = rng.int(2, 9)
    const a1 = rng.int(1, 9)
    const a0 = rng.int(1, 9)
    const b2 = rng.int(1, a2 - 1)
    const b1 = rng.int(0, a1)
    const b0 = rng.int(0, a0)
    return [a2 * 100 + a1 * 10 + a0, b2 * 100 + b1 * 10 + b0]
  }
  if (difficulty === 'steady') {
    // 4-digit, exactly one borrow at place p, absorbed one place up.
    const p = rng.pick([0, 1, 2] as const)
    const a3 = rng.int(2, 9)
    const b3 = rng.int(1, a3 - 1)
    const ad = [0, 0, 0]
    const bd = [0, 0, 0]
    for (const place of [2, 1, 0]) {
      if (place === p) {
        ad[place] = rng.int(0, 8)
        bd[place] = rng.int(ad[place] + 1, 9) // forces the borrow
      } else if (place === p + 1) {
        ad[place] = rng.int(1, 9)
        bd[place] = rng.int(0, ad[place] - 1) // absorbs the borrow
      } else {
        ad[place] = rng.int(0, 9)
        bd[place] = rng.int(0, ad[place])
      }
    }
    return [a3 * 1000 + ad[2] * 100 + ad[1] * 10 + ad[0], b3 * 1000 + bd[2] * 100 + bd[1] * 10 + bd[0]]
  }
  // challenge: borrow across zero — minuend has 0 hundreds and 0 tens.
  const a3 = rng.int(2, 9)
  const a0 = rng.int(0, 5)
  const b3 = rng.int(1, a3 - 1)
  const b2 = rng.int(1, 9)
  const b1 = rng.int(1, 9)
  const b0 = rng.int(a0 + 1, 9) // ripples the borrow through both empty columns
  return [a3 * 1000 + a0, b3 * 1000 + b2 * 100 + b1 * 10 + b0]
}

/** Addends for bead-frame add-with-carry; the units always carry. */
function beadFrameAddPair(difficulty: Difficulty, rng: RNG): [number, number] {
  const u1 = rng.int(5, 9)
  const u2 = rng.int(10 - u1, 9)
  if (difficulty === 'gentle') {
    // 2-digit + 2-digit, sum ≤ 98 — small frame.
    return [rng.int(1, 4) * 10 + u1, rng.int(1, 4) * 10 + u2]
  }
  if (difficulty === 'steady') {
    // 4-digit + 4-digit, sum ≤ 9,998 — small frame.
    return [
      rng.int(1, 4) * 1000 + rng.int(0, 9) * 100 + rng.int(0, 9) * 10 + u1,
      rng.int(1, 4) * 1000 + rng.int(0, 9) * 100 + rng.int(0, 9) * 10 + u2,
    ]
  }
  // challenge: 6-digit + 6-digit whose sum crosses into the millions wire
  // (hundred-thousands digits also carry), sum 1,000,00x–1,999,998.
  const h1 = rng.int(1, 9)
  const h2 = rng.int(10 - h1, 9)
  const middle = (): number =>
    rng.int(0, 9) * 10_000 + rng.int(0, 9) * 1000 + rng.int(0, 9) * 100 + rng.int(0, 9) * 10
  return [h1 * 100_000 + middle() + u1, h2 * 100_000 + middle() + u2]
}

/** Hundred-board find-the-tile; edge tiles excluded by construction, never by reroll. */
function findTheTile(difficulty: Difficulty, rng: RNG): { text: string; answer: string } {
  if (difficulty === 'challenge') {
    const dir = rng.pick(['below-right', 'above-left'] as const)
    if (dir === 'below-right') {
      const n = rng.int(0, 8) * 10 + rng.int(1, 9) // 1–89, never a multiple of 10
      return {
        text: `Place ${n} on the hundred board. Move one row down, then one tile right. What number do you land on?`,
        answer: String(n + 11),
      }
    }
    const n = rng.int(1, 9) * 10 + rng.int(2, 10) // 12–100, never ≡ 1 mod 10
    return {
      text: `Place ${n} on the hundred board. Move one row up, then one tile left. What number do you land on?`,
      answer: String(n - 11),
    }
  }
  const dir =
    difficulty === 'gentle'
      ? rng.pick(['below', 'right'] as const)
      : rng.pick(['below', 'above', 'right', 'left'] as const)
  let n: number
  if (dir === 'below') n = difficulty === 'gentle' ? rng.int(1, 50) : rng.int(1, 90)
  else if (dir === 'above') n = rng.int(11, 100)
  else if (dir === 'right') n = difficulty === 'gentle' ? rng.int(0, 4) * 10 + rng.int(1, 9) : rng.int(0, 9) * 10 + rng.int(1, 9)
  else n = rng.int(0, 9) * 10 + rng.int(2, 10)
  const answer = dir === 'below' ? n + 10 : dir === 'above' ? n - 10 : dir === 'right' ? n + 1 : n - 1
  const text =
    dir === 'below' || dir === 'above'
      ? `Place ${n} on the hundred board. What number lives directly ${dir} it?`
      : `Place ${n} on the hundred board. What number sits just to its ${dir}?`
  return { text, answer: String(answer) }
}

/* ---------------- templates ---------------- */

/** Balanced template rotation per material (fraction circles use a pool instead). */
const TEMPLATE_CYCLE: Record<Exclude<CardMaterial, 'fraction-circles'>, readonly TemplateId[]> = {
  'golden-beads': ['build-a-number', 'exchange-till-legal', 'make-then-add'],
  'stamp-game': ['build-a-number', 'exchange-till-legal', 'make-then-add', 'take-away'],
  'hundred-board': ['find-the-tile', 'skip-count-path'],
  'bead-frame': ['build-a-number', 'add-with-carry'],
  checkerboard: ['place-the-bar'],
}

function makeCard(material: CardMaterial, template: TemplateId, difficulty: Difficulty, rng: RNG): Draft {
  const base = { materialSlug: material, template, difficulty }
  switch (template) {
    case 'build-a-number': {
      if (material === 'bead-frame') {
        const n =
          difficulty === 'gentle'
            ? rng.int(1, 9) * 10 + rng.int(1, 9) // genuinely 2 wires
            : difficulty === 'steady'
              ? rng.int(1000, 9999)
              : rng.int(1_000_000, 9_999_999) // 7-wire large frame
        const frame = difficulty === 'challenge' ? 'large' : 'small'
        return {
          ...base,
          text: `On the ${frame} bead frame, slide beads to show ${formatNumber(n)}. Read it back, wire by wire.`,
          answer: placeWords(n),
        }
      }
      const n = buildNumberValue(difficulty, rng)
      const text =
        material === 'golden-beads'
          ? `Build ${formatNumber(n)} with the golden beads. Lay it out by place, largest first.`
          : `Lay out ${formatNumber(n)} with stamps. Read it back, place by place.`
      return { ...base, text, answer: placeWords(n) }
    }
    case 'exchange-till-legal': {
      const counts = exchangeCounts(difficulty, rng)
      const words = countWords(counts)
      const text =
        material === 'golden-beads'
          ? `Put out ${words}. Exchange until no column holds more than nine. What number do you have?`
          : `Put out ${words} in stamps. Exchange until no column holds more than nine. What number do you have?`
      return { ...base, text, answer: formatNumber(totalValue(counts)) }
    }
    case 'make-then-add': {
      const [a, b] = addPair(difficulty, rng)
      const text =
        material === 'golden-beads'
          ? `Build ${formatNumber(a)} and ${formatNumber(b)} on the mat. Push them together and exchange. What is the sum?`
          : `Make ${formatNumber(a)} and ${formatNumber(b)} with stamps. Join them and exchange. What is the sum?`
      return { ...base, text, answer: formatNumber(a + b) }
    }
    case 'take-away': {
      const [a, b] = takeAwayPair(difficulty, rng)
      return {
        ...base,
        text: `Make ${formatNumber(a)} with stamps. Take away ${formatNumber(b)}, exchanging when a column runs short. What is left?`,
        answer: formatNumber(a - b),
      }
    }
    case 'find-the-tile':
      return { ...base, ...findTheTile(difficulty, rng) }
    case 'skip-count-path': {
      const n = difficulty === 'gentle' ? rng.int(2, 6) : rng.int(2, 9)
      const k = difficulty === 'gentle' ? rng.int(3, 6) : difficulty === 'steady' ? rng.int(5, 8) : rng.int(8, 10)
      return {
        ...base,
        text: `On the hundred board, color every ${ordinal(n)} tile, starting at ${n}. What is the ${ordinal(k)} tile you color?`,
        answer: String(n * k),
      }
    }
    case 'add-with-carry': {
      const [a, b] = beadFrameAddPair(difficulty, rng)
      const frame = difficulty === 'challenge' ? 'large' : 'small'
      return {
        ...base,
        text: `Show ${formatNumber(a)} on the ${frame} bead frame. Add ${formatNumber(b)} wire by wire, exchanging whenever a wire fills. What is the sum?`,
        answer: formatNumber(a + b),
      }
    }
    case 'place-the-bar': {
      const bar = rng.int(2, 9)
      const p = difficulty === 'gentle' ? rng.int(0, 3) : difficulty === 'steady' ? rng.int(2, 6) : rng.int(4, 8)
      return {
        ...base,
        text: `Put a ${bar}-bar on the ${formatNumber(10 ** p)} square of the checkerboard. How much is it worth?`,
        answer: formatNumber(bar * 10 ** p),
      }
    }
    case 'fill-the-whole':
    case 'equivalence':
      throw new Error(`${template} cards come from the fraction pool, not makeCard`)
  }
}

/* ---------------- fraction-circles pool ---------------- */

/** The 8 exact-integer equivalence pairs, straight from the real model. */
const EQUIV_PAIRS = EQUIVALENCE_TARGETS.flatMap((target) =>
  equivalentFills(target).map((fill) => ({ target, fill })),
)

/** Every distinct fraction card for a difficulty (gentle 13, steady/challenge 17). */
function fractionPool(difficulty: Difficulty): Draft[] {
  const pool: Draft[] = []
  for (let den = 2; den <= 10; den++) {
    pool.push({
      materialSlug: 'fraction-circles',
      template: 'fill-the-whole',
      difficulty,
      text: `Lift one ${familyName(den)} piece from its circle. How many ${familyName(den, true)} make one whole?`,
      answer: String(den),
    })
  }
  const pairs = difficulty === 'gentle' ? EQUIV_PAIRS.filter((p) => p.target.den === 2) : EQUIV_PAIRS
  for (const { target, fill } of pairs) {
    pool.push({
      materialSlug: 'fraction-circles',
      template: 'equivalence',
      difficulty,
      text: `Lift out one ${familyName(target.den)}. How many ${familyName(fill.den, true)} cover it exactly? Prove it with the pieces.`,
      answer: String(fill.count),
    })
  }
  return pool
}

/* ---------------- generation ---------------- */

const DEDUPE_ATTEMPTS = 100

function templateDeck(params: CommandCardsParams, rng: RNG): Draft[] {
  const cycle = TEMPLATE_CYCLE[params.material as Exclude<CardMaterial, 'fraction-circles'>]
  const used = new Set<string>()
  const drafts: Draft[] = []
  for (let i = 0; i < params.count; i++) {
    const template = cycle[i % cycle.length]
    let card = makeCard(params.material, template, params.difficulty, rng)
    for (let tries = 0; tries < DEDUPE_ATTEMPTS && used.has(card.text); tries++) {
      card = makeCard(params.material, template, params.difficulty, rng)
    }
    used.add(card.text)
    drafts.push(card)
  }
  return drafts
}

function fractionDeck(difficulty: Difficulty, count: number, rng: RNG): Draft[] {
  const pool = rng.shuffle(fractionPool(difficulty))
  return Array.from({ length: count }, (_, i) => ({ ...pool[i % pool.length] }))
}

function generate(params: CommandCardsParams, rng: RNG): CommandCardsData {
  const drafts =
    params.material === 'fraction-circles'
      ? fractionDeck(params.difficulty, params.count, rng)
      : templateDeck(params, rng)
  const shuffled = rng.shuffle(drafts)
  return { cards: shuffled.map((c, i) => ({ ...c, id: i + 1 })) }
}

/* ---------------- rendering ---------------- */

function chunk<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size))
  }
  return pages
}

/**
 * One printed card page. Same DOM as `SheetPage` (which does not take a
 * className) with the extra `.command-cards-page` hook for the tighter
 * header margins and the absolutely-positioned scissors glyph.
 */
function CardPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="sheet-page command-cards-page">
      <header className="sheet-header">
        <h2 className="sheet-title">{title}</h2>
      </header>
      <p className="sheet-instructions">
        Cut the cards apart along the dashed lines. Draw one card at a time and do the work with the material — then
        check together with the key.
      </p>
      {children}
    </section>
  )
}

/* Decorative material glyphs — aria-hidden; the task text carries 100% of the information. */

function HundredBoardGlyph() {
  const at = [1.5, 12.5, 23.5]
  return (
    <svg width={22} height={22} viewBox="0 0 36 36" aria-hidden="true">
      {at.flatMap((y) =>
        at.map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={10} height={10} fill="none" stroke="var(--ink-soft)" strokeWidth={1.5} />
        )),
      )}
    </svg>
  )
}

function BeadFrameGlyph() {
  return (
    <svg width={36} height={22} viewBox="0 0 60 36" aria-hidden="true">
      {[8, 18, 28].map((y) => (
        <line key={y} x1={2} y1={y} x2={58} y2={y} stroke="var(--ink-soft)" strokeWidth={1.5} />
      ))}
      <BeadShape cx={10} cy={8} r={4} fill="var(--pv-unit)" />
      <BeadShape cx={20} cy={8} r={4} fill="var(--pv-unit)" />
      <BeadShape cx={30} cy={8} r={4} fill="var(--pv-unit)" />
      <BeadShape cx={10} cy={18} r={4} fill="var(--pv-ten)" />
      <BeadShape cx={20} cy={18} r={4} fill="var(--pv-ten)" />
      <BeadShape cx={10} cy={28} r={4} fill="var(--pv-hundred)" />
    </svg>
  )
}

function FractionGlyph() {
  return (
    <svg width={22} height={22} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx={16} cy={16} r={14} fill="none" stroke="var(--ink)" strokeWidth={1.5} />
      <path d="M16,16 L16,2 A14,14 0 0 1 30,16 Z" fill="var(--fraction-shade)" stroke="var(--ink)" strokeWidth={1} />
    </svg>
  )
}

function CheckerboardGlyph() {
  const fills = ['var(--pv-hundred)', 'var(--pv-ten)', 'var(--pv-unit)']
  return (
    <svg width={38} height={16} viewBox="0 0 57 24" aria-hidden="true">
      {fills.map((fill, i) => (
        <rect key={fill} x={1 + i * 19} y={4} width={16} height={16} fill={fill} fillOpacity={0.5} stroke="var(--ink-soft)" />
      ))}
    </svg>
  )
}

function MaterialGlyph({ material }: { material: CardMaterial }) {
  switch (material) {
    case 'golden-beads':
      return <TenBar beadSize={9} />
    case 'stamp-game':
      return (
        <span aria-hidden="true">
          <StampTile value={100} size={20} asDiv />
        </span>
      )
    case 'hundred-board':
      return <HundredBoardGlyph />
    case 'bead-frame':
      return <BeadFrameGlyph />
    case 'fraction-circles':
      return <FractionGlyph />
    case 'checkerboard':
      return <CheckerboardGlyph />
  }
}

function Sheet({ data, params }: SheetProps<CommandCardsParams, CommandCardsData>) {
  const pages = chunk(data.cards, CARDS_PER_PAGE)
  const title = `Command Cards — ${MATERIAL_LABEL[params.material]}`
  return (
    <>
      {pages.map((page, i) => (
        <CardPage key={i} title={pages.length > 1 ? `${title} (page ${i + 1} of ${pages.length})` : title}>
          <span className="command-cards-scissors" aria-hidden="true">
            ✂
          </span>
          <div className="command-cards-grid">
            {page.map((card) => (
              <div key={card.id} className="command-card avoid-break">
                <div className="command-card-top">
                  <span className="command-card-number">Card {card.id}</span>
                  <MaterialGlyph material={card.materialSlug} />
                </div>
                <p className="command-card-text">{card.text}</p>
              </div>
            ))}
          </div>
        </CardPage>
      ))}
    </>
  )
}

function AnswerKey({ data, params }: SheetProps<CommandCardsParams, CommandCardsData>) {
  return (
    <AnswerKeyPage title={`Command Cards — ${MATERIAL_LABEL[params.material]}`}>
      <ol className="answer-list command-cards-key">
        {data.cards.map((c) => (
          <li key={c.id}>
            <span className="problem-number">{c.id}.</span> {c.answer}
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------------- definition ---------------- */

export const def: GeneratorDef<CommandCardsParams, CommandCardsData> = {
  slug: 'command-cards',
  name: 'Command Cards',
  description:
    'Cut-out task-card decks for the golden beads, stamp game, hundred board, bead frames, fraction circles, and checkerboard — the child draws a card and works independently with the material; the key lets a parent check each card.',
  strand: 'decimal-system',
  ages: [5, 11],
  schema: [
    {
      kind: 'select', key: 'material', label: 'Material',
      options: [
        { value: 'golden-beads', label: 'Golden Beads' },
        { value: 'stamp-game', label: 'Stamp Game' },
        { value: 'hundred-board', label: 'Hundred Board' },
        { value: 'bead-frame', label: 'Bead Frame' },
        { value: 'fraction-circles', label: 'Fraction Circles' },
        { value: 'checkerboard', label: 'Checkerboard' },
      ],
    },
    {
      kind: 'select', key: 'difficulty', label: 'Difficulty',
      options: [
        { value: 'gentle', label: 'Gentle' },
        { value: 'steady', label: 'Steady' },
        { value: 'challenge', label: 'Challenge' },
      ],
      help: 'Gentle stays in the first presentation range; challenge adds carrying, borrowing across zero, and bigger numbers.',
    },
    { kind: 'number', key: 'count', label: 'Number of cards', min: 8, max: 24, help: '8 cards fill one page.' },
  ],
  defaults: { material: 'golden-beads', difficulty: 'steady', count: 16 },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'golden-bead-deck', name: 'Golden bead deck',
      description: 'Sixteen build, exchange, and add tasks for the golden beads — after the exchange and addition lessons.',
      params: { material: 'golden-beads', difficulty: 'steady', count: 16 },
    },
    {
      id: 'stamp-game-deck', name: 'Stamp game deck',
      description: 'Sixteen tasks including take-away with borrowing — after the stamp game subtraction lesson.',
      params: { material: 'stamp-game', difficulty: 'steady', count: 16 },
    },
    {
      id: 'fraction-deck', name: 'Fraction circles deck',
      description: 'Eight gentle naming and equivalence tasks for the fraction circles — after the first fractions lessons.',
      params: { material: 'fraction-circles', difficulty: 'gentle', count: 8 },
    },
  ],
}
