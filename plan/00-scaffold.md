# PRD 00 — Scaffold

**Status:** Done (commit `4f22518`)

## Overview

Project skeleton: Vite + React 19 + TypeScript (strict) + react-router 7, plain CSS with design tokens, Vitest configured, print CSS foundation.

## Delivered

- `package.json` scripts: `dev`, `build` (strict tsc + vite), `preview` (LAN, port 4173), `test`
- `tsconfig.json` — strict, `verbatimModuleSyntax`, `noUnusedLocals`/`noUnusedParameters`
- `vite.config.ts` — react plugin, `host: true` for dev and preview, vitest include pattern
- `index.html`, `public/favicon.svg` (golden bead)
- `src/main.tsx`, `src/App.tsx` (routes), `src/components/Layout.tsx` (header/nav/footer, scroll-to-top)
- `src/styles/tokens.css` (Montessori color system), `global.css` (layout, cards, buttons, badges, forms), `print.css` (@page Letter, `.no-print`/`.print-only`/`.sheet-page`, `.bw` variable overrides)
- Stub pages: Home, SectionStub, NotFound

## Acceptance criteria

- [x] `npm run build` passes
- [x] Dev server serves all nav routes without console errors
- [x] Print CSS foundation in place (`.print-sheet`, `.sheet-page`, `.bw`)
