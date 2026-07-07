/**
 * Renders logical booklet pages as printable saddle-stitch sheets. Sides
 * alternate front, back, front, back… so a duplex printer collates correctly.
 * Page numbers at the outer bottom corners double as the control of error:
 * after folding, the book must read 1, 2, 3… in order.
 */
import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { imposeBooklet } from '../lib/booklet'

/**
 * Forces landscape US Letter for the WHOLE document while mounted (overrides
 * the portrait @page rule in src/styles/print.css). Booklet and portrait
 * sheets therefore cannot mix in one print job — generators must render ONLY
 * booklet output (and no answer key) when a booklet is shown.
 */
export function LandscapePage() {
  return <style>{'@page { size: letter landscape; margin: 0.5in; }'}</style>
}

function Half({ pageNumber, side, content }: { pageNumber: number; side: 'left' | 'right'; content: ReactNode }) {
  return (
    <div className={`booklet-half booklet-half-${side}`}>
      {content}
      {pageNumber > 0 && <span className="booklet-pagenum">{pageNumber}</span>}
    </div>
  )
}

export interface BookletFrameProps {
  /** Logical content pages in reading order; pages[0] is book page 1 (the cover). */
  pages: ReactNode[]
  /** Book title, shown in the on-screen banner. */
  title: string
}

export function BookletFrame({ pages, title }: BookletFrameProps) {
  const sheets = imposeBooklet(pages.length)
  const content = (n: number): ReactNode => (n >= 1 && n <= pages.length ? pages[n - 1] : null)
  const side = (halves: [number, number], label: string) => (
    <section className="sheet-page booklet-sheet" aria-label={label}>
      <Half pageNumber={halves[0]} side="left" content={content(halves[0])} />
      <Half pageNumber={halves[1]} side="right" content={content(halves[1])} />
      <div className="booklet-fold-line" aria-hidden="true" />
    </section>
  )
  return (
    <>
      <LandscapePage />
      <p className="booklet-banner no-print">
        <strong>{title}</strong> — Print double-sided, flip on <strong>SHORT</strong> edge. Fold the stack in half;
        staple twice on the fold.
      </p>
      {sheets.map((sheet, i) => (
        <Fragment key={i}>
          {side(sheet.front, `Sheet ${i + 1} front`)}
          {side(sheet.back, `Sheet ${i + 1} back`)}
        </Fragment>
      ))}
    </>
  )
}
