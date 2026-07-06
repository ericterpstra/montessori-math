import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'decimal-board',
  name: 'Decimal Board',
  ages: [9, 12],
  grades: '4–6',
  strand: 'decimals',
  summary:
    'Place value to the right of the unit: build, compare, add, and subtract decimals to thousandths with real exchanging across the decimal point.',
  parentNote:
    'The decimal board carries the place-value story your child knows from the golden beads past the decimal point: pale blue tenths, pale rose hundredths, and pale green thousandths mirror the strong colors of the whole-number places. Your child places pieces in labeled columns, trades ten of one column for one of the next, and works comparisons, sums, and differences where every carry and borrow crosses the decimal point honestly. Because the board counts real pieces instead of rounding, 0.1 + 0.2 makes exactly 0.3 — building the exact place-value thinking that written decimal arithmetic depends on.',
  component: lazy(() => import('./DecimalBoard')),
  lessonSlugs: ['decimal-board-intro', 'decimal-board-operations'],
  worksheetSlugs: ['decimals'],
}
