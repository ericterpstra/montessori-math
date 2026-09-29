# PRD 19 · Phase 1 — Foundations

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Steps 2–11. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


Self-hosted fonts, the token shield, the chrome tokens, base type, the icon set, buttons and the meta line. Everything later builds on these. With only this phase applied, the site is in a coherent in-between state: new paper, type, rubric buttons, line icons and the meta line, on the old page layouts.

Order matters inside the phase: the shield (Step 5) must land before the chrome tokens are re-pointed (Step 6), so no material or printout ever sees a new value.

## Step 2 — Self-hosted fonts: the authoring script and the committed files

**Files:** `scripts/fonts/build-fonts.py` (new), `public/fonts/newsreader-roman.woff2` (new), `public/fonts/newsreader-italic.woff2` (new), `public/fonts/mm-sans.woff2` (new), `public/fonts/OFL.txt` (new).

The owner approved self-hosting Newsreader and Source Sans 3, both under SIL OFL 1.1. The fonts are produced once, at authoring time, with fontTools, a Python tool installed outside the repo, so it is never an npm dependency. The commands are kept in a script so the files can be regenerated and checked.

- Newsreader's optical-size axis is pinned at 18, the font's own default and what the prototype's Google stand-in served. Its weight axis is narrowed to what the design uses.
- Source Sans 3's licence names "Source" as a Reserved Font Name, and a subset is a Modified Version. So the subset is renamed **MM Sans** in every font-name record, while its copyright, trademark and licence records are kept verbatim.
- Newsreader's OFL declares no Reserved Font Name (verified in the upstream `OFL.txt`), so it keeps its name. The script re-checks this on every run and stops if an upstream update adds one.

Create `scripts/fonts/build-fonts.py` with exactly this content:

```python
#!/usr/bin/env python3
"""
build-fonts.py — one-time authoring step that produces the self-hosted web fonts
in public/fonts/ (PRD 19, Step 2). It is NOT part of `npm run build`; run it
only when the fonts need to be regenerated, then commit its outputs.

Needs Python 3.9+ and fontTools with WOFF2 support, installed OUTSIDE the repo
(never an npm dependency):

    python3 -m venv ~/.venvs/mm-fonts
    ~/.venvs/mm-fonts/bin/pip install 'fonttools[woff]==4.66.1'
    ~/.venvs/mm-fonts/bin/python scripts/fonts/build-fonts.py

What it does, in order:
  1. Downloads the upstream variable TTFs and OFL texts from google/fonts at
     pinned commits into a cache folder (default ~/.cache/mm-fonts) and checks
     each file's SHA-256. Network is used here, at authoring time, only.
  2. Instances the variable fonts (fontTools.varLib.instancer):
       Newsreader roman   opsz pinned at 18 (the font's default), wght 350-600
       Newsreader italic  opsz pinned at 18,                       wght 400-500
       Source Sans 3      wght 400-700
  3. Renames Source Sans 3 to "MM Sans". Its OFL declares the Reserved Font
     Name "Source", and a subset is a Modified Version, so the modified font may
     not carry that name (OFL 1.1, condition 3). Copyright (0), trademark (7)
     and licence (13, 14) records are kept verbatim, as the licence requires.
  4. Subsets all three to Latin + Latin-1 + General Punctuation + the few maths
     signs the site's prose uses, drops hinting, keeps the default OpenType
     features plus tnum/lnum/case, and writes WOFF2.
  5. Writes public/fonts/OFL.txt (both copyright notices + the licence text).
  6. Prints each file's size, the total against the 200 KB budget, and the
     size-adjust / ascent / descent overrides for the local fallback faces in
     src/styles/fonts.css, measured against Gelasio (metric-compatible with
     Georgia) and Arimo (metric-compatible with Arial) over the character
     frequencies of the site's own lesson and guide prose.
"""
import argparse
import collections
import hashlib
import io
import os
import re
import sys
import urllib.request
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

REPO = Path(__file__).resolve().parents[2]
RAW = 'https://raw.githubusercontent.com/google/fonts'

# (local name, google/fonts commit, path in repo, sha256)
SOURCES = {
    'newsreader-roman.ttf': ('8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5', 'ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf',
                             '8a08d13f8a6c0d51be379a60af84f945f65369a67e509ee3c3bdcc421254d7c1'),
    'newsreader-italic.ttf': ('8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5', 'ofl/newsreader/Newsreader-Italic%5Bopsz%2Cwght%5D.ttf',
                              '796668611f80b64d5adf182fde3b6f29ed83b4e7cbec7b96937e84ac01364792'),
    'OFL-newsreader.txt': ('8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5', 'ofl/newsreader/OFL.txt',
                           'fdfad38143ec470553cae82a1e45320bdd1b9ec70415d37bd0171051d8a4ded8'),
    'source-sans-3.ttf': ('914ec116571b1162d886aa402e715552221f0b77', 'ofl/sourcesans3/SourceSans3%5Bwght%5D.ttf',
                          '042fe2cc0b933e328410d7acbd0aa6a1873dca5aef81875f4bc214b08825c7b9'),
    'OFL-sourcesans3.txt': ('914ec116571b1162d886aa402e715552221f0b77', 'ofl/sourcesans3/OFL.txt',
                            '09746787287a289323b0ec3cff4d1a4a801331b82b7207c1e186f5d26619a392'),
    # measuring references only (never shipped)
    'gelasio-roman.ttf': ('a60a77e14f28abd4ef243a1b5dfc48df0cec5205', 'ofl/gelasio/Gelasio%5Bwght%5D.ttf',
                          '4daecea457258c9ebeb8bc99ed3fd24353618bfad3ea4b93fa0b5d0468fc04e4'),
    'gelasio-italic.ttf': ('a60a77e14f28abd4ef243a1b5dfc48df0cec5205', 'ofl/gelasio/Gelasio-Italic%5Bwght%5D.ttf',
                           '52559e845a4d33514e5f93bb9ae7dbeae1894a53f2c565a15f18af40cd337c09'),
    'arimo.ttf': ('903d46673260c1f4c7f7ef67f5190fb03eab5042', 'ofl/arimo/Arimo%5Bwght%5D.ttf',
                  'e43898b143ec826ac8cb4034816458a7047fbe0836558de2a1f8c6223ae3e0ca'),
}

# Keep in sync with the unicode-range descriptors in src/styles/fonts.css.
UNICODES = ('U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,'
            'U+2000-206F,U+20AC,U+2122,U+2190-2194,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+FEFF,U+FFFD')

BUDGET_BYTES = 200 * 1024

# name IDs that keep upstream text (copyright, trademark, manufacturer, designer,
# vendor URL, designer URL, licence, licence URL) plus our own description (10);
# none of them is a font name, so they may mention "Source".
KEEP_IDS = {0, 7, 8, 9, 10, 11, 12, 13, 14}


def fetch(cache: Path) -> dict:
    cache.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, (commit, path, digest) in SOURCES.items():
        dest = cache / name
        if not dest.exists():
            url = f'{RAW}/{commit}/{path}'
            print(f'download {url}')
            with urllib.request.urlopen(url) as r:
                dest.write_bytes(r.read())
        got = hashlib.sha256(dest.read_bytes()).hexdigest()
        if got != digest:
            sys.exit(f'{name}: sha256 {got} does not match the pinned {digest}; delete it and retry')
        paths[name] = dest
    return paths


def rename_mm_sans(font: TTFont) -> None:
    table = font['name']
    table.names = [r for r in table.names if r.platformID == 3]  # drop legacy Mac records
    new = {
        1: 'MM Sans',
        2: 'Regular',
        3: 'MMSans-Regular;montessori-math',
        4: 'MM Sans Regular',
        6: 'MMSans-Regular',
        10: ('MM Sans is a Modified Version of Source Sans 3 (Adobe): instanced to weights 400-700 '
             'and subset to Latin for Montessori Math. Renamed because "Source" is a Reserved Font '
             'Name under the SIL Open Font License 1.1.'),
        16: 'MM Sans',
        17: 'Regular',
        25: 'MMSans',
    }
    for name_id, text in new.items():
        table.setName(text, name_id, 3, 1, 0x409)
    for inst in font['fvar'].instances:  # named instances: 'SourceSans3-Bold' -> 'MMSans-Bold'
        if inst.postscriptNameID not in (None, 0xFFFF):
            ps = table.getName(inst.postscriptNameID, 3, 1, 0x409)
            if ps is not None:
                table.setName(ps.toUnicode().replace('SourceSans3', 'MMSans'), inst.postscriptNameID, 3, 1, 0x409)
    leaks = [(r.nameID, r.toUnicode()) for r in table.names
             if r.nameID not in KEEP_IDS and 'source' in r.toUnicode().lower()]
    if leaks:
        sys.exit(f'Reserved Font Name still present in name records: {leaks}')


def subset_to_woff2(font: TTFont, out: Path) -> None:
    buf = io.BytesIO()  # round-trip: the subsetter needs a fully compiled font,
    font.save(buf)      # not the instancer's lazily built in-memory tables
    buf.seek(0)
    font = TTFont(buf, recalcTimestamp=False)
    opts = Options()
    opts.flavor = 'woff2'
    opts.hinting = False
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.layout_features = Options().layout_features + ['tnum', 'lnum', 'case']
    sub = Subsetter(opts)
    sub.populate(unicodes=parse_unicodes(UNICODES))
    sub.subset(font)
    font.flavor = 'woff2'
    font.save(out)


def parse_unicodes(spec: str) -> list:
    cps = []
    for part in spec.split(','):
        part = part.strip().removeprefix('U+')
        if '-' in part:
            a, b = part.split('-')
            cps.extend(range(int(a, 16), int(b, 16) + 1))
        else:
            cps.append(int(part, 16))
    return cps


def write_ofl(paths: dict, out: Path) -> None:
    nr = paths['OFL-newsreader.txt'].read_text(encoding='utf-8').replace('\r\n', '\n')
    ss = paths['OFL-sourcesans3.txt'].read_text(encoding='utf-8').replace('\r\n', '\n')
    body = nr[nr.index('-----'):]
    nr_copy = nr.splitlines()[0].strip()
    ss_copy = ss.splitlines()[0].strip()
    # Newsreader keeps its name only because its OFL declares no Reserved Font
    # Name. If an upstream update adds one, the subset must be renamed too.
    if 'Reserved Font Name' in nr.split('-----')[0]:
        sys.exit('Newsreader now declares a Reserved Font Name: rename its subset like MM Sans')
    text = f"""Fonts in this folder
====================

newsreader-roman.woff2, newsreader-italic.woff2
  Newsreader, instanced (optical size fixed at 18; weights 350-600 roman,
  400-500 italic) and subset to Latin for Montessori Math.
  {nr_copy}
  Newsreader is a registered trademark of Production Systems SAS.

mm-sans.woff2
  "MM Sans" is a Modified Version of Source Sans 3, instanced to weights
  400-700 and subset to Latin for Montessori Math. It is renamed because
  "Source" is a Reserved Font Name.
  {ss_copy}

Both fonts are licensed under the SIL Open Font License, Version 1.1,
reproduced below. It is also available with a FAQ at: https://openfontlicense.org


{body}"""
    out.write_text(text.rstrip() + '\n', encoding='utf-8')


def prose_frequencies() -> collections.Counter:
    chunks = []
    for root, _, files in os.walk(REPO / 'src'):
        for fn in files:
            if fn == 'lessons.ts' or ('parents/guides' in root.replace(os.sep, '/') and fn.endswith('.tsx')):
                s = Path(root, fn).read_text(encoding='utf-8')
                chunks += re.findall(r"'([^'\\\n]{12,})'", s)
                chunks += re.findall(r'"([^"\\\n]{12,})"', s)
                chunks += re.findall(r'>([^<>{}\n]{12,})<', s)
    return collections.Counter(c for c in ' '.join(chunks) if 32 <= ord(c) < 127)


def metrics(path: Path, freq: collections.Counter, **axes) -> tuple:
    font = TTFont(path)
    if 'fvar' in font:
        loc = {a.axisTag: axes.get(a.axisTag, a.defaultValue) for a in font['fvar'].axes}
        font = instantiateVariableFont(font, loc)
    cmap, hmtx, upm = font.getBestCmap(), font['hmtx'], font['head'].unitsPerEm
    total = count = 0
    for ch, k in freq.items():
        glyph = cmap.get(ord(ch))
        if glyph:
            total += hmtx[glyph][0] * k
            count += k
    os2, hhea = font['OS/2'], font['hhea']
    if os2.fsSelection & (1 << 7):  # USE_TYPO_METRICS
        asc, desc, gap = os2.sTypoAscender, -os2.sTypoDescender, os2.sTypoLineGap
    else:
        asc, desc, gap = hhea.ascent, -hhea.descent, hhea.lineGap
    return total / count / upm, asc / upm, desc / upm, gap / upm


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=str(Path.home() / '.cache' / 'mm-fonts'))
    ap.add_argument('--out', default=str(REPO / 'public' / 'fonts'))
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    paths = fetch(Path(args.cache))

    roman = instantiateVariableFont(TTFont(paths['newsreader-roman.ttf']), {'opsz': 18, 'wght': (350, 600)})
    subset_to_woff2(roman, out / 'newsreader-roman.woff2')
    italic = instantiateVariableFont(TTFont(paths['newsreader-italic.ttf']), {'opsz': 18, 'wght': (400, 500)})
    subset_to_woff2(italic, out / 'newsreader-italic.woff2')
    sans = instantiateVariableFont(TTFont(paths['source-sans-3.ttf']), {'wght': (400, 700)})
    rename_mm_sans(sans)
    subset_to_woff2(sans, out / 'mm-sans.woff2')
    write_ofl(paths, out / 'OFL.txt')

    total = 0
    for name in ('newsreader-roman.woff2', 'newsreader-italic.woff2', 'mm-sans.woff2'):
        size = (out / name).stat().st_size
        total += size
        print(f'{name:26} {size / 1024:6.1f} KB')
    print(f'{"total":26} {total / 1024:6.1f} KB (budget {BUDGET_BYTES // 1024} KB)')
    if total > BUDGET_BYTES:
        sys.exit('over budget')

    freq = prose_frequencies()
    pairs = [
        ('Newsreader Fallback (Georgia)', metrics(paths['newsreader-roman.ttf'], freq, opsz=18, wght=400),
         metrics(paths['gelasio-roman.ttf'], freq, wght=400)),
        ('Newsreader Fallback italic (Georgia Italic)', metrics(paths['newsreader-italic.ttf'], freq, opsz=18, wght=400),
         metrics(paths['gelasio-italic.ttf'], freq, wght=400)),
        ('MM Sans Fallback (Arial)', metrics(paths['source-sans-3.ttf'], freq, wght=400),
         metrics(paths['arimo.ttf'], freq, wght=400)),
    ]
    for label, web, ref in pairs:
        adjust = web[0] / ref[0]
        print(f'{label}: size-adjust {adjust * 100:.2f}%; ascent-override {web[1] / adjust * 100:.2f}%; '
              f'descent-override {web[2] / adjust * 100:.2f}%; line-gap-override {web[3] / adjust * 100:.2f}%')


if __name__ == '__main__':
    main()
```

Run it from the repo root with the venv's Python (see the docstring), then commit the four files it writes to `public/fonts/`. This is what the script printed when it was run on 2026-09-29. Sizes can differ by about ±0.3 KB between runs, and whatever one run produces is what you commit.

```
newsreader-roman.woff2       48.1 KB
newsreader-italic.woff2      38.7 KB
mm-sans.woff2                29.8 KB
total                       116.6 KB (budget 200 KB)
Newsreader Fallback (Georgia): size-adjust 91.66%; ascent-override 80.19%; descent-override 28.91%; line-gap-override 0.00%
Newsreader Fallback italic (Georgia Italic): size-adjust 83.23%; ascent-override 88.31%; descent-override 31.84%; line-gap-override 0.00%
MM Sans Fallback (Arial): size-adjust 93.84%; ascent-override 109.13%; descent-override 42.63%; line-gap-override 0.00%
```

This comes in under the prototype's measured 147.9 KB, which used Google-served files, because the subset is unhinted and keeps only the default features plus `tnum`, `lnum` and `case`. Newsreader's figures are lining in the default set (every digit sits on the baseline at cap height).

**Check:**

- `ls -l public/fonts` shows exactly `OFL.txt`, `mm-sans.woff2`, `newsreader-italic.woff2` and `newsreader-roman.woff2`, and the three woff2 files total under 200 KB.
- `grep -c "Reserved Font Name 'Source'" public/fonts/OFL.txt` prints `1`, and `grep -c 'registered trademark of Production Systems' public/fonts/OFL.txt` prints `1`.
- The script exited 0, so its Reserved-Font-Name leak check passed. To see the names yourself, run `~/.venvs/mm-fonts/bin/python -c "from fontTools.ttLib import TTFont; n=TTFont('public/fonts/mm-sans.woff2')['name']; print([n.getDebugName(i) for i in (1,4,6,16,25)])"`. It prints `['MM Sans', 'MM Sans Regular', 'MMSans-Regular', 'MM Sans', 'MMSans']`.
- `git status` shows no Python virtualenv, cache folder or `.ttf` inside the repo.

## Step 3 — `fonts.css`: the @font-face rules and metric-matched fallbacks

**Files:** `src/styles/fonts.css` (new), `src/main.tsx` (modified).

This step declares the three faces with `font-display: swap`, same-origin URLs and a `unicode-range` that matches the subset. It also adds three size-adjusted **local** fallback faces, with values from Step 2's output, so text doesn't jump when the web font swaps in. Nothing uses the families yet: Step 6 points the tokens at them.

Create `src/styles/fonts.css`:

```css
/* ------------------------------------------------------------------
   Self-hosted fonts (PRD 19 "The Album"). The files live in public/fonts/
   and are produced once by scripts/fonts/build-fonts.py; see OFL.txt there.
   Same-origin only: no font CDN, no runtime request to another host. The
   service worker precaches all three files (scripts/generate-sw.mjs keeps
   them under a 200 KB budget).

   Newsreader (SIL OFL 1.1): reading and display text, variable weight.
   MM Sans: Source Sans 3 (SIL OFL 1.1) subset and renamed, because
   "Source" is a Reserved Font Name. Buttons, labels, nav, meta.

   A weight outside a face's range draws at the nearest weight inside it
   (a 700 request on Newsreader draws at 600), so keep chrome CSS to
   Newsreader 350-600 (italic 400-500) and MM Sans 400-700.
   ------------------------------------------------------------------ */

@font-face {
  font-family: 'Newsreader';
  src: url('/fonts/newsreader-roman.woff2') format('woff2');
  font-style: normal;
  font-weight: 350 600;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+20AC, U+2122, U+2190-2194, U+2212, U+2215, U+2248, U+2260, U+2264-2265, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'Newsreader';
  src: url('/fonts/newsreader-italic.woff2') format('woff2');
  font-style: italic;
  font-weight: 400 500;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+20AC, U+2122, U+2190-2194, U+2212, U+2215, U+2248, U+2260, U+2264-2265, U+FEFF, U+FFFD;
}

@font-face {
  font-family: 'MM Sans';
  src: url('/fonts/mm-sans.woff2') format('woff2');
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+20AC, U+2122, U+2190-2194, U+2212, U+2215, U+2248, U+2260, U+2264-2265, U+FEFF, U+FFFD;
}

/* Metric-matched local fallbacks: while a web font is still loading (or if it
   never arrives) text is drawn in a local font scaled to the same average
   width and line box, so the page does not jump when the web font swaps in.
   Values come from build-fonts.py (measured against Gelasio and Arimo, which
   are metric-compatible with Georgia and Arial, over the site's own prose).
   Browsers without ascent/descent-override support simply ignore them. */

@font-face {
  font-family: 'Newsreader Fallback';
  src: local('Georgia'), local('Gelasio');
  font-style: normal;
  size-adjust: 91.66%;
  ascent-override: 80.19%;
  descent-override: 28.91%;
  line-gap-override: 0%;
}

@font-face {
  font-family: 'Newsreader Fallback';
  src: local('Georgia Italic'), local('Georgia-Italic'), local('Gelasio Italic'), local('Gelasio-Italic');
  font-style: italic;
  size-adjust: 83.23%;
  ascent-override: 88.31%;
  descent-override: 31.84%;
  line-gap-override: 0%;
}

@font-face {
  font-family: 'MM Sans Fallback';
  src: local('Arial'), local('ArialMT'), local('Arimo'), local('Liberation Sans'), local('LiberationSans');
  font-style: normal;
  size-adjust: 93.84%;
  ascent-override: 109.13%;
  descent-override: 42.63%;
  line-gap-override: 0%;
}
```

In `src/main.tsx`, the current lines 4–6 are:

```tsx
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
```

Insert the fonts import directly above the tokens import. Leave every other import where it is, because the stylesheet order matters (see audit S6-01, which goes to PRD 20).

```tsx
import App from './App'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'
```

The `url('/fonts/…')` paths point into `public/`. Vite leaves them untouched and copies the files to `dist/fonts/`.

**Check:**

- `npm run build` is green and `ls dist/fonts` lists all four files.
- In `npm run dev`, run `await document.fonts.load('18px Newsreader')` in the console. It resolves to a one-element array.
- Network shows `GET /fonts/newsreader-roman.woff2 200` from the dev server's own host. There are no requests to any other origin, then or on any later step.

## Step 4 — Service worker: precache confirmation and the font budget

**Files:** `scripts/generate-sw.mjs` (modified).

`generate-sw.mjs` already precaches every file in `dist/` (lines 41–50), so `dist/fonts/*.woff2` and `OFL.txt` go offline with no change. This step adds a hard 200 KB budget for the woff2 files and reports the figure in the build log, so an over-large re-subset fails `npm run build` rather than slowing a first visit. It also hashes the font files' bytes into the cache version, so a regenerated font always reaches returning visitors.

Directly above the current line 52 (`const hash = crypto.createHash('sha256')`), insert:

```js
// Self-hosted fonts (PRD 19) are precached like every other file above — they
// sit in public/fonts/, which Vite copies to dist/fonts/. Their combined size
// has a hard budget so a careless re-subset cannot bloat the first visit.
const FONT_BUDGET_BYTES = 200 * 1024
const fontBytes = entries
  .filter((e) => e.url.startsWith('/fonts/') && e.url.endsWith('.woff2'))
  .reduce((sum, e) => sum + e.size, 0)
const fontKB = (fontBytes / 1024).toFixed(1)
if (fontBytes > FONT_BUDGET_BYTES) {
  console.error(
    `generate-sw: fonts total ${fontKB} KB, over the ${FONT_BUDGET_BYTES / 1024} KB budget — re-run scripts/fonts/build-fonts.py.`,
  )
  process.exit(1)
}
```

The cache version is a hash of every file's URL and size (current lines 52–54). Font filenames never change, and the service worker serves them cache-first, so a regenerated font that happens to keep its byte size would never reach a returning visitor. Directly after the current line 53 (`hash.update(entries.map((e) => \`${e.url}:${e.size}\`).join('\n'))`), insert:

```js
// The font files keep their names when build-fonts.py regenerates them and are
// served cache-first, so hash their bytes too: even a same-size change to a
// font reaches returning visitors through a new cache version.
for (const e of entries) {
  if (e.url.startsWith('/fonts/')) hash.update(fs.readFileSync(path.join(distDir, e.url.slice(1))))
}
```

Replace the current last line (line 117):

```js
console.log(`generate-sw: wrote dist/sw.js (cache mm-${VERSION}, ${entries.length} assets)`)
```

with:

```js
console.log(
  `generate-sw: wrote dist/sw.js (cache mm-${VERSION}, ${entries.length} assets; fonts ${fontKB} KB of ${FONT_BUDGET_BYTES / 1024} KB)`,
)
```

The one-asset-per-line format that the QA parity check greps (`grep -c '^  "' dist/sw.js`) doesn't change. The count goes up by 4.

`public/_headers` is deliberately not changed. The font filenames are unhashed, so a long `max-age` would pin stale fonts after a regeneration. The service worker already serves repeat visits and offline use from its cache, and its `VERSION` changes whenever a font file's bytes change.

**Check:**

- `npm run build` ends with `generate-sw: wrote dist/sw.js (cache mm-…, 54 assets; fonts 116.7 KB of 200 KB)`. That is the 50 assets at `album-baseline` plus the 4 font files; your KB figure is whatever Step 2 produced.
- `grep '/fonts/' dist/sw.js` lists the four files.
- Temporarily change `200 * 1024` to `100 * 1024`, and `npm run build` exits 1 with the budget message. Revert the change.
- Note the `mm-…` version in `dist/sw.js`. Change one byte of `dist/fonts/OFL.txt` without changing its size (for example `printf 'X' | dd of=dist/fonts/OFL.txt bs=1 seek=10 conv=notrunc`), run `node scripts/generate-sw.mjs`, and the version is different. Rebuild afterwards.
- In `npm run preview`, load `/` once, then check DevTools, Application, Cache Storage, `mm-…`: it contains the three woff2 files. With Network set to Offline, reload: the page still renders in Newsreader (after Step 6).

## Step 5 — The token shield, installed while nothing changes

**Files:** `src/styles/tokens.css` (modified).

The shield is installed *before* any chrome value changes, so this step has to be a visual no-op. It adds the legacy values as `--mat-*` source tokens. Then, on every `.material-stage` and `.print-sheet`, it pins the 17 chrome tokens that material and print CSS read to those values. It also resets the text metrics that a stage or sheet inherits from `<body>`. Once Step 6 re-points the chrome tokens and Step 7 restyles the body, every material and printout still resolves to exactly today's values.

This list is complete. A grep of every material, generator, kit and planner stylesheet and component (`src/materials`, `src/worksheets/generators`, `src/kits`, `src/planner`, `materials.css`, `print.css`, `worksheets.css`, `planner.css`) finds only these chrome tokens in use:

- 14 that change and are pinned: `--paper`, `--paper-warm`, `--card`, `--ink`, `--ink-soft`, `--line`, `--accent`, `--accent-dark`, `--radius`, `--radius-sm`, `--shadow-sm`, `--shadow-md`, `--font-heading`, `--font-body`;
- 5 that never change: `--touch-target`, `--focus`, `--ok`, `--error`, `--font-mono`.

`--on-accent`, `--font-text` and `--font-ui` are pinned as well, because Step 9 and later chrome rules read them. No stylesheet re-declares any of these properties locally, so the pins can't be outranked.

In `:root`, directly after the bead-rendering block (current lines 57–62) and before `/* Shape & depth */` (line 64), insert:

```css
  /* ---------- Legacy chrome values (source of the shield) ----------
     Exactly what the chrome tokens were before PRD 19. The shield gives
     these back to every .material-stage and .print-sheet. Changing one of
     them changes every material and every printable: don't. */
  --mat-paper: #faf7f0;
  --mat-paper-warm: #f3ecdd;
  --mat-card: #ffffff;
  --mat-ink: #33302a;
  --mat-ink-soft: #6f6759;
  --mat-line: #e4ddcc;
  --mat-accent: #b0523c;
  --mat-accent-dark: #8d3f2e;
  --mat-on-accent: #ffffff;
  --mat-radius: 10px;
  --mat-radius-sm: 6px;
  --mat-shadow-sm: 0 1px 3px rgba(51, 48, 42, 0.12);
  --mat-shadow-md: 0 1px 2px rgba(51, 48, 42, 0.1), 0 6px 18px rgba(51, 48, 42, 0.12);
  --font-numeral: Georgia, 'Times New Roman', serif; /* number cards and stamps keep Georgia figures */
  --font-material: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
```

Each value is copied from the current `tokens.css` lines 42–52 and 65–72. `#ffffff` for `--mat-on-accent` replaces the `#fff` literal that `.btn.primary` uses today (global.css line 214; Step 9 switches it to the token).

At the end of the file, after the closing `}` of `:root`, append:

```css
/* ------------------------------------------------------------------
   The token shield
   Every virtual material (.material-stage) and every printable sheet
   (.print-sheet) gets the legacy chrome values back. Material tokens are
   not listed: they are never re-pointed. The shared material primitives
   (NumberCard, StampTile, beads.tsx) are only ever rendered inside a stage
   or a sheet; if a chrome page ever shows one inline, add its class here.
   ------------------------------------------------------------------ */
.material-stage,
.print-sheet {
  --paper: var(--mat-paper);
  --paper-warm: var(--mat-paper-warm);
  --card: var(--mat-card);
  --ink: var(--mat-ink);
  --ink-soft: var(--mat-ink-soft);
  --line: var(--mat-line);
  --accent: var(--mat-accent);
  --accent-dark: var(--mat-accent-dark);
  --on-accent: var(--mat-on-accent);
  --radius: var(--mat-radius);
  --radius-sm: var(--mat-radius-sm);
  --shadow-sm: var(--mat-shadow-sm);
  --shadow-md: var(--mat-shadow-md);
  --font-heading: var(--font-numeral);
  --font-body: var(--font-material);
  --font-text: var(--font-material);
  --font-ui: var(--font-material);
}

/* A stage or sheet inherits its text metrics from the body, which the album
   sets to Newsreader 18px/1.6. Reset them to the legacy body. :where() keeps
   specificity at zero, so any real rule in materials.css, print.css or a
   material's or generator's own CSS still wins. */
:where(.material-stage, .print-sheet) {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.55;
}

:where(.material-stage) {
  color: var(--ink);
}
```

**How it works:** a custom property set on an element overrides the inherited `:root` value for that element and all its descendants. It also applies to the element's own properties: `.material-stage { border-radius: var(--radius) }` in materials.css line 61 keeps its 10px.

`print.css` line 72 (`.print-sheet { font-family: var(--font-body) }`) and line 71 (`color: #000`) are class rules, so they still win over the zero-specificity reset. They now resolve through the pinned `--font-body`. The `.print-sheet.bw` block (print.css lines 120–147) overrides only material tokens, at higher specificity, and is untouched.

The `:root` values still equal the legacy values at this point, so every pin and reset resolves to what the element already had.

**Check:**

- `npm run build` is green.
- The shield probe gives identical before and after output on `/materials/golden-beads` and `/materials/stamp-game` (screen), and on `/worksheets/multi-digit-ops?seed=424242&key=1` (screen and print).
- Every page looks identical. Spot-check `/`, a lesson and a builder; nothing may move.

## Step 6 — The Album's chrome tokens, the font preload and the theme colour

**Files:** `src/styles/tokens.css` (full new content below), `index.html` (modified), `public/manifest.webmanifest` (modified).

This step re-points the chrome to paper, ink and rubric, and adds the eight-step type scale, the space scale, the radii and the ornament tokens. The values are verbatim from `plan/19-the-album/prototype/mock.css` §1, with five deliberate changes:

1. **`--line-strong` is darkened** from the mock's `#9c907c` to `#8c816f`. The mock value gives 2.79:1 on paper and 2.51:1 on the planner's paper-warm panel, which fails WCAG 1.4.11 for field borders. `#8c816f` gives 3.77:1 on card, 3.40:1 on paper and 3.06:1 on paper-warm.
2. **`--link-rule` is darkened** from the mock's `#c79a8b` to `#a8705f`. Links are ink like the text around them, so the underline is the only thing that marks them, and the mock value gave it 2.21:1 on paper, 1.99:1 on paper-warm and 2.45:1 on card. `#a8705f` gives 3.62:1, 3.26:1 and 4.01:1 and still reads as a faint rubric.
3. **`--shadow-sm` is `0 0 0 transparent` instead of `none`**, so it stays valid inside a `box-shadow` list.
4. **The font stacks name the metric-matched fallbacks from Step 3.** The mock's `'Source Sans 3'` entry is dropped from `--font-ui`: it is the Reserved Font Name, and a locally installed copy must not stand in for MM Sans.
5. **The legacy `#fff` button text becomes `--mat-on-accent`.**

The step also adds the **chrome twins** (convention 3), and the shield exception that gives chrome back to the `.no-print` print bars sitting inside the addition- and multiplication-chart sheet previews. Those bars are chrome, never reach paper, and contain a `PrintButton`.

Replace the whole of `src/styles/tokens.css` with:

```css
/* ------------------------------------------------------------------
   Design tokens — Montessori Math

   MATERIAL tokens (--pv-*, --inset-frame, --fraction-shade, --golden*,
   --bead-*, --felt, --wood, --wood-dark) follow the authentic Montessori
   materials. Never re-point them for a look-and-feel change.

   CHROME tokens (paper, ink, rubric, rules, type, space) dress the site
   around the materials: PRD 19 "The Album".

   THE TOKEN SHIELD (bottom of this file) hands the legacy chrome values
   (--mat-*) back to every material stage and every printable sheet, so
   re-skinning the chrome cannot change a material or a printout.
   ------------------------------------------------------------------ */
:root {
  /* Place-value hierarchy (repeats per family: 1/1k/1M green, 10/10k blue, 100/100k red) */
  --pv-unit: #2e8b57;
  --pv-ten: #1e6bb8;
  --pv-hundred: #c0392b;
  --pv-thousand: #2e8b57;
  --pv-ten-thousand: #1e6bb8;
  --pv-hundred-thousand: #c0392b;
  --pv-million: #2e8b57;

  /* Decimal fraction places (pale mirror of the whole-number hierarchy) */
  --pv-tenth: #8ec1e6;
  --pv-hundredth: #efa3b7;
  --pv-thousandth: #a9d3ab;

  /* Fraction insets: red circles in green metal frames */
  --inset-frame: #4c7a54;
  --fraction-shade: var(--bead-1);

  /* Golden bead material */
  --golden: #d4a017;
  --golden-light: #f0c860;
  --golden-dark: #9c7410;

  /* Colored bead stair 1-9 (+10 golden) */
  --bead-1: #d62828;
  --bead-2: #2e8b57;
  --bead-3: #ef8fb0;
  --bead-4: #f4c430;
  --bead-5: #7fb8e0;
  --bead-6: #9b7ebd;
  --bead-7: #f8f8f2;
  --bead-8: #8b5a2b;
  --bead-9: #24408e;
  --bead-10: #d4a017;

  /* Material surfaces (the chrome no longer uses wood) */
  --wood: #b58863;
  --wood-dark: #8a623f;
  --felt: #3f6b4f; /* green work mat */

  /* State */
  --focus: #1e6bb8;
  --ok: #2e8b57;
  --error: #c0392b;

  /* Bead rendering — the shading and hardware of a glass bead, not palette.
     Used by src/components/beads.tsx so no component carries color literals. */
  --bead-shade: #000000; /* drawn at low opacity for the underside */
  --bead-sheen: #ffffff; /* the highlight catching the light */
  --bead-wire: #9a9a9a; /* the wire a bar is threaded on */
  --bead-outline: rgba(0, 0, 0, 0.55); /* keeps the white 7-bar visible in print */

  /* ---------- Legacy chrome values (source of the shield) ----------
     Exactly what the chrome tokens were before PRD 19. The shield gives
     these back to every .material-stage and .print-sheet. Changing one of
     them changes every material and every printable: don't. */
  --mat-paper: #faf7f0;
  --mat-paper-warm: #f3ecdd;
  --mat-card: #ffffff;
  --mat-ink: #33302a;
  --mat-ink-soft: #6f6759;
  --mat-line: #e4ddcc;
  --mat-accent: #b0523c;
  --mat-accent-dark: #8d3f2e;
  --mat-on-accent: #ffffff;
  --mat-radius: 10px;
  --mat-radius-sm: 6px;
  --mat-shadow-sm: 0 1px 3px rgba(51, 48, 42, 0.12);
  --mat-shadow-md: 0 1px 2px rgba(51, 48, 42, 0.1), 0 6px 18px rgba(51, 48, 42, 0.12);
  --font-numeral: Georgia, 'Times New Roman', serif; /* number cards and stamps keep Georgia figures */
  --font-material: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;

  /* ---------- Chrome: paper and ink ----------
     Contrast is WCAG 2.x, measured against the surface named. */
  --paper: #f6f1e7; /* the album page; ink on paper 14.04:1 */
  --paper-warm: #ede5d5; /* quiet fills, hover wash, tool panels; ink 12.62:1 */
  --desk: #e2d9c7; /* the desk a printable sheet lies on (screen only); ink 11.27:1 */
  --card: #fffdf8; /* plate and sheet stock, buttons, fields; ink 15.54:1 */
  --ink: #26221d; /* letterpress black: text, rules, button borders */
  --ink-soft: #5e5548; /* meta text only: 6.50:1 paper, 5.85:1 paper-warm, 7.20:1 card */
  --line: #d6ccb8; /* hairline between entries: decorative, never a control's only edge */
  --line-strong: #8c816f; /* field borders, spoken-line rule: 3.77:1 card, 3.40:1 paper, 3.06:1 paper-warm */
  --accent: #9a3b27; /* rubric: numerals, quote marks, the one primary action; 6.16:1 paper, 6.82:1 card */
  --accent-dark: #7a2d1d; /* rubric hover and pressed; 8.40:1 paper */
  --on-accent: #fffdf8; /* text on rubric: 6.82:1 on accent, 9.30:1 on accent-dark */
  --link-rule: #a8705f; /* underline under ink link text, the only cue: 3.62:1 paper, 3.26:1 paper-warm, 4.01:1 card */
  /* The Oxford rule: a 2px rule over a 1px rule, 2px apart. Used as a background,
     so print rules replace it with a 3px double border (backgrounds don't print). */
  --oxford-under: linear-gradient(var(--ink), var(--ink)) left bottom / 100% 1px no-repeat,
    linear-gradient(var(--ink), var(--ink)) left calc(100% - 4px) / 100% 2px no-repeat;
  --oxford-over: linear-gradient(var(--ink), var(--ink)) left top / 100% 1px no-repeat,
    linear-gradient(var(--ink), var(--ink)) left 4px / 100% 2px no-repeat;
  /* The three-bead golden fleuron (section-break ornament), 44 x 12 px. */
  --fleuron: radial-gradient(circle 6px at 6px 6px, var(--golden-light) 0, var(--golden) 3px, var(--golden-dark) 5.4px, transparent 6px)
    0 0 / 16px 12px repeat-x;

  /* ---------- Chrome: type ---------- */
  --font-text: 'Newsreader', 'Newsreader Fallback', Georgia, 'Times New Roman', serif;
  --font-ui: 'MM Sans', 'MM Sans Fallback', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-heading: var(--font-text);
  --font-body: var(--font-text);
  --font-mono: ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace;
  --fs-caps: 0.875rem; /* 14  sans capitals: margin heads, labels, meta, kickers */
  --fs-ui: 1rem; /* 16  nav, buttons, fields, help, tables */
  --fs-read-sm: 1.0625rem; /* 17  summaries, notes, captions */
  --fs-body: 1.125rem; /* 18  reading text */
  --fs-lede: 1.3125rem; /* 21  ledes, entry titles, h3 */
  --fs-h2: 1.75rem; /* 28  chapter and section heads */
  --fs-h1: clamp(2.25rem, 1.6rem + 1.9vw, 3.25rem); /* 36-52 */
  --fs-display: clamp(2.75rem, 1.4rem + 4.6vw, 4.75rem); /* 44-76, home only */
  --measure: 40rem; /* about 70 characters at 18px */

  /* ---------- Chrome: space, shape, depth ---------- */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2.25rem;
  --space-7: 3rem;
  --space-8: 4.5rem;
  --radius-chrome: 2px; /* paper corners */
  --radius-control: 3px; /* buttons */
  --shadow-sheet: 0 1px 1px rgba(38, 34, 29, 0.12), 0 18px 36px -14px rgba(38, 34, 29, 0.45);
  --container: min(1068px, calc(100% - 2rem)); /* header, main and footer share it (screen only) */
  --margin-col: 11rem; /* album and guide margin heads */
  --gutter: 2.75rem;

  /* Legacy names, re-pointed for the chrome (the shield restores them) */
  --radius: var(--radius-chrome);
  --radius-sm: var(--radius-chrome);
  --shadow-sm: 0 0 0 transparent; /* no card shadows; still valid inside a box-shadow list */
  --shadow-md: var(--shadow-sheet);

  /* Interaction */
  --touch-target: 44px;

  /* ---------- Chrome twins ----------
     A custom property inherits its computed value, so each twin is resolved
     HERE, to the chrome value, and keeps it inside a shielded element. Use a
     twin only for chrome drawn on or inside a shielded element (the plate
     mount on .material-stage; the no-print control bars inside a sheet
     preview). Everywhere else use the plain name. */
  --chrome-paper: var(--paper);
  --chrome-paper-warm: var(--paper-warm);
  --chrome-card: var(--card);
  --chrome-ink: var(--ink);
  --chrome-ink-soft: var(--ink-soft);
  --chrome-line: var(--line);
  --chrome-accent: var(--accent);
  --chrome-accent-dark: var(--accent-dark);
  --chrome-on-accent: var(--on-accent);
  --chrome-radius: var(--radius);
  --chrome-radius-sm: var(--radius-sm);
  --chrome-shadow-sm: var(--shadow-sm);
  --chrome-shadow-md: var(--shadow-md);
  --chrome-font-heading: var(--font-heading);
  --chrome-font-body: var(--font-body);
  --chrome-font-text: var(--font-text);
  --chrome-font-ui: var(--font-ui);
}

/* Phones: one 16px gutter, and album/guide margin heads stack above their text. */
@media screen and (max-width: 640px) {
  :root {
    --container: calc(100% - 32px);
    --margin-col: 0px;
    --gutter: 0px;
  }
}

/* ------------------------------------------------------------------
   The token shield
   Every virtual material (.material-stage) and every printable sheet
   (.print-sheet) gets the legacy chrome values back. Material tokens are
   not listed: they are never re-pointed. The shared material primitives
   (NumberCard, StampTile, beads.tsx) are only ever rendered inside a stage
   or a sheet; if a chrome page ever shows one inline, add its class here.
   ------------------------------------------------------------------ */
.material-stage,
.print-sheet {
  --paper: var(--mat-paper);
  --paper-warm: var(--mat-paper-warm);
  --card: var(--mat-card);
  --ink: var(--mat-ink);
  --ink-soft: var(--mat-ink-soft);
  --line: var(--mat-line);
  --accent: var(--mat-accent);
  --accent-dark: var(--mat-accent-dark);
  --on-accent: var(--mat-on-accent);
  --radius: var(--mat-radius);
  --radius-sm: var(--mat-radius-sm);
  --shadow-sm: var(--mat-shadow-sm);
  --shadow-md: var(--mat-shadow-md);
  --font-heading: var(--font-numeral);
  --font-body: var(--font-material);
  --font-text: var(--font-material);
  --font-ui: var(--font-material);
}

/* A stage or sheet inherits its text metrics from the body, which the album
   sets to Newsreader 18px/1.6. Reset them to the legacy body. :where() keeps
   specificity at zero, so any real rule in materials.css, print.css or a
   material's or generator's own CSS still wins. */
:where(.material-stage, .print-sheet) {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.55;
}

:where(.material-stage) {
  color: var(--ink);
}

/* Shield exception: chrome control bars that sit inside a sheet preview but
   never print (.no-print: today the addition- and multiplication-chart print
   bars, with their PrintButton) get the chrome values back through the twins.
   Nothing in a .no-print subtree reaches paper. */
.print-sheet .no-print {
  --paper: var(--chrome-paper);
  --paper-warm: var(--chrome-paper-warm);
  --card: var(--chrome-card);
  --ink: var(--chrome-ink);
  --ink-soft: var(--chrome-ink-soft);
  --line: var(--chrome-line);
  --accent: var(--chrome-accent);
  --accent-dark: var(--chrome-accent-dark);
  --on-accent: var(--chrome-on-accent);
  --radius: var(--chrome-radius);
  --radius-sm: var(--chrome-radius-sm);
  --shadow-sm: var(--chrome-shadow-sm);
  --shadow-md: var(--chrome-shadow-md);
  --font-heading: var(--chrome-font-heading);
  --font-body: var(--chrome-font-body);
  --font-text: var(--chrome-font-text);
  --font-ui: var(--chrome-font-ui);
  font-family: var(--font-ui);
}
```

**What changed from today's file:**

- **Unchanged, in value and order:** every material token, `--focus`, `--ok`, `--error`, the bead-rendering tokens, `--font-mono` and `--touch-target`. `--wood`, `--wood-dark` and `--felt` move out of the old "Surfaces & ink" block into "Material surfaces", with the same values.
- **Re-pointed:** `--paper`, `--paper-warm`, `--card`, `--ink`, `--ink-soft`, `--line`, `--accent`, `--accent-dark` get new hex values. `--radius`, `--radius-sm`, `--shadow-sm`, `--shadow-md`, `--font-heading` and `--font-body` now alias the new chrome scale.
- **Why `--shadow-sm` is a transparent zero shadow rather than `none`:** it stays valid inside a list. `materials.css` line 129 writes `box-shadow: inset …, var(--shadow-sm)`, and `none` there would invalidate the whole declaration. That rule is shielded, but future chrome might copy the pattern.

In `index.html`, the current lines 6–8 are:

```html
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <meta name="theme-color" content="#faf7f0" />
```

Replace them with:

```html
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="preload" href="/fonts/newsreader-roman.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="apple-touch-icon" href="/favicon.svg" />
    <meta name="theme-color" content="#f6f1e7" />
```

- Preload only Newsreader roman, the body face. MM Sans and the italic load on demand, with fallbacks that match their metrics.
- `crossorigin` is required on a font preload: fonts are fetched in CORS mode, so without it the preload is wasted.

In `public/manifest.webmanifest`, lines 8–9 become `"background_color": "#f6f1e7",` and `"theme_color": "#f6f1e7",`. These are the two places outside CSS that mirror `--paper`.

**Check:**

- `npm run build` is green.
- The material tokens are unchanged by value. This prints `material tokens unchanged`:
  ```sh
  git show HEAD:src/styles/tokens.css | grep -oE -- '--(pv|bead|golden|felt|wood|inset-frame|fraction-shade)[a-z0-9-]*: [^;]+' | sort > /tmp/mat-before
  grep -oE -- '--(pv|bead|golden|felt|wood|inset-frame|fraction-shade)[a-z0-9-]*: [^;]+' src/styles/tokens.css | sort > /tmp/mat-after
  diff /tmp/mat-before /tmp/mat-after && echo "material tokens unchanged"
  ```
- The shield probe gives identical before and after output on `/materials/golden-beads`, `/materials/stamp-game`, `/materials/checkerboard`, `/worksheets/multi-digit-ops?seed=424242&key=1` (print, colour and `&bw=1`) and `/kits/golden-bead-cards` (print).
- Chrome text is now Newsreader and the page background is `#f6f1e7`. On `/materials/addition-charts`, open "Print control charts": the Print button in the bar above the sheet renders rubric, not terracotta.
- The print gate PASSes, including the chart and arrow-label sheets whose print bars the shield exception re-points, and the stage gate PASSes.
- The console shows no "preloaded but not used" warning.

## Step 7 — Base element styles: body, headings, paragraphs, links, selection

**Files:** `src/styles/global.css` (modified: current lines 11–58 and 292).

This step sets the album page to Newsreader 18px/1.6 in ink on paper and gives the headings real presence:

- h1 36–52px at weight 400;
- h2 28px;
- h3 21px at weight 500;
- `text-wrap: balance` on h1–h4 and `pretty` on paragraphs, list items and definitions.

Links in running text become ink with a faint rubric underline (`--link-rule`).

The legacy element rules stay exactly as they are, because they are what headings and links *inside* stages and sheets still use (through the pinned tokens). The chrome overrides come after them, carrying the chrome guard.

Current lines 11–17:

```css
body {
  margin: 0;
  font-family: var(--font-body);
  color: var(--ink);
  background: var(--paper);
  line-height: 1.55;
}
```

Replace them with:

```css
/* The album page: Newsreader at 18px on warm paper. Every material stage and
   printable sheet resets font, size and line-height to the legacy body
   (tokens.css, "The token shield"), so nothing inside them moves. */
body {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: 1.6;
  color: var(--ink);
  background: var(--paper);
}
```

Directly above the current line 25 (`h1,`), insert:

```css
/* ---------- Legacy element styles ----------
   These are still what every heading and link INSIDE a material stage or a
   printable sheet uses (their tokens are pinned there by the shield). Leave
   them alone; restyle the chrome in the guarded block below. */

```

Keep lines 25–58 as they are: h1–h4, the h1/h2/h3 sizes, `p`, `a`, `a:hover`, `button` and `:focus-visible`. `:focus-visible` stays a 3px `--focus` ring with a 2px offset. Its contrast is 4.84:1 on paper, 4.36:1 on paper-warm and 5.37:1 on card, and on the rubric button the ring sits on paper outside the 2px offset. Then, directly after the `:focus-visible` rule (after line 58), insert:

```css
/* ---------- Album chrome: element styles ----------
   Every selector here ends in the chrome guard
   :where(:not(.material-stage *, .print-sheet *)), which adds no
   specificity and keeps the rule off everything inside a material stage or
   a printable sheet. Headings keep the legacy font-family rule above, which
   now resolves to Newsreader through --font-heading. */

:is(h1, h2, h3, h4):where(:not(.material-stage *, .print-sheet *)) {
  font-weight: 400;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

h1:where(:not(.material-stage *, .print-sheet *)) {
  font-size: var(--fs-h1);
  line-height: 1.04;
  letter-spacing: -0.022em;
  margin-bottom: var(--space-2);
}

h2:where(:not(.material-stage *, .print-sheet *)) {
  font-size: var(--fs-h2);
  line-height: 1.15;
}

h3:where(:not(.material-stage *, .print-sheet *)) {
  font-size: var(--fs-lede);
  font-weight: 500;
  line-height: 1.2;
}

:is(p, li, dd):where(:not(.material-stage *, .print-sheet *)) {
  text-wrap: pretty;
}

/* Links in running text are ink with a faint rubric underline; the underline
   (not the colour) marks them, so nothing depends on colour alone. */
a:where(:not(.material-stage *, .print-sheet *)) {
  color: var(--ink);
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: var(--link-rule);
  text-underline-offset: 0.2em;
}

a:where(:not(.material-stage *, .print-sheet *)):hover {
  color: var(--accent);
  text-decoration-color: currentColor;
}

:where(:not(.material-stage, .material-stage *, .print-sheet, .print-sheet *))::selection {
  background: var(--golden-light);
  color: var(--ink);
}
```

**Specificity, for the record:**

- Each guarded element rule is (0,0,1), the same as the legacy rule it follows, so it wins on order in the chrome and doesn't match inside a stage or sheet.
- Any class rule, such as `.album h2`, `.chapter-head` or `.row-title`, still beats it.
- `print.css`'s `@media print { a { color: inherit; text-decoration: none } }` loads later at (0,0,1), so printed links are still plain text, exactly as today.
- The selection highlight is ink on golden-light, 9.88:1.

In the phone block, the current line 292 is:

```css
  h1 { font-size: 1.6rem; }
```

Replace it with:

```css
  /* legacy phone h1, kept for any h1 inside a stage or sheet; chrome h1s never
     drop below 2.25rem (the --fs-h1 clamp) */
  h1:where(.material-stage *, .print-sheet *) { font-size: 1.6rem; }
```

On phones, chrome h1s are now 36px against 28px h2s, where today they are 25.6px against 24px (audit S8-18). No h1 is rendered inside a stage or sheet today, but the scoped rule keeps that true if one appears.

**Check:**

- On `/materials` at 1400px, the h1 computes to Newsreader 52px at weight 400. At 390px it is 36px. On `/parents/glossary` at 390px, the h1 (36px) is visibly larger than an h2 (28px).
- On `/materials/multiplication-bead-board` in Table mode, the stage's "Table of N" h3 still computes to Georgia at 16.8px, weight 600, letter-spacing `normal`. Its own CSS sets only family, size and margin; the weight comes from the legacy h3 rule, which the chrome h3 rule must not reach.
- The shield probe gives identical output on `/materials/golden-beads`, `/materials/snake-game` and `/materials/multiplication-bead-board` (the last two have h3s inside the stage), and on `/worksheets/teens-tens?seed=424242&key=1` in print (it has h3s inside the sheet).
- On `/` at 1400px, the card titles no longer end in a single stranded word ("show", "hands", "paper").
- **Lesson and guide print in between.** These rules are not screen-scoped, so from here until Phase 5 lessons and guides print in the new type on their old print layout (see [Rollout](../19-the-album.md#rollout): this state never ships). In Chrome's print preview (Letter, default margins), check `/lessons/golden-beads-addition` and `/parents/glossary`. Both are coherent: nothing is clipped or overlapping, and headings sit with their text.

## Step 8 — `Icon.tsx`: the 14-glyph line icon set

**Files:** `src/components/Icon.tsx` (new), `src/components/Icon.test.ts` (new).

This step translates the prototype's `shim.js` `ICON` table into a real component. The paths are copied verbatim. Every glyph uses a 24-unit grid, a 2px round stroke and `currentColor`, and renders at 20px by default. The SVG is always `aria-hidden` and unfocusable, so the text next to it stays the accessible name. `IconGlyph` exports just the drawing, so the kit plate in `MaterialThumb` (Step 14) can reuse the scissors inside its own `<g>`, the way the prototype does.

Create `src/components/Icon.tsx`:

```tsx
import type { ReactElement } from 'react'

/**
 * The site's line-icon set (PRD 19 "The Album"): a 24-unit grid, 2px round
 * stroke, drawn in currentColor so an icon always matches its label's colour.
 *
 * Icons are decorative: the <svg> is aria-hidden and never focusable, so a
 * control that shows one must keep its text (visible, or visually hidden with
 * .visually-hidden / .btn-label) as its accessible name. Never use an emoji
 * as an icon; Icon.test.ts fails the build if one appears in src/.
 */
export const ICON_NAMES = [
  'print',
  'refresh',
  'sound',
  'sound-off',
  'focus',
  'close',
  'play',
  'book',
  'pencil',
  'scissors',
  'link',
  'help',
  'chevron',
  'arrow',
] as const

export type IconName = (typeof ICON_NAMES)[number]

const GLYPHS: Record<IconName, ReactElement> = {
  print: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <rect x="6.5" y="14" width="11" height="7" rx="1" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4v5h-5" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M18.8 6.2a8 8 0 0 1 0 11.6" />
    </>
  ),
  'sound-off': (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
    </>
  ),
  focus: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  book: (
    <>
      <path d="M2.5 5.5c3-1.6 6.5-1.6 9.5.8v13c-3-2.3-6.5-2.3-9.5-.8z" />
      <path d="M21.5 5.5c-3-1.6-6.5-1.6-9.5.8v13c3-2.3 6.5-2.3 9.5-.8z" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20l1.2-4.8L16 4.4a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L8.8 18.8z" />
      <path d="M14 6.5l3.5 3.5" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.5 8.5L20 20M8.5 15.5L20 4" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.7.3-1.2 1-1.2 1.7v.4" />
      <path d="M12 17h.01" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
}

/**
 * Just the drawing, for composing inside another SVG (e.g. the kit plate in
 * MaterialThumb draws the scissors in its own <g> with its own stroke).
 */
export function IconGlyph({ name }: { name: IconName }) {
  return GLYPHS[name]
}

export interface IconProps {
  name: IconName
  /** Rendered width and height in px; the drawing always uses the 24-unit grid. */
  size?: number
  /** Extra classes after `icon` (e.g. `row-arrow`). */
  className?: string
}

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  )
}
```

Only `print`, `refresh`, `sound`, `sound-off`, `focus`, `close` and `link` are used by Step 10. `play` (Walk-through, Steps 30 and 32), `arrow` (contents rows and home links, Steps 15 and 23) and `scissors` (the kit plate, Step 14) are used later. `book`, `pencil`, `help` and `chevron` complete the prototype's set and cost a few bytes.

Create `src/components/Icon.test.ts`. Step 10 appends a second `describe` to this file.

```ts
import { describe, expect, it } from 'vitest'
import { ICON_NAMES, IconGlyph } from './Icon'

describe('Icon set', () => {
  it('is the 14-glyph album line set, each name once', () => {
    expect(ICON_NAMES).toEqual([
      'print',
      'refresh',
      'sound',
      'sound-off',
      'focus',
      'close',
      'play',
      'book',
      'pencil',
      'scissors',
      'link',
      'help',
      'chevron',
      'arrow',
    ])
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length)
  })

  it('has a drawing for every name', () => {
    for (const name of ICON_NAMES) {
      expect(IconGlyph({ name })).toBeTruthy()
    }
  })
})
```

This is a pure-data test in the house style (compare `src/worksheets/themes.test.ts`). It renders nothing, and importing a `.tsx` module is fine in the node environment.

**Check:**

- `npm test` is green with 2 new tests.
- `npm run build` is green, which proves strict TypeScript and `verbatimModuleSyntax`: `ReactElement` is `import type`.

## Step 9 — Buttons: the chrome `.btn`, the rubric primary, `.icon`, `.visually-hidden`

**Files:** `src/styles/global.css` (modified).

The chrome `.btn` becomes card stock with a 1px ink edge, a 3px radius, and MM Sans 16px at weight 600. It stays at least 44px tall and keeps a visible focus ring. The page's one primary action (`.btn.primary`: home CTA, every Print, builder primary) is **rubric**: `#9a3b27` with `#fffdf8` text (6.82:1), hovering to `#7a2d1d` (9.30:1). This was the owner's decision.

Materials draw `.btn` and `.btn.primary` **inside** their stages; for example Stamp Game's Combine and Golden Beads' Check. So the legacy button rules stay as they are, and the chrome rules are guarded to outside stages. The guard is `:not(.material-stage *)` only, so the Print bars inside chart sheet previews (Step 6's shield exception) get the chrome button too.

Current lines 191–224 hold `.btn`, `.btn:hover`, `.btn.primary`, `.btn.primary:hover` and `.btn:disabled`. Step 7 inserted about 60 lines above them, so locate them by their text (convention 10). Make these changes:

1. Directly above `.btn {` (current line 191), insert:
   ```css
   /* ---------- Buttons ----------
      Legacy button: what every .btn a material draws INSIDE its stage still looks
      like (tokens pinned by the shield). Leave these five rules alone. */
   ```
2. In `.btn.primary` (current lines 211–215), replace `color: #fff;` with `color: var(--on-accent);`. Inside a stage `--on-accent` is pinned to `#ffffff`, so nothing changes there, and the last hex literal leaves the button rules.
3. Directly after `.btn:disabled { … }` (current line 224), insert:

```css
/* Album chrome button: every .btn outside a material stage (toolbars, page
   headers, forms, and the no-print bars inside sheet previews). Card stock,
   an ink edge, the sans. The one primary action per page is rubric. */
.btn:where(:not(.material-stage *)) {
  gap: var(--space-2);
  padding: 0.55rem 1.1rem;
  font-family: var(--font-ui);
  font-size: var(--fs-ui);
  font-weight: 600;
  line-height: 1.2;
  color: var(--ink);
  background: var(--card);
  border: 1px solid var(--ink);
  border-radius: var(--radius-control);
}

.btn.has-icon:where(:not(.material-stage *)) {
  padding-left: 0.9rem;
}

.btn:where(:not(.material-stage *)):hover {
  color: var(--ink);
  background: var(--paper-warm);
}

.btn.primary:where(:not(.material-stage *)) {
  color: var(--on-accent);
  background: var(--accent);
  border-color: var(--accent);
}

.btn.primary:where(:not(.material-stage *)):hover {
  color: var(--on-accent);
  background: var(--accent-dark);
  border-color: var(--accent-dark);
}

@media (prefers-reduced-motion: no-preference) {
  .btn:where(:not(.material-stage *)) {
    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      color 120ms ease;
  }
}
```

Order matters here. Each chrome rule has the same specificity as its legacy twin, so it wins on order. `.btn.primary:where(…)` (0,2,0) comes *after* `.btn:where(…):hover` (0,2,0), so a hovered primary stays rubric. Min-height (`--touch-target`), `display: inline-flex`, cursor and `text-decoration: none` still come from the legacy `.btn`. `.btn:disabled` (opacity 0.5) applies to both.

Then, directly after the `::selection` rule added in Step 7, insert the two shared helpers:

```css
/* Shared helpers */
.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

/* Icon.tsx: a 20px line glyph that sits on the text baseline; a flex parent's
   gap spaces it from its label. */
.icon {
  display: inline-block;
  flex: none;
  width: 20px;
  height: 20px;
  vertical-align: -0.2em;
}
```

`.icon` overrides the global `svg { display: block }` (lines 19–23) by class specificity. Inside a `.btn`, the 8px `gap` separates the glyph from the label. That fixes the "emoji glued to text" look, because the icon and the `.btn-label` are separate flex items.

**Measured contrast:**

| Pair | Ratio |
| --- | --- |
| Rubric button text | 6.82:1 |
| Rubric hover text | 9.30:1 |
| Secondary button text, ink on card | 15.54:1 |
| Secondary hover, ink on paper-warm | 12.62:1 |
| Button edge, ink on paper (WCAG 1.4.11) | 14.04:1 |

**Check:**

- On `/worksheets/multi-digit-ops`, Print is rubric with paper-coloured text and New problems is card stock with an ink edge. Both are exactly 44px tall at 1400px and 390px.
- Tab to each button: a 3px blue ring is visible.
- With "Emulate CSS prefers-reduced-motion: reduce" turned on in DevTools, hovering changes the background instantly.
- On `/materials/stamp-game` in Addition mode, Combine (drawn inside the stage) looks exactly as today: 6px radius, terracotta, the system sans. New problem, Set problem and Reset are toolbar controls outside the stage, so they are now album buttons (card stock, a 1px ink edge, 3px corners, MM Sans). The shield probe gives identical output there and on `/materials/golden-beads`, `/materials/decimal-board` and `/materials/division-board`.

## Step 10 — Replace every emoji icon, and guard against new ones

**Files:** `src/components/PrintButton.tsx` (full rewrite), `src/components/MaterialShell.tsx` (modified), `src/worksheets/BuilderPage.tsx` (modified), `src/planner/PlannerPage.tsx` (modified), `src/pages/Home.tsx` (modified), `src/components/Icon.test.ts` (modified), `vite.config.ts` (modified: one line in `test`, no new dependency).

A scan of `src/` for pictographic emoji, the emoji variation selector, and the two symbol glyphs used as icons (⛶ U+26F6, ✕ U+2715) finds five files:

- `PrintButton.tsx`: 🖨
- `MaterialShell.tsx`: 🔊 🔇 ✕ ⛶
- `BuilderPage.tsx`: 🎲
- `PlannerPage.tsx`: 🔗
- `Home.tsx`: 📖 🟡 ✏️

Each gets an `<Icon>` plus a `<span className="btn-label">`, which keeps the text as the accessible name. Home's three headings simply drop the emoji; Step 23's Parts I–III add plates later.

The text marks that materials and printouts rely on stay, because they are content, not icons, and they sit inside shielded stages and sheets: ✓, ✗, ✂ (the kit and command-card cut marks), and × ÷ → − ▸ ◀ ▶.

**`src/components/PrintButton.tsx`.** The whole file is currently:

```tsx
export function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button type="button" className="btn primary no-print" onClick={() => window.print()}>
      🖨 {label}
    </button>
  )
}
```

Replace it with:

```tsx
import { Icon } from './Icon'

/** The page's print action: the rubric primary button with the print glyph. */
export function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button type="button" className="btn primary has-icon no-print" onClick={() => window.print()}>
      <Icon name="print" />
      <span className="btn-label">{label}</span>
    </button>
  )
}
```

All 8 call sites pick this up with no change: LessonPage, GuidePage, BuilderPage, KitPage, PlannerPage, AdditionCharts, MultiplicationCharts and LongChain.

**`src/components/MaterialShell.tsx`.**

- After line 3 (`import { setSoundEnabled, soundEnabled } from '../lib/sound'`), add `import { Icon } from './Icon'`.
- In the doc comment, line 22 `* surface for children who don't read yet. Esc or ✕ exits.` becomes `* surface for children who don't read yet. Esc or the Exit focus button exits.` (the guard test scans comments too).
- Replace the two toggles, current lines 41–59:

```tsx
  const soundToggle = sound !== false && (
    <button
      type="button"
      className="btn"
      onClick={() => {
        const next = !soundOn
        setSoundEnabled(next)
        setSoundOn(next)
      }}
    >
      {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
    </button>
  )

  const focusToggle = (
    <button type="button" className="btn" onClick={() => setFocus((f) => !f)}>
      {focus ? '✕ Exit focus' : '⛶ Focus'}
    </button>
  )
```

with:

```tsx
  const soundToggle = sound !== false && (
    <button
      type="button"
      className="btn has-icon"
      onClick={() => {
        const next = !soundOn
        setSoundEnabled(next)
        setSoundOn(next)
      }}
    >
      <Icon name={soundOn ? 'sound' : 'sound-off'} />
      <span className="btn-label">{soundOn ? 'Sound on' : 'Sound off'}</span>
    </button>
  )

  const focusToggle = (
    <button type="button" className="btn has-icon" onClick={() => setFocus((f) => !f)}>
      <Icon name={focus ? 'close' : 'focus'} />
      <span className="btn-label">{focus ? 'Exit focus' : 'Focus'}</span>
    </button>
  )
```

This step changes only the toggles' contents and adds `has-icon`. Step 27 adds `btn-utility` and the `.material-utility`, `.material-task` and `.material-toolbar` grouping, and Step 28 the phone rule that visually hides `.btn-label`.

**`src/worksheets/BuilderPage.tsx`.** The line numbers below are from `main@0faa268`. The bug-fix commit `477ac70` (on `album-baseline`) replaced this file's number input with a `NumberField` component, which moved the button down to lines 202–204; locate the code by content.

- After line 8 (`import { PrintButton } from '../components/PrintButton'`), add `import { Icon } from '../components/Icon'`.
- Current lines 170–172:
  ```tsx
              <button type="button" className="btn" onClick={() => update({ seed: String(randomSeed()) })}>
                🎲 New problems
              </button>
  ```
  become:
  ```tsx
              <button type="button" className="btn has-icon" onClick={() => update({ seed: String(randomSeed()) })}>
                <Icon name="refresh" />
                <span className="btn-label">New problems</span>
              </button>
  ```
  Step 39 later moves this button into the PageHeader action slot unchanged.

**`src/planner/PlannerPage.tsx`.**

- After line 8 (`import { PrintButton } from '../components/PrintButton'`), add `import { Icon } from '../components/Icon'`.
- Current lines 318–320:
  ```tsx
              <button type="button" className="btn" onClick={copyLink}>
                {copied ? 'Copied' : '🔗 Copy link'}
              </button>
  ```
  become:
  ```tsx
              <button type="button" className="btn has-icon" onClick={copyLink}>
                <Icon name="link" />
                <span className="btn-label">{copied ? 'Copied' : 'Copy link'}</span>
              </button>
  ```
  Step 41 fixes the width shift when the label changes (audit S9-30).

**`src/pages/Home.tsx`.** Lines 58, 67 and 76 become `<h3>Lessons — you read, then show</h3>`, `<h3>Materials — the child's hands</h3>` and `<h3>Worksheets — practice on paper</h3>`: the emoji and their trailing space are deleted, and for ✏️ that includes the invisible U+FE0F. Step 23's rewrite replaces these headings later and must not bring an emoji back.

**`src/components/Icon.test.ts`.** Append this to the file created in Step 8:

```ts
describe('no emoji icons in src/', () => {
  // Every source and stylesheet as raw text (Vite glob, so no Node types needed).
  const files = import.meta.glob<string>(['../**/*.{ts,tsx,css}', '!../**/*.test.{ts,tsx}'], {
    query: '?raw',
    import: 'default',
    eager: true,
  })
  // Pictographic emoji, the emoji variation selector, and the two glyphs the
  // material toolbar used as icons (⛶ U+26F6, ✕ U+2715). Text marks the
  // materials rely on (✓ ✗ ✂ × ÷ → −) are allowed.
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{FE0F}\u{26F6}\u{2715}]/u

  it('scans the whole source tree', () => {
    expect(Object.keys(files).length).toBeGreaterThan(100)
  })

  it('finds no emoji: use <Icon> with a text label instead', () => {
    const offenders = Object.entries(files)
      .filter(([, text]) => EMOJI.test(text))
      .map(([path]) => path)
    expect(offenders).toEqual([])
  })
})
```

`import.meta.glob` is typed by `vite/client`, which is already the only entry in `tsconfig.json` `types`. Vitest runs Vite's transform, so `?raw` works in the node environment. The project has no `@types/node`, so `node:fs` is not an option.

**`vite.config.ts`.** By default Vitest turns every `.css` import into an empty string, `?raw` imports included (its `test.css.include` defaults to `[]`), so without this change the guard would see every stylesheet as empty and pass an emoji in CSS. The `test` block is currently:

```ts
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
```

Replace it with:

```ts
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    // Let `?raw` imports of stylesheets return their text, so the no-emoji
    // guard in src/components/Icon.test.ts scans CSS too (Vitest empties
    // every .css import by default).
    css: { include: [/\.css\?raw$/] },
  },
```

Only `?raw` stylesheet imports are affected; no test imports CSS any other way, and the full suite stays green.

**Check:**

- `npm test` is green with 4 new tests in total, and `npm run build` is green.
- Put 🖨 back into `PrintButton.tsx`, and `npm test` fails naming `./PrintButton.tsx`. Revert it.
- Append the comment `/* 🖨 */` to `src/styles/global.css`, and `npm test` fails naming `../styles/global.css`. Revert it. (Without the `vite.config.ts` change it would pass.)
- On `/materials/golden-beads` (1400px), Sound on and Focus show line glyphs 8px from their labels. Clicking them swaps to the sound-off and close glyphs, and the labels read "Sound off" and "Exit focus". Esc still exits focus mode.
- A screen reader, or DevTools, Accessibility pane, names the buttons "Print this lesson", "New problems", "Copy link", "Sound on" and "Focus", with no glyph names in them.
- `grep -rnP '[\x{1F000}-\x{1FAFF}\x{FE0F}\x{26F6}\x{2715}]' src` prints nothing.

## Step 11 — The meta line: badges, the age stamp, section labels

**Files:** `src/styles/global.css` (modified: current lines 172–189 and 253–260).

Pills give way to a small-caps meta line: MM Sans at 14px and weight 600, tracked 0.06em, in `--ink-soft` (6.50:1 on paper), with facts separated by middots. The age is the one framed element, a 1px ink "stamp" (ink on paper, 14.04:1), so it is findable without colour and survives B&W print. The `.badge.age` hex literals (`#eef4ee`, `#cfe3cf`) and the failing green-on-tint text (3.80:1) are deleted.

Badges now wrap, so the long kit piece lists can't overflow, and the preset chips on `/worksheets` stop looking like tappable pills. `.section-label` becomes an ink small-caps kicker, where today it is grey. No `.badge` or `.section-label` is rendered inside a material stage or a printable sheet (`grep` of `src/materials/*/[A-Z]*.tsx`, `src/worksheets/generators`, `src/kits/kits`, `src/kits/pieces.tsx`), so these rules need no guard.

Current lines 172–189:

```css
.badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: var(--paper-warm);
  color: var(--ink-soft);
  border: 1px solid var(--line);
  margin-right: 0.35rem;
  white-space: nowrap;
}

.badge.age {
  background: #eef4ee;
  color: var(--pv-unit);
  border-color: #cfe3cf;
}
```

Replace them with:

```css
/* ---------- Meta line: badges and the age stamp ----------
   Not pills: a small-caps run of facts separated by middots. The age is the
   one framed item, an ink stamp, so it is findable without colour. Badges
   wrap, so long piece lists can never overflow their row. */
.badge {
  display: inline;
  font-family: var(--font-ui);
  font-size: var(--fs-caps);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-soft);
  white-space: normal;
}

.badge + .badge::before {
  content: '\00B7';
  content: '\00B7' / '';
  margin: 0 0.5em;
  color: var(--line-strong);
}

.badge.age {
  display: inline-block;
  padding: 0.1rem 0.4rem 0.02rem;
  line-height: 1.35;
  color: var(--ink);
  border: 1px solid var(--ink);
  white-space: nowrap;
}

.badge + .badge.age::before,
.badge.age + .badge::before {
  content: none;
}

.badge + .badge.age,
.badge.age + .badge {
  margin-left: 0.75em;
}

/* A paragraph that holds only badges (PageHeader meta, contents-row meta). */
.meta-line {
  margin: 0;
  line-height: 1.9;
}
```

The separator is generated content with empty alternative text (`/ ''`), so screen readers don't announce "dot". The first `content` line is the fallback for browsers without alt-text support. JSX drops the whitespace between badges written on separate lines, so the middot and its 0.5em margins are the only spacing.

Current lines 253–260:

```css
.section-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ink-soft);
  margin: 2rem 0 0.5rem;
}
```

Replace them with:

```css
/* A small-caps kicker in ink. Index pages turn strand labels into chapter
   heads (.chapter-head); this is the plain label everywhere else. */
.section-label {
  font-family: var(--font-ui);
  font-size: var(--fs-caps);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink);
  margin: var(--space-6) 0 var(--space-3);
}
```

**Check:**

- `/kits` at 390px and 820px: `document.documentElement.scrollWidth === innerWidth` (no sideways scroll), and the pieces text wraps inside its card (audit S1-01).
- `/materials/golden-beads` meta reads `[AGES 4–7] PK–1 · THE DECIMAL SYSTEM`, with the age in a 1px ink box.
- `/worksheets`: the preset names read as plain small-caps text separated by middots, with no fill or border.
- `grep -n '#eef4ee\|#cfe3cf' src/styles/global.css` prints nothing.
- The DevTools contrast picker shows ink-soft badge text at ≥6.5:1 on paper.
