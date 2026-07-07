import type { KitMeta } from './types'
import { SheetPage } from '../worksheets/SheetPage'

/** Every kit's first page: inventory, calibration square, cut legend. */
export function KitCover({ kit }: { kit: KitMeta }) {
  return (
    <SheetPage title={`${kit.name} — Kit`} nameDate={false}>
      <p>
        <strong>In this kit:</strong> {kit.pieces}.
      </p>
      <div className="kit-cal-row">
        <div className="kit-calibration" />
        <p className="kit-legend">
          Print at 100% scale (“Actual size” — turn off “Fit to page”). This square must measure exactly 1 inch
          (2.54 cm) on each side. If it doesn’t, fix the print scale before cutting.
        </p>
      </div>
      <p className="kit-legend">✂ Cut along dashed lines; pieces with a colored frame are cut around the frame.</p>
    </SheetPage>
  )
}
