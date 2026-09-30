# PRD 19 · Phase 5 — Lessons and guides, on screen and on paper

Part of [PRD 19 — The Album: visual redesign](../19-the-album.md). Steps 32–38. Steps are numbered across the whole PRD; read the PRD’s decisions, conventions and rollout first.


Lessons become album pages: a running head with Print, the title over an Oxford rule, section heads hung in the left margin, rubric step numerals in the gutter and spoken lines on a rule. Guides get the same margin heads, and the scope chart unfolds across the full column. Both print in the new design (owner decision 3). That print design gets its own page-break QA and a B&W laser print; it touches no `.print-sheet`.

## Step 32 — The lesson page markup: running head, lede, sections, hung numerals

**Files:** `src/lessons/LessonPage.tsx` (modified: full new content).

This step is the markup half of the album page. It replaces the prototype's `shim.js` lines 249–262 (running-head regrouping, `[style]` removal, `.album-aside`) and its CSS counters for step numerals. Changes, in page order:

- **Header.** One running-head row: `p.album-meta.meta-line` (THE LESSON ALBUM · strand · lesson N · boxed age · grades), with Print in `div.album-actions.no-print` on the same row. The h1 follows the running head. This replaces the inline `marginLeft: 'auto'` span that wrapped Print beside a stranded chip (S5-03).
- **Overview.** It becomes `p.album-lede` (it was `style={{ fontSize: '1.05rem' }}`).
- **Headings.** Each section gets `aria-labelledby` pointing at its h2 id, so later in-page links have anchors. "Direct" and "Indirect" become `h3` subheads.
- **Presentation.** Steps carry `<span className="step-num">{n}</span>`, and the `ol` gets `role="list"` (decision 25).
- **Chrome copy.** The virtual-material line, the Walk-through link and the "Printable:" line follow decision 26. The virtual-material line and Walk-through link are `p.album-aside.no-print`, and the Printable line is `span.album-printable`.
- **Lesson links.** Before-this-lesson links (`ul.album-links`) and next-in-strand links become 44px tap targets in Step 33.
- **Title.** `useDocumentTitle(lesson?.name)` names the tab "Golden Bead Addition · Montessori Math". It is Step 13's hook, called before the early return, as the rules of hooks require.
- **Fleuron.** A bead fleuron (`span.fleuron.album-end.no-print`, Step 12's class) ends the page. The prototype drew it with `.album::after`.

The current header and overview (lines 18–32):

```tsx
  return (
    <article className="album">
      <header className="album-header">
        <h1>{lesson.name}</h1>
        <div className="album-meta">
          <span className="badge">{strand.name} · lesson {lesson.sequence}</span>
          <span className="badge age">ages {lesson.ages[0]}–{lesson.ages[1]}</span>
          <span className="badge">grades {lesson.grades}</span>
          <span style={{ marginLeft: 'auto' }}>
            <PrintButton label="Print this lesson" />
          </span>
        </div>
      </header>

      <p style={{ fontSize: '1.05rem' }}>{lesson.overview}</p>
```

the virtual-material and demo paragraphs (lines 41–68):

```tsx
        {lesson.virtualMaterials.length > 0 && (
          <p className="no-print" style={{ marginTop: '0.5rem' }}>
            No materials at home?{' '}
            {lesson.virtualMaterials.map((slug, i) => {
              const m = materialBySlug(slug)
              return (
                m && (
                  <span key={slug}>
                    {i > 0 && ' · '}
                    Use the virtual <Link to={`/materials/${m.slug}`}>{m.name}</Link>
                  </span>
                )
              )
            })}
          </p>
        )}
        {lesson.virtualMaterials.some((s) => materialBySlug(s)?.demos?.[lesson.slug] !== undefined) && (
          <p className="no-print">
            {lesson.virtualMaterials
              .map((s) => materialBySlug(s))
              .filter((m): m is MaterialDef => m !== undefined && m.demos?.[lesson.slug] !== undefined)
              .map((m) => (
                <Link key={m.slug} className="btn" to={`/materials/${m.slug}?present=${lesson.slug}`}>
                  See this presented on the virtual material ({m.name})
                </Link>
              ))}
          </p>
        )}
```

the presentation (lines 109–119):

```tsx
      <section>
        <h2>Presentation</h2>
        <ol className="presentation">
          {lesson.presentation.map((step, i) => (
            <li key={i}>
              {step.text}
              {step.say && <span className="say">{step.say}</span>}
            </li>
          ))}
        </ol>
      </section>
```

and the follow-up and next links (lines 172–207):

```tsx
      {lesson.followUpWork.length > 0 && (
        <section>
          <h2>Follow-up work (pencil &amp; paper)</h2>
          <ul>
            {lesson.followUpWork.map((f, i) => {
              const g = f.worksheetSlug ? generatorBySlug(f.worksheetSlug) : undefined
              return (
                <li key={i}>
                  {f.description}
                  {g && (
                    <>
                      {' '}
                      — print: <Link to={`/worksheets/${g.slug}${f.presetId ? `?preset=${f.presetId}` : ''}`}>{g.name}</Link>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <h2>What comes next</h2>
        <p>{lesson.whatComesNext}</p>
        {next.length > 0 && (
          <p className="no-print">
            Next in this strand:{' '}
            {next.map((n) => (
              <Link key={n.slug} to={`/lessons/${n.slug}`}>
                {n.name}
              </Link>
            ))}
          </p>
        )}
      </section>
```

Replace the whole file with:

```tsx
import { Link, useParams } from 'react-router-dom'
import { LESSONS, lessonBySlug } from './registry'
import { materialBySlug } from '../materials/registry'
import type { MaterialDef } from '../materials/types'
import { generatorBySlug } from '../worksheets/registry'
import { strandInfo } from '../lib/strands'
import { PrintButton } from '../components/PrintButton'
import { useDocumentTitle } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import NotFound from '../pages/NotFound'

/**
 * One lesson as a page of the teacher's album (PRD 19): a running head with
 * Print, the title over an Oxford rule, a centred lede, section heads hung in
 * the left margin, rubric step numerals hung in the gutter, and spoken lines
 * on a rule. It prints as the same object (album.css @media print).
 */
export default function LessonPage() {
  const { slug } = useParams()
  const lesson = slug ? lessonBySlug(slug) : undefined
  useDocumentTitle(lesson?.name)
  if (!lesson) return <NotFound />

  const strand = strandInfo(lesson.strand)
  const next = LESSONS.filter((l) => l.strand === lesson.strand && l.sequence === lesson.sequence + 1)
  const virtual = lesson.virtualMaterials
    .map((s) => materialBySlug(s))
    .filter((m): m is MaterialDef => m !== undefined)
  const demos = virtual.filter((m) => m.demos?.[lesson.slug] !== undefined)

  return (
    <article className="album" aria-labelledby="album-title">
      <header className="album-header">
        <div className="album-runhead">
          <p className="album-meta meta-line">
            <span className="badge album-name">The Lesson Album</span>
            <span className="badge">
              {strand.name} · lesson {lesson.sequence}
            </span>
            <span className="badge age">
              ages {lesson.ages[0]}–{lesson.ages[1]}
            </span>
            <span className="badge">grades {lesson.grades}</span>
          </p>
          <div className="album-actions no-print">
            <PrintButton label="Print this lesson" />
          </div>
        </div>
        <h1 id="album-title">{lesson.name}</h1>
      </header>

      <p className="album-lede">{lesson.overview}</p>

      <section aria-labelledby="album-materials">
        <h2 id="album-materials">Materials</h2>
        <ul>
          {lesson.materialsNeeded.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
        {virtual.length > 0 && (
          <p className="album-aside no-print">
            No materials at home? Use the virtual{' '}
            {virtual.map((m, i) => (
              <span key={m.slug}>
                {i > 0 && (i === virtual.length - 1 ? ' or ' : ', ')}
                <Link to={`/materials/${m.slug}`}>{m.name}</Link>
              </span>
            ))}
            .
          </p>
        )}
        {demos.length > 0 && (
          <p className="album-aside no-print">
            {demos.map((m) => (
              <Link key={m.slug} className="btn has-icon" to={`/materials/${m.slug}?present=${lesson.slug}`}>
                <Icon name="play" />
                <span className="btn-label">Walk through it on the virtual {m.name}</span>
              </Link>
            ))}
          </p>
        )}
      </section>

      {lesson.prerequisites.length > 0 && (
        <section aria-labelledby="album-before">
          <h2 id="album-before">Before this lesson</h2>
          <ul className="album-links">
            {lesson.prerequisites.map((slug) => {
              const p = lessonBySlug(slug)
              return <li key={slug}>{p ? <Link to={`/lessons/${p.slug}`}>{p.name}</Link> : slug}</li>
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="album-aims">
        <h2 id="album-aims">Aims</h2>
        <div className="album-aims">
          <div>
            <h3>Direct</h3>
            <ul>
              {lesson.directAims.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Indirect</h3>
            <ul>
              {lesson.indirectAims.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="album-presentation">
        <h2 id="album-presentation">Presentation</h2>
        {/* role="list": list-style is none (the numerals are real text), and
            Safari drops list semantics from unstyled lists without it. */}
        <ol className="presentation" role="list">
          {lesson.presentation.map((step, i) => (
            <li key={i}>
              <span className="step-num">{i + 1}</span> {step.text}
              {step.say && <span className="say">{step.say}</span>}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="album-interest">
        <h2 id="album-interest">Points of interest</h2>
        <ul>
          {lesson.pointsOfInterest.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="album-control">
        <h2 id="album-control">Control of error</h2>
        <ul>
          {lesson.controlOfError.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      {lesson.vocabulary.length > 0 && (
        <section aria-labelledby="album-vocabulary">
          <h2 id="album-vocabulary">Vocabulary</h2>
          <ul className="vocab" role="list">
            {lesson.vocabulary.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.variations.length > 0 && (
        <section aria-labelledby="album-variations">
          <h2 id="album-variations">Variations</h2>
          <ul>
            {lesson.variations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.extensions.length > 0 && (
        <section aria-labelledby="album-extensions">
          <h2 id="album-extensions">Extensions</h2>
          <ul>
            {lesson.extensions.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.followUpWork.length > 0 && (
        <section aria-labelledby="album-follow-up">
          <h2 id="album-follow-up">Follow-up work (pencil &amp; paper)</h2>
          <ul>
            {lesson.followUpWork.map((f, i) => {
              const g = f.worksheetSlug ? generatorBySlug(f.worksheetSlug) : undefined
              return (
                <li key={i}>
                  {f.description}
                  {g && (
                    <span className="album-printable">
                      Printable:{' '}
                      <Link to={`/worksheets/${g.slug}${f.presetId ? `?preset=${f.presetId}` : ''}`}>{g.name}</Link>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="album-next">
        <h2 id="album-next">What comes next</h2>
        <p>{lesson.whatComesNext}</p>
        {next.length > 0 && (
          <p className="album-aside album-links no-print">
            Next in this strand:{' '}
            {next.map((n, i) => (
              <span key={n.slug}>
                {i > 0 && ', '}
                <Link to={`/lessons/${n.slug}`}>{n.name}</Link>
              </span>
            ))}
          </p>
        )}
      </section>

      <span className="fleuron album-end no-print" aria-hidden="true" />
    </article>
  )
}
```

**Check:**
- `npm run build` is green.
- On `/lessons/golden-beads-addition`:
  - `document.title` is `Golden Bead Addition · Montessori Math`.
  - `document.querySelectorAll('.album .step-num').length` equals the number of presentation steps.
  - `document.querySelectorAll('.album [style]').length` is `0`.
- `/lessons/stamp-game-intro` reads "No materials at home? Use the virtual Stamp Game or Golden Beads & Mat."
- A lesson with a worksheet shows "Printable: Multi-Digit Operations" on its own line under the follow-up item.
- An unknown slug (`/lessons/nope`) still renders the 404 page.

## Step 33 — The album stylesheet (screen)

**Files:** `src/styles/album.css` (modified: full new content; Step 34 appends the print block).

This is the prototype's §12, written against the real markup, with the margin heads as a grid (decision 24) and the numerals as real spans (decision 25). It sets:
- a centred 56rem page;
- the running head and a 52px weight-350 title over the Oxford rule;
- a centred 21px lede;
- 14px sans capital heads in an 11rem margin column with a 2.75rem gutter;
- en-dash list markers;
- rubric italic numerals hung 0.9rem left of each step;
- spoken lines in italic ink on a 2px `--line-strong` rule, with a `--paper-warm` band on screen only and rubric quote marks;
- two-column aims with italic subheads;
- vocabulary as an italic run-in list;
- the fleuron at the end.

On phones the head stacks, and the title and lede are left-aligned.

The whole current file (126 lines) is replaced. Its card styling, the part that goes away, is lines 3–10:

```css
.album {
  max-width: 50rem;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 2rem 2.4rem;
  box-shadow: var(--shadow-sm);
}
```

Replace the whole file with:

```css
/* ---------- The Lesson Album (PRD 19): screen + print ----------
   A centred 56rem book page: a running head with Print, the title over an
   Oxford rule, a centred lede, section heads hung in an 11rem margin column,
   rubric step numerals hung in the gutter, spoken lines on a 2px rule.
   Lessons print as the same object (see @media print at the end). */

.album {
  max-width: 56rem;
  margin: 0 auto;
}

/* ---------- Running head and title ---------- */

.album-header {
  margin-bottom: var(--space-5);
  padding-bottom: calc(var(--space-4) + 6px);
  background: var(--oxford-under);
  text-align: center;
}

.album-runhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-5);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--line);
  text-align: left;
}

.album-meta {
  margin: 0;
}

.album-meta .album-name {
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--ink);
}

.album-actions {
  flex: none;
  display: flex;
  gap: var(--space-2);
}

.album-header h1 {
  max-width: 18ch;
  margin: var(--space-5) auto 0;
  font-size: var(--fs-h1);
  font-weight: 350;
}

.album-lede {
  max-width: 42rem;
  margin: 0 auto var(--space-5);
  font-size: var(--fs-lede);
  line-height: 1.45;
  text-align: center;
}

/* ---------- Sections with margin heads ---------- */

/* Each section is a two-column grid: the head in the margin column, the
   content in the text column. A grid (not a float) keeps the head and its
   first lines in one row, which a printed page can never split. */
.album section {
  display: grid;
  grid-template-columns: var(--margin-col) minmax(0, 1fr);
  column-gap: var(--gutter);
  align-items: start;
  margin: 0 0 var(--space-6);
  padding: var(--space-4) 0 0;
  border-top: 1px solid var(--line);
}

.album section > * {
  grid-column: 2;
}

.album section > h2 {
  grid-column: 1;
  margin: 0.2rem 0 0;
  padding: 0;
  border: 0;
  font: 700 var(--fs-caps) / 1.4 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink);
}

.album ul,
.album ol {
  margin: 0;
}

.album ul {
  padding-left: 1.2rem;
  list-style-type: '\2013\2002';
}

.album ul > li::marker {
  color: var(--ink-soft);
}

.album li {
  margin-bottom: var(--space-2);
}

.album section > p:last-child,
.album li > :last-child {
  margin-bottom: 0;
}

/* sans asides: the virtual-material line, Walk through, next lesson */
.album-aside {
  margin: var(--space-3) 0 0;
  font: 400 var(--fs-ui) / 1.5 var(--font-ui);
  color: var(--ink-soft);
}

.album-aside a {
  color: var(--ink);
}

.album-aside .btn {
  margin-top: var(--space-1);
  text-align: left;
}

/* lesson-to-lesson and "Printable:" links are 44px tap targets without
   taller lines: 24px of 16px sans (or 28.8px of 18px serif) plus 20px of
   padding, taken back by the negative margin */
.album-links a,
.album-printable a {
  display: inline-block;
  padding-block: 0.625rem;
  margin-block: -0.625rem;
}

.album-links li {
  margin-bottom: var(--space-3);
}

/* ---------- Aims ---------- */

.album-aims {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.album-aims h3 {
  margin: 0 0 var(--space-1);
  font: italic 500 1.2rem / 1.3 var(--font-text);
  letter-spacing: 0;
}

/* ---------- Presentation: hung rubric numerals, spoken lines ---------- */

.album ol.presentation {
  padding: 0;
  list-style: none;
}

.album ol.presentation > li {
  position: relative;
  margin-bottom: var(--space-5);
}

.album .step-num {
  position: absolute;
  right: calc(100% + 0.9rem);
  top: -0.2rem;
  font: italic 400 1.75rem / 1 var(--font-text);
  color: var(--accent);
}

/* spoken words: italic, rubric quote marks, indented on a 2px rule, and a
   faint band on screen so an untrained parent finds them at a glance */
.album .say {
  display: block;
  margin-top: var(--space-2);
  padding: 0.35rem 0.8rem 0.4rem 0.9rem;
  border-left: 2px solid var(--line-strong);
  font-size: 1.0625em;
  font-style: italic;
  color: var(--ink);
}

@media screen {
  .album .say {
    background: var(--paper-warm);
  }
}

.album .say::before {
  content: '“';
}

.album .say::after {
  content: '”';
}

.album .say::before,
.album .say::after {
  font-style: normal;
  font-weight: 600;
  color: var(--accent);
}

/* ---------- Vocabulary: an italic run-in list ---------- */

.album .vocab {
  padding: 0;
  list-style: none;
}

.album .vocab li {
  display: inline;
  margin: 0;
  font-style: italic;
}

.album .vocab li + li::before {
  content: '\2002\00B7\2002';
  font-style: normal;
  color: var(--ink-soft);
}

/* ---------- Follow-up work: the printable on its own line ---------- */

.album-printable {
  display: block;
  margin-top: var(--space-1);
  font: 600 var(--fs-ui) / 1.5 var(--font-ui);
  color: var(--ink-soft);
}

.album-printable a {
  color: var(--ink);
}

/* ---------- End of the lesson: the bead fleuron ---------- */

.album-end {
  margin: var(--space-7) auto 0;
}

/* ---------- Phone ---------- */

@media screen and (max-width: 640px) {
  .album-runhead {
    flex-wrap: wrap;
  }

  .album-meta .badge + .badge::before {
    margin: 0 0.35em;
  }

  .album-header {
    text-align: left;
  }

  .album-header h1 {
    max-width: none;
    margin: var(--space-5) 0 0;
    font-size: 2.4rem;
  }

  .album-lede {
    font-size: 1.1875rem;
    text-align: left;
  }

  .album section {
    grid-template-columns: minmax(0, 1fr);
  }

  .album section > h2 {
    grid-column: 1;
    margin: 0 0 var(--space-2);
  }

  .album section > * {
    grid-column: 1;
  }

  .album ol.presentation {
    padding-left: 2.1rem;
  }

  .album-aims {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}
```

The text column is 56rem − 11rem − 2.75rem = 42.25rem. At 18px that is about 70–75 characters, down from about 95–100 (S5-12). The vocabulary becomes an italic run-in list (S5-09). Every section has the same rhythm, with last-child margins zeroed (S5-10).

**Measured contrast:**

| Element | Colours | Ratio |
| --- | --- | --- |
| Margin heads | ink on paper | 14.04:1 |
| Step numerals | rubric on paper | 6.16:1 |
| Spoken-line text | ink on the paper-warm band | 12.62:1 |
| Quote marks on the band | rubric on paper-warm | 5.54:1 |
| Asides | ink-soft on paper | 6.50:1 |
| Spoken-line rule | `--line-strong` on paper (decorative; italics, quotes and indent carry the meaning) | 3.40:1 |

**Check:**
- At 1400 on `/lessons/golden-beads-addition`, `Math.round(document.querySelector('#album-materials').getBoundingClientRect().top)` is about 444.
- The MATERIALS head's left edge is 220px left of the list's (11rem + 2.75rem).
- Each numeral's right edge is at least 14px left of its step text.
- Spoken lines show the faint band, the 2px rule and rubric quotes (compare `plan/19-the-album/screens/lesson-steps-after.webp`).
- At 390, the heads sit above their lists, the title is left-aligned, and `document.documentElement.scrollWidth === innerWidth`. Compare `phone-lesson-after.webp`.
- On `/lessons/golden-beads-addition` and `/lessons/stamp-game-addition` (both have "Before this lesson", "Next in this strand" and "Printable:" links), `[...document.querySelectorAll('.album-links a, .album-printable a')].every((a) => a.getBoundingClientRect().height >= 44)` is `true` (S1-22/S5-15, the in-lesson half). The line spacing around them is unchanged.
- Links inside a running sentence (the "No materials at home? Use the virtual …" aside, and the scope chart's cells in Step 37) stay inline text, under WCAG 2.5.8's exception for targets in a sentence.

## Step 34 — The lesson print design and page-break QA

**Files:** `src/styles/album.css` (modified: appended).

Lessons print in the album design (decision 27; owner decision 3). They still print from the same page with the same Print button. Nothing here touches `.print-sheet`, so worksheets, kits and the planner are unaffected.

Append:

```css
/* ---------- Print: the lesson prints as it reads ----------
   Margin heads narrow to a 10rem gutter (QA found a head/numeral collision
   at 9rem), the Oxford rule becomes a 3px double rule (browsers drop
   background images), and every rubric mark prints black in colour and in
   B&W alike. */

@media print {
  .album {
    max-width: none;
    font-size: 11pt;
    line-height: 1.5;
  }

  .album-header {
    padding-bottom: 0.9rem;
    background: none;
    border-bottom: 3px double #000;
  }

  .album-runhead {
    border-bottom: 0;
  }

  .album-header h1 {
    max-width: none;
    margin-top: 0.6rem;
    font-size: 26pt;
  }

  .album-lede {
    font-size: 12.5pt;
  }

  /* the margin column narrows to a 7.5rem head in a 10rem gutter */
  .album section {
    grid-template-columns: 7.5rem minmax(0, 1fr);
    column-gap: 2.5rem;
    margin-bottom: 1.1rem;
    padding-top: 0.6rem;
    break-inside: auto;
  }

  .album section > h2 {
    font-size: 8.5pt;
  }

  .album li {
    margin-bottom: 0.3rem;
    break-inside: avoid;
  }

  .album ol.presentation > li {
    margin-bottom: 0.6rem;
  }

  .album .step-num {
    font-size: 18pt;
    top: -0.1rem;
  }

  .album .step-num,
  .album .say::before,
  .album .say::after {
    color: #000;
  }

  .album .say {
    border-left-color: #000;
  }

  .album p {
    orphans: 3;
    widows: 3;
  }
}
```

`#000` is the print colour `print.css` already uses (`body { color: #000 }`, `.sheet-header`, the `.bw` overrides). The screen band behind spoken lines lives in `@media screen`, so it never prints. The bead fleuron and the `no-print` asides don't print either.

**Page-break QA.** Run this on the three longest lessons, `/lessons/checkerboard-multiplication`, `/lessons/decimal-board-operations` and `/lessons/racks-and-tubes`, then on `/lessons/golden-beads-addition`.

1. **Print preview.** Chrome, Print, destination "Save as PDF", paper Letter, margins Default, "Background graphics" **off**. Expected: 4, 4, 4 and 3 pages, the counts Chrome's own Letter PDF gave with the real Newsreader and MM Sans from Step 2 (headless Chromium on Linux). Today's `main` (`bbbdb44`) prints the same four lessons on 4, 4, 4 and 3 pages. **Pass** if each count is at most today's plus one and the snippet in item 2 reports no stranded head and no split step. Write the counts you get into this PRD beside the expected ones, in the Phase 5 commit; note any count above the expected one for the owner's printables review; a count above today's plus one fails the step and is fixed before the Phase 5 commit. On each page:
   - no margin head sits at the foot of a page without its first line beside it;
   - no step is split, so a numeral always stays with its step;
   - every spoken line stays with its step;
   - numerals and quote marks are black;
   - a 3px double rule sits under the title;
   - there is no tinted band.

   Compare with `plan/19-the-album/screens/lesson-print-after.webp`.
2. **Break stress test.** First set the DevTools device toolbar to **720px wide** (any height), because width media queries and `vw` units follow the window, not the 720px column the snippet builds; at 720 they evaluate as they do on Letter paper. Then, with DevTools, Rendering, "Emulate CSS media type: print", paste this into the console. It lays the lesson out in Letter-sized columns at seven page heights and reports every margin head (lesson or guide) that lands on a different page from its text, and every step that splits:

   ```js
   (() => {
     const main = document.querySelector('main.site-main')
     const PITCH = 768 // a 720px page plus a 48px gap
     const report = []
     let letterPages = 0
     for (const H of [960, 944, 928, 912, 896, 880, 1026]) {
       main.style.cssText = `width:720px;height:${H}px;column-width:720px;column-gap:48px;column-fill:auto;margin:0;padding:0`
       const x0 = main.getBoundingClientRect().left
       const page = (r) => Math.floor((r.left - x0 + 1) / PITCH) + 1
       const first = (el) => el.getClientRects()[0] ?? el.getBoundingClientRect()
       if (H === 960) letterPages = Math.ceil(main.scrollWidth / PITCH)
       for (const h of document.querySelectorAll('.album section > h2, .guide h2, .guide h3, .guide dt, .scope-strand-row')) {
         const sib = h.nextElementSibling
         const next = h.matches('.album section > h2') ? (sib?.querySelector('li, p, h3') ?? sib) : sib
         if (next && page(h.getBoundingClientRect()) !== page(first(next)))
           report.push(`${H}px: "${h.textContent.trim().slice(0, 40)}" on page ${page(h.getBoundingClientRect())}, its text on page ${page(first(next))}`)
       }
       for (const li of document.querySelectorAll('.album ol.presentation > li')) {
         const pages = new Set([...li.getClientRects()].map(page))
         if (pages.size > 1) report.push(`${H}px: step "${li.textContent.trim().slice(0, 40)}" splits across pages ${[...pages].join(', ')}`)
       }
     }
     main.style.cssText = ''
     return `${letterPages} Letter pages. ` + (report.length ? report.join('\n') : 'No stranded heads, no split steps.')
   })()
   ```

   Expected: `4 Letter pages. No stranded heads, no split steps.` on each of the three long lessons, and `3 Letter pages. …` on golden-beads-addition.
3. **B&W laser test (the owner's printer).** If no printer is at hand during the build, this moves to the owner's printables review (Step 43). Print the three long lessons with the printer's black-and-white option. Check four things:
   - the 8.5pt margin heads are crisp and readable;
   - the section hairlines (`--line`) are visible as light grey;
   - the boxed age prints as a box;
   - numerals and quote marks are solid black, not dithered grey.

**Check:** QA items 1 and 2 above pass (item 3 when a printer is at hand), and the standard check (convention 12) passes.

## Step 35 — Guide header and guide page

**Files:** `src/parents/GuideHeader.tsx` (new), `src/parents/GuidePage.tsx` (modified: full new content), and five guide files (modified): `src/parents/guides/faq.tsx`, `glossary.tsx`, `how-to-present.tsx`, `montessori-math-overview.tsx`, `using-this-site.tsx`. Scope & Sequence is Step 36.

Every guide opens with the shared page header: the title, a 21px ink lede, and Print at the top right. Today the Print row floats above the h1, jammed against it with a 0px gap (S8-09), and the lede is grey. The title and lede are guide content, so each guide passes them to a small `GuideHeader`, and `GuidePage` drops its inline-styled Print row. `PageHeader` names the tab: `Glossary · Montessori Math`.

Create `src/parents/GuideHeader.tsx`:

```tsx
import type { ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import { PrintButton } from '../components/PrintButton'

export interface GuideHeaderProps {
  /** The guide's h1 (also the browser-tab name). */
  title: string
  /** The lede: inline content only (it renders inside a <p>). */
  children: ReactNode
}

/**
 * How every parent guide opens (PRD 19): the shared PageHeader with the
 * title, a 21px ink lede, and Print at the top right.
 */
export function GuideHeader({ title, children }: GuideHeaderProps) {
  return (
    <PageHeader
      className="guide-header"
      title={title}
      lede={children}
      actions={<PrintButton label="Print this guide" />}
    />
  )
}
```

`src/parents/GuidePage.tsx` is currently:

```tsx
import { useParams } from 'react-router-dom'
import { guideBySlug } from './registry'
import { PrintButton } from '../components/PrintButton'
import NotFound from '../pages/NotFound'

export default function GuidePage() {
  const { slug } = useParams()
  const guide = slug ? guideBySlug(slug) : undefined
  if (!guide) return <NotFound />
  const Component = guide.component
  return (
    <div className="guide-page">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: '46rem' }}>
        <PrintButton label="Print this guide" />
      </div>
      <Component />
    </div>
  )
}
```

Replace it with:

```tsx
import { useParams } from 'react-router-dom'
import { guideBySlug } from './registry'
import NotFound from '../pages/NotFound'

export default function GuidePage() {
  const { slug } = useParams()
  const guide = slug ? guideBySlug(slug) : undefined
  if (!guide) return <NotFound />
  const Component = guide.component
  // Each guide renders its own <GuideHeader> (title, lede, Print).
  return (
    <div className="guide-page">
      <Component />
    </div>
  )
}
```

In each of the five guides:
- import `GuideHeader`;
- replace the `<h1>` and the `<p className="guide-lede">` (lines 13–18 in faq, how-to-present and using-this-site; 13–19 in glossary; 14–19 in montessori-math-overview) with `<GuideHeader title="…">` around the same lede text, unchanged;
- give the FAQ and the glossary their layout class;
- in how-to-present, mark the one illustrative scene (line 103) with `className="guide-scene"`.

The diffs:

```diff
--- a/src/parents/guides/faq.tsx
+++ b/src/parents/guides/faq.tsx
@@ -1,3 +1,4 @@
 import { Link } from 'react-router-dom'
+import { GuideHeader } from '../GuideHeader'
 import type { GuideMeta } from '../types'
 
@@ -10,11 +11,10 @@ export const meta: GuideMeta = {
 export default function Faq() {
   return (
-    <article className="guide">
-      <h1>Frequently Asked Questions</h1>
-      <p className="guide-lede">
+    <article className="guide guide-faq">
+      <GuideHeader title="Frequently Asked Questions">
         Real questions from real kitchen tables, answered plainly. If yours isn't here, the{' '}
         <Link to="/parents/montessori-math-overview">overview</Link> and{' '}
         <Link to="/parents/how-to-present">how to present</Link> guides cover the bigger picture.
-      </p>
+      </GuideHeader>
 
       <h2>Is my child ready to start?</h2>
```

```diff
--- a/src/parents/guides/glossary.tsx
+++ b/src/parents/guides/glossary.tsx
@@ -1,3 +1,4 @@
 import { Link } from 'react-router-dom'
+import { GuideHeader } from '../GuideHeader'
 import type { GuideMeta } from '../types'
 
@@ -10,12 +11,11 @@ export const meta: GuideMeta = {
 export default function Glossary() {
   return (
-    <article className="guide">
-      <h1>Glossary</h1>
-      <p className="guide-lede">
+    <article className="guide guide-glossary">
+      <GuideHeader title="Glossary">
         Montessori has its own vocabulary, and the lessons on this site use it without apology — because the words
         are precise, and because you'll meet them everywhere else Montessori is discussed. Here is every term we
         use, defined the way we actually use it. Skim it once now, then come back whenever a lesson says something
         like "this is the control of error" and you want the fuller story.
-      </p>
+      </GuideHeader>
 
       <dl>
```

```diff
--- a/src/parents/guides/how-to-present.tsx
+++ b/src/parents/guides/how-to-present.tsx
@@ -1,3 +1,4 @@
 import { Link } from 'react-router-dom'
+import { GuideHeader } from '../GuideHeader'
 import type { GuideMeta } from '../types'
 
@@ -11,10 +12,9 @@ export default function HowToPresent() {
   return (
     <article className="guide">
-      <h1>How to Present a Lesson</h1>
-      <p className="guide-lede">
+      <GuideHeader title="How to Present a Lesson">
         In Montessori, a &ldquo;lesson&rdquo; is not a lecture. It's a short, quiet demonstration — you show your
         child how to do something with the material, using your hands more than your voice, and then you step back
         and let them do it. That's the whole trick, and anyone can learn it at the kitchen table.
-      </p>
+      </GuideHeader>
 
       <h2>What a presentation is</h2>
@@ -101,5 +101,5 @@ export default function HowToPresent() {
         end the lesson happily and pick it up tomorrow. There is no prize for reaching period three today.
       </p>
-      <blockquote>
+      <blockquote className="guide-scene">
         You place the ten-bar on the mat and let your hands rest. A breath. &ldquo;This is a <em>ten</em>.&rdquo;
         Another breath. You slide it toward her. She picks it up, counts the beads with one finger, and looks up at
```

```diff
--- a/src/parents/guides/montessori-math-overview.tsx
+++ b/src/parents/guides/montessori-math-overview.tsx
@@ -1,3 +1,4 @@
 import { Link } from 'react-router-dom'
+import { GuideHeader } from '../GuideHeader'
 import type { GuideMeta } from '../types'
 
@@ -12,10 +13,9 @@ export default function MontessoriMathOverview() {
   return (
     <article className="guide">
-      <h1>Why Montessori Math Works</h1>
-      <p className="guide-lede">
+      <GuideHeader title="Why Montessori Math Works">
         Montessori math rests on one big idea: a child should hold a quantity in her hands before she is ever asked to
         push its symbol around on paper. Everything else — the beads, the cards, the boards, the careful order of
         lessons — exists to walk that road from concrete to abstract, one honest step at a time.
-      </p>
+      </GuideHeader>
 
       <h2>Your child already has a mathematical mind</h2>
```

```diff
--- a/src/parents/guides/using-this-site.tsx
+++ b/src/parents/guides/using-this-site.tsx
@@ -1,3 +1,4 @@
 import { Link } from 'react-router-dom'
+import { GuideHeader } from '../GuideHeader'
 import type { GuideMeta } from '../types'
 
@@ -11,10 +12,9 @@ export default function UsingThisSite() {
   return (
     <article className="guide">
-      <h1>Using This Site</h1>
-      <p className="guide-lede">
+      <GuideHeader title="Using This Site">
         Everything here comes in three flavors: lessons you read, materials your child uses, and worksheets you
         print. This page explains how they fit together, when to reach for the screen versus the real thing, and how
         to get good prints without burning through an ink cartridge.
-      </p>
+      </GuideHeader>
 
       <h2>The three kinds of pages</h2>
```

The overview's "One honest note…" blockquote (line 136) stays a plain `blockquote`: a note, set roman in Step 37 (S8-22).

**Check:** (on the five guides this step converts; Scope & Sequence has no Print button until Step 36 and keeps its old header until then)
- `npm run build` is green.
- On `/parents/faq`, `/parents/glossary`, `/parents/how-to-present`, `/parents/montessori-math-overview` and `/parents/using-this-site`, "Print this guide" (rubric, print glyph) sits at the top right beside the title, not above it.
- On each of them, `document.title` is `<Guide title> · Montessori Math` and `document.querySelectorAll('.guide-page [style]').length` is `0`.
- `grep -rn 'guide-lede' src/parents/GuidePage.tsx src/parents/guides/faq.tsx src/parents/guides/glossary.tsx src/parents/guides/how-to-present.tsx src/parents/guides/montessori-math-overview.tsx src/parents/guides/using-this-site.tsx` prints nothing. (Step 37 checks the whole tree, once `scope-and-sequence.tsx` and `guides.css` are rewritten.)

## Step 36 — The Scope & Sequence chart

**Files:** `src/parents/guides/scope-and-sequence.tsx` (modified: full new content).

This replaces `shim.js` lines 279–299, which regex-parsed strand banners into chapter heads and stamped column classes on cells. In the real markup:
- Strand rows are Step 15's `ChapterHead` (`as="span"`, `className="scope-chapter"`) inside a `th scope="rowgroup"`, and each `tbody` carries `data-strand={strand.order}`.
- Every cell has a column class. The inline `width` styles on the `#`, Ages and Grades headers move into CSS.
- Empty material or printable cells show `NoneMark`: an em dash with a visually hidden "none" (Step 9's `.visually-hidden`, S8-05). `stamp-game-intro` and `checkerboard-intro` have no worksheet.
- Each non-lesson cell starts with a `span.scope-label` ("Ages ", "Grades ", "Materials: ", "Printable: "). CSS shows it only when the chart stacks on a phone.

The current header and strand row (lines 18–50):

```tsx
export default function ScopeAndSequence() {
  return (
    <article className="guide">
      <h1>Scope &amp; Sequence</h1>
      <p className="guide-lede">
        The full arc of Montessori mathematics from about age 4 to age 12, strand by strand. Within each strand,
        lessons are listed in the order they're given. Ages are readiness ranges, not deadlines — children revisit
        strands in parallel, and it's normal to be in three strands at once.
      </p>
      <p className="no-print">
        Print this chart and keep it somewhere handy; it's the map for everything else on the site.
      </p>

      <div className="scope-table-wrap">
        <table className="scope-table">
          <thead>
            <tr>
              <th style={{ width: '3.2rem' }}>#</th>
              <th>Lesson</th>
              <th style={{ width: '5.5rem' }}>Ages</th>
              <th style={{ width: '5.5rem' }}>Grades</th>
              <th>Materials</th>
              <th>Printable follow-up</th>
            </tr>
          </thead>
          {STRANDS.map((strand) => {
            const lessons = LESSONS.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)
            return (
              <tbody key={strand.id}>
                <tr className="scope-strand-row">
                  <th colSpan={6}>
                    {strand.order}. {strand.name} · ages {strand.ages[0]}–{strand.ages[1]} ({strand.grades})
                  </th>
```

Replace the whole file with:

```tsx
import { Link } from 'react-router-dom'
import { STRANDS } from '../../lib/strands'
import { MATERIALS } from '../../materials/registry'
import { LESSONS } from '../../lessons/registry'
import { GENERATORS } from '../../worksheets/registry'
import { ChapterHead } from '../../components/Contents'
import { GuideHeader } from '../GuideHeader'
import type { GuideMeta } from '../types'

export const meta: GuideMeta = {
  slug: 'scope-and-sequence',
  title: 'Scope & Sequence',
  summary: 'The whole PK–6 path on one printable chart: strands, lessons in order, materials, and worksheets.',
}

/** An empty cell says so, instead of looking like missing data. */
function NoneMark() {
  return (
    <span className="scope-none">
      <span aria-hidden="true">—</span>
      <span className="visually-hidden">none</span>
    </span>
  )
}

/**
 * Generated live from the site's own registries, so it can never drift out
 * of date: every lesson, material, and worksheet listed here is a real page.
 */
export default function ScopeAndSequence() {
  return (
    <article className="guide guide-scope">
      <GuideHeader title="Scope & Sequence">
        The full arc of Montessori mathematics from about age 4 to age 12, strand by strand. Within each strand,
        lessons are listed in the order they're given. Ages are readiness ranges, not deadlines — children revisit
        strands in parallel, and it's normal to be in three strands at once.
      </GuideHeader>
      <p className="guide-note no-print">
        Print this chart and keep it somewhere handy; it's the map for everything else on the site.
      </p>

      <div className="scope-table-wrap">
        <table className="scope-table">
          <thead>
            <tr>
              <th scope="col" className="scope-num">
                #
              </th>
              <th scope="col" className="scope-lesson">
                Lesson
              </th>
              <th scope="col" className="scope-ages">
                Ages
              </th>
              <th scope="col" className="scope-grades">
                Grades
              </th>
              <th scope="col" className="scope-mats">
                Materials
              </th>
              <th scope="col" className="scope-print">
                Printable follow-up
              </th>
            </tr>
          </thead>
          {STRANDS.map((strand) => {
            const lessons = LESSONS.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)
            return (
              <tbody key={strand.id} data-strand={strand.order}>
                <tr className="scope-strand-row">
                  <th colSpan={6} scope="rowgroup">
                    <ChapterHead strand={strand} as="span" className="scope-chapter" />
                  </th>
                </tr>
                {lessons.length === 0 && (
                  <tr className="scope-row">
                    <td colSpan={6}>Lessons coming soon.</td>
                  </tr>
                )}
                {lessons.map((l) => {
                  const mats = l.virtualMaterials
                    .map((slug) => MATERIALS.find((m) => m.slug === slug))
                    .filter((m) => m !== undefined)
                  const sheets = [...new Set(l.followUpWork.map((f) => f.worksheetSlug).filter(Boolean))]
                    .map((slug) => GENERATORS.find((g) => g.slug === slug))
                    .filter((g) => g !== undefined)
                  return (
                    <tr key={l.slug} className="scope-row">
                      <td className="scope-num">{l.sequence}</td>
                      <td className="scope-lesson">
                        <Link to={`/lessons/${l.slug}`}>{l.name}</Link>
                      </td>
                      <td className="scope-ages">
                        <span className="scope-label">Ages </span>
                        {l.ages[0]}–{l.ages[1]}
                      </td>
                      <td className="scope-grades">
                        <span className="scope-label">Grades </span>
                        {l.grades}
                      </td>
                      <td className="scope-mats">
                        <span className="scope-label">Materials: </span>
                        {mats.length === 0 && <NoneMark />}
                        {mats.map((m, i) => (
                          <span key={m.slug}>
                            {i > 0 && ', '}
                            <Link to={`/materials/${m.slug}`}>{m.name}</Link>
                          </span>
                        ))}
                      </td>
                      <td className="scope-print">
                        <span className="scope-label">Printable: </span>
                        {sheets.length === 0 && <NoneMark />}
                        {sheets.map((g, i) => (
                          <span key={g.slug}>
                            {i > 0 && ', '}
                            <Link to={`/worksheets/${g.slug}`}>{g.name}</Link>
                          </span>
                        ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )
          })}
        </table>
      </div>
    </article>
  )
}
```

**Check:**
- `document.querySelectorAll('.scope-table tbody[data-strand]').length` is `7`.
- Strand 3's head shows a rubric italic "3", three pink beads, "The Decimal System" and `AGES 4–7 · PK–2` at the right.
- The Printable cell of "Introduction to the Stamp Game" shows "—", and VoiceOver reads "none".
- "Print this guide" sits at the top right beside the title, `document.title` is `Scope & Sequence · Montessori Math`, and `document.querySelectorAll('.guide-page [style]').length` is `0` (the three inline `width` styles on the `th` cells are gone).
- Before Step 37 the page is unstyled; that's expected.

## Step 37 — The guides stylesheet (screen)

**Files:** `src/styles/guides.css` (modified: full new content; Step 38 appends the print block).

This is the prototype's §16 with its shortcuts replaced, plus the glossary and FAQ layouts (decision 28):
- **Guide page.** A centred 56rem grid: the header spans both columns; h2s hang in an 11rem margin column on an ink rule, beside a hairline over the first block of text; h3s are italic serif.
- **Blockquotes.** A roman note on a 2px ink rule, or an italic scene.
- **Scope chart.** It spans the full column, with small-capital column heads over an ink rule and hairline rows only. Numbers are rubric italic, lesson names serif, and other links sans with faint underlines.
- **Phones.** Guides stack at ≤760px, on screen only: the block is `@media screen and (max-width: 760px)`, because Chrome evaluates print at the 720px Letter width and an unscoped query would stack the guides on paper too, losing the margin heads that Step 38 prints (decision 28). The chart stacks into entries at ≤640px.

The current file's card-era rules that go away include lines 3–24 (the 46rem measure and grey lede) and lines 71–75 (the white-on-wood strand banner, 3.1:1):

```css
.guide {
  max-width: 46rem;
}

.guide h1 {
  margin-bottom: 0.35rem;
}

.guide .guide-lede {
  font-size: 1.08rem;
  color: var(--ink-soft);
  margin-bottom: 1.5rem;
}

.guide h2 {
  margin-top: 2rem;
  border-bottom: 1px solid var(--line);
  padding-bottom: 0.25rem;
}

.guide h3 {
  margin-top: 1.3rem;
```

```css
.scope-strand-row th {
  background: var(--wood);
  color: #fff;
  font-family: var(--font-heading);
}
```

Replace the whole file with:

```css
/* ---------- Parent guides (PRD 19) ----------
   A centred 56rem page: the PageHeader (title, ink lede, Print) spans it;
   section heads hang in an 11rem margin column on an ink rule, paired with
   a hairline over the text column. Scope & Sequence unfolds to the full
   column as a hairline chart. */

.guide {
  display: grid;
  grid-template-columns: var(--margin-col) minmax(0, 1fr);
  column-gap: var(--gutter);
  align-items: start;
  max-width: 56rem;
  margin: 0 auto;
}

.guide > * {
  grid-column: 2;
}

.guide > .guide-header {
  grid-column: 1 / -1;
}

.guide-header .page-lede {
  max-width: 44rem;
}

.guide > h2 {
  grid-column: 1;
  margin: var(--space-6) 0 0;
  padding: var(--space-3) 0 0;
  border: 0;
  border-top: 1px solid var(--ink);
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.2;
}

/* the block beside a margin head starts on a hairline, level with the head */
.guide > h2 + * {
  margin-top: var(--space-6);
  padding-top: var(--space-3);
  border-top: 1px solid var(--line);
}

.guide h3 {
  margin-top: var(--space-5);
  font-size: 1.25rem;
  font-style: italic;
}

.guide dl dt {
  margin-top: 0.9rem;
  font-weight: 600;
}

.guide dl dd {
  margin: 0.15rem 0 0;
  padding-left: 1rem;
  border-left: 1px solid var(--line-strong);
}

/* a note: roman, on a 2px ink rule */
.guide blockquote {
  margin: var(--space-4) 0;
  padding: 0.2rem 0 0.2rem 1.25rem;
  border-left: 2px solid var(--ink);
  font-size: var(--fs-body);
  font-style: normal;
}

/* a scene (what the lesson looks like): italic, like a spoken line */
.guide blockquote.guide-scene {
  font-size: 1.2rem;
  font-style: italic;
}

.guide-note {
  margin: 0;
  font: 400 var(--fs-ui) / 1.5 var(--font-ui);
  color: var(--ink-soft);
}

/* ---------- Glossary: terms hang in the margin, like an index ---------- */

.guide-glossary > dl {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: var(--margin-col) minmax(0, 1fr);
  grid-template-columns: subgrid;
  margin: var(--space-5) 0 var(--space-5);
}

.guide-glossary > dl > dt {
  grid-column: 1;
  margin: 0;
  padding: var(--space-3) 0;
  border-top: 1px solid var(--ink);
  font-family: var(--font-text);
  font-size: var(--fs-read-sm);
  font-weight: 500;
  line-height: 1.3;
}

.guide-glossary > dl > dd {
  grid-column: 2;
  margin: 0;
  padding: var(--space-3) 0 var(--space-4);
  border: 0;
  border-top: 1px solid var(--line);
}

/* ---------- FAQ: questions are too long for the margin, so they lead
   the text column as question heads. The FAQ is a plain block (not the
   grid) indented to the text column, so a question keeps with its answer
   on paper (break-after works between blocks, not between grid rows). */

.guide.guide-faq {
  display: block;
  padding-left: calc(var(--margin-col) + var(--gutter));
}

.guide-faq > .guide-header {
  margin-left: calc(-1 * (var(--margin-col) + var(--gutter)));
}

.guide-faq > h2 {
  margin-bottom: var(--space-2);
  font-size: var(--fs-lede);
}

.guide-faq > h2 + * {
  margin-top: 0;
  padding-top: 0;
  border-top: 0;
}

/* ---------- Scope & Sequence: a fold-out chart across the full column ---------- */

.guide.guide-scope {
  display: block;
  max-width: none;
}

.scope-table-wrap {
  margin-top: var(--space-4);
}

.scope-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-ui);
  font-size: var(--fs-ui);
  line-height: 1.45;
}

.scope-table th,
.scope-table td {
  padding: 0.65rem 1rem 0.65rem 0;
  border: 0;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: baseline;
}

.scope-table thead th {
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--ink);
  font: 700 var(--fs-caps) / 1.3 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
  background: none;
}

.scope-table th.scope-num {
  width: 3rem;
}

.scope-table th.scope-ages,
.scope-table th.scope-grades {
  width: 5.5rem;
}

/* strand rows: dark-on-light chapter heads (ChapterHead as="span") */
.scope-strand-row th {
  padding: var(--space-6) 0 0;
  border-bottom: 0;
  color: var(--ink);
  background: none;
}

.scope-chapter {
  font-size: 1.5rem;
}

.scope-table td.scope-num {
  font: italic 400 1.2rem / 1.2 var(--font-text);
  color: var(--accent);
}

.scope-table td.scope-lesson a {
  font-family: var(--font-text);
  font-size: var(--fs-read-sm);
  font-weight: 500;
}

.scope-table td:not(.scope-lesson) a {
  text-decoration-color: var(--line-strong);
}

.scope-table a:hover {
  text-decoration-color: currentColor;
}

/* shown only when the chart stacks on a phone */
.scope-label {
  display: none;
}

.scope-none {
  color: var(--ink-soft);
}

/* ---------- Tablet and phone, on screen only ----------
   Chrome prints at the 720px Letter width, so an unscoped (max-width: 760px)
   would also stack the guides on paper and drop the margin heads. */

@media screen and (max-width: 760px) {
  .guide {
    display: block;
  }

  .guide.guide-faq {
    padding-left: 0;
  }

  .guide-faq > .guide-header {
    margin-left: 0;
  }

  .guide > h2 {
    margin-bottom: var(--space-3);
  }

  .guide > h2 + * {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }

  .guide-glossary > dl {
    display: block;
  }

  .guide-glossary > dl > dd {
    padding-top: 0;
    border-top: 0;
  }
}

@media screen and (max-width: 640px) {
  /* the chart stacks into entries: numeral | lesson, ages · grades,
     materials, printable */
  .scope-table thead {
    display: none;
  }

  .scope-table,
  .scope-table tbody,
  .scope-table tr,
  .scope-table th,
  .scope-table td {
    display: block;
  }

  .scope-table .scope-row {
    display: grid;
    grid-template-columns: 2rem auto minmax(0, 1fr);
    column-gap: 0.5rem;
    padding: 0.7rem 0;
    border-bottom: 1px solid var(--line);
  }

  .scope-table td {
    padding: 0;
    border: 0;
  }

  .scope-table td.scope-num {
    grid-column: 1;
    grid-row: 1 / span 4;
  }

  .scope-table td.scope-lesson,
  .scope-table td.scope-mats,
  .scope-table td.scope-print,
  .scope-table td[colspan] {
    grid-column: 2 / -1;
  }

  .scope-table td.scope-ages {
    grid-column: 2;
  }

  .scope-table td.scope-grades {
    grid-column: 3;
  }

  .scope-label {
    display: inline;
    font: 600 var(--fs-caps) / 1.3 var(--font-ui);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .scope-table td.scope-ages,
  .scope-table td.scope-grades,
  .scope-table td.scope-mats,
  .scope-table td.scope-print {
    font-size: var(--fs-ui);
  }
}
```

`.scope-table` sets `font-family: var(--font-ui)` itself. Convention 5 drops the prototype's blanket `table` rule, and without this line the chart's cells would fall back to the serif.

**Measured contrast:**

| Element | Colours | Ratio |
| --- | --- | --- |
| Guide h2 and strand rows | ink on paper (was white on wood, 3.1:1) | 14.04:1 |
| Scope numbers | rubric on paper | 6.16:1 |
| Column heads and phone labels | ink-soft on paper | 6.50:1 |
| Faint link underline | `--line-strong`, a non-colour cue under ink text (14.04:1) | 3.40:1 |

**Check:**
- `grep -rn 'guide-lede' src` prints nothing: the last users were `scope-and-sequence.tsx` (Step 36) and the old `guides.css`.
- **Guides at 1400:**
  - `/parents/how-to-present` is a centred page: section heads in the left margin on ink rules, each beside a hairline over its text. The "You place the ten-bar…" scene is italic and the overview's note is roman.
  - `/parents/glossary`: each term hangs in the margin column beside its definition.
  - `/parents/faq`: questions head the text column at 21px.
- **Scope at 1400:** `/parents/scope-and-sequence` spans the full 1068px column (S8-01). Strand rows are dark on light with a rubric number and the strand's bead bar (S8-03). Compare `plan/19-the-album/screens/scope-after.webp`.
- **At 820:** the guides are single-column with each head above its text, and there is no stray hairline under a head.
- **At 390:**
  - The scope chart is a list of entries: numeral | lesson, `AGES 4–6  GRADES PK–K`, `MATERIALS: …`, `PRINTABLE: …`.
  - `document.documentElement.scrollWidth === innerWidth` (S8-02).
  - The glossary shows each term above its definition in a single column.

## Step 38 — Guide and scope-chart print

**Files:** `src/styles/guides.css` (modified: appended).

Guides print as they read: the same face, margin heads narrowed to an 8rem column with a 1.5rem gap, 11pt/1.5 text, and heads kept with their text. The scope chart prints at 9pt with narrow Ages and Grades columns. Strand rows get a 2px black top rule, numbers print black, and no row splits. `contents.css` (Step 15) already hides the bead bars in print.

Append:

```css
/* ---------- Print: guides print as they read ---------- */

@media print {
  .guide {
    max-width: none;
    grid-template-columns: 8rem minmax(0, 1fr);
    column-gap: 1.5rem;
    font-size: 11pt;
    line-height: 1.5;
  }

  .guide > h2 {
    margin-top: 1.4rem;
    font-size: 13pt;
    break-after: avoid;
  }

  .guide > h2 + * {
    margin-top: 1.4rem;
  }

  .guide.guide-faq {
    padding-left: 9.5rem;
  }

  .guide-faq > .guide-header {
    margin-left: -9.5rem;
  }

  .guide-faq > h2 + * {
    margin-top: 0;
  }

  .guide h3,
  .guide dt {
    break-after: avoid;
  }

  .guide p,
  .guide li,
  .guide dd {
    orphans: 3;
    widows: 3;
  }

  .guide blockquote {
    border-left-color: #000;
  }

  .scope-table {
    font-size: 9pt;
  }

  .scope-table th,
  .scope-table td {
    padding: 0.25rem 0.6rem 0.25rem 0;
  }

  .scope-table th.scope-num {
    width: 2rem;
  }

  .scope-table th.scope-ages,
  .scope-table th.scope-grades {
    width: 3.5rem;
  }

  .scope-table td.scope-num {
    font-size: 10pt;
    color: #000;
  }

  .scope-table td.scope-lesson a {
    font-size: 9.5pt;
  }

  .scope-strand-row,
  .scope-row {
    break-inside: avoid;
  }

  .scope-strand-row {
    break-after: avoid;
  }

  .scope-strand-row th {
    padding-top: 0.8rem;
    border-top: 2px solid #000;
  }

  .scope-chapter {
    font-size: 13pt;
  }
}
```

**Check:**
- In print preview (Letter, default margins, background graphics off), every guide except the FAQ prints with its h2s in the 8rem margin column beside a hairline, and the glossary's terms hang in that column. (That is the Step 37 block being screen-only: before that fix, paper got the stacked phone layout.)
- Page counts. Expected: FAQ 3, using-this-site 3, glossary 4, how-to-present 3, montessori-math-overview 3, scope-and-sequence 3. These are what Chrome's own Letter PDF gave with the real Newsreader and MM Sans (headless Chromium on Linux). Today's `main` prints them on 4, 3, 4, 3, 3 and 3. **Pass** if each count is at most today's plus one and the snippet below is clean. Write the counts you get into this PRD beside the expected ones, in the Phase 5 commit; note any count above the expected one for the owner's printables review; a count above today's plus one fails the step and is fixed before the Phase 5 commit.
- With the DevTools device toolbar at 720px wide (Step 34, item 2), the console snippet from Step 34 prints "No stranded heads, no split steps." on each guide (S9-25/S8-12).
- On the scope chart, the column heads repeat on every page, no lesson row splits across a page, and strand heads never end a page.
- The standard check (convention 12) passes.
