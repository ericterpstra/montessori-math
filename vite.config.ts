/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
})
