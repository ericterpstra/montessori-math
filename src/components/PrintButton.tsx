import { Icon } from './Icon'

/** The page's print action: the rubric primary button with the print glyph. */
export function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button type="button" className="btn primary has-icon no-print" onClick={() => window.print()}>
      <Icon name="print" />
      <span className="btn-label">{label}</span>
    </button>
  )
}
