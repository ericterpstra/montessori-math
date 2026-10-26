import { describe, expect, it } from 'vitest'
import { DEFAULT_SEED, browserLabel, itemHref, pdfName, printAllItems, readSettings } from './printAll'
import type { PrintAllSettings } from './printAll'
import { GENERATORS } from '../worksheets/registry'
import { KITS } from '../kits/registry'
import { resolveParams } from '../worksheets/params'

const defaults: PrintAllSettings = { seed: DEFAULT_SEED, bw: false, key: true, presets: false, kits: true }

describe('readSettings', () => {
  it('defaults to color, answer keys, default worksheets and the kits at the audit seed', () => {
    expect(readSettings(new URLSearchParams())).toEqual(defaults)
  })

  it('reads every setting from the query string', () => {
    expect(readSettings(new URLSearchParams('seed=7&bw=1&key=0&presets=1&kits=0'))).toEqual({
      seed: 7,
      bw: true,
      key: false,
      presets: true,
      kits: false,
    })
  })

  it('falls back to the default seed for anything but a whole number', () => {
    for (const seed of ['', '-1', '6.5', 'abc', '1e3', '12345678901']) {
      expect(readSettings(new URLSearchParams({ seed })).seed, seed).toBe(DEFAULT_SEED)
    }
  })
})

describe('printAllItems', () => {
  it('lists each worksheet at its defaults, then each kit', () => {
    const items = printAllItems(defaults)
    expect(items.map((i) => i.id)).toEqual([...GENERATORS.map((g) => g.slug), ...KITS.map((k) => `kit-${k.slug}`)])
  })

  it('adds every preset after its worksheet’s defaults', () => {
    const items = printAllItems({ presets: true, kits: false })
    const presetCount = GENERATORS.reduce((n, g) => n + g.presets.length, 0)
    expect(items).toHaveLength(GENERATORS.length + presetCount)
    const tracing = GENERATORS[0]
    expect(items.slice(0, 1 + tracing.presets.length).map((i) => i.presetId)).toEqual([
      undefined,
      ...tracing.presets.map((p) => p.id),
    ])
    expect(items.every((i) => i.kind === 'worksheet')).toBe(true)
  })

  it('gives every item a unique id that is safe in a file name', () => {
    const ids = printAllItems({ presets: true, kits: true }).map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-{1,2}[a-z0-9]+)*$/)
  })
})

describe('itemHref', () => {
  it('opens a preset worksheet on its builder with the same settings', () => {
    const item = printAllItems({ presets: true, kits: false }).find((i) => i.presetId)!
    const href = itemHref(item, { ...defaults, bw: true, key: false, seed: 9 })
    expect(href).toBe(`/worksheets/${item.slug}?preset=${item.presetId}&seed=9&key=0&bw=1`)
  })

  it('gives the builder the same params the print check renders', () => {
    for (const item of printAllItems({ presets: true, kits: false })) {
      const def = GENERATORS.find((g) => g.slug === item.slug)!
      const query = new URLSearchParams(itemHref(item, defaults).split('?')[1])
      const preset = item.presetId ? def.presets.find((p) => p.id === item.presetId)!.params : {}
      expect(resolveParams(def, query), item.id).toEqual({ ...def.defaults, ...preset })
    }
  })

  it('opens a kit on its own page in the same color mode', () => {
    const kit = printAllItems(defaults).find((i) => i.kind === 'kit')!
    expect(itemHref(kit, defaults)).toBe(`/kits/${kit.slug}?bw=0`)
  })
})

const UA = {
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Safari/605.1.15',
  macChrome:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
  firefox: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.0.0 Mobile/15E148 Safari/604.1',
}

describe('browserLabel', () => {
  it('names desktop browsers', () => {
    expect(browserLabel(UA.macSafari)).toBe('safari')
    expect(browserLabel(UA.macChrome)).toBe('chrome')
    expect(browserLabel(UA.edge)).toBe('edge')
    expect(browserLabel(UA.firefox)).toBe('firefox')
  })

  it('marks iPhone and iPad browsers, including an iPad asking for the desktop site', () => {
    expect(browserLabel(UA.iphoneSafari, 5)).toBe('ios-safari')
    expect(browserLabel(UA.iphoneChrome, 5)).toBe('ios-chrome')
    expect(browserLabel(UA.macSafari, 5)).toBe('ios-safari')
  })

  it('falls back to a generic name', () => {
    expect(browserLabel('')).toBe('browser')
  })
})

describe('pdfName', () => {
  const items = printAllItems({ presets: true, kits: true })
  const tracing = items[0]
  const preset = items.find((i) => i.presetId)!
  const kit = items.find((i) => i.kind === 'kit')!

  it('names one worksheet by slug, ink, seed and browser', () => {
    expect(pdfName(tracing, defaults, 'safari')).toBe(`${tracing.slug}-color-seed${DEFAULT_SEED}-safari`)
    expect(pdfName(preset, { ...defaults, bw: true, key: false, seed: 7 }, 'chrome')).toBe(
      `${preset.slug}--${preset.presetId}-bw-nokey-seed7-chrome`,
    )
  })

  it('leaves the seed and answer key out of a kit’s name', () => {
    expect(pdfName(kit, { ...defaults, key: false }, 'ios-safari')).toBe(`kit-${kit.slug}-color-ios-safari`)
  })

  it('names everything by what it includes', () => {
    expect(pdfName(null, defaults, 'chrome')).toBe(`all-worksheets-kits-color-seed${DEFAULT_SEED}-chrome`)
    expect(pdfName(null, { ...defaults, presets: true, kits: false, bw: true, key: false, seed: 1 }, 'safari')).toBe(
      'all-worksheets-presets-bw-nokey-seed1-safari',
    )
  })

  it('differs between browsers only in the last part, so the files sort together', () => {
    const safari = pdfName(tracing, defaults, 'safari')
    const chrome = pdfName(tracing, defaults, 'chrome')
    expect(safari.replace(/-safari$/, '')).toBe(chrome.replace(/-chrome$/, ''))
  })
})
