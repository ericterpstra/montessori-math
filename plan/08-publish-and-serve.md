# PRD 08 — Publish & serve

**Status:** Not started (README already written) · runs last

## Overview

Public GitHub repo + LAN test URL. No public web hosting for now (owner decision); GitHub Pages is a documented future option.

## Steps

- [x] `README.md` with overview, setup, scripts, printing guide, structure
- [ ] Final commit sweep: working tree clean, plan/ PRD statuses current
- [ ] `gh repo create ericterpstra/montessori-math --public --source=. --push` (default branch `main`)
- [ ] Verify repo renders correctly on GitHub (README, plan/ links)
- [ ] `npm run build` → `npm run preview` running in background on the dev machine
- [ ] Confirm from another device that `http://192.168.1.208:4173` serves the site
- [ ] Report the URL to the owner

## Acceptance criteria

- [ ] Repo public at github.com/ericterpstra/montessori-math with full history
- [ ] LAN URL reachable and serving the production build
- [ ] Owner has restart instructions (`npm run preview`) in README
