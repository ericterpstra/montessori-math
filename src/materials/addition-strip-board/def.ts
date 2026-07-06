import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'addition-strip-board',
  name: 'Addition Strip Board',
  ages: [5, 7],
  grades: 'K–1',
  strand: 'memorization',
  summary: 'Lay a blue strip and a red strip end-to-end to work every addition fact up to 9 + 9 = 18.',
  parentNote:
    'The addition strip board is how Montessori children practice their addition facts on the way to knowing them by heart. Your child lays a blue strip for the first number and a red strip right after it for the second, then reads the sum from the numbers across the top — the strips physically show that adding is joining two lengths. Practice mode offers problems to work and check honestly on the board, and the ways-to-make mode turns fact practice into a hunt for every pair that builds a number. It follows the snake game and prepares for the subtraction strip board.',
  component: lazy(() => import('./AdditionStripBoard')),
  lessonSlugs: ['addition-strip-board'],
  worksheetSlugs: ['math-facts'],
}
