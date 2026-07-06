import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'racks-and-tubes',
  name: 'Racks & Tubes',
  ages: [8, 11],
  grades: '3–5',
  strand: 'abstraction',
  summary:
    'True long division with racks of colored beads: deal rounds to skittles, exchange leftovers down a place, and watch the written record build itself — up to 9,999 ÷ 99.',
  parentNote:
    'Racks and tubes is the Montessori material for long division, presented after the unit division board and stamp game division. Your child lays out the dividend as colored beads, deals them to skittles one fair round at a time, exchanges leftovers for ten of the next place down, and records each quotient digit — the exact moves of the paper algorithm, made visible and inevitable. Guided mode enforces the correct sequence and coaches every step, so no Montessori training is needed to sit alongside. When your child can predict each move before making it, they are ready to leave the beads and divide on paper alone.',
  component: lazy(() => import('./RacksAndTubes')),
  lessonSlugs: ['racks-and-tubes'],
  worksheetSlugs: ['long-division'],
}
