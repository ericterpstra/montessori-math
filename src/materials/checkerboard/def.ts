import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'checkerboard',
  name: 'Checkerboard',
  ages: [7, 11],
  grades: '2–5',
  strand: 'abstraction',
  summary:
    'Multiply numbers up to 4 digits by 4 digits: bead-bar partial products land on place-value colored squares, slide down their diagonals, and combine into the product.',
  parentNote:
    'The checkerboard turns long multiplication into something a child can see and touch. Each crossing of a multiplicand digit and a multiplier digit gets its own bead bars, whose value comes from the colored square they sit on; the bars then slide down equal-value diagonals, and anything over nine on a square is exchanged one square to the left. Working the board over and over, a child discovers partial products and carrying for themselves — exactly the moves of the written algorithm they will use next. It follows the multiplication bead board and bead frames, and prepares for long multiplication on paper and for long division with the racks and tubes.',
  component: lazy(() => import('./Checkerboard')),
  lessonSlugs: ['checkerboard-intro', 'checkerboard-multiplication'],
  worksheetSlugs: ['long-multiplication', 'command-cards'],
}
