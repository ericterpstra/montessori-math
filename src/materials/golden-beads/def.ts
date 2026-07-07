import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'golden-beads',
  name: 'Golden Beads & Mat',
  ages: [4, 7],
  grades: 'PK–1',
  strand: 'decimal-system',
  summary:
    'The flagship decimal-system material: a bank of golden unit beads, ten-bars, hundred-squares, and thousand-cubes for building numbers to 9,999 and working all four operations with real 10-for-1 exchanges.',
  parentNote:
    'The golden beads make place value physical: a ten really is ten unit beads, and a thousand is a cube your child can hold. Your child fetches quantities from the bank, builds numbers on the mat, and adds, subtracts, multiplies, and divides by moving and exchanging real pieces — carrying and borrowing become bank trades instead of tricks. The Check button marks each place honestly, like counting the beads back yourself. This work prepares the stamp game, bead frames, and written column arithmetic.',
  component: lazy(() => import('./GoldenBeads')),
  lessonSlugs: [
    'golden-beads-intro',
    'golden-beads-formation',
    'golden-beads-addition',
    'golden-beads-subtraction',
    'golden-beads-multiplication',
    'golden-beads-division',
  ],
  worksheetSlugs: ['golden-bead-pictures', 'place-value', 'multi-digit-ops', 'command-cards'],
}
