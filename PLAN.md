# Montessori Math — Project Plan

A complete, free Montessori mathematics resource for parents and students ages 4–12 (PK–6th grade).

## Product principles (agreed with owner)

1. **Resource site, not an LMS.** No login, no accounts, no lesson tracking, no progress storage.
2. **Concrete → abstract.** Lessons follow the Montessori passage from manipulatives to paper.
3. **Screens only where they substitute for materials.** Virtual manipulatives exist for families who don't own the physical materials. *All other child work is printable or pencil-and-paper* — no on-screen quizzes or drill apps.
4. **Printing is a first-class feature.** Every worksheet and lesson prints cleanly on US Letter; every sheet offers authentic Montessori color **and** an ink-friendly B&W variant (toggle).
5. **Full album-style lessons** — aims, prerequisites, presentation steps, control of error, extensions — written for parents with no Montessori training.
6. **Public repo** (`ericterpstra/montessori-math`), served locally over LAN (no public deployment for now).

## Tech stack

| Choice | Rationale |
|---|---|
| Vite + React 19 + TypeScript (strict) | Rich interactivity for manipulatives; static build; no server needed |
| react-router | Client routing; SPA served statically |
| Plain CSS + design tokens | Full control of print stylesheets and Montessori color system; zero UI-framework lock-in |
| Vitest | Unit tests for all math models and worksheet generators |
| Seeded RNG (mulberry32) | Reproducible worksheets — same seed → same sheet |
| Browser print → PDF | No PDF library; `@media print` + `@page` give pixel-perfect Letter output |

No backend, no database, no analytics, no external CDNs (works offline once loaded).

## Montessori color conventions (used everywhere)

- Place values: **units green, tens blue, hundreds red**, repeating for each family (1,000 green, 10,000 blue, …); golden for quantity beads.
- Colored bead stair: 1 red, 2 green, 3 pink, 4 yellow, 5 light blue, 6 lavender, 7 white, 8 brown, 9 dark blue, 10 golden.
- Stamp game: green 1s, blue 10s, red 100s, green 1,000s.
- B&W print mode substitutes outline/fill patterns for color so place values remain distinguishable.

## Site map

```
/                     Home: pathways by age, how to use the site
/materials            Index of virtual materials (16)
/materials/:slug      One interactive material + links to its lessons/worksheets
/lessons              Album index, filterable by strand and age
/lessons/:slug        Full album lesson (printable)
/worksheets           Generator index + ready-made presets
/worksheets/:slug     Parameterized worksheet builder with live preview + print
/parents              Parent guide index
/parents/:slug        Guide pages (philosophy, three-period lesson, scope & sequence…)
/ages                 Browse everything by age band / grade
```

## Feature 1 — Interactive Montessori materials (19)

Each material = self-contained folder `src/materials/<slug>/` with `model.ts` (pure logic), `model.test.ts`, `<Name>.tsx` (UI), and its album lesson content. Registered in `src/materials/registry.ts`.

| # | Material | Ages | Core interactions |
|---|---|---|---|
| 1 | Golden Beads & Mat | 4–7 | Bead bank (units/bars/squares/cubes), build any 1–9,999, exchange 10↔1, four operations on the mat, number-card labels |
| 2 | Large Number Cards | 4–7 | Compose/stack cards (1–9,000), expanded ↔ composed view, read numbers |
| 3 | Colored Bead Stair | 4–6 | Build the stair 1–9, count beads, pair with numerals |
| 4 | Teen Board (Seguin A) | 4–6 | Slide unit cards over 10s, build 11–19 with ten-bar + colored beads |
| 5 | Ten Board (Seguin B) | 5–7 | Build 10–99 with ten-bars + unit beads |
| 6 | Hundred Board | 5–7 | Place 1–100 tiles; sequence & random modes; skip-count highlighting |
| 7 | Addition Strip Board | 5–7 | Blue + red strips compute a+b ≤ 18 |
| 8 | Subtraction Strip Board | 6–8 | Compute a−b with natural strips and cover strip |
| 9 | Multiplication Bead Board | 6–9 | Place red beads column-by-column to build a×b ≤ 100 |
| 10 | Unit Division Board | 6–9 | Deal beads to skittles; quotient + remainder |
| 11 | Stamp Game | 5–8 | Four operations with place-value tiles incl. dynamic exchanging |
| 12 | Bead Frames (Small & Large) | 6–10 | Slide beads on wires to 9,999,999; add/subtract with exchanging |
| 13 | Racks & Tubes (long division) | 8–11 | Guided long division up to 4-digit ÷ 2-digit with racks, boards, skittles |
| 14 | Fraction Circles | 6–10 | Insets whole→tenths; naming, equivalence, same-denominator operations |
| 15 | Bead Chains (skip counting) | 5–8 | Short chains 2–10 with arrow labels; skip counting to squares |
| 16 | Cards & Counters | 4–5 | Lay out 1–10 with counters; odd/even discovery |
| 17 | Snake Game | 5–7 | Colored bead snake counted into golden ten-bars with black-and-white bridge beads; total always preserved |
| 18 | Checkerboard | 7–11 | Multi-digit multiplication (up to 4×4 digits): bead bars as partial products, diagonal slide to sum |
| 19 | Decimal Board | 9–12 | Decimal fraction material to thousandths (pale blue/pink/pale green mirror colors); build, compare, add/subtract decimals |

**Verifiable goals (every material):**
- [ ] Pure model with unit tests (≥5 assertions) covering the math: place-value decomposition, exchange rules, operation results, error states.
- [ ] Works with mouse *and* touch (pointer events), targets ≥ 40px for child hands.
- [ ] Self-checking where the physical material is (control of error), never gamified points/scores.
- [ ] Renders without console errors; reachable from `/materials`.
- [ ] Links to its album lesson(s), related worksheet generators, and a short "for parents" note.

**Material-specific acceptance checks (samples):**
- Golden beads: exchanging 10 units yields exactly 1 ten-bar (both directions); dynamic addition 1,568 + 1,679 walks through 3 exchanges and shows 3,247.
- Racks & tubes: 9,764 ÷ 4 produces 2,441; guided mode refuses out-of-sequence moves; remainder shown for 9,765 ÷ 4.
- Hundred board: skip-count mode highlights correct multiples for 2–10.
- Stamp game subtraction 4,053 − 1,278 requires borrowing across a zero and yields 2,775.
- Checkerboard: 4,357 × 23 = 100,211 via partial products and diagonal slide.
- Snake game: any snake's total is preserved through golden-bead exchange.

## Feature 2 — Worksheet generator (12 generators + presets)

`src/worksheets/generators/<slug>.ts` exports `generate(params, rng)` (pure, tested) + a Sheet renderer. Builder UI auto-renders a form from each generator's parameter schema, live preview, seed control, color/B&W toggle, answer-key toggle, then `window.print()`.

| # | Generator | Parameters (beyond count/seed/color/answer-key) |
|---|---|---|
| 1 | Math facts drill (+ − × ÷) | operand ranges, missing-number position, layout (horizontal/vertical/grid), timed-test header |
| 2 | Multi-digit operations | digits (2–4), operation, **regrouping on/off**, stamp-game color columns |
| 3 | Place value | compose/decompose, expanded notation, ranges to 9,999 |
| 4 | Golden bead pictures | draw-the-quantity vs read-the-quantity, ranges |
| 5 | Teens & tens | bead-picture ↔ numeral, sequences, fill-ins 11–99 |
| 6 | Skip counting | chain of n (2–10), blanks density, multiples tables |
| 7 | Hundred chart puzzles | % missing, ranges, chart fragments |
| 8 | Fractions | identify/shade/label, equivalence pairs, same-denominator +/− |
| 9 | Long division | dividend/divisor digits, remainders on/off, racks-and-tubes recording format |
| 10 | Long multiplication | digits, partial-products scaffold on/off |
| 11 | Numeral tracing (PK) | numerals 0–9 as dashed SVG strokes, count-and-trace rows |
| 12 | Decimals | place value to thousandths, compare/order, +/−, decimal-board recording format |

**Verifiable goals (every generator):**
- [ ] Unit tests: answer key is mathematically correct for every generated problem; parameters respected (e.g. regrouping=off ⇒ no column exceeds 9 in addition); same seed ⇒ identical sheet; count honored.
- [ ] Prints on US Letter with name/date header; answer key on its own page.
- [ ] B&W mode contains no color-dependent information.
- [ ] ≥ 2 ready-made presets linked from relevant lessons ("follow-up work").

## Feature 3 — Album-style lessons (~34)

Typed `Lesson` objects in `src/lessons/content/`, rendered as printable album pages. Every lesson includes: name, ages/grade, strand, prerequisites (linked), materials (physical + virtual link), **direct & indirect aims, step-by-step presentation with suggested language, points of interest, control of error, vocabulary, variations, extensions, what comes next**, and pencil-and-paper follow-up work linking to worksheet presets.

Strands: Numbers to 10 · Linear counting · Decimal system · Memorization of facts · Passage to abstraction · Fractions · Decimals.

**Verifiable goals:**
- [ ] Schema test iterates all lessons: every required album field non-empty; every prerequisite/material/worksheet link resolves.
- [ ] Each of the 19 materials has ≥ 1 lesson; each strand has an ordered sequence forming a coherent PK→6 path.
- [ ] Lesson pages print cleanly (album header, numbered presentation steps, no cut-off content).
- [ ] Follow-up work sections reference only printable/pencil-paper activities (validated in schema test where machine-checkable).

## Feature 4 — Parent guides (6 pages)

1. **Why Montessori math works** — concrete→abstract, the mathematical mind, planes of development.
2. **How to present a lesson** — three-period lesson, slow hands/few words, control of error, when to step back.
3. **Scope & sequence** — printable PK–6 chart mapping age → materials → lessons → worksheets.
4. **Using this site** — virtual vs. physical materials, printing guide, DIY/paper alternatives.
5. **Glossary** of Montessori terms.
6. **FAQ.**

**Verifiable goals:** all pages reachable, scope & sequence links resolve to real lessons/materials, chart prints on Letter.

## Feature 5 — Home & navigation

Pathways by age band (3–6 / 6–9 / 9–12) and grade (PK–K / 1–3 / 4–6); global nav; every material/lesson/worksheet cross-linked; responsive from phone → desktop; touch-friendly.

## Quality gates (whole project)

- [ ] `npm run build` passes (tsc strict + Vite).
- [ ] `npm test` green — target ≥ 120 assertions across models, generators, content schema.
- [ ] Every route renders without console errors (verified via headless preview).
- [ ] Real-browser interactive testing via Claude in Chrome against the LAN URL: drive the manipulatives, exercise the worksheet builder end-to-end, check print preview.
- [ ] Independent content-accuracy review pass: Montessori authenticity (colors, sequences, terminology) and mathematical correctness of all album text.
- [ ] Print QA on representative worksheet, lesson, and scope & sequence chart.

## Execution steps

1. **Scaffold** — Vite/React/TS, routing, layout, design tokens, print CSS base. *Commit.*
2. **Core engine** — place-value model, seeded RNG, exchange logic, shared SVG bead/card/stamp components, material & lesson & generator type contracts, registry pattern, conventions doc for parallel work. Tests. *Commit.*
3. **Materials** — build all 19 interactives (parallel agents, one folder each) + their album lessons. Wire registry, test, fix. *Commit.*
4. **Worksheets** — builder UI core, then all 12 generators in parallel + presets. Tests. *Commit.*
5. **Parents & lessons glue** — guide pages, scope & sequence, strand sequencing, cross-links. *Commit.*
6. **Home + polish** — home page, ages browser, responsive/touch pass, print QA. *Commit.*
7. **Review pass** — multi-agent: content accuracy, math correctness, route smoke tests, print check. Fix findings. *Commit.*
8. **Publish** — README, `gh repo create ericterpstra/montessori-math --public`, push `main`.
9. **Serve on LAN** — production build + static preview server on `0.0.0.0` → `http://192.168.1.208:<port>`.

## Out of scope (explicitly)

Login/accounts · progress tracking · analytics · public hosting (for now).
