# PRD 09 — Make-It-Yourself Material Kits (printable cut-out materials)

**Status:** Not started
**Effort:** L — seven kits × multi-page true-physical-size print layouts, plus a new site section (types, registry, two routes, index + detail pages, CSS, tests) and three small cross-link edits.
**Depends on:** nothing (wave 1 — PRDs 00–08 — is complete)

## Why

The site already tells parents "real materials beat screens" (`src/parents/guides/using-this-site.tsx`, "Virtual vs. physical — an honest word") and hand-waves at DIY substitutions. This feature makes that concrete: print-and-assemble kits that produce the *actual* material — large number cards that stack, stamp tiles in place colors, fraction circles, strip boards, a hundred board, golden bead cards, and play money — at true physical size from a home printer. Parents get a shelf of real materials for the cost of cardstock; children get material in their hands instead of on a screen, which is the whole Montessori point.

## Binding product rules

- **Print is first-class.** Every kit renders `.sheet-page` elements inside a `.print-sheet` (see `src/styles/print.css`: `@page { size: letter; margin: 0.5in }`, `.sheet-page { break-after: page }`). Printable area is therefore **7.5in × 10in** per page; no piece or grid may exceed it.
- **B&W must carry all information.** The `.bw` class on `.print-sheet` (see `src/styles/print.css` lines 115–142) collapses all `--pv-*`, `--golden*`, `--bead-*`, `--inset-frame` variables to black/white. Every kit piece must stay identifiable in `.bw` — via numerals, shape (red strips have unit divisions, blue don't), or the new `.kit-bw-tag` place letters (U/T/H/Th) that render *only* in `.bw`.
- **Fully static, offline, no new dependencies.** Kits are fixed React components — no RNG, no fetches, no fonts, no npm packages. The scissors glyph is the text character ✂ (U+2702), not an icon font.
- **No accounts / tracking / gamification.** Kits are documents. No "kits you've made" state, no localStorage, nothing interactive beyond the B&W toggle and Print button.
- **Montessori authenticity.** Place colors via tokens only: units `var(--pv-unit)` green, tens `var(--pv-ten)` blue, hundreds `var(--pv-hundred)` red, thousands `var(--pv-thousand)` green (see `src/styles/tokens.css`). Golden bead pictures reuse the shared SVGs in `src/components/beads.tsx`. **No hex literals in components** — hex is permitted only inside `.css` files (precedent: `print.css` uses `#000`).
- **TypeScript strict + `verbatimModuleSyntax`** — use `import type` for type-only imports. Tests are colocated Vitest in node env; test pure data/helpers, never React rendering.

## Design decisions (locked — do not revisit)

1. New top-level section **`src/kits/`** mirroring the worksheets pattern (`src/worksheets/`).
2. **`src/kits/types.ts`** exports exactly:
   ```ts
   import type { ComponentType } from 'react'

   export interface KitDef {
     slug: string
     name: string
     description: string
     /** Material slugs (src/materials/registry.ts) this kit builds the physical version of. */
     forMaterials: string[]
     /** Piece inventory, e.g. '36 number cards'. */
     pieces: string
     /** Numbered assembly steps incl. cardstock/scissors/laminate advice. */
     assembly: string[]
     /** Renders 1..n `.sheet-page` elements inside the caller's `.print-sheet`. */
     Pages: ComponentType
   }

   export type KitMeta = Omit<KitDef, 'Pages'>
   ```
3. **`src/kits/registry.ts`**: `export const KITS: KitDef[]`, `export function kitBySlug(slug: string): KitDef | undefined`, `export function kitsForMaterial(slug: string): KitDef[]`.
4. Routes **`/kits`** (index grouped by strand like `/worksheets`) and **`/kits/:slug`** (`KitPage`: description + assembly steps + `PrintButton` + color/B&W toggle reusing the `?bw=1` search-param pattern from `src/worksheets/BuilderPage.tsx` line 97: `const bw = searchParams.get('bw') === '1'`, applied as `` className={`print-sheet${bw ? ' bw' : ''}`} ``).
5. Each kit is **one file `src/kits/kits/<slug>.tsx`** exporting `meta: KitMeta` + `Pages` (plus pure constants/helpers for tests). Registry composes `{ ...meta, Pages }` (same pattern as `src/parents/registry.ts`).
6. **`src/materials/MaterialPage.tsx`** gets a "Make the real thing" card listing every kit whose `forMaterials` includes the material slug — lookup FROM the kits registry via `kitsForMaterial`, so `MaterialDef` (src/materials/types.ts) is untouched.
7. **`src/App.tsx`** gets the two routes. **`src/components/Layout.tsx` NAV is NOT changed** — kits are reachable from material pages, a card on the `/worksheets` index, and a link in the using-this-site guide.
8. **True physical size**: piece dimensions in CSS `in` units (browsers define `1in = 96px`, so shared SVG components sized in px print true: `96px = 1in`). Dashed cut lines `1px dashed var(--ink-soft)` (class `.kit-cut`); pieces with an intrinsic colored frame (stamp tiles, bills, strips) are instead cut along that frame with a 0.08in gap between pieces. A **1-inch calibration square** appears on every kit's first page ("measure this square; it must be exactly 1 inch").

## Implementation steps

### 1. `src/kits/types.ts` (new)
Exactly the code in Design decision 2.
**Check:** `npm run build` still green (file compiles standalone).

### 2. `src/styles/kits.css` (new) + import in `src/main.tsx`
All kit CSS lives here; no inline hex in components. Add to `src/main.tsx` after line 10 (`import './styles/worksheets.css'`): `import './styles/kits.css'`.

```css
/* ---------- Make-it-yourself kits (print pieces) ---------- */
.kit-grid { display: grid; gap: 0; }
.kit-grid-gapped { display: grid; gap: 0.08in; }
.kit-cut { border: 1px dashed var(--ink-soft); }
.kit-calibration { width: 1in; height: 1in; border: 2px solid #000; flex: none; }
.kit-cal-row { display: flex; gap: 0.25in; align-items: center; margin: 0.3in 0; }
.kit-legend { font-size: 0.9rem; font-style: italic; }
/* Place letter shown ONLY in B&W mode. */
.kit-bw-tag { display: none; position: absolute; top: 2px; left: 4px; font: 700 8pt var(--font-body); }
.print-sheet.bw .kit-bw-tag { display: block; }

.kit-number-card { position: relative; display: flex; align-items: center; justify-content: center;
  height: 1.9in; font: 700 1in var(--font-heading); color: var(--card-color); background: #fff; }

.kit-stamp-tile { position: relative; display: flex; align-items: center; justify-content: center;
  width: 1in; height: 1in; border: 3px solid var(--stamp-color); color: var(--stamp-color);
  font: 700 18pt var(--font-body); background: #fff; }

.kit-hb-tile { display: flex; align-items: center; justify-content: center;
  width: 0.75in; height: 0.75in; font: 700 20pt var(--font-heading); color: var(--ink); }
.kit-board-cell { width: 0.8in; height: 0.8in; border: 1px solid var(--line); }
.kit-board { display: grid; border: 2px solid var(--wood-dark); width: max-content; }

.kit-strip { position: relative; display: flex; align-items: center; justify-content: flex-end;
  height: 0.5in; border: 2px solid var(--strip-color); color: var(--strip-color);
  font: 700 14pt var(--font-heading); padding-right: 4px; background: #fff; }
.kit-strip-segs { position: absolute; inset: 0; display: flex; pointer-events: none; }
.kit-strip-seg { flex: 1; }
.kit-strip-seg + .kit-strip-seg { border-left: 2px solid var(--pv-ten); }
.print-sheet.bw .kit-strip-natural { border-color: #000; color: #000; }
.kit-strip-row { display: flex; flex-direction: column; gap: 0.12in; }
.kit-board-head { display: flex; align-items: center; justify-content: center;
  width: 0.5in; height: 0.5in; font: 700 13pt var(--font-heading); border: 1px solid var(--line); }
.kit-board-square { width: 0.5in; height: 0.5in; border: 1px solid var(--line); }
.kit-tenline { border-right: 3px solid var(--pv-hundred); }

.kit-sector { fill: var(--fraction-shade); stroke: #000; stroke-width: 1.5; }
.kit-sector-label { font: 700 11pt var(--font-body); fill: #000; text-anchor: middle; }
.kit-frame-ring { fill: none; stroke: var(--inset-frame); stroke-width: 7; }
.kit-cut-circle { fill: none; stroke: var(--ink-soft); stroke-width: 1; stroke-dasharray: 6 5; }

.kit-bead-card { position: relative; display: flex; align-items: center; justify-content: center; background: #fff; }
.kit-bill { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 3.3in; height: 1.5in; border: 3px solid var(--bill-color); color: var(--bill-color);
  font-family: var(--font-heading); background: #fff; }
.kit-bill-corner { position: absolute; font: 700 12pt var(--font-heading); }
.kit-bill-value { font-size: 34pt; font-weight: 700; line-height: 1; }
.kit-bill-words { font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; }
```
Notes: `--stamp-color` / `--card-color` / `--strip-color` / `--bill-color` are set inline per piece via the same custom-property trick used by `StampTile` (`src/components/StampTile.tsx` line 26) and `NumberCard` (line 35). In `.bw` they all resolve to `#000` because they reference `--pv-*` vars, except natural strips (`--wood-dark` is not overridden by `.bw`) — hence the explicit `.kit-strip-natural` override.
**Check:** dev server runs; no CSS parse errors in console.

### 3. `src/components/NumberCard.tsx` (modified — one word)
Line 10: change `function cardColor(value: number): string {` to `export function cardColor(value: number): string {`. The kit reuses the *color rule* (`(digits − 1) % 3` → unit/ten/hundred family, thousands green again) at kit-specific inch sizing.
**Check:** `npm run build` green; on-screen number-cards material unchanged.

### 4. `src/kits/pieces.tsx` (new) — shared print pieces
```tsx
import type { KitMeta } from './types'
import { SheetPage } from '../worksheets/SheetPage'

/** Every kit's first page: inventory, calibration square, cut legend. */
export function KitCover({ kit }: { kit: KitMeta }) {
  return (
    <SheetPage title={`${kit.name} — Kit`} nameDate={false}>
      <p><strong>In this kit:</strong> {kit.pieces}.</p>
      <div className="kit-cal-row">
        <div className="kit-calibration" />
        <p className="kit-legend">
          Print at 100% scale (“Actual size” — turn off “Fit to page”). This square must measure
          exactly 1 inch (2.54 cm) on each side. If it doesn’t, fix the print scale before cutting.
        </p>
      </div>
      <p className="kit-legend">✂ Cut along dashed lines; pieces with a colored frame are cut around the frame.</p>
    </SheetPage>
  )
}
```
`SheetPage` is the existing export of `src/worksheets/SheetPage.tsx` (`{ title, instructions?, nameDate?, children }`); `nameDate={false}` suppresses the Name/Date blanks.
**Check:** temporary render in dev shows a Letter page with the square; measure it on-screen at 96 dpi (browser zoom 100%): 96×96 px in devtools.

### 5–11. The seven kit files (`src/kits/kits/<slug>.tsx`, all new)

Every kit file has the shape below (shown complete for the stamp game; others list their meta, page manifest, and piece markup deltas). Each `Pages` starts with `<KitCover kit={meta} />`, then wraps every subsequent page in `SheetPage` with `nameDate={false}`.

**5. `stamp-game-tiles.tsx`** — full template:
```tsx
import type { CSSProperties } from 'react'
import type { KitMeta } from '../types'
import { SheetPage } from '../../worksheets/SheetPage'
import { KitCover } from '../pieces'

export const meta: KitMeta = {
  slug: 'stamp-game-tiles',
  name: 'Stamp Game Tiles',
  description: 'Sheets of 1-inch stamp tiles in place-value colors — cut a full stamp game from four pages.',
  forMaterials: ['stamp-game'],
  pieces: '192 tiles (48 each of 1, 10, 100, and 1,000)',
  assembly: [
    'Print all pages on cardstock at 100% scale; check the 1-inch square on page 1.',
    'Optional but recommended: laminate the sheets before cutting so the tiles survive small hands.',
    'Cut out the tiles with scissors or a paper cutter, following the colored frames.',
    'Sort into four small cups or bowls: green 1s, blue 10s, red 100s, green 1,000s — exactly as the stamp game lesson lays them out.',
  ],
}

export const STAMP_PLACES = [
  { value: 1, label: 'Units', tag: 'U', colorVar: 'var(--pv-unit)' },
  { value: 10, label: 'Tens', tag: 'T', colorVar: 'var(--pv-ten)' },
  { value: 100, label: 'Hundreds', tag: 'H', colorVar: 'var(--pv-hundred)' },
  { value: 1000, label: 'Thousands', tag: 'Th', colorVar: 'var(--pv-thousand)' },
] as const
export const TILES_PER_PAGE = 48 // 6 columns × 8 rows of 1in tiles + 0.08in gaps = 6.4in × 8.56in

export function Pages() {
  return (
    <>
      <KitCover kit={meta} />
      {STAMP_PLACES.map((p) => (
        <SheetPage key={p.value} title={`Stamp Game Tiles — ${p.label} (${p.value})`} nameDate={false}>
          <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(6, 1in)' }}>
            {Array.from({ length: TILES_PER_PAGE }, (_, i) => (
              <div key={i} className="kit-stamp-tile" style={{ '--stamp-color': p.colorVar } as CSSProperties}>
                <span className="kit-bw-tag">{p.tag}</span>
                {p.value}
              </div>
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}
```
**Check:** `/kits/stamp-game-tiles` shows 5 pages; toggling B&W turns frames black and reveals U/T/H/Th corner tags.

**6. `large-number-cards.tsx`** — slug `large-number-cards`, name "Large Number Cards", `forMaterials: ['number-cards', 'golden-beads']`, pieces "36 number cards (1–9,000)".
Exports:
```ts
export const CARD_VALUES: number[] = [1..9, 10..90, 100..900, 1000..9000] // 36 values, ascending
export function cardWidthIn(value: number): number { return String(value).length * 1.5 }
export const CARD_HEIGHT_IN = 1.9
export const PAGES: number[][] = [
  [1,2,3,4,5,6,7,8,9],          // 3×3 grid, 1.5in wide cards
  [10,20,30,40,50,60,70,80],    // 2×4 grid, 3in wide
  [90,100,200,300],             // stacked 1/row, ≤4.5in wide
  [400,500,600,700],
  [800,900,1000,2000],          // 1000+ are 6in wide
  [3000,4000,5000,6000],
  [7000,8000,9000],
]
```
Piece markup: `<div className="kit-number-card kit-cut" style={{ width: `${cardWidthIn(v)}in`, '--card-color': cardColor(v) } as CSSProperties}>` with `cardColor` imported from `../../components/NumberCard` (step 3) and a `.kit-bw-tag` of U/T/H/Th by digit count. Cards render the raw value (no comma), matching the on-screen `NumberCard`. Pages use `.kit-grid` (shared dashed edges, one cut per line); each row of stacked pages is a single-column grid. Width rule = digit count × 1.5in, so 3000+200+50+1 stacks to read 3251, exactly like the physical material (see comment atop `src/components/NumberCard.tsx`). Max card 6in × 1.9in ✓ fits; max page height 4 rows × 1.9in = 7.6in ✓.
Assembly must mention: cardstock, cutting on dashed lines, and stacking cards to compose numbers.
**Check:** page manifest renders 8 pages; card "9000" measures 6in wide in print preview.

**7. `paper-fraction-circles.tsx`** — slug `paper-fraction-circles`, name "Paper Fraction Circles", `forMaterials: ['fraction-circles']`, pieces "10 circles (whole through tenths) → 55 sectors, with frame rings".
Exports `export const CIRCLE_FAMILIES: number[] = [1,2,3,4,5,6,7,8,9,10]` (mirrors `DENOMINATORS` in `src/materials/fraction-circles/model.ts`).
Each circle is one inline SVG, `width: '3.7in'`, `viewBox="0 0 200 200"`:
- green frame ring: `<circle r={96} className="kit-frame-ring" />` (`--inset-frame` token, black in `.bw`),
- dashed cut circle: `<circle r={91} className="kit-cut-circle" />`,
- `n` sector paths radius 88 (for n = 1 a full `<circle>`), class `kit-sector` (fill `var(--fraction-shade)` — red in color per `tokens.css` line 22, mid-gray in `.bw` per `print.css` line 141, so black division lines stay visible),
- each sector labeled `1/n` (`.kit-sector-label`, at radius ≈ 55 along the sector bisector; the whole is labeled `1`).
Sector path for sector i of n: arc from angle `i·360/n − 90°` to `(i+1)·360/n − 90°`, both radii 88, `M 100 100 L x1 y1 A 88 88 0 0 1 x2 y2 Z`.
Page manifest: cover; p2 families 1–4 (2×2, rows 3.7in ⇒ 7.4in + header ✓); p3 families 5–8; p4 families 9–10.
Assembly must mention: glue the sheet to cardstock *before* cutting, cut out each disc just inside the green ring, then cut the sectors along the black lines; the green rings stay on the sheet as "frames" the child rebuilds circles inside; labels face up.
**Check:** 4 pages; in `.bw` sectors are gray with black lines and readable `1/n` labels.

**8. `strip-boards.tsx`** — slug `strip-boards`, name "Addition & Subtraction Strip Boards", `forMaterials: ['addition-strip-board', 'subtraction-strip-board']`, pieces "2 boards (2 pages each, taped) + 35 strips (9 blue, 9 red, 17 natural)".
Exports (pure, unit-tested):
```ts
export const STRIP_UNIT_IN = 0.5
export function stripWidthIn(n: number): number { return n * STRIP_UNIT_IN }
/** Strips longer than 15 units (7.5in printable width) print in two taped segments. */
export function naturalSegments(n: number): number[] { return n <= 15 ? [n] : [9, n - 9] }
```
Boards: 18 columns (`BOARD_COLUMNS` in `src/materials/addition-strip-board/model.ts`) × 12 working rows of 0.5in squares plus a 0.5in header row of numerals ⇒ each board is 9in × 6.5in, split into two half-pages of columns 1–9 and 10–18 (4.5in × 6.5in each), cut on the join edge (marked "tape this edge to the other half") and taped. Header colors follow the virtual materials: addition board 1–10 red / 11–18 blue with the vertical red line after column 10 (`RED_LINE_AFTER = 10`; `.kit-tenline`, matching `.addition-strip-board-tenline`'s `var(--pv-hundred)`); subtraction board 1–9 blue / 10–18 red (per the model comment in `src/materials/subtraction-strip-board/model.ts`). Board grid uses `.kit-board`, `.kit-board-head`, `.kit-board-square` — solid lines (boards are not cut apart).
Strips: height 0.5in, width `stripWidthIn(n)`, numeral right-aligned. Blue strips 1–9: `--strip-color: var(--pv-ten)`, plain. Red strips 1–9: `--strip-color: var(--pv-hundred)` with n−1 interior `.kit-strip-seg` dividers (blue unit-square lines, as on the real board — see `.addition-strip-board-seg` in `src/materials/addition-strip-board/addition-strip-board.css`). Natural strips 1–17: class `kit-strip kit-strip-natural`, `--strip-color: var(--wood-dark)`; 16 and 17 print as two segments each (`naturalSegments`) labeled "16 — part 1 of 2" etc. with a "tape ⇢" mark. `.kit-bw-tag` letters B / R / N on every strip (in `.bw`, plain-black blue and natural strips would otherwise look alike).
Page manifest: cover; p2–p3 addition board halves; p4–p5 subtraction board halves; p6 blue strips 1–9; p7 red strips 1–9; p8 natural 1–9; p9 natural 10–17 (10 rows incl. segments = 5in ✓).
Assembly must mention: cardstock, taping board halves, and that strip lengths are exact — strip 9 laid from column 1 must end exactly under the 9.
**Check:** 9 pages; blue strip 9 measures 4.5in in print preview; red strips show unit divisions.

**9. `hundred-board-tiles.tsx`** — slug `hundred-board-tiles`, name "Hundred Board & Tiles", `forMaterials: ['hundred-board']`, pieces "100 numbered tiles + a fold-out board on 2 pages".
Exports `export const TILE_VALUES: number[]` = 1…100 (must equal `ALL_TILES` from `src/materials/hundred-board/model.ts`).
Tiles: 0.75in `.kit-hb-tile kit-cut`, black numerals (`var(--ink)` — inherently B&W-safe), 9-column `.kit-grid`; p2 tiles 1–54 (6 rows), p3 tiles 55–100.
Board: blank 10×10 grid of 0.8in cells (tiles sit loosely inside, like the real board), split vertically — p4 columns 1–5, p5 columns 6–10 (each 4in × 8in ✓), cut/tape edge marked.
Assembly must mention: cardstock + laminate for the tiles; tape the board halves; and print the hundred chart worksheet (`/worksheets/hundred-chart`) as the control chart the child checks against.
**Check:** 5 pages; tile grid rows contain 9 tiles; board cells visibly larger than tiles.

**10. `golden-bead-cards.tsx`** — slug `golden-bead-cards`, name "Golden Bead Cards", `forMaterials: ['golden-beads']`, pieces "36 bead cards (9 each of unit, ten-bar, hundred square, thousand cube)".
Exports `export const BEAD_CARD_COUNTS = { unit: 9, ten: 9, hundred: 9, thousand: 9 } as const`.
Cards are `.kit-bead-card kit-cut` divs sized inline, each containing one shared SVG from `src/components/beads.tsx` at print scale (CSS defines 96px = 1in, so px props print true):
- unit card 1.1in × 1.1in: `<Bead size={27} />` (0.28in bead ≈ real 7mm–8mm at kit scale),
- ten card 3.1in × 0.8in: `<TenBar beadSize={27} />` (BeadBar width = beadSize × n = 270px = 2.81in — consistent 10× the unit),
- hundred card 2.9in × 2.9in: `<HundredSquare size={260} />` (2.71in ≈ the real ~7cm square),
- thousand card 2.9in × 2.9in: `<ThousandCube size={250} />`.
Page manifest: cover; p2 nine unit cards (6+3 across two rows) + nine ten cards (2 per row × 5 rows); p3 six hundred cards (2×3); p4 three hundred + three thousand cards; p5 six thousand cards. No numerals on the cards — like the real material, the card *is* the quantity.
Assembly must mention: cardstock; these substitute for the expensive bead cabinet pieces (units and tens are cheap to make from real beads — link the pipe-cleaner advice in the using-this-site guide); pair with the Large Number Cards kit for the bank game.
**Check:** 5 pages; in `.bw` the hundred square prints as black bead dots on white (per `--golden`→`#000`, `--golden-light`→`#fff` in `print.css`) — same behavior the golden-bead-pictures worksheet already has.

**11. `play-money.tsx`** — slug `play-money`, name "Place-Value Play Money", `forMaterials: ['golden-beads', 'stamp-game']`, pieces "30 bills (10 each of $1, $10, $100)".
Exports `export const DENOMINATIONS = [1, 10, 100] as const` and `export const BILLS_PER_DENOM = 10`.
Bills: `.kit-bill` 3.3in × 1.5in, `--bill-color` of `var(--pv-unit)` / `var(--pv-ten)` / `var(--pv-hundred)`; contents: two `.kit-bill-corner` numerals (top-left, bottom-right), center `.kit-bill-value` ($1 / $10 / $100) and `.kit-bill-words` ("ONE DOLLAR" / "TEN DOLLARS" / "ONE HUNDRED DOLLARS" — words carry the value in `.bw`). Grid `.kit-grid-gapped`, 2 columns × 5 rows per page.
Page manifest: cover; p2 ten $1; p3 ten $10; p4 ten $100.
Assembly must mention: this is the golden-bead extension into money — ten ones trade for a ten, ten tens for a hundred, the same exchange as beads and stamps; play "bank" with a die and pencil-and-paper recording.
**Check:** 4 pages; colors match place-value tokens; `.bw` bills readable by words/numerals.

### 12. `src/kits/registry.ts` (new)
```ts
import type { KitDef } from './types'
import { meta as largeNumberCardsMeta, Pages as LargeNumberCardsPages } from './kits/large-number-cards'
// ...same pair for each of the 7 kits
export const KITS: KitDef[] = [
  { ...largeNumberCardsMeta, Pages: LargeNumberCardsPages },
  { ...goldenBeadCardsMeta, Pages: GoldenBeadCardsPages },
  { ...playMoneyMeta, Pages: PlayMoneyPages },
  { ...stampGameTilesMeta, Pages: StampGameTilesPages },
  { ...hundredBoardTilesMeta, Pages: HundredBoardTilesPages },
  { ...stripBoardsMeta, Pages: StripBoardsPages },
  { ...paperFractionCirclesMeta, Pages: PaperFractionCirclesPages },
]
export function kitBySlug(slug: string): KitDef | undefined { return KITS.find((k) => k.slug === slug) }
export function kitsForMaterial(slug: string): KitDef[] { return KITS.filter((k) => k.forMaterials.includes(slug)) }
```
**Check:** `npm run build` green.

### 13. `src/kits/KitsIndex.tsx` (new)
Mirror `src/worksheets/WorksheetsIndex.tsx`: `<h1>Make-It-Yourself Kits</h1>`, a `.page-intro` paragraph (print at 100%, cardstock, everything works in B&W), then group kits by the strand of their first material — `STRANDS.map(...)` with `items = KITS.filter((k) => materialBySlug(k.forMaterials[0])?.strand === strand.id)`, skipping empty strands (imports: `STRANDS` from `../lib/strands`, `materialBySlug` from `../materials/registry`). Cards use the existing `.card-grid` / `.card` / `.section-label` classes (`src/styles/global.css`); each card shows `name`, `pieces` as a `.badge`, and `description`, linking to `/kits/${slug}`.
**Check:** `/kits` lists all 7 kits under strand headings.

### 14. `src/kits/KitPage.tsx` (new)
Mirror the layout skeleton of `BuilderPage` (`src/worksheets/BuilderPage.tsx`), minus params/seed/presets/answer-key:
- `const { slug } = useParams()`; `const kit = slug ? kitBySlug(slug) : undefined`; `if (!kit) return <NotFound />` (`src/pages/NotFound`).
- `const [searchParams, setSearchParams] = useSearchParams()`; `const bw = searchParams.get('bw') === '1'`.
- `<div className="no-print">`: `<h1>{kit.name}</h1>`, `.page-intro` = `kit.description`, and a "For use with:" line of `<Link to={`/materials/${s}`}>` for each `forMaterials` slug (names via `materialBySlug`).
- `.builder-layout` grid (reused from `src/styles/worksheets.css`): left `<aside className="builder-form card no-print">` with **In this kit** (`kit.pieces`), **Assembly** as `<ol>{kit.assembly.map(...)}</ol>`, the B&W checkbox (`label.field.checkbox`, exactly like BuilderPage lines 162–165, writing `bw=1|0` to search params with `{ replace: true }`), `.builder-actions` with `<PrintButton />` (`src/components/PrintButton.tsx` — `.btn primary no-print`, `window.print()`), and a `.field-help` note linking `/parents/using-this-site` for printing tips.
- right `<div className="builder-preview">` → `` <div className={`print-sheet${bw ? ' bw' : ''}`}><kit.Pages /></div> `` (assign `const Pages = kit.Pages` first so JSX sees a component).
**Check:** `/kits/play-money` renders; toggling the checkbox flips colors live and updates `?bw=` in the URL; Print button opens the dialog with only the pages.

### 15. `src/App.tsx` (modified)
Add imports `KitsIndex from './kits/KitsIndex'`, `KitPage from './kits/KitPage'`; add after the two worksheets routes (lines 24–25):
```tsx
<Route path="kits" element={<KitsIndex />} />
<Route path="kits/:slug" element={<KitPage />} />
```
Do **not** touch `NAV` in `src/components/Layout.tsx`.
**Check:** both routes load; nav bar unchanged.

### 16. `src/materials/MaterialPage.tsx` (modified)
Import `kitsForMaterial` from `../kits/registry`. Compute `const kits = kitsForMaterial(material.slug)` next to the existing `lessons`/`generators` lookups (lines 15–16). Insert directly after the "For parents" `</section>` (line 35):
```tsx
{kits.length > 0 && (
  <section className="card" style={{ marginTop: '1.5rem', maxWidth: '46rem' }}>
    <h2>Make the real thing</h2>
    {kits.map((k) => (
      <p key={k.slug} style={{ marginBottom: 0 }}>
        <Link to={`/kits/${k.slug}`}>{k.name}</Link> — {k.description} ({k.pieces})
      </p>
    ))}
  </section>
)}
```
**Check:** `/materials/stamp-game` shows two kit links (Stamp Game Tiles, Place-Value Play Money); `/materials/checkerboard` shows no card.

### 17. `src/worksheets/WorksheetsIndex.tsx` (modified)
After the closing of the `{STRANDS.map(...)}` block (line 45), before `</>`:
```tsx
<section>
  <p className="section-label">Beyond worksheets</p>
  <ul className="card-grid">
    <li>
      <Link className="card" to="/kits">
        <h3>Make-It-Yourself Kits</h3>
        <p>Print, cut, and assemble real Montessori materials — number cards, stamp tiles, fraction circles, strip boards, and more. True-size pieces on US Letter cardstock.</p>
      </Link>
    </li>
  </ul>
</section>
```
**Check:** card appears at the bottom of `/worksheets` and navigates to `/kits`.

### 18. `src/parents/guides/using-this-site.tsx` (modified)
In "Making your own materials", immediately after the intro paragraph ("A surprising amount of the shelf…", lines 60–63), add:
```tsx
<p>
  The fastest route is the <Link to="/kits">make-it-yourself kits</Link>: ready-to-print sheets of true-size
  pieces — number cards, stamp tiles, fraction circles, strip boards, a hundred board, bead cards, and play
  money — each with cut lines, assembly steps, and a 1-inch calibration square so you know the print came out
  at real size. What follows are craft-store substitutions for the pieces that can’t come out of a printer.
</p>
```
**Check:** `/parents/using-this-site` shows the paragraph; link works.

### 19. `src/kits/content.test.ts` (new) — see Testing.

### 20. Bookkeeping (on landing)
Add the `| 09 | [Material kits](09-material-kits.md) | … |` row to `plan/README.md`, set this PRD's Status, commit as one phase ("Add make-it-yourself material kits section").

## New & modified files

| Path | New/Modified | Purpose |
|---|---|---|
| `src/kits/types.ts` | new | `KitDef` / `KitMeta` |
| `src/kits/registry.ts` | new | `KITS`, `kitBySlug`, `kitsForMaterial` |
| `src/kits/pieces.tsx` | new | `KitCover` (calibration square, cut legend) |
| `src/kits/KitsIndex.tsx` | new | `/kits` index grouped by strand |
| `src/kits/KitPage.tsx` | new | `/kits/:slug` detail + print preview + B&W toggle |
| `src/kits/kits/large-number-cards.tsx` | new | kit 1 |
| `src/kits/kits/golden-bead-cards.tsx` | new | kit 2 |
| `src/kits/kits/play-money.tsx` | new | kit 3 |
| `src/kits/kits/stamp-game-tiles.tsx` | new | kit 4 |
| `src/kits/kits/hundred-board-tiles.tsx` | new | kit 5 |
| `src/kits/kits/strip-boards.tsx` | new | kit 6 |
| `src/kits/kits/paper-fraction-circles.tsx` | new | kit 7 |
| `src/kits/content.test.ts` | new | registry contract + pure helper tests |
| `src/styles/kits.css` | new | all `.kit-*` classes |
| `src/main.tsx` | modified | import `kits.css` |
| `src/components/NumberCard.tsx` | modified | export `cardColor` |
| `src/App.tsx` | modified | two `/kits` routes |
| `src/materials/MaterialPage.tsx` | modified | "Make the real thing" card |
| `src/worksheets/WorksheetsIndex.tsx` | modified | kits card |
| `src/parents/guides/using-this-site.tsx` | modified | kits paragraph |
| `plan/README.md` | modified (on landing) | PRD row |

## Testing

`src/kits/content.test.ts`, Vitest node env, following the style of `src/lessons/content.test.ts` (import registries, loop, no React rendering — importing `.tsx` kit modules is fine; `src/lessons/content.test.ts` already imports `GENERATORS`, which pulls in `.tsx` files).

```
describe('kits registry')
  it('has the seven wave-2 kits')
      → KITS.length === 7; kitBySlug('stamp-game-tiles')?.name === 'Stamp Game Tiles';
        kitBySlug('nope') === undefined
  it('slugs are unique')
      → new Set(KITS.map(k => k.slug)).size === KITS.length
  it('every kit fills every field')
      → per kit: name/description/pieces trimmed non-empty; assembly.length > 0 and every
        step trimmed non-empty; forMaterials.length > 0; typeof Pages === 'function'
  it('every forMaterials slug resolves against MATERIALS')
      → for each slug: MATERIALS.some(m => m.slug === s) (import MATERIALS from '../materials/registry')
  it('kitsForMaterial looks up from the material side')
      → kitsForMaterial('stamp-game').map(k => k.slug) contains 'stamp-game-tiles' and 'play-money';
        kitsForMaterial('golden-beads') contains 'golden-bead-cards', 'large-number-cards', 'play-money';
        kitsForMaterial('checkerboard') deep-equals []

describe('large number cards')
  it('has all 36 card values in order')
      → CARD_VALUES.length === 36; CARD_VALUES[0] === 1; CARD_VALUES includes 90, 600, 9000
  it('card width is 1.5in per digit')
      → cardWidthIn(7) === 1.5; cardWidthIn(40) === 3; cardWidthIn(600) toBeCloseTo(4.5);
        cardWidthIn(9000) === 6
  it('page manifest covers every card exactly once')
      → PAGES.flat().sort((a,b)=>a-b) deep-equals CARD_VALUES

describe('strip boards')
  it('strip n is n half-inches wide')
      → stripWidthIn(1) === 0.5; stripWidthIn(9) === 4.5; stripWidthIn(17) === 8.5;
        for n in 1..17: stripWidthIn(n) toBeCloseTo(n * 0.5)
  it('long natural strips split into printable taped segments')
      → naturalSegments(9) deep-equals [9]; naturalSegments(15) deep-equals [15];
        naturalSegments(16) deep-equals [9,7]; naturalSegments(17) deep-equals [9,8];
        for n in 1..17: segments sum to n and every segment ≤ 15

describe('hundred board tiles')
  it('tiles run 1..100 and match the virtual material')
      → TILE_VALUES.length === 100; TILE_VALUES[0] === 1; TILE_VALUES[99] === 100;
        TILE_VALUES deep-equals [...ALL_TILES] (import from '../materials/hundred-board/model')

describe('fixed piece inventories')
  it('stamp tiles: four places, 48 per page, B&W tags')
      → STAMP_PLACES.map(p => p.value) deep-equals [1,10,100,1000];
        STAMP_PLACES.map(p => p.tag) deep-equals ['U','T','H','Th']; TILES_PER_PAGE === 48
  it('bead cards: nine of each place')
      → BEAD_CARD_COUNTS deep-equals { unit: 9, ten: 9, hundred: 9, thousand: 9 }
  it('play money: three denominations, ten bills each')
      → [...DENOMINATIONS] deep-equals [1,10,100]; BILLS_PER_DENOM === 10
  it('fraction circles: whole through tenths, 55 sectors')
      → CIRCLE_FAMILIES deep-equals [1,2,3,4,5,6,7,8,9,10];
        CIRCLE_FAMILIES.reduce((a,b)=>a+b, 0) === 55
```

**Check:** `npm test` — all new cases green, existing 730 untouched.

## Manual QA script

1. `npm run dev`, open `http://localhost:5173/kits` (or LAN IP). Verify 7 kit cards under strand headings; header nav shows NO "Kits" item.
2. Open `/worksheets` — "Make-It-Yourself Kits" card at the bottom links to `/kits`.
3. Open `/materials/stamp-game` — "Make the real thing" card lists Stamp Game Tiles and Place-Value Play Money; click through to `/kits/stamp-game-tiles`.
4. On `/kits/stamp-game-tiles`: read assembly steps; page 1 of the preview shows the calibration square with the 100%-scale warning; pages 2–5 show 48 tiles each in green/blue/red/green.
5. Ctrl+P (color mode): confirm 5 pages, US Letter, no clipped tiles, no site header/footer/sidebar in the printout. Print page 1 on paper and **measure the square with a ruler — exactly 1 inch**. Measure one tile — exactly 1 inch.
6. Check "Ink-friendly black & white" (URL gains `bw=1`): tiles become black-on-white outlines with U/T/H/Th corner letters. Print preview again — no solid ink floods.
7. Repeat print-preview (color + B&W) for `/kits/strip-boards`: 9 pages; blue strip 9 = 4.5in; red strips show unit divisions; natural strips 16/17 appear as two taped segments; in B&W the strips carry B/R/N tags.
8. `/kits/large-number-cards`: card 1 is 1.5in wide, 9000 is 6in; stack a printed 3000+200+50+1 — it must read 3251.
9. `/kits/paper-fraction-circles` in B&W: sectors mid-gray, black division lines, `1/n` labels legible; green rings turn black.
10. `/kits/hundred-board-tiles`: tiles 1–100 all present; board halves tape into a 10×10 grid; a 0.75in tile fits inside a 0.8in cell.
11. `/kits/golden-bead-cards` and `/kits/play-money`: bead pictures match the on-screen golden beads material; bills readable in B&W.
12. Resize to 375px width (or phone on LAN): kit pages collapse to a single column (`.builder-layout` media query ≤900px); the Letter-size preview scrolls horizontally inside `.builder-preview`; assembly steps and Print button remain usable (≥44px targets).
13. `/kits/does-not-exist` renders the NotFound page.
14. Offline check: with dev tools Network → offline after load, navigate between `/kits` pages — no failed network requests.

## Acceptance criteria

- [ ] `npm test` green (existing 730 + new kit tests)
- [ ] `npm run build` green (strict tsc + vite)
- [ ] No new npm dependencies; no runtime network requests; no localStorage/state
- [ ] `/kits` index and `/kits/:slug` for all 7 slugs render; unknown slug → NotFound
- [ ] Layout header nav unchanged (no "Kits" item)
- [ ] Every kit's first page shows the 1-inch calibration square + 100%-scale instruction
- [ ] Printed sizes true: stamp tile 1in, hundred-board tile 0.75in, strip n = n × 0.5in, number card = digits × 1.5in wide (verified on paper with a ruler)
- [ ] Every kit prints correctly in color AND `.bw` with no information carried by color alone (place letters U/T/H/Th, B/R/N strip tags, `1/n` sector labels, bill words)
- [ ] Cut lines are `1px dashed var(--ink-soft)` (or the piece's colored frame); ✂ legend on every cover page
- [ ] All colors via `tokens.css` variables — zero hex literals in `.tsx` files
- [ ] Material pages for all 9 `forMaterials` targets show the "Make the real thing" card; `/worksheets` card and using-this-site paragraph link to `/kits`
- [ ] `plan/README.md` row added and this PRD's Status updated in the landing commit

## Out of scope

- Kits for bead-based materials (bead stair, bead chains, snake game, bead frame, checkerboard, racks & tubes, teen/ten boards, division/multiplication boards) — beads can't come out of a printer; the using-this-site guide already covers pipe-cleaner bead making. `KitDef.forMaterials` makes adding more kits later trivial.
- A4/metric paper variants, PDF bundling/downloads, or a "print all kits" mega-document.
- Any parameters, seeds, or presets on kits — kits are fixed documents, not generators.
- Printing the assembly steps themselves (they stay on-screen in the `.no-print` sidebar).
- Numerals or labels on golden bead cards (the picture is the quantity, as with the real material).
- A "Kits" item in the top nav, and any change to `MaterialDef` in `src/materials/types.ts`.
