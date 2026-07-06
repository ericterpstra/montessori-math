import { lazy } from 'react'
import type { MaterialDef } from '../types'

export const def: MaterialDef = {
  slug: 'snake-game',
  name: 'Snake Game',
  ages: [5, 7],
  grades: 'K–1',
  strand: 'memorization',
  summary:
    'Build a colorful snake of bead bars, then count it into golden tens — the classic game that plants the addition facts.',
  parentNote:
    'The positive snake game turns addition practice into play. Your child builds a long "snake" of colored bead bars, then counts it out ten beads at a time, trading each ten for a golden ten-bar — with black-and-white bars holding the place of any leftover beads — until the whole snake has turned to gold. Along the way the child meets every pair that makes ten and watches regrouping (the heart of carrying) happen bead by bead. It prepares the child for the addition strip board and, later, written column addition.',
  component: lazy(() => import('./SnakeGame')),
  lessonSlugs: ['snake-game'],
  worksheetSlugs: ['math-facts'],
}
