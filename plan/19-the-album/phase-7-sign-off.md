# PRD 19 · Phase 7 — Sign-off

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Steps 42–43. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


Delete the last legacy chrome rules, run the final checks and greps across the whole diff, update the docs, and hand the printables to the owner for review (see [Rollout](../19-the-album.md#rollout)).

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

`print.css` line 43 still lists `.card` in a print rule. Leave it: PRD 19 doesn't edit `print.css`, and a dead selector costs nothing. It can go with the owner's printables changes.

**Check:**
- `npm run build` and `npm test` are green.
- `grep -rn "page-intro" src` prints nothing.
- `grep -rnE 'className="([^"]* )?card( [^"]*)?"' src` prints nothing, and `grep -n "^\.card" src/styles/global.css` prints nothing.
- The hub pages, a material page, a lesson, a guide, the builder, a kit and the planner look exactly as they did after Step 41 at 1400 and 390.
- The standard check (convention 12) passes.

## Step 43 — Final checks, docs and the printables hand-off

**Files:** `plan/19-the-album.md` (this PRD), `plan/README.md`, `PLAN.md`, `plan/QA-CHECKLIST.md`, `CLAUDE.md`, `README.md` (all modified). No source file changes.

This step runs the final checks across the whole diff, closes the docs and hands the printables to the owner.

**Check** (all must hold before the release):
1. `npm run build` and `npm test` are green. The build log reports the font payload under 200 KB.
2. **Printables still print.** The 13 generators (each with `?seed=424242&key=1`), the 7 kits, the 13-item planner from the review list below, "Print control charts" on both chart materials and the Hundred and Thousand chains' arrow labels each open and, in print preview in colour and in B&W, print only their sheets, non-blank, in the Album's faces with lining figures. This is not a comparison: how they should look is the owner's review below.
3. With the window at 720px wide, the page-break snippet from Step 34 reports no stranded head and no split step on `/lessons/checkerboard-multiplication`, `/lessons/decimal-board-operations`, `/lessons/racks-and-tubes`, `/lessons/golden-beads-addition` and all six `/parents/<slug>` guides, and the page counts are within the Step 34 and Step 38 tolerance.
4. These greps print nothing:
   - `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src --include=*.tsx` (no colour literal in any TSX file);
   - `grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src/styles/fonts.css src/styles/layout.css src/styles/contents.css src/styles/forms.css src/styles/global.css src/styles/presentation.css` (the chrome stylesheets use tokens only);
   - `for f in src/styles/album.css src/styles/guides.css; do sed -n '/@media print/,$!p' "$f"; done | grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\('` (in the album and guide sheets, `#000` appears only in the print block at the end of each file);
   - `sed -n '1,/Shared printed-sheet building blocks/p' src/styles/worksheets.css | grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\('` and `sed -n '1,/Printed pages/p' src/styles/planner.css | grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\('` (the chrome halves of those files; their printed halves keep today's `#000`);
   - `grep -rn ':has(\|\[style' src/styles` (no `:has()` and no attribute-selector styling in the site's stylesheets);
   - `grep -nE '^\s*(-webkit-)?mask' src/styles/materials.css` (no `mask` declaration: the scroll veil is a layer, never a mask; the word may appear in comments);
   - `grep -rn "fonts.googleapis\|@import" src index.html` (no font service, no CSS import).

   In `materials.css`, the literals that remain belong to the material rules (lines 67–192 and 229–253 at `bbbdb44`; Step 7 changed only the number-card and stamp font lines there) and to the felt's own inset depth shadow `rgba(0, 0, 0, 0.18)`, which Step 28 keeps on the stage (decision 19).
5. `grep -rl 'style={{' src --include=*.tsx | grep -vE '^src/(materials/[^/]+|worksheets/generators|kits/kits)/'` prints exactly `src/components/Layout.tsx`, `src/components/MaterialThumb.tsx` and `src/components/SheetPreview.tsx` (convention 11).
6. `git diff --name-only bbbdb44 -- src/materials src/worksheets/generators src/kits/kits package.json package-lock.json` prints only `src/materials/MaterialPage.tsx` and `src/materials/MaterialsIndex.tsx`: no material, generator or kit component and no dependency changed (material rendering is PRD 20; a dependency needs the owner, hard rule 5).
7. The material-token check from Step 6 still prints `material tokens unchanged` when run against `bbbdb44` (replace `HEAD` with `bbbdb44` in its first line), and the legacy shape tokens still have today's values (Step 6's grep).
8. The [manual QA script](../19-the-album.md#manual-qa-script) passes at 1400, 820 and 390, on a real iPad and a real phone, and in print, including the B&W laser test (or it is handed to the owner's printables review).

**Docs**, in this step's commit:
- This PRD: **Status** becomes `Done`, with the landing commits of each phase. Tick the acceptance criteria, and check that the lesson and guide page counts from Steps 34 and 38 are recorded beside the expected ones. Update the Progress note with the landing commits.
- `plan/README.md`: row 19 becomes `Done`.
- `PLAN.md`: the "Next: a visual redesign" note becomes a one-line record that PRD 19 shipped and that the owner's printables review comes next.
- `plan/QA-CHECKLIST.md`: append the printables review below, as its own section.
- `CLAUDE.md`, so the next session or parallel material agent works inside the album's rules:
  - under **Architecture**, list the new components (`Icon.tsx` with `IconGlyph`, `PageHeader.tsx` with `useDocumentTitle`, `Contents.tsx`, `MaterialThumb.tsx`, `plateCaption.ts` and `MaterialNameContext.ts`) and the new stylesheets (`fonts.css`, `layout.css`, `contents.css`, `forms.css`), and note that the fonts live in `public/fonts/` and are rebuilt with `scripts/fonts/build-fonts.py`;
  - under **Code conventions**, add: materials and printables take the Album's type (the materials-and-printables block in `global.css`: a 16px base and lining figures in every `.material-stage` and `.print-sheet`, MM Sans for stage text, `--font-numeral` for number cards); never re-point a material token or the legacy shape tokens `--radius`, `--radius-sm`, `--shadow-sm` and `--shadow-md` that material pieces draw with (chrome uses `--radius-chrome`, `--radius-control` and `--shadow-sheet`); the chrome guard (a chrome rule written as an element selector ends in `:where(:not(.material-stage *, .print-sheet *))`, and one on `.btn` in `:where(:not(.material-stage *))`); no emoji anywhere in `src/` (use `<Icon>` with a text label; a test enforces it); and "a new material needs a `MaterialThumb` drawing" (`MaterialThumb.test.ts` fails without one);
  - under **Workflow**, add that printables don't change until the owner has done the printables review (checklist in `plan/QA-CHECKLIST.md`) and approved the PRD drafted from their list.
- `README.md`: append to its **License** section: "Exception: the web fonts in `public/fonts/` (Newsreader, and MM Sans, a renamed subset of Adobe's Source Sans 3) are licensed under the SIL Open Font License 1.1; see `public/fonts/OFL.txt`. `scripts/fonts/build-fonts.py` regenerates them." Today that section says all rights are reserved, which the fonts' licence does not allow for them.
- Proposal: the owner's printables list becomes the printables PRD (drawing on the audit's print-content candidates), and PRD 20 is drafted from the remaining "PRD 20 candidates" in [`audit-findings.md`](audit-findings.md); the owner decides the number and scope of each. Don't start either without the owner's go-ahead.

**The printables hand-off.** When the checks pass, append this section to `plan/QA-CHECKLIST.md` and point the owner to it. The owner reviews every printable in its Album version and makes a list of changes; that list becomes the printables PRD.

```markdown
## PRD 19 — printables review (for the owner)

The Album redesign is complete, and every printable now carries the Album's type and tokens: Newsreader for sheet text and numerals (the command-card stamps are MM Sans), lining figures, and the Album's ink and hairlines. Their content and layout did not change. Look at each one in Chrome's print preview (Letter, default margins, background graphics off, scale 100%), in colour and then in black and white, print the ones you want to see on paper, and jot down what you'd change. Your list becomes the printables PRD. The audit's print findings ([PRD 20 candidates: printables and print content](audit-findings.md#prd-20-candidates-printables-and-print-content)) are there to draw on.

- Site: `npm run preview`, then the LAN URL (for example `http://192.168.1.208:4173`).

### Worksheets (13): each with `?seed=424242&key=1`, then again with `&bw=1`
- [ ] `/worksheets/command-cards`
- [ ] `/worksheets/decimals`
- [ ] `/worksheets/fractions`
- [ ] `/worksheets/golden-bead-pictures`
- [ ] `/worksheets/hundred-chart`
- [ ] `/worksheets/long-division`
- [ ] `/worksheets/long-multiplication`
- [ ] `/worksheets/math-facts`
- [ ] `/worksheets/multi-digit-ops`
- [ ] `/worksheets/numeral-tracing`
- [ ] `/worksheets/place-value`
- [ ] `/worksheets/skip-counting`
- [ ] `/worksheets/teens-tens`

### Kits (7): colour, then `?bw=1`; at 100% scale the calibration square measures exactly 1 inch
- [ ] `/kits/golden-bead-cards`
- [ ] `/kits/hundred-board-tiles`
- [ ] `/kits/large-number-cards`
- [ ] `/kits/paper-fraction-circles`
- [ ] `/kits/play-money`
- [ ] `/kits/stamp-game-tiles`
- [ ] `/kits/strip-boards`

### Planner: the parent plan and the child's "My Work" journal, colour and B&W
- [ ] `/planner?l=golden-beads-addition:mon&s=math-facts.times-tables:tue&m=golden-beads:wed&s=multi-digit-ops&l=stamp-game-addition:thu&l=number-cards-intro:mon&s=long-division.first-long-division:fri&m=stamp-game&l=snake-game:tue&s=skip-counting:wed&m=hundred-board:sat&l=fractions-intro&s=place-value:sun&w=2026-10-05` (13 items: the plan, then two journal pages, the second marked "(continued)")

### Printables on material pages: colour, then "Ink-friendly B&W"
- [ ] `/materials/addition-charts` › Print control charts
- [ ] `/materials/multiplication-charts` › Print control charts
- [ ] `/materials/bead-chains` › Hundred chain › Show arrow labels
- [ ] `/materials/bead-chains` › Thousand chain › Show arrow labels

### Lessons (41): the album print design
- [ ] `/lessons/checkerboard-multiplication`, `/lessons/decimal-board-operations`, `/lessons/racks-and-tubes` (the three longest) and `/lessons/golden-beads-addition`, including one print on the black-and-white laser
- [ ] A skim of the rest from `/lessons`

### Guides (6)
- [ ] `/parents/faq`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview`, `/parents/using-this-site`
- [ ] `/parents/scope-and-sequence` (the scope chart)

**When you're done:** give Claude the list, one line per change. It becomes the printables PRD; no printable changes until you've approved it.
```
