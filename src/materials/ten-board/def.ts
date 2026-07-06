import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'ten-board',
  name: 'Ten Board (Seguin B)',
  ages: [5, 7],
  grades: 'K–1',
  strand: 'linear-counting',
  summary:
    'Slide unit cards over the printed tens to build any number 10–99, and lay out the matching golden ten-bars and unit beads.',
  parentNote:
    'The Ten Board teaches the names of the tens — twenty, thirty, forty — and then every number up to 99, pairing each written symbol with a quantity of golden beads. Your child taps a row to choose the tens, slides a unit card over the zero, and lays out ten-bars and unit beads to match; in counting mode they add one bead at a time and trade ten loose beads for a ten-bar at every new ten. That exchange ceremony is the concrete root of carrying, and this work leads directly into the Hundred Board and the decimal system.',
  component: lazy(() => import('./TenBoard')),
  lessonSlugs: ['ten-board-intro', 'ten-board-counting'],
  worksheetSlugs: ['teens-tens'],
}
