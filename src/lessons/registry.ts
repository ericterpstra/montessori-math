import type { Lesson } from './types'
import { lessons as beadStair } from '../materials/bead-stair/lessons'
import { lessons as cardsAndCounters } from '../materials/cards-and-counters/lessons'
import { lessons as teenBoard } from '../materials/teen-board/lessons'
import { lessons as tenBoard } from '../materials/ten-board/lessons'
import { lessons as hundredBoard } from '../materials/hundred-board/lessons'
import { lessons as beadChains } from '../materials/bead-chains/lessons'
import { lessons as goldenBeads } from '../materials/golden-beads/lessons'
import { lessons as numberCards } from '../materials/number-cards/lessons'
import { lessons as snakeGame } from '../materials/snake-game/lessons'
import { lessons as additionStripBoard } from '../materials/addition-strip-board/lessons'
import { lessons as subtractionStripBoard } from '../materials/subtraction-strip-board/lessons'
import { lessons as multiplicationBeadBoard } from '../materials/multiplication-bead-board/lessons'
import { lessons as divisionBoard } from '../materials/division-board/lessons'
import { lessons as additionCharts } from '../materials/addition-charts/lessons'
import { lessons as multiplicationCharts } from '../materials/multiplication-charts/lessons'
import { lessons as stampGame } from '../materials/stamp-game/lessons'
import { lessons as beadFrame } from '../materials/bead-frame/lessons'
import { lessons as checkerboard } from '../materials/checkerboard/lessons'
import { lessons as racksAndTubes } from '../materials/racks-and-tubes/lessons'
import { lessons as fractionCircles } from '../materials/fraction-circles/lessons'
import { lessons as decimalBoard } from '../materials/decimal-board/lessons'

/** Every album lesson on the site, contributed by the material folders. */
export const LESSONS: Lesson[] = [
  ...beadStair,
  ...cardsAndCounters,
  ...teenBoard,
  ...tenBoard,
  ...hundredBoard,
  ...beadChains,
  ...goldenBeads,
  ...numberCards,
  ...snakeGame,
  ...additionStripBoard,
  ...subtractionStripBoard,
  ...multiplicationBeadBoard,
  ...divisionBoard,
  ...additionCharts,
  ...multiplicationCharts,
  ...stampGame,
  ...beadFrame,
  ...checkerboard,
  ...racksAndTubes,
  ...fractionCircles,
  ...decimalBoard,
]

export function lessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug)
}
