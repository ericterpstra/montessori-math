import { Link } from 'react-router-dom'
import { STRANDS } from '../../lib/strands'
import { MATERIALS } from '../../materials/registry'
import { LESSONS } from '../../lessons/registry'
import { GENERATORS } from '../../worksheets/registry'
import type { GuideMeta } from '../types'

export const meta: GuideMeta = {
  slug: 'scope-and-sequence',
  title: 'Scope & Sequence',
  summary: 'The whole PK–6 path on one printable chart: strands, lessons in order, materials, and worksheets.',
}

/**
 * Generated live from the site's own registries, so it can never drift out
 * of date: every lesson, material, and worksheet listed here is a real page.
 */
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
                </tr>
                {lessons.length === 0 && (
                  <tr>
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
                    <tr key={l.slug}>
                      <td>{l.sequence}</td>
                      <td>
                        <Link to={`/lessons/${l.slug}`}>{l.name}</Link>
                      </td>
                      <td>
                        {l.ages[0]}–{l.ages[1]}
                      </td>
                      <td>{l.grades}</td>
                      <td>
                        {mats.map((m, i) => (
                          <span key={m.slug}>
                            {i > 0 && ', '}
                            <Link to={`/materials/${m.slug}`}>{m.name}</Link>
                          </span>
                        ))}
                      </td>
                      <td>
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
