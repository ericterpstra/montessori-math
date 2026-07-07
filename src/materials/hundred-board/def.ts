import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'hundred-board',
  name: 'Hundred Board',
  ages: [5, 7],
  grades: 'K–1',
  strand: 'linear-counting',
  summary: 'Place the tiles 1–100 on a ten-by-ten board, then mark the skip-counting patterns hiding in it.',
  parentNote:
    'The hundred board consolidates counting to 100: the child places number tiles one by one onto a ten-by-ten grid, first in order and later from a shuffled pile, and the emerging rows and columns reveal any tile that is out of place. A skip-counting mode fills the board and lets the child tap the multiples of any number from 2 to 10, with an honest Check that marks misses and mistakes. This work makes the structure of the numbers to one hundred visible and prepares the child for the bead chains and the multiplication tables.',
  component: lazy(() => import('./HundredBoard')),
  lessonSlugs: ['hundred-board-intro', 'hundred-board-skip-counting'],
  worksheetSlugs: ['hundred-chart', 'skip-counting', 'command-cards'],
}
