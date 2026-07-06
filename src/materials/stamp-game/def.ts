import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'stamp-game',
  name: 'Stamp Game',
  ages: [5, 8],
  grades: 'K–2',
  strand: 'abstraction',
  summary:
    'All four operations with place-value tiles — the golden beads condensed into identical stamps, dynamic exchanging included.',
  parentNote:
    'The stamp game is the classic bridge from the golden beads toward written arithmetic: quantity shrinks to identical tiles where only the color and printed number carry the value. Your child builds numbers to 9,999, then adds, subtracts, multiplies, and divides them — trading ten stamps for one (and one for ten) exactly as with the beads. Because the tiles no longer look like their quantity, the child begins trusting symbols, which is precisely what pencil-and-paper arithmetic will ask of them next.',
  component: lazy(() => import('./StampGame')),
  lessonSlugs: [
    'stamp-game-intro',
    'stamp-game-addition',
    'stamp-game-subtraction',
    'stamp-game-multiplication',
    'stamp-game-division',
  ],
  worksheetSlugs: ['multi-digit-ops'],
}
