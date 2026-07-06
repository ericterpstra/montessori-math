import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'bead-stair',
  name: 'Colored Bead Stair',
  ages: [4, 6],
  grades: 'PK–K',
  strand: 'numbers-to-10',
  summary: 'Build the stair of colored bead bars 1–9, counting each bar and pairing it with its numeral.',
  parentNote:
    'The colored bead stair gives each quantity from 1 to 9 its own color and length, turning numbers into things a child can see, count, and compare. Your child taps each bar into its row of the triangle-shaped stair — a bar in the wrong row visibly sticks out or falls short, so the material corrects itself. A second activity pairs numeral tiles 1–9 with the bars. These colors return in the teen board, snake game, and bead chains, so this early work lays groundwork for years of math.',
  component: lazy(() => import('./BeadStair')),
  lessonSlugs: ['bead-stair-intro'],
  worksheetSlugs: ['numeral-tracing', 'math-facts'],
}
