import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import { DEFAULT_TITLE, SITE_NAME } from '../components/PageHeader'
import {
  PREVIEW_IMAGE,
  SITE_ORIGIN,
  escapeHtml,
  headTags,
  readTemplateHead,
  renderDocument,
  robotsTxt,
  sitemapXml,
} from './head'

const lesson = {
  path: '/lessons/racks-and-tubes',
  title: 'Long Division with Racks & Tubes · Montessori Math',
  description: 'The "racks" hold <beads> & the tubes hold the quotient.',
}

/** The value of one <meta property="og:…"> tag in a list of tags. */
function og(tags: string[], property: string): string | undefined {
  const tag = tags.find((t) => t.includes(`property="og:${property}"`))
  return tag?.match(/content="([^"]*)"/)?.[1]
}

describe('escapeHtml', () => {
  it('escapes the characters that end text or a double-quoted attribute', () => {
    expect(escapeHtml(`Tom & "Jerry" <b>`)).toBe('Tom &amp; &quot;Jerry&quot; &lt;b&gt;')
  })
})

describe('headTags', () => {
  const tags = headTags(lesson)

  it('links the canonical URL on the public origin', () => {
    expect(tags).toContain(`<link rel="canonical" href="${SITE_ORIGIN}/lessons/racks-and-tubes" />`)
    expect(og(tags, 'url')).toBe(`${SITE_ORIGIN}/lessons/racks-and-tubes`)
  })

  it('gives link previews the escaped title, description and site name', () => {
    expect(og(tags, 'title')).toBe('Long Division with Racks &amp; Tubes · Montessori Math')
    expect(og(tags, 'description')).toBe('The &quot;racks&quot; hold &lt;beads&gt; &amp; the tubes hold the quotient.')
    expect(og(tags, 'site_name')).toBe(SITE_NAME)
    expect(og(tags, 'type')).toBe('website')
  })

  it('points every preview at the absolute 1200×630 image', () => {
    expect(og(tags, 'image')).toBe(`${SITE_ORIGIN}${PREVIEW_IMAGE.path}`)
    expect(og(tags, 'image:width')).toBe('1200')
    expect(og(tags, 'image:height')).toBe('630')
    expect(og(tags, 'image:alt')).toBeTruthy()
    expect(tags).toContain('<meta name="twitter:card" content="summary_large_image" />')
  })

  it('names the site in WebSite data on the home page only', () => {
    expect(tags.some((t) => t.includes('application/ld+json'))).toBe(false)
    const home = headTags({ ...lesson, path: '/' })
    const script = home.find((t) => t.includes('application/ld+json'))
    const json = script?.match(/<script type="application\/ld\+json">(.*)<\/script>/)?.[1]
    expect(JSON.parse(json ?? 'null')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_ORIGIN}/`,
    })
  })

  it('gives a noindex page only the robots tag', () => {
    expect(headTags({ ...lesson, noindex: true })).toEqual(['<meta name="robots" content="noindex" />'])
  })
})

describe('readTemplateHead', () => {
  it("reads index.html's title (the home page's, kept in step with DEFAULT_TITLE) and description", () => {
    const head = readTemplateHead(indexHtml)
    expect(head.title).toBe(DEFAULT_TITLE)
    expect(head.description.length).toBeGreaterThan(40)
  })
})

describe('renderDocument', () => {
  const html = renderDocument(indexHtml, lesson, '<main>Racks</main>')

  it('replaces the title and description, once each', () => {
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html).toContain('<title>Long Division with Racks &amp; Tubes · Montessori Math</title>')
    expect(html.match(/name="description"/g)).toHaveLength(1)
    expect(html).toContain(`<meta name="description" content="${escapeHtml(lesson.description)}" />`)
  })

  it('adds the head tags inside <head>', () => {
    const head = html.slice(0, html.indexOf('</head>'))
    for (const tag of headTags(lesson)) expect(head).toContain(tag)
  })

  it('puts the app markup in #root, named with the path it was rendered for', () => {
    expect(html).toContain('<div id="root" data-prerendered="/lessons/racks-and-tubes"><main>Racks</main></div>')
  })

  it('leaves the rest of the template alone', () => {
    expect(html).toContain('<script type="module" src="/src/main.tsx"></script>')
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest" />')
  })

  it('takes app markup literally, even with $ patterns in it', () => {
    expect(renderDocument(indexHtml, lesson, '<p>$& costs $1</p>')).toContain('<p>$& costs $1</p>')
  })

  it('refuses a template it cannot fill exactly', () => {
    expect(() => renderDocument(indexHtml.replace('<div id="root"></div>', ''), lesson, '')).toThrow(/root/)
    expect(() => renderDocument(indexHtml.replace('</title>', '</title><title>x</title>'), lesson, '')).toThrow(
      /<title>/,
    )
  })
})

describe('sitemapXml', () => {
  const xml = sitemapXml(['/', '/lessons', '/lessons/stamp-game-addition'])

  it('lists every path once, as an absolute URL', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true)
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect([...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1])).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/lessons`,
      `${SITE_ORIGIN}/lessons/stamp-game-addition`,
    ])
  })

  it('escapes what XML needs escaped', () => {
    expect(sitemapXml(['/a&b'])).toContain(`<loc>${SITE_ORIGIN}/a&amp;b</loc>`)
  })
})

describe('robotsTxt', () => {
  it('opens every page to every crawler and names the sitemap', () => {
    expect(robotsTxt()).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`)
  })
})
