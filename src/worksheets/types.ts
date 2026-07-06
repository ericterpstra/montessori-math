import type { ComponentType } from 'react'
import type { RNG } from '../lib/rng'
import type { StrandId } from '../lib/strands'

/** One field in a generator's parameter form (form UI is auto-rendered). */
export type ParamField =
  | { kind: 'number'; key: string; label: string; min: number; max: number; step?: number; help?: string }
  | { kind: 'select'; key: string; label: string; options: { value: string; label: string }[]; help?: string }
  | { kind: 'boolean'; key: string; label: string; help?: string }

export type ParamValues = Record<string, number | string | boolean>

export interface WorksheetPreset {
  id: string
  name: string
  /** When to reach for this preset, e.g. 'After the stamp game addition lesson.' */
  description: string
  params: ParamValues
}

export interface SheetProps<P extends ParamValues, D> {
  data: D
  params: P
}

/**
 * A worksheet generator. `generate` must be PURE — all randomness through
 * the provided RNG — so tests can verify answers and seeds reproduce sheets.
 */
export interface GeneratorDef<P extends ParamValues = ParamValues, D = unknown> {
  slug: string
  name: string
  /** One sentence for index cards. */
  description: string
  strand: StrandId
  ages: [number, number]
  schema: ParamField[]
  defaults: P
  generate(params: P, rng: RNG): D
  /** Renders the student pages. Wrap each printed page in `.sheet-page`. */
  Sheet: ComponentType<SheetProps<P, D>>
  /** Renders the answer key (its own `.sheet-page`). */
  AnswerKey: ComponentType<SheetProps<P, D>>
  presets: WorksheetPreset[]
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry holds heterogeneous generators */
export type AnyGeneratorDef = GeneratorDef<any, any>
