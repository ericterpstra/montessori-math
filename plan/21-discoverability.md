# PRD 21 — Discoverability: prerendered pages, link previews, sitemap

**Status:** Done — built and verified locally on 2026-10-08; it goes live when this branch merges to `main` (Workers Builds deploys every push).
**Effort:** M
**Depends on:** PRD 08 (Cloudflare hosting), PRD 17 (the service worker)
**Numbering:** PRD 20 stays reserved for the printables and material-layout follow-up that PRD 19 and `QA-CHECKLIST.md` point to.

## Why

This is Step 0.1 of the [marketing plan](MARKETING.md): fix how the site looks to search engines and link previews before telling anyone about it. On 2026-10-08 the live site had these problems:

- **Every URL served the same HTML:** one `<title>`, one description, and an empty `<div id="root">`. Google runs JavaScript eventually, but Facebook, Pinterest, iMessage, Slack and Reddit previews never do, and neither do most other crawlers, AI assistants' included. A shared link to any lesson previewed as the home page with no image, and to those crawlers the 41 lessons didn't exist.
- **No sitemap or robots file:** `/robots.txt` and `/sitemap.xml` returned the home page (`200 text/html`).
- **No real 404s:** any typo returned `200` with the home page (a "soft 404").
- **No preview image** (`og:image`).

## Binding product rules

- **Fully static (hard rule 4).** Everything happens at build time and ships as static files. Nothing on a page makes a request at runtime. The JSON-LD block is inert data, and only the preview crawlers fetch the preview image.
- **No new dependencies (hard rule 5).** React 19's `react-dom/static`, React Router's `StaticRouter` and Vite's SSR build were already installed. The preview image is drawn once by any Chrome and committed.
- **No analytics (hard rule 1).** Reach is measured from outside the site: Search Console, Bing Webmaster Tools and Cloudflare's own counts (marketing plan, "Measuring without analytics").
- **Offline stays whole (PRD 17).** After one visit, every page still works with the network off.
- **Content is the owner's.** Descriptions are the registries' own sentences, verbatim. Tuning titles and descriptions for search is a later, data-driven step (marketing plan Step 4), page by page and the owner's call.

## Design decisions

1. **Prerender every route at build time.** `scripts/prerender.mjs` runs after `vite build`. It builds `src/prerender/entry.tsx` for Node with Vite, renders each route through `StaticRouter` with React's `prerender` (which waits for anything that suspends and fails on render errors), and writes one HTML file per page into `dist/`.
2. **One file per page, at Cloudflare's clean URL.**
   - `/lessons/golden-beads-intro` comes from `lessons/golden-beads-intro.html`, and `/lessons` from `lessons.html`, which sits beside the `lessons/` folder.
   - Cloudflare's `auto-trailing-slash` handling (its default, now stated in `wrangler.jsonc`) serves `foo.html` at `/foo`. It 307-redirects `/foo/` and `/foo.html` there.
   - `not_found_handling` changed from `single-page-application` to `404-page`, so an unknown path gets `404.html` with a real 404 status.
3. **Each page's head carries:**
   - a `<title>` from the page itself: `useDocumentTitle` reports its name into `DocumentTitleContext` during the server render, since effects never run there;
   - a meta description from the registry (`src/prerender/routes.ts`: material summary, lesson overview, worksheet, kit and guide descriptions, and a written sentence for each index page);
   - a canonical link on `https://montessori-math.org`, which also covers the `workers.dev` duplicate;
   - Open Graph and Twitter card tags, plus `WebSite` JSON-LD on the home page, which lets search results show the site's name;
   - on the 404 page only, a `noindex` tag.
4. **The browser adopts the prerendered markup only when it is the same page.** `#root` names the path it was rendered for (`data-prerendered`). `src/main.tsx` hydrates when that path matches and the URL has no query string. Queries drive presentation mode, worksheet settings, the planner and the age tabs, none of which were prerendered. Anything else renders from scratch over the HTML: the app shell, the 404 page, or any URL with a query.
5. **A page's first render must be deterministic, and the build enforces it.** Every route is rendered twice under different `Math.random` sequences, and the build fails if the two differ, so hydration can't hit a mismatch from randomness.
   - **The materials render only in the browser.** Several start in a random state, and each one's stylesheet arrives with its lazy chunk. Their prerendered pages carry "Loading material…" in place of the material.
   - **The worksheet builder's sheet preview and its "Seed N" note** wait as well, because the fallback seed is picked per visit.
   - Both wait on `useHydrated()` (`src/components/useHydrated.ts`, a `useSyncExternalStore` that is false on the server and during hydration). In a from-scratch render it is true from the first render, so nothing changes there.
6. **The service worker answers navigations with an empty app shell.** That's `app-shell.html`, Vite's untouched template, cached under `/app-shell`. Cloudflare serves that URL without a redirect, which matters because a navigation answered with a redirected response fails.
   - The prerendered pages, `404.html`, the sitemap, `robots.txt` and the preview image are crawler files. They're kept out of the precache, so an install costs what it did before: 54 files.
   - Returning visitors render client-side from the shell, as before.
7. **Titles restore to the home title.** `useDocumentTitle` used to restore whatever title came before. A prerendered page starts with its own title already set, so leaving it would have kept that title. It now restores `DEFAULT_TITLE`, which a test keeps equal to `index.html`'s `<title>`.
8. **The scroll position is left alone on the first render.** `ScrollToTop` now acts only on navigation inside the site. The browser has already placed the page, and a reader may have scrolled the prerendered page before the script arrived.
9. **`robots.txt` opens every page to every crawler,** search engines and AI assistants alike, because the goal is reach.
   - `sitemap.xml` lists all 96 pages.
   - It has no `lastmod`, since there's no honest per-page date.
   - `/app-shell` is served with `X-Robots-Tag: noindex`.
10. **One site-wide preview image,** 1200×630. `scripts/og-image/og-image.html` lays out the home page's Plate I with the built stylesheet and fonts, and `scripts/og-image/render.mjs` screenshots it with any Chrome. The PNG is committed; the build never draws it.
11. **`npm run preview` answers like Cloudflare.** Preview runs as an `mpa` app, so Vite resolves `/foo` to `foo.html`, and a small plugin in `vite.config.ts` serves `404.html` for unknown pages. The status is 200 in preview; Cloudflare sends a real 404. `npm run dev` is unchanged and never prerenders.

## New and changed files

| File | Change |
|---|---|
| `scripts/prerender.mjs` | New. The build step: SSR build, render each route twice, write pages, `404.html`, `app-shell.html`, `sitemap.xml`, `robots.txt` |
| `src/prerender/entry.tsx` | New. Server entry: `renderPage(path)` plus the helpers the script uses |
| `src/prerender/head.ts` (+ test) | New. Head tags, template filling, sitemap, robots: pure string functions |
| `src/prerender/routes.ts` (+ test) | New. Every page and its description, from the registries |
| `src/components/useHydrated.ts` | New. False until the page is live in the browser |
| `src/components/PageHeader.tsx` | `DEFAULT_TITLE`, `documentTitle()`, `DocumentTitleContext`; restore the home title on unmount |
| `src/components/Layout.tsx` | `ScrollToTop` skips the first render |
| `src/main.tsx` | Hydrate a matching prerendered page, otherwise render from scratch |
| `src/materials/MaterialPage.tsx` | The material waits for `useHydrated()` |
| `src/worksheets/BuilderPage.tsx` | The sheet preview and seed note wait for `useHydrated()` |
| `scripts/generate-sw.mjs` | Navigations answered by `/app-shell`; crawler files left out of the precache |
| `public/_headers` | `/app-shell`: `no-cache`, `X-Robots-Tag: noindex` |
| `wrangler.jsonc` | `html_handling: auto-trailing-slash` (explicit), `not_found_handling: 404-page` |
| `vite.config.ts` | Preview mirrors Cloudflare (`mpa` + `404.html`) |
| `package.json` | `build` runs `prerender.mjs` between `vite build` and `generate-sw.mjs` |
| `public/og-image.png`, `scripts/og-image/` | New. The preview image and how to redraw it |

## Testing

- **Unit (Vitest):** `head.test.ts` (16 tests: escaping, canonical and preview tags, home-only JSON-LD, noindex, filling the real `index.html`, sitemap, robots) and `routes.test.ts` (5 tests: every registry entry listed once at a clean path, every page but home described, no two descriptions alike). The suite runs 917 tests in 50 files, all green.
- **The build itself** fails if a page:
  - renders differently on two runs;
  - renders the Not Found page;
  - sets no title, or more than one;
  - throws while rendering.
- **In a real browser** (headless Chromium driven over the DevTools protocol on the dev machine; a local check, not committed):
  - All 96 pages plus 6 edge cases loaded with zero console errors or warnings.
  - All 96 prerendered pages were hydrated in place: React kept the server DOM.
  - Every material appeared after hydration, every builder showed its sheet and pinned `?seed=`, and the edge cases (a typo, an unknown lesson, a seeded worksheet, presentation mode, an age tab, a `utm_` link) rendered from scratch.
  - A deliberately broken page produced React's hydration error #418, so the check is real.
  - With the service worker installed, navigations came from the app shell, and lessons, materials, worksheets and kits all loaded with the network off.
  - Leaving a page restored the home title, navigation scrolled to the top, and a page scrolled before its script loaded kept its place.
- **Cloudflare's own asset server** (`wrangler dev` on the built `dist/`):
  - `/lessons` and `/lessons/golden-beads-intro` return 200 from their files.
  - Their `/…/` and `….html` spellings 307 to the clean URL.
  - `/nope` and `/lessons/not-a-lesson` return 404 with the Not Found page.
  - `/app-shell` comes back `no-cache` and `noindex`.

## Acceptance criteria

- [x] Every page in the registries is served as its own HTML file with its own title, meta description, canonical link and preview tags, and its content in the markup
- [x] `/sitemap.xml` lists every page; `/robots.txt` allows all crawlers and names the sitemap
- [x] An unknown path returns a 404 status with the Not Found page, marked `noindex`
- [x] A shared link has a 1200×630 preview image drawn in the Album's style
- [x] React hydrates every prerendered page with no console errors; query-string pages and the 404 page render cleanly from scratch
- [x] The build fails on any page whose first render isn't deterministic
- [x] Offline still works after one visit, and the precache didn't grow
- [x] `npm run build` and `npm test` green; no new dependencies; nothing requested at runtime

## After deploy (owner, about 10 minutes)

- [ ] `curl -s https://montessori-math.org/lessons/golden-beads-intro | grep '<title>'` shows "Introduction to the Golden Beads · Montessori Math"
- [ ] `https://montessori-math.org/sitemap.xml` and `/robots.txt` open as XML and text
- [ ] `curl -sI https://montessori-math.org/no-such-page` shows `HTTP/2 404`
- [ ] Paste a lesson link into iMessage or Slack: the preview shows the lesson's title, its description and the Plate I image
- [ ] [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/) on the home page and one lesson: no warnings about missing tags
- [ ] Search Console: submit the sitemap (marketing plan Step 0.4)

## Later, not in this PRD

- Preview images per section (materials, lessons, worksheets) instead of one for the whole site.
- Titles and descriptions tuned from Search Console's queries (marketing plan Step 4).
- PNG home-screen icons for iOS. PRD 17 ruled them out for lack of a dependency-free renderer; `scripts/og-image/render.mjs` is one.
