import { useParams } from 'react-router-dom'
import { guideBySlug } from './registry'
import NotFound from '../pages/NotFound'

export default function GuidePage() {
  const { slug } = useParams()
  const guide = slug ? guideBySlug(slug) : undefined
  if (!guide) return <NotFound />
  const Component = guide.component
  // Each guide renders its own <GuideHeader> (title, lede, Print).
  return (
    <div className="guide-page">
      <Component />
    </div>
  )
}
