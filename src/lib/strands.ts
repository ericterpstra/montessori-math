/** The seven strands of the Montessori math curriculum as organized on this site. */

export type StrandId =
  | 'numbers-to-10'
  | 'linear-counting'
  | 'decimal-system'
  | 'memorization'
  | 'abstraction'
  | 'fractions'
  | 'decimals'

export interface StrandInfo {
  id: StrandId
  name: string
  order: number
  ages: [number, number]
  grades: string
  description: string
}

export const STRANDS: readonly StrandInfo[] = [
  {
    id: 'numbers-to-10',
    name: 'Numbers to 10',
    order: 1,
    ages: [4, 6],
    grades: 'PK–K',
    description:
      'Quantity, symbol, and the pairing of the two: counting real objects, recognizing numerals, and discovering zero and odd/even.',
  },
  {
    id: 'linear-counting',
    name: 'Linear & Skip Counting',
    order: 2,
    ages: [4, 7],
    grades: 'PK–1',
    description:
      'Counting past ten: teens, tens, one hundred and beyond — plus skip counting, the seed of multiplication.',
  },
  {
    id: 'decimal-system',
    name: 'The Decimal System',
    order: 3,
    ages: [4, 7],
    grades: 'PK–2',
    description:
      'The golden beads: place value to the thousands and all four operations experienced concretely, exchanges and all.',
  },
  {
    id: 'memorization',
    name: 'Memorization of Facts',
    order: 4,
    ages: [5, 9],
    grades: 'K–3',
    description:
      'Committing the addition, subtraction, multiplication, and division facts to memory through boards, strips, and games.',
  },
  {
    id: 'abstraction',
    name: 'Passage to Abstraction',
    order: 5,
    ages: [6, 11],
    grades: '1–5',
    description:
      'Bridging from materials to pencil-and-paper algorithms: stamp game, bead frames, checkerboard, and racks & tubes.',
  },
  {
    id: 'fractions',
    name: 'Fractions',
    order: 6,
    ages: [6, 10],
    grades: '1–4',
    description: 'Fraction circles: naming parts of a whole, equivalence, and the first fraction operations.',
  },
  {
    id: 'decimals',
    name: 'Decimal Fractions',
    order: 7,
    ages: [9, 12],
    grades: '4–6',
    description: 'Extending place value to the right of the unit: tenths, hundredths, thousandths, and decimal operations.',
  },
]

export function strandInfo(id: StrandId): StrandInfo {
  const s = STRANDS.find((s) => s.id === id)
  if (!s) throw new Error(`Unknown strand: ${id}`)
  return s
}
