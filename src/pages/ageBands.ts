/**
 * The three age bands used by the home page and /ages. One list, so the
 * home entries and the /ages tabs can never disagree. Pure data.
 */
export interface AgeBand {
  /** URL value for /ages?band=… */
  id: '4-6' | '6-9' | '9-12'
  /** 'Ages 4–6' */
  ages: string
  /** 'PK–K', 'Grades 1–3' */
  grades: string
  min: number
  max: number
  /** One sentence for the home entry. */
  blurb: string
  /** MaterialThumb slug of the stage's signature material. */
  thumb: string
}

export const AGE_BANDS: readonly AgeBand[] = [
  {
    id: '4-6',
    ages: 'Ages 4–6',
    grades: 'PK–K',
    min: 4,
    max: 6,
    blurb: 'Counting real things, the bead stair, teens and tens, and the first golden beads.',
    thumb: 'bead-stair',
  },
  {
    id: '6-9',
    ages: 'Ages 6–9',
    grades: 'Grades 1–3',
    min: 6,
    max: 9,
    blurb: 'The four operations with beads and stamps, memorizing facts, first fractions.',
    thumb: 'stamp-game',
  },
  {
    id: '9-12',
    ages: 'Ages 9–12',
    grades: 'Grades 4–6',
    min: 9,
    max: 12,
    blurb: 'Long multiplication and division, the checkerboard, racks & tubes, and decimals.',
    thumb: 'checkerboard',
  },
]

/** True when an item's inclusive age range touches the band. */
export function overlapsBand(ages: readonly [number, number], band: Pick<AgeBand, 'min' | 'max'>): boolean {
  return ages[0] <= band.max && ages[1] >= band.min
}
