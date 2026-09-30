import { GENERATORS } from './registry'
import { STRANDS } from '../lib/strands'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta, ChapterHead, ContentsRow } from '../components/Contents'

export default function WorksheetsIndex() {
  return (
    <>
      <PageHeader
        title="Printable Worksheets"
        lede={
          <>
            Every worksheet is generated fresh from your settings — ranges, difficulty, layout, how many problems — with
            an answer key on its own page. Print in authentic Montessori color or ink-friendly black &amp; white. The same
            seed always reproduces the same sheet, so you can reprint one your child liked.
          </>
        }
      />
      {GENERATORS.length === 0 && <p>Worksheet generators are being added — check back soon.</p>}
      {STRANDS.map((strand) => {
        const items = GENERATORS.filter((g) => g.strand === strand.id)
        if (items.length === 0) return null
        return (
          <section key={strand.id} className="chapter" data-strand={strand.order}>
            <ChapterHead strand={strand} />
            <ul className="contents" role="list">
              {items.map((g) => (
                <li key={g.slug}>
                  <ContentsRow
                    to={`/worksheets/${g.slug}`}
                    thumb="sheet"
                    title={g.name}
                    summary={g.description}
                    meta={<AgeMeta ages={g.ages} />}
                    note={g.presets.length > 0 ? `Presets: ${g.presets.map((p) => p.name).join(' · ')}` : undefined}
                  />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      <section className="chapter">
        <ChapterHead name="Beyond worksheets" />
        <ul className="contents" role="list">
          <li>
            <ContentsRow
              to="/kits"
              thumb="kit"
              title="Make-It-Yourself Kits"
              summary="Print, cut, and assemble real Montessori materials — number cards, stamp tiles, fraction circles, strip boards, and more. True-size pieces on US Letter cardstock."
            />
          </li>
        </ul>
      </section>
    </>
  )
}
