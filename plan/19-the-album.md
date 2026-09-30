# PRD 19 — The Album: visual redesign

**Status:** In progress — Phases 1–4 done on `album`; Phase 5 under way (Steps 32–34 done)
**Effort:** L — about 8–9 working days. The prototype's estimate for the re-skin, the 21 plate thumbnails and print QA is 7–8 days; testing on a real iPad, phone and B&W laser printer adds up to one more.
**Depends on:** PRDs 00–18 (all Done; 16 was removed). The four functional fixes from the separate bug-fix session are merged to `main` (PR #7: `84ff957`, `e24aa01`, `477ac70`, `dbe71b6`), and so is an error boundary around the routed page (PR #8: `d769872`), which Step 12 keeps. Implementation starts from that `main`, `bbbdb44`, on the `album` branch, and Step 39 is written against the post-fix `BuilderPage.tsx`.

## Why

A page-by-page visual audit in September 2026 rendered all 97 routes in Chrome at desktop, tablet and phone widths, and checked every printable. The site works and its content is good, but it looks like a generic blog template. The audit's diagnosis:

- **No type scale.** h1 is 32px, h2 24px, body 16px, and every heading is Georgia at a faux-bold 600. About 14 near-duplicate text sizes read as one grey mid-size. The home title has no more presence than the glossary's.
- **Too much grey.** Intros and ledes, the text meant to hook a parent, are the lightest text on the page. The only divider between strands on the index pages is a 12.5px grey caps label.
- **One white card for everything.** Index tiles, the album page, the builder form, notes and help boxes share one washed-out surface. The worksheet preview is white on white, so the "sheet of paper" is lost.
- **Left-pinned measures.** Inline `maxWidth: '46rem'` styles pin lessons, guides and notes to the left of an 1100px box, leaving the right third of a desktop screen empty.
- **No imagery in navigation.** The site is about tactile materials, and it lists them as text in ragged card grids, most of which end in a half-empty row.
- **No shared page-header pattern.** Print sits somewhere different on every page type.
- **Generic chrome.** A white header bar, a two-paragraph footer, and emoji icons glued to their labels.

The Album treats the site as a well-made book: a Montessori teacher's album that happens to live on screen. Pages are warm paper and text is near-black ink. A book serif (Newsreader) sets everything you read, and a plain sans (MM Sans, a renamed subset of Source Sans 3) sets everything you operate. Fine rules replace boxes. Chapters are numbered, lesson steps are set like a printed album, and every index reads like a table of contents with a small mounted plate of each material.

Colour belongs to the materials. The golden beads, the place-value green, blue and red, and the bead stair become the brightest things on every page. The chrome adds only a golden silk ribbon, a three-bead fleuron and one rubric red for numerals, quote marks and the page's single primary action. A lesson on screen and the same lesson on paper look like one object. Worksheets, kits, the planner's printouts and the materials take the album's type; once the redesign is complete, the owner reviews every printable and decides what else should change.

These screenshots come from the working prototype, which re-skinned the live pages (see [Reference assets](#reference-assets)).

**Home**, before and after:

![Home page before the redesign: a white header bar, a 32px Georgia title, a terracotta button beside two white ones, and white cards](19-the-album/screens/home-before.webp)

![Home page in The Album: a rubric kicker, a large serif title, the ruled promise line, one rubric button and Plate I](19-the-album/screens/home-after.webp)

**Materials index**, before and after:

![Materials index before: grey strand labels over a ragged grid of white cards](19-the-album/screens/materials-before.webp)

![Materials index in The Album: numbered chapter heads with bead bars, and one row per material with a mounted plate](19-the-album/screens/materials-after.webp)

**Lesson steps**, before and after:

![Lesson steps before: a white card with Georgia headings and numbered steps](19-the-album/screens/lesson-steps-before.webp)

![Lesson steps in The Album: margin heads, rubric step numerals hung in the gutter, and spoken lines on a rule](19-the-album/screens/lesson-steps-after.webp)

The audit's full report is private. Everything this PRD needs from it is in [19-the-album/audit-findings.md](19-the-album/audit-findings.md): all 165 verified findings, each marked as resolved by a step here, fixed in the bug-fix session, or left as a candidate for PRD 20.

## Owner decisions

These are the owner's words and choices. Everything else in this PRD is Claude's design; the open questions list the choices the owner may want to revisit.

1. **Direction.** "Go with The Album, save it to plan/." The Album was one of three directions mocked up on the live pages.
2. **Fonts: "Self-host both."** Newsreader and Source Sans 3, both under the SIL Open Font License 1.1, ship with the site as woff2 files in `public/fonts/`, precached by the service worker (Steps 2–4). There is no font CDN and no `@import`. Source Sans 3's licence reserves the name "Source", so the modified subset ships renamed **MM Sans**.
3. **Lesson and guide print: "Print in the new design."** Lessons and guides print in the album design: running head, margin heads and hung numerals (decision 27, Steps 34 and 38).
4. **Primary buttons: "Rubric red."** The home call to action, every Print button and the builder's primary action are rubric `#9a3b27` with `#fffdf8` text, 6.82:1.
5. **Scope: "Separate follow-up PRD."** PRD 19 is the visual system and the page chrome. Audit findings about how materials render and what printables contain are candidates for PRD 20. The four functional bugs are fixed in the separate session and are out of scope here: the Hundred chain crash, the blank "Print control charts", number fields clamping each keystroke, and the answer-key number glued to its operand.
6. **No print gate (2026-09-29).** The owner, verbatim: "This line: 'The owner's rule is that worksheets, kits and the planner print exactly as before, and that no material changes.' is not true. I don't recall saying that, and if I did, I've changed my mind. Regression tests against every printable are not needed. In fact, after the redesign to 'The Album' is complete, I want to take a look at the printables myself and make a list of changes." That rule came from Claude's own option description, not from the owner. The owner chose to remove Phase 0 entirely, which removed the print regression gate (Step 1). With decisions 7 and 8 the token shield (Step 5), which the gate existed to prove, has no job left and is removed too.
7. **Printables: "Let them pick up the new look."** Worksheets, kits, the planner's printouts and the other printables take the new fonts and tokens as each phase lands. When PRD 19 is complete, the owner reviews every printable in its Album version, and that list of changes drives the real print changes (Step 43 hands over the checklist).
8. **Materials: "Yes, type and labels."** The virtual materials take the new fonts and label styling, which also fixes Georgia's bouncing old-style numerals on number cards (audit S7-05). Montessori colours stay exactly as they are, per `CLAUDE.md`. Material layout and rendering stay with PRD 20 (owner decision 5). Claude's default for PRD 19: the Album's faces reach every label on the mat; label sizes, tracking and contrast stay with PRD 20 unless the owner says otherwise (open question 22).
9. **Non-Montessori colours inside materials: "Follow the Album palette."** Without the shield, the chrome tokens materials share with the page take the Album values inside every stage too: card stock `#fffdf8` instead of white on pieces and trays, the darker ink and hairlines, and rubric instead of terracotta for the notices and buttons seven materials draw in the accent (open question 26). Montessori colours are unaffected (decision 8).

## Binding product rules

From `CLAUDE.md`, restated as they bind this work:

1. **No accounts, tracking or gamification.** Nothing new is stored. The only new state is ephemeral UI: the planner's "Link copied" status and the nav's scroll position on phones. No localStorage, no praise animation, no progress.
2. **Practice happens on paper.** No new on-screen child activity. The materials behave exactly as before. They take the Album's type (owner decision 8) and the chrome tokens they share with the page (paper, card, ink, hairlines, rubric; open question 26); Montessori colours, piece shapes, sizes and layout don't change.
3. **Print is first-class, and colour never carries information alone.** Printables take the Album's type and chrome tokens (owner decision 7); the `.bw` class still overrides every material colour, and no printable's content or layout changes in PRD 19. Lessons and guides print in the new design and must read cleanly on a B&W laser. After PRD 19 the owner reviews every printable (Step 43). In the chrome, meaning always has a non-colour cue: the active nav link is bold, the age is a boxed stamp, spoken lines are italic with quote marks and an indent, disabled controls are dashed, and links are underlined.
4. **Fully static and offline.** The fonts are same-origin files in `public/fonts/`, precached by the service worker. The prototype's Google Fonts `@import` is a mock-only stand-in and never ships. No runtime request leaves the origin.
5. **No new npm dependencies.** The fonts are built once with fontTools, a Python tool installed outside the repo. Runtime dependencies stay `react`, `react-dom` and `react-router-dom`, and `package.json` does not change.
6. **Montessori authenticity.** Material tokens (`--pv-*`, `--bead-*`, `--golden*`, `--felt`, `--wood`, `--wood-dark`, `--inset-frame`, `--fraction-shade`) are never re-pointed, and Montessori colours stay exactly as they are (owner decision 8). Inside materials the type changes (the Album's faces and lining figures, Steps 6–7) and the shared chrome tokens take the Album's values (Step 6, open question 26); nothing else does. No material component's own rendering is edited; material layout is PRD 20. The plate thumbnails are drawn with the real bead primitives and colour rules, and Plate I shows the golden beads in true proportion.
7. **Plain CSS and tokens.** Colours come only from CSS variables defined in `tokens.css`. No TSX file has a colour literal. Print rules may use `#000`, as `print.css` already does. No `:has()`, no `[style]` attribute selectors, no CSS-generated captions, and no JavaScript DOM surgery: the prototype's shortcuts all become real classes and markup.
8. **TypeScript strict with `verbatimModuleSyntax`.** Type-only imports use `import type`. Tests are colocated, run in Vitest's node environment, and test pure logic, never React rendering.
9. **Access.** Every chrome control is at least 44px (`--touch-target`), keeps a visible 3px focus ring, and meets WCAG AA contrast (measured ratios below). Every chrome transition and animation respects `prefers-reduced-motion`.
10. **One session, not parallel agents.** This PRD edits shared files (`tokens.css`, `global.css`, `main.tsx`, `index.html`, `MaterialShell.tsx`, `PrintButton.tsx`, the layout), so per `CLAUDE.md` one session implements it in order.
11. **Workflow.** Commit per phase with a clear message, so the history tells the story. Ask the owner before any scope change. "Stop" means stop.

## The visual system at a glance

### Tokens

All values live in `src/styles/tokens.css` (Step 6).

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f6f1e7` | The album page (body background). `index.html`'s theme colour and the web manifest mirror it. |
| `--paper-warm` | `#ede5d5` | Quiet fills: the hover wash, the planner shelf, the band behind spoken lines |
| `--desk` | `#e2d9c7` | The desk a printable sheet lies on in previews (screen only) |
| `--card` | `#fffdf8` | Card stock: plates, buttons, fields, Plate I, the walk-through step card |
| `--ink` | `#26221d` | Letterpress black: text, rules, button edges |
| `--ink-soft` | `#5e5548` | Meta text only: badges, help lines, kind labels |
| `--line` | `#d6ccb8` | Hairlines between entries. Decorative: never a control's only edge |
| `--line-strong` | `#8c816f` | Field borders, the spoken-line rule, faint underlines in the scope chart |
| `--accent` | `#9a3b27` | Rubric: step and chapter numerals, quote marks, the one primary action |
| `--accent-dark` | `#7a2d1d` | Rubric hover and pressed |
| `--on-accent` | `#fffdf8` | Text on rubric |
| `--link-rule` | `#a8705f` | The underline under ink link text (the underline, not the colour, is the cue, so it clears 3:1) |
| `--oxford-under`, `--oxford-over` | a 2px ink rule over a 1px ink rule, 2px apart (background gradients) | Under the running head, over the colophon, under a lesson title. Backgrounds don't print, so print uses a 3px double border |
| `--fleuron` | three radial-gradient golden beads, 44×12px | The section-break ornament |
| `--focus` | `#1e6bb8` (unchanged) | The 3px focus ring |
| `--golden*`, `--pv-*`, `--bead-*`, `--felt`, `--wood`, `--wood-dark`, `--inset-frame`, `--fraction-shade` | unchanged | Material colours. The chrome borrows golden only for the silk ribbon, the fleuron and `::selection` |
| `--radius`, `--radius-sm`, `--shadow-sm`, `--shadow-md` | unchanged: 10px, 6px, `0 1px 3px rgba(51, 48, 42, 0.12)`, `0 1px 2px rgba(51, 48, 42, 0.1), 0 6px 18px rgba(51, 48, 42, 0.12)` | Legacy shape tokens: the corners, depth and hover lift of material pieces. The chrome uses `--radius-chrome`, `--radius-control` and `--shadow-sheet` |

The legacy shape tokens are not re-pointed, because material pieces draw with them (Step 6). Legacy chrome rules that still use them (`.card`, `label.field`, the legacy `.btn`, the old help box) keep their rounded corners until the step that replaces them.

### Type

| Token | Value | Use |
|---|---|---|
| `--font-text` | `'Newsreader', 'Newsreader Fallback', Georgia, 'Times New Roman', serif` | Everything you read, and titles. `--font-heading` and `--font-body` alias it (inside a material stage, and in the no-print bars inside sheet previews, `--font-body` is MM Sans: Step 7) |
| `--font-ui` | `'MM Sans', 'MM Sans Fallback', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` | Everything you operate: nav, buttons, fields, labels, meta, tables |
| `--font-numeral` | `var(--font-text)` (Newsreader) | Figures on number cards and in the plate drawings: Newsreader's lining figures (Step 7, audit S7-05) |

| Step | Token | Size | Use |
|---|---|---|---|
| 1 | `--fs-caps` | 0.875rem (14px) | Sans capitals: margin heads, labels, meta, kickers |
| 2 | `--fs-ui` | 1rem (16px) | Nav, buttons, fields, help, tables |
| 3 | `--fs-read-sm` | 1.0625rem (17px) | Summaries, notes, captions |
| 4 | `--fs-body` | 1.125rem (18px) | Reading text (the body) |
| 5 | `--fs-lede` | 1.3125rem (21px) | Ledes, entry titles, h3 |
| 6 | `--fs-h2` | 1.75rem (28px) | Chapter and section heads |
| 7 | `--fs-h1` | `clamp(2.25rem, 1.6rem + 1.9vw, 3.25rem)` (36–52px) | Page titles, weight 400 (lesson titles 350) |
| 8 | `--fs-display` | `clamp(2.75rem, 1.4rem + 4.6vw, 4.75rem)` (44–76px) | The home title only, weight 350 |

`--measure` is 40rem, about 70 characters at 18px. The weights on offer are Newsreader roman 350–600, Newsreader italic 400–500 and MM Sans 400–700. Chrome headings get `text-wrap: balance` and chrome paragraphs `text-wrap: pretty`.

### Space, shape and layout

| Token | Value |
|---|---|
| `--space-1` … `--space-8` | 0.25, 0.5, 0.75, 1, 1.5, 2.25, 3, 4.5rem |
| `--radius-chrome` | 2px (paper corners) |
| `--radius-control` | 3px (buttons) |
| `--shadow-sheet` | `0 1px 1px rgba(38, 34, 29, 0.12), 0 18px 36px -14px rgba(38, 34, 29, 0.45)` (paper lifting off the desk) |
| `--container` | `min(1068px, calc(100% - 2rem))`; `calc(100% - 32px)` at ≤640px (16px gutters). Screen only |
| `--margin-col` | 11rem: the margin column for album and guide heads; 0 at ≤640px |
| `--gutter` | 2.75rem between the margin column and the text; 0 at ≤640px |

### Contrast

Measured with the WCAG 2.x formula against the surface named.

| Pair | Ratio | Where |
|---|---|---|
| ink on paper, paper-warm, card | 14.04, 12.62, 15.54 | All text, rules, button edges (WCAG 1.4.11: 14.04) |
| ink on desk | 11.27 | Nothing on the desk is text; for reference |
| ink-soft on paper, paper-warm, card | 6.50, 5.85, 7.20 | Meta, help, kind labels, toolbar labels |
| rubric on paper, card, paper-warm | 6.16, 6.82, 5.54 | Numerals, quote marks, hover titles |
| on-accent on rubric | 6.82 | Every primary button (Print, home CTA) |
| on-accent on accent-dark | 9.30 | Primary hover |
| accent-dark on paper | 8.40 | Rubric pressed |
| `--line-strong` on card, paper, paper-warm | 3.77, 3.40, 3.06 | Field borders (WCAG 1.4.11 needs 3:1) |
| `--link-rule` underline on paper, paper-warm, card | 3.62, 3.26, 4.01 | The only thing that marks an ink link as a link (WCAG 1.4.11 needs 3:1) |
| focus ring on paper, paper-warm, card | 4.84, 4.36, 5.37 | The 3px `--focus` ring |
| unchecked checkbox edge (UA `#767676`) on paper, paper-warm | 4.03, 3.63 | Checkboxes |
| ink on golden-light | 9.88 | `::selection` |
| age stamp: ink on paper | 14.04 | Was green on a green tint, 3.80:1 (S1-23) |
| scope-chart strand rows: ink on paper | 14.04 | Was white on wood, 3.1:1 (S8-03) |

`--line-strong` is deliberately darker than the prototype's `#9c907c`, which gave 2.79:1 on paper and 2.51:1 on paper-warm and failed WCAG 1.4.11 for field borders. `--link-rule` is darker than the prototype's `#c79a8b` for the same reason: at 2.21:1 on paper (1.99:1 on paper-warm) the only cue on an ink link fell below 3:1.

### Inside materials and printables

Material stages and printable sheets read the same token names as the chrome, so they take the Album's values (owner decision 7 for the printables' type and tokens, owner decision 8 for the materials' type; for the materials' paper, card, ink, hairlines and rubric this is Claude's default, open question 26). There is no token shield.

- **Faces.** Headings, numerals and sheet text are Newsreader (`--font-heading`, `--font-body`, `--font-numeral`). Inside a material stage, text, labels and buttons are MM Sans: Step 7 re-scopes `--font-body` to `--font-ui` inside a stage and in the no-print bars inside sheet previews. Figures are lining everywhere, which ends Georgia's old-style numerals (audit S7-05).
- **Surfaces and ink.** `--paper`, `--paper-warm`, `--card`, `--ink`, `--ink-soft`, `--line`, `--accent` and `--accent-dark` take the Album's values: slightly warmer paper and card stock (`#fffdf8` instead of white on pieces and trays), darker ink and hairlines, and rubric instead of terracotta for the few notices and buttons that seven materials draw in the accent (open question 26). Two material colours are drawn with these tokens and change with them: the checkerboard's grey multiplier tiles (`--ink-soft`, `#6f6759` to `#5e5548`) and the snake game's black beads (`--ink`, `#33302a` to `#26221d`). Keeping them is the owner's call (open question 28).
- **Unchanged.** Every Montessori colour (`--pv-*`, `--bead-*`, `--golden*`, `--felt`, `--wood`, `--wood-dark`, `--inset-frame`, `--fraction-shade`) and the `.bw` overrides; the legacy shape tokens `--radius` (10px), `--radius-sm` (6px), `--shadow-sm` and `--shadow-md`, which give material pieces their corners, depth and hover lift; `--font-mono`; and each material's and sheet's own sizes, tracking, spacing and layout. Stages and sheets keep their 16px / 1.55 base (Step 7), so the body's 18px reading size doesn't rescale them.
- **Reflow.** Small reflows from the new faces' metrics are accepted. Anything clipped, overlapping, blank or unreadable is fixed in the step that caused it. How printables should look is the owner's review after PRD 19 (Step 43); material layout is PRD 20.

## Conventions every step follows

The steps below rely on these rules. Each one is defined by an early step and then assumed by every later one.

1. **The chrome guard.** Any chrome rule written as an *element* selector (h1–h4, p, li, dd, a), or on a class that also appears inside materials (`.btn`), ends in `:where(:not(.material-stage *, .print-sheet *))`. `.btn` uses `:where(:not(.material-stage *))` only, because the print bars inside sheet previews are chrome. The guard adds no specificity. The legacy element rules stay in place above the guarded rules and still style everything inside a stage or sheet, now in the Album's faces and colours (convention 2). The guard keeps the chrome's page-scale sizes, weights, tracking, wrapping and link styling out of materials and printables, which keep their own. Rules on chrome-only classes (`.page-header`, `.contents-row`, `.album …`) don't need the guard.
2. **Materials and printables take the Album's type** (owner decisions 7 and 8). They read the same tokens as the chrome (for the materials' paper, card, ink and rubric, open question 26). Step 7's materials-and-printables block in `global.css` gives every `.material-stage` and `.print-sheet` the 16px / 1.55 base they were laid out on and lining figures, and sets a stage's text in MM Sans (`--font-body` is re-scoped to `--font-ui` inside a stage and in the no-print bars inside sheet previews); number cards use `--font-numeral` and stamps MM Sans. Never re-point `--pv-*`, `--bead-*`, `--golden*`, `--felt`, `--wood`, `--wood-dark`, `--inset-frame` or `--fraction-shade`, nor the legacy shape tokens `--radius`, `--radius-sm`, `--shadow-sm` and `--shadow-md` that material pieces draw with; chrome uses `--radius-chrome`, `--radius-control` and `--shadow-sheet`.
3. *Removed 2026-09-29.* The chrome twins (`--chrome-*`) existed only for the token shield (owner decisions 6–8). Chrome drawn on or inside a stage or sheet, such as the plate mount (Step 28), uses the plain tokens.
4. **Containers around a stage or sheet** (`.material-shell`, `.material-plate`, `.builder-preview`, `.sheet-preview`, `.planner-preview`) may set `font-family`, `font-size`, `line-height` and `color`: the stage and the sheet set their own (Step 7, `print.css`). They must not set any other inherited text property (`letter-spacing`, `font-style`, `font-weight`, `text-transform`, `text-wrap`, `font-variant*`, `font-feature-settings`). Any of those would leak the chrome's styling into materials and printouts.
5. **No blanket UI-font rule.** The prototype's `:where(button, select, input, textarea, label, summary, table):not(...) { font-family: var(--font-ui) }` is not carried over. `.btn` and `.badge` set `var(--font-ui)` themselves (Steps 9 and 11). Every other chrome container that holds controls sets `font-family: var(--font-ui)` itself: the nav, the material toolbar, fields, tables, panels.
6. **Motion.** Every chrome `transition` or `animation` is declared inside `@media (prefers-reduced-motion: no-preference)`, so a reader who asks for less motion gets instant state changes and no movement.
7. **Font weights on offer.** Newsreader roman 350–600, Newsreader italic 400–500, MM Sans 400–700. A weight outside a face's range draws at the nearest weight inside it. Newsreader has no small caps (`font-variant: small-caps` is synthesised) and no arrow glyphs (→ falls back per glyph). MM Sans has no italic (it is slanted synthetically).
8. **Icons.** Use `<Icon name="…" />` from `src/components/Icon.tsx` (Step 8). A control that shows an icon keeps its text as the accessible name. The button pattern is `<button className="btn has-icon"><Icon name="print" /><span className="btn-label">Print</span></button>`. The guard test from Step 10 fails if an emoji appears anywhere in `src/`.
9. **Stylesheet order.** After Steps 3, 12, 15 and 16, `src/main.tsx` imports, in this order: `fonts.css`, `tokens.css`, `global.css`, `layout.css`, `contents.css`, `forms.css`, `print.css`, then the existing `materials.css`, `album.css`, `worksheets.css`, `guides.css`, `planner.css` and `presentation.css`. Print rules still load after every screen rule they override, and the page stylesheets (`materials.css`, `album.css`, `guides.css`) refine the shared ones on order. Don't reorder the existing imports: audit finding S6-01 (a PRD 20 candidate) depends on today's order.
10. **Line numbers.** Every quoted line number refers to the file at `bbbdb44`, the `main` PRD 19 starts from (`main@0faa268` plus the four bug-fix commits and the error boundary). Earlier steps in this PRD shift lines, so always find the code by the quoted text; the numbers are only a guide. Where the bug-fix commits moved a line, both numbers are given.
11. **No inline styles on pages.** Page components style through classes. The only `style={{…}}` props allowed outside the material, generator and kit components (which this PRD doesn't touch) are the logo gradient's `stopColor` in `Layout.tsx`, the SVG paint and numeral font styling in `MaterialThumb.tsx` (token values for colour and family, plus the numerals' `fontWeight: 700`) and `SheetPreview`'s measured `zoom`.
12. **Checks.** Each step ends with a **Check:** list. Besides its own items, every step's checks include *the standard check*: `npm run build` and `npm test` are green, and on `npm run dev` the pages the step names look right in a browser, plus one material (`/materials/golden-beads`) and one printable in print preview (`/worksheets/multi-digit-ops?seed=424242&key=1`) whenever the step changes shared CSS, tokens or a component that renders them. Small reflows from the Album's type inside materials and printables are expected; a clipped, overlapping, blank or unreadable result is not, and is fixed in the step. There is no regression gate (owner decision 6): how printables should look is the owner's review after PRD 19 (Step 43).

## Design decisions

Claude's design. Later steps refer to these by number; the open questions list the ones the owner may want to change.

### The print gate (removed)

Decisions 1–3 described the print regression gate. *Removed 2026-09-29 with Phase 0, at the owner's request (owner decision 6).* Decisions 4–34 keep their numbers.

### Shell and hub pages

4. **Two new stylesheets.** The shell's CSS lives in `src/styles/layout.css` (shell, nav, colophon, PageHeader, text links; Step 12) and `src/styles/contents.css` (chapters, contents rows, plates, home, notes, `/ages` tabs; Step 15). They load right after `global.css` and before `print.css`, so print rules still win on order. The old shell, card-grid and home rules are deleted from `global.css` (Steps 12, 23 and 25).
5. **One column.** `.container` sets `width: var(--container)` with auto side margins, **inside `@media screen` only**, on `.site-header-inner`, `main.site-main` and `.site-footer-inner`. At ≤640px `tokens.css` redefines `--container` as `calc(100% - 32px)`, a 16px gutter (was 12px). Print keeps the full Letter width: in the prototype, an unguarded container narrowed printables to 688px.
6. **Sticky colophon.** `Layout` wraps everything in `div.site-shell`, a screen-only flex column with `min-height: 100dvh`, and `main` grows (`flex: 1 0 auto`). This keeps the 404's footer off the middle of the screen.
7. **The nav.**
   - Every link carries `data-label`. An invisible bold copy of that label (`::after`, `height: 0`, `visibility: hidden`, alt text `''`) reserves the bold width, so the row never shifts when the active link turns bold.
   - Every link is at least 44×44px: `min-width` as well as `min-height`, with 0.35rem side padding, so even "Kits" (about 29px of text) is a full target and the phone focus ring clears the letters.
   - At ≥1021px the active link carries the silk ribbon: a `::before` drawn with borders, 6px `--golden` plus 6px `--golden-dark`, 17px tall, with a 5px transparent bottom border that cuts the V notch, so 12×22 in all. It hangs from `top: calc(-1 * var(--head-pad))`, the page's top edge.
   - At ≤1020px a 3px golden inset underline replaces the ribbon.
   - At ≤640px the nav is one sideways-scrolling row. It bleeds to the screen edges and has a 2.5rem mask fade on the right, plus 2.5rem of end padding so the last link can scroll clear of the fade. This avoids scroll-driven animations, which Firefox lacks. `scroll-padding-inline: 16px 2.5rem` makes the fade count as out of view, so a link that shows only inside the fade is scrolled clear when it takes keyboard focus. Chrome's focus scrolling ignores that padding for a link already partly in view, so a `Layout` focus handler (`keepFocusedLinkClear`) also scrolls any focused link fully clear of the gutter and the fade. Like the effect below, it only sets `scrollLeft`.
   - Between 641 and 700px the links' gap tightens from `--space-4` to `--space-3`, so all seven stay on one row just above the phone breakpoint.
   - A `Layout` effect centres the active link in that row after each navigation, or resets it to 0 when no link is active. It sets `scrollLeft` directly, with no smooth scrolling.
   - Bold weight always marks the active link, so the golden mark is never the only cue.
8. **PageHeader.** It renders `header.page-header(.has-actions)` > `.page-header-main` (optional `p.page-kicker`, `h1`, `p.page-meta.meta-line`, `p.page-lede`, children) + `div.page-header-actions.no-print`. The grid gets a second `auto` column only when actions exist. It also sets `document.title` to `"<title> · Montessori Math"` through the exported `useDocumentTitle`, which restores the previous title on unmount.
9. **Contents rows.**
   - Each `ContentsRow` is one `<Link class="contents-row lead-plate|lead-num|lead-none">`, at least 72px tall. It holds an optional plate or rubric numeral, then `span.row-text`, then an arrow icon.
   - `row-text` is a 3-column grid (`16rem | 1fr | 11rem`) for title, summary and right-aligned meta. The optional `note` line (presets, piece counts) spans columns 2–3 as plain wrapping text, never a pill.
   - At rest the title is underlined in `--link-rule`. On hover or focus the row gets a `--paper-warm` wash that bleeds 8px past the plate, and the title and arrow turn rubric.
   - At ≤1020px the text stacks: title and meta on one line, summary below. The prototype stacked at 900px, but from 901 to 1020px its summary column fell to about 200px. At ≤640px the arrow hides and the meta drops under the summary.
   - Every contents list (`ul.contents` or `ol.contents`), and the home page's `ul.parts`, carries `role="list"`, because `list-style: none` drops list semantics in Safari (as in decision 25).
10. **Chapter heads.** `ChapterHead` renders the rubric italic `strand.order`, then `<BeadBar n={strand.order} beadSize={12} className="strand-bar"/>`, then the name, then the meta `Ages a–b · grades` (the prototype's wording). Every chapter `<section>` carries `data-strand={strand.order}`. Strand identity always comes from `strand.order`, never from section position.
11. **MaterialThumb.**
    - Each plate is a 72×48 `span.plate` (card stock, 1px ink border, inner `--line` ring) holding a 62×38 SVG grid. The drawings keep the prototype's coordinates, with three exceptions: golden beads (true proportion, decision 12), number cards (NumberCard's width rule, 0.62 × the card height per digit, with the right edge at x = 41, where the prototype used 4.6 per digit + 3 and x = 42) and the stamp game (StampTile's numeral ratios, on `--card` instead of white).
    - Beads, bars, squares, cubes and skittles are the real `beads.tsx` components (`Bead`, `BeadBar`, `HundredSquare`, `ThousandCube`, `Skittle`), nested at their true pixel size. Nesting them, rather than calling `BeadShape` directly on the small grid, keeps `BeadShape`'s 0.6px minimum stroke from swamping 1–2px beads.
    - Number cards and stamps reuse `NumberCard`'s `cardColor()` and `StampTile`'s `STAMP_COLOR` (`StampTile.tsx` gains one `export` keyword). Their shapes are redrawn as SVG because those components render HTML, and `foreignObject` is unreliable in Safari. The kit plate's scissors are `IconGlyph` from `Icon.tsx`, so that glyph is drawn in one place.
    - There are no colour literals: material tokens for the material, chrome tokens (`--card`, `--ink`, `--ink-soft`, `--line-strong`, `--paper-warm`, `--accent`) for paper and card stock.
    - Sheet, kit and album glyphs are included. An unknown slug gets a fallback plate: its strand's bead-stair bar, or a golden ten-bar when no strand is given.
    - `THUMB_ART` is exported so a test can prove that all 21 registry materials have a drawing.
12. **Golden beads in true proportion (a deliberate change from the prototype).** The prototype's golden-bead thumbnail and Plate I both repeat audit finding S1-09: the ten-bar is drawn longer than the square's side. Both now derive from one bead unit, so the cube's face, the square's side and the bar are each exactly ten beads long. The thumbnail uses an 18-unit side and Plate I uses 11px beads (cube 136, square 110, bar 11×110, unit 11).
13. **`/ages`.** The band tabs become an equal-width, three-column segmented control (`.band-tabs`); each tab shows two lines, ages then grades. The selected tab is marked by ink, bold weight and a 3px ink underline, not by the primary button style. The tabs gain `aria-controls` and a `role="tabpanel"`. Lessons are numbered contents rows with their overview, grouped under minor strand heads; materials and worksheets become plate rows.
14. **Home.** The DOM order is title, Plate I, body, which is the phone reading order; desktop places the body left and the plate right. There is one rubric primary action, followed by a `.home-links` row with two quiet arrow links. Parts I–III and the age bands use plates. "A note on screens" becomes a `.note` aside under a fleuron.
15. **Prototype shortcuts replaced with real markup.**
    - `shim.js`'s name→order `STRANDS` map is replaced by `strand.order`.
    - `.row-meta-plain` is replaced by the `note` prop (`.row-note`).
    - The `.band-row .row-title { text-decoration-line: none }` hack is replaced by `.row-title-text`, so only the title text is underlined.
    - The separate `.lesson-row` grid is replaced by `lead-num` contents rows, and `main.site-main > ol > li::marker` by rows.
    - `.material-controls[role=tablist]` is replaced by `.band-tabs`.
    - `.home-section-head` and `p.section-label` on home and `/ages` are replaced by `h2.section-head`.
    - The Parents 3×2 `a.entry` grid is replaced by numbered contents rows.
    - The plate's `zoom: 1.3` is replaced by sizes computed from the bead unit. `zoom` is kept only for the whole of Plate I at ≤1020px and ≤760px, as `SheetPreview` already does.
    - There are no `:has()`, no `[style]` selectors, no inline `style` props, and no CSS-generated captions or kickers.
16. **Hub motion.** The only motion on the hub pages is two 120ms transitions (the row and part hover wash, and a 3px arrow nudge), declared inside `prefers-reduced-motion: no-preference` (convention 6). A reader who asks for less gets an instant wash and no nudge.

### Material pages

17. **Shell anatomy.**
    ```
    .material-shell
      .material-controls.material-toolbar.no-print
        .material-task (the material's own controls)
        .material-utility (Sound, Focus)
      details.material-help.no-print
      figure.material-plate
        .material-stage-frame
          .material-stage.mat-*
        figcaption.plate-caption
    ```
    The toolbar keeps the old `.material-controls` class, and every new chrome rule targets `.material-toolbar`. The legacy `.material-controls` rules stay for LongChain's print row (`LongChain.tsx` line 223 on `main`, 229 after the fix).
18. **The toolbar never strands Sound and Focus.**
    - At every width the toolbar is `nowrap`. The task group shrinks and wraps *inside itself*, and the utility group is a fixed pair pinned top right, so Exit focus is always in the same place.
    - On phones Sound and Focus are 44px icon-only buttons, and their words stay the accessible name.
    - **Deviation from the prototype.** The prototype hid every phone toolbar label with `font-size: 0`. That would also blank the visible text of the checkbox labels on five materials ("Show value", "Show product" …), and targeting only select labels needs `:has()`. So labels stay visible. On the golden-bead page at 390 the task controls take two rows: `MODE [Free build] [Hide total]` / `[Reset]`, with Sound and Focus top right.
19. **The plate mount.** The 1px ink hairline and the paper mat are inset box-shadows inside the stage's own padding, so no material changes width. They use `--ink` and `--paper`. The stage radius is `--radius-control` (3px). The felt's own inset depth shadow is kept.
    - **Phones keep today's stage width.** Step 12 widens the phone gutter from 12px to 16px, so the plate bleeds 4px back into it (`margin: 0 -4px`; from Step 12 until Step 28 mounts the plate, the shell carries the same bleed). Every stage stays `viewport − 24px` wide with its 1rem padding, as today (366px at 390). The prototype's 8px bleed and tighter stage padding would have given every material 24px more on a phone and reflowed several of them. That is material layout, which owner decision 5 leaves to PRD 20, so the golden-bead bank's one-row fit stays there (S2-16, open question 12).
20. **The scroll veil is a layer, never a mask.**
    - A `::after` on `.material-stage-frame` fades the right edge into chrome paper while the stage has more mat to the right. It is driven by the stage's scroll position through a named scroll timeline hoisted with `timeline-scope`.
    - `mask-image` on `.material-stage` (the prototype's approach) would make the stage a stacking context and surface the stamp game's latent `z-index: -1` stack hint. So the stage and the frame get no mask, z-index, opacity, transform or filter.
    - The veil is inactive when the mat fits, so it shows only where a mat really overflows: golden beads, stamp game and bead frame at 390; cards & counters and checkerboard at 820. It is absent without scroll-driven animation support and under `prefers-reduced-motion: reduce` (convention 6), and never printed.
    - Wherever the veil is active, the stage also gets `scroll-padding-inline-end: 2.75rem`. That makes the veiled strip count as out of view for keyboard focus, so a control that shows only under the veil is scrolled clear (WCAG 2.4.11). It is a scroll-only property: no layout, no paint, no stacking context.
21. **The plate caption is real markup.** MaterialPage provides the material's name through `MaterialNameContext`, so none of the 22 components that render `MaterialShell` changes. `plateCaption()` is a tested pure function: "Golden Beads & Mat, on the felt work mat."
22. **The material page.** One `PageHeader`: the title, then a meta line `[AGES 4–7] GRADES PK–1 · THE DECIMAL SYSTEM` (grades now carry their label, S4-24), then the ink lede, with Walk-through buttons (play icon) in the action slot. Under the plate come two ruled two-column grids: For parents | Make the real thing, then Lessons | Printable follow-up work. Kits become link rows, and the piece count gets its own sans line, so "(36 number cards (1–9,000))" loses its nested parentheses. There is no wrapper element around `<Component/>`, because the chart materials' print isolation selects direct children of `main.site-main`.
23. **The walk-through step card** (PRD 11's overlay) gets the prototype's §18 skin only: card stock under an ink hairline with square corners, a Newsreader title in ink, and the spoken line in ink with rubric quote marks, matching the lesson page. Its behaviour (covering the mat, focus mode hiding it) is unchanged and stays a PRD 20 candidate (S2-24+S4-05, S9-01, S9-21).

### Lessons and guides

24. **Lesson margin heads are a CSS grid, on screen and on paper.** Each `section` is `grid-template-columns: var(--margin-col) minmax(0, 1fr)`: the `h2` in column 1, everything else in column 2. The prototype floated the head. A float can be pushed to the next page while the first list item stays behind, and it did so in 9 of 738 paginated layouts. A grid row moves as one unit: 0 of 738.
25. **Step numerals are real text** (`<span class="step-num">1</span>`), hung in the gutter with `position: absolute`. They are not CSS counters, so they copy, print and read aloud with the step. The `ol` gets `role="list"`, because `list-style: none` drops list semantics in Safari. The vocabulary `ul` gets the same treatment.
26. **Lesson chrome copy.** Chrome only, never lesson content:
    - "No materials at home? Use the virtual A or B." instead of "Use the virtual A · Use the virtual B" (S5-20).
    - The demo link reads "Walk through it on the virtual Golden Beads & Mat", with a play icon. The feature is called "Walk through" on both pages (S5-08).
    - A worksheet link becomes its own line, "Printable: Multi-Digit Operations", instead of ". — print:" tacked onto the sentence (S5-16).
    - Several next-in-strand lessons are separated by commas; today they run together.
27. **Lesson print design** (owner decision 3):
    - It prints the running head (THE LESSON ALBUM · strand · lesson N · boxed age · grades) and a 26pt title over a **3px double rule**. Backgrounds don't print, so the Oxford rule can't.
    - The body is 11pt/1.5 and the lede 12.5pt.
    - Margin heads are **8.5pt** capitals in a **7.5rem column plus a 2.5rem gap: a 10rem gutter**. QA found a head/numeral collision at 9rem.
    - Step numerals are 18pt. Numerals, quote marks and the spoken-line rule print **black** in colour and in B&W alike. The screen band behind spoken lines is not printed.
    - `li` never splits, and paragraphs keep 3 lines on each side of a break.
    - Print colours are the literal `#000`, as `print.css` already uses.
28. **Guides.**
    - A `GuideHeader` (PageHeader + Print) opens every guide.
    - Guides are a centred 56rem grid with margin heads: Newsreader 500 at 1.3rem on an ink rule, beside a hairline over the text.
    - They stack into one column at ≤760px **on screen only** (`@media screen and (max-width: 760px)`). Chrome evaluates print at the 720px Letter width, so an unscoped query would also stack them on paper and drop the margin heads.
    - **Glossary** terms hang in the margin like an index (`dl` as a subgrid).
    - **FAQ** questions are too long for an 11rem column (one would wrap to 5 lines), so they head the text column. The FAQ is a *block* indented to the text column, not the grid, because Chrome did not honour `break-after: avoid` between grid rows: 2 of 108 layouts stranded a question.
    - A blockquote is a roman note on a 2px ink rule, and the one illustrative scene is italic (`.guide-scene`), which answers S8-22.
29. **Scope & Sequence.**
    - The chart spans the full 1068px column. Strand rows are `ChapterHead as="span"` (rubric number, that strand's bead bar, the name, the ages meta) in a `th scope="rowgroup"`, ink on paper.
    - Lesson numbers are italic rubric and lesson names serif. Material and follow-up links are sans with a faint `--line-strong` underline, and there are hairline rows only.
    - Empty cells show an em dash with a visually hidden "none".
    - On phones rows stack into entries with visible `AGES / GRADES / MATERIALS: / PRINTABLE:` labels. The labels are real spans, not CSS-generated.

### Builder, kits and planner

30. **One home for form controls.** `forms.css` styles `.field` (label + control + help), `.field.checkbox` (a two-column grid: box | label, with help under the label), the date input, dashed disabled controls, `.field-grid` and `.panel`. Only the builder, kit and planner pages have form controls, and none sits in a stage or a sheet, so no chrome guard is needed. The rules also work with today's markup, so Step 16 can land long before Steps 39–41.
31. **The desk is an opt-in `SheetPreview` prop.** `<SheetPreview desk>` adds `.on-desk` to the wrapper. Every desk rule is in `@media screen`. The desk padding is subtracted before the zoom-to-fit, so a page can never overflow (owner issue #1 reported having to scroll sideways to see a worksheet). The chart print previews (AdditionCharts, MultiplicationCharts, LongChain) don't pass `desk` and are unchanged.
32. **Builder and kit anatomy.**
    ```
    div.builder
      header.page-header.has-actions.no-print   (PageHeader: title, meta, lede | New problems, Print)
      div.builder-layout
        aside.builder-form.panel.no-print       (h2.panel-label "Sheet settings" | "In this kit" + "Assembly")
          div.field-grid                        (fields; 2 columns at 641–900px)
          p.panel-note                          (seed / printing tips)
        div.builder-preview
          div.sheet-preview.on-desk > div.print-sheet > section.sheet-page …
    ```
33. **Planner anatomy.** The shelf comes first in the DOM. On desktop, grid areas place it right (`'picker shelf'`); at ≤900px it sits above the 75-row picker, with Print in reach (S1-14). Keyboard order is therefore shelf, then picker, at every width. The picker groups worksheets and materials under strand heads, as lessons already are (S1-13).
34. **Four small behaviour changes, each chrome only and each easy to drop** (listed again under open questions):
    - the builder's preset help line survives edits (S6-19);
    - an empty planner shows no Print, Copy link or Clear week (S9-05);
    - shelf items show their kind (Lesson / Worksheet / Material);
    - the picker groups by strand.

## Reference assets

Everything lives in [`plan/19-the-album/`](19-the-album/), described in its [README](19-the-album/README.md).

- **[`prototype/mock.css`](19-the-album/prototype/mock.css) and [`prototype/shim.js`](19-the-album/prototype/shim.js)** are the working prototype that re-skinned the live pages for the owner's review. `mock.css` is the source of truth for token values, the type scale, spacing, component styling and print rules. `shim.js` stands in for the JSX changes: the icon paths, the PageHeader markup, the plate drawings, the contents-row markup, the toolbar grouping, the plate figcaption and the colophon. They are **reference, not code to ship**: `mock.css` imports Google Fonts (a runtime request), and `shim.js` edits the DOM after React renders. Every step below translates them into real components and classes. To see them on the live pages, run `npm run dev`, load a page, and paste this into the DevTools console:

  ```js
  document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: '/plan/19-the-album/prototype/mock.css' }))
  document.head.append(Object.assign(document.createElement('script'), { src: '/plan/19-the-album/prototype/shim.js', onload: () => console.log(window.__SHIM(document)) }))
  ```

  The shim runs once per page load, so navigate by typing a URL (a full reload), then paste the two lines again. The README has the details.
- **[`screens/`](19-the-album/screens/)** holds 15 screenshots at 1200×767: 12 of the prototype (home on desktop and phone, the materials index, the 21 plates, golden beads on desktop and phone, the lesson top, steps, phone and print, the scope chart and the worksheet builder) and 3 of the site before it (home, the materials index and lesson steps).
- **[`audit-findings.md`](19-the-album/audit-findings.md)** lists all 165 verified audit findings, grouped as resolved by this PRD (with the step), fixed by the bug-fix session, or PRD 20 candidates.

## How this plan was checked

Every step's code was applied to scratch copies of the repository and checked before it was written down here. Those runs also included the token shield and the print gate, which were removed on 2026-09-29 (owner decisions 6–8). Their measurements of materials and printables no longer describe this plan and are left out.

- **Foundations (Steps 2–11)** on a copy of `0faa268`: build and tests green. The trial fonts totalled 116.7 KB.
- **Shell and hubs (Steps 12–25)** with a stand-in for the foundations: `tsc`, the full test suite and `vite build` green; every hub route server-rendered (21 plates and 0 fallback plates on `/materials`); every thumbnail rasterized and compared with the prototype.
- **Material pages, lessons and guides (Steps 26–38)** on top of that tree, with the trial woff2 files for real metrics. The 41 lessons and 6 guides were paginated at 18 page heights: 846 layouts, 0 stranded heads, 0 split steps. Headless Chrome PDFs gave the page counts quoted in Step 34.
- **Builder, kits and planner (Steps 16, 17, 39–41)** on a copy of the post-fix `dbe71b6`: build and tests green.
- **After review**, every step was applied to a copy of `dbe71b6` with Step 2's real woff2 files:
  - the route walker (with the extended selector in the Manual QA script) reported no sideways scroll and no target under 44px on 100 routes at 390 and at 820;
  - the six guides and four QA lessons printed to Letter PDFs at the page counts in Steps 34 and 38, and Step 34's snippet, run at a 720px window, reported no stranded head and no split step on all ten;
  - `tsc`, the full test suite (896 tests) and `vite build` stayed green.

**Not yet checked:** the Album's type and tokens inside materials and printables (Steps 6, 7 and 9 as revised on 2026-09-29), the mount on plain tokens (Step 28) and the step card's sheet shadow (Step 31). Each step's standard check looks at one material and one printable (convention 12), the manual QA script covers the rest, and the owner reviews every printable after PRD 19.

What could not be checked on scratch copies at all is in the manual QA script: real Safari on an iPad and an iPhone, a B&W laser printer, font rendering on Windows and macOS, and a visual pass of every page in a real desktop browser.

## Rollout

Every push to `main` deploys (Workers Builds), so PRD 19 is built on the `album` branch as a sequence of phase commits, starting with Phase 1.

- Every commit builds, passes `npm test`, and leaves every page coherent: old layout in new type is fine; a broken page is not. Each step's **Check:** says what to look at (convention 12).
- **Proposal (Claude's, not an owner rule): fast-forward `main` once, after Phase 7.** The live site then goes from today's design to the finished Album in one step and never shows a half-converted page or the in-between lesson print. If the owner wants the Album live sooner, the end of Phase 3 (type, shell and hubs) is a coherent stopping point (open question 18).
- **What each phase does to print.**
  - Printables (worksheets, kits, the planner's plan and journal, the control charts and the arrow labels) take the new faces, lining figures and chrome tokens in Phase 1 (Steps 6–7). Nothing else about them changes in PRD 19; the desk under their previews (Phase 6) is screen only.
  - Lessons and guides are not `.print-sheet`s. Their *type* changes in Phase 1 (Newsreader, the new heading scale and weights, ink and rubric); in Phase 5 their *layout* becomes the album print design (owner decision 3). The in-between print (new type on the old print layout) must stay coherent; under the proposal above it never ships.
- Phase 6 depends only on Phases 1–3, so it can be built before Phase 5.
- If a step breaks a page, fix it inside that phase's commit before pushing the branch.
- **After Phase 7: the printables review.** The owner looks at every printable in its Album version and makes a list of changes (Step 43 adds the checklist to `plan/QA-CHECKLIST.md`). Proposal: that list, with the audit's print-content candidates, becomes the printables PRD; the owner decides its number and scope.

| Phase | Steps | Commit message | What changes on screen |
|---|---|---|---|
| 1 | 2–4 | Self-host Newsreader and MM Sans | nothing: the faces are declared, not applied; the service worker precaches them |
| 1 | 6–11 | Paper, ink and rubric: the album's type, tokens, icons and meta line | new paper, type, rubric buttons, line icons and the meta line, on the old layouts; materials and printables in the new faces with lining figures; lessons and guides also *print* in the new type on their old print layout |
| 2 | 12–13 | Running head, colophon and PageHeader | new header, nav ribbon, colophon, shared column |
| 2 | 14–15 | Plates and contents components | Home, which already uses `.home-hero` and `.home-cta`, gets the display-size title and stacks its three buttons on its old markup until Step 23; nothing else (the components and the rest of the CSS are unused) |
| 2 | 16–17 | Forms, panels and the desk | every field 44px and restyled; the desk available but unused |
| 3 | 18–25 | Hub pages as contents lists | every hub is a contents list; the card grid is retired |
| 4 | 26–31 | Material pages as mounted plates | toolbar, help line, plate, notes, walk-through card |
| 5 | 32–34 | The lesson album on screen and paper | lesson pages; **lesson print changes** (intended) |
| 5 | 35–38 | Guides and the scope chart on screen and paper | guides and the scope chart; **guide print changes** (intended) |
| 6 | 39–40 | Worksheet builder and kit pages in the album | PageHeader actions, settings panel, desk |
| 6 | 41 | The planner in the album | shelf, picker and desk |
| 7 | 42–43 | Retire legacy chrome and close PRD 19 | nothing |
| — | | **Release** (proposal): fast-forward `main` | |
| — | | **Printables review** by the owner; the list becomes the printables PRD (proposal) | |

### Progress

- **2026-09-29.** Phase 0 (Step 1, the print regression gate) was built and then removed at the owner's request (owner decision 6): its commit, the `album-baseline` tag, the baseline checkout and the stored measurements are deleted. The token shield (Step 5), which the gate existed to prove, was removed from the plan at the same time; it had not been built. Implementation starts with Phase 1 on the `album` branch, from `bbbdb44`.
- **2026-09-29.** Steps 2–4 landed as "Self-host Newsreader and MM Sans": the fonts total 116.5 KB (48.1 + 38.6 + 29.8), the fallback overrides match Step 3 exactly, and `dist/sw.js` precaches 54 assets. No code deviations. One check note: `vite preview` sends `Vary: Origin`, so its precached fonts don't match the browser's font requests and fail offline; on a plain static server all three load offline from the cache. Confirm Cloudflare sends no `Vary: Origin` on `/fonts/` (manual QA A17).
- **2026-09-29.** Steps 6–11 landed as "Paper, ink and rubric: the album's type, tokens, icons and meta line", completing Phase 1: the Album tokens and Newsreader preload, base type with the chrome guard and the materials-and-printables block, the 14-glyph `Icon` set, the chrome and rubric buttons, every emoji replaced (the guard test scans TS, TSX and CSS), and the meta line. 882 tests (4 new). No code deviations. Check notes: the glossary has no h2 yet, so Step 7's phone h1/h2 check ran on `/parents/how-to-present` (36px over 28px); headless Linux Chrome draws small tracked MM Sans capitals with a gap after T (the unhinted subset, open question 2), while the owner's macOS Chrome draws them cleanly. In-between look until Step 28: material toolbars mix faces. The materials' own toolbar buttons (addition charts, number cards, bead frame), and the toolbar labels and selects, ask for `--font-body` and draw in Newsreader beside the MM Sans Sound and Focus. This is to spec (convention 5), but it is one more reason not to release `main` before Phase 4 (open question 18).
- **2026-09-29.** Steps 12–13 landed as "Running head, colophon and PageHeader": `layout.css` (shared column, running head with the silk ribbon, phone nav scroller, colophon, fleuron, PageHeader and text-link rules), the new `Layout` shell, the old shell rules removed from `global.css`, the temporary 4px phone shell bleed in `materials.css`, and `PageHeader.tsx` (not yet used by any page). No code deviations. Checks at 1400: header, main and footer all start at x = 166; the ribbon is at y = 0 (`-20px`, link top 20); nav lefts identical on `/materials` and `/ages`; the 404 colophon ends at the viewport bottom. At 390: the golden-bead stage is still 366px, the header is 109px, "By Age" is scrolled into view with its underline, and Tab scrolls "Planner" clear of the fade. Every nav and colophon link is at least 44×44. The worksheet print is pixel-identical. On a temporary, uncommitted mount on `/materials`, PageHeader set the tab title and client navigation to `/` restored `index.html`'s. Check note: `/planner` still scrolls sideways at 390 (63px, the preset and day selects; audit S1-02, Step 41).
- **2026-09-29.** Steps 14–15 landed as "Plates and contents components": `STAMP_COLOR` exported from `StampTile.tsx`, `MaterialThumb.tsx` (21 plates, the sheet, kit and album glyphs, the strand fallback) with its 4 coverage tests, `Contents.tsx` (`ChapterHead`, `ContentsRow`, `AgeMeta`, `strandMeta`) with its test, and `contents.css`, imported after `layout.css`. 887 tests (5 new). No code deviations. Checks: no colour literal in `MaterialThumb.tsx`, no `:has(` or `[style` in `contents.css` or `layout.css`; renaming a `THUMB_ART` key fails the coverage test naming that slug. Home shows the display title and stacks its three buttons on its old markup, as expected until Step 23; `/materials`, `/ages` (1400 and 390) and golden beads (1400 and 390) are pixel-identical to the previous commit, and so is the worksheet print. On a temporary, uncommitted mount on the 404 page, all 24 drawings matched the prototype's plate sheet (golden beads in true proportion, decision 12), rows were at least 72px, stacked at 820, and at 390 moved the meta under the summary and hid the arrow, with no sideways scroll; and hover gave the 8px paper-warm wash, rubric title and 3px arrow nudge.
- **2026-09-29.** Steps 16–17 landed as "Forms, panels and the desk", completing Phase 2: `forms.css` (panels, fields, the 44px control skin, dashed disabled controls, the date input, checkbox rows), imported after `contents.css`; the old field rules removed from `global.css` and `worksheets.css`; `SheetPreview`'s `desk` prop with the content-box zoom, and the screen-only desk block in `worksheets.css`. 887 tests. No code deviations. Checks: on `/worksheets/multi-digit-ops` at 1400 every select and number field is 44px, checkbox rows are 44px or taller, and each help line starts under its label text (x = 220, box at 186); the planner's "Week of" is a full-width 44px MM Sans date box under its label; no sideways scroll and no small control on the builder and `/kits/strip-boards` at 390 and 820. Without `desk`, golden beads and the kit (first screen at 1400), both chart sheets and the Hundred chain's arrow labels are pixel-identical on screen, and the worksheet, control-chart and arrow-label prints are identical. On a temporary, uncommitted `desk` mount on the builder, the pages lie on the desk with the sheet shadow and fit its content box exactly (24px each side at 1400 and 820, 12px at 390, no sideways scroll), and the print is still identical. Check note: the PRD says the planner's picker selects keep their old look until Step 41; they keep planner.css's 38px height, font and 45% fade, but forms.css's `.planner-row select:disabled` rule outranks planner.css's base rule, so disabled ones are already dashed on a transparent fill. `/planner` still scrolls sideways at 390 (63px, Step 41).
- **2026-09-29.** Phase 1 review fixes landed as "Fix review findings for Phase 1". Step 11: the gap after the age stamp is now the stamp's own trailing margin (`.badge.age:not(:last-child)`), so a meta line that wraps right after the stamp starts flush. The mirror case, a wrap right before a stamp that follows a badge (today only the lesson meta at 390, which Step 32 rewrites), keeps its 0.75em lead, because fixing it needs `:has()` or new markup. Deviation: the review asked for the margin on every stamp; `:not(:last-child)` keeps a lone stamp flush in a right-aligned contents-row meta. Docs: open questions 27 (Newsreader's small operator signs) and 28 (the checkerboard's grey tiles and the snake game's black beads follow `--ink-soft` and `--ink`; the fix waits for the owner, because it edits a material file); the Step 28 and Step 43 checks; the Phase 1 note on mixed toolbar faces; `plan/README.md`'s status row. The `.page-intro` finding needed no change: since Step 12, `layout.css` sets it as the 21px ink lede.
- **2026-09-29.** Steps 18–25 landed as "Hub pages as contents lists", completing Phase 3: `/materials`, `/worksheets`, `/kits`, `/lessons`, `/parents`, `/ages` (with the shared `ageBands.ts` and its 3 tests), Home and the 404 are PageHeader + contents lists, and the old home and card-grid rules are gone from `global.css` (`.card` stays until Step 42). 890 tests (3 new). No code deviations. Checks: 7 chapter heads with bead bars of 1–7 beads and 21 plates (0 fallbacks) on `/materials`; every contents row at least 72px and no sideways scroll or control under 44px on home, the six hubs, the three bands and five 404 routes at 390, 820 and 1400; Plate I measures 136, 110, 110 and 11px; `/ages` tabs are 119px each at 390 and switching bands replaces history; the row hover (wash, rubric title, arrow nudge) checked in the owner's macOS Chrome; golden beads and the worksheet print are identical to Step 17's. Check notes: at 1400×900 the 404 is now 1047px tall, so its colophon starts in the first screen and ends flush at the page foot, with no gap below; Step 25's `a\.card` grep also matches `data.cards` in the command-cards generator (not a hub); the `/ages` materials and worksheets lists and home's bands start without an ink rule over their first row (as specified: only `/parents` and the 404 use `contents-first`).
- **2026-09-29.** Phase 2 review fixes landed as "Fix review findings for Phase 2". Step 12: Chrome's focus scrolling ignores `scroll-padding` for a link already partly in view, so at 390 Tab put "Kits" 9px into the phone nav's fade and ran "By Age" past the screen edge. A `Layout` focus handler (`keepFocusedLinkClear`) now scrolls any focused link fully clear of the gutter and the fade: all seven links, forward and back, headless and in the owner's macOS Chrome. At 641–700px the nav gap tightens to `--space-3`, so "By Age" no longer wraps alone (header 113px from 641). Step 16: `planner.css`'s `.planner-row select:disabled { opacity: 0.45; }` is deleted, a one-line pull-forward from Step 41, so unticked picker selects are dashed at full opacity in ink-soft (6.50:1); the Step 16 note now says what happens. Deviations: the focus handler (a scroll offset like the existing effect, not DOM surgery) and the tablet gap rule, both written into Step 12's code, decision 7 and the checks; Step 41's replace range notes the deleted line. No change for the home hero's row gap: Step 23 already deleted the legacy `.home-hero { gap: 2rem }` rule, so its row gap is `normal` with no empty rows. 890 tests; golden beads and the worksheet print are identical to Phase 3's.
- **2026-09-29.** Steps 26–31 landed as "Material pages as mounted plates", completing Phase 4: `plateCaption.ts` with its 4 tests and `MaterialNameContext.ts`; `MaterialShell` renders the ruled toolbar (task group, Sound/Focus group), the +/− help line and `figure.material-plate > .material-stage-frame > .material-stage` with its caption; `materials.css` gets the shell, toolbar, mount, focus-mode and phone rules (Step 12's temporary shell bleed is gone), the scroll veil and the notes/link columns; `MaterialPage` is a PageHeader with Walk-through actions, two ruled note columns and two link columns; the walk-through step card is re-skinned and `.presentation-launch` deleted. 894 tests (4 new). No code deviations. Checks: all 22 shells (21 materials and the thousand chain) mount one stage; at 1400 the golden-bead stage starts at y = 459 (519 before this unit, 517 after Step 28 alone, while the Walk-through row still sat above the toolbar) and the notes' right column ends flush with the plate; at 390 the stage is 366px, Sound and Focus are 44×44 top right, and MODE, Free build, Hide total / Reset take two rows; checkerboard at 820 wraps its task controls into three rows level with Sound and Focus, and "Set" is 44px at 390; the seven materials' toolbar buttons have the ink edge and 3px corner, and the chart toolbars compute to MM Sans; focus mode on bead frame, cards & counters, teen board and decimal board puts Exit focus top right at 1400 and 390 and Esc exits; the veil reads 1 → 0 on golden beads at 390, 0 at 1400, 1 on checkerboard at 820 and 0 under reduced motion, a tap through it exchanges, focus scrolls the "10 units → 1 ten" button clear (150 → 306), and the stamp game has no stacking-context ancestor; every element inside all 21 stages is unchanged at 1400, 820 and 390 against the previous commit (Math.random pinned for the shuffled bead stair, cards & counters and chains); no sideways scroll and no control under 44px on all 21 material pages at 390, 820 and 1400; the control charts and the hundred and thousand chains' arrow labels (colour and B&W) and the worksheet print are identical to the previous commit's; the step card is ink-edged with square corners and rubric quotes, Step 9 → Previous ×3 gives PRD 11's step-6 mat, and it does not print; the look checked in the owner's macOS Chrome. Check note: Step 29's focus snippet found the Tens column's "1 ten → 10 units" first (`includes('10 units')`), a disabled button that cannot take focus; the snippet now uses `startsWith('10 units')` (a check fix, not code). The number-cards view toggle sits inside the stage, so the toolbar rule never reaches it; its pressed blue outline is unchanged.
- **2026-09-29.** Phase 3 review fixes landed as "Fix review findings for Phase 3". Step 15 (first live in Phase 3): `.contents-row:focus-visible` now has `outline-offset: 0` instead of `-3px`. Rows have no side padding (and none on the right at ≤640px), so the inset ring crossed the first letter of plate-less titles on the 404, the plate's ink edge and the summary's last glyphs; the ring now sits on the row's edge inside the 8px wash, clearing title, summary and plate at 390, 820 and 1400 with no sideways scroll (headless and the owner's macOS Chrome). `.part-entry` and `.band-tab` keep `-3px` (both have padding). Print: `contents.css` keeps a hub's `.note` whole (`break-inside: avoid`) and hides `.note-action`, so printing `/parents` no longer strands "Plan the week" at the foot of page 1 or prints "Open the planner →"; home's note also prints whole. Step 21: "My Work" in the note is set with `&ldquo;`/`&rdquo;`, like the kits lede (code block updated). Step 24's check now says the 404's colophon starts in the first screen and ends flush at the page foot (the page is 1047px at 1400×900). Deviations: the two CSS fixes are also written into Step 15's code block, and manual QA A3 gets the same 404 colophon wording as Step 24. Not applied: `contents-first` on the `/ages` materials and worksheets lists, which the review marks optional and the owner's call (Step 22 specifies plain `contents`); left for the owner. 894 tests; golden beads and the worksheet print are unchanged.
- **2026-09-29.** Steps 32–34 landed as "The lesson album on screen and paper": `LessonPage` is the album page (running head with Print, the title over the Oxford rule, the centred lede, `aria-labelledby` sections with `h3` aim subheads, real `span.step-num` numerals in a `role="list"` `ol`, decision 26's chrome copy, `useDocumentTitle`, the end fleuron), and `album.css` is rewritten for screen (margin-head grid, hung rubric numerals, spoken lines on a rule, run-in vocabulary, 44px lesson links) and print (3px double rule, 8.5pt heads in a 10rem gutter, black numerals and quotes, no band). 894 tests. Deviation: `.album li > :last-child { margin-bottom: 0 }` (0,2,1) outranked `.album-links a` (0,1,1) and zeroed the bottom half of the tap-target's negative margin, so each "Before this lesson" row grew from 28.8 to 38.8px, against Step 33's "line spacing unchanged"; the tap-target selectors are now `.album .album-links a, .album .album-printable a`, which win on order (also written into Step 33's code block). Checks: at 1400 MATERIALS is at y = 444 (also in the owner's macOS Chrome), 220px left of its list, every numeral 14.4px left of its step, `document.title` "Golden Bead Addition · Montessori Math", 9 step numerals for 9 steps, no `[style]` in the album; `/lessons/stamp-game-intro` reads "No materials at home? Use the virtual Stamp Game or Golden Beads & Mat."; "Printable: …" is its own line; `/lessons/nope` is the 404; Walk through opens `/materials/golden-beads?present=golden-beads-addition` with the step card; every lesson link is 44px or taller with rows unchanged (28.8px); at 390 heads stack, title and lede are left-aligned; the page checker reports no sideways scroll and no target under 44px on all 41 lessons at 390, 820 and 1400. Print (Letter, headless Chromium): checkerboard-multiplication, decimal-board-operations, racks-and-tubes and golden-beads-addition on 4, 4, 4 and 3 pages, as expected (the in-between print before this unit was 3, 4, 4 and 3); Step 34's snippet at 720px reports no stranded head and no split step on all 41 lessons. Golden beads at 1400 and the worksheet print are identical to the previous commit's. Check notes: no lesson today has more than one next-in-strand lesson or more than two virtual materials, so the comma list and "A, B or C" are untested on real content; adjacent "Before this lesson" links' padded boxes (48.8px each on a 40.8px pitch) overlap by 8px, as the PRD's CSS specifies; Step 34's B&W laser test moves to the owner's printables review (Step 43), since no printer is at hand.

## Implementation

The steps live in one file per phase, in build order:

- **Phase 0 — removed.** Step 1, the print regression gate: *Removed 2026-09-29* at the owner's request (owner decision 6).
- **[Phase 1 — Foundations](19-the-album/phase-1-foundations.md)** (Steps 2–11)
  - Step 2 — Self-hosted fonts: the authoring script and the committed files
  - Step 3 — `fonts.css`: the @font-face rules and metric-matched fallbacks
  - Step 4 — Service worker: precache confirmation and the font budget
  - Step 5 — *Removed 2026-09-29* (the token shield; owner decisions 6–8)
  - Step 6 — The Album's chrome tokens, the font preload and the theme colour
  - Step 7 — Base element styles, and the Album's type in materials and printables
  - Step 8 — `Icon.tsx`: the 14-glyph line icon set
  - Step 9 — Buttons: the chrome `.btn`, the rubric primary, `.icon`, `.visually-hidden`
  - Step 10 — Replace every emoji icon, and guard against new ones
  - Step 11 — The meta line: badges, the age stamp, section labels
- **[Phase 2 — Shared components](19-the-album/phase-2-shared-components.md)** (Steps 12–17)
  - Step 12 — Running head, colophon and the shared column
  - Step 13 — `PageHeader`: one header pattern for every page type
  - Step 14 — `MaterialThumb`: a mounted plate for each of the 21 materials
  - Step 15 — Contents components and the contents stylesheet
  - Step 16 — Forms and panels: `forms.css`
  - Step 17 — The desk: `<SheetPreview desk>`
- **[Phase 3 — Hub pages](19-the-album/phase-3-hub-pages.md)** (Steps 18–25)
  - Step 18 — `/materials` as a contents list with plates
  - Step 19 — `/worksheets` and `/kits` as contents lists
  - Step 20 — `/lessons` as a numbered contents list
  - Step 21 — `/parents` as a numbered contents list, with the planner note
  - Step 22 — `/ages`: segmented band tabs and contents rows
  - Step 23 — Home, the title page of the album
  - Step 24 — The 404 page, with ways onward
  - Step 25 — Retire the card grid
- **[Phase 4 — Material pages](19-the-album/phase-4-material-pages.md)** (Steps 26–31)
  - Step 26 — The plate caption and the material-name context
  - Step 27 — `MaterialShell`: the ruled toolbar, the utility group, the help line and the mounted plate
  - Step 28 — The shell stylesheet: toolbar, help line, plate mount, focus mode, phone
  - Step 29 — The scroll veil on wide mats
  - Step 30 — The material page: PageHeader, Walk-through, two-column notes and links
  - Step 31 — The walk-through step card
- **[Phase 5 — Lessons and guides, on screen and on paper](19-the-album/phase-5-lessons-and-guides.md)** (Steps 32–38)
  - Step 32 — The lesson page markup: running head, lede, sections, hung numerals
  - Step 33 — The album stylesheet (screen)
  - Step 34 — The lesson print design and page-break QA
  - Step 35 — Guide header and guide page
  - Step 36 — The Scope & Sequence chart
  - Step 37 — The guides stylesheet (screen)
  - Step 38 — Guide and scope-chart print
- **[Phase 6 — Builder, kits and planner](19-the-album/phase-6-builder-kits-and-planner.md)** (Steps 39–41)
  - Step 39 — The worksheet builder
  - Step 40 — Kit pages
  - Step 41 — The planner
- **[Phase 7 — Sign-off](19-the-album/phase-7-sign-off.md)** (Steps 42–43)
  - Step 42 — Retire the last legacy chrome rules
  - Step 43 — Final checks, docs and the printables hand-off

## New & modified files

| Path | New/Modified | Steps | Purpose |
|---|---|---|---|
| `scripts/fonts/build-fonts.py` | new | 2 | One-time font authoring script (fontTools, run outside npm) |
| `public/fonts/newsreader-roman.woff2`, `newsreader-italic.woff2`, `mm-sans.woff2`, `OFL.txt` | new | 2 | The self-hosted fonts and their licence |
| `src/styles/fonts.css` | new | 3 | `@font-face` rules and metric-matched local fallbacks |
| `src/main.tsx` | modified | 3, 12, 15, 16 | Imports `fonts.css`, `layout.css`, `contents.css`, `forms.css` (convention 9) |
| `scripts/generate-sw.mjs` | modified | 4 | 200 KB font budget and a build-log line |
| `src/styles/tokens.css` | rewritten | 6 | Chrome tokens, type and space scales, `--font-numeral`; material and legacy shape tokens unchanged |
| `index.html` | modified | 6 | Newsreader preload; theme colour `#f6f1e7` |
| `public/manifest.webmanifest` | modified | 6 | Background and theme colour `#f6f1e7` |
| `src/styles/global.css` | modified | 7, 9, 11, 12, 16, 23, 25, 42 | Base elements, the materials-and-printables type block, buttons, helpers, meta line; the old shell, card-grid, home, field, `.card` and `.page-intro` rules removed |
| `src/components/Icon.tsx` | new | 8 | The 14-glyph line icon set |
| `src/components/Icon.test.ts` | new | 8, 10 | Icon data test and the no-emoji guard |
| `vite.config.ts` | modified | 10 | `test.css.include` for `?raw` stylesheets, so the no-emoji guard reads CSS |
| `src/components/PrintButton.tsx` | rewritten | 10 | Rubric primary with the print glyph |
| `src/components/MaterialShell.tsx` | modified, then rewritten | 10, 27 | Icon toggles; then the toolbar groups, help line and mounted plate |
| `src/worksheets/BuilderPage.tsx` | modified, then rewritten | 10, 39 | Icon button; then PageHeader actions, settings panel, desk |
| `src/planner/PlannerPage.tsx` | modified, then rewritten | 10, 41 | Icon button; then PageHeader, shelf first, grouped picker, desk |
| `src/pages/Home.tsx` | modified, then rewritten | 10, 23 | Emoji removed; then the title page |
| `src/styles/layout.css` | new, then modified | 12, 42 | Shared column, running head, nav, colophon, fleuron, PageHeader, text links |
| `src/components/Layout.tsx` | modified | 12 | `site-shell`, `container`, `data-label`, phone nav scroll, colophon links |
| `src/components/PageHeader.tsx` | new | 13 | `PageHeader`, `useDocumentTitle`, `SITE_NAME` |
| `src/components/StampTile.tsx` | modified (one `export`) | 14 | `STAMP_COLOR` shared with the plates |
| `src/components/MaterialThumb.tsx`, `MaterialThumb.test.ts` | new | 14 | 21 plates, 3 glyphs, fallback; coverage test |
| `src/components/Contents.tsx`, `Contents.test.ts` | new | 15 | `ChapterHead`, `ContentsRow`, `AgeMeta`, `strandMeta` |
| `src/styles/contents.css` | new | 15 | Chapters, rows, plates, home, notes, band tabs |
| `src/styles/forms.css` | new | 16 | Fields, checkbox rows, date input, disabled controls, field grid, panels |
| `src/styles/worksheets.css` | modified | 16, 17, 39 | Old field rules out; the desk; builder and kit chrome. Printed-sheet blocks untouched |
| `src/components/SheetPreview.tsx` | modified | 17 | `desk` prop; content-box zoom |
| `src/materials/MaterialsIndex.tsx` | rewritten | 18 | Contents list with plates |
| `src/worksheets/WorksheetsIndex.tsx`, `src/kits/KitsIndex.tsx` | rewritten | 19 | Contents lists; presets and pieces as a note line |
| `src/lessons/LessonsIndex.tsx` | rewritten | 20 | Numbered contents list |
| `src/parents/ParentsIndex.tsx` | rewritten | 21 | Numbered contents list and the planner note |
| `src/pages/ageBands.ts`, `ageBands.test.ts` | new | 22 | Shared age-band data |
| `src/pages/AgesPage.tsx` | rewritten | 22 | Segmented tabs, tabpanel, contents rows |
| `src/pages/NotFound.tsx` | rewritten | 24 | PageHeader and six hub rows |
| `src/components/plateCaption.ts`, `plateCaption.test.ts`, `src/components/MaterialNameContext.ts` | new | 26 | The plate caption and the material-name context |
| `src/styles/materials.css` | modified | 7, 12, 27, 28, 29, 30 | The number-card and stamp faces (Step 7); temporary phone shell bleed (Step 12, replaced in Step 28); plate margin; shell chrome, toolbar buttons, scroll veil, page notes. The material rules are otherwise untouched |
| `src/materials/MaterialPage.tsx` | rewritten | 30 | PageHeader, Walk-through, two-column notes and links |
| `src/styles/presentation.css` | modified | 31 | The walk-through step card |
| `src/lessons/LessonPage.tsx` | rewritten | 32 | Running head, lede, sections, hung numerals |
| `src/styles/album.css` | rewritten | 33, 34 | Album page on screen and in print |
| `src/parents/GuideHeader.tsx` | new | 35 | PageHeader with Print for every guide |
| `src/parents/GuidePage.tsx` | rewritten | 35 | No inline Print row |
| `src/parents/guides/faq.tsx`, `glossary.tsx`, `how-to-present.tsx`, `montessori-math-overview.tsx`, `using-this-site.tsx` | modified | 35 | `GuideHeader`, layout classes, `.guide-scene` |
| `src/parents/guides/scope-and-sequence.tsx` | rewritten | 36 | Chapter-head strand rows, column classes, phone labels |
| `src/styles/guides.css` | rewritten | 37, 38 | Guides on screen and in print |
| `src/kits/KitPage.tsx` | rewritten | 40 | PageHeader with Print, panel, desk |
| `src/styles/planner.css` | modified (screen half) | 16, 41 | The disabled selects' 45% fade removed (Step 16, Phase 2 review); then the planner chrome. The printed-page rules are untouched |
| `src/planner/state.ts`, `state.test.ts` | modified | 41 | `groupByStrand` and its tests |
| `plan/19-the-album.md`, `plan/README.md`, `PLAN.md`, `plan/QA-CHECKLIST.md` | modified | 43 | Status, overview, and the owner's printables review checklist |
| `CLAUDE.md` | modified | 43 | The new components and stylesheets, the materials-and-printables type block, the chrome guard, no emoji, plates for new materials |
| `README.md` | modified | 43 | The fonts' SIL OFL 1.1 exception in the License section |

**Not edited by PRD 19:** every file under `src/materials/<slug>/`, `src/worksheets/generators/` and `src/kits/kits/`; `beads.tsx` and `NumberCard.tsx`; `print.css`, `kits.css` and `SheetPage.tsx`; `PresentationOverlay.tsx`; the registries and `App.tsx`; `package.json`, `package-lock.json`, `public/_headers` and `wrangler.jsonc`. Materials and printables still take the Album's type, through the tokens and Step 7's block; changes to their layout and content wait for PRD 20 and the owner's printables list.

## Testing

Eighteen new tests, all pure data or logic in the node environment. Nothing is rendered (project convention: test pure logic, not React).

| File | Tests | Step | What they prove |
|---|---|---|---|
| `src/components/Icon.test.ts` | 2 | 8 | The 14 glyph names, each once, each with a drawing |
| `src/components/Icon.test.ts` | 2 | 10 | The whole source tree (TS, TSX and, through `vite.config.ts`, CSS) is scanned, and no pictographic emoji, U+FE0F, ⛶ or ✕ appears anywhere in `src/` |
| `src/components/MaterialThumb.test.ts` | 4 | 14 | Every registry material has a plate; the three glyphs exist; unknown or inherited keys get the fallback; no stale drawings |
| `src/components/Contents.test.ts` | 1 | 15 | `strandMeta` formats a strand's ages and grades |
| `src/pages/ageBands.test.ts` | 3 | 22 | Band order and ids; every band's signature material has a plate; `overlapsBand` is inclusive at both ends |
| `src/components/plateCaption.test.ts` | 4 | 26 | The caption for each surface, without a name, and for all 21 registered materials |
| `src/planner/state.test.ts` | 2 | 41 | `groupByStrand` shows every lesson, worksheet and material once in strand order, skips empty strands and keeps item order |

Existing suites are untouched and must stay green. The browser-level checks a unit test can't make (layout, print, contrast) are each step's standard check (convention 12), the page-break snippet, the manual QA script and, after PRD 19, the owner's printables review.

## Manual QA script

**Setup.**
- `npm run build && npm run preview`, then open the LAN URL in Chrome. Clear site data before the first visit.
- Widths are DevTools device mode: 1400×900, 820×1180 with touch emulation, and 390×844. Where a step says so, repeat it on a real iPad and a real phone over LAN or Tailscale.
- **The page checker.** Paste once per page; both numbers must be 0. It measures every control and every stand-alone link (nav, colophon, contents rows, text links, lesson links); links inside a running sentence are exempt, as WCAG 2.5.8 allows:
  ```js
  (() => { const d = document.documentElement; const s = [...document.querySelectorAll('main button, main select, main input:not([type=checkbox]):not([type=radio]), main a.btn, .site-header a, .site-footer a, a.contents-row, a.text-link, .link-row-title, .album-links a, .album-printable a')].filter((e) => !e.closest('.material-stage, .print-sheet') && e.offsetParent && (e.offsetHeight < 44 || e.offsetWidth < 44)); return { overflowX: d.scrollWidth - d.clientWidth, smallControls: s.length } })()
  ```
- **The route walker.** Runs the same check on every page of the site: home, the six hubs with every entry they link to (21 materials, 41 lessons, 13 worksheets, 7 kits, 6 guides), the three `/ages` bands, an empty and a filled planner, and the 404. Paste it into the console on any page of the site. It takes one to two minutes; keep the tab in front. Run it with `W = 390`, then again with `W = 820`:
  ```js
  (async () => {
    const W = 390, H = 844
    const frame = document.createElement('iframe')
    frame.style.cssText = `position:fixed;left:8px;top:8px;width:${W}px;height:${H}px;border:0;outline:1px solid gray;background:white;z-index:2147483647`
    document.body.appendChild(frame)
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    async function load(route) {
      await new Promise((resolve) => { frame.onload = resolve; frame.src = route })
      // wait until the route has rendered and stopped changing (materials load lazily)
      let last = -1
      let stable = 0
      for (let i = 0; i < 80 && stable < 3; i++) {
        await sleep(150)
        const n = frame.contentDocument.querySelectorAll('main *').length
        stable = n > 0 && n === last ? stable + 1 : 0
        last = n
      }
      return frame.contentDocument
    }
    const routes = new Set(['/', '/ages', '/ages?band=6-9', '/ages?band=9-12', '/planner', '/this-page-does-not-exist',
      '/planner?l=golden-beads-addition:mon&s=math-facts.times-tables:tue&m=golden-beads:wed&s=multi-digit-ops&l=stamp-game-addition:thu'])
    for (const hub of ['/materials', '/lessons', '/worksheets', '/kits', '/parents']) {
      routes.add(hub)
      const doc = await load(hub)
      for (const a of doc.querySelectorAll(`main a[href^="${hub}/"]`)) routes.add(a.getAttribute('href').split('#')[0])
    }
    const problems = []
    for (const route of routes) {
      const doc = await load(route)
      const d = doc.documentElement
      const small = [...doc.querySelectorAll('main button, main select, main input:not([type=checkbox]):not([type=radio]), main a.btn, .site-header a, .site-footer a, a.contents-row, a.text-link, .link-row-title, .album-links a, .album-printable a')]
        .filter((e) => !e.closest('.material-stage, .print-sheet') && e.offsetParent && (e.offsetHeight < 44 || e.offsetWidth < 44))
      const overflow = d.scrollWidth - d.clientWidth
      if (overflow > 0 || small.length) problems.push(`${route}: ${overflow}px sideways, ${small.length} control(s) under 44px`)
    }
    frame.remove()
    return `${routes.size} routes at ${W}px. ` + (problems.length ? '\n' + problems.join('\n') : 'No sideways scroll and no control under 44px.')
  })()
  ```

### A. Desktop, 1400

1. **Home.** A rubric kicker, the 76px display title, the ink lede, the ruled promise line, one rubric call to action and two arrow links. Plate I on the right, captioned "PLATE I. A thousand, a hundred, a ten and a unit." In Plate I the cube's front face, the square's side and the bar are all 110px. Parts I–III with plates and "Open the …" links, the three age bands as plate rows (bead stair, stamp game, checkerboard), and the note on screens under a fleuron. No emoji anywhere. Compare with `screens/home-after.webp`.
2. **Running head.** Paper, a thick-thin rule under it, the serif wordmark with the golden bead, seven 16px sans links. On `/materials`, "Materials" turns bold and a 12×22 golden ribbon hangs from the very top edge above it. Click through all seven sections: no nav item moves by even 1px.
3. **One column.** The logo, the page h1 and the colophon share one left edge. The colophon has an Oxford rule, three golden beads, two italic paragraphs and five links, each at least 44px tall. On the 404 page it ends flush at the page foot, with no gap below it.
4. **Hubs** (`/materials`, `/worksheets`, `/kits`, `/lessons`, `/parents`, `/ages`).
   - Chapter heads show the rubric number, that strand's own bead-stair bar (1 red; 2 green; 3 pink; 4 yellow; 5 light blue; 6 lavender; 7 white) and the ages.
   - Rows are at least 72px, each one link, with an underlined title and an arrow. Hover gives a paper-warm wash 8px past the plate and turns the title and arrow rubric.
   - `/materials` has 21 plates, each recognisably its material (compare with `screens/material-plates.webp`); the golden-beads plate has cube face = square side = bar length.
   - Presets on `/worksheets` and piece lists on `/kits` are plain wrapping text, not pills. There are no cards anywhere.
   - `/parents`: six numbered rows, then the "Plan the week" note with its fleuron and a 44px "Open the planner →" link.
   - `/ages`: three equal tabs. Switching bands changes the URL without adding history, and the selected tab is unmistakable in greyscale (DevTools › Rendering › Emulate vision deficiency › Achromatopsia).
5. **`/materials/golden-beads`.** Compare with `screens/golden-beads-after.webp`.
   - The PageHeader: title, `[AGES 4–7] GRADES PK–1 · THE DECIMAL SYSTEM`, the ink lede, and "Walk through: Golden Bead Addition" with a play glyph at the top right.
   - The ruled toolbar: MODE centred on its select at the left, Sound and Focus as ghost buttons with line glyphs at the right. The "How to use this material" line has a circled + that turns into − when open.
   - The mounted plate (an ink line and a paper mat inside the stage edge) starts near y = 459, captioned "PLATE. Golden Beads & Mat, on the felt work mat."
   - For parents | Make the real thing, then Lessons | Printable follow-up, as two ruled columns flush with the plate. Kit piece counts sit on their own grey line.
   - Tap the bank's thousand, hundred, ten and unit: the total reads 1,111.
   - Focus: the plate fills the screen, the help line and caption disappear, Exit focus is at the top right, Esc exits. Repeat on bead frame, cards & counters, teen board and decimal board: Exit focus is always at the top right.
6. **Toolbars across materials.** `/materials/checkerboard` and `/materials/stamp-game`: Sound and Focus stay together at the top right; task controls wrap only inside their own group. On number cards, bead frame, bead chains, the multiplication bead board, the subtraction strip board and both chart materials, the toolbar's own buttons have the ink edge and 3px corners of the chrome buttons; a pressed number-cards view toggle keeps its blue outline.
7. **Stamp game.** On `/materials/stamp-game`, the bank's stacked stamps show no extra pale outlines behind them (the stack hint stays hidden, decision 20).
8. **Walk-through.** Press Walk through on golden beads: the step card has an ink edge, square corners, a Newsreader title and a spoken line in ink with rubric quotes. Step to 9 and back.
9. **`/lessons/golden-beads-addition`.** Compare with `screens/lesson-top-after.webp` and `screens/lesson-steps-after.webp`. The running head reads THE LESSON ALBUM · THE DECIMAL SYSTEM · LESSON 5 [AGES 5–7] GRADES K–1 with a rubric "Print this lesson" on the same row. The title sits over the Oxford rule and the lede is centred. MATERIALS hangs in the margin near y = 444. Steps carry rubric italic numerals; spoken lines are italic on a 2px rule with a faint band and rubric quotes. The page ends with the fleuron. "Walk through it on the virtual Golden Beads & Mat" opens the material with the step card.
10. **Lesson copy.** `/lessons/stamp-game-intro` reads "No materials at home? Use the virtual Stamp Game or Golden Beads & Mat." A lesson with a worksheet shows "Printable: …" on its own line.
11. **Guides.** `/parents/how-to-present`: margin heads on ink rules, the "You place the ten-bar…" scene italic, the overview's note roman. `/parents/glossary`: terms in the margin. `/parents/faq`: questions head the text column. "Print this guide" sits at the top right beside the title on every guide.
12. **Scope chart.** `/parents/scope-and-sequence` spans the full column. Strand rows are ink on paper with a rubric number and that strand's bead bar; lesson numbers are rubric. Empty cells show "—". Compare with `screens/scope-after.webp`.
13. **Builder, `/worksheets/multi-digit-ops`.** Compare with `screens/worksheet-builder-after.webp`. New problems (card stock) and Print (rubric) at the top right, above the fold. "SHEET SETTINGS" under a 2px ink rule; every field 44px; checkbox help lines up under the label. The sheets lie on the desk with a soft shadow. New problems changes the problems and the seed. Pick a preset, then edit a field: the help line reads "Based on …, with your changes." and the form does not jump. On `/worksheets/fractions`, "Name the fraction (picture → fraction)" shows in full (if it still clips in real MM Sans, record it for PRD 20).
14. **Kit, `/kits/strip-boards`.** Print at the top right; "For use with" under the lede; the panel shows "IN THIS KIT" and "ASSEMBLY" with rubric step numerals; the pages lie on the desk.
15. **Planner, `/planner`.** Empty: no Print, Copy link or Clear week. Tick five items across all three lists, pick a preset and days: the shelf lists name + kind | day | ×, and Print, Copy link and Clear week appear. Copy link reads "Copied" for 1.5s and nothing shifts. Unticked rows' selects are dashed, not faded. Preset selects line up down the column. The preview lies on the desk. The shelf stays in view while the picker scrolls.
16. **Titles.** Tabs read, for example, "Lessons · Montessori Math", "Golden Beads & Mat · Montessori Math", "Multi-Digit Operations worksheet · Montessori Math", "Addition & Subtraction Strip Boards kit · Montessori Math", "Weekly plan · Montessori Math" and "Page not found · Montessori Math". Home keeps the site title.
17. **Offline fonts.** After clearing site data and loading `/`, Network shows only `/fonts/*.woff2` font requests and no other host; Application › Cache Storage lists all three. Go offline and reload `/lessons/golden-beads-addition`: it is still Newsreader, and the spoken lines are Newsreader italic.
18. **Type inside materials.** On `/materials/number-cards`, `/materials/golden-beads`, `/materials/stamp-game`, `/materials/decimal-board` and `/materials/checkerboard`: labels and buttons on the mat are MM Sans; number-card figures are Newsreader and every digit sits on the baseline (a 0 never reads as o); stamp numerals are MM Sans; every Montessori colour looks as it does today. Small reflows are fine; nothing is clipped or overlapping.

### B. Tablet, 820 (touch emulation, then a real iPad)

1. **Header.** The title on row 1 and all seven links on row 2, left-aligned with the page. The active link is bold with a golden underline and no ribbon.
2. **Hubs.** At rest each row reads as tappable (underlined title, arrow). The text stacks: title and meta over the summary.
3. **Material pages.** Where the mat overflows (cards & counters, checkerboard), the right edge is veiled while more mat lies beyond, and the veil lifts at the end of the scroll. The checkerboard's task controls wrap into three rows inside their group, level with Sound and Focus.
4. **Builder.** The fields sit in two columns, so the preview starts after about 400px of form; New problems and Print are at the top right.
5. **Planner.** The shelf sits above "LESSONS". Tick an item: it appears on the shelf, and Print is on screen without scrolling.
6. **Real iPad Safari.** `/materials/golden-beads` and `/lessons/checkerboard-multiplication` in portrait and landscape: the toolbar reads as one group plus the utilities, the plate is mounted, and lesson heads hang in the margin. If Safari lacks `timeline-scope`, there is no veil, which is the intended fallback. The planner's date input is a 44px left-aligned box, and the selects open the native picker.
7. **The route walker at 820** reports no sideways scroll and no control under 44px.

### C. Phone, 390 (emulation, then a real phone)

1. **The route walker at 390** reports no sideways scroll and no control under 44px on every page.
2. **Header.** About 110px tall, with one sideways-scrolling nav row fading at the right edge. On `/ages` the nav starts scrolled so "By Age" is visible and underlined; scrolled to its end, "By Age" is fully opaque. The gutters are 16px.
3. **Home.** Plate I sits under the title within the first screen, and the call to action runs full width with its text left-aligned. Compare with `screens/phone-home-after.webp`.
4. **Golden beads.** Compare with `screens/phone-golden-beads-after.webp`. Sound and Focus are 44×44 icon-only buttons at the top right; MODE, Free build and Hide total are on the first row and Reset on the second. The plate runs 4px into the gutter and the stage is 366px wide at 390, as today, so the bank wraps as it does today (its one-row fit is PRD 20, S2-16). The mat's right edge is veiled and the veil lifts at Units. Tap THOUSAND, HUNDRED, TEN, then UNIT twice: the total reads 1,112.
5. **Lesson.** The title and lede are left-aligned, the heads stack above their text, and the numerals stay in the gutter. Compare with `screens/phone-lesson-after.webp`.
6. **Scope chart.** A list of entries: numeral | lesson, `AGES 4–6  GRADES PK–K`, `MATERIALS: …`, `PRINTABLE: …`.
7. **Builder.** New problems and Print sit under the lede, the fields are one column, and the desk sheet fits the width.
8. **Planner.** Names never break one word per line; selects drop under the name (worksheet rows: a full-width preset, then the day); remove buttons are 44px.
9. **Real phone.** The planner date field and the builder number fields open the right keyboards, and typing 25 into Math facts "Number of problems" gives 25 (the `477ac70` fix still holds).

### D. Keyboard, screen reader and reduced motion

1. **Keyboard.** Tab through the header, a hub, a material toolbar, the builder and the planner. Every control shows the 3px blue ring, and none is clipped: in the phone nav scroller, in contents rows and in the sticky shelf. Enter or Space opens the help line. On the builder, Tab runs New problems, Print, Preset … Include answer key page, Printing tips.
   - At 390 on `/materials/golden-beads`, Tab through all seven nav links and Shift+Tab back: each one, including "Kits" and "By Age" (partly in view) and "Planner" (under the right-hand fade), takes focus fully clear of the fade and the gutter, with its whole ring on screen.
   - At 390 on golden beads, the veil never hides a focused control: repeat Step 29's "10 units → 1 ten" check.
2. **Screen reader** (VoiceOver). Icon buttons are announced by their words: "Print this lesson", "New problems", "Copy link", "Sound on, button" and "Focus, button" (also when icon-only at 390). Copy link announces "Link copied." An empty scope cell reads "none". No glyph or dot is announced between meta items.
3. **Reduced motion.** DevTools › Rendering › `prefers-reduced-motion: reduce`. Row, part and button hovers change instantly, the arrow doesn't nudge, and the scroll veil is off.

### E. Print

1. **Printables still print.** Ctrl+P on `/worksheets/multi-digit-ops?seed=424242`, `/kits/strip-boards?bw=1`, the 13-item planner (Step 43's review list), "Print control charts" on `/materials/addition-charts` and `/materials/multiplication-charts`, and the Hundred and Thousand chains' arrow labels on `/materials/bead-chains`. In colour and in B&W, each prints only its sheets, non-blank, in the Album's faces with lining figures. Save one as PDF: the file name defaults to the page title. How they should look is the owner's review (Step 43), not this script.
2. **Lessons print in the album design** (Step 34). In Chrome's print preview (Letter, default margins, background graphics off), `checkerboard-multiplication`, `decimal-board-operations` and `racks-and-tubes` print on 4 pages each and `golden-beads-addition` on 3 (pass: at most one page more than today's 4, 4, 4 and 3; record the counts). The running head and the 3px double rule are there, margin heads are 8.5pt in the 10rem gutter, numerals and quote marks are black, no margin head is stranded at a page foot and no step splits. Step 34's snippet reports 0 stranded on the same four lessons. Compare with `screens/lesson-print-after.webp`.
3. **Guides print** (Step 38): FAQ 3 pages, using-this-site 3, glossary 4, how-to-present 3, montessori-math-overview 3, scope and sequence 3 (pass: at most one page more than today's 4, 3, 4, 3, 3 and 3; record the counts). Section heads print in the margin column (the glossary's terms too), not stacked above their text. No stranded question or strand head; strand heads print as black rules and column heads repeat on every page.
4. **B&W laser** (the owner's printer). Print `checkerboard-multiplication`, `decimal-board-operations`, `racks-and-tubes`, `/parents/scope-and-sequence` and `/worksheets/multi-digit-ops?seed=424242&bw=1` with the printer's black-and-white option. On paper: the double rule and hairlines are visible, the 8.5pt margin heads are crisp, spoken lines are distinguishable (italic, quotes, indent), the age prints as a box, numerals and quotes are solid black rather than dithered grey, nothing is grey on grey, and the worksheet's place values stay distinguishable without colour. If no printer is at hand during the build, this item moves to the owner's printables review.

## Acceptance criteria

- [ ] `npm run build` and `npm test` are green on every phase commit, and the 18 new tests pass.
- [ ] **Materials and printables take the Album's type** (owner decisions 7 and 8): inside every material stage, text, labels and buttons are MM Sans, and headings and numerals Newsreader; printable sheets are Newsreader; figures are lining on number cards, stamps, boards, kits and worksheets (S7-05). Stages and sheets keep their 16px base. Nothing inside a stage or sheet is clipped, overlapping, blank or unreadable (small reflows are fine).
- [ ] **Printables still print:** the 13 generators, 7 kits, the planner plan and journal, and the control charts and arrow labels on material pages each print only their sheets, non-blank, in colour and in B&W (Step 43, item 2).
- [ ] **Lesson print:** the three longest lessons print on at most 5 Letter pages each and `golden-beads-addition` on at most 4 (expected 4, 4, 4 and 3; today's `main` + 1 at most), with 0 stranded heads and 0 split steps (Step 34's snippet at a 720px window, and print preview). Guides print with margin heads, within today's count + 1 page each, and show 0 stranded heads (Step 38). The counts are recorded here, and the B&W laser print is checked (or handed to the owner's printables review).
- [ ] **Montessori colours unchanged:** no material token is re-pointed ("material tokens unchanged"), the `.bw` overrides are untouched, and the legacy shape tokens `--radius`, `--radius-sm`, `--shadow-sm` and `--shadow-md` keep today's values. No file under `src/materials/<slug>/`, `src/worksheets/generators/` or `src/kits/kits/` changed.
- [ ] No new npm dependency: `package.json` and `package-lock.json` are unchanged.
- [ ] **Fonts:** `public/fonts/` holds exactly `newsreader-roman.woff2`, `newsreader-italic.woff2`, `mm-sans.woff2` and `OFL.txt`; the woff2 files total under 200 KB (the build log says so). No font-name record in `mm-sans.woff2` (name IDs 1–6, 16, 17 and 25, and the named instances' PostScript names) contains "Source"; the upstream copyright, trademark, manufacturer, designer, vendor and designer URL, and licence records (IDs 0, 7, 8, 9, 11, 12, 13 and 14) are kept verbatim, and the description (ID 10) says it is a Modified Version of Source Sans 3. `OFL.txt` carries both copyright notices and the full licence.
- [ ] **Offline:** `dist/sw.js` precaches the three fonts and `OFL.txt`; after one visit, a lesson renders in Newsreader and Newsreader italic with the network off.
- [ ] No runtime request leaves the origin on any page type, and there is no `@import` and no font service anywhere.
- [ ] No colour literal in any TSX file. The chrome stylesheets use tokens only; `#000` appears only in print rules, as in `print.css` (Step 43's greps).
- [ ] No `:has()`, no `[style]` selector, no CSS-generated caption or kicker, and no JavaScript DOM surgery. No emoji anywhere in `src/`, stylesheets included (the guard test). Inline styles only where convention 11 allows.
- [ ] One PageHeader pattern on material, guide, builder, kit, planner, hub and 404 pages; lessons use its running-head variant. Every page except Home sets its own `document.title`, "`<name>` · Montessori Math" (S9-23); Home keeps `index.html`'s title.
- [ ] The primary action is rubric `#9a3b27` with `#fffdf8` text (6.82:1): the home call to action, every Print button, and the builder's Print. Every other chrome `.btn` is card stock with an ink edge, except the Sound and Focus ghost buttons (`.btn-utility`); the materials' own toolbar buttons also get the ink edge (Step 28).
- [ ] **Contrast:** every pair in the contrast table holds (text at least 4.5:1; field borders, the link underline and the focus ring at least 3:1).
- [ ] **Targets and focus:** every chrome control and stand-alone link (nav, colophon, contents rows, text links, lesson links) is at least 44px and every contents row at least 72px; links inside a running sentence use WCAG 2.5.8's inline exception. A visible 3px focus ring everywhere, never clipped, and never hidden under the phone nav's fade or the scroll veil. The route walker reports 0 targets under 44px at 390 and 820.
- [ ] **No sideways scroll:** the route walker reports 0 overflow on every page at 390 and at 820.
- [ ] Header, main and footer share one column at 1400, 820 and 390; the phone gutter is 16px and the phone header at most 112px.
- [ ] **Motion:** every chrome transition and animation is inside `prefers-reduced-motion: no-preference`. With reduce, hovers are instant, the arrow doesn't nudge and the veil is off.
- [ ] **Never colour alone:** the active nav link is bold, the age is a boxed stamp, spoken lines are italic with quotes and an indent, disabled controls are dashed, links are underlined, and the selected `/ages` tab is ink, bold and underlined.
- [ ] All 21 materials plus the sheet, kit and album glyphs have plates drawn with tokens only; an unknown slug gets the strand bead-bar fallback. Plate I and the golden-bead plate are in true proportion.
- [ ] `MaterialShell` renders toolbar → help → `figure.material-plate > .material-stage-frame > .material-stage` + `figcaption.plate-caption`. Sound and Focus are never stranded and Exit focus is always the top-right control. No `mask`, `z-index`, `opacity`, `transform`, `filter` or `isolation` is set on `.material-stage` or `.material-stage-frame`. Every stage keeps today's width at every width (366px at 390; the phone plate bleeds 4px, decision 19).
- [ ] **Printables hand-off:** the owner's printables review checklist is in `plan/QA-CHECKLIST.md` (Step 43). Neither the printables PRD nor PRD 20 is started without the owner's go-ahead.
- [ ] The manual QA script passes. This PRD's status, `plan/README.md`, `PLAN.md`, `plan/QA-CHECKLIST.md`, `CLAUDE.md` and the `README.md` licence note are updated (Step 43).

## Audit findings this PRD resolves

Each entry is listed in full, with its cause and fix hint, in [`19-the-album/audit-findings.md`](19-the-album/audit-findings.md).

| Finding | Steps | How |
|---|---|---|
| S7-05+S6-04+S2-03+S3-07+S4-12+S9-18 | 6, 7 | Newsreader's lining figures replace Georgia's old-style ones on number cards, boards, kits and printables (`--font-numeral`, `--font-heading`); every stage and sheet sets `lining-nums` |
| S1-01 | 11, 19 | Badges wrap; kit piece lists and presets are a plain `.row-note` line, so no pill overflows and no page scrolls sideways |
| S1-02 | 41 | Planner rows wrap and the selects drop under the name at ≤560px |
| S1-04 | 15, 18–24 | Rows, not boxes: one whole-row link per entry |
| S1-05 | 15, 18–24 | Contents lists have no grid, so no orphan columns; home parts go 3 → 1 |
| S1-06 | 20 | Numbered rows with the overview in a 36rem column |
| S1-07+S8-21+S6-24 | 12 | Tablet: one left-aligned nav row; phone: one scrolling row, header about 110px |
| S1-08 | 23 | One primary action plus two text links; full-width primary on phones |
| S1-09 | 14, 23 | Plate I and the golden-bead plate derive from one bead unit; Plate I shows on phones |
| S1-11 | 16, 41 | The date input gets the field skin |
| S1-12 | 41 | Strand heads get `--space-6` above and `--space-2` below |
| S1-13 | 41 | Fixed 12.5rem/8.5rem select widths at 44px; picker grouped by strand |
| S1-14 | 41 | The shelf comes first and sits above the picker at ≤900px |
| S1-15 | 11, 19 | Presets are plain "Presets: …" text |
| S1-16+S3-24+S8-19 | 12 | One `.container` for header, main and footer |
| S1-17 | 12, 24 | Sticky colophon; the 404 lists the six hubs |
| S1-18+S8-06+S5-02+S6-25+S2-20+S5-01 | 7 | `text-wrap: balance` on chrome headings and `pretty` on chrome paragraphs (sheet instructions inside printables are untouched) |
| S1-19 | 15 | No card paddings: rows |
| S1-20 | 15 | One `ChapterHead` and one `ContentsRow` anatomy on every hub |
| S1-21 | 22 | Segmented band tabs and full-width rows with overviews |
| S1-22+S5-15 | 20, 22, 32, 33 | Lesson links are ≥72px rows on `/lessons` and `/ages`, and ≥44px targets inside lessons |
| S1-23+S5-19 | 11 | The age is an ink stamp (14.04:1); the hex literals are deleted |
| S1-25 | 12 | A hidden bold `data-label` copy reserves the bold width |
| S1-26 | 41 | Planner actions are a grid: Print full width, then Copy link and Clear week |
| S1-28 | 21, 23 | Callouts become centred note asides |
| S2-08+S3-19+S4-14 | 27, 28 | Task controls wrap inside their own group; Sound and Focus pinned top right |
| S2-10+S3-11+S4-15 | 27, 28 | The help is a disclosure line with a drawn +/− marker and a 44px summary |
| S2-18+S3-23 | 30 | Notes and link lists are two ruled columns across the plate |
| S4-13+S8-10+S2-23 | 8, 9, 10, 27, 32, 39, 41 | One inline-SVG icon set with an 8px gap; every emoji removed; a guard test |
| S4-24 | 30 | The material meta reads "GRADES 1–3" |
| S5-03 | 32, 33 | One running-head row (meta and Print), 1.5rem to the title |
| S5-06+S8-08 | 33, 37 | Lessons and guides are centred 56rem pages |
| S5-08 | 32 | Play glyph, and the label names the feature "Walk through" as the material page does |
| S5-09 | 33 | Vocabulary is an italic run-in list |
| S5-10 | 33 | One section rhythm, last-child margins zeroed |
| S5-12+S8-07 | 33, 37 | A 42.25rem text column at 18px (about 70–75 characters) |
| S5-20 | 32 | "Use the virtual A or B." |
| S6-14+S7-23 | 16, 39, 40 | Every field 44px, checkbox rows ≥44px with a 22px box |
| S6-15 | 39 | A 21rem panel without card padding: selects are 336px (verify in MM Sans) |
| S6-19 | 39 | The preset help line survives edits |
| S8-01 | 36, 37 | The scope chart spans the full column |
| S8-02 | 37 | Stacked, labelled entries at ≤640px |
| S8-03 | 36, 37 | Strand rows are ink on paper (14.04:1) |
| S8-05 | 36 | An em dash plus a visually hidden "none" |
| S8-09 | 35, 39, 40 | Print sits in the PageHeader action slot on guides, the builder and kits |
| S8-18 | 7, 37 | Chrome h1 never drops below 36px; guide h2s are 1.3rem |
| S8-20 | 6, 12 | 16px phone gutter |
| S8-22 | 35, 37 | The note is roman; the scene is italic (`.guide-scene`) |
| S9-05 | 41 | No Print, Copy link or Clear week on an empty plan |
| S9-23 | 13, 30, 32, 35, 39, 40, 41 | Per-page `document.title` |
| S9-25+S8-12 | 37, 38 | Grid rows, `break-after`, orphans/widows 3; 0 stranded heads measured |
| S9-30 | 41 | Copy link in a fixed half-width cell, with a `role="status"` announcement |
| S9-33 | 27, 28 | Exit focus is always the toolbar's top-right control |

**Partly resolved** (the rest is a PRD 20 candidate):

| Finding | Steps | This PRD | Left for PRD 20 |
|---|---|---|---|
| S2-02+S3-04+S4-02 | 29 | The scroll veil: the hidden scroll is now visible | Fluid mats that fit a phone or tablet |
| S5-16 | 32, 33 | "Printable: …" on its own line on screen | The worksheet URL on paper |
| S5-17 | 34 | Tighter print layout; long lessons end 30–53% down their last page | A site name and URL on printed lessons |
| S6-13+S7-21+S6-12 | 16, 39 | A two-column field grid at 641–900px roughly halves the tablet form | The phone preview is still a ~0.41 zoom fit (owner issue #1 reported having to scroll sideways to see a worksheet) |
| S1-10 | 41 | A three-column shelf row with a fixed day column | Grouping or sorting the shelf by day |

## Open questions for the owner

Each has a default, Claude's proposal, that this PRD implements. Say so if you want the other choice.

1. **`--line-strong` and `--link-rule` are darker than the prototype.** `--line-strong` is `#8c816f` instead of `#9c907c`, because the mock value fails WCAG 1.4.11 for field borders (2.79:1 on paper, 2.51:1 on paper-warm); it also darkens the spoken-line rule and the scope chart's link underlines slightly. `--link-rule` is `#a8705f` instead of `#c79a8b`: links are ink like the text around them, so the underline is their only mark, and the mock value gave it 2.21:1 on paper. *Default: both darker values.*
2. **The fonts measure 116.6 KB,** against the prototype's 147.9 KB from Google-served files, because Step 2's subset is unhinted and keeps only the default OpenType features plus `tnum`, `lnum` and `case`. A side-by-side with the prototype screenshots is worthwhile, especially small sizes on Windows, where hinting mattered most. *Default: ship the unhinted subset.*
3. **`OFL.txt` is one combined file** carrying both copyright notices and the licence, which satisfies the licence. *Default: one file.* You may prefer one per family.
4. **The Python font script is committed** (`scripts/fonts/build-fonts.py`). It never runs in the build and is not an npm dependency. *Default: commit it, so the fonts can be regenerated and checked.*
5. **Golden beads in true proportion** (decision 12) differ from the approved prototype: the ten-bar is now exactly as long as the square's side. At 72×48 the thumbnail's bar and unit bead are thin. *Default: true proportion.*
6. **Grades are labelled on material pages only.** The material page's meta reads "GRADES PK–1" (S4-24), while chapter heads and contents rows keep the prototype's unlabelled "AGES 4–6 · PK–K" to stay on one line. *Default: as described.* The alternative labels grades everywhere, at the cost of two-line meta in some rows.
7. **Per-page titles** (S9-23) go slightly beyond pure visuals. *Default: include them.* Nothing else depends on the hook, so they can be dropped by deleting `useDocumentTitle`'s body.
8. **Thumbnails for future materials.** The coverage test fails when a registry material has no plate, while at runtime an unknown slug gets its strand's bead-bar fallback. *Default: every new material needs a plate.* If fallbacks are acceptable permanently, relax the test.
9. **`/ages` lesson rows show each lesson's overview,** which makes the page longer but fills the empty two-thirds of the desktop (S1-21). *Default: show overviews.*
10. **The `/ages` tabs** keep one tab stop per button, without the ARIA tabs pattern's arrow-key roving. *Default: as is.*
11. **Phone toolbar labels stay visible** (decision 18), so the golden-bead toolbar is two rows at 390 instead of the prototype's one. Hiding only the select labels would need `:has()` or a class in each material's controls. *Default: two rows.*
12. **Phone stages keep today's width.** The prototype bled the plate 8px into the gutter and tightened the stage padding, which widened every phone stage by 24px and let the golden-bead bank's four pieces fit on one row on your MacBook. That is material layout, which your scope choice leaves to PRD 20, so the plate bleeds only 4px, exactly offsetting the wider 16px gutter, and every stage keeps today's width. The bank wraps as it does today. *Default: today's width; the bank's one-row fit is PRD 20 (S2-16).*
13. **The scroll veil is off under reduced motion,** following convention 6, even though it only tracks the reader's own scroll. *Default: off.*
14. **The glossary and FAQ layouts** refine the prototype: terms in the margin, questions heading the text column. Both were chosen from measured page-break problems, and each can be reverted by deleting one CSS block. *Default: as specified.*
15. **Lesson chrome copy** (decision 26): "Walk through it on the virtual …" and "Printable: …". *Default: this wording.*
16. **Four small behaviour changes** (decision 34): the preset line after edits, no Print/Copy/Clear on an empty plan, the kind label on shelf items, and the picker grouped by strand. *Default: all four.* Each can be dropped without touching the rest.
17. **Planner tab order.** The shelf comes first in the DOM, so keyboard users reach the date and Print before the picker, even on desktop where the shelf is drawn on the right. *Default: shelf first.* The alternative would make visual order and focus order disagree on tablets.
18. **When the Album goes live.** Every push to `main` deploys. *Default (proposal): fast-forward `main` once, after Phase 7,* so the site goes from today's design to the finished Album in one step and the in-between lesson print never ships. If you'd rather see it live sooner, the end of Phase 3 (type, shell and hubs) is a coherent stopping point. One in-between look would ship with it: until Step 28, material toolbars mix faces, with the materials' own buttons, labels and selects in Newsreader beside the MM Sans Sound and Focus buttons.
19. **The walk-through step card is re-skinned here** (Step 31, decision 23), although no audit finding asked for it, so the card matches the lesson page. *Default: include it.* Its covering behaviour stays for PRD 20.
20. **Material text in MM Sans.** Inside a material stage, text, labels and buttons are MM Sans, the face the site uses for everything you operate; headings and numerals are Newsreader. MM Sans ships no italic; italic notes on the mat are the browser's slanted sans. *Default: as described.* The alternative sets the materials in Newsreader throughout.
21. **Material pieces keep their corners and depth.** The legacy shape tokens (`--radius` 10px, `--radius-sm` 6px and the two small shadows) are not re-pointed, because tiles, cards, trays and tickets draw with them and PRD 18 gave them their depth. *Default: keep them.* Squarer, flatter pieces in the Album's style would be material rendering, for PRD 20.
22. **Label sizes on the materials.** The Album's face reaches every label on the mat, but each material keeps its own label sizes and tracking, some as small as 0.62rem (S4-19). *Default: leave sizes to PRD 20,* where a minimum label size can be set per material.
23. **Monospace records stay.** The written records on the multiplication bead board, racks and tubes and the decimal board, and several worksheets, use `--font-mono`, and racks and tubes lines up its long-division record by character (S4-20, S6-21). *Default: `--font-mono` unchanged in PRD 19;* PRD 20 or your printables list can replace it.
24. **The focus ring on felt and wood** is nearly invisible (S9-22). It is inside the materials, but it is focus styling, not type or labels. *Default: leave it for PRD 20.*
25. **Bold numerals draw at Newsreader 600.** Number cards, kits and plates ask for weight 700; Step 2's subset stops at 600, so they draw at 600. *Default: accept 600.* Widening the subset to 700 would make the roman file larger, still under Step 4's 200 KB cap.
26. **Materials take the Album's paper, card, ink and rubric.** Without the shield, the eight chrome tokens materials share with the page take the Album's values inside every stage: card stock `#fffdf8` instead of white on pieces and trays, darker ink and hairlines, and rubric instead of terracotta for the notices and buttons seven materials draw in the accent (stamp game, division board, racks and tubes, fraction circles, bead frame and both strip boards). *Decided by the owner on 2026-09-29: take them (owner decision 9).* Review found two Montessori colours that are drawn with these tokens, so they change too: see open question 28.
27. **Newsreader's operator signs are small.** Newsreader draws + − × ÷ = at about x-height beside its lining figures: + is 0.357 em tall against 0.69 em digits (52% of the digit height, where Georgia's was about 67%), × 0.312 em and = 0.212 em. They show wherever sheet or stage text holds a sum: the stamp game's "4,918 + 3,929", the checkerboard's "4,357 × 23", worksheet answer keys ("216 + 316 = 532") and lesson prose. They are readable, but on a maths site the operators are content. *Default: accept them, and look at them in the printables review (Step 43).* The alternative draws just those five signs from MM Sans, whose advance widths match Newsreader's (0.497 em against 0.5 em), so nothing reflows. It is one more face in `src/styles/fonts.css`, after the Newsreader faces: `@font-face { font-family: 'Newsreader'; src: url('/fonts/mm-sans.woff2') format('woff2'); font-style: normal; font-weight: 350 600; font-display: swap; unicode-range: U+002B, U+003D, U+00D7, U+00F7, U+2212; }`.
28. **Two Montessori colours follow the chrome tokens.** The checkerboard's grey multiplier tiles, the authentic grey number tiles on the board's right edge, are painted with `--ink-soft` (`checkerboard.css`, `.checkerboard-card--gray`). Step 6 moved that token from `#6f6759` to `#5e5548`, so they are a darker, browner grey. The snake game's black beads are drawn with `--ink` (`SnakeGame.tsx`), `#33302a` to `#26221d`. Every `--pv-*`, `--bead-*`, `--golden*`, felt and wood value is unchanged. Until you decide, owner decision 9's "Montessori colours are unaffected" and binding rule 6 don't hold for these two pieces. *Default: as built,* because the fix edits a file under `src/materials/<slug>/`, which PRD 19 doesn't touch without your approval. Claude's recommendation: pin today's grey. In `src/styles/tokens.css`, in the material block after `--felt`, add `--checkerboard-gray: #6f6759; /* grey multiplier tiles */`, and in `checkerboard.css` change `background: var(--ink-soft);` to `background: var(--checkerboard-gray);`. The snake game's darker black is arguably more authentic and can stay. If you'd rather keep both changes, owner decision 9 and open question 26 should list them.

## Out of scope

- **The four functional bugs,** fixed in the separate session and merged before PRD 19 implementation began: the Hundred chain crash (S3-01), the blank "Print control charts" (S3-02+S4-01+S3-16), number fields clamping each keystroke (S9-02), and the answer-key number glued to its operand (S6-02+S7-02).
- **PRD 20 candidates:** 103 findings about how materials render (fixed-width mats, number-card stacking, bead sizes, focus mode, the walk-through covering the mat), what printables contain (page density, write-on space, answer-key columns, the planner's pagination, kit layout, site URLs on paper), and things the redesign doesn't touch (content passes over lesson text, in-page navigation, install icons). They are listed with cause and fix hint in [`19-the-album/audit-findings.md`](19-the-album/audit-findings.md).
- Inside materials and printables, anything beyond their type and the shared chrome tokens: Montessori colours, sizes, spacing, layout, the focus ring on felt and wood (S9-22), and what printables contain. Material changes are PRD 20 candidates; printable changes come from the owner's review after PRD 19 (Step 43).
- The planner's day grouping (S1-10's second half), mode-aware builder fields (S6-20), a tap-to-enlarge phone preview (S6-12), a page-break line in previews (S9-10), and showing a kit's piece page before its calibration page on screen.
- Dark mode, new ornaments or motion beyond decision 16, a headless test runner, and any new dependency.
