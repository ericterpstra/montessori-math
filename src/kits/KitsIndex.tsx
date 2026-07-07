import { Link } from 'react-router-dom'
import { KITS } from './registry'
import { STRANDS } from '../lib/strands'
import { materialBySlug } from '../materials/registry'
import './kits.css'

export default function KitsIndex() {
  return (
    <>
      <h1>Make-It-Yourself Kits</h1>
      <p className="page-intro">
        Print, cut, and assemble real Montessori materials at true physical size. Print each kit at 100% scale
        (&ldquo;Actual size&rdquo;) on US Letter cardstock — every kit&rsquo;s first page has a 1-inch calibration
        square so you can check before cutting — and everything works in authentic color or ink-friendly black &amp;
        white.
      </p>
      {STRANDS.map((strand) => {
        const items = KITS.filter((k) => materialBySlug(k.forMaterials[0])?.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id}>
            <p className="section-label">{strand.name}</p>
            <ul className="card-grid">
              {items.map((k) => (
                <li key={k.slug}>
                  <Link className="card" to={`/kits/${k.slug}`}>
                    <h3>{k.name}</h3>
                    <p>
                      <span className="badge">{k.pieces}</span>
                    </p>
                    <p>{k.description}</p>
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
