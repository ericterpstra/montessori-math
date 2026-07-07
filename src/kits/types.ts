import type { ComponentType } from 'react'

export interface KitDef {
  slug: string
  name: string
  description: string
  /** Material slugs (src/materials/registry.ts) this kit builds the physical version of. */
  forMaterials: string[]
  /** Piece inventory, e.g. '36 number cards'. */
  pieces: string
  /** Numbered assembly steps incl. cardstock/scissors/laminate advice. */
  assembly: string[]
  /** Renders 1..n `.sheet-page` elements inside the caller's `.print-sheet`. */
  Pages: ComponentType
}

export type KitMeta = Omit<KitDef, 'Pages'>
