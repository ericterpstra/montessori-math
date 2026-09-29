/* THE ALBUM (final): markup shim. MOCKUP ONLY.
   Stands in for the JSX changes the build would make (Icon.tsx, PageHeader.tsx,
   MaterialThumb.tsx, contents-row markup in the index pages, the .material-utility
   group and plate figcaption in MaterialShell, the colophon links in Layout).
   It only adds classes/elements or regroups existing nodes; it never changes
   material components. mock.css targets the classes this creates, so the CSS has
   no :has(), [style] or CSS-generated captions. */
window.__SHIM = function (doc) {
  if (!doc || doc.documentElement.dataset.shim) return 'skip';
  doc.documentElement.dataset.shim = '1';
  const errs = [];
  const $ = (s, r) => (r || doc).querySelector(s);
  const $$ = (s, r) => [...(r || doc).querySelectorAll(s)];
  const path = doc.defaultView.location.pathname.replace(/\/+$/, '') || '/';
  const el = (tag, cls, html) => { const e = doc.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const run = (name, fn) => { try { fn(); } catch (e) { errs.push(name + ': ' + e.message); } };

  /* ---------- Icon.tsx: 24-grid, 2px round stroke, currentColor, 20px ---------- */
  const ICON = {
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><rect x="6.5" y="14" width="11" height="7" rx="1"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
    sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.8 6.2a8 8 0 0 1 0 11.6"/>',
    'sound-off': '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>',
    focus: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    book: '<path d="M2.5 5.5c3-1.6 6.5-1.6 9.5.8v13c-3-2.3-6.5-2.3-9.5-.8z"/><path d="M21.5 5.5c-3-1.6-6.5-1.6-9.5.8v13c3-2.3 6.5-2.3 9.5-.8z"/>',
    pencil: '<path d="M4 20l1.2-4.8L16 4.4a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L8.8 18.8z"/><path d="M14 6.5l3.5 3.5"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 8.5L20 20M8.5 15.5L20 4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.7.3-1.2 1-1.2 1.7v.4"/><path d="M12 17h.01"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  };
  const icon = (name, cls) => el('span', 'icon-wrap', '<svg class="icon' + (cls ? ' ' + cls : '') + '" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICON[name] + '</svg>').firstChild;
  const EMOJI = /[\u{1F300}-\u{1FAFF}☀-➿⬀-⯿️✕]\s*/gu;
  // <button><Icon name/> <span class="btn-label">text</span></button>
  const iconize = (btn, name) => {
    if (!btn || btn.querySelector('.icon')) return;
    const t = btn.textContent.replace(EMOJI, '').trim();
    btn.textContent = '';
    btn.append(icon(name), el('span', 'btn-label', t));
  };
  const beadIcon = (name, text) => { for (const [re, n] of name) if (re.test(text)) return n; return null; };

  /* ---------- MaterialThumb.tsx stand-ins: tiny live-token miniatures (62x38) ---------- */
  const f = (n) => Math.round(n * 100) / 100;
  const bead = (x, y, r, fill) => '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(r) + '" fill="' + fill + '" stroke="var(--bead-outline)" stroke-width="' + f(Math.max(0.25, r * 0.14)) + '"/>' + (r > 1.3 ? '<circle cx="' + f(x - r * 0.32) + '" cy="' + f(y - r * 0.36) + '" r="' + f(r * 0.34) + '" fill="var(--bead-sheen)" opacity=".5"/>' : '');
  const bar = (x, y, n, d, fill, vertical) => {
    let s = vertical
      ? '<line x1="' + f(x) + '" y1="' + f(y - d / 2) + '" x2="' + f(x) + '" y2="' + f(y + (n - 0.5) * d) + '" stroke="var(--bead-wire)" stroke-width=".5"/>'
      : '<line x1="' + f(x - d / 2) + '" y1="' + f(y) + '" x2="' + f(x + (n - 0.5) * d) + '" y2="' + f(y) + '" stroke="var(--bead-wire)" stroke-width=".5"/>';
    for (let i = 0; i < n; i++) s += vertical ? bead(x, y + i * d, d * 0.47, fill) : bead(x + i * d, y, d * 0.47, fill);
    return s;
  };
  const rect = (x, y, w, h, fill, extra) => '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" style="fill:' + fill + '" ' + (extra || '') + '/>';
  const txt = (x, y, s, size, fill, extra) => '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + size + '" text-anchor="middle" style="fill:' + fill + ';font-family:var(--font-numeral);font-weight:700" ' + (extra || '') + '>' + s + '</text>';
  const board = (x, y, w, h, fill) => rect(x, y, w, h, fill || 'var(--wood)', 'rx="1.2" stroke="var(--wood-dark)" stroke-width=".7"');
  const PV = ['var(--pv-unit)', 'var(--pv-ten)', 'var(--pv-hundred)'];
  const tint = (c) => 'color-mix(in srgb, ' + c + ' 42%, var(--card))';
  const golden = { cube(x, y, s) { const d = s * 0.28; let o = '<polygon points="' + [x + d, y, x + s + d, y, x + s, y + d, x, y + d].map(f).join(',') + '" style="fill:var(--golden-light)" stroke="var(--golden-dark)" stroke-width=".4"/>' + '<polygon points="' + [x + s + d, y, x + s + d, y + s, x + s, y + s + d, x + s, y + d].map(f).join(',') + '" style="fill:var(--golden-dark)"/>' + rect(x, y + d, s, s, 'var(--golden-light)', 'stroke="var(--golden-dark)" stroke-width=".4"'); for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) o += '<circle cx="' + f(x + s * (i + 0.5) / 5) + '" cy="' + f(y + d + s * (j + 0.5) / 5) + '" r="' + f(s / 12) + '" style="fill:var(--golden)"/>'; return o; },
    square(x, y, s) { let o = rect(x, y, s, s, 'var(--golden-light)', 'stroke="var(--golden-dark)" stroke-width=".4"'); for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) o += '<circle cx="' + f(x + s * (i + 0.5) / 6) + '" cy="' + f(y + s * (j + 0.5) / 6) + '" r="' + f(s / 14) + '" style="fill:var(--golden)"/>'; return o; } };

  const T = {
    'bead-stair': () => { let s = ''; for (let n = 1; n <= 9; n++) s += bar(14.5, 3.2 + (n - 1) * 3.95, n, 3.95, 'var(--bead-' + n + ')'); return s; },
    'cards-and-counters': () => { let s = ''; for (let k = 0; k < 5; k++) { const n = k + 1, x = 4 + k * 11.6; s += rect(x, 2.5, 9.4, 11, 'var(--card)', 'rx="1" stroke="var(--line-strong)" stroke-width=".5"') + txt(x + 4.7, 11, n, 8, 'var(--ink)'); for (let i = 0; i < n; i++) { const row = Math.floor(i / 2), odd = n % 2 === 1 && i === n - 1; s += bead(x + 4.7 + (odd ? 0 : i % 2 ? 2.1 : -2.1), 19 + row * 4.4, 1.75, 'var(--bead-1)'); } } return s; },
    'teen-board': () => { let s = board(3, 2.5, 30, 33); for (let r = 0; r < 4; r++) { const y = 5 + r * 7.8; s += rect(5.5, y, 25, 6, 'var(--card)', 'rx=".6"') + txt(14, y + 5, '1', 5.6, 'var(--ink)') + (r === 1 ? rect(18, y - 0.6, 7.2, 7.2, 'var(--card)', 'rx=".6" stroke="var(--line-strong)" stroke-width=".5"') + txt(21.6, y + 5, '3', 5.6, 'var(--ink)') : txt(21.6, y + 5, '0', 5.6, 'var(--ink)')); } s += bar(40, 5.3, 10, 2.95, 'var(--golden)', true) + bar(44.4, 5.3, 3, 2.95, 'var(--bead-3)', true) + bar(51, 5.3, 10, 2.95, 'var(--golden)', true) + bar(55.4, 5.3, 4, 2.95, 'var(--bead-4)', true); return s; },
    'ten-board': () => { let s = board(3, 2.5, 30, 33); ['10', '20', '30', '40'].forEach((t, r) => { const y = 5 + r * 7.8; s += rect(5.5, y, 25, 6, 'var(--card)', 'rx=".6"') + txt(18, y + 5, t, 5.6, 'var(--ink)'); }); for (let k = 0; k < 3; k++) s += bar(40 + k * 4.2, 5.3, 10, 2.95, 'var(--golden)', true); return s; },
    'hundred-board': () => { let s = board(12, 1.5, 36, 35); for (let i = 0; i < 100; i++) { const c = i % 10, r = Math.floor(i / 10); s += rect(13.4 + c * 3.34, 2.9 + r * 3.24, 2.9, 2.8, i < 46 ? 'var(--card)' : 'color-mix(in srgb, var(--wood-dark) 45%, var(--wood))', 'rx=".3"'); } s += rect(51, 10, 5, 5, 'var(--card)', 'rx=".4" stroke="var(--line-strong)" stroke-width=".4" transform="rotate(-12 53.5 12.5)"') + rect(52, 20, 5, 5, 'var(--card)', 'rx=".4" stroke="var(--line-strong)" stroke-width=".4" transform="rotate(9 54.5 22.5)"'); return s; },
    'bead-chains': () => { let s = ''; const d = 2.75, y = [9, 20, 31]; for (let r = 0; r < 3; r++) { const x0 = r % 2 ? 53 - 15 * d + d / 2 : 9 + d / 2; for (let b = 0; b < 3; b++) s += bar(x0 + b * 5 * d, y[r], 5, d, 'var(--bead-5)'); } s += '<path d="M' + f(9 + 15 * d) + ' 9c4.5 0 4.5 11 0 11M' + f(53 - 15 * d) + ' 20c-4.5 0-4.5 11 0 11" fill="none" stroke="var(--bead-wire)" stroke-width=".7"/>'; [9 + 5 * d, 9 + 10 * d, 9 + 15 * d].forEach((x) => { s += rect(x - 3, 1.6, 6, 3.6, 'var(--card)', 'stroke="var(--pv-ten)" stroke-width=".6"'); }); return s; },
    'golden-beads': () => golden.cube(4, 9, 16) + golden.square(27, 15.5, 14) + bar(47.5, 5, 10, 2.9, 'var(--golden)', true) + bead(55, 31, 1.7, 'var(--golden)'),
    'number-cards': () => { let s = ''; [['1000', 'var(--pv-thousand)'], ['200', 'var(--pv-hundred)'], ['30', 'var(--pv-ten)'], ['4', 'var(--pv-unit)']].forEach(([t, c], i) => { const w = t.length * 4.6 + 3, y = 1.6 + i * 8.9; s += rect(42 - w, y, w, 8, 'var(--card)', 'rx=".6" stroke="var(--line-strong)" stroke-width=".45"') + txt(42 - w / 2, y + 6.5, t, 7.2, c); }); return s; },
    'snake-game': () => { const d = 3; let s = '', x = 8; [[3, 3], [7, 7], [5, 5]].forEach(([n, c]) => { s += bar(x, 7, n, d, 'var(--bead-' + c + ')'); x += n * d; }); x = 8 + 15 * d; s += '<path d="M' + f(x - d / 2) + ' 7c4.5 0 4.5 11 0 11" fill="none" stroke="var(--bead-wire)" stroke-width=".7"/>'; [[8, 8], [6, 6]].forEach(([n, c]) => { x -= n * d; s += bar(x + d, 18, n, d, 'var(--bead-' + c + ')'); }); s += bar(8, 30.5, 10, d, 'var(--golden)') + bar(41, 30.5, 4, d, 'var(--bead-4)'); return s; },
    'addition-strip-board': () => { let s = rect(3, 3, 56, 32, 'var(--card)', 'stroke="var(--wood-dark)" stroke-width="1"'); const cw = 56 / 13; for (let c = 1; c < 13; c++) s += '<line x1="' + f(3 + c * cw) + '" y1="3" x2="' + f(3 + c * cw) + '" y2="35" stroke="var(--line-strong)" stroke-width=".3"/>'; s += '<line x1="' + f(3 + 10 * cw) + '" y1="3" x2="' + f(3 + 10 * cw) + '" y2="35" stroke="var(--pv-hundred)" stroke-width=".9"/>'; for (let c = 0; c < 13; c++) s += rect(3.8 + c * cw, 4, cw - 1.6, 2.2, c < 10 ? 'var(--pv-hundred)' : 'var(--pv-ten)', 'opacity=".8"'); const strip = (y, n, c, off) => rect(3.4 + off * cw, y, n * cw - 0.8, 4.2, c, 'rx=".5"'); s += strip(12, 5, 'var(--pv-ten)', 0) + strip(12, 4, 'var(--pv-hundred)', 5) + strip(20, 3, 'var(--pv-ten)', 0) + strip(20, 6, 'var(--pv-hundred)', 3) + strip(28, 7, 'var(--pv-ten)', 0); return s; },
    'subtraction-strip-board': () => { let s = rect(3, 3, 56, 32, 'var(--card)', 'stroke="var(--wood-dark)" stroke-width="1"'); const cw = 56 / 13; for (let c = 1; c < 13; c++) s += '<line x1="' + f(3 + c * cw) + '" y1="3" x2="' + f(3 + c * cw) + '" y2="35" stroke="var(--line-strong)" stroke-width=".3"/>'; for (let c = 0; c < 13; c++) s += rect(3.8 + c * cw, 4, cw - 1.6, 2.2, c < 9 ? 'var(--pv-ten)' : 'var(--pv-hundred)', 'opacity=".8"'); s += rect(3.4 + 9 * cw, 3.4, 4 * cw - 0.8, 3.6, 'var(--wood)', 'stroke="var(--wood-dark)" stroke-width=".4"') + rect(3.4, 12, 4 * cw - 0.8, 4.2, 'var(--pv-ten)', 'rx=".5"') + rect(3.4 + 4 * cw, 12, 5 * cw - 0.8, 4.2, 'var(--wood)', 'rx=".5" stroke="var(--wood-dark)" stroke-width=".4"') + rect(3.4, 20, 6 * cw - 0.8, 4.2, 'var(--pv-ten)', 'rx=".5"') + rect(3.4, 28, 2 * cw - 0.8, 4.2, 'var(--pv-ten)', 'rx=".5"'); return s; },
    'multiplication-bead-board': () => { let s = board(15, 1.5, 33, 35, 'var(--paper-warm)'); for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) { const x = 18 + c * 3, y = 6 + r * 3; s += r < 4 && c < 6 ? bead(x, y, 1.3, 'var(--bead-1)') : '<circle cx="' + x + '" cy="' + y + '" r=".6" style="fill:var(--line-strong)"/>'; } s += '<circle cx="' + (18 + 5 * 3) + '" cy="3.3" r="1.3" style="fill:var(--bead-1)"/>' + rect(4, 13, 8, 10, 'var(--card)', 'rx=".6" stroke="var(--line-strong)" stroke-width=".45"') + txt(8, 20.6, '6', 7, 'var(--ink)'); return s; },
    'division-board': () => { let s = board(8, 12, 46, 24, 'var(--paper-warm)'); const sk = (x, y) => '<path d="M' + f(x) + ' ' + f(y + 3) + 'c-1 0-1.4.7-1.3 1.6.1.8 0 1.4-.4 2.3-.7 1.8-1 3.7-1 5.6v1.1c0 1.2 1 1.8 2.7 1.8s2.7-.6 2.7-1.8v-1.1c0-1.9-.3-3.8-1-5.6-.4-.9-.5-1.5-.4-2.3.1-.9-.3-1.6-1.3-1.6z" style="fill:var(--pv-unit)" stroke="var(--bead-outline)" stroke-width=".3"/><circle cx="' + f(x) + '" cy="' + f(y + 1.3) + '" r="1.6" style="fill:var(--pv-unit)" stroke="var(--bead-outline)" stroke-width=".3"/>'; for (let k = 0; k < 4; k++) s += sk(14 + k * 7, 0.9); for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) { const x = 14 + c * 4.8, y = 16 + r * 4.3; s += c < 4 && r < 3 ? bead(x, y, 1.45, 'var(--pv-unit)') : '<circle cx="' + f(x) + '" cy="' + f(y) + '" r=".6" style="fill:var(--line-strong)"/>'; } return s; },
    'addition-charts': () => { let s = ''; const cs = 3.2, x0 = 14, y0 = 2.5; for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) { const x = x0 + c * cs, y = y0 + r * cs; if (r === 0 && c === 0) continue; const fill = r === 0 ? tint('var(--pv-ten)') : c === 0 ? tint('var(--pv-hundred)') : r + c <= 11 ? 'var(--card)' : 'var(--paper-warm)'; s += rect(x, y, cs, cs, fill, 'stroke="var(--line-strong)" stroke-width=".22"'); if (r > 0 && c > 0 && r + c <= 11) s += '<circle cx="' + f(x + cs / 2) + '" cy="' + f(y + cs / 2) + '" r=".45" style="fill:var(--ink-soft)"/>'; } return s; },
    'multiplication-charts': () => { let s = ''; const cs = 3.2, x0 = 14, y0 = 2.5; for (let r = 0; r < 11; r++) for (let c = 0; c < 11; c++) { const x = x0 + c * cs, y = y0 + r * cs; if (r === 0 && c === 0) continue; const hit = (r === 6 && c > 0 && c <= 7) || (c === 7 && r > 0 && r <= 6); const fill = r === 0 ? tint('var(--pv-ten)') : c === 0 ? tint('var(--pv-hundred)') : hit ? tint('var(--pv-unit)') : 'var(--card)'; s += rect(x, y, cs, cs, fill, 'stroke="var(--line-strong)" stroke-width=".22"'); if (r > 0 && c > 0) s += '<circle cx="' + f(x + cs / 2) + '" cy="' + f(y + cs / 2) + '" r=".45" style="fill:var(--ink-soft)"/>'; } s += rect(x0 + 7 * cs, y0 + 6 * cs, cs, cs, 'none', 'stroke="var(--ink)" stroke-width=".7"'); return s; },
    'stamp-game': () => { let s = ''; const cols = [[2, 'var(--pv-thousand)', '1000'], [3, 'var(--pv-hundred)', '100'], [4, 'var(--pv-ten)', '10'], [5, 'var(--pv-unit)', '1']]; cols.forEach(([n, c, t], k) => { for (let i = 0; i < n; i++) { const x = 5 + k * 14 + (i % 2) * 6.4, y = 3 + Math.floor(i / 2) * 7.2; s += rect(x, y, 5.8, 5.8, c, 'rx=".7" stroke="rgba(0,0,0,.35)" stroke-width=".35"') + '<text x="' + f(x + 2.9) + '" y="' + f(y + 3.9) + '" font-size="' + (t.length > 2 ? 2.1 : 3) + '" text-anchor="middle" style="fill:#fff;font-weight:700;font-family:var(--font-ui)">' + t + '</text>'; } }); s += rect(3, 26.5, 56, 9, 'var(--wood)', 'rx="1" stroke="var(--wood-dark)" stroke-width=".6"'); for (let k = 1; k < 4; k++) s += '<line x1="' + (3 + k * 14) + '" y1="27" x2="' + (3 + k * 14) + '" y2="35" stroke="var(--wood-dark)" stroke-width=".6"/>'; return s; },
    'bead-frame': () => { let s = rect(5, 2.5, 52, 33, 'var(--card)', 'rx="1" stroke="var(--wood)" stroke-width="2.6"'); const rows = [[3, 'var(--pv-unit)'], [6, 'var(--pv-ten)'], [2, 'var(--pv-hundred)'], [1, 'var(--pv-thousand)']]; rows.forEach(([right, c], r) => { const y = 9 + r * 6.6; s += '<line x1="6.5" y1="' + y + '" x2="55.5" y2="' + y + '" stroke="var(--bead-wire)" stroke-width=".5"/>'; for (let i = 0; i < 10 - right; i++) s += bead(9 + i * 2.95, y, 1.38, c); for (let j = 0; j < right; j++) s += bead(53 - j * 2.95, y, 1.38, c); }); return s; },
    checkerboard: () => { let s = rect(6, 2, 50, 34, 'var(--wood)', 'rx="1" stroke="var(--wood-dark)" stroke-width="1.6"'); const cs = 6.5; for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const fromRight = 6 - c, fromBottom = 4 - r; s += rect(8.2 + c * cs, 4 + r * cs, cs - 0.4, cs - 0.4, tint(PV[(fromRight + fromBottom) % 3])); } s += bar(8.2 + 5 * cs + 1.2, 4 + 4 * cs + 3, 4, 1.1, 'var(--bead-4)') + bar(8.2 + 4 * cs + 1.2, 4 + 3 * cs + 3, 3, 1.3, 'var(--bead-3)') + bar(8.2 + 6 * cs + 1.2, 4 + 3 * cs + 2, 6, 0.85, 'var(--bead-6)'); return s; },
    'racks-and-tubes': () => { let s = board(3, 4, 27, 30); [['var(--pv-unit)', 7], ['var(--pv-ten)', 5], ['var(--pv-hundred)', 8]].forEach(([c, n], r) => { const y = 10 + r * 9; s += '<line x1="5" y1="' + y + '" x2="28" y2="' + y + '" stroke="var(--wood-dark)" stroke-width=".6"/>'; for (let i = 0; i < n; i++) s += bead(7 + i * 2.6, y, 1.2, c); }); [['var(--pv-unit)', 7], ['var(--pv-ten)', 4], ['var(--pv-hundred)', 6]].forEach(([c, n], k) => { const x = 36 + k * 8.4; s += rect(x, 5, 6.2, 30, 'var(--card)', 'rx="3" stroke="var(--line-strong)" stroke-width=".5"') + rect(x - 0.4, 3.2, 7, 3, c, 'rx=".8"'); for (let i = 0; i < n; i++) s += bead(x + 1.75 + (i % 2) * 2.7, 31.5 - Math.floor(i / 2) * 2.8, 1.25, c); }); return s; },
    'fraction-circles': () => { let s = rect(5, 3, 32, 32, 'var(--inset-frame)', 'rx="2.2"') + '<circle cx="21" cy="19" r="12.6" style="fill:color-mix(in srgb, var(--inset-frame) 70%, #000)"/>'; s += '<path d="M21 19V6.4A12.6 12.6 0 1 1 8.4 19z" style="fill:var(--fraction-shade)" stroke="var(--card)" stroke-width=".6"/><path d="M21 19v12.6M21 19H33.6" stroke="var(--card)" stroke-width=".6"/>'; s += '<path d="M44 29V16.4A12.6 12.6 0 0 1 56.6 29z" style="fill:var(--fraction-shade)" stroke="var(--bead-outline)" stroke-width=".3" transform="rotate(-10 50 23)"/>'; return s; },
    'decimal-board': () => { let s = rect(3, 3, 56, 32, 'var(--card)', 'rx="1" stroke="var(--line-strong)" stroke-width=".5"'); const cols = ['var(--pv-unit)', 'var(--pv-tenth)', 'var(--pv-hundredth)', 'var(--pv-thousandth)']; const n = [1, 3, 2, 4]; cols.forEach((c, k) => { const x = 3 + k * 14; s += rect(x + 0.6, 3.6, 12.8, 4.2, c) + (k ? '<line x1="' + x + '" y1="3" x2="' + x + '" y2="35" stroke="var(--line-strong)" stroke-width=".4"/>' : ''); for (let i = 0; i < n[k]; i++) { const bx = x + 4 + (i % 2) * 5.5, by = 13 + Math.floor(i / 2) * 6.5; s += k === 0 ? rect(bx - 1.4, by - 2.8, 7.4, 7.4, 'var(--pv-unit)', 'rx=".6"') : bead(bx, by, 2.1, c); } }); s += '<circle cx="' + (3 + 14 - 0.1) + '" cy="33" r="1.1" style="fill:var(--ink)"/>'; return s; },
    // generic glyphs: worksheets (a sheet with its answer key behind) and kits (cut pieces + scissors)
    sheet: () => { let s = rect(24, 4.5, 22, 30, 'var(--paper-warm)', 'stroke="var(--line-strong)" stroke-width=".5" transform="rotate(6 35 20)"') + rect(16, 3, 23, 31.5, 'var(--card)', 'stroke="var(--line-strong)" stroke-width=".5"') + '<line x1="18.5" y1="7" x2="36.5" y2="7" stroke="var(--ink)" stroke-width=".8"/>'; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = 19 + c * 6.3, y = 11 + r * 7.2; s += '<line x1="' + f(x + 1) + '" y1="' + y + '" x2="' + f(x + 4) + '" y2="' + y + '" stroke="var(--ink-soft)" stroke-width=".7"/><line x1="' + f(x) + '" y1="' + f(y + 2) + '" x2="' + f(x + 4) + '" y2="' + f(y + 2) + '" stroke="var(--ink-soft)" stroke-width=".7"/><line x1="' + f(x) + '" y1="' + f(y + 3.6) + '" x2="' + f(x + 4.2) + '" y2="' + f(y + 3.6) + '" stroke="var(--ink)" stroke-width=".45"/>'; } return s; },
    kit: () => { let s = rect(6, 3, 30, 32, 'var(--card)', 'stroke="var(--line-strong)" stroke-width=".5"'); for (let c = 1; c < 3; c++) s += '<line x1="' + (6 + c * 10) + '" y1="3" x2="' + (6 + c * 10) + '" y2="35" stroke="var(--ink-soft)" stroke-width=".45" stroke-dasharray="1.4 1"/>'; for (let r = 1; r < 3; r++) s += '<line x1="6" y1="' + f(3 + r * 10.67) + '" x2="36" y2="' + f(3 + r * 10.67) + '" stroke="var(--ink-soft)" stroke-width=".45" stroke-dasharray="1.4 1"/>'; s += rect(27, 24.4, 8.4, 9.9, 'var(--paper-warm)') + rect(40, 21, 9.6, 10.4, 'var(--card)', 'stroke="var(--line-strong)" stroke-width=".5" transform="rotate(-14 45 26)"'); s += '<g transform="translate(40 3) scale(.62)" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round">' + ICON.scissors + '</g>'; return s; },
    album: () => { let s = rect(14, 2.5, 34, 33, 'var(--card)', 'stroke="var(--line-strong)" stroke-width=".5"') + '<line x1="20" y1="7" x2="42" y2="7" stroke="var(--ink)" stroke-width="1.1"/><line x1="17" y1="10" x2="45" y2="10" stroke="var(--ink)" stroke-width=".4"/>'; for (let r = 0; r < 4; r++) { const y = 14 + r * 5.3; s += '<line x1="17" y1="' + y + '" x2="22" y2="' + y + '" stroke="var(--ink)" stroke-width=".7"/>' + '<text x="25.6" y="' + f(y + 1.2) + '" font-size="3.4" text-anchor="middle" style="fill:var(--accent);font-style:italic;font-family:var(--font-numeral)">' + (r + 1) + '</text>' + '<line x1="28" y1="' + y + '" x2="' + (44 - (r % 2) * 5) + '" y2="' + y + '" stroke="var(--ink-soft)" stroke-width=".55"/><line x1="28" y1="' + f(y + 2.2) + '" x2="' + (41 - (r % 3) * 3) + '" y2="' + f(y + 2.2) + '" stroke="var(--ink-soft)" stroke-width=".55"/>'; } return s; },
  };
  // <figure class="plate"><MaterialThumb slug/></figure>
  const plate = (key, extra) => { const draw = T[key]; if (!draw) return null; const fig = el('figure', 'plate' + (extra ? ' ' + extra : '')); fig.setAttribute('aria-hidden', 'true'); fig.dataset.thumb = key; fig.innerHTML = '<svg class="plate-art" viewBox="0 0 62 38" width="62" height="38" focusable="false">' + draw() + '</svg>'; return fig; };
  window.__THUMBS = T;

  // <BeadBar n={strand.order} beadSize={9}/> (same drawing as beads.tsx)
  const beadBar = (n, size) => { const u = 20, L = n * u; let s = '<svg class="strand-bar" width="' + f(size * n) + '" height="' + size + '" viewBox="0 0 ' + L + ' ' + u + '" aria-hidden="true" focusable="false"><line x1="4" y1="10" x2="' + (L - 4) + '" y2="10" stroke="var(--bead-wire)" stroke-width="1.5"/>'; for (let i = 0; i < n; i++) { const cx = i * u + 10; s += '<g><circle cx="' + cx + '" cy="10" r="9" fill="var(--bead-' + n + ')" stroke="var(--bead-outline)" stroke-width="0.81"/><ellipse cx="' + (cx + 2.52) + '" cy="12.88" rx="4.05" ry="2.88" fill="var(--bead-shade)" opacity="0.14"/><ellipse cx="' + (cx - 2.7) + '" cy="6.85" rx="3.42" ry="2.34" fill="var(--bead-sheen)" opacity="0.4"/></g>'; } return el('span', 'strand-bar-wrap', s + '</svg>').firstChild; };

  const STRANDS = { 'Numbers to 10': 1, 'Linear & Skip Counting': 2, 'The Decimal System': 3, 'Memorization of Facts': 4, 'Passage to Abstraction': 5, 'Fractions': 6, 'Decimal Fractions': 7 };
  const STRAND_META = { 1: 'Ages 4–6 · PK–K', 2: 'Ages 4–7 · PK–1', 3: 'Ages 4–7 · PK–2', 4: 'Ages 5–9 · K–3', 5: 'Ages 6–11 · 1–5', 6: 'Ages 6–10 · 1–4', 7: 'Ages 9–12 · 4–6' };
  // <h2 class="chapter-head"><span class="chapter-num">{order}</span><BeadBar/><span class="chapter-name">…</span><span class="chapter-meta">…</span></h2>
  const chapterHead = (name, order, meta, tag) => {
    const h = el(tag || 'h2', 'chapter-head');
    h.append(el('span', 'chapter-num', String(order)), beadBar(order, 12), el('span', 'chapter-name', name));
    if (meta) h.append(el('span', 'chapter-meta', meta));
    return h;
  };

  /* ---------- Layout.tsx: colophon links + fleuron ---------- */
  run('layout', () => {
    const fi = $('.site-footer-inner');
    if (fi && !$('.colophon-links', fi)) {
      fi.prepend(el('span', 'fleuron', ''));
      const nav = el('nav', 'colophon-links'); nav.setAttribute('aria-label', 'Colophon');
      [['/lessons', 'Lessons'], ['/materials', 'Materials'], ['/worksheets', 'Worksheets'], ['/parents', 'For Parents'], ['/parents/scope-and-sequence', 'Scope & sequence']].forEach(([h, t]) => { const a = el('a', null, t); a.href = h; nav.append(a); });
      fi.append(nav);
    }
    $('.site-header-inner') && $('.site-header-inner').classList.add('container');
    $('.site-footer-inner') && $('.site-footer-inner').classList.add('container');
    $('main.site-main') && $('main.site-main').classList.add('container');
  });

  /* ---------- Icons everywhere (PrintButton, MaterialShell, BuilderPage, PlannerPage) ---------- */
  run('icons', () => {
    $$('button.btn, a.btn').forEach((b) => {
      const t = b.textContent;
      const n = beadIcon([[/🖨|^\s*Print/, 'print'], [/🎲|New problems/, 'refresh'], [/🔇|Sound off/, 'sound-off'], [/🔊|Sound on/, 'sound'], [/⛶|^\s*Focus/, 'focus'], [/✕|Exit focus/, 'close'], [/🔗|Copy link/, 'link'], [/^\s*Walk through|presented on the virtual/, 'play']], t);
      if (n) { iconize(b, n); b.classList.add('has-icon'); }
    });
  });

  /* ---------- PageHeader.tsx: title, meta line, lede, action slot ---------- */
  const pageHeader = (parent, before, { title, meta, lede, actions, kicker, extra }) => {
    const hd = el('header', 'page-header');
    parent.insertBefore(hd, before);
    const main = el('div', 'page-header-main');
    if (kicker) main.append(kicker);
    if (title) main.append(title);
    if (meta) { meta.classList.add('page-meta'); main.append(meta); }
    if (lede) { lede.classList.add('page-lede'); main.append(lede); }
    (extra || []).forEach((x) => x && main.append(x));
    hd.append(main);
    if (actions && actions.length) { const act = el('div', 'page-header-actions'); actions.forEach((a) => a && act.append(a)); hd.append(act); }
    return hd;
  };
  const metaP = (p) => { if (p && p.querySelector('.badge')) { p.classList.add('meta-line'); return p; } return null; };

  /* ---------- Index pages: chapters + contents rows with plates ---------- */
  const contentsIndex = (kind) => {
    const main = $('main.site-main');
    const h1 = $('h1', main), intro = $('.page-intro', main);
    if (h1) pageHeader(main, h1, { title: h1, lede: intro });
    $$('main > section').forEach((sec) => {
      const lab = $(':scope > .section-label', sec), grid = $(':scope > .card-grid', sec);
      if (!lab || !grid) return;
      const name = lab.textContent.trim(), order = STRANDS[name];
      sec.classList.add('chapter'); if (order) sec.dataset.strand = order;
      sec.insertBefore(chapterHead(name, order || '', STRAND_META[order]), lab); lab.remove();
      grid.classList.add('contents'); grid.classList.remove('card-grid');
      $$(':scope > li > a.card', grid).forEach((a) => {
        a.classList.add('contents-row'); a.classList.remove('card');
        const slug = (a.getAttribute('href') || '').split('/').pop();
        const key = kind === 'materials' ? slug : kind === 'worksheets' ? 'sheet' : 'kit';
        const p = plate(key); if (p) a.prepend(p);
        const h3 = $('h3', a); h3 && h3.classList.add('row-title');
        $$(':scope > p', a).forEach((pp) => { if (pp.querySelector('.badge')) { pp.classList.add('row-meta'); if (!pp.querySelector('.badge.age')) pp.classList.add('row-meta-plain'); } else pp.classList.add('row-summary'); });
        const titleWrap = el('span', 'row-text'); [h3, $(':scope > .row-summary', a), ...$$(':scope > .row-meta', a)].forEach((c) => c && titleWrap.append(c)); a.append(titleWrap);
        a.append(icon('arrow', 'row-arrow'));
      });
    });
  };
  if (path === '/materials') run('materials-index', () => contentsIndex('materials'));
  if (path === '/worksheets') run('worksheets-index', () => contentsIndex('worksheets'));
  if (path === '/kits') run('kits-index', () => contentsIndex('kits'));

  /* ---------- Lessons index: numbered contents list ---------- */
  if (path === '/lessons') run('lessons-index', () => {
    const main = $('main.site-main'), h1 = $('h1', main);
    if (h1) pageHeader(main, h1, { title: h1, lede: $('.page-intro', main) });
    $$('main > section').forEach((sec) => {
      const lab = $(':scope > .section-label', sec); const ol = $(':scope > ol', sec); if (!lab || !ol) return;
      const name = [...lab.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim().replace(/^\d+\.\s*/, ''), order = STRANDS[name];
      sec.classList.add('chapter'); if (order) sec.dataset.strand = order;
      sec.insertBefore(chapterHead(name, order || '', STRAND_META[order]), lab); lab.remove();
      const desc = $(':scope > p', sec); if (desc) { desc.classList.add('chapter-desc'); desc.removeAttribute('style'); }
      ol.classList.add('contents', 'lesson-list');
      $$(':scope > li', ol).forEach((li, i) => { li.classList.add('lesson-row'); const sum = el('span', 'row-summary'); [...li.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).forEach((n) => sum.append(n.textContent.trim())); [...li.childNodes].filter((n) => n.nodeType === 3).forEach((n) => n.remove()); li.append(sum); li.prepend(el('span', 'row-num', String(i + 1))); });
    });
  });

  /* ---------- Parents index / Ages / Planner: page headers, no inline styles ---------- */
  if (path === '/parents') run('parents', () => { const main = $('main.site-main'), h1 = $('h1', main); if (h1) pageHeader(main, h1, { title: h1, lede: $('.page-intro', main) }); $$('main [style]').forEach((e) => e.removeAttribute('style')); $$('.card-grid a.card').forEach((a) => a.classList.add('entry')); });
  if (path === '/ages') run('ages', () => { const main = $('main.site-main'), h1 = $('h1', main); if (h1) pageHeader(main, h1, { title: h1, lede: $('.page-intro', main) }); });
  if (path === '/planner') run('planner', () => { const wrap = $('.planner > .no-print'); const h1 = wrap && $('h1', wrap); if (h1) pageHeader(wrap, h1, { title: h1, lede: $('.page-intro', wrap) }); });

  /* ---------- Home ---------- */
  if (path === '/') run('home', () => {
    const hero = $('.home-hero'); if (!hero) return;
    const text = hero.firstElementChild, h1 = $('h1', text), intros = $$('.page-intro', text), cta = $('.home-cta', text);
    const titleBox = el('div', 'hero-title'); const kicker = el('p', 'page-kicker', 'A free Montessori album for families · Ages 4–12');
    titleBox.append(kicker, h1);
    const body = el('div', 'hero-body'); intros[0].classList.add('page-lede'); body.append(intros[0]);
    if (intros[1]) { intros[1].classList.add('promise'); intros[1].classList.remove('page-intro'); body.append(intros[1]); }
    body.append(cta); intros[0].classList.remove('page-intro');
    $$('.btn:not(.primary)', cta).forEach((b) => { b.classList.remove('btn'); b.classList.add('text-link'); b.append(icon('arrow')); });
    const beads = $('.home-hero-beads', hero);
    const fig = el('figure', 'plate plate-hero'); fig.setAttribute('aria-hidden', 'true');
    const art = el('div', 'plate-hero-art'); [...beads.children].forEach((c) => art.append(c));
    fig.append(art, el('figcaption', 'plate-caption', '<span class="plate-no">Plate I.</span> A thousand, a hundred, a ten and a unit.'));
    beads.remove(); text.remove();
    hero.append(titleBox, fig, body);
    // Parts I–III and age bands
    const labels = $$('main > .section-label'), grids = $$('main > .card-grid');
    if (labels[0]) { labels[0].classList.add('home-section-head'); }
    if (labels[1]) { labels[1].classList.add('home-section-head'); }
    const partPlates = ['album', 'golden-beads', 'sheet'], numer = ['I', 'II', 'III'];
    if (grids[0]) { grids[0].classList.add('parts'); $$(':scope > li > a.card', grids[0]).forEach((a, i) => { a.classList.add('part-entry'); a.classList.remove('card'); const h3 = $('h3', a); h3.textContent = h3.textContent.replace(EMOJI, '').trim(); const [t1, t2] = h3.textContent.split(' — '); h3.innerHTML = '<span class="part-kind">' + t1 + '</span><span class="part-sub">' + (t2 || '') + '</span>'; const head = el('div', 'part-head'); head.append(el('span', 'part-num', numer[i] + '.'), plate(partPlates[i])); a.prepend(head); $$('p', a).forEach((p) => { p.removeAttribute('style'); p.classList.add('part-text'); }); a.append(el('span', 'part-go', ['Open the lessons', 'Open the materials', 'Make a worksheet'][i])); a.lastChild.append(icon('arrow')); }); }
    const bandPlates = ['bead-stair', 'stamp-game', 'checkerboard'];
    if (grids[1]) { grids[1].classList.add('bands', 'contents'); grids[1].classList.remove('card-grid'); $$(':scope > li > a.card', grids[1]).forEach((a, i) => { a.classList.add('contents-row', 'band-row'); a.classList.remove('card'); const h3 = $('h3', a); const [age, grade] = h3.textContent.split(' · '); h3.classList.add('row-title'); h3.innerHTML = '<span class="row-title-text">' + age + '</span><span class="row-title-meta">' + (grade || '') + '</span>'; const p = $('p', a); p.removeAttribute('style'); p.classList.add('row-summary'); const tw = el('span', 'row-text'); tw.append(h3, p); a.append(plate(bandPlates[i]), tw, icon('arrow', 'row-arrow')); }); }
    const note = $('main > section.card'); if (note) { note.classList.add('note'); note.classList.remove('card'); note.removeAttribute('style'); $$('[style]', note).forEach((e) => e.removeAttribute('style')); note.prepend(el('span', 'fleuron', '')); }
  });

  /* ---------- Material page ---------- */
  const mMatch = path.match(/^\/materials\/([^/]+)$/);
  if (mMatch) run('material', () => {
    const main = $('main.site-main'); const h1 = $(':scope > h1', main); if (!h1) return;
    const meta = metaP(h1.nextElementSibling), lede = $(':scope > .page-intro', main), launch = $(':scope > .presentation-launch', main);
    const actions = launch ? [...launch.children] : [];
    pageHeader(main, h1, { title: h1, meta, lede, actions });
    if (launch) launch.remove();
    const shell = $('.material-shell', main);
    if (shell) {
      const ctr = $(':scope > .material-controls', shell);
      const util = el('div', 'material-utility'); util.setAttribute('role', 'group'); util.setAttribute('aria-label', 'Display');
      $$(':scope > button.btn', ctr).filter((b) => /Sound|Focus/.test(b.textContent)).forEach((b) => { b.classList.add('btn-utility'); util.append(b); });
      const task = el('div', 'material-task'); [...ctr.children].forEach((c) => task.append(c));
      ctr.append(task, util); ctr.classList.add('material-toolbar');
      const help = $(':scope > .material-help', shell); if (help) { shell.insertBefore(help, ctr.nextSibling); }
      const stage = $(':scope > .material-stage', shell);
      const mat = stage.classList.contains('mat-wood') ? 'wooden table' : stage.classList.contains('mat-paper') ? 'paper' : 'felt work mat';
      const fig = el('figure', 'material-plate'); shell.insertBefore(fig, stage); fig.append(stage);
      fig.append(el('figcaption', 'plate-caption', '<span class="plate-no">Plate.</span> ' + h1.textContent + ', on the ' + mat + '.'));
    }
    const notes = $$(':scope > section.card', main);
    if (notes.length) { const wrap = el('div', 'material-notes'); main.insertBefore(wrap, notes[0]); notes.forEach((n) => { n.classList.add('note-col'); n.classList.remove('card'); n.removeAttribute('style'); $$('[style]', n).forEach((e) => e.removeAttribute('style')); wrap.append(n); }); }
    const links = $$(':scope > section:not(.note-col)', main).find((s) => s.querySelector('.section-label'));
    if (links) { links.classList.add('material-links'); links.removeAttribute('style'); const labs = $$(':scope > .section-label', links); labs.forEach((lab) => { const col = el('div', 'links-col'); const ul = lab.nextElementSibling; links.insertBefore(col, lab); col.append(lab, ul); ul.classList.add('link-list'); $$(':scope > li', ul).forEach((li) => { li.classList.add('link-row'); const a = $('a', li); if (a) a.classList.add('row-title'); }); }); }
  });

  /* ---------- Lesson album ---------- */
  if (/^\/lessons\/[^/]+$/.test(path)) run('lesson', () => {
    const hdr = $('.album-header'); if (!hdr) return;
    const h1 = $('h1', hdr), metaRow = $('.album-meta', hdr);
    const printWrap = $(':scope > span[style]', metaRow);
    const run1 = el('div', 'album-runhead');
    metaRow.prepend(el('span', 'badge album-name', 'The Lesson Album'));
    run1.append(metaRow);
    if (printWrap) { const act = el('div', 'page-header-actions'); [...printWrap.children].forEach((c) => act.append(c)); printWrap.remove(); run1.append(act); }
    hdr.prepend(run1); hdr.append(h1);
    const lede = hdr.nextElementSibling; if (lede && lede.tagName === 'P') { lede.removeAttribute('style'); lede.classList.add('album-lede'); }
    $$('.album [style]').forEach((e) => e.removeAttribute('style'));
    $$('.album section > p.no-print').forEach((p) => p.classList.add('album-aside'));
  });

  /* ---------- Builder & kit pages ---------- */
  const bMatch = path.match(/^\/(worksheets|kits)\/([^/]+)$/);
  if (bMatch) run('builder', () => {
    const top = $('.builder > .no-print'); if (!top) return;
    const h1 = $('h1', top); const ps = $$(':scope > p', top);
    const meta = ps.map(metaP).find(Boolean) || null; const lede = $('.page-intro', top);
    const extra = ps.filter((p) => p !== meta && p !== lede);
    extra.forEach((p) => p.classList.add('page-forwith'));
    const acts = $('.builder-actions'); const actionKids = acts ? [...acts.children] : [];
    pageHeader(top, h1, { title: h1, meta, lede, actions: actionKids, extra });
    if (acts) acts.remove();
    const form = $('.builder-form');
    if (form) { form.classList.remove('card'); form.classList.add('panel'); $$('[style]', form).forEach((e) => e.removeAttribute('style')); if (!$(':scope > .section-label', form)) form.prepend(el('h2', 'panel-label', 'Sheet settings')); else $$(':scope > .section-label', form).forEach((l) => l.classList.add('panel-label')); }
  });

  /* ---------- Guides (incl. scope & sequence) ---------- */
  if (/^\/parents\/[^/]+$/.test(path)) run('guide', () => {
    const gp = $('.guide-page'); if (!gp) return;
    const printBox = $(':scope > .no-print', gp); const guide = $('.guide', gp); const h1 = guide && $(':scope > h1', guide);
    if (h1) { const hd = pageHeader(guide, h1, { title: h1, lede: $(':scope > .guide-lede', guide), actions: printBox ? [...printBox.children] : [] }); hd.classList.add('guide-header'); if (printBox) printBox.remove(); }
    const table = $('.scope-table', gp);
    if (table) {
      gp.classList.add('guide-page-wide'); guide.classList.add('guide-scope');
      const note = $(':scope > p.no-print', guide); if (note) note.classList.add('guide-note');
      const COLS = ['scope-num', 'scope-lesson', 'scope-ages', 'scope-grades', 'scope-mats', 'scope-print'];
      $$('thead th', table).forEach((th, i) => { th.removeAttribute('style'); th.classList.add(COLS[i]); });
      $$('tr.scope-strand-row > th', table).forEach((th) => {
        const m = th.textContent.match(/^(\d+)\.\s*(.+?)\s*·\s*ages\s*([\d–-]+)\s*\((.+)\)\s*$/);
        if (!m) return; const order = +m[1];
        th.closest('tbody').dataset.strand = order;
        th.textContent = '';
        const head = chapterHead(m[2], order, 'Ages ' + m[3] + ' · ' + m[4], 'span'); head.className = 'chapter-head scope-chapter';
        th.append(head);
      });
      $$('tbody tr:not(.scope-strand-row)', table).forEach((tr) => { tr.classList.add('scope-row'); const c = tr.cells; if (c[0]) c[0].classList.add('scope-num'); if (c[1]) c[1].classList.add('scope-lesson'); if (c[2]) c[2].classList.add('scope-ages'); if (c[3]) c[3].classList.add('scope-grades'); if (c[4]) c[4].classList.add('scope-mats'); if (c[5]) c[5].classList.add('scope-print'); });
    }
  });

  doc.__shimErrors = errs;
  return errs.length ? 'shim errors: ' + errs.join(' | ') : 'shim ok ' + path;
};
