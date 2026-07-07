import type { KitMeta } from '../types'
import { SheetPage } from '../../worksheets/SheetPage'
import { KitCover } from '../pieces'

export const meta: KitMeta = {
  slug: 'paper-fraction-circles',
  name: 'Paper Fraction Circles',
  description:
    'Ten labeled fraction circles — the whole through tenths — each inside a green frame ring, ready to cut into sectors.',
  forMaterials: ['fraction-circles'],
  pieces: '10 circles (whole through tenths) → 55 sectors, with frame rings',
  assembly: [
    'Print all pages at 100% scale; check the 1-inch square on page 1.',
    'Glue each sheet to cardstock before cutting anything — floppy paper sectors are no fun to work with.',
    'Cut out each disc just inside its green ring, then cut the sectors apart along the black division lines.',
    'Leave the green rings on the sheet: they are the frames. The child rebuilds each circle inside its ring, labels facing up.',
  ],
}

/** The ten circle families: 1 (the whole) through 10 (tenths). Mirrors DENOMINATORS in the fraction-circles model. */
export const CIRCLE_FAMILIES: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const CX = 100
const CY = 100
const SECTOR_R = 88
const LABEL_R = 55

function polar(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [Math.round((CX + r * Math.cos(rad)) * 100) / 100, Math.round((CY + r * Math.sin(rad)) * 100) / 100]
}

/** SVG path for sector i (0-based) of a circle cut into n equal sectors. */
export function sectorPath(i: number, n: number): string {
  const startDeg = (i * 360) / n - 90
  const endDeg = ((i + 1) * 360) / n - 90
  const [x1, y1] = polar(SECTOR_R, startDeg)
  const [x2, y2] = polar(SECTOR_R, endDeg)
  return `M ${CX} ${CY} L ${x1} ${y1} A ${SECTOR_R} ${SECTOR_R} 0 0 1 ${x2} ${y2} Z`
}

function FractionCircle({ n }: { n: number }) {
  return (
    <svg width="3.7in" height="3.7in" viewBox="0 0 200 200" role="img" aria-label={n === 1 ? 'whole circle' : `circle cut into ${n} sectors`}>
      <circle cx={CX} cy={CY} r={96} className="kit-frame-ring" />
      <circle cx={CX} cy={CY} r={91} className="kit-cut-circle" />
      {n === 1 ? (
        <>
          <circle cx={CX} cy={CY} r={SECTOR_R} className="kit-sector" />
          <text x={CX} y={CY + 5} className="kit-sector-label">
            1
          </text>
        </>
      ) : (
        <>
          {Array.from({ length: n }, (_, i) => (
            <path key={i} d={sectorPath(i, n)} className="kit-sector" />
          ))}
          {Array.from({ length: n }, (_, i) => {
            const midDeg = ((i + 0.5) * 360) / n - 90
            const [lx, ly] = polar(LABEL_R, midDeg)
            return (
              <text key={i} x={lx} y={ly + 4} className="kit-sector-label">
                1/{n}
              </text>
            )
          })}
        </>
      )}
    </svg>
  )
}

const CIRCLE_PAGES: number[][] = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10],
]

export function Pages() {
  return (
    <>
      <KitCover kit={meta} />
      {CIRCLE_PAGES.map((families, i) => (
        <SheetPage
          key={i}
          title={`Paper Fraction Circles — ${families[0] === 1 ? 'whole' : `1/${families[0]}`} to 1/${families[families.length - 1]}`}
          nameDate={false}
        >
          <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(2, 3.7in)' }}>
            {families.map((n) => (
              <FractionCircle key={n} n={n} />
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}
