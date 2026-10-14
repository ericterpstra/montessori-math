# Printable audit - October 13, 2026

**Status:** digital review complete for the samples below; narrow fixes prepared for review, not deployed. Physical checks remain open. This is not a sign-off on every generator, preset, browser or printer.

## Method and provenance

- Baseline: production `https://montessori-math.org/`, repository `main@08093964c26e24b70f5faf67632b7d785e2be876`.
- Downloaded production entry JS/CSS and compared their SHA-256 hashes with a clean build of that commit: both identical (`index-BeEw5Tbg.js`, `index-BoCy08PS.css`).
- Consulted the existing QA checklist, October 8 marketing plan, September audit and earlier fixes (PRs #7/#8). No overlapping open PR was found. Unchecked owner boxes are not evidence that nobody has printed these before.
- Chromium 134.0.6998.35 on Linux, browser-generated PDFs, US Letter, CSS half-inch margins, scale 1 / 100%, browser headers/footers off, background graphics off. Loaded the self-hosted fonts and blocked service workers for a fresh fetch. Material charts were opened through their control-chart button.
- Worksheets use `seed=424242&key=1`; every case was captured in color and the application's B&W mode (`bw=1`, or the chart's checkbox). This is distinct from a printer driver's grayscale conversion.
- Captured 40 production PDFs / 144 pages and 40 fixed-build PDFs / 142 pages. Checked PDF page counts, Letter media boxes, content bounds and selected vector dimensions. Visually reviewed representative pages and every changed layout; not every page received a full visual inspection.
- No new application dependencies or permanent print regression gate. The audit used external tooling. The site's educational data, generated problems, answer text and piece inventories were not changed.

## Results and proposed fixes

| Finding | Production reproduction | Fixed-build result |
|---|---|---|
| Large number cards fail to compose when stacked | For `1000`, the leading digit starts 174.23 CSS px into a card whose exposed left strip is only 144px. The `300` digit crosses that same boundary. | Each digit has a 1.5in slot. All 36 cards have centers at 72 + 144n CSS px; values, card widths and cut borders preserved. |
| Skip-counting tables overflow | `preset=all-the-tables`: 9 rows in a 1,149px section, exceeding the 960px printable height. Rows 8-9 spill to a page without a heading. | Chunk at 7 rows. Two student pages, each with title/instructions, then one key. First section 912px; all nine rows retained. |
| Journal spills a row/footer | The checklist's 13-item plan produces five physical pages; a 12-row journal section is 1,065px tall. One item and the footer spill onto an extra sheet. | Ten rows per journal page: sections 921px and 411px. Four pages total: two parent-plan pages and two labeled journal pages. |
| Parent-plan day heading stranded | In the same plan, “Sunday” ends page 1 while its item starts page 2. | Keep day-heading rows with the following row and avoid splitting item rows. Sunday and its item now start page 2 together. |
| Decimal blanks and answer-key column overrides lose in the CSS cascade | Decimal mixed-review blanks all collapse to about 0.28in; decimals and skip-counting keys use four columns despite their intended two. Fractions use four instead of three. | Increased only the affected selectors' specificity. Decimal blanks restore 1.1in / 2.1in / 0.62in; key layouts restore 2 / 2 / 3 columns. Global import order unchanged. |
| Board grids are faint and colored in B&W | Hundred-board and strip-board kit lines are pale; wood borders remain brown in the B&W PDFs. | Grid lines use the existing darker ink token; B&W board borders and grids are black. Dimensions unchanged. |
| Tenths fraction labels crowd cut lines | The two top/bottom `1/10` labels crowd the central sector cut line. | Ninths/tenths labels use 9pt rather than 11pt within the SVG; the regenerated PDF leaves visible clearance. Sector geometry and labels unchanged. |

Related earlier audit candidates: S7-04, S7-03, S9-03, S9-04, S6-01/S7-01 (partially), S6-08/S7-27 (partially), S7-14 and S7-13. These changes do not resolve every issue grouped under those IDs.

## Verified passes

- All seven kits' calibration squares have **72 x 72 point outer dimensions** in the PDFs. The 192 stamp tiles are 96 x 96 CSS px, and measured PDF tile frames are 72 x 72 points. A point is 1/72 inch. Screen zoom is reset for printing. This establishes file geometry, not physical printer accuracy.
- All seven kit samples fit their expected page counts in both modes. No measured horizontal overflow, missing last row, or clipped piece was found in the sampled layouts. Stamp tiles are cut around their colored frame as the kit instructions specify; they need not have dashed borders.
- Golden-bead command deck: **8 cards per student page**, visible dashed cut borders, sequential cards 1-16, separate numbered key on page 3. Spot checks: card 2, 2,059 + 3,709 = 5,768; card 5, 17 hundreds + 19 tens + 8 units = 1,898.
- Numeral tracing: two complete student pages (0-4, 5-9), solid models and dashed trace outlines, zero's empty bead frame and the correct bead counts through nine. No clipped numeral rows in the sample.
- Addition and multiplication charts: **two nonblank pages each**; control and half-chart remain isolated from application UI, with legible headers and grid lines in color and B&W. These confirm the earlier blank-print fix in actual PDFs. The charts occupy about 5.5in square, not the whole page; increasing size is a design choice.
- B&W identify-fractions: gray fills and black division lines remain distinct, including 7/8 and 1/2 in this seed. Both the shaded and unshaded sectors are countable in the PDF.
- Decimal sums and dynamic-subtraction keys: all 21 sampled arithmetic results independently checked, all correct. Every captured worksheet's answer strings and command-card text are identical before/after, in both modes. No page errors occurred in the completed capture set.
- `npm test`: **50 files / 917 tests passed**. `npm run build`: passed, with 96 prerendered pages. Existing pagination tests updated; no new dependency or change to problem generation.

## Coverage matrix

Counts are physical PDF pages **per color mode**. “C + BW” means both were captured. Worksheet queries also include `seed=424242&key=1`.

| Route / selection | Modes | Production -> fixed pages |
|---|---|---|
| `/kits/stamp-game-tiles` | C + BW | 5 -> 5 |
| `/kits/large-number-cards` | C + BW | 8 -> 8 |
| `/kits/paper-fraction-circles` | C + BW | 4 -> 4 |
| `/kits/hundred-board-tiles` | C + BW | 5 -> 5 |
| `/kits/strip-boards` | C + BW | 9 -> 9 |
| `/kits/golden-bead-cards` | C + BW | 5 -> 5 |
| `/kits/play-money` | C + BW | 4 -> 4 |
| `/worksheets/command-cards?preset=golden-bead-deck` | C + BW | 3 -> 3 |
| `/worksheets/numeral-tracing` | C + BW | 3 -> 3 |
| `/worksheets/fractions?mode=identify` | C + BW | 2 -> 2 |
| `/worksheets/decimals?preset=decimal-sums` | C + BW | 2 -> 2 |
| `/worksheets/decimals` (mixed review) | C + BW | 2 -> 2 |
| `/worksheets/multi-digit-ops?preset=dynamic-subtraction` | C + BW | 2 -> 2 |
| `/worksheets/skip-counting?preset=all-the-tables` | C + BW | 3 -> 3 |
| `/worksheets/long-multiplication` | C + BW | 2 -> 2 |
| `/worksheets/long-division` | C + BW | 2 -> 2 |
| `/planner` (four items; URL below) | C + BW | 2 -> 2 |
| `/planner` (checklist's 13 items; URL below) | C + BW | 5 -> 4 |
| `/materials/addition-charts` > Print control charts | C + BW | 2 -> 2 |
| `/materials/multiplication-charts` > Print control charts | C + BW | 2 -> 2 |

Planner URLs:

- `/planner?l=golden-beads-addition:mon&s=math-facts.times-tables:tue&s=multi-digit-ops.dynamic-subtraction&m=stamp-game&w=2026-10-19`
- `/planner?l=golden-beads-addition:mon&s=math-facts.times-tables:tue&m=golden-beads:wed&s=multi-digit-ops&l=stamp-game-addition:thu&l=number-cards-intro:mon&s=long-division.first-long-division:fri&m=stamp-game&l=snake-game:tue&s=skip-counting:wed&m=hundred-board:sat&l=fractions-intro&s=place-value:sun&w=2026-10-19`

## Digital limitations and follow-up (not physical-printer tasks)

- This samples eight of the thirteen worksheet generators, including two decimal configurations. It does not cover every preset, count, seed, lessons, guides or bead-chain tickets, nor Safari/Firefox/current Chrome variants.
- The parent plan is still naturally paginated and does not repeat its title on page 2. Its two-page length is not hidden as a pass for a one-page plan.
- B&W golden beads remain ink-heavy black discs (countable in the large kit sample); fraction-kit sectors retain broad gray fills. An outline-only design would need a separate design decision.
- Other previously recorded usability concerns remain outside this patch: crowded four-column numeral-tracing key, small arithmetic operator/place labels, long-division problem-number proximity, workspace sizing, and other generators' CSS overrides. Do not mark the full PRD 19 review complete from this audit.
- The historical checklist remains unticked: it includes owner judgments and physical work this audit cannot perform. No production release or outreach was performed.

## Physical checks for Eric

Use **US Letter, Actual size / 100%, one page per sheet**, with fit/shrink and browser headers/footers disabled. Repeat calibration if printer, driver, paper size or scaling setting changes.

1. **Ruler:** print the stamp kit's cover and one tile page. Measure the square's outer edges horizontally and vertically: exactly 1in / 25.4mm. Measure a tile's outer frame too. If either is off, adjust the print path before cutting.
2. **Ink and paper:** on the printer/paper you will feature, inspect dashed trace/cut lines, a control chart, a gray fraction and the darker board grid. Check for toner/ink dropout and readability at normal working distance; PDF contrast cannot establish this.
3. **Scissors/cardstock:** cut a few stamp tiles and number cards; check durability, comfortable handling, and a right-aligned 3,000 + 200 + 50 + 1 stack. For a featured fraction kit or split board, try cutting/reassembly or taping at least one example. Digital alignment is verified; material thickness, cutting accuracy and handling are not.
4. **Pencil:** try a tracing row, answer blank and journal checkbox at actual size. Judge whether the intended child can trace/write comfortably. No need to re-check the arithmetic or manually inspect every combination.
