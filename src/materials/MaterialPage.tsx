import { Suspense, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { materialBySlug } from './registry'
import { lessonBySlug } from '../lessons/registry'
import { generatorBySlug } from '../worksheets/registry'
import { kitsForMaterial } from '../kits/registry'
import { strandInfo } from '../lib/strands'
import { DemoContext } from '../lessons/DemoContext'
import { PresentationOverlay } from '../lessons/PresentationOverlay'
import NotFound from '../pages/NotFound'

export default function MaterialPage() {
  const { slug } = useParams()
  const material = slug ? materialBySlug(slug) : undefined

  // Presentation mode (?present=<lessonSlug>). Hooks stay above the early
  // return; the current step lives only in this useState — nothing persists.
  const [searchParams, setSearchParams] = useSearchParams()
  const [stepIndex, setStepIndex] = useState(0)

  const presentSlug = searchParams.get('present')
  const script = presentSlug ? material?.demos?.[presentSlug] : undefined
  const demoLesson = presentSlug ? lessonBySlug(presentSlug) : undefined
  const demoActive = script !== undefined && demoLesson !== undefined

  const demoValue = useMemo(
    () => (demoActive && presentSlug && script ? { lessonSlug: presentSlug, stepIndex, script } : null),
    [demoActive, presentSlug, script, stepIndex],
  )

  if (!material) return <NotFound />

  const Component = material.component
  const lessons = material.lessonSlugs.map((s) => lessonBySlug(s)).filter((l) => l !== undefined)
  const generators = material.worksheetSlugs.map((s) => generatorBySlug(s)).filter((g) => g !== undefined)
  const kits = kitsForMaterial(material.slug)

  const demoLessons = Object.keys(material.demos ?? {})
    .map((s) => lessonBySlug(s))
    .filter((l) => l !== undefined)

  function openDemo(lessonSlug: string) {
    setStepIndex(0)
    setSearchParams({ present: lessonSlug })
  }

  function closeDemo() {
    setStepIndex(0)
    setSearchParams({})
  }

  return (
    <>
      <h1>{material.name}</h1>
      <p>
        <span className="badge age">ages {material.ages[0]}–{material.ages[1]}</span>
        <span className="badge">{material.grades}</span>
        <span className="badge">{strandInfo(material.strand).name}</span>
      </p>
      <p className="page-intro">{material.summary}</p>

      {demoLessons.length > 0 && (
        <div className="presentation-launch no-print">
          {demoLessons.map((l) => (
            <button
              key={l.slug}
              type="button"
              className="btn"
              onClick={() => openDemo(l.slug)}
              aria-pressed={presentSlug === l.slug}
            >
              Walk through: {l.name}
            </button>
          ))}
        </div>
      )}

      <DemoContext.Provider value={demoValue}>
        <Suspense fallback={<p>Loading material…</p>}>
          <Component />
        </Suspense>
      </DemoContext.Provider>

      <section className="card" style={{ marginTop: '1.5rem', maxWidth: '46rem' }}>
        <h2>For parents</h2>
        <p style={{ marginBottom: 0 }}>{material.parentNote}</p>
      </section>

      {kits.length > 0 && (
        <section className="card" style={{ marginTop: '1.5rem', maxWidth: '46rem' }}>
          <h2>Make the real thing</h2>
          {kits.map((k) => (
            <p key={k.slug} style={{ marginBottom: 0 }}>
              <Link to={`/kits/${k.slug}`}>{k.name}</Link> — {k.description} ({k.pieces})
            </p>
          ))}
        </section>
      )}

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

      {demoActive && demoLesson && (
        <>
          <div className="presentation-spacer no-print" aria-hidden="true" />
          <PresentationOverlay
            lesson={demoLesson}
            stepIndex={stepIndex}
            onPrev={() => setStepIndex((i) => Math.max(0, i - 1))}
            onNext={() => setStepIndex((i) => Math.min(demoLesson.presentation.length - 1, i + 1))}
            onClose={closeDemo}
          />
        </>
      )}
    </>
  )
}
