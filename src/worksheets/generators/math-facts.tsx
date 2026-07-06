import type { CSSProperties } from 'react'
import type { RNG } from '../../lib/rng'
import type { GeneratorDef, SheetProps } from '../types'
import { AnswerKeyPage, SheetPage } from '../SheetPage'
import './math-facts.css'

/* ------------------------------------------------------------------
   Math facts drill — the bread-and-butter memorization sheet.
   Pure generation: every random choice goes through the injected RNG.
   ------------------------------------------------------------------ */

export type FactOperation = 'add' | 'subtract' | 'multiply' | 'divide'
export type OperationParam = FactOperation | 'mixed'
export type MissingParam = 'answer' | 'operand' | 'mixed'
export type LayoutParam = 'horizontal' | 'vertical'
export type BlankSlot = 'a' | 'b' | 'answer'

export type MathFactsParams = {
  operation: OperationParam
  count: number
  /** Max addend; for × and ÷ the max factor (divisor and quotient). */
  maxOperand: number
  missing: MissingParam
  layout: LayoutParam
  columns: number
  timed: boolean
}

export interface MathFactProblem {
  op: FactOperation
  a: number
  b: number
  answer: number
  /** Which slot is left blank on the student sheet. */
  blank: BlankSlot
  /** The value the child writes in the blank. */
  blankValue: number
}

export interface MathFactsData {
  problems: MathFactProblem[]
}

/* ---------------- generation ---------------- */

const FACT_OPERATIONS: readonly FactOperation[] = ['add', 'subtract', 'multiply', 'divide']
const OPERAND_SLOTS: readonly BlankSlot[] = ['a', 'b']
const ALL_SLOTS: readonly BlankSlot[] = ['a', 'b', 'answer']

/** Don't repeat a fact seen within the last N problems (when the fact space allows). */
const DEDUPE_WINDOW = 8
const DEDUPE_ATTEMPTS = 12

function makeFact(op: FactOperation, max: number, rng: RNG): { a: number; b: number; answer: number } {
  if (op === 'add') {
    const a = rng.int(0, max)
    const b = rng.int(0, max)
    return { a, b, answer: a + b }
  }
  if (op === 'subtract') {
    // Built as the inverse of an addition fact, so the difference is never
    // negative and everything stays inside the same fact family.
    const answer = rng.int(0, max)
    const b = rng.int(0, max)
    return { a: answer + b, b, answer }
  }
  if (op === 'multiply') {
    const a = rng.int(1, max)
    const b = rng.int(1, max)
    return { a, b, answer: a * b }
  }
  // divide: built as quotient × divisor ÷ divisor so it is always exact,
  // and (divisor ≥ 1, quotient ≥ 1) keeps missing-operand problems unique.
  const answer = rng.int(1, max) // quotient
  const b = rng.int(1, max) // divisor
  return { a: answer * b, b, answer }
}

function makeProblem(params: MathFactsParams, rng: RNG): MathFactProblem {
  const op: FactOperation = params.operation === 'mixed' ? rng.pick(FACT_OPERATIONS) : params.operation
  const { a, b, answer } = makeFact(op, params.maxOperand, rng)
  // Vertical (stacked) layout always blanks the answer.
  const missing: MissingParam = params.layout === 'vertical' ? 'answer' : params.missing
  const blank: BlankSlot =
    missing === 'answer' ? 'answer' : missing === 'operand' ? rng.pick(OPERAND_SLOTS) : rng.pick(ALL_SLOTS)
  const blankValue = blank === 'a' ? a : blank === 'b' ? b : answer
  return { op, a, b, answer, blank, blankValue }
}

function factKey(p: MathFactProblem): string {
  return `${p.op}:${p.a}:${p.b}`
}

function generate(params: MathFactsParams, rng: RNG): MathFactsData {
  const problems: MathFactProblem[] = []
  const recent: string[] = []
  for (let i = 0; i < params.count; i++) {
    let p = makeProblem(params, rng)
    for (let tries = 0; tries < DEDUPE_ATTEMPTS && recent.includes(factKey(p)); tries++) {
      p = makeProblem(params, rng)
    }
    problems.push(p)
    recent.push(factKey(p))
    if (recent.length > DEDUPE_WINDOW) recent.shift()
  }
  return { problems }
}

/* ---------------- rendering ---------------- */

const OP_SYMBOL: Record<FactOperation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
}

function sheetTitle(operation: OperationParam): string {
  switch (operation) {
    case 'add':
      return 'Addition Facts'
    case 'subtract':
      return 'Subtraction Facts'
    case 'multiply':
      return 'Multiplication Facts'
    case 'divide':
      return 'Division Facts'
    case 'mixed':
      return 'Mixed Math Facts'
  }
}

function sheetInstructions(params: MathFactsParams): string {
  if (params.layout === 'vertical') return 'Solve each problem. Write your answer below the line.'
  if (params.missing === 'answer') return 'Solve each problem. Write the answer on the line.'
  if (params.missing === 'operand') return 'Write the missing number on each line to make the equation true.'
  return 'Fill in each blank to make the equation true.'
}

/** How many rows of problems fit on one US Letter page. */
function rowsPerPage(layout: LayoutParam): number {
  return layout === 'vertical' ? 6 : 14
}

function chunk<T>(items: readonly T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size))
  }
  return pages
}

function Slot({ value, blank }: { value: number; blank: boolean }) {
  return blank ? <span className="write-line" /> : <>{value}</>
}

function HorizontalProblem({ problem: p, number }: { problem: MathFactProblem; number: number }) {
  return (
    <div className="problem">
      <span className="problem-number">{number}.</span>
      <Slot value={p.a} blank={p.blank === 'a'} /> {OP_SYMBOL[p.op]}{' '}
      <Slot value={p.b} blank={p.blank === 'b'} /> ={' '}
      <Slot value={p.answer} blank={p.blank === 'answer'} />
    </div>
  )
}

function VerticalProblem({ problem: p, number }: { problem: MathFactProblem; number: number }) {
  return (
    <div className="problem math-facts-vproblem">
      <span className="problem-number">{number}.</span>
      <span className="vertical-op math-facts-vertical-op">
        <span className="op-row">{p.a}</span>
        <span className="op-row">
          {OP_SYMBOL[p.op]} {p.b}
        </span>
        <span className="op-rule op-answer-space" />
      </span>
    </div>
  )
}

function Sheet({ data, params }: SheetProps<MathFactsParams, MathFactsData>) {
  const perPage = rowsPerPage(params.layout) * params.columns
  const pages = chunk(data.problems, perPage)
  const title = sheetTitle(params.operation)
  const gridStyle = { '--cols': params.columns } as CSSProperties
  return (
    <>
      {pages.map((page, pageIndex) => (
        <SheetPage
          key={pageIndex}
          title={pages.length > 1 ? `${title} (page ${pageIndex + 1} of ${pages.length})` : title}
          instructions={sheetInstructions(params)}
        >
          {params.timed && pageIndex === 0 && (
            <div className="math-facts-timed">
              Time: <span className="math-facts-time-blank" />
            </div>
          )}
          <div className="problems-grid" style={gridStyle}>
            {page.map((p, i) => {
              const number = pageIndex * perPage + i + 1
              return params.layout === 'vertical' ? (
                <VerticalProblem key={number} problem={p} number={number} />
              ) : (
                <HorizontalProblem key={number} problem={p} number={number} />
              )
            })}
          </div>
        </SheetPage>
      ))}
    </>
  )
}

function KeyValue({ value, filled }: { value: number; filled: boolean }) {
  return filled ? <strong>{value}</strong> : <>{value}</>
}

function AnswerKey({ data, params }: SheetProps<MathFactsParams, MathFactsData>) {
  return (
    <AnswerKeyPage title={sheetTitle(params.operation)}>
      <ol className="answer-list">
        {data.problems.map((p, i) => (
          <li key={i}>
            <span className="problem-number">{i + 1}.</span>
            <KeyValue value={p.a} filled={p.blank === 'a'} /> {OP_SYMBOL[p.op]}{' '}
            <KeyValue value={p.b} filled={p.blank === 'b'} /> ={' '}
            <KeyValue value={p.answer} filled={p.blank === 'answer'} />
          </li>
        ))}
      </ol>
    </AnswerKeyPage>
  )
}

/* ---------------- definition ---------------- */

export const def: GeneratorDef<MathFactsParams, MathFactsData> = {
  slug: 'math-facts',
  name: 'Math Facts Drill',
  description:
    'Drill sheets for the addition, subtraction, multiplication, and division facts — horizontal or stacked, with optional missing numbers and a timed-test box.',
  strand: 'memorization',
  ages: [5, 9],
  schema: [
    {
      kind: 'select',
      key: 'operation',
      label: 'Operation',
      options: [
        { value: 'add', label: 'Addition' },
        { value: 'subtract', label: 'Subtraction' },
        { value: 'multiply', label: 'Multiplication' },
        { value: 'divide', label: 'Division' },
        { value: 'mixed', label: 'Mixed (all four)' },
      ],
    },
    { kind: 'number', key: 'count', label: 'Number of problems', min: 10, max: 60 },
    {
      kind: 'number',
      key: 'maxOperand',
      label: 'Largest number',
      min: 5,
      max: 12,
      help: 'Largest addend or factor. Subtraction and division stay inside the matching fact family.',
    },
    {
      kind: 'select',
      key: 'missing',
      label: 'Blank position',
      options: [
        { value: 'answer', label: 'Answer' },
        { value: 'operand', label: 'Missing operand' },
        { value: 'mixed', label: 'Mixed' },
      ],
      help: 'Where the blank goes, e.g. 4 + __ = 7. Vertical layout always blanks the answer.',
    },
    {
      kind: 'select',
      key: 'layout',
      label: 'Layout',
      options: [
        { value: 'horizontal', label: 'Horizontal (4 + 3 = __)' },
        { value: 'vertical', label: 'Vertical (stacked)' },
      ],
    },
    { kind: 'number', key: 'columns', label: 'Columns', min: 2, max: 5 },
    {
      kind: 'boolean',
      key: 'timed',
      label: 'Timed test',
      help: 'Adds a "Time:" box to fill in by hand — use any kitchen timer or watch.',
    },
  ],
  defaults: {
    operation: 'add',
    count: 30,
    maxOperand: 9,
    missing: 'answer',
    layout: 'horizontal',
    columns: 4,
    timed: false,
  },
  generate,
  Sheet,
  AnswerKey,
  presets: [
    {
      id: 'first-facts',
      name: 'First addition facts',
      description: 'Sums within 10, written horizontally — follow-up work after the addition strip board lesson.',
      params: {
        operation: 'add',
        count: 20,
        maxOperand: 5,
        missing: 'answer',
        layout: 'horizontal',
        columns: 4,
        timed: false,
      },
    },
    {
      id: 'times-tables',
      name: 'Times tables to 10',
      description: 'Stacked multiplication facts through 10 × 10 — after work with the multiplication bead board.',
      params: {
        operation: 'multiply',
        count: 30,
        maxOperand: 10,
        missing: 'answer',
        layout: 'vertical',
        columns: 5,
        timed: false,
      },
    },
    {
      id: 'mixed-review',
      name: 'Mixed timed review',
      description: 'All four operations shuffled, with a time box — for a child who has met all the fact boards.',
      params: {
        operation: 'mixed',
        count: 40,
        maxOperand: 9,
        missing: 'answer',
        layout: 'horizontal',
        columns: 4,
        timed: true,
      },
    },
  ],
}
