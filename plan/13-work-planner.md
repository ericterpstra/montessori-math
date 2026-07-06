# PRD 13 — Weekly Work Plan & Child's Work Journal (URL-state, zero storage)

**Status:** Not started
**Effort:** M — one new route with a pure state module and print CSS; touches three existing files with one-line-scale edits; no new logic in `src/lib/`.
**Depends on:** nothing (wave 1 is complete: 19 materials, 12 generators, 38 lessons all registered).

## Why

A parent planning a homeschool week currently juggles browser tabs: a lesson here, a worksheet preset there, a material to revisit. `/planner` lets them pick lessons, worksheet presets, and materials for the week in one place and print two pages: a **parent plan** (what to present, which day) and a **child's work journal** — a beautiful sheet the child pencil-checks as work is finished. This is authentic Montessori record-keeping: *the child keeps the record on paper; the site keeps nothing.* The entire plan lives in the URL — bookmarkable, sharable, and gone the moment the parent closes the tab if they don't want it.

## Binding product rules

- **No storage of any kind.** The plan lives ONLY in the URL query string. No localStorage, no cookies, no analytics, no "recent plans." The printed footnote says so explicitly.
- **No gamification.** The journal is an empty-checkbox record the child fills in pencil. No completion states on screen, no praise, no streaks. The "Copied" feedback on the copy-link button is a plain text swap, not an animation.
- **Child practice happens on paper.** The planner is a parent tool; the child-facing output is the printed journal. Nothing on `/planner` is an on-screen child activity.
- **Print is first-class.** US Letter via the existing `.print-sheet` / `.sheet-page` structure (`src/styles/print.css`). The `.bw` class must carry all information without color: the type badges and day chips are outline + text, never color-coded; the golden bead bar footer inherits `--golden: #000` from the existing `.print-sheet.bw` rules.
- **Fully static, no new dependencies.** Only `react`, `react-dom`, `react-router-dom` (already present). `navigator.clipboard` is a browser built-in; a no-clipboard fallback uses `window.prompt`.
- **Code conventions.** TypeScript strict with `verbatimModuleSyntax` (`import type` for types). Plain CSS with tokens from `src/styles/tokens.css` — no hex literals in components. Colocated `src/planner/state.test.ts` in Vitest node env testing pure logic only. Tap-first controls with ≥ 44px hit targets (`--touch-target`).

## Design decisions (locked — do not revisit)

1. **Single source of truth = the URL.** `PlannerPage` parses the plan from `useSearchParams()` on every render and writes changes back with `setSearchParams(..., { replace: true })`. There is **no React state duplicating the plan** — no `useState<Plan>`, no effects syncing state to the URL. (The only `useState` allowed is the transient `copied` boolean for the copy-link button, which is ephemeral UI, not plan data.)
2. **URL format** (exact): repeated query params, order-preserving —
   - `l=<lessonSlug>[:day]` — a lesson, e.g. `l=golden-beads-intro:mon`
   - `s=<sheetSlug>[.<presetId>][:day]` — a worksheet generator, optionally pinned to one of its presets, e.g. `s=math-facts.first-facts:tue`
   - `m=<materialSlug>[:day]` — a virtual material, e.g. `m=stamp-game`
   - `w=<YYYY-MM-DD>` — optional "week of" date typed by the parent
   - `day` ∈ `mon|tue|wed|thu|fri|sat|sun`. Unknown slugs drop the whole item; unknown day drops only the day; unknown presetId drops only the presetId. Item order in the URL is the display order everywhere.
3. **Pure state module** `src/planner/state.ts` (no React imports) exporting `PlanItem`, `Plan`, `parsePlan`, `serializePlan`, `chunkJournal`, plus the `DAYS` constant. `serializePlan(parsePlan(x)) === x` for canonical inputs (string-stable round trip; no percent-encoding needed because every token is a validated kebab-case identifier).
4. **Print output**: page 1 "Weekly work plan" for the parent (table grouped by day, unassigned last, footnote about zero storage); page 2+ "My Work" child journal — large serif title, name line, one row per item with a 1.5 cm empty pencil-check square, ≥ 1.3 rem item name, outline day chip; golden `BeadBar n={10}` footer decoration; **max 12 items per journal page**, overflow flows onto additional `.sheet-page`s via `chunkJournal`.
5. **Styling** in new `src/styles/planner.css`, imported in `src/main.tsx`. The shared worksheet-builder form sizing does NOT apply to picker rows — the planner defines its own `.planner-row` with a 1.25 rem checkbox and ≥ 44px row height.
6. **Entry points**: route `/planner` in `src/App.tsx`; a third CTA link in the `.home-cta` block of `src/pages/Home.tsx`; a "Plan the week" card section at the bottom of `src/parents/ParentsIndex.tsx`. No main-nav change (see Out of scope).

## Implementation steps

### Step 1 — `src/planner/state.ts` (new): the pure plan model

Create the folder `src/planner/` and this file. No React, no DOM beyond `URLSearchParams` (global in both browsers and Node, so tests run in Vitest's node env).

```ts
/**
 * Weekly work plan — pure model. The entire plan lives in the page URL;
 * nothing is ever stored. parse/serialize must round-trip exactly.
 */

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Day = (typeof DAYS)[number]

export const DAY_LABELS: Record<Day, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export interface PlanItem {
  kind: 'lesson' | 'sheet' | 'material'
  slug: string
  /** Sheets only: a preset id inside that generator. */
  presetId?: string
  day?: Day
}

export interface Plan {
  items: PlanItem[]
  /** YYYY-MM-DD, optional, typed by the parent. Display only — never auto-set. */
  weekOf?: string
}

/** Everything that exists on the site, for validating URL tokens. */
export interface PlanValidity {
  lessons: Set<string>
  sheets: Set<string>
  /** generator slug -> its preset ids */
  presets: Map<string, Set<string>>
  materials: Set<string>
}

const WEEK_RE = /^\d{4}-\d{2}-\d{2}$/

function asDay(raw: string | undefined): Day | undefined {
  return raw !== undefined && (DAYS as readonly string[]).includes(raw) ? (raw as Day) : undefined
}

/**
 * Parse a plan from URL search params. Unknown slugs/presets/days are
 * silently dropped (bad day / preset keeps the item; bad slug drops it).
 * Item order is preserved. Params other than l/s/m/w (e.g. bw) are ignored.
 */
export function parsePlan(search: URLSearchParams, valid: PlanValidity): Plan {
  const items: PlanItem[] = []
  let weekOf: string | undefined
  for (const [key, value] of search) {
    if (key === 'w') {
      if (WEEK_RE.test(value)) weekOf = value
      continue
    }
    if (key !== 'l' && key !== 's' && key !== 'm') continue
    const colon = value.indexOf(':')
    const head = colon === -1 ? value : value.slice(0, colon)
    const day = asDay(colon === -1 ? undefined : value.slice(colon + 1))
    if (key === 'l') {
      if (!valid.lessons.has(head)) continue
      items.push(day ? { kind: 'lesson', slug: head, day } : { kind: 'lesson', slug: head })
    } else if (key === 'm') {
      if (!valid.materials.has(head)) continue
      items.push(day ? { kind: 'material', slug: head, day } : { kind: 'material', slug: head })
    } else {
      const dot = head.indexOf('.')
      const slug = dot === -1 ? head : head.slice(0, dot)
      const presetRaw = dot === -1 ? undefined : head.slice(dot + 1)
      if (!valid.sheets.has(slug)) continue
      const presetId =
        presetRaw !== undefined && valid.presets.get(slug)?.has(presetRaw) ? presetRaw : undefined
      const item: PlanItem = { kind: 'sheet', slug }
      if (presetId) item.presetId = presetId
      if (day) item.day = day
      items.push(item)
    }
  }
  return weekOf !== undefined ? { items, weekOf } : { items }
}

/**
 * Serialize to a query string (no leading '?'), items in order, w last.
 * No percent-encoding: every token is a validated kebab-case identifier,
 * a fixed day token, or YYYY-MM-DD — all URL-safe as-is.
 */
export function serializePlan(plan: Plan): string {
  const parts: string[] = []
  for (const item of plan.items) {
    const key = item.kind === 'lesson' ? 'l' : item.kind === 'sheet' ? 's' : 'm'
    let v = item.slug
    if (item.kind === 'sheet' && item.presetId) v += `.${item.presetId}`
    if (item.day) v += `:${item.day}`
    parts.push(`${key}=${v}`)
  }
  if (plan.weekOf) parts.push(`w=${plan.weekOf}`)
  return parts.join('&')
}

/** Split journal rows into printed pages: 0→[], 12→[12], 13→[12,1], 25→[12,12,1]. */
export function chunkJournal(items: PlanItem[], perPage = 12): PlanItem[][] {
  const pages: PlanItem[][] = []
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage))
  return pages
}
```

Notes for the implementer: build `PlanItem`s **without** `undefined`-valued keys (as above) so test expectations with `toEqual` are exact; last valid `w` wins if repeated.

**Check:** `npx tsc --noEmit` passes (strict mode, no unused warnings — every export is used by Step 2's tests).

### Step 2 — `src/planner/state.test.ts` (new): unit tests

Write the full test file from the **Testing** section below. **Check:** `npx vitest run src/planner/state.test.ts` — all green.

### Step 3 — `src/styles/planner.css` (new): screen + print styles

All colors via tokens; no hex except `#000`/`#fff` inside printed-sheet rules (matching the existing convention in `print.css`/`worksheets.css`).

```css
/* ---------- Planner screen UI ---------- */

.planner-layout { display: grid; grid-template-columns: minmax(0, 1fr) 20rem; gap: 1.5rem; align-items: start; }
@media (max-width: 900px) {
  .planner-layout { grid-template-columns: minmax(0, 1fr); }
}

/* Picker rows: intentionally larger than the worksheet-builder form fields. */
.planner-row { display: flex; align-items: center; gap: 0.6rem; min-height: var(--touch-target); padding: 0.15rem 0; font-size: 0.95rem; }
.planner-row input[type='checkbox'] { width: 1.25rem; height: 1.25rem; flex-shrink: 0; }
.planner-row .planner-row-name { flex: 1 1 auto; }
.planner-row select { font: inherit; padding: 0.35rem 0.4rem; border: 1px solid var(--line); border-radius: var(--radius-sm); background: #fff; color: var(--ink); min-height: 2.4rem; }
.planner-row select:disabled { opacity: 0.45; }

.planner-shelf { position: sticky; top: 1rem; }
.planner-shelf ul { list-style: none; padding: 0; margin: 0 0 1rem; }
.planner-shelf li { display: flex; align-items: center; gap: 0.5rem; min-height: var(--touch-target); border-bottom: 1px solid var(--line); }
.planner-remove { margin-left: auto; min-width: var(--touch-target); min-height: var(--touch-target); border: none; background: none; color: var(--ink-soft); font-size: 1.2rem; cursor: pointer; }
.planner-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0 0.75rem; }
.planner-preview { overflow-x: auto; margin-top: 2rem; }

/* ---------- Printed pages ---------- */

.plan-table { width: 100%; border-collapse: collapse; font-size: 1rem; }
.plan-table td { padding: 0.14in 0.1in; border-bottom: 1px solid #000; vertical-align: baseline; }
.plan-day-heading { font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; padding-top: 0.22in; }

/* Outline badge: information carried by text + border, never color (bw-safe). */
.plan-badge { display: inline-block; border: 1px solid #000; border-radius: 4px; padding: 0 0.35rem; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.plan-preset { font-size: 0.85rem; font-style: italic; }
.plan-footnote { margin-top: 0.3in; font-size: 0.85rem; font-style: italic; }

.journal-title { font-family: var(--font-heading); font-size: 2.4rem; font-weight: 700; text-align: center; margin: 0 0 0.2in; }
.journal-name-line { font-size: 1.1rem; margin-bottom: 0.35in; }
.journal-row { display: flex; align-items: center; gap: 0.25in; min-height: 0.75in; break-inside: avoid; }
.journal-check { width: 1.5cm; height: 1.5cm; flex-shrink: 0; border: 2px solid var(--ink); border-radius: 2px; }
.journal-item-name { font-size: 1.35rem; }
/* Outline chip, bw-safe. */
.journal-day { margin-left: auto; border: 1.5px solid var(--ink); border-radius: 999px; padding: 0.1rem 0.6rem; font-size: 0.85rem; white-space: nowrap; }
.journal-footer { margin-top: 0.5in; text-align: center; }
```

**Check:** file exists; no tokens referenced that aren't in `tokens.css` (`--touch-target`, `--line`, `--ink`, `--ink-soft`, `--radius-sm`, `--font-heading` all exist).

### Step 4 — `src/main.tsx` (modified): import the stylesheet

After the existing line 11 `import './styles/guides.css'`, add:

```ts
import './styles/planner.css'
```

**Check:** `npm run dev` starts; no import error in the terminal.

### Step 5 — `src/planner/PlannerPage.tsx` (new): the page

One file, default export `PlannerPage`. Skeleton (implementer fills the marked render blocks following the specs below — everything behavioral is specified):

```tsx
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LESSONS, lessonBySlug } from '../lessons/registry'
import { GENERATORS, generatorBySlug } from '../worksheets/registry'
import { MATERIALS, materialBySlug } from '../materials/registry'
import { STRANDS } from '../lib/strands'
import { PrintButton } from '../components/PrintButton'
import { BeadBar } from '../components/beads'
import { DAYS, DAY_LABELS, chunkJournal, parsePlan, serializePlan } from './state'
import type { Day, Plan, PlanItem, PlanValidity } from './state'
```

- **Validity fixture from the registries** (memoized once; registries are static):

  ```tsx
  const valid: PlanValidity = useMemo(
    () => ({
      lessons: new Set(LESSONS.map((l) => l.slug)),
      sheets: new Set(GENERATORS.map((g) => g.slug)),
      presets: new Map(GENERATORS.map((g) => [g.slug, new Set(g.presets.map((p) => p.id))])),
      materials: new Set(MATERIALS.map((m) => m.slug)),
    }),
    [],
  )
  ```

- **Parse on every render, write-through on every change** (this is the single-source-of-truth rule):

  ```tsx
  const [searchParams, setSearchParams] = useSearchParams()
  const plan = parsePlan(searchParams, valid)
  const bw = searchParams.get('bw') === '1'

  const write = (next: Plan, nextBw = bw) => {
    const qs = serializePlan(next)
    setSearchParams(qs + (nextBw ? `${qs ? '&' : ''}bw=1` : ''), { replace: true })
  }
  ```

  `setSearchParams` accepts a raw query string (react-router v7). `parsePlan` ignores `bw`, so the two coexist; `serializePlan` never emits `bw`, so `write` re-appends it.

- **Row helpers** (plain functions inside the file):
  - `isChecked(kind, slug)` — `plan.items.some((i) => i.kind === kind && i.slug === slug)`.
  - Toggling **on** appends `{ kind, slug }` to the END of `plan.items` (order = pick order). Toggling **off** removes **all** items matching kind+slug (a hand-edited URL may contain duplicates; the UI collapses them on uncheck).
  - Day/preset selects edit the FIRST matching item (`findIndex`), replacing `plan.items` immutably. Selecting the empty option deletes the `day`/`presetId` key (build a new object without the key — never set it to `undefined`).
- **Page structure** (top to bottom):
  1. `.no-print` header: `<h1>Plan the week</h1>` + `.page-intro` explaining: pick items, print two pages (parent plan + child's "My Work" journal), and that the plan lives entirely in this page's URL — bookmark or copy the link to keep it; nothing is stored.
  2. `<div className="planner-layout no-print">` with:
     - **Left column — three picker sections**, each under a `.section-label` heading (`Lessons`, `Worksheets`, `Materials`):
       - **Lessons** grouped by strand, mirroring `src/lessons/LessonsIndex.tsx` lines 16–35: `STRANDS.map((strand) => ...)` filtering `LESSONS.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)`, skipping empty strands; strand name as a sub-heading.
       - **Worksheets**: one row per `GENERATORS` entry, in registry order, with an extra preset `<select>`: option `""` labeled `Default settings`, then one option per `def.presets` (`value={p.id}`, label `p.name`).
       - **Materials**: one row per `MATERIALS` entry, in registry order.
       - **Every row** is `<div className="planner-row">` containing: a `<label>` wrapping the checkbox and the name (`.planner-row-name`) so the whole text is tappable; the preset select (sheets only); and a day `<select aria-label={`Day for ${name}`}>` with option `""` labeled `Any day` plus the 7 days (`DAY_LABELS[d]`). Preset and day selects are `disabled` when the row is unchecked.
     - **Right column — `<aside className="card planner-shelf">`**, "This week's shelf":
       - Week-of field: `<label className="field">Week of (optional)<input type="date" value={plan.weekOf ?? ''} onChange={...} /></label>` — empty value deletes `weekOf`.
       - Item list in plan order: each `<li>` shows the resolved name as a `<Link>` (lesson → `/lessons/${slug}`, sheet → `/worksheets/${slug}${presetId ? `?preset=${presetId}` : ''}` — `BuilderPage` already consumes `?preset=` — material → `/materials/${slug}`), the day (short label, e.g. `Mon`) if set, and a `.planner-remove` button (`aria-label={`Remove ${name}`}`, text `×`) that removes that single item by index. Empty state: `Nothing picked yet — check items on the left.`
       - `.planner-actions`: **Copy link** button (below), `<PrintButton />`, **Clear week** button (`window.confirm('Clear this plan?')` then `setSearchParams('', { replace: true })` — `replace` history means clearing is otherwise unrecoverable), and the bw checkbox styled exactly like `BuilderPage.tsx` lines 162–165: `<label className="field checkbox"><input type="checkbox" checked={bw} onChange={(e) => write(plan, e.target.checked)} /> Ink-friendly black &amp; white</label>`.
  3. **Print preview** — `<div className="planner-preview">` containing, only when `plan.items.length > 0`, `<div className={`print-sheet${bw ? ' bw' : ''}`}>` (same pattern as `BuilderPage.tsx` line 184) with the two page kinds below. When the plan is empty, render a `.no-print` hint paragraph instead and no `.print-sheet`.
- **Copy link** (the only React state on the page — ephemeral UI, not plan data):

  ```tsx
  const [copied, setCopied] = useState(false)
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      window.prompt('Copy this link:', window.location.href) // http-LAN fallback: clipboard API needs a secure context
    }
  }
  // <button type="button" className="btn" onClick={copyLink}>{copied ? 'Copied' : '🔗 Copy link'}</button>
  ```

- **Printed page 1 — parent plan** (`<section className="sheet-page">`):
  - `.sheet-header` (existing class, `print.css` lines 83–103) with `.sheet-title` `Weekly work plan` and, on the right, `Week of ____________` as a ruled blank when `plan.weekOf` is unset, or the formatted date when set. Format without UTC-parse pitfalls: split the string — `const [y, m, d] = weekOf.split('-').map(Number); new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })`.
  - `.plan-table`: groups in this exact order — `DAYS` (Monday…Sunday), then `Any day` for items without a day; skip empty groups. Each group: one full-width `.plan-day-heading` row, then one row per item (plan order within the group): resolved item name; `.plan-badge` with text `Lesson` / `Worksheet` / `Material`; for sheets with a preset, `.plan-preset` showing the preset's `name` (via `generatorBySlug(slug)?.presets.find((p) => p.id === presetId)?.name`).
  - `.plan-footnote`, exact text: `Nothing about this plan is stored — bookmark this page's URL to keep it.`
- **Printed page 2+ — child's journal**: `chunkJournal(plan.items).map((page, pageIndex) => <section className="sheet-page" key={pageIndex}>…)`. Each page: `.journal-title` `My Work`; on the first page only, `.journal-name-line` `Name` + an underline span (reuse the existing pattern `<span className="name-date">… <span className="blank" /></span>` from `worksheets.css`); on continuation pages, a small centered `(continued)` line instead. Then one `.journal-row` per item: `<span className="journal-check" aria-hidden="true" />`, `.journal-item-name` with the resolved name, and `.journal-day` chip (short label `Mon`…`Sun`) only if the item has a day. Footer on every journal page: `<div className="journal-footer"><BeadBar n={10} beadSize={26} /></div>` (renders golden via `var(--golden)`, solid black under `.bw` — see `print.css` lines 115–142).
- Name resolution helper (names always resolve because `parsePlan` validated against the registries; the fallback keeps TS happy):

  ```tsx
  function itemName(item: PlanItem): string {
    if (item.kind === 'lesson') return lessonBySlug(item.slug)?.name ?? item.slug
    if (item.kind === 'sheet') return generatorBySlug(item.slug)?.name ?? item.slug
    return materialBySlug(item.slug)?.name ?? item.slug
  }
  ```

**Check:** `npm run dev`, open `http://localhost:.../planner?l=golden-beads-intro:mon&s=math-facts.first-facts&m=stamp-game&w=2026-07-13` — the Golden Beads intro lesson row is checked with day Monday, Math Facts Drill is checked with preset "First addition facts", Stamp Game is checked, week-of shows 2026-07-13, and the preview shows a parent plan page and a journal page with 3 rows.

### Step 6 — `src/App.tsx` (modified): the route

Add after line 13 (`import GuidePage …`):

```tsx
import PlannerPage from './planner/PlannerPage'
```

Add between line 25 (`worksheets/:slug`) and line 26 (`parents`):

```tsx
<Route path="planner" element={<PlannerPage />} />
```

**Check:** navigating to `/planner` renders the page inside the site `Layout`; `/planner` with no query shows the empty state.

### Step 7 — `src/pages/Home.tsx` (modified): home entry point

In the `.home-cta` paragraph (lines 34–41), after the existing `See the full PK–6 path` link, add a third link:

```tsx
<Link className="btn" to="/planner">
  Plan a week of work
</Link>
```

**Check:** home page shows three CTA buttons; the new one navigates to `/planner`.

### Step 8 — `src/parents/ParentsIndex.tsx` (modified): parents entry point

After the closing `</ul>` of the guides card-grid (line 25), add (mirrors the "A note on screens" card pattern on Home):

```tsx
<section className="card" style={{ maxWidth: '46rem', marginTop: '2rem' }}>
  <h2>Plan the week</h2>
  <p style={{ marginBottom: 0 }}>
    Pick lessons, worksheets, and materials for the week, then print a parent plan and a "My Work"
    journal your child checks off in pencil. The whole plan lives in the page's URL — bookmark it to
    keep it; nothing is stored anywhere. <Link to="/planner">Open the planner</Link>
  </p>
</section>
```

**Check:** `/parents` shows the card below the six guide cards; the link works.

### Step 9 — bookkeeping

Add the row `| 13 | [Work planner](13-work-planner.md) | Not started |` to the table in `plan/README.md`, and update this PRD's Status line when landing. **Check:** `npm test` and `npm run build` both green.

## New & modified files

| Path | New/modified | Purpose |
|---|---|---|
| `src/planner/state.ts` | new | Pure plan model: `Plan`/`PlanItem`/`PlanValidity` types, `DAYS`/`DAY_LABELS`, `parsePlan`, `serializePlan`, `chunkJournal` |
| `src/planner/state.test.ts` | new | Vitest unit tests for the state module |
| `src/planner/PlannerPage.tsx` | new | The `/planner` page: pickers, shelf, copy-link, print preview (parent plan + child journal) |
| `src/styles/planner.css` | new | Screen styles (`.planner-*`) and print styles (`.plan-*`, `.journal-*`) |
| `src/main.tsx` | modified | Import `./styles/planner.css` |
| `src/App.tsx` | modified | Import `PlannerPage`; add `<Route path="planner" …>` |
| `src/pages/Home.tsx` | modified | Third `.home-cta` button → `/planner` |
| `src/parents/ParentsIndex.tsx` | modified | "Plan the week" card section → `/planner` |
| `plan/README.md` | modified | Add PRD 13 row |

## Testing

File: `src/planner/state.test.ts`. Conventions per existing tests (see `src/worksheets/generators/math-facts.test.ts`): `import { describe, expect, it } from 'vitest'`, plain fixtures at top, `toEqual` on exact objects. Vitest runs in node env — `URLSearchParams` is global; parse inputs are built with `new URLSearchParams('<query>')`.

Fixture (validity — fixture slugs deliberately match real registry slugs; see the integration test):

```ts
const VALID: PlanValidity = {
  lessons: new Set(['golden-beads-intro', 'golden-beads-addition', 'bead-stair-intro']),
  sheets: new Set(['math-facts', 'numeral-tracing']),
  presets: new Map([
    ['math-facts', new Set(['first-facts', 'times-tables'])],
    ['numeral-tracing', new Set<string>()],
  ]),
  materials: new Set(['stamp-game', 'bead-stair']),
}
const parse = (q: string) => parsePlan(new URLSearchParams(q), VALID)
```

`describe('parsePlan')`:
- `it('parses the full example URL into the exact Plan')` — `parse('l=golden-beads-intro:mon&s=math-facts.first-facts&m=stamp-game&w=2026-07-13')` `toEqual`:
  ```ts
  {
    items: [
      { kind: 'lesson', slug: 'golden-beads-intro', day: 'mon' },
      { kind: 'sheet', slug: 'math-facts', presetId: 'first-facts' },
      { kind: 'material', slug: 'stamp-game' },
    ],
    weekOf: '2026-07-13',
  }
  ```
- `it('drops items with unknown slugs')` — `parse('l=not-a-lesson&m=stamp-game&s=fake-sheet.first-facts')` → `{ items: [{ kind: 'material', slug: 'stamp-game' }] }`.
- `it('keeps the item but drops an invalid day')` — `parse('l=golden-beads-intro:funday')` → `{ items: [{ kind: 'lesson', slug: 'golden-beads-intro' }] }`.
- `it('keeps the sheet but drops a presetId the generator does not have')` — `parse('s=math-facts.not-a-preset:tue')` → `{ items: [{ kind: 'sheet', slug: 'math-facts', day: 'tue' }] }`.
- `it('drops a malformed weekOf')` — `parse('w=next-week&m=bead-stair')` → `{ items: [{ kind: 'material', slug: 'bead-stair' }] }` (no `weekOf` key).
- `it('ignores unrelated params like bw and seed')` — `parse('bw=1&seed=42&m=stamp-game')` → `{ items: [{ kind: 'material', slug: 'stamp-game' }] }`.
- `it('preserves interleaved item order')` — `parse('m=stamp-game&l=golden-beads-intro&s=math-facts&l=bead-stair-intro')` → `items.map((i) => i.kind)` `toEqual(['material', 'lesson', 'sheet', 'lesson'])` and `items[3].slug` is `'bead-stair-intro'`.
- `it('returns an empty plan for an empty query')` — `parse('')` → `{ items: [] }`.

`describe('serializePlan')`:
- `it('is a string-stable round trip for canonical URLs')` — for each of the 3 fixtures below, `expect(serializePlan(parse(x))).toBe(x)`:
  1. `'l=golden-beads-intro:mon&s=math-facts.first-facts&m=stamp-game&w=2026-07-13'`
  2. `'m=bead-stair&l=bead-stair-intro&s=numeral-tracing'`
  3. `'s=math-facts:sun&s=math-facts.times-tables&l=golden-beads-addition:wed'`
- `it('serializes w last regardless of item count')` — `serializePlan({ items: [{ kind: 'lesson', slug: 'x' }], weekOf: '2026-07-13' })` → `'l=x&w=2026-07-13'`.
- `it('serializes an empty plan to an empty string')` — `serializePlan({ items: [] })` → `''`.

`describe('chunkJournal')` (page-size expectations from the locked design):
- `it('paginates 0, 12, 13, 25 items as [], [12], [12,1], [12,12,1]')` — build `items(n)` as `Array.from({ length: n }, (_, i) => ({ kind: 'lesson' as const, slug: `l${i}` }))`; assert `chunkJournal(items(0))` `toEqual([])`; `chunkJournal(items(12)).map((p) => p.length)` `toEqual([12])`; for 13 → `[12, 1]`; for 25 → `[12, 12, 1]`.
- `it('preserves item order across pages')` — with 13 items, `pages[1][0].slug` is `'l12'`.
- `it('honors a custom page size')` — `chunkJournal(items(11), 5).map((p) => p.length)` `toEqual([5, 5, 1])`.

`describe('real registries')` (integration — same pattern as `src/lessons/content.test.ts`, which already imports all three registries under Vitest):
- `it('accepts real site slugs')` — build a `PlanValidity` from `LESSONS`/`GENERATORS`/`MATERIALS` exactly as `PlannerPage` does, then `parsePlan(new URLSearchParams('l=golden-beads-intro:mon&s=math-facts.first-facts&m=stamp-game'), realValid).items` has length 3. (Verifies the fixture slugs above are real: `golden-beads-intro` is in `src/materials/golden-beads/lessons.ts`, `first-facts` is a `math-facts` preset, `stamp-game` is a registered material.)

## Manual QA script

1. `npm run dev`; open `http://<dev-ip>:<port>/planner` at desktop width. You see the heading, three picker sections (Lessons grouped under strand names in the order Numbers to 10 → … → Decimal Fractions), and an empty shelf saying "Nothing picked yet".
2. Check **Golden Beads — Introduction** (lessons), set its day to Monday. Check **Math Facts Drill** (worksheets), choose preset "First addition facts", day Tuesday. Check **Stamp Game** (materials), leave day as "Any day". Type a Week-of date. The URL now reads `?l=…:mon&s=math-facts.first-facts:tue&m=stamp-game&w=…` and the shelf lists all three in pick order.
3. Reload the page (F5). Everything from step 2 is still there — the URL is the only state. Open the same URL in a private/incognito window: identical plan (proves nothing is stored per-browser).
4. Click a shelf item's name — it navigates to the lesson/material page, or the worksheet builder with the preset applied. Go back; the plan is intact.
5. Click **Copy link**; the button reads "Copied" for a moment, and pasting into a new tab reproduces the plan. (On plain-http LAN, expect the `window.prompt` fallback instead.)
6. Click **Print** and inspect the print preview: page 1 "Weekly work plan" groups Monday → Tuesday → Any day with the item names, LESSON/WORKSHEET/MATERIAL outline badges, preset name "First addition facts" on the sheet row, and the footnote "Nothing about this plan is stored — bookmark this page's URL to keep it." Page 2 "My Work" shows 3 rows, each with an empty ~1.5 cm square, large item name, day chips on two rows, and a golden ten-bar at the foot. No site header/footer or controls print. Paper size US Letter.
7. Toggle **Ink-friendly black & white** and print-preview again: the bead bar is black-outline, badges/chips still readable — no information lost with color gone.
8. Check 13+ items across the pickers; print preview: the journal now spans two pages, 12 rows then the remainder, with "(continued)" on page 2; the parent plan stays on its own page.
9. Uncheck an item; it leaves the shelf, the URL, and both printed pages. Click **Clear week**, confirm — URL query and shelf are empty.
10. Resize to 375 px wide (or open on a phone via LAN): pickers stack in one column; every checkbox row and the × remove buttons are comfortably tappable (≥ 44 px); the sheet preview scrolls horizontally inside its container without the page body scrolling sideways.

## Acceptance criteria

- [ ] `npm test` green (including new `src/planner/state.test.ts`)
- [ ] `npm run build` green (strict tsc + vite)
- [ ] `/planner` route renders inside `Layout`; entry links exist on `/` (`.home-cta`) and `/parents`
- [ ] Full plan state round-trips through the URL: reload and incognito reproduce the plan; no `localStorage`/`sessionStorage`/cookie usage anywhere in `src/planner/` (grep clean)
- [ ] `PlannerPage` holds no React state for the plan — only the transient `copied` flag (code-review check)
- [ ] URL grammar honored exactly: `l=`/`s=`/`m=` with optional `.preset` (sheets) and `:day` suffixes, `w=YYYY-MM-DD`; invalid slug drops item, invalid day/preset drops only that part; order preserved
- [ ] `serializePlan(parsePlan(x)) === x` for the three canonical fixtures
- [ ] Print output: parent plan page + journal page(s) as separate `.sheet-page`s inside one `.print-sheet`; journal chunks at 12 items/page; footnote text exact
- [ ] `.bw` print carries all information without color: outline badges/chips, black bead bar (checked in print preview both modes)
- [ ] Journal check squares are 1.5 cm, `2px solid var(--ink)`; item names ≥ 1.3 rem; title in `--font-heading`
- [ ] All picker rows and buttons ≥ 44 px tall; checkboxes 1.25 rem; day selects have per-item `aria-label`s
- [ ] No new npm dependencies; no network requests; no hex colors in `PlannerPage.tsx`
- [ ] `plan/README.md` table updated; this PRD's Status set to Done with the landing commit

## Out of scope

- **No main-nav link** (`src/components/Layout.tsx` untouched) — the nav has five items and stays that way pending owner approval; entry points are Home and For Parents.
- No "suggested plans" / curated templates, and no auto-filling the planner from a lesson page ("Add to plan" buttons on lesson/material pages are a possible future PRD).
- No multi-week plans, no recurrence, no calendar view — one week, seven optional day buckets.
- No per-item notes or free-text custom items (URL length and encoding complexity; everything must resolve to a registry slug).
- No worksheet content embedded in the printout — the plan links to generators; the parent prints sheets from the builder as usual.
- No shortening/QR of the share URL; no Web Share API.
- No changes to `GeneratorDef`, `MaterialDef`, `Lesson`, or any registry.
