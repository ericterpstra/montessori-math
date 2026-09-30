import { KITS } from './registry'
import { STRANDS } from '../lib/strands'
import { materialBySlug } from '../materials/registry'
import { PageHeader } from '../components/PageHeader'
import { ChapterHead, ContentsRow } from '../components/Contents'
import './kits.css'

export default function KitsIndex() {
  return (
    <>
      <PageHeader
        title="Make-It-Yourself Kits"
        lede={
          <>
            Print, cut, and assemble real Montessori materials at true physical size. Print each kit at 100% scale
            (&ldquo;Actual size&rdquo;) on US Letter cardstock — every kit&rsquo;s first page has a 1-inch calibration
            square so you can check before cutting — and everything works in authentic color or ink-friendly black &amp;
            white.
          </>
        }
      />
      {STRANDS.map((strand) => {
        const items = KITS.filter((k) => materialBySlug(k.forMaterials[0])?.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id} className="chapter" data-strand={strand.order}>
            <ChapterHead strand={strand} />
            <ul className="contents" role="list">
              {items.map((k) => (
                <li key={k.slug}>
                  <ContentsRow to={`/kits/${k.slug}`} thumb="kit" title={k.name} summary={k.description} note={k.pieces} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
