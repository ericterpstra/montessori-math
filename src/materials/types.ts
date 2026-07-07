import type { ComponentType, LazyExoticComponent } from 'react'
import type { DemoScript } from '../lessons/demo'
import type { StrandId } from '../lib/strands'

export interface MaterialDef {
  /** URL slug, kebab-case, e.g. 'golden-beads'. */
  slug: string
  name: string
  /** Inclusive age range, e.g. [4, 7]. */
  ages: [number, number]
  /** US grade label, e.g. 'PK–1'. */
  grades: string
  strand: StrandId
  /** One sentence for index cards. */
  summary: string
  /**
   * 2–4 sentences for parents: what the material teaches, what the child
   * does with it, and what it prepares them for.
   */
  parentNote: string
  /** The interactive itself, lazy-loaded per route. */
  component: LazyExoticComponent<ComponentType>
  /** Album lessons that present this material (slugs into the lesson registry). */
  lessonSlugs: string[]
  /** Related worksheet generators (slugs into the worksheet registry). */
  worksheetSlugs: string[]
  /** Presentation-mode scripts, keyed by lesson slug (see src/lessons/demo.ts). */
  demos?: Record<string, DemoScript>
}
