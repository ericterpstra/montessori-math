import type { AnyGeneratorDef } from './types'
import { def as numeralTracing } from './generators/numeral-tracing'
import { def as teensTens } from './generators/teens-tens'
import { def as skipCounting } from './generators/skip-counting'
import { def as hundredChart } from './generators/hundred-chart'
import { def as goldenBeadPictures } from './generators/golden-bead-pictures'
import { def as placeValue } from './generators/place-value'
import { def as mathFacts } from './generators/math-facts'
import { def as multiDigitOps } from './generators/multi-digit-ops'
import { def as longMultiplication } from './generators/long-multiplication'
import { def as longDivision } from './generators/long-division'
import { def as fractions } from './generators/fractions'
import { def as decimals } from './generators/decimals'

/** Every worksheet generator on the site, roughly in curriculum order. */
export const GENERATORS: AnyGeneratorDef[] = [
  numeralTracing,
  teensTens,
  skipCounting,
  hundredChart,
  goldenBeadPictures,
  placeValue,
  mathFacts,
  multiDigitOps,
  longMultiplication,
  longDivision,
  fractions,
  decimals,
]

export function generatorBySlug(slug: string): AnyGeneratorDef | undefined {
  return GENERATORS.find((g) => g.slug === slug)
}
