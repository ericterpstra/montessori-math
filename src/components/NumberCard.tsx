import type { CSSProperties, MouseEventHandler } from 'react'

/**
 * A large number card. As with the real material, a card's width is
 * proportional to its digit count so cards stack to compose numbers
 * (3000 + 200 + 50 + 1 stacked reads 3251), and the numeral is printed
 * in its place color (units green, tens blue, hundreds red, thousands green).
 */

function cardColor(value: number): string {
  const digits = String(value).length
  switch ((digits - 1) % 3) {
    case 1:
      return 'var(--pv-ten)'
    case 2:
      return 'var(--pv-hundred)'
    default:
      return 'var(--pv-unit)'
  }
}

export interface NumberCardProps {
  value: number
  /** Card height in px; width follows digit count. */
  height?: number
  onClick?: MouseEventHandler<HTMLButtonElement>
  selected?: boolean
  className?: string
  asDiv?: boolean
}

export function NumberCard({ value, height = 56, onClick, selected, className, asDiv }: NumberCardProps) {
  const digits = String(value).length
  const style = {
    '--card-color': cardColor(value),
    height,
    width: Math.round(height * 0.62 * digits),
    fontSize: height * 0.5,
  } as CSSProperties
  const cls = `number-card${selected ? ' selected' : ''}${className ? ` ${className}` : ''}`
  if (asDiv || !onClick) {
    return (
      <div className={cls} style={style}>
        {value}
      </div>
    )
  }
  return (
    <button type="button" className={cls} style={style} onClick={onClick} aria-pressed={selected} aria-label={`number card ${value}`}>
      {value}
    </button>
  )
}
