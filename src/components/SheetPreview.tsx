import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/** 8.5in at CSS 96dpi — the fixed width of a `.sheet-page`. */
const PAGE_WIDTH_PX = 816

/**
 * On-screen wrapper for US-Letter `.print-sheet` previews: scales pages down
 * so the whole sheet is visible without sideways scrolling. With `desk`, the
 * pages lie on a desk surface with a paper shadow (worksheets.css, screen
 * only). Printing is unaffected: print.css forces zoom back to 1, and every
 * desk rule sits inside @media screen.
 */
export function SheetPreview({
  bw = false,
  className,
  desk = false,
  children,
}: {
  bw?: boolean
  /** Extra classes for the inner `.print-sheet` element. */
  className?: string
  /** Lay the pages on the desk surface (builder, kit and planner previews). */
  desk?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Fit the page to the content box, so the desk's padding never pushes a
    // page past the edge.
    const measure = () => {
      const style = getComputedStyle(el)
      const inner = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      if (inner > 0) setZoom(Math.min(1, inner / PAGE_WIDTH_PX))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`sheet-preview${desk ? ' on-desk' : ''}`}>
      <div className={`print-sheet${className ? ` ${className}` : ''}${bw ? ' bw' : ''}`} style={{ zoom }}>
        {children}
      </div>
    </div>
  )
}
