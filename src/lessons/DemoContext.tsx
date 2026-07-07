import { createContext, useContext } from 'react'
import type { DemoScript } from './demo'

export interface DemoState {
  lessonSlug: string
  stepIndex: number
  script: DemoScript
}

export const DemoContext = createContext<DemoState | null>(null)

/** Materials opt in by calling this; null means no walk-through is active. */
export function useDemo(): DemoState | null {
  return useContext(DemoContext)
}
