import type { ReactElement } from 'react'

/**
 * The site's line-icon set (PRD 19 "The Album"): a 24-unit grid, 2px round
 * stroke, drawn in currentColor so an icon always matches its label's colour.
 *
 * Icons are decorative: the <svg> is aria-hidden and never focusable, so a
 * control that shows one must keep its text (visible, or visually hidden with
 * .visually-hidden / .btn-label) as its accessible name. Never use an emoji
 * as an icon; Icon.test.ts fails the build if one appears in src/.
 */
export const ICON_NAMES = [
  'print',
  'refresh',
  'sound',
  'sound-off',
  'focus',
  'close',
  'play',
  'book',
  'pencil',
  'scissors',
  'link',
  'help',
  'chevron',
  'arrow',
] as const

export type IconName = (typeof ICON_NAMES)[number]

const GLYPHS: Record<IconName, ReactElement> = {
  print: (
    <>
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <rect x="6.5" y="14" width="11" height="7" rx="1" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4v5h-5" />
    </>
  ),
  sound: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M18.8 6.2a8 8 0 0 1 0 11.6" />
    </>
  ),
  'sound-off': (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
    </>
  ),
  focus: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  play: <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />,
  book: (
    <>
      <path d="M2.5 5.5c3-1.6 6.5-1.6 9.5.8v13c-3-2.3-6.5-2.3-9.5-.8z" />
      <path d="M21.5 5.5c-3-1.6-6.5-1.6-9.5.8v13c3-2.3 6.5-2.3 9.5-.8z" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20l1.2-4.8L16 4.4a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L8.8 18.8z" />
      <path d="M14 6.5l3.5 3.5" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.5 8.5L20 20M8.5 15.5L20 4" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.7.3-1.2 1-1.2 1.7v.4" />
      <path d="M12 17h.01" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
}

/**
 * Just the drawing, for composing inside another SVG (e.g. the kit plate in
 * MaterialThumb draws the scissors in its own <g> with its own stroke).
 */
export function IconGlyph({ name }: { name: IconName }) {
  return GLYPHS[name]
}

export interface IconProps {
  name: IconName
  /** Rendered width and height in px; the drawing always uses the 24-unit grid. */
  size?: number
  /** Extra classes after `icon` (e.g. `row-arrow`). */
  className?: string
}

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  )
}
