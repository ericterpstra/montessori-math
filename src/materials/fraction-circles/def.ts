import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'fraction-circles',
  name: 'Fraction Circles',
  ages: [6, 10],
  grades: '1–4',
  strand: 'fractions',
  summary:
    'Lift red pieces from the ten circle insets — whole through tenths — to name fractions, prove equivalences, and add and subtract like pieces.',
  parentNote:
    'The fraction circles are the classic Montessori metal insets: ten red circles in gray square frames, one left whole and the rest cut into two through ten equal pieces. Your child lifts pieces onto the mat to learn each fraction’s name, rebuilds one piece from a different family to discover equivalence, and joins or removes like pieces for the first fraction addition and subtraction — watching a sum like 5/8 + 6/8 close into one whole circle with three eighths left over. Because every piece is an exact part of the same circle, the material checks itself: anything wrong leaves a gap or spills past the outline. This work is the concrete foundation for all later fraction arithmetic and for decimal fractions.',
  component: lazy(() => import('./FractionCircles')),
  lessonSlugs: ['fractions-intro', 'fractions-equivalence', 'fractions-operations'],
  worksheetSlugs: ['fractions'],
}
