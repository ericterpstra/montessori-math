/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * `npm run preview` answers like Cloudflare (wrangler.jsonc): Vite serves
 * /lessons/foo from lessons/foo.html, and a page that matches no file gets
 * 404.html rather than the home page (with a 200 here; Cloudflare sends a
 * real 404). Preview runs as an 'mpa' app so Vite itself never falls back
 * to index.html.
 */
function previewNotFoundPage(): Plugin {
  return {
    name: 'preview-not-found-page',
    configurePreviewServer(server) {
      // Returned, so it runs after Vite's own .html resolution: a page
      // request still without .html matched no prerendered page.
      return () => {
        server.middlewares.use((request, _res, next) => {
          // Vite types requests through @types/node, which this project
          // doesn't install; these three fields are all the check needs.
          const req = request as unknown as { method?: string; url?: string; headers: { accept?: string } }
          const pathname = (req.url ?? '/').split('?')[0]
          if (req.method === 'GET' && req.headers.accept?.includes('text/html') && !pathname.endsWith('.html')) {
            req.url = '/404.html'
          }
          next()
        })
      }
    },
  }
}

export default defineConfig(({ isPreview }) => ({
  plugins: [react(), previewNotFoundPage()],
  appType: isPreview ? 'mpa' : 'spa',
  server: { host: true },
  preview: { host: true, port: 4173 },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    // Let `?raw` imports of stylesheets return their text, so the no-emoji
    // guard in src/components/Icon.test.ts scans CSS too (Vitest empties
    // every .css import by default).
    css: { include: [/\.css\?raw$/] },
  },
}))
