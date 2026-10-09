import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False while the build prerenders a page (scripts/prerender.mjs) and while the
 * browser adopts that prerendered HTML; true from the next render on, and from
 * the very first render whenever the page is rendered in the browser from
 * scratch. Anything that differs on every visit (a random starting seed, a
 * random problem) must wait for it, or the browser's first render would not
 * match the prerendered HTML (PRD 21).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
