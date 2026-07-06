import { Link } from 'react-router-dom'
import { LESSONS } from './registry'
import { STRANDS } from '../lib/strands'

export default function LessonsIndex() {
  return (
    <>
      <h1>Lessons</h1>
      <p className="page-intro">
        Full album-style lessons, written for parents with no Montessori training: what to gather, exactly what to do
        and say, how the child self-corrects, and where to go next. Every lesson prints cleanly — read it on paper, not
        over the child's shoulder. New to this? Start with{' '}
        <Link to="/parents/how-to-present">how to present a lesson</Link>.
      </p>
      {LESSONS.length === 0 && <p>Lessons are being added — check back soon.</p>}
      {STRANDS.map((strand) => {
        const items = LESSONS.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)
        if (items.length === 0) return null
        return (
          <section key={strand.id}>
            <p className="section-label">
              {strand.order}. {strand.name} <span className="badge age">ages {strand.ages[0]}–{strand.ages[1]}</span>
            </p>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '46rem' }}>{strand.description}</p>
            <ol>
              {items.map((l) => (
                <li key={l.slug}>
                  <Link to={`/lessons/${l.slug}`}>{l.name}</Link>{' '}
                  <span className="badge age">ages {l.ages[0]}–{l.ages[1]}</span> {l.overview}
                </li>
              ))}
            </ol>
          </section>
        )
      })}
    </>
  )
}
