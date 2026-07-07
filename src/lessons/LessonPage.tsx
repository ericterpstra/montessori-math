import { Link, useParams } from 'react-router-dom'
import { LESSONS, lessonBySlug } from './registry'
import { materialBySlug } from '../materials/registry'
import type { MaterialDef } from '../materials/types'
import { generatorBySlug } from '../worksheets/registry'
import { strandInfo } from '../lib/strands'
import { PrintButton } from '../components/PrintButton'
import NotFound from '../pages/NotFound'

export default function LessonPage() {
  const { slug } = useParams()
  const lesson = slug ? lessonBySlug(slug) : undefined
  if (!lesson) return <NotFound />

  const strand = strandInfo(lesson.strand)
  const next = LESSONS.filter((l) => l.strand === lesson.strand && l.sequence === lesson.sequence + 1)

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

      <section>
        <h2>Materials</h2>
        <ul>
          {lesson.materialsNeeded.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
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
      </section>

      {lesson.prerequisites.length > 0 && (
        <section>
          <h2>Before this lesson</h2>
          <ul>
            {lesson.prerequisites.map((slug) => {
              const p = lessonBySlug(slug)
              return (
                <li key={slug}>
                  {p ? <Link to={`/lessons/${p.slug}`}>{p.name}</Link> : slug}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <h2>Aims</h2>
        <div className="album-aims">
          <div>
            <strong>Direct</strong>
            <ul>
              {lesson.directAims.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Indirect</strong>
            <ul>
              {lesson.indirectAims.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

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

      <section>
        <h2>Points of interest</h2>
        <ul>
          {lesson.pointsOfInterest.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Control of error</h2>
        <ul>
          {lesson.controlOfError.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      {lesson.vocabulary.length > 0 && (
        <section>
          <h2>Vocabulary</h2>
          <ul className="vocab">
            {lesson.vocabulary.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.variations.length > 0 && (
        <section>
          <h2>Variations</h2>
          <ul>
            {lesson.variations.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.extensions.length > 0 && (
        <section>
          <h2>Extensions</h2>
          <ul>
            {lesson.extensions.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </section>
      )}

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
    </article>
  )
}
