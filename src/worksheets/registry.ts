import type { AnyGeneratorDef } from './types'

/** Every worksheet generator on the site. */
export const GENERATORS: AnyGeneratorDef[] = []

export function generatorBySlug(slug: string): AnyGeneratorDef | undefined {
  return GENERATORS.find((g) => g.slug === slug)
}
