# PRD 08 — Publish & serve

**Status:** Done

## Overview

Public GitHub repo + LAN/Tailscale test URL. Public web hosting was initially
deferred (owner decision); the site now also deploys to **Cloudflare Workers
static assets** — see `wrangler.jsonc` and `npm run deploy`. GitHub Pages was
the documented alternative and was not used.

## Steps

- [x] `README.md` with overview, setup, scripts, printing guide, structure
- [x] Final commit sweep: working tree clean, plan/ PRD statuses current
- [x] `gh repo create ericterpstra/montessori-math --public --source=. --push` (default branch `main`)
- [x] Verify repo renders correctly on GitHub (README, plan/ links)
- [x] `npm run build` → `npm run preview` running in background on the dev machine
- [x] Confirm from another device that `http://192.168.1.208:4173` serves the site
- [x] Report the URL to the owner

## Acceptance criteria

- [x] Repo public at github.com/ericterpstra/montessori-math with full history
- [x] LAN URL reachable and serving the production build
- [x] Owner has restart instructions (`npm run preview`) in README
