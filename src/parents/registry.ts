import type { GuideDef } from './types'
import Overview, { meta as overviewMeta } from './guides/montessori-math-overview'
import HowToPresent, { meta as howToPresentMeta } from './guides/how-to-present'
import ScopeAndSequence, { meta as scopeMeta } from './guides/scope-and-sequence'
import UsingThisSite, { meta as usingMeta } from './guides/using-this-site'
import Glossary, { meta as glossaryMeta } from './guides/glossary'
import Faq, { meta as faqMeta } from './guides/faq'

/** Parent guides, in reading order. */
export const GUIDES: GuideDef[] = [
  { ...overviewMeta, component: Overview },
  { ...howToPresentMeta, component: HowToPresent },
  { ...scopeMeta, component: ScopeAndSequence },
  { ...usingMeta, component: UsingThisSite },
  { ...glossaryMeta, component: Glossary },
  { ...faqMeta, component: Faq },
]

export function guideBySlug(slug: string): GuideDef | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
