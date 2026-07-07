import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'addition-charts',
  name: 'Addition Charts',
  ages: [5, 8],
  grades: 'K–2',
  strand: 'memorization',
  summary: 'Find any addition fact where two fingers meet on the control chart, then rebuild the whole chart from memory with answer tiles.',
  parentNote:
    'The addition charts carry the facts your child practiced on the strip board the last mile into memory. Chart 1 holds every fact from 1 + 1 to 9 + 9 — one finger slides down from the first number, one in from the second, and the answer waits where they meet. Chart 2 keeps only half the facts, letting your child discover that 3 + 5 and 5 + 3 are the same work. On the working chart the grid is blank: your child places all 81 answer tiles from memory and checks against the control chart — the material corrects, not the adult. Print the control charts to keep beside pencil-and-paper fact practice.',
  component: lazy(() => import('./AdditionCharts')),
  lessonSlugs: ['addition-charts'],
  worksheetSlugs: ['math-facts'],
}
