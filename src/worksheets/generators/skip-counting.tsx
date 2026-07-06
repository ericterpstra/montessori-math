/**
 * Skip counting / bead chain labels worksheet.
 *
 * Sequences of multiples rendered as arrow-joined chain tickets (like the
 * arrows and tickets used with the bead chains), with some tickets left blank
 * for the child to fill in. Three activities:
 *   - chains: n, 2n, … up to the square n × n (the short chain)
 *   - beyond: continue past the square all the way to 10 × n (the long chain)
 *   - table:  the multiples table n × 1 … n × 10 as a two-row strip
 */
import { Fragment } from 'react'
import { BeadBar } from '../../components/beads'
import { formatNumber } from '../../lib/placeValue'
import { AnswerKeyPage, SheetPage } from '../SheetPage'
import type { RNG } from '../../lib/rng'
import type { GeneratorDef, SheetProps } from '../types'
import './skip-counting.css'

export type SkipCountingMode = 'chains' | 'beyond' | 'table'

export type SkipCountingN = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'mixed'

export type SkipCountingParams = {
  /** Which number to count by, or 'mixed' for a different n per sequence. */
  n: SkipCountingN
  mode: SkipCountingMode
  /** Blanks per sequence (clamped when a short chain has fewer tickets). */
  blanks: number
  /** Number of sequences on the sheet. */
  count: number
}

export interface SkipCountingSequence {
  n: number
  /** The full sequence of multiples: n × 1 … n × length. */
  values: number[]
  /** Indices into `values` left blank on the student sheet. Never index 0. */
  blankIndexes: number[]
  /** Index of the square ticket (n × n), or null in table mode. */
  squareIndex: number | null
}

export interface SkipCountingData {
  sequences: SkipCountingSequence[]
}

const MIN_N = 2
const MAX_N = 10

function chooseNs(params: SkipCountingParams, rng: RNG): number[] {
  if (params.n !== 'mixed') {
    return Array.from({ length: params.count }, () => Number(params.n))
  }
  // Mixed: keep n values distinct while the count allows (9 choices for 4–10 sequences).
  const all = Array.from({ length: MAX_N - MIN_N + 1 }, (_, i) => MIN_N + i)
  const ns: number[] = []
  while (ns.length < params.count) {
    ns.push(...rng.shuffle(all).slice(0, params.count - ns.length))
  }
  return ns
}

function generate(params: SkipCountingParams, rng: RNG): SkipCountingData {
  const sequences = chooseNs(params, rng).map((n): SkipCountingSequence => {
    const length = params.mode === 'chains' ? n : 10
    const values = Array.from({ length }, (_, i) => n * (i + 1))
    // Blanks may fall anywhere except the first ticket, which anchors the count.
    const candidates = Array.from({ length: length - 1 }, (_, i) => i + 1)
    const blankIndexes = rng
      .shuffle(candidates)
      .slice(0, Math.min(params.blanks, candidates.length))
      .sort((a, b) => a - b)
    const squareIndex = params.mode === 'table' ? null : n - 1
    return { n, values, blankIndexes, squareIndex }
  })
  return { sequences }
}

/* ---------- Rendering ---------- */

const MODE_TITLES: Record<SkipCountingMode, string> = {
  chains: 'Skip Counting Chains',
  beyond: 'Skip Counting Past the Square',
  table: 'Multiples Tables',
}

const MODE_INSTRUCTIONS: Record<SkipCountingMode, string> = {
  chains: 'Fill in the missing numbers on each chain. The thick ticket at the end is the square.',
  beyond:
    'Each chain counts past its square all the way to ten bars. Fill in the missing numbers. The thick ticket is the square.',
  table: 'Fill in the missing numbers in each multiples table.',
}

function titleFor(params: SkipCountingParams): string {
  const base = MODE_TITLES[params.mode]
  return params.n === 'mixed' ? `${base} — Mixed` : `${base} — ${params.n}s`
}

/**
 * Sequences per printed page (each row must keep room for child handwriting).
 * Ten-ticket chains ('beyond' mode, or 'chains' counting by 10s) are the
 * widest, tallest rows; those pages hold fewer so they never overflow
 * vertically, even if a chain wraps to a second line.
 */
export function pageCapacity(params: Pick<SkipCountingParams, 'mode' | 'n'>): number {
  if (params.mode === 'table') return 9
  if (params.mode === 'beyond' || params.n === '10') return 6
  return 8
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size))
  }
  return pages
}

function RowLabel({ seq, index, table }: { seq: SkipCountingSequence; index: number; table: boolean }) {
  return (
    <div className="skip-counting-label">
      <span className="skip-counting-num">{index + 1}.</span>
      <span>{table ? `The ${seq.n}s table` : `Count by ${seq.n}s`}</span>
      <BeadBar n={seq.n} beadSize={10} className="skip-counting-beads" title={`bar of ${seq.n}`} />
    </div>
  )
}

function ChainRow({ seq, index, showAnswers }: { seq: SkipCountingSequence; index: number; showAnswers?: boolean }) {
  return (
    <div className="skip-counting-row">
      <RowLabel seq={seq} index={index} table={false} />
      <div className="skip-counting-chain">
        {seq.values.map((value, i) => {
          const blank = seq.blankIndexes.includes(i) && !showAnswers
          const square = seq.squareIndex === i
          const cls = [
            'skip-counting-ticket',
            blank ? 'skip-counting-ticket-blank' : '',
            square ? 'skip-counting-ticket-square' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <Fragment key={i}>
              {i > 0 && (
                <span className="skip-counting-arrow" aria-hidden="true">
                  →
                </span>
              )}
              <span className={cls}>{blank ? '' : formatNumber(value)}</span>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}

function TableRow({ seq, index }: { seq: SkipCountingSequence; index: number }) {
  return (
    <div className="skip-counting-row">
      <RowLabel seq={seq} index={index} table={true} />
      <table className="skip-counting-table">
        <thead>
          <tr>
            <th scope="row">×</th>
            {seq.values.map((_, i) => (
              <th key={i} scope="col">
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{seq.n}</th>
            {seq.values.map((value, i) => (
              <td key={i}>{seq.blankIndexes.includes(i) ? '' : formatNumber(value)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Sheet({ data, params }: SheetProps<SkipCountingParams, SkipCountingData>) {
  const capacity = pageCapacity(params)
  return (
    <>
      {chunk(data.sequences, capacity).map((pageSeqs, page) => (
        <SheetPage key={page} title={titleFor(params)} instructions={MODE_INSTRUCTIONS[params.mode]}>
          <div className="skip-counting-rows">
            {pageSeqs.map((seq, i) =>
              params.mode === 'table' ? (
                <TableRow key={i} seq={seq} index={page * capacity + i} />
              ) : (
                <ChainRow key={i} seq={seq} index={page * capacity + i} />
              ),
            )}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function AnswerKey({ data, params }: SheetProps<SkipCountingParams, SkipCountingData>) {
  return (
    <AnswerKeyPage title={titleFor(params)}>
      <ol className="answer-list skip-counting-key">
        {data.sequences.map((seq, i) => (
          <li key={i}>
            <span className="skip-counting-num">{i + 1}.</span> {seq.n}s:{' '}
            {seq.values.map((value, j) => (
              <Fragment key={j}>
                {j > 0 && ', '}
                <span className={seq.blankIndexes.includes(j) ? 'skip-counting-key-blank' : undefined}>
                  {formatNumber(value)}
                </span>
              </Fragment>
            ))}
          </li>
        ))}
      </ol>
      <p className="skip-counting-key-note">Underlined numbers were blank on the student sheet.</p>
    </AnswerKeyPage>
  )
}

/* ---------- Definition ---------- */

export const def: GeneratorDef<SkipCountingParams, SkipCountingData> = {
  slug: 'skip-counting',
  name: 'Skip Counting',
  description:
    'Fill in missing multiples along bead-chain tickets — up to the square, past it to ten bars, or in a multiples table.',
  strand: 'linear-counting',
  ages: [5, 8],
  schema: [
    {
      kind: 'select',
      key: 'n',
      label: 'Count by',
      options: [
        { value: '2', label: '2s' },
        { value: '3', label: '3s' },
        { value: '4', label: '4s' },
        { value: '5', label: '5s' },
        { value: '6', label: '6s' },
        { value: '7', label: '7s' },
        { value: '8', label: '8s' },
        { value: '9', label: '9s' },
        { value: '10', label: '10s' },
        { value: 'mixed', label: 'Mixed (2s–10s)' },
      ],
      help: 'Mixed gives each chain its own number, matched to the bead stair.',
    },
    {
      kind: 'select',
      key: 'mode',
      label: 'Activity',
      options: [
        { value: 'chains', label: 'Chain to the square' },
        { value: 'beyond', label: 'Chain past the square (to 10 bars)' },
        { value: 'table', label: 'Multiples table (× 1 … × 10)' },
      ],
      help: 'Chains stop at n × n like the short bead chain; past the square continues to 10 × n.',
    },
    {
      kind: 'number',
      key: 'blanks',
      label: 'Blanks per chain',
      min: 2,
      max: 6,
      help: 'Missing tickets in each chain. Very short chains use as many as they can hold.',
    },
    { kind: 'number', key: 'count', label: 'Chains on the sheet', min: 4, max: 10 },
  ],
  defaults: { n: '5', mode: 'chains', blanks: 3, count: 6 },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'fives-chain',
      name: 'Fives chain',
      description: 'After the bead chains lesson — label the five chain from 5 up to its square, 25.',
      params: { n: '5', mode: 'chains', blanks: 3, count: 6 },
    },
    {
      id: 'all-the-tables',
      name: 'All the tables',
      description: 'Before the memorization boards — one multiples table for each number, 2s through 10s.',
      params: { n: 'mixed', mode: 'table', blanks: 4, count: 9 },
    },
  ],
}
