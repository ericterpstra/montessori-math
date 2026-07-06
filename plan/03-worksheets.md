# PRD 03 — Worksheet generator (12)

**Status:** Not started · depends on PRD 01

## Overview

A parameterized, printable worksheet system. Each generator is a module in `src/worksheets/generators/` exporting a `GeneratorDef`: pure `generate(params, rng)` (unit-tested), a `Sheet` renderer (student pages), an `AnswerKey` renderer, and ≥2 presets. The builder page (`/worksheets/:slug`) auto-renders the parameter form from the generator's schema.

## Builder UI requirements

- [ ] Form auto-rendered from `ParamField[]` schema (number / select / boolean)
- [ ] Live preview of the sheet at US Letter proportions
- [ ] Seed control: visible seed, "new sheet" reroll, seed + params in the URL query so a sheet can be re-created/shared
- [ ] `?preset=<id>` query applies a preset (used by lesson follow-up links)
- [ ] Color / B&W toggle (`.bw` on `.print-sheet`)
- [ ] Answer key on/off; prints on its own `.sheet-page`
- [ ] Name/date header on every student page; Print button → `window.print()`
- [ ] `/worksheets` index grouped by strand with preset shortcuts

## The generators

| Done | Slug | Generator | Key parameters (beyond count/seed/color/answer-key) |
|---|---|---|---|
| ☐ | `math-facts` | Math facts drill (+ − × ÷) | operand ranges, missing-number position, layout (horizontal/vertical/grid), timed-test header |
| ☐ | `multi-digit-ops` | Multi-digit operations | digits 2–4, operation, **regrouping on/off**, stamp-game color columns |
| ☐ | `place-value` | Place value | compose/decompose, expanded notation, range to 9,999 |
| ☐ | `golden-bead-pictures` | Golden bead pictures | draw-the-quantity vs read-the-quantity, ranges |
| ☐ | `teens-tens` | Teens & tens | bead-picture ↔ numeral, sequences, fill-ins 11–99 |
| ☐ | `skip-counting` | Skip counting | chain of n (2–10), blanks density, multiples tables |
| ☐ | `hundred-chart` | Hundred chart puzzles | % missing, ranges, chart fragments |
| ☐ | `fractions` | Fractions | identify/shade/label, equivalence pairs, same-denominator +/− |
| ☐ | `long-division` | Long division | dividend/divisor digits, remainders on/off, racks-and-tubes recording format |
| ☐ | `long-multiplication` | Long multiplication | digits, partial-products scaffold, checkerboard recording option |
| ☐ | `numeral-tracing` | Numeral tracing (PK) | numerals 0–9 as dashed SVG strokes, count-and-trace rows |
| ☐ | `decimals` | Decimals | place value to thousandths, compare/order, +/−, decimal-board recording format |

## Per-generator acceptance criteria (each)

- [ ] Unit tests: every generated problem's answer key is mathematically correct; parameters respected (e.g. regrouping=off ⇒ no column addition exceeds 9); same seed + params ⇒ identical output; problem count honored
- [ ] Prints on US Letter without clipping; answer key on separate page
- [ ] B&W mode carries no color-only information
- [ ] ≥2 presets, referenced from relevant lessons' follow-up work
