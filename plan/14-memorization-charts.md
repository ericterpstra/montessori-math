# PRD 14 — Addition & Multiplication Working Charts (Charts 1–3) + printable control charts

**Status:** Done
**Effort:** M — two new material folders, but they share one fully specified model shape, reuse existing shell/CSS conventions, and touch no shared logic beyond two registry entries.
**Depends on:** nothing (wave 1 is complete; `math-facts` generator and its `first-facts` / `times-tables` presets already exist).

## Why

The memorization strand currently ends at the boards (strip boards, bead board, division board) — the child can *work* facts but has nowhere on this site to do the classic finger-chart passage that carries facts into memory. This feature adds the traditional Addition Charts and Multiplication Charts: the child explores the full control chart (Chart 1), discovers commutativity on the half chart (Chart 2), then builds the whole table from memory on the working chart (Chart 3) by placing answer tiles on a blank grid and checking against the control. Parents get print-at-the-table control charts so the checking step happens on paper, exactly as in a Montessori classroom. Delight for the child: the "fingers meet" moment and the quiet satisfaction of a completed 81-tile chart; delight for the parent: a zero-prep printable reference that pairs with the existing math-facts drills.

## Binding product rules

- **No tracking/gamification.** The working chart keeps state only in React component state for the current visit — no localStorage, no scores, streaks, timers, or praise animations. On completion the material states a plain fact ("Every fact matches the control chart."), nothing more.
- **Practice on paper.** The on-screen charts are the material itself; all follow-up work links to the existing `math-facts` worksheet generator (presets `first-facts` and `times-tables` — both verified present in `src/worksheets/generators/math-facts.tsx`).
- **Print first-class.** Control charts print on US Letter inside `.print-sheet` > `.sheet-page` (structure from `src/styles/print.css`). The `.bw` class must lose no information: header identity is carried by bold weight and a 2px border, never by the red fill alone.
- **Static & offline.** No new npm dependencies (runtime stays react, react-dom, react-router-dom), no network requests, no external assets.
- **Code conventions.** TypeScript strict with `verbatimModuleSyntax` (`import type` for types), plain CSS using tokens from `src/styles/tokens.css` (no hex literals in `.tsx`; `#000`/`#fff` allowed in print-specific CSS rules, matching the precedent in `src/styles/print.css`), colocated `model.test.ts` in Vitest node environment testing pure logic only, tap-first interactions with hit targets ≥ `--touch-target` (44px), a Reset control, and honest control of error.
- **Montessori authenticity.** Colors via tokens only. Color claims verified against `src/styles/tokens.css`: addition chart headers use `var(--bead-1)` (#d62828 red — the red already meaning "memorization work" on this site: the bead board's red beads and disc, the strip board's red strips). For multiplication charts, supplier traditions genuinely disagree (some print red headers, some yellow); rather than invent a "traditional" color — and because red headers here would visually alias the addition material — multiplication headers use neutral `var(--paper-warm)` with `var(--ink)` numerals. State this in code comments; do not revisit.

## Design decisions (locked — do not revisit)

1. **Two new material folders** following the house pattern exactly (file set as in `src/materials/multiplication-bead-board/`): `model.ts`, `model.test.ts`, `<Name>.tsx`, `lessons.ts`, `def.ts`, `<slug>.css`.
   - `src/materials/addition-charts/` — slug `addition-charts`, name `Addition Charts`, ages `[5, 8]`, grades `'K–2'` (en dash, house style), strand `'memorization'`, `worksheetSlugs: ['math-facts']`.
   - `src/materials/multiplication-charts/` — slug `multiplication-charts`, name `Multiplication Charts`, ages `[6, 9]`, grades `'1–3'`, strand `'memorization'`, `worksheetSlugs: ['math-facts']`.
2. **Model is duplicated per folder, same shape** (intentional — folders stay self-contained so parallel agents never share files). Only the fact function and two builder names differ. Builders: `additionChart1()` = 9×9 grid of a+b for a,b in 1..9 (81 cells, row-major); `additionChart2()` = only cells where a ≤ b (45 cells, the commutativity "half chart"). `multiplicationChart1()` / `multiplicationChart2()` mirror with a×b.
3. **Working state:** `WorkingState { placed: ReadonlyMap<CellKey, number>; bank: readonly number[] }` with `CellKey = \`${number},${number}\`` ("a,b"). The bank starts with **exactly one tile per fact — 81 tiles**, labeled with each fact's answer, sorted ascending, duplicates expected (e.g. the multiplication bank holds exactly four 12-tiles: 2×6, 6×2, 3×4, 4×3). Pure functions: `placeTile` (only if cell empty AND tile in bank; otherwise returns state unchanged), `removeTile` (returns tile to bank, re-sorted), `checkPlacements` → `{ correct: Array<[number, number]>; wrong: Array<[number, number]> }` compared against the fact table, `isComplete` (all 81 placed correctly).
4. **UI modes** via a select in `MaterialShell` controls: `'chart1'` (read-only control chart), `'chart2'` (triangle half chart), `'working'` (blank 9×9 grid + scrollable tile bank sorted ascending; tap a tile, then tap a cell; tap a placed cell to remove it). A **Check** button marks *wrong placements only*, only when pressed, with honest counts; marks clear on the next placement/removal. In chart1/chart2 modes, tapping a row header and a column header highlights that row and column and outlines the meeting cell (the digital "two fingers" gesture) — read-only, transient, no state persisted.
5. **Print:** a "Print control charts" button toggles a `.print-sheet` section rendering Chart 1 and Chart 2 as two `.sheet-page` tables sized for Letter (cells 0.55in square), with an ink-friendly B&W checkbox (`.bw`) and the shared `PrintButton`. While the print section is open, a body class hides everything else on the page in `@media print` (spec in step 3).
6. **Lessons:** one lesson per folder. `addition-charts`: strand `memorization`, **sequence 6**, prerequisites `['addition-strip-board']`, follow-up `math-facts` preset `first-facts`. `multiplication-charts`: **sequence 7**, prerequisites `['multiplication-bead-board']`, follow-up `math-facts` preset `times-tables`. Verified against `src/lessons/content.test.ts` ("strand sequences are coherent" requires 1..n contiguous per strand) and the five existing memorization lessons: snake-game = 1, addition-strip-board = 2, subtraction-strip-board = 3, multiplication-bead-board = 4, unit-division-board = 5. Sequences 6 and 7 extend the strand with no gap. **Both lessons must land together with both materials** (each def's `lessonSlugs` must resolve, and lesson `virtualMaterials` point back).
7. **Registration** is wired centrally by the session lead: implementers create files only inside their folders and report the exact registry entries in step 9. No route changes needed — `src/App.tsx` already serves `materials/:slug` and `lessons/:slug` generically.

## Implementation steps

### Step 1 — `src/materials/addition-charts/model.ts` (new)

Pure model, no React imports. Full code:

```ts
/**
 * Addition charts (Charts 1–3) — pure model.
 *
 * Chart 1 is the full control chart: every fact a + b for a, b in 1..9.
 * Chart 2 is the half chart: only a ≤ b, because 3 + 5 and 5 + 3 share an
 * answer. Chart 3 is the working chart: a blank grid the child fills with
 * answer tiles from memory, then checks against the control chart.
 */

export const CHART_MIN = 1
export const CHART_MAX = 9
/** Cells in Chart 1 / tiles in the working-chart bank. */
export const CELL_COUNT = 81
/** Cells in Chart 2 (a ≤ b half). */
export const HALF_COUNT = 45

export interface ChartCell {
  /** Row operand (left header), 1–9. */
  a: number
  /** Column operand (top header), 1–9. */
  b: number
  /** The fact's answer: a + b. */
  value: number
}

function assertOperand(n: number, label: string): void {
  if (!Number.isInteger(n) || n < CHART_MIN || n > CHART_MAX) {
    throw new Error(`${label} must be a whole number from 1 to ${CHART_MAX}, got ${n}`)
  }
}

/** The fact this material memorizes. */
export function fact(a: number, b: number): number {
  assertOperand(a, 'a')
  assertOperand(b, 'b')
  return a + b
}

/** Chart 1 — the full control chart, row-major: (1,1), (1,2) … (9,9). */
export function additionChart1(): ChartCell[] {
  const cells: ChartCell[] = []
  for (let a = CHART_MIN; a <= CHART_MAX; a++)
    for (let b = CHART_MIN; b <= CHART_MAX; b++) cells.push({ a, b, value: fact(a, b) })
  return cells
}

/** Chart 2 — the commutativity half chart: only cells with a ≤ b. */
export function additionChart2(): ChartCell[] {
  return additionChart1().filter((c) => c.a <= c.b)
}

export type CellKey = `${number},${number}`

export function cellKey(a: number, b: number): CellKey {
  assertOperand(a, 'a')
  assertOperand(b, 'b')
  return `${a},${b}`
}

export interface WorkingState {
  /** Answer tiles placed so far, keyed 'a,b'. */
  readonly placed: ReadonlyMap<CellKey, number>
  /** Tiles still in the box, always sorted ascending; duplicates expected. */
  readonly bank: readonly number[]
}

/** A fresh working chart: empty grid, one tile per fact (81) in the bank. */
export function createWorkingState(): WorkingState {
  const bank = additionChart1().map((c) => c.value).sort((x, y) => x - y)
  return { placed: new Map(), bank }
}

export function canPlaceTile(state: WorkingState, a: number, b: number, tile: number): boolean {
  return !state.placed.has(cellKey(a, b)) && state.bank.includes(tile)
}

/** Place `tile` on empty cell (a,b); unchanged state if occupied or tile not in bank. */
export function placeTile(state: WorkingState, a: number, b: number, tile: number): WorkingState {
  if (!canPlaceTile(state, a, b, tile)) return state
  const placed = new Map(state.placed)
  placed.set(cellKey(a, b), tile)
  const i = state.bank.indexOf(tile)
  const bank = [...state.bank.slice(0, i), ...state.bank.slice(i + 1)]
  return { placed, bank }
}

/** Take the tile off cell (a,b) and put it back in the bank (no-op if empty). */
export function removeTile(state: WorkingState, a: number, b: number): WorkingState {
  const key = cellKey(a, b)
  const tile = state.placed.get(key)
  if (tile === undefined) return state
  const placed = new Map(state.placed)
  placed.delete(key)
  const bank = [...state.bank, tile].sort((x, y) => x - y)
  return { placed, bank }
}

export interface PlacementCheck {
  /** [a, b] of placed tiles matching the fact table, row-major order. */
  correct: Array<[number, number]>
  /** [a, b] of placed tiles that do not match, row-major order. */
  wrong: Array<[number, number]>
}

/** Honest check: compares only what the child has placed, cell by cell. */
export function checkPlacements(state: WorkingState): PlacementCheck {
  const correct: Array<[number, number]> = []
  const wrong: Array<[number, number]> = []
  for (const { a, b, value } of additionChart1()) {
    const tile = state.placed.get(cellKey(a, b))
    if (tile === undefined) continue
    ;(tile === value ? correct : wrong).push([a, b])
  }
  return { correct, wrong }
}

/** True only when all 81 cells are filled and every tile matches its fact. */
export function isComplete(state: WorkingState): boolean {
  return state.placed.size === CELL_COUNT && checkPlacements(state).wrong.length === 0
}
```

**Check:** `npx tsc --noEmit` reports no errors in this file (run `npm run build` if preferred).

### Step 2 — `src/materials/addition-charts/model.test.ts` (new)

Follow the conventions of `src/materials/multiplication-bead-board/model.test.ts` (single `describe`, behavior-sentence `it` names, exhaustive loops where cheap). See the **Testing** section for the nine named cases and their exact fixtures; implement them all.

**Check:** `npm test -- addition-charts` → 9 passing tests, 0 failures.

### Step 3 — `src/materials/addition-charts/addition-charts.css` (new)

First line comment: `/* Addition Charts — all classes prefixed addition-charts- */`. Import happens only from `AdditionCharts.tsx`. Contents (exact class names; values may be tuned ±10% for polish, structure may not):

- `.addition-charts-grid-scroll` — `overflow-x: auto; max-width: 100%;` (the grid never forces page-level horizontal scroll on 375px screens).
- `.addition-charts-grid` — `display: grid; grid-template-columns: repeat(10, var(--touch-target)); gap: 2px; width: max-content; background: rgba(255,255,255,0.88); padding: 0.5rem; border-radius: var(--radius-sm); box-shadow: var(--shadow-sm);`
- `.addition-charts-cell` — body cell (`<div>` in chart modes, `<button>` in working mode): `min-width/min-height: var(--touch-target); display:flex; align-items:center; justify-content:center; background: var(--card); color: var(--ink); font-family: var(--font-body); font-weight: 600; font-size: 1rem; border: 1px solid var(--line); border-radius: 4px;` Button variant adds `cursor: pointer` and `:focus-visible { outline: 3px solid var(--focus); outline-offset: 1px; }`
- `.addition-charts-header` — header cell: `background: var(--bead-1); color: #fff; font-weight: 700; border: none;` (multiplication folder uses `var(--paper-warm)` / `var(--ink)` here — see step 7). Corner cell `.addition-charts-corner` shows the operation sign, `background: transparent; color: #fff; font-size: 1.3rem;` (`color: var(--ink)` on `mat-paper` is not needed; stage is felt).
- Modifiers: `.addition-charts-cell.gap` (Chart 2 holes) — `visibility: hidden;`; `.addition-charts-cell.hi` (finger highlight) — `background: var(--paper-warm);`; `.addition-charts-cell.meet` — `outline: 3px solid var(--focus); outline-offset: -3px;`; `.addition-charts-cell.wrong` — `outline: 3px dashed var(--error); outline-offset: -3px;` plus the cell renders a small `✗` suffix in markup (information never by color alone).
- `.addition-charts-bank` — `display: flex; flex-wrap: wrap; gap: 0.4rem; max-height: 9.5rem; overflow-y: auto; background: rgba(255,255,255,0.82); border-radius: var(--radius-sm); padding: 0.6rem 0.8rem; margin: 0.75rem 0;`
- `.addition-charts-tile` — tile button: `min-width/min-height: var(--touch-target); background: var(--card); border: 1px solid var(--line); border-radius: 4px; font-weight: 700; font-size: 1rem; color: var(--ink); cursor: pointer; box-shadow: var(--shadow-sm);` and `.addition-charts-tile.selected { outline: 3px solid var(--focus); outline-offset: -1px; }`
- `.addition-charts-btn` — copy the recipe of `.multiplication-bead-board-btn` (`src/materials/multiplication-bead-board/multiplication-bead-board.css` lines 126–148): `min-height/min-width: var(--touch-target)`, `background: var(--card)`, hover `var(--paper-warm)`, disabled opacity 0.45.
- `.addition-charts-actions` — flex row, `gap: 0.5rem; margin: 0.75rem 0 0.4rem; flex-wrap: wrap;`
- **Print table** (used inside the `.print-sheet`):

```css
.addition-charts-print-table {
  border-collapse: collapse;
  table-layout: fixed;
  margin: 0.25in auto 0;
}
.addition-charts-print-table th,
.addition-charts-print-table td {
  width: 0.55in;
  height: 0.55in;
  border: 1px solid #000;
  padding: 0;
  text-align: center;
  vertical-align: middle;
  font-family: var(--font-body);
  font-size: 13pt;
}
.addition-charts-print-table th {
  background: var(--bead-1);
  color: #fff;
  font-weight: 700;
  font-size: 14pt;
  border-width: 2px; /* header identity survives without color (.bw) */
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}
.addition-charts-print-table td.gap { border: none; }
/* .bw: white headers, black bold numerals — ink-friendly, no info lost */
.addition-charts-print.bw .addition-charts-print-table th { background: #fff; color: #000; }
.addition-charts-print-controls { display: flex; gap: 0.75rem; align-items: center; margin: 0 0 0.75rem; flex-wrap: wrap; }
```

- **Print isolation** (the material page's h1, badges, parent-note sections, and the interactive stage must not print while the control-chart sheet is open):

```css
@media print {
  body.addition-charts-print-mode main.site-main > * { display: none !important; }
  body.addition-charts-print-mode main.site-main > .addition-charts-print { display: block !important; }
}
```

This works because `MaterialPage.tsx` renders the material component's top-level nodes as direct children of `main.site-main` (fragments and `Suspense` create no DOM nodes) — so the component **must** return exactly two top-level siblings: the interactive `<div className="addition-charts-app">` and, when toggled, the `.print-sheet` div (step 4).

**Check:** file exists, no CSS syntax errors (Vite dev server compiles without warnings after step 4 imports it).

### Step 4 — `src/materials/addition-charts/AdditionCharts.tsx` (new)

Default export `AdditionCharts`. Imports: `useEffect, useState` from react; `MaterialShell` from `../../components/MaterialShell` (props verified: `controls?`, `help?`, `mat?: 'felt' | 'wood' | 'paper'`, `children`); `PrintButton` from `../../components/PrintButton`; model functions; `./addition-charts.css`. Do **not** use `StampTile`/`NumberCard` (place-value materials) — tiles are plain buttons.

State and handlers:

```tsx
type Mode = 'chart1' | 'chart2' | 'working'

const [mode, setMode] = useState<Mode>('chart1')
const [working, setWorking] = useState(() => createWorkingState())
const [selectedIndex, setSelectedIndex] = useState<number | null>(null) // index into working.bank
const [check, setCheck] = useState<PlacementCheck | null>(null)
const [hiRow, setHiRow] = useState<number | null>(null)   // finger highlight, chart1/chart2 only
const [hiCol, setHiCol] = useState<number | null>(null)
const [showPrint, setShowPrint] = useState(false)
const [bw, setBw] = useState(false)

useEffect(() => {
  document.body.classList.toggle('addition-charts-print-mode', showPrint)
  return () => document.body.classList.remove('addition-charts-print-mode')
}, [showPrint])
```

Behavior rules (implement exactly):

1. **Mode change** resets `selectedIndex`, `check`, `hiRow`, `hiCol` (working state is kept so a mode round-trip doesn't destroy the child's chart; only Reset clears it).
2. **Chart 1 / Chart 2 grids:** 10×10 CSS grid. Corner cell shows `+`. Top headers 1–9 and left headers 1–9 are `<button className="addition-charts-header">` that toggle `hiCol` / `hiRow` respectively (`aria-pressed` when active). Body cells are `<div className="addition-charts-cell">` showing `value` from `additionChart1()` / `additionChart2()`; in chart2, cells with a > b render `<div className="addition-charts-cell gap" aria-hidden="true" />`. Add class `hi` when `c.a === hiRow || c.b === hiCol`, and `meet` when both match. When both are set, render below the grid: `<p className="stage-note">{hiRow} + {hiCol} = {fact(hiRow, hiCol)} — where your two fingers meet.</p>`
3. **Working mode:** same 10×10 grid; headers are plain `<div>`s (non-interactive); body cells are `<button className="addition-charts-cell">`:
   - empty cell, tile selected → `setWorking(placeTile(working, a, b, working.bank[selectedIndex]))`, then `setSelectedIndex(null)`, `setCheck(null)`;
   - empty cell, nothing selected → no-op;
   - placed cell → `setWorking(removeTile(working, a, b))`, `setSelectedIndex(null)`, `setCheck(null)`;
   - cell text: the placed tile's number, or empty; `aria-label`: `` `put a tile on ${a} plus ${b}` `` / `` `take the ${tile} tile off ${a} plus ${b}` ``;
   - add class `wrong` (and a visible `✗` suffix) to cells listed in `check.wrong`.
   - Below the grid, the **bank**: `<div className="addition-charts-bank" role="group" aria-label="Answer tiles">` mapping `working.bank` to `<button className={'addition-charts-tile' + (selectedIndex === i ? ' selected' : '')}` with `aria-pressed`, `aria-label={`${tile} tile`}`; tapping toggles selection.
   - Actions row (`.addition-charts-actions`, buttons `.addition-charts-btn`): **Check my chart** → `setCheck(checkPlacements(working))`, disabled when `working.placed.size === 0`. Note under actions when `check` present: `` `${check.correct.length} placed tiles match the control chart · ${check.wrong.length} need another look.` `` (`.stage-note`). When `isComplete(working)`: `<p className="stage-note">Every fact matches the control chart — all 81 tiles are placed.</p>` No animation, ever.
4. **Controls** (in `MaterialShell` `controls` prop, mirroring `MultiplicationBeadBoard.tsx`): a `Mode` `<select>` with options `Chart 1 — control chart`, `Chart 2 — half chart`, `Chart 3 — working chart`; a `Print control charts` button (`.addition-charts-btn`, toggles `showPrint`); a `Reset` button → `setWorking(createWorkingState())` plus clear `selectedIndex`, `check`, `hiRow`, `hiCol`.
5. **Help** prop: 3–5 sentences covering the finger gesture on Chart 1, why Chart 2 is half, and working-chart tile placement + honest Check (tone: see the `help` block in `MultiplicationBeadBoard.tsx`).
6. **Return shape** (required by the print-isolation CSS): a fragment with exactly two top-level nodes:

```tsx
return (
  <>
    <div className="addition-charts-app">
      <MaterialShell help={…} controls={…}>{/* grid, bank, actions, notes */}</MaterialShell>
    </div>
    {showPrint && (
      <div className={`print-sheet addition-charts-print${bw ? ' bw' : ''}`}>
        <div className="addition-charts-print-controls no-print">
          <label><input type="checkbox" checked={bw} onChange={(e) => setBw(e.target.checked)} /> Ink-friendly B&amp;W</label>
          <PrintButton label="Print control charts" />
          <button type="button" className="addition-charts-btn" onClick={() => setShowPrint(false)}>Close</button>
        </div>
        <section className="sheet-page">
          <header className="sheet-header"><h2 className="sheet-title">Addition Chart 1 — Control Chart</h2></header>
          <p className="sheet-instructions">Every addition fact from 1 + 1 to 9 + 9. Slide one finger down from the top number and one finger in from the side number — the answer is where they meet.</p>
          {/* <table className="addition-charts-print-table"> corner '+', th 1–9 top row, th 1–9 first column, td values */}
        </section>
        <section className="sheet-page">
          <header className="sheet-header"><h2 className="sheet-title">Addition Chart 2 — Half Chart</h2></header>
          <p className="sheet-instructions">Only the facts where the smaller number comes first — because 3 + 5 and 5 + 3 share an answer.</p>
          {/* same table; td for a > b gets className="gap" and no content */}
        </section>
      </div>
    )}
  </>
)
```

Print tables are plain `<table>` built from `additionChart1()` / `additionChart2()` grouped into 9 rows. Table width check: 10 × 0.55in = 5.5in, fits the 7.5in printable width of Letter with 0.5in `@page` margins.

**Check:** `npm run dev`, open `/materials/addition-charts` — all three modes render; placing/removing tiles works; `npm run build` green (strict tsc: no unused locals, `import type` where needed).

### Step 5 — `src/materials/addition-charts/def.ts` (new)

Exact file (matches `MaterialDef` in `src/materials/types.ts`):

```ts
import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'addition-charts',
  name: 'Addition Charts',
  ages: [5, 8],
  grades: 'K–2',
  strand: 'memorization',
  summary: 'Find any addition fact where two fingers meet on the control chart, then rebuild the whole chart from memory with answer tiles.',
  parentNote:
    'The addition charts carry the facts your child practiced on the strip board the last mile into memory. Chart 1 holds every fact from 1 + 1 to 9 + 9 — one finger slides down from the first number, one in from the second, and the answer waits where they meet. Chart 2 keeps only half the facts, letting your child discover that 3 + 5 and 5 + 3 are the same work. On the working chart the grid is blank: your child places all 81 answer tiles from memory and checks against the control chart — the material corrects, not the adult. Print the control charts to keep beside pencil-and-paper fact practice.',
  component: lazy(() => import('./AdditionCharts')),
  lessonSlugs: ['addition-charts'],
  worksheetSlugs: ['math-facts'],
}
```

**Check:** `content.test.ts` metadata assertions would pass for this def (parentNote > 60 chars, non-empty fields, valid strand); confirmed after step 9 wiring via `npm test`.

### Step 6 — `src/materials/addition-charts/lessons.ts` (new)

`export const lessons: Lesson[]` with exactly one lesson. **Locked metadata** (schema: `src/lessons/types.ts` — every field required and non-empty; `content.test.ts` additionally enforces ≥4 presentation steps and non-empty arrays):

| Field | Value |
|---|---|
| slug | `'addition-charts'` |
| name | `'The Addition Charts'` |
| strand | `'memorization'` |
| sequence | `6` |
| ages | `[5, 8]` |
| grades | `'K–2'` |
| virtualMaterials | `['addition-charts']` |
| prerequisites | `['addition-strip-board']` |
| followUpWork | must include `{ description: <pencil-and-paper drill description>, worksheetSlug: 'math-facts', presetId: 'first-facts' }` plus ≥1 paper-only activity (e.g. copy one row of Chart 1 onto paper daily) |

Content requirements (author writes the prose; tone and depth modeled on `src/materials/addition-strip-board/lessons.ts` — parent-facing, untrained reader, `say` lines for spoken language):

- `overview`: 1–2 sentences placing the charts after the strip board, before full abstraction.
- `materialsNeeded`: the printed control charts from this site (name the Print control charts button), paper tiles or the on-screen working chart, pencil and paper; include a household substitute (hand-ruled 9×9 grid, answers on cut card squares).
- `presentation`: 6–8 steps: (1) explore Chart 1, (2–3) the two-finger gesture with `say` lines (e.g. `say: 'Four… and three. My fingers meet at seven.'`), (4) Chart 2 and the commutativity discovery, (5–7) working chart: place tiles from memory, check against the printed control chart, fix and re-check.
- `directAims`: memorization of addition facts to 9 + 9; `indirectAims`: include commutativity and preparation for abstract column addition.
- `controlOfError`: the control chart itself — the child compares, the adult never marks; the on-screen Check flags only misplaced tiles.
- `pointsOfInterest`, `vocabulary` (include 'sum', 'combination', 'chart'), `variations`, `extensions`, `whatComesNext` (points to the multiplication bead board and charts, sequence 7).

**Check:** after step 9 wiring, `npm test` — the `addition-charts` blocks under "every lesson is a complete album entry" pass.

### Step 7 — `src/materials/multiplication-charts/` (new folder, mirror of steps 1–6)

Same six files with prefix `multiplication-charts-` / component `MultiplicationCharts.tsx`. Exhaustive diff list — everything else is identical in shape:

1. **model.ts:** doc comment references multiplication; `fact(a, b)` returns `a * b`; builders named `multiplicationChart1()` / `multiplicationChart2()`; all other exports keep the same names (`CHART_MIN`, `CHART_MAX`, `CELL_COUNT`, `HALF_COUNT`, `cellKey`, `WorkingState`, `createWorkingState`, `canPlaceTile`, `placeTile`, `removeTile`, `checkPlacements`, `isComplete`, `PlacementCheck`, `ChartCell`, `CellKey`).
2. **CSS:** classes prefixed `multiplication-charts-`; header rule uses `background: var(--paper-warm); color: var(--ink);` (screen) and in print `background: var(--paper-warm); color: #000; border-width: 2px;` with the same `.bw` override to `#fff`/`#000`. Comment in the CSS: `/* Supplier traditions disagree on multiplication chart color (red vs yellow); neutral headers avoid inventing a claim and keep red meaning 'addition charts' on this site. */` Corner cell color `var(--ink)`; add `background: rgba(255,255,255,0.82)` behind the corner so ink text reads on the felt-mat grid — or set the grid corner to the same `var(--paper-warm)` as headers (pick the latter).
3. **Component:** corner sign `×`; aria labels say `times` (`'put a tile on 4 times 3'`); finger note `` `${hiRow} × ${hiCol} = ${fact(hiRow, hiCol)} …` ``; print sheet titles `Multiplication Chart 1 — Control Chart` / `Multiplication Chart 2 — Half Chart`; Chart 1 instructions mention facts 1 × 1 to 9 × 9; body class `multiplication-charts-print-mode`.
4. **def.ts:** slug `'multiplication-charts'`, name `'Multiplication Charts'`, ages `[6, 9]`, grades `'1–3'`, strand `'memorization'`, summary/parentNote written fresh (2–4 sentences: after the bead board, tables into memory, tile working chart, printable control charts), `component: lazy(() => import('./MultiplicationCharts'))`, `lessonSlugs: ['multiplication-charts']`, `worksheetSlugs: ['math-facts']`.
5. **lessons.ts:** slug `'multiplication-charts'`, name `'The Multiplication Charts'`, strand `'memorization'`, sequence `7`, ages `[6, 9]`, grades `'1–3'`, virtualMaterials `['multiplication-charts']`, prerequisites `['multiplication-bead-board']`, followUpWork includes `{ worksheetSlug: 'math-facts', presetId: 'times-tables' }`; `whatComesNext` points into the passage-to-abstraction strand (checkerboard).
6. **model.test.ts:** the multiplication-specific cases in the Testing section.

**Check:** `npm test -- multiplication-charts` → 9 passing tests; `/materials/multiplication-charts` renders in dev.

### Step 8 — verify no shared-file drift

Implementers must NOT edit `src/materials/registry.ts`, `src/lessons/registry.ts`, `src/App.tsx`, `src/styles/*`, or `CLAUDE.md`. Everything above lives inside the two new folders.

**Check:** `git status` shows changes only under `src/materials/addition-charts/`, `src/materials/multiplication-charts/`, and `plan/14-memorization-charts.md`.

### Step 9 — registration entries (session lead wires; implementers report these exact lines)

`src/materials/registry.ts` — after the existing line `import { def as divisionBoard } from './division-board/def'`:

```ts
import { def as additionCharts } from './addition-charts/def'
import { def as multiplicationCharts } from './multiplication-charts/def'
```

and in the `MATERIALS` array, immediately after `divisionBoard,`:

```ts
  additionCharts,
  multiplicationCharts,
```

`src/lessons/registry.ts` — after `import { lessons as divisionBoard } from '../materials/division-board/lessons'`:

```ts
import { lessons as additionCharts } from '../materials/addition-charts/lessons'
import { lessons as multiplicationCharts } from '../materials/multiplication-charts/lessons'
```

and in the `LESSONS` array, immediately after `...divisionBoard,`:

```ts
  ...additionCharts,
  ...multiplicationCharts,
```

**Check:** `npm test` fully green (content contract: slugs unique, cross-references resolve, memorization sequence now 1..7 contiguous); `npm run build` green.

## New & modified files

| Path | New/Modified | Purpose |
|---|---|---|
| `src/materials/addition-charts/model.ts` | new | Pure chart builders + working-chart state machine (addition) |
| `src/materials/addition-charts/model.test.ts` | new | 9 named model tests |
| `src/materials/addition-charts/AdditionCharts.tsx` | new | Interactive Charts 1/2/3 UI + printable control charts |
| `src/materials/addition-charts/addition-charts.css` | new | Grid, bank, tile, print-table, print-isolation CSS |
| `src/materials/addition-charts/def.ts` | new | `MaterialDef` registration payload |
| `src/materials/addition-charts/lessons.ts` | new | Album lesson, memorization sequence 6 |
| `src/materials/multiplication-charts/model.ts` | new | Same shape, `fact = a * b` |
| `src/materials/multiplication-charts/model.test.ts` | new | 9 named model tests |
| `src/materials/multiplication-charts/MultiplicationCharts.tsx` | new | Interactive UI + printables |
| `src/materials/multiplication-charts/multiplication-charts.css` | new | Same structure, neutral headers |
| `src/materials/multiplication-charts/def.ts` | new | `MaterialDef` registration payload |
| `src/materials/multiplication-charts/lessons.ts` | new | Album lesson, memorization sequence 7 |
| `src/materials/registry.ts` | modified (session lead) | Two imports + two array entries after `divisionBoard` |
| `src/lessons/registry.ts` | modified (session lead) | Two imports + two spreads after `...divisionBoard` |
| `plan/14-memorization-charts.md` | modified | Status/checkboxes as work lands |

## Testing

Vitest, node environment, colocated. Style reference: `src/materials/multiplication-bead-board/model.test.ts` (behavior-sentence names, exhaustive loops, `toEqual` on exact structures). Shared helper per file:

```ts
function fillCorrectly(): WorkingState {
  let s = createWorkingState()
  for (let a = 1; a <= 9; a++) for (let b = 1; b <= 9; b++) s = placeTile(s, a, b, fact(a, b))
  return s
}
```

### `src/materials/addition-charts/model.test.ts` — `describe('addition charts model')`

1. **`'chart 1 holds all 81 facts in row-major order'`** — `additionChart1()` length 81; first cell `{ a: 1, b: 1, value: 2 }`; last `{ a: 9, b: 9, value: 18 }`; cell for (7,8) has `value === 15`; every cell satisfies `value === a + b` (loop).
2. **`'chart 2 keeps exactly the 45 a ≤ b facts'`** — length 45; contains `{ a: 7, b: 8, value: 15 }`; contains no cell with `a === 8 && b === 7`; contains all nine doubles `(a, a)`.
3. **`'the bank starts with one tile per fact — 81 tiles, sorted, right multiset'`** — `createWorkingState().bank` length 81; sorted ascending (compare to its own sorted copy); `placed.size === 0`; multiset equals `additionChart1().map(c => c.value).sort((x, y) => x - y)` via `toEqual`; spot counts: exactly one `2`, exactly nine `10`s, exactly one `18`.
4. **`'placeTile moves one tile from bank to an empty cell'`** — place `15` at (7,8): `placed.get('7,8') === 15`, bank length 80, and the count of 15-tiles drops from 4 to 3 (the addition bank holds exactly **four** 15s — the pairs (6,9), (7,8), (8,7), (9,6)).
5. **`'placeTile rejects an occupied cell and a tile not in the bank'`** — after placing 15 at (7,8), `placeTile(s, 7, 8, 10)` returns the same state object (`toBe`); `placeTile(fresh, 1, 1, 1)` returns same state (1 is not an addition answer — bank minimum is 2); placing a value more times than the bank holds: place all four 15s on four cells, fifth attempt returns state unchanged.
6. **`'removeTile puts the tile back and keeps the bank sorted'`** — place 15 at (7,8) then `removeTile` there: bank length 81, sorted ascending, `placed.size === 0`; `removeTile` on an empty cell returns the same state (`toBe`).
7. **`'checkPlacements flags exactly the wrong cells'`** — fixture: place correct `2` at (1,1), `5` at (2,3), `18` at (9,9); place wrong `9` at (4,4) (fact is 8) and `12` at (5,6) (fact is 11). Expect `correct` `toEqual` `[[1,1],[2,3],[9,9]]` and `wrong` `toEqual` `[[4,4],[5,6]]` (row-major order guaranteed by iterating chart 1).
8. **`'isComplete only when all 81 tiles are placed correctly'`** — fresh state: false; `fillCorrectly()`: true and its bank is empty; the swap fixture (place `3` at (1,1) and `2` at (1,2), then fill the remaining 79 correctly): `placed.size === 81` but `isComplete` false and `checkPlacements(...).wrong` `toEqual` `[[1,1],[1,2]]`.
9. **`'out-of-range coordinates throw'`** — `placeTile(s, 0, 5, 7)`, `placeTile(s, 10, 1, 7)`, `cellKey(2.5, 3)`, and `fact(1, 10)` all throw.

### `src/materials/multiplication-charts/model.test.ts` — `describe('multiplication charts model')`

Same nine names adapted, with these exact numbers:

1. Chart 1: 81 cells; first `{ a: 1, b: 1, value: 1 }`; last `{ a: 9, b: 9, value: 81 }`; (7,8) → `56`; every `value === a * b`.
2. Chart 2: 45 cells; includes `{ a: 7, b: 8, value: 56 }`; excludes (8,7); includes all nine squares.
3. Bank: 81 tiles sorted; multiset equals chart-1 answers; **exactly four 12s** (2×6, 6×2, 3×4, 4×3); **exactly three 36s** (4×9, 9×4, 6×6); exactly one 1; exactly one 81.
4. Place `56` at (7,8): `placed.get('7,8') === 56`, bank 80, 56-count 2 → 1 (pairs: (7,8),(8,7)).
5. Rejects: occupied (7,8); tile `11` (prime > 9, never a product here) on a fresh state returns same state; a fifth `12` after four are placed returns state unchanged.
6. Remove (7,8) → bank 81, sorted, placed empty; remove empty cell is a no-op (`toBe`).
7. Fixture: correct `4` at (2,2), `9` at (3,3), `81` at (9,9); wrong `24` at (4,5) (fact 20), `48` at (6,7) (fact 42). `correct` → `[[2,2],[3,3],[9,9]]`, `wrong` → `[[4,5],[6,7]]`.
8. `fillCorrectly()` (uses `a * b`) → complete; swap fixture: `2` at (1,1) (fact 1) and `1` at (1,2) (fact 2) → 81 placed, not complete, wrong `[[1,1],[1,2]]`.
9. Out-of-range throws, as above.

Also: after step 9 wiring, the existing `src/lessons/content.test.ts` must stay green with no edits — it automatically covers the two new lessons (field completeness, prerequisite/worksheet/preset resolution, memorization sequence 1..7) and the two new material defs.

## Manual QA script

1. `npm run dev`; open `http://localhost:5173/materials/addition-charts` (or the LAN IP).
2. **Chart 1:** header row and column read 1–9 on red; corner shows `+`. Tap left header `4`, then top header `3` — row and column shade, the meeting cell is outlined, and the note reads `4 + 3 = 7 — where your two fingers meet.` Tap `4` again — the highlight clears.
3. **Chart 2:** switch modes. Count a row: row 8 shows only two cells (8+8, 8+9). Confirm the (7,8) cell shows 15 and there is no cell at row 8, column 7.
4. **Chart 3 — working chart:** grid is blank; bank shows tiles ascending starting 2, 3, 3, 4… Tap a `15` tile (it outlines), tap the cell at row 7 column 8 — the tile lands, bank shrinks. Now place a deliberate error: tile `9` at row 4 column 4. Press **Check my chart** — only the (4,4) cell gets a dashed outline and `✗`, and the note reads `1 placed tiles match the control chart · 1 need another look.` Tap the wrong cell — the tile returns to the bank and the mark clears.
5. Press **Reset** — grid empties, bank shows 81 tiles again. Confirm nothing praises, scores, or animates at any point.
6. **Print:** press **Print control charts**. Two Letter-shaped pages preview below. Open the browser print dialog: exactly 2 pages; no site header/footer, no page title, no interactive grid — only the two charts. Cancel, tick **Ink-friendly B&W**, print-preview again: headers are white with bold black numerals and a heavier border; every number still readable. Close the section; print-preview now shows the normal page again.
7. **Mobile (375px wide devtools):** the chart grid scrolls sideways inside its own container (the page body does not scroll horizontally); tiles and cells are comfortably tappable (≥44px); the bank scrolls vertically.
8. Repeat spot checks at `/materials/multiplication-charts`: corner `×`; (7,8) reads 56 on Chart 1; headers are warm-paper, not red; bank contains exactly four `12` tiles (scroll and count); working-chart flow and both print pages behave as in steps 4–6.
9. Visit `/lessons/addition-charts` and `/lessons/multiplication-charts`: pages render fully; follow-up work links land on `/worksheets/math-facts` with the `first-facts` / `times-tables` preset applied.
10. `/materials` index: both new cards appear in the Memorization group after the Unit Division Board.

## Acceptance criteria

- [x] `npm test` green (existing 730 tests plus ≥18 new model tests; `content.test.ts` untouched and passing)
- [x] `npm run build` green (strict tsc + vite)
- [x] Two new material folders exist with the full house file set; no files outside them changed except the two registries (wired by session lead) and this PRD
- [x] `additionChart1()`/`multiplicationChart1()` return 81 row-major cells; `…Chart2()` return the 45 `a ≤ b` cells
- [x] Working-chart bank starts with exactly 81 tiles whose multiset equals the fact-table answers, sorted ascending
- [x] `placeTile` refuses occupied cells and absent tiles by returning the state unchanged; `removeTile` restores the bank sorted
- [x] Check marks wrong placements only, only on press, with honest counts; marks clear on the next change; completion shows one plain sentence, no animation
- [x] Chart 1/2 finger-highlight works (row + column + meeting cell + fact note) and is view-only
- [x] Print section renders Chart 1 and Chart 2 as two `.sheet-page` tables with 0.55in cells; printing while open emits exactly those 2 pages with no site chrome or interactive UI
- [x] `.bw` print: headers white with bold black numerals and 2px borders — no information carried by color alone; color print keeps red headers (addition) / warm-neutral headers (multiplication)
- [x] All interactive targets ≥ 44px; at 375px the grid scrolls in its own container without page-level horizontal scroll
- [x] Lessons registered at memorization sequences 6 and 7 with prerequisites `['addition-strip-board']` / `['multiplication-bead-board']` and follow-up `math-facts` presets `first-facts` / `times-tables`
- [x] No localStorage, no analytics, no new dependencies, no runtime network requests
- [x] Both material pages and both lesson pages render on the LAN dev server; QA script above passes end to end

## Out of scope

- Subtraction and division memorization charts (a future PRD; the model shape here is designed to be copied for them).
- The condensed/special charts of the full tradition (addition charts 4–6, multiplication charts 3–5 variants, bingo-tile games beyond the single working chart).
- Any new worksheet generator or changes to `math-facts` (its existing presets are reused as-is).
- Drag-and-drop tile placement (tap-select-tap-place only, per house interaction rules).
- PDF export, chart-size options, or non-Letter paper sizes.
- Persisting working-chart progress across visits (forbidden by product rules).
- Changes to `MaterialPage.tsx`, `App.tsx`, global styles, or `print.css`.
