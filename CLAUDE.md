# CLAUDE.md — Montessori Math

A free, static Montessori math resource site for parents and kids ages 4–12 (PK–6). Virtual manipulatives, printable worksheets, album-style lessons. Owner: Eric Terpstra (github `ericterpstra`).

## Hard product rules (never violate)

1. **No login, no accounts, no lesson tracking, no analytics.** This is a resource library, not an LMS. Don't add localStorage progress, scores, streaks, timers, badges, or any gamification.
2. **Kids' practice happens on paper.** The only on-screen child activity is the virtual materials themselves. Everything else (drills, follow-up work) must be printable or pencil-and-paper.
3. **Print is a first-class feature.** US Letter via browser print. Every printable supports authentic Montessori color AND ink-friendly B&W (the `.bw` class overrides color CSS variables — never encode information in color alone).
4. **Fully static and offline-friendly.** No backend, no external CDNs, fonts, or runtime network requests.
5. **No new npm dependencies** without explicit owner approval. Current runtime deps: react, react-dom, react-router-dom.
6. **Montessori authenticity matters.** Correct colors, terminology, and presentation sequences. Place values: units green, tens blue, hundreds red (repeating per family); golden beads for quantity; bead stair 1=red 2=green 3=pink 4=yellow 5=light-blue 6=lavender 7=white 8=brown 9=dark-blue 10=golden. Colors live in `src/styles/tokens.css` — always use the CSS variables, never hex literals in components.

## Commands

- `npm run dev` — dev server (LAN-bound)
- `npm run build` — strict tsc + vite build; must stay green
- `npm test` — Vitest (`src/**/*.test.{ts,tsx}`, node environment)
- `npm run preview` — serve `dist/` on port 4173, LAN-accessible

## Architecture

- `src/lib/` — pure logic: `placeValue.ts` (decompose/compose/exchange/normalize, powers −3…6, integer-scaled decimal math), `rng.ts` (seeded mulberry32 — all worksheet randomness goes through it), `strands.ts` (the 7 curriculum strands).
- `src/components/` — shared primitives: `beads.tsx` (Bead, BeadBar, TenBar, HundredSquare, ThousandCube, Skittle, BeadShape), `NumberCard.tsx`, `StampTile.tsx`, `MaterialShell.tsx`, `PrintButton.tsx`. Reuse these; don't reinvent bead rendering.
- `src/materials/<slug>/` — one folder per virtual material: `model.ts` (pure, no React), `model.test.ts`, `<Name>.tsx` (UI), `lessons.ts` (album Lesson objects for that material). Registered centrally in `src/materials/registry.ts`.
- `src/worksheets/generators/<slug>.tsx` — each exports a `GeneratorDef`: pure `generate(params, rng)` + `Sheet` + `AnswerKey` components + presets. Registered in `src/worksheets/registry.ts`.
- `src/lessons/` — `types.ts` (Lesson album schema — all fields required and non-empty), registry, index/detail pages.
- Registries are wired centrally by the session lead — **parallel agents must only create/edit files inside their own assigned folder** and report their registration entry back instead of editing shared files (registry, App.tsx, styles, this file).

## Code conventions

- TypeScript strict; `verbatimModuleSyntax` is on — use `import type` for type-only imports. `noUnusedLocals`/`noUnusedParameters` are on.
- Interactions: tap/click-first (works for mouse and touch), pointer events if dragging is essential, hit targets ≥ 44px (`--touch-target`). Every material gets a Reset control and honest control of error (self-checking like the physical material), never praise animations or point systems.
- Tests colocated as `*.test.ts` next to the model. Test pure logic, not React rendering. Worksheet generator tests must verify: answer-key correctness for every problem, parameter respect (e.g. regrouping=off ⇒ no carrying), seed determinism, and count honored.
- Plain CSS only, tokens from `src/styles/tokens.css`. Print rules in `print.css`; wrap printed pages in `.sheet-page` inside `.print-sheet`; UI chrome gets `.no-print`.
- Lessons: parent-facing tone (reader is an untrained parent), US grade labels, suggested spoken language goes in `PresentationStep.say`. Follow-up work must be pencil-and-paper, linking worksheet generator slugs where a printable fits.
- Prose/content: US English; numbers formatted with commas via `formatNumber`.

## Workflow

- Track progress in `plan/` — one PRD per major feature with a Status line and acceptance checklists. Update the relevant PRD when landing work; keep `PLAN.md` as the overview.
- Commit per completed phase with a clear message; the owner wants git history to tell the project's story. Repo will be public at `ericterpstra/montessori-math`.
- The owner values being asked before scope changes and expects "stop" to mean stop immediately.
- Serve for testing on the LAN (dev machine IP e.g. 192.168.1.208) or over Tailscale.
- Public hosting is Cloudflare Workers static assets (`wrangler.jsonc`), deployed automatically by Workers Builds on every push to `main` — `npm run deploy` is only a manual escape hatch. The site stays fully static — no server code, no bindings, no runtime network calls; adding any would break hard rule 4.
- The Worker name in Cloudflare must stay in sync with `name` in `wrangler.jsonc`, or Git builds fail.
