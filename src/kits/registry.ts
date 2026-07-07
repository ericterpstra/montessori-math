import type { KitDef } from './types'
import { meta as largeNumberCardsMeta, Pages as LargeNumberCardsPages } from './kits/large-number-cards'
import { meta as goldenBeadCardsMeta, Pages as GoldenBeadCardsPages } from './kits/golden-bead-cards'
import { meta as playMoneyMeta, Pages as PlayMoneyPages } from './kits/play-money'
import { meta as stampGameTilesMeta, Pages as StampGameTilesPages } from './kits/stamp-game-tiles'
import { meta as hundredBoardTilesMeta, Pages as HundredBoardTilesPages } from './kits/hundred-board-tiles'
import { meta as stripBoardsMeta, Pages as StripBoardsPages } from './kits/strip-boards'
import { meta as paperFractionCirclesMeta, Pages as PaperFractionCirclesPages } from './kits/paper-fraction-circles'

/** Every make-it-yourself kit on the site. */
export const KITS: KitDef[] = [
  { ...largeNumberCardsMeta, Pages: LargeNumberCardsPages },
  { ...goldenBeadCardsMeta, Pages: GoldenBeadCardsPages },
  { ...playMoneyMeta, Pages: PlayMoneyPages },
  { ...stampGameTilesMeta, Pages: StampGameTilesPages },
  { ...hundredBoardTilesMeta, Pages: HundredBoardTilesPages },
  { ...stripBoardsMeta, Pages: StripBoardsPages },
  { ...paperFractionCirclesMeta, Pages: PaperFractionCirclesPages },
]

export function kitBySlug(slug: string): KitDef | undefined {
  return KITS.find((k) => k.slug === slug)
}

export function kitsForMaterial(slug: string): KitDef[] {
  return KITS.filter((k) => k.forMaterials.includes(slug))
}
