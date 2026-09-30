import type { ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import { PrintButton } from '../components/PrintButton'

export interface GuideHeaderProps {
  /** The guide's h1 (also the browser-tab name). */
  title: string
  /** The lede: inline content only (it renders inside a <p>). */
  children: ReactNode
}

/**
 * How every parent guide opens (PRD 19): the shared PageHeader with the
 * title, a 21px ink lede, and Print at the top right.
 */
export function GuideHeader({ title, children }: GuideHeaderProps) {
  return (
    <PageHeader
      className="guide-header"
      title={title}
      lede={children}
      actions={<PrintButton label="Print this guide" />}
    />
  )
}
