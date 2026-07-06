import { Link } from 'react-router-dom'
import { MATERIALS } from './registry'
import { STRANDS } from '../lib/strands'

export default function MaterialsIndex() {
  return (
    <>
      <h1>Virtual Montessori Materials</h1>
      <p className="page-intro">
        Faithful on-screen versions of the classic materials, for families who don't have the real ones at hand. The
        real, physical material is always better when you can get it — see{' '}
        <Link to="/parents/using-this-site">using this site</Link> for advice on substitutes you can make at home.
      </p>
      {MATERIALS.length === 0 && <p>Materials are being added — check back soon.</p>}
      {STRANDS.map((strand) => {
        const items = MATERIALS.filter((m) => m.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id}>
            <p className="section-label">{strand.name}</p>
            <ul className="card-grid">
              {items.map((m) => (
                <li key={m.slug}>
                  <Link className="card" to={`/materials/${m.slug}`}>
                    <h3>{m.name}</h3>
                    <p>
                      <span className="badge age">ages {m.ages[0]}–{m.ages[1]}</span>
                      <span className="badge">{m.grades}</span>
                    </p>
                    <p>{m.summary}</p>
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
