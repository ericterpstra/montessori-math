# PRD 02 — Interactive materials (19)

**Status:** Not started · depends on PRD 01

## Overview

One virtual material per folder `src/materials/<slug>/` containing `model.ts` (pure logic), `model.test.ts`, `<Name>.tsx` (UI using shared components + `MaterialShell`), and `lessons.ts` (album lessons for the material — see PRD 04). Built by parallel agents; each agent touches **only its own folder** and reports its `MaterialDef` registration entry, which is wired centrally into `src/materials/registry.ts`.

## Universal requirements (every material)

- Pure model with unit tests (≥5 assertions) covering the math: place-value decomposition, exchange rules, operation results, error states
- Mouse **and** touch via tap-first interactions; hit targets ≥ 44px
- Control of error like the physical material (self-checking) — no scores, points, timers, or praise animations
- Reset control; help text via `MaterialShell`'s `help` prop
- Colors only via CSS variables (tokens.css); renders without console errors
- `MaterialDef` complete: summary, parentNote, ages/grades, strand, lesson + worksheet slugs

## The materials

| Done | Slug | Material | Ages | Strand | Core interactions |
|---|---|---|---|---|---|
| ☐ | `golden-beads` | Golden Beads & Mat | 4–7 | decimal-system | Bead bank (units/bars/squares/cubes); build 1–9,999; exchange 10↔1; four operations on the mat; number-card labels |
| ☐ | `number-cards` | Large Number Cards | 4–7 | decimal-system | Compose/stack cards 1–9,000; expanded ↔ composed views; read numbers |
| ☐ | `bead-stair` | Colored Bead Stair | 4–6 | numbers-to-10 | Build the stair 1–9; count beads; pair with numerals |
| ☐ | `cards-and-counters` | Cards & Counters | 4–5 | numbers-to-10 | Lay out 1–10 with counters; odd/even discovery |
| ☐ | `teen-board` | Teen Board (Seguin A) | 4–6 | linear-counting | Slide unit cards over 10; build 11–19 with ten-bar + colored beads |
| ☐ | `ten-board` | Ten Board (Seguin B) | 5–7 | linear-counting | Build 10–99 with ten-bars + unit beads |
| ☐ | `hundred-board` | Hundred Board | 5–7 | linear-counting | Place 1–100 tiles; sequence & random modes; skip-count highlighting |
| ☐ | `bead-chains` | Bead Chains | 5–8 | linear-counting | Short chains 2–10 with arrow labels; skip counting to squares |
| ☐ | `snake-game` | Snake Game | 5–7 | memorization | Colored snake counted into golden ten-bars with black-and-white bridge beads |
| ☐ | `addition-strip-board` | Addition Strip Board | 5–7 | memorization | Blue + red strips compute a+b ≤ 18 |
| ☐ | `subtraction-strip-board` | Subtraction Strip Board | 6–8 | memorization | Natural strips + cover strip compute a−b |
| ☐ | `multiplication-bead-board` | Multiplication Bead Board | 6–9 | memorization | Red beads placed column-by-column build a×b ≤ 100 |
| ☐ | `division-board` | Unit Division Board | 6–9 | memorization | Deal beads to skittles; quotient + remainder |
| ☐ | `stamp-game` | Stamp Game | 5–8 | abstraction | Four operations with place-value tiles incl. dynamic exchanging |
| ☐ | `bead-frame` | Bead Frames (Small & Large) | 6–10 | abstraction | Slide beads on wires to 9,999,999; add/subtract with exchanging |
| ☐ | `checkerboard` | Checkerboard | 7–11 | abstraction | Multi-digit multiplication (≤4×4 digits): bead-bar partial products, diagonal slide to sum |
| ☐ | `racks-and-tubes` | Racks & Tubes | 8–11 | abstraction | Guided long division ≤ 4-digit ÷ 2-digit with racks, boards, skittles, remainders |
| ☐ | `fraction-circles` | Fraction Circles | 6–10 | fractions | Insets whole→tenths; naming, equivalence, same-denominator operations |
| ☐ | `decimal-board` | Decimal Board | 9–12 | decimals | Place values to thousandths (pale blue/pink/pale green); build, compare, add/subtract decimals |

## Material-specific acceptance checks

- [ ] Golden beads: exchanging 10 units yields exactly 1 ten-bar (both directions); dynamic addition 1,568 + 1,679 walks through 3 exchanges and shows 3,247
- [ ] Stamp game: subtraction 4,053 − 1,278 requires borrowing across a zero and yields 2,775
- [ ] Racks & tubes: 9,764 ÷ 4 → 2,441; guided mode refuses out-of-sequence moves; remainder shown for 9,765 ÷ 4
- [ ] Hundred board: skip-count mode highlights correct multiples for 2–10
- [ ] Checkerboard: 4,357 × 23 = 100,211 via partial products and diagonal slide
- [ ] Snake game: any snake's total preserved through golden-bead exchange
- [ ] Bead frame: place values carried correctly across all 7 wires (large frame)
- [ ] Decimal board: comparisons and +/− exact to thousandths (no floating-point drift)

## Definition of done

- [ ] All 19 registered, reachable from `/materials`, tests green, build green
- [ ] Each links to ≥1 album lesson and related worksheet generators
