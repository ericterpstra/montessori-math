# Montessori Math

A complete, free Montessori mathematics resource for parents and students ages 4–12 (PK–6th grade): interactive virtual materials, a printable worksheet generator, and full album-style lessons that guide children from concrete manipulatives to abstract pencil-and-paper work.

> **Status: under construction.** The scaffold is in place; materials, worksheets, and lessons are being built. See [plan/](plan/) for per-feature progress.

## What this is

- **Virtual Montessori materials (19 planned)** — golden beads, stamp game, bead frames, racks & tubes, checkerboard, Seguin boards, strip boards, fraction circles, and more. For families who don't own the physical materials: real beads are always better when you have them.
- **Worksheet generator (12 generators planned)** — parameterized math-facts drills, multi-digit operations with regrouping control, place value, skip counting, fractions, long division, and more. Reproducible via seeds, with answer keys, in authentic Montessori color **or** ink-friendly B&W.
- **Album-style lessons (~34 planned)** — complete presentations written for parents with no Montessori training: aims, materials, step-by-step presentation with suggested language, points of interest, control of error, variations, extensions, and what comes next.
- **Parent guides** — why Montessori math works, how to give a three-period lesson, a printable PK–6 scope & sequence, glossary, and FAQ.

## What this is not

- **No accounts, no login.** Nothing to sign up for.
- **No lesson tracking or LMS features.** This is a resource library, not a learning platform.
- **No on-screen drill for kids.** All child practice outside the virtual materials themselves is printable or pencil-and-paper, by design.
- **No analytics, no CDNs, no server.** A fully static site that works offline once loaded.

## Getting started

Requires [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev        # dev server (LAN-accessible; Vite prints the Network URL)
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload, bound to all interfaces |
| `npm run build` | Type-check (strict) + production build to `dist/` |
| `npm run preview` | Serve the production build on port 4173, LAN-accessible |
| `npm test` | Run the Vitest suite (math models, generators, content schema) |
| `npm run test:watch` | Vitest in watch mode |

### Viewing from other devices on your network

`npm run preview` serves the production build on `http://<your-LAN-IP>:4173` (e.g. `http://192.168.1.208:4173`) — usable from tablets and other computers on the same network.

## Printing

Worksheets and lessons are designed for US Letter through the browser's print dialog (which also saves to PDF). Every worksheet offers:

- **Color** — authentic Montessori color coding (units green, tens blue, hundreds red, golden beads golden), or
- **B&W** — an ink-friendly variant that carries the same information without color.

Answer keys print on their own page so they're easy to withhold.

## Tech stack

Vite + React 19 + TypeScript (strict), react-router, plain CSS with design tokens, Vitest. No backend, no database. Worksheets are generated client-side with a seeded RNG so the same seed always reproduces the same sheet.

## Project structure

```
plan/            Per-feature PRDs and progress tracking
src/
  lib/           Pure math models: place value, exchanges, seeded RNG, strands
  components/    Shared UI: bead SVGs, number cards, stamp tiles, material shell
  materials/     One folder per virtual material (model + tests + UI + lessons)
  worksheets/    Generator modules (pure generate() + tests) and builder UI
  lessons/       Album lesson types, registry, and pages
  parents/       Parent guide pages
  styles/        Design tokens, global, print, materials, album CSS
```

## Development docs

- [PLAN.md](PLAN.md) — the full project plan with verifiable goals
- [plan/](plan/) — one PRD per major feature, updated as work lands
- [CLAUDE.md](CLAUDE.md) — conventions and constraints for coding agents

## License

Not yet chosen. Until one is added, all rights reserved by the repository owner.
