/**
 * Worksheet parameter resolution — pure, so it can be tested without React.
 * This is the only path by which URL text becomes the params a generator runs on,
 * which makes it the right place to guarantee generators never see a value their
 * loop bounds can't handle.
 */
import type { AnyGeneratorDef, ParamValues } from './types'

/**
 * Every number param on this site is a whole count, so round before clamping:
 * a fractional URL value (?count=6.5) would otherwise reach a generator's loop
 * bounds, where `while (ns.length < 6.5)` can never terminate.
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)))
}

/**
 * A number field's text while the parent is still typing: the value to apply
 * to the sheet now, or null to leave it alone. Empty or out-of-range text is
 * often a prefix of what is coming ("2" on the way to "25" in a 10–60 field),
 * so it waits for blur/Enter instead of being clamped mid-keystroke.
 */
export function draftNumber(text: string, min: number, max: number): number | null {
  if (text.trim() === '') return null
  const n = Number(text)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return clamp(n, min, max)
}

/**
 * A number field's text once editing ends (blur or Enter): clamped into range,
 * or null — keep the current value — when it is empty or not a number.
 */
export function commitNumber(text: string, min: number, max: number): number | null {
  if (text.trim() === '') return null
  const n = Number(text)
  return Number.isFinite(n) ? clamp(n, min, max) : null
}

/** Defaults ← preset (?preset=) ← individual URL params. */
export function resolveParams(def: AnyGeneratorDef, searchParams: URLSearchParams): ParamValues {
  let params: ParamValues = { ...def.defaults }
  const presetId = searchParams.get('preset')
  if (presetId) {
    const preset = def.presets.find((p) => p.id === presetId)
    if (preset) params = { ...params, ...preset.params }
  }
  for (const field of def.schema) {
    const raw = searchParams.get(field.key)
    if (raw === null) continue
    if (field.kind === 'number') {
      const n = Number(raw)
      if (Number.isFinite(n)) params[field.key] = clamp(n, field.min, field.max)
    } else if (field.kind === 'boolean') {
      params[field.key] = raw === '1' || raw === 'true'
    } else if (field.options.some((o) => o.value === raw)) {
      params[field.key] = raw
    }
  }
  return params
}
