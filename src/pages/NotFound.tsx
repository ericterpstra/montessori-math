import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { ContentsRow } from '../components/Contents'

/** Where a lost visitor most likely meant to go. */
const HUBS = [
  { to: '/materials', title: 'Materials', summary: 'The virtual golden beads, stamp game, bead frames and more.' },
  { to: '/lessons', title: 'Lessons', summary: 'Album-style lessons, written for parents, in curriculum order.' },
  { to: '/worksheets', title: 'Worksheets', summary: 'Printable practice with an answer key, in color or black & white.' },
  { to: '/kits', title: 'Kits', summary: 'Print, cut and assemble real materials at true size.' },
  { to: '/parents', title: 'For Parents', summary: 'How the method works and how to give a lesson.' },
  { to: '/ages', title: 'By Age', summary: 'Everything for ages 4–6, 6–9 or 9–12 on one page.' },
]

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        lede={
          <>
            That page doesn't exist. Try the <Link to="/">home page</Link>, or one of these:
          </>
        }
      />
      <ul className="contents contents-first" role="list">
        {HUBS.map((h) => (
          <li key={h.to}>
            <ContentsRow to={h.to} title={h.title} summary={h.summary} />
          </li>
        ))}
      </ul>
    </>
  )
}
