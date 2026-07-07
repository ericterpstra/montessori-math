import type { CSSProperties } from 'react'
import type { KitMeta } from '../types'
import { SheetPage } from '../../worksheets/SheetPage'
import { KitCover } from '../pieces'
import { cardColor } from '../../components/NumberCard'

export const meta: KitMeta = {
  slug: 'large-number-cards',
  name: 'Large Number Cards',
  description:
    'The full set of large number cards, 1 through 9,000, at true physical size — card width grows with each place so the cards stack to compose numbers.',
  forMaterials: ['number-cards', 'golden-beads'],
  pieces: '36 number cards (1–9,000)',
  assembly: [
    'Print all pages on cardstock at 100% scale; check the 1-inch square on page 1.',
    'Cut each card out along the dashed lines — the widths matter, so cut carefully on the line.',
    'Sort into four stacks by color: green units, blue tens, red hundreds, green thousands.',
    'To compose a number, stack the cards right-aligned: 3,000 + 200 + 50 + 1 laid on top of each other reads 3251, exactly as with the classroom material.',
  ],
}

/** All 36 card values, ascending: 1–9, 10–90, 100–900, 1000–9000. */
export const CARD_VALUES: number[] = [1, 10, 100, 1000].flatMap((m) =>
  Array.from({ length: 9 }, (_, i) => (i + 1) * m),
)

/** Card width in inches: 1.5in per digit, so stacked cards compose place by place. */
export function cardWidthIn(value: number): number {
  return String(value).length * 1.5
}

export const CARD_HEIGHT_IN = 1.9

/** Page manifest — every card exactly once, sized to fit 7.5in × 10in printable area. */
export const PAGES: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9], // 3×3 grid, 1.5in wide cards
  [10, 20, 30, 40, 50, 60, 70, 80], // 2×4 grid, 3in wide
  [90, 100, 200, 300], // stacked 1/row, ≤4.5in wide
  [400, 500, 600, 700],
  [800, 900, 1000, 2000], // 1000+ are 6in wide
  [3000, 4000, 5000, 6000],
  [7000, 8000, 9000],
]

const BW_TAGS = ['U', 'T', 'H', 'Th'] as const

function bwTag(value: number): string {
  return BW_TAGS[String(value).length - 1]
}

function Card({ value }: { value: number }) {
  return (
    <div
      className="kit-number-card kit-cut"
      style={{ width: `${cardWidthIn(value)}in`, '--card-color': cardColor(value) } as CSSProperties}
    >
      <span className="kit-bw-tag">{bwTag(value)}</span>
      {value}
    </div>
  )
}

export function Pages() {
  return (
    <>
      <KitCover kit={meta} />
      {PAGES.map((page, i) => {
        const cols = page.length === 9 ? 3 : page.length === 8 ? 2 : 1
        return (
          <SheetPage key={i} title={`Large Number Cards — ${page[0]} to ${page[page.length - 1]}`} nameDate={false}>
            <div className="kit-grid" style={{ gridTemplateColumns: `repeat(${cols}, max-content)` }}>
              {page.map((v) => (
                <Card key={v} value={v} />
              ))}
            </div>
          </SheetPage>
        )
      })}
    </>
  )
}
