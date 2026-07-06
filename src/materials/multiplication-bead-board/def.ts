import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'multiplication-bead-board',
  name: 'Multiplication Bead Board',
  ages: [6, 9],
  grades: '1–3',
  strand: 'memorization',
  summary: 'Build the tables 1–10 with red beads on a 100-hole board, counting every bead to find each product.',
  parentNote:
    'The multiplication bead board is where the times tables move from understanding into memory. Your child slides a number card into the slot, places that many red beads column by column, and counts the whole board to find each product — building the table of 4 means physically making 4 × 1 through 4 × 10 and writing every fact down. The repetition of placing, counting, and recording is the point: it fixes the facts. This work prepares the unit division board and, later, checkerboard multiplication.',
  component: lazy(() => import('./MultiplicationBeadBoard')),
  lessonSlugs: ['multiplication-bead-board'],
  worksheetSlugs: ['math-facts'],
}
