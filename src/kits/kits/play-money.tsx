import type { CSSProperties } from 'react'
import type { KitMeta } from '../types'
import { SheetPage } from '../../worksheets/SheetPage'
import { KitCover } from '../pieces'

export const meta: KitMeta = {
  slug: 'play-money',
  name: 'Place-Value Play Money',
  description:
    'Paper bills in place-value colors — $1 green, $10 blue, $100 red — for exchange games that mirror the golden beads and stamps.',
  forMaterials: ['golden-beads', 'stamp-game'],
  pieces: '30 bills (10 each of $1, $10, $100)',
  assembly: [
    'Print all pages on cardstock at 100% scale; check the 1-inch square on page 1.',
    'Cut out the bills along their colored frames.',
    'This is the golden-bead idea carried into money: ten ones trade for a ten, ten tens trade for a hundred — the very same exchange as beads and stamps.',
    'Play “bank”: roll a die, take that many $1 bills, and exchange up whenever you can. The child records each trade with pencil and paper.',
  ],
}

export const DENOMINATIONS = [1, 10, 100] as const
export const BILLS_PER_DENOM = 10

const BILL_INFO: Record<(typeof DENOMINATIONS)[number], { colorVar: string; words: string }> = {
  1: { colorVar: 'var(--pv-unit)', words: 'One Dollar' },
  10: { colorVar: 'var(--pv-ten)', words: 'Ten Dollars' },
  100: { colorVar: 'var(--pv-hundred)', words: 'One Hundred Dollars' },
}

function Bill({ denom }: { denom: (typeof DENOMINATIONS)[number] }) {
  const info = BILL_INFO[denom]
  return (
    <div className="kit-bill" style={{ '--bill-color': info.colorVar } as CSSProperties}>
      <span className="kit-bill-corner tl">{denom}</span>
      <span className="kit-bill-value">${denom}</span>
      <span className="kit-bill-words">{info.words}</span>
      <span className="kit-bill-corner br">{denom}</span>
    </div>
  )
}

export function Pages() {
  return (
    <>
      <KitCover kit={meta} />
      {DENOMINATIONS.map((denom) => (
        <SheetPage key={denom} title={`Play Money — Ten $${denom} Bills`} nameDate={false}>
          <div className="kit-grid-gapped" style={{ gridTemplateColumns: 'repeat(2, 3.3in)' }}>
            {Array.from({ length: BILLS_PER_DENOM }, (_, i) => (
              <Bill key={i} denom={denom} />
            ))}
          </div>
        </SheetPage>
      ))}
    </>
  )
}
