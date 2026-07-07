import type { ReactNode } from 'react'
import type { KitMeta } from '../types'
import { SheetPage } from '../../worksheets/SheetPage'
import { KitCover } from '../pieces'
import { Bead, TenBar, HundredSquare, ThousandCube } from '../../components/beads'

export const meta: KitMeta = {
  slug: 'golden-bead-cards',
  name: 'Golden Bead Cards',
  description:
    'Printed stand-ins for the golden bead material — cards picturing a unit bead, a ten-bar, a hundred square, and a thousand cube, nine of each.',
  forMaterials: ['golden-beads'],
  pieces: '36 bead cards (9 each of unit, ten-bar, hundred square, thousand cube)',
  assembly: [
    'Print all pages on cardstock at 100% scale; check the 1-inch square on page 1.',
    'Cut the cards apart along the dashed lines.',
    'These cards substitute for the expensive bead-cabinet pieces. Units and tens are cheap to make from real beads (golden pony beads on pipe cleaners — see the using-this-site guide), so many families use real units and tens with printed hundreds and thousands.',
    'Pair this kit with the Large Number Cards kit to play the bank game: the child fetches quantities, you lay the number.',
  ],
}

export const BEAD_CARD_COUNTS = { unit: 9, ten: 9, hundred: 9, thousand: 9 } as const

function BeadCard({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  return (
    <div className="kit-bead-card kit-cut" style={{ width: `${w}in`, height: `${h}in` }}>
      {children}
    </div>
  )
}

// 96px = 1in in CSS, so px-sized shared bead SVGs print at true size.
const UnitCard = () => (
  <BeadCard w={1.1} h={1.1}>
    <Bead size={27} />
  </BeadCard>
)
const TenCard = () => (
  <BeadCard w={3.1} h={0.8}>
    <TenBar beadSize={27} />
  </BeadCard>
)
const HundredCard = () => (
  <BeadCard w={2.9} h={2.9}>
    <HundredSquare size={260} />
  </BeadCard>
)
const ThousandCard = () => (
  <BeadCard w={2.9} h={2.9}>
    <ThousandCube size={250} />
  </BeadCard>
)

export function Pages() {
  return (
    <>
      <KitCover kit={meta} />
      <SheetPage title="Golden Bead Cards — Units & Tens" nameDate={false}>
        <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(6, 1.1in)', marginBottom: '0.25in' }}>
          {Array.from({ length: BEAD_CARD_COUNTS.unit }, (_, i) => (
            <UnitCard key={i} />
          ))}
        </div>
        <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(2, 3.1in)' }}>
          {Array.from({ length: BEAD_CARD_COUNTS.ten }, (_, i) => (
            <TenCard key={i} />
          ))}
        </div>
      </SheetPage>
      <SheetPage title="Golden Bead Cards — Hundreds (1 of 2)" nameDate={false}>
        <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(2, 2.9in)' }}>
          {Array.from({ length: 6 }, (_, i) => (
            <HundredCard key={i} />
          ))}
        </div>
      </SheetPage>
      <SheetPage title="Golden Bead Cards — Hundreds & Thousands" nameDate={false}>
        <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(2, 2.9in)' }}>
          {Array.from({ length: 3 }, (_, i) => (
            <HundredCard key={`h${i}`} />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <ThousandCard key={`t${i}`} />
          ))}
        </div>
      </SheetPage>
      <SheetPage title="Golden Bead Cards — Thousands (2 of 2)" nameDate={false}>
        <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(2, 2.9in)' }}>
          {Array.from({ length: 6 }, (_, i) => (
            <ThousandCard key={i} />
          ))}
        </div>
      </SheetPage>
    </>
  )
}
