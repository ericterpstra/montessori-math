/**
 * Pure helpers for the build-time prerender (PRD 21): the tags each page adds
 * to <head>, the filled-in HTML document, and sitemap.xml / robots.txt.
 * Strings in, strings out — scripts/prerender.mjs does the file I/O.
 */
import { SITE_NAME } from '../components/PageHeader'

/** The public origin: canonical links, sitemap entries and the preview image are absolute URLs on it. */
export const SITE_ORIGIN = 'https://montessori-math.org'

/** The link-preview image (public/og-image.png, drawn by scripts/og-image/). */
export const PREVIEW_IMAGE = {
  path: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Golden beads — a unit, a ten-bar, a hundred square and a thousand cube — beside the words Montessori Math.',
}

/** What one prerendered page says about itself in <head>. */
export interface PageHead {
  /** The route, e.g. '/lessons/golden-beads-intro' ('/' for home). */
  path: string
  /** The full document title. */
  title: string
  description: string
  /** Keep the page out of search results (the 404 page). */
  noindex?: boolean
}

/** Escapes text for HTML content and double-quoted attribute values. */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function unescapeHtml(html: string): string {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&#x0*27;/gi, "'")
    .replace(/&amp;/g, '&')
}

export function canonicalUrl(path: string): string {
  return SITE_ORIGIN + path
}

/**
 * The tags a page adds to <head>: its canonical link and the Open Graph and
 * Twitter card tags that link previews read — plus, on the home page, the
 * WebSite data that lets search results show the site's name. A noindex page
 * gets only the robots tag.
 */
export function headTags(page: PageHead): string[] {
  if (page.noindex) return ['<meta name="robots" content="noindex" />']
  const url = escapeHtml(canonicalUrl(page.path))
  const tags = [
    `<link rel="canonical" href="${url}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${escapeHtml(canonicalUrl(PREVIEW_IMAGE.path))}" />`,
    `<meta property="og:image:width" content="${PREVIEW_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${PREVIEW_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(PREVIEW_IMAGE.alt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ]
  if (page.path === '/') {
    const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: canonicalUrl('/') }
    // "<" never appears raw inside the script, so no string can close it early.
    const json = JSON.stringify(website).replace(/</g, '\\u003c')
    tags.push(`<script type="application/ld+json">${json}</script>`)
  }
  return tags
}

const TITLE = /<title>([^<]*)<\/title>/g
const DESCRIPTION = /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/g
const ROOT = /<div id="root"><\/div>/g

/** The template's one match for `pattern`; throws when it has none or several. */
function only(template: string, pattern: RegExp, what: string): RegExpMatchArray {
  const matches = [...template.matchAll(pattern)]
  if (matches.length !== 1) {
    throw new Error(`index.html must have exactly one ${what} (found ${matches.length})`)
  }
  return matches[0]
}

/** The title and description that index.html itself carries — the home page's. */
export function readTemplateHead(template: string): { title: string; description: string } {
  return {
    title: unescapeHtml(only(template, TITLE, '<title>')[1]),
    description: unescapeHtml(only(template, DESCRIPTION, 'description meta tag')[1]),
  }
}

/**
 * One prerendered page: Vite's built index.html with the page's title,
 * description and head tags, and the app's markup inside #root. #root names
 * the path it was rendered for, so the browser adopts the markup only on
 * that page (src/main.tsx).
 */
export function renderDocument(template: string, page: PageHead, appHtml: string): string {
  only(template, TITLE, '<title>')
  only(template, DESCRIPTION, 'description meta tag')
  only(template, ROOT, 'empty <div id="root"></div>')
  if (!template.includes('</head>')) throw new Error('index.html has no </head>')
  const tags = headTags(page).join('\n    ')
  return template
    .replace(TITLE, () => `<title>${escapeHtml(page.title)}</title>`)
    .replace(DESCRIPTION, () => `<meta name="description" content="${escapeHtml(page.description)}" />`)
    .replace('</head>', () => `  ${tags}\n  </head>`)
    .replace(ROOT, () => `<div id="root" data-prerendered="${escapeHtml(page.path)}">${appHtml}</div>`)
}

/** sitemap.xml: every page, as absolute URLs. */
export function sitemapXml(paths: string[]): string {
  const urls = paths.map((p) => `  <url><loc>${escapeHtml(canonicalUrl(p))}</loc></url>\n`).join('')
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls +
    '</urlset>\n'
  )
}

/** robots.txt: every page is open to every crawler — search engines and AI assistants alike. */
export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${canonicalUrl('/sitemap.xml')}\n`
}
