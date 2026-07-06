import type { Lesson } from './types'

/** Every album lesson on the site, contributed by material folders and strand content files. */
export const LESSONS: Lesson[] = []

export function lessonBySlug(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug)
}
