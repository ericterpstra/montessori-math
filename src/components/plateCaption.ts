/** The surfaces a MaterialShell can lay a material on. */
export type MatSurface = 'felt' | 'wood' | 'paper'

/** How each surface reads in a plate caption. */
export const MAT_PHRASE: Record<MatSurface, string> = {
  felt: 'on the felt work mat',
  wood: 'on the wooden table',
  paper: 'on paper',
}

/**
 * The words after "Plate." under a material's stage:
 * plateCaption('Stamp Game', 'wood') → 'Stamp Game, on the wooden table.'
 * Without a name (a shell outside a material page) the phrase stands alone:
 * plateCaption(null, 'felt') → 'On the felt work mat.'
 */
export function plateCaption(name: string | null, mat: MatSurface): string {
  const phrase = MAT_PHRASE[mat]
  const trimmed = name?.trim()
  return trimmed ? `${trimmed}, ${phrase}.` : `${phrase[0].toUpperCase()}${phrase.slice(1)}.`
}
