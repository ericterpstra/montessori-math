# PRD 01 — Core engine

**Status:** In progress

## Overview

The shared foundation every material, worksheet, and lesson builds on: pure math models, seeded RNG, shared SVG bead components, type contracts, registries, and the Materials/Lessons index & detail pages. Conventions for parallel agents live in [../CLAUDE.md](../CLAUDE.md).

## Written so far (uncommitted at time of writing)

- `src/lib/placeValue.ts` — `PlacePower` (−3…6), `placeInfo`, `decompose`/`compose`, `PlaceCounts`, `countsFromNumber`, `totalValue`, `addToCounts`, `exchangeUp`/`exchangeDown` (+ `can*` guards), `normalize`, `formatNumber`; integer-scaled arithmetic for exact decimals
- `src/lib/rng.ts` — mulberry32 `createRng(seed)`: `next`, `int` (inclusive), `pick`, `shuffle`, `bool`; `randomSeed()`
- `src/lib/strands.ts` — the 7 curriculum strands with ages/grades/descriptions
- `src/materials/types.ts` (`MaterialDef`), `src/lessons/types.ts` (`Lesson` album schema), `src/worksheets/types.ts` (`GeneratorDef`, `ParamField`, presets)
- Registries (empty, centrally wired): `src/materials/registry.ts`, `src/lessons/registry.ts`, `src/worksheets/registry.ts`
- Shared components: `src/components/beads.tsx` (BeadShape, Bead, BeadBar, TenBar, HundredSquare, ThousandCube, Skittle + `BEAD_STAIR_VARS`), `NumberCard.tsx`, `StampTile.tsx`, `MaterialShell.tsx`, `PrintButton.tsx`
- Styles: `src/styles/materials.css` (shell, stage mats, stamp/card/bank styles), `src/styles/album.css` (lesson album layout + print); decimal place tokens added
- Pages: `src/materials/MaterialsIndex.tsx`, `src/materials/MaterialPage.tsx`, `src/lessons/LessonsIndex.tsx`, `src/lessons/LessonPage.tsx`

## Remaining work

- [ ] Import `materials.css` / `album.css` in `src/main.tsx`
- [ ] Wire `App.tsx` routes: `/materials`, `/materials/:slug`, `/lessons`, `/lessons/:slug`
- [ ] Unit tests: `src/lib/placeValue.test.ts`, `src/lib/rng.test.ts`
- [ ] `npm test` and `npm run build` green
- [ ] Commit

## Acceptance criteria

- [ ] placeValue: decompose/compose round-trips (incl. decimals to thousandths); exchange up/down correct and guarded; `normalize({0:27, 1:14})` → `{2:1, 1:6, 0:7}` with value preserved; zero and range edge cases
- [ ] rng: same seed ⇒ identical sequence; `int` inclusive at both bounds; `shuffle` preserves elements; deterministic under seed
- [ ] `/materials` and `/lessons` render (empty-state) without console errors
