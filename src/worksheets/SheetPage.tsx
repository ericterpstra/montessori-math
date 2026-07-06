import type { ReactNode } from 'react'

export interface SheetPageProps {
  title: string
  /** Italic line under the header telling the child what to do. */
  instructions?: string
  /** Show the Name/Date blanks (off for answer keys). */
  nameDate?: boolean
  children: ReactNode
}

/**
 * One printed page (US Letter). Every worksheet generator wraps each of its
 * pages in this so headers and page breaks are consistent.
 */
export function SheetPage({ title, instructions, nameDate = true, children }: SheetPageProps) {
  return (
    <section className="sheet-page">
      <header className="sheet-header">
        <h2 className="sheet-title">{title}</h2>
        {nameDate && (
          <div className="name-date">
            Name <span className="blank" /> Date <span className="blank short" />
          </div>
        )}
      </header>
      {instructions && <p className="sheet-instructions">{instructions}</p>}
      {children}
    </section>
  )
}

export function AnswerKeyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SheetPage title={`${title} — Answer Key`} nameDate={false}>
      {children}
    </SheetPage>
  )
}
