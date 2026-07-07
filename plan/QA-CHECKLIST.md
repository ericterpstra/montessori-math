# Morning QA — wave 2 (all ten features)

Everything below shipped last night and passed automated tests (871) plus in-browser smoke checks. What's left is what only a human can judge: paper, ears, hands, and taste. **~40 minutes total.**

- Site: **http://192.168.1.208:4173** (Tailscale: `http://100.86.225.124:4173`)
- If the server is down: `cd ~/Dev/montessori-math && npm run preview`
- You'll want: Chrome, the printer (a few sheets of plain paper; cardstock optional), scissors, a ruler with inches, and ideally a tablet on the Wi-Fi.
- Mark ✗ on anything that feels wrong and jot a word — no need to diagnose.

## Part 1 — At the desk, screen only (~12 min)

### 1. Exchange ceremony (PRD 10)
1. Open `/materials/golden-beads`, make sure the **🔊 Sound on** button (controls row) shows sound on.
2. Tap the UNIT bank ten times, then tap **10 units → 1 ten**.
- [ ] The ten unit beads glow briefly, fly together to the bank, and a single ten-bar flies back — calm and quick, not cartoonish
- [ ] You hear a soft bead *clink* when the ten-bar lands (speakers on!)
- [ ] Tap-placing pieces makes a quiet wooden tap sound
- [ ] Toggle 🔇 and repeat — silent; motion unchanged
3. Same page: try an exchange on `/materials/stamp-game` (ten 1-stamps → **10 → 1 ten**).
- [ ] Same ceremony with stamp tiles

### 2. Presentation mode (PRD 11)
1. Open `/lessons/golden-beads-addition` and click **"See this presented on the virtual material"** (in the Materials section).
2. Step through all 9 steps with **Next →**, then go back a few with **← Previous**.
- [ ] The mat builds 1,234, then 2,345, combines to 3,579, then works 1,568 + 1,679 through three exchanges to 3,247 — always matching the words on the overlay
- [ ] **← Previous** rewinds cleanly (the mat matches the earlier step exactly)
- [ ] The suggested words ("First we lay out…") read naturally aloud — this is the one to trust your ear on
- [ ] **Close** returns the material to normal use
3. Repeat briefly on `/materials/stamp-game?present=stamp-game-addition`.
- [ ] Stamp-game walkthrough works the same way

### 3. Long chains (PRD 15)
1. Open `/materials/bead-chains`, switch the mode to **Thousand chain**.
- [ ] The chain scrolls smoothly sideways; the "You are near ___" readout tracks as you scroll
- [ ] Place a couple of arrow tickets (tap ticket → tap slot); a wrong one is marked only when you press Check
- [ ] Hundred-square milestones appear at each hundred; the cube waits at 1,000
2. Switch to **Hundred chain** — same, smaller.
- [ ] Feels like an expedition, not a chore — honest gut call

### 4. Planner (PRD 13)
1. Open `/planner`. Pick ~4 items (a lesson, two worksheets with presets, a material), assign days to two of them, set Week of.
- [ ] The shelf panel updates live; × removes an item
- [ ] **Copy link** → paste in a new tab → the whole plan is intact (that's the "save")
- [ ] Reload the page — plan still there (it's all in the URL)

### 5. Memorization charts (PRD 14)
1. Open `/materials/addition-charts` → mode **Working chart**.
- [ ] Tap a tile then a cell; place one deliberately wrong; **Check** flags only the wrong one
2. Glance at `/materials/multiplication-charts` Chart 1 and Chart 2.
- [ ] Chart 2 (the half chart) shows each fact once — the commutativity "aha" is visible

### 6. Worksheet themes (PRD 18)
1. Open `/worksheets/math-facts`, set **Header decoration** to each of space / baking / dinosaurs.
- [ ] Small corner art appears on the student page header only — subtle, never on the answer key
2. Look at `/materials/golden-beads` and `/materials/addition-strip-board` mats.
- [ ] Felt and wood now have faint texture; beads have a touch of depth — should read as "nicer," not "busy." If anything looks noisy, note which mat.

## Part 2 — Printer batch (~15 min)

Print these six things in one session (Ctrl+P; **100% scale / "Actual size" — turn OFF "fit to page"**):

### 7. Kit calibration ⭐ the critical one (PRD 09)
1. `/kits/stamp-game-tiles` → Print (color, plain paper is fine).
- [ ] **Measure the 1-inch square on page 1 with a ruler — it must be exactly 1 inch**
- [ ] Tiles are 1-inch, colors right (1 green, 10 blue, 100 red, 1000 green), dashed cut lines visible
2. If the square is off, note your printer's scale setting — every kit depends on this.
3. Optional with scissors: cut a few tiles; check they handle nicely at cardstock weight.

### 8. Command cards (PRD 12)
1. `/worksheets/command-cards` → preset **Golden bead deck** → Print with answer key.
- [ ] 8 cards per page with dashed cut borders; tasks read like a teacher wrote them; answer key on its own page matches card numbers
- [ ] Spot-check one answer by hand

### 9. Work journal (PRD 13)
1. In your planner tab from step 4 → **Print**.
- [ ] Page 1: parent plan grouped by day. Page 2: "My Work" journal — big type, empty checkbox squares a child can pencil
- [ ] Try the **Ink-friendly black & white** toggle in print preview — nothing lost

### 10. Booklet ⭐ the fun one (PRD 16)
1. `/worksheets/numeral-tracing` → set **Layout** to the booklet option → Print **double-sided, flip on SHORT edge** (3 sheets).
- [ ] Fold the stack in half → a 12-page "My Book of Numbers": cover, 0–9 in order, back cover — pages right-side-up and in order (this verifies the imposition math on real paper)
- [ ] Dashed numerals are traceable; counting beads match each numeral

### 11. Control charts + B&W fractions (PRDs 14, 18-regression)
1. `/materials/addition-charts` → **Print control charts**.
- [ ] Charts 1 & 2 each fill a Letter page, readable at arm's length
2. `/worksheets/fractions?mode=identify&bw=1` → print preview only (no need to print).
- [ ] In B&W, shaded sectors are mid-gray with visible division lines — you can count 5/8 vs 1/2 at a glance

## Part 3 — Tablet (~8 min, best-effort)

### 12. Install & offline (PRD 17)
Honest limitation: install/offline needs HTTPS or localhost — the plain LAN IP won't offer it.
1. On the dev machine: open `http://localhost:4173` in Chrome → ⋮ menu → **Install Montessori Math** (or install icon in the address bar).
- [ ] Installs with the golden-bead icon; opens in its own window
2. In the installed app: DevTools → Network → Offline → reload; visit a material and a worksheet.
- [ ] Everything works offline
3. On the tablet (over LAN, no install): just use the site.
- [ ] Loads and works normally (online-only there — expected)

### 13. Tablet feel
1. On the tablet, landscape: golden beads (do an exchange), thousand chain (scroll with a finger), stamp game.
- [ ] Everything reachable with child-size taps; ceremony feels good on touch; no accidental zooming/scrolling fights

## Part 4 — Two-minute regression sweep

- [ ] `/` home: new "Plan a week of work" button present; page looks right
- [ ] `/materials` shows 21 materials incl. Addition/Multiplication Charts
- [ ] `/worksheets` shows 13 generators incl. Command Cards + the kits card at the bottom
- [ ] One old flow untouched: `/worksheets/multi-digit-ops?preset=dynamic-subtraction` still generates and previews
- [ ] `/parents/scope-and-sequence` renders (now includes the 3 new lessons: addition-charts 6, multiplication-charts 7, long-chains 8)

---

**When you're done:** tell Claude what failed (a screenshot or one line per ✗ is plenty). Anything that passed here plus the 871 automated tests is considered shipped.
