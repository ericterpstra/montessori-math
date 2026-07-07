import { Link, useParams, useSearchParams } from 'react-router-dom'
import { kitBySlug } from './registry'
import { materialBySlug } from '../materials/registry'
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
      <div className="no-print">
        <h1>{kit.name}</h1>
        <p className="page-intro">{kit.description}</p>
        <p>
          For use with:{' '}
          {kit.forMaterials.map((s, i) => (
            <span key={s}>
              {i > 0 && ', '}
              <Link to={`/materials/${s}`}>{materialBySlug(s)?.name ?? s}</Link>
            </span>
          ))}
        </p>
      </div>

      <div className="builder-layout">
        <aside className="builder-form card no-print">
          <p className="section-label" style={{ margin: 0 }}>
            In this kit
          </p>
          <p style={{ marginTop: '0.25rem' }}>{kit.pieces}</p>

          <p className="section-label" style={{ margin: 0 }}>
            Assembly
          </p>
          <ol style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
            {kit.assembly.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <label className="field checkbox">
            <input type="checkbox" checked={bw} onChange={(e) => setBw(e.target.checked)} />
            Ink-friendly black &amp; white
          </label>

          <div className="builder-actions">
            <PrintButton />
          </div>
          <p className="field-help">
            Print at 100% scale on cardstock and check the 1-inch square on page 1 before cutting.{' '}
            <Link to="/parents/using-this-site">Printing tips</Link>
          </p>
        </aside>

        <div className="builder-preview">
          <SheetPreview bw={bw}>
            <Pages />
          </SheetPreview>
        </div>
      </div>
    </div>
  )
}
