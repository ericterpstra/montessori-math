import type { KitMeta } from '../types'
import { SheetPage } from '../../worksheets/SheetPage'
import { KitCover } from '../pieces'
import { ALL_TILES } from '../../materials/hundred-board/model'

export const meta: KitMeta = {
  slug: 'hundred-board-tiles',
  name: 'Hundred Board & Tiles',
  description:
    'One hundred numbered tiles plus a blank 10×10 board that tapes together from two halves — the child builds 1 to 100 tile by tile.',
  forMaterials: ['hundred-board'],
  pieces: '100 numbered tiles + a fold-out board on 2 pages',
  assembly: [
    'Print all pages on cardstock at 100% scale; check the 1-inch square on page 1.',
    'Laminate the tile pages before cutting — a hundred small tiles take a lot of handling.',
    'Cut the 100 tiles apart along the dashed lines.',
    'Cut out the two board halves and tape them together on the marked join edge into one 10×10 board. The cells are slightly larger than the tiles, so tiles sit loosely inside, like the real board.',
    'Print the hundred chart worksheet (/worksheets/hundred-chart) once, whole, as the control chart the child checks against.',
  ],
}

/** Tile values 1–100 — the same inventory as the virtual material. */
export const TILE_VALUES: number[] = [...ALL_TILES]

const BOARD_ROWS = 10
const BOARD_HALF_COLS = 5

function TileGrid({ values }: { values: number[] }) {
  return (
    <div className="kit-grid" style={{ gridTemplateColumns: 'repeat(9, 0.75in)' }}>
      {values.map((v) => (
        <div key={v} className="kit-hb-tile kit-cut">
          {v}
        </div>
      ))}
    </div>
  )
}

function BoardHalf({ edge }: { edge: 'right' | 'left' }) {
  return (
    <>
      <p className="kit-note">Cut along the board’s {edge} edge and tape it to the other half to complete the 10×10 board.</p>
      <div className="kit-board" style={{ gridTemplateColumns: `repeat(${BOARD_HALF_COLS}, 0.8in)` }}>
        {Array.from({ length: BOARD_ROWS * BOARD_HALF_COLS }, (_, i) => (
          <div key={i} className="kit-board-cell" />
        ))}
      </div>
    </>
  )
}

export function Pages() {
  return (
    <>
      <KitCover kit={meta} />
      <SheetPage title="Hundred Board Tiles — 1 to 54" nameDate={false}>
        <TileGrid values={TILE_VALUES.slice(0, 54)} />
      </SheetPage>
      <SheetPage title="Hundred Board Tiles — 55 to 100" nameDate={false}>
        <TileGrid values={TILE_VALUES.slice(54)} />
      </SheetPage>
      <SheetPage title="Hundred Board — left half (columns 1–5)" nameDate={false}>
        <BoardHalf edge="right" />
      </SheetPage>
      <SheetPage title="Hundred Board — right half (columns 6–10)" nameDate={false}>
        <BoardHalf edge="left" />
      </SheetPage>
    </>
  )
}
