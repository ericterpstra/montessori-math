#!/usr/bin/env node
/**
 * render.mjs — draws public/og-image.png, the 1200×630 link-preview image
 * (PRD 21), from og-image.html. Run it after `npm run build`: the image
 * borrows dist/'s stylesheet and fonts and the prerendered home page's
 * Plate I. Any Chrome or Chromium will do:
 *
 *   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/og-image/render.mjs
 *
 * Extra Chrome flags go in CHROME_FLAGS (e.g. --no-sandbox where Linux has
 * unprivileged user namespaces turned off). No dependencies: node:http
 * serves dist/ for the one render and Chrome's own --screenshot writes the
 * PNG, which is committed — the build never runs this.
 */
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..', '..')
const distDir = path.join(root, 'dist')
const out = path.join(root, 'public', 'og-image.png')

const chrome = process.env.CHROME
if (!chrome) {
  console.error('og-image: set CHROME to a Chrome or Chromium binary.')
  process.exit(1)
}

const homePath = path.join(distDir, 'index.html')
const home = fs.existsSync(homePath) ? fs.readFileSync(homePath, 'utf8') : ''
const stylesheet = home.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)?.[1]
const plate = home.match(/<figure class="plate-hero">[\s\S]*?<\/figure>/)?.[0]
if (!stylesheet || !plate) {
  console.error('og-image: run `npm run build` first — this needs the prerendered home page in dist/.')
  process.exit(1)
}
const page = fs
  .readFileSync(path.join(here, 'og-image.html'), 'utf8')
  .replace('{{stylesheet}}', () => stylesheet)
  .replace('{{plate}}', () => plate)

const TYPES = { '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }
const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost')
  if (pathname === '/og-image.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(page)
    return
  }
  const file = path.join(distDir, path.normalize(pathname))
  if (!file.startsWith(distDir + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404)
    res.end()
    return
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()

const args = [
  '--headless',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=3000', // let the web fonts land before the shot
  `--screenshot=${out}`,
  ...(process.env.CHROME_FLAGS ?? '').split(/\s+/).filter(Boolean),
  `http://127.0.0.1:${port}/og-image.html`,
]
const code = await new Promise((resolve) => spawn(chrome, args, { stdio: 'inherit' }).on('close', resolve))
server.close()
if (code !== 0 || !fs.existsSync(out)) {
  console.error(`og-image: Chrome exited with ${code}.`)
  process.exit(1)
}
console.log(`og-image: wrote ${path.relative(root, out)}`)
