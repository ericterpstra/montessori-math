import type { MaterialDef } from './types'
import { def as beadStair } from './bead-stair/def'
import { def as cardsAndCounters } from './cards-and-counters/def'
import { def as teenBoard } from './teen-board/def'
import { def as tenBoard } from './ten-board/def'
import { def as hundredBoard } from './hundred-board/def'
import { def as beadChains } from './bead-chains/def'
import { def as goldenBeads } from './golden-beads/def'
import { def as numberCards } from './number-cards/def'
import { def as snakeGame } from './snake-game/def'
import { def as additionStripBoard } from './addition-strip-board/def'
import { def as subtractionStripBoard } from './subtraction-strip-board/def'
import { def as multiplicationBeadBoard } from './multiplication-bead-board/def'
import { def as divisionBoard } from './division-board/def'
import { def as stampGame } from './stamp-game/def'
import { def as beadFrame } from './bead-frame/def'
import { def as checkerboard } from './checkerboard/def'
import { def as racksAndTubes } from './racks-and-tubes/def'
import { def as fractionCircles } from './fraction-circles/def'
import { def as decimalBoard } from './decimal-board/def'

/**
 * Every virtual material on the site, in rough curriculum order. Each entry's
 * component lives in src/materials/<slug>/ — one folder per material.
 */
export const MATERIALS: MaterialDef[] = [
  beadStair,
  cardsAndCounters,
  teenBoard,
  tenBoard,
  hundredBoard,
  beadChains,
  goldenBeads,
  numberCards,
  snakeGame,
  additionStripBoard,
  subtractionStripBoard,
  multiplicationBeadBoard,
  divisionBoard,
  stampGame,
  beadFrame,
  checkerboard,
  racksAndTubes,
  fractionCircles,
  decimalBoard,
]

export function materialBySlug(slug: string): MaterialDef | undefined {
  return MATERIALS.find((m) => m.slug === slug)
}
