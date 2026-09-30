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
