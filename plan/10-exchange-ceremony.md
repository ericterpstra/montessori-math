# PRD 10 — The Exchange Ceremony: motion & material sounds

**Status:** Done
**Effort:** M — two small new `src/lib/` modules plus surgical edits to five existing components; no new dependencies, no new routes, no model changes.
**Depends on:** nothing (wave 1 is complete; this touches only shipped materials)

## Why

Exchanging ten units for one ten is *the* moment of the decimal system, but on screen it happens as an instant state change — tap, blink, done. In the physical material the child carries ten beads to the bank and receives one ten-bar back; the walk is the lesson. This PRD replaces the instant swap in **golden beads** and **stamp game** with a short, calm animated ceremony (highlight → ten pieces fly to the bank → pause → one flies back), and adds quiet synthesized *material* sounds — bead clink, wood tap, wire slide — across four materials, for both the child watching and the parent presenting. No praise sounds, no confetti: the motion IS the lesson.

## Binding product rules

These hard rules from CLAUDE.md constrain this feature specifically:

1. **No accounts, tracking, analytics, or persistence.** The mute preference is **deliberately session-only** (a module-level variable, reset on reload). No `localStorage`, no cookies. The codebase currently contains zero `localStorage` usage — keep it that way.
2. **No gamification.** Sounds are physical material sounds only (clink, tap, slide). No success jingles, no praise animations, no confetti. The ceremony runs identically whether the exchange was "right" or "wrong" — it is presentation, not reward.
3. **Fully static & offline.** All audio is **synthesized with the Web Audio API** — zero audio files, zero network requests, zero new assets in the repo.
4. **No new npm dependencies.** Web Audio (`AudioContext`) and the Web Animations API (`Element.animate`) are browser built-ins. Runtime deps stay exactly `react`, `react-dom`, `react-router-dom`.
5. **TypeScript strict, `verbatimModuleSyntax`** (use `import type` for type-only imports), **plain CSS with tokens** — no hex literals in components. New CSS lives in `src/styles/materials.css`.
6. **Tap-first, ≥ 44px targets.** The sound toggle is a standard `.btn` (which already has `min-height: var(--touch-target)` in `src/styles/global.css`).
7. **Accessibility/reduced motion.** `prefers-reduced-motion: reduce` skips the ceremony entirely (instant commit). Never encode information in the animation alone — the committed counts are the source of truth either way.
8. **Tests are pure logic in node env** (`vite.config.ts` sets `test.environment: 'node'`). The step planner and sound guards are unit-tested; DOM animation behavior is manual QA.

## Design decisions (locked — do not revisit)

- **(A) Sound = `src/lib/sound.ts`, synthesis only.** Module-level `let enabled = true`; exports `setSoundEnabled(v: boolean)`, `soundEnabled(): boolean`, `playClink()`, `playTap()`, `playSlide()`. Recipes are fixed (see step 1): clink = two triangle bursts at 2400 Hz and 3150 Hz with ±3% random detune, exponential gain decay 0.12 → 0.0001 over 80 ms, second burst delayed 25 ms; tap = triangle 220 Hz, 40 ms decay, gain 0.18, plus a 50 ms bandpass-filtered white-noise buffer at 800 Hz, Q = 1, gain 0.1; slide = sine 1200 Hz, 25 ms, gain 0.06. The `AudioContext` is created **lazily inside the first play call** (every play is click-driven, so the browser autoplay policy is satisfied), guarded by `typeof window !== 'undefined' && 'AudioContext' in window`, and every play body is wrapped in try/catch no-op. **The mute preference is NOT persisted** — session-only, by design (rule 1 caution).
- **(B) Mute control lives in `MaterialShell`** (`src/components/MaterialShell.tsx`): a new optional prop `sound?: boolean` (default `true`); unless it is explicitly `false`, a small 🔊/🔇 button renders at the **end** of the `.material-controls` row. It calls `setSoundEnabled` and reflects state via `useState` with the **changing-label pattern, no `aria-pressed`** — matching the existing Hide total / Show total button in `src/materials/golden-beads/GoldenBeads.tsx`.
- **(C) Ceremony = `src/lib/ceremony.ts`.** A pure, testable step planner `ceremonySteps(direction)` returning `CeremonyStep[]` (up: highlight 300 ms × 10, flyToBank 400 ms × 10, pause 150 ms, flyFromBank 400 ms × 1, commit 0 ms; down mirrors: 1 out, 10 back; total 1,250 ms), plus a DOM runner `runCeremony(opts): Promise<void>` built on `element.animate()`, absolute-positioned ghost clones appended to the stage element, straight-line paths computed from `getBoundingClientRect()` deltas. If `window.matchMedia('(prefers-reduced-motion: reduce)').matches` or any required element is missing, skip straight to `onCommit()`. While a ceremony runs the caller sets a `ceremonyActive` state flag that disables exchange buttons and makes piece-tap handlers early-return.
- **(D) Integration.** Golden beads (`handleExchange`) and stamp game (`onExchange`) run the ceremony, then commit the **existing** model exchange (`exchangeUpGolden`/`exchangeDownGolden`, `exchangeUpIn`/`exchangeDownIn`) — models are untouched. `playClink()` fires when the flyFromBank ghosts land; `playTap()` fires on bank/mat placement taps in golden beads, stamp game, and hundred board (`handleCellTap`); `playSlide()` fires on bead-frame wire moves (`onTapBead`, `onExchange`). Ghost CSS class `.ceremony-ghost` lives in `src/styles/materials.css` (`position: absolute; pointer-events: none; z-index: 30; will-change: transform`).

## Implementation steps

### 1. `src/lib/sound.ts` (new) — synthesized material sounds

Create the file with exactly this shape (full implementation; the recipes are locked):

```ts
/**
 * Material sounds — Web Audio API synthesis only. No audio files.
 * The mute preference is deliberately session-only (no persistence).
 */
let enabled = true
let ctx: AudioContext | null = null

export function setSoundEnabled(v: boolean): void {
  enabled = v
}

export function soundEnabled(): boolean {
  return enabled
}

/** Lazy: created on the first play call (always click-driven → autoplay-safe). */
function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** One oscillator burst with exponential gain decay. */
function burst(c: AudioContext, freq: number, at: number, peak: number, durS: number, type: OscillatorType): void {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(peak, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + durS)
  osc.connect(gain).connect(c.destination)
  osc.start(at)
  osc.stop(at + durS)
}

/** Glass-bead clink: two high triangle bursts, second 25 ms later, ±3% detune. */
export function playClink(): void {
  if (!enabled) return
  try {
    const c = getContext()
    if (!c) return
    const t = c.currentTime
    const detune = () => 1 + (Math.random() * 0.06 - 0.03)
    burst(c, 2400 * detune(), t, 0.12, 0.08, 'triangle')
    burst(c, 3150 * detune(), t + 0.025, 0.12, 0.08, 'triangle')
  } catch {
    /* sound is never worth crashing over */
  }
}

/** Wood tap: low triangle thump plus a 50 ms bandpass-filtered noise burst. */
export function playTap(): void {
  if (!enabled) return
  try {
    const c = getContext()
    if (!c) return
    const t = c.currentTime
    burst(c, 220, t, 0.18, 0.04, 'triangle')
    const frames = Math.ceil(c.sampleRate * 0.05)
    const buf = c.createBuffer(1, frames, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
    const src = c.createBufferSource()
    src.buffer = buf
    const filter = c.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 1
    const g = c.createGain()
    g.gain.setValueAtTime(0.1, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    src.connect(filter).connect(g).connect(c.destination)
    src.start(t)
    src.stop(t + 0.05)
  } catch {
    /* no-op */
  }
}

/** Wire slide: one very short quiet sine — 1200 Hz, 25 ms, gain 0.06. */
export function playSlide(): void {
  if (!enabled) return
  try {
    const c = getContext()
    if (!c) return
    burst(c, 1200, c.currentTime, 0.06, 0.025, 'sine')
  } catch {
    /* no-op */
  }
}
```

Note: `Math.random()` is correct here — the "all randomness through `rng.ts`" rule applies to *worksheet* randomness (reproducible sheets); a ±3% timbre detune is not reproducible content.

**Check:** `npm run build` stays green; in a node REPL-style test, importing the module and calling `playClink()` does not throw (no `window` → `getContext()` returns null → silent no-op).

### 2. `src/lib/ceremony.ts` (new) — step planner + DOM runner

```ts
import { playClink } from './sound'

export interface CeremonyStep {
  kind: 'highlight' | 'flyToBank' | 'pause' | 'flyFromBank' | 'commit'
  durationMs: number
  count?: number
}

/** The pure plan for one exchange. Up: 10 pieces out, 1 back. Down: 1 out, 10 back. */
export function ceremonySteps(direction: 'up' | 'down'): CeremonyStep[] {
  const out = direction === 'up' ? 10 : 1
  const back = direction === 'up' ? 1 : 10
  return [
    { kind: 'highlight', durationMs: 300, count: out },
    { kind: 'flyToBank', durationMs: 400, count: out },
    { kind: 'pause', durationMs: 150 },
    { kind: 'flyFromBank', durationMs: 400, count: back },
    { kind: 'commit', durationMs: 0 },
  ]
}

export interface RunCeremonyOptions {
  direction: 'up' | 'down'
  /** The positioned ancestor ghosts are appended to (`.material-stage`). */
  stageEl: HTMLElement
  /** Exactly the pieces that leave (up: the last 10 in the column; down: the last 1). */
  sourceEls: HTMLElement[]
  /** The bank tray element (flight waypoint). */
  bankEl: HTMLElement
  /** The receiving column's pieces container (flight destination). */
  destEl: HTMLElement
  /** Builds the visual for incoming piece i (0-based). Called only for flyFromBank. */
  makeGhost: (i: number) => HTMLElement
  /** Applies the model exchange. Called exactly once, always — even on skip/error. */
  onCommit: () => void
}
```

Runner, in the same file:

```ts
const GHOST_STAGGER_MS = 20

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface Point { x: number; y: number }

/** Center of `el` in stage-local coordinates (stage may scroll horizontally). */
function centerWithin(el: HTMLElement, stageEl: HTMLElement): Point {
  const r = el.getBoundingClientRect()
  const s = stageEl.getBoundingClientRect()
  return {
    x: r.left + r.width / 2 - s.left + stageEl.scrollLeft,
    y: r.top + r.height / 2 - s.top + stageEl.scrollTop,
  }
}

/** Append ghost to the stage with its center on `at`; returns it for animation. */
function placeGhost(ghost: HTMLElement, at: Point, stageEl: HTMLElement, ghosts: HTMLElement[]): HTMLElement {
  ghost.classList.add('ceremony-ghost')
  stageEl.appendChild(ghost)
  const r = ghost.getBoundingClientRect()
  ghost.style.left = `${at.x - r.width / 2}px`
  ghost.style.top = `${at.y - r.height / 2}px`
  ghosts.push(ghost)
  return ghost
}

/** Straight-line flight of every ghost from its current spot to `to`, staggered. */
async function flyAll(flights: Array<{ ghost: HTMLElement; from: Point }>, to: Point, durationMs: number): Promise<void> {
  const anims = flights.map(({ ghost, from }, i) =>
    ghost.animate(
      [
        { transform: 'translate(0px, 0px)' },
        { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px)` },
      ],
      { duration: durationMs, delay: i * GHOST_STAGGER_MS, easing: 'ease-in-out', fill: 'forwards' },
    ),
  )
  await Promise.allSettled(anims.map((a) => a.finished))
}

function removeGhosts(ghosts: HTMLElement[]): void {
  for (const g of ghosts.splice(0)) g.remove()
}

export async function runCeremony(opts: RunCeremonyOptions): Promise<void> {
  const { direction, stageEl, sourceEls, bankEl, destEl, makeGhost, onCommit } = opts
  let committed = false
  const commit = () => {
    if (!committed) {
      committed = true
      onCommit()
    }
  }

  const skip =
    typeof window === 'undefined' ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    !stageEl || !bankEl || !destEl || sourceEls.length === 0 ||
    typeof stageEl.animate !== 'function'

  if (skip) {
    playClink() // reduced motion mutes motion, not material sound; sound toggle still governs it
    commit()
    return
  }

  const ghosts: HTMLElement[] = []
  try {
    const sourcePoints = sourceEls.map((el) => centerWithin(el, stageEl))
    const bankPoint = centerWithin(bankEl, stageEl)
    const destPoint = centerWithin(destEl, stageEl)

    for (const step of ceremonySteps(direction)) {
      if (step.kind === 'highlight') {
        for (const el of sourceEls) el.classList.add('ceremony-source')
        await wait(step.durationMs)
      } else if (step.kind === 'flyToBank') {
        const flights = sourceEls.map((el, i) => {
          const ghost = el.cloneNode(true) as HTMLElement
          const r = el.getBoundingClientRect()
          ghost.style.width = `${r.width}px`
          ghost.style.height = `${r.height}px`
          el.classList.remove('ceremony-source')
          el.classList.add('ceremony-hidden')
          return { ghost: placeGhost(ghost, sourcePoints[i], stageEl, ghosts), from: sourcePoints[i] }
        })
        await flyAll(flights, bankPoint, step.durationMs)
        removeGhosts(ghosts)
      } else if (step.kind === 'pause') {
        await wait(step.durationMs)
      } else if (step.kind === 'flyFromBank') {
        const flights = Array.from({ length: step.count ?? 1 }, (_, i) => ({
          ghost: placeGhost(makeGhost(i), bankPoint, stageEl, ghosts),
          from: bankPoint,
        }))
        await flyAll(flights, destPoint, step.durationMs)
        playClink()
        removeGhosts(ghosts)
      }
      // 'commit' has zero duration; the actual commit happens in `finally`.
    }
  } catch {
    /* any DOM surprise degrades to an instant exchange */
  } finally {
    removeGhosts(ghosts)
    for (const el of sourceEls) el.classList.remove('ceremony-source', 'ceremony-hidden')
    commit()
  }
}
```

Design notes the implementer must preserve:
- `sourceEls` must be the **last** N piece buttons in the source column. Both materials render pieces with array-index keys, so after the commit React unmounts exactly the trailing nodes — the ones we hid — and the remaining pieces never flicker.
- `onCommit` runs exactly once in every path (skip, error, success) via the `committed` latch in `finally`.
- `ceremonySteps` stays pure and synchronous — it is the unit-testable contract; `runCeremony` consumes it so plan and runner cannot drift.

**Check:** `npx vitest run src/lib/ceremony.test.ts` passes after step 9's tests exist; `npm run build` green (strict TS: no unused vars, `import type` where needed — none needed here).

### 3. `src/styles/materials.css` (modified) — ghost + highlight CSS

Add `position: relative` to the **existing** `.material-stage` rule (ghosts are absolutely positioned inside it):

```css
.material-stage {
  position: relative; /* NEW: positioning context for .ceremony-ghost */
  border-radius: var(--radius);
  padding: 1rem;
  min-height: 320px;
  overflow-x: auto;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.18);
}
```

Append a new section at the end of the file:

```css
/* ---------- Exchange ceremony (PRD 10) ---------- */

.ceremony-ghost {
  position: absolute;
  pointer-events: none;
  z-index: 30;
  margin: 0;
  will-change: transform;
}

.ceremony-source {
  outline: 3px solid rgba(255, 255, 255, 0.9);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.ceremony-hidden {
  visibility: hidden;
}
```

(White rgba literals already appear in this file — e.g. `.bank-tray` — so this matches house style; tokens have no white.) No `print.css` changes: ghosts are transient click-driven DOM inside the screen-only stage and the sound toggle sits inside `.material-controls`, which is already `.no-print`.

**Check:** with dev server running, `getComputedStyle(document.querySelector('.material-stage')).position === 'relative'` on any material page.

### 4. `src/components/MaterialShell.tsx` (modified) — built-in sound toggle

Current props are exactly `controls?: ReactNode; help?: ReactNode; mat?: 'felt' | 'wood' | 'paper'; children: ReactNode`. Add `import { useState } from 'react'` and `import { setSoundEnabled, soundEnabled } from '../lib/sound'`, add `sound?: boolean` to `MaterialShellProps` with doc comment `/** Show the built-in sound on/off button at the end of the controls row. Default true. */`, destructure `sound = true`, and build the toggle:

```tsx
const [soundOn, setSoundOn] = useState(() => soundEnabled())
const soundToggle = sound !== false && (
  <button
    type="button"
    className="btn"
    onClick={() => {
      const next = !soundOn
      setSoundEnabled(next)
      setSoundOn(next)
    }}
  >
    {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
  </button>
)
```

Then change the controls row from `{controls && <div className="material-controls no-print">{controls}</div>}` to:

```tsx
{(controls || soundToggle) && (
  <div className="material-controls no-print">
    {controls}
    {soundToggle}
  </div>
)}
```

The help box and `.material-stage` line are unchanged. Conventions locked in: changing text label, **no `aria-pressed`** (same pattern as golden beads' `{showTotal ? 'Hide total' : 'Show total'}` button); `.btn` guarantees the 44px touch target (`min-height: var(--touch-target)` in `global.css`). Because `enabled` in `sound.ts` is module-level, the toggle state survives client-side navigation between materials (each shell initializes from `soundEnabled()`), and resets on page reload — deliberate, no persistence. Every material gets the toggle by default; none of the 19 call sites need edits.

**Check:** `npm run build` green; every material page shows 🔊 at the end of its controls row; toggling flips the label; reloading the page restores "🔊 Sound on".

### 5. `src/materials/golden-beads/GoldenBeads.tsx` (modified) — ceremony + taps

All model imports already exist in this file; add to the imports: `useRef` from `react`, `runCeremony` from `'../../lib/ceremony'`, and `playTap` from `'../../lib/sound'`.

5a. **State + refs.** Alongside the existing `useState` block add:

```tsx
const [ceremonyActive, setCeremonyActive] = useState(false)
const matRef = useRef<HTMLDivElement>(null)
```

Attach `ref={matRef}` to the existing `<div className="golden-beads-mat">`.

5b. **Data hooks for DOM lookup.** On the column wrapper `<div key={p} className="golden-beads-col">` add `data-power={p}`. On each bank button (`className="bank-item golden-beads-bank-item"`) add `data-bank-power={p}`.

5c. **Replace `handleExchange`** (currently a 4-line function calling `setMat(dir === 'up' ? exchangeUpGolden(mat, p) : exchangeDownGolden(mat, p))`) with:

```tsx
async function handleExchange(p: GoldenPower, dir: 'up' | 'down') {
  if (ceremonyActive) return
  if (dir === 'up' ? !canExchangeUpGolden(mat, p) : !canExchangeDownGolden(mat, p)) return
  const commit = () => {
    setMat((m) => {
      const can = dir === 'up' ? canExchangeUpGolden(m, p) : canExchangeDownGolden(m, p)
      if (!can) return m // state changed underneath (e.g. Reset mid-ceremony): do nothing
      return dir === 'up' ? exchangeUpGolden(m, p) : exchangeDownGolden(m, p)
    })
    clearFeedback()
  }
  const stageEl = matRef.current?.closest<HTMLElement>('.material-stage') ?? null
  const toPower = (dir === 'up' ? p + 1 : p - 1) as GoldenPower
  const outCount = dir === 'up' ? 10 : 1
  const sourceEls = stageEl
    ? Array.from(
        stageEl.querySelectorAll<HTMLElement>(`[data-power="${p}"] .golden-beads-pieces .golden-beads-piece`),
      ).slice(-outCount)
    : []
  const bankEl = stageEl?.querySelector<HTMLElement>('.golden-beads-bank') ?? null
  const destEl = stageEl?.querySelector<HTMLElement>(`[data-power="${toPower}"] .golden-beads-pieces`) ?? null
  if (!stageEl || !bankEl || !destEl || sourceEls.length < outCount) {
    commit()
    return
  }
  const makeGhost = () => {
    const ghost = document.createElement('div')
    const art = stageEl.querySelector(`[data-bank-power="${toPower}"] svg`)
    if (art) ghost.appendChild(art.cloneNode(true))
    return ghost
  }
  setCeremonyActive(true)
  try {
    await runCeremony({ direction: dir, stageEl, sourceEls, bankEl, destEl, makeGhost, onCommit: commit })
  } finally {
    setCeremonyActive(false)
  }
}
```

5d. **Freeze the material during the ceremony.** Add `if (ceremonyActive) return` as the first line of `handleBank`, `handleMatPiece`, `handleDeal`, and `handleTakeBack`. Add `ceremonyActive ||` to the `disabled` expression of both exchange buttons (`.golden-beads-action`): `disabled={ceremonyActive || !canExchangeUpGolden(mat, p)}` and `disabled={ceremonyActive || !canExchangeDownGolden(mat, p)}`.

5e. **Taps.** Add `playTap()` immediately after the guard clause (before the `setMat`/`setPerRow` call) in `handleBank`, `handleMatPiece`, `handleDeal`, and `handleTakeBack`. Do NOT add sound to `runCheck` — checking is silent (no judgment sounds).

**Check:** on `/materials/golden-beads` in Free build, add 10 units, tap "10 units → 1 ten": ten unit beads glow, fly to the bank, a ten-bar flies back with a clink, and the counts read units 0 / tens 1. Rapid double-tap of the button performs exactly one exchange.

### 6. `src/materials/stamp-game/StampGame.tsx` (modified) — ceremony + taps

Add to imports: `useRef` from `react` (it already imports `useState`), `runCeremony` from `'../../lib/ceremony'`, `playTap` from `'../../lib/sound'`.

6a. **State + refs.** `const [ceremonyActive, setCeremonyActive] = useState(false)` and `const rootRef = useRef<HTMLDivElement>(null)`; attach `ref={rootRef}` to the root `<div className="stamp-game">`.

6b. **Data hooks.** In the `Columns` component, add `data-place={place}` to the per-place wrapper (`<div key={place} className={...stamp-game-column...}>`). Add `data-region="mat"` to the mat region wrapper — the `<div className="stamp-game-region">` inside the `{showMat && (...)}` block (the one whose `Columns` receives `footer=`). Add `data-bank-place={place}` to each bank button (`className="bank-item stamp-game-bank-item"`).

6c. **Replace `onExchange`** (currently `applyRegion(dir === 'up' ? exchangeUpIn(mat, place) : exchangeDownIn(mat, place), setMat)`) with:

```tsx
async function onExchange(place: StampPlace, dir: 'up' | 'down') {
  if (ceremonyActive) return
  const probe = dir === 'up' ? exchangeUpIn(mat, place) : exchangeDownIn(mat, place)
  if (!probe.ok) {
    setMessage(probe.message)
    return
  }
  const commit = () => {
    setMat((m) => {
      const r = dir === 'up' ? exchangeUpIn(m, place) : exchangeDownIn(m, place)
      return r.ok ? r.value : m
    })
    setMessage(null)
    clearFeedback()
  }
  const stageEl = rootRef.current?.closest<HTMLElement>('.material-stage') ?? null
  const toPlace = (dir === 'up' ? place + 1 : place - 1) as StampPlace
  const outCount = dir === 'up' ? 10 : 1
  const sourceEls = stageEl
    ? Array.from(
        stageEl.querySelectorAll<HTMLElement>(
          `[data-region="mat"] [data-place="${place}"] .stamp-game-stamps .stamp-tile`,
        ),
      ).slice(-outCount)
    : []
  const bankEl = stageEl?.querySelector<HTMLElement>('.bank-tray') ?? null
  const destEl = stageEl?.querySelector<HTMLElement>(
    `[data-region="mat"] [data-place="${toPlace}"] .stamp-game-stamps`,
  ) ?? null
  if (!stageEl || !bankEl || !destEl || sourceEls.length < outCount) {
    commit()
    return
  }
  const makeGhost = () => {
    const tile = stageEl.querySelector(`[data-bank-place="${toPlace}"] .stamp-tile`)
    return (tile?.cloneNode(true) as HTMLElement | undefined) ?? document.createElement('div')
  }
  setCeremonyActive(true)
  try {
    await runCeremony({ direction: dir, stageEl, sourceEls, bankEl, destEl, makeGhost, onCommit: commit })
  } finally {
    setCeremonyActive(false)
  }
}
```

(`exchangeUpIn`/`exchangeDownIn` return `Result<PlaceCounts>` — `{ ok: true; value } | { ok: false; message }` — defined in `src/materials/stamp-game/model.ts` line 46; the probe surfaces refusal messages exactly as today.)

6d. **Freeze during ceremony.** Add `if (ceremonyActive) return` as the first line of `onBankTap`, `onMatTap`, `onRemovedTap`, `onRowStampTap`, and `onDeal`. In `exchangeFooter`, add `disabled={ceremonyActive}` to both `.stamp-game-xbtn` buttons (they have no `disabled` today); the `Deal 1 each` button in `supplyFooter` likewise gets `disabled={ceremonyActive}`.

6e. **Taps.** Add `playTap()` at these success points: inside `applyRegion` right after `commit(res.value)` (covers bank takes, mat returns, row-stamp returns); in `onMatTap`'s subtraction branch after `setRemoved(res.value.removed)`; in `onRemovedTap` after `setMat(res.value.to)`; in `onRowStampTap`'s division branch after `setMat(res.value.to)`; in `onDeal` after `setRows(res.value.rows)`.

**Check:** on `/materials/stamp-game` free mode, take 10 unit stamps (each with a wood tap), tap "10 → 1 ten": ten green tiles fly to the bank, one blue tile flies back with a clink, counts update. In division mode, the ceremony works on the supply region and "Deal 1 each" is disabled while it runs.

### 7. `src/materials/hundred-board/HundredBoard.tsx` (modified) — taps

Add `import { playTap } from '../../lib/sound'`. In `handleCellTap(cell)`, add `playTap()` on each state-changing branch:
- skip mode: first line of the `if (mode === 'skip')` block (every mark/unmark is a tile tap);
- the `if (placements.has(cell))` branch, before `setPlacements(removeTileAt(...))`;
- the `if (tileToPlace !== null)` branch, before `setPlacements(placeTile(...))`.

A tap on an empty cell with no tile selected stays silent (nothing happened). No other changes — no ceremony here.

**Check:** on `/materials/hundred-board`, placing/removing tiles and skip-count marking each produce one wood tap; tapping an empty square with an empty tray is silent.

### 8. `src/materials/bead-frame/BeadFrame.tsx` (modified) — wire slides

Add `import { playSlide } from '../../lib/sound'`. In `onTapBead(power, position)`, call `playSlide()` on both success paths: in the task branch after `setStage({ ...stage, counts: r.counts, task: r.task })`, and in the free branch after `setStage({ ...stage, counts: setWire(...) })` (not on the `!r.ok` refusal path). In `onExchange(power)`, call `playSlide()` after the successful `setStage` (an exchange slides beads on two wires). The existing CSS bead transition (`transition: left 0.22s ease` on `.bead-frame-bead` in `bead-frame.css`) already animates the motion — no ceremony needed here.

**Check:** on `/materials/bead-frame`, tapping beads produces a soft slide sound; refused moves in Addition mode (message shown) are silent.

### 9. Tests — see Testing section for the exact files and cases.

**Check:** `npm test` green (730 existing tests + the new ones).

### 10. Bookkeeping

Flip this PRD's **Status** to Done in the landing commit; the session lead adds the PRD 10 row to `plan/README.md` (shared file — do not edit it from a parallel branch).

## New & modified files

| Path | New/Modified | Purpose |
|---|---|---|
| `src/lib/sound.ts` | new | Web Audio synthesis: enable flag, clink/tap/slide |
| `src/lib/sound.test.ts` | new | node-env no-op + round-trip tests |
| `src/lib/ceremony.ts` | new | `ceremonySteps` planner + `runCeremony` WAAPI runner |
| `src/lib/ceremony.test.ts` | new | exact step vectors, durations, skip-path commit |
| `src/components/MaterialShell.tsx` | modified | `sound?: boolean` prop + 🔊/🔇 toggle at end of controls row |
| `src/materials/golden-beads/GoldenBeads.tsx` | modified | ceremony in `handleExchange`, `ceremonyActive` freeze, taps |
| `src/materials/stamp-game/StampGame.tsx` | modified | ceremony in `onExchange`, freeze, taps, data attributes |
| `src/materials/hundred-board/HundredBoard.tsx` | modified | `playTap()` in `handleCellTap` |
| `src/materials/bead-frame/BeadFrame.tsx` | modified | `playSlide()` in `onTapBead` / `onExchange` |
| `src/styles/materials.css` | modified | `.material-stage{position:relative}`, `.ceremony-ghost`, `.ceremony-source`, `.ceremony-hidden` |
| `plan/10-exchange-ceremony.md` | modified | Status → Done when landing |

No model files (`model.ts`), no registries, no routes, no `package.json` changes.

## Testing

Vitest, node environment (per `vite.config.ts`), colocated next to the modules, house style as in `src/lib/rng.test.ts` (`describe`/`it`/`expect`, concrete literals).

### `src/lib/ceremony.test.ts` (new)

```ts
import { describe, it, expect } from 'vitest'
import { ceremonySteps, runCeremony } from './ceremony'

describe('ceremonySteps', () => {
  it('up: highlights and flies 10 out, brings 1 back', () => {
    expect(ceremonySteps('up')).toEqual([
      { kind: 'highlight', durationMs: 300, count: 10 },
      { kind: 'flyToBank', durationMs: 400, count: 10 },
      { kind: 'pause', durationMs: 150 },
      { kind: 'flyFromBank', durationMs: 400, count: 1 },
      { kind: 'commit', durationMs: 0 },
    ])
  })

  it('down mirrors up: 1 out, 10 back', () => {
    expect(ceremonySteps('down')).toEqual([
      { kind: 'highlight', durationMs: 300, count: 1 },
      { kind: 'flyToBank', durationMs: 400, count: 1 },
      { kind: 'pause', durationMs: 150 },
      { kind: 'flyFromBank', durationMs: 400, count: 10 },
      { kind: 'commit', durationMs: 0 },
    ])
  })

  it('plans exactly 1250ms in both directions', () => {
    const total = (d: 'up' | 'down') => ceremonySteps(d).reduce((s, x) => s + x.durationMs, 0)
    expect(total('up')).toBe(1250)
    expect(total('down')).toBe(1250)
  })
})

describe('runCeremony without a DOM', () => {
  it('skips straight to onCommit exactly once and resolves', async () => {
    let commits = 0
    const nil = null as unknown as HTMLElement
    await runCeremony({
      direction: 'up',
      stageEl: nil,
      sourceEls: [],
      bankEl: nil,
      destEl: nil,
      makeGhost: () => nil,
      onCommit: () => {
        commits += 1
      },
    })
    expect(commits).toBe(1)
  })
})
```

(The skip-path test works in node because `typeof window === 'undefined'` short-circuits before any DOM access, and `playClink()` is a no-op there.)

### `src/lib/sound.test.ts` (new)

```ts
import { describe, it, expect } from 'vitest'
import { playClink, playSlide, playTap, setSoundEnabled, soundEnabled } from './sound'

describe('sound in a windowless (node) environment', () => {
  it('defaults to enabled', () => {
    expect(soundEnabled()).toBe(true)
  })

  it('every play function is a silent no-op that never throws', () => {
    expect(() => {
      playClink()
      playTap()
      playSlide()
    }).not.toThrow()
  })

  it('setSoundEnabled/soundEnabled round-trips and plays stay safe while muted', () => {
    setSoundEnabled(false)
    expect(soundEnabled()).toBe(false)
    expect(() => playClink()).not.toThrow()
    setSoundEnabled(true)
    expect(soundEnabled()).toBe(true)
  })
})
```

Ordering note: the round-trip test restores `enabled = true` at the end because the flag is module-level state shared across tests in the file.

Integration behavior (buttons disabled during the ceremony, ghost flight paths, actual audio) is deliberately **manual QA, not unit tests** — the node environment has no DOM or AudioContext, and the project convention is to test pure logic only.

## Manual QA script

1. `npm run dev`; open `http://localhost:5173/materials/golden-beads` in Chrome. Confirm a "🔊 Sound on" button sits at the end of the controls row.
2. In Free build, tap the units bank 10 times. Each tap places a bead AND produces a short wood tap (the very first tap also unlocks audio — expected).
3. Tap **10 units → 1 ten**. Watch ~1.25 s: the ten unit beads get a white outline (≈0.3 s), fly to the bank tray (≈0.4 s), brief pause, one ten-bar flies from the bank to the tens column with a glassy clink, then counts change to units 0 / tens 1. Total on the mat still reads 10.
4. While the pieces are flying, look at both exchange buttons: they must be grayed out (disabled). Double-tap the exchange button as fast as you can — only one exchange ever happens.
5. Tap **1 ten → 10 units**: one ten-bar flies out, ten unit beads fly back. Value unchanged.
6. Build 10 units again, tap the exchange, and hit **Reset** mid-flight: after the animation ends the mat stays empty (no ghost exchange appears).
7. Tap **🔊 Sound on** → label becomes "🔇 Sound off". Repeat an exchange: full motion, zero audio. Reload the page: the button reads "🔊 Sound on" again (session-only, by design).
8. DevTools → Rendering → *Emulate CSS media feature prefers-reduced-motion: reduce*. Tap an exchange: it commits instantly (no flight), counts correct, clink still plays. Turn emulation off.
9. DevTools → Network tab, clear, then tap pieces and run exchanges: **zero** network requests (all sound synthesized, no assets).
10. Open `/materials/stamp-game`. Free mode: take 10 unit stamps (tap sound each), tap **10 → 1 ten** under the units column: ten green tiles fly to the bank, one blue tile returns with a clink. Try Division mode (New problem → deal): "Deal 1 each" taps sound, and exchange ceremonies run on the supply region.
11. Open `/materials/hundred-board`: placing a tile, returning a tile, and skip-count marking all tap; tapping an empty square with the tray empty is silent.
12. Open `/materials/bead-frame`: bead taps produce a soft slide; in Addition mode a refused move (message appears) is silent; a successful Exchange slides.
13. Mobile width: DevTools device toolbar at **375 px**. On golden-beads run an up-exchange: ghosts stay inside the stage area, no page-level horizontal scrollbar appears (the stage itself may scroll — that is existing behavior), and the sound toggle wraps within the controls row with a full 44 px height.
14. Print preview (Ctrl+P) on `/materials/golden-beads`: the controls row including the sound toggle does not appear (`.no-print`); the stage prints exactly as before this PRD. (No `.bw` check needed — this feature adds no printable and encodes nothing in color: the white highlight outline is screen-only and transient.)
15. Keyboard: Tab to an exchange button and press Enter — ceremony and sounds run identically (all handlers are plain `onClick`).

## Acceptance criteria

- [x] `npm test` green, including `src/lib/ceremony.test.ts` and `src/lib/sound.test.ts` exactly as specified.
- [x] `npm run build` green (strict tsc + vite).
- [x] `ceremonySteps('up')` returns the exact 5-step vector (300/400/150/400/0 ms; counts 10/10/–/1/–); `'down'` mirrors it; both sum to 1,250 ms.
- [x] Golden beads and stamp game exchanges run the ceremony and commit via the **existing** model functions; the mat total is identical before and after every exchange.
- [x] All exchange/deal buttons and piece-tap handlers in golden beads and stamp game are inert while `ceremonyActive` is true; a ceremony can never double-commit (Reset mid-flight leaves state consistent).
- [x] `prefers-reduced-motion: reduce` ⇒ instant commit, no ghosts, feature fully usable.
- [x] Sound toggle appears at the end of the controls row on every material page, uses the changing-label pattern without `aria-pressed`, meets the 44px touch target, and is hidden in print.
- [x] Muting silences clink/tap/slide everywhere; preference resets on reload; `grep -rn "localStorage\|sessionStorage" src/` still returns nothing.
- [x] Zero new files in the repo other than the four source/test files listed; no audio assets; `package.json` dependencies unchanged; no runtime network requests during any interaction.
- [x] No praise/success sounds anywhere: `runCheck` (golden beads), `onCheck` (stamp game), `handleCheck` (hundred board) remain silent.
- [x] No hex color literals added to any `.tsx` file; new CSS lives only in `src/styles/materials.css`.
- [x] This PRD's Status flipped to Done in the landing commit.

## Out of scope

- Ceremonies in any material other than golden beads and stamp game (bead frame keeps its existing CSS slide; checkerboard, racks-and-tubes, etc. are untouched).
- Sounds in the remaining 15 materials beyond hundred board and bead frame (the toggle renders everywhere, ready for follow-up work).
- Persisting the mute preference (deliberately excluded — see rule 1), a global settings page, or per-material volume.
- Curved/arced flight paths, physics, easing libraries, or `@keyframes`-based reimplementation — straight-line WAAPI only.
- Any changes to `model.ts` files, worksheet generators, lessons, print output, or registries.
- Haptics, speech synthesis, or background/ambient audio.
