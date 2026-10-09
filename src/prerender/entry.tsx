/**
 * The build's server-side entry (PRD 21). scripts/prerender.mjs builds this
 * module with Vite for Node and renders every route through it; nothing here
 * ships to the browser.
 */
import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import App from '../App'
import { DocumentTitleContext } from '../components/PageHeader'

export { documentTitle } from '../components/PageHeader'
export { createRng } from '../lib/rng'
export { siteRoutes } from './routes'
export { readTemplateHead, renderDocument, robotsTxt, sitemapXml } from './head'

export interface RenderedPage {
  /** The app's markup, for inside #root. */
  html: string
  /** Every name the page gave useDocumentTitle — one at most, for a well-formed page. */
  titles: string[]
}

/**
 * Renders one route the way the browser's first render will see it. Waits
 * for anything that suspends, and rejects on any render error, so a broken
 * page fails the build instead of shipping half-rendered.
 */
export async function renderPage(path: string): Promise<RenderedPage> {
  const titles = new Set<string>()
  const errors: unknown[] = []
  const { prelude } = await prerender(
    <StrictMode>
      <DocumentTitleContext.Provider value={titles}>
        <StaticRouter location={path}>
          <App />
        </StaticRouter>
      </DocumentTitleContext.Provider>
    </StrictMode>,
    { onError: (error) => void errors.push(error) },
  )
  const html = await new Response(prelude).text()
  if (errors.length > 0) throw errors[0]
  return { html, titles: [...titles] }
}
