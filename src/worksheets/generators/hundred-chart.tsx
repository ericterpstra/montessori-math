import type { RNG } from '../../lib/rng'
import type { GeneratorDef, SheetProps } from '../types'
import { AnswerKeyPage, SheetPage } from '../SheetPage'
import './hundred-chart.css'

/* ------------------------------------------------------------------
   Hundred chart puzzles.
   Fill mode: one 10×10 chart with a percentage of cells left blank.
   Fragment mode: plus/L/T-shaped cut-out pieces of the chart, each
   with exactly one printed anchor number; the child fills the rest
   using chart geometry (left/right ±1, up/down ±10).
   ------------------------------------------------------------------ */

export type HundredChartMode = 'fill' | 'fragment'

export type HundredChartParams = {
  mode: HundredChartMode
  /** Fill mode: percent of the 100 cells left blank (the count, since the chart has 100 cells). */
  missing: number
  /** Fragment mode: how many cut-out pieces. */
  pieces: number
}

export interface FillCell {
  /** The number that belongs in this cell (cell index + 1). */
  value: number
  /** True if the cell prints empty for the child to fill in. */
  blank: boolean
}

export interface FillData {
  mode: 'fill'
  /** All 100 cells in reading order (index i holds value i + 1). */
  cells: FillCell[]
  /** The blank cells' values, ascending — the answer key. */
  answers: number[]
}

export interface FragmentCell {
  /** Row within the piece's bounding box. */
  r: number
  /** Column within the piece's bounding box. */
  c: number
  /** The chart number that belongs in this cell (the answer). */
  value: number
  /** True for the single printed anchor number. */
  given: boolean
}

export interface FragmentPiece {
  /** Bounding-box height in cells. */
  rows: number
  /** Bounding-box width in cells. */
  cols: number
  /** The printed anchor number. */
  anchor: number
  /** Cells in reading order. */
  cells: FragmentCell[]
}

export interface FragmentsData {
  mode: 'fragment'
  fragments: FragmentPiece[]
}

export type HundredChartData = FillData | FragmentsData

/* ---------- piece shapes (plus / T / L, 4–6 cells, ≤3×3 boxes) ---------- */

interface ShapeDef {
  rows: number
  cols: number
  cells: ReadonlyArray<readonly [number, number]>
}

const SHAPES: readonly ShapeDef[] = [
  // plus (5)
  { rows: 3, cols: 3, cells: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]] },
  // T pointing down (4)
  { rows: 2, cols: 3, cells: [[0, 0], [0, 1], [0, 2], [1, 1]] },
  // T pointing up (4)
  { rows: 2, cols: 3, cells: [[0, 1], [1, 0], [1, 1], [1, 2]] },
  // L (4)
  { rows: 3, cols: 2, cells: [[0, 0], [1, 0], [2, 0], [2, 1]] },
  // J (mirrored L, 4)
  { rows: 3, cols: 2, cells: [[0, 1], [1, 1], [2, 0], [2, 1]] },
  // big L (5)
  { rows: 3, cols: 3, cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]] },
  // big T (5)
  { rows: 3, cols: 3, cells: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]] },
  // thick L / staircase (6)
  { rows: 3, cols: 3, cells: [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2]] },
]

/* ---------- generation (pure; all randomness through rng) ---------- */

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function generateFill(params: HundredChartParams, rng: RNG): FillData {
  // The chart has exactly 100 cells, so `missing` percent IS the blank count.
  const blankCount = clampInt(params.missing, 10, 70)
  const order = rng.shuffle(Array.from({ length: 100 }, (_, i) => i))
  const blankSet = new Set(order.slice(0, blankCount))
  const cells: FillCell[] = Array.from({ length: 100 }, (_, i) => ({
    value: i + 1,
    blank: blankSet.has(i),
  }))
  const answers = [...blankSet].sort((a, b) => a - b).map((i) => i + 1)
  return { mode: 'fill', cells, answers }
}

function generateFragments(params: HundredChartParams, rng: RNG): FragmentsData {
  const count = clampInt(params.pieces, 1, 12)
  const used = new Set<number>()
  const fragments: FragmentPiece[] = []
  for (let i = 0; i < count; i++) {
    // Place a piece fully inside the 10×10 chart; retry to avoid overlapping
    // an earlier piece (the final attempt accepts overlap so generation is total).
    let shape: ShapeDef = SHAPES[0]
    let values: number[] = []
    for (let attempt = 0; attempt < 200; attempt++) {
      shape = rng.pick(SHAPES)
      const row0 = rng.int(0, 10 - shape.rows)
      const col0 = rng.int(0, 10 - shape.cols)
      values = shape.cells.map(([dr, dc]) => (row0 + dr) * 10 + (col0 + dc) + 1)
      if (attempt < 199 && values.some((v) => used.has(v))) continue
      break
    }
    for (const v of values) used.add(v)
    const givenIdx = rng.int(0, shape.cells.length - 1)
    fragments.push({
      rows: shape.rows,
      cols: shape.cols,
      anchor: values[givenIdx],
      cells: shape.cells.map(([r, c], j) => ({ r, c, value: values[j], given: j === givenIdx })),
    })
  }
  return { mode: 'fragment', fragments }
}

function generate(params: HundredChartParams, rng: RNG): HundredChartData {
  return params.mode === 'fragment' ? generateFragments(params, rng) : generateFill(params, rng)
}

/* ---------- rendering ---------- */

function FillChart({ data, mini }: { data: FillData; mini?: boolean }) {
  return (
    <div className={`hundred-chart-grid${mini ? ' hundred-chart-mini' : ''}`}>
      {data.cells.map((cell) => (
        <div key={cell.value} className="hundred-chart-cell">
          {cell.blank ? (
            mini && <span className="hundred-chart-answer">{cell.value}</span>
          ) : (
            <span className="hundred-chart-printed">{cell.value}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function PieceGrid({ piece }: { piece: FragmentPiece }) {
  const byPos = new Map<number, FragmentCell>()
  for (const cell of piece.cells) byPos.set(cell.r * piece.cols + cell.c, cell)
  const boxes = []
  for (let r = 0; r < piece.rows; r++) {
    for (let c = 0; c < piece.cols; c++) {
      const cell = byPos.get(r * piece.cols + c)
      boxes.push(
        cell ? (
          <div key={`${r}-${c}`} className="hundred-chart-piece-cell">
            {cell.given && <span className="hundred-chart-anchor">{cell.value}</span>}
          </div>
        ) : (
          <div key={`${r}-${c}`} className="hundred-chart-piece-void" />
        ),
      )
    }
  }
  return (
    <div
      className="hundred-chart-piece-grid"
      style={{ gridTemplateColumns: `repeat(${piece.cols}, var(--hc-cell))` }}
    >
      {boxes}
    </div>
  )
}

function Sheet({ data }: SheetProps<HundredChartParams, HundredChartData>) {
  if (data.mode === 'fill') {
    return (
      <SheetPage
        title="The Hundred Chart"
        instructions="Fill in the missing numbers to complete the chart. Count on from the numbers already printed."
      >
        <FillChart data={data} />
      </SheetPage>
    )
  }
  return (
    <SheetPage
      title="Hundred Chart Puzzles"
      instructions="Each piece was cut out of the hundred chart. One number is printed on each piece — write in all the others. Moving right adds 1; moving down adds 10."
    >
      <div className="hundred-chart-pieces">
        {data.fragments.map((piece, i) => (
          <div key={i} className="problem hundred-chart-piece">
            <span className="problem-number">{i + 1}.</span>
            <PieceGrid piece={piece} />
          </div>
        ))}
      </div>
    </SheetPage>
  )
}

function AnswerKey({ data }: SheetProps<HundredChartParams, HundredChartData>) {
  if (data.mode === 'fill') {
    return (
      <AnswerKeyPage title="The Hundred Chart">
        <p className="hundred-chart-key-note">Bold numbers are the ones the child fills in.</p>
        <FillChart data={data} mini />
      </AnswerKeyPage>
    )
  }
  return (
    <AnswerKeyPage title="Hundred Chart Puzzles">
      <p className="hundred-chart-key-note">
        Each piece's numbers in reading order; the printed clue is in parentheses.
      </p>
      <ol className="answer-list" style={{ columns: 2 }}>
        {data.fragments.map((piece, i) => (
          <li key={i}>
            {i + 1}.{' '}
            {piece.cells.map((c) => (c.given ? `(${c.value})` : String(c.value))).join(', ')}
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------- generator definition ---------- */

export const def: GeneratorDef<HundredChartParams, HundredChartData> = {
  slug: 'hundred-chart',
  name: 'Hundred Chart Puzzles',
  description:
    'Fill in missing numbers on the hundred chart, or rebuild cut-out chart pieces from a single printed number.',
  strand: 'linear-counting',
  ages: [5, 8],
  schema: [
    {
      kind: 'select',
      key: 'mode',
      label: 'Puzzle type',
      options: [
        { value: 'fill', label: 'Fill in the chart' },
        { value: 'fragment', label: 'Chart pieces' },
      ],
      help: 'Complete a full 10×10 chart, or rebuild small cut-out pieces of it.',
    },
    {
      kind: 'number',
      key: 'missing',
      label: 'Missing numbers (%)',
      min: 10,
      max: 70,
      step: 5,
      help: 'Fill-in mode only: how much of the chart is left blank.',
    },
    {
      kind: 'number',
      key: 'pieces',
      label: 'Pieces',
      min: 4,
      max: 8,
      help: 'Chart-pieces mode only: how many puzzle pieces.',
    },
  ],
  defaults: { mode: 'fill', missing: 30, pieces: 6 },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'first-fill',
      name: 'First fill-in',
      description: 'After the hundred board lesson — a mostly complete chart with a few gaps to fill.',
      params: { mode: 'fill', missing: 20 },
    },
    {
      id: 'chart-puzzles',
      name: 'Chart puzzles',
      description: 'Hundred board extension work — rebuild cut-out chart pieces from one printed number.',
      params: { mode: 'fragment', pieces: 6 },
    },
  ],
}
