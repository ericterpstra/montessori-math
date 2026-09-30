import { Link } from 'react-router-dom'
import { GUIDES } from './registry'
import { PageHeader } from '../components/PageHeader'
import { ContentsRow } from '../components/Contents'
import { Icon } from '../components/Icon'

export default function ParentsIndex() {
  return (
    <>
      <PageHeader
        title="For Parents"
        lede={
          <>
            You don't need Montessori training to use this site — you need about twenty minutes of reading. Start with why
            the materials work, learn the simple way lessons are given, then use the scope &amp; sequence to find where
            your child is.
          </>
        }
      />
      {GUIDES.length === 0 && <p>Guides are being added — check back soon.</p>}
      <ol className="contents contents-first" role="list">
        {GUIDES.map((g, i) => (
          <li key={g.slug}>
            <ContentsRow to={`/parents/${g.slug}`} num={i + 1} title={g.title} summary={g.summary} />
          </li>
        ))}
      </ol>
      <section className="note" aria-labelledby="note-plan">
        <span className="fleuron" aria-hidden="true" />
        <h2 id="note-plan">Plan the week</h2>
        <p>
          Pick lessons, worksheets, and materials for the week, then print a parent plan and a "My Work" journal your
          child checks off in pencil. The whole plan lives in the page's URL — bookmark it to keep it; nothing is stored
          anywhere.
        </p>
        <p className="note-action">
          <Link className="text-link" to="/planner">
            Open the planner <Icon name="arrow" />
          </Link>
        </p>
      </section>
    </>
  )
}
