import type { MaterialDef } from './types'

/**
 * Every virtual material on the site. Each entry's component lives in
 * src/materials/<slug>/ — one folder per material.
 */
export const MATERIALS: MaterialDef[] = []

export function materialBySlug(slug: string): MaterialDef | undefined {
  return MATERIALS.find((m) => m.slug === slug)
}
