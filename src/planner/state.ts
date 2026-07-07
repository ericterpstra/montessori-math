/**
 * Weekly work plan — pure model. The entire plan lives in the page URL;
 * nothing is ever stored. parse/serialize must round-trip exactly.
 */

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Day = (typeof DAYS)[number]

export const DAY_LABELS: Record<Day, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export interface PlanItem {
  kind: 'lesson' | 'sheet' | 'material'
  slug: string
  /** Sheets only: a preset id inside that generator. */
  presetId?: string
  day?: Day
}

export interface Plan {
  items: PlanItem[]
  /** YYYY-MM-DD, optional, typed by the parent. Display only — never auto-set. */
  weekOf?: string
}

/** Everything that exists on the site, for validating URL tokens. */
export interface PlanValidity {
  lessons: Set<string>
  sheets: Set<string>
  /** generator slug -> its preset ids */
  presets: Map<string, Set<string>>
  materials: Set<string>
}

const WEEK_RE = /^\d{4}-\d{2}-\d{2}$/

function asDay(raw: string | undefined): Day | undefined {
  return raw !== undefined && (DAYS as readonly string[]).includes(raw) ? (raw as Day) : undefined
}

/**
 * Parse a plan from URL search params. Unknown slugs/presets/days are
 * silently dropped (bad day / preset keeps the item; bad slug drops it).
 * Item order is preserved. Params other than l/s/m/w (e.g. bw) are ignored.
 */
export function parsePlan(search: URLSearchParams, valid: PlanValidity): Plan {
  const items: PlanItem[] = []
  let weekOf: string | undefined
  for (const [key, value] of search) {
    if (key === 'w') {
      if (WEEK_RE.test(value)) weekOf = value
      continue
    }
    if (key !== 'l' && key !== 's' && key !== 'm') continue
    const colon = value.indexOf(':')
    const head = colon === -1 ? value : value.slice(0, colon)
    const day = asDay(colon === -1 ? undefined : value.slice(colon + 1))
    if (key === 'l') {
      if (!valid.lessons.has(head)) continue
      items.push(day ? { kind: 'lesson', slug: head, day } : { kind: 'lesson', slug: head })
    } else if (key === 'm') {
      if (!valid.materials.has(head)) continue
      items.push(day ? { kind: 'material', slug: head, day } : { kind: 'material', slug: head })
    } else {
      const dot = head.indexOf('.')
      const slug = dot === -1 ? head : head.slice(0, dot)
      const presetRaw = dot === -1 ? undefined : head.slice(dot + 1)
      if (!valid.sheets.has(slug)) continue
      const presetId =
        presetRaw !== undefined && valid.presets.get(slug)?.has(presetRaw) ? presetRaw : undefined
      const item: PlanItem = { kind: 'sheet', slug }
      if (presetId) item.presetId = presetId
      if (day) item.day = day
      items.push(item)
    }
  }
  return weekOf !== undefined ? { items, weekOf } : { items }
}

/**
 * Serialize to a query string (no leading '?'), items in order, w last.
 * No percent-encoding: every token is a validated kebab-case identifier,
 * a fixed day token, or YYYY-MM-DD — all URL-safe as-is.
 */
export function serializePlan(plan: Plan): string {
  const parts: string[] = []
  for (const item of plan.items) {
    const key = item.kind === 'lesson' ? 'l' : item.kind === 'sheet' ? 's' : 'm'
    let v = item.slug
    if (item.kind === 'sheet' && item.presetId) v += `.${item.presetId}`
    if (item.day) v += `:${item.day}`
    parts.push(`${key}=${v}`)
  }
  if (plan.weekOf) parts.push(`w=${plan.weekOf}`)
  return parts.join('&')
}

/** Split journal rows into printed pages: 0→[], 12→[12], 13→[12,1], 25→[12,12,1]. */
export function chunkJournal(items: PlanItem[], perPage = 12): PlanItem[][] {
  const pages: PlanItem[][] = []
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage))
  return pages
}
