import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'bead-frame',
  name: 'Bead Frames (Small & Large)',
  ages: [6, 10],
  grades: '1–4',
  strand: 'abstraction',
  summary:
    'Slide beads along color-coded wires to build numbers to 9,999,999 and to add and subtract with real carrying and borrowing exchanges.',
  parentNote:
    'The bead frame is a Montessori abacus: one bead is worth one, ten, a hundred, or a million depending on its wire, so value comes from position — the key idea behind written arithmetic. Your child slides beads to build numbers, then adds and subtracts place by place, trading ten beads for one whenever a wire fills or runs empty. The small frame works to 9,999; the large frame extends the same rules to one million. It is the direct bridge from the stamp game to column arithmetic done entirely on paper.',
  component: lazy(() => import('./BeadFrame')),
  lessonSlugs: ['small-bead-frame-intro', 'small-bead-frame-addition', 'large-bead-frame'],
  worksheetSlugs: ['multi-digit-ops', 'place-value'],
}
