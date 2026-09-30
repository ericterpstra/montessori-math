import { createContext } from 'react'

/**
 * The display name of the material on the current page (e.g. 'Golden Beads & Mat').
 * MaterialPage provides it; MaterialShell reads it to caption the plate
 * ("Plate. Golden Beads & Mat, on the felt work mat."). Material components
 * never read it. Null outside a material page.
 */
export const MaterialNameContext = createContext<string | null>(null)
