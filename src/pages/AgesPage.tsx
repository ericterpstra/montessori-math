import { useSearchParams } from 'react-router-dom'
import { MATERIALS } from '../materials/registry'
import { LESSONS } from '../lessons/registry'
import { GENERATORS } from '../worksheets/registry'
import { STRANDS, strandInfo } from '../lib/strands'
import { PageHeader } from '../components/PageHeader'
import { AgeMeta, ChapterHead, ContentsRow } from '../components/Contents'
import { AGE_BANDS, overlapsBand } from './ageBands'

export default function AgesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const band = AGE_BANDS.find((b) => b.id === searchParams.get('band')) ?? AGE_BANDS[0]

  const lessons = LESSONS.filter((l) => overlapsBand(l.ages, band))
  const materials = MATERIALS.filter((m) => overlapsBand(m.ages, band))
  const generators = GENERATORS.filter((g) => overlapsBand(g.ages, band))

  return (
    <>
      <PageHeader
        title="Browse by Age"
        lede="Ages are readiness ranges, not deadlines — most children work across two bands at once. When in doubt, start earlier in the sequence than you think and let ease decide."
      />
      <div className="band-tabs" role="tablist" aria-label="Age band">
        {AGE_BANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            id={`band-tab-${b.id}`}
            aria-selected={b.id === band.id}
            aria-controls="band-panel"
            className="band-tab"
            onClick={() => setSearchParams({ band: b.id }, { replace: true })}
          >
            <span className="band-tab-ages">{b.ages}</span>
            <span className="band-tab-grades">{b.grades}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id="band-panel" aria-labelledby={`band-tab-${band.id}`}>
        <h2 className="section-head">Lessons, in order</h2>
        {lessons.length === 0 && <p>Lessons for this band are being added.</p>}
        {STRANDS.map((strand) => {
          const items = lessons.filter((l) => l.strand === strand.id).sort((a, b) => a.sequence - b.sequence)
          if (items.length === 0) return null
          return (
            <section key={strand.id} className="chapter minor" data-strand={strand.order}>
              <ChapterHead strand={strand} as="h3" size="minor" />
              <ol className="contents" role="list">
                {items.map((l) => (
                  <li key={l.slug}>
                    <ContentsRow
                      to={`/lessons/${l.slug}`}
                      num={l.sequence}
                      title={l.name}
                      summary={l.overview}
                      meta={<AgeMeta ages={l.ages} />}
                    />
                  </li>
                ))}
              </ol>
            </section>
          )
        })}

        <h2 className="section-head">Virtual materials</h2>
        {materials.length === 0 && <p>Materials for this band are being added.</p>}
        <ul className="contents" role="list">
          {materials.map((m) => (
            <li key={m.slug}>
              <ContentsRow
                to={`/materials/${m.slug}`}
                thumb={m.slug}
                strandOrder={strandInfo(m.strand).order}
                title={m.name}
                summary={m.summary}
                meta={<AgeMeta ages={m.ages} grades={m.grades} />}
              />
            </li>
          ))}
        </ul>

        <h2 className="section-head">Worksheets</h2>
        {generators.length === 0 && <p>Worksheets for this band are being added.</p>}
        <ul className="contents" role="list">
          {generators.map((g) => (
            <li key={g.slug}>
              <ContentsRow to={`/worksheets/${g.slug}`} thumb="sheet" title={g.name} summary={g.description} meta={<AgeMeta ages={g.ages} />} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
