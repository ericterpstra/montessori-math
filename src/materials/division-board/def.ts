import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'division-board',
  name: 'Unit Division Board',
  ages: [6, 9],
  grades: '1–3',
  strand: 'memorization',
  summary: 'Deal green beads out to skittles one fair round at a time and read the quotient — and any remainder — right off the board.',
  parentNote:
    'The unit division board turns division into fair sharing: skittles across the top are the "people," and your child deals the dividend out to them one bead each per round. The number under any one skittle is the answer, and whatever cannot be dealt fairly is the remainder — always smaller than the divisor, or another round would be possible. Working through dividends up to 81 this way builds real understanding of division facts and prepares your child for the stamp game and, eventually, long division with racks and tubes.',
  component: lazy(() => import('./DivisionBoard')),
  lessonSlugs: ['unit-division-board'],
  worksheetSlugs: ['math-facts'],
}
