import type { ComponentType } from 'react'

export interface GuideMeta {
  slug: string
  title: string
  /** One sentence for index cards. */
  summary: string
}

export interface GuideDef extends GuideMeta {
  component: ComponentType
}
