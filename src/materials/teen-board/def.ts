import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'teen-board',
  name: 'Teen Board (Seguin A)',
  ages: [4, 6],
  grades: 'PK–K',
  strand: 'linear-counting',
  summary:
    'Slide unit cards over the printed tens to build 11–19, then lay a golden ten-bar and colored bead bar beside each row so quantity and symbol match.',
  parentNote:
    'The Teen Board (Seguin Board A) teaches the names and numerals of 11–19 — the trickiest stretch of counting in English. Your child slides a unit card over the zero of a printed "10" and watches fourteen appear as "ten and four," then lays out a golden ten-bar and a colored bead bar to prove the quantity matches the numeral. Along the way it quietly plants the first seed of place value, preparing for the Ten Board and the golden bead work of the decimal system.',
  component: lazy(() => import('./TeenBoard')),
  lessonSlugs: ['teen-board-intro', 'teen-board-with-beads'],
  worksheetSlugs: ['teens-tens'],
}
