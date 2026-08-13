# plan/ — feature tracking

One PRD per major feature, extracted from [../PLAN.md](../PLAN.md) (the overview document). Each PRD carries:

- **Status:** `Not started` → `In progress` → `Done` (with the landing commit when done)
- **Requirements** — what to build and how it must behave
- **Acceptance criteria** — verifiable checkboxes, ticked as work lands

Update the relevant PRD in the same commit that lands the feature work.

| # | PRD | Status |
|---|---|---|
| 00 | [Scaffold](00-scaffold.md) | Done |
| 01 | [Core engine](01-core-engine.md) | Done |
| 02 | [Interactive materials](02-materials.md) | Done (21, incl. the two charts from PRD 14) |
| 03 | [Worksheet generator](03-worksheets.md) | Done (13, incl. command cards from PRD 12) |
| 04 | [Album lessons](04-lessons.md) | Done (41) |
| 05 | [Parent guides](05-parent-guides.md) | Done |
| 06 | [Home & polish](06-home-and-polish.md) | Done |
| 07 | [Review & QA](07-review-qa.md) | Done |
| 08 | [Publish & serve](08-publish-and-serve.md) | Done |

## Wave 2 — delight features

Ten features chosen to make the site delightful for parents and kids, not just useful. Each PRD is written to be implementable by a junior developer (or a coding agent) without design decisions: exact file paths, interfaces, algorithms with test vectors, per-step verification, manual QA scripts, and acceptance criteria. Suggested build order: 09 → 12 → 10 → 17, then the rest as desired.

| # | PRD | Effort | Status |
|---|---|---|---|
| 09 | [Make-it-yourself material kits (printable)](09-material-kits.md) | M | Done |
| 10 | [Exchange ceremony — motion & material sounds](10-exchange-ceremony.md) | M | Done |
| 11 | [Presentation mode — lessons walk the material](11-presentation-mode.md) | L | Done |
| 12 | [Command cards — printable task decks](12-command-cards.md) | M | Done |
| 13 | [Weekly work plan & child's journal (URL-state)](13-work-planner.md) | M | Done |
| 14 | [Addition & multiplication working charts](14-memorization-charts.md) | M | Done |
| 15 | [The long chains — 100 & 1,000](15-long-chains.md) | M | Done |
| 16 | [Booklet printing — fold-and-staple books](16-booklet-printing.md) | M | Removed (issue #4) |
| 17 | [Install-to-tablet PWA, full offline](17-pwa-offline.md) | S | Done |
| 18 | [Material physicality pass + sheet themes](18-physicality-pass.md) | S | Done (header art removed, issue #2) |

## Post-wave-2 — issue fixes

Small changes from the owner's QA pass. These were driven by GitHub issues rather
than PRDs (each was a fix or a removal, not a new feature), so they are recorded
here for the history:

| Issue | Change | Commit |
|---|---|---|
| #1 | Worksheet previews scale to fit their container — no sideways scrolling, print still 1:1 | `8377f20` |
| #2 | Worksheet header decoration removed entirely | `8377f20` |
| #3 | Presets became a labeled dropdown instead of button rows | `8377f20` |
| #4 | Booklet printing and My Book of Numbers removed (too confusing to print) | `fb5a285` |
| #5 | Focus mode on every material: full-screen, wordless, Esc to exit | `3baf5aa` |
| #6 | Skittle redesigned as a legible peg-doll silhouette | `2ea5fce` |

## Post-wave-2 — review pass

A code/content/routing review of the whole project. Findings and fixes:

- **Fixed:** a fractional URL param (`?count=6.5`) could reach a generator's loop
  bounds and hang the tab. Param resolution moved to `src/worksheets/params.ts`
  (pure, tested) and now rounds before clamping; `params.test.ts` covers every
  generator plus the exact URL that used to hang.
- **Fixed:** a fresh `/worksheets/<slug>` visit did not pin its seed to the URL,
  so the page's own "reprint from this URL" promise was false until a control
  was touched.
- **Fixed:** choosing a preset discarded the B&W and answer-key toggles.
- **Fixed:** the long-division answer key omitted `R 0` while the sheet printed an
  `R ___` blank for every problem.
- **Fixed:** the shared bead renderer carried hex color literals; they are now
  `--bead-*` tokens (it was the only `.tsx` file in the project with any).
- **Fixed:** `/kits` and `/planner` were shipped but missing from the global nav.
- **Removed:** the math-facts timed-test box and its `timed` param — the closest
  thing on the site to the timers rule 1 forbids.
- **Open (needs a browser):** racks & tubes free mode allows a board exchange that
  cannot be undone without a full Reset; the physical material lets the bead move
  back. Also deferred: no SPA fallback (`404.html`) for deep links on a static
  host, and the 404 page links only to home.
