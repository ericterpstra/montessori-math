# PRD 06 — Home & polish

**Status:** Not started · depends on PRDs 02–05

## Overview

The front door and the finishing pass: a home page that routes three audiences (new parent / returning parent / child at the screen for a material), an age-based browser, and site-wide responsive/print polish.

## Requirements

- **Home page**: what the site is (and isn't), pathways by age band (3–6 / 6–9 / 9–12) and grade (PK–K / 1–3 / 4–6), quick links to the most-used materials and worksheet presets, "start here" link to the parent overview
- **/ages browser**: everything (materials, lessons, worksheets) filterable by age band and grade, driven by the registries
- **Navigation polish**: active states, sensible ordering, mobile nav usable one-handed
- **Responsive pass**: phone → tablet → desktop; material stages usable on a tablet in landscape (the primary "virtual material" device)
- **Print QA**: representative worksheet, lesson, and the scope & sequence chart printed (or print-previewed) at Letter; fix clipping/page-break issues

## Acceptance criteria

- [ ] Home renders all pathways; every link resolves
- [ ] /ages shows correct items per band (spot-check against registry data)
- [ ] No horizontal body scroll at 375px width on any page
- [ ] Material stages usable at 768×1024 (tablet) with touch
- [ ] Print QA checklist passed on the three representative documents
