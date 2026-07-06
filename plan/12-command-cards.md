# PRD 12 — Command Cards: printable task-card decks

**Status:** Not started
**Effort:** M — one self-contained generator module following the proven `GeneratorDef` contract; the work is breadth (11 task templates across 6 materials), not new architecture. No new pages, routes, or shared systems beyond a 3-line `SheetPage` prop addition.
**Depends on:** nothing (PRDs 00–08 are Done; this builds on the existing worksheet system from PRD 03)

## Why

A parent prints one deck, cuts it apart, and the child gains days of independent work: draw a card ("Build 2,467 with the golden beads. Exchange until no column holds more than nine."), do it with the virtual material or on paper, put the card in the "done" pile. The delight is autonomy for the child — the card tells them what to do, not the parent — and effortless prep for the parent, who checks the work against a one-page answer key. It also finally gives the interactive materials themselves printable follow-up work that is *about the material*, not just written drills.

## Binding product rules

From `CLAUDE.md` — these bind every step below:

1. **No tracking/gamification.** The deck is paper. No localStorage, no completed-card tracking on screen, no scores/timers/badges. The only "state" is the URL (seed + params), exactly like every existing generator.
2. **Practice happens on paper / with the material.** The cards direct the child to the physical or virtual material; the deck itself is printed and cut. Nothing new happens on screen beyond the existing builder preview.
3. **Print is first-class.** US Letter via `.print-sheet` / `.sheet-page` (see `src/styles/print.css`). Answer key on its own `.sheet-page` via `AnswerKeyPage`. **B&W:** the `.bw` class on `.print-sheet` zeroes all color variables — every card must be fully usable with no color: the task text carries 100% of the information; material glyphs are decorative (`aria-hidden`) and drawn with tokens so they degrade to black shapes.
4. **Fully static, no new dependencies.** Pure TS + React + plain CSS. Runtime deps stay react, react-dom, react-router-dom.
5. **Conventions.** TypeScript strict, `verbatimModuleSyntax` (use `import type`), no hex colors in components (tokens only — the two literal grays in `src/components/beads.tsx` are grandfathered; new SVGs use `var(--ink-soft)` etc.), all randomness through the injected `RNG`, colocated vitest in node env testing pure logic only.
6. **Montessori authenticity.** Card language uses real terminology (exchange, wire, stamp, bead bar, family), place colors come from `--pv-*` tokens, and every task mirrors a presentation that exists in the album lessons.

## Design decisions (locked — do not revisit)

- **One new generator module** `src/worksheets/generators/command-cards.tsx` exporting `def: GeneratorDef<CommandCardsParams, CommandCardsData>` — the exact contract in `src/worksheets/types.ts` (`slug`, `name`, `description`, `strand`, `ages`, `schema: ParamField[]`, `defaults`, `generate(params, rng)`, `Sheet`, `AnswerKey`, `presets`). House-style reference: `src/worksheets/generators/math-facts.tsx`.
- **Params (schema):** `material` (select: `golden-beads | stamp-game | hundred-board | bead-frame | fraction-circles | checkerboard`), `difficulty` (select: `gentle | steady | challenge`), `count` (number, min 8, max 24, default 16). **Cards per page is FIXED at 8** (2 cols × 4 rows) — a constant, not a param.
- **`strand: 'decimal-system'`, `ages: [5, 11]`.** Rationale (index placement compromise): the `/worksheets` index groups generators by strand and each generator has exactly one `strand: StrandId`. Command cards span six materials across four strands, but the heart of the deck idea — fetch, build, exchange — is decimal-system work (golden beads, stamp game). It therefore files under `decimal-system` with a deliberately wide age band covering hundred-board (ages 5–7) through checkerboard (7–11); the `description` states explicitly that decks exist for materials in other strands too.
- **Card shape:** `{ id, materialSlug, template, text, answer: string, difficulty }`. Answers are strings (they may be prose like `'2 thousands, 4 hundreds, 6 tens, 7 units'`).
- **Dedupe:** no two cards in one deck share the same `text`.
- **Sheet:** fixed 2×4 grid per `.sheet-page`, each card **3.4in × 2.2in** with **1px dashed cut borders in `var(--ink-soft)`**, a scissors glyph (✂) on the sheet corner, and each card face showing: card number, a small decorative material glyph, and the task text at ≥ 1.05rem.
- **AnswerKey:** numbered list using the existing `.answer-list` class (defined in `src/styles/worksheets.css`).
- **Presets (3):** `golden-bead-deck` (golden-beads, steady, 16), `stamp-game-deck` (stamp-game, steady, 16), `fraction-deck` (fraction-circles, gentle, 8).
- **Registration:** one import + one array entry in `src/worksheets/registry.ts`, plus `'command-cards'` appended to `worksheetSlugs` in the six materials' `def.ts` files. Referencing the deck from lessons' `followUpWork` is **out of scope** (see below).
- **Templates and difficulty ranges:** exactly as specified in step 2. Do not invent new templates.

> Shared-file note (CLAUDE.md): `src/worksheets/registry.ts`, `src/worksheets/SheetPage.tsx`, and the six `def.ts` files are shared. A solo implementer edits them directly per steps 5–7. If this PRD runs as a parallel agent, create only `command-cards.tsx/.css/.test.ts` and report the step 5–7 diffs back to the session lead instead of applying them.

## Implementation steps

### Step 1 — `src/worksheets/SheetPage.tsx` (modified): optional `className`

The card grid needs page-level CSS hooks (tighter header margins, `position: relative` for the scissors corner glyph). Add an optional pass-through class — additive, no caller changes:

```tsx
export interface SheetPageProps {
  title: string
  /** Italic line under the header telling the child what to do. */
  instructions?: string
  /** Show the Name/Date blanks (off for answer keys). */
  nameDate?: boolean
  /** Extra class on the .sheet-page section (e.g. 'command-cards-page'). */
  className?: string
  children: ReactNode
}

export function SheetPage({ title, instructions, nameDate = true, className, children }: SheetPageProps) {
  return (
    <section className={className ? `sheet-page ${className}` : 'sheet-page'}>
```

(Rest of the component unchanged; `AnswerKeyPage` unchanged.)

**Check:** `npm test` and `npm run build` still green (no existing caller passes `className`; all 12 existing generators render as before).

### Step 2 — `src/worksheets/generators/command-cards.tsx` (new): types + generation

Imports (respect `verbatimModuleSyntax`):

```tsx
import type { RNG } from '../../lib/rng'
import type { GeneratorDef, SheetProps } from '../types'
import type { PlaceCounts, PlacePower } from '../../lib/placeValue'
import { PLACE_ORDER, countsFromNumber, formatNumber, placeInfo, totalValue } from '../../lib/placeValue'
import { EQUIVALENCE_TARGETS, equivalentFills, familyName } from '../../materials/fraction-circles/model'
import { BeadShape, TenBar } from '../../components/beads'
import { StampTile } from '../../components/StampTile'
import { AnswerKeyPage, SheetPage } from '../SheetPage'
import './command-cards.css'
```

(`src/materials/fraction-circles/model.ts` is pure TS with no React and no imports from `src/worksheets/`, so there is no cycle; generators already import from `src/components/` — see `golden-bead-pictures.tsx` line 14.)

Types — note `type`, not `interface`, so the params satisfy the `ParamValues` constraint the same way `MathFactsParams` does:

```tsx
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
```

Shared helpers (module scope):

```tsx
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
```

**Task templates.** Every template returns `Omit<CommandCard, 'id'>`. Text patterns are LOCKED verbatim (tests parse them). All numbers in card text are rendered with `formatNumber`.

**golden-beads** — template cycle `['build-a-number', 'exchange-till-legal', 'make-then-add']`:

| Template | rng ranges per difficulty | Text pattern | Answer |
|---|---|---|---|
| build-a-number | gentle `n = rng.int(100, 999)`; steady & challenge `n = rng.int(1000, 9999)` | `Build ${formatNumber(n)} with the golden beads. Lay it out by place, largest first.` | `placeWords(n)` |
| exchange-till-legal | see algorithm below | `Put out ${countWords(counts)}. Exchange until no column holds more than nine. What number do you have?` | `formatNumber(totalValue(counts))` |
| make-then-add | gentle `a, b = rng.int(100, 499)` each (sum ≤ 998 keeps every gentle number < 1000); steady `a, b = rng.int(1000, 4999)`; challenge: forced-carry digit construction below | `Build ${formatNumber(a)} and ${formatNumber(b)} on the mat. Push them together and exchange. What is the sum?` | `formatNumber(a + b)` |

*exchange-till-legal counts algorithm* (uses `PlacePower` 0=units, 1=tens, 2=hundreds, 3=thousands):

- gentle — 1 over-nine column, total stays < 1,000: `over = rng.pick([0, 1] as PlacePower[])`; `counts[over] = rng.int(11, 19)`; the other of {0,1} gets `rng.int(0, 9)`; `counts[2] = rng.int(0, 8)`. (Max total 8·100 + 19·10 + 9 = 999.)
- steady — 2 over columns: `overs = rng.shuffle([0, 1, 2] as PlacePower[]).slice(0, 2)`; each over gets `rng.int(11, 19)`, the remaining one `rng.int(0, 9)`; `counts[3] = rng.int(0, 7)`. (Max total 9,099 ≤ 9,999.)
- challenge — 3 over columns: powers 0,1,2 all get `rng.int(11, 19)`; `counts[3] = rng.int(0, 7)`. (Max total 9,109 ≤ 9,999.)
- Drop zero entries from the object (`if (c > 0) counts[p] = c`), so `countWords` never prints "0 tens".

*make-then-add challenge construction* (guaranteed units carry, sum ≤ 9,998): units `u1 = rng.int(5, 9)`, `u2 = rng.int(10 - u1, 9)` (so `u1 + u2 ≥ 10`); tens and hundreds digits `rng.int(0, 9)` each; thousands digits `rng.int(1, 4)` each; assemble `a` and `b` from digits.

**stamp-game** — template cycle `['build-a-number', 'exchange-till-legal', 'make-then-add', 'take-away']`. The first three reuse the golden-beads number/count builders verbatim (same difficulty ranges); only the wording changes:

| Template | Text pattern | Answer |
|---|---|---|
| build-a-number | `Lay out ${formatNumber(n)} with stamps. Read it back, place by place.` | `placeWords(n)` |
| exchange-till-legal | `Put out ${countWords(counts)} in stamps. Exchange until no column holds more than nine. What number do you have?` | `formatNumber(totalValue(counts))` |
| make-then-add | `Make ${formatNumber(a)} and ${formatNumber(b)} with stamps. Join them and exchange. What is the sum?` | `formatNumber(a + b)` |
| take-away | `Make ${formatNumber(a)} with stamps. Take away ${formatNumber(b)}, exchanging when a column runs short. What is left?` | `formatNumber(a - b)` |

*take-away digit construction* (all subtractions positive by construction; digits indexed `d[3]`=thousands … `d[0]`=units):

- gentle — 3-digit, **no borrow anywhere**: `a2 = rng.int(2, 9)`, `a1 = rng.int(1, 9)`, `a0 = rng.int(1, 9)`; `b2 = rng.int(1, a2 - 1)`, `b1 = rng.int(0, a1)`, `b0 = rng.int(0, a0)`.
- steady — 4-digit, **exactly one borrow** at `p = rng.pick([0, 1, 2])`: thousands always `a3 = rng.int(2, 9)`, `b3 = rng.int(1, a3 - 1)`. At place `p`: `aP = rng.int(0, 8)`, `bP = rng.int(aP + 1, 9)` (forces the borrow). At place `p + 1` (when `p + 1 < 3`): `a = rng.int(1, 9)`, `b = rng.int(0, a - 1)` (absorbs the borrow; when `p = 2` the thousands rule already absorbs it). Any remaining place among {0,1,2}: `a = rng.int(0, 9)`, `b = rng.int(0, a)`.
- challenge — **borrow across zero**: `a = a3 * 1000 + a0` with `a3 = rng.int(2, 9)`, `a0 = rng.int(0, 5)` (hundreds and tens are 0); `b3 = rng.int(1, a3 - 1)`, `b2 = rng.int(1, 9)`, `b1 = rng.int(1, 9)`, `b0 = rng.int(a0 + 1, 9)`. `b0 > a0` forces the borrow to ripple through both empty columns; `b3 < a3` guarantees `a > b`.

**hundred-board** — template cycle `['find-the-tile', 'skip-count-path']`. Geometry: tile `n` (1–100) sits at row `floor((n-1)/10)` (row 0 on top), column `(n-1) % 10`. So **below = n + 10** (needs `n ≤ 90`), **above = n − 10** (needs `n ≥ 11`), **right = n + 1** (needs `n % 10 ≠ 0`), **left = n − 1** (needs `n % 10 ≠ 1`). Edge exclusion is done **by construction**, never by reroll:

| Difficulty | find-the-tile | skip-count-path |
|---|---|---|
| gentle | direction `rng.pick(['below', 'right'])`; below: `n = rng.int(1, 50)`; right: `n = rng.int(0, 4) * 10 + rng.int(1, 9)` (1–49, never a multiple of 10) | `n = rng.int(2, 6)`, `k = rng.int(3, 6)` (max 36) |
| steady | direction `rng.pick(['below', 'above', 'right', 'left'])`; below: `n = rng.int(1, 90)`; above: `n = rng.int(11, 100)`; right: `n = rng.int(0, 9) * 10 + rng.int(1, 9)`; left: `n = rng.int(0, 9) * 10 + rng.int(2, 10)` (2–100, never ≡ 1 mod 10) | `n = rng.int(2, 9)`, `k = rng.int(5, 8)` (max 72) |
| challenge | two-step, `rng.pick(['below-right', 'above-left'])`; below-right: `n = rng.int(0, 8) * 10 + rng.int(1, 9)` (1–89, `n % 10 ≠ 0`), answer `n + 11`; above-left: `n = rng.int(1, 9) * 10 + rng.int(2, 10)` (12–100, `n % 10 ≠ 1`), answer `n − 11` | `n = rng.int(2, 9)`, `k = rng.int(8, 10)` (max 90) |

Text patterns (answers are `String(...)`, no commas needed ≤ 100):

- below/above: `Place ${n} on the hundred board. What number lives directly ${'below' | 'above'} it?` → `String(n ± 10)`
- right/left: `Place ${n} on the hundred board. What number sits just to its ${'right' | 'left'}?` → `String(n ± 1)`
- below-right: `Place ${n} on the hundred board. Move one row down, then one tile right. What number do you land on?` → `String(n + 11)`
- above-left: `Place ${n} on the hundred board. Move one row up, then one tile left. What number do you land on?` → `String(n - 11)`
- skip-count-path: `On the hundred board, color every ${ordinal(n)} tile, starting at ${n}. What is the ${ordinal(k)} tile you color?` → `String(n * k)`

**bead-frame** — template cycle `['build-a-number', 'add-with-carry']`. Frame word: gentle/steady say `small`, challenge says `large` (matches `framePowers` in `src/materials/bead-frame/model.ts`: small = 4 wires to 9,999; large = 7 wires to 9,999,999):

| Template | Difficulty ranges | Text pattern | Answer |
|---|---|---|---|
| build-a-number | gentle: `n = rng.int(1, 9) * 10 + rng.int(1, 9)` (genuinely 2 wires); steady: `n = rng.int(1000, 9999)`; challenge: `n = rng.int(1_000_000, 9_999_999)` (7-wire large frame) | `On the ${frame} bead frame, slide beads to show ${formatNumber(n)}. Read it back, wire by wire.` | `placeWords(n)` |
| add-with-carry | digit constructions below | `Show ${formatNumber(a)} on the ${frame} bead frame. Add ${formatNumber(b)} wire by wire, exchanging whenever a wire fills. What is the sum?` | `formatNumber(a + b)` |

*add-with-carry constructions* (units carry always forced via `u1 = rng.int(5, 9)`, `u2 = rng.int(10 - u1, 9)`):

- gentle: tens digits `rng.int(1, 4)` each → 2-digit + 2-digit, sum ≤ 98, small frame.
- steady: thousands digits `rng.int(1, 4)` each, hundreds/tens digits `rng.int(0, 9)` each → 4-digit + 4-digit, sum ≤ 9,998, small frame.
- challenge: hundred-thousands digits forced-carry pair `h1 = rng.int(1, 9)`, `h2 = rng.int(10 - h1, 9)` (sum crosses into the millions wire); ten-thousands through tens digits `rng.int(0, 9)` each → 6-digit + 6-digit, sum 1,000,00x–1,999,998 ≤ 9,999,999, large frame.

**fraction-circles** — small enumerable space, so this material is generated by **enumerate → shuffle → take**, not by rejection (see step 3):

- fill-the-whole, one card per `den` in 2..10: `Lift one ${familyName(den)} piece from its circle. How many ${familyName(den, true)} make one whole?` → `String(den)` (e.g. den 8: "…one eighth… How many eighths make one whole?" → `'8'`).
- equivalence — **only exact-integer pairs**, built at module scope from the real model: `EQUIVALENCE_TARGETS.flatMap((t) => equivalentFills(t).map((f) => ({ target: t, fill: f })))`. This yields exactly these 8 pairs (verify by hand):

  | target | covering family | count (answer) |
  |---|---|---|
  | 1/2 | fourths | 2 |
  | 1/2 | sixths | 3 |
  | 1/2 | eighths | 4 |
  | 1/2 | tenths | 5 |
  | 1/3 | sixths | 2 |
  | 1/3 | ninths | 3 |
  | 1/4 | eighths | 2 |
  | 1/5 | tenths | 2 |

  Text: `Lift out one ${familyName(t.den)}. How many ${familyName(f.den, true)} cover it exactly? Prove it with the pieces.` → `String(f.count)` (e.g. "…one fifth. How many tenths cover it exactly?…" → `'2'`).
- Pools: gentle = 9 fill-the-whole + the 4 pairs with target 1/2 → **13 distinct cards**; steady and challenge = 9 + all 8 pairs → **17 distinct cards**.

**checkerboard** — single template `['place-the-bar']`. Bottom-row squares are worth 10^0 … 10^8 (`squarePower(0, col) = col`, `COLS = 9` in `src/materials/checkerboard/model.ts`):

- `b = rng.int(2, 9)`; power `p`: gentle `rng.int(0, 3)`, steady `rng.int(2, 6)`, challenge `rng.int(4, 8)`.
- Text: `Put a ${b}-bar on the ${formatNumber(10 ** p)} square of the checkerboard. How much is it worth?` → `formatNumber(b * 10 ** p)` (e.g. b=7, p=4: "Put a 7-bar on the 10,000 square…" → `'70,000'`).

**Check:** module compiles (`npm run build`); no React rendering yet required.

### Step 3 — `generate` in `command-cards.tsx`: dedupe, balance, shuffle

```tsx
const DEDUPE_ATTEMPTS = 100

function generate(params: CommandCardsParams, rng: RNG): CommandCardsData {
  const drafts =
    params.material === 'fraction-circles'
      ? fractionDeck(params.difficulty, params.count, rng)
      : templateDeck(params, rng)
  const shuffled = rng.shuffle(drafts)
  return { cards: shuffled.map((c, i) => ({ ...c, id: i + 1 })) }
}
```

- `templateDeck` — for each `i` in `0..count-1`, use `template = cycle[i % cycle.length]` (the material's template cycle from step 2 — guarantees a balanced deck), build a card, and re-roll up to `DEDUPE_ATTEMPTS` times while its `text` is already in a `used: Set<string>`. After 100 failed attempts keep the duplicate (never infinite-loop; with the ranges above the distinct space per template is ≥ 20, so a collision surviving 100 attempts is vanishingly rare — collision odds at worst (11/12)^100 with the pre-widened ranges, and all specified spaces are wider than that).
- `fractionDeck` — build the full distinct pool for the difficulty (13 or 17 cards, step 2), `rng.shuffle(pool)`, then take `pool[i % pool.length]` for `i` in `0..count-1`. Count is always honored; texts only repeat when `count` exceeds the pool (only possible for fraction-circles, e.g. gentle count > 13), and repeats are deterministic.
- Final `rng.shuffle` hides the template cycle so the printed deck feels mixed; ids are assigned **after** the shuffle, so the answer key (sorted by id) matches the printed card numbers.

**Check:** temporary scratch: `def.generate({ material: 'golden-beads', difficulty: 'steady', count: 16 }, createRng(42))` returns 16 cards, ids 1..16, no two texts equal. (This becomes a real test in step 8.)

### Step 4 — `Sheet`, `AnswerKey`, glyphs, and `def` in `command-cards.tsx`

`Sheet` — chunk cards into pages of `CARDS_PER_PAGE` (copy the `chunk` helper pattern from `math-facts.tsx` lines 145–151):

```tsx
function Sheet({ data, params }: SheetProps<CommandCardsParams, CommandCardsData>) {
  const pages = chunk(data.cards, CARDS_PER_PAGE)
  const title = `Command Cards — ${MATERIAL_LABEL[params.material]}`
  return (
    <>
      {pages.map((page, i) => (
        <SheetPage
          key={i}
          className="command-cards-page"
          title={pages.length > 1 ? `${title} (page ${i + 1} of ${pages.length})` : title}
          instructions="Cut the cards apart along the dashed lines. Draw one card at a time and do the work with the material — then check together with the key."
          nameDate={false}
        >
          <span className="command-cards-scissors" aria-hidden="true">✂</span>
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
        </SheetPage>
      ))}
    </>
  )
}
```

`nameDate={false}`: a cut-apart deck is not a fill-in worksheet. Height budget on paper: header ≈ 0.45in + instructions ≈ 0.35in + 4 × 2.2in rows = ≈ 9.6in ≤ 10in printable height (Letter minus 0.5in `@page` margins) — no clipping.

`MaterialGlyph` — decorative only (`aria-hidden="true"` on every SVG), so B&W safety is carried entirely by the text:

- `golden-beads`: `<TenBar beadSize={9} />` from `src/components/beads.tsx` (golden ten-bar, ≈ 90×9px).
- `stamp-game`: `<StampTile value={100} size={20} asDiv />` from `src/components/StampTile.tsx` (`.stamp-tile` styles are global in `src/styles/materials.css`; the printed "100" carries identity even in `.bw`).
- `hundred-board`: local `HundredBoardGlyph` — `<svg width={22} height={22} viewBox="0 0 36 36" aria-hidden="true">` with nine 10×10 `<rect>`s at x/y ∈ {1.5, 12.5, 23.5}, `fill="none" stroke="var(--ink-soft)" strokeWidth={1.5}`.
- `bead-frame`: local `BeadFrameGlyph` — `<svg width={36} height={22} viewBox="0 0 60 36" aria-hidden="true">`: three horizontal `<line>`s (y = 8, 18, 28; x 2→58; `stroke="var(--ink-soft)" strokeWidth={1.5}`) carrying `BeadShape` circles (r = 4) — 3 beads on the top wire `fill="var(--pv-unit)"`, 2 on the middle `var(--pv-ten)`, 1 on the bottom `var(--pv-hundred)`.
- `fraction-circles`: local `FractionGlyph` — `<svg width={22} height={22} viewBox="0 0 32 32" aria-hidden="true">`: `<circle cx={16} cy={16} r={14} fill="none" stroke="var(--ink)" strokeWidth={1.5} />` plus one filled quarter sector `<path d="M16,16 L16,2 A14,14 0 0 1 30,16 Z" fill="var(--fraction-shade)" stroke="var(--ink)" strokeWidth={1} />`.
- `checkerboard`: local `CheckerboardGlyph` — `<svg width={38} height={16} viewBox="0 0 57 24" aria-hidden="true">`: three 16×16 `<rect>`s at x = 1, 20, 39, y = 4, `fillOpacity={0.5} stroke="var(--ink-soft)"`, fills left→right `var(--pv-hundred)`, `var(--pv-ten)`, `var(--pv-unit)`.

`AnswerKey`:

```tsx
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
```

`def` (metadata verbatim — `content.test.ts` checks description/preset text non-empty, ≥ 2 presets, defaults within schema):

```tsx
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
```

**Check:** `npm run build` green (strict tsc catches unused imports/params).

### Step 5 — `src/worksheets/generators/command-cards.css` (new)

All classes prefixed `command-card` (house convention, see `math-facts.css` line 1). Imported by `command-cards.tsx` (step 2). Contents:

```css
/* Command cards — generator-specific styles (all classes prefixed command-card). */

.command-cards-page { position: relative; }
/* Tighter chrome so 4 × 2.2in card rows + header fit inside 10in of printable height. */
.command-cards-page .sheet-header { margin-bottom: 0.15in; }
.command-cards-page .sheet-instructions { margin-bottom: 0.15in; }

.command-cards-scissors { position: absolute; top: 0.05in; right: 0.05in; font-size: 1.1rem; color: var(--ink-soft); }

.command-cards-grid { display: grid; grid-template-columns: repeat(2, 3.4in); grid-auto-rows: 2.2in; justify-content: center; }

/* Cut lines; adjacent 1px dashed borders double up into one visible cut guide. */
.command-card { border: 1px dashed var(--ink-soft); padding: 0.1in 0.14in; display: flex; flex-direction: column; gap: 0.05in; overflow: hidden; }
.command-card-top { display: flex; justify-content: space-between; align-items: center; min-height: 0.28in; }
.command-card-number { font-size: 0.72rem; color: var(--ink-soft); }
.command-card-text { font-size: 1.05rem; line-height: 1.3; margin: 0; }

/* Prose answers ('2 thousands, 4 hundreds…') need wider columns than the 4-col default. */
.answer-list.command-cards-key { columns: 2; }
```

**Check:** in the dev preview, one page shows exactly 8 cards in 2×4, dashed borders, ✂ at the top-right sheet corner; the longest text (a challenge bead-frame add with two 6-digit numbers) fits inside 3.4in × 2.2in without clipping.

### Step 6 — `src/worksheets/registry.ts` (modified)

Exact diff — one import after line 13 (`decimals`) and one array entry after `decimals,`:

```ts
import { def as decimals } from './generators/decimals'
import { def as commandCards } from './generators/command-cards'
```

```ts
  fractions,
  decimals,
  commandCards,
]
```

**Check:** `/worksheets` index shows "Command Cards" under **The Decimal System**; `content.test.ts` "every generator meets its contract" passes for `command-cards` (≥ 2 presets, defaults satisfy schema, deterministic generate).

### Step 7 — six `src/materials/*/def.ts` files (modified): link the deck

Append `'command-cards'` to `worksheetSlugs` (current values verified in the codebase):

| File | Current `worksheetSlugs` | New |
|---|---|---|
| `src/materials/golden-beads/def.ts` | `['golden-bead-pictures', 'place-value', 'multi-digit-ops']` | `[…, 'command-cards']` |
| `src/materials/stamp-game/def.ts` | `['multi-digit-ops']` | `['multi-digit-ops', 'command-cards']` |
| `src/materials/hundred-board/def.ts` | `['hundred-chart', 'skip-counting']` | `[…, 'command-cards']` |
| `src/materials/bead-frame/def.ts` | `['multi-digit-ops', 'place-value']` | `[…, 'command-cards']` |
| `src/materials/fraction-circles/def.ts` | `['fractions']` | `['fractions', 'command-cards']` |
| `src/materials/checkerboard/def.ts` | `['long-multiplication']` | `['long-multiplication', 'command-cards']` |

Do this **after** step 6 — `content.test.ts` ("links … resolve", line 102) requires every `worksheetSlugs` entry to exist in `GENERATORS`.

**Check:** each of the six material pages (e.g. `/materials/stamp-game`) lists "Command Cards" in its related-worksheets section (rendered by `src/materials/MaterialPage.tsx` from `worksheetSlugs`).

### Step 8 — tests (see Testing section) then full verification

**Check:** `npm test` green (all suites, including untouched ones and `src/lessons/content.test.ts`); `npm run build` green.

## New & modified files

| Path | New/modified | Purpose |
|---|---|---|
| `src/worksheets/generators/command-cards.tsx` | new | Generator: types, 11 templates, `generate`, `Sheet`, `AnswerKey`, glyphs, `def` |
| `src/worksheets/generators/command-cards.css` | new | Card grid, cut borders, scissors corner, key columns |
| `src/worksheets/generators/command-cards.test.ts` | new | Pure-logic vitest suite (node env) |
| `src/worksheets/SheetPage.tsx` | modified | Optional `className` pass-through on `.sheet-page` |
| `src/worksheets/registry.ts` | modified | Import + register `commandCards` |
| `src/materials/golden-beads/def.ts` | modified | Append `'command-cards'` to `worksheetSlugs` |
| `src/materials/stamp-game/def.ts` | modified | Append `'command-cards'` |
| `src/materials/hundred-board/def.ts` | modified | Append `'command-cards'` |
| `src/materials/bead-frame/def.ts` | modified | Append `'command-cards'` |
| `src/materials/fraction-circles/def.ts` | modified | Append `'command-cards'` |
| `src/materials/checkerboard/def.ts` | modified | Append `'command-cards'` |
| `plan/12-command-cards.md` | modified | Status → Done when landing |

## Testing

`src/worksheets/generators/command-cards.test.ts`, following the conventions of `src/worksheets/generators/math-facts.test.ts` (import `def` + types, `createRng` from `../../lib/rng`, a `gen(overrides, seed)` helper spreading `def.defaults`). Constants: `SEEDS = [1, 7, 42, 1234, 987654]`, `MATERIALS: CardMaterial[]` (all six), `DIFFS: Difficulty[]` (all three).

Because text patterns are locked (step 2), tests recompute answers **independently by parsing the text**: helper `nums(text: string): number[]` extracts every integer via `/\d[\d,]*/g` + strip commas, and helper `parseCounts(text)` extracts `(count, place)` pairs via `/(\d+) (million|hundred-thousand|ten-thousand|thousand|hundred|ten|unit)s?\b/g` mapped to place values 10^6…10^0. Cards carry `template`, so tests dispatch on it.

`describe('command-cards: answer-key correctness')`
- `it('every card answer recomputes independently across 5 seeds × 6 materials × 3 difficulties')` — for every seed/material/difficulty at `count: 16`, per template: `build-a-number` → answer equals the independently-built place words of the single parsed number (e.g. text with 2,467 → `'2 thousands, 4 hundreds, 6 tens, 7 units'`); `exchange-till-legal` → answer = formatted `Σ count·place` from `parseCounts` (e.g. "2 hundreds, 14 tens, 3 units" → `'343'`); `make-then-add`/`add-with-carry` → `formatNumber(a + b)` of the two parsed numbers; `take-away` → `formatNumber(a − b)`; `find-the-tile` → `n ± 1 / ± 10 / ± 11` chosen by keyword (`below` / `above` / `right` / `left` / `down, then one tile right` / `up, then one tile left`); `skip-count-path` → first parsed number × last parsed number (e.g. every 6th from 6, 6th tile → `'36'`); `fill-the-whole` → family name → `String(den)` ("eighths" → `'8'`); `equivalence` → covering den ÷ target den ("one fifth" + "tenths" → `'2'`); `place-the-bar` → `formatNumber(bar × square)` (7-bar on 10,000 → `'70,000'`).
- `it('exchange cards always start illegal: at least one parsed count is 10 or more')`

`describe('command-cards: parameter respect')`
- `it('honors count exactly for 8, 13, 16, 24 across all six materials')` — `data.cards` length equals count; ids are exactly `1..count`.
- `it('gentle golden-beads cards keep every number under 1,000')` — for all `SEEDS` at `{ material: 'golden-beads', difficulty: 'gentle', count: 16 }`: every value from `nums(card.text)` **and** `nums(card.answer)` is `< 1000` (gentle add uses addends 100–499, so sums ≤ 998).
- `it('steady and challenge golden-beads and stamp-game numbers never exceed 9,999')`
- `it('challenge make-then-add always carries in the units')` — golden-beads and stamp-game, all seeds: for `make-then-add` cards, `(a % 10) + (b % 10) >= 10`.
- `it('stamp-game take-away respects the borrowing rules per difficulty')` — gentle: digit-wise `a_i ≥ b_i` (no borrow); steady: exactly one borrow when simulating right-to-left subtraction; challenge: minuend has 0 tens and 0 hundreds and `b % 10 > a % 10`.
- `it('hundred-board cards never leave the board')` — every parsed `n` is 1–100, every answer is 1–100, and edge rules hold (text contains `below` ⇒ n ≤ 90; `above` ⇒ n ≥ 11; `right` ⇒ n % 10 ≠ 0; `left` ⇒ n % 10 ≠ 1; two-step variants both constraints).
- `it('skip-count products stay within 100 and match the difficulty ranges')` — gentle n∈[2,6] k∈[3,6]; steady n∈[2,9] k∈[5,8]; challenge n∈[2,9] k∈[8,10]; `n*k ≤ 100`.
- `it('bead-frame difficulty picks the right frame and range')` — gentle: text says `small`, built numbers ≤ 99 and sums ≤ 98; steady: `small`, ≤ 9,999; challenge: text says `large`, build n ≥ 1,000,000 and add sums ≥ 1,000,000 and ≤ 9,999,999.
- `it('fraction equivalence cards only use exact-integer pairs')` — for every `equivalence` card across seeds/difficulties: covering den is divisible by target den and the answer equals the quotient; gentle decks only use target 1/2 pairs and fill-the-whole.
- `it('checkerboard squares match the difficulty power ranges')` — gentle square ∈ {1, 10, 100, 1000}; steady ∈ {100 … 1,000,000}; challenge ∈ {10,000 … 100,000,000}; bar 2–9.

`describe('command-cards: deck construction')`
- `it('no duplicate card texts within a deck')` — all seeds × difficulties: count 16 for five materials; for fraction-circles use count 12 at gentle (pool 13) and count 16 at steady/challenge (pool 17). Assert `new Set(texts).size === cards.length`.
- `it('fraction decks cycle their pool deterministically when count exceeds it')` — `{ material: 'fraction-circles', difficulty: 'gentle', count: 24 }`, seed 42: 24 cards; exactly `24 - 13 = 11` texts appear twice, none three times.
- `it('decks are template-balanced')` — golden-beads count 16: template multiset is {build 6, exchange 5, add 5} (cycle order before shuffle); stamp-game count 16: 4 of each of the 4 templates.
- `it('every card carries its material slug and difficulty')` — `card.materialSlug === params.material`, `card.difficulty === params.difficulty`.
- `it('every preset generates a valid deck with its count honored')` — for each of the 3 presets: `{ ...def.defaults, ...preset.params }`, seed 7; count honored, no duplicate texts, all answers non-empty.

`describe('command-cards: seed determinism')`
- `it('same seed and params produce identical decks')` — seed 2026, defaults: `expect(second).toEqual(first)` and identical `JSON.stringify`.
- `it('different seeds produce different decks')` — seeds 1 vs 2 on defaults: different JSON.

Also keep green (no edits needed): `src/lessons/content.test.ts` — it will automatically validate the new generator's metadata, presets, defaults-vs-schema, determinism, and that all six materials' `worksheetSlugs` resolve.

## Manual QA script

1. `npm run dev`, open `http://localhost:5173/worksheets` (or the LAN URL). Under **The Decimal System**, a "Command Cards" card appears with the ages 5–11 badge and three preset shortcuts.
2. Open `/worksheets/command-cards`. Defaults render: Golden Beads, Steady, 16 cards → two preview pages of 8 cards each (2 columns × 4 rows), each card showing "Card N", a small golden ten-bar, and a task sentence; ✂ sits at the top-right corner of each card page; a third page titled "Command Cards — Golden Beads — Answer Key" lists answers 1–16 in two columns.
3. Click "🎲 New problems" — all card texts change; copy the URL into a new tab — the identical deck reappears (seed in URL).
4. Switch **Material** through all six options. Verify per material: stamp-game decks include a "Take away" card; hundred-board decks mix "Place N…" and "color every…" cards; bead-frame Challenge says "large bead frame" with 7-digit numbers; fraction-circles cards name pieces ("How many eighths make one whole?"); checkerboard cards read "Put a 7-bar on the 10,000 square…".
5. Set Material = Golden Beads, Difficulty = Gentle: no number anywhere on the cards reaches 1,000. Set Challenge: 4-digit numbers appear and every "Push them together" card carries in the units (check two by hand against the key).
6. Print preview (color): Ctrl+P on the default deck. Each card page fits one US Letter sheet — no card row clipped, no spill onto a blank page; the answer key starts on its own page; site header/nav absent.
7. Print preview (B&W): tick "Ink-friendly black & white", Ctrl+P again. Cards are fully readable — dashed cut lines, card numbers, and task text all present; glyphs are black/gray shapes; nothing on any card depends on color. Repeat for a fraction-circles deck (the quarter-circle glyph shows mid-gray, sector line visible).
8. Each preset button: "Golden bead deck", "Stamp game deck" (16 cards each), "Fraction circles deck" (8 cards, exactly one card page, no duplicate texts).
9. Mobile width: resize to 375px (or use device toolbar). The builder form stacks above the preview; the Letter-size preview scrolls horizontally inside `.builder-preview`; all form controls are tappable (≥ 44px).
10. Visit `/materials/golden-beads`, `/materials/stamp-game`, `/materials/hundred-board`, `/materials/bead-frame`, `/materials/fraction-circles`, `/materials/checkerboard` — each lists "Command Cards" among its related worksheets, linking to `/worksheets/command-cards`.
11. Print one page for real, cut a card, hand it to a child near the material. (Optional but the whole point.)

## Acceptance criteria

- [ ] `npm test` green (including the new `command-cards.test.ts` and the untouched `content.test.ts`)
- [ ] `npm run build` green (strict tsc + vite)
- [ ] `/worksheets/command-cards` renders decks for all 6 materials × 3 difficulties × counts 8–24 with no runtime errors
- [ ] Cards per page fixed at 8 (2×4); card size 3.4in × 2.2in; 1px dashed `var(--ink-soft)` cut borders; ✂ on each card page; card number + glyph + ≥ 1.05rem task text on every card
- [ ] Answer key renders on its own `.sheet-page` via `AnswerKeyPage` using `.answer-list`, numbered to match the printed card numbers
- [ ] Every template's answer verified by independent recomputation in tests across 5 seeds × 6 materials × 3 difficulties
- [ ] Deterministic: same seed + params ⇒ deep-equal deck; count always honored; no duplicate texts within a deck (fraction-circles: whenever count ≤ pool size)
- [ ] Difficulty contracts hold in tests: gentle golden-beads < 1,000 everywhere; challenge adds force a units carry; stamp-game take-away borrows per difficulty; hundred-board stays on the 1–100 board; fraction equivalence uses only the 8 exact-integer pairs; bead-frame gentle/steady = small frame, challenge = large
- [ ] US Letter print: no clipping in color mode; `.bw` mode loses zero information (text carries everything; glyphs decorative)
- [ ] No accounts, tracking, localStorage, analytics, gamification, external requests, or new npm dependencies introduced
- [ ] Registered in `src/worksheets/registry.ts`; `'command-cards'` present in all six materials' `worksheetSlugs`; the three presets work from `?preset=` links
- [ ] This PRD's Status flipped to Done with the landing commit hash

## Out of scope

- Referencing `command-cards` presets from album lessons' `followUpWork` (would touch `src/materials/*/lessons.ts` content — a separate content pass).
- Decks for the other 13 materials (snake game, racks & tubes, bead chains, …) — the template architecture supports adding them later as new `CardMaterial` values.
- Additional checkerboard templates (e.g. slide-the-diagonal); place-the-bar is the only locked template for it.
- Double-sided printing with answers on card backs, card-stock sizing options, or per-card difficulty mixing within one deck.
- Any on-screen "deck mode" (drawing cards virtually) — practice happens on paper, per the hard product rules.
- New shared components; the glyphs stay local to `command-cards.tsx`.
