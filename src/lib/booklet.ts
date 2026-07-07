/**
 * Saddle-stitch booklet imposition. Content pages are 1-indexed; a physical
 * US Letter sheet printed landscape holds two half-letter pages per side.
 * Print the sides in order double-sided (flip on the SHORT edge), fold the
 * stack in half, staple twice on the fold.
 */

export interface BookletSheet {
  /** [left half, right half] content page numbers for the sheet's front side; 0 = blank. */
  front: [number, number]
  /** [left half, right half] content page numbers for the sheet's back side; 0 = blank. */
  back: [number, number]
}

/**
 * Impose `pageCount` content pages onto physical sheets. `pageCount` is padded
 * up to a multiple of 4 BEFORE imposition, so blanks land at the end of the
 * logical book (pages pageCount+1..N), encoded as 0.
 */
export function imposeBooklet(pageCount: number): BookletSheet[] {
  if (!Number.isInteger(pageCount) || pageCount <= 0) return []
  const n = Math.ceil(pageCount / 4) * 4
  const page = (p: number): number => (p <= pageCount ? p : 0)
  const sheets: BookletSheet[] = []
  for (let i = 0; i < n / 4; i++) {
    sheets.push({
      front: [page(n - 2 * i), page(1 + 2 * i)],
      back: [page(2 + 2 * i), page(n - 1 - 2 * i)],
    })
  }
  return sheets
}
