import type { CSSProperties, MouseEventHandler } from 'react'

export type StampValue = 1 | 10 | 100 | 1000

const STAMP_COLOR: Record<StampValue, string> = {
  1: 'var(--pv-unit)',
  10: 'var(--pv-ten)',
  100: 'var(--pv-hundred)',
  1000: 'var(--pv-thousand)',
}

export interface StampTileProps {
  value: StampValue
  /** Side length in px. */
  size?: number
  selected?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  /** Render as a non-interactive tile (e.g. inside a worksheet). */
  asDiv?: boolean
}

/** One stamp-game tile: a colored square printed with its value. */
export function StampTile({ value, size = 44, selected, onClick, className, asDiv }: StampTileProps) {
  const style = {
    '--stamp-color': STAMP_COLOR[value],
    width: size,
    height: size,
    fontSize: size * (value >= 1000 ? 0.26 : value >= 100 ? 0.3 : 0.36),
  } as CSSProperties
  const cls = `stamp-tile${selected ? ' selected' : ''}${className ? ` ${className}` : ''}`
  if (asDiv) {
    return (
      <div className={cls} style={style}>
        {value}
      </div>
    )
  }
  return (
    <button type="button" className={cls} style={style} onClick={onClick} aria-pressed={selected} aria-label={`${value} stamp`}>
      {value}
    </button>
  )
}
