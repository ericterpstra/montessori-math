/**
 * Teens & tens worksheet — Seguin board follow-up work (linear counting).
 *
 * Three practice kinds:
 *  - bead-to-numeral: count pictured golden ten-bars + a colored unit bead bar,
 *    write the number
 *  - numeral-to-bead: read a numeral, draw the beads (line per ten, dot per unit)
 *  - sequence: a 6-number counting run with 2–3 missing numbers to fill in
 */
import type { CSSProperties } from 'react'
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

interface Numbered<T> {
  p: T
  n: number
}

function Sheet({ data, params }: SheetProps<TeensTensParams, TeensTensData>) {
  const numbered: Numbered<TeensTensProblem>[] = data.problems.map((p, i) => ({ p, n: i + 1 }))
  const reads = numbered.filter((x): x is Numbered<BeadProblem> => x.p.kind === 'bead-to-numeral')
  const draws = numbered.filter((x): x is Numbered<BeadProblem> => x.p.kind === 'numeral-to-bead')
  const seqs = numbered.filter((x): x is Numbered<SequenceProblem> => x.p.kind === 'sequence')
  const mixed = params.mode === 'mixed'
  const cols = params.range === 'teens' ? 5 : 4

  return (
    <SheetPage title={TITLE} instructions={INSTRUCTIONS[params.mode]}>
      {reads.length > 0 && (
        <>
          {mixed && <h3 className="teens-tens-section">A. Count the beads and write the number.</h3>}
          <div className="problems-grid" style={colStyle(cols)}>
            {reads.map(({ p, n }) => (
              <div className="problem" key={n}>
                <span className="problem-number">{n}.</span>
                <BeadPicture tens={p.tens} units={p.units} />
                <div className="teens-tens-answer">
                  = <span className="write-line teens-tens-answer-blank" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {draws.length > 0 && (
        <>
          {mixed && (
            <h3 className="teens-tens-section">
              B. Draw the beads: a long line for each ten, a dot for each unit.
            </h3>
          )}
          <div className="problems-grid" style={colStyle(cols)}>
            {draws.map(({ p, n }) => (
              <div className="problem" key={n}>
                <span className="problem-number">{n}.</span>
                <span className="teens-tens-numeral">{p.value}</span>
                <div className="teens-tens-drawbox" />
              </div>
            ))}
          </div>
        </>
      )}
      {seqs.length > 0 && (
        <>
          {mixed && <h3 className="teens-tens-section">C. Write the missing numbers.</h3>}
          <div className="problems-grid" style={colStyle(2)}>
            {seqs.map(({ p, n }) => (
              <div className="problem teens-tens-seqrow" key={n}>
                <span className="problem-number">{n}.</span>
                <SequenceRun p={p} showAnswers={false} />
              </div>
            ))}
          </div>
        </>
      )}
    </SheetPage>
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
