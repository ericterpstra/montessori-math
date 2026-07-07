/**
 * Shared bead-material primitives. All colors come from CSS variables so the
 * `.bw` print mode and theming work everywhere. Every component accepts
 * `className` and renders a self-contained <svg>.
 */

/** Colored bead stair colors, indexed 1–10 (10 = golden). Index 0 unused. */
export const BEAD_STAIR_VARS: readonly string[] = [
  '',
  'var(--bead-1)',
  'var(--bead-2)',
  'var(--bead-3)',
  'var(--bead-4)',
  'var(--bead-5)',
  'var(--bead-6)',
  'var(--bead-7)',
  'var(--bead-8)',
  'var(--bead-9)',
  'var(--bead-10)',
]

/* Strong enough that light beads (the white 7-bar) keep a visible rim in print. */
const BEAD_STROKE = 'rgba(0,0,0,0.55)'

interface BeadShapeProps {
  cx: number
  cy: number
  r: number
  fill: string
}

/** Low-level bead for composing custom SVG scenes: circle + shading. */
export function BeadShape({ cx, cy, r, fill }: BeadShapeProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={BEAD_STROKE} strokeWidth={Math.max(0.6, r * 0.09)} />
      <ellipse cx={cx + r * 0.28} cy={cy + r * 0.32} rx={r * 0.45} ry={r * 0.32} fill="#000" opacity={0.14} />
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.35} rx={r * 0.38} ry={r * 0.26} fill="#fff" opacity={0.4} />
    </g>
  )
}

export interface BeadProps {
  /** Diameter in px. */
  size?: number
  fill?: string
  className?: string
  title?: string
}

/** A single bead (defaults to a golden unit bead). */
export function Bead({ size = 18, fill = 'var(--golden)', className, title }: BeadProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <BeadShape cx={10} cy={10} r={9} fill={fill} />
    </svg>
  )
}

export interface BeadBarProps {
  /** Number of beads, 1–10. */
  n: number
  /** Defaults to the authentic bead-stair color for n (10 = golden). */
  fill?: string
  /** Bead diameter in px. */
  beadSize?: number
  vertical?: boolean
  className?: string
  title?: string
}

/** A bar of n beads threaded on a wire, like the colored bead stair / golden ten-bar. */
export function BeadBar({ n, fill, beadSize = 18, vertical = false, className, title }: BeadBarProps) {
  const color = fill ?? BEAD_STAIR_VARS[n] ?? 'var(--golden)'
  const u = 20
  const length = n * u
  const viewBox = vertical ? `0 0 ${u} ${length}` : `0 0 ${length} ${u}`
  const width = vertical ? beadSize : (beadSize / u) * length
  const height = vertical ? (beadSize / u) * length : beadSize
  return (
    <svg width={width} height={height} viewBox={viewBox} className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {vertical ? (
        <line x1={u / 2} y1={4} x2={u / 2} y2={length - 4} stroke="#9a9a9a" strokeWidth={1.5} />
      ) : (
        <line x1={4} y1={u / 2} x2={length - 4} y2={u / 2} stroke="#9a9a9a" strokeWidth={1.5} />
      )}
      {Array.from({ length: n }, (_, i) =>
        vertical ? (
          <BeadShape key={i} cx={u / 2} cy={i * u + u / 2} r={9} fill={color} />
        ) : (
          <BeadShape key={i} cx={i * u + u / 2} cy={u / 2} r={9} fill={color} />
        ),
      )}
    </svg>
  )
}

/** Golden ten-bar. */
export function TenBar(props: Omit<BeadBarProps, 'n' | 'fill'>) {
  return <BeadBar n={10} fill="var(--golden)" {...props} />
}

export interface HundredSquareProps {
  /** Side length in px. */
  size?: number
  className?: string
  title?: string
}

/** Golden hundred-square: 10×10 beads. */
export function HundredSquare({ size = 96, className, title }: HundredSquareProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <rect x={0.5} y={0.5} width={99} height={99} rx={3} fill="var(--golden-light)" opacity={0.35} stroke="var(--golden-dark)" strokeWidth={1} />
      {Array.from({ length: 100 }, (_, i) => {
        const col = i % 10
        const row = Math.floor(i / 10)
        return <circle key={i} cx={col * 10 + 5} cy={row * 10 + 5} r={4} fill="var(--golden)" stroke={BEAD_STROKE} strokeWidth={0.4} />
      })}
    </svg>
  )
}

export interface ThousandCubeProps {
  /** Width in px (height is ~1.16×). */
  size?: number
  className?: string
  title?: string
}

/** Golden thousand-cube drawn with simple isometric depth. */
export function ThousandCube({ size = 110, className, title }: ThousandCubeProps) {
  const d = 24 // depth offset in viewBox units
  return (
    <svg
      width={size}
      height={(size * (100 + d)) / (100 + d)}
      viewBox={`0 0 ${100 + d} ${100 + d}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      {/* top face */}
      <polygon points={`${d},0 ${100 + d},0 100,${d} 0,${d}`} fill="var(--golden-light)" stroke="var(--golden-dark)" strokeWidth={1} />
      {/* side face */}
      <polygon points={`${100 + d},0 ${100 + d},100 100,${100 + d} 100,${d}`} fill="var(--golden-dark)" stroke="var(--golden-dark)" strokeWidth={1} />
      {/* front face with beads */}
      <rect x={0} y={d} width={100} height={100} fill="var(--golden-light)" opacity={0.9} stroke="var(--golden-dark)" strokeWidth={1} />
      {Array.from({ length: 100 }, (_, i) => {
        const col = i % 10
        const row = Math.floor(i / 10)
        return <circle key={i} cx={col * 10 + 5} cy={d + row * 10 + 5} r={4} fill="var(--golden)" stroke={BEAD_STROKE} strokeWidth={0.4} />
      })}
    </svg>
  )
}

export interface SkittleProps {
  /** Height in px. */
  height?: number
  fill?: string
  className?: string
  title?: string
}

/**
 * A skittle (the little wooden pin that stands for one share in division),
 * drawn as a simple peg-doll: round head, waisted body, wide steady base —
 * a silhouette that stays readable even at very small sizes.
 */
export function Skittle({ height = 48, fill = 'var(--pv-unit)', className, title }: SkittleProps) {
  const width = (height * 24) / 48
  return (
    <svg width={width} height={height} viewBox="0 0 24 48" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path
        d="M12 14.5
           C 9.6 14.5, 8.4 16.2, 8.7 18.6
           C 8.95 20.6, 8.9 22.3, 8 24.6
           C 6.3 28.9, 5.4 33.6, 5.4 38.4
           L 5.4 41.2
           C 5.4 44.3, 7.8 45.8, 12 45.8
           C 16.2 45.8, 18.6 44.3, 18.6 41.2
           L 18.6 38.4
           C 18.6 33.6, 17.7 28.9, 16 24.6
           C 15.1 22.3, 15.05 20.6, 15.3 18.6
           C 15.6 16.2, 14.4 14.5, 12 14.5 Z"
        fill={fill}
        stroke={BEAD_STROKE}
        strokeWidth={0.9}
        strokeLinejoin="round"
      />
      <circle cx={12} cy={8.6} r={6.4} fill={fill} stroke={BEAD_STROKE} strokeWidth={0.9} />
      <ellipse cx={9.8} cy={6.6} rx={2.4} ry={1.8} fill="#fff" opacity={0.45} />
    </svg>
  )
}
