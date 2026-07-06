/**
 * Teens & tens worksheet — Seguin board follow-up work (linear counting).
 *
 * Three practice kinds:
 *  - bead-to-numeral: count pictured golden ten-bars + a colored unit bead bar,
 *    write the number
 *  - numeral-to-bead: read a numeral, draw the beads (line per ten, dot per unit)
 *  - sequence: a 6-number counting run with 2–3 missing numbers to fill in
 *
 * Sheets paginate: rows flow onto as many US Letter pages as they need
 * (see paginateProblems), so large mixed sheets never overflow a page.
 */
import { Fragment, type CSSProperties } from 'react'
import type { RNG } from '../../lib/rng'
import type { GeneratorDef, SheetProps } from '../types'
import { SheetPage, AnswerKeyPage } from '../SheetPage'
import { BeadBar, TenBar } from '../../components/beads'
import './teens-tens.css'

export type TeensTensMode = 'bead-to-numeral' | 'numeral-to-bead' | 'sequences' | 'mixed'
export type TeensTensRange = 'teens' | 'tens'

export type TeensTensParams = {
  mode: TeensTensMode
  range: TeensTensRange
  count: number
}

export type ProblemKind = 'bead-to-numeral' | 'numeral-to-bead' | 'sequence'

export interface BeadProblem {
  kind: 'bead-to-numeral' | 'numeral-to-bead'
  /** The two-digit number, e.g. 34. */
  value: number
  /** Number of golden ten-bars in the picture (value ÷ 10). */
  tens: number
  /** Number of unit beads in the picture (value mod 10). */
  units: number
}

export interface SequenceProblem {
  kind: 'sequence'
  start: number
  /** The full run of RUN_LENGTH consecutive numbers starting at `start`. */
  numbers: number[]
  /** Indices into `numbers` left blank — sorted, always ≥ 1 (anchor visible). */
  blanks: number[]
  /** The missing numbers, in blank order. */
  answers: number[]
}

export type TeensTensProblem = BeadProblem | SequenceProblem

export interface TeensTensData {
  problems: TeensTensProblem[]
}

export const RUN_LENGTH = 6

const ALL_KINDS: readonly ProblemKind[] = ['bead-to-numeral', 'numeral-to-bead', 'sequence']
const KIND_ORDER: Record<ProblemKind, number> = {
  'bead-to-numeral': 0,
  'numeral-to-bead': 1,
  sequence: 2,
}

function rangeArray(lo: number, hi: number): number[] {
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
}

/** Draw `count` values from `pool` without replacement, reshuffling if the pool runs dry. */
function sampleFromPool(pool: readonly number[], count: number, rng: RNG): number[] {
  const out: number[] = []
  while (out.length < count) out.push(...rng.shuffle(pool))
  return out.slice(0, count)
}

function generate(params: TeensTensParams, rng: RNG): TeensTensData {
  const count = Math.floor(params.count)
  const [lo, hi] = params.range === 'teens' ? [11, 19] : [10, 99]

  let kinds: ProblemKind[]
  if (params.mode === 'mixed') {
    // Round-robin split (all three kinds always present), grouped for layout.
    kinds = Array.from({ length: count }, (_, i) => ALL_KINDS[i % ALL_KINDS.length])
    kinds.sort((a, b) => KIND_ORDER[a] - KIND_ORDER[b])
  } else if (params.mode === 'sequences') {
    kinds = Array.from({ length: count }, () => 'sequence' as const)
  } else {
    const kind = params.mode
    kinds = Array.from({ length: count }, () => kind)
  }

  const beadCount = kinds.filter((k) => k !== 'sequence').length
  const seqCount = count - beadCount

  const values = sampleFromPool(rangeArray(lo, hi), beadCount, rng)
  // A run must fit inside the range: start + RUN_LENGTH − 1 ≤ hi.
  const starts = sampleFromPool(rangeArray(lo, hi - (RUN_LENGTH - 1)), seqCount, rng)

  let vi = 0
  let si = 0
  const problems = kinds.map((kind): TeensTensProblem => {
    if (kind === 'sequence') {
      const start = starts[si++]
      const numbers = Array.from({ length: RUN_LENGTH }, (_, i) => start + i)
      const blankCount = rng.int(2, 3)
      // Blank positions 1…RUN_LENGTH−1 — never the first number, so the child
      // always has an anchor to count on from.
      const blanks = rng
        .shuffle(rangeArray(1, RUN_LENGTH - 1))
        .slice(0, blankCount)
        .sort((a, b) => a - b)
      return { kind, start, numbers, blanks, answers: blanks.map((b) => numbers[b]) }
    }
    const value = values[vi++]
    return { kind, value, tens: Math.floor(value / 10), units: value % 10 }
  })

  return { problems }
}

/* ---------- rendering ---------- */

const TITLE = 'Teens & Tens'

const INSTRUCTIONS: Record<TeensTensMode, string> = {
  'bead-to-numeral': 'Count the ten-bars and the unit beads, then write the number on the line.',
  'numeral-to-bead': 'Read the number. In the box, draw a long line for each ten and a dot for each unit.',
  sequences: 'Count on and write the missing numbers in each row.',
  mixed: 'Complete each section.',
}

function colStyle(cols: number): CSSProperties {
  return { '--cols': cols } as CSSProperties
}

/* ---------- pagination ---------- */

/**
 * Per-row height estimates in inches (96 dpi), measured from the rendered
 * sheet and rounded up a little so a page never overflows. The budget is the
 * US Letter content area (10in inside 0.5in margins) minus the sheet header
 * and instruction line.
 */
export const PAGE_BUDGET_IN = 8.7
export const ROW_HEIGHT_IN: Record<ProblemKind, number> = {
  'bead-to-numeral': 1.9, // number line + 10-bead bar picture + answer line
  'numeral-to-bead': 1.7, // numeral line + 1.15in draw box
  sequence: 0.4, // one line of text
}
/** Vertical gap between rows of the problems grid. */
export const ROW_GAP_IN = 0.28
/** Mixed-mode section heading, including its margins. */
export const SECTION_HEADING_IN = 0.6

/** Grid columns for a problem kind (sequences are wide; bead pictures narrow). */
export function kindCols(kind: ProblemKind, range: TeensTensRange): number {
  if (kind === 'sequence') return 2
  return range === 'teens' ? 5 : 4
}

interface Numbered<T> {
  p: T
  n: number
}

/** One same-kind run of problems rendered as a single grid on one page. */
export interface SectionChunk {
  kind: ProblemKind
  /** True when this section started on an earlier page (heading reprints as "continued"). */
  continued: boolean
  items: Numbered<TeensTensProblem>[]
}

/**
 * Flow the problems onto US Letter pages. Problems keep their 1-based sheet
 * numbers, kinds stay grouped in order (generate sorts mixed sheets), and a
 * section that does not fit splits across pages at a grid-row boundary.
 */
export function paginateProblems(
  problems: TeensTensProblem[],
  params: TeensTensParams,
): SectionChunk[][] {
  const mixed = params.mode === 'mixed'

  // Group consecutive same-kind problems into grid rows of `cols` items.
  const rows: { kind: ProblemKind; items: Numbered<TeensTensProblem>[] }[] = []
  problems.forEach((p, i) => {
    const item = { p, n: i + 1 }
    const last = rows[rows.length - 1]
    if (last && last.kind === p.kind && last.items.length < kindCols(p.kind, params.range)) {
      last.items.push(item)
    } else {
      rows.push({ kind: p.kind, items: [item] })
    }
  })

  const pages: SectionChunk[][] = [[]]
  const seen = new Set<ProblemKind>()
  let used = 0
  for (const row of rows) {
    let page = pages[pages.length - 1]
    let chunk: SectionChunk | undefined = page[page.length - 1]
    let opens = !chunk || chunk.kind !== row.kind
    // A section heading's margins double as the row gap where it opens.
    let cost =
      ROW_HEIGHT_IN[row.kind] +
      (opens ? (mixed ? SECTION_HEADING_IN : used > 0 ? ROW_GAP_IN : 0) : ROW_GAP_IN)
    if (used > 0 && used + cost > PAGE_BUDGET_IN) {
      pages.push([])
      page = pages[pages.length - 1]
      chunk = undefined
      opens = true
      used = 0
      cost = ROW_HEIGHT_IN[row.kind] + (mixed ? SECTION_HEADING_IN : 0)
    }
    if (opens || !chunk) {
      chunk = { kind: row.kind, continued: seen.has(row.kind), items: [] }
      page.push(chunk)
      seen.add(row.kind)
    }
    chunk.items.push(...row.items)
    used += cost
  }
  return pages
}

/** Golden ten-bars plus a colored bead-stair bar for the units, as on the Seguin boards. */
function BeadPicture({ tens, units }: { tens: number; units: number }) {
  return (
    <div className="teens-tens-picture">
      {Array.from({ length: tens }, (_, i) => (
        <TenBar key={i} vertical beadSize={11} />
      ))}
      {units > 0 && <BeadBar n={units} vertical beadSize={11} />}
    </div>
  )
}

function SequenceRun({ p, showAnswers }: { p: SequenceProblem; showAnswers: boolean }) {
  return (
    <>
      {p.numbers.map((num, idx) => {
        const blank = p.blanks.includes(idx)
        return (
          <span key={idx}>
            {blank ? (
              showAnswers ? (
                <strong>{num}</strong>
              ) : (
                <span className="write-line teens-tens-seq-blank" />
              )
            ) : (
              num
            )}
            {idx < RUN_LENGTH - 1 ? ', ' : ''}
          </span>
        )
      })}
    </>
  )
}

const SECTION_HEADINGS: Record<ProblemKind, string> = {
  'bead-to-numeral': 'A. Count the beads and write the number.',
  'numeral-to-bead': 'B. Draw the beads: a long line for each ten, a dot for each unit.',
  sequence: 'C. Write the missing numbers.',
}

function ProblemCell({ p, n }: { p: TeensTensProblem; n: number }) {
  if (p.kind === 'sequence') {
    return (
      <div className="problem teens-tens-seqrow">
        <span className="problem-number">{n}.</span>
        <SequenceRun p={p} showAnswers={false} />
      </div>
    )
  }
  if (p.kind === 'numeral-to-bead') {
    return (
      <div className="problem">
        <span className="problem-number">{n}.</span>
        <span className="teens-tens-numeral">{p.value}</span>
        <div className="teens-tens-drawbox" />
      </div>
    )
  }
  return (
    <div className="problem">
      <span className="problem-number">{n}.</span>
      <BeadPicture tens={p.tens} units={p.units} />
      <div className="teens-tens-answer">
        = <span className="write-line teens-tens-answer-blank" />
      </div>
    </div>
  )
}

function Sheet({ data, params }: SheetProps<TeensTensParams, TeensTensData>) {
  const mixed = params.mode === 'mixed'
  const pages = paginateProblems(data.problems, params)

  return (
    <>
      {pages.map((chunks, pageIndex) => (
        <SheetPage
          key={pageIndex}
          title={pages.length > 1 ? `${TITLE} (page ${pageIndex + 1} of ${pages.length})` : TITLE}
          instructions={INSTRUCTIONS[params.mode]}
        >
          {chunks.map((chunk) => (
            <Fragment key={`${chunk.kind}-${chunk.items[0]?.n ?? 0}`}>
              {mixed && (
                <h3 className="teens-tens-section">
                  {SECTION_HEADINGS[chunk.kind]}
                  {chunk.continued ? ' (continued)' : ''}
                </h3>
              )}
              <div className="problems-grid" style={colStyle(kindCols(chunk.kind, params.range))}>
                {chunk.items.map(({ p, n }) => (
                  <ProblemCell key={n} p={p} n={n} />
                ))}
              </div>
            </Fragment>
          ))}
        </SheetPage>
      ))}
    </>
  )
}

function AnswerKey({ data }: SheetProps<TeensTensParams, TeensTensData>) {
  return (
    <AnswerKeyPage title={TITLE}>
      <ol className="answer-list teens-tens-key">
        {data.problems.map((p, i) => (
          <li key={i}>
            {i + 1}.{' '}
            {p.kind === 'sequence' ? (
              <SequenceRun p={p} showAnswers />
            ) : p.kind === 'numeral-to-bead' ? (
              `${p.value} = ${p.tens} tens + ${p.units} units`
            ) : (
              p.value
            )}
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------- definition ---------- */

export const def: GeneratorDef<TeensTensParams, TeensTensData> = {
  slug: 'teens-tens',
  name: 'Teens & Tens',
  description:
    'Seguin board follow-up: count bead pictures, draw beads for a numeral, and fill in missing numbers in counting runs from 11 to 99.',
  strand: 'linear-counting',
  ages: [4, 7],
  schema: [
    {
      kind: 'select',
      key: 'mode',
      label: 'Practice type',
      options: [
        { value: 'bead-to-numeral', label: 'Count beads, write the number' },
        { value: 'numeral-to-bead', label: 'Read the number, draw the beads' },
        { value: 'sequences', label: 'Fill in counting sequences' },
        { value: 'mixed', label: 'Mixed practice' },
      ],
      help: 'Bead pictures show golden ten-bars with a colored bead bar for the units, as on the Seguin boards.',
    },
    {
      kind: 'select',
      key: 'range',
      label: 'Number range',
      options: [
        { value: 'teens', label: 'Teens (11–19)' },
        { value: 'tens', label: 'Tens (10–99)' },
      ],
    },
    { kind: 'number', key: 'count', label: 'Problems', min: 6, max: 15, step: 1 },
  ],
  defaults: { mode: 'bead-to-numeral', range: 'tens', count: 10 },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'teen-beads',
      name: 'Teen bead pictures',
      description:
        'After the teen board (Seguin A) with beads — count a golden ten-bar and the colored beads, write the teen number.',
      params: { mode: 'bead-to-numeral', range: 'teens', count: 10 },
    },
    {
      id: 'counting-runs',
      name: 'Counting runs to 99',
      description:
        'After counting across the ten board (Seguin B) to 99 — fill in the missing numbers in each counting run.',
      params: { mode: 'sequences', range: 'tens', count: 10 },
    },
  ],
}
