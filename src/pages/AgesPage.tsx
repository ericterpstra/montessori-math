import { Link, useSearchParams } from 'react-router-dom'
import { MATERIALS } from '../materials/registry'
import { LESSONS } from '../lessons/registry'
import { GENERATORS } from '../worksheets/registry'
import { STRANDS } from '../lib/strands'

const BANDS = [
  { id: '4-6', label: 'Ages 4–6 · PK–K', min: 4, max: 6 },
  { id: '6-9', label: 'Ages 6–9 · Grades 1–3', min: 6, max: 9 },
  { id: '9-12', label: 'Ages 9–12 · Grades 4–6', min: 9, max: 12 },
] as const

function overlaps(ages: [number, number], min: number, max: number): boolean {
  return ages[0] <= max && ages[1] >= min
}

export default function AgesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const band = BANDS.find((b) => b.id === searchParams.get('band')) ?? BANDS[0]

  const lessons = LESSONS.filter((l) => overlaps(l.ages, band.min, band.max))
  const materials = MATERIALS.filter((m) => overlaps(m.ages, band.min, band.max))
  const generators = GENERATORS.filter((g) => overlaps(g.ages, band.min, band.max))

  return (
    <>
      <h1>Browse by Age</h1>
      <p className="page-intro">
        Ages are readiness ranges, not deadlines — most children work across two bands at once. When in doubt, start
        earlier in the sequence than you think and let ease decide.
      </p>
      <div className="material-controls" role="tablist" aria-label="Age band">
        {BANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={b.id === band.id}
            className={`btn${b.id === band.id ? ' primary' : ''}`}
            onClick={() => setSearchParams({ band: b.id }, { replace: true })}
          >
            {b.label}
          </button>
        ))}
      </div>

      <p className="section-label">Lessons, in order</p>
      {lessons.length === 0 && <p>Lessons for this band are being added.</p>}
      {STRANDS.map((strand) => {
        const items = lessons.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)
        if (items.length === 0) return null
        return (
          <div key={strand.id}>
            <h3 style={{ marginTop: '1rem' }}>{strand.name}</h3>
            <ol>
              {items.map((l) => (
                <li key={l.slug}>
                  <Link to={`/lessons/${l.slug}`}>{l.name}</Link>{' '}
                  <span className="badge age">ages {l.ages[0]}–{l.ages[1]}</span>
                </li>
              ))}
            </ol>
          </div>
        )
      })}

      <p className="section-label">Virtual materials</p>
      {materials.length === 0 && <p>Materials for this band are being added.</p>}
      <ul className="card-grid">
        {materials.map((m) => (
          <li key={m.slug}>
            <Link className="card" to={`/materials/${m.slug}`}>
              <h3>{m.name}</h3>
              <p style={{ marginBottom: 0 }}>
                <span className="badge age">ages {m.ages[0]}–{m.ages[1]}</span> {m.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="section-label">Worksheets</p>
      {generators.length === 0 && <p>Worksheets for this band are being added.</p>}
      <ul>
        {generators.map((g) => (
          <li key={g.slug}>
            <Link to={`/worksheets/${g.slug}`}>{g.name}</Link> — {g.description}
          </li>
        ))}
      </ul>
    </>
  )
}
