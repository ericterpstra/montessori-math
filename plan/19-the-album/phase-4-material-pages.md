# PRD 19 · Phase 4 — Material pages

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Steps 26–31. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


Each material sits on a mounted plate under a ruled toolbar, with the page's own actions in the PageHeader and the notes in two ruled columns below. Inside `.material-stage` only the type and the shared chrome tokens changed (Phase 1, Steps 6–7): this phase changes nothing inside a stage, and every phone stage keeps today's width. The phase ends with the walk-through step card.

## Step 26 — The plate caption and the material-name context

**Files:** `src/components/plateCaption.ts` (new), `src/components/plateCaption.test.ts` (new), `src/components/MaterialNameContext.ts` (new).

Every stage gets a caption like "Plate. Golden Beads & Mat, on the felt work mat." `MaterialShell` doesn't know the material's name, and the 22 material components that render it must not change. So `MaterialPage` hands the name down through a context. The wording is a pure function so it can be unit-tested. The prototype wrote this caption with DOM surgery (`shim.js` lines 238–241).

Create `src/components/plateCaption.ts`:

```ts
/** The surfaces a MaterialShell can lay a material on. */
export type MatSurface = 'felt' | 'wood' | 'paper'

/** How each surface reads in a plate caption. */
export const MAT_PHRASE: Record<MatSurface, string> = {
  felt: 'on the felt work mat',
  wood: 'on the wooden table',
  paper: 'on paper',
}

/**
 * The words after "Plate." under a material's stage:
 * plateCaption('Stamp Game', 'wood') → 'Stamp Game, on the wooden table.'
 * Without a name (a shell outside a material page) the phrase stands alone:
 * plateCaption(null, 'felt') → 'On the felt work mat.'
 */
export function plateCaption(name: string | null, mat: MatSurface): string {
  const phrase = MAT_PHRASE[mat]
  const trimmed = name?.trim()
  return trimmed ? `${trimmed}, ${phrase}.` : `${phrase[0].toUpperCase()}${phrase.slice(1)}.`
}
```

Create `src/components/plateCaption.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { MAT_PHRASE, plateCaption } from './plateCaption'
import { MATERIALS } from '../materials/registry'

describe('plateCaption', () => {
  it('names the material and its surface', () => {
    expect(plateCaption('Golden Beads & Mat', 'felt')).toBe('Golden Beads & Mat, on the felt work mat.')
    expect(plateCaption('Stamp Game', 'wood')).toBe('Stamp Game, on the wooden table.')
    expect(plateCaption('Hundred Board', 'paper')).toBe('Hundred Board, on paper.')
  })

  it('stands alone, capitalised, without a name', () => {
    expect(plateCaption(null, 'felt')).toBe('On the felt work mat.')
    expect(plateCaption('   ', 'wood')).toBe('On the wooden table.')
  })

  it('has a phrase for every surface', () => {
    for (const mat of ['felt', 'wood', 'paper'] as const) expect(MAT_PHRASE[mat]).toMatch(/^on /)
  })

  it('reads cleanly for every registered material', () => {
    for (const m of MATERIALS) {
      const caption = plateCaption(m.name, 'felt')
      expect(caption.startsWith(`${m.name}, `)).toBe(true)
      expect(caption.endsWith('.')).toBe(true)
      expect(caption).not.toMatch(/\.\.$/)
    }
  })
})
```

Create `src/components/MaterialNameContext.ts`. It is a separate file, like `src/lessons/DemoContext.tsx`, so `MaterialShell.tsx` exports only its component.

```ts
import { createContext } from 'react'

/**
 * The display name of the material on the current page (e.g. 'Golden Beads & Mat').
 * MaterialPage provides it; MaterialShell reads it to caption the plate
 * ("Plate. Golden Beads & Mat, on the felt work mat."). Material components
 * never read it. Null outside a material page.
 */
export const MaterialNameContext = createContext<string | null>(null)
```

**Check:** `npm test`: the four `plateCaption` tests pass, and every existing suite stays green. `npm run build` is green.

## Step 27 — `MaterialShell`: the ruled toolbar, the utility group, the help line and the mounted plate

**Files:** `src/components/MaterialShell.tsx` (modified: full new content), `src/styles/materials.css` (modified: one rule inserted).

This builds the markup that `shim.js` faked in lines 230–242. The toolbar splits into the material's own task controls (left) and a Sound/Focus group (right). The how-to disclosure moves under the toolbar and gains a drawn marker. The stage is wrapped in a captioned figure. This step changes nothing inside `.material-stage`: `{children}` is rendered exactly as before, into the same `div.material-stage.mat-*`.

Step 10 swapped the toggle emoji for `<Icon/>` plus `<span className="btn-label">` and reworded the doc comment's "Esc or ✕ exits". Step 10 moved the return block by a few lines (an import and the longer toggles), so locate it by its text (convention 10). It is:

```tsx
  return (
    <div className={`material-shell${focus ? ' focus-mode' : ''}`}>
      {help && (
        <details className="material-help no-print">
          <summary>How to use this material</summary>
          <div className="material-help-body">{help}</div>
        </details>
      )}
      <div className="material-controls no-print">
        {controls}
        {soundToggle}
        {focusToggle}
      </div>
      <div className={`material-stage mat-${mat}`}>{children}</div>
    </div>
  )
```

Replace the whole file with the version below. It keeps Step 10's toggle contents verbatim and adds the `btn-utility` class.

```tsx
import { useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { setSoundEnabled, soundEnabled } from '../lib/sound'
import { Icon } from './Icon'
import { MaterialNameContext } from './MaterialNameContext'
import { plateCaption } from './plateCaption'
import type { MatSurface } from './plateCaption'

export interface MaterialShellProps {
  /** Buttons/selects for modes, reset, etc. Hidden when printing. */
  controls?: ReactNode
  /** Short how-to content shown in a collapsible box. */
  help?: ReactNode
  /** Background of the work area: green felt mat, wood table, or plain paper. */
  mat?: MatSurface
  /** Show the built-in sound on/off button at the end of the controls row. Default true. */
  sound?: boolean
  children: ReactNode
}

/**
 * Consistent frame around every interactive material's work area (The Album,
 * PRD 19): a ruled toolbar (the material's own controls left, Sound and Focus
 * right), the how-to disclosure line, then the material on a mounted plate
 * with a caption. Everything inside .material-stage is the material itself:
 * it takes the Album's type (global.css) and keeps its own colours and layout.
 *
 * Focus mode fills the viewport with the material and hides every written
 * instruction (help box, plate caption and on-stage notes) — a calm, wordless
 * presentation surface for children who don't read yet. Esc or the Exit focus
 * button exits.
 */
export function MaterialShell({ controls, help, mat = 'felt', sound = true, children }: MaterialShellProps) {
  const materialName = useContext(MaterialNameContext)
  const [soundOn, setSoundOn] = useState(() => soundEnabled())
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    if (!focus) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocus(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('has-focus-mode')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('has-focus-mode')
    }
  }, [focus])

  const soundToggle = sound !== false && (
    <button
      type="button"
      className="btn has-icon btn-utility"
      onClick={() => {
        const next = !soundOn
        setSoundEnabled(next)
        setSoundOn(next)
      }}
    >
      <Icon name={soundOn ? 'sound' : 'sound-off'} />
      <span className="btn-label">{soundOn ? 'Sound on' : 'Sound off'}</span>
    </button>
  )

  const focusToggle = (
    <button type="button" className="btn has-icon btn-utility" onClick={() => setFocus((f) => !f)}>
      <Icon name={focus ? 'close' : 'focus'} />
      <span className="btn-label">{focus ? 'Exit focus' : 'Focus'}</span>
    </button>
  )

  return (
    <div className={`material-shell${focus ? ' focus-mode' : ''}`}>
      <div className="material-controls material-toolbar no-print">
        {controls ? <div className="material-task">{controls}</div> : null}
        <div className="material-utility" role="group" aria-label="Sound and focus">
          {soundToggle}
          {focusToggle}
        </div>
      </div>
      {help && (
        <details className="material-help no-print">
          <summary>
            <span className="material-help-mark" aria-hidden="true" />
            How to use this material
          </summary>
          <div className="material-help-body">{help}</div>
        </details>
      )}
      <figure className="material-plate">
        <div className="material-stage-frame">
          <div className={`material-stage mat-${mat}`}>{children}</div>
        </div>
        <figcaption className="plate-caption">
          <span className="plate-no">Plate.</span> {plateCaption(materialName, mat)}
        </figcaption>
      </figure>
    </div>
  )
}
```

What changed:
- `controls` render inside `div.material-task`, and only when a material passes some.
- Sound and Focus sit in `div.material-utility[role="group"]`.
- The help `details` comes *after* the toolbar, and its summary starts with `span.material-help-mark[aria-hidden]` (Step 28 draws the + / −).
- The stage is wrapped as `figure.material-plate > div.material-stage-frame > div.material-stage` plus `figcaption.plate-caption`.
- `mat` is typed with the shared `MatSurface`.

A `<figure>` has a UA margin of `1em 40px`, which would make every stage 80px narrower until Step 28. So this step also zeroes it. In `src/styles/materials.css`, directly after the current lines 3–5 (and so before the phone rule Step 12 inserted):

```css
.material-shell {
  margin-top: 1rem;
}
```

insert:

```css

/* The plate is a <figure>: no UA margin, so the stage keeps its width. */
.material-plate {
  margin: 0;
}
```

Step 28 replaces this block together with the lines around it and keeps the rule.

**Check:**
- `npm run build` is green.
- On each of the 21 `/materials/<slug>` pages (plus the thousand chain on `/materials/bead-chains`), this returns `1`: `document.querySelectorAll('.material-shell > .material-plate > .material-stage-frame > .material-stage').length`.
- On `/materials/golden-beads`, `/materials/stamp-game` and `/materials/checkerboard` the material inside the stage looks as it did after Step 7. The chrome around the stage looks unstyled until Step 28; that's expected.

## Step 28 — The shell stylesheet: toolbar, help line, plate mount, focus mode, phone

**Files:** `src/styles/materials.css` (modified). Four edits:
1. Lines 1–66, together with the `.material-plate` rule that Step 27 and the phone `.material-shell` rule that Step 12 inserted among them, are replaced; the block re-includes lines 29–58 unchanged.
2. No rule is inserted any more (Phase 4 review fixes; see Edit 2).
3. Lines 193–228 are replaced.
4. A phone block is appended.

Lines 67–192 and 229–253 are not touched here. They draw the mats, stamp tiles, number cards, bank tray, stage notes and the exchange ceremony; the only change among them since `bbbdb44` is Step 7's stamp-tile and number-card font lines.

This is the prototype's §11, written against the real classes:
- a ruled toolbar (ink rule above, hairline below) with small-capital labels vertically centred on their fields;
- ghost Sound/Focus buttons;
- a +/− disclosure line;
- the stage mounted on its frame with an ink hairline and a 6px paper mat, outside the stage's scroll area;
- a focus mode that stretches the plate.

**Edit 1.** The current lines 1–66 (line numbers at `bbbdb44`; Step 27's `.material-plate` rule and Step 12's phone `.material-shell` bleed, each with its comment, now sit after `.material-shell`) begin:

```css
/* ---------- Interactive material shell ---------- */

.material-shell {
  margin-top: 1rem;
}

.material-help {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0.6rem 1rem;
  margin-bottom: 0.75rem;
}

.material-help summary {
  cursor: pointer;
  font-weight: 600;
  min-height: var(--touch-target);
  display: flex;
  align-items: center;
}

.material-help-body {
  padding-top: 0.5rem;
  color: var(--ink-soft);
  max-width: 46rem;
}
```

and end with the stage:

```css
.material-stage {
  border-radius: var(--radius);
  padding: 1rem;
  min-height: 320px;
  overflow-x: auto;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.18);
}
```

Replace all of them, Step 27's and Step 12's rules included, with:

```css
/* ---------- Interactive material shell (The Album, PRD 19) ----------
   The shell is chrome: a ruled toolbar (the material's own controls left,
   Sound and Focus right), the how-to disclosure line, and the mounted plate.
   Everything inside .material-stage is the material itself: it takes the
   Album's type (global.css) and keeps its own colours and layout. */

.material-shell {
  margin-top: 0;
}

/* The legacy control row, unchanged: LongChain.tsx renders its own
   .material-controls row (the arrow-label print controls, outside the stage),
   so these rules must stay as they are. MaterialShell's toolbar keeps the
   class too, and the .material-toolbar rules below override them on order. */

.material-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin: 0.75rem 0;
}

.material-controls label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  font-size: 0.92rem;
  min-height: var(--touch-target);
}

.material-controls input[type='checkbox'] {
  width: 1.25rem;
  height: 1.25rem;
}

.material-controls select,
.material-controls input[type='number'] {
  font: inherit;
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  min-height: var(--touch-target);
}

/* The ruled toolbar. */
.material-toolbar {
  display: flex;
  font-family: var(--font-ui);
  /* material buttons in the toolbar that ask for --font-body get the UI face */
  --font-body: var(--font-ui);
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2) var(--space-5);
  margin: 0;
  padding: var(--space-2) 0;
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--line);
}

.material-task {
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  min-width: 0;
}

.material-utility {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: auto;
}

/* Labels are small capitals, vertically centred on their control. */
.material-toolbar label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--touch-target);
  font-family: var(--font-ui);
  font-size: var(--fs-caps);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.material-toolbar select,
.material-toolbar input[type='number'],
.material-toolbar input[type='text'] {
  min-height: var(--touch-target);
  padding: 0.4rem 0.6rem;
  font: 500 var(--fs-ui) / 1.2 var(--font-ui);
  letter-spacing: 0;
  text-transform: none;
  color: var(--ink);
  background-color: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-chrome);
}

.material-toolbar input[type='checkbox'] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--ink);
}

/* Sound and Focus: quiet ghost buttons in their own group. */
.btn.btn-utility {
  padding: 0.55rem 0.75rem;
  font-weight: 500;
  color: var(--ink-soft);
  background: transparent;
  border-color: transparent;
}

.btn.btn-utility:hover {
  color: var(--ink);
  background: var(--paper-warm);
  border-color: transparent;
}

/* Seven materials put buttons with their own classes in the toolbar. Those
   rules live in each material's stylesheet (never edited here) and draw
   with --card, --line and the legacy --radius-sm, so they would show a
   faint --line edge (1.57:1 on card) and a 6px corner beside the ink-edged
   .btn. Give them the chrome edge and corner; their fill, hover, pressed
   outline and the strip board's primary variant stay their own. The chart
   materials' Close button in the .no-print bar inside their sheet preview
   is chrome too, so it gets the same. */
.material-toolbar
  :is(
    .addition-charts-btn,
    .multiplication-charts-btn,
    .bead-chains-btn,
    .bead-frame-btn,
    .multiplication-bead-board-btn,
    .number-cards-btn,
    .subtraction-strip-board-button
  ):not(.subtraction-strip-board-primary, [aria-pressed='true']),
.print-sheet .no-print :is(.addition-charts-btn, .multiplication-charts-btn) {
  border-color: var(--ink);
  border-radius: var(--radius-control);
}

/* "How to use this material": a disclosure line under the toolbar, with a
   drawn +/− marker (a real element, so nothing is read aloud but the words). */
.material-help {
  margin: 0 0 var(--space-5);
  padding: 0;
  background: none;
  border: 0;
  border-bottom: 1px solid var(--ink);
  border-radius: 0;
}

.material-help summary {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: var(--touch-target);
  list-style: none;
  cursor: pointer;
  font: 600 var(--fs-ui) / 1.3 var(--font-ui);
  color: var(--ink);
}

.material-help summary::-webkit-details-marker {
  display: none;
}

.material-help summary:hover {
  color: var(--accent);
}

.material-help-mark {
  position: relative;
  flex: none;
  width: 1.4rem;
  height: 1.4rem;
  border: 1px solid currentColor;
  border-radius: 50%;
}

.material-help-mark::before,
.material-help-mark::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.material-help-mark::before {
  width: 0.625rem;
  height: 1px;
}

.material-help-mark::after {
  width: 1px;
  height: 0.625rem;
}

.material-help[open] .material-help-mark::after {
  display: none;
}

.material-help-body {
  max-width: var(--measure);
  padding: 0 0 var(--space-4) 2.15rem;
  font-family: var(--font-text);
  font-size: var(--fs-read-sm);
  color: var(--ink);
}

.material-help-body > :last-child {
  margin-bottom: 0;
}

/* The plate: the frame mounts the stage with a 1px ink hairline and a 6px
   paper mat (the frame's own padding). The mount is outside the stage's
   scroll area, so a mat wider than its stage never scrolls over it. The
   stage's padding and min-height give the same 6px back, so every
   material's content box is exactly today's (1rem padding, 320px tall at
   least). The stage has no border, so whatever a material places in stage
   coordinates (the exchange ceremony's ghosts) lands where it did. */
.material-plate {
  margin: 0;
}

/* Also the positioning context for the scroll veil (below). Never give it
   a z-index, opacity, transform, filter or mask: it must not become a
   stacking context, and neither may .material-stage. */
.material-stage-frame {
  position: relative;
  padding: 6px;
  background: var(--paper);
  border-radius: var(--radius-control);
  box-shadow: inset 0 0 0 1px var(--ink);
}

.material-stage {
  padding: calc(1rem - 6px);
  min-height: calc(320px - 12px);
  overflow-x: auto;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.18);
}

.material-plate > .plate-caption {
  margin-top: var(--space-3);
  text-align: left;
}
```

- Lines 29–58 (`.material-controls` and its label, checkbox and select rules) appear unchanged inside this block. LongChain's print row still uses them.
- The toolbar carries both classes, so each `.material-toolbar` rule has the same specificity as its `.material-controls` twin and wins on order.
- `font-family: var(--font-ui)` on the toolbar follows convention 5 (no blanket UI-font rule). The labels and fields set their own face. The toolbar also re-scopes `--font-body` to `--font-ui`, as Step 7 does inside a stage, because the chart materials' and the multiplication bead board's toolbar buttons set their own `font-family: var(--font-body)` and would otherwise draw in Newsreader beside the MM Sans `.btn`s.
- `.material-plate` and `.material-stage-frame` set no inherited text property (convention 4). The frame's padding, background, corner and box-shadow create no stacking context (decision 20).
- **The toolbar's material buttons.** Seven materials pass buttons with their own classes as `controls`: `.addition-charts-btn`, `.multiplication-charts-btn`, `.bead-chains-btn`, `.bead-frame-btn`, `.multiplication-bead-board-btn`, `.number-cards-btn` and `.subtraction-strip-board-button`. (Cards & counters' toolbar button is already a `.btn`.) Their rules are in the materials' own stylesheets, which this PRD doesn't edit. In the toolbar they read the Album's `--card` and `--line` and the legacy `--radius-sm` (6px), and would be the only chrome controls whose edge is the decorative `--line`. The rule above gives them the ink edge and 3px corner, and so does the chart materials' Close button in the `.no-print` bar inside the chart sheet preview. It leaves their fill and hover to the material, and skips a pressed number-cards toggle (its `--focus` border and outline are the pressed state) and the strip board's primary variant (drawn inside the stage today, but excluded in case it ever moves to the toolbar). Specificity is (0,3,0), so a material's own `:hover:not(:disabled)` border (bead frame) still wins on order. The same classes inside a stage are untouched.
- **The mount is chrome, and it sits outside the scroll area.** The frame carries the ink hairline (an inset box-shadow) and the 6px paper mat (its padding). The stage loses its corner radius and gives the 6px back from its padding and min-height, so every material's content box is exactly today's; only the stage's own box is 12px smaller. A mat wider than its stage is clipped at the stage's edge, inside the mount, so it never runs over either ring. The stage gets no border of its own: the exchange ceremony (`src/lib/ceremony.ts`) places its ghosts from the stage's border box, so a 6px border would put every ghost 6px off its piece (3px on a phone). *Phase 4 review fixes:* Phase 4 first drew both rings as inset box-shadows on the stage, inside its scroll area, and every mat that scrolls ran over them (10 materials at 390, 4 at 820). The checks below test the new mount.

**Edit 2.** None. Phase 4 first inserted a `.material-stage.mat-paper` rule after line 88 to redraw the mount's rings on a paper mat; the review fixes deleted it when the rings moved to the frame. No material uses `mat="paper"` today. If one ever does, the frame mounts it like any other stage, and the legacy `.mat-paper { background: #fff; border: 1px solid var(--line); box-shadow: none }` keeps its white ground and hairline inside the mount, without the felt's depth.

**Edit 3.** The current lines 193–228 are:

```css
/* ---------- Focus mode (issue #5) ----------
   The material fills the screen and every written instruction disappears —
   a wordless presentation surface for pre-readers. */

.material-shell.focus-mode {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--paper);
  padding: 0.5rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin: 0;
}

.material-shell.focus-mode .material-help {
  display: none;
}

.material-shell.focus-mode .material-controls {
  margin: 0 0 0.5rem;
}

.material-shell.focus-mode .material-stage {
  flex: 1 1 auto;
  min-height: 0;
}

.material-shell.focus-mode .stage-note {
  display: none;
}

body.has-focus-mode {
  overflow: hidden;
}
```

Replace them with:

```css
/* ---------- Focus mode (issue #5) ----------
   The material fills the screen and every written instruction disappears —
   a wordless presentation surface for pre-readers. The utility group sits at
   the toolbar's right end, so Exit focus is always top right. */

.material-shell.focus-mode {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--paper);
  padding: 0.5rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin: 0;
}

.material-shell.focus-mode .material-help,
.material-shell.focus-mode .plate-caption,
.material-shell.focus-mode .stage-note {
  display: none;
}

.material-shell.focus-mode .material-toolbar {
  margin: 0 0 0.5rem;
}

.material-shell.focus-mode .material-plate,
.material-shell.focus-mode .material-stage-frame {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* no mount in focus mode: the felt fills the frame */
.material-shell.focus-mode .material-stage-frame {
  padding: 0;
  background: none;
  border-radius: 0;
  box-shadow: none;
}

.material-shell.focus-mode .material-stage {
  flex: 1 1 auto;
  min-height: 0;
  padding: 1rem;
  border-radius: var(--radius-control);
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.18);
}

body.has-focus-mode {
  overflow: hidden;
}
```

**Edit 4.** Append at the end of the file:

```css
/* ---------- Phone ---------- */

@media screen and (max-width: 640px) {
  /* one toolbar row where it fits: task controls wrap inside their own
     group, while Sound and Focus stay a fixed pair at the top right */
  .material-toolbar {
    gap: var(--space-1);
    padding: var(--space-1) 0;
  }

  .material-task {
    gap: var(--space-1) var(--space-2);
  }

  /* A label never outgrows the task group, and its select shrinks only
     when label and select together are wider than the group, so the chosen
     value shows in full wherever it fits. */
  .material-toolbar label {
    max-width: 100%;
  }

  .material-toolbar label > select {
    min-width: 0;
    flex: 0 1 auto;
    padding-right: 0.3rem;
  }

  .material-task > .btn {
    min-width: var(--touch-target);
    padding: 0.55rem 0.5rem;
    white-space: nowrap;
  }

  .material-utility {
    gap: 0;
  }

  /* 44px icon-only buttons; the words stay the accessible name */
  .btn.btn-utility {
    width: var(--touch-target);
    padding: 0;
    justify-content: center;
  }

  .btn-utility .btn-label {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }

  /* The phone gutter grew from 12px to 16px (Step 12). The plate bleeds 4px
     back into it, so every plate keeps today's stage width (viewport − 24px)
     and every material today's content box (1rem inside it); wider phone
     mats are PRD 20 layout work. The mat ring is 3px here instead of 6px,
     and the stage's padding gives those 3px back. */
  .material-plate {
    margin: 0 -4px;
  }

  .material-plate > .plate-caption {
    padding-left: 4px;
  }

  .material-stage-frame {
    padding: 3px;
  }

  .material-stage {
    padding: calc(1rem - 3px);
    min-height: calc(320px - 6px);
  }

  /* Focus mode fills the screen inside its own 12px padding: no bleed. */
  .material-shell.focus-mode .material-plate {
    margin: 0;
  }
}
```

- **Phone stages keep today's width** (decision 19). Today a phone stage is `viewport − 24px` wide (12px main padding each side) with 16px padding. Step 12 made the gutter 16px, and the 4px bleed gives the plate back exactly those 8px: 366px at 390, with the material 1rem inside its edge (3px ring plus 13px stage padding), a 334px content box as today. Focus mode is a fixed layer with its own 12px side padding, so the bleed is cancelled there: the focus-mode stage is 366px at 390, as before this phase (without that rule it was 374px). Until now the shell carried that bleed (Step 12, item 5); Edit 1 removed it, so the bleed is on the plate alone and the toolbar and help line sit back on the 16px gutter. The prototype's 8px bleed with tighter padding would have widened every phone stage by 24px and reflowed several materials, which is layout work for PRD 20 (S2-16, open question 12). `golden-beads.css` is not touched.
- `min-width` on the task buttons keeps short labels (the checkerboard's "Set") at 44px once the phone padding tightens.
- **Phone selects show their value.** The prototype capped phone toolbar selects at 6.6rem because it hid their labels, so each select had its row to itself. With the labels visible (decision 18), that cap cut the chosen value on 11 of 21 materials ("Chart 1 —", "Symbols (", "4-digit × 2", which reads as "times 2"). The label is capped at the task group's width instead, and the select may shrink only when label and select together are wider than the group. No select at 390 is cut, and nothing passes its group; four toolbars (number cards, both strip boards, teen board) gain a row. *Phase 4 review fixes.*

**Measured contrast:**

| Element | Colours | Ratio |
| --- | --- | --- |
| Toolbar labels | `--ink-soft` on paper | 6.50:1 |
| Field text | ink on card | 15.54:1 |
| Field border | `--line-strong` `#8c816f` on paper | 3.40:1 |
| Utility buttons | ink-soft on paper | 6.50:1 |
| Utility buttons, hover | ink on paper-warm | 12.62:1 |
| Help summary | ink on paper | 14.04:1 |
| Help summary, hover | rubric on paper | 6.16:1 |
| Focus ring | the 3px `--focus` `#1e6bb8` on paper | 4.84:1 |

There are no transitions here. The `.btn-utility .btn-label` phone rule repeats `.visually-hidden`'s declarations (Step 9) because it applies only inside the media query.

**Check:**
- At 1400 on `/materials/golden-beads`, `Math.round(document.querySelector('.material-stage-frame').getBoundingClientRect().top)` is about 459 (the stage's top before this phase was about 466).
- The MODE label is centred on its select. Sound and Focus are right-aligned ghost buttons with line icons. The help line has a circled + that becomes − when open.
- The plate shows a 1px ink line and a 6px paper mat round the stage. `getComputedStyle(document.querySelector('.material-stage-frame'))` has `boxShadow` `rgb(38, 34, 29) 0px 0px 0px 1px inset` and `padding` `6px`; the stage's `boxShadow` is `rgba(0, 0, 0, 0.18) 0px 2px 10px 0px inset` and its `padding` `10px`.
- The mount stays whole while a mat scrolls: at 390 on `/materials/golden-beads` after `document.querySelector('.material-stage').scrollLeft = 150`, and on `/materials/checkerboard` at 820 (at rest and scrolled), the bank tray, the instruction line, the "Total on the mat" chip and the wooden board stop at the paper ring, and the ink line is unbroken on all four sides.
- On `/materials/golden-beads` at 1400 and 390 and `/materials/stamp-game` at 1400 and 390, exchange 10 units: each flying ghost starts exactly on its piece (0px apart), as before this phase.
- On `/materials/checkerboard` at 820, the task controls wrap into three rows inside their group, and the Sound/Focus group's top equals the task group's top: nothing stranded (S2-08).
- At 390 on `/materials/golden-beads`, Sound and Focus are 44×44 icon-only buttons at the top right. The first task row is `MODE [Free build]`, and Hide total and Reset sit on the second. `Math.round(document.querySelector('.material-stage-frame').getBoundingClientRect().width)` is `366`, as the stage is today, and the stage's content box is today's 334px: `(() => { const s = document.querySelector('.material-stage'), c = getComputedStyle(s); return s.clientWidth - parseFloat(c.paddingLeft) - parseFloat(c.paddingRight) })()`.
- At 390 every toolbar select shows its whole value: "Small — to 9,999" and "Free exploration" on the bead frame, "Chart 1 — control chart" on both chart materials, "Symbols (build 11–19)" on the teen board, "4-digit × 2-digit" on the checkerboard. No task control reaches past its group, and no page scrolls sideways.
- On `/materials/number-cards`, `/materials/bead-frame`, `/materials/bead-chains`, `/materials/multiplication-bead-board`, `/materials/subtraction-strip-board`, `/materials/addition-charts` and `/materials/multiplication-charts`, the toolbar's own buttons have a 1px ink edge and 3px corners like the chrome buttons, and on the two chart materials "Print control charts", Reset, the Mode label and its select compute to MM Sans like the Sound and Focus buttons beside them (until this step they draw in Newsreader). A pressed number-cards view toggle keeps its blue border and outline, and `/materials/checkerboard`'s "Set" is 44px wide at 390.
- Press Focus on `/materials/bead-frame`, `/materials/cards-and-counters`, `/materials/teen-board` and `/materials/decimal-board` at 1400 and at 390. Exit focus sits at the top right every time (S9-33). The help line and caption are hidden, the mount is gone, and the felt fills the screen. At 390 the stage is 366px wide at x = 12, as before this phase (`document.querySelector('.material-stage').getBoundingClientRect()`), and at 1400 it is 1376px. Esc exits.
- The standard check (convention 12) passes: on golden beads, stamp game and number cards nothing inside the stage moved apart from the mount.

## Step 29 — The scroll veil on wide mats

**Files:** `src/styles/materials.css` (modified: appended).

On a phone the golden-bead mat is 640px wide inside a 366px plate (a 334px content box). Tens and Units, where the work starts, sit off to the right behind a scroll nobody can see (S2-02). The veil fades the stage's right edge into paper while more mat lies beyond, and lifts as the child scrolls to the end. Place value keeps its left-to-right order and nothing reflows. The fluid-mat redesign stays with PRD 20.

Append:

```css
/* ---------- Scroll veil (PRD 19) ----------
   Wherever a mat is wider than its stage (for example golden beads, the
   stamp game and the bead frame on a phone, or cards & counters and the
   checkerboard on a tablet) the stage scrolls sideways. A paper veil fades
   its right edge while more of the mat lies beyond and lifts as the child
   scrolls to the end, so place value keeps its left-to-right order and
   nothing reflows. It is a separate layer on the frame, driven by the
   stage's own scroll position (no JavaScript), so the stage never becomes a
   stacking context: a mask on the stage would make it one and would surface
   the stamp game's z-index:-1 stack hint. It is inactive when the mat fits,
   and absent where scroll-driven animations are unsupported or the reader
   asks for reduced motion. It lies over the stage only, inside the mount's
   paper ring, so the ink hairline stays whole. */
.material-stage-frame::after {
  content: '';
  position: absolute;
  top: 6px;
  right: 6px;
  bottom: 6px;
  width: 2.75rem;
  background: linear-gradient(to right, transparent, color-mix(in srgb, var(--paper) 82%, transparent));
  pointer-events: none;
  opacity: 0;
}

@media screen and (max-width: 640px) {
  .material-stage-frame::after {
    top: 3px;
    right: 3px;
    bottom: 3px;
  }
}

.material-shell.focus-mode .material-stage-frame::after {
  top: 0;
  right: 0;
  bottom: 0;
  border-radius: 0 var(--radius-control) var(--radius-control) 0;
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) and (timeline-scope: --stage-x) {
    .material-stage-frame {
      timeline-scope: --stage-x;
    }

    .material-stage {
      scroll-timeline: --stage-x inline;
      /* keyboard focus treats the veiled strip as out of view */
      scroll-padding-inline-end: 2.75rem;
    }

    .material-stage-frame::after {
      animation: stage-veil linear both;
      animation-timeline: --stage-x;
    }
  }
}

@keyframes stage-veil {
  0%,
  92% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
```

and, at the very end of the file:

```css
@media print {
  .material-stage-frame::after {
    display: none;
  }
}
```

**Focus under the veil.** A browser scrolls a focused control into the scrollport, and the veiled strip is inside it, so without help a control could take focus while it shows only under the veil. `scroll-padding-inline-end: 2.75rem` makes the strip count as out of view, so such a control is scrolled clear (WCAG 2.4.11, focus not obscured). It sits in the same `@supports` block as the veil, so it applies exactly when the veil does. It is a scroll-only property: it changes no layout or paint, and creates no stacking context. (Chrome leaves a control where it is when part of it already shows outside the strip, so that part, with its focus ring, stays clear of the veil.)

**Why a layer and not the prototype's mask.** `mask-image` (and `opacity`, `transform`, `filter`, `isolation`, or a `z-index` on a positioned box) makes `.material-stage` a stacking context. The stamp game's `.stamp-game-bank-stack::before/::after` have `z-index: -1` (`stamp-game.css:32–41`). Today they paint *under* the stage background and are invisible. Inside a stacking context they would paint over it, a visible change to a material. `timeline-scope` and `scroll-timeline` create no stacking context.

**Check:**
- At 390 on `/materials/golden-beads`, `getComputedStyle(document.querySelector('.material-stage-frame'), '::after').opacity` is `"1"`. After `document.querySelector('.material-stage').scrollLeft = 2000` it is `"0"`.
- At 1400 it is `"0"`: the mat fits. On `/materials/checkerboard` at 820 it is `"1"`.
- The veil covers the stage only: `getComputedStyle(document.querySelector('.material-stage-frame'), '::after').right` is `"6px"` at 820 and 1400, `"3px"` at 390 and `"0px"` in focus mode, so the plate's right ink line is never washed out.
- With DevTools, Rendering, "Emulate CSS prefers-reduced-motion: reduce", it is `"0"`.
- Tap the Units column's exchange button through the veil: it works (`pointer-events: none`).
- At 390 on `/materials/golden-beads`, tap UNIT ten times so "10 units → 1 ten" is enabled. In the console, scroll the mat so only the button's left edge peeks out under the veil, then focus it the way Tab would:
  ```js
  const stage = document.querySelector('.material-stage')
  stage.scrollLeft = 150
  ;[...stage.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('10 units')).focus()
  stage.scrollLeft === stage.scrollWidth - stage.clientWidth // true (306 at 390): the mat scrolled to its end, so the button is clear and the veil has lifted
  ```
  With `scroll-padding-inline-end` unticked in DevTools, the same lines leave `scrollLeft` at 150 and the button under the veil.
- On `/materials/stamp-game` at 390 and 1400, this returns `[]` (no stacking-context ancestor between the stamp stack and `<body>`), and the bank's stacked stamps show no extra pale outlines behind them (the stack hint stays hidden). It flags every stacking-context trigger, and any `z-index` at all (on a flex or grid item a `z-index` creates one without `position`):
  ```js
  (() => { const out = []; for (let n = document.querySelector('.stamp-game-bank-stack').parentElement; n && n !== document.body; n = n.parentElement) { const c = getComputedStyle(n); if (c.zIndex !== 'auto' || c.position === 'fixed' || c.position === 'sticky' || c.opacity !== '1' || c.transform !== 'none' || c.filter !== 'none' || c.backdropFilter !== 'none' || c.clipPath !== 'none' || c.maskImage !== 'none' || c.mixBlendMode !== 'normal' || c.isolation === 'isolate' || c.perspective !== 'none' || c.containerType !== 'normal' || c.willChange !== 'auto' || c.contain !== 'none') out.push(n.className) } return out })()
  ```

## Step 30 — The material page: PageHeader, Walk-through, two-column notes and links

**Files:** `src/materials/MaterialPage.tsx` (modified: full new content), `src/styles/materials.css` (modified: appended).

The prototype's `shim.js` lines 222–247 regrouped the page. This is the real markup:
- **Header.** `PageHeader` holds the title, the meta line (boxed age, *labelled* grades, strand), the ink lede, and the Walk-through buttons as its actions. The inline-styled `.presentation-launch` row goes away.
- **Notes.** For parents and Make the real thing become two ruled columns across the plate's width. Their `section.card` elements with inline `maxWidth: '46rem'` (S2-18) go away.
- **Links.** Lessons for this material and Printable follow-up work become a second pair of columns. Link titles are 44px tap targets.

The current lines 52–128 are:

```tsx
  return (
    <>
      <h1>{material.name}</h1>
      <p>
        <span className="badge age">ages {material.ages[0]}–{material.ages[1]}</span>
        <span className="badge">{material.grades}</span>
        <span className="badge">{strandInfo(material.strand).name}</span>
      </p>
      <p className="page-intro">{material.summary}</p>

      {demoLessons.length > 0 && (
        <div className="presentation-launch no-print">
          {demoLessons.map((l) => (
            <button
              key={l.slug}
              type="button"
              className="btn"
              onClick={() => openDemo(l.slug)}
              aria-pressed={presentSlug === l.slug}
            >
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

      <section className="card" style={{ marginTop: '1.5rem', maxWidth: '46rem' }}>
        <h2>For parents</h2>
        <p style={{ marginBottom: 0 }}>{material.parentNote}</p>
      </section>

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

      {(lessons.length > 0 || generators.length > 0) && (
        <section style={{ marginTop: '1.5rem' }}>
          {lessons.length > 0 && (
            <>
              <p className="section-label">Lessons for this material</p>
              <ul>
                {lessons.map((l) => (
                  <li key={l.slug}>
                    <Link to={`/lessons/${l.slug}`}>{l.name}</Link>{' '}
                    <span className="badge age">ages {l.ages[0]}–{l.ages[1]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {generators.length > 0 && (
            <>
              <p className="section-label">Printable follow-up work</p>
              <ul>
                {generators.map((g) => (
                  <li key={g.slug}>
                    <Link to={`/worksheets/${g.slug}`}>{g.name}</Link> — {g.description}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
```

Replace the whole file with:

```tsx
import { Suspense, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { materialBySlug } from './registry'
import { lessonBySlug } from '../lessons/registry'
import { generatorBySlug } from '../worksheets/registry'
import { kitsForMaterial } from '../kits/registry'
import { strandInfo } from '../lib/strands'
import { DemoContext } from '../lessons/DemoContext'
import { PresentationOverlay } from '../lessons/PresentationOverlay'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta } from '../components/Contents'
import { Icon } from '../components/Icon'
import { MaterialNameContext } from '../components/MaterialNameContext'
import NotFound from '../pages/NotFound'

export default function MaterialPage() {
  const { slug } = useParams()
  const material = slug ? materialBySlug(slug) : undefined

  // Presentation mode (?present=<lessonSlug>). Hooks stay above the early
  // return; the current step lives only in this useState — nothing persists.
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

  if (!material) return <NotFound />

  const Component = material.component
  const strand = strandInfo(material.strand)
  const lessons = material.lessonSlugs.map((s) => lessonBySlug(s)).filter((l) => l !== undefined)
  const generators = material.worksheetSlugs.map((s) => generatorBySlug(s)).filter((g) => g !== undefined)
  const kits = kitsForMaterial(material.slug)

  const demoLessons = Object.keys(material.demos ?? {})
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

  const walkThroughs =
    demoLessons.length > 0
      ? demoLessons.map((l) => (
          <button
            key={l.slug}
            type="button"
            className="btn has-icon"
            onClick={() => openDemo(l.slug)}
            aria-pressed={presentSlug === l.slug}
          >
            <Icon name="play" />
            <span className="btn-label">Walk through: {l.name}</span>
          </button>
        ))
      : undefined

  // No wrapper element around <Component/>: its output (the shell, and the
  // control-chart print sheets of addition-charts and multiplication-charts)
  // must stay direct children of main.site-main, which those materials'
  // print-isolation rules select.
  return (
    <>
      <PageHeader
        title={material.name}
        meta={
          <>
            <AgeMeta ages={material.ages} grades={`grades ${material.grades}`} />
            <span className="badge badge-strand">{strand.name}</span>
          </>
        }
        lede={material.summary}
        actions={walkThroughs}
      />

      <DemoContext.Provider value={demoValue}>
        <MaterialNameContext.Provider value={material.name}>
          <Suspense fallback={<p>Loading material…</p>}>
            <Component />
          </Suspense>
        </MaterialNameContext.Provider>
      </DemoContext.Provider>

      <div className="material-notes">
        <section className="note-col" aria-labelledby="material-parents">
          <h2 id="material-parents">For parents</h2>
          <p>{material.parentNote}</p>
        </section>
        {kits.length > 0 && (
          <section className="note-col" aria-labelledby="material-kits">
            <h2 id="material-kits">Make the real thing</h2>
            <ul className="link-list">
              {kits.map((k) => (
                <li key={k.slug} className="link-row">
                  <Link className="link-row-title" to={`/kits/${k.slug}`}>
                    {k.name}
                  </Link>{' '}
                  — {k.description}
                  <span className="link-row-note">{k.pieces}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {(lessons.length > 0 || generators.length > 0) && (
        <div className="material-links">
          {lessons.length > 0 && (
            <section className="links-col" aria-labelledby="material-lessons">
              <h2 className="section-label" id="material-lessons">
                Lessons for this material
              </h2>
              <ul className="link-list">
                {lessons.map((l) => (
                  <li key={l.slug} className="link-row">
                    <Link className="link-row-title" to={`/lessons/${l.slug}`}>
                      {l.name}
                    </Link>{' '}
                    <span className="badge age">
                      ages {l.ages[0]}–{l.ages[1]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {generators.length > 0 && (
            <section className="links-col" aria-labelledby="material-printables">
              <h2 className="section-label" id="material-printables">
                Printable follow-up work
              </h2>
              <ul className="link-list">
                {generators.map((g) => (
                  <li key={g.slug} className="link-row">
                    <Link className="link-row-title" to={`/worksheets/${g.slug}`}>
                      {g.name}
                    </Link>{' '}
                    — {g.description}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

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
    </>
  )
}
```

Then append to `src/styles/materials.css`:

```css
/* ---------- Material page: notes and link lists under the plate ---------- */

.material-notes,
.material-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: var(--space-7);
  margin-top: var(--space-7);
}

.note-col {
  padding-top: var(--space-4);
  border-top: 1px solid var(--ink);
}

.note-col h2 {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-lede);
  font-weight: 500;
  line-height: 1.25;
}

.note-col p {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-read-sm);
}

/* Without a kit, "For parents" is the only note: its ink rule spans the
   plate's width and its text keeps the reading measure (S2-18). */
.material-notes > .note-col:only-child {
  grid-column: 1 / -1;
}

.material-notes > .note-col:only-child p {
  max-width: var(--measure);
}

.links-col > .section-label {
  margin: 0;
  padding: var(--space-4) 0 var(--space-2);
  border-top: 1px solid var(--ink);
  font: 700 var(--fs-caps) / 1.3 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink);
}

.link-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.link-row {
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--line);
  font-size: var(--fs-read-sm);
  line-height: 1.55;
  color: var(--ink);
}

/* inline-block + padding: a 44px tap target without a taller text line */
.link-row-title {
  display: inline-block;
  padding-block: 0.55rem;
  margin-block: -0.55rem;
  font-family: var(--font-text);
  font-size: var(--fs-body);
  font-weight: 500;
}

/* The focus ring hugs the title inside that padding, clear of the row's
   next line. The same padding on the sides (cancelled by the margin, so
   nothing moves) keeps it clear of the first and last letters. */
.link-row-title:focus-visible {
  padding-inline: 0.55rem;
  margin-inline: -0.55rem;
  outline-offset: -0.4rem;
}

.link-row .badge.age {
  margin-left: var(--space-2);
}

.link-row-note {
  display: block;
  margin-top: var(--space-1);
  font: 400 var(--fs-ui) / 1.45 var(--font-ui);
  color: var(--ink-soft);
}

@media (max-width: 760px) {
  .material-notes,
  .material-links {
    grid-template-columns: minmax(0, 1fr);
  }

  .note-col + .note-col,
  .links-col + .links-col {
    margin-top: var(--space-5);
  }
}

/* On phones the strand takes its own line under the age and grades, with no
   leading dot, so a long strand name never breaks in the middle. */
@media screen and (max-width: 640px) {
  .page-meta .badge-strand {
    display: block;
  }

  .page-meta .badge-strand::before {
    content: none;
  }
}
```

Three details were added in the Phase 4 review fixes:
- **A lone note spans the plate.** Only 7 of the 21 materials have a kit. On the other 14, "For parents" would sit alone in the left column, its rule and text stopping at mid-plate, narrower than the old 46rem card (S2-18). `:only-child` lets it span both columns, and its text keeps the 40rem measure.
- **The strand has its own line on phones.** The labelled grades (S4-24) push the strand past the line end at 390, and it broke mid-name on 15 of 21 materials ("PASSAGE" / "TO ABSTRACTION"). A `nowrap` strand would overflow instead, because there is no break opportunity between the grades and the strand's dot. So at ≤640px the strand is a block with no leading dot; wider screens are unchanged.
- **The title's focus ring hugs the title.** The 44px padding put the default ring (2px outside the padded box) through the row's next line. On focus the ring is drawn 0.4rem inside the padded box, and matching side padding, cancelled by the margin so nothing moves, keeps it off the first and last letters.

**Check:**
- The standard check (convention 12) passes.
- At 1400 on `/materials/golden-beads`:
  - The header reads `Golden Beads & Mat`, then `[AGES 4–7] GRADES PK–1 · THE DECIMAL SYSTEM`, then the 21px ink lede. "▶ Walk through: Golden Bead Addition" sits at the top right.
  - `document.title` is `Golden Beads & Mat · Montessori Math`.
  - Below the plate, "For parents" and "Make the real thing" start on the same ink rule. The right column ends flush with the plate's right edge (S2-18).
- On a material without a kit (for example `/materials/cards-and-counters` and `/materials/bead-frame`) at 1400, "For parents" stands alone: its ink rule runs from the plate's left edge to its right edge (166 to 1234), and its text keeps the 40rem measure (640px).
- At 390 on all 21 materials the strand sits on its own line under the age and grades, with no leading dot, and never breaks mid-name (`document.querySelector('.badge-strand').getClientRects().length` is `1`). At 820 and 1400 it follows the grades after a dot, as before.
- Tab to a kit or lesson title at 1400 and 390: the 3px focus ring hugs the title and does not touch the row's next line.
  - Each kit shows its piece count on its own grey sans line, with no nested parentheses.
- On `/materials/multiplication-charts` the meta reads `GRADES 1–3` (S4-24).
- These all hold:
  - `[...document.querySelectorAll('.link-row-title')].every((a) => a.getBoundingClientRect().height >= 44)` is `true`.
  - `document.querySelectorAll('.material-notes [style], .material-links [style], main > [style]').length` is `0`.
  - After opening "Print control charts" on `/materials/addition-charts`, `document.querySelector('main.site-main > .sheet-preview')` is not `null`, so the print-isolation rules still see the sheet as a child of `main`.
  - On `/materials/bead-chains`, choose "Hundred chain" and press "Show arrow labels": `document.querySelector('main.site-main > .bead-chains-long-wrap')` is not `null`. `bead-chains.css` hides every other child of `main` while the labels print, so a wrapper here would print a blank page.
- In print preview, "Print control charts" on `/materials/addition-charts` and `/materials/multiplication-charts`, and the Hundred and Thousand chains' arrow labels on `/materials/bead-chains`, each print only their sheet, non-blank, in colour and with "Ink-friendly B&W".
- At 760 both grids stack into one column.
- The Walk-through button opens the step card and shows `aria-pressed="true"`.

## Step 31 — The walk-through step card

**Files:** `src/styles/presentation.css` (modified). `src/lessons/PresentationOverlay.tsx` does not change.

The walk-through step card (PRD 11) is chrome that sits over the mat while a lesson is presented. After Step 6 it already has the new card stock through the re-pointed `--card`, but it keeps its 10px top corners and small shadow, because the legacy shape tokens `--radius` and `--shadow-md` are not re-pointed (Step 6: material pieces draw with them). Its title is still a bold wood-dark serif and its spoken line is rubric-dark italic, unlike the spoken lines on the lesson page (Step 33). This step finishes it as the prototype's §18 does (decision 23): an ink hairline with square corners, the soft sheet shadow (`--shadow-sheet`), a Newsreader title in ink, and the spoken line in ink with rubric quote marks. It also deletes `.presentation-launch`, which no markup uses after Step 30.

The card renders outside `.material-stage` (MaterialPage draws it after the notes), so its Previous, Next and Close buttons already get the chrome `.btn` from Step 9: card stock, and a rubric Next. Nothing in `PresentationOverlay.tsx` changes, and its "← Previous" and "Next →" text arrows are not emoji, so the guard test from Step 10 allows them.

The current lines 1–8 are:

```css
/* ---------- Presentation mode: lesson walk-through overlay ---------- */

.presentation-launch {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
```

Replace them with:

```css
/* ---------- Presentation mode: the lesson walk-through step card ----------
   PRD 11; re-skinned in PRD 19 (prototype §18): card stock under an ink
   hairline, a Newsreader title, and the spoken line in ink with rubric
   quote marks, as on the lesson page (album.css). The Walk-through launch
   buttons live in the material page's PageHeader. */
```

The current lines 10–25 are:

```css
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
```

Replace them with:

```css
.presentation-overlay {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: min(46rem, 100vw - 1rem);
  max-height: 45vh;
  overflow-y: auto;
  background: var(--card);
  border: 1px solid var(--ink);
  border-bottom: none;
  border-radius: 0;
  box-shadow: var(--shadow-sheet);
  padding: 0.9rem 1.2rem;
  z-index: 50;
}
```

The current lines 33–37 are:

```css
.presentation-title {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--wood-dark);
}
```

Replace them with:

```css
.presentation-title {
  font-family: var(--font-text);
  font-weight: 500;
  color: var(--ink);
}
```

The current lines 53–67 are:

```css
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
```

Replace them with:

```css
/* Mirrors .album .say (src/styles/album.css): italics + quotes, never color alone. */
.presentation-overlay .say {
  display: block;
  font-style: italic;
  color: var(--ink);
  margin: 0.25rem 0 0;
}

.presentation-overlay .say::before {
  content: '“';
}

.presentation-overlay .say::after {
  content: '”';
}

.presentation-overlay .say::before,
.presentation-overlay .say::after {
  font-style: normal;
  font-weight: 600;
  color: var(--accent);
}
```

`.presentation-head`, `.presentation-progress`, `.presentation-close`, `.presentation-text`, `.presentation-nav`, `.presentation-spacer` and the phone block stay as they are. The card adds no transition or animation.

**Measured contrast:**

| Element | Colours | Ratio |
| --- | --- | --- |
| Title, step text, spoken line | ink on card | 15.54:1 |
| Quote marks | rubric on card | 6.82:1 |
| "Step 1 of 9" | ink-soft on card | 7.20:1 |
| Card edge against the page | ink on paper | 14.04:1 |

**Check:**
- `npm run build` is green, and `grep -rn "presentation-launch" src` prints nothing.
- At 1400 and at 390, open `/materials/golden-beads?present=golden-beads-addition`. The card has a 1px ink edge on its top and sides, square corners and the soft sheet shadow. The title "Golden Bead Addition" is Newsreader 500 in ink. The spoken line "First we lay out one thousand two hundred thirty-four." is italic ink with rubric quote marks. Previous is card stock with an ink edge, Next is rubric, and Close is card stock; all three are 44px tall.
- Press Next until the card reads "Step 9 of 9", then Previous three times: the mat shows exactly the state PRD 11's QA script describes for its step 6.
- Print preview on the same URL: the card does not appear.
