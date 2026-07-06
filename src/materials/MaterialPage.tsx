import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { materialBySlug } from './registry'
import { lessonBySlug } from '../lessons/registry'
import { generatorBySlug } from '../worksheets/registry'
import { strandInfo } from '../lib/strands'
import NotFound from '../pages/NotFound'

export default function MaterialPage() {
  const { slug } = useParams()
  const material = slug ? materialBySlug(slug) : undefined
  if (!material) return <NotFound />

  const Component = material.component
  const lessons = material.lessonSlugs.map((s) => lessonBySlug(s)).filter((l) => l !== undefined)
  const generators = material.worksheetSlugs.map((s) => generatorBySlug(s)).filter((g) => g !== undefined)

  return (
    <>
      <h1>{material.name}</h1>
      <p>
        <span className="badge age">ages {material.ages[0]}–{material.ages[1]}</span>
        <span className="badge">{material.grades}</span>
        <span className="badge">{strandInfo(material.strand).name}</span>
      </p>
      <p className="page-intro">{material.summary}</p>

      <Suspense fallback={<p>Loading material…</p>}>
        <Component />
      </Suspense>

      <section className="card" style={{ marginTop: '1.5rem', maxWidth: '46rem' }}>
        <h2>For parents</h2>
        <p style={{ marginBottom: 0 }}>{material.parentNote}</p>
      </section>

      {(lessons.length > 0 || generators.length > 0) && (
        <section style={{ marginTop: '1.5rem' }}>
          {lessons.length > 0 && (
            <>
              <p className="section-label">Lessons for this material</p>
              <ul>
                {lessons.map((l) => (
                  <li key={l.slug}>
                    <Link to={`/lessons/${l.slug}`}>{l.name}</Link>{' '}
                    <span className="badge age">ages {l.ages[0]}–{l.ages[1]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {generators.length > 0 && (
            <>
              <p className="section-label">Printable follow-up work</p>
              <ul>
                {generators.map((g) => (
                  <li key={g.slug}>
                    <Link to={`/worksheets/${g.slug}`}>{g.name}</Link> — {g.description}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </>
  )
}
