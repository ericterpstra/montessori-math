import { Link } from 'react-router-dom'
import { MATERIALS } from './registry'
import { STRANDS } from '../lib/strands'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta, ChapterHead, ContentsRow } from '../components/Contents'

export default function MaterialsIndex() {
  return (
    <>
      <PageHeader
        title="Virtual Montessori Materials"
        lede={
          <>
            Faithful on-screen versions of the classic materials, for families who don't have the real ones at hand. The
            real, physical material is always better when you can get it — see{' '}
            <Link to="/parents/using-this-site">using this site</Link> for advice on substitutes you can make at home.
          </>
        }
      />
      {MATERIALS.length === 0 && <p>Materials are being added — check back soon.</p>}
      {STRANDS.map((strand) => {
        const items = MATERIALS.filter((m) => m.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id} className="chapter" data-strand={strand.order}>
            <ChapterHead strand={strand} />
            <ul className="contents" role="list">
              {items.map((m) => (
                <li key={m.slug}>
                  <ContentsRow
                    to={`/materials/${m.slug}`}
                    thumb={m.slug}
                    strandOrder={strand.order}
                    title={m.name}
                    summary={m.summary}
                    meta={<AgeMeta ages={m.ages} grades={m.grades} />}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
