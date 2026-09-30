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
