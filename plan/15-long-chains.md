# PRD 15 — The Long Chains: 100 chain and 1,000 chain

**Status:** Done
**Effort:** M — ~120 lines of new pure model code, one new windowed-scroll component, one CSS block, one album lesson; no shared-file edits and no new dependencies, but the virtualized scroller and the 4-page printable need careful QA.
**Depends on:** nothing (wave 1 is complete; builds only on the existing `src/materials/bead-chains/` folder)

## Why

Children famously adore the thousand chain — it is expedition math: a golden chain of one hundred ten-bars stretching across the whole classroom, counted by tens with an arrow label at every bar and a hundred square waiting at every milestone. This feature brings the two golden long chains (100 and 1,000) to the existing Bead Chains material as a horizontally scrolling journey for the child, and gives parents printable arrow labels so a real or homemade chain can be labeled on paper. Both parent and child win: the child gets the longest, most satisfying count on the site; the parent gets a cut-out printable that makes the physical work possible at home.

## Binding product rules (from CLAUDE.md — restated for this feature)

- **No accounts, tracking, or gamification.** The chain never saves progress (no localStorage), never times the child, never awards anything. Scrolling away and back is the only "resume" — plus the position chip that says where you are.
- **Kids' practice on paper.** The only on-screen activity is the chain itself. The follow-up work in the new lesson is pencil-and-paper, and the printable arrow labels exist precisely so real/homemade chains can be labeled off-screen.
- **Print is first-class.** The arrow-label pages are US Letter, wrapped in `.print-sheet` / `.sheet-page` (reusing `SheetPage` from `src/worksheets/SheetPage.tsx`), with an ink-friendly B&W checkbox that adds the existing `.bw` class. Hundreds are emphasized by **size and weight**, not color alone, so `.bw` loses nothing.
- **Fully static & offline.** No network requests, no new npm dependencies. Everything renders from `react`, `react-dom`, existing components, and plain CSS.
- **Code conventions.** TypeScript strict with `verbatimModuleSyntax` (`import type` for types); colors only via tokens (`var(--golden)`, `var(--pv-ten)`, `var(--pv-hundred)`, `var(--pv-thousand)` — never hex in components); tap-first interaction, hit targets ≥ 44px via `--touch-target`; a Reset control; honest control of error (Check marks wrong tickets, no praise animation); pure logic tested in colocated `model.test.ts` (node env, no React rendering).
- **Montessori authenticity.** The long chains are golden (`--golden` via the existing `TenBar`). Printed arrow labels follow the place-value hierarchy: tens blue (`--pv-ten`), hundreds red (`--pv-hundred`), 1,000 green (`--pv-thousand`). Milestones show the golden `HundredSquare`; the 1,000 finale shows the `ThousandCube`. Numbers ≥ 1,000 are formatted with commas via `formatNumber` from `src/lib/placeValue.ts`.

## Current state of the folder (verified — the code this PRD extends)

`src/materials/bead-chains/` today implements only the **short** chains (n² beads, n = 2…10):

- `model.ts` exports: `CHAIN_MIN` (2), `CHAIN_MAX` (10), `interface ChainState { n: number; tray: number[]; placements: (number | null)[] }`, `type SlotResult = 'correct' | 'wrong' | 'empty'`, and functions `chainBars(n)`, `chainTotal(n)`, `correctValue(n, slotIndex)` = `(slotIndex + 1) * n`, `slotValues(n)`, `createChain(n, seed)` (tray shuffled via `createRng(seed).shuffle`), `placeTicket(state, trayIndex, slotIndex)` (displaced ticket returns to tray), `removeTicket(state, slotIndex)`, `evaluate(state): SlotResult[]`, `isComplete(state)`.
- `BeadChains.tsx` (default export): one component; `useState<ChainState>`, a `Chain` `<select>` of "Chain of 2…10", **Check** and **Reset** buttons (class `bead-chains-btn`) inside `MaterialShell` (`controls` / `help` / `mat="felt"` props — see `src/components/MaterialShell.tsx`). Ticket interaction: tap a tray ticket (`.bead-chains-ticket`, `aria-pressed`), then tap a slot (`.bead-chains-slot`) at the end of a bar; tapping a filled slot returns its ticket. `checked` state is cleared on every placement; `evaluate` runs only when Check is pressed; results render ✓/✗ via `.bead-chains-mark-right/-wrong` (glyph + color, never color alone).
- `bead-chains.css`: all classes prefixed `bead-chains-`; notable existing classes reused below: `bead-chains-btn`, `bead-chains-tray`, `bead-chains-tray-label`, `bead-chains-ticket`, `bead-chains-selected`, `bead-chains-slot`, `bead-chains-slot-filled`, `bead-chains-slot-right`, `bead-chains-slot-wrong`, `bead-chains-mark(-right/-wrong)`, `bead-chains-square-note`. The ticket/slot left band uses `var(--bead-chains-color, var(--golden))` — unset in long mode, so it falls back to golden. Correct.
- `def.ts` exports `def: MaterialDef` with `lessonSlugs: ['bead-chains-skip-counting']`, `worksheetSlugs: ['skip-counting']`.
- `lessons.ts` exports one `Lesson`, slug `bead-chains-skip-counting`, strand `linear-counting`, **sequence 7**. Verified: the linear-counting strand currently runs 1–7 (teen-board 1–2, ten-board 3–4, hundred-board 5–6, bead-chains 7), so the new lesson takes **sequence 8** and `src/lessons/content.test.ts` ("runs 1..n with no gaps") stays green.
- Lessons are registered automatically: `src/lessons/registry.ts` already spreads `lessons` from `bead-chains/lessons.ts`, so adding to that array requires **no shared-file edit**.

Nesting check (verified): `.material-stage` in `src/styles/materials.css` has `overflow-x: auto`. The new inner scroller `.bead-chains-long-scroll` (also `overflow-x: auto`, `max-width: 100%`) contains the only wide content, so the stage itself never overflows and there is no double scrollbar.

## Design decisions (locked — do not revisit)

From the session lead:

1. **All changes live inside `src/materials/bead-chains/`.** No edits to `src/materials/registry.ts`, `src/lessons/registry.ts`, `App.tsx`, `src/styles/*`, or any shared component.
2. **Model additions in `model.ts`:** `export type LongChainKind = 100 | 1000`; `export function longChain(kind)` returning `{ bars, labelValues, milestones }`; slot correctness `(slotIndex + 1) * 10` and evaluation mirroring the short-chain ticket logic, reusing `SlotResult`; windowing helper `export function visibleBarRange(scrollLeft, viewportWidth, barWidth, totalBars, buffer = 5): [number, number]` (clamped inclusive indices).
3. **UI:** the existing Chain `<select>` gains **Hundred chain** and **Thousand chain** options. The stage renders a horizontal scroll container `.bead-chains-long-scroll` inside `.material-stage`, drawing **only** the bars in `visibleBarRange` (updated by `onScroll` state). Bars are the existing `TenBar` from `src/components/beads.tsx` at `beadSize={12}` → SVG width `(12/20) × 200 = 120px`; **`BAR_WIDTH = 130px` including a 10px gap**; total track width = `bars × 130px` (13,000px for the thousand chain). Sticky readout chip "You are near ___" = `(leftmost visible bar index + 1) × 10`, updated on scroll, announced via `role="status"` (aria-live polite). Ticket tray reuses the tap-ticket-then-tap-slot interaction; a slot at every bar end; milestone slots (every 100) larger with a small `HundredSquare` glyph beside them; a `ThousandCube` glyph at the 1,000 finale. Check marks wrong tickets only on press.
4. **Printable tickets:** a "Show arrow labels" toggle reveals `.print-sheet` pages — tickets 10–100 for the hundred chain (one page) and 10–1,000 by tens for the thousand chain (100 tickets across 4 pages, hundreds emphasized larger/bold). Cut-out grid, dashed borders, tickets 1.4in × 0.9in, fully legible in `.bw`.
5. **Lesson:** ONE new lesson in `bead-chains/lessons.ts`: slug `long-chains`, strand `linear-counting`, sequence 8, `prerequisites: ['bead-chains-skip-counting']`, `virtualMaterials: ['bead-chains']`, follow-up work linking `worksheetSlug: 'skip-counting'` (generator verified in `src/worksheets/generators/skip-counting.tsx`). Update `def.ts` `lessonSlugs`. All album fields non-empty, ≥ 4 presentation steps (`src/lessons/content.test.ts` enforces this).

PRD-level decisions (also locked):

6. **The long-chain tray is kept in ascending order, not shuffled**, and the UI shows only the first 12 unplaced tickets ("…N more in the box"). Rationale: 100 shuffled tickets is unusable and inauthentic — real thousand-chain arrows come boxed in order; the work is the counting expedition, not ticket-hunting. Mistakes remain possible (12 visible choices) so Check keeps meaning. Because the model tray is sorted and the UI shows a prefix slice, displayed indices equal model tray indices. No seed parameter is needed: `createLongChain(kind)` is fully deterministic.
7. **Long-chain UI lives in a new sibling component `LongChain.tsx`** (same folder), rendered by `BeadChains.tsx` with `key={kind}` so switching chains remounts with fresh state. The shared `<select>` is built once in `BeadChains.tsx` and passed to `LongChain` as a `chainSelect: ReactNode` prop.
8. **Segments are absolutely positioned** on a fixed-width track (`left: k * BAR_WIDTH`), so windowed rendering never changes the scroll width.
9. **Print isolation via a body class.** While the arrow-label panel is open, a `useEffect` adds `bead-chains-print-tickets` to `document.body`; an `@media print` rule in `bead-chains.css` then hides everything in `main.site-main` except the label pages (the material page's `h1`/badges/parent sections would otherwise print above the cut-out grid). All new print CSS is material-scoped and colocated in `bead-chains.css`; the generic plumbing (`.print-sheet`, `.sheet-page`, `.bw`, `@page letter`) in `src/styles/print.css` is reused untouched.
10. **30 tickets per printed page** (5 columns × 6 rows of 1.4in × 0.9in). Fit check: 5 × 1.4in + 4 × 0.1in gap = 7.4in ≤ 7.5in usable width; 6 × 0.9in + 5 × 0.15in gap = 6.15in + header ≈ 7in ≤ 10in usable height. 100 tickets → pages of 30/30/30/10 = 4 pages; 10 tickets → 1 page.

## Implementation steps

### Step 1 — `src/materials/bead-chains/model.ts`: long-chain model + windowing helper

Append below the existing short-chain code (reuse the existing `SlotResult` type; do not modify any existing export):

```ts
/* ---------- Long chains: the golden 100 chain and 1,000 chain ---------- */

export type LongChainKind = 100 | 1000

export interface LongChainSpec {
  /** Number of golden ten-bars: 10 or 100. */
  bars: number
  /** Arrow-label values in order: 10, 20, …, kind. */
  labelValues: number[]
  /** Multiples of 100 up to kind: [100] or [100, 200, …, 1000]. */
  milestones: number[]
}

function assertLongKind(kind: number): void {
  if (kind !== 100 && kind !== 1000) {
    throw new Error(`bead-chains: long chain must be 100 or 1000, got ${kind}`)
  }
}

export function longChain(kind: LongChainKind): LongChainSpec {
  assertLongKind(kind)
  const bars = kind / 10
  return {
    bars,
    labelValues: Array.from({ length: bars }, (_, k) => (k + 1) * 10),
    milestones: Array.from({ length: kind / 100 }, (_, i) => (i + 1) * 100),
  }
}

export interface LongChainState {
  kind: LongChainKind
  /** Unplaced ticket values — always ascending (arrows come boxed in order). */
  tray: number[]
  /** Ticket placed at each slot (slot k = end of ten-bar k), or null. */
  placements: (number | null)[]
}

export function createLongChain(kind: LongChainKind): LongChainState {
  const spec = longChain(kind)
  return {
    kind,
    tray: [...spec.labelValues],
    placements: Array.from({ length: spec.bars }, () => null),
  }
}

/** The correct ticket for long-chain slot k (0-indexed): (k + 1) · 10. */
export function longCorrectValue(kind: LongChainKind, slotIndex: number): number {
  assertLongKind(kind)
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= kind / 10) {
    throw new Error(`bead-chains: slot index out of range for the ${kind} chain: ${slotIndex}`)
  }
  return (slotIndex + 1) * 10
}

/** Mirrors placeTicket, but the tray stays ascending when a displaced ticket returns. */
export function placeLongTicket(state: LongChainState, trayIndex: number, slotIndex: number): LongChainState {
  if (trayIndex < 0 || trayIndex >= state.tray.length) {
    throw new Error(`bead-chains: no ticket at tray index ${trayIndex}`)
  }
  if (slotIndex < 0 || slotIndex >= state.placements.length) {
    throw new Error(`bead-chains: no slot at index ${slotIndex}`)
  }
  const value = state.tray[trayIndex]
  const displaced = state.placements[slotIndex]
  const tray = state.tray.filter((_, i) => i !== trayIndex)
  if (displaced !== null) tray.push(displaced)
  tray.sort((a, b) => a - b)
  return {
    ...state,
    tray,
    placements: state.placements.map((v, i) => (i === slotIndex ? value : v)),
  }
}

/** Mirrors removeTicket; the returned ticket re-enters the tray in ascending position. */
export function removeLongTicket(state: LongChainState, slotIndex: number): LongChainState {
  if (slotIndex < 0 || slotIndex >= state.placements.length) {
    throw new Error(`bead-chains: no slot at index ${slotIndex}`)
  }
  const value = state.placements[slotIndex]
  if (value === null) return state
  return {
    ...state,
    tray: [...state.tray, value].sort((a, b) => a - b),
    placements: state.placements.map((v, i) => (i === slotIndex ? null : v)),
  }
}

/** Same contract as evaluate(): flags every misplacement and nothing else. */
export function evaluateLong(state: LongChainState): SlotResult[] {
  return state.placements.map((v, k) => {
    if (v === null) return 'empty'
    return v === longCorrectValue(state.kind, k) ? 'correct' : 'wrong'
  })
}

export function isLongComplete(state: LongChainState): boolean {
  return evaluateLong(state).every((r) => r === 'correct')
}

/**
 * Windowing for the scrolling stage: the inclusive [start, end] bar indices
 * worth rendering, i.e. the bars intersecting the viewport plus `buffer`
 * bars on each side, clamped to [0, totalBars - 1].
 */
export function visibleBarRange(
  scrollLeft: number,
  viewportWidth: number,
  barWidth: number,
  totalBars: number,
  buffer = 5,
): [number, number] {
  if (barWidth <= 0 || totalBars <= 0) {
    throw new Error(`bead-chains: visibleBarRange needs positive barWidth and totalBars`)
  }
  const first = Math.floor(scrollLeft / barWidth)
  const last = Math.floor((scrollLeft + viewportWidth) / barWidth)
  const start = Math.max(0, Math.min(first, totalBars - 1) - buffer)
  const end = Math.min(totalBars - 1, last + buffer)
  return [start, Math.max(start, end)]
}
```

Why windowing is mandatory, not a nicety: unwindowed, the thousand chain is 100 `TenBar` SVGs × (1 wire line + 10 beads × (circle + highlight ellipse)) ≈ 2,100 shape nodes, plus 100 slot buttons and 10 hundred-squares (100 circles each) — roughly 3,500+ DOM nodes re-rendered on every state change. Windowed, at most `(viewport ≈ 7 bars) + 2 × 5 buffer + 1 ≈ 18` bars ≈ ~450 nodes are live.

**Check:** `npm run build` passes (strict tsc); existing `model.test.ts` still green (`npm test`); no existing export changed.

### Step 2 — `src/materials/bead-chains/model.test.ts`: new test cases

See the **Testing** section below for the exact `describe`/`it` blocks; add them to this file. **Check:** `npm test` — all new cases green, 0 existing failures.

### Step 3 — `src/materials/bead-chains/bead-chains.css`: long-chain and print styles

Append (all colors via tokens; `#000` is permitted here only as the printed cut line, matching `print.css` conventions):

```css
/* ---------- Long chains (hundred & thousand) ---------- */

.bead-chains-long-tray {
  flex-wrap: nowrap;
  overflow-x: auto;
}

.bead-chains-long-scroll {
  position: relative;
  overflow-x: auto;
  max-width: 100%;
  padding: 0.25rem 0 0.75rem;
  -webkit-overflow-scrolling: touch;
}

.bead-chains-long-chip {
  position: sticky;
  left: 0;
  display: inline-block;
  width: max-content;
  margin: 0 0 0.7rem;
  padding: 0.35rem 0.7rem;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--ink);
}

.bead-chains-long-track {
  position: relative;
  height: 130px; /* 12px bar + 6px gap + slot row (≈58px milestone slot / 40px glyph) + finale headroom */
}

.bead-chains-long-segment {
  position: absolute;
  top: 0;
  width: 120px; /* TenBar at beadSize 12 */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.bead-chains-long-slot-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Milestone slots (every 100): larger, red hundreds band when filled. */
.bead-chains-slot-milestone {
  min-width: calc(var(--touch-target) + 14px);
  min-height: calc(var(--touch-target) + 10px);
  font-size: 1.4rem;
}

.bead-chains-slot-filled.bead-chains-slot-milestone {
  border-left-width: 9px;
  border-left-color: var(--pv-hundred);
}

.bead-chains-ticket-hundred {
  border-left-color: var(--pv-hundred);
  font-size: 1.3rem;
}

.bead-chains-long-finale {
  position: absolute;
  top: 0;
  display: flex;
  align-items: flex-start;
}

/* ---------- Printable arrow labels ---------- */

.bead-chains-tickets-section {
  margin-top: 1.5rem;
}

.bead-chains-ticket-grid {
  display: grid;
  grid-template-columns: repeat(5, 1.4in);
  grid-auto-rows: 0.9in;
  column-gap: 0.1in;
  row-gap: 0.15in;
  justify-content: center;
}

.bead-chains-print-ticket {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px dashed #000; /* the cut line — printed black in color and B&W */
  border-radius: 4px;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.28in;
  color: var(--pv-ten);
}

/* Hundreds and the thousand: size + weight carry the emphasis, so .bw loses nothing. */
.bead-chains-print-ticket-hundred {
  font-size: 0.36in;
  color: var(--pv-hundred);
}

.bead-chains-print-ticket-thousand {
  font-size: 0.44in;
  color: var(--pv-thousand);
}

/* While the arrow-label panel is open, printing produces ONLY the label pages. */
@media print {
  body.bead-chains-print-tickets main.site-main > :not(.bead-chains-long-wrap) {
    display: none !important;
  }

  body.bead-chains-print-tickets .bead-chains-long-wrap > :not(.bead-chains-tickets-section) {
    display: none !important;
  }
}
```

Note `.print-sheet.bw` in `src/styles/print.css` already overrides `--pv-ten`, `--pv-hundred`, and `--pv-thousand` to `#000` — the B&W mode needs zero new rules.

**Check:** `npm run dev`, load `/materials/bead-chains` — no visual change to the short chains (new classes are unused so far).

### Step 4 — `src/materials/bead-chains/LongChain.tsx` (new): the scrolling stage + printable labels

```tsx
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { TenBar, HundredSquare, ThousandCube } from '../../components/beads'
import { PrintButton } from '../../components/PrintButton'
import { SheetPage } from '../../worksheets/SheetPage'
import { formatNumber } from '../../lib/placeValue'
import {
  createLongChain,
  evaluateLong,
  isLongComplete,
  longChain,
  placeLongTicket,
  removeLongTicket,
  visibleBarRange,
} from './model'
import type { LongChainKind, LongChainState } from './model'
import './bead-chains.css'

/** 120px TenBar (beadSize 12 → (12/20) · 200) + 10px gap. Must match the CSS. */
const BAR_WIDTH = 130
const TRAY_PREVIEW = 12
const TICKETS_PER_PAGE = 30

interface LongChainProps {
  kind: LongChainKind
  /** The shared Chain <select>, built by BeadChains so both modes offer identical choices. */
  chainSelect: ReactNode
}

export default function LongChain({ kind, chainSelect }: LongChainProps) {
  const spec = longChain(kind)
  const [state, setState] = useState<LongChainState>(() => createLongChain(kind))
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [range, setRange] = useState<[number, number]>([0, 11])
  const [nearValue, setNearValue] = useState(10)
  const [showTickets, setShowTickets] = useState(false)
  const [bw, setBw] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const results = checked ? evaluateLong(state) : null
  const complete = isLongComplete(state)

  function updateWindow() {
    const el = scrollRef.current
    if (!el) return
    const next = visibleBarRange(el.scrollLeft, el.clientWidth, BAR_WIDTH, spec.bars)
    setRange((cur) => (cur[0] === next[0] && cur[1] === next[1] ? cur : next))
    const leftmost = Math.max(0, Math.min(spec.bars - 1, Math.floor(el.scrollLeft / BAR_WIDTH)))
    setNearValue((leftmost + 1) * 10)
  }

  useEffect(() => {
    updateWindow() // measure the real viewport on mount
    window.addEventListener('resize', updateWindow)
    return () => window.removeEventListener('resize', updateWindow)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.body.classList.toggle('bead-chains-print-tickets', showTickets)
    return () => document.body.classList.remove('bead-chains-print-tickets')
  }, [showTickets])

  function reset() {
    setState(createLongChain(kind))
    setSelected(null)
    setChecked(false)
    scrollRef.current?.scrollTo({ left: 0 })
  }

  function onTicketTap(trayIndex: number) {
    setSelected((cur) => (cur === trayIndex ? null : trayIndex))
  }

  function onSlotTap(slotIndex: number) {
    if (selected !== null) {
      setState(placeLongTicket(state, selected, slotIndex))
      setSelected(null)
      setChecked(false)
    } else if (state.placements[slotIndex] !== null) {
      setState(removeLongTicket(state, slotIndex))
      setChecked(false)
    }
  }

  const controls = (
    <>
      {chainSelect}
      <button
        type="button"
        className="bead-chains-btn"
        onClick={() => setChecked(true)}
        disabled={state.placements.every((p) => p === null)}
      >
        Check
      </button>
      <button type="button" className="bead-chains-btn" onClick={reset}>
        Reset
      </button>
      <button
        type="button"
        className="bead-chains-btn"
        onClick={() => setShowTickets((s) => !s)}
        aria-pressed={showTickets}
      >
        {showTickets ? 'Hide arrow labels' : 'Show arrow labels'}
      </button>
    </>
  )

  const help = (
    <p>
      This chain is long — scroll sideways to travel down it. Count the golden beads by tens: at the end of each
      ten-bar, tap the next ticket in the tray, then tap the empty spot at the end of the bar. Every hundred earns a
      bigger ticket and a hundred square{kind === 1000 ? ', and the thousand cube waits at the very end' : ''}. The
      &ldquo;You are near&rdquo; sign tells you where you are whenever you scroll back after a break. Tap Check to mark
      placed tickets right or wrong. Show arrow labels prints cut-out tickets for a real chain at home.
    </p>
  )

  const barIndexes = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i)

  const allValues = spec.labelValues
  const pages: number[][] = []
  for (let i = 0; i < allValues.length; i += TICKETS_PER_PAGE) pages.push(allValues.slice(i, i + TICKETS_PER_PAGE))

  return (
    <div className="bead-chains-long-wrap">
      <MaterialShell controls={controls} help={help} mat="felt">
        <div className="bead-chains-tray bead-chains-long-tray">
          <span className="bead-chains-tray-label">Tickets:</span>
          {state.tray.length === 0 && <span className="bead-chains-tray-label">all placed</span>}
          {state.tray.slice(0, TRAY_PREVIEW).map((value, i) => (
            <button
              key={value}
              type="button"
              className={`bead-chains-ticket${value % 100 === 0 ? ' bead-chains-ticket-hundred' : ''}${
                selected === i ? ' bead-chains-selected' : ''
              }`}
              onClick={() => onTicketTap(i)}
              aria-pressed={selected === i}
              aria-label={`ticket ${formatNumber(value)}`}
            >
              {formatNumber(value)}
            </button>
          ))}
          {state.tray.length > TRAY_PREVIEW && (
            <span className="bead-chains-tray-label">…{state.tray.length - TRAY_PREVIEW} more in the box</span>
          )}
        </div>

        <div className="bead-chains-long-scroll" ref={scrollRef} onScroll={updateWindow}>
          <p className="bead-chains-long-chip" role="status">
            You are near {formatNumber(nearValue)}
          </p>
          <div
            className="bead-chains-long-track"
            style={{ width: spec.bars * BAR_WIDTH + (kind === 1000 ? 150 : 70) }}
          >
            {barIndexes.map((k) => {
              const placed = state.placements[k]
              const result = results?.[k]
              const value = (k + 1) * 10
              const isMilestone = value % 100 === 0
              const slotClass = [
                'bead-chains-slot',
                placed !== null ? 'bead-chains-slot-filled' : '',
                isMilestone ? 'bead-chains-slot-milestone' : '',
                result === 'correct' ? 'bead-chains-slot-right' : '',
                result === 'wrong' ? 'bead-chains-slot-wrong' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <div className="bead-chains-long-segment" key={k} style={{ left: k * BAR_WIDTH }}>
                  <TenBar beadSize={12} title={`ten-bar ${k + 1}`} />
                  <div className="bead-chains-long-slot-row">
                    <button
                      type="button"
                      className={slotClass}
                      onClick={() => onSlotTap(k)}
                      aria-label={
                        placed === null
                          ? `empty label spot at the end of ten-bar ${k + 1}`
                          : `label spot at the end of ten-bar ${k + 1}, holds ticket ${formatNumber(placed)}`
                      }
                    >
                      {placed !== null ? formatNumber(placed) : ''}
                      {result === 'correct' && (
                        <span className="bead-chains-mark bead-chains-mark-right" aria-hidden="true">✓</span>
                      )}
                      {result === 'wrong' && (
                        <span className="bead-chains-mark bead-chains-mark-wrong" aria-hidden="true">✗</span>
                      )}
                    </button>
                    {isMilestone && <HundredSquare size={40} title={`hundred square at ${formatNumber(value)}`} />}
                  </div>
                </div>
              )
            })}
            {kind === 1000 && (
              <div className="bead-chains-long-finale" style={{ left: spec.bars * BAR_WIDTH + 12 }}>
                <ThousandCube size={64} title="thousand cube" />
              </div>
            )}
          </div>
        </div>

        {complete && (
          <p className="stage-note bead-chains-square-note">
            {kind === 100
              ? '10 bars of 10 make 100 — ten tens are one hundred.'
              : `100 bars of 10 make ${formatNumber(1000)} — one hundred tens are one thousand.`}
          </p>
        )}
      </MaterialShell>

      {showTickets && (
        <section className="bead-chains-tickets-section">
          <div className="material-controls no-print">
            <label>
              <input type="checkbox" checked={bw} onChange={(e) => setBw(e.target.checked)} />
              Ink-friendly B&amp;W
            </label>
            <PrintButton label="Print arrow labels" />
          </div>
          <div className={`print-sheet${bw ? ' bw' : ''}`}>
            {pages.map((pageValues, p) => (
              <SheetPage
                key={p}
                title={`Arrow labels — ${kind === 100 ? 'hundred' : 'thousand'} chain${
                  pages.length > 1 ? ` (page ${p + 1} of ${pages.length})` : ''
                }`}
                instructions="Cut along the dashed lines. Lay each label at the end of its ten-bar as your child counts."
                nameDate={false}
              >
                <div className="bead-chains-ticket-grid">
                  {pageValues.map((v) => (
                    <div
                      key={v}
                      className={`bead-chains-print-ticket${
                        v === 1000
                          ? ' bead-chains-print-ticket-thousand'
                          : v % 100 === 0
                            ? ' bead-chains-print-ticket-hundred'
                            : ''
                      }`}
                    >
                      {formatNumber(v)}
                    </div>
                  ))}
                </div>
              </SheetPage>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

**Check:** builds under strict tsc (all type-only imports use `import type`); component not yet reachable — verified in Step 5.

### Step 5 — `src/materials/bead-chains/BeadChains.tsx`: mode select + branch

1. Add imports: `import LongChain from './LongChain'` and `import type { LongChainKind } from './model'`.
2. Add state: `const [longKind, setLongKind] = useState<LongChainKind | null>(null)`.
3. Replace the current `<label>Chain<select …>` block in `controls` with a shared element built once, above `controls`:

```tsx
const selectValue = longKind === null ? String(n) : `long-${longKind}`

function onModeChange(value: string) {
  if (value === 'long-100') setLongKind(100)
  else if (value === 'long-1000') setLongKind(1000)
  else {
    setLongKind(null)
    startChain(Number(value))
  }
}

const chainSelect = (
  <label>
    Chain
    <select value={selectValue} onChange={(e) => onModeChange(e.target.value)}>
      {CHAIN_CHOICES.map((c) => (
        <option key={c} value={String(c)}>
          Chain of {c}
        </option>
      ))}
      <option value="long-100">Hundred chain</option>
      <option value="long-1000">Thousand chain</option>
    </select>
  </label>
)
```

4. Use `{chainSelect}` where the old label sat inside `controls`, and before the existing `return`, add:

```tsx
if (longKind !== null) return <LongChain key={longKind} kind={longKind} chainSelect={chainSelect} />
```

(`key={longKind}` remounts `LongChain` on Hundred ↔ Thousand switches, resetting tray/scroll/check state.)

**Check:** dev server — select shows 11 options; "Chain of 5" behaves exactly as before; "Thousand chain" shows the scrolling stage; switching back to "Chain of 5" restores the short chain.

### Step 6 — `src/materials/bead-chains/def.ts`: register the lesson, refresh copy

Replace three fields (exact strings):

- `summary: 'Skip count the short bead chains of 2 through 10, then journey down the long hundred and thousand chains, labeling every ten.'`
- `lessonSlugs: ['bead-chains-skip-counting', 'long-chains']`
- Append to the existing `parentNote` (same string, two new sentences at the end): ` The long chains extend this journey: the hundred chain is ten golden ten-bars, and the thousand chain is one hundred of them — a counting expedition to 1,000 with a milestone at every hundred. Printable arrow labels on the material page let you label a real or homemade chain at home.`

**Check:** `/materials/bead-chains` page shows both lessons under "Lessons for this material" **after** Step 7 lands (until then `content.test.ts` fails on the unresolved slug — do Steps 6 and 7 together).

### Step 7 — `src/materials/bead-chains/lessons.ts`: the `long-chains` lesson + fix the old closer

**7a.** In the existing `bead-chains-skip-counting` lesson, replace `whatComesNext` (it currently claims to be the strand's last lesson) with:

`'One grand adventure remains in this strand: the long chains. The hundred chain and the great thousand chain stretch skip counting by tens all the way to 1,000 — see the next lesson, The Long Chains. After that, the path leads into the Memorization strand, where the Snake Game turns counting into addition facts.'`

**7b.** Append a second `Lesson` object. Fixed fields: `slug: 'long-chains'`, `name: 'The Long Chains: 100 and 1,000'`, `strand: 'linear-counting'`, `sequence: 8`, `ages: [5, 8]`, `grades: 'K–2'`, `virtualMaterials: ['bead-chains']`, `prerequisites: ['bead-chains-skip-counting']`. Content requirements (parent-facing tone; every array non-empty; `content.test.ts` enforces ≥ 4 presentation steps — write 8–9):

- `overview`: 2 sentences — the longest count in the primary classroom; the hundred chain first, then the thousand chain as an expedition with a milestone at every hundred.
- `materialsNeeded` (4 entries): real golden hundred/thousand chains with arrow labels **or** the virtual material set to Hundred/Thousand chain; the printable arrow labels from the material page ("Show arrow labels" → print) for real or homemade chains; a household substitute (e.g. 10 strings of 10 beads, or 100 paper clips chained in tens, joined end to end); a long runway — hallway, long rug, or a painter's-tape line.
- `directAims` (3): count by tens to 100 and then 1,000, labeling every ten-bar; meet the hundred square at every milestone and the thousand cube at the finale as counted proof that 100 = 10 tens and 1,000 = 100 tens = 10 hundreds; sustain one long count with honest self-checking.
- `indirectAims` (3): preparation for the decimal system and powers of 10; concentration and stamina across one long work; a bodily sense of the true size of 1,000.
- `presentation` (8–9 steps with `text` + `say` where spoken language helps). Required beats: (1) lay out / select the hundred chain — *say: 'This is the hundred chain. It is made of ten-bars — let us count them.'*; (2) count the first bar bead by bead to ten and place the 10 arrow — *say: 'Ten.'*; (3) count on by tens, child takes over placing arrows — *say: 'Ten, twenty, thirty…'*; (4) at 100, the larger ticket and the hundred square — *say: 'Ten tens make one hundred. The chain is the hundred square, unrolled.'*; (5) another day, the thousand chain — scroll (or walk) its whole length first — *say: 'This chain has one hundred ten-bars. Today we count all the way to one thousand.'*; (6) count and label by tens; at every hundred pause for the milestone ticket and its hundred square — *say: 'One hundred!'*; (7) breaks are part of the work — on screen the "You are near" sign shows where you left off, on a real chain the last arrow does; (8) the finale — *say: 'One thousand. One hundred tens — ten hundreds — make one thousand.'*; (9) read back only the milestones, then Check if the child wants certainty.
- `pointsOfInterest` (4): the sheer length (a real thousand chain runs about 7 meters); a hundred square appearing at every milestone and the cube waiting at the end; the "You are near" sign after a scroll back; the same golden beads as the decimal-system material, laid out in one line.
- `controlOfError` (3): the tickets form one fixed ordered set; recounting any bar confirms its label; on screen the Check button marks each placed ticket right or wrong without revealing the answer.
- `vocabulary`: `['hundred chain', 'thousand chain', 'ten-bar', 'hundred square', 'thousand cube', 'arrow label', 'milestone']`.
- `variations` (3): read only milestones aloud and whisper the tens; count backward from 100 down the hundred chain; walk a real chain heel-to-toe counting bars.
- `extensions` (3): fold a real thousand chain into hundreds and stack the ten hundred squares next to the cube; find every milestone ×10 pattern on the hundred board; estimate first — guess where 500 will fall down the hallway, then count to check.
- `whatComesNext`: closes the Linear & Skip Counting strand and hands off to the Memorization strand (Snake Game → addition facts) and the Decimal System strand (golden beads), naming both.
- `followUpWork` (3, pencil-and-paper only): `{ description: 'Print a skip-counting worksheet of tens and let your child fill in the missing multiples in pencil.', worksheetSlug: 'skip-counting' }`; print the arrow labels from the material page, cut them out, and label a homemade chain or a tens number line down the hallway; write the milestones 100–1,000 from memory on paper, then check them against the chain.

**Check:** `npm test` — `content.test.ts` passes: `long-chains` fills every field, sequence 8 completes 1..8 for linear-counting, `skip-counting` slug resolves, `def.lessonSlugs` links resolve. Lesson renders at `/lessons/long-chains`.

### Step 8 — Update `plan/`

Set this PRD's Status to Done (with commit hash) and tick the acceptance boxes when landing. **Check:** `git status` shows only files inside `src/materials/bead-chains/` and `plan/15-long-chains.md` modified.

## New & modified files

| Path | New/Modified | Purpose |
|---|---|---|
| `src/materials/bead-chains/model.ts` | modified | `LongChainKind`, `longChain`, `LongChainState`, `createLongChain`, `longCorrectValue`, `placeLongTicket`, `removeLongTicket`, `evaluateLong`, `isLongComplete`, `visibleBarRange` |
| `src/materials/bead-chains/model.test.ts` | modified | 10 new named cases (below) |
| `src/materials/bead-chains/LongChain.tsx` | new | Windowed scrolling stage, position chip, ticket tray, milestones/finale glyphs, printable arrow labels |
| `src/materials/bead-chains/BeadChains.tsx` | modified | Select gains Hundred/Thousand chain; branches to `LongChain` |
| `src/materials/bead-chains/bead-chains.css` | modified | `bead-chains-long-*`, milestone/hundred ticket styles, print-ticket grid, print isolation rules |
| `src/materials/bead-chains/def.ts` | modified | `lessonSlugs` + summary/parentNote refresh |
| `src/materials/bead-chains/lessons.ts` | modified | New `long-chains` lesson; corrected `whatComesNext` in the sequence-7 lesson |
| `plan/15-long-chains.md` | new | This PRD |

No shared files change: `src/lessons/registry.ts` already spreads this folder's `lessons` array, and `src/materials/registry.ts` already registers `def`.

## Testing

Extend `/home/eric/Dev/montessori-math/src/materials/bead-chains/model.test.ts` (same vitest conventions as the existing file — pure logic, node env, no React). Add these `describe` blocks and named cases:

```ts
describe('long chain structure', () => {
  it('longChain(100) is 10 ten-bars labeled 10…100 with one milestone at 100', () => {
    const spec = longChain(100)
    expect(spec.bars).toBe(10)
    expect(spec.labelValues).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    expect(spec.milestones).toEqual([100])
  })

  it('longChain(1000) is 100 ten-bars, 100 labels ending at 1000, milestones 100…1000', () => {
    const spec = longChain(1000)
    expect(spec.bars).toBe(100)
    expect(spec.labelValues).toHaveLength(100)
    expect(spec.labelValues[0]).toBe(10)
    expect(spec.labelValues[99]).toBe(1000)
    expect(spec.milestones).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000])
  })

  it('rejects long-chain kinds other than 100 and 1000', () => {
    expect(() => longChain(50 as LongChainKind)).toThrow()
    expect(() => longCorrectValue(10 as LongChainKind, 0)).toThrow()
  })

  it('long slot k takes (k+1)·10 and out-of-range slots throw', () => {
    expect(longCorrectValue(100, 0)).toBe(10)
    expect(longCorrectValue(100, 9)).toBe(100)
    expect(longCorrectValue(1000, 42)).toBe(430)
    expect(longCorrectValue(1000, 99)).toBe(1000)
    expect(() => longCorrectValue(100, 10)).toThrow()
    expect(() => longCorrectValue(1000, -1)).toThrow()
  })
})

describe('long chain tickets', () => {
  it('createLongChain starts with an ascending tray and all slots empty', () => {
    const s = createLongChain(1000)
    expect(s.tray).toHaveLength(100)
    expect(s.tray).toEqual(longChain(1000).labelValues)
    expect(s.placements).toHaveLength(100)
    expect(s.placements.every((p) => p === null)).toBe(true)
  })

  it('placing and displacing long tickets keeps the tray ascending', () => {
    const s0 = createLongChain(100)
    const s1 = placeLongTicket(s0, 1, 0) // 20 onto slot 0 (wrong)
    expect(s1.placements[0]).toBe(20)
    expect(s1.tray).toEqual([10, 30, 40, 50, 60, 70, 80, 90, 100])
    const s2 = placeLongTicket(s1, 0, 0) // 10 displaces 20; 20 re-sorts to the front
    expect(s2.placements[0]).toBe(10)
    expect(s2.tray[0]).toBe(20)
    const s3 = removeLongTicket(s2, 0)
    expect(s3.tray).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
  })

  it('evaluateLong flags a misplaced ticket and nothing else', () => {
    const s0 = createLongChain(100)
    const s1 = placeLongTicket(s0, 0, 0) // 10 at slot 0 — correct
    const s2 = placeLongTicket(s1, 1, 1) // tray is now [20,30,…]; index 1 = 30 at slot 1 — wrong
    expect(evaluateLong(s2)).toEqual([
      'correct', 'wrong', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty',
    ])
    expect(isLongComplete(s2)).toBe(false)
  })

  it('a fully labeled hundred chain is complete', () => {
    let s = createLongChain(100)
    for (let k = 0; k < 10; k++) s = placeLongTicket(s, 0, k) // tray is ascending: front ticket is always next
    expect(evaluateLong(s).every((r) => r === 'correct')).toBe(true)
    expect(isLongComplete(s)).toBe(true)
  })
})

describe('windowing (visibleBarRange)', () => {
  it('windows the start, the middle, and a small viewport', () => {
    // start: first = ⌊0/130⌋ = 0, last = ⌊900/130⌋ = 6 → [0−5→0, 6+5=11]
    expect(visibleBarRange(0, 900, 130, 100, 5)).toEqual([0, 11])
    // middle: first = ⌊6500/130⌋ = 50, last = ⌊7400/130⌋ = 56 → [45, 61]
    expect(visibleBarRange(6500, 900, 130, 100, 5)).toEqual([45, 61])
    // 375px mobile viewport: first = 0, last = ⌊375/130⌋ = 2 → [0, 7]
    expect(visibleBarRange(0, 375, 130, 100, 5)).toEqual([0, 7])
  })

  it('clamps at both ends', () => {
    // far end: first = ⌊12800/130⌋ = 98, last = ⌊13700/130⌋ = 105 → [93, min(99,110)=99]
    expect(visibleBarRange(12800, 900, 130, 100, 5)).toEqual([93, 99])
    // elastic overscroll: first = ⌊−50/130⌋ = −1 → start clamps to 0
    expect(visibleBarRange(-50, 900, 130, 100, 5)).toEqual([0, 11])
    // short chain, wide window: everything → [0, 9]
    expect(visibleBarRange(0, 900, 130, 10, 5)).toEqual([0, 9])
  })

  it('defaults the buffer to 5 and rejects nonsense geometry', () => {
    expect(visibleBarRange(6500, 900, 130, 100)).toEqual([45, 61])
    expect(() => visibleBarRange(0, 900, 0, 100)).toThrow()
    expect(() => visibleBarRange(0, 900, 130, 0)).toThrow()
  })
})
```

Add `longChain`, `createLongChain`, `longCorrectValue`, `placeLongTicket`, `removeLongTicket`, `evaluateLong`, `isLongComplete`, `visibleBarRange` and `import type { LongChainKind }` to the file's imports. `src/lessons/content.test.ts` needs **no edits** — it automatically validates the new lesson, the strand sequence 1..8, and every cross-reference.

## Manual QA script

1. `npm run dev`; open `http://localhost:5173/materials/bead-chains` (or the LAN IP).
2. Confirm the short chains are untouched: pick "Chain of 5", place two tickets, Check, Reset.
3. Select **Hundred chain**. See a tray labeled "Tickets:" with tickets 10–100 ascending (100 shown larger with a red band), a scrollable golden chain of 10 ten-bars, and the "You are near 10" chip.
4. Tap ticket 10, then the spot at the end of bar 1. Tap ticket 30, then the spot at bar 2 (deliberately wrong). Press **Check**: bar 1 shows ✓, bar 2 shows ✗ (glyphs, not just color). Tap the wrong slot to take the ticket back; the tray re-sorts ascending.
5. Confirm the last slot at 100 is larger and shows a small hundred-square glyph beside it.
6. Select **Thousand chain**. Scroll right for a while: the chip climbs ("You are near 260…"), hundred-square glyphs appear at 100, 200, …; the chain visibly ends at bar 100 with the thousand-cube glyph. Scroll instantly to the far end (drag the scrollbar): rendering keeps up (only nearby bars exist in the DOM — verify via devtools element count if curious).
7. Press **Reset**: tray refills, scroll returns to the start, chip reads "You are near 10".
8. Tap **Show arrow labels**. A control row (B&W checkbox + "Print arrow labels" button) and 4 letter-size pages appear: pages 1–3 with 30 tickets, page 4 with 10; tickets 1.4in × 0.9in with dashed borders; tens blue, hundreds red and larger, 1,000 green and largest, all bold.
9. Print preview (Ctrl+P) in color: **only** the 4 ticket pages print — no site header, no page title, no felt stage, no parent note. Cancel.
10. Tick **Ink-friendly B&W**, print preview again: everything black on white; hundreds still unmistakable by size and weight alone. Cancel; tap "Hide arrow labels".
11. Switch to **Hundred chain**, Show arrow labels: exactly one page, tickets 10–100.
12. Resize the window to 375px width (or use responsive mode): controls wrap, the tray scrolls horizontally, the chain scrolls by touch/drag, the chip stays pinned at the left edge while scrolling, slot targets remain ≥ 44px.
13. Visit `/lessons` → Linear & Skip Counting shows 8 lessons; open **The Long Chains: 100 and 1,000**: every album section renders, prerequisite links to Bead Chains & Skip Counting, follow-up links to the Skip Counting worksheet builder.
14. Open `/lessons/bead-chains-skip-counting`: "What comes next" now points to The Long Chains.

## Acceptance criteria

- [x] `npm test` green (all existing 730 tests plus the 10 new model cases and the auto-derived `content.test.ts` cases)
- [x] `npm run build` green (strict tsc + vite)
- [x] Chain select offers Chain of 2–10 plus Hundred chain and Thousand chain; short-chain behavior byte-for-byte unchanged
- [x] Thousand chain renders only the windowed bars (`visibleBarRange`, buffer 5) and scrolls smoothly through all 100 ten-bars at `BAR_WIDTH` 130px
- [x] "You are near ___" chip is sticky, updates on scroll, formatted with commas, `role="status"`
- [x] Ticket → slot tap interaction with ascending tray (12-ticket preview + "more in the box" count); Check flags wrong tickets only on press; Reset restores everything including scroll position
- [x] Milestone slots at every 100 are larger with a `HundredSquare` glyph; `ThousandCube` at the 1,000 finale
- [x] Arrow-label printable: 1 page for the hundred chain, 4 pages for the thousand chain; 1.4in × 0.9in dashed-border tickets; printing emits only the label pages; `.bw` mode carries hundreds/thousand emphasis without color
- [x] No localStorage, no timers, no scores, no praise animations, no network requests, no new dependencies
- [x] Colors only via tokens (`--golden`, `--pv-ten`, `--pv-hundred`, `--pv-thousand`, `--line`, `--ink`, …); no hex literals in TSX
- [x] `long-chains` lesson complete per album schema, sequence 8 in linear-counting; `bead-chains-skip-counting`'s `whatComesNext` corrected; `def.ts` lists both lessons
- [x] Only files inside `src/materials/bead-chains/` (plus this PRD) are touched

## Out of scope

- Long chains for 2–9 (the squares-and-cubes chain cabinet) — only the golden 100 and 1,000 chains ship here.
- Drag-and-drop ticket placement, animated scrolling tours, or auto-scroll-to-next-slot.
- Any persistence of chain progress across visits (hard rule 1 forbids it).
- Arrow-shaped (pointed) die-cut tickets — rectangles with dashed cut lines only.
- Changes to the `skip-counting` worksheet generator, its presets, or any shared registry/style file.
- A dedicated 1,000-chain worksheet generator (a future PRD may add milestone fill-in sheets).
