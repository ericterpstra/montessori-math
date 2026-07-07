# PRD 18 — Material Physicality Pass: texture, depth, and worksheet header art

**Status:** Done
**Effort:** M — every individual edit is small copy-paste CSS/TSX, but the change cuts across shared styles, a shared SVG primitive, and the worksheet pipeline, and needs broad visual QA over 19 materials and 12 generators.
**Depends on:** nothing (PRDs 02 Materials, 03 Worksheets, and 07 QA are Done; this is pure polish on top of them).

## Why

The virtual materials are mathematically faithful but visually flat: the felt mat is a smooth gradient, the wood is hard stripes, and beads are circles with one highlight. This pass makes them feel like *objects* — felt with nap, wood with grain, beads with roundness, cards and tiles that catch the light — so a child meets something closer to the shelf material, and a parent trusts the site as a crafted resource. On the worksheet side, an optional decorative header theme (space / baking / dinosaurs) lets a parent print a sheet their kid smiles at, with **zero information riding on the decoration** and answer keys always plain.

## Binding product rules

From `CLAUDE.md` — restated as they bind this feature:

1. **No gamification, no tracking.** Textures and header art are static decoration. No praise animations, no unlockable themes, no remembering the chosen theme (no localStorage — theme lives only in the URL query, exactly like `bw` and `seed` already do).
2. **Print is first-class; `.bw` carries everything without color.** Header decorations are drawn in `currentColor` at 50% opacity — grayscale-safe *by construction* (they inherit the sheet's black ink). They are inline SVG **content**, not CSS backgrounds, so they print even when the browser's "background graphics" checkbox is off. They must never overlap the title, name/date blanks, or problems.
3. **Fully static, offline-friendly, no new dependencies.** Textures are inline SVG `feTurbulence` data-URIs embedded directly in CSS — no image assets, no network requests, no npm packages. Runtime deps stay exactly `react`, `react-dom`, `react-router-dom`.
4. **Montessori authenticity.** No material color changes. Felt stays `var(--felt)` green, wood stays the existing plank gradient, bead colors untouched. Texture layers are alpha-only noise (black at ≤ 6% opacity) laid over the existing colors.
5. **Tokens, plain CSS.** All new CSS lives in `src/styles/tokens.css`, `src/styles/materials.css`, and `src/styles/print.css`. The one new component color literal (`#000` lowlight in `beads.tsx`) follows the existing precedent in that file (`#fff` highlight, `rgba(0,0,0,0.55)` stroke): neutral lighting effects, not information colors.
6. **TypeScript strict, `verbatimModuleSyntax`** — `import type` for type-only imports (called out per step below). Tests are colocated, node-environment, pure-logic only.
7. **prefers-reduced-motion:** not applicable — this PRD adds **no motion** of any kind (no transitions, no animations). Stating this explicitly so nobody "helpfully" adds a shimmer.

**Note on parallel work:** this PRD edits shared files (`tokens.css`, `materials.css`, `print.css`, `beads.tsx`, `SheetPage.tsx`, `BuilderPage.tsx`). Per CLAUDE.md it must be implemented by a single session, not split across parallel agents.

## Design decisions (locked — do not revisit)

- **(A) Stage textures** are second `background-image` layers on the existing `.mat-felt` / `.mat-wood` rules in `src/styles/materials.css`, built from inline SVG `feTurbulence` data-URIs (felt: `baseFrequency 0.9`, alpha 0.05; wood grain: `baseFrequency 0.012 0.28`, alpha 0.06). Exact final rules are given below — copy-paste them verbatim. `.mat-paper` is untouched. No texture on any individual bead or tile.
- **(B) Bead depth**: `BeadShape` in `src/components/beads.tsx` gains one lower-right lowlight ellipse (`cx + r*0.28`, `cy + r*0.32`, `rx = r*0.45`, `ry = r*0.32`, fill `#000`, opacity `0.14`) between the circle and the existing white highlight. This automatically upgrades every `BeadShape` consumer: `Bead`, `BeadBar` (and therefore `TenBar`). The 100 small `<circle r={4}>` beads inside `HundredSquare` and `ThousandCube` are **not** `BeadShape` and deliberately **stay flat** — they are 4px dots where a lowlight is invisible, and hundred-board / bead-chain pages render hundreds of them (performance). `Skittle` keeps its existing single highlight, unchanged.
- **(C) Softer elevation**: `--shadow-md` in `src/styles/tokens.css` becomes the two-layer value `0 1px 2px rgba(51, 48, 42, 0.1), 0 6px 18px rgba(51, 48, 42, 0.12)` (current single-layer value is `0 4px 14px rgba(51, 48, 42, 0.14)`). All nine existing consumers (materials.css, print.css screen preview, checkerboard, hundred-board, snake-game, bead-chains, ten-board CSS) inherit it with no per-file edits. `.stamp-tile` and `.number-card` in `materials.css` gain a 1px inset top highlight via the exact box-shadow rules below. `--shadow-sm` is unchanged.
- **(D) Worksheet header themes** live in a new `src/worksheets/themes.tsx`: `SHEET_THEMES = ['none','space','baking','dinos'] as const`, `SheetTheme` union type, `ThemeDecoration` component (~40px aria-hidden inline SVG, `currentColor` at group opacity 0.5, motif code given below). **Theme flows via React context** (`ThemeContext = createContext<SheetTheme>('none')`): `BuilderPage` reads a `?theme=` URL param (parallel to the existing `bw` param), renders a "Header decoration" select, and wraps the preview in a provider; `SheetPage` consumes the context — **no generator file changes at all** (generator `Sheet` components call `SheetPage` without a theme prop; the context reaches through them). `AnswerKeyPage` wraps its inner `SheetPage` in a nested provider forcing `'none'`, so answer keys are never themed. Theme is UI-level only — it is NOT added to any generator schema, `ParamValues`, or `GeneratorDef` (verified: `GeneratorDef` in `src/worksheets/types.ts` stays byte-identical).
- **(E) No motion added**, so `prefers-reduced-motion` handling is explicitly out of scope.

## Implementation steps

### Step 1 — Soften `--shadow-md` (`src/styles/tokens.css`, modified)

In the "Shape & depth" block, replace line 61:

```css
  --shadow-md: 0 4px 14px rgba(51, 48, 42, 0.14);
```

with:

```css
  --shadow-md: 0 1px 2px rgba(51, 48, 42, 0.1), 0 6px 18px rgba(51, 48, 42, 0.12);
```

Leave `--shadow-sm` (line 60) untouched.

**Check:** `npm run dev`, open `/materials/hundred-board` — the board's shadow (hundred-board.css line 83 uses `var(--shadow-md)`) reads as a soft contact shadow plus ambient blur instead of one hard blob. `grep -rn 'shadow-md' src` still shows only `tokens.css` defining it.

### Step 2 — Felt and wood textures (`src/styles/materials.css`, modified)

Current rules (lines 68–74) are:

```css
.mat-felt {
  background: radial-gradient(ellipse at 30% 20%, #4a7a5b, var(--felt) 70%);
}

.mat-wood {
  background: repeating-linear-gradient(95deg, #c19467 0 46px, #b58863 46px 47px, #bd8f68 47px 96px, #b0835e 96px 97px);
}
```

Replace **both rules entirely** with the following. The data-URIs must be pasted byte-for-byte: single quotes around `url('...')`, double quotes inside encoded as `%22`, `#` in the filter reference encoded as `%23`, literal spaces kept as-is, the whole `url(...)` on one line. Do **not** run them through an additional URL-encoder and do not insert line breaks inside the `url(...)`.

```css
.mat-felt {
  background-image:
    url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0%22/></filter><rect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22/></svg>'),
    radial-gradient(ellipse at 30% 20%, #4a7a5b, var(--felt) 70%);
  background-repeat: repeat, no-repeat;
  background-size: 160px 160px, auto;
}

.mat-wood {
  background-image:
    url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22><filter id=%22g%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.012 0.28%22 numOctaves=%222%22/><feColorMatrix values=%220 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0%22/></filter><rect width=%22240%22 height=%22240%22 filter=%22url(%23g)%22/></svg>'),
    repeating-linear-gradient(95deg, #c19467 0 46px, #b58863 46px 47px, #bd8f68 47px 96px, #b0835e 96px 97px);
  background-repeat: repeat;
  background-size: 240px 240px, auto;
}
```

How it works: each data-URI is a tiny self-contained SVG whose `feColorMatrix` maps the turbulence to pure alpha (RGB rows all zero, alpha row `0 0 0 0.05 0` / `0 0 0 0.06 0`), i.e. black speckle at 5% / 6% opacity. Layer 1 (the noise) tiles over layer 2 (the existing color gradient, unchanged). The wood `baseFrequency=%220.012 0.28%22` is anisotropic — stretched horizontally — so it reads as grain running along the planks. `.mat-paper` (line 76) is not modified.

**Check:** `/materials/golden-beads` (felt) shows fine speckle nap on the green mat; `/materials/stamp-game` and `/materials/addition-strip-board` (wood) show horizontal grain streaks over the planks. Zoom the browser to 200%: the noise tiles without visible seams. DevTools Network tab shows **zero** image requests.

### Step 3 — Card and tile inset highlights (`src/styles/materials.css`, modified)

Replace the `box-shadow` line inside `.stamp-tile` (currently line 94, `box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);`) so the rule reads:

```css
.stamp-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--stamp-color);
  color: #fff;
  font-weight: 700;
  font-family: var(--font-body);
  border: 1px solid rgba(0, 0, 0, 0.35);
  border-radius: 5px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 1px 2px rgba(0, 0, 0, 0.25);
  padding: 0;
  line-height: 1;
}
```

Leave `.stamp-tile.selected` (line 107) **unchanged** — its `outline` + focus-ring `box-shadow` is selection information and must stay exactly as loud as it is.

Then update `.number-card` (line 121, currently `box-shadow: var(--shadow-sm);`) and its hover (line 135, currently `box-shadow: var(--shadow-md);`):

```css
.number-card {
  /* ...existing declarations unchanged... */
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), var(--shadow-sm);
}

button.number-card:hover {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), var(--shadow-md);
}
```

`.number-card.selected` (outline only) is unchanged.

**Check:** `/materials/stamp-game` — tiles show a thin bright top edge, like pressed wood stamps; selecting a tile still shows the white outline + blue focus ring. `/materials/number-cards` — cards catch light along the top edge; hover still deepens the drop shadow.

### Step 4 — Bead lowlight (`src/components/beads.tsx`, modified)

In `BeadShape` (lines 33–40), insert the lowlight ellipse between the `<circle>` and the existing white highlight `<ellipse>`, so the function body becomes exactly:

```tsx
/** Low-level bead for composing custom SVG scenes: circle + shading. */
export function BeadShape({ cx, cy, r, fill }: BeadShapeProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={BEAD_STROKE} strokeWidth={Math.max(0.6, r * 0.09)} />
      <ellipse cx={cx + r * 0.28} cy={cy + r * 0.32} rx={r * 0.45} ry={r * 0.32} fill="#000" opacity={0.14} />
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.35} rx={r * 0.38} ry={r * 0.26} fill="#fff" opacity={0.4} />
    </g>
  )
}
```

Nothing else in the file changes. Scope of effect (verified against current source):

- **Upgraded automatically:** `Bead` (line 55), `BeadBar` horizontal & vertical (lines 90/92), `TenBar` (wraps `BeadBar`). These cover the bead stair, snake game, golden beads, bead chains, teen/ten boards, multiplication bead board, worksheet bead pictures, glossary, and Home.
- **Deliberately NOT upgraded:** the 100 plain `<circle r={4}>` dots in `HundredSquare` (line 120) and `ThousandCube` (line 155) — too small to read shading and too numerous to afford 3× the SVG nodes. `Skittle` (line 175) keeps its own highlight.

The `#000`/`#fff` literals are lighting, not information — same precedent as the existing `#fff` highlight and `BEAD_STROKE` in this file. In `.bw` print mode bead fills become `#000`, making the black lowlight invisible and leaving the white highlight — no information lost (identity is already carried by shape/stroke, per PRD 03).

**Check:** `npm run build` green (strict TS). On `/materials/bead-stair`, beads now show highlight upper-left + shadow lower-right — visibly rounder. On `/materials/golden-beads`, hundred-squares and thousand-cubes look unchanged. `npm test` still green (no bead logic tests exist; nothing to update).

### Step 5 — Theme module (`src/worksheets/themes.tsx`, new)

Create the file with exactly this content (motif coordinates are locked — they are tuned to the 40×40 viewBox):

```tsx
import { createContext, useContext } from 'react'

/**
 * Optional decorative worksheet header themes. Pure delight: aria-hidden,
 * drawn in currentColor at 50% opacity (grayscale-safe by construction),
 * student pages only — AnswerKeyPage always forces 'none'. No information
 * may ever ride on these decorations.
 */
export const SHEET_THEMES = ['none', 'space', 'baking', 'dinos'] as const
export type SheetTheme = (typeof SHEET_THEMES)[number]

export const THEME_LABELS: Record<SheetTheme, string> = {
  none: 'None',
  space: 'Space',
  baking: 'Baking',
  dinos: 'Dinosaurs',
}

/** Type guard for validating the ?theme= URL param. */
export function isSheetTheme(value: string | null): value is SheetTheme {
  return SHEET_THEMES.includes(value as SheetTheme)
}

/** Defaults to 'none' so every SheetPage outside a provider is unchanged. */
export const ThemeContext = createContext<SheetTheme>('none')

export function useSheetTheme(): SheetTheme {
  return useContext(ThemeContext)
}

/* Motifs are flat one-color silhouettes. Group opacity (not per-shape
   opacity) keeps overlapping shapes a single uniform tint. */

function SpaceMotif() {
  return (
    <>
      <path d="M8 2 L9.2 6.8 L14 8 L9.2 9.2 L8 14 L6.8 9.2 L2 8 L6.8 6.8 Z" />
      <path d="M30 4 L30.8 7.2 L34 8 L30.8 8.8 L30 12 L29.2 8.8 L26 8 L29.2 7.2 Z" />
      <path d="M14 16 L14.6 18.4 L17 19 L14.6 19.6 L14 22 L13.4 19.6 L11 19 L13.4 18.4 Z" />
      <circle cx={25} cy={28} r={7} />
      <ellipse cx={25} cy={28} rx={12} ry={3.5} fill="none" stroke="currentColor" strokeWidth={1.5} transform="rotate(-18 25 28)" />
    </>
  )
}

function BakingMotif() {
  return (
    <>
      <circle cx={14.5} cy={17} r={5} />
      <circle cx={20} cy={13.5} r={6} />
      <circle cx={25.5} cy={17} r={5} />
      <rect x={11} y={16} width={18} height={6} />
      <circle cx={20} cy={6.5} r={2.4} />
      <path d="M11 22 L29 22 L25.5 37 L14.5 37 Z" />
    </>
  )
}

function DinoMotif() {
  return (
    <>
      <ellipse cx={22} cy={26} rx={11} ry={6.5} />
      <ellipse cx={30} cy={24} rx={5.5} ry={4.5} />
      <ellipse cx={7.5} cy={8} rx={3.4} ry={2.5} />
      <path d="M6 9.5 C 8 15, 10.5 20, 15 24.5 L 20 27 L 12.5 27.5 C 9.5 21.5, 7.5 15.5, 4.5 10.5 Z" />
      <path d="M31 22.5 C 35 24, 37.5 26.5, 39.5 30.5 C 35.5 29.5, 32.5 28.5, 29.5 27.5 Z" />
      <rect x={15} y={30} width={3.4} height={8} rx={1.5} />
      <rect x={25} y={30} width={3.4} height={8} rx={1.5} />
    </>
  )
}

export function ThemeDecoration({ theme, side }: { theme: SheetTheme; side: 'left' | 'right' }) {
  if (theme === 'none') return null
  return (
    <svg
      className={`sheet-theme-art sheet-theme-${side}`}
      width={40}
      height={40}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <g fill="currentColor" opacity={0.5} transform={side === 'right' ? 'translate(40 0) scale(-1 1)' : undefined}>
        {theme === 'space' && <SpaceMotif />}
        {theme === 'baking' && <BakingMotif />}
        {theme === 'dinos' && <DinoMotif />}
      </g>
    </svg>
  )
}
```

Motif inventory (matches the locked design): space = three four-pointed stars + a ringed planet (circle + rotated ellipse ring); baking = a cupcake (three-lobe scalloped frosting circles over a joining band, cherry on top, trapezoid wrapper); dinos = long-necked sauropod silhouette from three ellipses (body, hip, head) + a tapering neck path, tail path, and two leg rects. The right-hand copy is mirrored with `translate(40 0) scale(-1 1)` so the pair frames the header symmetrically. `currentColor` inherits the sheet's ink color (`.print-sheet { color: #000 }` in print.css), so decorations are gray in color mode AND `.bw` mode identically.

**Check:** `npm run build` green — proves strict TS + `verbatimModuleSyntax` compliance (note: `createContext`/`useContext` are value imports, correctly NOT `import type`).

### Step 6 — Theme CSS (`src/styles/print.css`, modified)

Add after the `.sheet-header .name-date` rule (after line 103), inside the "Worksheet sheet chrome" section:

```css
/* Optional decorative header art (src/worksheets/themes.tsx). Student pages
   only; drawn in currentColor at 50% opacity — carries no information. */
.sheet-header.themed {
  position: relative;
  padding-left: 52px;
  padding-right: 52px;
}

.sheet-theme-art {
  position: absolute;
  bottom: 0.25rem;
  pointer-events: none;
}

.sheet-theme-left {
  left: 0;
}

.sheet-theme-right {
  right: 0;
}
```

Layout contract: the 52px padding (40px art + 12px gap) reserves the corners, so art can **never** overlap the title or name/date blanks. The art is bottom-anchored just above the header's 2px rule; since the header text row is ~26px tall, the 40px art overhangs ~14px upward into the page's 0.5in (48px) top padding — intentional and safe (`.sheet-page` padding, print.css line 76, absorbs it; screen preview `overflow: hidden` does not clip it).

**Check:** after Step 7, inspect the header in DevTools: `.sheet-theme-art` boxes sit fully inside the `.sheet-page` padding box; title and blanks untouched.

### Step 7 — SheetPage consumes the context (`src/worksheets/SheetPage.tsx`, modified)

Current file (40 lines) exports `SheetPageProps`, `SheetPage`, `AnswerKeyPage`. Replace the two components (props interface unchanged — **no** `theme` prop is added to `SheetPageProps`; the locked design flows theme via context precisely because generator `Sheet` components call `SheetPage` without extra props):

```tsx
import type { ReactNode } from 'react'
import { ThemeContext, ThemeDecoration, useSheetTheme } from './themes'

export interface SheetPageProps {
  title: string
  /** Italic line under the header telling the child what to do. */
  instructions?: string
  /** Show the Name/Date blanks (off for answer keys). */
  nameDate?: boolean
  children: ReactNode
}

/**
 * One printed page (US Letter). Every worksheet generator wraps each of its
 * pages in this so headers and page breaks are consistent. An optional
 * decorative theme arrives via ThemeContext (default 'none').
 */
export function SheetPage({ title, instructions, nameDate = true, children }: SheetPageProps) {
  const theme = useSheetTheme()
  const themed = theme !== 'none'
  return (
    <section className="sheet-page">
      <header className={`sheet-header${themed ? ' themed' : ''}`}>
        {themed && <ThemeDecoration theme={theme} side="left" />}
        <h2 className="sheet-title">{title}</h2>
        {nameDate && (
          <div className="name-date">
            Name <span className="blank" /> Date <span className="blank short" />
          </div>
        )}
        {themed && <ThemeDecoration theme={theme} side="right" />}
      </header>
      {instructions && <p className="sheet-instructions">{instructions}</p>}
      {children}
    </section>
  )
}

/** Answer keys are NEVER themed: a nested provider forces 'none'. */
export function AnswerKeyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ThemeContext.Provider value="none">
      <SheetPage title={`${title} — Answer Key`} nameDate={false}>
        {children}
      </SheetPage>
    </ThemeContext.Provider>
  )
}
```

All 12 generators (verified: `math-facts`, `multi-digit-ops`, `place-value`, `golden-bead-pictures`, `teens-tens`, `skip-counting`, `hundred-chart`, `fractions`, `long-division`, `long-multiplication`, `numeral-tracing`, `decimals`) import `SheetPage`/`AnswerKeyPage` from `../SheetPage` and need **zero changes**. With no provider in the tree the context default `'none'` renders today's exact markup (no `.themed` class, no SVGs).

**Check:** `npm run build` green; `/worksheets/math-facts` with no `?theme=` param renders a pixel-identical header (compare DOM: `header.sheet-header` has no extra children).

### Step 8 — Builder control + URL param (`src/worksheets/BuilderPage.tsx`, modified)

Mirror the existing `bw` pattern (line 97: `const bw = searchParams.get('bw') === '1'`).

1. Add imports:

```tsx
import { SHEET_THEMES, THEME_LABELS, ThemeContext, isSheetTheme } from './themes'
import type { SheetTheme } from './themes'
```

2. Directly under the `bw` line add:

```tsx
const rawTheme = searchParams.get('theme')
const theme: SheetTheme = isSheetTheme(rawTheme) ? rawTheme : 'none'
```

(Invalid values like `?theme=pirates` silently fall back to `'none'` — same forgiving behavior as `resolveParams` gives select fields.)

3. In the form, immediately after the "Ink-friendly black & white" checkbox label (lines 162–165) and before the "Include answer key page" checkbox, add a select styled like the auto-rendered select fields (`label.field` + `select`, see the `Field` component lines 54–67):

```tsx
<label className="field">
  Header decoration
  <select value={theme} onChange={(e) => update({ theme: e.target.value })}>
    {SHEET_THEMES.map((t) => (
      <option key={t} value={t}>
        {THEME_LABELS[t]}
      </option>
    ))}
  </select>
  <span className="field-help">Fun corner art on student pages only — the answer key stays plain.</span>
</label>
```

(`update` already writes arbitrary keys into the query string and preserves the seed — no changes needed there. Theme therefore rides in shared/reprint URLs exactly like `bw`, `seed`, and `preset` do.)

4. Wrap the preview (lines 183–188) in the provider:

```tsx
<div className="builder-preview">
  <ThemeContext.Provider value={theme}>
    <div className={`print-sheet${bw ? ' bw' : ''}`}>
      <Sheet data={data} params={params} />
      {showKey && <AnswerKey data={data} params={params} />}
    </div>
  </ThemeContext.Provider>
</div>
```

The provider wraps **both** `Sheet` and `AnswerKey`; the answer key stays plain anyway because `AnswerKeyPage` (Step 7) nests a `'none'` provider — this is the locked mechanism, do not special-case here.

**Check:** `/worksheets/math-facts?theme=dinos` shows mirrored dinosaur pairs in every student-page header, none on the answer-key page; changing the select updates the URL (`theme=` param) and survives reload; `?theme=garbage` renders plain.

### Step 9 — Tests (`src/worksheets/themes.test.ts`, new)

See Testing section for the exact file.

**Check:** `npm test` — all suites green, new file adds 3 passing tests.

## New & modified files

| Path | New/Modified | Purpose |
|---|---|---|
| `src/styles/tokens.css` | modified | Two-layer `--shadow-md` (Step 1) |
| `src/styles/materials.css` | modified | Felt/wood texture layers; stamp-tile & number-card inset highlights (Steps 2–3) |
| `src/components/beads.tsx` | modified | `BeadShape` lowlight ellipse (Step 4) |
| `src/worksheets/themes.tsx` | new | `SHEET_THEMES`, `SheetTheme`, `THEME_LABELS`, `isSheetTheme`, `ThemeContext`, `useSheetTheme`, `ThemeDecoration` (Step 5) |
| `src/styles/print.css` | modified | `.sheet-header.themed` and `.sheet-theme-*` rules (Step 6) |
| `src/worksheets/SheetPage.tsx` | modified | Consume theme context; answer keys force `'none'` (Step 7) |
| `src/worksheets/BuilderPage.tsx` | modified | `?theme=` param, "Header decoration" select, context provider (Step 8) |
| `src/worksheets/themes.test.ts` | new | Pure-data tests for the theme constants (Step 9) |

Explicitly untouched: `src/worksheets/types.ts`, all 12 generator files and their tests, `src/worksheets/registry.ts`, `src/materials/**`, `App.tsx`.

## Testing

Component rendering is not unit-tested (project convention: node-env Vitest, pure logic only — see `src/worksheets/generators/skip-counting.test.ts` for the house style). The theme module's pure data IS tested.

**`src/worksheets/themes.test.ts` (new) — exact content:**

```ts
import { describe, expect, it } from 'vitest'
import { SHEET_THEMES, THEME_LABELS, isSheetTheme } from './themes'

describe('sheet themes: data contract', () => {
  it("SHEET_THEMES is exactly ['none', 'space', 'baking', 'dinos'] with 'none' first", () => {
    expect(SHEET_THEMES).toEqual(['none', 'space', 'baking', 'dinos'])
    expect(SHEET_THEMES[0]).toBe('none')
    expect(SHEET_THEMES).toHaveLength(4)
  })

  it('every theme has a non-empty human label', () => {
    for (const t of SHEET_THEMES) {
      expect(THEME_LABELS[t].trim().length).toBeGreaterThan(0)
    }
    expect(THEME_LABELS.none).toBe('None')
    expect(THEME_LABELS.dinos).toBe('Dinosaurs')
  })

  it('isSheetTheme accepts every theme and rejects null, empty, unknown, and wrong-case values', () => {
    for (const t of SHEET_THEMES) {
      expect(isSheetTheme(t)).toBe(true)
    }
    expect(isSheetTheme(null)).toBe(false)
    expect(isSheetTheme('')).toBe(false)
    expect(isSheetTheme('pirates')).toBe(false)
    expect(isSheetTheme('Space')).toBe(false)
  })
})
```

(Importing from `./themes` — a `.tsx` module — is fine in node-env Vitest; `createContext` executes without a DOM and no component is rendered.)

**Existing tests:** no generator test changes are needed or allowed — if any of the 12 generator test files needs edits, the implementation has drifted from the locked design (generators untouched). Full suite (`npm test`) must stay green at the current count plus these 3.

## Manual QA script

Setup: `npm run dev`, open the LAN URL in Chrome. Do steps 1–6 at desktop width, then repeat 2, 7, 8 at 375px width (DevTools device toolbar).

1. **Felt texture:** open `/materials/golden-beads`. The green mat shows a fine fabric nap (not a smooth gradient). Zoom to 200% — no visible tile seams. Open `/materials/checkerboard` and `/materials/bead-stair` — same nap.
2. **Wood texture:** open `/materials/stamp-game` and `/materials/addition-strip-board`. Planks show horizontal grain streaks; plank seam lines still visible.
3. **Paper stage unchanged:** open `/materials/hundred-board` if it uses paper, else confirm in DevTools that `.mat-paper` has no texture layer (e.g. via a material using `mat="paper"`, or the rule itself).
4. **Bead depth:** on `/materials/bead-stair`, each bead shows highlight upper-left AND a soft shadow lower-right. On `/materials/golden-beads`, single beads and ten-bars show depth, but hundred-squares and thousand-cubes look exactly as before (flat 4px dots).
5. **Performance:** on `/materials/hundred-board` and `/materials/bead-chains` (choose the 1000-chain if offered), scroll and drag-interact — no visible jank versus main. In DevTools Performance, no long frames attributable to SVG filter work (textures are rasterized CSS backgrounds, beads have no filters).
6. **Shadows/highlights:** stamp tiles have a bright 1px top edge; selected tile ring unchanged. Number cards on `/materials/number-cards` show the top-edge light; hover deepens the shadow softly.
7. **Themes on screen:** open `/worksheets/math-facts`. Header decoration select shows None/Space/Baking/Dinosaurs, default None with no header art. Pick Dinosaurs: mirrored sauropods appear in both header corners of every student page; the answer-key page has **no** art; the art never touches the title or Name/Date blanks. URL now contains `theme=dinos`; reload — it persists. Edit URL to `theme=pirates` — renders plain. Try Space and Baking on `/worksheets/fractions` (multi-page: every student page gets art).
8. **Print preview, color:** with `theme=space`, Ctrl+P. US Letter, decorations print as light gray corner art on student pages only, even with "Background graphics" unchecked. Nothing clips or overlaps.
9. **Print preview, B&W:** check "Ink-friendly black & white" (URL gains `bw=1`) with `theme=baking`. Sheet content is monochrome; cupcakes are visible mid-gray, identical shape to color mode, obscuring nothing; answer key still plain. Ctrl+P to confirm on paper preview.
10. **375px width:** builder form stacks above the preview (existing `.builder-layout` breakpoint); the Letter-size preview scrolls horizontally inside `.builder-preview`; the theme select is tappable (≥44px row). Material stages (steps 1–2) scroll horizontally without layout breakage.
11. **No-regression spot check:** open `/` (Home) and one lesson page — bead art everywhere shows the new depth, nothing else moved.

## Acceptance criteria

- [x] `npm test` green (existing suites untouched + 3 new theme tests pass)
- [x] `npm run build` green (strict tsc + vite)
- [x] `--shadow-md` in tokens.css is exactly `0 1px 2px rgba(51, 48, 42, 0.1), 0 6px 18px rgba(51, 48, 42, 0.12)`
- [x] `.mat-felt` and `.mat-wood` each layer an feTurbulence data-URI over their original gradient; `.mat-paper` unchanged; zero network/image requests added (verify in DevTools Network)
- [x] `BeadShape` renders circle + black lowlight (opacity 0.14) + white highlight; `HundredSquare`/`ThousandCube` inner dots and `Skittle` are unchanged
- [x] `.stamp-tile` and `.number-card` have the specified inset top highlight; `.stamp-tile.selected` and `.number-card.selected` rules byte-identical to before
- [x] `src/worksheets/themes.tsx` exports `SHEET_THEMES` (4 values, `'none'` first), `SheetTheme`, `THEME_LABELS`, `isSheetTheme`, `ThemeContext` (default `'none'`), `useSheetTheme`, `ThemeDecoration`
- [x] Theme reaches `SheetPage` via context only: `SheetPageProps` unchanged, `GeneratorDef` in `src/worksheets/types.ts` unchanged, all 12 generator files unchanged (verify with `git diff --stat`)
- [x] `?theme=` URL param round-trips through the "Header decoration" select; invalid values fall back to `'none'`; no localStorage anywhere in the diff
- [x] Answer-key pages never show decorations, including when `key=1` and a theme is active
- [x] Decorations are `aria-hidden`, `currentColor` at group opacity 0.5, absolutely positioned in reserved 52px header corners — verified non-overlapping in print preview at US Letter, color AND `.bw`
- [x] No motion, no transitions, no animations added anywhere in the diff
- [x] Manual QA script completed, including 375px and print-preview steps
- [x] PRD status updated and `plan/README.md` table gains row 18 in the landing commit

## Out of scope

- Themed decorations anywhere outside worksheet student-page headers (no lesson-page art, no material-stage mascots, no index-card art).
- Theme selection on the `/worksheets` index or in lesson follow-up links (links may of course carry `&theme=` manually — but adding it to `lessons.ts` data is a separate decision).
- Any new theme beyond the locked four values, seasonal art, or user-uploaded art.
- Per-bead textures, SVG filters on live DOM elements, canvas/WebGL rendering, or shading the `HundredSquare`/`ThousandCube` dot grids.
- Dark mode, motion/parallax effects, sound.
- Changing any Montessori material color, bead color token, or `.bw` variable overrides.
- Persisting the chosen theme (no localStorage — hard rule).
