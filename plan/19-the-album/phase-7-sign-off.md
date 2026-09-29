# PRD 19 · Phase 7 — Sign-off

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Steps 42–43. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


Delete the last legacy chrome rules, run every gate and grep once more across the whole diff, and update the docs before **Release 2**. The owner signed off the lesson and guide print before Release 1 (see [Rollout](../19-the-album.md#rollout)); this phase confirms nothing has changed it since.

## Step 42 — Retire the last legacy chrome rules

**Files:** `src/styles/global.css` (modified: deletions), `src/styles/layout.css` (modified: two selectors).

After Steps 30 and 39–41, no markup uses `.card`, and after Steps 18–24, 30 and 39–41 none uses `.page-intro`. Step 12's `layout.css` styled `.page-intro` together with `.page-lede`, so pages that still used it looked right until their own step converted them. Both classes can now go, which leaves one name per thing: `.page-lede` for a page's lede, and no card surface at all.

1. In `src/styles/global.css`, delete the `.card` rule (original lines 143–149). The `/* ---------- Common components ---------- */` comment above it stays, because `.badge`, `.btn` and `.section-label` follow it:

   ```css
   .card {
     background: var(--card);
     border: 1px solid var(--line);
     border-radius: var(--radius);
     box-shadow: var(--shadow-sm);
     padding: 1rem 1.2rem;
   }
   ```

2. In `src/styles/global.css`, delete the `.page-intro` rule (original lines 247–251):

   ```css
   .page-intro {
     max-width: 46rem;
     color: var(--ink-soft);
     font-size: 1.05rem;
   }
   ```

3. In `src/styles/layout.css`, the PageHeader section has:

   ```css
   .page-lede,
   .page-intro {
     max-width: var(--measure);
   ```

   Change its selector to `.page-lede {`, keeping the declarations. In the phone block at the end of the same section:

   ```css
   @media screen and (max-width: 640px) {
     .page-lede,
     .page-intro {
       font-size: 1.1875rem;
     }
   }
   ```

   change the selector to `.page-lede {` as well. The separate `.page-lede { margin: 0; }` rule stays.

`print.css` line 43 still lists `.card` in a print rule. Leave it: `print.css` stays byte-identical in PRD 19, and a dead selector costs nothing. PRD 20 can drop it.

**Check:**
- `npm run build` and `npm test` are green.
- `grep -rn "page-intro" src` prints nothing.
- `grep -rnE 'className="([^"]* )?card( [^"]*)?"' src` prints nothing, and `grep -n "^\.card" src/styles/global.css` prints nothing.
- The hub pages, a material page, a lesson, a guide, the builder, a kit and the planner look exactly as they did after Step 41 at 1400 and 390.
- The print gate and the stage gate PASS.

## Step 43 — Final gates, docs and release

**Files:** `plan/19-the-album.md` (this PRD), `plan/README.md`, `PLAN.md`, `plan/QA-CHECKLIST.md`, `CLAUDE.md`, `README.md` (all modified). No source file changes.

This step runs every gate across the whole diff and closes the docs.

**Check** (all must hold before Release 2):
1. `npm run build` and `npm test` are green. The build log reports the font payload under 200 KB.
2. The print gate PASSes against `album-baseline` (50 routes: 13 generators, 7 kits, the planner plan and journal, and the 4 material-page printables, each in colour and B&W, 0 differences), and so do both stage suites (21 material stages at 1400 and 19 at 390, 0 differences). Save the results: `await printGate.download('after')`, `await printGate.download('stages-after')` and `await printGate.download('stages390-after')`.
3. With the window at 720px wide, the page-break snippet from Step 34 reports no stranded head and no split step on `/lessons/checkerboard-multiplication`, `/lessons/decimal-board-operations`, `/lessons/racks-and-tubes`, `/lessons/golden-beads-addition` and all six `/parents/<slug>` guides, and the page counts are within the Step 34 and Step 38 tolerance.
4. These greps print nothing:
   - `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src --include=*.tsx` (no colour literal in any TSX file);
   - `grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src/styles/fonts.css src/styles/layout.css src/styles/contents.css src/styles/forms.css src/styles/global.css src/styles/presentation.css` (the chrome stylesheets use tokens only);
   - `for f in src/styles/album.css src/styles/guides.css; do sed -n '/@media print/,$!p' "$f"; done | grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\('` (in the album and guide sheets, `#000` appears only in the print block at the end of each file);
   - `sed -n '1,/Shared printed-sheet building blocks/p' src/styles/worksheets.css | grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\('` and `sed -n '1,/Printed pages/p' src/styles/planner.css | grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\('` (the chrome halves of those files; their printed halves keep today's `#000`);
   - `grep -rn ':has(\|\[style' src/styles` (no `:has()` and no attribute-selector styling in the site's stylesheets);
   - `grep -nE '^\s*(-webkit-)?mask' src/styles/materials.css` (no `mask` declaration: the scroll veil is a layer, never a mask; the word may appear in comments);
   - `grep -rn "fonts.googleapis\|@import" src index.html` (no font service, no CSS import).

   In `materials.css`, the literals that remain belong to the material rules (lines 67–192 and 229–253 at `album-baseline`, untouched) and to the felt's own inset depth shadow `rgba(0, 0, 0, 0.18)`, which Step 28 keeps on the stage (decision 19).
5. `grep -rl 'style={{' src --include=*.tsx | grep -vE '^src/(materials/[^/]+|worksheets/generators|kits/kits)/'` prints exactly `src/components/Layout.tsx`, `src/components/MaterialThumb.tsx` and `src/components/SheetPreview.tsx` (convention 11).
6. `git diff --name-only album-baseline -- src/materials src/worksheets/generators src/kits/kits src/kits/kits.css src/styles/print.css src/worksheets/SheetPage.tsx package.json package-lock.json` prints only `src/materials/MaterialPage.tsx` and `src/materials/MaterialsIndex.tsx`: no material, generator or kit component, no printed-sheet stylesheet, and no dependency changed.
7. `git diff album-baseline -- src/styles/planner.css` touches nothing from `/* ---------- Printed pages ---------- */` on, and `git diff album-baseline -- src/styles/worksheets.css` touches nothing from `/* ---------- Shared printed-sheet building blocks ---------- */` on, apart from Step 17's desk block inserted above that line.
8. The material-token check from Step 6 still prints `material tokens unchanged` when run against `album-baseline` (replace `HEAD` with `album-baseline` in its first line).
9. The [manual QA script](../19-the-album.md#manual-qa-script) passes at 1400, 820 and 390, on a real iPad and a real phone, and in print, including the B&W laser test.
10. **The owner's print sign-off still holds.** The owner signed off the printed lessons and guides (Steps 34 and 38, including the B&W laser test) before Release 1. If anything in Phases 6–7 changed `album.css`, `guides.css`, `LessonPage.tsx` or a guide, repeat item 3 and the owner's check before Release 2.

**Docs**, in this step's commit:
- This PRD: **Status** becomes `Done`, with the landing commits of each phase. Tick the acceptance criteria, and check that the lesson and guide page counts from Steps 34 and 38 are recorded beside the expected ones.
- `plan/README.md`: row 19 becomes `Done`.
- `PLAN.md`: the "Next: a visual redesign" note becomes a one-line record that PRD 19 shipped.
- `plan/QA-CHECKLIST.md`: add rows for the print gate and stage gate (how to run them, and that they must PASS before any change that touches CSS ships), the lesson page-break snippet, and the B&W laser print of the three longest lessons.
- `CLAUDE.md`, so the next session or parallel material agent works inside the album's rules:
  - under **Architecture**, list the new components (`Icon.tsx` with `IconGlyph`, `PageHeader.tsx` with `useDocumentTitle`, `Contents.tsx`, `MaterialThumb.tsx`, `plateCaption.ts` and `MaterialNameContext.ts`) and the new stylesheets (`fonts.css`, `layout.css`, `contents.css`, `forms.css`), and note that the fonts live in `public/fonts/` and are rebuilt with `scripts/fonts/build-fonts.py`;
  - under **Code conventions**, add: the token shield (never edit a `--mat-*` value; use a `--chrome-*` twin only for chrome drawn on or inside a stage or sheet); the chrome guard (a chrome rule written as an element selector ends in `:where(:not(.material-stage *, .print-sheet *))`, and one on `.btn` in `:where(:not(.material-stage *))`); no emoji anywhere in `src/` (use `<Icon>` with a text label; a test enforces it); and "a new material needs a `MaterialThumb` drawing" (`MaterialThumb.test.ts` fails without one);
  - under **Workflow**, add that the print gate and both stage suites (`plan/19-the-album/print-gate.js`) must PASS against a recorded baseline before any change that touches CSS ships.
- `README.md`: append to its **License** section: "Exception: the web fonts in `public/fonts/` (Newsreader, and MM Sans, a renamed subset of Adobe's Source Sans 3) are licensed under the SIL Open Font License 1.1; see `public/fonts/OFL.txt`. `scripts/fonts/build-fonts.py` regenerates them." Today that section says all rights are reserved, which the fonts' licence does not allow for them.
- PRD 20 is drafted from the "PRD 20 candidates" in [`audit-findings.md`](audit-findings.md), for the owner to scope. Don't start it without the owner's go-ahead.
