import { useEffect } from 'react'
import type { ReactNode } from 'react'

/** The site name every page title ends with (and index.html's default title). */
export const SITE_NAME = 'Montessori Math'

/**
 * Names the browser tab, bookmark and "Save as PDF" file after the page:
 * "<name> · Montessori Math" while the calling page is mounted, restoring
 * the previous title on unmount. PageHeader calls it; pages that do not
 * render a PageHeader (the lesson album) call it directly.
 */
export function useDocumentTitle(name: string | undefined): void {
  useEffect(() => {
    if (!name) return
    const previous = document.title
    document.title = `${name} · ${SITE_NAME}`
    return () => {
      document.title = previous
    }
  }, [name])
}

export interface PageHeaderProps {
  /** The page's h1. */
  title: ReactNode
  /**
   * Plain-text name for the browser tab, bookmarks and "Save as PDF"
   * (document.title becomes "<docTitle> · Montessori Math"). Defaults to
   * `title` when that is a string; pass it whenever `title` is not.
   */
  docTitle?: string
  /** Small rubric capitals above the title. */
  kicker?: ReactNode
  /** The running meta line under the title: .badge spans (boxed age, grades, strand). */
  meta?: ReactNode
  /** The ink lede. Rendered inside <p className="page-lede">, so pass inline content only. */
  lede?: ReactNode
  /** The page's own actions, top right on desktop (Print, Walk through, New problems). */
  actions?: ReactNode
  /** Extra blocks under the lede, inside the header's main column. */
  children?: ReactNode
  /** Extra class on the <header>, e.g. 'guide-header'. */
  className?: string
  /** id for the h1, for aria-labelledby. */
  titleId?: string
}

/**
 * One page-header pattern for every page type: title, meta line, lede, and
 * the page's primary action in the top-right slot (stacked under the lede
 * at ≤760px). Styles live in src/styles/layout.css.
 */
export function PageHeader({ title, docTitle, kicker, meta, lede, actions, children, className, titleId }: PageHeaderProps) {
  useDocumentTitle(docTitle ?? (typeof title === 'string' ? title : undefined))

  return (
    <header className={`page-header${actions ? ' has-actions' : ''}${className ? ` ${className}` : ''}`}>
      <div className="page-header-main">
        {kicker && <p className="page-kicker">{kicker}</p>}
        <h1 id={titleId}>{title}</h1>
        {meta && <p className="page-meta meta-line">{meta}</p>}
        {lede && <p className="page-lede">{lede}</p>}
        {children}
      </div>
      {actions && <div className="page-header-actions no-print">{actions}</div>}
    </header>
  )
}
