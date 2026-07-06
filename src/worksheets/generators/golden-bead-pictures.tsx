/**
 * Golden bead pictures — the paper twin of the golden bead material.
 *
 * Read mode: the child counts pictured golden bead pieces (thousand-cubes,
 * hundred-squares, ten-bars, unit beads) and writes the numeral.
 * Draw mode: the child reads a numeral and draws the quantity in a box.
 */
import type { CSSProperties } from 'react'
import type { GeneratorDef, SheetProps } from '../types'
import type { RNG } from '../../lib/rng'
import type { PlaceDigit } from '../../lib/placeValue'
import { decompose, formatNumber, placeInfo } from '../../lib/placeValue'
import { AnswerKeyPage, SheetPage } from '../SheetPage'
import { Bead, HundredSquare, TenBar, ThousandCube } from '../../components/beads'
import './golden-bead-pictures.css'

export type GoldenBeadMode = 'read' | 'draw' | 'mixed'
export type GoldenBeadMax = '99' | '999' | '9999'

export type GoldenBeadPicturesParams = {
  mode: GoldenBeadMode
  max: GoldenBeadMax
  count: number
}

export interface GoldenBeadProblem {
  /** 'read' = count the pictured beads; 'draw' = draw the given numeral. */
  kind: 'read' | 'draw'
  value: number
  /** Non-zero place digits, thousands → units. Pictured pieces match exactly. */
  places: PlaceDigit[]
  /** Total pictured pieces (sum of place digits); always ≤ MAX_PIECES. */
  pieces: number
  /** Place breakdown in words, e.g. '3 thousands, 2 hundreds, 5 tens, 1 unit'. */
  breakdown: string
}

export interface GoldenBeadPicturesData {
  problems: GoldenBeadProblem[]
  /** Problems per printed page (4 when numbers reach 9,999, else 6). */
  perPage: number
}

/** Largest number of physical pieces we will picture in one problem. */
export const MAX_PIECES = 20

/** Every number uses its top place so the big material always appears. */
const RANGES: Record<GoldenBeadMax, readonly [number, number]> = {
  '99': [10, 99],
  '999': [100, 999],
  '9999': [1000, 9999],
}

function nonZeroPlaces(n: number): PlaceDigit[] {
  return decompose(n).filter((d) => d.digit > 0)
}

function piecesIn(n: number): number {
  return decompose(n).reduce((sum, d) => sum + d.digit, 0)
}

/** '3 thousands, 2 hundreds, 5 tens, 1 unit' — singular when the digit is 1. */
export function describeQuantity(places: readonly PlaceDigit[]): string {
  return places
    .map(({ power, digit }) => `${digit} ${digit === 1 ? placeInfo(power).singular : placeInfo(power).name}`)
    .join(', ')
}

/**
 * Draw a value in [min, max] whose piece total fits on paper, preferring
 * values not yet used on this sheet. Deterministic: all draws come from
 * the injected rng stream.
 */
function drawValue(rng: RNG, min: number, max: number, used: ReadonlySet<number>): number {
  let fitting = -1
  for (let attempt = 0; attempt < 200; attempt++) {
    const n = rng.int(min, max)
    if (piecesIn(n) > MAX_PIECES) continue
    if (fitting === -1) fitting = n
    if (used.has(n)) continue
    return n
  }
  if (fitting !== -1) return fitting
  // Unreachable in practice; min itself always fits (a single piece).
  return min
}

function generate(params: GoldenBeadPicturesParams, rng: RNG): GoldenBeadPicturesData {
  const [min, max] = RANGES[params.max]
  const count = Math.max(1, Math.floor(params.count))
  const used = new Set<number>()
  const problems: GoldenBeadProblem[] = []
  for (let i = 0; i < count; i++) {
    const kind: 'read' | 'draw' = params.mode === 'mixed' ? (i % 2 === 0 ? 'read' : 'draw') : params.mode
    const value = drawValue(rng, min, max, used)
    used.add(value)
    const places = nonZeroPlaces(value)
    problems.push({
      kind,
      value,
      places,
      pieces: places.reduce((sum, d) => sum + d.digit, 0),
      breakdown: describeQuantity(places),
    })
  }
  return { problems, perPage: params.max === '9999' ? 4 : 6 }
}

/* ---------- rendering ---------- */

const TITLE = 'Golden Bead Pictures'

const INSTRUCTIONS: Record<GoldenBeadMode, string> = {
  read: 'Count the golden beads in each picture and write the number.',
  draw: 'Read each number and draw the golden beads in the box: cubes for thousands, squares for hundreds, bars for tens, and dots for units.',
  mixed:
    'If you see beads, count them and write the number. If you see a number, draw the golden beads in the box: cubes for thousands, squares for hundreds, bars for tens, dots for units.',
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function Piece({ power }: { power: number }) {
  if (power === 3) return <ThousandCube size={40} />
  if (power === 2) return <HundredSquare size={34} />
  if (power === 1) return <TenBar beadSize={7} vertical />
  return <Bead size={7} />
}

function ReadProblem({ index, problem }: { index: number; problem: GoldenBeadProblem }) {
  return (
    <div className="problem golden-bead-pictures-problem">
      <div>
        <span className="problem-number">{index}.</span>
      </div>
      <div className="golden-bead-pictures-quantity">
        {problem.places.map(({ power, digit }) => (
          <span key={power} className="golden-bead-pictures-group">
            {Array.from({ length: digit }, (_, i) => (
              <Piece key={i} power={power} />
            ))}
          </span>
        ))}
      </div>
      <div className="golden-bead-pictures-answer">
        = <span className="write-line golden-bead-pictures-line" />
      </div>
    </div>
  )
}

function DrawProblem({ index, problem }: { index: number; problem: GoldenBeadProblem }) {
  return (
    <div className="problem golden-bead-pictures-problem">
      <div>
        <span className="problem-number">{index}.</span>
        <span className="golden-bead-pictures-numeral">{formatNumber(problem.value)}</span>
      </div>
      <div className="golden-bead-pictures-drawbox" />
    </div>
  )
}

function Sheet({ data, params }: SheetProps<GoldenBeadPicturesParams, GoldenBeadPicturesData>) {
  const pages = chunk(data.problems, data.perPage)
  return (
    <>
      {pages.map((page, pageIndex) => (
        <SheetPage key={pageIndex} title={TITLE} instructions={INSTRUCTIONS[params.mode]}>
          <div className="problems-grid" style={{ '--cols': 2 } as CSSProperties}>
            {page.map((problem, i) => {
              const index = pageIndex * data.perPage + i + 1
              return problem.kind === 'read' ? (
                <ReadProblem key={index} index={index} problem={problem} />
              ) : (
                <DrawProblem key={index} index={index} problem={problem} />
              )
            })}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function AnswerKey({ data }: SheetProps<GoldenBeadPicturesParams, GoldenBeadPicturesData>) {
  return (
    <AnswerKeyPage title={TITLE}>
      <ol className="answer-list golden-bead-pictures-key">
        {data.problems.map((p, i) => (
          <li key={i}>
            {i + 1}. <strong>{formatNumber(p.value)}</strong> — {p.breakdown}
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

export const def: GeneratorDef<GoldenBeadPicturesParams, GoldenBeadPicturesData> = {
  slug: 'golden-bead-pictures',
  name: 'Golden Bead Pictures',
  description: 'Count pictured golden bead quantities and write the numeral — or read a numeral and draw the beads.',
  strand: 'decimal-system',
  ages: [4, 7],
  schema: [
    {
      kind: 'select',
      key: 'mode',
      label: 'Activity',
      options: [
        { value: 'read', label: 'Count the beads, write the number' },
        { value: 'draw', label: 'Read the number, draw the beads' },
        { value: 'mixed', label: 'Mixed' },
      ],
    },
    {
      kind: 'select',
      key: 'max',
      label: 'Numbers up to',
      options: [
        { value: '99', label: '99' },
        { value: '999', label: '999' },
        { value: '9999', label: '9,999' },
      ],
      help: 'Every number uses the highest place, so the biggest material always appears.',
    },
    { kind: 'number', key: 'count', label: 'Problems', min: 4, max: 9 },
  ],
  defaults: { mode: 'read', max: '999', count: 6 },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'count-to-999',
      name: 'Count to 999',
      description: 'After the golden bead introduction and "bring me" games: count each pictured quantity and write the numeral.',
      params: { mode: 'read', max: '999', count: 6 },
    },
    {
      id: 'draw-to-9999',
      name: 'Draw to 9,999',
      description: 'After the formation of large numbers lesson: read each four-place numeral and draw the golden bead quantity.',
      params: { mode: 'draw', max: '9999', count: 4 },
    },
  ],
}
