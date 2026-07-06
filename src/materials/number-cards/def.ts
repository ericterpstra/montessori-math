import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'number-cards',
  name: 'Large Number Cards',
  ages: [4, 7],
  grades: 'PK–1',
  strand: 'decimal-system',
  summary:
    'Compose numbers to 9,999 by stacking place-value cards — and slide them apart to see the thousands, hundreds, tens, and units inside.',
  parentNote:
    'The large number cards are the written half of the golden bead work: 36 cards from 1 to 9000, colored by place, that stack with right edges aligned so 3000, 200, 50, and 1 read as 3,251. Your child taps cards from the bird’s-eye bank to build numbers, flips between the side-by-side and stacked views, and can check a built number place by place. This work teaches reading and composing four-digit numbers and the role of zero as a placeholder, and it prepares your child to label golden bead quantities in the four operations.',
  component: lazy(() => import('./NumberCards')),
  lessonSlugs: ['number-cards-intro', 'number-cards-birds-eye'],
  worksheetSlugs: ['place-value'],
}
