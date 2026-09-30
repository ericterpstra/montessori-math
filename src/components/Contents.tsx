import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { StrandInfo } from '../lib/strands'
import { BeadBar } from './beads'
import { Icon } from './Icon'
import { MaterialThumb } from './MaterialThumb'

/**
 * Contents pages (The Album): every hub lists its entries as a book's table
 * of contents. ChapterHead opens a strand; ContentsRow is one whole-row link.
 * Styles live in src/styles/contents.css.
 */

/** 'Ages 4–6 · PK–K': a strand's running meta, as on the chapter head. */
export function strandMeta(strand: Pick<StrandInfo, 'ages' | 'grades'>): string {
  return `Ages ${strand.ages[0]}–${strand.ages[1]} · ${strand.grades}`
}

export interface ChapterHeadProps {
  /** The strand this chapter holds; omit for an unnumbered chapter ("Beyond worksheets"). */
  strand?: StrandInfo
  /** Chapter name; defaults to the strand's name. */
  name?: ReactNode
  /** Right-hand meta; defaults to strandMeta(strand). Pass null for none. */
  meta?: ReactNode
  /** h2 on index pages, h3 under an /ages section head, span inside a table header cell. */
  as?: 'h2' | 'h3' | 'span'
  /** 'minor' is the smaller strand subhead used on /ages. */
  size?: 'major' | 'minor'
  className?: string
  id?: string
}

/** Rubric strand number, that strand's bead-stair bar, the name, and the ages meta. */
export function ChapterHead({ strand, name, meta, as: Tag = 'h2', size = 'major', className, id }: ChapterHeadProps) {
  const metaText = meta === undefined ? (strand ? strandMeta(strand) : null) : meta
  const cls = ['chapter-head', size === 'minor' ? 'minor' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <Tag id={id} className={cls}>
      {strand && <span className="chapter-num">{strand.order}</span>}
      {strand && <BeadBar n={strand.order} beadSize={12} className="strand-bar" />}
      <span className="chapter-name">{name ?? strand?.name}</span>
      {metaText && <span className="chapter-meta">{metaText}</span>}
    </Tag>
  )
}

/** The boxed age stamp, optionally followed by the grades: 'AGES 4–6  PK–K'. */
export function AgeMeta({ ages, grades }: { ages: readonly [number, number]; grades?: string }) {
  return (
    <>
      <span className="badge age">
        ages {ages[0]}–{ages[1]}
      </span>
      {grades && <span className="badge">{grades}</span>}
    </>
  )
}

export interface ContentsRowProps {
  to: string
  title: ReactNode
  /** Lead with a mounted plate: a MaterialThumb slug, or 'sheet' | 'kit' | 'album'. */
  thumb?: string
  /** Strand order for the plate's fallback drawing. */
  strandOrder?: number
  /** Lead with a rubric numeral instead of a plate (lessons, guides). */
  num?: number
  /** Small caps line under the title (home age bands). */
  titleMeta?: ReactNode
  summary?: ReactNode
  /** Right-aligned meta: <AgeMeta/>. */
  meta?: ReactNode
  /** Plain run-in line under the summary: presets, piece counts. Never a pill. */
  note?: ReactNode
  className?: string
}

/**
 * One contents entry: the whole row is a single link (≥72px tall) with the
 * title underlined at rest, a summary, right-aligned meta and a trailing arrow.
 */
export function ContentsRow({ to, title, thumb, strandOrder, num, titleMeta, summary, meta, note, className }: ContentsRowProps) {
  const lead = thumb ? 'lead-plate' : num !== undefined ? 'lead-num' : 'lead-none'
  return (
    <Link className={`contents-row ${lead}${className ? ` ${className}` : ''}`} to={to}>
      {thumb && <MaterialThumb slug={thumb} strandOrder={strandOrder} />}
      {!thumb && num !== undefined && <span className="row-num">{num}</span>}
      <span className="row-text">
        <span className="row-title">
          <span className="row-title-text">{title}</span>
          {titleMeta && <span className="row-title-meta">{titleMeta}</span>}
        </span>
        {summary && <span className="row-summary">{summary}</span>}
        {meta && <span className="row-meta">{meta}</span>}
        {note && <span className="row-note">{note}</span>}
      </span>
      <Icon name="arrow" className="row-arrow" />
    </Link>
  )
}
