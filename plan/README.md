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
| 02 | [Interactive materials (19)](02-materials.md) | Done |
| 03 | [Worksheet generator (12)](03-worksheets.md) | Done |
| 04 | [Album lessons (~34)](04-lessons.md) | Done (38) |
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
| 16 | [Booklet printing — fold-and-staple books](16-booklet-printing.md) | M | Done |
| 17 | [Install-to-tablet PWA, full offline](17-pwa-offline.md) | S | Done |
| 18 | [Material physicality pass + sheet themes](18-physicality-pass.md) | S | Done |
