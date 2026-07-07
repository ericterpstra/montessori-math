import type { CSSProperties } from 'react'
import type { KitMeta } from '../types'
import { SheetPage } from '../../worksheets/SheetPage'
import { KitCover } from '../pieces'

export const meta: KitMeta = {
  slug: 'stamp-game-tiles',
  name: 'Stamp Game Tiles',
  description: 'Sheets of 1-inch stamp tiles in place-value colors — cut a full stamp game from four pages.',
  forMaterials: ['stamp-game'],
  pieces: '192 tiles (48 each of 1, 10, 100, and 1,000)',
  assembly: [
    'Print all pages on cardstock at 100% scale; check the 1-inch square on page 1.',
    'Optional but recommended: laminate the sheets before cutting so the tiles survive small hands.',
    'Cut out the tiles with scissors or a paper cutter, following the colored frames.',
    'Sort into four small cups or bowls: green 1s, blue 10s, red 100s, green 1,000s — exactly as the stamp game lesson lays them out.',
  ],
}

export const STAMP_PLACES = [
  { value: 1, label: 'Units', tag: 'U', colorVar: 'var(--pv-unit)' },
  { value: 10, label: 'Tens', tag: 'T', colorVar: 'var(--pv-ten)' },
  { value: 100, label: 'Hundreds', tag: 'H', colorVar: 'var(--pv-hundred)' },
  { value: 1000, label: 'Thousands', tag: 'Th', colorVar: 'var(--pv-thousand)' },
] as const
export const TILES_PER_PAGE = 48 // 6 columns × 8 rows of 1in tiles + 0.08in gaps = 6.4in × 8.56in

export function Pages() {
  return (
    <>
      <KitCover kit={meta} />
      {STAMP_PLACES.map((p) => (
        <SheetPage key={p.value} title={`Stamp Game Tiles — ${p.label} (${p.value})`} nameDate={false}>
          <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(6, 1in)' }}>
            {Array.from({ length: TILES_PER_PAGE }, (_, i) => (
              <div key={i} className="kit-stamp-tile" style={{ '--stamp-color': p.colorVar } as CSSProperties}>
                <span className="kit-bw-tag">{p.tag}</span>
                {p.value}
              </div>
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}
