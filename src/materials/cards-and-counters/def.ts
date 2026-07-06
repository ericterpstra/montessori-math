import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'cards-and-counters',
  name: 'Cards & Counters',
  ages: [4, 5],
  grades: 'PK',
  strand: 'numbers-to-10',
  summary:
    'Lay the numeral cards 1–10 in order and count out exactly 55 red counters — then discover odd and even.',
  parentNote:
    'Your child lays the numeral cards 1 through 10 in order and counts red counters beneath each one. With exactly 55 counters in the bowl, a wrong count anywhere means running out early or having some left over — the material corrects itself, so you never have to. Arranging the counters in pairs reveals odd and even: a lone bottom counter blocks the line, full pairs let it pass. This work confirms counting to ten is truly secure and quietly prepares for skip counting and divisibility.',
  component: lazy(() => import('./CardsAndCounters')),
  lessonSlugs: ['cards-and-counters'],
  worksheetSlugs: ['numeral-tracing'],
}
