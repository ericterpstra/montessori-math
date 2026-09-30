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
            <span className="badge album-strand">
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

      <section>
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
        <section>
          <h2 id="album-before">Before this lesson</h2>
          <ul className="album-links">
            {lesson.prerequisites.map((slug) => {
              const p = lessonBySlug(slug)
              return <li key={slug}>{p ? <Link to={`/lessons/${p.slug}`}>{p.name}</Link> : slug}</li>
            })}
          </ul>
        </section>
      )}

      <section>
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

      <section>
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

      <section>
        <h2 id="album-interest">Points of interest</h2>
        <ul>
          {lesson.pointsOfInterest.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 id="album-control">Control of error</h2>
        <ul>
          {lesson.controlOfError.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      {lesson.vocabulary.length > 0 && (
        <section>
          <h2 id="album-vocabulary">Vocabulary</h2>
          <ul className="vocab" role="list">
            {lesson.vocabulary.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.variations.length > 0 && (
        <section>
          <h2 id="album-variations">Variations</h2>
          <ul>
            {lesson.variations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.extensions.length > 0 && (
        <section>
          <h2 id="album-extensions">Extensions</h2>
          <ul>
            {lesson.extensions.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.followUpWork.length > 0 && (
        <section>
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

      <section>
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
