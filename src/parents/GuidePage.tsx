import { useParams } from 'react-router-dom'
import { guideBySlug } from './registry'
import { PrintButton } from '../components/PrintButton'
import NotFound from '../pages/NotFound'

export default function GuidePage() {
  const { slug } = useParams()
  const guide = slug ? guideBySlug(slug) : undefined
  if (!guide) return <NotFound />
  const Component = guide.component
  return (
    <div className="guide-page">
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: '46rem' }}>
        <PrintButton label="Print this guide" />
      </div>
      <Component />
    </div>
  )
}
