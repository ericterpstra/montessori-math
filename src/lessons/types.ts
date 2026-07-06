import type { StrandId } from '../lib/strands'

export interface PresentationStep {
  /** What the adult does. */
  text: string
  /** Suggested language, spoken exactly, e.g. 'This is one thousand.' */
  say?: string
}

export interface FollowUpWork {
  /** Pencil-and-paper or hands-on activity — never on-screen work. */
  description: string
  /** Worksheet generator slug, if a printable supports this work. */
  worksheetSlug?: string
  /** Preset id inside that generator, if one fits. */
  presetId?: string
}

/** A full album-style Montessori lesson, written for parents. */
export interface Lesson {
  slug: string
  name: string
  strand: StrandId
  /** Order within the strand's sequence (1 = first). */
  sequence: number
  ages: [number, number]
  grades: string
  /** 1–2 sentences: what this lesson is and where it fits. */
  overview: string
  /** Physical materials, incl. household substitutes where sensible. */
  materialsNeeded: string[]
  /** Virtual material slugs on this site that can stand in. */
  virtualMaterials: string[]
  /** Lesson slugs that should come first. */
  prerequisites: string[]
  directAims: string[]
  indirectAims: string[]
  presentation: PresentationStep[]
  pointsOfInterest: string[]
  controlOfError: string[]
  vocabulary: string[]
  variations: string[]
  extensions: string[]
  /** Prose pointing to the next lesson(s) in the child's path. */
  whatComesNext: string
  followUpWork: FollowUpWork[]
}
