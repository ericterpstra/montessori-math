import { createContext, useContext } from 'react'

/**
 * Optional decorative worksheet header themes. Pure delight: aria-hidden,
 * drawn in currentColor at 50% opacity (grayscale-safe by construction),
 * student pages only — AnswerKeyPage always forces 'none'. No information
 * may ever ride on these decorations.
 */
export const SHEET_THEMES = ['none', 'space', 'baking', 'dinos'] as const
export type SheetTheme = (typeof SHEET_THEMES)[number]

export const THEME_LABELS: Record<SheetTheme, string> = {
  none: 'None',
  space: 'Space',
  baking: 'Baking',
  dinos: 'Dinosaurs',
}

/** Type guard for validating the ?theme= URL param. */
export function isSheetTheme(value: string | null): value is SheetTheme {
  return SHEET_THEMES.includes(value as SheetTheme)
}

/** Defaults to 'none' so every SheetPage outside a provider is unchanged. */
export const ThemeContext = createContext<SheetTheme>('none')

export function useSheetTheme(): SheetTheme {
  // Generator tests walk element trees by invoking components as plain
  // functions (no React renderer, so no hook dispatcher). Degrade to the
  // context default there instead of crashing SheetPage for every sheet.
  try {
    return useContext(ThemeContext)
  } catch {
    return 'none'
  }
}

/* Motifs are flat one-color silhouettes. Group opacity (not per-shape
   opacity) keeps overlapping shapes a single uniform tint. */

function SpaceMotif() {
  return (
    <>
      <path d="M8 2 L9.2 6.8 L14 8 L9.2 9.2 L8 14 L6.8 9.2 L2 8 L6.8 6.8 Z" />
      <path d="M30 4 L30.8 7.2 L34 8 L30.8 8.8 L30 12 L29.2 8.8 L26 8 L29.2 7.2 Z" />
      <path d="M14 16 L14.6 18.4 L17 19 L14.6 19.6 L14 22 L13.4 19.6 L11 19 L13.4 18.4 Z" />
      <circle cx={25} cy={28} r={7} />
      <ellipse cx={25} cy={28} rx={12} ry={3.5} fill="none" stroke="currentColor" strokeWidth={1.5} transform="rotate(-18 25 28)" />
    </>
  )
}

function BakingMotif() {
  return (
    <>
      <circle cx={14.5} cy={17} r={5} />
      <circle cx={20} cy={13.5} r={6} />
      <circle cx={25.5} cy={17} r={5} />
      <rect x={11} y={16} width={18} height={6} />
      <circle cx={20} cy={6.5} r={2.4} />
      <path d="M11 22 L29 22 L25.5 37 L14.5 37 Z" />
    </>
  )
}

function DinoMotif() {
  return (
    <>
      <ellipse cx={22} cy={26} rx={11} ry={6.5} />
      <ellipse cx={30} cy={24} rx={5.5} ry={4.5} />
      <ellipse cx={7.5} cy={8} rx={3.4} ry={2.5} />
      <path d="M6 9.5 C 8 15, 10.5 20, 15 24.5 L 20 27 L 12.5 27.5 C 9.5 21.5, 7.5 15.5, 4.5 10.5 Z" />
      <path d="M31 22.5 C 35 24, 37.5 26.5, 39.5 30.5 C 35.5 29.5, 32.5 28.5, 29.5 27.5 Z" />
      <rect x={15} y={30} width={3.4} height={8} rx={1.5} />
      <rect x={25} y={30} width={3.4} height={8} rx={1.5} />
    </>
  )
}

export function ThemeDecoration({ theme, side }: { theme: SheetTheme; side: 'left' | 'right' }) {
  if (theme === 'none') return null
  return (
    <svg
      className={`sheet-theme-art sheet-theme-${side}`}
      width={40}
      height={40}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <g fill="currentColor" opacity={0.5} transform={side === 'right' ? 'translate(40 0) scale(-1 1)' : undefined}>
        {theme === 'space' && <SpaceMotif />}
        {theme === 'baking' && <BakingMotif />}
        {theme === 'dinos' && <DinoMotif />}
      </g>
    </svg>
  )
}
