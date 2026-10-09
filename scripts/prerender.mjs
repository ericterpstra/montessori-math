#!/usr/bin/env node
/**
 * prerender.mjs — renders every page of the site into its own HTML file, so
 * search engines, link previews and readers waiting on the script all get
 * the page itself instead of an empty shell (PRD 21). Runs in `npm run build`
 * after `vite build` and before generate-sw.mjs.
 * No dependencies beyond the project's own: Vite builds src/prerender/entry.tsx
 * for Node, React renders each route, node:fs writes the files.
 *
 * Writes into dist/:
 *   index.html, <route>.html   every page (lessons/golden-beads-intro.html is
 *                              served at /lessons/golden-beads-intro): its own
 *                              title, description, canonical link and preview
 *                              tags, and the page's markup inside #root
 *   404.html                   the Not Found page (Cloudflare serves it, with a
 *                              404 status, for any path that matches no file)
 *   app-shell.html             Vite's template, untouched — the service worker
 *                              answers every navigation with it
 *   sitemap.xml, robots.txt
 *
 * Every page is rendered twice under different Math.random sequences, and the
 * build fails unless the two agree: the browser adopts the prerendered markup
 * only if its own first render matches it (src/main.tsx).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

// React picks its production or development build from NODE_ENV when the
// rendered bundle first imports it.
process.env.NODE_ENV ??= 'production'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
// Inside the project, so the bundle's bare imports (react, react-router-dom)
// resolve to node_modules; deleted again on success.
const ssrDir = path.join(root, 'node_modules', '.cache', 'prerender')

const templatePath = path.join(distDir, 'index.html')
if (!fs.existsSync(templatePath)) {
  console.error('prerender: dist/index.html not found — run `vite build` first.')
  process.exit(1)
}
const template = fs.readFileSync(templatePath, 'utf8')
if (template.includes('data-prerendered')) {
  console.error('prerender: dist/index.html is already prerendered — run `vite build` first.')
  process.exit(1)
}

await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: 'src/prerender/entry.tsx',
    outDir: ssrDir,
    emptyOutDir: true,
    copyPublicDir: false,
  },
})
const entry = await import(pathToFileURL(path.join(ssrDir, 'entry.js')).href)

const problems = []

/** Renders a route twice under different randomness; the two must agree. */
async function renderStable(routePath) {
  const random = Math.random
  try {
    Math.random = entry.createRng(1).next
    const first = await entry.renderPage(routePath)
    Math.random = entry.createRng(2).next
    const second = await entry.renderPage(routePath)
    if (first.html !== second.html) {
      problems.push(
        `${routePath} renders differently each time. Something random reaches the first render — ` +
          'gate it on useHydrated() (src/components/useHydrated.ts).',
      )
    }
    if (first.titles.length > 1) {
      problems.push(`${routePath} sets more than one document title: ${first.titles.join(' / ')}`)
    }
    return first
  } catch (error) {
    problems.push(`${routePath} failed to render: ${error instanceof Error ? (error.stack ?? error.message) : error}`)
    return { html: '', titles: [] }
  } finally {
    Math.random = random
  }
}

/** dist/ file for a route: '/' → index.html, '/lessons/x' → lessons/x.html. */
function fileFor(routePath) {
  return path.join(distDir, routePath === '/' ? 'index.html' : `${routePath.slice(1)}.html`)
}

function write(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, contents)
}

const home = entry.readTemplateHead(template)

// The Not Found page first: its title is how a broken route gives itself away.
const NOT_FOUND_PATH = '/404'
const notFound = await renderStable(NOT_FOUND_PATH)
const notFoundName = notFound.titles[0]
if (!notFoundName) problems.push(`${NOT_FOUND_PATH} (the Not Found page) sets no document title`)
const notFoundHtml = entry.renderDocument(
  template,
  {
    path: NOT_FOUND_PATH,
    title: notFoundName ? entry.documentTitle(notFoundName) : home.title,
    description: home.description,
    noindex: true,
  },
  notFound.html,
)

const routes = entry.siteRoutes()
const pages = []
for (const route of routes) {
  const page = await renderStable(route.path)
  const name = page.titles[0]
  if (name !== undefined && name === notFoundName) {
    problems.push(`${route.path} renders the Not Found page — is its slug in the registry?`)
  }
  if (name === undefined && route.path !== '/' && page.html !== '') {
    problems.push(`${route.path} sets no document title (PageHeader or useDocumentTitle)`)
  }
  const head = {
    path: route.path,
    title: name === undefined ? home.title : entry.documentTitle(name),
    description: route.description ?? home.description,
  }
  pages.push({ file: fileFor(route.path), html: entry.renderDocument(template, head, page.html) })
}

if (problems.length > 0) {
  console.error(`prerender: ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`)
  process.exit(1)
}

write(path.join(distDir, 'app-shell.html'), template)
for (const page of pages) write(page.file, page.html)
write(path.join(distDir, '404.html'), notFoundHtml)
write(path.join(distDir, 'sitemap.xml'), entry.sitemapXml(routes.map((r) => r.path)))
write(path.join(distDir, 'robots.txt'), entry.robotsTxt())
fs.rmSync(ssrDir, { recursive: true, force: true })

const kb = (pages.reduce((sum, p) => sum + Buffer.byteLength(p.html), 0) / 1024).toFixed(0)
console.log(
  `prerender: wrote ${pages.length} pages (${kb} KB) + 404.html, app-shell.html, sitemap.xml (${routes.length} URLs), robots.txt`,
)
