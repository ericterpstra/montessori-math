# PRD 19 · Phase 3 — Hub pages

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Steps 18–25. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


Every index page becomes a book's table of contents: numbered chapter heads with their strand's bead bar, and one whole-row link per entry with a mounted plate or a rubric numeral. The home page becomes the album's title page, and the 404 offers a way onward. The last step retires the card grid.

## Step 18 — `/materials` as a contents list with plates

**Files:** `src/materials/MaterialsIndex.tsx` (modified; whole file replaced).

Currently, lines 8–13 are a bare `h1` plus `p.page-intro`, and lines 19–35 render each strand as `section > p.section-label + ul.card-grid > li > a.card > h3 + p(badges) + p(summary)`. The new version uses the PageHeader, a numbered chapter head with the strand's bead bar, and one plate row per material.

```tsx
import { Link } from 'react-router-dom'
import { MATERIALS } from './registry'
import { STRANDS } from '../lib/strands'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta, ChapterHead, ContentsRow } from '../components/Contents'

export default function MaterialsIndex() {
  return (
    <>
      <PageHeader
        title="Virtual Montessori Materials"
        lede={
          <>
            Faithful on-screen versions of the classic materials, for families who don't have the real ones at hand. The
            real, physical material is always better when you can get it — see{' '}
            <Link to="/parents/using-this-site">using this site</Link> for advice on substitutes you can make at home.
          </>
        }
      />
      {MATERIALS.length === 0 && <p>Materials are being added — check back soon.</p>}
      {STRANDS.map((strand) => {
        const items = MATERIALS.filter((m) => m.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id} className="chapter" data-strand={strand.order}>
            <ChapterHead strand={strand} />
            <ul className="contents" role="list">
              {items.map((m) => (
                <li key={m.slug}>
                  <ContentsRow
                    to={`/materials/${m.slug}`}
                    thumb={m.slug}
                    strandOrder={strand.order}
                    title={m.name}
                    summary={m.summary}
                    meta={<AgeMeta ages={m.ages} grades={m.grades} />}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
```

**Check:** At 1400, `/materials` shows 7 chapter heads: rubric numerals 1–7, each with its own bead-stair bar (1 red bead … 7 white beads), keyed by `data-strand`. Below them are 21 rows, each with a plate, an underlined title, a 17px ink summary, a right-aligned boxed age and grades, and an arrow. Every `.contents-row` is at least 72px tall (`[...document.querySelectorAll('.contents-row')].every(r => r.offsetHeight >= 72)`). At 820 the rows stack title/meta over summary. At 390 the arrow hides and the meta sits under the summary. `document.documentElement.scrollWidth === innerWidth` at all three widths.

## Step 19 — `/worksheets` and `/kits` as contents lists

**Files:** `src/worksheets/WorksheetsIndex.tsx` (modified; whole file replaced), `src/kits/KitsIndex.tsx` (modified; whole file replaced).

Worksheets (currently lines 19–44) and kits (currently lines 21–35) use the same card-grid markup. In WorksheetsIndex, lines 30–38 render the presets as `span.badge` pills that look tappable but are not (S1-15), and lines 46–59 hold a separate "Beyond worksheets" card grid. In KitsIndex, line 29 renders the piece list as a nowrap `span.badge`, which overflows the card and scrolls phone pages sideways (S1-01). Presets and pieces become the row's plain `note` line.

```tsx
import { GENERATORS } from './registry'
import { STRANDS } from '../lib/strands'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta, ChapterHead, ContentsRow } from '../components/Contents'

export default function WorksheetsIndex() {
  return (
    <>
      <PageHeader
        title="Printable Worksheets"
        lede={
          <>
            Every worksheet is generated fresh from your settings — ranges, difficulty, layout, how many problems — with
            an answer key on its own page. Print in authentic Montessori color or ink-friendly black &amp; white. The same
            seed always reproduces the same sheet, so you can reprint one your child liked.
          </>
        }
      />
      {GENERATORS.length === 0 && <p>Worksheet generators are being added — check back soon.</p>}
      {STRANDS.map((strand) => {
        const items = GENERATORS.filter((g) => g.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id} className="chapter" data-strand={strand.order}>
            <ChapterHead strand={strand} />
            <ul className="contents" role="list">
              {items.map((g) => (
                <li key={g.slug}>
                  <ContentsRow
                    to={`/worksheets/${g.slug}`}
                    thumb="sheet"
                    title={g.name}
                    summary={g.description}
                    meta={<AgeMeta ages={g.ages} />}
                    note={g.presets.length > 0 ? `Presets: ${g.presets.map((p) => p.name).join(' · ')}` : undefined}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      <section className="chapter">
        <ChapterHead name="Beyond worksheets" />
        <ul className="contents" role="list">
          <li>
            <ContentsRow
              to="/kits"
              thumb="kit"
              title="Make-It-Yourself Kits"
              summary="Print, cut, and assemble real Montessori materials — number cards, stamp tiles, fraction circles, strip boards, and more. True-size pieces on US Letter cardstock."
            />
          </li>
        </ul>
      </section>
    </>
  )
}
```

```tsx
import { KITS } from './registry'
import { STRANDS } from '../lib/strands'
import { materialBySlug } from '../materials/registry'
import { PageHeader } from '../components/PageHeader'
import { ChapterHead, ContentsRow } from '../components/Contents'
import './kits.css'

export default function KitsIndex() {
  return (
    <>
      <PageHeader
        title="Make-It-Yourself Kits"
        lede={
          <>
            Print, cut, and assemble real Montessori materials at true physical size. Print each kit at 100% scale
            (&ldquo;Actual size&rdquo;) on US Letter cardstock — every kit&rsquo;s first page has a 1-inch calibration
            square so you can check before cutting — and everything works in authentic color or ink-friendly black &amp;
            white.
          </>
        }
      />
      {STRANDS.map((strand) => {
        const items = KITS.filter((k) => materialBySlug(k.forMaterials[0])?.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id} className="chapter" data-strand={strand.order}>
            <ChapterHead strand={strand} />
            <ul className="contents" role="list">
              {items.map((k) => (
                <li key={k.slug}>
                  <ContentsRow to={`/kits/${k.slug}`} thumb="kit" title={k.name} summary={k.description} note={k.pieces} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
```

**Check:** `/worksheets` shows 7 strand chapters and an unnumbered "Beyond worksheets" chapter with the kit plate. Each generator row shows the sheet plate and the boxed age. The Math Facts row's presets read `Presets: First addition facts · …` in grey sans text, with no pill border or fill. On `/kits` at 390 and 820, `document.documentElement.scrollWidth === innerWidth`, so there is no sideways scroll. The Golden Bead Cards pieces line wraps inside its row.

## Step 20 — `/lessons` as a numbered contents list

**Files:** `src/lessons/LessonsIndex.tsx` (modified; whole file replaced).

Currently, lines 21–23 put a `.badge.age` inside `p.section-label`, which renders as "AGES 4–6" because it inherits the label's uppercase. Line 24 is an inline-styled `p` (`style={{ color: 'var(--ink-soft)', maxWidth: '46rem' }}`). Lines 25–32 run the link, age pill and overview together in one `<li>`: 140-character lines, no gap between items, and 19px tap targets (S1-06, S1-22). Each lesson becomes a numbered row with a rubric numeral (`lesson.sequence`), the title, the overview as summary, and the boxed age.

```tsx
import { Link } from 'react-router-dom'
import { LESSONS } from './registry'
import { STRANDS } from '../lib/strands'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta, ChapterHead, ContentsRow } from '../components/Contents'

export default function LessonsIndex() {
  return (
    <>
      <PageHeader
        title="Lessons"
        lede={
          <>
            Full album-style lessons, written for parents with no Montessori training: what to gather, exactly what to do
            and say, how the child self-corrects, and where to go next. Every lesson prints cleanly — read it on paper, not
            over the child's shoulder. New to this? Start with{' '}
            <Link to="/parents/how-to-present">how to present a lesson</Link>.
          </>
        }
      />
      {LESSONS.length === 0 && <p>Lessons are being added — check back soon.</p>}
      {STRANDS.map((strand) => {
        const items = LESSONS.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)
        if (items.length === 0) return null
        return (
          <section key={strand.id} className="chapter" data-strand={strand.order}>
            <ChapterHead strand={strand} />
            <p className="chapter-desc">{strand.description}</p>
            <ol className="contents" role="list">
              {items.map((l) => (
                <li key={l.slug}>
                  <ContentsRow
                    to={`/lessons/${l.slug}`}
                    num={l.sequence}
                    title={l.name}
                    summary={l.overview}
                    meta={<AgeMeta ages={l.ages} />}
                  />
                </li>
              ))}
            </ol>
          </section>
        )
      })}
    </>
  )
}
```

**Check:** At 1400, each strand shows a chapter head, an italic grey `chapter-desc` (max 40rem), then rows with numerals 1…n aligned on the title baseline. The overview column stays at or under 36rem (about 70 characters). At 390 every lesson link is at least 72px tall. No element under `main` has a `style` attribute (`document.querySelectorAll('main [style]').length === 0`).

## Step 21 — `/parents` as a numbered contents list, with the planner note

**Files:** `src/parents/ParentsIndex.tsx` (modified; whole file replaced).

Currently, lines 14–25 are a card grid whose titles are prefixed with `{i + 1}.` in text, and lines 26–33 hold `section.card` with `style={{ maxWidth: '46rem', marginTop: '2rem' }}`, a 46rem card that stops short of the grid above it (S1-28). The guides become numbered rows in reading order, and "Plan the week" becomes a centred `.note` aside under a fleuron. It ends in a ≥44px "Open the planner →" text link.

```tsx
import { Link } from 'react-router-dom'
import { GUIDES } from './registry'
import { PageHeader } from '../components/PageHeader'
import { ContentsRow } from '../components/Contents'
import { Icon } from '../components/Icon'

export default function ParentsIndex() {
  return (
    <>
      <PageHeader
        title="For Parents"
        lede={
          <>
            You don't need Montessori training to use this site — you need about twenty minutes of reading. Start with why
            the materials work, learn the simple way lessons are given, then use the scope &amp; sequence to find where
            your child is.
          </>
        }
      />
      {GUIDES.length === 0 && <p>Guides are being added — check back soon.</p>}
      <ol className="contents contents-first" role="list">
        {GUIDES.map((g, i) => (
          <li key={g.slug}>
            <ContentsRow to={`/parents/${g.slug}`} num={i + 1} title={g.title} summary={g.summary} />
          </li>
        ))}
      </ol>
      <section className="note" aria-labelledby="note-plan">
        <span className="fleuron" aria-hidden="true" />
        <h2 id="note-plan">Plan the week</h2>
        <p>
          Pick lessons, worksheets, and materials for the week, then print a parent plan and a "My Work" journal your
          child checks off in pencil. The whole plan lives in the page's URL — bookmark it to keep it; nothing is stored
          anywhere.
        </p>
        <p className="note-action">
          <Link className="text-link" to="/planner">
            Open the planner <Icon name="arrow" />
          </Link>
        </p>
      </section>
    </>
  )
}
```

**Check:** `/parents` shows an ink rule under the lede, then 6 numbered rows (1–6) with a rubric numeral, underlined title and summary. Below them is a centred 42rem note with three golden beads, an italic heading, and "Open the planner →" at least 44px tall. `main [style]` finds 0 elements.

## Step 22 — `/ages`: segmented band tabs and contents rows

**Files:** `src/pages/ageBands.ts` (new), `src/pages/ageBands.test.ts` (new), `src/pages/AgesPage.tsx` (modified; whole file replaced).

Currently, the tabs are content-sized `.btn` / `.btn.primary` inside `.material-controls` (lines 32–45). They are ragged on phones, and the selected tab looks like the terracotta primary action (S1-21). Lessons are narrow `<ol>` link lists that leave two-thirds of the desktop empty (lines 53–62, S1-21), with 19px tap targets (S1-22). Worksheets are a run-in `link — description` list with no measure (lines 84–90). The band list also moves into one module shared with the home page, so the two can never disagree.

```ts
/**
 * The three age bands used by the home page and /ages. One list, so the
 * home entries and the /ages tabs can never disagree. Pure data.
 */
export interface AgeBand {
  /** URL value for /ages?band=… */
  id: '4-6' | '6-9' | '9-12'
  /** 'Ages 4–6' */
  ages: string
  /** 'PK–K', 'Grades 1–3' */
  grades: string
  min: number
  max: number
  /** One sentence for the home entry. */
  blurb: string
  /** MaterialThumb slug of the stage's signature material. */
  thumb: string
}

export const AGE_BANDS: readonly AgeBand[] = [
  {
    id: '4-6',
    ages: 'Ages 4–6',
    grades: 'PK–K',
    min: 4,
    max: 6,
    blurb: 'Counting real things, the bead stair, teens and tens, and the first golden beads.',
    thumb: 'bead-stair',
  },
  {
    id: '6-9',
    ages: 'Ages 6–9',
    grades: 'Grades 1–3',
    min: 6,
    max: 9,
    blurb: 'The four operations with beads and stamps, memorizing facts, first fractions.',
    thumb: 'stamp-game',
  },
  {
    id: '9-12',
    ages: 'Ages 9–12',
    grades: 'Grades 4–6',
    min: 9,
    max: 12,
    blurb: 'Long multiplication and division, the checkerboard, racks & tubes, and decimals.',
    thumb: 'checkerboard',
  },
]

/** True when an item's inclusive age range touches the band. */
export function overlapsBand(ages: readonly [number, number], band: Pick<AgeBand, 'min' | 'max'>): boolean {
  return ages[0] <= band.max && ages[1] >= band.min
}
```

```ts
import { describe, expect, it } from 'vitest'
import { AGE_BANDS, overlapsBand } from './ageBands'
import { hasThumb } from '../components/MaterialThumb'

describe('age bands', () => {
  it('are the three bands, in order, with unique ids', () => {
    expect(AGE_BANDS.map((b) => b.id)).toEqual(['4-6', '6-9', '9-12'])
  })

  it('each shows a signature material that has a plate', () => {
    for (const b of AGE_BANDS) expect(hasThumb(b.thumb), b.id).toBe(true)
  })

  it('overlapsBand is inclusive at both ends', () => {
    const band = AGE_BANDS[1] // 6–9
    expect(overlapsBand([4, 6], band)).toBe(true)
    expect(overlapsBand([9, 12], band)).toBe(true)
    expect(overlapsBand([7, 8], band)).toBe(true)
    expect(overlapsBand([4, 5], band)).toBe(false)
    expect(overlapsBand([10, 12], band)).toBe(false)
  })
})
```

```tsx
import { useSearchParams } from 'react-router-dom'
import { MATERIALS } from '../materials/registry'
import { LESSONS } from '../lessons/registry'
import { GENERATORS } from '../worksheets/registry'
import { STRANDS, strandInfo } from '../lib/strands'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta, ChapterHead, ContentsRow } from '../components/Contents'
import { AGE_BANDS, overlapsBand } from './ageBands'

export default function AgesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const band = AGE_BANDS.find((b) => b.id === searchParams.get('band')) ?? AGE_BANDS[0]

  const lessons = LESSONS.filter((l) => overlapsBand(l.ages, band))
  const materials = MATERIALS.filter((m) => overlapsBand(m.ages, band))
  const generators = GENERATORS.filter((g) => overlapsBand(g.ages, band))

  return (
    <>
      <PageHeader
        title="Browse by Age"
        lede="Ages are readiness ranges, not deadlines — most children work across two bands at once. When in doubt, start earlier in the sequence than you think and let ease decide."
      />
      <div className="band-tabs" role="tablist" aria-label="Age band">
        {AGE_BANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            id={`band-tab-${b.id}`}
            aria-selected={b.id === band.id}
            aria-controls="band-panel"
            className="band-tab"
            onClick={() => setSearchParams({ band: b.id }, { replace: true })}
          >
            <span className="band-tab-ages">{b.ages}</span>
            <span className="band-tab-grades">{b.grades}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id="band-panel" aria-labelledby={`band-tab-${band.id}`}>
        <h2 className="section-head">Lessons, in order</h2>
        {lessons.length === 0 && <p>Lessons for this band are being added.</p>}
        {STRANDS.map((strand) => {
          const items = lessons.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)
          if (items.length === 0) return null
          return (
            <section key={strand.id} className="chapter minor" data-strand={strand.order}>
              <ChapterHead strand={strand} as="h3" size="minor" />
              <ol className="contents" role="list">
                {items.map((l) => (
                  <li key={l.slug}>
                    <ContentsRow
                      to={`/lessons/${l.slug}`}
                      num={l.sequence}
                      title={l.name}
                      summary={l.overview}
                      meta={<AgeMeta ages={l.ages} />}
                    />
                  </li>
                ))}
              </ol>
            </section>
          )
        })}

        <h2 className="section-head">Virtual materials</h2>
        {materials.length === 0 && <p>Materials for this band are being added.</p>}
        <ul className="contents" role="list">
          {materials.map((m) => (
            <li key={m.slug}>
              <ContentsRow
                to={`/materials/${m.slug}`}
                thumb={m.slug}
                strandOrder={strandInfo(m.strand).order}
                title={m.name}
                summary={m.summary}
                meta={<AgeMeta ages={m.ages} grades={m.grades} />}
              />
            </li>
          ))}
        </ul>

        <h2 className="section-head">Worksheets</h2>
        {generators.length === 0 && <p>Worksheets for this band are being added.</p>}
        <ul className="contents" role="list">
          {generators.map((g) => (
            <li key={g.slug}>
              <ContentsRow to={`/worksheets/${g.slug}`} thumb="sheet" title={g.name} summary={g.description} meta={<AgeMeta ages={g.ages} />} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
```

**Check:**
- `npm test` green, with 3 new tests.
- On `/ages?band=6-9` at 390 the three tabs are equal width (compare `offsetWidth`s). Each shows "Ages 6–9" over "GRADES 1–3". The selected tab has `aria-selected="true"`, ink text, bold weight and a 3px ink underline.
- Tapping a tab updates `?band=` with `replace` (the Back button leaves `/ages`), and the tabpanel's `aria-labelledby` follows the selection.
- Lessons appear under minor strand heads as numbered rows with overviews. Materials show plates, and worksheets show the sheet plate.

## Step 23 — Home, the title page of the album

**Files:** `src/pages/Home.tsx` (modified; whole file replaced), `src/styles/global.css` (modified: deletion).

Currently, lines 25–52 are `section.home-hero` with a flex text column (`h1`, two `p.page-intro`, and `p.home-cta` holding one `.btn.primary` and two `.btn`) beside `div.home-hero-beads[aria-hidden]` (`ThousandCube 104`, `HundredSquare 72`, `TenBar beadSize 13`, `Bead 16`: out of proportion, and hidden under 760px, S1-09). Lines 54–95 are two card grids whose h3s start with emoji (`📖 🟡 ✏️`). Lines 97–107 are `section.card` with inline `style`.

The new page has:
- a rubric kicker, a 44–76px display title, a 21px ink lede, the privacy promise as a ruled caps line, and one rubric primary CTA with two quiet arrow links (S1-08);
- Plate I, a double-framed plate with the golden bead family in true proportion and a real `figcaption`, shown on phones directly under the title;
- Parts I–III, with rubric numerals, plates, underlined names and italic subtitles;
- the age bands as plate rows (bead stair, stamp game, checkerboard);
- the note on screens as a `.note` aside.

```tsx
import { Link } from 'react-router-dom'
import { Bead, TenBar, HundredSquare, ThousandCube } from '../components/beads'
import { ContentsRow } from '../components/Contents'
import { Icon } from '../components/Icon'
import { MaterialThumb } from '../components/MaterialThumb'
import { AGE_BANDS } from './ageBands'

/** The three kinds of pages, numbered like the parts of a book. */
const PARTS = [
  {
    numeral: 'I.',
    to: '/lessons',
    thumb: 'album',
    kind: 'Lessons',
    sub: 'you read, then show',
    text: 'Album-style presentations: what to gather, exactly what to do and say, and how the child checks their own work. Print one, read it with coffee, present it in ten quiet minutes.',
    go: 'Open the lessons',
  },
  {
    numeral: 'II.',
    to: '/materials',
    thumb: 'golden-beads',
    kind: 'Materials',
    sub: "the child's hands",
    text: 'Golden beads, the stamp game, bead frames, the checkerboard and more — virtual stand-ins that behave like the real materials, exchanges and all. Real beads are better; these fill the gaps.',
    go: 'Open the materials',
  },
  {
    numeral: 'III.',
    to: '/worksheets',
    thumb: 'sheet',
    kind: 'Worksheets',
    sub: 'practice on paper',
    text: 'Generate exactly the sheet your child needs — operation, ranges, regrouping or not, how many problems — with an answer key, in Montessori color or ink-friendly B&W.',
    go: 'Make a worksheet',
  },
]

/* Plate I: one bead unit (11px) sets every piece, so the bar, the square's
   side and the cube's face are all ten beads long, as in the real material. */
const BEAD = 11

export default function Home() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-title">
          <p className="page-kicker">A free Montessori album for families · Ages 4–12</p>
          <h1 id="home-title">Montessori Math at Home</h1>
        </div>
        <figure className="plate-hero">
          <div className="plate-hero-art">
            <ThousandCube size={Math.round(BEAD * 12.4)} />
            <HundredSquare size={BEAD * 10} />
            <TenBar beadSize={BEAD} vertical />
            <Bead size={BEAD} />
          </div>
          <figcaption className="plate-caption">
            <span className="plate-no">Plate I.</span> A thousand, a hundred, a ten and a unit.
          </figcaption>
        </figure>
        <div className="hero-body">
          <p className="page-lede">
            A complete, free resource for teaching mathematics the Montessori way, ages 4–12: full lessons written for
            untrained parents, printable worksheets you can tune to your child, and faithful on-screen versions of the
            classic materials for when you don't own the real ones.
          </p>
          <p className="promise">No accounts. No tracking. Nothing to buy. Print freely.</p>
          <div className="home-cta">
            <Link className="btn primary" to="/parents/montessori-math-overview">
              New here? Start with the five-minute overview
            </Link>
            <p className="home-links">
              <Link className="text-link" to="/parents/scope-and-sequence">
                See the full PK–6 path <Icon name="arrow" />
              </Link>
              <Link className="text-link" to="/planner">
                Plan a week of work <Icon name="arrow" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      <h2 className="section-head">Three kinds of pages, one method</h2>
      <ul className="parts" role="list">
        {PARTS.map((part) => (
          <li key={part.to}>
            <Link className="part-entry" to={part.to}>
              <span className="part-head">
                <span className="part-num">{part.numeral}</span>
                <MaterialThumb slug={part.thumb} />
              </span>
              <h3>
                <span className="part-kind">{part.kind}</span>
                <span className="part-sub">{part.sub}</span>
              </h3>
              <span className="part-text">{part.text}</span>
              <span className="part-go">
                {part.go} <Icon name="arrow" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="section-head">Find your child's starting point</h2>
      <ul className="contents bands" role="list">
        {AGE_BANDS.map((b) => (
          <li key={b.id}>
            <ContentsRow to={`/ages?band=${b.id}`} thumb={b.thumb} title={b.ages} titleMeta={b.grades} summary={b.blurb} />
          </li>
        ))}
      </ul>

      <section className="note" aria-labelledby="note-screens">
        <span className="fleuron" aria-hidden="true" />
        <h2 id="note-screens">A note on screens</h2>
        <p>
          Montessori math lives in the hands. The on-screen materials here exist for one reason: most families don't
          own a bank of golden beads or a set of racks and tubes. Use them the way you'd use the real thing — briefly,
          purposefully, sitting beside your child — and put everything else on paper. Every lesson's follow-up work is
          printable or pencil-and-paper by design. See <Link to="/parents/using-this-site">using this site</Link> for
          inexpensive ways to make the physical materials yourself.
        </p>
      </section>
    </>
  )
}
```

**`src/styles/global.css`:** delete lines **262–290** (in the original numbering), from `/* ---------- Home ---------- */` through the closing `}` of the `@media (max-width: 760px) { .home-hero-beads { display: none; } }` block (line 289) and the blank line 290. The deleted rules are `.home-hero` (flex), `.home-hero-beads`, `.home-cta` (flex-wrap) and the 760px hide rule. Earlier steps have moved it, so find it by its text (convention 10).

**Check:**
- At 1400 the kicker, the title in one line and the lede sit left, with Plate I right and centred on the body. The primary CTA is alone on its line with the two arrow links on the next line.
- In Plate I, the cube's front face, the square's side and the bar all measure 110px: `document.querySelectorAll('.plate-hero-art svg')` has heights 136, 110, 110, 11.
- At 820 the plate shrinks (zoom 0.8) and the parts stay three across. At 390, Plate I sits under the title and the CTA runs full width with its text left-aligned.
- No emoji remain on the page: `/\p{Extended_Pictographic}/u.test(document.querySelector('main').innerText)` is `false`.

## Step 24 — The 404 page, with ways onward

**Files:** `src/pages/NotFound.tsx` (modified; whole file replaced).

Currently the whole 404 page (lines 5–10) is an `h1` and one sentence linking home (S1-17). It becomes a PageHeader plus a contents list of the six hubs. With Step 12's sticky colophon, the page no longer ends a quarter of the way down the screen. The unknown-slug routes that render `<NotFound/>` (MaterialPage, LessonPage, KitPage, GuidePage, BuilderPage) get the same page.

```tsx
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ContentsRow } from '../components/Contents'

/** Where a lost visitor most likely meant to go. */
const HUBS = [
  { to: '/materials', title: 'Materials', summary: 'The virtual golden beads, stamp game, bead frames and more.' },
  { to: '/lessons', title: 'Lessons', summary: 'Album-style lessons, written for parents, in curriculum order.' },
  { to: '/worksheets', title: 'Worksheets', summary: 'Printable practice with an answer key, in color or black & white.' },
  { to: '/kits', title: 'Kits', summary: 'Print, cut and assemble real materials at true size.' },
  { to: '/parents', title: 'For Parents', summary: 'How the method works and how to give a lesson.' },
  { to: '/ages', title: 'By Age', summary: 'Everything for ages 4–6, 6–9 or 9–12 on one page.' },
]

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        lede={
          <>
            That page doesn't exist. Try the <Link to="/">home page</Link>, or one of these:
          </>
        }
      />
      <ul className="contents contents-first" role="list">
        {HUBS.map((h) => (
          <li key={h.to}>
            <ContentsRow to={h.to} title={h.title} summary={h.summary} />
          </li>
        ))}
      </ul>
    </>
  )
}
```

**Check:** `/this-page-does-not-exist` and `/materials/nope` both show "Page not found", six rows with ≥72px targets, the colophon at the viewport bottom at 1400×900, and a tab titled `Page not found · Montessori Math`.

## Step 25 — Retire the card grid

**Files:** `src/styles/global.css` (modified: deletion).

After Steps 18–24, no markup uses `.card-grid` or `a.card`. The material page, the builder, the kit page and the planner still use `.card` until Steps 30 and 39–41 convert them, so `.card` itself stays until Step 42.
- Delete original lines **151–171** (earlier steps have moved them, so delete by rule text): `.card-grid { … }` (151–158), `a.card { … }` (160–165) and `a.card:hover { … }` (167–170), each with its trailing blank line. The `.card` rule at 143–149 and `.badge` at 172 stay.

**Check:**
- `grep -rn "card-grid\|className=\"card\"\|a\.card" src` returns nothing in the hub pages. `MaterialPage.tsx`, `BuilderPage.tsx`, `KitPage.tsx` and `PlannerPage.tsx` still show `card` until Steps 30 and 39–41.
- `grep -rn "section-label\|page-intro" src/pages src/materials/MaterialsIndex.tsx src/worksheets/WorksheetsIndex.tsx src/kits/KitsIndex.tsx src/lessons/LessonsIndex.tsx src/parents/ParentsIndex.tsx` returns nothing.
- `grep -rn "style={{" src/pages src/components/Layout.tsx src/components/PageHeader.tsx src/components/Contents.tsx` finds only the logo gradient `stopColor` in Layout.tsx, which is unchanged from today.
- `grep -rnE '<(ul|ol) className="(contents|parts)' src | grep -v 'role="list"'` prints nothing: every contents list keeps its list semantics in Safari (decision 9).
- `npm run build` and `npm test` green, and the print gate and the stage gate PASS.
