import { MATERIALS } from '../materials/registry'
import { LESSONS } from '../lessons/registry'
import { GENERATORS } from '../worksheets/registry'
import { KITS } from '../kits/registry'
import { GUIDES } from '../parents/registry'

/** One page of the site, as the build prerenders it and sitemap.xml lists it. */
export interface SiteRoute {
  /** The route, e.g. '/lessons/golden-beads-intro'. */
  path: string
  /**
   * The page's meta description: what search results and link previews show
   * under the title. Omitted only for the home page, which keeps index.html's.
   */
  description?: string
}

/**
 * Every page of the site, in the order of the main nav: each index page
 * followed by its entries, straight from the registries. Must cover every
 * route in App.tsx (query-string states aside) — the prerender fails the
 * build when a listed page renders the Not Found page.
 */
export function siteRoutes(): SiteRoute[] {
  return [
    { path: '/' },
    {
      path: '/materials',
      description: `Faithful on-screen versions of ${MATERIALS.length} classic Montessori math materials — golden beads, the stamp game, bead frames, racks and tubes, fraction circles, and more — for families who don't have the real ones at hand.`,
    },
    ...MATERIALS.map((m) => ({ path: `/materials/${m.slug}`, description: m.summary })),
    {
      path: '/lessons',
      description: `${LESSONS.length} album-style Montessori math lessons, written for parents with no Montessori training: what to gather, exactly what to do and say, how the child self-corrects, and where to go next.`,
    },
    ...LESSONS.map((l) => ({ path: `/lessons/${l.slug}`, description: l.overview })),
    {
      path: '/worksheets',
      description:
        'Printable Montessori math worksheets generated from your settings, each with an answer key on its own page, in authentic Montessori color or ink-friendly black and white.',
    },
    ...GENERATORS.map((g) => ({ path: `/worksheets/${g.slug}`, description: g.description })),
    {
      path: '/kits',
      description:
        'Print, cut, and assemble real Montessori math materials at true physical size — number cards, stamp game tiles, fraction circles, strip boards, and more — on US Letter cardstock.',
    },
    ...KITS.map((k) => ({ path: `/kits/${k.slug}`, description: k.description })),
    {
      path: '/planner',
      description:
        'Pick lessons, worksheets, and materials for the week, then print a parent plan and a “My Work” journal your child checks off in pencil. The plan lives in the link; nothing is stored.',
    },
    {
      path: '/parents',
      description:
        'Montessori math for parents with no training: why the materials work, how to give a lesson, the PK–6 scope and sequence, a glossary, and honest answers to common questions.',
    },
    ...GUIDES.map((g) => ({ path: `/parents/${g.slug}`, description: g.summary })),
    {
      path: '/ages',
      description:
        'Every lesson, material, and worksheet for ages 4–6, 6–9, or 9–12 on one page. Ages are readiness ranges, not deadlines.',
    },
  ]
}
