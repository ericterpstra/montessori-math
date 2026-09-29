# PRD 19 · Phase 6 — Builder, kits and planner

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Steps 39–41. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


The three tool pages get the PageHeader with their actions at the top right, a labelled settings panel, and the printable preview on the desk. Their printed output must not change: the print gate PASSes after every step. This phase depends only on Phases 1–3, so it can move ahead of Phase 5 (see [Rollout](../19-the-album.md#rollout)).

## Step 39 — The worksheet builder

**Files:** `src/worksheets/BuilderPage.tsx` (full file below, written against post-fix `dbe71b6`), `src/styles/worksheets.css` (replace current lines 1–58).

Today the title, badges and intro sit in a bare `div.no-print` (main lines 112–119; post-fix 144–151). New problems and Print sit at the bottom of a 900px form (main 169–174; post-fix 201–206), below the fold (S8-09). The form is a white `.card` fixed at 320px, too narrow for long option labels (S6-15). Every browser tab reads the same (S9-23).

This step makes these changes:

- **A PageHeader** carries the title, `docTitle` `"<name> worksheet"`, the meta line (the boxed age via `AgeMeta`, and the strand), the lede, and **New problems + rubric Print in the action slot**. The Print button ends at y = 152 at 1400×900.
- **A labelled panel.**
  - `aside.builder-form.panel` has `aria-labelledby` pointing at its `h2.panel-label` "Sheet settings".
  - The fields sit in a `.field-grid`: one column in a 21rem panel on desktop (was 320px incl. padding; now 336px of field), and two columns at 641–900px.
  - Every label's text is wrapped in `.field-label`.
- **The desk.** `<SheetPreview bw={bw} desk>`.
- **The preset help line** no longer disappears when a field is edited, which today makes the form jump about 84px under the pointer (S6-19). After an edit it reads `Based on “Two-digit divisors”, with your changes. <description>`.
- **Unchanged:** `NumberField` (from `477ac70`), the seed pinning, `update()`, the preset select's handler, and every generator.

Current main lines 21–27 (the checkbox field; same lines post-fix):

```tsx
  if (field.kind === 'boolean') {
    return (
      <label className="field checkbox">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {field.label}
        {field.help && <span className="field-help">{field.help}</span>}
      </label>
    )
```

In the select field (main lines 31–32) and the number field (main 45–46; post-fix `NumberField` 72–73), `{field.label}` sits bare after `<label className="field">`.

Current main lines 110–122 (post-fix 142–154) open the page:

```tsx
  return (
    <div className="builder">
      <div className="no-print">
        <h1>{def.name}</h1>
        <p>
          <span className="badge age">ages {def.ages[0]}–{def.ages[1]}</span>
          <span className="badge">{strandInfo(def.strand).name}</span>
        </p>
        <p className="page-intro">{def.description}</p>
      </div>

      <div className="builder-layout">
        <aside className="builder-form card no-print">
```

Main lines 160–186 (post-fix 192–218) hold the two view checkboxes, the actions and the preview:

```tsx
          <label className="field checkbox">
            <input type="checkbox" checked={bw} onChange={(e) => update({ bw: e.target.checked ? '1' : '0' })} />
            Ink-friendly black &amp; white
          </label>
          <label className="field checkbox">
            <input type="checkbox" checked={showKey} onChange={(e) => update({ key: e.target.checked ? '1' : '0' })} />
            Include answer key page
          </label>

          <div className="builder-actions">
            <button type="button" className="btn" onClick={() => update({ seed: String(randomSeed()) })}>
              🎲 New problems
            </button>
            <PrintButton />
          </div>
          <p className="field-help">
            Seed {seed} — this exact sheet can be reprinted from this page's URL. Practice happens on paper: print it,
            don't screen it. <Link to="/parents/using-this-site">Printing tips</Link>
          </p>
        </aside>

        <div className="builder-preview">
          <SheetPreview bw={bw}>
```

(After Step 10 the button reads `<Icon name="refresh" /><span className="btn-label">New problems</span>`.)

Replace the whole of `src/worksheets/BuilderPage.tsx` with the file below. It already contains Step 10's icon change and the post-fix `NumberField`.

- **If the fix's `NumberField` differs from the version below when you apply this,** keep the fix's version and change only its label line to `<span className="field-label">{field.label}</span>`.
- **If `477ac70` has not landed yet,** stop and wait for it. Don't reintroduce the clamping input.

```tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { generatorBySlug } from './registry'
import type { ParamField } from './types'
import { commitNumber, draftNumber, resolveParams } from './params'
import { createRng, randomSeed } from '../lib/rng'
import { strandInfo } from '../lib/strands'
import { PrintButton } from '../components/PrintButton'
import { SheetPreview } from '../components/SheetPreview'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta } from '../components/Contents'
import NotFound from '../pages/NotFound'

function Field({
  field,
  value,
  onChange,
}: {
  field: ParamField
  value: number | string | boolean
  onChange: (v: number | string | boolean) => void
}) {
  if (field.kind === 'boolean') {
    return (
      <label className="field checkbox">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span className="field-label">{field.label}</span>
        {field.help && <span className="field-help">{field.help}</span>}
      </label>
    )
  }
  if (field.kind === 'select') {
    return (
      <label className="field">
        <span className="field-label">{field.label}</span>
        <select value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {field.help && <span className="field-help">{field.help}</span>}
      </label>
    )
  }
  return <NumberField field={field} value={Number(value)} onChange={onChange} />
}

/**
 * Holds the typed text as a draft so a keystroke is never clamped mid-number
 * ("2" on the way to "25" in a 10–60 field). In-range values apply live; the
 * clamp happens on blur or Enter. resolveParams still clamps whatever the URL says.
 */
function NumberField({
  field,
  value,
  onChange,
}: {
  field: Extract<ParamField, { kind: 'number' }>
  value: number
  onChange: (v: number) => void
}) {
  // null = not editing, so the input mirrors the sheet (and follows preset changes).
  const [draft, setDraft] = useState<string | null>(null)

  function commit() {
    if (draft === null) return
    const n = commitNumber(draft, field.min, field.max)
    if (n !== null && n !== value) onChange(n)
    setDraft(null)
  }

  return (
    <label className="field">
      <span className="field-label">{field.label}</span>
      <input
        type="number"
        value={draft ?? String(value)}
        min={field.min}
        max={field.max}
        step={field.step ?? 1}
        onChange={(e) => {
          setDraft(e.target.value)
          const n = draftNumber(e.target.value, field.min, field.max)
          if (n !== null && n !== value) onChange(n)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
      />
      {field.help && <span className="field-help">{field.help}</span>}
    </label>
  )
}

export default function BuilderPage() {
  const { slug } = useParams()
  const def = slug ? generatorBySlug(slug) : undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const fallbackSeed = useMemo(() => randomSeed(), [])

  const rawSeed = searchParams.get('seed')
  const seed = rawSeed !== null && !Number.isNaN(Number(rawSeed)) ? Number(rawSeed) : fallbackSeed
  const params = def ? resolveParams(def, searchParams) : {}
  const bw = searchParams.get('bw') === '1'
  const showKey = searchParams.get('key') !== '0'

  const paramsKey = JSON.stringify(params)
  const data = useMemo(
    () => (def ? def.generate(params, createRng(seed)) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params identity tracked via paramsKey
    [def, paramsKey, seed],
  )

  // Pin the seed into the URL on the first visit. Without this the page's own
  // promise — that this exact sheet reprints from its URL — is false until some
  // control is touched, and a reload or a shared link gives different problems.
  useEffect(() => {
    if (!def || rawSeed !== null) return
    const next = new URLSearchParams(searchParams)
    next.set('seed', String(seed))
    setSearchParams(next, { replace: true })
  }, [def, rawSeed, seed, searchParams, setSearchParams])

  if (!def) return <NotFound />

  // The select reflects the ?preset= param only until any individual field is
  // changed on top of it (at which point the sheet is custom again).
  const presetParam = searchParams.get('preset')
  const overridden = def.schema.some((f) => searchParams.get(f.key) !== null)
  const activePreset = !overridden && presetParam && def.presets.some((p) => p.id === presetParam) ? presetParam : ''
  // The help line under the select never disappears while a preset is the
  // starting point, so the form doesn't jump when a field is edited (S6-19).
  const basePreset = def.presets.find((p) => p.id === presetParam)
  const presetHelp = basePreset
    ? activePreset
      ? basePreset.description
      : `Based on “${basePreset.name}”, with your changes. ${basePreset.description}`
    : undefined

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    next.set('seed', String(seed))
    for (const [k, v] of Object.entries(patch)) next.set(k, v)
    setSearchParams(next, { replace: true })
  }

  const { Sheet, AnswerKey } = def

  return (
    <div className="builder">
      <PageHeader
        className="no-print"
        title={def.name}
        docTitle={`${def.name} worksheet`}
        meta={
          <>
            <AgeMeta ages={def.ages} />
            <span className="badge">{strandInfo(def.strand).name}</span>
          </>
        }
        lede={def.description}
        actions={
          <>
            <button type="button" className="btn has-icon" onClick={() => update({ seed: String(randomSeed()) })}>
              <Icon name="refresh" />
              <span className="btn-label">New problems</span>
            </button>
            <PrintButton />
          </>
        }
      />

      <div className="builder-layout">
        <aside className="builder-form panel no-print" aria-labelledby="sheet-settings">
          <h2 className="panel-label" id="sheet-settings">
            Sheet settings
          </h2>
          <div className="field-grid">
            {def.presets.length > 0 && (
              <label className="field">
                <span className="field-label">Preset</span>
                <select
                  value={activePreset}
                  onChange={(e) => {
                    if (e.target.value === '') return
                    // Drop the per-field overrides so the preset's params win, but
                    // keep the view toggles — picking a preset must not silently
                    // undo an ink-friendly or hide-the-key choice.
                    const next = new URLSearchParams(searchParams)
                    for (const f of def.schema) next.delete(f.key)
                    next.set('preset', e.target.value)
                    next.set('seed', String(seed))
                    setSearchParams(next, { replace: true })
                  }}
                >
                  <option value="">Choose a preset…</option>
                  {def.presets.map((p) => (
                    <option key={p.id} value={p.id} title={p.description}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {presetHelp && <span className="field-help">{presetHelp}</span>}
              </label>
            )}

            {def.schema.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={params[field.key]}
                onChange={(v) => update({ [field.key]: typeof v === 'boolean' ? (v ? '1' : '0') : String(v) })}
              />
            ))}

            <label className="field checkbox">
              <input type="checkbox" checked={bw} onChange={(e) => update({ bw: e.target.checked ? '1' : '0' })} />
              <span className="field-label">Ink-friendly black &amp; white</span>
            </label>
            <label className="field checkbox">
              <input
                type="checkbox"
                checked={showKey}
                onChange={(e) => update({ key: e.target.checked ? '1' : '0' })}
              />
              <span className="field-label">Include answer key page</span>
            </label>
          </div>
          <p className="panel-note">
            Seed {seed} — this exact sheet can be reprinted from this page's URL. Practice happens on paper: print it,
            don't screen it. <Link to="/parents/using-this-site">Printing tips</Link>
          </p>
        </aside>

        <div className="builder-preview">
          <SheetPreview bw={bw} desk>
            <Sheet data={data} params={params} />
            {showKey && <AnswerKey data={data} params={params} />}
          </SheetPreview>
        </div>
      </div>
    </div>
  )
}
```

**`src/styles/worksheets.css`.** Replace current lines 1–58, from `/* ---------- Worksheet builder layout ---------- */` through the closing `}` of `@media print { .builder-layout { display: block; } }`. That removes `.builder-layout`, `.builder-preview`, the dead `.builder-form .preset-row` (no markup uses it), `.builder-actions`, and the lines Step 16 already removed. Put this in their place; Step 17's desk block follows it:

```css
/* ---------- Worksheet builder and kit pages: screen chrome ----------
   PRD 19. The PageHeader carries the page's actions; a settings panel sits
   on the left and the printable sheets lie on a desk on the right. Nothing
   in this block reaches paper except the one print rule below, which only
   un-grids the layout, exactly as before. */

.builder > .page-header {
  margin-bottom: var(--space-6);
}

.builder-layout {
  display: grid;
  grid-template-columns: 21rem minmax(0, 1fr);
  gap: var(--space-7);
  align-items: start;
}

.builder-preview {
  min-width: 0;
  overflow-x: auto;
}

@media (max-width: 900px) {
  .builder-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
  }
}

@media print {
  .builder-layout {
    display: block;
  }
}

/* Kit panel prose: the piece list and the numbered assembly steps. */
.panel-text {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-read-sm);
  line-height: 1.5;
}

.panel-steps {
  margin: 0;
  padding-left: 1.5rem;
  font-size: var(--fs-read-sm);
  line-height: 1.5;
}

.panel-steps > li + li {
  margin-top: var(--space-2);
}

/* Rubric only decorates numbers that are already numbers. */
.panel-steps > li::marker {
  font-family: var(--font-text);
  font-style: italic;
  color: var(--accent);
}

.panel-steps + .field-grid {
  margin-top: var(--space-5);
}

/* "For use with: Golden Beads, Stamp Game" under a kit's lede. */
.page-forwith {
  margin: var(--space-3) 0 0;
  font: 400 var(--fs-ui) / 1.5 var(--font-ui);
  color: var(--ink-soft);
}
```

The only print rule, `@media print { .builder-layout { display: block } }`, is unchanged. `.builder-actions` is gone because its buttons moved into the PageHeader.

**Check:**
- `npm run build` is green, and the print gate PASSes.
- **1400×900, `/worksheets/multi-digit-ops`:**
  - The title "Multi-Digit Operations", `[AGES 5–9] PASSAGE TO ABSTRACTION`, the ink lede, and New problems (card stock, refresh glyph) + Print (rubric, print glyph) sit top right, with Print's bottom under y = 160.
  - "SHEET SETTINGS" in ink capitals sits under a 2px ink rule.
  - The Letter pages lie on the desk with a soft shadow, and the answer key is a separate sheet 0.375in (before zoom) below.
  - `document.title` is `Multi-Digit Operations worksheet · Montessori Math`.
- **New problems** changes every problem and the seed in the URL. Print opens the print dialog.
- **The preset line:** choose "Choose a preset…" › any preset; its description appears. Change "Problems": the line now begins `Based on “…”, with your changes.` and the form does not jump up.
- **`/worksheets/fractions` at 1400:** the "Problem type" select shows "Name the fraction (picture → fraction)" in full. Run this check with the real MM Sans. If it still clips, record it for PRD 20 (shorten the option label).
- **At 820:** the fields sit in two columns, and New problems and Print are still at the top right.
- **At 390:** they sit under the lede. `document.documentElement.scrollWidth === innerWidth`.
- **Keyboard:** Tab order runs New problems, Print, Preset, … Include answer key page, Printing tips, and every control shows the 3px blue ring.
- **Screen reader:** each checkbox is named by its label and help, as today.
- `grep -n 'style={{\|builder-actions\|className="card' src/worksheets/BuilderPage.tsx` prints nothing.

## Step 40 — Kit pages

**Files:** `src/kits/KitPage.tsx` (full file below). `src/kits/kits.css` is unchanged.

Today the page is the builder's twin, with the same problems:
- the title and intro sit in a bare `div.no-print` (lines 27–39), and Print is buried in the sidebar (lines 62–64);
- the sidebar labels use inline styles (lines 43, 46, 48, 51: `style={{ margin: 0 }}`, `style={{ marginTop: '0.25rem' }}`, `style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}`);
- the tab title is generic.

The kit gets the builder's anatomy:
- a PageHeader with Print in the action slot, `docTitle` `"<name> kit"`, and "For use with: …" as a `.page-forwith` line under the lede;
- a panel with two `panel-label` heads, "In this kit" (the piece list as `.panel-text`) and "Assembly" (an `ol.panel-steps` whose numerals are italic rubric);
- the B&W checkbox in a `.field-grid`, and the printing tip as `.panel-note`;
- the pages on the desk.

The kit page chrome rules live with the builder's, in `worksheets.css` (Step 39: `.panel-text`, `.panel-steps`, `.page-forwith`), not in `kits.css`, for two reasons:
- `kits.css` holds only printed-piece rules, and leaving it byte-identical is the simplest proof they didn't change;
- `KitPage.tsx` imports it, and the audit found that CSS imported by page modules lands *before* the global sheets in the bundle (S6-01), so a chrome rule there would lose ties on order.

Current lines 25–42:

```tsx
  return (
    <div className="builder">
      <div className="no-print">
        <h1>{kit.name}</h1>
        <p className="page-intro">{kit.description}</p>
        <p>
          For use with:{' '}
          {kit.forMaterials.map((s, i) => (
            <span key={s}>
              {i > 0 && ', '}
              <Link to={`/materials/${s}`}>{materialBySlug(s)?.name ?? s}</Link>
            </span>
          ))}
        </p>
      </div>

      <div className="builder-layout">
        <aside className="builder-form card no-print">
```

Replace the whole of `src/kits/KitPage.tsx` with:

```tsx
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { kitBySlug } from './registry'
import { materialBySlug } from '../materials/registry'
import { PageHeader } from '../components/PageHeader'
import { PrintButton } from '../components/PrintButton'
import { SheetPreview } from '../components/SheetPreview'
import NotFound from '../pages/NotFound'
import './kits.css'

export default function KitPage() {
  const { slug } = useParams()
  const kit = slug ? kitBySlug(slug) : undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const bw = searchParams.get('bw') === '1'

  if (!kit) return <NotFound />

  const setBw = (checked: boolean) => {
    const next = new URLSearchParams(searchParams)
    next.set('bw', checked ? '1' : '0')
    setSearchParams(next, { replace: true })
  }

  const Pages = kit.Pages

  return (
    <div className="builder">
      <PageHeader
        className="no-print"
        title={kit.name}
        docTitle={`${kit.name} kit`}
        lede={kit.description}
        actions={<PrintButton />}
      >
        <p className="page-forwith">
          For use with:{' '}
          {kit.forMaterials.map((s, i) => (
            <span key={s}>
              {i > 0 && ', '}
              <Link to={`/materials/${s}`}>{materialBySlug(s)?.name ?? s}</Link>
            </span>
          ))}
        </p>
      </PageHeader>

      <div className="builder-layout">
        <aside className="builder-form panel no-print" aria-label="Kit contents and settings">
          <h2 className="panel-label">In this kit</h2>
          <p className="panel-text">{kit.pieces}</p>

          <h2 className="panel-label">Assembly</h2>
          <ol className="panel-steps">
            {kit.assembly.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <div className="field-grid">
            <label className="field checkbox">
              <input type="checkbox" checked={bw} onChange={(e) => setBw(e.target.checked)} />
              <span className="field-label">Ink-friendly black &amp; white</span>
            </label>
          </div>
          <p className="panel-note">
            Print at 100% scale on cardstock and check the 1-inch square on page 1 before cutting.{' '}
            <Link to="/parents/using-this-site">Printing tips</Link>
          </p>
        </aside>

        <div className="builder-preview">
          <SheetPreview bw={bw} desk>
            <Pages />
          </SheetPreview>
        </div>
      </div>
    </div>
  )
}
```

The kit preview still opens on the calibration page, because print order is unchanged. Showing a piece page first on screen needs owner approval (PRD 20).

**Check:**
- `npm run build` is green, and the print gate PASSes. All 7 kits, in colour and `bw=1`, are covered.
- **`/kits/golden-bead-cards` at 1400:**
  - The title, lede and "For use with: Golden Beads & Mat" are at the left, and the rubric Print is at the top right.
  - The panel shows "IN THIS KIT", the piece list, "ASSEMBLY" and four steps with italic rubric numerals, then the B&W checkbox and the printing tip.
  - The pages lie on the desk.
- The B&W checkbox toggles `?bw=1`, and the preview goes black and white.
- `document.title` is `Golden Bead Cards kit · Montessori Math`.
- `grep -n 'style={{' src/kits/KitPage.tsx` prints nothing.
- `git diff --stat src/kits/kits.css` is empty.
- At 390 and 820 there is no sideways scroll.

## Step 41 — The planner

**Files:**
- `src/planner/PlannerPage.tsx` (full file below);
- `src/styles/planner.css` (replace current lines 1–21);
- `src/planner/state.ts` (two imports and one function added);
- `src/planner/state.test.ts` (one import changed, one `describe` appended).

Today:
- at 390 the rows can't wrap, so names squeeze to one word per line and the page scrolls 88px sideways (S1-02);
- at ≤900px the shelf, with Print on it, drops about 4,000px below the picker (S1-14);
- the date input is unstyled (S1-11), and disabled selects fade to 45%;
- preset selects zig-zag and are 38px tall (S1-13);
- strand heads hug the row above (S1-12);
- shelf days float mid-row (S1-10);
- Clear week wraps alone (S1-26), and "Copied" shifts its neighbours (S9-30);
- an empty plan still offers Print, which prints a blank page (S9-05).

This step makes these changes:

- **PageHeader** with title "Plan the week", `docTitle` "Weekly plan", and the existing lede. It has no actions: the shelf is the page's tool.
- **The shelf** is an `aside.planner-shelf.panel.panel-warm`: paper-warm, under a 2px ink rule, first in the DOM. It holds:
  - the serif heading "This week's shelf";
  - a styled "Week of (optional)" field, capped at 20rem;
  - the item list as a three-column grid (name + kind | day | remove). The name and kind are one ≥44px link, the day has a fixed right-aligned column, and remove is a 44px icon button;
  - the B&W checkbox;
  - the actions, **only once something is picked**: Print full width, then Copy link and Clear week in fixed halves;
  - a `role="status"` line that announces "Link copied."
- **The picker** is three `section.planner-group`s ("LESSONS", "WORKSHEETS", "MATERIALS") with real `h2.section-label`s. Each is grouped under strand `h3`s by the new pure `groupByStrand`.
  - Rows are ruled, the names serif, and the preset and day selects have fixed widths (12.5rem and 8.5rem) so they line up.
  - At ≤560px the selects drop under the name.
  - Disabled selects are dashed, not faded.
- **The preview** lies on the desk. Its 2rem top margin is kept for print, because it sets where the plan starts on paper; the screen gets `--space-7`. `ParentPlanPage` and `JournalPage` are unchanged.

Current lines 62–77 (the picker row):

```tsx
  return (
    <div className="planner-row">
      <label>
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        <span className="planner-row-name">{name}</span>
      </label>
      {presetControl}
      <select aria-label={`Day for ${name}`} value={day ?? ''} disabled={!checked} onChange={(e) => onDay(e.target.value)}>
```

Current lines 237–250 and 286–293 (header, layout, shelf):

```tsx
  return (
    <div className="planner">
      <div className="no-print">
        <h1>Plan the week</h1>
        <p className="page-intro">
          …
        </p>
      </div>

      <div className="planner-layout no-print">
        <div>
          <p className="section-label">Lessons</p>
          …
        </div>

        <aside className="card planner-shelf">
          <h2>This week's shelf</h2>
          <label className="field">
            Week of (optional)
            <input type="date" value={plan.weekOf ?? ''} onChange={(e) => setWeekOf(e.target.value)} />
          </label>
```

Current lines 339–350 (the preview):

```tsx
      <div className="planner-preview">
        {plan.items.length > 0 ? (
          <SheetPreview bw={bw}>
            …
          </SheetPreview>
        ) : (
          <p className="no-print">Check a few items above and the printable plan and journal will preview here.</p>
        )}
      </div>
```

**`src/planner/state.ts`.** At the top of the file, before line 6 (`export const DAYS = …`), add:

```ts
import { STRANDS } from '../lib/strands'
import type { StrandId, StrandInfo } from '../lib/strands'

```

After the last line (105, the closing `}` of `chunkJournal`), append:

```ts
/**
 * The planner's picker groups: every strand that has at least one of `items`,
 * in curriculum order, each holding its items in their original order.
 */
export function groupByStrand<T extends { strand: StrandId }>(
  items: readonly T[],
  strands: readonly StrandInfo[] = STRANDS,
): { strand: StrandInfo; items: T[] }[] {
  return strands
    .map((strand) => ({ strand, items: items.filter((item) => item.strand === strand.id) }))
    .filter((group) => group.items.length > 0)
}
```

**`src/planner/state.test.ts`.** Replace lines 5–6:

```ts
import { chunkJournal, parsePlan, serializePlan } from './state'
import type { PlanItem, PlanValidity } from './state'
```

with:

```ts
import { chunkJournal, groupByStrand, parsePlan, serializePlan } from './state'
import type { PlanItem, PlanValidity } from './state'
import type { StrandId } from '../lib/strands'
```

and append after the last line (132):

```ts
describe('groupByStrand', () => {
  /** Every item lands in exactly one group, and groups follow strand order. */
  const everyItemOnce = (list: readonly { strand: StrandId }[]) => {
    const groups = groupByStrand(list)
    const flat = groups.flatMap((g) => g.items)
    expect(flat).toHaveLength(list.length)
    expect(new Set(flat)).toEqual(new Set(list))
    const orders = groups.map((g) => g.strand.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  }

  it('shows every lesson, worksheet and material once, in strand order', () => {
    everyItemOnce(LESSONS)
    everyItemOnce(GENERATORS)
    everyItemOnce(MATERIALS)
  })

  it('skips empty strands and keeps item order inside a strand', () => {
    const items = [
      { strand: 'fractions' as const, n: 1 },
      { strand: 'numbers-to-10' as const, n: 2 },
      { strand: 'fractions' as const, n: 3 },
    ]
    expect(groupByStrand(items).map((g) => [g.strand.id, g.items.map((i) => i.n)])).toEqual([
      ['numbers-to-10', [2]],
      ['fractions', [1, 3]],
    ])
  })
})
```

Replace the whole of `src/planner/PlannerPage.tsx` with the file below. It already contains Step 10's Copy link icon change.

```tsx
import { Fragment, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LESSONS, lessonBySlug } from '../lessons/registry'
import { GENERATORS, generatorBySlug } from '../worksheets/registry'
import { MATERIALS, materialBySlug } from '../materials/registry'
import { PrintButton } from '../components/PrintButton'
import { SheetPreview } from '../components/SheetPreview'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { BeadBar } from '../components/beads'
import { DAYS, DAY_LABELS, chunkJournal, groupByStrand, parsePlan, serializePlan } from './state'
import type { Day, Plan, PlanItem, PlanValidity } from './state'

const KIND_LABELS: Record<PlanItem['kind'], string> = {
  lesson: 'Lesson',
  sheet: 'Worksheet',
  material: 'Material',
}

function shortDay(day: Day): string {
  return DAY_LABELS[day].slice(0, 3)
}

function itemName(item: PlanItem): string {
  if (item.kind === 'lesson') return lessonBySlug(item.slug)?.name ?? item.slug
  if (item.kind === 'sheet') return generatorBySlug(item.slug)?.name ?? item.slug
  return materialBySlug(item.slug)?.name ?? item.slug
}

function itemHref(item: PlanItem): string {
  if (item.kind === 'lesson') return `/lessons/${item.slug}`
  if (item.kind === 'sheet') return `/worksheets/${item.slug}${item.presetId ? `?preset=${item.presetId}` : ''}`
  return `/materials/${item.slug}`
}

function presetName(item: PlanItem): string | undefined {
  if (item.kind !== 'sheet' || !item.presetId) return undefined
  return generatorBySlug(item.slug)?.presets.find((p) => p.id === item.presetId)?.name
}

/** Format YYYY-MM-DD without UTC-parse pitfalls (split, never Date.parse). */
function formatWeekOf(weekOf: string): string {
  const [y, m, d] = weekOf.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function PickerRow({
  name,
  checked,
  day,
  onToggle,
  onDay,
  presetControl,
}: {
  name: string
  checked: boolean
  day: Day | undefined
  onToggle: (on: boolean) => void
  onDay: (day: string) => void
  presetControl?: ReactNode
}) {
  return (
    <div className="planner-row">
      <label className="planner-pick">
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        <span className="planner-row-name">{name}</span>
      </label>
      <span className="planner-row-controls">
        {presetControl}
        <select
          className="planner-day"
          aria-label={`Day for ${name}`}
          value={day ?? ''}
          disabled={!checked}
          onChange={(e) => onDay(e.target.value)}
        >
          <option value="">Any day</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {DAY_LABELS[d]}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}

function ParentPlanPage({ plan }: { plan: Plan }) {
  const groups: { label: string; items: PlanItem[] }[] = []
  for (const d of DAYS) {
    const items = plan.items.filter((i) => i.day === d)
    if (items.length > 0) groups.push({ label: DAY_LABELS[d], items })
  }
  const anyDay = plan.items.filter((i) => !i.day)
  if (anyDay.length > 0) groups.push({ label: 'Any day', items: anyDay })

  return (
    <section className="sheet-page">
      <div className="sheet-header">
        <p className="sheet-title">Weekly work plan</p>
        <span className="name-date">
          Week of {plan.weekOf ? formatWeekOf(plan.weekOf) : <span className="blank" />}
        </span>
      </div>
      <table className="plan-table">
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.label}>
              <tr>
                <td className="plan-day-heading" colSpan={3}>
                  {group.label}
                </td>
              </tr>
              {group.items.map((item, i) => (
                <tr key={i}>
                  <td>{itemName(item)}</td>
                  <td>
                    <span className="plan-badge">{KIND_LABELS[item.kind]}</span>
                  </td>
                  <td>{presetName(item) ? <span className="plan-preset">{presetName(item)}</span> : null}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
      <p className="plan-footnote">Nothing about this plan is stored — bookmark this page's URL to keep it.</p>
    </section>
  )
}

function JournalPage({ page, pageIndex }: { page: PlanItem[]; pageIndex: number }) {
  return (
    <section className="sheet-page">
      <h2 className="journal-title">My Work</h2>
      {pageIndex === 0 ? (
        <p className="journal-name-line">
          <span className="name-date">
            Name <span className="blank" />
          </span>
        </p>
      ) : (
        <p className="journal-continued">(continued)</p>
      )}
      {page.map((item, i) => (
        <div className="journal-row" key={i}>
          <span className="journal-check" aria-hidden="true" />
          <span className="journal-item-name">{itemName(item)}</span>
          {item.day && <span className="journal-day">{shortDay(item.day)}</span>}
        </div>
      ))}
      <div className="journal-footer">
        <BeadBar n={10} beadSize={26} />
      </div>
    </section>
  )
}

export default function PlannerPage() {
  const valid: PlanValidity = useMemo(
    () => ({
      lessons: new Set(LESSONS.map((l) => l.slug)),
      sheets: new Set(GENERATORS.map((g) => g.slug)),
      presets: new Map(GENERATORS.map((g) => [g.slug, new Set(g.presets.map((p) => p.id))])),
      materials: new Set(MATERIALS.map((m) => m.slug)),
    }),
    [],
  )

  // Single source of truth: parse the plan from the URL on every render and
  // write every change straight back. No React state duplicates the plan.
  const [searchParams, setSearchParams] = useSearchParams()
  const plan = parsePlan(searchParams, valid)
  const bw = searchParams.get('bw') === '1'

  const write = (next: Plan, nextBw = bw) => {
    const qs = serializePlan(next)
    setSearchParams(qs + (nextBw ? `${qs ? '&' : ''}bw=1` : ''), { replace: true })
  }

  // Ephemeral UI only — not plan data.
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

  const isChecked = (kind: PlanItem['kind'], slug: string) =>
    plan.items.some((i) => i.kind === kind && i.slug === slug)

  const firstItem = (kind: PlanItem['kind'], slug: string) =>
    plan.items.find((i) => i.kind === kind && i.slug === slug)

  const toggle = (kind: PlanItem['kind'], slug: string, on: boolean) => {
    const items = on
      ? [...plan.items, { kind, slug }]
      : plan.items.filter((i) => !(i.kind === kind && i.slug === slug))
    write({ ...plan, items })
  }

  /** Replace the first kind+slug match, rebuilding the item without undefined-valued keys. */
  const editFirst = (kind: PlanItem['kind'], slug: string, patch: { day?: string; presetId?: string }) => {
    const idx = plan.items.findIndex((i) => i.kind === kind && i.slug === slug)
    if (idx === -1) return
    const old = plan.items[idx]
    const next: PlanItem = { kind: old.kind, slug: old.slug }
    const presetId = 'presetId' in patch ? patch.presetId : old.presetId
    const day = 'day' in patch ? patch.day : old.day
    if (kind === 'sheet' && presetId) next.presetId = presetId
    if (day && (DAYS as readonly string[]).includes(day)) next.day = day as Day
    write({ ...plan, items: plan.items.map((i, j) => (j === idx ? next : i)) })
  }

  const removeAt = (index: number) => {
    write({ ...plan, items: plan.items.filter((_, i) => i !== index) })
  }

  const setWeekOf = (value: string) => {
    write(value ? { items: plan.items, weekOf: value } : { items: plan.items })
  }

  const renderRow = (kind: PlanItem['kind'], slug: string, name: string, presetControl?: ReactNode) => {
    const checked = isChecked(kind, slug)
    return (
      <PickerRow
        key={slug}
        name={name}
        checked={checked}
        day={firstItem(kind, slug)?.day}
        onToggle={(on) => toggle(kind, slug, on)}
        onDay={(day) => editFirst(kind, slug, { day })}
        presetControl={presetControl}
      />
    )
  }

  const journalPages = chunkJournal(plan.items)
  const hasItems = plan.items.length > 0

  return (
    <div className="planner">
      <PageHeader
        className="no-print"
        title="Plan the week"
        docTitle="Weekly plan"
        lede={
          <>
            Pick lessons, worksheets, and materials for the week, then print two pages: a parent plan and a "My Work"
            journal your child checks off in pencil as work is finished. The whole plan lives in this page's URL —
            bookmark it or copy the link to keep it. Nothing is stored anywhere.
          </>
        }
      />

      <div className="planner-layout no-print">
        {/* The shelf comes first in reading order: on a tablet or phone it sits
            above the long picker, with Print in reach (S1-14). */}
        <aside className="planner-shelf panel panel-warm" aria-labelledby="planner-shelf-title">
          <h2 className="planner-shelf-title" id="planner-shelf-title">
            This week&rsquo;s shelf
          </h2>
          <label className="field">
            <span className="field-label">Week of (optional)</span>
            <input type="date" value={plan.weekOf ?? ''} onChange={(e) => setWeekOf(e.target.value)} />
          </label>
          {hasItems ? (
            <ul className="planner-shelf-list">
              {plan.items.map((item, i) => {
                const name = itemName(item)
                return (
                  <li key={`${item.kind}-${item.slug}-${i}`}>
                    <Link className="planner-shelf-item" to={itemHref(item)}>
                      <span className="planner-shelf-name">{name}</span>
                      <span className="planner-shelf-kind">{KIND_LABELS[item.kind]}</span>
                    </Link>
                    <span className="planner-shelf-day">{item.day ? shortDay(item.day) : ''}</span>
                    <button
                      type="button"
                      className="planner-remove"
                      aria-label={`Remove ${name}`}
                      onClick={() => removeAt(i)}
                    >
                      <Icon name="close" />
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="planner-empty">Nothing picked yet — check lessons, worksheets, and materials in the lists.</p>
          )}
          <label className="field checkbox">
            <input type="checkbox" checked={bw} onChange={(e) => write(plan, e.target.checked)} />
            <span className="field-label">Ink-friendly black &amp; white</span>
          </label>
          {/* Nothing to print, copy or clear until something is picked (S9-05). */}
          {hasItems && (
            <div className="planner-actions">
              <PrintButton />
              <button type="button" className="btn has-icon" onClick={copyLink}>
                <Icon name="link" />
                <span className="btn-label">{copied ? 'Copied' : 'Copy link'}</span>
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (window.confirm('Clear this plan?')) setSearchParams('', { replace: true })
                }}
              >
                Clear week
              </button>
            </div>
          )}
          <p className="visually-hidden" role="status">
            {copied ? 'Link copied.' : ''}
          </p>
        </aside>

        <div className="planner-picker">
          <section className="planner-group" aria-labelledby="planner-pick-lessons">
            <h2 className="section-label" id="planner-pick-lessons">
              Lessons
            </h2>
            {groupByStrand(LESSONS).map(({ strand, items }) => (
              <section key={strand.id} className="planner-strand">
                <h3>{strand.name}</h3>
                {[...items]
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((l) => renderRow('lesson', l.slug, l.name))}
              </section>
            ))}
          </section>

          <section className="planner-group" aria-labelledby="planner-pick-sheets">
            <h2 className="section-label" id="planner-pick-sheets">
              Worksheets
            </h2>
            {groupByStrand(GENERATORS).map(({ strand, items }) => (
              <section key={strand.id} className="planner-strand">
                <h3>{strand.name}</h3>
                {items.map((g) =>
                  renderRow(
                    'sheet',
                    g.slug,
                    g.name,
                    <select
                      className="planner-preset"
                      aria-label={`Preset for ${g.name}`}
                      value={firstItem('sheet', g.slug)?.presetId ?? ''}
                      disabled={!isChecked('sheet', g.slug)}
                      onChange={(e) => editFirst('sheet', g.slug, { presetId: e.target.value })}
                    >
                      <option value="">Default settings</option>
                      {g.presets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>,
                  ),
                )}
              </section>
            ))}
          </section>

          <section className="planner-group" aria-labelledby="planner-pick-materials">
            <h2 className="section-label" id="planner-pick-materials">
              Materials
            </h2>
            {groupByStrand(MATERIALS).map(({ strand, items }) => (
              <section key={strand.id} className="planner-strand">
                <h3>{strand.name}</h3>
                {items.map((m) => renderRow('material', m.slug, m.name))}
              </section>
            ))}
          </section>
        </div>
      </div>

      <div className="planner-preview">
        {hasItems ? (
          <SheetPreview bw={bw} desk>
            <ParentPlanPage plan={plan} />
            {journalPages.map((page, pageIndex) => (
              <JournalPage key={pageIndex} page={page} pageIndex={pageIndex} />
            ))}
          </SheetPreview>
        ) : (
          <p className="no-print planner-preview-empty">
            Check a few items above and the printable plan and journal will preview here.
          </p>
        )}
      </div>
    </div>
  )
}
```

**`src/styles/planner.css`.** Replace current lines 1–21, from `/* ---------- Planner screen UI ---------- */` through `.planner-preview { overflow-x: auto; margin-top: 2rem; }`:

```css
/* ---------- Planner screen UI ---------- */

.planner-layout { display: grid; grid-template-columns: minmax(0, 1fr) 20rem; gap: 1.5rem; align-items: start; }
@media (max-width: 900px) {
  .planner-layout { grid-template-columns: minmax(0, 1fr); }
}

/* Picker rows: intentionally larger than the worksheet-builder form fields. */
.planner-row { display: flex; align-items: center; gap: 0.6rem; min-height: var(--touch-target); padding: 0.15rem 0; font-size: 0.95rem; }
.planner-row label { display: flex; align-items: center; gap: 0.6rem; flex: 1 1 auto; min-height: var(--touch-target); cursor: pointer; }
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
```

with:

```css
/* ---------- Planner screen UI (PRD 19) ----------
   The shelf (a paper-warm panel) and the ruled picker lists. All of it is
   .no-print chrome except .planner-preview, whose print margin is kept
   exactly as before (see the note on it). The printed pages below are
   untouched. */

.planner-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 22rem;
  grid-template-areas: 'picker shelf';
  gap: var(--space-6);
  align-items: start;
}

.planner-picker {
  grid-area: picker;
  min-width: 0;
}

.planner-shelf {
  grid-area: shelf;
}

@media (max-width: 900px) {
  .planner-layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'shelf'
      'picker';
  }
}

/* ---------- Picker: ruled lists under strand heads ---------- */

.planner-group:first-child > .section-label {
  margin-top: 0;
}

.planner-strand > h3 {
  margin: var(--space-6) 0 var(--space-2);
}

.planner-group > .section-label + .planner-strand > h3 {
  margin-top: var(--space-2);
}

.planner-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-3);
  padding: var(--space-1) 0;
  border-bottom: 1px solid var(--line);
}

.planner-pick {
  display: flex;
  flex: 1 1 14rem;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  min-height: var(--touch-target);
  cursor: pointer;
}

.planner-pick > input {
  flex: none;
}

.planner-row-name {
  min-width: 0;
  font-family: var(--font-text);
  font-size: var(--fs-read-sm);
  line-height: 1.35;
}

/* Fixed widths, so every preset and day select lines up down the column. */
.planner-row-controls {
  display: flex;
  gap: var(--space-2);
  margin-left: auto;
}

.planner-preset {
  width: 12.5rem;
}

.planner-day {
  width: 8.5rem;
}

/* Phones: the selects drop under the name, indented to the name's edge, and
   a worksheet's preset takes the full line with the day below it (S1-02).
   min-width: 0 lets the group be narrower than its selects' widest options. */
@media (max-width: 560px) {
  .planner-row-controls {
    flex: 1 1 100%;
    flex-wrap: wrap;
    min-width: 0;
    margin-left: 0;
    padding-left: calc(1.375rem + var(--space-3));
  }

  .planner-preset {
    flex: 1 1 12.5rem;
    width: auto;
    min-width: 0;
  }
}

/* ---------- The shelf ---------- */

.planner-shelf-title {
  margin: 0 0 var(--space-4);
  font-size: var(--fs-lede);
  font-weight: 500;
}

/* A full-width date box helps no one on a tablet, where the shelf spans the page. */
.planner-shelf .field {
  max-width: 20rem;
}

.planner-empty {
  margin: 0 0 var(--space-3);
  font-size: var(--fs-read-sm);
}

.planner-shelf-list {
  margin: 0 0 var(--space-3);
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--line);
}

/* name + kind | day | remove: the day always sits in its own column (S1-10). */
.planner-shelf-list > li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 2.5rem var(--touch-target);
  column-gap: var(--space-2);
  align-items: center;
  padding: var(--space-1) 0;
  border-bottom: 1px solid var(--line);
}

.planner-shelf-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: var(--touch-target);
  color: var(--ink);
  text-decoration: none;
}

.planner-shelf-name {
  font-family: var(--font-text);
  font-size: var(--fs-read-sm);
  line-height: 1.3;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: var(--link-rule);
  text-underline-offset: 0.2em;
}

.planner-shelf-item:hover .planner-shelf-name {
  color: var(--accent);
  text-decoration-color: currentColor;
}

.planner-shelf-kind {
  font: 600 var(--fs-caps) / 1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.planner-shelf-day {
  font: 600 var(--fs-ui) / 1.3 var(--font-ui);
  text-align: right;
}

.planner-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-target);
  height: var(--touch-target);
  padding: 0;
  border: 0;
  border-radius: var(--radius-control);
  background: none;
  color: var(--ink-soft);
  cursor: pointer;
}

.planner-remove:hover {
  color: var(--accent);
  background: var(--paper);
}

/* Print on its own row; Copy link and Clear week share the next, in fixed
   halves, so "Copied" never shifts its neighbour (S1-26, S9-30). */
.planner-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.planner-actions > .btn.primary {
  grid-column: 1 / -1;
}

/* Desktop: the shelf stays in view beside the long picker, and scrolls
   inside itself if a big week makes it taller than the window. */
@media (min-width: 901px) {
  .planner-shelf {
    position: sticky;
    top: var(--space-4);
    max-height: calc(100vh - 2 * var(--space-4));
    max-height: calc(100dvh - 2 * var(--space-4));
    overflow-y: auto;
  }
}

/* The 2rem top margin also applies on paper (it sets where the plan starts
   on page 1), so it stays exactly as it was; the screen gets more air. */
.planner-preview {
  overflow-x: auto;
  margin-top: 2rem;
}

@media screen {
  .planner-preview {
    margin-top: var(--space-7);
  }
}

.planner-preview-empty {
  margin: 0;
  font-style: italic;
  color: var(--ink-soft);
}
```

Lines 23–42 (`/* ---------- Printed pages ---------- */` onward) are unchanged.

**Check:**
- `npm test`: the two new `groupByStrand` tests pass.
- `npm run build` is green, and the print gate PASSes. Both planner routes are compared, including the sheet's page offset, which proves the 2rem print margin held.
- **390, `/planner`:** `document.documentElement.scrollWidth === innerWidth`. Each row is a name line, then (worksheets only) a full-width preset select, then an 8.5rem day select, indented to the name. No name breaks one word per line.
- **820:** the shelf is under the header, above "LESSONS". Tick a lesson: it appears on the shelf with its kind, Print appears full width, and Copy link and Clear week share the row below.
- **1400:** the shelf is at the right and stays in view while the picker scrolls. With 13 items it scrolls inside itself, and its buttons stay reachable.
  - Day selects on unticked rows are dashed with readable ink-soft text; ticking a row makes its select solid.
  - Preset selects line up down the column.
  - Worksheets and Materials are grouped under strand heads, with 36px above each head.
- **Copy link:** click it (on `localhost` the clipboard works). The label reads "Copied" for 1.5s and neither neighbour moves. A screen reader announces "Link copied."
- **Empty plan:** there is no Print, Copy link or Clear week, and the shelf says "Nothing picked yet — check lessons, worksheets, and materials in the lists."
- The date field is a 44px sans box under its label.
- `document.title` is `Weekly plan · Montessori Math`.
