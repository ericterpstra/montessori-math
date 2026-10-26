/**
 * /print-all — pure logic for the cross-browser print check: which printables
 * the page lists, the settings it reads from its URL, and the name each PDF
 * is saved under. Browsers fill "Save as PDF" from document.title, so the
 * name carries the sheet, its settings and the browser, and the Safari and
 * Chrome files for one sheet sort side by side.
 */
import { GENERATORS } from '../worksheets/registry'
import { KITS } from '../kits/registry'

/** The seed the October 2026 print audit used, so new PDFs line up with its notes. */
export const DEFAULT_SEED = 424242

export interface PrintAllSettings {
  seed: number
  /** Ink-friendly black & white (the `.bw` sheet class). */
  bw: boolean
  /** Answer key pages after each worksheet. */
  key: boolean
  /** Every worksheet preset, not only each generator's default settings. */
  presets: boolean
  kits: boolean
}

export interface PrintAllItem {
  /** Unique, and the start of the item's PDF name: 'numeral-tracing', 'numeral-tracing--first-numerals', 'kit-play-money'. */
  id: string
  kind: 'worksheet' | 'kit'
  slug: string
  presetId?: string
  name: string
  /** 'Default settings', 'Preset: First numerals 0–9' or 'Kit'. */
  variant: string
}

/** Settings from the page's query string; anything missing or malformed falls back to the default. */
export function readSettings(searchParams: URLSearchParams): PrintAllSettings {
  const rawSeed = searchParams.get('seed')
  return {
    seed: rawSeed !== null && /^\d{1,10}$/.test(rawSeed) ? Number(rawSeed) : DEFAULT_SEED,
    bw: searchParams.get('bw') === '1',
    key: searchParams.get('key') !== '0',
    presets: searchParams.get('presets') === '1',
    kits: searchParams.get('kits') !== '0',
  }
}

/** Every printable the settings select: each worksheet (and its presets), then each kit. */
export function printAllItems(settings: Pick<PrintAllSettings, 'presets' | 'kits'>): PrintAllItem[] {
  const items: PrintAllItem[] = []
  for (const g of GENERATORS) {
    items.push({ id: g.slug, kind: 'worksheet', slug: g.slug, name: g.name, variant: 'Default settings' })
    if (!settings.presets) continue
    for (const p of g.presets) {
      items.push({
        id: `${g.slug}--${p.id}`,
        kind: 'worksheet',
        slug: g.slug,
        presetId: p.id,
        name: g.name,
        variant: `Preset: ${p.name}`,
      })
    }
  }
  if (settings.kits) {
    for (const k of KITS) items.push({ id: `kit-${k.slug}`, kind: 'kit', slug: k.slug, name: k.name, variant: 'Kit' })
  }
  return items
}

/**
 * The item's own page with the same settings, where a parent would print it.
 * For a worksheet, its query string is also what resolveParams reads.
 */
export function itemHref(item: PrintAllItem, settings: PrintAllSettings): string {
  const q = new URLSearchParams()
  if (item.kind === 'kit') {
    q.set('bw', settings.bw ? '1' : '0')
    return `/kits/${item.slug}?${q}`
  }
  if (item.presetId) q.set('preset', item.presetId)
  q.set('seed', String(settings.seed))
  q.set('key', settings.key ? '1' : '0')
  q.set('bw', settings.bw ? '1' : '0')
  return `/worksheets/${item.slug}?${q}`
}

/**
 * A short name for the browser, from its user agent: 'chrome', 'safari',
 * 'firefox', 'edge', prefixed 'ios-' on iPhone and iPad (every iOS browser
 * prints through WebKit). iPadOS asks for desktop pages as a Mac, so a
 * touch screen on a "Macintosh" is an iPad.
 */
export function browserLabel(userAgent: string, maxTouchPoints = 0): string {
  const ios = /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
  const name = /Edg(A|iOS)?\//.test(userAgent)
    ? 'edge'
    : /Firefox\/|FxiOS\//.test(userAgent)
      ? 'firefox'
      : /Chrome\/|CriOS\/|Chromium\//.test(userAgent)
        ? 'chrome'
        : /Safari\//.test(userAgent)
          ? 'safari'
          : 'browser'
  return ios ? `ios-${name}` : name
}

/**
 * The PDF's name (without .pdf): one item, or everything (`item` null).
 * 'numeral-tracing-bw-seed424242-safari', 'kit-play-money-color-chrome',
 * 'all-worksheets-presets-kits-color-nokey-seed7-ios-safari'.
 */
export function pdfName(item: PrintAllItem | null, settings: PrintAllSettings, browser: string): string {
  const what = item
    ? item.id
    : ['all-worksheets', settings.presets && 'presets', settings.kits && 'kits'].filter(Boolean).join('-')
  const hasWorksheets = item === null || item.kind === 'worksheet'
  return [
    what,
    settings.bw ? 'bw' : 'color',
    hasWorksheets && !settings.key && 'nokey',
    hasWorksheets && `seed${settings.seed}`,
    browser,
  ]
    .filter(Boolean)
    .join('-')
}
