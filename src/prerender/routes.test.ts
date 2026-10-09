import { describe, expect, it } from 'vitest'
import { siteRoutes } from './routes'
import { MATERIALS } from '../materials/registry'
import { LESSONS } from '../lessons/registry'
import { GENERATORS } from '../worksheets/registry'
import { KITS } from '../kits/registry'
import { GUIDES } from '../parents/registry'

const routes = siteRoutes()
const paths = routes.map((r) => r.path)

describe('siteRoutes', () => {
  it('lists each path once, in the form Cloudflare serves it', () => {
    expect(new Set(paths).size).toBe(paths.length)
    for (const p of paths) {
      // No trailing slash or .html: /lessons/x is lessons/x.html, and Cloudflare
      // redirects the other spellings to it.
      expect(p).toMatch(/^\/([a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*)?$/)
    }
  })

  it('starts at home and includes every section index', () => {
    expect(paths[0]).toBe('/')
    for (const p of ['/materials', '/lessons', '/worksheets', '/kits', '/planner', '/parents', '/ages']) {
      expect(paths).toContain(p)
    }
  })

  it('includes every entry of every registry', () => {
    const expected = [
      ...MATERIALS.map((m) => `/materials/${m.slug}`),
      ...LESSONS.map((l) => `/lessons/${l.slug}`),
      ...GENERATORS.map((g) => `/worksheets/${g.slug}`),
      ...KITS.map((k) => `/kits/${k.slug}`),
      ...GUIDES.map((g) => `/parents/${g.slug}`),
    ]
    for (const p of expected) expect(paths).toContain(p)
    expect(paths).toHaveLength(expected.length + 8)
  })

  it('describes every page but home (which keeps index.html’s description)', () => {
    expect(routes[0].description).toBeUndefined()
    for (const r of routes.slice(1)) {
      expect(r.description, r.path).toBeDefined()
      const d = r.description ?? ''
      expect(d.length, r.path).toBeGreaterThanOrEqual(40)
      expect(d, r.path).toBe(d.trim())
      expect(d, r.path).not.toMatch(/\s{2}|[<>]/)
    }
  })

  it('never gives two pages the same description', () => {
    const descriptions = routes.slice(1).map((r) => r.description)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })
})
