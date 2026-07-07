import { useState } from 'react'
import type { CSSProperties } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { BeadBar, BEAD_STAIR_VARS } from '../../components/beads'
import { randomSeed } from '../../lib/rng'
import LongChain from './LongChain'
import {
  CHAIN_MAX,
  CHAIN_MIN,
  chainTotal,
  createChain,
  evaluate,
  isComplete,
  placeTicket,
  removeTicket,
} from './model'
import type { ChainState, LongChainKind } from './model'
import './bead-chains.css'

const CHAIN_CHOICES = Array.from({ length: CHAIN_MAX - CHAIN_MIN + 1 }, (_, i) => CHAIN_MIN + i)

export default function BeadChains() {
  const [state, setState] = useState<ChainState>(() => createChain(5, randomSeed()))
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [longKind, setLongKind] = useState<LongChainKind | null>(null)

  const { n, tray, placements } = state
  const chainColor = BEAD_STAIR_VARS[n]
  const square = chainTotal(n)
  const results = checked ? evaluate(state) : null
  const complete = isComplete(state)
  const squarePlaced = placements[n - 1] === square

  function startChain(size: number) {
    setState(createChain(size, randomSeed()))
    setSelected(null)
    setChecked(false)
  }

  function onTicketTap(trayIndex: number) {
    setSelected((cur) => (cur === trayIndex ? null : trayIndex))
  }

  function onSlotTap(slotIndex: number) {
    if (selected !== null) {
      setState(placeTicket(state, selected, slotIndex))
      setSelected(null)
      setChecked(false)
    } else if (placements[slotIndex] !== null) {
      setState(removeTicket(state, slotIndex))
      setChecked(false)
    }
  }

  const selectValue = longKind === null ? String(n) : `long-${longKind}`

  function onModeChange(value: string) {
    if (value === 'long-100') setLongKind(100)
    else if (value === 'long-1000') setLongKind(1000)
    else {
      setLongKind(null)
      startChain(Number(value))
    }
  }

  const chainSelect = (
    <label>
      Chain
      <select value={selectValue} onChange={(e) => onModeChange(e.target.value)}>
        {CHAIN_CHOICES.map((c) => (
          <option key={c} value={String(c)}>
            Chain of {c}
          </option>
        ))}
        <option value="long-100">Hundred chain</option>
        <option value="long-1000">Thousand chain</option>
      </select>
    </label>
  )

  const controls = (
    <>
      {chainSelect}
      <button type="button" className="bead-chains-btn" onClick={() => setChecked(true)} disabled={placements.every((p) => p === null)}>
        Check
      </button>
      <button type="button" className="bead-chains-btn" onClick={() => startChain(n)}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Pick a chain, then count the beads out loud, bar by bar. Each time you reach the end of a bar, tap the ticket with
      that number in the tray, then tap the empty spot at the end of the bar (tap a placed ticket to send it back). The
      very last ticket is the square of the number. Tap Check to mark each placed ticket right or wrong — and when in
      doubt, count the beads again.
    </p>
  )

  if (longKind !== null) return <LongChain key={longKind} kind={longKind} chainSelect={chainSelect} />

  return (
    <MaterialShell controls={controls} help={help} mat="felt">
      <div style={{ '--bead-chains-color': chainColor } as CSSProperties}>
        <div className="bead-chains-tray">
          <span className="bead-chains-tray-label">Tickets:</span>
          {tray.length === 0 && <span className="bead-chains-tray-label">all placed</span>}
          {tray.map((value, i) => (
            <button
              key={`${value}-${i}`}
              type="button"
              className={`bead-chains-ticket${selected === i ? ' bead-chains-selected' : ''}`}
              onClick={() => onTicketTap(i)}
              aria-pressed={selected === i}
              aria-label={`ticket ${value}`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="bead-chains-chain">
          {placements.map((placed, k) => {
            const result = results?.[k]
            const isSquareSlot = k === n - 1 && placed === square
            const slotClass = [
              'bead-chains-slot',
              placed !== null ? 'bead-chains-slot-filled' : '',
              isSquareSlot ? 'bead-chains-slot-square' : '',
              result === 'correct' ? 'bead-chains-slot-right' : '',
              result === 'wrong' ? 'bead-chains-slot-wrong' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <div className="bead-chains-segment" key={k}>
                <BeadBar n={n} beadSize={22} title={`bar of ${n} beads`} />
                <button
                  type="button"
                  className={slotClass}
                  onClick={() => onSlotTap(k)}
                  aria-label={
                    placed === null
                      ? `empty label spot at the end of bar ${k + 1}`
                      : `label spot at the end of bar ${k + 1}, holds ticket ${placed}`
                  }
                >
                  {placed ?? ''}
                  {result === 'correct' && (
                    <span className="bead-chains-mark bead-chains-mark-right" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {result === 'wrong' && (
                    <span className="bead-chains-mark bead-chains-mark-wrong" aria-hidden="true">
                      ✗
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {squarePlaced && (
          <p className="stage-note bead-chains-square-note">
            {n} × {n} = {square} — the square of {n}
            {complete && `. Read the whole chain: ${Array.from({ length: n }, (_, k) => (k + 1) * n).join(', ')}.`}
          </p>
        )}
      </div>
    </MaterialShell>
  )
}
