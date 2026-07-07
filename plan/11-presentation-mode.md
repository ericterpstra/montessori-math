# PRD 11 — Presentation Mode: walk a lesson through the material

**Status:** Done
**Effort:** M — one new overlay component, a small context bridge, pure demo interpreters in two existing material models, and two data scripts; no new routes, no new dependencies, bounded to 2 of 19 materials.
**Depends on:** nothing (wave 1 is complete: materials, lessons, and registries all exist)

## Why

A parent reading "Golden Bead Addition" today has to alt-tab between the album lesson and the material, translating prose into taps. Presentation Mode puts the album's presentation steps *on* the material page: the parent presses Next, the exact quantities from the lesson appear on the mat, the exchanges run, and the Check marks light up — the lesson rehearses itself before the parent gives it at the kitchen table. It is a parent-preparation tool (the child's work is still the material itself and paper follow-up), and it makes the 38 album lessons and 19 materials feel like one product instead of two libraries.

## Binding product rules

- **No lesson tracking, no localStorage, no gamification.** The current step lives in a `useState` in `MaterialPage` and nowhere else. Nothing is persisted; closing the overlay forgets everything. Manual Prev/Next only — **no autoplay, no timers**, no progress badges, no "completed" state.
- **Print is first-class; `.bw` carries all information.** This feature adds no printables. The overlay and the launch buttons are screen-only chrome and get `.no-print` so a printed material page is unchanged. Inside the overlay, the spoken line is distinguished by italics *and* quotation marks (mirroring `.album .say` in `src/styles/album.css`), never by color alone.
- **Fully static, no new npm dependencies.** Uses only `react` (`createContext`, `useContext`, `useState`, `useEffect`, `useRef`, `useMemo`) and `react-router-dom` (`useSearchParams`, already used in `src/worksheets/BuilderPage.tsx` and `src/pages/AgesPage.tsx`).
- **TypeScript strict, `verbatimModuleSyntax`.** All type-only imports use `import type`. New pure logic (`demo.ts`, model interpreters) has no React imports so Vitest's node environment can test it.
- **Tap-first, ≥ 44px targets.** All overlay buttons use the existing `.btn` class from `src/styles/global.css`, which already sets `min-height: var(--touch-target)` (44px, `src/styles/tokens.css`).
- **Montessori authenticity.** Scripts replay the *exact* numbers, exchange order (units first), and language already reviewed in the album lessons — no new math content is invented. Colors come from the existing components; no hex literals anywhere new.

## Design decisions (locked — do not revisit)

- **(A) Types** — new `src/lessons/demo.ts`:
  `export interface DemoAction { do: 'reset' | 'setMode' | 'build' | 'add' | 'exchangeUp' | 'exchangeDown' | 'check' | 'none'; payload?: string | number }` and `export type DemoScript = DemoAction[][]`. The outer array is **index-aligned with `lesson.presentation`** — a presentation step with no material action gets `[]`.
- **(B) Context bridge** — material components are lazy-loaded with **no props** (verified: `MaterialDef.component` is `LazyExoticComponent<ComponentType>` in `src/materials/types.ts`; `MaterialPage.tsx` renders bare `<Component />`). So the bridge is a context: new `src/lessons/DemoContext.tsx` exporting `DemoContext = createContext<{ lessonSlug: string; stepIndex: number; script: DemoScript } | null>(null)` and `export function useDemo()` returning the context value or `null`. Materials **opt in** by calling `useDemo()`; the other 17 materials are untouched.
  **Determinism rule (exact):** the component keeps `lastApplied: number = -1`; when `stepIndex > lastApplied` it applies actions for steps `lastApplied+1 .. stepIndex` in order; when `stepIndex < lastApplied` it resets the material to initial state and replays steps `0 .. stepIndex`; then `lastApplied = stepIndex`. This makes Prev deterministic. The planning half is the pure function `planReplay(lastApplied, target)` (step 1) so it is unit-testable.
- **(C) `MaterialDef` gains an optional field** `demos?: Record<string, DemoScript>` (lessonSlug → script). Optional ⇒ all 19 existing `def.ts` files compile untouched (verified: `MaterialDef` is a plain interface; only `golden-beads/def.ts` and `stamp-game/def.ts` are edited).
- **(D) UI** — new `src/lessons/PresentationOverlay.tsx`: fixed bottom panel (`.presentation-overlay`, styled in **new** `src/styles/presentation.css` imported from `src/main.tsx`) showing "Step k of n", the step text, the `say` line styled like `.album .say`, Prev/Next (≥ 44px), and Close. `MaterialPage.tsx`: when the URL has `?present=<lessonSlug>` **and** `material.demos?.[lessonSlug]` exists, wrap `<Component />` in `DemoContext.Provider` and render the overlay; `stepIndex` lives in `useState`. MaterialPage also lists a "Walk through: *lesson name*" button per available demo. `LessonPage.tsx`: when any of the lesson's `virtualMaterials` defs has a demo for this lesson, render the link "See this presented on the virtual material".
- **(E) Scope of scripts** — exactly two demos ship in this PRD: `golden-beads` → `golden-beads-addition` and `stamp-game` → `stamp-game-addition` (both presentations are static-first: a no-trade problem, then the dynamic 1,568 + 1,679 with three `exchangeUp` trades). Steps that cannot be automated faithfully get `[]` and the overlay text carries them (called out per step below). Demos run the material in **free** mode and drive state through the existing pure model functions (`countsFromNumber`, `sumCounts`/`combineRegions`, `exchangeUpGolden`/`exchangeUpIn`, `checkAgainstNumber`/`checkAgainst`) — never through the seeded problem generators, so replay is deterministic with no RNG.

## Implementation steps

### 1. `src/lessons/demo.ts` (new) — pure types + replay planner

```ts
/** One material action performed while a presentation step is shown. */
export interface DemoAction {
  do: 'reset' | 'setMode' | 'build' | 'add' | 'exchangeUp' | 'exchangeDown' | 'check' | 'none'
  payload?: string | number
}

/** Outer index aligns 1:1 with lesson.presentation; steps with no action are []. */
export type DemoScript = DemoAction[][]

/**
 * Which steps to (re)apply to move a material from `lastApplied` to `target`.
 * Backward moves reset to initial state and replay 0..target — Prev is deterministic.
 */
export function planReplay(lastApplied: number, target: number): { reset: boolean; apply: number[] } {
  if (target > lastApplied) {
    return { reset: false, apply: Array.from({ length: target - lastApplied }, (_, i) => lastApplied + 1 + i) }
  }
  if (target < lastApplied) {
    return { reset: true, apply: Array.from({ length: target + 1 }, (_, i) => i) }
  }
  return { reset: false, apply: [] }
}
```

No React imports in this file. **Check:** `npx tsc --noEmit` passes; step 13's `demo.test.ts` vectors pass.

### 2. `src/lessons/DemoContext.tsx` (new) — the bridge

```tsx
import { createContext, useContext } from 'react'
import type { DemoScript } from './demo'

export interface DemoState {
  lessonSlug: string
  stepIndex: number
  script: DemoScript
}

export const DemoContext = createContext<DemoState | null>(null)

/** Materials opt in by calling this; null means no walk-through is active. */
export function useDemo(): DemoState | null {
  return useContext(DemoContext)
}
```

**Check:** compiles; importing `useDemo` from a material file resolves.

### 3. `src/materials/types.ts` (modified) — optional `demos` field

Add to the imports: `import type { DemoScript } from '../lessons/demo'`. Add as the last field of `MaterialDef`:

```ts
  /** Presentation-mode scripts, keyed by lesson slug (see src/lessons/demo.ts). */
  demos?: Record<string, DemoScript>
```

**Check:** `npm run build` still green with zero other files changed — proves backward compatibility.

### 4. `src/materials/golden-beads/model.ts` (modified) — pure demo interpreter

Add `import type { DemoAction } from '../../lessons/demo'` at the top (model stays React-free). Append:

```ts
/* ---------- presentation-mode demo actions ---------- */

const DEMO_MODES: readonly Mode[] = ['free', 'build', 'addition', 'subtraction', 'multiplication', 'division']

/** Everything presentation mode drives on screen, as one immutable view. */
export interface DemoView {
  mode: Mode
  mat: PlaceCounts
  check: CheckResult | null
  status: string | null
}

export const DEMO_INITIAL: DemoView = { mode: 'free', mat: {}, check: null, status: null }

/**
 * Apply one presentation step's actions. Pure and total: an action that cannot
 * apply (illegal exchange, bad payload) is ignored, so any script prefix replays safely.
 */
export function applyDemoActions(view: DemoView, actions: readonly DemoAction[]): DemoView {
  let v = view
  for (const a of actions) {
    switch (a.do) {
      case 'reset':
        v = DEMO_INITIAL
        break
      case 'setMode':
        if (DEMO_MODES.includes(a.payload as Mode)) v = { ...v, mode: a.payload as Mode }
        break
      case 'build':
        if (typeof a.payload === 'number' && validateBuildTarget(a.payload) === null) {
          v = { ...v, mat: countsFromNumber(a.payload), check: null, status: null }
        }
        break
      case 'add':
        if (typeof a.payload === 'number' && a.payload >= 1 && totalValue(v.mat) + a.payload <= MAX_TOTAL) {
          v = { ...v, mat: sumCounts(v.mat, countsFromNumber(a.payload)), check: null, status: null }
        }
        break
      case 'exchangeUp':
        if (typeof a.payload === 'number' && canExchangeUpGolden(v.mat, a.payload as GoldenPower)) {
          v = { ...v, mat: exchangeUpGolden(v.mat, a.payload as GoldenPower), check: null, status: null }
        }
        break
      case 'exchangeDown':
        if (typeof a.payload === 'number' && canExchangeDownGolden(v.mat, a.payload as GoldenPower)) {
          v = { ...v, mat: exchangeDownGolden(v.mat, a.payload as GoldenPower), check: null, status: null }
        }
        break
      case 'check':
        if (typeof a.payload === 'number') {
          const result = checkAgainstNumber(v.mat, a.payload)
          v = {
            ...v,
            check: result,
            status: result.allOk
              ? `It matches — the mat shows ${formatNumber(a.payload)}.`
              : 'Not yet — compare the marked columns.',
          }
        }
        break
      case 'none':
        break
    }
  }
  return v
}
```

Everything referenced (`countsFromNumber`, `totalValue`, `formatNumber`, `sumCounts`, `MAX_TOTAL`, `validateBuildTarget`, `canExchangeUpGolden`, `exchangeUpGolden`, `canExchangeDownGolden`, `exchangeDownGolden`, `checkAgainstNumber`, `CheckResult`, `Mode`, `GoldenPower`) already exists in this file. **Check:** step 13's model tests pass with `npx vitest run src/materials/golden-beads/model.test.ts`.

### 5. `src/materials/golden-beads/demos.ts` (new) — the script as data

The `golden-beads-addition` lesson (`src/materials/golden-beads/lessons.ts`) has **9 presentation steps** (indexes 0–8; static 1,234 + 2,345 first, then dynamic 1,568 + 1,679). Script length must be 9.

```ts
import type { DemoScript } from '../../lessons/demo'

/** Presentation-mode scripts for the golden beads, index-aligned with each lesson's presentation. */
export const demos: Record<string, DemoScript> = {
  'golden-beads-addition': [
    /* 0: build the first number, 1,234            */ [{ do: 'reset' }, { do: 'build', payload: 1234 }],
    /* 1: build the second "below or beside"       */ [],
    /* 2: push together, count columns             */ [{ do: 'add', payload: 2345 }],
    /* 3: read the answer 3,579                    */ [{ do: 'check', payload: 3579 }],
    /* 4: another day — 1,568 + 1,679, 17 units!   */ [{ do: 'reset' }, { do: 'build', payload: 1568 }, { do: 'add', payload: 1679 }],
    /* 5: trade ten units for a ten-bar            */ [{ do: 'exchangeUp', payload: 0 }],
    /* 6: repeat in the tens, then the hundreds    */ [{ do: 'exchangeUp', payload: 1 }, { do: 'exchangeUp', payload: 2 }],
    /* 7: read the answer 3,247                    */ [{ do: 'check', payload: 3247 }],
    /* 8: "in the virtual material, choose…"       */ [],
  ],
}
```

Per-step fidelity notes (state these as code comments or keep this table handy):

| Step | Lesson text (abridged) | Actions | Mat after step (`PlaceCounts`) |
|---|---|---|---|
| 0 | build 1,234 | reset; build 1234 | `{3:1, 2:2, 1:3, 0:4}` |
| 1 | build 2,345 "below or beside" | `[]` — **not automatable faithfully**: the virtual mat has one column per place and cannot show a second, separate layout; the overlay text carries this step, and the quantities merge at step 2 where the lesson pushes them together | unchanged |
| 2 | push together; "Nine units. Seven tens. Five hundreds. Three thousands." | add 2345 | `{3:3, 2:5, 1:7, 0:9}` |
| 3 | read 3,579 | check 3579 | unchanged; `check.allOk === true` |
| 4 | 1,568 + 1,679; "Seventeen units!" | reset; build 1568; add 1679 | `{3:2, 2:11, 1:13, 0:17}` |
| 5 | ten units → one ten-bar; "seven units left" | exchangeUp 0 | `{3:2, 2:11, 1:14, 0:7}` |
| 6 | "now fourteen tens", then the hundreds | exchangeUp 1; exchangeUp 2 | `{3:3, 2:2, 1:4, 0:7}` |
| 7 | read 3,247 | check 3247 | unchanged; `check.allOk === true` |
| 8 | "In the virtual material, choose Addition" | `[]` — deliberately **not** `setMode 'addition'`: switching would seed a random problem and clear the demo's mat | unchanged |

**Check:** counts by hand — 1,568 + 1,679 places are units 8+9=17, tens 6+7=13, hundreds 5+6=11, thousands 1+1=2; three trades yield 3,247.

### 6. `src/materials/golden-beads/def.ts` (modified)

Add `import { demos } from './demos'` and the field `demos,` after `worksheetSlugs`. **Check:** build green; `materialBySlug('golden-beads')!.demos!['golden-beads-addition'].length === 9` in a scratch test or node REPL.

### 7. `src/materials/golden-beads/GoldenBeads.tsx` (modified) — opt in

Add imports: `useEffect, useRef` (extend the existing `useState` import from `'react'`), `import { useDemo } from '../../lessons/DemoContext'`, `import { planReplay } from '../../lessons/demo'`, add `DEMO_INITIAL, applyDemoActions` to the existing `./model` value import and `DemoView` to the existing `import type ... from './model'`. Inside `GoldenBeads()`, after the state declarations (below line ~112):

```tsx
  const demo = useDemo()
  const demoRef = useRef<{ lessonSlug: string; lastApplied: number; view: DemoView }>({
    lessonSlug: '',
    lastApplied: -1,
    view: DEMO_INITIAL,
  })

  useEffect(() => {
    const r = demoRef.current
    if (!demo) {
      r.lessonSlug = ''
      r.lastApplied = -1
      r.view = DEMO_INITIAL
      return
    }
    if (demo.lessonSlug !== r.lessonSlug) {
      r.lessonSlug = demo.lessonSlug
      r.lastApplied = -1
      r.view = DEMO_INITIAL
    }
    const plan = planReplay(r.lastApplied, demo.stepIndex)
    let view = plan.reset ? DEMO_INITIAL : r.view
    for (const i of plan.apply) view = applyDemoActions(view, demo.script[i] ?? [])
    r.view = view
    r.lastApplied = demo.stepIndex
    setMode(view.mode)
    setMat(view.mat)
    setCheck(view.check)
    setStatus(view.status)
    setPerRow({})
    setStep(0)
    setDivCheck(null)
    setManual(null)
    setManualTarget(null)
  }, [demo])
```

Notes for the implementer: the scripted view lives in a **ref**, not in `mat` state — if the parent taps pieces between steps, the next Prev/Next snaps the material back to the scripted state (deterministic, and honest: the walk-through is a demonstration, not the child's work). The demo runs in `'free'` mode, where the mat, per-place counts, exchange buttons, ✓/✗ marks (`check?.places`) and the `status` row all already render; the Check *button* is hidden in free mode, which is fine because `check` actions set the result state directly. All existing controls (Reset, mode select, Hide total) keep working during a demo. **Check:** `npm run dev`, open `/materials/golden-beads?present=golden-beads-addition` (overlay comes in step 11) — the mat shows 1,234 immediately.

### 8. `src/materials/stamp-game/model.ts` + `demos.ts` + `def.ts` + `StampGame.tsx` — same pattern

**8a. `model.ts` (modified).** Add `countsFromNumber` to the existing `../../lib/placeValue` import and `import type { DemoAction } from '../../lessons/demo'`. Append (mirroring step 4; stamp `Mode` has no `'build'`):

```ts
/* ---------- presentation-mode demo actions ---------- */

const DEMO_MODES: readonly Mode[] = ['free', 'addition', 'subtraction', 'multiplication', 'division']

export interface DemoView {
  mode: Mode
  mat: PlaceCounts
  checks: PlaceCheck[] | null
  message: string | null
}

export const DEMO_INITIAL: DemoView = { mode: 'free', mat: {}, checks: null, message: null }

export function applyDemoActions(view: DemoView, actions: readonly DemoAction[]): DemoView {
  let v = view
  for (const a of actions) {
    switch (a.do) {
      case 'reset':
        v = DEMO_INITIAL
        break
      case 'setMode':
        if (DEMO_MODES.includes(a.payload as Mode)) v = { ...v, mode: a.payload as Mode }
        break
      case 'build':
        if (typeof a.payload === 'number' && a.payload >= 1 && a.payload <= MAX_VALUE) {
          v = { ...v, mat: countsFromNumber(a.payload), checks: null, message: null }
        }
        break
      case 'add':
        if (typeof a.payload === 'number' && a.payload >= 1 && regionValue(v.mat) + a.payload <= MAX_VALUE) {
          v = { ...v, mat: combineRegions([v.mat, countsFromNumber(a.payload)]), checks: null, message: null }
        }
        break
      case 'exchangeUp': {
        if (typeof a.payload !== 'number') break
        const res = exchangeUpIn(v.mat, a.payload as StampPlace)
        if (res.ok) v = { ...v, mat: res.value, checks: null, message: null }
        break
      }
      case 'exchangeDown': {
        if (typeof a.payload !== 'number') break
        const res = exchangeDownIn(v.mat, a.payload as StampPlace)
        if (res.ok) v = { ...v, mat: res.value, checks: null, message: null }
        break
      }
      case 'check':
        if (typeof a.payload === 'number') {
          const cs = checkAgainst(v.mat, a.payload)
          v = {
            ...v,
            checks: cs,
            message: allOk(cs)
              ? `Every column matches — the stamps read ${formatNumber(a.payload)}.`
              : 'Some columns do not match yet — recount the ones marked ✗.',
          }
        }
        break
      case 'none':
        break
    }
  }
  return v
}
```

**8b. `src/materials/stamp-game/demos.ts` (new).** The `stamp-game-addition` lesson has **8 presentation steps** (indexes 0–7; static 1,325 + 2,143, then dynamic 1,568 + 1,679):

```ts
import type { DemoScript } from '../../lessons/demo'

export const demos: Record<string, DemoScript> = {
  'stamp-game-addition': [
    /* 0: write 1,325 + 2,143 on a slip            */ [{ do: 'reset' }],
    /* 1: build 1,325 near the top                 */ [{ do: 'build', payload: 1325 }],
    /* 2: build 2,143 below, "two separate numbers" */ [],
    /* 3: slide each column together               */ [{ do: 'add', payload: 2143 }],
    /* 4: count columns; read the sum 3,468        */ [{ do: 'check', payload: 3468 }],
    /* 5: dynamic 1,568 + 1,679 — "seventeen!"     */ [{ do: 'reset' }, { do: 'build', payload: 1568 }, { do: 'add', payload: 1679 }],
    /* 6: trade up through the columns; read 3,247 */ [{ do: 'exchangeUp', payload: 0 }, { do: 'exchangeUp', payload: 1 }, { do: 'exchangeUp', payload: 2 }, { do: 'check', payload: 3247 }],
    /* 7: same problem on paper — the carried 1s   */ [],
  ],
}
```

Fidelity notes: step 2 is `[]` because the free-mode stamp mat is a single set of columns and cannot show a second, physically separate layout — the overlay text carries it, and the merge happens at step 3 ("slide each column together"). Step 7 is `[]` (a paper moment); the ✓ marks from step 6 stay on screen because `[]` changes nothing. Expected mat after step 4: `{3:3, 2:4, 1:6, 0:8}` (3,468, no column ≥ 10); after step 5: `{3:2, 2:11, 1:13, 0:17}`; after step 6: `{3:3, 2:2, 1:4, 0:7}` with all checks ✓.

**8c. `def.ts` (modified).** `import { demos } from './demos'`; add `demos,` after `worksheetSlugs`.

**8d. `StampGame.tsx` (modified).** Copy the effect from step 7 verbatim (same imports pattern: `useEffect, useRef` from `'react'`, `useDemo`, `planReplay`, and `DEMO_INITIAL, applyDemoActions` + `import type { DemoView }` from `./model`), replacing **only** the state-sync lines after `r.lastApplied = demo.stepIndex` with StampGame's setters:

```tsx
    setMode(view.mode)
    setMat(view.mat)
    setChecks(view.checks)
    setMessage(view.message)
    setProblem(null)
    setRows([])
    setRemoved({})
    setActiveRow(0)
    setCombined(false)
    setTaking(false)
    setRemovedChecks(null)
    setDivCheck(null)
```

In free mode `isOp` is false, so `showRows` is false and the single work mat with its exchange footers and per-column ✓/✗ (`checks`) renders — exactly what the script drives. **Check:** step-13 stamp model tests pass; dev server shows 1,325 on the mat at step 2 of the walk-through.

### 9. `src/lessons/PresentationOverlay.tsx` (new)

```tsx
import type { Lesson } from './types'

export interface PresentationOverlayProps {
  lesson: Lesson
  stepIndex: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}

/** Fixed bottom panel that narrates one presentation step at a time. */
export function PresentationOverlay({ lesson, stepIndex, onPrev, onNext, onClose }: PresentationOverlayProps) {
  const steps = lesson.presentation
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  return (
    <div className="presentation-overlay no-print" role="region" aria-label={`Walk-through: ${lesson.name}`}>
      <div className="presentation-head">
        <span className="presentation-title">{lesson.name}</span>
        <span className="presentation-progress">
          Step {stepIndex + 1} of {steps.length}
        </span>
        <button type="button" className="btn presentation-close" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="presentation-body" aria-live="polite">
        <p className="presentation-text">{step.text}</p>
        {step.say && <p className="say">{step.say}</p>}
      </div>
      <div className="presentation-nav">
        <button type="button" className="btn" onClick={onPrev} disabled={stepIndex === 0}>
          ← Previous
        </button>
        <button type="button" className="btn primary" onClick={onNext} disabled={stepIndex === steps.length - 1}>
          Next →
        </button>
      </div>
    </div>
  )
}
```

**Check:** compiles; no color-only information (say line is italic + quoted via CSS below).

### 10. `src/styles/presentation.css` (new) + import in `src/main.tsx`

Add `import './styles/presentation.css'` in `src/main.tsx` after the `'./styles/album.css'` line. File contents (tokens only, no hex):

```css
/* ---------- Presentation mode: lesson walk-through overlay ---------- */

.presentation-launch {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.presentation-overlay {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: min(46rem, 100vw - 1rem);
  max-height: 45vh;
  overflow-y: auto;
  background: var(--card);
  border: 1px solid var(--line);
  border-bottom: none;
  border-radius: var(--radius) var(--radius) 0 0;
  box-shadow: var(--shadow-md);
  padding: 0.9rem 1.2rem;
  z-index: 50;
}

.presentation-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.presentation-title {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--wood-dark);
}

.presentation-progress {
  color: var(--ink-soft);
  font-size: 0.9rem;
  white-space: nowrap;
}

.presentation-close {
  margin-left: auto;
}

.presentation-text {
  margin: 0.6rem 0 0;
}

/* Mirrors .album .say (src/styles/album.css): italics + quotes, never color alone. */
.presentation-overlay .say {
  display: block;
  font-style: italic;
  color: var(--accent-dark);
  margin: 0.25rem 0 0;
}

.presentation-overlay .say::before {
  content: '“';
}

.presentation-overlay .say::after {
  content: '”';
}

.presentation-nav {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.75rem;
}

/* Room at the page bottom so the fixed overlay never hides content for good. */
.presentation-spacer {
  height: 14rem;
}

@media (max-width: 640px) {
  .presentation-overlay {
    width: 100vw;
    max-height: 50vh;
    padding: 0.7rem 0.8rem;
  }
}
```

`.btn` already guarantees `min-height: var(--touch-target)`; `.no-print` on the overlay root (step 9) is hidden by the existing `@media print` rule in `src/styles/print.css`. **Check:** overlay renders centered, ≤ 46rem, sticks to the viewport bottom; at 375px it spans the full width.

### 11. `src/materials/MaterialPage.tsx` (modified)

Change the react import to `import { Suspense, useMemo, useState } from 'react'` and the router import to `import { Link, useParams, useSearchParams } from 'react-router-dom'`. Add `import { DemoContext } from '../lessons/DemoContext'` and `import { PresentationOverlay } from '../lessons/PresentationOverlay'`. Inside the component, after the `generators` line:

```tsx
  const [searchParams, setSearchParams] = useSearchParams()
  const [stepIndex, setStepIndex] = useState(0)

  const presentSlug = searchParams.get('present')
  const script = presentSlug ? material?.demos?.[presentSlug] : undefined
  const demoLesson = presentSlug ? lessonBySlug(presentSlug) : undefined
  const demoActive = script !== undefined && demoLesson !== undefined

  const demoValue = useMemo(
    () => (demoActive && presentSlug && script ? { lessonSlug: presentSlug, stepIndex, script } : null),
    [demoActive, presentSlug, script, stepIndex],
  )

  const demoLessons = Object.keys(material?.demos ?? {})
    .map((s) => lessonBySlug(s))
    .filter((l) => l !== undefined)

  function openDemo(lessonSlug: string) {
    setStepIndex(0)
    setSearchParams({ present: lessonSlug })
  }

  function closeDemo() {
    setStepIndex(0)
    setSearchParams({})
  }
```

Note: React state setters used inside `useMemo`-free plain functions are fine here; hooks must stay above the early `if (!material) return <NotFound />` **or** the hooks must be called unconditionally — since the file currently early-returns at line 12, move that early return **below** all hook calls (hooks first, then `if (!material) return <NotFound />`; derive `presentSlug`/`script` with optional chaining on `material?.demos` so the hook block is safe when material is undefined). In the JSX, insert the launch row between the `page-intro` paragraph and `<Suspense>`, wrap the component, and append the overlay:

```tsx
      {demoLessons.length > 0 && (
        <div className="presentation-launch no-print">
          {demoLessons.map((l) => (
            <button key={l.slug} type="button" className="btn" onClick={() => openDemo(l.slug)} aria-pressed={presentSlug === l.slug}>
              Walk through: {l.name}
            </button>
          ))}
        </div>
      )}

      <DemoContext.Provider value={demoValue}>
        <Suspense fallback={<p>Loading material…</p>}>
          <Component />
        </Suspense>
      </DemoContext.Provider>
```

and, as the last children before the closing fragment:

```tsx
      {demoActive && demoLesson && (
        <>
          <div className="presentation-spacer no-print" aria-hidden="true" />
          <PresentationOverlay
            lesson={demoLesson}
            stepIndex={stepIndex}
            onPrev={() => setStepIndex((i) => Math.max(0, i - 1))}
            onNext={() => setStepIndex((i) => Math.min(demoLesson.presentation.length - 1, i + 1))}
            onClose={closeDemo}
          />
        </>
      )}
```

The Provider **always** wraps `<Component />` (value `null` when inactive) so the component's identity is stable when the overlay opens/closes — no remount, no lost state. A `?present=` slug with no matching demo or lesson simply renders the page normally. **Check:** `/materials/golden-beads` shows one "Walk through: Golden Bead Addition" button; clicking it adds `?present=golden-beads-addition` and the overlay; Close removes both; `/materials/bead-stair` is pixel-identical to before.

### 12. `src/lessons/LessonPage.tsx` (modified)

Add `import type { MaterialDef } from '../materials/types'`. In the Materials section, directly after the existing "No materials at home?" paragraph (still inside the section), add:

```tsx
        {lesson.virtualMaterials.some((s) => materialBySlug(s)?.demos?.[lesson.slug] !== undefined) && (
          <p className="no-print">
            {lesson.virtualMaterials
              .map((s) => materialBySlug(s))
              .filter((m): m is MaterialDef => m !== undefined && m.demos?.[lesson.slug] !== undefined)
              .map((m) => (
                <Link key={m.slug} className="btn" to={`/materials/${m.slug}?present=${lesson.slug}`}>
                  See this presented on the virtual material ({m.name})
                </Link>
              ))}
          </p>
        )}
```

For both wave-2 lessons exactly one material matches, so one link renders; the material name in parentheses disambiguates if a future lesson has demos on two materials. **Check:** `/lessons/golden-beads-addition` shows the link; `/lessons/golden-beads-intro` (no demo) does not; the link is absent from print preview (`.no-print`).

### 13. Tests (see Testing section for the named cases)

Create `src/lessons/demo.test.ts`; extend `src/lessons/content.test.ts`, `src/materials/golden-beads/model.test.ts`, `src/materials/stamp-game/model.test.ts`. **Check:** `npm test` green (730 existing + new).

### 14. `plan/README.md` + this PRD (modified)

Add the row `| 11 | [Presentation mode](11-presentation-mode.md) | In progress |` to the table; flip this PRD's Status when landing. **Check:** table renders.

## New & modified files

| Path | New/modified | Purpose |
|---|---|---|
| `src/lessons/demo.ts` | new | `DemoAction`/`DemoScript` types + pure `planReplay` |
| `src/lessons/DemoContext.tsx` | new | `DemoContext` + `useDemo()` bridge into lazy-loaded materials |
| `src/lessons/PresentationOverlay.tsx` | new | Fixed bottom step-by-step overlay panel |
| `src/styles/presentation.css` | new | `.presentation-overlay/.presentation-launch/.presentation-spacer` styles (tokens only) |
| `src/materials/golden-beads/demos.ts` | new | `golden-beads-addition` script (9 steps) |
| `src/materials/stamp-game/demos.ts` | new | `stamp-game-addition` script (8 steps) |
| `src/lessons/demo.test.ts` | new | `planReplay` unit tests |
| `src/materials/types.ts` | modified | Optional `demos?: Record<string, DemoScript>` on `MaterialDef` |
| `src/materials/golden-beads/model.ts` | modified | Pure `DemoView`/`DEMO_INITIAL`/`applyDemoActions` interpreter |
| `src/materials/golden-beads/def.ts` | modified | Wire `demos` |
| `src/materials/golden-beads/GoldenBeads.tsx` | modified | `useDemo()` opt-in effect (replay via ref + `planReplay`) |
| `src/materials/stamp-game/model.ts` | modified | Pure demo interpreter (stamp flavor) |
| `src/materials/stamp-game/def.ts` | modified | Wire `demos` |
| `src/materials/stamp-game/StampGame.tsx` | modified | `useDemo()` opt-in effect |
| `src/materials/MaterialPage.tsx` | modified | `?present=` param, launch buttons, Provider, overlay, step state |
| `src/lessons/LessonPage.tsx` | modified | "See this presented on the virtual material" link |
| `src/main.tsx` | modified | Import `presentation.css` |
| `src/lessons/content.test.ts` | modified | Demo-script ↔ lesson alignment contract |
| `src/materials/golden-beads/model.test.ts` | modified | Interpreter + full-script replay tests |
| `src/materials/stamp-game/model.test.ts` | modified | Interpreter + full-script replay tests |
| `plan/README.md`, `plan/11-presentation-mode.md` | modified | Status tracking |

## Testing

Vitest, node environment, pure logic only (no React rendering) — same conventions as `src/materials/golden-beads/model.test.ts`.

**`src/lessons/demo.test.ts` (new):**

```ts
import { describe, it, expect } from 'vitest'
import { planReplay } from './demo'

describe('planReplay', () => {
  it('applies every step from the start on first activation', () => {
    expect(planReplay(-1, 3)).toEqual({ reset: false, apply: [0, 1, 2, 3] })
  })
  it('applies only the new steps when moving forward', () => {
    expect(planReplay(3, 5)).toEqual({ reset: false, apply: [4, 5] })
  })
  it('resets and replays from step 0 when moving backward', () => {
    expect(planReplay(5, 2)).toEqual({ reset: true, apply: [0, 1, 2] })
  })
  it('does nothing when the step is unchanged', () => {
    expect(planReplay(2, 2)).toEqual({ reset: false, apply: [] })
  })
})
```

**`src/lessons/content.test.ts` (extend)** — add this describe block at the end, reusing the existing `lessonSlugs` set and `LESSONS`/`MATERIALS` imports:

```ts
describe('every demo script aligns with its lesson', () => {
  const withDemos = MATERIALS.filter((m) => m.demos !== undefined)

  it('the golden beads and stamp game ship presentation demos', () => {
    expect(withDemos.map((m) => m.slug)).toEqual(expect.arrayContaining(['golden-beads', 'stamp-game']))
  })

  for (const m of withDemos) {
    for (const [lessonSlug, script] of Object.entries(m.demos!)) {
      describe(`${m.slug} → ${lessonSlug}`, () => {
        it('targets a lesson that exists and belongs to this material', () => {
          expect(lessonSlugs, `lesson ${lessonSlug}`).toContain(lessonSlug)
          expect(m.lessonSlugs).toContain(lessonSlug)
        })
        it('has exactly one action list per presentation step', () => {
          const lesson = LESSONS.find((l) => l.slug === lessonSlug)!
          expect(script.length).toBe(lesson.presentation.length)
        })
      })
    }
  }
})
```

**`src/materials/golden-beads/model.test.ts` (extend)** — add `DEMO_INITIAL, applyDemoActions` to the model import, plus `import { demos } from './demos'`:

```ts
describe('presentation-mode demo actions', () => {
  it('build replaces the mat with the layout of the number', () => {
    const v = applyDemoActions(DEMO_INITIAL, [{ do: 'build', payload: 1234 }])
    expect(v.mat).toEqual({ 3: 1, 2: 2, 1: 3, 0: 4 })
  })

  it('add merges a second quantity without exchanging', () => {
    const v = applyDemoActions(DEMO_INITIAL, [
      { do: 'build', payload: 1568 },
      { do: 'add', payload: 1679 },
    ])
    expect(v.mat).toEqual({ 3: 2, 2: 11, 1: 13, 0: 17 })
  })

  it('exchangeUp trades ten for one, and an illegal trade is ignored', () => {
    const start = applyDemoActions(DEMO_INITIAL, [{ do: 'build', payload: 1568 }, { do: 'add', payload: 1679 }])
    const traded = applyDemoActions(start, [{ do: 'exchangeUp', payload: 0 }])
    expect(traded.mat).toEqual({ 3: 2, 2: 11, 1: 14, 0: 7 })
    expect(applyDemoActions(traded, [{ do: 'exchangeUp', payload: 0 }]).mat).toEqual(traded.mat) // only 7 units
  })

  it('check marks the mat against the target', () => {
    const v = applyDemoActions(DEMO_INITIAL, [{ do: 'build', payload: 3579 }, { do: 'check', payload: 3579 }])
    expect(v.check?.allOk).toBe(true)
    const bad = applyDemoActions(DEMO_INITIAL, [{ do: 'build', payload: 3578 }, { do: 'check', payload: 3579 }])
    expect(bad.check?.allOk).toBe(false)
    expect(bad.check?.places.find((p) => p.power === 0)?.ok).toBe(false)
  })

  it('replays the full golden-beads-addition script to 3,247 with every place ✓', () => {
    let v = DEMO_INITIAL
    for (const actions of demos['golden-beads-addition']) v = applyDemoActions(v, actions)
    expect(v.mat).toEqual({ 3: 3, 2: 2, 1: 4, 0: 7 })
    expect(totalValue(v.mat)).toBe(3247)
    expect(v.check?.allOk).toBe(true)
  })

  it('is deterministic: two replays of the script give identical views', () => {
    const run = () => demos['golden-beads-addition'].reduce((v, a) => applyDemoActions(v, a), DEMO_INITIAL)
    expect(run()).toEqual(run())
  })
})
```

**`src/materials/stamp-game/model.test.ts` (extend)** — add `DEMO_INITIAL, applyDemoActions` to the model import, plus `import { demos } from './demos'`:

```ts
describe('presentation-mode demo actions', () => {
  it('the static half of the script reads 3,468 with every column ✓', () => {
    let v = DEMO_INITIAL
    for (const actions of demos['stamp-game-addition'].slice(0, 5)) v = applyDemoActions(v, actions)
    expect(v.mat).toEqual({ 3: 3, 2: 4, 1: 6, 0: 8 })
    expect(v.checks !== null && allOk(v.checks)).toBe(true)
  })

  it('the full script ends at 3,247 after three trades, every column ✓', () => {
    let v = DEMO_INITIAL
    for (const actions of demos['stamp-game-addition']) v = applyDemoActions(v, actions)
    expect(v.mat).toEqual({ 3: 3, 2: 2, 1: 4, 0: 7 })
    expect(regionValue(v.mat)).toBe(3247)
    expect(v.checks !== null && allOk(v.checks)).toBe(true)
  })

  it('a refused exchange leaves the view unchanged', () => {
    const v = applyDemoActions(DEMO_INITIAL, [{ do: 'build', payload: 1325 }])
    expect(applyDemoActions(v, [{ do: 'exchangeUp', payload: 0 }])).toEqual(v) // only 5 units
  })

  it('reset returns to the initial free-mode view', () => {
    const v = applyDemoActions(DEMO_INITIAL, [{ do: 'build', payload: 1325 }, { do: 'reset' }])
    expect(v).toEqual(DEMO_INITIAL)
  })
})
```

## Manual QA script

1. `npm run dev`; open `http://<dev-ip>:5173/materials/golden-beads` in Chrome.
2. Confirm a "Walk through: Golden Bead Addition" button appears above the material (and nothing else changed on the page).
3. Click it. URL becomes `?present=golden-beads-addition`; a panel appears at the bottom: "Golden Bead Addition · Step 1 of 9", the step text, and the italic quoted say line "First we lay out one thousand two hundred thirty-four." The mat shows 1 thousand-cube, 2 hundred-squares, 3 ten-bars, 4 unit beads; total reads 1,234. Previous is disabled.
4. Next → Step 2: mat unchanged (the overlay explains building the second number). Next → Step 3: mat total reads 3,579 (columns 3/5/7/9). Next → Step 4: every column shows ✓ and the status says the mat shows 3,579.
5. Next → Step 5: mat re-forms as 1,568 + 1,679 combined — units column shows **17**, tens 13, hundreds 11, thousands 2. Next → Step 6: units drop to 7, tens become 14. Next → Step 7: tens 4, hundreds 2, thousands 3. Next → Step 8: all ✓, status names 3,247. Next → Step 9 (Next now disabled).
6. Press Previous three times (9→8→7→6): the mat is exactly the step-6 state again (units 7, tens 14, hundreds 11, thousands 2 — deterministic replay).
7. Mid-demo, tap a bank piece to add a stray bead, then press Next then Previous: the stray bead is gone (steps snap to scripted state).
8. Press Close: overlay and `?present=` disappear; the material still works normally (Reset, modes).
9. Repeat steps 2–6 briefly on `/materials/stamp-game` → "Walk through: Stamp Game Addition" (8 steps; static answer 3,468, dynamic 3,247).
10. Open `/lessons/stamp-game-addition`: a "See this presented on the virtual material (Stamp Game)" button-link appears in the Materials section and lands on the stamp game with the overlay open at Step 1. `/lessons/stamp-game-intro` has no such link.
11. Print preview (Ctrl+P) on `/materials/golden-beads?present=golden-beads-addition`: the overlay and the walk-through buttons do **not** appear. Print preview of `/lessons/golden-beads-addition`: the new link does not appear; the lesson prints as before. (No `.bw` check needed — this feature adds no printable sheets.)
12. Responsive: at 375px width (DevTools), the overlay spans the full width, never overflows horizontally, Prev/Next/Close are comfortably tappable (≥ 44px), and long step text scrolls inside the panel; with the overlay open, scrolling the page to the bottom still reveals all material content (spacer).
13. Deep link: paste `/materials/golden-beads?present=golden-beads-addition` into a fresh tab — overlay opens at Step 1. Paste `/materials/golden-beads?present=no-such-lesson` — page renders normally with no overlay and no errors in the console.
14. `/materials/bead-stair` (a material with no demos): identical to before — no buttons, no overlay, no console warnings.

## Acceptance criteria

- [x] `npm test` green (all pre-existing tests plus the new `demo.test.ts`, content-contract, and both model-test additions)
- [x] `npm run build` green (strict tsc + vite)
- [x] `MaterialDef.demos` is optional; zero changes were needed in the 17 non-demo material folders
- [x] `planReplay` satisfies the four locked vectors: `(-1,3)→{reset:false,apply:[0,1,2,3]}`, `(3,5)→{…[4,5]}`, `(5,2)→{reset:true,apply:[0,1,2]}`, `(2,2)→{…[]}`
- [x] `golden-beads-addition` script has 9 entries and `stamp-game-addition` has 8, matching their lessons' `presentation.length` (enforced by the new content test)
- [x] Walking the golden-beads demo forward shows 1,234 → 3,579 (✓) → 17-unit overflow → three trades → 3,247 (✓); Previous from any step reproduces that step's exact mat
- [x] Stray user taps between steps are overwritten by the next Prev/Next (scripted state lives in a ref)
- [x] Overlay: "Step k of n", step text, say line in italics **and** quotes, Prev/Next/Close all ≥ 44px via `.btn`; Prev disabled at step 1, Next disabled at step n; manual navigation only — no autoplay, no timers, no persisted progress
- [x] `?present=<slug>` deep-links work; unknown slugs are ignored gracefully; Close removes the param and the material keeps its normal controls
- [x] LessonPage link appears only for lessons that have a demo on one of their virtual materials, and is `.no-print`
- [x] Overlay and launch buttons absent from print preview; lesson and material pages print exactly as before
- [x] 375px: overlay full-width, no horizontal scroll, page content reachable behind the overlay via the spacer
- [x] No new npm dependencies; no network requests; no hex colors outside `tokens.css`; no localStorage
- [x] `plan/README.md` row added and this PRD's Status updated when landing

## Out of scope

- Autoplay, timers, step duration, or any "play" button — Prev/Next only (locked).
- Demos for the other 36 lessons / 17 materials (the `demos` field and overlay are generic; follow-up PRDs can add scripts material-by-material).
- Demos for the other golden-beads/stamp-game lessons (subtraction, multiplication, division, intro/formation) — addition only in this PRD.
- Highlighting or animating individual pieces, ghost hands, or transition animations for exchanges — state snaps between steps.
- Persisting the current step in the URL, localStorage, or anywhere else; resuming a walk-through after navigation.
- Keyboard shortcuts (arrow keys/Escape) and focus trapping — the overlay is a non-modal region; plain buttons are sufficient.
- Printing the walk-through — the album lesson page already prints the full presentation.
- Changes to `Lesson`/`PresentationStep` schemas or any lesson prose.
