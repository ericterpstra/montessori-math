/**
 * Numeral tracing (PK) — dashed numerals 0–9 rendered as large SVG glyphs the
 * child pencils over. The first glyph of each row is solid as the model.
 * Optionally each row ends with that many golden beads to count (zero gets an
 * empty frame — a point of interest!). Practice happens on paper.
 */
import type { RNG } from '../../lib/rng'
import type { GeneratorDef, SheetProps } from '../types'
import { SheetPage, AnswerKeyPage } from '../SheetPage'
import { Bead } from '../../components/beads'
import './numeral-tracing.css'

/* ---------- Params & data ---------- */

export type NumeralTracingParams = {
  /** 'all' for 0–9, or a single numeral '0'…'9'. */
  focus: string
  /** Tracing rows per numeral, 1–3. */
  rowsPerNumeral: number
  /** End each row with that many golden beads to count. */
  counting: boolean
}

export interface TracingRow {
  /** The numeral 0–9 this row practices. */
  numeral: number
  /** Glyphs in the row; the first is solid (the model), the rest are dashed. */
  glyphCount: number
  /** Beads to count at the end of the row (equals the numeral; 0 when counting is off). */
  beadCount: number
  /** Deterministic per-bead vertical offsets in px (−3…3) for a hand-laid look. */
  jitter: number[]
}

export interface TracingPage {
  /** Which numerals this page covers, e.g. '0 to 4' or '4'. */
  label: string
  rows: TracingRow[]
}

export interface NumeralTracingData {
  counting: boolean
  pages: TracingPage[]
}

/* ---------- Generation (pure) ---------- */

const ALL_NUMERALS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const
/** Whole numerals are kept together, so a page holds at most this many rows. */
const MAX_ROWS_PER_PAGE = 10
/** With beads at the row's end there is room for 8 glyphs; without, 10. */
const GLYPHS_WITH_BEADS = 8
const GLYPHS_WITHOUT_BEADS = 10

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function focusNumerals(focus: string): number[] {
  const n = Number.parseInt(focus, 10)
  if (Number.isInteger(n) && n >= 0 && n <= 9) return [n]
  return [...ALL_NUMERALS]
}

export function generate(params: NumeralTracingParams, rng: RNG): NumeralTracingData {
  const rowsPerNumeral = clampInt(params.rowsPerNumeral, 1, 3)
  const counting = params.counting === true
  const numerals = focusNumerals(params.focus)
  const numeralsPerPage = Math.max(1, Math.floor(MAX_ROWS_PER_PAGE / rowsPerNumeral))

  const pages: TracingPage[] = []
  for (let i = 0; i < numerals.length; i += numeralsPerPage) {
    const group = numerals.slice(i, i + numeralsPerPage)
    const rows: TracingRow[] = []
    for (const numeral of group) {
      for (let r = 0; r < rowsPerNumeral; r++) {
        const beadCount = counting ? numeral : 0
        rows.push({
          numeral,
          glyphCount: counting ? GLYPHS_WITH_BEADS : GLYPHS_WITHOUT_BEADS,
          beadCount,
          jitter: Array.from({ length: beadCount }, () => rng.int(-3, 3)),
        })
      }
    }
    const label = group.length > 1 ? `${group[0]} to ${group[group.length - 1]}` : `${group[0]}`
    pages.push({ label, rows })
  }
  return { counting, pages }
}

/* ---------- Rendering ---------- */

/* All dimensions in px at CSS 96px/in. Row: 78px ≈ 0.81in tall; glyphs ~0.65in. */
const ROW_H = 78
const FONT_SIZE = 84
const BASELINE_Y = 61
/** Glyph slot width: 8 × 63px = 5.25in beside the bead frame; 10 × 72px = 7.5in alone. */
const SLOT_WITH_BEADS = 63
const SLOT_WITHOUT_BEADS = 72
const BEAD_SIZE = 17 // ≈ 0.177in, under the 0.18in max

function TracingRowView({ row, counting }: { row: TracingRow; counting: boolean }) {
  const slot = counting ? SLOT_WITH_BEADS : SLOT_WITHOUT_BEADS
  const width = slot * row.glyphCount
  return (
    <div className="numeral-tracing-row">
      <svg
        className="numeral-tracing-glyphs"
        width={`${width / 96}in`}
        height={`${ROW_H / 96}in`}
        viewBox={`0 0 ${width} ${ROW_H}`}
        aria-hidden="true"
      >
        {Array.from({ length: row.glyphCount }, (_, i) => (
          <text
            key={i}
            className={i === 0 ? 'numeral-tracing-glyph-model' : 'numeral-tracing-glyph-trace'}
            x={i * slot + slot / 2}
            y={BASELINE_Y}
            textAnchor="middle"
            fontSize={FONT_SIZE}
          >
            {row.numeral}
          </text>
        ))}
      </svg>
      {counting && (
        <div
          className="numeral-tracing-beadframe"
          role="img"
          aria-label={`${row.beadCount} ${row.beadCount === 1 ? 'bead' : 'beads'} to count`}
        >
          {row.jitter.map((j, i) => (
            <span key={i} className="numeral-tracing-bead" style={{ transform: `translateY(${j}px)` }}>
              <Bead size={BEAD_SIZE} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function Sheet({ data }: SheetProps<NumeralTracingParams, NumeralTracingData>) {
  const instructions = data.counting
    ? 'Trace each number with a pencil, starting with the solid one. Then count the golden beads in the box at the end of the row.'
    : 'Trace each number with a pencil, starting with the solid one.'
  return (
    <>
      {data.pages.map((page, pi) => (
        <SheetPage key={pi} title={`Numeral Tracing — ${page.label}`} instructions={instructions}>
          <div className="numeral-tracing-rows">
            {page.rows.map((row, ri) => (
              <TracingRowView key={ri} row={row} counting={data.counting} />
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function AnswerKey({ data }: SheetProps<NumeralTracingParams, NumeralTracingData>) {
  const hasZeroRow = data.counting && data.pages.some((p) => p.rows.some((r) => r.numeral === 0))
  return (
    <AnswerKeyPage title="Numeral Tracing">
      <ol className="answer-list">
        {data.pages.flatMap((page, pi) =>
          page.rows.map((row, ri) => (
            <li key={`${pi}-${ri}`}>
              Page {pi + 1}, row {ri + 1}: trace {row.numeral}
              {data.counting ? ` — ${row.beadCount} ${row.beadCount === 1 ? 'bead' : 'beads'}` : ''}
            </li>
          )),
        )}
      </ol>
      {hasZeroRow && (
        <p>
          The bead frame beside zero is empty on purpose — zero means &ldquo;not any.&rdquo; Ask your child what they
          notice before you explain.
        </p>
      )}
    </AnswerKeyPage>
  )
}

/* ---------- Definition ---------- */

export const def: GeneratorDef<NumeralTracingParams, NumeralTracingData> = {
  slug: 'numeral-tracing',
  name: 'Numeral Tracing',
  description: 'Dashed numerals 0–9 to pencil over, with golden beads to count at the end of each row.',
  strand: 'numbers-to-10',
  ages: [3, 5],
  schema: [
    {
      kind: 'select',
      key: 'focus',
      label: 'Numerals',
      options: [
        { value: 'all', label: 'All numerals 0–9' },
        ...ALL_NUMERALS.map((n) => ({ value: `${n}`, label: `Just ${n}` })),
      ],
      help: 'Practice every numeral, or focus on one your child is polishing.',
    },
    {
      kind: 'number',
      key: 'rowsPerNumeral',
      label: 'Rows per numeral',
      min: 1,
      max: 3,
      step: 1,
    },
    {
      kind: 'boolean',
      key: 'counting',
      label: 'Count-and-trace beads',
      help: 'End each row with that many golden beads to count. Zero gets an empty frame — a point of interest!',
    },
  ],
  defaults: { focus: 'all', rowsPerNumeral: 2, counting: true },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'first-numerals',
      name: 'First numerals 0–9',
      description:
        'Two tracing rows for every numeral with beads to count — alongside sandpaper numeral and bead stair work.',
      params: { focus: 'all', rowsPerNumeral: 2, counting: true },
    },
    {
      id: 'focus-practice',
      name: 'Focus on one numeral',
      description: 'Three rows of a single numeral (4) for a child polishing one figure that gives them trouble.',
      params: { focus: '4', rowsPerNumeral: 3, counting: true },
    },
  ],
}
