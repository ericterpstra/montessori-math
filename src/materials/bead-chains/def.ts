import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'bead-chains',
  name: 'Bead Chains',
  ages: [5, 8],
  grades: 'K–2',
  strand: 'linear-counting',
  summary:
    'Skip count the short bead chains of 2 through 10, then journey down the long hundred and thousand chains, labeling every ten.',
  parentNote:
    'The bead chains make skip counting something your child can see and touch: the chain of five is five bars of five beads, and counting it bar by bar produces 5, 10, 15, 20, 25. Your child counts the beads, then labels the end of each bar with its number ticket, meeting the square of the number on the final, larger ticket. Recounting a bar — or the Check button — confirms every label honestly. This work plants the multiplication tables in the ear and the hand long before formal memorization begins. The long chains extend this journey: the hundred chain is ten golden ten-bars, and the thousand chain is one hundred of them — a counting expedition to 1,000 with a milestone at every hundred. Printable arrow labels on the material page let you label a real or homemade chain at home.',
  component: lazy(() => import('./BeadChains')),
  lessonSlugs: ['bead-chains-skip-counting', 'long-chains'],
  worksheetSlugs: ['skip-counting'],
}
