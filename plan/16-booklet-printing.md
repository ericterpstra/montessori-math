# PRD 16 — Booklet Printing: fold-and-staple little books

**Status:** Not started
**Effort:** M — one small pure util + one frame component + CSS + a contained change to one generator; no new dependencies, no shared-file churn beyond a one-line import in `main.tsx`.
**Depends on:** nothing (wave 1 is complete; `numeral-tracing` generator and the worksheet builder already exist)

## Why

Kids treasure books they make themselves. Saddle-stitch imposition lets a worksheet print as a foldable little book: print double-sided, fold the stack, staple twice on the fold — done. The first integration turns numeral-tracing into **"My Book of Numbers"**: a 12-page book a PK child traces, counts, and keeps. Parents get a magical printable with zero extra effort; children get real pencil-and-paper work bound into an object they own.

## Binding product rules

From `CLAUDE.md` — every step below must respect them:

- **Print is first-class.** US Letter via browser print. Booklet sides are `.sheet-page` sections inside the existing `.print-sheet` wrapper, so the `.bw` ink-friendly mode (color-variable overrides in `src/styles/print.css`) keeps working. No information in color alone: trace-vs-model is dash-vs-solid, quantity is bead *count*.
- **Kids' practice happens on paper.** The booklet is a printable — no on-screen tracing, no tracking, no praise animations. Page numbers double as the control of error for correct folding (a folded book must read 1…12 in order).
- **No accounts, analytics, localStorage, or gamification.** Nothing here stores anything.
- **Fully static & offline.** No new npm dependencies (runtime deps stay react, react-dom, react-router-dom), no CDNs, no fonts, no network requests.
- **Code conventions.** TypeScript strict with `verbatimModuleSyntax` (`import type` for types); plain CSS with tokens from `src/styles/tokens.css` (no hex in components; `#000` on-paper black in CSS files matches existing `print.css`/`worksheets.css` practice); colocated Vitest tests (node env, pure logic only); `generate` stays pure — all randomness through the provided `RNG` (`src/lib/rng.ts`).
- **Montessori authenticity.** Golden beads (`var(--golden)`) for quantity; the back cover is a golden ten-bar via the existing `BeadBar` (`src/components/beads.tsx`).

## Design decisions (locked — do not revisit)

1. **Pure imposition util** in `src/lib/booklet.ts` (new): `export interface BookletSheet { front: [number, number]; back: [number, number] }` — 1-indexed content page numbers, `[left, right]` halves of one side of one physical sheet; `0` = blank (padding) half. `export function imposeBooklet(pageCount: number): BookletSheet[]` — pads `pageCount` up to a multiple of 4 **before** imposition, so blanks land at the END of the logical book (pages `pageCount+1 … N` render blank). For sheet `i` in `0 … N/4−1`: `front = [N − 2i, 1 + 2i]`, `back = [2 + 2i, N − 1 − 2i]` (values > `pageCount` become `0`).
2. **Rendering frame** in `src/worksheets/BookletFrame.tsx` (new): `BookletFrame` with props `{ pages: ReactNode[]; title: string }`. Calls `imposeBooklet(pages.length)`; renders one `.sheet-page.booklet-sheet` per **side**, front then back alternating, so a duplex printer collates correctly. Each side is a landscape half-and-half grid: `.booklet-half` left + right (each half a 5.5in × 8.5in folded page), page number small at the **outer bottom corner** of each half, blank halves empty.
3. **Landscape orientation** via `export function LandscapePage()` in `BookletFrame.tsx`, which renders `<style>{'@page { size: letter landscape; margin: 0.5in; }'}</style>`. While mounted it overrides the portrait `@page` rule in `src/styles/print.css` for the **whole document**. Documented limitation: booklet and portrait sheets cannot mix in one print job — so when `layout='booklet'` the generator's `Sheet` renders ONLY booklet output and `AnswerKey` is suppressed (returns `null`). `BookletFrame` mounts `<LandscapePage/>` itself, so `BuilderPage.tsx` needs **no changes**.
4. **`.no-print` banner** above the booklet preview, rendered by `BookletFrame`, with this exact instruction text: **"Print double-sided, flip on SHORT edge. Fold the stack in half; staple twice on the fold."**
5. **First integration — numeral-tracing** (`src/worksheets/generators/numeral-tracing.tsx`): new schema select param `layout: 'sheets' | 'booklet'`, default `'sheets'` (current behavior, byte-identical output). Booklet content pages, exactly: cover ("My Book of Numbers", name line, a golden `Bead` row); one page per numeral 0–9 (large dashed tracing rows reusing the existing SVG glyph approach + one counting-beads row); back cover with `BeadBar n={10}` → **12 content pages → exactly 3 duplex sheets** (6 rendered sides). `rowsPerNumeral` and `counting` still respected on numeral pages; `focus` is **ignored** in booklet layout (help text says so).
6. **CSS** in new `src/styles/booklet.css`, imported from `src/main.tsx`: `.booklet-sheet`, `.booklet-half`, `.booklet-fold-line` (dashed vertical center line, screen preview only — `display: none` in `@media print`), plus `.booklet-pagenum` and `.booklet-banner`. Generator-specific booklet page internals live in `src/worksheets/generators/numeral-tracing.css` (prefix `nt-booklet-`).

## Implementation steps

### Step 1 — `src/lib/booklet.ts` (new): the imposition util

Pure, no React, no imports. Full contents:

```ts
/**
 * Saddle-stitch booklet imposition. Content pages are 1-indexed; a physical
 * US Letter sheet printed landscape holds two half-letter pages per side.
 * Print the sides in order double-sided (flip on the SHORT edge), fold the
 * stack in half, staple twice on the fold.
 */

export interface BookletSheet {
  /** [left half, right half] content page numbers for the sheet's front side; 0 = blank. */
  front: [number, number]
  /** [left half, right half] content page numbers for the sheet's back side; 0 = blank. */
  back: [number, number]
}

/**
 * Impose `pageCount` content pages onto physical sheets. `pageCount` is padded
 * up to a multiple of 4 BEFORE imposition, so blanks land at the end of the
 * logical book (pages pageCount+1..N), encoded as 0.
 */
export function imposeBooklet(pageCount: number): BookletSheet[] {
  if (!Number.isInteger(pageCount) || pageCount <= 0) return []
  const n = Math.ceil(pageCount / 4) * 4
  const page = (p: number): number => (p <= pageCount ? p : 0)
  const sheets: BookletSheet[] = []
  for (let i = 0; i < n / 4; i++) {
    sheets.push({
      front: [page(n - 2 * i), page(1 + 2 * i)],
      back: [page(2 + 2 * i), page(n - 1 - 2 * i)],
    })
  }
  return sheets
}
```

**Locked test vectors** (also encoded in Step 2's tests — verify by hand before writing them):

- `imposeBooklet(8)` → `[{front:[8,1],back:[2,7]},{front:[6,3],back:[4,5]}]`
- `imposeBooklet(5)` (padded to 8; pages 6, 7, 8 blank) → `[{front:[0,1],back:[2,0]},{front:[0,3],back:[4,5]}]`
- `imposeBooklet(4)` → `[{front:[4,1],back:[2,3]}]`
- `imposeBooklet(12)` → `[{front:[12,1],back:[2,11]},{front:[10,3],back:[4,9]},{front:[8,5],back:[6,7]}]`
- `imposeBooklet(0)` → `[]`

Check: file typechecks (`npx tsc --noEmit`); the four vectors reproduce on paper with the formula.

### Step 2 — `src/lib/booklet.test.ts` (new): unit tests

Follow the house style of `src/lib/rng.test.ts` / `src/worksheets/generators/numeral-tracing.test.ts` (`describe`/`it`, `import { describe, expect, it } from 'vitest'`). See **Testing** section for the named cases. Write them now, watch them fail against a stub, then confirm green against Step 1.

Check: `npm test` — new file runs and passes; total test count increases.

### Step 3 — `src/styles/booklet.css` (new): booklet chrome

```css
/* ------------------------------------------------------------------
   Booklet printing — saddle-stitch chrome.
   A .booklet-sheet is ONE SIDE of a physical landscape US Letter sheet
   split into two half-letter pages (5.5in × 8.5in folded size; inside
   the 0.5in @page margins each half's content box is 5in × 7.5in).
   Orientation comes from <LandscapePage/> (BookletFrame.tsx), which
   overrides the portrait @page rule in print.css for the whole
   document — booklet and portrait sheets cannot mix in one print job.
   ------------------------------------------------------------------ */

.booklet-banner {
  max-width: 11in; margin: 0 auto 1rem; padding: 0.6rem 0.9rem;
  background: var(--paper-warm); border: 1px solid var(--line);
  border-radius: var(--radius-sm); font-size: 0.9rem;
}

.print-sheet .sheet-page.booklet-sheet {
  position: relative; display: grid; grid-template-columns: 1fr 1fr;
}

@media screen {
  /* Overrides the portrait 8.5in × 11in preview sizing in print.css
     (higher specificity than `.print-sheet .sheet-page`). */
  .print-sheet .sheet-page.booklet-sheet {
    width: 11in; min-height: 8.5in;
    padding: 0.5in; /* stands in for the @page margins on screen */
  }
}

@media print {
  /* landscape letter content box inside 0.5in margins */
  .booklet-sheet { min-height: 7.5in; }
}

.booklet-half {
  position: relative; display: flex; flex-direction: column;
  min-width: 0; padding: 0.3in 0.35in 0.5in;
}

.booklet-pagenum {
  position: absolute; bottom: 0.15in; font-size: 9pt; color: #000;
}

.booklet-half-left .booklet-pagenum { left: 0.3in; }
.booklet-half-right .booklet-pagenum { right: 0.3in; }

/* Fold guide — screen preview only. */
.booklet-fold-line {
  position: absolute; left: 50%; top: 0.3in; bottom: 0.3in;
  border-left: 1px dashed var(--ink-soft); opacity: 0.6;
}

@media print {
  .booklet-fold-line { display: none; }
}
```

Notes for the implementer: `box-sizing: border-box` is global (`src/styles/global.css`), so the screen fold line at `left: 50%` sits at the paper center (5.5in of 11in). In print the two `1fr` columns split the 10in content box symmetrically, so each half is 5in wide and the fold coincides with the physical paper center.

Then add the import to `src/main.tsx` after the existing style imports (last import line):

```ts
import './styles/booklet.css'
```

Check: `npm run dev`, load any page — no console errors; the new stylesheet appears in devtools Sources.

### Step 4 — `src/worksheets/BookletFrame.tsx` (new): the rendering frame

Full contents (adjust only if tsc complains):

```tsx
/**
 * Renders logical booklet pages as printable saddle-stitch sheets. Sides
 * alternate front, back, front, back… so a duplex printer collates correctly.
 * Page numbers at the outer bottom corners double as the control of error:
 * after folding, the book must read 1, 2, 3… in order.
 */
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { imposeBooklet } from '../lib/booklet'

/**
 * Forces landscape US Letter for the WHOLE document while mounted (overrides
 * the portrait @page rule in src/styles/print.css). Booklet and portrait
 * sheets therefore cannot mix in one print job — generators must render ONLY
 * booklet output (and no answer key) when a booklet is shown.
 */
export function LandscapePage() {
  return <style>{'@page { size: letter landscape; margin: 0.5in; }'}</style>
}

function Half({ pageNumber, side, content }: { pageNumber: number; side: 'left' | 'right'; content: ReactNode }) {
  return (
    <div className={`booklet-half booklet-half-${side}`}>
      {content}
      {pageNumber > 0 && <span className="booklet-pagenum">{pageNumber}</span>}
    </div>
  )
}

export interface BookletFrameProps {
  /** Logical content pages in reading order; pages[0] is book page 1 (the cover). */
  pages: ReactNode[]
  /** Book title, shown in the on-screen banner. */
  title: string
}

export function BookletFrame({ pages, title }: BookletFrameProps) {
  const sheets = imposeBooklet(pages.length)
  const content = (n: number): ReactNode => (n >= 1 && n <= pages.length ? pages[n - 1] : null)
  const side = (halves: [number, number], label: string) => (
    <section className="sheet-page booklet-sheet" aria-label={label}>
      <Half pageNumber={halves[0]} side="left" content={content(halves[0])} />
      <Half pageNumber={halves[1]} side="right" content={content(halves[1])} />
      <div className="booklet-fold-line" aria-hidden="true" />
    </section>
  )
  return (
    <>
      <LandscapePage />
      <p className="booklet-banner no-print">
        <strong>{title}</strong> — Print double-sided, flip on <strong>SHORT</strong> edge. Fold the stack in half;
        staple twice on the fold.
      </p>
      {sheets.map((sheet, i) => (
        <Fragment key={i}>
          {side(sheet.front, `Sheet ${i + 1} front`)}
          {side(sheet.back, `Sheet ${i + 1} back`)}
        </Fragment>
      ))}
    </>
  )
}
```

Design intent to preserve: blank halves (`pageNumber === 0`) render an empty `.booklet-half` — no content, no page number. The banner carries the locked instruction sentence verbatim. Do NOT wrap booklet sides in `SheetPage` (`src/worksheets/SheetPage.tsx`) — booklet pages have no Name/Date header (the cover carries its own name line).

Check: `npx tsc --noEmit` green (component is not yet referenced; `noUnusedLocals` applies to locals, not exports, so an unreferenced module is fine).

### Step 5 — `src/worksheets/generators/numeral-tracing.tsx` (modified): booklet layout

Read the file first; it currently exports `NumeralTracingParams { focus: string; rowsPerNumeral: number; counting: boolean }`, `TracingRow`, `TracingPage`, `NumeralTracingData { counting: boolean; pages: TracingPage[] }`, `generate`, and `def: GeneratorDef<NumeralTracingParams, NumeralTracingData>`.

**5a. Params.** Add to `NumeralTracingParams`:

```ts
  /** 'sheets' (default, one worksheet page per group) or 'booklet' (fold-and-staple book). */
  layout: string
```

Update `defaults` to `{ focus: 'all', rowsPerNumeral: 2, counting: true, layout: 'sheets' }`.

**5b. Data shape.** Add these types next to `TracingPage` and extend `NumeralTracingData`:

```ts
export interface BookletNumeralPage {
  kind: 'numeral'
  /** The numeral 0–9 this book page practices. */
  numeral: number
  /** Tracing rows sized for the half-letter page (glyphCount 5, beadCount 0, jitter []). */
  rows: TracingRow[]
  /** Jitter offsets (−3…3 px) for the page's single counting-bead row; length = numeral when counting, else 0. */
  beadJitter: number[]
}

export type BookletPage = { kind: 'cover' } | BookletNumeralPage | { kind: 'back-cover' }

export interface NumeralTracingData {
  counting: boolean
  pages: TracingPage[]
  /** Present ONLY when params.layout === 'booklet' (pages is then []). Absent in sheets layout. */
  booklet?: { pages: BookletPage[] }
}
```

The regression contract: in sheets layout `generate` must still return the object literal `{ counting, pages }` — no `booklet` key, no `layout` key — so `JSON.stringify` of sheets-mode data is byte-identical to wave 1.

**5c. Generation.** Add a module constant `const BOOKLET_GLYPHS = 5` (1 solid model + 4 dashed; at the existing `SLOT_WITHOUT_BEADS = 72` px slot this is 360 px = 3.75in, which fits the 4.3in half-page content width). At the top of `generate`, after the existing `rowsPerNumeral`/`counting` lines, branch:

```ts
  if (params.layout === 'booklet') {
    const bookletPages: BookletPage[] = [{ kind: 'cover' }]
    for (const numeral of ALL_NUMERALS) {
      const rows: TracingRow[] = []
      for (let r = 0; r < rowsPerNumeral; r++) {
        rows.push({ numeral, glyphCount: BOOKLET_GLYPHS, beadCount: 0, jitter: [] })
      }
      const beadJitter = counting ? Array.from({ length: numeral }, () => rng.int(-3, 3)) : []
      bookletPages.push({ kind: 'numeral', numeral, rows, beadJitter })
    }
    bookletPages.push({ kind: 'back-cover' })
    return { counting, pages: [], booklet: { pages: bookletPages } }
  }
```

The rest of `generate` (sheets layout) is untouched. Booklet page order is fixed: cover, numerals 0–9 ascending, back cover — 12 logical pages, always. `focus` is deliberately not consulted in this branch.

**5d. Rendering.** Import at top (respect `verbatimModuleSyntax` — value imports here):

```ts
import { BeadBar } from '../../components/beads'   // Bead is already imported
import { BookletFrame } from '../BookletFrame'
```

Add three module-private components after `TracingRowView`:

```tsx
function BookletCover() {
  return (
    <div className="nt-booklet-cover">
      <div className="nt-booklet-cover-beads" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => <Bead key={i} size={22} />)}
      </div>
      <h2 className="nt-booklet-cover-title">My Book of Numbers</h2>
      <p className="nt-booklet-name-line">
        This book belongs to <span className="nt-blank" />
      </p>
    </div>
  )
}

function BookletNumeralPageView({ page, counting }: { page: BookletNumeralPage; counting: boolean }) {
  return (
    <div className="nt-booklet-page">
      {page.rows.map((row, i) => (
        <TracingRowView key={i} row={row} counting={false} />
      ))}
      {counting && (
        <div
          className="numeral-tracing-beadframe"
          role="img"
          aria-label={`${page.numeral} ${page.numeral === 1 ? 'bead' : 'beads'} to count`}
        >
          {page.beadJitter.map((j, i) => (
            <span key={i} className="numeral-tracing-bead" style={{ transform: `translateY(${j}px)` }}>
              <Bead size={BEAD_SIZE} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function BookletBackCover() {
  return (
    <div className="nt-booklet-backcover">
      <BeadBar n={10} beadSize={22} title="a golden ten-bar — ten!" />
    </div>
  )
}
```

Notes: `TracingRowView` is called with `counting={false}` so it uses the wide 72 px slot and renders no per-row bead frame — booklet pages have ONE bead frame under the tracing rows instead. The existing `.numeral-tracing-beadframe` / `.numeral-tracing-bead` classes are reused as-is; the zero page keeps its empty frame (the point of interest).

In `Sheet`, before the existing return:

```tsx
  if (data.booklet) {
    const nodes = data.booklet.pages.map((p, i) => {
      if (p.kind === 'cover') return <BookletCover key={i} />
      if (p.kind === 'back-cover') return <BookletBackCover key={i} />
      return <BookletNumeralPageView key={i} page={p} counting={data.counting} />
    })
    return <BookletFrame pages={nodes} title="My Book of Numbers" />
  }
```

In `AnswerKey`, first line: `if (data.booklet) return null` (a tracing book has no answers, and landscape booklet sheets cannot share a print job with a portrait key page — see Step 4).

**5e. Schema & presets.** Append to `schema` (after the `counting` field):

```ts
    {
      kind: 'select',
      key: 'layout',
      label: 'Layout',
      options: [
        { value: 'sheets', label: 'Worksheet pages' },
        { value: 'booklet', label: 'Foldable booklet — My Book of Numbers' },
      ],
      help:
        'Booklet makes a 12-page book: print double-sided (flip on short edge), fold, staple on the fold. ' +
        'It always covers 0–9 (the Numerals choice is ignored) and prints landscape with no answer key.',
    },
```

Append a third preset:

```ts
    {
      id: 'number-book',
      name: 'My Book of Numbers',
      description:
        'A fold-and-staple 12-page book: trace each numeral, count the golden beads, and keep the book you made.',
      params: { focus: 'all', rowsPerNumeral: 2, counting: true, layout: 'booklet' },
    },
```

No change to `src/worksheets/registry.ts` (the generator is already registered) and no change to `src/worksheets/BuilderPage.tsx` (its `resolveParams` already round-trips select fields through the URL, so `?layout=booklet` and `?preset=number-book` work for free; the "Include answer key page" checkbox simply has no effect in booklet mode, which the layout help text explains).

Check: `npx tsc --noEmit` green; `npm run dev` → `/worksheets/numeral-tracing?layout=booklet` shows the banner plus 6 landscape sides.

### Step 6 — `src/worksheets/generators/numeral-tracing.css` (modified): booklet page internals

Append:

```css
/* ---------- Booklet ('My Book of Numbers') pages ---------- */

.nt-booklet-cover,
.nt-booklet-backcover {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.35in; text-align: center;
}

.nt-booklet-cover-title {
  font-family: var(--font-heading); font-size: 1.9rem; margin: 0;
}

.nt-booklet-cover-beads { display: flex; gap: 0.06in; line-height: 0; }

.nt-booklet-name-line { font-size: 0.95rem; margin: 0; }

.nt-booklet-name-line .nt-blank {
  display: inline-block; width: 2in; height: 1em;
  border-bottom: 1px solid #000; vertical-align: baseline;
}

.nt-booklet-page {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.25in; padding-top: 0.3in;
}
```

Check: on screen, cover content is centered in the right half of sheet 1 front; numeral pages show centered tracing rows with the bead frame below.

### Step 7 — `src/worksheets/generators/numeral-tracing.test.ts` (modified): tests

Add the booklet describe blocks and update the presets test (see **Testing**). One existing test MUST be updated: `'ships the two lesson presets and both generate valid sheets'` currently asserts `def.presets.map((p) => p.id)).toEqual(['first-numerals', 'focus-practice'])` — extend to `['first-numerals', 'focus-practice', 'number-book']` and add booklet assertions for the new preset. Every other existing test must pass **unchanged** (they spread `def.defaults`, which now includes `layout: 'sheets'`).

Check: `npm test` fully green.

### Step 8 — Land it

Update this PRD's Status line and the `plan/README.md` table; commit with a message like `Add saddle-stitch booklet printing; numeral-tracing 'My Book of Numbers'`.

## New & modified files

| Path | New/Modified | Purpose |
|---|---|---|
| `src/lib/booklet.ts` | new | Pure saddle-stitch imposition (`BookletSheet`, `imposeBooklet`) |
| `src/lib/booklet.test.ts` | new | Imposition unit tests (locked vectors + properties) |
| `src/worksheets/BookletFrame.tsx` | new | `BookletFrame` + `LandscapePage`; renders sides, banner, fold line, page numbers |
| `src/styles/booklet.css` | new | `.booklet-sheet`, `.booklet-half`, `.booklet-fold-line`, `.booklet-pagenum`, `.booklet-banner` |
| `src/main.tsx` | modified | One line: `import './styles/booklet.css'` |
| `src/worksheets/generators/numeral-tracing.tsx` | modified | `layout` param, booklet data shape + generation, booklet page components, third preset, AnswerKey suppression |
| `src/worksheets/generators/numeral-tracing.css` | modified | `nt-booklet-*` page-internal styles |
| `src/worksheets/generators/numeral-tracing.test.ts` | modified | Booklet tests + presets-test update |
| `plan/16-booklet-printing.md` | modified (on landing) | Status → Done |

Explicitly untouched: `src/worksheets/BuilderPage.tsx`, `src/worksheets/SheetPage.tsx`, `src/worksheets/types.ts`, `src/worksheets/registry.ts`, `src/styles/print.css`.

## Testing

Conventions per existing files (`src/worksheets/generators/numeral-tracing.test.ts`): `import { describe, expect, it } from 'vitest'`; generator tests build params via `{ ...def.defaults, ...overrides }` and `createRng(seed)`.

### `src/lib/booklet.test.ts` (new)

`import { imposeBooklet } from './booklet'` and `import type { BookletSheet } from './booklet'`.

`describe('imposeBooklet: locked vectors')`
- `it('8 pages -> 2 sheets, exact imposition')` — `expect(imposeBooklet(8)).toEqual([{ front: [8, 1], back: [2, 7] }, { front: [6, 3], back: [4, 5] }])`
- `it('5 pages pad to 8; pages 6, 7, 8 render blank (0) at the end of the book')` — `expect(imposeBooklet(5)).toEqual([{ front: [0, 1], back: [2, 0] }, { front: [0, 3], back: [4, 5] }])`
- `it('4 pages -> a single sheet')` — `expect(imposeBooklet(4)).toEqual([{ front: [4, 1], back: [2, 3] }])`
- `it('12 pages (My Book of Numbers) -> exactly 3 duplex sheets')` — `expect(imposeBooklet(12)).toEqual([{ front: [12, 1], back: [2, 11] }, { front: [10, 3], back: [4, 9] }, { front: [8, 5], back: [6, 7] }])`

`describe('imposeBooklet: properties')`
- `it('every content page 1..pageCount appears exactly once across fronts and backs, for 1..40 pages')` — for each `pageCount` in 1…40: flatten `sheets.flatMap((s: BookletSheet) => [...s.front, ...s.back])`, filter out zeros, sort ascending, expect `toEqual([1, 2, …, pageCount])`.
- `it('0 (blank) appears only when padding is needed, exactly N - pageCount times')` — for each `pageCount` in 1…40: `const n = Math.ceil(pageCount / 4) * 4`; count zeros in the flattened halves; expect `n - pageCount`. Spot-check: `pageCount = 8` → 0 zeros; `pageCount = 5` → 3 zeros.
- `it('sheet count is ceil(pageCount / 4)')` — `expect(imposeBooklet(9)).toHaveLength(3)`, `expect(imposeBooklet(12)).toHaveLength(3)`, `expect(imposeBooklet(13)).toHaveLength(4)`.
- `it('0 pages -> no sheets')` — `expect(imposeBooklet(0)).toEqual([])`.

### `src/worksheets/generators/numeral-tracing.test.ts` (additions)

`describe('numeral-tracing: booklet layout')`
- `it('booklet data has exactly 12 logical pages: cover, numerals 0-9 in order, back cover')` — `const data = gen({ layout: 'booklet' })`; `expect(data.pages).toEqual([])`; `expect(data.booklet).toBeDefined()`; `expect(data.booklet!.pages).toHaveLength(12)`; `expect(data.booklet!.pages[0].kind).toBe('cover')`; `expect(data.booklet!.pages[11].kind).toBe('back-cover')`; pages 1–10: kind `'numeral'` with `numeral` equal to `0, 1, …, 9` in order.
- `it('numeral pages honor rowsPerNumeral with 5-glyph half-page rows and no per-row beads')` — for `rowsPerNumeral` in `[1, 2, 3]`: every numeral page has `rows` of that exact length; every row has `glyphCount === 5`, `beadCount === 0`, `jitter` `toEqual([])`.
- `it('counting=true: beadJitter length equals the numeral (0 stays empty), integer offsets within ±3')` — `gen({ layout: 'booklet', counting: true }, seed)` across `SEEDS`; numeral page `n` has `beadJitter` of length `n` (so the 0 page has `[]`), each value an integer `>= -3` and `<= 3`.
- `it('counting=false: every beadJitter is empty')` — all 10 numeral pages have `beadJitter` `toEqual([])`.
- `it('focus is ignored in booklet layout — the book always covers 0-9')` — `gen({ layout: 'booklet', focus: '4' })` yields numeral pages `0…9` (12 logical pages), identical structure to `focus: 'all'` with the same seed: `expect(JSON.stringify(gen({ layout: 'booklet', focus: '4' }, 7))).toBe(JSON.stringify(gen({ layout: 'booklet', focus: 'all' }, 7)))`.
- `it('booklet generation is deterministic per seed and differs across seeds')` — same seed twice → `JSON.stringify` equal (use seed 42); seeds 1 vs 2 with `counting: true` → `not.toEqual` (jitter differs).

`describe('numeral-tracing: sheets layout regression (byte-identical to wave 1)')`
- `it('sheets data carries exactly the wave-1 keys, no booklet field')` — `expect(Object.keys(gen({ layout: 'sheets' }))).toEqual(['counting', 'pages'])`; `expect(gen({ layout: 'sheets' }).booklet).toBeUndefined()`.
- `it('sheets output for the default params matches the known-good wave-1 shape')` — `const data = gen({ layout: 'sheets' }, 42)` (defaults: focus `'all'`, rowsPerNumeral 2, counting true): `expect(data.pages).toHaveLength(2)`; `expect(data.pages[0].label).toBe('0 to 4')`; `expect(data.pages[1].label).toBe('5 to 9')`; `expect(data.pages[0].rows.map((r) => r.numeral)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4])`; every row `glyphCount === 8`, `jitter.length === row.numeral`; and `expect(JSON.stringify(gen({ layout: 'sheets' }, 42))).toBe(JSON.stringify(gen({}, 42)))` (defaults are sheets).

`describe('numeral-tracing: presets')` (update the existing test)
- ids become `['first-numerals', 'focus-practice', 'number-book']`; existing assertions for the first two presets stay; add: generating with `def.presets[2].params` and seed 5 yields `booklet` defined with 12 pages, `counting === true`, and numeral page 9 has `beadJitter` length 9.

All wave-1 tests in this file (answer-key correctness, parameter respect, pagination, determinism, row counts) must pass **without edits**.

## Manual QA script

1. `npm run dev`; open `http://localhost:5173/worksheets/numeral-tracing` (or the LAN IP). Confirm the sheet preview looks exactly as before this change (portrait pages, answer key at the end). Toggle nothing yet.
2. In the form, set **Layout → Foldable booklet — My Book of Numbers**. Confirm: (a) a banner appears above the preview reading "Print double-sided, flip on SHORT edge. Fold the stack in half; staple twice on the fold."; (b) the preview becomes 6 wide (landscape) sides; (c) each side shows a dashed vertical fold line down the center.
3. Verify imposition visually: side 1 (sheet 1 front) shows the back cover (golden ten-bar) on the LEFT and the cover ("My Book of Numbers", ten golden beads, "This book belongs to ___") on the RIGHT with page numbers 12 and 1 in the outer bottom corners; side 2 shows numeral 0's page (left, page 2) and numeral 9's page (right, page 11); the last side shows numerals 4 (left, page 6) and 5 (right, page 7).
4. Check numeral pages: 2 tracing rows each (first glyph solid, four dashed), a bead frame below with the matching bead count; the 0 page's frame is empty.
5. Set **Rows per numeral → 3** and toggle **Count-and-trace beads** off/on: rows and bead frames respond. Set **Numerals → Just 4**: booklet is unchanged (still 0–9) — the layout help text says so.
6. Click **Print** (or Ctrl+P). In the browser print preview: orientation is landscape US Letter automatically (no manual setting), exactly 3 sheets / 6 pages, NO answer key page, NO fold line, no banner, page numbers visible at outer bottom corners.
7. Toggle **Ink-friendly black & white** and reprint-preview: beads are black outlines, dashes/solid still distinguish trace vs model, nothing becomes invisible.
8. Actually print it double-sided (flip on short edge), fold, and check the control of error: pages read 1 through 12 in book order.
9. Click the **My Book of Numbers** preset button; confirm the URL gains `?preset=number-book&seed=…` and reloading that URL reproduces the same booklet.
10. Switch Layout back to **Worksheet pages**: portrait preview and answer key return; print preview is portrait again (the `@page` override unmounts).
11. Narrow the window to 375 px (or devtools mobile view): the form stacks above the preview and the 11in booklet preview scrolls horizontally inside the preview pane (`.builder-preview` has `overflow-x: auto`); no page-level horizontal scroll.

## Acceptance criteria

- [ ] `npm test` green (all wave-1 tests untouched and passing; new `src/lib/booklet.test.ts` and booklet cases in `numeral-tracing.test.ts` passing)
- [ ] `npm run build` green (strict tsc + vite)
- [ ] `imposeBooklet` reproduces all four locked vectors exactly, and `imposeBooklet(0)` → `[]`
- [ ] `layout: 'sheets'` output is byte-identical to wave 1 (`Object.keys(data)` is exactly `['counting', 'pages']`; known-good snapshot assertions pass)
- [ ] Booklet mode renders exactly 6 `.sheet-page.booklet-sheet` sides for 12 content pages, front/back alternating
- [ ] Print preview is landscape automatically while a booklet is shown, portrait otherwise; no answer key page prints in booklet mode
- [ ] Fold line and banner are screen-only (`.no-print` / `@media print` display none); page numbers print at outer bottom corners; blank halves are empty
- [ ] `.bw` mode: booklet carries all information without color (dash vs solid, bead counts)
- [ ] No new npm dependencies; no changes to `BuilderPage.tsx`, `types.ts`, `registry.ts`, `print.css`; no hex literals in components; no localStorage/tracking/gamification anywhere
- [ ] Third preset `number-book` exists and works via `?preset=number-book`
- [ ] Physical fold test performed once: pages read 1–12 in order
- [ ] This PRD's Status updated (with landing commit) and `plan/README.md` table row added/updated in the landing commit

## Out of scope

- Booklet layouts for any other generator (the frame is generic on purpose; wiring a second generator is a future PRD).
- A site-wide "print as booklet" toggle in `BuilderPage.tsx` or changes to `GeneratorDef` in `src/worksheets/types.ts` — booklet output is an ordinary generator param rendered by the generator's own `Sheet`.
- Quarter-fold / A6 books, cut-line variants, cover card stock notes, or signature splitting for books over one staple's thickness.
- PDF generation or any print pipeline beyond the browser's own dialog.
- Mixing portrait and landscape pages in one print job (documented `@page` limitation; revisit only if browsers ship reliable per-page sizing).
- Lesson (`src/lessons/`) follow-up link updates pointing at the new preset — nice to have, separate content pass.
