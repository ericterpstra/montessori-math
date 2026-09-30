import { Suspense, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { materialBySlug } from './registry'
import { lessonBySlug } from '../lessons/registry'
import { generatorBySlug } from '../worksheets/registry'
import { kitsForMaterial } from '../kits/registry'
import { strandInfo } from '../lib/strands'
import { DemoContext } from '../lessons/DemoContext'
import { PresentationOverlay } from '../lessons/PresentationOverlay'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta } from '../components/Contents'
import { Icon } from '../components/Icon'
import { MaterialNameContext } from '../components/MaterialNameContext'
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
  const strand = strandInfo(material.strand)
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

  const walkThroughs =
    demoLessons.length > 0
      ? demoLessons.map((l) => (
          <button
            key={l.slug}
            type="button"
            className="btn has-icon"
            onClick={() => openDemo(l.slug)}
            aria-pressed={presentSlug === l.slug}
          >
            <Icon name="play" />
            <span className="btn-label">Walk through: {l.name}</span>
          </button>
        ))
      : undefined

  // No wrapper element around <Component/>: its output (the shell, and the
  // control-chart print sheets of addition-charts and multiplication-charts)
  // must stay direct children of main.site-main, which those materials'
  // print-isolation rules select.
  return (
    <>
      <PageHeader
        title={material.name}
        meta={
          <>
            <AgeMeta ages={material.ages} grades={`grades ${material.grades}`} />
            <span className="badge">{strand.name}</span>
          </>
        }
        lede={material.summary}
        actions={walkThroughs}
      />

      <DemoContext.Provider value={demoValue}>
        <MaterialNameContext.Provider value={material.name}>
          <Suspense fallback={<p>Loading material…</p>}>
            <Component />
          </Suspense>
        </MaterialNameContext.Provider>
      </DemoContext.Provider>

      <div className="material-notes">
        <section className="note-col" aria-labelledby="material-parents">
          <h2 id="material-parents">For parents</h2>
          <p>{material.parentNote}</p>
        </section>
        {kits.length > 0 && (
          <section className="note-col" aria-labelledby="material-kits">
            <h2 id="material-kits">Make the real thing</h2>
            <ul className="link-list">
              {kits.map((k) => (
                <li key={k.slug} className="link-row">
                  <Link className="link-row-title" to={`/kits/${k.slug}`}>
                    {k.name}
                  </Link>{' '}
                  — {k.description}
                  <span className="link-row-note">{k.pieces}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {(lessons.length > 0 || generators.length > 0) && (
        <div className="material-links">
          {lessons.length > 0 && (
            <section className="links-col" aria-labelledby="material-lessons">
              <h2 className="section-label" id="material-lessons">
                Lessons for this material
              </h2>
              <ul className="link-list">
                {lessons.map((l) => (
                  <li key={l.slug} className="link-row">
                    <Link className="link-row-title" to={`/lessons/${l.slug}`}>
                      {l.name}
                    </Link>{' '}
                    <span className="badge age">
                      ages {l.ages[0]}–{l.ages[1]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {generators.length > 0 && (
            <section className="links-col" aria-labelledby="material-printables">
              <h2 className="section-label" id="material-printables">
                Printable follow-up work
              </h2>
              <ul className="link-list">
                {generators.map((g) => (
                  <li key={g.slug} className="link-row">
                    <Link className="link-row-title" to={`/worksheets/${g.slug}`}>
                      {g.name}
                    </Link>{' '}
                    — {g.description}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
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
