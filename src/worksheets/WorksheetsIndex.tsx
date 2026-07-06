import { Link } from 'react-router-dom'
import { GENERATORS } from './registry'
import { STRANDS } from '../lib/strands'

export default function WorksheetsIndex() {
  return (
    <>
      <h1>Printable Worksheets</h1>
      <p className="page-intro">
        Every worksheet is generated fresh from your settings — ranges, difficulty, layout, how many problems — with
        an answer key on its own page. Print in authentic Montessori color or ink-friendly black &amp; white. The same
        seed always reproduces the same sheet, so you can reprint one your child liked.
      </p>
      {GENERATORS.length === 0 && <p>Worksheet generators are being added — check back soon.</p>}
      {STRANDS.map((strand) => {
        const items = GENERATORS.filter((g) => g.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id}>
            <p className="section-label">{strand.name}</p>
            <ul className="card-grid">
              {items.map((g) => (
                <li key={g.slug}>
                  <Link className="card" to={`/worksheets/${g.slug}`}>
                    <h3>{g.name}</h3>
                    <p>
                      <span className="badge age">ages {g.ages[0]}–{g.ages[1]}</span>
                    </p>
                    <p>{g.description}</p>
                    {g.presets.length > 0 && (
                      <p style={{ marginBottom: 0 }}>
                        {g.presets.map((p) => (
                          <span key={p.id} className="badge">
                            {p.name}
                          </span>
                        ))}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
