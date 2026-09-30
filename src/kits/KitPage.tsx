import { Link, useParams, useSearchParams } from 'react-router-dom'
import { kitBySlug } from './registry'
import { materialBySlug } from '../materials/registry'
import { PageHeader } from '../components/PageHeader'
import { PrintButton } from '../components/PrintButton'
import { SheetPreview } from '../components/SheetPreview'
import NotFound from '../pages/NotFound'
import './kits.css'

export default function KitPage() {
  const { slug } = useParams()
  const kit = slug ? kitBySlug(slug) : undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const bw = searchParams.get('bw') === '1'

  if (!kit) return <NotFound />

  const setBw = (checked: boolean) => {
    const next = new URLSearchParams(searchParams)
    next.set('bw', checked ? '1' : '0')
    setSearchParams(next, { replace: true })
  }

  const Pages = kit.Pages

  return (
    <div className="builder">
      <PageHeader
        className="no-print"
        title={kit.name}
        docTitle={`${kit.name} kit`}
        lede={kit.description}
        actions={<PrintButton />}
      >
        <p className="page-forwith">
          For use with:{' '}
          {kit.forMaterials.map((s, i) => (
            <span key={s}>
              {i > 0 && ', '}
              <Link to={`/materials/${s}`}>{materialBySlug(s)?.name ?? s}</Link>
            </span>
          ))}
        </p>
      </PageHeader>

      <div className="builder-layout">
        <aside className="builder-form panel no-print" aria-label="Kit contents and settings">
          <h2 className="panel-label">In this kit</h2>
          <p className="panel-text">{kit.pieces}</p>

          <h2 className="panel-label">Assembly</h2>
          <ol className="panel-steps">
            {kit.assembly.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <div className="field-grid">
            <label className="field checkbox">
              <input type="checkbox" checked={bw} onChange={(e) => setBw(e.target.checked)} />
              <span className="field-label">Ink-friendly black &amp; white</span>
            </label>
          </div>
          <p className="panel-note">
            Print at 100% scale on cardstock and check the 1-inch square on page 1 before cutting.{' '}
            <Link to="/parents/using-this-site">Printing tips</Link>
          </p>
        </aside>

        <div className="builder-preview">
          <SheetPreview bw={bw} desk>
            <Pages />
          </SheetPreview>
        </div>
      </div>
    </div>
  )
}
