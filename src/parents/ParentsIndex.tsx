import { Link } from 'react-router-dom'
import { GUIDES } from './registry'

export default function ParentsIndex() {
  return (
    <>
      <h1>For Parents</h1>
      <p className="page-intro">
        You don't need Montessori training to use this site — you need about twenty minutes of reading. Start with why
        the materials work, learn the simple way lessons are given, then use the scope &amp; sequence to find where
        your child is.
      </p>
      {GUIDES.length === 0 && <p>Guides are being added — check back soon.</p>}
      <ul className="card-grid">
        {GUIDES.map((g, i) => (
          <li key={g.slug}>
            <Link className="card" to={`/parents/${g.slug}`}>
              <h3>
                {i + 1}. {g.title}
              </h3>
              <p style={{ marginBottom: 0 }}>{g.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
