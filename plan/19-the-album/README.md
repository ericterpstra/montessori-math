# PRD 19 — The Album: assets

Reference material for [PRD 19, The Album](../19-the-album.md). The PRD is the specification. Where anything here disagrees with it, the PRD wins.

| Path | What it is |
|---|---|
| [`phase-1-foundations.md`](phase-1-foundations.md) … [`phase-7-sign-off.md`](phase-7-sign-off.md) | The implementation steps, one file per phase in build order (Steps 2–43; Phase 0 with Step 1, the print gate, and Step 5, the token shield, were removed on 2026-09-29). The [PRD](../19-the-album.md) holds the decisions, conventions, rollout, QA script and acceptance criteria, and indexes every step. |
| [`prototype/mock.css`](prototype/mock.css) | The prototype's stylesheet. It re-skinned the live pages for the owner's review, and it is the source of the token values, type scale, spacing, component styling and print rules that PRD 19 turns into real CSS. |
| [`prototype/shim.js`](prototype/shim.js) | The prototype's markup shim. It edits the rendered DOM to stand in for the JSX changes: the icon set, the PageHeader, the plate thumbnails, the contents rows, the toolbar groups, the plate caption and the colophon. |
| [`screens/`](screens/) | Screenshots of the prototype and of the site before it, at 1200×767 (listed below). |
| [`audit-findings.md`](audit-findings.md) | All 165 verified findings from the September 2026 visual audit, marked as resolved by PRD 19 (with the step), fixed in the bug-fix session, or PRD 20 candidates. |

## The prototype is reference, not code

Neither prototype file ships, and neither should be copied into `src/`:

- `mock.css` starts with an `@import` from Google Fonts, a runtime request to another host that hard rule 4 forbids. The build self-hosts the fonts instead (PRD 19, Steps 2–4).
- `shim.js` rewrites the page after React renders it. The build puts the same markup in the components themselves.
- PRD 19 deliberately departs from the prototype in a few places, each backed by a measurement: a darker `--line-strong` and `--link-rule` for contrast, golden beads in true proportion, a 4px phone plate bleed that keeps every phone stage at today's width, lesson margin heads as a grid rather than floats, the scroll veil as a layer rather than a mask, and visible toolbar labels on phones. The PRD's design decisions explain each one. PRD 19 also drops the prototype's token shield (`--mat-*`) and its Georgia `--font-numeral`: materials and printables take the Album's type (PRD 19, owner decisions 7 and 8).

## Previewing the prototype on the live pages

The prototype runs on top of the real site, so you see it with real content and working materials.

**With the dev server** (the easiest way, because Vite serves the files in `plan/` as they are):

1. Run `npm run dev` and open a page, for example `http://localhost:5173/materials`.
2. Open DevTools › Console and paste:

   ```js
   document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: '/plan/19-the-album/prototype/mock.css' }))
   document.head.append(Object.assign(document.createElement('script'), { src: '/plan/19-the-album/prototype/shim.js', onload: () => console.log(window.__SHIM(document)) }))
   ```

   The console prints `shim ok /materials` when the markup has been regrouped.
3. The shim runs once per page load, and React can undo its edits when a page re-renders (for example after switching a material's mode). To see another page, type its URL in the address bar (a full reload) and paste the two lines again. Saving them as a DevTools Snippet (Sources › Snippets) saves the retyping.

**On the published site**, where `plan/` isn't served: open `prototype/mock.css`, copy all of it, and paste it into a new inspector stylesheet (DevTools › Elements › Styles › the `+` "New Style Rule" button, then open the `inspector-stylesheet` link it creates). Then paste the whole of `prototype/shim.js` into the console and run `__SHIM(document)`.

Either way, the Google Fonts `@import` loads Newsreader and Source Sans 3 from Google for the preview only.

## Screens

Before the redesign:

| File | Page |
|---|---|
| [`home-before.webp`](screens/home-before.webp) | Home, desktop |
| [`materials-before.webp`](screens/materials-before.webp) | The materials index, desktop |
| [`lesson-steps-before.webp`](screens/lesson-steps-before.webp) | A lesson's presentation steps, desktop |

The prototype:

| File | Page |
|---|---|
| [`home-after.webp`](screens/home-after.webp) | Home: kicker, display title, promise line, rubric call to action, Plate I |
| [`phone-home-after.webp`](screens/phone-home-after.webp) | Home on a phone, with Plate I under the title |
| [`materials-after.webp`](screens/materials-after.webp) | The materials index as a table of contents with plates |
| [`material-plates.webp`](screens/material-plates.webp) | All 21 material plates plus the sheet, kit and album glyphs |
| [`golden-beads-after.webp`](screens/golden-beads-after.webp) | Golden beads: PageHeader, ruled toolbar, help line, mounted plate |
| [`phone-golden-beads-after.webp`](screens/phone-golden-beads-after.webp) | Golden beads on a phone, three screens down the page: icon-only Sound and Focus, the plate and its caption, the notes and link lists. The prototype hides the MODE label here; PRD 19 keeps it visible (decision 18) |
| [`lesson-top-after.webp`](screens/lesson-top-after.webp) | A lesson's running head, title and lede |
| [`lesson-steps-after.webp`](screens/lesson-steps-after.webp) | Margin heads, hung rubric numerals and spoken lines |
| [`phone-lesson-after.webp`](screens/phone-lesson-after.webp) | A lesson on a phone, heads stacked above their text |
| [`lesson-print-after.webp`](screens/lesson-print-after.webp) | A lesson in print emulation (Letter) |
| [`scope-after.webp`](screens/scope-after.webp) | The Scope & Sequence chart across the full column |
| [`worksheet-builder-after.webp`](screens/worksheet-builder-after.webp) | The worksheet builder: PageHeader actions, settings panel, sheets on the desk |
