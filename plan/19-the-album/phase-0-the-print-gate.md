# PRD 19 · Phase 0 — The print gate

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Step 1. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


The owner's rule is that worksheets, kits and the planner print exactly as before, and that no material changes. Before any source file changes, this phase turns both rules into numbers: a console script that records a computed-style signature of every printable and every material stage, and compares two builds. The baseline is recorded once, on `album-baseline`; every later step's **Check:** compares against it (convention 12).

## Step 1 — The print regression gate and the `album-baseline` tag

**Files:** `plan/19-the-album/print-gate.js` (new). No source file changes. The tag `album-baseline` and the branch `album` are created.

The owner's rule is that worksheets, kits and the planner print exactly as before. This script turns that rule into a number.
- On each route it loads the page in a 720px iframe, then applies the `@media print` rules and removes the `@media screen` rules, the way Chrome's printer would.
- It records a signature of every element under `.print-sheet`, every visible leaf with text outside the sheets, and the printed document's height, and stores them in IndexedDB.
- A later run on another build of the same origin is compared element by element.

It covers:
- **50 print routes:**
  - 13 generators with `seed=424242&key=1`, and 7 kits;
  - one 13-item planner URL that prints the plan and two journal pages, including "(continued)";
  - the 4 printables that open from a material page: "Print control charts" on the addition and multiplication charts, and "Show arrow labels" on the hundred and thousand chains. The gate presses those buttons itself.

  Each is run in colour and in B&W (`bw=1`, or ticking "Ink-friendly B&W" on the material pages).
- **The `stages` suite:** every element inside the 21 material stages on screen at 1400px. This is the check for the token shield (Step 5), and it proves the plate mount (Step 28) changes nothing inside a stage.
- **The `stages390` suite:** the same at 390px wide, so a phone's stage width can't change unnoticed. It skips the bead stair and cards & counters, whose random starting layout wraps differently from run to run at that width (the 1400 suite covers them).

Create `plan/19-the-album/print-gate.js`:

```js
/* ---------------------------------------------------------------------------
   PRD 19 "The Album": print regression gate.  plan/19-the-album/print-gate.js

   Proves the re-skin changed nothing that reaches paper. For every printable
   route it loads the page in a 720px iframe (US Letter minus 0.5in margins),
   applies the @media print rules and drops the @media screen rules, then
   records a computed-style signature of every element under .print-sheet:
   tag, class, box position and size relative to the sheet, and ~80 computed
   properties (plus ::before/::after). It also records every visible leaf with
   text OUTSIDE the sheets (chrome that would print because it lost .no-print)
   and the printed document's height (a stray trailing page). A second run on
   another build of the same origin is compared element by element.
   0 differences = pass.

   Dependency-free: paste the whole file into the DevTools console of any page
   of the site. Results persist in IndexedDB on that origin, so the baseline
   and candidate runs can happen on two dev servers started one after the
   other on the SAME port (see PRD 19, Step 1, for the exact commands).

     await printGate.run({ label: 'before' })     // baseline build
     await printGate.run({ label: 'after' })      // candidate build
     await printGate.compare('before', 'after')   // prints PASS or FAIL

   Suites:  'print'  (default) 13 generators, 7 kits, planner plan + journal,
                     and the 4 printables that open from a material page (both
                     control charts, the hundred and thousand chains' arrow
                     labels), each in colour and B&W: 50 routes, print
                     emulation, 720px.
            'stages' every element inside the 21 material stages, on screen at
                     1400px (the shield check), compared order-insensitively
                     because three materials shuffle their starting layout.
                     The stage box's own corner radius and box-shadow are the
                     plate mount (chrome, PRD 19 Step 28) and are not compared;
                     everything else about the stage box is.
            'stages390' the same at 390px wide (a phone), without the bead
                     stair and cards & counters: their random starting layout
                     wraps differently from run to run at that width.
   Options for run(): suite ('print' | 'stages' | 'stages390'), only
   (substrings that pick routes), inject (CSS added to every page before print
   emulation: only for proving the gate catches a change, never for a real run).
   Other calls: printGate.labels(), printGate.download(label),
                printGate.clear(label), printGate.inspect(route), printGate.close()
   The route lists below are fixed. Each print run also reads /worksheets and
   /kits and warns about any generator or kit the lists do not cover: add it
   to GENERATORS or KITS, re-run the baseline, then the candidate.
   Keep this tab in the foreground while a run is going (background tabs
   throttle timers). Run both passes in the same Chrome window at 100% zoom.
   --------------------------------------------------------------------------- */
;(() => {
  'use strict'

  const GENERATORS = [
    'command-cards', 'decimals', 'fractions', 'golden-bead-pictures', 'hundred-chart', 'long-division',
    'long-multiplication', 'math-facts', 'multi-digit-ops', 'numeral-tracing', 'place-value', 'skip-counting',
    'teens-tens',
  ]
  const KITS = [
    'golden-bead-cards', 'hundred-board-tiles', 'large-number-cards', 'paper-fraction-circles', 'play-money',
    'stamp-game-tiles', 'strip-boards',
  ]
  // Printables that open from a material page. Each step is the exact text of a
  // button or label to click, or 'select:<option text>' to choose in the page's
  // <select>. Each runs in colour, then again after ticking "Ink-friendly B&W".
  const MATERIAL_PRINTS = [
    { url: '/materials/addition-charts', steps: ['Print control charts'] },
    { url: '/materials/multiplication-charts', steps: ['Print control charts'] },
    { url: '/materials/bead-chains', steps: ['select:Hundred chain', 'Show arrow labels'] },
    { url: '/materials/bead-chains', steps: ['select:Thousand chain', 'Show arrow labels'] },
  ]
  const MATERIALS = [
    'addition-charts', 'addition-strip-board', 'bead-chains', 'bead-frame', 'bead-stair', 'cards-and-counters',
    'checkerboard', 'decimal-board', 'division-board', 'fraction-circles', 'golden-beads', 'hundred-board',
    'multiplication-bead-board', 'multiplication-charts', 'number-cards', 'racks-and-tubes', 'snake-game',
    'stamp-game', 'subtraction-strip-board', 'teen-board', 'ten-board',
  ]
  // 13 items: all three kinds, a preset, days, "any day" items and a week date.
  // 13 > 12 per journal page, so the "(continued)" journal page prints too.
  const PLANNER =
    '/planner?l=golden-beads-addition:mon&s=math-facts.times-tables:tue&m=golden-beads:wed&s=multi-digit-ops' +
    '&l=stamp-game-addition:thu&l=number-cards-intro:mon&s=long-division.first-long-division:fri&m=stamp-game' +
    '&l=snake-game:tue&s=skip-counting:wed&m=hundred-board:sat&l=fractions-intro&s=place-value:sun&w=2026-10-05'

  // The stage box's own corners and shadow are the plate mount that PRD 19
  // Step 28 draws on .material-stage: chrome, checked by Step 28 itself. They
  // are recorded as '(plate mount)' on the stage box only; every other property
  // of the stage box and everything inside it is compared as usual.
  const MOUNT = [
    'box-shadow', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius',
    'border-bottom-left-radius',
  ]
  const stages = (width, height, skip = []) => ({
    media: 'screen',
    width,
    height,
    root: '.material-stage',
    ordered: false,
    mount: MOUNT,
    routes: () => MATERIALS.filter((m) => !skip.includes(m)).map((m) => `/materials/${m}`),
  })

  const SUITES = {
    print: {
      media: 'print',
      width: 720,
      height: 1000,
      root: '.print-sheet',
      ordered: true,
      routes: () => [
        ...GENERATORS.flatMap((g) => [`/worksheets/${g}?seed=424242&key=1`, `/worksheets/${g}?seed=424242&key=1&bw=1`]),
        ...KITS.flatMap((k) => [`/kits/${k}`, `/kits/${k}?bw=1`]),
        PLANNER,
        `${PLANNER}&bw=1`,
        ...MATERIAL_PRINTS.flatMap((m) => [m, { url: m.url, steps: [...m.steps, 'Ink-friendly B&W'] }]),
      ],
    },
    stages: stages(1400, 900),
    // The bead stair and cards & counters deal a random starting layout that
    // wraps differently from run to run at this width: 1400 covers them.
    stages390: stages(390, 844, ['bead-stair', 'cards-and-counters']),
  }
  // A route is a URL, or { url, steps } for a printable opened from a material
  // page; its key names it in the log, in IndexedDB and in `only`.
  const keyOf = (route) => (typeof route === 'string' ? route : `${route.url} > ${route.steps.join(' > ')}`)
  // Bump when what a signature records changes: runs of different versions never compare.
  const GATE_VERSION = 2

  // Computed properties in each element's signature. Box position and size
  // are recorded separately (relative to the sheet).
  const PROPS = [
    'display', 'position', 'float', 'box-sizing', 'visibility', 'opacity', 'zoom', 'overflow-x', 'overflow-y',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
    'outline-style', 'outline-width', 'box-shadow', 'background-color', 'background-image',
    'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch', 'font-variant-caps',
    'font-variant-numeric', 'font-feature-settings', 'line-height', 'letter-spacing', 'word-spacing',
    'text-transform', 'text-align', 'text-indent', 'text-decoration-line', 'text-decoration-style',
    'text-decoration-color', 'white-space-collapse', 'text-wrap-mode', 'text-wrap-style', 'vertical-align',
    'list-style-type', 'grid-template-columns', 'grid-template-rows', 'row-gap', 'column-gap', 'column-count',
    'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'break-before', 'break-after',
    'break-inside', 'transform', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray',
  ]
  const PSEUDO_PROPS = [
    'content', 'display', 'position', 'color', 'background-color', 'font-family', 'font-size', 'font-weight',
    'border-top-width', 'border-top-color', 'margin-left', 'margin-right', 'width', 'height',
  ]
  // Names of the compared columns of a line: [key, element, box, ...PROPS].
  const FIELDS = ['element', 'box', ...PROPS]
  const PSEUDO_FIELDS = ['element', 'box', ...PSEUDO_PROPS]
  // Print only: a visible leaf outside every sheet, and the printed page height.
  const OUTSIDE_FIELDS = ['element', 'position', 'text (or page height)']
  const fieldsFor = (key) =>
    /::(before|after)$/.test(key) ? PSEUDO_FIELDS : /^(x:|page$)/.test(key) ? OUTSIDE_FIELDS : FIELDS

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const round = (n) => Math.round(n * 10) / 10
  const nextFrames = (win) =>
    Promise.race([
      new Promise((resolve) => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve))),
      sleep(250),
    ])

  /* ---------- IndexedDB: one record per (label, route), plus a meta record ---------- */
  let dbPromise = null
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open('mm-print-gate', 1)
        req.onupgradeneeded = () => req.result.createObjectStore('runs')
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
    }
    return dbPromise
  }
  async function tx(mode, fn) {
    const d = await db()
    return new Promise((resolve, reject) => {
      const t = d.transaction('runs', mode)
      const req = fn(t.objectStore('runs'))
      t.oncomplete = () => resolve(req && req.result)
      t.onerror = () => reject(t.error)
    })
  }
  const put = (key, value) => tx('readwrite', (s) => s.put(value, key))
  const get = (key) => tx('readonly', (s) => s.get(key))
  const allKeys = () => tx('readonly', (s) => s.getAllKeys())
  const del = (key) => tx('readwrite', (s) => s.delete(key))

  /* ---------- Print emulation: evaluate every @media rule as Chrome's print would ---------- */
  function queryMatchesPrint(query, win) {
    let q = query.trim().toLowerCase()
    if (!q) return true
    let negate = false
    if (q.startsWith('not ')) {
      negate = true
      q = q.slice(4).trim()
    } else if (q.startsWith('only ')) {
      q = q.slice(5).trim()
    }
    let type = 'all'
    let features = q
    if (!q.startsWith('(')) {
      const m = /^([a-z-]+)(?:\s+and\s+([\s\S]*))?$/.exec(q)
      if (m) {
        type = m[1]
        features = m[2] || ''
      }
    }
    // Width features are evaluated against the 720px frame, the printable width.
    const result = (type === 'all' || type === 'print') && (!features || win.matchMedia(features).matches)
    return negate ? !result : result
  }
  const listMatchesPrint = (text, win) => !text.trim() || text.split(',').some((q) => queryMatchesPrint(q, win))

  function printifyRules(container, win) {
    const rules = container.cssRules
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i]
      if (rule.constructor.name === 'CSSMediaRule' || rule.type === 4) {
        printifyRules(rule, win) // nested @media first
        if (listMatchesPrint(rule.media.mediaText, win)) {
          // Unwrap in place, so the cascade order is exactly what print sees.
          const inner = [...rule.cssRules].map((r) => r.cssText)
          container.deleteRule(i)
          inner.forEach((text, k) => container.insertRule(text, i + k))
        } else {
          container.deleteRule(i)
        }
      } else if (rule.cssRules && typeof rule.insertRule === 'function') {
        printifyRules(rule, win) // @supports, @layer, @container, nested style rules
      }
    }
  }

  function printify(win) {
    for (const sheet of [...win.document.styleSheets]) {
      if (sheet.media && sheet.media.mediaText) {
        if (!listMatchesPrint(sheet.media.mediaText, win)) {
          sheet.disabled = true
          continue
        }
        sheet.media.mediaText = 'all'
      }
      let rules
      try {
        rules = sheet.cssRules
      } catch {
        throw new Error('cannot read a cross-origin stylesheet: ' + sheet.href)
      }
      if (rules) printifyRules(sheet, win)
    }
  }

  function injectCss(win, css) {
    const style = win.document.createElement('style')
    style.dataset.printGate = 'inject'
    style.textContent = css
    win.document.head.appendChild(style)
  }

  /* ---------- Loading a route ---------- */
  let frame = null
  function close() {
    if (frame) frame.remove()
    frame = null
  }

  // One step on a material page: 'select:<text>' picks that option in the
  // page's <select>; anything else clicks the button or label with that text.
  async function act(win, step, url) {
    const doc = win.document
    const t0 = performance.now()
    while (performance.now() - t0 < 20000) {
      if (step.startsWith('select:')) {
        for (const select of doc.querySelectorAll('main select')) {
          const option = [...select.options].find((o) => o.textContent.trim() === step.slice(7))
          if (!option) continue
          // The native setter, so React sees the change event as a real one.
          Object.getOwnPropertyDescriptor(win.HTMLSelectElement.prototype, 'value').set.call(select, option.value)
          select.dispatchEvent(new win.Event('change', { bubbles: true }))
          return sleep(300)
        }
      } else {
        const target = [...doc.querySelectorAll('main button, main label')].find((b) => b.textContent.trim() === step)
        if (target) {
          target.click()
          return sleep(300)
        }
      }
      await sleep(150)
    }
    throw new Error(`${url}: no control "${step}" within 20s`)
  }

  async function load(route, cfg) {
    const url = typeof route === 'string' ? route : route.url
    close()
    frame = document.createElement('iframe')
    frame.title = 'print gate'
    const scale = Math.min(1, 480 / cfg.width)
    frame.style.cssText =
      `position:fixed;left:8px;top:8px;box-sizing:content-box;width:${cfg.width}px;height:${cfg.height}px;` +
      'border:0;outline:1px solid gray;' +
      `background:white;z-index:2147483647;transform:scale(${scale});transform-origin:0 0;pointer-events:none`
    document.body.appendChild(frame)
    await new Promise((resolve, reject) => {
      frame.onload = resolve
      frame.onerror = reject
      frame.src = new URL(url, location.origin).href
    })
    const win = frame.contentWindow
    const doc = win.document
    for (const step of typeof route === 'string' ? [] : route.steps) await act(win, step, url)
    // Wait until the route has rendered its sheets and the DOM is stable.
    const t0 = performance.now()
    let last = -1
    let stable = 0
    while (performance.now() - t0 < 20000) {
      const n = doc.querySelector(cfg.root) ? doc.querySelectorAll(`${cfg.root}, ${cfg.root} *`).length : 0
      if (n > 0 && n === last) {
        if (++stable >= 3) break
      } else {
        stable = 0
      }
      last = n
      await sleep(150)
    }
    if (last <= 0) throw new Error(`${keyOf(route)}: nothing matched ${cfg.root} within 20s`)
    // No scrollbar, so the layout width is exactly the frame width (as on paper).
    injectCss(win, 'html { scrollbar-width: none; } html::-webkit-scrollbar { display: none; }')
    await doc.fonts.ready
    await nextFrames(win)
    return win
  }

  async function prepare(win, cfg, inject) {
    // Injected CSS (self-test only) goes in first, so it is printified like the site's own CSS.
    if (inject) injectCss(win, inject)
    if (cfg.media === 'print') printify(win)
    await nextFrames(win)
    await sleep(120)
    await win.document.fonts.ready
    await nextFrames(win)
  }

  /* ---------- The signature ---------- */
  function snapshot(win, cfg) {
    const doc = win.document
    const lines = []
    const roots = [...doc.querySelectorAll(cfg.root)]
    roots.forEach((root, ri) => {
      const rootBox = root.getBoundingClientRect()
      const walk = (el, path) => {
        const np = cfg.media === 'print' ? el.closest('.no-print') : null
        if (np && root.contains(np)) return // never reaches paper
        const cs = win.getComputedStyle(el)
        const box = el.getBoundingClientRect()
        const geo = cfg.ordered
          ? el === root
            ? [round(box.left + win.scrollX), round(box.top + win.scrollY), round(box.width), round(box.height)]
            : [round(box.left - rootBox.left), round(box.top - rootBox.top), round(box.width), round(box.height)]
          : [round(box.width), round(box.height)]
        const name = `${el.tagName.toLowerCase()}.${(el.getAttribute('class') || '').trim().replace(/\s+/g, '.')}`
        const mount = el === root && cfg.mount ? cfg.mount : []
        const values = PROPS.map((p) => (mount.includes(p) ? '(plate mount)' : cs.getPropertyValue(p)))
        lines.push([`${ri}:${path}`, name, geo.join(','), ...values])
        for (const pseudo of ['::before', '::after']) {
          const ps = win.getComputedStyle(el, pseudo)
          if (ps.content && ps.content !== 'none' && ps.content !== 'normal') {
            lines.push([`${ri}:${path}${pseudo}`, name + pseudo, '', ...PSEUDO_PROPS.map((p) => ps.getPropertyValue(p))])
          }
        }
        ;[...el.children].forEach((child, i) => walk(child, `${path}/${i}`))
      }
      walk(root, 'r')
    })
    if (cfg.media === 'print') {
      // Anything else that would reach paper: every visible leaf with text
      // outside the sheets (chrome that lost its .no-print), then the printed
      // document's height (a stray trailing page).
      let k = 0
      for (const el of doc.body.querySelectorAll('*')) {
        if (el.children.length || el.closest(cfg.root) || !el.getClientRects().length) continue
        const text = el.textContent.trim().replace(/\s+/g, ' ')
        if (!text) continue
        const box = el.getBoundingClientRect()
        const name = `${el.tagName.toLowerCase()}.${(el.getAttribute('class') || '').trim().replace(/\s+/g, '.')}`
        lines.push([`x:${k++}`, name, `${round(box.left + win.scrollX)},${round(box.top + win.scrollY)}`, text.slice(0, 40)])
      }
      lines.push(['page', 'html', '', String(doc.documentElement.scrollHeight)])
    }
    return lines
  }

  /* ---------- Coverage: every generator and kit linked from the hubs is gated ---------- */
  async function coverage() {
    const missing = []
    for (const [hub, known] of [['worksheets', GENERATORS], ['kits', KITS]]) {
      const selector = `main a[href^="/${hub}/"]`
      const win = await load(`/${hub}`, { width: 1400, height: 900, root: selector })
      for (const a of win.document.querySelectorAll(selector)) {
        const slug = a.getAttribute('href').split(/[?#]/)[0].slice(hub.length + 2)
        if (slug && !known.includes(slug) && !missing.includes(`/${hub}/${slug}`)) missing.push(`/${hub}/${slug}`)
      }
    }
    close()
    if (missing.length) console.warn(`[print-gate] NOT COVERED (add to GENERATORS/KITS): ${missing.join(', ')}`)
    return missing
  }

  /* ---------- Public API ---------- */
  async function run({ label = 'after', suite = 'print', only = null, inject = null } = {}) {
    const cfg = SUITES[suite]
    if (!cfg) throw new Error(`unknown suite "${suite}" (use "print", "stages" or "stages390")`)
    const routes = cfg.routes().filter((r) => !only || only.some((o) => keyOf(r).includes(o)))
    for (const key of await allKeys()) if (String(key).startsWith(`${label}|`)) await del(key)
    const uncovered = suite === 'print' ? await coverage() : []
    const started = performance.now()
    let elements = 0
    for (const [i, route] of routes.entries()) {
      const win = await load(route, cfg)
      await prepare(win, cfg, inject)
      const lines = snapshot(win, cfg)
      elements += lines.length
      await put(`${label}|${keyOf(route)}`, { route: keyOf(route), lines })
      console.log(`[print-gate ${label}] ${String(i + 1).padStart(2)}/${routes.length} ${keyOf(route)}  ${lines.length} el`)
    }
    close()
    const meta = {
      label,
      suite,
      version: GATE_VERSION,
      routes: routes.map(keyOf),
      fields: [...FIELDS, '|', ...PSEUDO_FIELDS],
      origin: location.origin,
      date: new Date().toISOString(),
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio,
      injected: inject || '',
      uncovered,
      elements,
    }
    await put(`${label}|__meta`, meta)
    const secs = Math.round((performance.now() - started) / 1000)
    console.log(`[print-gate ${label}] ${routes.length} routes, ${elements} elements recorded in ${secs}s`)
    return { label, suite, routes: routes.length, elements }
  }

  function describeDiff(a, b) {
    if (!a) return 'added in candidate: ' + b[1]
    if (!b) return 'missing in candidate: ' + a[1]
    const fields = fieldsFor(a[0])
    const changed = []
    for (let k = 1; k < Math.max(a.length, b.length); k++) {
      if (a[k] !== b[k]) changed.push(`${fields[k - 1]}: ${a[k]} -> ${b[k]}`)
    }
    return `${b[1]}  ${changed.slice(0, 4).join(' ; ')}${changed.length > 4 ? ` (+${changed.length - 4} more)` : ''}`
  }

  async function compare(before = 'before', after = 'after', { examples = 5 } = {}) {
    const ma = await get(`${before}|__meta`)
    const mb = await get(`${after}|__meta`)
    if (!ma || !mb) throw new Error(`no stored run for "${!ma ? before : after}"; see printGate.labels()`)
    if (ma.suite !== mb.suite) throw new Error(`suites differ: ${ma.suite} vs ${mb.suite}`)
    if (ma.version !== mb.version || ma.fields.join() !== mb.fields.join()) {
      throw new Error('the runs used different gate versions; re-run both')
    }
    if (ma.devicePixelRatio !== mb.devicePixelRatio) {
      throw new Error(`devicePixelRatio differs (${ma.devicePixelRatio} vs ${mb.devicePixelRatio}): same window, 100% zoom`)
    }
    const ordered = SUITES[ma.suite].ordered
    const routes = [...new Set([...ma.routes, ...mb.routes])]
    const table = []
    let differing = 0
    let total = 0
    for (const route of routes) {
      const ra = await get(`${before}|${route}`)
      const rb = await get(`${after}|${route}`)
      if (!ra || !rb) {
        table.push({ route, before: ra ? ra.lines.length : '-', after: rb ? rb.lines.length : '-', diffs: 'NOT RUN' })
        differing++
        continue
      }
      let diffs = 0
      const notes = []
      if (ordered) {
        const A = new Map(ra.lines.map((l) => [l[0], l]))
        const B = new Map(rb.lines.map((l) => [l[0], l]))
        for (const key of new Set([...A.keys(), ...B.keys()])) {
          const a = A.get(key)
          const b = B.get(key)
          if (a && b && a.join('\u0001') === b.join('\u0001')) continue
          diffs++
          if (notes.length < examples) notes.push(`${key}  ${describeDiff(a, b)}`)
        }
      } else {
        const count = new Map()
        for (const l of ra.lines) count.set(l.slice(1).join('\u0001'), (count.get(l.slice(1).join('\u0001')) || 0) + 1)
        for (const l of rb.lines) count.set(l.slice(1).join('\u0001'), (count.get(l.slice(1).join('\u0001')) || 0) - 1)
        for (const [line, n] of count) {
          if (n === 0) continue
          diffs += Math.abs(n)
          if (notes.length < examples) notes.push(`${n > 0 ? 'only before' : 'only after'} x${Math.abs(n)}: ${line.split('\u0001').slice(0, 3).join(' ')}`)
        }
      }
      total += rb.lines.length
      if (diffs) differing++
      table.push({ route, before: ra.lines.length, after: rb.lines.length, diffs })
      if (diffs) console.warn(`[print-gate] ${route}: ${diffs} differing element(s)\n  ` + notes.join('\n  '))
    }
    console.table(table)
    const pass = differing === 0
    console.log(
      `%c${ma.suite === 'print' ? 'PRINT' : 'STAGE'} GATE ${pass ? 'PASS' : 'FAIL'}: ${routes.length} routes, ${total} elements, ${differing} route(s) with differences`,
      `font-weight:bold;color:${pass ? 'green' : 'red'}`,
    )
    if (mb.injected) console.warn(`[print-gate] "${after}" ran with injected CSS: ${mb.injected}`)
    if (mb.uncovered && mb.uncovered.length) console.warn(`[print-gate] NOT COVERED: ${mb.uncovered.join(', ')}`)
    return { pass, routes: routes.length, elements: total, routesWithDifferences: differing }
  }

  async function labels() {
    const out = {}
    for (const key of await allKeys()) {
      const [label, route] = String(key).split('|')
      if (route === '__meta') {
        const m = await get(key)
        out[label] = `${m.suite}: ${m.routes.length} routes, ${m.elements} elements, ${m.date}`
      }
    }
    return out
  }

  async function download(label) {
    const meta = await get(`${label}|__meta`)
    if (!meta) throw new Error(`no stored run "${label}"`)
    const runs = []
    for (const route of meta.routes) runs.push(await get(`${label}|${route}`))
    const blob = new Blob([JSON.stringify({ meta, runs })], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `print-gate-${label}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    return a.download
  }

  async function clear(label) {
    for (const key of await allKeys()) if (!label || String(key).startsWith(`${label}|`)) await del(key)
    return label ? `cleared "${label}"` : 'cleared all runs'
  }

  // Leave one route on screen, print-emulated, to look at a difference.
  // `route` is a route as the log and the console table name it.
  async function inspect(route, suite = 'print') {
    const cfg = SUITES[suite]
    const entry = cfg.routes().find((r) => keyOf(r) === route) || route
    const win = await load(entry, cfg)
    await prepare(win, cfg, null)
    frame.style.pointerEvents = 'auto'
    return `showing ${route} (${suite}); printGate.close() removes it`
  }

  window.printGate = { run, compare, labels, download, clear, inspect, close, SUITES, PROPS }
  console.log('printGate ready: await printGate.run({ label: "before" }) ... see the header comment')
})()
```

**How to run it** (the same procedure for every phase):

1. **Tag the baseline and start the branch, once.** Do this after the four functional fixes are merged to `main`, and before the first PRD 19 source commit. Run it in the repository's main checkout, which becomes the PRD 19 worktree:
   ```sh
   git switch main && git pull
   git tag album-baseline
   git worktree add ../mm-album-baseline album-baseline
   (cd ../mm-album-baseline && npm ci)
   git switch -c album album-baseline
   ```
   Then create `plan/19-the-album/print-gate.js` here, on `album`, with the content above. Once the **Check** below passes, commit it as Phase 0: "Add the PRD 19 print regression gate". Every later phase commits on `album` in this checkout. `../mm-album-baseline` stays at the tag and never gets the gate file.
2. **Record the baseline.**
   - Start the baseline dev server: `cd ../mm-album-baseline && npx vite --port 5199 --strictPort`.
   - Open Chrome at `http://localhost:5199/` at 100% zoom (any window size), and open DevTools › Console.
   - Paste the whole of `plan/19-the-album/print-gate.js` from the PRD 19 worktree (the `album` branch), because the baseline tree doesn't have it. The first time, Chrome asks you to type `allow pasting`.
   - Run `await printGate.run({ label: 'before' })`. It takes about a minute and logs 50 lines. Keep the tab in front.
   - Then run `await printGate.run({ label: 'stages-before', suite: 'stages' })` and `await printGate.run({ label: 'stages390-before', suite: 'stages390' })`.
   - Stop the server with Ctrl-C.
3. **Record the candidate.**
   - In the PRD 19 worktree, run `npx vite --port 5199 --strictPort`.
   - Reload the tab (the Vite client may reload it for you) and paste the script again.
   - Run `await printGate.run({ label: 'after' })`, `await printGate.run({ label: 'stages-after', suite: 'stages' })` and `await printGate.run({ label: 'stages390-after', suite: 'stages390' })`.
4. **Compare.**
   - Run `await printGate.compare('before', 'after')`, `await printGate.compare('stages-before', 'stages-after')` and `await printGate.compare('stages390-before', 'stages390-after')`.
   - Pass means a 50-row console table and a green `PRINT GATE PASS: 50 routes, … 0 route(s) with differences`, then a 21-row and a 19-row table, each with a green `STAGE GATE PASS`.
   - Anything else fails. The console names each differing element by its path under the sheet (`0:r/0/2/1`), as `x:<n>` for something printing outside the sheets, or as `page` for the printed height, and lists up to four changed properties. `await printGate.inspect('<route>')` shows that route print-emulated, with the route written as the log names it (for example `'/materials/addition-charts > Print control charts'`); `printGate.close()` removes it.
5. **Later phases** re-run only items 3 and 4. The baselines stay in IndexedDB for `http://localhost:5199`. Clearing that origin's site data deletes them; then repeat item 2. `await printGate.download('before')` saves a JSON copy for the record.

The only accepted reason for a difference is an owner-approved print-content change from PRD 20. That change is then re-baselined with a new tag.

**Check:**
- `node --check plan/19-the-album/print-gate.js` passes.
- Self-test on the baseline server (write each call as `await printGate.…`):
  - `run({label:'a'})` then `run({label:'b'})`, then `compare('a','b')`: PASS. The eight material-page lines (`/materials/… > …`) each record more than 0 elements; a missing button would throw instead.
  - `run({label:'sa', suite:'stages'})`, `run({label:'sb', suite:'stages'})`, `compare('sa','sb')`: `STAGE GATE PASS`. The same for `suite:'stages390'`: PASS. (Run each twice if one fails, and note which material differed; a material whose layout is random at that width belongs in the suite's skip list.)
  - Run `run({label:'o', only:['multi-digit-ops','/planner']})`. Then `run({label:'s', only:['multi-digit-ops','/planner'], inject:'@media screen { .print-sheet .sheet-page { padding: 3in } }'})`. `compare('o','s')`: PASS, because screen-only rules are ignored.
  - The same with `inject:'.sheet-header { margin-bottom: 0.36in }'`: FAIL on every route run.
  - The same with `inject:'.planner-preview { margin-top: 3rem }'`: FAIL on the two planner routes only (the sheet's page offset).
  - The same with `inject:'footer.site-footer { display: block !important }'`: FAIL on every route run (chrome outside the sheets would print).
  - `run({label:'g1', suite:'stages', only:['golden-beads','stamp-game']})`, then `g2` with `inject:'.material-stage { box-shadow: none !important; border-radius: 0 !important }'`: `compare('g1','g2')` PASSes, because the plate mount is not compared. Then `g3` with `inject:'.material-stage { padding: 2rem !important }'`: `compare('g1','g3')` FAILs on both routes.
- The run logs no `NOT COVERED` warning.
