import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'multiplication-charts',
  name: 'Multiplication Charts',
  ages: [6, 9],
  grades: '1–3',
  strand: 'memorization',
  summary: 'Find any product where two fingers meet on the control chart, then rebuild the whole times table from memory with answer tiles.',
  parentNote:
    'The multiplication charts follow the bead board and carry the times tables into memory. On Chart 1 every product from 1 × 1 to 9 × 9 waits where two sliding fingers meet; Chart 2 keeps only half the facts, so your child discovers that 3 × 5 and 5 × 3 are one fact. On the working chart the grid is blank: your child places all 81 answer tiles from memory and checks against the control chart — the material corrects, not the adult. Print the control charts to keep beside pencil-and-paper times-table practice.',
  component: lazy(() => import('./MultiplicationCharts')),
  lessonSlugs: ['multiplication-charts'],
  worksheetSlugs: ['math-facts'],
}
