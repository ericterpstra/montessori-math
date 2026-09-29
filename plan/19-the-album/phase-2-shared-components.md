# PRD 19 · Phase 2 — Shared components

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Steps 12–17. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


The pieces every page is built from: the page shell (running head, colophon and the shared column), `PageHeader`, the plate thumbnails, the contents components, the form controls and the desk under printable previews. After this phase the header, footer and every form field have their new look; the plates, contents rows and desk exist but no page uses them yet.

## Step 12 — Running head, colophon and the shared column

**Files:** `src/styles/layout.css` (new), `src/components/Layout.tsx` (modified), `src/main.tsx` (modified), `src/styles/global.css` (modified: deletions only), `src/styles/materials.css` (modified: one temporary phone rule inserted; Step 28 replaces it). Step 6 already set the theme colour in `index.html` and the manifest to the new `--paper`.

The header becomes a running head on paper with an Oxford rule under it and a golden silk ribbon over the current section. The footer becomes a centred colophon under an Oxford rule, with a fleuron and a short link row. Header, main and footer now share one column, which fixes the footer's 16px offset (S1-16) and the 12px phone gutter (S8-20). On phones the header is one title line plus one scrolling nav row, about 110px instead of 160px (S1-07).

**1. Create `src/styles/layout.css`** with exactly this content. It includes the PageHeader and `.text-link` rules that Step 13 and later steps use. It does not define `.meta-line` (Step 11's rule in `global.css`) or the ≤640px `--container` value (Step 6's, in `tokens.css`):

```css
/* ------------------------------------------------------------------
   Page chrome: The Album (PRD 19).
   One shared column, the running head (header + nav + silk ribbon),
   the colophon (footer), the PageHeader pattern and text links.
   Chrome tokens only. The golden material tokens appear here only as
   the silk ribbon / underline and the bead fleuron (both decoration,
   always paired with bold weight or text).
   ------------------------------------------------------------------ */

/* ---------- One column for header, main and footer ---------- */

@media screen {
  /* Print keeps the full Letter width: print.css resets main.site-main. */
  .container {
    width: var(--container);
    max-width: none;
    margin-left: auto;
    margin-right: auto;
  }

  /* The colophon sits at the foot of short pages (404) instead of mid-screen. */
  .site-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
  }

  .site-shell > .site-main {
    flex: 1 0 auto;
  }
}

main.site-main {
  padding: var(--space-5) 0 var(--space-8);
}

/* ---------- Running head ---------- */

.site-header {
  background: var(--paper);
}

.site-header-inner {
  --head-pad: 1.25rem;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4) var(--space-7);
  padding: var(--head-pad) 0 calc(0.45rem + 6px);
  background: var(--oxford-under);
}

.site-title {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: var(--touch-target);
  font-family: var(--font-text);
  font-size: 1.625rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--ink);
  text-decoration: none;
}

.site-title:hover {
  color: var(--accent);
}

.site-title svg {
  flex: none;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-4);
  margin-left: auto;
}

/* Every link is a full 44 × 44 target, even "Kits"; the 0.35rem side
   padding also keeps the phone's inset focus ring off the letters. */
.site-nav a {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
  padding: 0 0.35rem;
  font-family: var(--font-ui);
  font-size: var(--fs-ui);
  font-weight: 500;
  line-height: 1.2;
  color: var(--ink);
  text-decoration: none;
}

/* An invisible bold copy of the label reserves the bold width, so the row
   never shifts when the current section's link turns bold. */
.site-nav a::after {
  content: attr(data-label);
  content: attr(data-label) / '';
  height: 0;
  overflow: hidden;
  visibility: hidden;
  font-weight: 700;
  pointer-events: none;
  user-select: none;
}

.site-nav a:hover {
  color: var(--accent);
}

.site-nav a.active {
  color: var(--ink);
  font-weight: 700;
}

/* The silk ribbon: a 12 × 22 golden bookmark hanging from the page's top
   edge over the current section (bold weight carries the same meaning). */
@media screen and (min-width: 1021px) {
  .site-nav a.active::before {
    content: '';
    position: absolute;
    top: calc(-1 * var(--head-pad));
    left: 50%;
    width: 0;
    height: 17px;
    margin-left: -6px;
    border-left: 6px solid var(--golden);
    border-right: 6px solid var(--golden-dark);
    border-bottom: 5px solid transparent;
    pointer-events: none;
  }
}

/* Tablet: title on one line, the nav on the next; a golden underline
   replaces the ribbon. */
@media screen and (max-width: 1020px) {
  .site-header-inner {
    --head-pad: var(--space-3);
    row-gap: 0;
  }

  .site-nav {
    width: 100%;
    margin-left: 0;
  }

  .site-nav a.active {
    box-shadow: inset 0 -3px 0 var(--golden);
  }
}

/* Phone: one title line plus one sideways-scrolling nav row (about 110px
   in all instead of 160px). The right edge fades while more links lie
   beyond; the end padding lets the last link scroll clear of the fade. */
@media screen and (max-width: 640px) {
  main.site-main {
    padding: var(--space-5) 0 var(--space-7);
  }

  .site-header-inner {
    --head-pad: var(--space-2);
    gap: 0;
  }

  .site-title {
    font-size: 1.4rem;
  }

  .site-nav {
    flex-wrap: nowrap;
    gap: var(--space-4);
    width: calc(100% + 32px);
    margin: 0 -16px;
    padding: 0 2.5rem 0 16px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    /* keyboard focus scrolls a link out of the fade, not just into the box */
    scroll-padding-inline: 16px 2.5rem;
    scrollbar-width: none;
    /* mask alpha only: currentColor is opaque ink, so this is not a colour */
    -webkit-mask-image: linear-gradient(to right, currentColor calc(100% - 2.5rem), transparent);
    mask-image: linear-gradient(to right, currentColor calc(100% - 2.5rem), transparent);
  }

  .site-nav::-webkit-scrollbar {
    display: none;
  }

  .site-nav a {
    flex: none;
  }

  /* inside the scroller an outside ring would be clipped */
  .site-nav a:focus-visible {
    outline-offset: -3px;
  }
}

/* ---------- Colophon ---------- */

.site-footer {
  padding: 0 0 var(--space-7);
  background: var(--paper);
  color: var(--ink-soft);
  font-size: var(--fs-ui);
}

.site-footer-inner {
  padding-top: var(--space-6);
  background: var(--oxford-over);
  text-align: center;
}

.site-footer p {
  max-width: 38rem;
  margin: 0 auto var(--space-3);
  font-family: var(--font-text);
  font-size: var(--fs-read-sm);
  font-style: italic;
  line-height: 1.55;
}

.colophon-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 var(--space-5);
  margin-top: var(--space-4);
}

.colophon-links a {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  font: 500 var(--fs-ui) / 1.2 var(--font-ui);
  color: var(--ink);
}

/* Three golden beads: the section-break ornament. */
.fleuron {
  display: block;
  width: 44px;
  height: 12px;
  margin: 0 auto var(--space-5);
  background: var(--fleuron);
}

/* ---------- PageHeader: title, meta line, lede, actions top right ---------- */

.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: var(--space-7);
  align-items: start;
  margin-bottom: var(--space-5);
}

.page-header.has-actions {
  grid-template-columns: minmax(0, 1fr) auto;
}

.page-header-main > :last-child {
  margin-bottom: 0;
}

.page-header h1 {
  margin: 0 0 var(--space-2);
}

.page-header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-top: 0.45rem;
}

.page-meta {
  margin: 0 0 var(--space-3);
}

.page-lede,
.page-intro {
  max-width: var(--measure);
  font-family: var(--font-text);
  font-size: var(--fs-lede);
  line-height: 1.5;
  color: var(--ink);
}

.page-lede {
  margin: 0;
}

.page-kicker {
  margin: 0 0 var(--space-4);
  font: 700 var(--fs-caps) / 1.3 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-wrap: balance;
  color: var(--accent);
}

@media (max-width: 760px) {
  .page-header.has-actions {
    grid-template-columns: minmax(0, 1fr);
  }

  .page-header-actions {
    justify-content: flex-start;
    padding-top: var(--space-4);
  }
}

@media screen and (max-width: 640px) {
  .page-lede,
  .page-intro {
    font-size: 1.1875rem;
  }
}

/* ---------- Quiet arrow links (secondary actions) ---------- */

.text-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--touch-target);
  font: 600 var(--fs-ui) / 1.2 var(--font-ui);
  color: var(--ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
  text-decoration-color: var(--link-rule);
}

.text-link:hover {
  color: var(--accent);
  text-decoration-color: currentColor;
}

.text-link .icon {
  width: 18px;
  height: 18px;
}
```

**2. Import it in `src/main.tsx`.** After Step 3 the stylesheet imports begin:

```ts
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/print.css'
```

Insert one line directly after `global.css`, before `print.css`:

```ts
import './styles/layout.css'
```

Step 15 adds `contents.css` directly under it, and Step 16 adds `forms.css` under that (convention 9).

**3. Delete the old shell rules from `src/styles/global.css`.**
- Delete original lines **60–140** (Steps 7–11 changed the file above them, so find the block by its text): from `/* ---------- Layout shell ---------- */` (line 60) through the closing `}` of `.site-footer-inner` (line 139, whose rule is `max-width: 1100px; margin: 0 auto;`) and the blank line 140. This removes `.site-header` (4px wood border, white card, shadow), `.site-header-inner`, `.site-title`, `.site-title:hover`, `.site-nav`, `.site-nav a` (pill padding, `--ink-soft`), `.site-nav a:hover` (paper-warm fill), `.site-nav a.active` (paper-warm pill, `--accent-dark`), `main.site-main` (1100px, `1.5rem 1rem 3rem`), `.site-footer` (paper-warm band with its padding outside the column) and `.site-footer-inner`. They must go: several of them set `background` and `border`, which `layout.css` does not reset.
- In the phone query at lines 291–295, delete lines **293–294** only:

```css
  .site-header-inner { padding: 0.5rem 0.75rem; }
  main.site-main { padding: 1rem 0.75rem 2.5rem; }
```

Leave the line above them: Step 7 already rewrote the old line 292 as the scoped legacy phone h1.

**4. Replace `src/components/Layout.tsx`.** The current file renders `<>` + `header.site-header > div.site-header-inner` + `main.site-main > ErrorBoundary > Outlet` + `footer > div.site-footer-inner > p ×2` + `<ScrollToTop/>`. The error boundary arrived on `main` in PR #8 (`d769872`); keep it exactly as it is, keyed by pathname and with no wrapper element, because the print isolation in Addition Charts, Multiplication Charts and Bead Chains selects `main.site-main > *`. The new file:
- wraps the page in `div.site-shell`;
- adds `container` to the three inner boxes;
- gives every `NavLink` a `data-label`;
- keeps the active link in view on phones;
- adds the fleuron and the colophon links (`nav[aria-label="Footer"]`).

`ScrollToTop`, `NAV`, the `ErrorBoundary` around the `Outlet`, the logo bead SVG and the two footer paragraphs are unchanged.

```tsx
import { useEffect, useRef } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const NAV = [
  { to: '/materials', label: 'Materials' },
  { to: '/lessons', label: 'Lessons' },
  { to: '/worksheets', label: 'Worksheets' },
  { to: '/kits', label: 'Kits' },
  { to: '/planner', label: 'Planner' },
  { to: '/parents', label: 'For Parents' },
  { to: '/ages', label: 'By Age' },
]

/** The colophon's short link row. */
const COLOPHON = [
  { to: '/lessons', label: 'Lessons' },
  { to: '/materials', label: 'Materials' },
  { to: '/worksheets', label: 'Worksheets' },
  { to: '/parents', label: 'For Parents' },
  { to: '/parents/scope-and-sequence', label: 'Scope & sequence' },
]

export default function Layout() {
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Phones: the nav is one sideways-scrolling row. Bring the current
    // section's link into view so its golden underline is visible.
    const nav = navRef.current
    if (!nav || nav.scrollWidth <= nav.clientWidth) return
    const active = nav.querySelector<HTMLElement>('a.active')
    if (!active) {
      nav.scrollLeft = 0
      return
    }
    const navBox = nav.getBoundingClientRect()
    const linkBox = active.getBoundingClientRect()
    nav.scrollLeft += linkBox.left - navBox.left - (navBox.width - linkBox.width) / 2
  }, [pathname])

  return (
    <div className="site-shell">
      <header className="site-header no-print">
        <div className="site-header-inner container">
          <Link to="/" className="site-title">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
              <defs>
                <radialGradient id="hdrbead" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" style={{ stopColor: 'var(--golden-light)' }} />
                  <stop offset="60%" style={{ stopColor: 'var(--golden)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--golden-dark)' }} />
                </radialGradient>
              </defs>
              <circle cx="16" cy="16" r="13" fill="url(#hdrbead)" />
            </svg>
            Montessori Math
          </Link>
          <nav className="site-nav" aria-label="Main" ref={navRef}>
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} data-label={item.label} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="site-main container">
        {/* Keyed by pathname so leaving a broken page recovers. */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="site-footer no-print">
        <div className="site-footer-inner container">
          <span className="fleuron" aria-hidden="true" />
          <p>
            A free Montessori mathematics resource for families — ages 4–12. No accounts, no tracking: just lessons to
            read, materials to explore, and worksheets to print.
          </p>
          <p>
            Virtual materials are a substitute for when the real thing isn't available — hands on real beads is always
            best. All child practice beyond the materials themselves is designed for pencil and paper.
          </p>
          <nav className="colophon-links" aria-label="Footer">
            {COLOPHON.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  )
}
```

**5. Keep every phone stage at today's width until Step 28.** On `album-baseline` a phone stage is `viewport − 24px` wide (12px main padding each side). The new 16px gutter would make it 8px narrower and reflow the materials, and the `stages390` gate would FAIL from here to Step 28. Step 28 mounts the plate with a 4px bleed that gives those 8px back (decision 19); until then the shell carries the same bleed. In `src/styles/materials.css`, directly after the current lines 3–5:

```css
.material-shell {
  margin-top: 1rem;
}
```

insert:

```css

/* Phones: the gutter grew from 12px to 16px (PRD 19, Step 12). Until Step 28
   mounts the plate, the shell bleeds 4px back into it, so every stage keeps
   today's width (viewport − 24px). Step 28 replaces this rule. */
@media screen and (max-width: 640px) {
  .material-shell {
    margin-left: -4px;
    margin-right: -4px;
  }
}
```

Focus mode is unaffected: `.material-shell.focus-mode { margin: 0 }` is more specific. The toolbar and help box bleed 4px with the shell until Step 28; that in-between look never ships.

**Check:** `npm run build` green.
- At 390 on `/materials/golden-beads`, `Math.round(document.querySelector('.material-stage').getBoundingClientRect().width)` is `366`, as on `album-baseline`, and the stage gate PASSes (both suites).
- At 1400px on `/materials`, run `['.site-header-inner', 'main.site-main', '.site-footer-inner'].map(s => document.querySelector(s).getBoundingClientRect().left)` in the console. All three values must be equal, 166 when the scrollbar overlays the page.
- The ribbon's top is at y=0: `getComputedStyle(document.querySelector('.site-nav a.active'), '::before').top` is `-20px`, and the link's top is 20px.
- Record `[...document.querySelectorAll('.site-nav a')].map(a => a.getBoundingClientRect().left)` on `/materials` and again on `/ages`. The two arrays are identical, so there is no bold shift.
- At 390px on `/ages`, `document.querySelector('.site-header').offsetHeight` is ≤ 112. "By Age" is scrolled into view with a golden underline.
- At 1400 and at 390, `[...document.querySelectorAll('.site-nav a')].every((a) => a.offsetWidth >= 44 && a.offsetHeight >= 44)` is `true` ("Kits" is the narrowest).
- At 390 on `/materials/golden-beads`, press Tab from the top of the page: when "Planner", which starts under the fade, takes focus, the nav scrolls it clear of the fade.
- `/this-page-does-not-exist` at 1400×900: the footer's bottom equals the viewport bottom.

## Step 13 — `PageHeader`: one header pattern for every page type

**Files:** `src/components/PageHeader.tsx` (new). The CSS is already in `layout.css` (the "PageHeader" section).

Every page type gets the same header: a title, a small-caps meta line (with the boxed age from Step 11's `.badge.age`), a 21px ink lede, and the page's own action at the top right. On phones the action sits under the lede. This step defines the component. Steps 18–24 apply it to the hub pages, and Steps 30, 35 and 39–41 to the material, guide, builder, kit and planner pages. It also names each page's tab, bookmark and "Save as PDF" file (S9-23): `"Long Division · Montessori Math"` instead of the same title everywhere.

```tsx
import { useEffect } from 'react'
import type { ReactNode } from 'react'

/** The site name every page title ends with (and index.html's default title). */
export const SITE_NAME = 'Montessori Math'

/**
 * Names the browser tab, bookmark and "Save as PDF" file after the page:
 * "<name> · Montessori Math" while the calling page is mounted, restoring
 * the previous title on unmount. PageHeader calls it; pages that do not
 * render a PageHeader (the lesson album) call it directly.
 */
export function useDocumentTitle(name: string | undefined): void {
  useEffect(() => {
    if (!name) return
    const previous = document.title
    document.title = `${name} · ${SITE_NAME}`
    return () => {
      document.title = previous
    }
  }, [name])
}

export interface PageHeaderProps {
  /** The page's h1. */
  title: ReactNode
  /**
   * Plain-text name for the browser tab, bookmarks and "Save as PDF"
   * (document.title becomes "<docTitle> · Montessori Math"). Defaults to
   * `title` when that is a string; pass it whenever `title` is not.
   */
  docTitle?: string
  /** Small rubric capitals above the title. */
  kicker?: ReactNode
  /** The running meta line under the title: .badge spans (boxed age, grades, strand). */
  meta?: ReactNode
  /** The ink lede. Rendered inside <p className="page-lede">, so pass inline content only. */
  lede?: ReactNode
  /** The page's own actions, top right on desktop (Print, Walk through, New problems). */
  actions?: ReactNode
  /** Extra blocks under the lede, inside the header's main column. */
  children?: ReactNode
  /** Extra class on the <header>, e.g. 'guide-header'. */
  className?: string
  /** id for the h1, for aria-labelledby. */
  titleId?: string
}

/**
 * One page-header pattern for every page type: title, meta line, lede, and
 * the page's primary action in the top-right slot (stacked under the lede
 * at ≤760px). Styles live in src/styles/layout.css.
 */
export function PageHeader({ title, docTitle, kicker, meta, lede, actions, children, className, titleId }: PageHeaderProps) {
  useDocumentTitle(docTitle ?? (typeof title === 'string' ? title : undefined))

  return (
    <header className={`page-header${actions ? ' has-actions' : ''}${className ? ` ${className}` : ''}`}>
      <div className="page-header-main">
        {kicker && <p className="page-kicker">{kicker}</p>}
        <h1 id={titleId}>{title}</h1>
        {meta && <p className="page-meta meta-line">{meta}</p>}
        {lede && <p className="page-lede">{lede}</p>}
        {children}
      </div>
      {actions && <div className="page-header-actions no-print">{actions}</div>}
    </header>
  )
}
```

Usage contract for later steps:
- `actions` holds buttons or links (`<PrintButton/>`, a Walk-through `.btn`, New problems). The wrapper is already `.no-print`.
- `children` holds extra blocks under the lede, such as the builder's "For use with…" lines.
- Pass `docTitle` whenever `title` is not a plain string, or when a more specific tab name helps, e.g. `` docTitle={`${def.name} worksheet`} ``.
- Pages without a PageHeader (the lesson album) call `useDocumentTitle(lesson.name)` directly.
- The builder's header is Step 39's, written against the post-fix `BuilderPage.tsx`.

**Check:** `npm run build` green. After Step 18, open `/materials`: `document.title` is `Virtual Montessori Materials · Montessori Math`. Go to `/`: the title returns to `Montessori Math — Lessons, Materials & Worksheets` (index.html's default, restored by the effect cleanup). In React StrictMode dev, the title still settles correctly after the double-invoked effect.

## Step 14 — `MaterialThumb`: a mounted plate for each of the 21 materials

**Files:** `src/components/MaterialThumb.tsx` (new), `src/components/StampTile.tsx` (modified, line 5), `src/components/MaterialThumb.test.ts` (new).

Navigation gets imagery in the album's own language: a small mounted plate of the real material at the start of each contents row (the diagnosis item "no imagery in navigation"). The drawings reuse the site's own bead primitives and colour rules, so a plate can never show a colour the material does not use.

**1. `src/components/StampTile.tsx` line 5.** It currently reads `const STAMP_COLOR: Record<StampValue, string> = {`. Change it to:

```tsx
export const STAMP_COLOR: Record<StampValue, string> = {
```

Nothing else in the file changes, and stamp rendering is untouched.

**2. Create `src/components/MaterialThumb.tsx`:**

```tsx
import { memo } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Bead, BeadBar, HundredSquare, Skittle, ThousandCube } from './beads'
import { IconGlyph } from './Icon'
import { cardColor } from './NumberCard'
import { STAMP_COLOR } from './StampTile'
import type { StampValue } from './StampTile'

/**
 * MaterialThumb: a 72×48 "plate" (paper mat, ink hairline, inner line)
 * holding a tiny drawing of one virtual material, used at the start of
 * contents rows (/materials, /ages, home). Every drawing is laid out on a
 * 62×38 grid and every colour is a token: material tokens (--bead-*, --pv-*,
 * --golden*, --wood*, --inset-frame, --fraction-shade) for the material,
 * chrome tokens (--card, --ink, --line-strong …) for paper and card stock.
 * Beads, bars, squares, cubes and skittles are the beads.tsx primitives;
 * number cards and stamps use NumberCard's cardColor() and StampTile's
 * STAMP_COLOR (those two components render HTML, which cannot sit inside
 * an SVG, so their shapes are redrawn here with the same colour rules).
 * Decorative: the plate is aria-hidden; the row's text names the material.
 */

const f = (n: number) => Math.round(n * 100) / 100

/** Tint of a place-value colour on card stock (charts, checkerboard squares). */
const tint = (c: string) => `color-mix(in srgb, ${c} 42%, var(--card))`

interface RectProps {
  x: number
  y: number
  w: number
  h: number
  fill: string
  rx?: number
  stroke?: string
  sw?: number
  opacity?: number
  /** [degrees, cx, cy] */
  rotate?: [number, number, number]
}

function Rect({ x, y, w, h, fill, rx, stroke, sw, opacity, rotate }: RectProps) {
  return (
    <rect
      x={f(x)}
      y={f(y)}
      width={f(w)}
      height={f(h)}
      rx={rx}
      style={{ fill }}
      stroke={stroke}
      strokeWidth={sw}
      opacity={opacity}
      transform={rotate ? `rotate(${rotate.join(' ')})` : undefined}
    />
  )
}

function Line({ x1, y1, x2, y2, stroke, sw, dash }: { x1: number; y1: number; x2: number; y2: number; stroke: string; sw: number; dash?: string }) {
  return <line x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
}

function Dot({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return <circle cx={f(x)} cy={f(y)} r={r} style={{ fill }} />
}

/** A numeral centred on x with its baseline at y (number-card figures: --font-numeral). */
function Num({ x, y, size, fill, children }: { x: number; y: number; size: number; fill: string; children: ReactNode }) {
  return (
    <text x={f(x)} y={f(y)} fontSize={size} textAnchor="middle" style={{ fill, fontFamily: 'var(--font-numeral)', fontWeight: 700 }}>
      {children}
    </text>
  )
}

/** One bead of radius r centred at (x, y): the beads.tsx <Bead> (r = 0.45 × size). */
function B({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const size = r / 0.45
  return (
    <g transform={`translate(${f(x - size / 2)} ${f(y - size / 2)})`}>
      <Bead size={f(size)} fill={fill} />
    </g>
  )
}

/** A beads.tsx <BeadBar> whose first bead is centred at (x, y), bead pitch d.
 *  With no fill it takes the authentic bead-stair colour for n. */
function Bar({ x, y, n, d, fill, vertical }: { x: number; y: number; n: number; d: number; fill?: string; vertical?: boolean }) {
  return (
    <g transform={`translate(${f(x - d / 2)} ${f(y - d / 2)})`}>
      <BeadBar n={n} beadSize={d} fill={fill} vertical={vertical} />
    </g>
  )
}

/** A wooden board: --wood with a --wood-dark edge. */
function Board({ x, y, w, h, fill = 'var(--wood)' }: { x: number; y: number; w: number; h: number; fill?: string }) {
  return <Rect x={x} y={y} w={w} h={h} fill={fill} rx={1.2} stroke="var(--wood-dark)" sw={0.7} />
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ---------------------------------------------------------------------
   The 21 materials. Keys are material slugs (src/materials/registry.ts).
   --------------------------------------------------------------------- */

function BeadStairArt() {
  // bars 1–9 stacked like the stair, each in its own bead-stair colour
  return (
    <>
      {range(9).map((i) => (
        <Bar key={i} x={14.5} y={3.2 + i * 3.95} n={i + 1} d={3.95} />
      ))}
    </>
  )
}

function CardsAndCountersArt() {
  // numeral cards 1–5 with red counters paired beneath (odd one centred)
  return (
    <>
      {range(5).map((k) => {
        const n = k + 1
        const x = 4 + k * 11.6
        return (
          <g key={k}>
            <Rect x={x} y={2.5} w={9.4} h={11} fill="var(--card)" rx={1} stroke="var(--line-strong)" sw={0.5} />
            <Num x={x + 4.7} y={11} size={8} fill="var(--ink)">
              {n}
            </Num>
            {range(n).map((i) => {
              const odd = n % 2 === 1 && i === n - 1
              const dx = odd ? 0 : i % 2 ? 2.1 : -2.1
              return <B key={i} x={x + 4.7 + dx} y={19 + Math.floor(i / 2) * 4.4} r={1.75} fill="var(--bead-1)" />
            })}
          </g>
        )
      })}
    </>
  )
}

function TeenBoardArt() {
  // Seguin board A with a 3 card slid over the second 10 → 13, plus 10+3 and 10+4 in beads
  return (
    <>
      <Board x={3} y={2.5} w={30} h={33} />
      {range(4).map((r) => {
        const y = 5 + r * 7.8
        return (
          <g key={r}>
            <Rect x={5.5} y={y} w={25} h={6} fill="var(--card)" rx={0.6} />
            <Num x={14} y={y + 5} size={5.6} fill="var(--ink)">
              1
            </Num>
            {r === 1 ? (
              <>
                <Rect x={18} y={y - 0.6} w={7.2} h={7.2} fill="var(--card)" rx={0.6} stroke="var(--line-strong)" sw={0.5} />
                <Num x={21.6} y={y + 5} size={5.6} fill="var(--ink)">
                  3
                </Num>
              </>
            ) : (
              <Num x={21.6} y={y + 5} size={5.6} fill="var(--ink)">
                0
              </Num>
            )}
          </g>
        )
      })}
      <Bar x={40} y={5.3} n={10} d={2.95} fill="var(--golden)" vertical />
      <Bar x={44.4} y={5.3} n={3} d={2.95} vertical />
      <Bar x={51} y={5.3} n={10} d={2.95} fill="var(--golden)" vertical />
      <Bar x={55.4} y={5.3} n={4} d={2.95} vertical />
    </>
  )
}

function TenBoardArt() {
  // Seguin board B (10–40) and three golden ten-bars
  return (
    <>
      <Board x={3} y={2.5} w={30} h={33} />
      {['10', '20', '30', '40'].map((t, r) => {
        const y = 5 + r * 7.8
        return (
          <g key={t}>
            <Rect x={5.5} y={y} w={25} h={6} fill="var(--card)" rx={0.6} />
            <Num x={18} y={y + 5} size={5.6} fill="var(--ink)">
              {t}
            </Num>
          </g>
        )
      })}
      {range(3).map((k) => (
        <Bar key={k} x={40 + k * 4.2} y={5.3} n={10} d={2.95} fill="var(--golden)" vertical />
      ))}
    </>
  )
}

function HundredBoardArt() {
  // tiles 1–45 laid on the 10×10 board; two loose tiles beside it
  const empty = 'color-mix(in srgb, var(--wood-dark) 45%, var(--wood))'
  return (
    <>
      <Board x={12} y={1.5} w={36} h={35} />
      {range(100).map((i) => (
        <Rect key={i} x={13.4 + (i % 10) * 3.34} y={2.9 + Math.floor(i / 10) * 3.24} w={2.9} h={2.8} fill={i < 46 ? 'var(--card)' : empty} rx={0.3} />
      ))}
      <Rect x={51} y={10} w={5} h={5} fill="var(--card)" rx={0.4} stroke="var(--line-strong)" sw={0.4} rotate={[-12, 53.5, 12.5]} />
      <Rect x={52} y={20} w={5} h={5} fill="var(--card)" rx={0.4} stroke="var(--line-strong)" sw={0.4} rotate={[9, 54.5, 22.5]} />
    </>
  )
}

function BeadChainsArt() {
  // a light-blue 5-chain folded in three rows, with its arrow tickets
  const d = 2.75
  const rows = [9, 20, 31]
  return (
    <>
      {rows.map((y, r) => {
        const x0 = r % 2 ? 53 - 15 * d + d / 2 : 9 + d / 2
        return range(3).map((b) => <Bar key={`${r}-${b}`} x={x0 + b * 5 * d} y={y} n={5} d={d} />)
      })}
      <path
        d={`M${f(9 + 15 * d)} 9c4.5 0 4.5 11 0 11M${f(53 - 15 * d)} 20c-4.5 0-4.5 11 0 11`}
        fill="none"
        stroke="var(--bead-wire)"
        strokeWidth={0.7}
      />
      {[9 + 5 * d, 9 + 10 * d, 9 + 15 * d].map((x) => (
        <Rect key={x} x={x - 3} y={1.6} w={6} h={3.6} fill="var(--card)" stroke="var(--pv-ten)" sw={0.6} />
      ))}
    </>
  )
}

function GoldenBeadsArt() {
  // true proportions: the cube's face, the square's side and the bar are all
  // ten unit beads long (18 grid units; bead pitch 1.8), bottoms on one line
  const base = 30.5
  return (
    <>
      <g transform={`translate(5 ${f(base - 22.32)})`}>
        <ThousandCube size={22.32} />
      </g>
      <g transform={`translate(29.8 ${f(base - 18)})`}>
        <HundredSquare size={18} />
      </g>
      <Bar x={51.2} y={base - 18 + 0.9} n={10} d={1.8} fill="var(--golden)" vertical />
      <B x={55.5} y={base - 0.9} r={0.81} fill="var(--golden)" />
    </>
  )
}

function NumberCardsArt() {
  // 1000 / 200 / 30 / 4 stacked right-aligned: width ∝ digits (0.62 × height
  // per digit, as NumberCard), numerals in their place colour via cardColor()
  const h = 8
  return (
    <>
      {[1000, 200, 30, 4].map((v, i) => {
        const w = h * 0.62 * String(v).length
        const y = 1.6 + i * 8.9
        return (
          <g key={v}>
            <Rect x={41 - w} y={y} w={w} h={h} fill="var(--card)" rx={0.6} stroke="var(--line-strong)" sw={0.45} />
            <Num x={41 - w / 2} y={y + 6.3} size={6.4} fill={cardColor(v)}>
              {v}
            </Num>
          </g>
        )
      })}
    </>
  )
}

function SnakeGameArt() {
  // a snake of 3, 7, 5 | 8, 6 bars turning at the right; counted off into a golden ten and a 4
  const d = 3
  const top: [number, number][] = [
    [8, 3],
    [17, 7],
    [38, 5],
  ]
  const bottom: [number, number][] = [
    [32, 8],
    [14, 6],
  ]
  return (
    <>
      {top.map(([x, n]) => (
        <Bar key={n} x={x} y={7} n={n} d={d} />
      ))}
      <path d="M51.5 7c4.5 0 4.5 11 0 11" fill="none" stroke="var(--bead-wire)" strokeWidth={0.7} />
      {bottom.map(([x, n]) => (
        <Bar key={n} x={x} y={18} n={n} d={d} />
      ))}
      <Bar x={8} y={30.5} n={10} d={d} />
      <Bar x={41} y={30.5} n={4} d={d} />
    </>
  )
}

/** Shared frame of the two strip boards: card, 13 columns, coloured number row. */
function StripBoardFrame({ numberColor }: { numberColor: (col: number) => string }) {
  const cw = 56 / 13
  return (
    <>
      <Rect x={3} y={3} w={56} h={32} fill="var(--card)" stroke="var(--wood-dark)" sw={1} />
      {range(12).map((c) => (
        <Line key={c} x1={3 + (c + 1) * cw} y1={3} x2={3 + (c + 1) * cw} y2={35} stroke="var(--line-strong)" sw={0.3} />
      ))}
      {range(13).map((c) => (
        <Rect key={c} x={3.8 + c * cw} y={4} w={cw - 1.6} h={2.2} fill={numberColor(c)} opacity={0.8} />
      ))}
    </>
  )
}

function AdditionStripBoardArt() {
  // numbers 1–10 red, 11–18 blue; blue first-addend strips with red strips after them
  const cw = 56 / 13
  const strip = (y: number, n: number, fill: string, off: number) => (
    <Rect key={`${y}-${off}`} x={3.4 + off * cw} y={y} w={n * cw - 0.8} h={4.2} fill={fill} rx={0.5} />
  )
  return (
    <>
      <StripBoardFrame numberColor={(c) => (c < 10 ? 'var(--pv-hundred)' : 'var(--pv-ten)')} />
      <Line x1={3 + 10 * cw} y1={3} x2={3 + 10 * cw} y2={35} stroke="var(--pv-hundred)" sw={0.9} />
      {strip(12, 5, 'var(--pv-ten)', 0)}
      {strip(12, 4, 'var(--pv-hundred)', 5)}
      {strip(20, 3, 'var(--pv-ten)', 0)}
      {strip(20, 6, 'var(--pv-hundred)', 3)}
      {strip(28, 7, 'var(--pv-ten)', 0)}
    </>
  )
}

function SubtractionStripBoardArt() {
  // numbers 1–9 blue, 10–18 red; natural-wood cover strip and blue strips
  const cw = 56 / 13
  return (
    <>
      <StripBoardFrame numberColor={(c) => (c < 9 ? 'var(--pv-ten)' : 'var(--pv-hundred)')} />
      <Rect x={3.4 + 9 * cw} y={3.4} w={4 * cw - 0.8} h={3.6} fill="var(--wood)" stroke="var(--wood-dark)" sw={0.4} />
      <Rect x={3.4} y={12} w={4 * cw - 0.8} h={4.2} fill="var(--pv-ten)" rx={0.5} />
      <Rect x={3.4 + 4 * cw} y={12} w={5 * cw - 0.8} h={4.2} fill="var(--wood)" rx={0.5} stroke="var(--wood-dark)" sw={0.4} />
      <Rect x={3.4} y={20} w={6 * cw - 0.8} h={4.2} fill="var(--pv-ten)" rx={0.5} />
      <Rect x={3.4} y={28} w={2 * cw - 0.8} h={4.2} fill="var(--pv-ten)" rx={0.5} />
    </>
  )
}

function MultiplicationBeadBoardArt() {
  // the 6 card in the slot, 4 rows × 6 red beads laid in the holes, the red counter above
  return (
    <>
      <Board x={15} y={1.5} w={33} h={35} fill="var(--paper-warm)" />
      {range(100).map((i) => {
        const r = Math.floor(i / 10)
        const c = i % 10
        const x = 18 + c * 3
        const y = 6 + r * 3
        return r < 4 && c < 6 ? <B key={i} x={x} y={y} r={1.3} fill="var(--bead-1)" /> : <Dot key={i} x={x} y={y} r={0.6} fill="var(--line-strong)" />
      })}
      <Dot x={33} y={3.3} r={1.3} fill="var(--bead-1)" />
      <Rect x={4} y={13} w={8} h={10} fill="var(--card)" rx={0.6} stroke="var(--line-strong)" sw={0.45} />
      <Num x={8} y={20.6} size={7} fill="var(--ink)">
        6
      </Num>
    </>
  )
}

function DivisionBoardArt() {
  // four green skittles (beads.tsx Skittle) with green unit beads shared out beneath
  const k = 17 / 48
  return (
    <>
      <Board x={8} y={12} w={46} h={24} fill="var(--paper-warm)" />
      {range(4).map((i) => (
        <g key={i} transform={`translate(${f(14 + i * 7 - 12 * k)} -0.18)`}>
          <Skittle height={17} />
        </g>
      ))}
      {range(45).map((i) => {
        const r = Math.floor(i / 9)
        const c = i % 9
        const x = 14 + c * 4.8
        const y = 16 + r * 4.3
        return c < 4 && r < 3 ? <B key={i} x={x} y={y} r={1.45} fill="var(--pv-unit)" /> : <Dot key={i} x={x} y={y} r={0.6} fill="var(--line-strong)" />
      })}
    </>
  )
}

/** Shared 11×11 chart grid: header row blue, header column red, cells on card stock. */
function ChartGrid({ cell, dot }: { cell: (r: number, c: number) => string; dot: (r: number, c: number) => boolean }) {
  const cs = 3.2
  const x0 = 14
  const y0 = 2.5
  return (
    <>
      {range(121).map((i) => {
        const r = Math.floor(i / 11)
        const c = i % 11
        if (r === 0 && c === 0) return null
        const x = x0 + c * cs
        const y = y0 + r * cs
        const fill = r === 0 ? tint('var(--pv-ten)') : c === 0 ? tint('var(--pv-hundred)') : cell(r, c)
        return (
          <g key={i}>
            <Rect x={x} y={y} w={cs} h={cs} fill={fill} stroke="var(--line-strong)" sw={0.22} />
            {r > 0 && c > 0 && dot(r, c) && <Dot x={x + cs / 2} y={y + cs / 2} r={0.45} fill="var(--ink-soft)" />}
          </g>
        )
      })}
    </>
  )
}

function AdditionChartsArt() {
  // the working chart: filled triangle of sums (r + c ≤ 11)
  return <ChartGrid cell={(r, c) => (r + c <= 11 ? 'var(--card)' : 'var(--paper-warm)')} dot={(r, c) => r + c <= 11} />
}

function MultiplicationChartsArt() {
  // the "two fingers" meeting at 6 × 7, the meeting cell boxed in ink
  const hit = (r: number, c: number) => (r === 6 && c <= 7) || (c === 7 && r <= 6)
  return (
    <>
      <ChartGrid cell={(r, c) => (hit(r, c) ? tint('var(--pv-unit)') : 'var(--card)')} dot={() => true} />
      <Rect x={14 + 7 * 3.2} y={2.5 + 6 * 3.2} w={3.2} h={3.2} fill="none" stroke="var(--ink)" sw={0.7} />
    </>
  )
}

function StampGameArt() {
  // 2 thousands, 3 hundreds, 4 tens, 5 units stamps (STAMP_COLOR) above the wooden tray
  const cols: [StampValue, number][] = [
    [1000, 2],
    [100, 3],
    [10, 4],
    [1, 5],
  ]
  const s = 5.8
  return (
    <>
      {cols.map(([value, n], k) =>
        range(n).map((i) => {
          const x = 5 + k * 14 + (i % 2) * 6.4
          const y = 3 + Math.floor(i / 2) * 7.2
          // StampTile's own numeral ratios: 0.26 / 0.30 / 0.36 of the tile
          const size = s * (value >= 1000 ? 0.26 : value >= 100 ? 0.3 : 0.36)
          return (
            <g key={`${value}-${i}`}>
              <Rect x={x} y={y} w={s} h={s} fill={STAMP_COLOR[value]} rx={0.7} stroke="var(--bead-outline)" sw={0.35} />
              <text x={f(x + s / 2)} y={f(y + s / 2 + size * 0.36)} fontSize={f(size)} textAnchor="middle" style={{ fill: 'var(--card)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                {value}
              </text>
            </g>
          )
        }),
      )}
      <Rect x={3} y={26.5} w={56} h={9} fill="var(--wood)" rx={1} stroke="var(--wood-dark)" sw={0.6} />
      {[1, 2, 3].map((k) => (
        <Line key={k} x1={3 + k * 14} y1={27} x2={3 + k * 14} y2={35} stroke="var(--wood-dark)" sw={0.6} />
      ))}
    </>
  )
}

function BeadFrameArt() {
  // small bead frame: units, tens, hundreds, thousands wires, some beads moved right
  const wires: [number, string][] = [
    [3, 'var(--pv-unit)'],
    [6, 'var(--pv-ten)'],
    [2, 'var(--pv-hundred)'],
    [1, 'var(--pv-thousand)'],
  ]
  return (
    <>
      <Rect x={5} y={2.5} w={52} h={33} fill="var(--card)" rx={1} stroke="var(--wood)" sw={2.6} />
      {wires.map(([right, c], r) => {
        const y = 9 + r * 6.6
        return (
          <g key={r}>
            <Line x1={6.5} y1={y} x2={55.5} y2={y} stroke="var(--bead-wire)" sw={0.5} />
            {range(10 - right).map((i) => (
              <B key={`l${i}`} x={9 + i * 2.95} y={y} r={1.38} fill={c} />
            ))}
            {range(right).map((j) => (
              <B key={`r${j}`} x={53 - j * 2.95} y={y} r={1.38} fill={c} />
            ))}
          </g>
        )
      })}
    </>
  )
}

function CheckerboardArt() {
  // 7 × 5 squares coloured by place value from the bottom right, with bead bars on it
  const pv = ['var(--pv-unit)', 'var(--pv-ten)', 'var(--pv-hundred)']
  const cs = 6.5
  return (
    <>
      <Rect x={6} y={2} w={50} h={34} fill="var(--wood)" rx={1} stroke="var(--wood-dark)" sw={1.6} />
      {range(35).map((i) => {
        const r = Math.floor(i / 7)
        const c = i % 7
        return <Rect key={i} x={8.2 + c * cs} y={4 + r * cs} w={cs - 0.4} h={cs - 0.4} fill={tint(pv[(6 - c + (4 - r)) % 3])} />
      })}
      <Bar x={8.2 + 5 * cs + 1.2} y={4 + 4 * cs + 3} n={4} d={1.1} />
      <Bar x={8.2 + 4 * cs + 1.2} y={4 + 3 * cs + 3} n={3} d={1.3} />
      <Bar x={8.2 + 6 * cs + 1.2} y={4 + 3 * cs + 2} n={6} d={0.85} />
    </>
  )
}

function RacksAndTubesArt() {
  // a rack of unit/ten/hundred beads beside three test tubes with coloured caps
  const racks: [string, number][] = [
    ['var(--pv-unit)', 7],
    ['var(--pv-ten)', 5],
    ['var(--pv-hundred)', 8],
  ]
  const tubes: [string, number][] = [
    ['var(--pv-unit)', 7],
    ['var(--pv-ten)', 4],
    ['var(--pv-hundred)', 6],
  ]
  return (
    <>
      <Board x={3} y={4} w={27} h={30} />
      {racks.map(([c, n], r) => {
        const y = 10 + r * 9
        return (
          <g key={r}>
            <Line x1={5} y1={y} x2={28} y2={y} stroke="var(--wood-dark)" sw={0.6} />
            {range(n).map((i) => (
              <B key={i} x={7 + i * 2.6} y={y} r={1.2} fill={c} />
            ))}
          </g>
        )
      })}
      {tubes.map(([c, n], k) => {
        const x = 36 + k * 8.4
        return (
          <g key={k}>
            <Rect x={x} y={5} w={6.2} h={30} fill="var(--card)" rx={3} stroke="var(--line-strong)" sw={0.5} />
            <Rect x={x - 0.4} y={3.2} w={7} h={3} fill={c} rx={0.8} />
            {range(n).map((i) => (
              <B key={i} x={x + 1.75 + (i % 2) * 2.7} y={31.5 - Math.floor(i / 2) * 2.8} r={1.25} fill={c} />
            ))}
          </g>
        )
      })}
    </>
  )
}

function FractionCirclesArt() {
  // a green metal frame holding a circle with three red quarters in place; one quarter loose
  return (
    <>
      <Rect x={5} y={3} w={32} h={32} fill="var(--inset-frame)" rx={2.2} />
      <Dot x={21} y={19} r={12.6} fill="color-mix(in srgb, var(--inset-frame) 70%, var(--ink))" />
      <path d="M21 19V6.4A12.6 12.6 0 1 1 8.4 19z" style={{ fill: 'var(--fraction-shade)' }} stroke="var(--card)" strokeWidth={0.6} />
      <path d="M21 19v12.6M21 19H33.6" fill="none" stroke="var(--card)" strokeWidth={0.6} />
      <path d="M44 29V16.4A12.6 12.6 0 0 1 56.6 29z" style={{ fill: 'var(--fraction-shade)' }} stroke="var(--bead-outline)" strokeWidth={0.3} transform="rotate(-10 50 23)" />
    </>
  )
}

function DecimalBoardArt() {
  // unit | tenths | hundredths | thousandths columns in their pale place colours, the decimal point after the unit
  const cols = ['var(--pv-unit)', 'var(--pv-tenth)', 'var(--pv-hundredth)', 'var(--pv-thousandth)']
  const counts = [1, 3, 2, 4]
  return (
    <>
      <Rect x={3} y={3} w={56} h={32} fill="var(--card)" rx={1} stroke="var(--line-strong)" sw={0.5} />
      {cols.map((c, k) => {
        const x = 3 + k * 14
        return (
          <g key={k}>
            <Rect x={x + 0.6} y={3.6} w={12.8} h={4.2} fill={c} />
            {k > 0 && <Line x1={x} y1={3} x2={x} y2={35} stroke="var(--line-strong)" sw={0.4} />}
            {range(counts[k]).map((i) => {
              const bx = x + 4 + (i % 2) * 5.5
              const by = 13 + Math.floor(i / 2) * 6.5
              return k === 0 ? (
                <Rect key={i} x={bx - 1.4} y={by - 2.8} w={7.4} h={7.4} fill="var(--pv-unit)" rx={0.6} />
              ) : (
                <B key={i} x={bx} y={by} r={2.1} fill={c} />
              )
            })}
          </g>
        )
      })}
      <Dot x={16.9} y={33} r={1.1} fill="var(--ink)" />
    </>
  )
}

/* ---------------------------------------------------------------------
   Glyphs for things that are not materials.
   --------------------------------------------------------------------- */

function SheetArt() {
  // a worksheet with its answer key tucked behind
  return (
    <>
      <Rect x={24} y={4.5} w={22} h={30} fill="var(--paper-warm)" stroke="var(--line-strong)" sw={0.5} rotate={[6, 35, 20]} />
      <Rect x={16} y={3} w={23} h={31.5} fill="var(--card)" stroke="var(--line-strong)" sw={0.5} />
      <Line x1={18.5} y1={7} x2={36.5} y2={7} stroke="var(--ink)" sw={0.8} />
      {range(9).map((i) => {
        const x = 19 + (i % 3) * 6.3
        const y = 11 + Math.floor(i / 3) * 7.2
        return (
          <g key={i}>
            <Line x1={x + 1} y1={y} x2={x + 4} y2={y} stroke="var(--ink-soft)" sw={0.7} />
            <Line x1={x} y1={y + 2} x2={x + 4} y2={y + 2} stroke="var(--ink-soft)" sw={0.7} />
            <Line x1={x} y1={y + 3.6} x2={x + 4.2} y2={y + 3.6} stroke="var(--ink)" sw={0.45} />
          </g>
        )
      })}
    </>
  )
}

function KitArt() {
  // a sheet of dashed cut lines with one piece cut out, the piece, and scissors
  return (
    <>
      <Rect x={6} y={3} w={30} h={32} fill="var(--card)" stroke="var(--line-strong)" sw={0.5} />
      {[1, 2].map((c) => (
        <Line key={`v${c}`} x1={6 + c * 10} y1={3} x2={6 + c * 10} y2={35} stroke="var(--ink-soft)" sw={0.45} dash="1.4 1" />
      ))}
      {[1, 2].map((r) => (
        <Line key={`h${r}`} x1={6} y1={3 + r * 10.67} x2={36} y2={3 + r * 10.67} stroke="var(--ink-soft)" sw={0.45} dash="1.4 1" />
      ))}
      <Rect x={27} y={24.4} w={8.4} h={9.9} fill="var(--paper-warm)" />
      <Rect x={40} y={21} w={9.6} h={10.4} fill="var(--card)" stroke="var(--line-strong)" sw={0.5} rotate={[-14, 45, 26]} />
      <g transform="translate(40 3) scale(0.62)" fill="none" stroke="var(--ink)" strokeWidth={1.8} strokeLinecap="round">
        <IconGlyph name="scissors" />
      </g>
    </>
  )
}

function AlbumArt() {
  // an album page: title, rule, margin heads and rubric step numerals
  return (
    <>
      <Rect x={14} y={2.5} w={34} h={33} fill="var(--card)" stroke="var(--line-strong)" sw={0.5} />
      <Line x1={20} y1={7} x2={42} y2={7} stroke="var(--ink)" sw={1.1} />
      <Line x1={17} y1={10} x2={45} y2={10} stroke="var(--ink)" sw={0.4} />
      {range(4).map((r) => {
        const y = 14 + r * 5.3
        return (
          <g key={r}>
            <Line x1={17} y1={y} x2={22} y2={y} stroke="var(--ink)" sw={0.7} />
            <text x={25.6} y={f(y + 1.2)} fontSize={3.4} textAnchor="middle" style={{ fill: 'var(--accent)', fontStyle: 'italic', fontFamily: 'var(--font-numeral)' }}>
              {r + 1}
            </text>
            <Line x1={28} y1={y} x2={44 - (r % 2) * 5} y2={y} stroke="var(--ink-soft)" sw={0.55} />
            <Line x1={28} y1={y + 2.2} x2={41 - (r % 3) * 3} y2={y + 2.2} stroke="var(--ink-soft)" sw={0.55} />
          </g>
        )
      })}
    </>
  )
}

/** Every drawing, keyed by material slug (or glyph key). Exported for the coverage test. */
export const THUMB_ART: Readonly<Record<string, () => ReactElement>> = {
  'bead-stair': BeadStairArt,
  'cards-and-counters': CardsAndCountersArt,
  'teen-board': TeenBoardArt,
  'ten-board': TenBoardArt,
  'hundred-board': HundredBoardArt,
  'bead-chains': BeadChainsArt,
  'golden-beads': GoldenBeadsArt,
  'number-cards': NumberCardsArt,
  'snake-game': SnakeGameArt,
  'addition-strip-board': AdditionStripBoardArt,
  'subtraction-strip-board': SubtractionStripBoardArt,
  'multiplication-bead-board': MultiplicationBeadBoardArt,
  'division-board': DivisionBoardArt,
  'addition-charts': AdditionChartsArt,
  'multiplication-charts': MultiplicationChartsArt,
  'stamp-game': StampGameArt,
  'bead-frame': BeadFrameArt,
  checkerboard: CheckerboardArt,
  'racks-and-tubes': RacksAndTubesArt,
  'fraction-circles': FractionCirclesArt,
  'decimal-board': DecimalBoardArt,
  sheet: SheetArt,
  kit: KitArt,
  album: AlbumArt,
}

/** The non-material glyphs. */
export const THUMB_GLYPHS = ['sheet', 'kit', 'album'] as const

export function hasThumb(slug: string): boolean {
  return Object.hasOwn(THUMB_ART, slug)
}

/** Fallback for a material with no drawing yet: its strand's bead bar (golden ten without a strand). */
function FallbackArt({ n }: { n?: number }) {
  const count = n && n >= 1 && n <= 9 ? n : 10
  const d = count === 10 ? 5 : 5.5
  return <Bar x={(62 - count * d) / 2 + d / 2} y={19} n={count} d={d} />
}

export interface MaterialThumbProps {
  /** A material slug from src/materials/registry.ts, or 'sheet' | 'kit' | 'album'. */
  slug: string
  /** Strand order (1–7) for the fallback plate when `slug` has no drawing yet. */
  strandOrder?: number
  className?: string
}

/** A 72×48 mounted plate with a live-token miniature of the material.
 *  Memoized: the drawings are static, so /ages tab switches skip them. */
export const MaterialThumb = memo(function MaterialThumb({ slug, strandOrder, className }: MaterialThumbProps) {
  const Art = hasThumb(slug) ? THUMB_ART[slug] : null
  return (
    <span className={`plate${className ? ` ${className}` : ''}`} aria-hidden="true" data-thumb={Art ? slug : 'fallback'}>
      <svg className="plate-art" viewBox="0 0 62 38" width={62} height={38}>
        {Art ? <Art /> : <FallbackArt n={strandOrder} />}
      </svg>
    </span>
  )
})
```

What each plate shows. Colours are named by token; coordinates are in the code above.

| Slug | Plate | Tokens |
|---|---|---|
| `bead-stair` | Bars 1–9 stacked as a stair (`BeadBar` default colours) | `--bead-1…9` |
| `cards-and-counters` | Numeral cards 1–5, with red counters paired under each and the odd one centred | `--card`, `--ink`, `--bead-1` |
| `teen-board` | Seguin board A with a 3 card over the second 10, plus golden 10 + 3 and 10 + 4 bars | `--wood`, `--card`, `--golden`, `--bead-3`, `--bead-4` |
| `ten-board` | Seguin board B (10–40) and three golden ten-bars | `--wood`, `--card`, `--golden` |
| `hundred-board` | 10×10 board with tiles 1–45 laid and two loose tiles | `--wood`, `--wood-dark`, `--card` |
| `bead-chains` | A light-blue 5-chain folded in three rows, with three arrow tickets | `--bead-5`, `--bead-wire`, `--pv-ten` |
| `golden-beads` | Thousand cube, hundred square, ten-bar and unit in true 10:1 proportion (decision 12) | `--golden*` |
| `number-cards` | 1000 / 200 / 30 / 4 stacked right-aligned, widths ∝ digits, numerals via `cardColor()` | `--pv-*`, `--card` |
| `snake-game` | A snake of 3, 7, 5 / 8, 6 bars turning right, counted into a golden ten and a 4 | `--bead-3…8`, `--bead-10` |
| `addition-strip-board` | Board with a red 1–10 / blue 11–18 number row, red rule after 10, and blue + red strips | `--pv-hundred`, `--pv-ten`, `--wood-dark` |
| `subtraction-strip-board` | Board with a blue 1–9 / red 10–18 number row, a natural cover strip and blue strips | `--pv-ten`, `--pv-hundred`, `--wood` |
| `multiplication-bead-board` | Card 6 in the slot, 4 × 6 red beads, the red counter, empty holes | `--paper-warm`, `--bead-1`, `--line-strong` |
| `division-board` | Four green skittles (`Skittle`), with 3 × 4 green unit beads shared beneath | `--pv-unit` |
| `addition-charts` | An 11 × 11 working chart with the filled sum triangle | tints of `--pv-ten` / `--pv-hundred` |
| `multiplication-charts` | The "two fingers" meeting at 6 × 7, with that cell boxed in ink | tints of `--pv-*`, `--ink` |
| `stamp-game` | 2 thousands, 3 hundreds, 4 tens, 5 units stamps (`STAMP_COLOR`) above the tray | `--pv-*`, `--wood` |
| `bead-frame` | Small frame, with the four wires' beads partly moved right | `--pv-unit/ten/hundred/thousand`, `--wood` |
| `checkerboard` | 7 × 5 place-value squares with three bead bars laid on them | tints of `--pv-*`, `--bead-3/4/6` |
| `racks-and-tubes` | A rack of unit/ten/hundred beads beside three capped tubes | `--pv-*`, `--wood` |
| `fraction-circles` | Green frame, three red quarters in place, one loose quarter | `--inset-frame`, `--fraction-shade` |
| `decimal-board` | Unit, tenths, hundredths and thousandths columns in pale place colours, with the decimal point | `--pv-unit/tenth/hundredth/thousandth` |
| `sheet` (glyph) | A worksheet with its answer key tucked behind | `--card`, `--paper-warm`, `--ink` |
| `kit` (glyph) | Dashed cut lines, one piece cut out and lying loose, and scissors (`IconGlyph name="scissors"` from Step 8) | `--card`, `--ink-soft`, `--ink` |
| `album` (glyph) | An album page with a title rule, margin heads and rubric step numerals | `--card`, `--ink`, `--accent` |
| any other slug | Fallback: the strand's bead-stair bar (golden ten-bar without a strand) | `--bead-n` |

**3. Create `src/components/MaterialThumb.test.ts`.** It checks data coverage and renders nothing (house rule: test pure logic):

```ts
import { describe, expect, it } from 'vitest'
import { MATERIALS } from '../materials/registry'
import { THUMB_ART, THUMB_GLYPHS, hasThumb } from './MaterialThumb'

describe('MaterialThumb coverage', () => {
  it('draws a plate for every registered material', () => {
    const missing = MATERIALS.map((m) => m.slug).filter((slug) => !hasThumb(slug))
    expect(missing).toEqual([])
  })

  it('has the sheet, kit and album glyphs', () => {
    for (const g of THUMB_GLYPHS) expect(hasThumb(g), g).toBe(true)
  })

  it('has no drawing for unknown slugs or inherited keys (they get the fallback plate)', () => {
    expect(hasThumb('no-such-material')).toBe(false)
    expect(hasThumb('toString')).toBe(false)
  })

  it('holds exactly the materials plus the three glyphs (no stale drawings)', () => {
    expect(Object.keys(THUMB_ART).sort()).toEqual([...MATERIALS.map((m) => m.slug), ...THUMB_GLYPHS].sort())
  })
})
```

**Check:** `npm test` green, including the 4 new tests. `grep -nE '#[0-9a-fA-F]{3,6}\b|rgba?\(' src/components/MaterialThumb.tsx` prints nothing. After Step 18, each `/materials` row shows its plate, and `document.querySelectorAll('[data-thumb="fallback"]').length === 0`. Temporarily rename a key in `THUMB_ART` and the coverage test fails, naming that slug.

## Step 15 — Contents components and the contents stylesheet

**Files:** `src/components/Contents.tsx` (new), `src/styles/contents.css` (new), `src/components/Contents.test.ts` (new), `src/main.tsx` (modified).

One chapter head and one row anatomy replace the seven hand-rolled card layouts (S1-20). Rows are single whole-row links, at least 72px tall, so heights never go ragged (S1-04) and there are no orphan rows (S1-05). There are no card paddings to disagree (S1-19), and piece counts and presets become wrapping text instead of nowrap pills (S1-01, S1-15). This step holds all the CSS for the hub pages, so Steps 18–24 change only TSX (Steps 23 and 25 also delete old rules from `global.css`).

**1. Create `src/components/Contents.tsx`:**

```tsx
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { StrandInfo } from '../lib/strands'
import { BeadBar } from './beads'
import { Icon } from './Icon'
import { MaterialThumb } from './MaterialThumb'

/**
 * Contents pages (The Album): every hub lists its entries as a book's table
 * of contents. ChapterHead opens a strand; ContentsRow is one whole-row link.
 * Styles live in src/styles/contents.css.
 */

/** 'Ages 4–6 · PK–K': a strand's running meta, as on the chapter head. */
export function strandMeta(strand: Pick<StrandInfo, 'ages' | 'grades'>): string {
  return `Ages ${strand.ages[0]}–${strand.ages[1]} · ${strand.grades}`
}

export interface ChapterHeadProps {
  /** The strand this chapter holds; omit for an unnumbered chapter ("Beyond worksheets"). */
  strand?: StrandInfo
  /** Chapter name; defaults to the strand's name. */
  name?: ReactNode
  /** Right-hand meta; defaults to strandMeta(strand). Pass null for none. */
  meta?: ReactNode
  /** h2 on index pages, h3 under an /ages section head, span inside a table header cell. */
  as?: 'h2' | 'h3' | 'span'
  /** 'minor' is the smaller strand subhead used on /ages. */
  size?: 'major' | 'minor'
  className?: string
  id?: string
}

/** Rubric strand number, that strand's bead-stair bar, the name, and the ages meta. */
export function ChapterHead({ strand, name, meta, as: Tag = 'h2', size = 'major', className, id }: ChapterHeadProps) {
  const metaText = meta === undefined ? (strand ? strandMeta(strand) : null) : meta
  const cls = ['chapter-head', size === 'minor' ? 'minor' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <Tag id={id} className={cls}>
      {strand && <span className="chapter-num">{strand.order}</span>}
      {strand && <BeadBar n={strand.order} beadSize={12} className="strand-bar" />}
      <span className="chapter-name">{name ?? strand?.name}</span>
      {metaText && <span className="chapter-meta">{metaText}</span>}
    </Tag>
  )
}

/** The boxed age stamp, optionally followed by the grades: 'AGES 4–6  PK–K'. */
export function AgeMeta({ ages, grades }: { ages: readonly [number, number]; grades?: string }) {
  return (
    <>
      <span className="badge age">
        ages {ages[0]}–{ages[1]}
      </span>
      {grades && <span className="badge">{grades}</span>}
    </>
  )
}

export interface ContentsRowProps {
  to: string
  title: ReactNode
  /** Lead with a mounted plate: a MaterialThumb slug, or 'sheet' | 'kit' | 'album'. */
  thumb?: string
  /** Strand order for the plate's fallback drawing. */
  strandOrder?: number
  /** Lead with a rubric numeral instead of a plate (lessons, guides). */
  num?: number
  /** Small caps line under the title (home age bands). */
  titleMeta?: ReactNode
  summary?: ReactNode
  /** Right-aligned meta: <AgeMeta/>. */
  meta?: ReactNode
  /** Plain run-in line under the summary: presets, piece counts. Never a pill. */
  note?: ReactNode
  className?: string
}

/**
 * One contents entry: the whole row is a single link (≥72px tall) with the
 * title underlined at rest, a summary, right-aligned meta and a trailing arrow.
 */
export function ContentsRow({ to, title, thumb, strandOrder, num, titleMeta, summary, meta, note, className }: ContentsRowProps) {
  const lead = thumb ? 'lead-plate' : num !== undefined ? 'lead-num' : 'lead-none'
  return (
    <Link className={`contents-row ${lead}${className ? ` ${className}` : ''}`} to={to}>
      {thumb && <MaterialThumb slug={thumb} strandOrder={strandOrder} />}
      {!thumb && num !== undefined && <span className="row-num">{num}</span>}
      <span className="row-text">
        <span className="row-title">
          <span className="row-title-text">{title}</span>
          {titleMeta && <span className="row-title-meta">{titleMeta}</span>}
        </span>
        {summary && <span className="row-summary">{summary}</span>}
        {meta && <span className="row-meta">{meta}</span>}
        {note && <span className="row-note">{note}</span>}
      </span>
      <Icon name="arrow" className="row-arrow" />
    </Link>
  )
}
```

**2. Create `src/styles/contents.css`:**

```css
/* ------------------------------------------------------------------
   Contents pages: The Album (PRD 19).
   Every hub reads like a book's table of contents: strand chapter heads,
   whole-row contents entries with mounted plates (MaterialThumb), the
   home page's title page, parts and age bands, and notes.
   Components: src/components/Contents.tsx, MaterialThumb.tsx.
   ------------------------------------------------------------------ */

/* ---------- Section heads (home, /ages) ---------- */

.section-head {
  margin: var(--space-7) 0 var(--space-4);
  font-family: var(--font-text);
  font-size: var(--fs-h2);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* ---------- Chapters: one per strand ---------- */

.chapter {
  margin-top: var(--space-7);
}

.chapter.minor {
  margin-top: var(--space-5);
}

.chapter-head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0 0 var(--space-1);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--ink);
  font-family: var(--font-text);
  font-size: var(--fs-h2);
  font-weight: 400;
  line-height: 1.2;
}

.chapter-head.minor {
  padding-bottom: var(--space-2);
  font-size: var(--fs-lede);
}

.chapter-num {
  min-width: 0.8em;
  font-style: italic;
  color: var(--accent);
}

.strand-bar {
  flex: none;
  display: block;
}

.chapter-name {
  flex: 0 1 auto;
  text-wrap: balance;
}

.chapter-meta {
  margin-left: auto;
  font: 600 var(--fs-caps) / 1.2 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--ink-soft);
}

.chapter-desc {
  max-width: var(--measure);
  margin: var(--space-2) 0;
  font-size: var(--fs-read-sm);
  font-style: italic;
  color: var(--ink-soft);
}

/* ---------- Plates: MaterialThumb ---------- */

.plate {
  flex: none;
  display: grid;
  place-items: center;
  width: 72px;
  height: 48px;
  background: var(--card);
  border: 1px solid var(--ink);
  box-shadow: inset 0 0 0 3px var(--card), inset 0 0 0 4px var(--line);
}

.plate-art {
  display: block;
  width: 62px;
  height: 38px;
}

/* the nested beads.tsx primitives keep their own geometry */
.plate-art svg {
  max-width: none;
}

/* ---------- Contents rows ---------- */

.contents {
  margin: 0;
  padding: 0;
  list-style: none;
}

.contents > li {
  display: flex;
}

/* the first list right under a PageHeader (no chapter head above it) */
.contents-first {
  border-top: 1px solid var(--ink);
}

.contents-row {
  flex: 1;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 20px;
  column-gap: var(--space-5);
  align-items: start;
  min-height: 72px;
  padding: var(--space-3) var(--space-3) var(--space-3) 0;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
}

.contents-row.lead-num {
  grid-template-columns: 2.5rem minmax(0, 1fr) 20px;
  align-items: baseline;
}

.contents-row.lead-none {
  grid-template-columns: minmax(0, 1fr) 20px;
}

.row-num {
  justify-self: end;
  font: italic 400 1.5rem / 1.2 var(--font-text);
  color: var(--accent);
}

.row-text {
  display: grid;
  grid-template-columns: minmax(0, 16rem) minmax(0, 1fr) 11rem;
  column-gap: var(--space-6);
  align-items: baseline;
}

.row-title {
  grid-column: 1;
  font-family: var(--font-text);
  font-size: var(--fs-lede);
  font-weight: 500;
  line-height: 1.25;
  text-wrap: balance;
}

/* the one visible "this is a link" cue at rest: a faint underline */
.row-title-text {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  text-decoration-color: var(--link-rule);
}

.row-title-meta {
  display: block;
  margin-top: 0.2rem;
  font: 600 var(--fs-caps) / 1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.row-summary {
  grid-column: 2;
  max-width: 36rem;
  font-size: var(--fs-read-sm);
  line-height: 1.5;
  text-wrap: pretty;
  color: var(--ink);
}

.row-meta {
  grid-column: 3;
  text-align: right;
  line-height: 1.9;
}

/* presets, piece counts: plain run-in text that wraps, never a pill */
.row-note {
  grid-column: 2 / -1;
  margin-top: var(--space-1);
  font: 500 var(--fs-ui) / 1.5 var(--font-ui);
  color: var(--ink-soft);
}

.row-arrow {
  justify-self: end;
  align-self: center;
  color: var(--ink-soft);
}

/* hover / focus: a paper-warm wash 8px past the plate; only the title and arrow turn rubric */
.contents-row:hover,
.contents-row:focus-visible {
  background: var(--paper-warm);
  box-shadow: -0.5rem 0 0 var(--paper-warm), 0.5rem 0 0 var(--paper-warm);
  color: var(--ink);
}

.contents-row:hover .row-title,
.contents-row:focus-visible .row-title {
  color: var(--accent);
}

.contents-row:hover .row-title-text,
.contents-row:focus-visible .row-title-text {
  text-decoration-color: currentColor;
}

.contents-row:hover .row-arrow,
.contents-row:focus-visible .row-arrow {
  color: var(--accent);
}

.contents-row:focus-visible {
  outline-offset: -3px;
}

/* ---------- Home: the title page ---------- */

.home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    'title title'
    'body plate';
  column-gap: var(--space-8);
  align-items: start;
  margin: var(--space-2) 0 var(--space-7);
}

.hero-title {
  grid-area: title;
}

.hero-body {
  grid-area: body;
}

.home-hero h1 {
  margin: 0 0 var(--space-5);
  font-size: var(--fs-display);
  font-weight: 350;
  line-height: 0.98;
  letter-spacing: -0.03em;
}

.hero-body .page-lede {
  max-width: 36rem;
}

.promise {
  display: inline-block;
  margin: var(--space-5) 0;
  padding: 0.6rem 0;
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--ink);
  font: 700 var(--fs-caps) / 1.3 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* one primary action on its own line; the two quiet links share the next */
.home-cta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.home-cta .btn.primary {
  padding: 0.7rem 1.4rem;
  font-size: 1.0625rem;
}

.home-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--space-5);
  margin: 0;
}

/* Plate I: the golden bead family on a double-framed card-stock plate */
.plate-hero {
  grid-area: plate;
  align-self: center;
  margin: 6px;
  padding: var(--space-6) var(--space-7) var(--space-4);
  background: var(--card);
  border: 1px solid var(--ink);
  box-shadow: 0 0 0 5px var(--paper), 0 0 0 6px var(--ink);
}

.plate-hero-art {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.1rem;
}

.plate-caption {
  margin-top: var(--space-4);
  font: italic 400 var(--fs-ui) / 1.35 var(--font-text);
  text-align: center;
  color: var(--ink-soft);
}

.plate-no {
  margin-right: 0.2em;
  font-style: normal;
  font-variant: small-caps;
  letter-spacing: 0.04em;
  color: var(--ink);
}

/* Parts I–III */
.parts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 var(--space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

.parts > li {
  display: flex;
}

.part-entry {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-3) var(--space-5);
  border-top: 1px solid var(--ink);
  color: var(--ink);
  text-decoration: none;
}

.part-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.part-num {
  font: italic 400 2.25rem / 1 var(--font-text);
  color: var(--accent);
}

.part-entry h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.2;
}

.part-kind {
  display: block;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.16em;
  text-decoration-color: var(--link-rule);
}

.part-sub {
  display: block;
  margin-top: 0.15rem;
  font-size: var(--fs-lede);
  font-style: italic;
}

.part-text {
  display: block;
  font-size: var(--fs-read-sm);
  line-height: 1.55;
}

.part-go {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--touch-target);
  margin-top: auto;
  font: 600 var(--fs-ui) / 1.2 var(--font-ui);
}

.part-go .icon {
  width: 18px;
  height: 18px;
}

.part-entry:hover,
.part-entry:focus-visible {
  background: var(--paper-warm);
  color: var(--ink);
}

.part-entry:hover .part-kind,
.part-entry:hover .part-go,
.part-entry:focus-visible .part-kind,
.part-entry:focus-visible .part-go {
  color: var(--accent);
  text-decoration-color: currentColor;
}

.part-entry:focus-visible {
  outline-offset: -3px;
}

/* Age bands: two text columns (title + grades | blurb) */
.bands .row-text {
  grid-template-columns: minmax(0, 16rem) minmax(0, 1fr);
}

/* ---------- Notes: an aside under a bead fleuron (was: white card) ---------- */

.note {
  max-width: 42rem;
  margin: var(--space-8) auto 0;
}

.note h2 {
  margin-bottom: var(--space-3);
  font-size: var(--fs-h2);
  font-style: italic;
  text-align: center;
}

.note p {
  margin: 0;
  font-size: var(--fs-body);
}

.note .note-action {
  margin-top: var(--space-3);
  text-align: center;
}

/* ---------- /ages: band tabs ---------- */

.band-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0 0 var(--space-2);
  border-bottom: 1px solid var(--ink);
}

.band-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: var(--touch-target);
  padding: var(--space-2) var(--space-2) var(--space-3);
  border: 0;
  background: none;
  font-family: var(--font-ui);
  color: var(--ink-soft);
  cursor: pointer;
}

.band-tab-ages {
  font-size: var(--fs-ui);
  font-weight: 600;
  line-height: 1.3;
}

.band-tab-grades {
  font-size: var(--fs-caps);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.band-tab:hover {
  background: var(--paper-warm);
  color: var(--accent);
}

/* selected: ink, bold, and a 3px ink underline (never colour alone) */
.band-tab[aria-selected='true'] {
  color: var(--ink);
  box-shadow: inset 0 -3px 0 var(--ink);
}

.band-tab[aria-selected='true'] .band-tab-ages {
  font-weight: 700;
}

.band-tab:focus-visible {
  outline-offset: -3px;
}

/* ---------- Tablet and phone ---------- */

@media (max-width: 1020px) {
  .row-text {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: var(--space-1);
  }

  .row-text > .row-title {
    grid-column: 1;
    grid-row: 1;
  }

  .row-text > .row-meta {
    grid-column: 2;
    grid-row: 1;
  }

  .row-text > .row-summary {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .row-text > .row-note {
    grid-column: 1 / -1;
    grid-row: 3;
  }

  .bands .row-text {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-hero {
    column-gap: var(--space-6);
  }

  .plate-hero {
    padding: var(--space-5) var(--space-5) var(--space-3);
  }

  .plate-hero-art {
    zoom: 0.8;
  }
}

@media (max-width: 760px) {
  .home-hero {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'title'
      'plate'
      'body';
  }

  .home-hero h1 {
    margin-bottom: var(--space-4);
  }

  .plate-hero {
    justify-self: stretch;
    margin: 6px 6px var(--space-5);
    padding: var(--space-5) var(--space-3) var(--space-3);
  }

  .plate-hero-art {
    zoom: 0.75;
  }

  .parts {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media screen and (max-width: 640px) {
  .home-hero h1 {
    font-size: 2.75rem;
  }

  .home-cta .btn.primary {
    align-self: stretch;
    justify-content: flex-start;
    text-align: left;
  }

  .contents-row {
    grid-template-columns: 72px minmax(0, 1fr);
    column-gap: var(--space-4);
    padding-right: 0;
  }

  .contents-row.lead-num {
    grid-template-columns: 2.5rem minmax(0, 1fr);
  }

  .contents-row.lead-none {
    grid-template-columns: minmax(0, 1fr);
  }

  .contents-row > .row-arrow {
    display: none;
  }

  .row-text > .row-meta {
    grid-column: 1 / -1;
    grid-row: 3;
    text-align: left;
  }

  .row-text > .row-note {
    grid-row: 4;
  }

  .chapter-head {
    flex-wrap: wrap;
    row-gap: var(--space-1);
    font-size: 1.5rem;
  }

  .chapter-head.minor {
    font-size: var(--fs-lede);
  }

  .chapter-meta {
    flex-basis: 100%;
    margin-left: 0;
  }
}

/* ---------- Motion (only when the reader has not asked for less) ---------- */

@media (prefers-reduced-motion: no-preference) {
  .contents-row {
    transition: background-color 120ms ease, box-shadow 120ms ease;
  }

  .row-arrow {
    transition: transform 120ms ease, color 120ms ease;
  }

  .part-entry {
    transition: background-color 120ms ease;
  }

  .part-go .icon {
    transition: transform 120ms ease;
  }

  /* the 3px arrow nudge on hover and focus */
  .contents-row:hover .row-arrow,
  .contents-row:focus-visible .row-arrow,
  .part-entry:hover .part-go .icon,
  .part-entry:focus-visible .part-go .icon {
    transform: translateX(3px);
  }
}

/* ---------- Print ---------- */

@media print {
  .strand-bar,
  .row-arrow {
    display: none;
  }

  /* rubric numerals print in the ink of the page (black), never tinted */
  .chapter-num,
  .row-num {
    color: inherit;
  }
}
```

**3. `src/main.tsx`:** directly under the `import './styles/layout.css'` line added in Step 12, add:

```ts
import './styles/contents.css'
```

**4. Create `src/components/Contents.test.ts`:**

```ts
import { describe, expect, it } from 'vitest'
import { STRANDS } from '../lib/strands'
import { strandMeta } from './Contents'

describe('strandMeta', () => {
  it('formats a strand as the chapter-head meta', () => {
    expect(strandMeta(STRANDS[0])).toBe('Ages 4–6 · PK–K')
    expect(strandMeta(STRANDS[6])).toBe('Ages 9–12 · 4–6')
  })
})
```

The hover transitions and the arrow nudge are declared only inside `prefers-reduced-motion: no-preference` (convention 6, decision 16), so with reduced motion the wash is instant and the arrow stays put.

**Check:** `npm run build` and `npm test` green. `grep -n ':has(\|\[style' src/styles/contents.css src/styles/layout.css` prints nothing. Home already uses `.home-hero` and `.home-cta`, so on its old markup it now shows the display-size title and stacks its three buttons in a column; that is expected until Step 23 replaces the markup. Every other hub page looks unchanged until Steps 18–24 switch its markup.

## Step 16 — Forms and panels: `forms.css`

**Files:**
- `src/styles/forms.css` (new);
- `src/main.tsx` (one line);
- `src/styles/global.css` (delete current lines 226–245);
- `src/styles/worksheets.css` (delete current lines 35–52).

Today the fields are 35–39px tall and checkbox rows 25px (S6-14). Values inherit the label's 600 weight. The date input matches no rule, so it stays inline, in monospace, glued to its label (S1-11). The planner's disabled selects fade to 45% (the audit asked for dashed).

This step gives every control one skin:
- card stock, a `--line-strong` border (3.77:1 on card, 3.40:1 on paper, 3.06:1 on paper-warm, so WCAG 1.4.11 holds on all three), a 2px radius and a 44px height;
- MM Sans 600 labels over MM Sans 500 values;
- checkbox rows on a two-column grid with a 22px ink box;
- disabled controls drawn dashed at full opacity.

The rules also match today's markup, where the label text is a bare text node and the checkbox's text is an anonymous grid item. So Step 16 can land alone, and Steps 39–41 then add `.field-label` spans.

Create `src/styles/forms.css`:

```css
/* ------------------------------------------------------------------
   Forms and panels: The Album (PRD 19).
   Every form control on the site lives on the worksheet builders, the kit
   pages and the planner, all of it .no-print chrome outside any material
   stage or printable sheet, so no rule here needs the chrome guard.
   Labels are MM Sans 600; values MM Sans 500 on card stock; every control
   and every checkbox row is at least --touch-target (44px) tall.
   ------------------------------------------------------------------ */

/* ---------- Panels: a column of settings under an ink rule ---------- */

.panel {
  border-top: 2px solid var(--ink);
  padding-top: var(--space-4);
}

/* The planner shelf: the same panel on a quiet paper-warm fill. */
.panel-warm {
  padding: var(--space-5);
  background: var(--paper-warm);
}

.panel-label {
  margin: 0 0 var(--space-4);
  font: 700 var(--fs-caps) / 1.3 var(--font-ui);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink);
}

.panel-label ~ .panel-label {
  margin-top: var(--space-5);
}

/* Small print under a panel: the seed line, printing tips. */
.panel-note {
  margin: var(--space-5) 0 0;
  font: 400 var(--fs-ui) / 1.45 var(--font-ui);
  color: var(--ink-soft);
}

/* ---------- Fields ---------- */

/* One column of fields; two columns on a tablet, where the builder form
   spans the page and a 750px-wide number box helps no one. */
.field-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4) var(--space-5);
  align-items: start;
}

@media (min-width: 641px) and (max-width: 900px) {
  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.field {
  display: block;
  margin: 0 0 var(--space-4);
  font-family: var(--font-ui);
  font-size: var(--fs-ui);
  font-weight: 600;
  line-height: 1.35;
  color: var(--ink);
}

.field-grid > .field {
  margin: 0;
}

.field-label {
  display: block;
}

.field-help {
  display: block;
  margin-top: var(--space-1);
  font: 400 var(--fs-ui) / 1.45 var(--font-ui);
  color: var(--ink-soft);
}

/* The control skin: card stock, a 3:1 border, 44px tall. The planner's
   picker selects share it. */
.field :is(input[type='number'], input[type='text'], input[type='date'], select),
.planner-row select {
  min-height: var(--touch-target);
  padding: 0.5rem 0.65rem;
  font: 500 var(--fs-ui) / 1.25 var(--font-ui);
  color: var(--ink);
  background-color: var(--card);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-chrome);
}

.field :is(input[type='number'], input[type='text'], input[type='date'], select) {
  display: block;
  width: 100%;
  margin-top: var(--space-1);
}

.field :is(input, select):hover,
.planner-row select:hover {
  border-color: var(--ink);
}

/* Disabled controls are drawn dashed at full opacity, never faded:
   the text stays readable (ink-soft, 6.5:1 on paper). */
.field :is(input, select):disabled,
.planner-row select:disabled {
  color: var(--ink-soft);
  background-color: transparent;
  border-style: dashed;
  border-color: var(--line-strong);
  opacity: 1;
  cursor: not-allowed;
}

/* Date fields: Chromium's UA sheet sets them in monospace; iOS centres the
   value and collapses an empty one. */
.field input[type='date']::-webkit-date-and-time-value {
  min-height: 1.25em;
  text-align: left;
}

/* ---------- Checkbox rows: box | label, help under the label ---------- */

.field.checkbox {
  display: grid;
  grid-template-columns: 1.375rem minmax(0, 1fr);
  column-gap: var(--space-3);
  row-gap: var(--space-1);
  align-items: center;
  align-content: center;
  min-height: var(--touch-target);
  cursor: pointer;
}

.field.checkbox > input {
  grid-column: 1;
}

.field.checkbox > .field-help {
  grid-column: 2;
  margin-top: 0;
  align-self: start;
}

.field.checkbox > input,
.planner-pick > input {
  width: 1.375rem;
  height: 1.375rem;
  margin: 0;
  accent-color: var(--ink);
  cursor: pointer;
}
```

**`src/main.tsx`.** After Steps 3, 12 and 15 the stylesheet imports begin `fonts.css`, `tokens.css`, `global.css`, `layout.css`, `contents.css`, `print.css`. Insert one line directly after `import './styles/contents.css'`, which puts it before `print.css` (convention 9):

```ts
import './styles/forms.css'
```

**`src/styles/global.css`.** Delete the two field rules. In the original numbering they are lines 226–245, directly after `.btn:disabled { … }`; once Steps 9 and 12 have landed, find them by their text. They are:

```css
label.field {
  display: block;
  margin: 0 0 0.8rem;
  font-weight: 600;
  font-size: 0.92rem;
}

label.field input[type='number'],
label.field input[type='text'],
label.field select {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.45rem 0.6rem;
  font: inherit;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--ink);
}
```

This also removes the last `#fff` literal from the chrome rules.

**`src/styles/worksheets.css`.** Delete current lines 35–52:

```css
.field-help {
  display: block;
  font-weight: 400;
  font-size: 0.82rem;
  color: var(--ink-soft);
  margin-top: 0.2rem;
}

label.field.checkbox {
  font-weight: 600;
}

label.field.checkbox input {
  width: 1.1rem;
  height: 1.1rem;
  margin-right: 0.4rem;
  vertical-align: -0.15rem;
}
```

Until Step 41 lands, the planner's selects keep their old look. `planner.css` loads later and its `.planner-row select` rule (current line 13) wins on order. Step 41 replaces that rule.

**Check:**
- `npm run build` is green.
- `grep -n "label.field\|field-help" src/styles/global.css src/styles/worksheets.css` prints nothing.
- On `/worksheets/multi-digit-ops` at 1400, this is true: `[...document.querySelectorAll('.builder-form select, .builder-form input:not([type=checkbox])')].every(e => e.offsetHeight >= 44)`.
- `[...document.querySelectorAll('label.field.checkbox')].every(l => l.offsetHeight >= 44)` is true, and each help line starts under the label text, not under the box.
- On `/planner` the "Week of (optional)" label sits above a full-width 44px date box in the sans, not in monospace.
- The print gate PASSes.

## Step 17 — The desk: `<SheetPreview desk>`

**Files:** `src/components/SheetPreview.tsx` (full file below), `src/styles/worksheets.css` (a block inserted directly above current line 60, `/* ---------- Shared printed-sheet building blocks ---------- */`).

Today the preview is a white Letter page on the white `.print-sheet`, and it reads as a box rather than paper (prototype: `.builder-preview` desk). With `desk`:
- the pages lie on a `--desk` surface (`#e2d9c7`) with the `--shadow-sheet` paper-lift shadow;
- the white moves from the `.print-sheet` wrapper to each `.sheet-page`, so the desk shows between pages;
- pages are 0.375in apart (before zoom), so each shadow settles before the next page.

Sheet metrics (8.5in width, 11in min-height, 0.5in padding), the 1:1 print zoom and every print rule are untouched. Inside `.print-sheet` the shield pins `--card` to `#ffffff`, so the page is exactly as white as today.

`SheetPreview` now measures its **content box** (`clientWidth` minus padding) for the zoom-to-fit. Without that change the desk padding would push the page past the edge.

Current `src/components/SheetPreview.tsx`, lines 12–41:

```tsx
export function SheetPreview({
  bw = false,
  className,
  children,
}: {
  bw?: boolean
  /** Extra classes for the inner `.print-sheet` element. */
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setZoom(Math.min(1, el.clientWidth / PAGE_WIDTH_PX))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="sheet-preview">
      <div className={`print-sheet${className ? ` ${className}` : ''}${bw ? ' bw' : ''}`} style={{ zoom }}>
        {children}
      </div>
    </div>
  )
}
```

Replace the whole file with:

```tsx
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/** 8.5in at CSS 96dpi — the fixed width of a `.sheet-page`. */
const PAGE_WIDTH_PX = 816

/**
 * On-screen wrapper for US-Letter `.print-sheet` previews: scales pages down
 * so the whole sheet is visible without sideways scrolling. With `desk`, the
 * pages lie on a desk surface with a paper shadow (worksheets.css, screen
 * only). Printing is unaffected: print.css forces zoom back to 1, and every
 * desk rule sits inside @media screen.
 */
export function SheetPreview({
  bw = false,
  className,
  desk = false,
  children,
}: {
  bw?: boolean
  /** Extra classes for the inner `.print-sheet` element. */
  className?: string
  /** Lay the pages on the desk surface (builder, kit and planner previews). */
  desk?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Fit the page to the content box, so the desk's padding never pushes a
    // page past the edge.
    const measure = () => {
      const style = getComputedStyle(el)
      const inner = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      if (inner > 0) setZoom(Math.min(1, inner / PAGE_WIDTH_PX))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`sheet-preview${desk ? ' on-desk' : ''}`}>
      <div className={`print-sheet${className ? ` ${className}` : ''}${bw ? ' bw' : ''}`} style={{ zoom }}>
        {children}
      </div>
    </div>
  )
}
```

The wrapper keeps the class `sheet-preview`. The control-chart print fix (`e24aa01`) selects `main.site-main > .sheet-preview:has(> .addition-charts-print)`, so it still matches.

Insert into `src/styles/worksheets.css`, directly above `/* ---------- Shared printed-sheet building blocks ---------- */`:

```css
/* ---------- The desk (screen only) ----------
   <SheetPreview desk>: the Letter pages lie on a desk with a paper-lift
   shadow. Sheet metrics (8.5in width, 11in min-height, 0.5in padding) and
   every print rule are untouched; the page's white moves from the
   .print-sheet wrapper to each .sheet-page so the desk shows between pages.
   Inside .print-sheet the shield pins --card to the legacy white, so the
   paper is exactly as white as before. */
@media screen {
  .sheet-preview.on-desk {
    padding: var(--space-5);
    background: var(--desk);
    border-radius: var(--radius-chrome);
    box-shadow: inset 0 1px 4px color-mix(in srgb, var(--ink) 14%, transparent);
  }

  .sheet-preview.on-desk > .print-sheet {
    background: transparent;
  }

  .sheet-preview.on-desk .sheet-page {
    margin-bottom: 0.375in;
    background: var(--card);
    border-color: transparent;
    box-shadow: var(--shadow-sheet);
  }

  .sheet-preview.on-desk .sheet-page:last-child {
    margin-bottom: 0;
  }
}

@media screen and (max-width: 640px) {
  .sheet-preview.on-desk {
    padding: var(--space-3);
  }
}
```

The inset shadow uses `color-mix(in srgb, var(--ink) 14%, transparent)`, which is the prototype's `rgba(38, 34, 29, 0.14)` written as a token, so there is no colour literal.

**Check:**
- `npm run build` is green. No page uses `desk` yet (Steps 39–41 add it), so nothing changes on screen.
- The print gate PASSes, including the two chart sheets and the arrow labels, which render through `SheetPreview` without `desk`.
- `grep -n "rgba\|#[0-9a-f]\{3,6\}" src/components/SheetPreview.tsx` prints nothing, and `sed -n '1,/Shared printed-sheet building blocks/p' src/styles/worksheets.css | grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\('` prints nothing (the Step 43 check, which also reads the desk block's comments).
