import type { CSSProperties, ReactNode } from 'react'
import type { KitMeta } from '../types'
import { SheetPage } from '../../worksheets/SheetPage'
import { KitCover } from '../pieces'
import { BOARD_COLUMNS, RED_LINE_AFTER } from '../../materials/addition-strip-board/model'

export const meta: KitMeta = {
  slug: 'strip-boards',
  name: 'Addition & Subtraction Strip Boards',
  description:
    'Both fact-memorization strip boards at true size — each board tapes together from two halves, with the full set of blue, red, and natural strips.',
  forMaterials: ['addition-strip-board', 'subtraction-strip-board'],
  pieces: '2 boards (2 pages each, taped) + 35 strips (9 blue, 9 red, 17 natural)',
  assembly: [
    'Print all pages on cardstock at 100% scale; check the 1-inch square on page 1.',
    'Cut each board half out along its edge, then tape the two halves together on the marked join edge so the numbers run 1–18.',
    'Cut out the strips along their colored frames. Natural strips 16 and 17 print in two parts — tape each pair end to end at the ⇢ mark.',
    'Strip lengths are exact: blue strip 9 laid from column 1 must end exactly under the 9. If it doesn’t, re-check your print scale.',
  ],
}

export const STRIP_UNIT_IN = 0.5

export function stripWidthIn(n: number): number {
  return n * STRIP_UNIT_IN
}

/** Strips longer than 15 units (7.5in printable width) print in two taped segments. */
export function naturalSegments(n: number): number[] {
  return n <= 15 ? [n] : [9, n - 9]
}

const WORKING_ROWS = 12
const HALF_COLS = BOARD_COLUMNS / 2 // 9 columns per printed half

/** One printed half of a board: a header row of numerals over blank working squares. */
function BoardHalf({ columns, headColor }: { columns: number[]; headColor: (col: number) => string }) {
  return (
    <div className="kit-board" style={{ gridTemplateColumns: `repeat(${HALF_COLS}, 0.5in)` }}>
      {columns.map((col) => (
        <div
          key={`h${col}`}
          className={`kit-board-head${col === RED_LINE_AFTER ? ' kit-tenline' : ''}`}
          style={{ color: headColor(col) }}
        >
          {col}
        </div>
      ))}
      {Array.from({ length: WORKING_ROWS }, (_, row) =>
        columns.map((col) => (
          <div key={`${row}-${col}`} className={`kit-board-square${col === RED_LINE_AFTER ? ' kit-tenline' : ''}`} />
        )),
      )}
    </div>
  )
}

function Strip({
  n,
  colorVar,
  tag,
  natural,
  divided,
  label,
}: {
  n: number
  colorVar: string
  tag: string
  natural?: boolean
  divided?: boolean
  label?: ReactNode
}) {
  return (
    <div
      className={`kit-strip${natural ? ' kit-strip-natural' : ''}`}
      style={{ width: `${stripWidthIn(n)}in`, '--strip-color': colorVar } as CSSProperties}
    >
      <span className="kit-bw-tag">{tag}</span>
      {divided && (
        <div className="kit-strip-segs">
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className="kit-strip-seg" />
          ))}
        </div>
      )}
      {label ?? n}
    </div>
  )
}

const LEFT_COLS = Array.from({ length: HALF_COLS }, (_, i) => i + 1)
const RIGHT_COLS = Array.from({ length: HALF_COLS }, (_, i) => i + 1 + HALF_COLS)

// Header colors follow the virtual materials: addition 1–10 red / 11–18 blue;
// subtraction 1–9 blue / 10–18 red.
const additionHead = (col: number) => (col <= RED_LINE_AFTER ? 'var(--pv-hundred)' : 'var(--pv-ten)')
const subtractionHead = (col: number) => (col <= 9 ? 'var(--pv-ten)' : 'var(--pv-hundred)')

const BOARD_PAGES = [
  { title: 'Addition Board — left half (columns 1–9)', columns: LEFT_COLS, head: additionHead, edge: 'right' },
  { title: 'Addition Board — right half (columns 10–18)', columns: RIGHT_COLS, head: additionHead, edge: 'left' },
  { title: 'Subtraction Board — left half (columns 1–9)', columns: LEFT_COLS, head: subtractionHead, edge: 'right' },
  { title: 'Subtraction Board — right half (columns 10–18)', columns: RIGHT_COLS, head: subtractionHead, edge: 'left' },
] as const

const NATURAL_LENGTHS_LONG = [10, 11, 12, 13, 14, 15, 16, 17]

export function Pages() {
  return (
    <>
      <KitCover kit={meta} />
      {BOARD_PAGES.map((p) => (
        <SheetPage key={p.title} title={p.title} nameDate={false}>
          <p className="kit-note">Cut along the board’s {p.edge} edge and tape it to the other half of this board.</p>
          <BoardHalf columns={[...p.columns]} headColor={p.head} />
        </SheetPage>
      ))}
      <SheetPage title="Blue Strips 1–9" nameDate={false}>
        <div className="kit-strip-row">
          {Array.from({ length: 9 }, (_, i) => (
            <Strip key={i} n={i + 1} colorVar="var(--pv-ten)" tag="B" />
          ))}
        </div>
      </SheetPage>
      <SheetPage title="Red Strips 1–9" nameDate={false}>
        <div className="kit-strip-row">
          {Array.from({ length: 9 }, (_, i) => (
            <Strip key={i} n={i + 1} colorVar="var(--pv-hundred)" tag="R" divided />
          ))}
        </div>
      </SheetPage>
      <SheetPage title="Natural Strips 1–9" nameDate={false}>
        <div className="kit-strip-row">
          {Array.from({ length: 9 }, (_, i) => (
            <Strip key={i} n={i + 1} colorVar="var(--wood-dark)" tag="N" natural />
          ))}
        </div>
      </SheetPage>
      <SheetPage title="Natural Strips 10–17" nameDate={false}>
        <div className="kit-strip-row">
          {NATURAL_LENGTHS_LONG.flatMap((n) => {
            const segments = naturalSegments(n)
            return segments.map((seg, j) => (
              <Strip
                key={`${n}-${j}`}
                n={seg}
                colorVar="var(--wood-dark)"
                tag="N"
                natural
                label={segments.length === 1 ? n : `${n} — part ${j + 1} of 2 ${j === 0 ? 'tape ⇢' : '⇠ tape'}`}
              />
            ))
          })}
        </div>
      </SheetPage>
    </>
  )
}
