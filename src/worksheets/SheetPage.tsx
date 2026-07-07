import type { ReactNode } from 'react'
import { ThemeContext, ThemeDecoration, useSheetTheme } from './themes'

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
 * pages in this so headers and page breaks are consistent. An optional
 * decorative theme arrives via ThemeContext (default 'none').
 */
export function SheetPage({ title, instructions, nameDate = true, children }: SheetPageProps) {
  const theme = useSheetTheme()
  const themed = theme !== 'none'
  return (
    <section className="sheet-page">
      <header className={`sheet-header${themed ? ' themed' : ''}`}>
        {themed && <ThemeDecoration theme={theme} side="left" />}
        <h2 className="sheet-title">{title}</h2>
        {nameDate && (
          <div className="name-date">
            Name <span className="blank" /> Date <span className="blank short" />
          </div>
        )}
        {themed && <ThemeDecoration theme={theme} side="right" />}
      </header>
      {instructions && <p className="sheet-instructions">{instructions}</p>}
      {children}
    </section>
  )
}

/** Answer keys are NEVER themed: a nested provider forces 'none'. */
export function AnswerKeyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ThemeContext.Provider value="none">
      <SheetPage title={`${title} — Answer Key`} nameDate={false}>
        {children}
      </SheetPage>
    </ThemeContext.Provider>
  )
}
