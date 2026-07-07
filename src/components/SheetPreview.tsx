import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/** 8.5in at CSS 96dpi — the fixed width of a `.sheet-page`. */
const PAGE_WIDTH_PX = 816

/**
 * On-screen wrapper for US-Letter `.print-sheet` previews: scales pages down
 * so the whole sheet is visible without sideways scrolling. Printing is
 * unaffected (`print.css` forces zoom back to 1).
 */
export function SheetPreview({
  bw = false,
  className,
  children,
}: {
  bw?: boolean
  /** Extra classes for the inner `.print-sheet` element. */
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setZoom(Math.min(1, el.clientWidth / PAGE_WIDTH_PX))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="sheet-preview">
      <div className={`print-sheet${className ? ` ${className}` : ''}${bw ? ' bw' : ''}`} style={{ zoom }}>
        {children}
      </div>
    </div>
  )
}
