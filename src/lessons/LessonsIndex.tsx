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
