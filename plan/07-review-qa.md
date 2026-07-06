# PRD 07 — Review & QA

**Status:** Done — 40 findings raised, 32 confirmed after adversarial verification, all fixed

## Overview

Independent multi-agent review pass over the finished site, then fixes. Four review dimensions, each verified rather than trusted.

## Review dimensions

1. **Montessori authenticity** — colors, terminology, material proportions, presentation sequences match the tradition; deviations are deliberate and documented
2. **Mathematical correctness** — every number in album text, help text, and parent guides checked; every generator's math re-derived independently of its implementation
3. **Route smoke tests** — every route (incl. one per material, one per generator, one per lesson) renders without console errors via headless preview
4. **Print output** — worksheets/lessons/chart print correctly; B&W mode loses no information; answer keys separate

## Interactive testing

- Real-browser testing via **Claude in Chrome** against the LAN URL: drive the manipulatives (beads, strips, stamps, frames), exercise the worksheet builder end-to-end (params → preview → print dialog), verify acceptance samples from PRD 02
- Headless checks via Claude Preview MCP for the full-route sweep

## Quality gates (whole project)

- [x] `npm run build` green (strict tsc + Vite)
- [x] `npm test` green — ≥120 assertions across models, generators, content schema
- [x] Every route renders without console errors
- [x] All PRD 02 material-specific acceptance checks pass in a real browser
- [x] Content-accuracy findings triaged; all confirmed issues fixed
- [x] Print QA passed (PRD 06 checklist re-run after fixes)
