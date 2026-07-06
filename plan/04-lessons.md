# PRD 04 — Album-style lessons (~34)

**Status:** Not started · fills in alongside PRDs 02/03/05

## Overview

Full Montessori album lessons written for parents with no training, stored as typed `Lesson` objects (schema in `src/lessons/types.ts`) and rendered by `LessonPage` as printable album pages. Material-specific lessons live in their material's folder (`src/materials/<slug>/lessons.ts`); strand-level lessons without a virtual material (e.g. golden bead intro tray presentation variants) live in `src/lessons/content/`.

## Album schema (every field required)

`slug`, `name`, `strand`, `sequence` (order within strand), `ages`, `grades`, `overview`, `materialsNeeded` (with household substitutes where sensible), `virtualMaterials`, `prerequisites` (lesson slugs), `directAims`, `indirectAims`, `presentation` (steps; suggested spoken language in `say`), `pointsOfInterest`, `controlOfError`, `vocabulary`, `variations`, `extensions`, `whatComesNext` (prose), `followUpWork` (pencil-and-paper only, with worksheet slugs/presets where a printable fits).

## Authoring guidelines

- Reader = parent at the kitchen table. Plain language, no unexplained jargon; Montessori terms introduced in passing get a glossary entry (PRD 05).
- Presentation steps are concrete and observable ("Place the thousand cube in the child's hands"), with exact suggested words in `say`.
- Three-period lesson referenced where vocabulary is taught, linking to the parent guide.
- Ages are ranges of readiness, not deadlines — reflected in tone.
- Follow-up work must never be on-screen (product rule #2 in CLAUDE.md).

## Coverage requirements

- [ ] ~34 lessons total across the 7 strands
- [ ] Every material (PRD 02) has ≥1 lesson presenting it
- [ ] Each strand's lessons form an ordered `sequence` with coherent prerequisites — a parent can follow strand order PK→6
- [ ] Multi-lesson arcs where the material carries several presentations (e.g. golden beads: intro tray → formation → addition → subtraction → multiplication → division)

## Acceptance criteria

- [ ] Schema test iterates the registry: all fields non-empty; every `prerequisites`, `virtualMaterials`, `worksheetSlug`, `presetId` reference resolves; sequences within a strand are unique and contiguous from 1
- [ ] Lesson pages print cleanly (album header, numbered steps, no clipped sections)
- [ ] Cross-links work: material page ↔ lessons ↔ worksheet presets
