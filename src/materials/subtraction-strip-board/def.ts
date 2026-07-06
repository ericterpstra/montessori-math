import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'subtraction-strip-board',
  name: 'Subtraction Strip Board',
  ages: [6, 8],
  grades: '1–2',
  strand: 'memorization',
  summary:
    'Work every subtraction fact to 18: a wooden cover hides the numbers you do not need, a blue strip takes away, and the answer is the number left showing.',
  parentNote:
    'The subtraction strip board is how Montessori children commit the subtraction facts to memory after learning the addition facts. Your child sets the cover strip to the starting number, lays a blue strip to take an amount away, and reads the answer right off the board — then records the fact on paper. Because the board always shows the true answer, your child checks their own work without needing you to grade it. This steady, self-corrected practice prepares them for quick mental subtraction and for column arithmetic with borrowing.',
  component: lazy(() => import('./SubtractionStripBoard')),
  lessonSlugs: ['subtraction-strip-board'],
  worksheetSlugs: ['math-facts'],
}
