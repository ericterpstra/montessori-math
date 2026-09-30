# PRD 19 — audit findings

Every verified finding from the September 2026 visual audit, and what happens to it. [PRD 19](../19-the-album.md) resolves the ones about the visual system and page chrome, and Georgia's old-style numerals inside materials and printables. A separate session fixes four functional bugs. Everything else is a candidate for PRD 20, which the owner will scope after PRD 19 ships.

| Group | High | Medium | Low | Total |
|---|---|---|---|---|
| [Resolved by PRD 19](#resolved-by-prd-19) | 4 | 11 | 38 | 53 |
| [Partly resolved by PRD 19](#partly-resolved-by-prd-19) | 1 | 2 | 2 | 5 |
| [Fixed in the bug-fix session (merged, PR #7)](#fixed-in-the-bug-fix-session-merged-pr-7) | 4 | 0 | 0 | 4 |
| [PRD 20 candidates: materials on screen](#prd-20-candidates-materials-on-screen) | 5 | 18 | 27 | 50 |
| [PRD 20 candidates: printables and print content](#prd-20-candidates-printables-and-print-content) | 4 | 13 | 23 | 40 |
| [PRD 20 candidates: content and features the redesign does not touch](#prd-20-candidates-content-and-features-the-redesign-does-not-touch) | 0 | 1 | 12 | 13 |
| **All findings** | **18** | **45** | **102** | **165** |

## How the audit was done

- **Real browser.** On 29 September 2026 all 97 routes of the live site were rendered in Chrome on the owner's MacBook, with Georgia and San Francisco at 2× density. A small harness loaded each route in a same-origin frame at exactly 1400px (desktop), 820px (tablet portrait) and 390px (phone). The live site served the same build as `main@0faa268`.
- **Print.** Printables were checked in print emulation: the print stylesheet applied at Letter's 7.5in printable width, with each page measured against the 10in printable height, in colour and B&W. No physical printer was used, which is why PRD 19 adds a real B&W laser test.
- **Coverage.** Eight reviewers split the site: the shell and hub pages, the 21 materials in three groups, the 41 lessons, the 13 worksheet builders, every printable in colour and B&W, the kits, the planner and the guides. Materials were operated (exchanges, modes, focus mode, walk-throughs), not just viewed. A completeness check then listed 14 gaps, including phone landscape, an empty planner and walk-through edge cases, and a ninth sweep covered them.
- **Automated leads, human eyes.** A layout scan flagged candidates (content past the screen edge, wrapped buttons, stranded words, squeezed table cells, overlapping text, ragged grid rows, small tap targets). Reviewers treated them as leads only and confirmed each finding visually.
- **Two-lens verification.** Each finding went to two independent verifiers. One re-checked the screenshot or reproduced the problem live and tried to refute it. The other traced the cause in the source and checked whether it was intentional. 11 of 233 raw findings were refuted and are left out, and duplicates are merged, which gives the 165 entries below.

**Reading an entry.** The ids name the reviewer who found it (S1–S9); a merged entry lists every id, joined with `+`, and PRD 19 refers to it by its first id. "Recurring" marks a problem seen across many pages. File and line references in **Cause** are as of `main@0faa268`, so later commits (including PRD 19) move them. The screenshots and the full audit report are private and not in this repository.

## Resolved by PRD 19

The step numbers refer to [PRD 19](../19-the-album.md). Each entry says how the step resolves it.

**S7-05+S6-04+S2-03+S3-07+S4-12+S9-18** · high · typography · recurring — Georgia's old-style numerals make digits bounce off the baseline on number cards, boards and printables (0 looks like o, the decimal point like a times dot)
- **Pages:** `/kits/hundred-board-tiles`, `/kits/large-number-cards`, `/kits/strip-boards`, `/kits/play-money`, `/worksheets/numeral-tracing` and 17 more (at 1400, 820 and 390px; in print)
- **Cause:** --font-heading is Georgia first (tokens.css:71). Child-facing numerals use it at kits.css:13 (.kit-number-card), :20 (.kit-hb-tile), :26 (.kit-strip), :33 (.kit-board-head), :45-46 (.kit-bill, .kit-bill-corner), and numeral-tracing.css:26-28 (the SVG <text> glyphs). Georgia's default figures are old-style. Also: `numeral-tracing.tsx:96-98`.
- **Fix hint:** Use a lining-figure face (e.g. the system-ui body stack or a dedicated numeral font) for all child-facing numerals; Georgia has no lining alternates.
- **Resolved by PRD 19, Steps 6 and 7:** `--font-heading` and the new `--font-numeral` are Newsreader, whose default figures are lining, and every material stage and printable sheet sets `font-variant-numeric: lining-nums`. Number cards use `--font-numeral` and stamps MM Sans (`materials.css`); kits and numeral tracing take Newsreader through `--font-heading` without edits to their files.

**S1-01** · high · overflow clipping — Kits index: piece-count pill overflows its card, overlaps the next card, and makes phone/tablet pages scroll sideways
- **Pages:** `/kits` (at 1400, 820 and 390px)
- **Cause:** src/styles/global.css:172-183 `.badge { display:inline-block; white-space:nowrap }` applied to long free text at src/kits/KitsIndex.tsx:29 (`<span className="badge">{k.pieces}</span>`). The card-grid tracks are `repeat(auto-fill, minmax(260px,1fr))` (global.css:153).
- **Fix hint:** Show pieces as a small plain-text meta line (wrapping allowed) instead of a nowrap pill.
- **Resolved by PRD 19, Steps 11 and 19:** Badges wrap; kit piece lists and presets are a plain `.row-note` line, so no pill overflows and no page scrolls sideways.

**S1-02** · high · overflow clipping — Planner worksheet rows break on phones: names squeezed one word per line, day select cut off, page scrolls sideways
- **Pages:** `/planner` (at 390px)
- **Cause:** src/styles/planner.css:9 `.planner-row { display:flex }` (no flex-wrap), with :10 `label { flex:1 1 auto }` and :13 `select` having no width. In PlannerPage.tsx:63-77 each worksheet row holds label + preset select (:268-280) + day select. Select flex items have min-width:auto = their intrinsic width (widest option, e.g. 'Wednesday' or the longest preset name), so they can't shrink. Also: `planner.css:3`.
- **Fix hint:** Under ~560px let .planner-row wrap so the selects drop to a second line below the name (flex-wrap: wrap; selects flex: 1).
- **Resolved by PRD 19, Step 41:** Planner rows wrap and the selects drop under the name at ≤560px.

**S8-02** · high · overflow clipping — On a phone the scope table is cut off mid-word and hides the worksheet column
- **Pages:** `/parents/scope-and-sequence` (at 390px)
- **Cause:** src/styles/guides.css:49-51 `.scope-table-wrap { overflow-x: auto }` wraps a six-column table with no max-width media query and no alternate small-screen layout (guides.css has no @media screen rule for the table at all). Also: `scope-and-sequence.tsx:35-38`.
- **Fix hint:** Below 640px, restack each lesson as a card (title, then ages · grades, then materials, then worksheets), or at least make the Lesson column sticky and add an edge fade.
- **Resolved by PRD 19, Step 37:** Stacked, labelled entries at ≤640px.

**S1-04** · medium · grid layout · recurring — Cards in every grid have uneven heights and uneven gaps between rows
- **Pages:** `/`, `/ages`, `/materials`, `/worksheets`, `/kits` and 1 more (at 1400 and 820px)
- **Cause:** src/styles/global.css:160-165 `a.card { display:block }` (no height:100%/flex:1) inside `.card-grid > li` (global.css:151-158). Grid items (li) stretch to the row height via the default align-self:stretch, but the block-level card inside is only as tall as its content. Cards in the same row therefore end at different heights, and the visible gaps between rows vary with each card's shortfall.
- **Fix hint:** `.card-grid > li { display: flex } .card-grid > li > .card { flex: 1 }`; make the card a flex column so chips/meta sit at the bottom (margin-top: auto).
- **Resolved by PRD 19, Steps 15 and 18–24:** Rows, not boxes: one whole-row link per entry.

**S1-05** · medium · grid layout · recurring — Per-strand grids leave orphan cards and long runs of single cards with two-thirds of the row empty
- **Pages:** `/materials`, `/worksheets`, `/kits`, `/`, `/ages` (at 1400 and 820px)
- **Cause:** One `<ul className="card-grid">` per strand, in src/materials/MaterialsIndex.tsx:15-37, src/worksheets/WorksheetsIndex.tsx:15-45 (plus the separate 'Beyond worksheets' grid) and src/kits/KitsIndex.tsx:17-37. These combine with global.css:153 `repeat(auto-fill, minmax(260px,1fr))`, which gives 3 columns at 1400 (1068px content) and 2 at 820 (788px). Also: `Home.tsx:55-95`.
- **Fix hint:** Use one continuous grid with the strand shown as a card eyebrow or color tab (or a compact list for 1–2-item strands); on home, force 3 columns or 1 column rather than 2+1.
- **Resolved by PRD 19, Steps 15 and 18–24:** Contents lists have no grid, so no orphan columns; home parts go 3 → 1.

**S2-10+S3-11+S4-15** · medium · consistency · recurring — 'How to use this material' has no disclosure marker, so collapsed it looks like an empty white bar
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game`, `/materials/bead-frame`, `/materials/number-cards`, `/materials/cards-and-counters` and 16 more (at 1400, 820 and 390px)
- **Cause:** materials.css:15-21 .material-help summary{display:flex}. A summary that is not display:list-item drops its ::marker in Chromium and Firefox. There is no replacement chevron or hover state. .material-help (:7-13) is full-width while .material-help-body is capped at 46rem (:23-27).
- **Fix hint:** Add an explicit chevron (summary::after with rotate on [open]) and a hover state, or keep display:list-item.
- **Resolved by PRD 19, Steps 27 and 28:** The help is a disclosure line with a drawn +/− marker and a 44px summary.

**S5-03** · medium · spacing · recurring — Album header chip row is ragged: grades chip is stranded next to the Print button, and spacing is uneven
- **Pages:** `39 of 41 /lessons/* (all except fractions-intro, fractions-equivalence)` (at 1400, 820 and 390px)
- **Cause:** src/lessons/LessonPage.tsx:22-29 puts three .badge spans and an inline-styled <span style={{marginLeft:'auto'}}> holding the PrintButton into one flex row (.album-meta, album.css:22-27: flex-wrap, gap 0.35rem). The .badge rule (global.css:172-183) also sets margin-right: 0.35rem (:181), so column spacing is 5.6px gap + 5.6px margin = 11.2px while row spacing is only the 5.6px gap. Also: `album.css:18-20`, `global.css:174`.
- **Fix hint:** Give the chips their own row (drop .badge margin-right inside flex rows) and move the Print action to a separate actions row (full-width on phone); increase the h1-to-chip spacing.
- **Resolved by PRD 19, Steps 32 and 33:** One running-head row (meta and Print), 1.5rem to the title.

**S5-12+S8-07** · medium · typography · recurring — Lesson and guide lines run about 95–100 characters, too long to read comfortably
- **Pages:** `32 of 41 /lessons/* @1400; 13 of 14 scanned @820`, `/parents/faq`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview` and 1 more (at 1400 and 820px; in print)
- **Cause:** src/styles/album.css:3-8 sets .album max-width to 50rem (800px) with 2.4rem horizontal padding and a 1px border. That leaves 800 - 76.8 - 2 = 721.2px for 16px system-ui text, roughly 95-100 characters per line. At 820 the album fills the 788px main box, leaving about 709px of text. No ch-based measure cap exists.
- **Fix hint:** Cap prose at about 68ch (for example `.album section > * { max-width: 68ch }`) or raise the body size to 17–18px.
- **Resolved by PRD 19, Steps 33 and 37:** A 42.25rem text column at 18px (about 70–75 characters).

**S9-23** · medium · other · recurring — Every page, printout and saved PDF has the same title
- **Pages:** `all routes (checked /materials/golden-beads, /lessons/racks-and-tubes, /worksheets/math-facts, /kits/stamp-game-tiles, /planner, /parents/faq, 404)` (at 1400px)
- **Cause:** index.html:14 is a static <title>. grep finds no document.title assignment anywhere in src/ (the only <title> hits are SVG titles in src/components/beads.tsx).
- **Fix hint:** Set a per-route title, e.g. 'Long Division worksheet · Montessori Math' or 'Stamp Game Tiles kit · Montessori Math'.
- **Resolved by PRD 19, Steps 13, 30, 32, 35, 39, 40 and 41:** Per-page `document.title`.

**S1-06** · medium · typography — Lessons index is an unscannable wall of text (run-in titles, 140-char lines, no gap between items)
- **Pages:** `/lessons` (at 1400, 820 and 390px)
- **Cause:** src/lessons/LessonsIndex.tsx:27-30 renders each lesson as a single `<li>` with Link + ' ' + `<span className="badge age">` + overview text, all inline. Neither the ol nor the li gets a max-width or item spacing. The li width = main content 1068px minus the 40px default ol padding = 1028px at 1400, which matches the reported value. Also: `LessonsIndex.tsx:24`.
- **Fix hint:** Render each lesson as a block (title line + pill, overview below at max 46rem, 0.75–1rem gap) or as compact cards.
- **Resolved by PRD 19, Step 20:** Numbered rows with the overview in a 36rem column.

**S1-09** · medium · material rendering — Home hero bead illustration is out of Montessori proportion and disappears on phones
- **Pages:** `/` (at 1400, 820 and 390px)
- **Cause:** src/pages/Home.tsx:47-50 uses unrelated sizes: `<ThousandCube size={104}/>` (beads.tsx:135-160: viewBox 124 with a 100-unit front face, so the face edge ≈ 84px and bead pitch ≈ 8.4px), `<HundredSquare size={72}/>` (side 72px, pitch 7.2px), `<TenBar beadSize={13} vertical/>` (BeadBar beads.tsx:74-80: height = 13/20 x 200 = 130px, pitch 13px) and `<Bead size={16}/>`. Also: `src/styles/global.css:285-289`.
- **Fix hint:** Derive all four sizes from one bead unit (e.g. bead 10px, bar 100px, square 100px, cube 100px) and show a smaller version above the H1 on phones.
- **Resolved by PRD 19, Steps 14 and 23:** Plate I and the golden-bead plate derive from one bead unit; Plate I shows on phones.

**S1-11** · medium · consistency — Planner 'Week of' date input is unstyled and glued to its label
- **Pages:** `/planner` (at 1400, 820 and 390px)
- **Cause:** src/styles/global.css:233-245 styles only `label.field input[type='number'|'text']` and `select` (display:block; width:100%; font:inherit; border var(--line); radius). The planner's `<input type="date">` inside `<label className="field">` (PlannerPage.tsx:290-293) matches neither, so it stays inline with UA styles. In Chromium the UA sheet sets date inputs to `font-family: monospace`, hence the mm/dd/yyyy look.
- **Fix hint:** Add `label.field input[type='date']` to the shared field rule.
- **Resolved by PRD 19, Steps 16 and 41:** The date input gets the field skin.

**S1-14** · medium · grid layout — At tablet width the planner shelf drops ~4,000px below the checkboxes
- **Pages:** `/planner` (at 820 and 390px)
- **Cause:** src/styles/planner.css:3-6: at ≤900px `.planner-layout` becomes a single `minmax(0,1fr)` column, so the `<aside className="card planner-shelf">` (PlannerPage.tsx:288), second in source order, lands below all the picker rows (~38 lessons + 13 worksheets + 21 materials, ~75 rows at ≥44px each). Its `position: sticky; top: 1rem` (planner.css:16) does nothing there, because the sticky box is confined to its own grid row.
- **Fix hint:** On narrow screens show a sticky bottom bar ('3 picked · Print') or put the shelf above the picker.
- **Resolved by PRD 19, Step 41:** The shelf comes first and sits above the picker at ≤900px.

**S8-01** · medium · table — Scope & Sequence table is squeezed into the narrow prose column on desktop and tablet
- **Pages:** `/parents/scope-and-sequence` (at 1400 and 820px)
- **Cause:** src/styles/guides.css:3-5 `.guide { max-width: 46rem }` (736px) is applied to the scope page's <article className="guide"> (src/parents/guides/scope-and-sequence.tsx:20), so .scope-table (width:100%, guides.css:53-57) can never exceed 736px even though main.site-main offers a 1068px content box (global.css:122-126). Also: `scope-and-sequence.tsx:37-38`.
- **Fix hint:** Let the scope page break out to the full 1100px container (e.g. .guide--wide), trim Ages/Grades to ~4rem with nowrap, and give Lesson a min-width.
- **Resolved by PRD 19, Steps 36 and 37:** The scope chart spans the full column.

**S1-07+S8-21+S6-24** · low · line break · recurring — Header nav wraps awkwardly on tablet and phone: a lopsided 4 + 3 block, and a 160px header before any content
- **Pages:** `/`, `/ages`, `/materials`, `/lessons`, `/worksheets` and 23 more (at 820 and 390px)
- **Cause:** src/styles/global.css:68-76 `.site-header-inner { display:flex; flex-wrap:wrap }`, plus :93-98 `.site-nav { flex-wrap:wrap; margin-left:auto }` and :100-109 link padding 0.45rem 0.7rem with min-height 44px. At 820 (788px content): title (~205px) + gap 16 + nav (~620px) > 788, so the nav wraps as a whole onto row 2, and margin-left:auto right-aligns it.
- **Fix hint:** Below ~900px use a single horizontally scrollable nav strip (or compact menu) left-aligned with the content edge; tighten link padding so title+nav fit one row at 820.
- **Resolved by PRD 19, Step 12:** Tablet: one left-aligned nav row; phone: one scrolling row, header about 110px.

**S1-16+S3-24+S8-19** · low · alignment · recurring — Footer text sits 16px left of the page content edge
- **Pages:** `/`, `/ages`, `/materials`, `/lessons`, `/worksheets` and 17 more (at 1400, 820 and 390px)
- **Cause:** src/styles/global.css:128-134: `.site-footer` carries the `padding: 1.2rem 1rem 2rem` outside the 1100px `.site-footer-inner` box (:136-139). The header puts its 1rem padding inside the max-width box (:68-71), and so does main (:122-126). At 1400: header content x = 150 + 16 = 166, while the footer inner starts at 16 + (1368-1100)/2 = 150.
- **Fix hint:** Move `padding: 0 1rem` into .site-footer-inner (and keep vertical padding on .site-footer).
- **Resolved by PRD 19, Step 12:** One `.container` for header, main and footer.

**S1-17** · low · spacing · recurring — Footer floats mid-screen on short pages (404)
- **Pages:** `/this-page-does-not-exist` (at 1400, 820 and 390px)
- **Cause:** No sticky-footer layout. Layout.tsx renders header/main/footer as siblings inside #root, and neither body (global.css:11-17), #root (unstyled) nor main.site-main (:122-126) has a min-height or flex column. NotFound (src/pages/NotFound.tsx) is just an h1 plus one sentence linking home.
- **Fix hint:** Make the app root `display:flex; flex-direction:column; min-height:100vh` with main `flex:1`; give the 404 links to the hub pages.
- **Resolved by PRD 19, Steps 12 and 24:** Sticky colophon; the 404 lists the six hubs.

**S1-18+S8-06+S5-02+S6-25+S2-20+S5-01** · low · line break · recurring — Single words stranded on the last line of headings, lesson titles and card titles
- **Pages:** `/`, `/kits`, `/parents`, `/materials`, `/parents/faq` and 32 more (at 1400, 820 and 390px; in print)
- **Cause:** No `text-wrap: balance|pretty` anywhere in src/styles (grep finds none). The headings (global.css:25-37) and p (:39-41) use default greedy line breaking, so short last lines are left wherever the width happens to fall.
- **Fix hint:** `h1,h2,h3 { text-wrap: balance }` and `p { text-wrap: pretty }`.
- **Resolved by PRD 19, Step 7:** `text-wrap: balance` on chrome headings and `pretty` on chrome paragraphs (sheet instructions inside printables are untouched).

**S1-19** · low · spacing · recurring — Card bottom padding is double the top on some hubs, not others
- **Pages:** `/materials`, `/worksheets`, `/kits` (at 1400, 820 and 390px)
- **Cause:** Global `p { margin: 0 0 1em }` (src/styles/global.css:39-41, not :43-45). The card's 1rem top/bottom padding (:148) stops that margin from collapsing out of the card, so cards whose last child is a plain <p> get ~16px + 16px at the bottom. Only some call sites zero it inline: Home.tsx:59/68/77/91/99, ParentsIndex.tsx:21/28, AgesPage.tsx:74, WorksheetsIndex.tsx:31 (presets row). Also: `MaterialsIndex.tsx:30`, `KitsIndex.tsx:31`.
- **Fix hint:** `.card > :last-child { margin-bottom: 0 }` and drop the inline styles.
- **Resolved by PRD 19, Step 15:** No card paddings: rows.

**S1-20** · low · consistency · recurring — Card and pill anatomy differs on every hub page
- **Pages:** `/`, `/ages`, `/materials`, `/lessons`, `/worksheets` and 2 more (at 1400, 820 and 390px)
- **Cause:** Each hub hand-rolls its card markup. MaterialsIndex.tsx:27-30 puts age+grade badges in their own <p>. AgesPage.tsx:74-76 puts the age badge inline before the summary. WorksheetsIndex.tsx has an age badge plus preset badges. KitsIndex.tsx:29 has the pieces badge. Home and ParentsIndex have none. Also: `LessonsIndex.tsx:21-23`, `global.css:253-260`.
- **Fix hint:** One shared Card/Meta component (title, meta row of pills, summary) and one strand-header component used on every hub.
- **Resolved by PRD 19, Step 15:** One `ChapterHead` and one `ContentsRow` anatomy on every hub.

**S1-22+S5-15** · low · tap target · recurring — Lesson links on /ages, /lessons and in lesson navigation are small inline tap targets on phones
- **Pages:** `/ages`, `/lessons`, `all 41 /lessons/*` (at 390px)
- **Cause:** Plain inline `<Link>` inside `<li>` with body line-height 1.55 (global.css:16). The link box is one text line (~19px), and the row pitch is ~25-26px (the line box, slightly raised by the inline-block .badge). There is no block/padding treatment: AgesPage.tsx:58, LessonsIndex.tsx:28.
- **Fix hint:** Give list rows block links with ~0.5rem vertical padding (min-height 44px) on touch widths.
- **Resolved by PRD 19, Steps 20, 22, 32 and 33:** Lesson links are ≥72px rows on `/lessons` and `/ages`, and ≥44px targets inside lessons.

**S1-23+S5-19** · low · color contrast · recurring — Green age-chip text fails AA contrast, and the chip colors are hex literals
- **Pages:** `/ages`, `/materials`, `/lessons`, `/worksheets`, `all 41 /lessons/*` (at 1400, 820 and 390px)
- **Cause:** src/styles/global.css:185-189 `.badge.age { background:#eef4ee; color: var(--pv-unit) /* #2e8b57 */; border-color:#cfe3cf }` at font-size 0.75rem/700 (:174-175). Computed contrast is #2e8b57 on #eef4ee ≈ 3.80:1. 12px bold is below the large-text threshold, so 4.5:1 applies.
- **Fix hint:** Use a darker green token for pill text (≈#22683f) and move the pill background into tokens.css.
- **Resolved by PRD 19, Step 11:** The age is an ink stamp (14.04:1); the hex literals are deleted.

**S1-25** · low · alignment · recurring — Nav items shift 2–4px between pages because the active link turns bold
- **Pages:** `/`, `/materials`, `/ages`, `/lessons`, `/worksheets` and 3 more (at 1400 and 820px)
- **Cause:** src/styles/global.css:116-120 `.site-nav a.active { font-weight: 700 }` vs `.site-nav a { font-weight: 500 }` (:105). Bold widens the active label. Because the nav is right-anchored by `margin-left:auto` (:97), every link to the left of the active one shifts left when the active page changes.
- **Fix hint:** Keep the weight constant (use color + underline/pill for active) or reserve bold width with a hidden ::after of the bold label.
- **Resolved by PRD 19, Step 12:** A hidden bold `data-label` copy reserves the bold width.

**S1-28** · low · alignment · recurring — Callout cards ('A note on screens', 'Plan the week') don't line up with the grid above
- **Pages:** `/`, `/parents` (at 1400 and 820px)
- **Cause:** Inline `style={{ maxWidth: '46rem', marginTop: '2rem' }}` on `<section className="card">` at src/pages/Home.tsx:97 and src/parents/ParentsIndex.tsx:26. 46rem = 736px, against the full-width card-grid above (788px at 820, 1068px at 1400). 'Plan the week' ends with a plain `<Link to="/planner">` in the paragraph.
- **Fix hint:** Make callouts full grid width (with the inner text at a 46rem measure) and give the planner callout a .btn.
- **Resolved by PRD 19, Steps 21 and 23:** Callouts become centred note asides.

**S2-08+S3-19+S4-14** · low · line break · recurring — Material control rows wrap raggedly, stranding Focus and Sound on their own line and splitting equations
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game`, `/materials/bead-frame`, `/materials/cards-and-counters`, `/materials/number-cards` and 12 more (at 1400, 820 and 390px)
- **Cause:** materials.css:29-35 .material-controls is one flat flex-wrap row. MaterialShell.tsx:69-73 renders {controls}, then {soundToggle} and {focusToggle}, so shell buttons wrap with whatever the material put first. The reviewer cited :71-75.
- **Fix hint:** Split into two groups: left = material/mode controls, right = Reset/Sound/Focus (margin-left:auto), each wrapping as a unit. Consider icon-only Sound/Focus.
- **Resolved by PRD 19, Steps 27 and 28:** Task controls wrap inside their own group; Sound and Focus pinned top right.

**S2-18+S3-23** · low · alignment · recurring — Parent-note cards stop short of the mat edge, leaving ragged right edges below the material
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game`, `/materials/bead-frame`, `/materials/number-cards`, `/materials/cards-and-counters` and 9 more (at 1400 and 820px)
- **Cause:** MaterialPage.tsx:84 and :90 have inline style maxWidth:'46rem' on the 'For parents' and 'Make the real thing' cards. :93 sets inline marginBottom:0 on each kit <p>, and :94 renders '({k.pieces})' where pieces strings already contain parentheses (e.g. large-number-cards.tsx:13 '36 number cards (1–9,000)'). The lessons/worksheets section (:100-128) has no cap.
- **Fix hint:** Use one content measure for all below-mat sections (or a 2-column parent/kits layout on desktop), and render kits as a spaced list or cards.
- **Resolved by PRD 19, Step 30:** Notes and link lists are two ruled columns across the plate. On the 14 materials without a kit, "For parents" is the only note: its ink rule spans the plate's full width and its text keeps the 40rem reading measure (Phase 4 review fixes; before them it sat alone in the left column, narrower than the old 46rem card).

**S4-13+S8-10+S2-23** · low · consistency · recurring — Emoji icons are glued to button labels and mix color and monochrome styles
- **Pages:** `/materials/multiplication-charts`, `/materials/multiplication-bead-board`, `/materials/division-board`, `/materials/racks-and-tubes`, `/materials/checkerboard` and 16 more (at 1400, 820 and 390px)
- **Cause:** src/components/MaterialShell.tsx:51 `'🔊 Sound on'` (color emoji) next to :57 `'⛶ Focus'` / `'✕ Exit focus'` (text-presentation glyphs); src/components/PrintButton.tsx:4 `🖨 {label}`. Each label is a single anonymous flex item, so `.btn{gap:.4rem}` (global.css) never applies. The only separation is a literal ASCII space, rendered next to the emoji's own sidebearings.
- **Fix hint:** Replace the emoji with one inline SVG icon set in a `<span aria-hidden>` and let the existing `.btn{gap:.4rem}` space it.
- **Resolved by PRD 19, Steps 8, 9, 10, 27, 32, 39 and 41:** One inline-SVG icon set with an 8px gap; every emoji removed; a guard test.

**S4-24** · low · consistency · recurring — Grade chip on material pages is an unlabeled '1–3'
- **Pages:** `/materials/multiplication-charts`, `/materials/multiplication-bead-board`, `/materials/division-board`, `/materials/racks-and-tubes`, `/materials/checkerboard` and 2 more (at 1400, 820 and 390px)
- **Cause:** src/materials/MaterialPage.tsx:57 `<span className="badge">{material.grades}</span>` renders the raw string ('1–3', 'K–1', 'PK'), while src/lessons/LessonPage.tsx:25 renders `grades {lesson.grades}`.
- **Fix hint:** Render 'grades 1–3' on material pages to match lessons.
- **Resolved by PRD 19, Step 30:** The material meta reads "GRADES 1–3".

**S5-06+S8-08** · low · grid layout · recurring — Lessons and guides are pinned to the left of the page, leaving the right third empty on desktop
- **Pages:** `all 41 /lessons/*`, `/parents/faq`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview` and 2 more (at 1400 and 820px)
- **Cause:** src/styles/album.css:3-10 sets .album max-width: 50rem (800px) with no margin-inline: auto. It sits inside main.site-main (global.css:122-126: max-width 1100px, margin 0 auto, padding 1rem). At 1400 the content box runs x=166-1234, so the album spans 166-966, matching the reviewer's measurements exactly and leaving about 268px empty on the right.
- **Fix hint:** Center the album, or better, use the right rail for a sticky 'On this page' jump list plus Print and virtual-material actions.
- **Resolved by PRD 19, Steps 33 and 37:** Lessons and guides are centred 56rem pages.

**S5-09** · low · consistency · recurring — Vocabulary pills hold whole lists and glosses, and wrap into two-line blobs
- **Pages:** `/lessons/fractions-intro`, `/lessons/hundred-board-intro`, `/lessons/ten-board-counting`, `/lessons/stamp-game-subtraction`, `/lessons/bead-stair-intro` and 1 more (at 1400, 820 and 390px)
- **Cause:** src/styles/album.css:72-87 styles each .vocab li as a pill (border-radius 999px, padding 0.1rem 0.7rem, 0.9rem text) in a flex-wrap row. Some vocabulary entries are phrases or lists rather than single terms: fraction-circles fractions-intro 'third, fourth (also called a quarter), fifth, sixth, seventh, eighth, ninth, tenth'; hundred-board-intro 'the decade names: twenty, thirty, forty … one hundred'; Also: `LessonPage.tsx:142-146`.
- **Fix hint:** Split lists into single terms and show glossed terms as a definition list (term: meaning); keep pills only for bare words, or use a smaller radius.
- **Resolved by PRD 19, Step 33:** Vocabulary is an italic run-in list.

**S5-10** · low · spacing · recurring — Uneven vertical rhythm: gaps above section headings vary from 17 to 28px
- **Pages:** `all 41 /lessons/*` (at 1400, 820 and 390px)
- **Cause:** Three mechanisms cause the uneven gaps. (1) The overview <p> at LessonPage.tsx:32 has an inline font-size of 1.05rem, and the global p margin is 0 0 1em (global.css:39-41), so the gap above Materials is 16.8px. (2) Sections normally end with a margin-bottom of 1.4rem = 22.4px (album.css:29-31), and the last li's 0.35rem margin (album.css:49-51) collapses into it through the ul and section. Also: `album.css:89-93`.
- **Fix hint:** Lay out the album as a flex column with a single gap, or zero the last-child li margins and give the overview a class with a defined bottom space.
- **Resolved by PRD 19, Step 33:** One section rhythm, last-child margins zeroed.

**S6-14+S7-23** · low · tap target · recurring — Builder and kit form controls are under 44px and inconsistent (selects 35px, inputs 39px, checkboxes 18px)
- **Pages:** `/worksheets/command-cards`, `/worksheets/decimals`, `/worksheets/fractions`, `/worksheets/golden-bead-pictures`, `/worksheets/hundred-chart` and 10 more (at 1400, 820 and 390px)
- **Cause:** global.css:226-231 gives label.field font-weight:600. global.css:233-245 gives select and input `padding:.45rem .6rem; font:inherit` (so the controls inherit weight 600) and sets no min-height or height, so native select and number-input box heights differ. worksheets.css:43-52 renders the checkbox at 1.1rem square and puts no min-height on label.field.checkbox. Also: `tokens.css:76`.
- **Fix hint:** min-height: var(--touch-target) on select/input with font-weight:400, and 44px-tall checkbox rows with a ≥22px box.
- **Resolved by PRD 19, Steps 16, 39 and 40:** Every field 44px, checkbox rows ≥44px with a 22px box.

**S6-15** · low · overflow clipping · recurring — Select labels clipped mid-word on desktop ('Name the fraction (picture → fract')
- **Pages:** `/worksheets/fractions`, `/worksheets/golden-bead-pictures`, `/worksheets/place-value`, `/worksheets/math-facts` (at 1400px)
- **Cause:** worksheets.css:5 fixes the aside at 320px (grid-template-columns:320px minmax(0,1fr)). After .card padding of 1.2rem per side (global.css:148) the select is about 280px wide, and its text inherits weight 600 (global.css:229/240). Long option labels include fractions.tsx:392 'Name the fraction (picture → fraction)', :393, golden-bead-pictures.tsx:215 and place-value.tsx:233. A native select clips without an ellipsis.
- **Fix hint:** Widen the aside to ~340–360px and shorten option labels (put the example in help text).
- **Resolved by PRD 19, Step 39:** A 21rem panel without card padding: selects are 336px (verify in MM Sans).

**S6-19** · low · spacing · recurring — Editing any field after a preset clears the preset and its description, so the form jumps ~84px
- **Pages:** `/worksheets/long-division`, `/worksheets/decimals`, `/worksheets/command-cards`, `/worksheets/math-facts` (at 1400, 820 and 390px)
- **Cause:** src/worksheets/BuilderPage.tsx:96-99: `overridden = def.schema.some(f => searchParams.get(f.key) !== null)` makes activePreset '' as soon as any field param exists, and the preset description renders only when activePreset is set (:147).
- **Fix hint:** Keep a stable line such as 'Based on “Two-digit divisors” (edited)' instead of removing the description.
- **Resolved by PRD 19, Step 39:** The preset help line survives edits.

**S8-09** · low · consistency · recurring — Print button sits on the title with no gap, and is placed differently from lesson pages
- **Pages:** `/parents/faq`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview`, `/parents/scope-and-sequence` and 1 more (at 1400, 820 and 390px)
- **Cause:** src/parents/GuidePage.tsx:13-15 renders the no-print flex row holding PrintButton directly above <Component/>, with no margin. The article's h1 gets `margin: 0 0 0.5em` from global.css:25-33 (margin-top 0), and guides.css:7-9 only changes margin-bottom, so the h1 box starts at the button's bottom edge. Lessons put the button in the .album-meta row below the h1 (src/lessons/LessonPage.tsx:22-28). Also: `src/kits/KitPage.tsx:62-64`, `src/worksheets/BuilderPage.tsx:169-174`.
- **Fix hint:** Use one shared page-header pattern (h1 + meta/actions row) for guides and lessons, and space the button off the title.
- **Resolved by PRD 19, Steps 35, 39 and 40:** Print sits in the PageHeader action slot on guides, the builder and kits.

**S8-18** · low · typography · recurring — On phones the page title is barely bigger than section headings
- **Pages:** `/parents/faq`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview`, `/parents/scope-and-sequence` and 1 more (at 390px)
- **Cause:** src/styles/global.css:291-292 `@media (max-width: 640px) { h1 { font-size: 1.6rem } }` (25.6px), while h2 stays at 1.5rem/24px (global.css:36) with no phone override. `.guide h2 { border-bottom: 1px solid var(--line) }` (guides.css:17-21) adds weight to h2, and h1 has no rule.
- **Fix hint:** Size headings with clamp(), e.g. h2 about 1.25rem on phones, or keep h1 at 1.9rem or more.
- **Resolved by PRD 19, Steps 7 and 37:** Chrome h1 never drops below 36px; guide h2s are 1.3rem.

**S8-20** · low · spacing · recurring — Phone side gutter is only 12px
- **Pages:** `/parents/faq`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview`, `/parents/scope-and-sequence` and 1 more (at 390px)
- **Cause:** src/styles/global.css:294 `@media (max-width: 640px) { main.site-main { padding: 1rem 0.75rem 2.5rem } }` (header also 0.75rem, line 293).
- **Fix hint:** Use a 16–20px gutter on phones.
- **Resolved by PRD 19, Steps 6 and 12:** 16px phone gutter.

**S9-25+S8-12** · low · print · recurring — Printed guides leave a heading or glossary term stranded at the bottom of a page, away from its text
- **Pages:** `/parents/faq`, `/parents/using-this-site`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview` (in print)
- **Cause:** src/styles/guides.css:77-97 — the @media print block sets only .guide max-width/font-size and scope-table rules, with no h2/h3 break-after:avoid and no orphans/widows. src/styles/album.css:115-121 has .album li break-inside:avoid and .album h2 break-after:avoid.
- **Fix hint:** @media print { .guide h2, .guide h3 { break-after: avoid } .guide p { orphans: 3; widows: 3 } }
- **Resolved by PRD 19, Steps 37 and 38:** Grid rows, `break-after`, orphans/widows 3; 0 stranded heads measured.

**S9-33** · low · consistency · recurring — 'Exit focus' moves around from material to material
- **Pages:** `/materials/bead-frame`, `/materials/cards-and-counters`, `/materials/teen-board`, `/materials/subtraction-strip-board`, `/materials/decimal-board` and 2 more (at 1400 and 390px)
- **Cause:** src/components/MaterialShell.tsx:55-59, 69-73 — focusToggle ('✕ Exit focus') is the last child of the flowing .material-controls row after each material's own {controls} and the sound toggle, so its position depends on the width of each material's controls (materials.css:29-35, 213-215 flex-wrap).
- **Fix hint:** Pin 'Exit focus' to a fixed top-right corner of the focus layer.
- **Resolved by PRD 19, Steps 27 and 28:** Exit focus is always the toolbar's top-right control.

**S1-08** · low · line break — Home hero buttons wrap raggedly: third button alone at desktop, primary label breaks on phone
- **Pages:** `/` (at 1400, 820 and 390px)
- **Cause:** src/styles/global.css:279-283 `.home-cta { display:flex; flex-wrap:wrap }` with the long labels in src/pages/Home.tsx:34-44. At 1400 the hero text column = 1068 - 32 (hero gap) - beads (104+72+13+16+3x12.8 ≈ 243) ≈ 793px. The three buttons plus 2 x 9.6px gaps need ~798px, so the third wraps. At 390 the primary label is wider than the 366px content, so its text wraps inside the inline-flex .btn.
- **Fix hint:** One primary button plus two text links (or shorter labels); on phones make the stacked buttons full-width.
- **Resolved by PRD 19, Step 23:** One primary action plus two text links; full-width primary on phones.

**S1-12** · low · spacing — Planner strand headings hug the row above (5px above, 15px below)
- **Pages:** `/planner` (at 1400, 820 and 390px)
- **Cause:** The planner strand subheads are bare `<h3>` inside `<section>` (PlannerPage.tsx:255-258) and get only the global `h3 { margin: 0 0 0.5em }` (global.css:25-33): 0 above and 9.6px below. The previous row ends with only 0.15rem of padding (planner.css:9), while the row below adds 0.15rem padding plus the vertical centering of a 44px min-height row, which inverts the proximity. Also: `global.css:253-260`.
- **Fix hint:** `.planner-layout section h3 { margin: 1.25rem 0 0.25rem }`.
- **Resolved by PRD 19, Step 41:** Strand heads get `--space-6` above and `--space-2` below.

**S1-13** · low · alignment — Planner preset selects have ragged left edges; selects are 38px tall
- **Pages:** `/planner` (at 1400 and 820px)
- **Cause:** src/styles/planner.css:13 `.planner-row select { … min-height: 2.4rem }` (38.4px) sets no width, so each preset select (PlannerPage.tsx:268-280) is as wide as its longest option. Because the label is flex:1 and the day select (identical options, so constant width) is last, the preset selects' right edges align while their left edges zig-zag.
- **Fix hint:** Give the preset select a fixed width (~11rem), the day select ~8rem, and min-height var(--touch-target).
- **Resolved by PRD 19, Step 41:** Fixed 12.5rem/8.5rem select widths at 44px; picker grouped by strand.

**S1-15** · low · consistency — Worksheet preset chips look tappable but aren't, and they share the grade-pill style
- **Pages:** `/worksheets` (at 1400, 820 and 390px)
- **Cause:** src/worksheets/WorksheetsIndex.tsx:30-38 renders each preset as `<span className="badge">` inside the single card `<Link>`, so every chip navigates to the builder with default settings. Plain `.badge` (global.css:172-183, var(--paper-warm) fill) is the same style used for grades on MaterialsIndex.tsx:28 and for piece counts on KitsIndex.tsx:29.
- **Fix hint:** Make each preset a real link to the builder with that preset (outside the card link), or render as plain 'Presets: …' text.
- **Resolved by PRD 19, Steps 11 and 19:** Presets are plain "Presets: …" text.

**S1-21** · low · grid layout — Browse by Age: narrow lists leave desktop two-thirds empty; band tabs and pills stack raggedly on phone
- **Pages:** `/ages` (at 1400 and 390px)
- **Cause:** src/pages/AgesPage.tsx:32-45 renders the band tabs as content-sized `.btn` / `.btn.primary` inside `.material-controls` (materials.css:29-35, flex-wrap), so widths differ and the selected tab uses the terracotta primary-CTA style. Lessons (:55-62) are an <ol> of short inline link + badge items, with no columns, leaving most of the width empty.
- **Fix hint:** Equal-width segmented control for bands; 2–3 column lesson lists (or cards) at desktop; 46rem measure for list prose.
- **Resolved by PRD 19, Step 22:** Segmented band tabs and full-width rows with overviews.

**S1-26** · low · grid layout — Planner shelf: 'Clear week' button wraps alone onto a second row
- **Pages:** `/planner` (at 1400 and 390px)
- **Cause:** src/styles/planner.css:20 `.planner-actions { display:flex; flex-wrap:wrap; gap:.5rem }` in the 20rem aside (planner.css:3), with ~279.6px content (320 minus 2 x 1.2rem padding minus borders). Copy link (~129px) + Print (~97px) + Clear week (~119px) + gaps ≈ 361px, so 'Clear week' wraps alone. At 390 the aside is ~325px wide and still wraps. At 820 it spans ~750px and all three fit.
- **Fix hint:** Make the actions a 2-column grid (Print full-width primary on top, Copy/Clear below) or full-width stacked buttons.
- **Resolved by PRD 19, Step 41:** Planner actions are a grid: Print full width, then Copy link and Clear week.

**S5-08** · low · consistency — "See this presented…" button: wordy label wraps and left-aligns on phone, is weaker than Print, duplicates the link above, and is named differently on the material page
- **Pages:** `/lessons/golden-beads-addition`, `/lessons/stamp-game-addition` (at 1400 and 390px)
- **Cause:** src/lessons/LessonPage.tsx:57-68 renders a <Link className="btn"> labeled 'See this presented on the virtual material ({m.name})' in its own <p>, directly below the 'No materials at home? Use the virtual …' paragraph (:41-56), which links to the same /materials/<slug>. .btn (global.css:191-205) is display:inline-flex with justify-content:center but has no text-align:center. Also: `src/components/PrintButton.tsx:3`, `src/materials/MaterialPage.tsx:72`.
- **Fix hint:** Merge into one 'Try it on screen' row with a short label ('Watch this lesson presented ▸'), centered text, and matching naming on the material page.
- **Resolved by PRD 19, Step 32:** Play glyph, and the label names the feature "Walk through" as the material page does.

**S5-20** · low · other — "Use the virtual A · Use the virtual B" line is repetitive and wraps into three broken lines on phone
- **Pages:** `/lessons/golden-beads-formation`, `/lessons/number-cards-intro`, `/lessons/stamp-game-intro` (at 1400 and 390px)
- **Cause:** src/lessons/LessonPage.tsx:41-56 maps over lesson.virtualMaterials and repeats 'Use the virtual <Link>' for each one (:50), joined with ' · ' (:49), in a single inline paragraph with no nowrap on the link names. Exactly three lessons have two virtual materials: golden-beads-formation (golden-beads, number-cards), number-cards-intro (number-cards, golden-beads) and stamp-game-intro (stamp-game, golden-beads).
- **Fix hint:** Render "Try it on screen:" followed by material chips or links.
- **Resolved by PRD 19, Step 32:** "Use the virtual A or B.".

**S8-03** · low · color contrast — Strand banner rows fail text contrast (white on tan)
- **Pages:** `/parents/scope-and-sequence` (at 1400, 820 and 390px)
- **Cause:** src/styles/guides.css:71-75 `.scope-strand-row th { background: var(--wood); color: #fff; font-family: var(--font-heading) }`. --wood is #b58863 (tokens.css:47). Computed contrast of white on #b58863 is 3.15:1. The th inherits 0.92rem (14.7px) bold from .scope-table (guides.css:56), which is below the 18.66px-bold large-text threshold, so AA needs 4.5:1. White on --wood-dark #8a623f computes to 5.39:1.
- **Fix hint:** Use var(--wood-dark) (#8a623f, about 5.4:1) as the banner background, or dark ink on --paper-warm with a wood left border.
- **Resolved by PRD 19, Steps 36 and 37:** Strand rows are ink on paper (14.04:1).

**S8-05** · low · table — Blank follow-up cells look like missing data
- **Pages:** `/parents/scope-and-sequence` (at 1400, 820 and 390px; in print)
- **Cause:** src/parents/guides/scope-and-sequence.tsx:61-63 builds `sheets` from followUpWork worksheetSlugs, and lines 82-89 map over it with no empty fallback, so the <td> renders empty. Parsing all 41 lessons finds exactly 2 with no worksheetSlug: stamp-game-intro (src/materials/stamp-game/lessons.ts:9) and checkerboard-intro (src/materials/checkerboard/lessons.ts:5).
- **Fix hint:** Render a muted em dash or "Material only" when a lesson has no worksheet.
- **Resolved by PRD 19, Step 36:** An em dash plus a visually hidden "none".

**S8-22** · low · typography — Long fully italic callouts are hard to read and serve two different purposes
- **Pages:** `/parents/montessori-math-overview`, `/parents/how-to-present` (at 1400, 820 and 390px; in print)
- **Cause:** src/styles/guides.css:38-45 `.guide blockquote { … font-style: italic }` applies to both the disclaimer note (montessori-math-overview.tsx:136-141) and the illustrative scene (how-to-present.tsx:103-107). There is no modifier class to tell them apart, and body text is sans (--font-body).
- **Fix hint:** Set callouts in roman text with italics only for spoken lines, and give 'note' and 'scene' callouts different treatments.
- **Resolved by PRD 19, Steps 35 and 37:** The note is roman; the scene is italic (`.guide-scene`).

**S9-05** · low · consistency — Empty planner: Print, Copy link and Clear week are all live, and Print gives a blank page
- **Pages:** `/planner` (at 1400 and 390px; in print)
- **Cause:** src/planner/PlannerPage.tsx:317-331 renders .planner-actions (Copy link, <PrintButton/>, Clear week with window.confirm at :326) with no plan.items.length check. When the plan is empty, :339-350 renders only a .no-print hint and no .print-sheet. Everything else on the page is also .no-print (:239, :248), so window.print() gets a blank page. The hint sits after the whole picker list (:348), far down the page.
- **Fix hint:** Disable Print/Copy/Clear until an item is chosen, or print a 'No work planned yet' page.
- **Resolved by PRD 19, Step 41:** No Print, Copy link or Clear week on an empty plan.

**S9-30** · low · alignment — Planner 'Copy link' feedback shifts the buttons next to it
- **Pages:** `/planner` (at 1400 and 390px)
- **Cause:** src/planner/PlannerPage.tsx:318-320 — the button label swaps between '🔗 Copy link' and 'Copied' (state :175-184, 1500ms timeout). .btn has no fixed or min width and .planner-actions is flex-wrap (planner.css:20), so siblings shift. No aria-live is present.
- **Fix hint:** Give the button a fixed min-width and show '✓ Copied' in the same width, with an aria-live status.
- **Resolved by PRD 19, Step 41:** Copy link in a fixed half-width cell, with a `role="status"` announcement.

## Partly resolved by PRD 19

PRD 19 fixes part of each of these; the rest is listed as a PRD 20 candidate.

**S2-02+S3-04+S4-02** · high · overflow clipping · recurring — Fixed-width mats are wider than a phone or tablet: place columns, slots and counted beads sit off-screen behind a scroll you can't see
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game`, `/materials/bead-frame`, `/materials/cards-and-counters`, `/materials/hundred-board` and 8 more (at 820 and 390px)
- **Cause:** materials.css:60-66 .material-stage{overflow-x:auto} wraps fixed-width content. golden-beads.css:71-77 has min-width:640px. stamp-game.css:109-124 uses a width:max-content row of 152px columns (4x152 + 3 gaps ≈ 642px). bead-frame.css:3-10 is width:max-content with a 92px label, 13x44px wire slots (:55-60) and a 12px frame border. cards-and-counters.css:36-50 has 10 flex:none 92px columns + 9x10px gaps = 1010px.
- **Fix hint:** Make the mats fluid, e.g. golden/stamp columns in a 2×2 grid under ~700px, bead-frame slot size from a clamp()/container query, cards & counters in two rows of five below ~1000px. Never rely on hidden horizontal scroll.
- **Partly resolved by PRD 19, Step 29:** The scroll veil: the hidden scroll is now visible. **Left for PRD 20:** Fluid mats that fit a phone or tablet.

**S6-13+S7-21+S6-12** · medium · grid layout · recurring — On tablet and phone the long form comes first, and the sheet preview is pushed far below or shrunk to an unreadable thumbnail
- **Pages:** `/worksheets/command-cards`, `/worksheets/decimals`, `/worksheets/long-division`, `/worksheets/golden-bead-pictures`, `/worksheets/numeral-tracing` and 10 more (at 820 and 390px)
- **Cause:** worksheets.css:10-14 (@media max-width:900px → grid-template-columns:minmax(0,1fr)). global.css:233-245 makes label.field inputs and selects display:block width:100%, and nothing caps the width of number inputs.
- **Fix hint:** At 600–900px lay the form out as a 2–3 column field grid (or keep side-by-side with a 260px form), and cap number-input width.
- **Partly resolved by PRD 19, Steps 16 and 39:** A two-column field grid at 641–900px roughly halves the tablet form. **Left for PRD 20:** The phone preview is still a ~0.41 zoom fit (owner issue #1 reported having to scroll sideways to see a worksheet).

**S1-10** · medium · alignment — Planner shelf list: day labels float mid-row (no column), names cramped, not grouped by day
- **Pages:** `/planner` (at 1400, 820 and 390px)
- **Cause:** src/styles/planner.css:18 `.planner-shelf li { display:flex; align-items:center; gap:.5rem; min-height:44px }` has no padding. The day `<span>` (PlannerPage.tsx:303) has no fixed width and sits directly after the Link. Only `.planner-remove` (planner.css:19) has margin-left:auto, so the day x-position follows each name's length. Also: `PlannerPage.tsx:298`.
- **Fix hint:** Make each li a 3-column grid (name | day right-aligned fixed width | ×) with 0.4rem vertical padding, and group or sort the shelf by day.
- **Partly resolved by PRD 19, Step 41:** A three-column shelf row with a fixed day column. **Left for PRD 20:** Grouping or sorting the shelf by day.

**S5-16** · low · consistency · recurring — Worksheet link is tacked on as "…resists. — print: Long Division", and on paper has no URL
- **Pages:** `all 41 /lessons/* with a worksheetSlug` (at 1400, 820 and 390px; in print)
- **Cause:** src/lessons/LessonPage.tsx:179-186 renders {f.description}{' '}— print: <Link>{g.name}</Link>. The descriptions end in periods (e.g. golden-beads-addition), which produces '. — print:'. src/styles/print.css:38-41 sets a { color: inherit; text-decoration: none } in print, with no a[href]::after URL and no print-only footer anywhere (no .print-only usage in any .tsx).
- **Fix hint:** Render as a distinct 'Printable: Long Division →' chip or card after the item; in print, add a[href^='/worksheets']::after { content: ' (' attr(href) ')' } or a footer URL.
- **Partly resolved by PRD 19, Steps 32 and 33:** "Printable: …" on its own line on screen. **Left for PRD 20:** The worksheet URL on paper.

**S5-17** · low · print · recurring — Print: lessons run 3–4 Letter pages, several spill a few lines onto a nearly blank last page, and there is no source URL
- **Pages:** `/lessons/decimal-board-intro`, `/lessons/decimal-board-operations`, `/lessons/checkerboard-multiplication`, `/lessons/stamp-game-addition`, `/lessons/stamp-game-subtraction` and 2 more (in print)
- **Cause:** src/styles/album.css:105-126 print rules only drop the border, padding and max-width, set .album to 11pt, and add break-inside:avoid on li and break-after:avoid on h2. Every other size is rem-based and root-relative, so the 11pt setting does not reach it: h1 stays 2rem = 32px (global.css:35), h2 1.05rem, section margins 1.4rem, and line-height stays 1.55 (global.css:16).
- **Fix hint:** Tighten print spacing (line-height about 1.4, smaller section/li margins, about 22pt h1) and add a small print-only footer with the lesson URL.
- **Partly resolved by PRD 19, Step 34:** Tighter print layout; long lessons end 30–53% down their last page. **Left for PRD 20:** A site name and URL on printed lessons.

## Fixed in the bug-fix session (merged, PR #7)

Fixed in a separate session and merged to `main` in PR #7. The error boundary suggested for S3-01 followed in PR #8. Out of scope for PRD 19.

**S3-02+S4-01+S3-16** · high · print · recurring — 'Print control charts' prints a blank page
- **Pages:** `/materials/addition-charts`, `/materials/multiplication-charts` (at 1400, 820 and 390px; in print)
- **Cause:** src/materials/addition-charts/addition-charts.css:220-226 hides `body.addition-charts-print-mode main.site-main > *` and un-hides only `main.site-main > .addition-charts-print`. Since commit 8377f20, AdditionCharts.tsx:247 renders `<SheetPreview className="addition-charts-print">`. SheetPreview.tsx:36-37 puts that class on the inner `.print-sheet`, inside a `div.sheet-preview` wrapper. Also: `MaterialPage.tsx:52-82`.
- **Fix hint:** Target the wrapper, e.g. `main.site-main > .sheet-preview:has(.addition-charts-print){display:block!important}`, or pass a wrapper class through SheetPreview.
- **Fixed in the bug-fix session:** `e24aa01`, *Fix blank print from "Print control charts" on both chart materials* (merged in PR #7).

**S6-02+S7-02** · high · typography · recurring — Answer keys glue the problem number to the first operand, so '1. 214 + 459' reads as the decimal '1.214 + 459'
- **Pages:** `/worksheets/math-facts`, `/worksheets/multi-digit-ops` (at 1400, 820 and 390px; in print)
- **Cause:** src/worksheets/generators/math-facts.tsx:221-222 and multi-digit-ops.tsx:376-377 put <span className="problem-number">{i + 1}.</span> at the end of a line, with the operand on the next line. JSX drops whitespace that contains a newline, so no space is rendered between the two. Also: `worksheets.css:87-91`.
- **Fix hint:** Add {' '} after the number span (as other generators do) and give `.answer-list .problem-number` a margin-right.
- **Fixed in the bug-fix session:** `dbe71b6`, *Separate the problem number from the problem in answer keys* (merged in PR #7).

**S9-02** · high · other · recurring — Typing into a builder's number field turns 25 into 60 (every keystroke is clamped)
- **Pages:** `/worksheets/math-facts`, `/worksheets/long-division`, `/worksheets/place-value`, `/worksheets/command-cards`, `/worksheets/decimals` and 3 more (at 1400, 820 and 390px)
- **Cause:** src/worksheets/BuilderPage.tsx:47-57 — a controlled <input type=number value={Number(value)}> whose onChange runs onChange(clamp(Number(e.target.value), field.min, field.max)) on every keystroke. That value is written to the URL (update() :101-106) and re-rendered as the new value. clamp (src/worksheets/params.ts:14-16) rounds, then clamps. Typing '2' becomes min 10; the next '5' makes '105', which becomes max 60.
- **Fix hint:** Keep the raw text in local state while typing and clamp on blur/Enter, with an inline 'between 10 and 60' hint.
- **Fixed in the bug-fix session:** `477ac70`, *Stop worksheet number fields from clamping every keystroke* (merged in PR #7).

**S3-01** · high · other — Choosing 'Hundred chain' crashes the whole page to a blank white screen
- **Pages:** `/materials/bead-chains` (at 1400, 820 and 390px)
- **Cause:** src/materials/bead-chains/LongChain.tsx:37 initializes `range` to [0, 11] regardless of kind. BeadChains.tsx:103 remounts LongChain with key={longKind}, so the Hundred chain (spec.bars = 10, model.ts:145) always first-renders bar indexes 0..11 (LongChain.tsx:124). For k = 10 and 11, `state.placements[k]` is undefined. Also: `LongChain.tsx:188`, `placeValue.ts:158`, `LongChain.tsx:55-56`.
- **Fix hint:** Clamp the initial range to spec.bars-1 (e.g. `[0, Math.min(11, spec.bars-1)]`) and guard with `placed != null`. Add an error boundary around material components.
- **Fixed in the bug-fix session:** `84ff957`, *Fix Hundred chain crash that blanked the whole site* (merged in PR #7).

## PRD 20 candidates: materials on screen

How the virtual materials render and behave inside their stage, plus the walk-through and focus mode. PRD 19 changes only the type inside the stage (the Album's faces and lining figures) and the chrome tokens materials share with the page (paper, card, ink, hairlines, rubric), Steps 6–7; Montessori colours, sizes, layout and behaviour are unchanged, so none of these change. Small reflows from the new faces are expected.

**S2-01+S9-31** · high · material rendering · recurring — Stacked number cards hide the leading digit (3,251 reads as '_251'), including when 'Expand it' asks the child to read it
- **Pages:** `/materials/number-cards`, `/materials/golden-beads`, `/materials/number-cards (Expand it)` (at 1400, 820 and 390px)
- **Cause:** src/components/NumberCard.tsx:34-39 sets width = round(h*0.62*digits) and fontSize = 0.5h, and src/styles/materials.css:122-125 (.number-card inline-flex, justify-content:center) centers the numeral. At h=72, the 3000 card is 179px wide and its 4 Georgia-bold digits (~80-100px) start about 40-50px from the left edge. Also: `number-cards.css:89-93`, `GoldenBeads.tsx:81-102`, `golden-beads.css:63-67`.
- **Fix hint:** Lay the digits out in fixed 0.62h slots aligned to the right edge (per-digit spans or justify-content:flex-end plus a fixed per-digit width) so each card's leading digit falls in its exposed strip.

**S9-01** · high · overflow clipping · recurring — Walkthrough on a phone held sideways: step card covers the mat and its Next/Previous buttons fall off the bottom
- **Pages:** `/materials/golden-beads?present=golden-beads-addition`, `/materials/stamp-game?present=stamp-game-addition` (a phone held sideways (844×390))
- **Cause:** src/styles/presentation.css:10-25 — .presentation-overlay is position:fixed; bottom:0; max-height:45vh (:16); overflow-y:auto (:17). At 390px tall that is about 175px. src/lessons/PresentationOverlay.tsx:30-37 puts .presentation-nav (Prev/Next) inside that same scroll box, after the text, so the buttons scroll away with the content. Also: `presentation.css:80-86`.
- **Fix hint:** Add a height query (max-height:500px): a compact one-line card with the buttons pinned outside the scroll area, or dock the card beside the mat.
- **Note:** PRD 19 re-skins the step card (Step 31) but not its position or behaviour.

**S3-03** · high · material rendering — Bead stair: a too-long bar shrinks to fit a short row instead of sticking out
- **Pages:** `/materials/bead-stair` (at 1400, 820 and 390px)
- **Cause:** src/styles/global.css:19-23 sets `svg { max-width: 100%; display:block }`. In BeadStair.tsx:189-190 the BeadBar SVG (width attribute n*26) sits inside `.bead-stair-slot`, whose content-box width is set inline to row*26. The max-width percentage resolves against that slot width, so a 9-bar on row 3 is clamped to 78px. The fixed height plus the viewBox (preserveAspectRatio meet) then scales all 9 beads down to fit. Also: `bead-stair.css:78-81`, `bead-stair.css:75`.
- **Fix hint:** Add `.bead-stair-slot svg { max-width: none; }` so long bars overhang the outline.

**S4-03** · high · overflow clipping — Checkerboard doesn't fit even on a tablet: multiplier tiles hidden at 820, only the unused columns show at 390
- **Pages:** `/materials/checkerboard` (at 820 and 390px)
- **Cause:** src/materials/checkerboard/checkerboard.css:63-67 `.checkerboard-cell{width:76px;flex:none}`, :49-51 slide slot 54px, :159-161 `.checkerboard-edge-right{width:108px}`, plus 3px gaps, 8px padding and a 6px border. The frame comes to about 904px. Checkerboard.tsx:266 always renders all COLS=9 columns (model.ts:23), and they are reversed (COL_INDEXES), so the units column and the multiplier cards sit at the far right.
- **Fix hint:** Scale cells with a CSS var tied to container width, drop columns higher than the product needs, and/or start scrolled to the units edge (right).

**S4-04** · high · material rendering — Racks & tubes: skittles spill out of their row, and the first dealt beads overlap the skittles' feet
- **Pages:** `/materials/racks-and-tubes` (at 1400, 820 and 390px)
- **Cause:** src/materials/racks-and-tubes/racks-and-tubes.css:164-170 `.racks-and-tubes-board-grid{grid-auto-rows:30px}` has no grid-template-rows, so the skittle row (RacksAndTubes.tsx:88-92) also gets a 30px track. :172-177 `.racks-and-tubes-skittle-cell{height:48px}` then overflows its track by 18px. The first bead row starts at y=32, and its 20px bead centered at about 37-57px overlaps the skittle bottom (4-48px).
- **Fix hint:** Give the skittle row its own track (`grid-template-rows: 48px` then `grid-auto-rows: 30px`), or let rows size to content.

**S2-06** · medium · material rendering · recurring — Unit beads drawn bigger than the beads inside ten-bars and hundred squares
- **Pages:** `/materials/golden-beads`, `/materials/ten-board` (at 1400, 820 and 390px)
- **Cause:** GoldenBeads.tsx:60-64 PIECE_SIZES: bank tenBead 5.2 vs bead 16, mat tenBead 8.6 vs bead 13. BeadBar draws beads at 18/20 of beadSize (beads.tsx:74-97), so ten-bar beads are ~4.7px/7.7px against unit beads of ~14.4px/11.7px. HundredSquare/ThousandCube beads are r=4 per 10 units (≈6.4px at square 80). TenBoard.tsx:230 (bank TenBar 13) vs :240 (Bead 20), :261/265 (mat TenBar 16) vs :282/286 (Bead 20).
- **Fix hint:** Derive the unit Bead size from the same beadSize used by the TenBar/HundredSquare in each context, and use a larger shared scale if tap targets need it.

**S2-09** · medium · line break · recurring — Exchange/Deal buttons wrap mid-phrase and misalign across place columns
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game` (at 1400, 820 and 390px)
- **Cause:** golden-beads.css:167-194: .golden-beads-col-actions is a column stack under a flex:1 pieces area (:138-145), so it is bottom-aligned. Units get 1 button, tens/hundreds 2 and thousands 1 (GoldenBeads.tsx:556-585). .golden-beads-action has 0.8rem text and no nowrap in minmax(150px,1fr) columns (:73). Disabled is opacity .45 on rgba(255,255,255,.92) (:178,191-194). Also: `stamp-game.css:182-208`, `StampGame.tsx:454-467`.
- **Fix hint:** Use a fixed action grid per column (reserve rows even when a button is absent), shorter labels ('10 → 1 thousand' or arrow icons), and a readable disabled style.

**S2-12+S3-15+S4-08** · medium · spacing · recurring — On desktop the material huddles in the top-left corner of a huge, mostly empty mat
- **Pages:** `/materials/stamp-game`, `/materials/bead-frame`, `/materials/number-cards`, `/materials/teen-board`, `/materials/ten-board` and 13 more (at 1400 and 820px)
- **Cause:** materials.css:60-66 makes the stage a full-width block with min-height 320px. Content is fixed/intrinsic width: stamp-game.css:109-124 (width:max-content; 152px columns), bead-frame.css:3-10 (width:max-content), teen-board.css:42-47 (column with align-items:flex-start), and number-cards.css:3-13 (bank columns in a flex-wrap .bank-tray). The Ten Board .ten-board-workmat (ten-board.css:108-116) has min-height 210px.
- **Fix hint:** Size the stage to its material (width:fit-content, centered), or let columns and boards scale to fill (fluid grid, larger piece scale on wide screens).

**S2-16+S3-25+S4-17** · medium · grid layout · recurring — Bead and tile trays wrap into lopsided rows with orphaned last items
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game`, `/materials/number-cards`, `/materials/ten-board`, `/materials/cards-and-counters` and 7 more (at 1400, 820 and 390px)
- **Cause:** materials.css:152-161 .bank-tray is display:flex; flex-wrap:wrap with fixed-size children and no balancing. number-cards.css:3-13 puts four bank columns (≈109/82/55/44px + 1.1rem gaps ≈ 343px) into ~308px at 390, so the units column wraps. cards-and-counters.css:19-30 .cards-and-counters-supply has margin-left:auto + nowrap. Also: `ten-board.css:87-93`, `TeenBoard.tsx:134`, `teen-board.css:22-29`.
- **Fix hint:** Use grid trays with repeat(auto-fit) and balanced columns, keep the place-value bank as one 4-column grid (scale the cards down), and collapse empty trays.
- **Note:** PRD 19 keeps every stage exactly as wide as today at every width (Step 28's 4px phone bleed only offsets the wider 16px gutter), so this tray fix, including the golden-bead bank's one-row fit at 390, is all PRD 20 work.

**S2-24+S4-05** · medium · overflow clipping · recurring — The walkthrough step card covers the material it is presenting, and the page never scrolls the mat into view
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game`, `/lessons/golden-beads-addition → /materials/golden-beads?present=…`, `/materials/stamp-game?present=stamp-game-addition` (at 1400, 820 and 390px)
- **Cause:** presentation.css:10-25 .presentation-overlay is position:fixed; bottom:0; width:min(46rem, 100vw - 1rem); max-height:45vh. At ≤640px it is 100vw wide with max-height 50vh (:80-86). Page-end room comes only from .presentation-spacer at 14rem (:76-78; MaterialPage.tsx:132). The launch buttons are plain .btn in .presentation-launch (MaterialPage.tsx:62-76).
- **Fix hint:** Dock the step card to the side on wide screens, auto-scroll the mat above it, and give the walk-through launcher a distinct, consistent style.
- **Note:** PRD 19 re-skins the step card (Step 31) but not its position or behaviour.

**S3-05+S4-09** · medium · overflow clipping · recurring — Scrolling tile trays cut a row of tiles in half with no sign that they scroll
- **Pages:** `/materials/hundred-board`, `/materials/addition-charts`, `/materials/bead-chains`, `/materials/multiplication-charts` (at 1400, 820 and 390px)
- **Cause:** hundred-board.css:27-35: `.hundred-board-pile { max-height:132px; overflow-y:auto; padding:.2rem; gap:.35rem }` with 48px tiles puts row 3 at about 107–155px, so the box cuts it at 132px. addition-charts.css:104-114: `max-height:9.5rem` (152px border-box, 0.6rem padding) with 44px tiles and a 0.4rem gap cuts row 3 in the same way. bead-chains.css:175-178: `.bead-chains-long-tray { flex-wrap:nowrap; Also: `LongChain.tsx:150-152`.
- **Fix hint:** Size max-height to whole rows (n×(tile+gap)), add a fade/‘more’ affordance, or let the pile grow. Let the long tray wrap and keep the '…more' label on its own line.

**S3-12** · medium · grid layout · recurring — Piece trays end up far from the board at tablet and phone widths
- **Pages:** `/materials/addition-strip-board`, `/materials/bead-stair`, `/materials/snake-game` (at 820 and 390px)
- **Cause:** addition-strip-board.css:188-204: `.addition-strip-board-racks` is flex-wrap with a 1.25rem gap, and each rack is a column of strips sized `calc(var(--asb-rack-unit) * n)` (AdditionStripBoard.tsx:55) with --asb-rack-unit 40px. The 9-strip is 360px plus 1.6rem padding, about 386px per rack. Two racks plus the gap make about 792px, more than the ~756px stage content at 820, so the red rack wraps below. Also: `AdditionStripBoard.tsx:296-299`, `materials.css:152-174`, `BeadStair.tsx:147`, `SnakeGame.tsx:152`.
- **Fix hint:** Scale the rack unit so both racks fit at ≥768px (or put racks beside the board), and at phone widths use a horizontally compact tray.

**S4-07+S3-06+S2-07** · medium · consistency · recurring — Focus mode is neither wordless nor enlarged: a small material in a sea of empty mat
- **Pages:** `/materials/multiplication-charts`, `/materials/multiplication-bead-board`, `/materials/division-board`, `/materials/racks-and-tubes`, `/materials/checkerboard` and 14 more (at 1400, 820 and 390px)
- **Cause:** src/styles/materials.css:209-224 hides only `.material-help` and `.stage-note` in focus mode. Instruction text in material-specific panels is left visible: MultiplicationBeadBoard.tsx:193-212 (.multiplication-bead-board-panel/checklist), racks-and-tubes 'The written record' (RacksAndTubes.tsx:370-371), the division board answer pad, and fraction-circles-panel-hint/name (FractionCircles.tsx:312-393).
- **Fix hint:** Give instruction panels a shared class (e.g. .stage-text) that focus mode hides, trim the controls to Reset/Exit, and center or scale the material to the available space.
- **Note:** PRD 19 Step 28 hides the plate caption in focus mode; making focus mode wordless and enlarged remains.

**S2-04** · medium · material rendering — Teen Board slats squish and the '1' collides with the unit card when beads are laid (phone)
- **Pages:** `/materials/teen-board` (at 390px)
- **Cause:** teen-board.css:49-53 .teen-board-row is a flex row, and .teen-board-slat (:56-68) keeps the default flex-shrink:1. Its explicit min-width:var(--touch-target) (44px) replaces the flex item's automatic min-content minimum, so the slat can shrink well below its ~94px content. At 390 a row with a ten-bar (128px) and a colored bar has ~424px max-content in 334px.
- **Fix hint:** .teen-board-slat{flex:none} and let .teen-board-beads wrap under or beside it with min-width:0.

**S2-05** · medium · material rendering — Ten Board unit card overlaps and clips the tens digit ('7|4')
- **Pages:** `/materials/ten-board` (at 1400, 820 and 390px)
- **Cause:** ten-board.css:68-83 .ten-board-card is absolutely positioned at top:-7px; bottom:-7px; left:-4px; right:-4px inside the inline-block '0' span (TenBoard.tsx:157-160). The '0' span sits flush against the tens-digit span (:156), so left:-4px covers the right 4px of the tens glyph (the top bar of '7'). The 14px of vertical overhang covers the row's inset 3px selection ring (ten-board.css:54-56).
- **Fix hint:** Give the zero a fixed digit-width box and set the card to left:0 with inset:-2px 0, or reuse <NumberCard> as the Teen Board does.

**S2-11** · medium · overflow clipping — Large bead frame: '1,000,000' label jammed against the wooden frame edge
- **Pages:** `/materials/bead-frame` (at 1400, 820 and 390px)
- **Cause:** bead-frame.css:30-40 .bead-frame-label is width:92px with padding-right:10px, a 2px border-right and justify-content:flex-end, in 0.98rem bold Georgia. That leaves ~80px, and '1,000,000' (BeadFrame.tsx:233-235, formatNumber) needs about that, so the leading '1' reaches the left edge. bead-frame.css:13-21 .bead-frame-frame{padding:0.35rem 0; Also: `model.ts:32`, `BeadFrame.tsx:59-63`.
- **Fix hint:** Widen the label column for the large frame (~112px) or step the font down, and remove the frame's vertical padding so the bands meet the wood.

**S2-15** · medium · material rendering — Teen Board bead bars are tiny (12px beads) next to 52px cards
- **Pages:** `/materials/teen-board` (at 1400, 820 and 390px)
- **Cause:** TeenBoard.tsx:151,168,213,223 hard-code beadSize={12}. BeadBar renders beads at 18/20 of beadSize (beads.tsx:79-93), so beads are ~10.8px, next to 52px-tall NumberCards (TeenBoard.tsx:197) and 34px digits (teen-board.css:82). The white 7-bar (--bead-7 #f8f8f2) sits on the rgba(255,255,255,.82) .bank-tray (materials.css:157) with only the thin --bead-outline stroke.
- **Fix hint:** Use ~20-24px beads on the mat (matching the Ten Board's 16-20px), and let the bead area wrap under the slat on narrow screens.

**S3-08** · medium · material rendering — Subtraction strip board: strips and cover drawn as separate tiles, and tray strips at a different scale
- **Pages:** `/materials/subtraction-strip-board` (at 1400, 820 and 390px)
- **Cause:** SubtractionStripBoard.tsx:44-88 draws each board column as its own 44px cell in `.subtraction-strip-board-row { gap:2px }` (subtraction-strip-board.css:23-26). The wood cover is a per-cell class with its own repeating-linear-gradient grain and border (:62-77), and the blue strip is per-cell `.subtraction-strip-board-stripcell` with a white border (:86-92). Also: `SubtractionStripBoard.tsx:278`, `AdditionStripBoard.tsx:260-273`.
- **Fix hint:** Render the laid strip and the cover as single elements spanning their cells. Draw tray strips at board scale (or a clearly proportional one). Use a softer disabled treatment that keeps the numerals legible.

**S3-13** · medium · line break — Subtraction 'ways' record caption squeezed into a narrow, low-contrast column
- **Pages:** `/materials/subtraction-strip-board` (at 1400, 820 and 390px)
- **Cause:** SubtractionStripBoard.tsx:315-326 puts the instruction in `<caption>` of `table.subtraction-strip-board-record`. The CSS table wrapper sizes the caption to the table's width, and the table shrinks to its content (a short column of 'a − b = c' lines), because the parent `.subtraction-strip-board-stage` is a flex column with align-items:flex-start (subtraction-strip-board.css:3-8).
- **Fix hint:** Move the caption out of the table (or give the table/caption a min-width) and place it inside the white record card.

**S4-06** · medium · material rendering — Checkerboard bead bars are far too small to count
- **Pages:** `/materials/checkerboard` (at 1400, 820 and 390px)
- **Cause:** src/materials/checkerboard/Checkerboard.tsx:167 `<BeadBar n={n} beadSize={7} />`. BeadBar (beads.tsx:74-80) scales a 20-unit viewBox, so each bead is 7px. The outline stroke (beads.tsx:36, r*0.09≈0.81 units) shrinks to about 0.28px, so the --bead-outline rim that keeps the white 7-bar visible disappears on the pastel color-mix squares (checkerboard.css:78-88).
- **Fix hint:** Size beads relative to the cell (~12-14px), stack bars vertically, and outline light beads (7=white) so they read on pastel squares.

**S4-11** · medium · grid layout — Decimal board columns change width as pieces are added, so the board jumps around
- **Pages:** `/materials/decimal-board` (at 1400 and 820px)
- **Cause:** src/materials/decimal-board/decimal-board.css:29-33 `.decimal-board-columns{display:flex}` with :35-45 `.decimal-board-col{min-width:104px}` and no flex-basis or grow. Each column's basis is max-content, and .decimal-board-pieces (:96-104, flex-wrap) has a max-content width of all its pieces on one line, so columns widen with the piece count.
- **Fix hint:** Use `grid-template-columns: repeat(4, 1fr)` (plus the point gutter) so columns are equal and fixed; wrap pieces inside.

**S9-14** · medium · material rendering — Golden bead columns grow without limit: the mat reaches 1,871px and the exchange buttons are two screens below the bank
- **Pages:** `/materials/golden-beads (Multiplication, Subtraction)` (at 1400 and 820px)
- **Cause:** src/materials/golden-beads/golden-beads.css:138-145 — .golden-beads-pieces is flex-wrap with no overlap, cap or compression. Each piece is a ≥44px button (:147-159), so a narrow column wraps into many rows. .golden-beads-col-actions (:167-172; rendered after pieces at GoldenBeads.tsx:555) sit below the pile, so the exchange buttons move down as the pile grows.
- **Fix hint:** Stack pieces with overlap past about 9 (like a real pile), or cap the column height with a count badge. Put the exchange buttons at the top of each column, beside the count.

**S9-15** · medium · consistency — Golden bead Multiplication piles every addend into one heap, then asks the child to 'Combine the layouts'
- **Pages:** `/materials/golden-beads (Multiplication)`, `/materials/stamp-game (Multiplication)` (at 1400, 820 and 390px)
- **Cause:** src/materials/golden-beads/model.ts:191-192 — layoutTarget('multiplication') = scaleCounts(countsFromNumber(x), step+1), checked against the single shared mat. GoldenBeads.tsx:380-381 prompts 'Lay out … time k of y' into that mat, and :392-393 then says 'Combine the layouts'.
- **Fix hint:** Render each layout as its own band, as the stamp game does, and animate the combine step. Clear the old feedback when the step changes.

**S3-09+S4-10** · low · other · recurring — The 'wrong tile' mark ✗ glued to a number reads as a times sign ('5×')
- **Pages:** `/materials/addition-charts`, `/materials/multiplication-charts`, `/materials/multiplication-bead-board` (at 1400, 820 and 390px)
- **Cause:** src/materials/addition-charts/AdditionCharts.tsx:151-155 renders `{tile}{wrong && <span aria-hidden="true"> ✗</span>}` inline inside the centered flex cell. The glyph therefore sits right after the numeral in the same font-body run (addition-charts.css:21-35) and pushes the numeral off center. The only other wrong-state styling is the dashed outline at addition-charts.css:98-101. Also: `hundred-board.css:132-154`.
- **Fix hint:** Use the shared corner-badge treatment (like .hundred-board-mark), or rely on the dashed outline alone, and keep the numeral centered.

**S3-20+S4-18+S2-13** · low · consistency · recurring — Sibling materials use different button styles, components and placements for the same jobs
- **Pages:** `/materials/bead-chains`, `/materials/subtraction-strip-board`, `/materials/addition-charts`, `/materials/multiplication-bead-board`, `/materials/multiplication-charts` and 11 more (at 1400, 820 and 390px)
- **Cause:** global.css:191-205 `.btn` has 0.5rem/1.1rem padding and inherits 16px. bead-chains.css:3-14 `.bead-chains-btn` has 0.4rem/0.9rem. subtraction-strip-board.css:163-174 has 0.4rem/1rem. addition-charts.css:141-154 has 0.45rem/0.9rem at 0.95rem. MaterialShell's Sound and Focus buttons use `.btn` (MaterialShell.tsx:44, :56), so both styles share one row. Also: `materials.css:51-58`, `SnakeGame.tsx:108`, `BeadStair.tsx:112`.
- **Fix hint:** Use the shared .btn / .btn.primary everywhere and give selects the same font size.

**S4-19** · low · typography · recurring — Labels on the materials are tiny and low in contrast
- **Pages:** `/materials/checkerboard`, `/materials/multiplication-bead-board`, `/materials/division-board`, `/materials/fraction-circles` (at 1400, 820 and 390px)
- **Cause:** checkerboard.css:99-107 (.checkerboard-cell-value 0.62rem, rgba(0,0,0,.55) on pastel) and :120-128 (.checkerboard-edge-bottom 0.68rem). multiplication-bead-board.css:106-115 (count label 12px in a 396-unit viewBox that renders at 300px, see S4-08, so about 9px) and :34-40 (slot label 0.72rem). division-board.css:80-85 `.division-board-slot-empty{border:2px dashed var(--line)}` is #e4ddcc on the white board (--card).
- **Fix hint:** Set a minimum on-material label size (~12-13px rendered), use darker ink on pastels, and give the slot targets a solid outline.
- **Note:** PRD 19 sets these labels in MM Sans (Step 7) but doesn't change their size or contrast (PRD 19, open question 22).

**S4-20** · low · typography · recurring — Monospace 'code' font used for written records
- **Pages:** `/materials/multiplication-bead-board`, `/materials/racks-and-tubes`, `/materials/decimal-board` (at 1400, 820 and 390px)
- **Cause:** --font-mono (tokens.css:73) is used at multiplication-bead-board.css:227 (record list), racks-and-tubes.css:225-230 (.racks-and-tubes-paper-sheet) and decimal-board.css:160-167 (.decimal-board-value).
- **Fix hint:** Use the body/numeral face with tabular-nums for aligned columns; keep mono out of child-facing UI.
- **Note:** PRD 19 leaves `--font-mono` unchanged: racks and tubes lines up its record by character (PRD 19, open question 23).

**S9-22** · low · color contrast · recurring — Keyboard focus ring almost invisible on the felt and wood mats; walkthrough never takes focus
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game`, `all felt/wood materials`, `/materials/golden-beads?present=golden-beads-addition` (at 1400, 820 and 390px)
- **Cause:** src/styles/global.css:55-58 — :focus-visible { outline: 3px solid var(--focus) } with --focus:#1e6bb8 (src/styles/tokens.css:53). Computed contrast ≈1.15:1 against --felt #3f6b4f and ≈1.69:1 against --wood #b58863 (the mat patterns are at materials.css:68-80). src/lessons/PresentationOverlay.tsx:16 is role='region' with no focus management and no Escape handler. Also: `MaterialPage.tsx:42-45`.
- **Fix hint:** Inside .material-stage use a two-tone ring (2px white inside a 2px near-black). Move focus to the step card on open, and close it on Esc.
- **Note:** It is focus styling on the mat, not type or labels, so it stays with PRD 20 (PRD 19, open question 24).

**S2-14** · low · consistency — Teen Board and Ten Board render the Seguin board differently; teen '10' reads as '1 0'
- **Pages:** `/materials/teen-board`, `/materials/ten-board` (at 1400, 820 and 390px)
- **Cause:** teen-board.css:42-47 (.teen-board-rows column, gap 4px) and :56-68 (a separate .teen-board-slat button per row, TeenBoard.tsx:183-201) draw nine loose tiles. :74-85 .teen-board-digit is a fixed 32px box around a ~20px glyph, with the slat gap:4px (:59), so the '1' and '0' sit ~16px apart. Also: `ten-board.css:12-44`, `TenBoard.tsx:155-161`, `TeenBoard.tsx:197`, `ten-board.css:68-83`.
- **Fix hint:** Share one Seguin board component (wood panels, white slot, tight '10' kerning) between both materials.

**S2-17** · low · color contrast — Green place markers and green skittles nearly vanish on the green felt
- **Pages:** `/materials/golden-beads` (at 1400, 820 and 390px)
- **Cause:** golden-beads.css:104-110 .golden-beads-dot is 0.85rem with a 1px white border. Its background is placeInfo(p).colorVar (GoldenBeads.tsx:529), and for units/thousands that is --pv-unit #2e8b57 on --felt #3f6b4f. The skittle's green does not come from the row style. Also: `GoldenBeads.tsx:599`, `beads.tsx:175`, `golden-beads.css:209-217`.
- **Fix hint:** Put the dot or skittle on a light chip (white circle behind it) or use a thicker light outline.

**S2-19** · low · spacing — Teen Board instruction sits cramped under the last slat
- **Pages:** `/materials/teen-board` (at 1400, 820 and 390px)
- **Cause:** TeenBoard.tsx:251 <p className="stage-note"> follows .teen-board-rows directly. global.css:39-41 gives p only a bottom margin, and .stage-note (materials.css:180-185) adds no top spacing, while the tray above has margin-bottom:0.9rem (materials.css:160).
- **Fix hint:** Add margin-top: 0.9rem to the note, or move it above the board as on the other materials.

**S2-21** · low · spacing — Stamp Game feedback appears far from the button and shifts the layout
- **Pages:** `/materials/stamp-game` (at 1400, 820 and 390px)
- **Cause:** StampGame.tsx:583-585 renders .stamp-game-message-wrap right after the bank tray, far above the actions. The two separate .stamp-game-actions blocks are at StampGame.tsx:606-610 (Combine, primary) and :657-667 (Check my work, plain btn). The message 'Slide the rows together first — tap Combine.' is set at :402. Also: `stamp-game.css:74-83`.
- **Fix hint:** Render the message next to the actions row (like Golden Beads' status chip) and merge the two action rows.

**S2-22** · low · color contrast — Stamp Game problem statement is white text directly on light wood
- **Pages:** `/materials/stamp-game` (at 1400, 820 and 390px)
- **Cause:** stamp-game.css:3-16 .stamp-game-problem is color:var(--card) (#fff) with text-shadow 0 1px 3px rgba(0,0,0,.45), rendered straight on .mat-wood (materials.css:76-82, planks #b0835e-#c19467). Golden Beads uses the rgba(255,255,255,.92) .golden-beads-problem panel (golden-beads.css:33-49) and Bead Frame uses .bead-frame-banner (bead-frame.css:179-193).
- **Fix hint:** Use the shared white problem-banner panel with ink text.

**S3-10** · low · color contrast — Addition charts: chosen headers show no selected state, the row/column highlight is barely visible, and the '+' corner is invisible
- **Pages:** `/materials/addition-charts` (at 1400, 820 and 390px)
- **Cause:** addition-charts.css:47-70: `.addition-charts-header` has no `[aria-pressed="true"]` rule, although AdditionCharts.tsx:85 and :97 set aria-pressed. :89-91 `.addition-charts-cell.hi { background: var(--paper-warm) }` (#f3ecdd against #fff cells). :72-83 `.addition-charts-corner { background:transparent; color:#fff }`. Also: `AdditionCharts.tsx:77`.
- **Fix hint:** Add a strong pressed state for headers (darker red plus ring), use a clearly tinted highlight (e.g. light gold), and color the '+' in ink.

**S3-14** · low · material rendering — Long-chain beads are only 12px, too small to count, with a tiny hundred square and no label
- **Pages:** `/materials/bead-chains` (at 1400, 820 and 390px)
- **Cause:** LongChain.tsx:179 `<TenBar beadSize={12}>` (120px bar) and :199 `<HundredSquare size={40}>`. The milestone slot is larger (bead-chains.css:226-230, min 58×54px). The track is fixed at 130px tall (:204-207) with 120px segments (:209-217). Check badges use `.bead-chains-mark { top:-0.65rem; right:-0.65rem }` (:140-155) while the slot sits only 6px below the 12px bar (:216), so the badge overlaps the beads.
- **Fix hint:** Raise bead size to about 18–20px (widen BAR_WIDTH accordingly) and scale the hundred square to the bar length so the fold reads as a square.

**S3-17** · low · consistency — Addition strip board Practice mode: the number row turns into beveled browser-default buttons
- **Pages:** `/materials/addition-strip-board` (at 1400, 820 and 390px)
- **Cause:** addition-strip-board.css:24-28 sets only border-right, and :35-49 sets only border-bottom on `.addition-strip-board-head`. In Practice mode the header becomes a `<button>` (AdditionStripBoard.tsx:225-241), and `button.addition-strip-board-head` (:59-61) never resets `border`, so the UA's 2px outset button border stays on the top and left.
- **Fix hint:** Add `border:0; border-right:1px solid var(--line); border-bottom:2px solid var(--wood)` to button.addition-strip-board-head.

**S3-18** · low · alignment — Check badges collide with neighbors; the 'missed' badge is an almost invisible dot
- **Pages:** `/materials/bead-chains`, `/materials/hundred-board` (at 1400, 820 and 390px)
- **Cause:** bead-chains.css:140-155 `.bead-chains-mark { position:absolute; top:-0.65rem; right:-0.65rem }` lifts the badge about 10px above the slot, which sits only 5–6px below its bar (bead-chains.css:86, :216), so the badge overlaps the beads. hundred-board.css:132-146 `.hundred-board-mark { top:-7px; right:-7px; width:20px }` in a 4px grid gap (:77) protrudes 3px into the neighboring cell. Also: `HundredBoard.tsx:217`.
- **Fix hint:** Keep badges inside the slot/cell bounds and use a legible glyph (e.g. '?' or an empty ring) for 'missed'.

**S3-21** · low · spacing — Check results appear below the 10×10 board, off-screen from the Check button
- **Pages:** `/materials/hundred-board` (at 1400, 820 and 390px)
- **Cause:** HundredBoard.tsx:249-276: the completion message, Check result and skip-mode messages, and the skip-mode instruction `.stage-note`, all render after `.hundred-board-grid` (:188-247) inside the column-flex `.hundred-board-layout` (hundred-board.css:3-7). They therefore appear under the roughly 540px-tall board.
- **Fix hint:** Put the status/message line above the board next to the tray (a single status slot, as the strip boards do).

**S4-16** · low · color contrast — Multiplication chart 'two fingers' highlight is barely visible
- **Pages:** `/materials/multiplication-charts` (at 1400, 820 and 390px)
- **Cause:** src/materials/multiplication-charts/multiplication-charts.css:93-95 `.multiplication-charts-cell.hi{background:var(--paper-warm)}` uses the same token as every header (:60) and the corner (:82). No CSS targets the header buttons' aria-pressed state (MultiplicationCharts.tsx:101), so the chosen headers look like the others. Only `.meet` (:97-100) adds an outline. Also: `materials.css:180-185`.
- **Fix hint:** Give selected headers and path cells a distinct tint and border (not color alone), and add 0.5rem above the stage note.

**S4-22** · low · other — Walkthrough ends on a disabled 'Next'; page state contradicts the walkthrough
- **Pages:** `/materials/golden-beads (presentation)`, `/materials/stamp-game?present=stamp-game-addition` (at 1400 and 390px)
- **Cause:** src/lessons/PresentationOverlay.tsx:34 `disabled={stepIndex === steps.length - 1}` on Next, and there is no Done button. MaterialPage.tsx:62-76 keeps the launch buttons visible (with aria-pressed) while presenting.
- **Fix hint:** Replace Next with a 'Done' on the last step, and hide or disable the launch button and mode select while presenting.

**S4-23** · low · overflow clipping — Golden bead column headers collide on a phone during the walkthrough
- **Pages:** `/materials/golden-beads (presentation)` (at 390px)
- **Cause:** src/materials/golden-beads/golden-beads.css:89-97 `.golden-beads-col-head{display:flex}` has no wrap and no min-width:0 on its children. The dot, the name, the ✓ mark (:120-126, 0.5rem side padding) and the count pill (:112-118, margin-left:auto) need about 175px. At phone width, `.golden-beads-mat{min-width:640px}` (:71-77) pins each column at about 153px, so the pill overflows into the next column.
- **Fix hint:** Allow the head to wrap or move the ✓ and count pills to a second line on narrow columns.

**S4-26** · low · alignment — Bead board layout moves between modes and the card slot separates from the board on a phone
- **Pages:** `/materials/multiplication-bead-board` (at 1400 and 390px)
- **Cause:** multiplication-bead-board.css:3-20: .layout and .boardrow are both flex-wrap. The record card (:208-214, flex 0 1 13rem) renders only in table mode (MultiplicationBeadBoard.tsx:303), and the practice panel (:166-172, max-width 30rem) only in practice mode (:192), so the main column's width changes with the mode.
- **Fix hint:** Use a stable two-zone layout (board + slot fixed together; a side column for the problem/record that stacks below on phones).

**S9-12** · low · material rendering — Exchange 'ceremony' flies to empty bank space, often off-screen, while the count badge shows the old number
- **Pages:** `/materials/golden-beads` (at 1400 and 390px)
- **Cause:** src/lib/ceremony.ts:126-128 — bankPoint = centerWithin(bankEl) is the centre of the whole bank element (GoldenBeads.tsx:238 '.golden-beads-bank'), not the matching bank piece. There is no scrollIntoView anywhere. The stage scrolls horizontally (materials.css:64 overflow-x:auto), so the stage-local bank centre can sit outside the visible scroll window.
- **Fix hint:** Fly to and from the matching bank piece. Scroll bank and column into view first, or keep the flight inside the visible viewport. Update the count badge as pieces leave.

**S9-13** · low · material rendering — Ceremony highlight rings overlap each other, cover the count badge, and ghosts cross the problem text
- **Pages:** `/materials/golden-beads` (at 1400 and 390px)
- **Cause:** src/styles/materials.css:245-249 — .ceremony-source uses outline 3px rgba(255,255,255,.9) with outline-offset 2px on each piece, and pieces are ≥44px hit-target buttons around small art. src/lib/ceremony.ts:136-140 clones the source (el.cloneNode) before removing 'ceremony-source' from the original, so every ghost keeps the outline. .ceremony-ghost has z-index:30 (materials.css:237-243) and paints over in-stage text.
- **Fix hint:** Draw one bracket or halo around the group of 10, or use a tighter ring (offset 0, 2px). Drop the outline on ghosts and keep them below the prompt card.

**S9-16** · low · consistency — Golden bead Subtraction: taken-away beads vanish, and Check tells the child to undo their borrow
- **Pages:** `/materials/golden-beads (Subtraction)` (at 1400, 820 and 390px)
- **Cause:** src/materials/golden-beads/model.ts:148 EXCHANGE_FIRST_MESSAGE is returned by runCheck for every op mode when checkAgainstNumber finds any column ≥10 (GoldenBeads.tsx:357-362), subtraction included. handleMatPiece (:208-214) just calls removePiece, sending the piece back to the bank. No taken-away region exists in GoldenBeads.tsx (no 'taken' state).
- **Fix hint:** Add a 'taken away' strip under the mat. In subtraction, answer the over-10 case with 'Finish taking away 4,976 first'.

**S9-17** · low · other — Stamp Game Subtraction accepts the wrong starting number ('I built it' skips any check)
- **Pages:** `/materials/stamp-game (Subtraction)` (at 1400 and 390px)
- **Cause:** src/materials/stamp-game/StampGame.tsx:374-381 — onStartTaking only rejects an empty mat (regionValue(mat)===0), then setTaking(true), with no comparison to problem.a. The button is at :657-661. The actions div (:655-667) renders after the 'Taken away' region (:629-637), so once taking starts the tray appears above Check my work and pushes it down.
- **Fix hint:** Run the column check before 'start taking away' and show ✗ on the columns that don't match, as golden beads does.

**S9-19** · low · alignment — Decimal Board Subtract: the two boards' columns don't line up, and the decimal point floats at the bottom
- **Pages:** `/materials/decimal-board (Subtract, Make the number)` (at 1400px)
- **Cause:** src/materials/decimal-board/decimal-board.css:29-49 — .decimal-board-col is a content-sized flex item with only min-width 104px (96px compact). Its inner .decimal-board-pieces is flex-wrap (:95-103), so column width follows piece count up to the available width, and the compact taken-away board uses different widths. Also: `DecimalBoard.tsx:66-68`.
- **Fix hint:** Use one fixed grid of equal column widths shared by both boards, and centre the point on the count row.

**S9-20** · low · consistency — Reset during a walkthrough empties the mat while the step card keeps describing beads
- **Pages:** `/materials/golden-beads?present=golden-beads-addition` (at 1400 and 820px)
- **Cause:** src/materials/golden-beads/GoldenBeads.tsx:120-150 — the demo effect runs only when `demo` changes, and the scripted view lives in a ref. Reset (resetWork :174-179, button :479) clears mat state without touching the ref or stepIndex, so the card and mat disagree until the next Prev or Next re-applies the ref view. closeDemo (MaterialPage.tsx:47-50) clears only the URL.
- **Fix hint:** When a walkthrough is open, make Reset restart it at step 1 (or close it). Offer 'keep these beads / clear' on Close.

**S9-21** · low · overflow clipping — Pressing Focus during a walkthrough hides the step card; on short screens focus mode squeezes the mat into an inner scroll
- **Pages:** `/materials/golden-beads?present=golden-beads-addition` (at 1400px; a phone held sideways (844×390))
- **Cause:** src/styles/materials.css:197-207 — .material-shell.focus-mode is position:fixed; inset:0; z-index:100. The overlay is rendered by MaterialPage.tsx:130-141 outside the shell, with z-index:50 (src/styles/presentation.css:24), so the focus layer covers it. Also: `materials.css:217-220`.
- **Fix hint:** Raise the overlay above the focus shell (or dock it inside it), and let the focus shell scroll as a whole on short viewports.
- **Note:** PRD 19 re-skins the step card (Step 31) but not its behaviour in focus mode.

**S9-32** · low · consistency — Bead frame Subtraction: four identical 'Exchange' buttons and a ragged column of remaining-amount pills
- **Pages:** `/materials/bead-frame (Subtraction, small and large)` (at 1400px)
- **Cause:** src/materials/bead-frame/BeadFrame.tsx:282-289 — every row's button is labelled just 'Exchange', with no direction or amount.
- **Fix hint:** Label the button '1 ten → 10 units' (or 'Borrow'), and keep a fixed-width pill slot (empty or '−0') on every row.

## PRD 20 candidates: printables and print content

What the worksheets, kits, planner, control charts and printed guides put on paper. PRD 19 changes only the type and chrome tokens on printable sheets (the Album's faces, lining figures, ink and hairlines, Steps 6–7), so none of these is resolved. When PRD 19 is complete the owner reviews every printable and makes a list of changes; these candidates are there to draw on.

**S6-01+S7-01** · high · print · recurring — Worksheet-specific CSS silently loses to the shared worksheet CSS: write-on blanks shrink to about 0.25in and answer keys squeeze into 4 columns
- **Pages:** `/worksheets/decimals`, `/worksheets/long-division`, `/worksheets/golden-bead-pictures`, `/worksheets/multi-digit-ops`, `/worksheets/place-value` and 3 more (at 1400, 820 and 390px; in print)
- **Cause:** src/main.tsx:4 imports App before the global stylesheets at lines 5-13. App pulls in BuilderPage, then worksheets/registry.ts, then every generator and its .css, all statically. So in the built bundle (dist/assets/index-BntycH9s.css) every generator's CSS comes first (numeral-tracing at offset 0 through command-cards at 9364), then tokens, print.css (18064) and worksheets.css (25381). Also: `worksheets.css:131-137`, `decimals.css:15-25`, `long-division.css:49-51`, `golden-bead-pictures.css:30-32`, `worksheets.css:94-100`, `multi-digit-ops.css:3-6`, `worksheets.css:112-115`, `multi-digit-ops.css:9-11`….
- **Fix hint:** Move `import App` below the global style imports in main.tsx (or double the class, e.g. .write-line.decimals-line-long), then re-check every generator.
- **Note:** PRD 19 keeps the existing stylesheet import order (its convention 9), so this stays exactly as it is until PRD 20.

**S6-03+S7-07** · high · material rendering · recurring — Golden bead pictures draw a ten bar bigger than a hundred square and a thousand cube
- **Pages:** `/worksheets/golden-bead-pictures` (at 1400, 820 and 390px; in print)
- **Cause:** src/worksheets/generators/golden-bead-pictures.tsx:126-131 sizes each piece independently. The ThousandCube is 40px wide, and its bead face is only 100/124 × 40 ≈ 32px. The HundredSquare is 34px, so each of its beads sits on a 3.4px pitch. The TenBar is vertical at beadSize 7, and BeadBar (components/beads.tsx:79-80) computes height = 7/20 × 200 = 70px. A loose Bead is 7px. Also: `golden-bead-pictures.css:10-16`.
- **Fix hint:** Derive every size from one bead unit (ten-bar length = hundred-square side ≈ cube face) and keep a quantity on one row with nowrap.

**S7-03** · high · print — Skip-counting 'All the tables' student page is 1149px tall and spills onto a second Letter page
- **Pages:** `/worksheets/skip-counting?preset=all-the-tables` (in print)
- **Cause:** src/worksheets/generators/skip-counting.tsx:105-106: pageCapacity returns 9 for mode 'table', and skip-counting.test.ts:159-161 locks that value in. Estimated height of one row: label about 21px + 0.07in margin + table (th 0.26in + td 0.38in + borders, skip-counting.css:90,94) + 0.28in gap (css:8), about 118px. Nine rows plus the sheet header and instructions come to about 1,150px against 960px of printable height. Also: `print.css:77`.
- **Fix hint:** Cap table mode at 7 per page (or shrink table rows) so a page is 960px or less.

**S7-04** · high · material rendering — Large number cards can't be layered: stacking 1000+300+20+7 hides the 1 and cuts the 3 in half
- **Pages:** `/kits/large-number-cards` (at 1400, 820 and 390px; in print)
- **Cause:** src/kits/kits.css:12-13: .kit-number-card is display:flex; justify-content:center with a 1in font, while large-number-cards.tsx:28-30 and :55 set the card width to 1.5in per digit. Each numeral is centered as a block rather than one digit per 1.5in column. With a digit about 0.6em (about 58px) wide, the k-th digit from the right of an n-digit card sits at 0.75n in - (n x 58px)/2 + 58px(k - 0.5).
- **Fix hint:** Render each digit in its own fixed 1.5in-wide centered cell so the k-th digit from the right always sits in the same column.

**S1-03+S7-08** · medium · print · recurring — The printed weekly plan spills past one Letter page with only 10 items (the footnote lands alone on page 2)
- **Pages:** `/planner (print)`, `/planner (print of a 10-item plan)` (in print)
- **Cause:** src/styles/planner.css:26 `.plan-table td { padding: 0.14in 0.1in }` gives every row ~53px (13.44px x2 + 24.8px line + 1px rule). ParentPlanPage (src/planner/PlannerPage.tsx:81-123) is one unchunked .sheet-page, while chunkJournal (state.ts:101) only paginates the journal. Also: `print.css:7-10`, `print.css:54-56`, `planner.css:27`.
- **Fix hint:** Tighten row/day-heading padding (~0.08in, compact day header rows) and chunk the plan table across pages like the journal.

**S6-05+S7-15** · medium · material rendering · recurring — 'Ink-friendly' B&W turns bead pictures into solid black discs you can't count, using more ink than color
- **Pages:** `/worksheets/golden-bead-pictures`, `/worksheets/teens-tens`, `/worksheets/command-cards`, `/kits/golden-bead-cards?bw=1`, `/worksheets/golden-bead-pictures?bw=1` and 3 more (at 1400, 820 and 390px; in print)
- **Cause:** print.css:120-143 (.print-sheet.bw) sets --golden:#000, --golden-dark:#000, --golden-light:#fff and --bead-1…10:#000. components/beads.tsx:52/56 (Bead), :91/93 (BeadBar), :121 (HundredSquare circles) and :156 (ThousandCube circles) fill with var(--golden) or var(--bead-n). The stroke is --bead-outline, a 55% black that --bw does not override, so black fill plus dark stroke leaves no separation.
- **Fix hint:** In .bw draw beads as white fill with a black stroke (outline) and keep a visible gap or rail between bars.

**S6-06** · medium · material rendering · recurring — Ten bars packed 2–3px apart read as a solid block even in colour
- **Pages:** `/worksheets/teens-tens`, `/worksheets/golden-bead-pictures` (at 1400, 820 and 390px; in print)
- **Cause:** teens-tens.css:3-8 (.teens-tens-picture gap:3px) with TenBar vertical beadSize 11 (teens-tens.tsx:229-238), so the gap is about 0.27 of a bead diameter. golden-bead-pictures.css:19-24 (.golden-bead-pictures-group gap:2px) with beadSize 7 bars. Bars have no rail or outline of their own, only a 1.5-unit gray wire (--bead-wire) hidden under the beads.
- **Fix hint:** Gap of at least one bead diameter between bars (or group in fives), and a thin rail/outline on each bar.

**S6-07+S7-11** · medium · line break · recurring — Printed sheet titles wrap and widow because the Name/Date blanks take most of the header
- **Pages:** `/worksheets/place-value`, `/worksheets/skip-counting`, `/worksheets/math-facts`, `/worksheets/teens-tens`, `/worksheets/place-value?preset=digit-detective` and 1 more (at 1400, 820 and 390px; in print)
- **Cause:** SheetPage.tsx:19-26 puts the h2.sheet-title and the .name-date block in a single header. print.css:88-96 makes .sheet-header display:flex with justify-content:space-between. print.css:105-108 sets .name-date white-space:nowrap, and worksheets.css:62-72 gives its blanks fixed widths of 2.6in and 1.2in. Also: `teens-tens.tsx:309`, `command-cards.tsx:496`.
- **Fix hint:** Put Name/Date on its own row under the title (or let the blanks flex-shrink), and keep '(page 1 of 2)' as a separate nowrap span.

**S6-08+S7-27** · medium · table · recurring — Answer keys are squeezed into 4 narrow columns with mid-expression breaks
- **Pages:** `/worksheets/decimals`, `/worksheets/place-value`, `/worksheets/skip-counting`, `/worksheets/fractions`, `/worksheets/numeral-tracing` (at 1400, 820 and 390px; in print)
- **Cause:** This is the same cascade bug as S6-01. worksheets.css:118-124 `.answer-list{columns:4}` comes after the single-class overrides decimals.css:57-59 (.decimals-key columns:2), place-value.css:38-40 (.place-value-key columns:2), skip-counting.css:99-101 (.skip-counting-key columns:2) and fractions.css:83-85 (.fractions-key columns:3), and it wins. Also: `numeral-tracing.tsx:168`, `decimals.tsx:417-425`, `decimals.css:3-6`, `decimals.tsx:526`.
- **Fix hint:** Fix the import order, give prose/sequence keys 2 columns or a table layout, and use inherit font-size for numbers inside keys.

**S6-09+S7-09** · medium · print · recurring — Half-empty worksheet pages: problems crammed at the top, 40–75% of the Letter page blank
- **Pages:** `/worksheets/multi-digit-ops`, `/worksheets/math-facts`, `/worksheets/fractions`, `/worksheets/decimals`, `/worksheets/teens-tens` and 11 more (at 1400, 820 and 390px; in print)
- **Cause:** The per-page counts are fixed and defaults sit below them. multi-digit-ops.tsx:272-273 sets PROBLEMS_PER_PAGE 12 and GRID_COLS 3, but the default count is 9 (:427), giving 3 rows. golden-bead-pictures.tsx:106 uses perPage 4 at 9,999, so the default of 6 needs 2 pages. long-division.tsx:180 uses perPage 4 for recording with a default count of 6, leaving 2 problems on page 2. Also: `long-multiplication.tsx:193-196`, `teens-tens.tsx:146-151`, `worksheets.css:75-79`, `skip-counting.css:46-57`.
- **Fix hint:** Stretch rows to fill the page (grid-auto-rows:1fr inside a fixed-height page body) or raise default counts so one page is full.

**S6-10+S7-10** · medium · print · recurring — Long multiplication says 'Show your work' but leaves no room for it
- **Pages:** `/worksheets/long-multiplication`, `/worksheets/long-multiplication?preset=toward-abstraction` (at 1400, 820 and 390px; in print)
- **Cause:** long-multiplication.tsx:193-196: pageShape returns {perPage:10, cols:3} when unscaffolded. ProblemBlock (:182-184) then renders only a single `.op-answer-space` (worksheets.css:112-115, min-height:1.5em, about 0.27in at 1.1rem), while the instruction at :203-205 reads 'Multiply. Show your work.' The 'toward-abstraction' preset is 4-digit × 2-digit, count 8, scaffold false.
- **Fix hint:** When unscaffolded use 2 columns and reserve ~1.3–1.6in of ruled work space per problem.

**S7-12** · medium · spacing · recurring — Default answer blanks are too short for a child's handwriting
- **Pages:** `/worksheets/math-facts`, `/worksheets/teens-tens?preset=counting-runs`, `/worksheets/long-division?preset=first-long-division`, `/worksheets/decimals` (in print)
- **Cause:** src/styles/worksheets.css:131-137: .write-line has min-width 1.6em, about 0.28in at the 1.05rem .problem size. math-facts.tsx:152-154 (Slot) uses plain .write-line. teens-tens.css:41-43 sets seq blanks to 1.8em. The wider blanks that exist (decimals-line-*, golden-bead-pictures-line, and long-division-answer-line 0.9in at long-division.css:49-51) never apply because of the cascade bug in S7-01.
- **Fix hint:** Make the default blank at least 0.75in (or size it by expected answer digits × 0.3in).

**S7-14** · medium · color contrast · recurring — Hundred board and strip-board grid lines are nearly invisible on paper (and stay beige/brown in B&W)
- **Pages:** `/kits/hundred-board-tiles`, `/kits/strip-boards` (in print)
- **Cause:** src/kits/kits.css:21 (.kit-board-cell border 1px var(--line)), :22 (.kit-board border 2px var(--wood-dark)), :33-34 (.kit-board-head and .kit-board-square borders var(--line)). --line is #e4ddcc (tokens.css:50), about 1.35:1 against white, and --wood-dark is #8a623f (tokens.css:48). Also: `print.css:120-147`.
- **Fix hint:** Use a mid-gray (#888 or darker) grid for printed boards, and map --line/--wood-dark to black/gray in .bw.

**S9-10** · medium · print · recurring — At maximum counts, fixed page chunks leave a mostly blank last page, and the preview hides the overflow
- **Pages:** `/worksheets/place-value (count 20)`, `/worksheets/golden-bead-pictures (draw, 9)`, `/worksheets/long-division (recording, 10)`, `/worksheets/fractions (add, 12)`, `/worksheets/long-multiplication (10)` and 2 more (in print)
- **Cause:** Fixed per-page chunking in each generator: place-value.tsx:120 PER_PAGE=16; golden-bead-pictures.tsx:106 perPage 4 (max 9999) / 6; long-division.tsx:180 recording 4 / 6; fractions.tsx:299-300 8 or 12; long-multiplication.tsx:193-195 6 (scaffold) / 10; numeral-tracing.tsx:50,69 floor(10/rowsPerNumeral) → 3 numerals at 3 rows, so pages 0-2, 3-5, 6-8, 9; Also: `skip-counting.tsx:105-109`, `src/styles/print.css:77-85`.
- **Fix hint:** Spread problems evenly across ceil(count/perPage) pages and scale boxes to fill them. Flag any .sheet-page over 10in in the preview with a red page-break line.

**S6-11** · medium · print — Draw-the-beads boxes too small for the quantity asked
- **Pages:** `/worksheets/golden-bead-pictures`, `/worksheets/teens-tens` (at 1400, 820 and 390px; in print)
- **Cause:** golden-bead-pictures.css:41-45 sets .golden-bead-pictures-drawbox to height:1.15in in a 2-column grid, with perPage 4 at 9,999. teens-tens.css:27-32 sets .teens-tens-drawbox to height:1.15in, and teens-tens.tsx:157-160 kindCols gives 4 columns for 'tens' and 5 for 'teens'.
- **Fix hint:** Size draw boxes to share the page height (≈2–2.5in) and use at most 2 columns.

**S9-03** · medium · print — Child's 'My Work' journal page holds 11 items, not 12: every full page spills a row and the bead footer onto an extra sheet
- **Pages:** `/planner (11+ items)` (in print)
- **Cause:** src/planner/state.ts:101 chunkJournal(perPage = 12) vs src/styles/planner.css:34-42. Journal title 2.4rem × 1.2 line-height ≈ 46px + 0.2in margin; name line ≈ 27px + 0.35in; 12 × .journal-row min-height 0.75in = 864px; .journal-footer margin-top 0.5in + 26px BeadBar. Total ≈ 1,064px against the 960px printable height (print.css:7-10: Letter with 0.5in margins; .sheet-page has no print padding).
- **Fix hint:** Size the rows so 12 fit in 10in (e.g. rows 0.62in, footer margin 0.2in), or chunk at 10, and add a test on the measured page height.

**S9-11** · medium · print — Shade-the-fraction circles are 0.85in across: tenths and ninths are slivers too thin for a pencil
- **Pages:** `/worksheets/fractions?mode=shade&maxDenominator=10&count=12` (in print)
- **Cause:** src/worksheets/generators/fractions.tsx:220,228 — FractionCircle is given a hard-coded size={0.85} (inches) for identify/shade, and the circle is drawn at r=45 of a 100 viewBox (:171-178), so the drawn disc is ~0.77in. The cause is not fractions.css (.fractions-circle only sets display:block). layoutFor (:299-300) uses 3 columns × 12 per page with no size scaling.
- **Fix hint:** In shade mode, draw circles about 1.5in across (3 per row, 4 rows) so they fill the page.

**S2-25+S4-25** · low · print · recurring — Material pages have no print treatment: printing clips the mat and prints the felt
- **Pages:** `/materials/golden-beads`, `/materials/stamp-game`, `/materials/bead-frame`, `/materials/number-cards`, `/materials/cards-and-counters` and 4 more (in print)
- **Cause:** print.css:16-65 (@media print) hides only .no-print, the header and the footer, and neutralizes .card/.print-sheet. It has no rule for .material-stage, .mat-felt, .mat-wood or .stage-note. MaterialShell.tsx:63,69 marks only the help and controls as .no-print. The stage (:74) prints with white-on-felt labels (e.g. golden-beads.css:89-97, materials.css:180-185).
- **Fix hint:** In @media print, hide .material-stage (or render a light outline version) and print just the title, parent note, and lesson/worksheet links.
- **Note:** PRD 19 leaves material pages without a print treatment.

**S6-21** · low · consistency · recurring — Problem numbering and numeral typography vary sheet to sheet
- **Pages:** `/worksheets/golden-bead-pictures`, `/worksheets/decimals`, `/worksheets/long-division`, `/worksheets/multi-digit-ops`, `/worksheets/math-facts` (at 1400, 820 and 390px; in print)
- **Cause:** Each generator places and styles its own numbers. golden-bead-pictures.tsx:136-138 puts the number on its own line in read mode, while :158-161 puts it inline with the numeral in draw mode. decimals.css:3-6 and worksheets.css:94-100 use mono numerals, while math-facts and place-value use the body sans. long-division.css:43-46 (.long-division-eq mono) wraps the recording-sheet problem number, so that number is mono.
- **Fix hint:** One shared problem-number component (top-left, fixed size) and one numeral face with tabular lining figures for all sheets.
- **Note:** After PRD 19 every sheet's figures are lining (Step 7), but the mono and body faces still vary (PRD 19, open question 23).

**S7-17** · low · typography · recurring — Problem numbers are tiny grey and sit tight against the problem ('1. 6 ⟌ 5,034' reads as 1.6)
- **Pages:** `/worksheets/long-division`, `/worksheets/math-facts`, `/worksheets/multi-digit-ops`, `/worksheets/decimals`, `/worksheets/place-value` (in print)
- **Cause:** src/styles/worksheets.css:87-91: '.problem .problem-number' uses color var(--ink-soft) (#6f6759), font-size 0.75em and margin-right 0.35em (about 4px at 0.75 x 1.05rem). In long-division.tsx:82-92 the number is followed by the inline-block .long-division-bracket. The number aligns to the bracket's last line box, the divisor/dividend row, so '1.' sits about 4px before the divisor '6' and reads as '1.6'.
- **Fix hint:** Put numbers in a fixed-width gutter (e.g. a darker 0.85em number with 0.6em after it), aligned to the top of every problem.
- **Note:** The bug-fix commit `dbe71b6` separates the number from the problem in answer keys only (S6-02+S7-02); the student sheets still need this.

**S7-22** · low · print · recurring — Kit pieces left-aligned with a dead right margin; paper not used efficiently
- **Pages:** `/kits/golden-bead-cards`, `/kits/stamp-game-tiles`, `/kits/hundred-board-tiles`, `/kits/strip-boards`, `/kits/play-money` (in print)
- **Cause:** src/kits/kits.css:2-3: .kit-grid and .kit-grid-gapped are plain grids with no justify-content, so fixed-width tracks sit flush left. Examples: golden-bead-cards.tsx:73-94 uses repeat(2, 2.9in), which is 5.88in of the 7.5in width. stamp-game-tiles.tsx:26 and :34 use TILES_PER_PAGE 48 in repeat(6, 1in). hundred-board-tiles.tsx:30 and :57-62 use a 9-column grid split 54/46 over two pages.
- **Fix hint:** Center kit grids, and pack pieces per page (7 stamp tiles per row; all 100 hundred-board tiles on one page).

**S9-07** · low · print · recurring — 'Ink-friendly black & white' adds ink on the planner and the fraction-circle kit
- **Pages:** `/planner?…&bw=1`, `/kits/paper-fraction-circles?bw=1` (in print)
- **Cause:** src/styles/print.css:120-146 — .print-sheet.bw sets --golden and --bead-1..10 to #000, --inset-frame:#000 and --fraction-shade:#b3b3b3. BeadBar (src/components/beads.tsx:75) fills with var(--bead-10)/--golden, so the planner journal footer (PlannerPage.tsx:146 BeadBar n=10 beadSize=26) prints 10 solid black discs. Also: `src/kits/kits.css:37`, `kits.css:39`, `paper-fraction-circles.tsx:45-57`.
- **Fix hint:** In .bw, draw beads and sectors as outlines (fill #fff, 1–1.5px black stroke), thin the frame ring, and hide or outline the journal footer strip.

**S1-27** · low · print — Child's 'My Work' journal isn't ordered by day; day chips ragged; bead footer off-center
- **Pages:** `/planner (preview + print)` (at 1400px; in print)
- **Cause:** JournalPage (src/planner/PlannerPage.tsx:125-150) renders chunkJournal(plan.items) in URL/click order. `.journal-day` (planner.css:41) is margin-left:auto with no fixed width, so chips of different widths have ragged left edges. `.journal-footer { text-align:center }` (planner.css:42) can't center the BeadBar because BeadBar returns a bare <svg>, which global.css:19-23 makes `display:block`.
- **Fix hint:** Sort journal items by day (Any day last), give .journal-day a fixed min-width with centered text, and center the footer beads with margin: 0 auto.

**S4-21** · low · print — Control-chart sheets use only the top half of the page; cramped print controls
- **Pages:** `/materials/multiplication-charts` (at 1400px; in print)
- **Cause:** multiplication-charts.css:183-193 uses 0.55in th/td, which makes a 5.5in-square table. :215-221 `.multiplication-charts-print-controls{margin:0 0 .75rem}` has no top margin. The B&W checkbox is outside .material-controls, so the 1.25rem sizing at materials.css:46-49 doesn't apply and it renders at the browser default.
- **Fix hint:** Size cells to about 0.7in to fill the 7.5×10in area, add top margin to the controls, and style the checkbox at 1.25rem.

**S6-16** · low · material rendering — Multi-digit place-value column heads: tiny cramped letters, strip turns into a solid black bar in B&W
- **Pages:** `/worksheets/multi-digit-ops` (at 1400, 820 and 390px; in print)
- **Cause:** multi-digit-ops.css:28-32 makes each .multi-digit-ops-head width:1ch with border-top:0.16em solid currentColor. Color comes from placeInfo(p).colorVar (multi-digit-ops.tsx:299), and every one becomes #000 in .bw, so the adjacent 1ch strips join into one bar. multi-digit-ops.css:36-40 sets the label at font-size:0.5em inside a mono 1.1rem op (1.1rem because of S6-01), so the labels are about 8.8px.
- **Fix hint:** Render heads as boxed/ruled column cells at ≥0.7em that extend down past the digits; drop the strip or separate strips with gaps.

**S6-23** · low · color contrast — Skip counting: white 7-bead icon nearly invisible; table header tinted even in B&W
- **Pages:** `/worksheets/skip-counting` (at 1400, 820 and 390px; in print)
- **Cause:** components/beads.tsx:23 sets BEAD_STROKE to var(--bead-outline), which is rgba(0,0,0,0.55) (tokens.css:62), with strokeWidth max(0.6, r × 0.09) = 0.81 viewBox units (:36). skip-counting.tsx:124 renders BeadBar at beadSize 10, where 0.81 units comes to about a 0.4px, 55%-black rim around a --bead-7 #f8f8f2 fill. Also: `skip-counting.css:86-91`.
- **Fix hint:** Darker/thicker stroke for light bead colours; background:none for tables inside .print-sheet.bw.

**S6-26** · low · other — Generated sets look repetitive or trivial on the page
- **Pages:** `/worksheets/fractions`, `/worksheets/long-multiplication`, `/worksheets/long-division`, `/worksheets/skip-counting` (at 1400 and 820px; in print)
- **Cause:** fractions.tsx:118-132 (generate) calls makeProblem independently for every item and never de-duplicates. long-multiplication.tsx:62 sets ZERO_UNITS_RATE = 0.2, so 20% of 2-digit multipliers are round tens (:91-95). long-division.tsx:42-45 makes two-digit divisors a round ten half the time. long-division.tsx:216-218 prints 'R {remainder}' for every problem, including R 0. Also: `skip-counting.tsx:62-76`.
- **Fix hint:** De-duplicate within a sheet, down-weight multiples of 10, and omit 'R 0'.

**S7-13** · low · material rendering — Fraction-circle tenths/ninths labels crowd the division (cut) lines
- **Pages:** `/kits/paper-fraction-circles` (at 1400, 820 and 390px; in print)
- **Cause:** src/kits/kits.css:38: .kit-sector-label is a fixed 700 11pt, which inside the 200-unit viewBox is 14.7 user units, scaled 1.78x to the 3.7in SVG. paper-fraction-circles.tsx:26 and :59-66 place every label horizontally at LABEL_R=55, whatever the sector count.
- **Fix hint:** Scale label size by sector count (or rotate labels along the radius) and keep a minimum inset from both edges.

**S7-18** · low · typography — Multi-digit column heads 'Th H T U' are 6.6pt, and their color strip turns into a solid black bar in B&W
- **Pages:** `/worksheets/multi-digit-ops?preset=dynamic-subtraction` (in print)
- **Cause:** src/worksheets/generators/multi-digit-ops.css:36-40 sets .multi-digit-ops-head-label to 0.5em. Because .multi-digit-ops-op's 1.35rem loses to .vertical-op's 1.1rem (S7-01), the label renders at 8.8px (about 6.6pt). Each head cell is 1ch wide (css:28-32), so a bold 'Th' about 1ch wide nearly touches 'H'. The strip is 'border-top: 0.16em solid currentColor' with color placeInfo(p).colorVar (multi-digit-ops.tsx:303). Also: `print.css:121-124`.
- **Fix hint:** Use labels of at least 9pt and drop (or segment with gaps) the strip in B&W.

**S7-19** · low · alignment — Command-card scissors glyph floats at the page corner, on top of the header rule
- **Pages:** `/worksheets/command-cards` (at 1400 and 390px; in print)
- **Cause:** src/worksheets/generators/command-cards.css:3 and :8: .command-cards-page is position:relative, and .command-cards-scissors is absolute at top:0.05in; right:0.05in, placed in markup at command-cards.tsx:498-500. On screen the page has 0.5in of padding (print.css:81), so the glyph floats in the page margin. Also: `print.css:93`.
- **Fix hint:** Place the scissors on the grid's outer dashed line (e.g. top-left corner of the card grid).

**S7-20** · low · consistency — 'My Work' journal lists items by category while the day pills jump around (Mon, Tue, Wed, Mon, Thu…)
- **Pages:** `/planner (print)` (in print)
- **Cause:** src/planner/PlannerPage.tsx:235 passes plan.items straight to chunkJournal (state.ts:101-105), and JournalPage (PlannerPage.tsx:138-143) renders them in that order. The order is URL insertion order, which parsePlan preserves (state.ts:46), so it follows the order the parent ticked items. The picker lists lessons, then worksheets, then materials, so it usually comes out by category. Also: `PlannerPage.tsx:82-88`, `planner.css:41`.
- **Fix hint:** Sort journal rows by day (then Any day), and give the day pills a fixed width.

**S7-25** · low · consistency — Multi-digit subtraction sheet prints numbers without commas, but the key uses commas
- **Pages:** `/worksheets/multi-digit-ops?preset=dynamic-subtraction` (in print)
- **Cause:** src/worksheets/generators/multi-digit-ops.tsx:318-319 build the stacked rows with String(n).padStart(digits, ' ') (no commas), while the key at :377 uses formatNumber.
- **Fix hint:** Pick one convention for stacked work (no commas is fine) and apply it to both sheet and key.

**S7-26** · low · alignment — Long multiplication: no marked line for the final sum; column letters don't sit on the digit grid
- **Pages:** `/worksheets/long-multiplication` (in print)
- **Cause:** Doubled rule, confirmed: in scaffold mode each partial row is flex with align-items:flex-end (long-multiplication.css:29-35), and its .long-multiplication-partial-space has a 1px dashed border-bottom at the row's bottom edge (css:46-50). Also: `long-multiplication.tsx:185`, `worksheets.css:107-110`.
- **Fix hint:** Add a labeled 'product' line below the rule, and render the column letters in the same mono grid (one span per column).

**S8-13** · low · print — Scope & Sequence printout runs to 3 pages with wasted space and no site name
- **Pages:** `/parents/scope-and-sequence` (in print)
- **Cause:** src/styles/guides.css:83-85 only drops .scope-table to 9pt in print. The inline widths (scope-and-sequence.tsx:35-38) are in rem, which resolves against the root 16px and not the 9pt table, so Ages and Grades stay 88px (~0.92in) each. Cell padding stays 0.45rem 0.6rem (guides.css:62). The .site-header is hidden in print (print.css:21-25) and the guide has no .print-only title or URL line. Also: `guides.css:11-15`.
- **Fix hint:** For print, narrow Ages/Grades to about 3rem, use 0.25rem cell padding, consider @page landscape for this chart, and add a print-only title/URL line.

**S9-04** · low · print — Parent plan breaks across pages with a day heading stranded at the bottom and no context on page 2
- **Pages:** `/planner (13 and 26 items)` (in print)
- **Cause:** src/planner/PlannerPage.tsx:98-119 renders every day group as a Fragment inside a single <tbody>. The day heading is a plain <tr><td class=plan-day-heading>. src/styles/planner.css:25-27 has no break-after:avoid, break-inside or thead/repeated header. The sheet header is a div (:92-97), not a <thead>, so nothing repeats on page 2.
- **Fix hint:** Render each day as its own <tbody> with break-inside:avoid, give the heading row break-after:avoid, and repeat 'Weekly work plan (continued) — <day>' on the next page.

**S9-08** · low · table — 4-digit multiplication: place columns stop at Th but the answers have 5 digits; numbers print without commas
- **Pages:** `/worksheets/multi-digit-ops?operation=multiply&digits=4&placeColumns=1` (at 1400px; in print)
- **Cause:** src/worksheets/generators/multi-digit-ops.tsx:293-305 — ColumnHeads builds powers only from digits-1..0, so there is no ten-thousands head. :319-320 prints operands as String(n).padStart(digits), with no formatNumber, while the AnswerKey (:374-385) uses formatNumber. The rule (worksheets.css:107-110, display:block inside the inline-block .vertical-op) spans the 2ch sign cell plus the digits.
- **Fix hint:** Size the column heads and the rule to the answer's digit count (digits+1 for multiply and add), and format operands with formatNumber.

**S9-09** · low · spacing — Long multiplication scaffold: the '× tens' write-on line sits on top of the sum rule
- **Pages:** `/worksheets/long-multiplication?multiplicandDigits=4&multiplierDigits=2&scaffold=1` (at 1400px; in print)
- **Cause:** src/worksheets/generators/long-multiplication.css:29-35 — .op-row.long-multiplication-partial is flex with align-items:flex-end, so the dashed .long-multiplication-partial-space border-bottom (:46-50) sits on the row's bottom edge. long-multiplication.tsx:181 then renders the second <span className=op-rule/> directly after the last partial row. Also: `src/styles/worksheets.css:107-110`.
- **Fix hint:** Give the op-rule after the partial rows ~0.4em margin-top (or pad the last partial row).

**S9-26** · low · print — Large number cards kit mixes place families on the same page
- **Pages:** `/kits/large-number-cards` (in print)
- **Cause:** src/kits/kits/large-number-cards.tsx:35-43 — a hand-written PAGES manifest packs cards by height ([10..80], [90,100,200,300], [400..700], [800,900,1000,2000], …). :68 gives cols=1 for any page that isn't 9 or 8 cards, so 100+ cards print one per row, left-aligned.
- **Fix hint:** Paginate by family: 1–9, 10–90, 100–900 (2 pages), 1000–9000 (3 pages).

**S9-27** · low · grid layout — Hundred-board tiles printed 9 per row, so the sheet looks like a broken hundred chart
- **Pages:** `/kits/hundred-board-tiles` (in print)
- **Cause:** src/kits/kits/hundred-board-tiles.tsx:30 TileGrid gridTemplateColumns 'repeat(9, 0.75in)'; :57-62 split 1–54 / 55–100 onto two pages.
- **Fix hint:** Use 10 columns at about 0.72in, with rows aligned to decades, and put all 100 tiles on one page.

**S9-29** · low · typography — Command cards: 'Put a 8-bar…' grammar; pages filled to 949 of 960px
- **Pages:** `/worksheets/command-cards?material=checkerboard`, `/worksheets/command-cards (all decks)` (in print)
- **Cause:** src/worksheets/generators/command-cards.tsx:313 — template `Put a ${bar}-bar …` with bar = rng.int(2, 9), so bar 8 yields 'a 8-bar'. src/worksheets/generators/command-cards.css:4-10 fixes grid-auto-rows 2.2in × 4 rows (8.8in) plus a tightened header, per its own comment.
- **Fix hint:** Use an a/an helper and trim the card height by about 0.1in to leave slack.

## PRD 20 candidates: content and features the redesign does not touch

Lesson and guide text, in-page navigation, builder and planner behaviour, and the install icons.

**S5-04+S8-14** · medium · line break · recurring — Math expressions break mid-equation ('9 × / 9', '0.3 > / 0.25'), on desktop too
- **Pages:** `/lessons/multiplication-charts`, `/lessons/number-cards-birds-eye`, `/lessons/decimal-board-operations`, `/lessons/stamp-game-multiplication`, `/lessons/unit-division-board` and 17 more (at 1400, 820 and 390px)
- **Cause:** Lesson strings in src/materials/*/lessons.ts use ordinary U+0020 spaces around ×, +, −, =, <, >. No lesson string contains U+00A0, U+202F or U+2011 (0 matches in a scan of all 41 lessons). LessonPage.tsx:114-115 (and every other list at :37-196) renders the strings as plain text with no nowrap wrapper.
- **Fix hint:** Wrap number-operator-number runs in a `<span class="math">` with white-space:nowrap and tabular-nums (a small render helper), or use U+00A0 around operators in the content.

**S5-05** · low · line break · recurring — Numeric compounds split at the hyphen ("4- / digit", "three 7- / bars")
- **Pages:** `/lessons/checkerboard-multiplication`, `/lessons/checkerboard-intro`, `/lessons/fractions-operations`, `/lessons/golden-beads-addition`, `/lessons/ten-board-counting` (at 1400 and 390px)
- **Cause:** Content strings use hyphen-minus (U+002D) in numeric compounds. Under UAX #14 a break is allowed after a hyphen that is followed by a letter, so '4-digit' and '7-bars' can split. checkerboard/lessons.ts presentation step 2 has 'place three 7-bars on it' and step 10 has 'another 4-digit × 1-digit ... then 4-digit × 2-digit'. No U+2011 non-breaking hyphen exists anywhere in the lesson data.
- **Fix hint:** Use U+2011 non-breaking hyphens for number-hyphen compounds, or include them in the nowrap math span from S5-04.

**S5-07** · low · other · recurring — Long lessons have no in-page navigation, and Presentation starts 2–3 phone screens down
- **Pages:** `all 41 /lessons/* (worst: racks-and-tubes 6,770px, checkerboard-multiplication 6,353px, decimal-board-operations 6,352px, decimal-board-intro 6,151px at 390)` (at 1400, 820 and 390px)
- **Cause:** src/lessons/LessonPage.tsx:34-207 renders about 12 sequential <section> elements with no id attributes, no table of contents, no sticky nav and no collapsible parts. Nothing in src/lessons or src/parents uses id= or #anchor links. Also: `album.css:100-102`.
- **Fix hint:** Add section ids plus a compact jump bar (Materials · Presentation · Follow-up), sticky on desktop; consider collapsing Variations/Extensions on phone.
- **Note:** PRD 19 Step 32 gives every lesson section a heading id that a jump bar can link to.

**S5-13** · low · other · recurring — Dead ends: the last lesson in each strand names the next lessons without linking them; no breadcrumb or prev/next nav
- **Pages:** `/lessons/racks-and-tubes`, `/lessons/multiplication-charts`, `/lessons/long-chains`, `/lessons/golden-beads-division`, `/lessons/cards-and-counters` and 2 more (at 1400, 820 and 390px)
- **Cause:** src/lessons/LessonPage.tsx:16 computes next as a same-strand lesson with sequence+1 only, and :194-207 renders 'Next in this strand' only when that lesson exists. The strand chip at :23 is a plain <span>. There is no breadcrumb, back link or previous link anywhere in the component.
- **Fix hint:** Add a prev/next footer that can cross strands, plus a 'Lessons › Strand' breadcrumb; make the strand chip a link.

**S5-18+S8-15** · low · typography · recurring — Mixed straight and curly quotes in lesson and guide text
- **Pages:** `/lessons/racks-and-tubes`, `/lessons/golden-beads-addition`, `/lessons/checkerboard-multiplication`, `/lessons/teen-board-intro`, `/lessons/snake-game` and 7 more (at 1400, 820 and 390px; in print)
- **Cause:** Content strings in src/materials/*/lessons.ts mix quote styles. A scan found straight ASCII double quotes in 23 lessons (golden-beads family about 26 pairs total, teen-board-intro 10 pairs, checkerboard-intro 6 pairs, racks-and-tubes 4 pairs) and curly quotes in 6 lessons (cards-and-counters, ten-board-intro, ten-board-counting, subtraction-strip-board, decimal-board-intro, decimal-board-operations). Also: `album.css:64-70`.
- **Fix hint:** Normalize content to curly quotes (a one-time pass or a render-time smart-quote helper).

**S6-20** · low · consistency · recurring — Static help text and irrelevant fields that don't match the chosen mode
- **Pages:** `/worksheets/teens-tens`, `/worksheets/hundred-chart`, `/worksheets/long-division`, `/worksheets/skip-counting`, `/worksheets/command-cards` and 1 more (at 1400, 820 and 390px)
- **Cause:** worksheets/types.ts:6-9: ParamField has no visibility or condition property. BuilderPage.tsx:12-61 (Field) and :151-158 render every schema field with a static field.help. Examples: teens-tens.tsx:374 (bead-picture help shown for every mode), hundred-chart.tsx:274/282 ('Fill-in mode only' / 'Chart-pieces mode only'), long-division.tsx:268 (recording-sheet help shown for the bracket format), command-cards.tsx:559 … Also: `skip-counting.tsx:276-279`.
- **Fix hint:** Hide fields that don't apply to the current mode, make help text mode-aware, and standardise the count label.

**S8-11** · low · other · recurring — No way to jump around inside the guides (FAQ, glossary)
- **Pages:** `/parents/faq`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview`, `/parents/using-this-site` and 1 more (at 1400, 820 and 390px)
- **Cause:** src/parents/guides/faq.tsx (12 plain <h2>), glossary.tsx (29 <dt> in one <dl>) and scope-and-sequence.tsx:43-51 (7 strand tbodies) carry no id attributes. A grep for id=, <details> and <nav> in src/parents returns nothing. src/parents/GuidePage.tsx:11-18 renders only the Print row and the component, with no TOC and no prev/next or back link.
- **Fix hint:** Add an auto-generated 'On this page' list (from h2, dt and strand rows, with ids), optionally <details> for FAQ answers, and a prev/next guide footer.

**S5-14** · low · other — Unit Division Board prose contradicts its own "Next in this strand" link
- **Pages:** `/lessons/unit-division-board` (at 1400, 820 and 390px)
- **Cause:** The whatComesNext text in src/materials/division-board/lessons.ts:95 says 'The unit division board completes the memorization boards … move into the Passage to Abstraction strand'. The registry, however, puts unit-division-board at memorization sequence 5, followed by addition-charts (6) and multiplication-charts (7). So LessonPage.tsx:16/:197-206 renders 'Next in this strand: The Addition Charts'.
- **Fix hint:** Align the prose with the strand sequence (mention the charts), or reorder the sequence.

**S8-04** · low · line break — Material and worksheet names break at ugly points in scope table cells
- **Pages:** `/parents/scope-and-sequence` (at 1400, 820 and 390px)
- **Cause:** Material and worksheet names are rendered as plain Link text with ordinary spaces (src/parents/guides/scope-and-sequence.tsx:75-88). The names come from src/materials/teen-board/def.ts:6 'Teen Board (Seguin A)', src/materials/bead-frame/def.ts:6 'Bead Frames (Small & Large)', src/worksheets/generators/place-value.tsx:119 'Place Value & Expanded Form', math-facts.tsx:236 'Math Facts Drill' and numeral-tracing.tsx:192 …
- **Fix hint:** Widen the columns (S8-01), and use a non-breaking space inside "(Seguin A)" and "(Small & Large)", or white-space: nowrap on each link.
- **Note:** PRD 19 Step 37 widens the chart to the full column, which removes most bad breaks; non-breaking spaces in the names finish it.

**S8-16** · low · other — FAQ uses a raw URL path as link text
- **Pages:** `/parents/faq` (at 1400, 820 and 390px)
- **Cause:** src/parents/guides/faq.tsx:151 `The lesson plans at <Link to="/lessons">/lessons</Link> spell out each step`.
- **Fix hint:** Change the link text to "the lesson album".

**S8-17** · low · consistency — The same 'three tips' pattern is styled two different ways
- **Pages:** `/parents/how-to-present`, `/parents/montessori-math-overview`, `/parents/using-this-site` (at 1400, 820 and 390px)
- **Cause:** src/parents/guides/how-to-present.tsx:35-52 uses <dl><dt><dd> for the three habits, but lines 59-70 (technique rules) and 84-102 (Periods 1-3) use <p><strong>…</strong> run-in leads. montessori-math-overview.tsx:37-72 uses a dl for the five-rung ladder. The dl styling comes from src/styles/guides.css:27-36.
- **Fix hint:** Pick one numbered step/tip component for enumerated guidance and use it for habits, technique rules, periods 1–3 and the ladder.

**S9-06** · low · other — A bad week date in a shared plan URL silently prints a different date
- **Pages:** `/planner?…&w=2026-13-45` (at 1400px; in print)
- **Cause:** src/planner/state.ts:37 WEEK_RE = /^\d{4}-\d{2}-\d{2}$/ checks shape only (applied at :53). src/planner/PlannerPage.tsx:42-45 formatWeekOf calls new Date(y, m-1, d), and JS Date rolls month 13 / day 45 over to February 14, 2027. <input type=date value='2026-13-45'> (:292) rejects the invalid value and shows blank, so screen and print disagree.
- **Fix hint:** In parsePlan, accept w only if the Date round-trips to the same y/m/d; otherwise drop it.

**S9-24** · low · other — Install icons: SVG-only apple-touch-icon and manifest; small maskable bead; generic 16px dot
- **Pages:** `all routes (index.html, manifest.webmanifest)` (at 1400px)
- **Cause:** index.html:7 is apple-touch-icon → /favicon.svg. public/manifest.webmanifest lists only two SVG icons. public/icon-maskable.svg wraps the bead in scale(0.6) on a full #faf7f0 square.
- **Fix hint:** Add a 180px PNG apple-touch-icon and 192/512 PNG icons. Enlarge the maskable bead to about 75% and give the favicon a distinct mark (e.g. a bead bar).
