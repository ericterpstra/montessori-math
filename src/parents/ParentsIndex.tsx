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
      <section className="card" style={{ maxWidth: '46rem', marginTop: '2rem' }}>
        <h2>Plan the week</h2>
        <p style={{ marginBottom: 0 }}>
          Pick lessons, worksheets, and materials for the week, then print a parent plan and a "My Work"
          journal your child checks off in pencil. The whole plan lives in the page's URL — bookmark it to
          keep it; nothing is stored anywhere. <Link to="/planner">Open the planner</Link>
        </p>
      </section>
    </>
  )
}
