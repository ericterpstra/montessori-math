import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { TenBar, HundredSquare, ThousandCube } from '../../components/beads'
import { PrintButton } from '../../components/PrintButton'
import { SheetPreview } from '../../components/SheetPreview'
import { SheetPage } from '../../worksheets/SheetPage'
import { formatNumber } from '../../lib/placeValue'
import {
  createLongChain,
  evaluateLong,
  isLongComplete,
  longChain,
  placeLongTicket,
  removeLongTicket,
  visibleBarRange,
} from './model'
import type { LongChainKind, LongChainState } from './model'
import './bead-chains.css'

/** 120px TenBar (beadSize 12 → (12/20) · 200) + 10px gap. Must match the CSS. */
const BAR_WIDTH = 130
const TRAY_PREVIEW = 12
const TICKETS_PER_PAGE = 30

interface LongChainProps {
  kind: LongChainKind
  /** The shared Chain <select>, built by BeadChains so both modes offer identical choices. */
  chainSelect: ReactNode
}

export default function LongChain({ kind, chainSelect }: LongChainProps) {
  const spec = longChain(kind)
  const [state, setState] = useState<LongChainState>(() => createLongChain(kind))
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [range, setRange] = useState<[number, number]>([0, 11])
  const [nearValue, setNearValue] = useState(10)
  const [showTickets, setShowTickets] = useState(false)
  const [bw, setBw] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const results = checked ? evaluateLong(state) : null
  const complete = isLongComplete(state)

  function updateWindow() {
    const el = scrollRef.current
    if (!el) return
    const next = visibleBarRange(el.scrollLeft, el.clientWidth, BAR_WIDTH, spec.bars)
    setRange((cur) => (cur[0] === next[0] && cur[1] === next[1] ? cur : next))
    const leftmost = Math.max(0, Math.min(spec.bars - 1, Math.floor(el.scrollLeft / BAR_WIDTH)))
    setNearValue((leftmost + 1) * 10)
  }

  useEffect(() => {
    updateWindow() // measure the real viewport on mount
    window.addEventListener('resize', updateWindow)
    return () => window.removeEventListener('resize', updateWindow)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.body.classList.toggle('bead-chains-print-tickets', showTickets)
    return () => document.body.classList.remove('bead-chains-print-tickets')
  }, [showTickets])

  function reset() {
    setState(createLongChain(kind))
    setSelected(null)
    setChecked(false)
    scrollRef.current?.scrollTo({ left: 0 })
  }

  function onTicketTap(trayIndex: number) {
    setSelected((cur) => (cur === trayIndex ? null : trayIndex))
  }

  function onSlotTap(slotIndex: number) {
    if (selected !== null) {
      setState(placeLongTicket(state, selected, slotIndex))
      setSelected(null)
      setChecked(false)
    } else if (state.placements[slotIndex] !== null) {
      setState(removeLongTicket(state, slotIndex))
      setChecked(false)
    }
  }

  const controls = (
    <>
      {chainSelect}
      <button
        type="button"
        className="bead-chains-btn"
        onClick={() => setChecked(true)}
        disabled={state.placements.every((p) => p === null)}
      >
        Check
      </button>
      <button type="button" className="bead-chains-btn" onClick={reset}>
        Reset
      </button>
      <button
        type="button"
        className="bead-chains-btn"
        onClick={() => setShowTickets((s) => !s)}
        aria-pressed={showTickets}
      >
        {showTickets ? 'Hide arrow labels' : 'Show arrow labels'}
      </button>
    </>
  )

  const help = (
    <p>
      This chain is long — scroll sideways to travel down it. Count the golden beads by tens: at the end of each
      ten-bar, tap the next ticket in the tray, then tap the empty spot at the end of the bar. Every hundred earns a
      bigger ticket and a hundred square{kind === 1000 ? ', and the thousand cube waits at the very end' : ''}. The
      &ldquo;You are near&rdquo; sign tells you where you are whenever you scroll back after a break. Tap Check to mark
      placed tickets right or wrong. Show arrow labels prints cut-out tickets for a real chain at home.
    </p>
  )

  const barIndexes = Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i)

  const allValues = spec.labelValues
  const pages: number[][] = []
  for (let i = 0; i < allValues.length; i += TICKETS_PER_PAGE) pages.push(allValues.slice(i, i + TICKETS_PER_PAGE))

  return (
    <div className="bead-chains-long-wrap">
      <MaterialShell controls={controls} help={help} mat="felt">
        <div className="bead-chains-tray bead-chains-long-tray">
          <span className="bead-chains-tray-label">Tickets:</span>
          {state.tray.length === 0 && <span className="bead-chains-tray-label">all placed</span>}
          {state.tray.slice(0, TRAY_PREVIEW).map((value, i) => (
            <button
              key={value}
              type="button"
              className={`bead-chains-ticket${value % 100 === 0 ? ' bead-chains-ticket-hundred' : ''}${
                selected === i ? ' bead-chains-selected' : ''
              }`}
              onClick={() => onTicketTap(i)}
              aria-pressed={selected === i}
              aria-label={`ticket ${formatNumber(value)}`}
            >
              {formatNumber(value)}
            </button>
          ))}
          {state.tray.length > TRAY_PREVIEW && (
            <span className="bead-chains-tray-label">…{state.tray.length - TRAY_PREVIEW} more in the box</span>
          )}
        </div>

        <div className="bead-chains-long-scroll" ref={scrollRef} onScroll={updateWindow}>
          <p className="bead-chains-long-chip" role="status">
            You are near {formatNumber(nearValue)}
          </p>
          <div
            className="bead-chains-long-track"
            style={{ width: spec.bars * BAR_WIDTH + (kind === 1000 ? 150 : 70) }}
          >
            {barIndexes.map((k) => {
              const placed = state.placements[k]
              const result = results?.[k]
              const value = (k + 1) * 10
              const isMilestone = value % 100 === 0
              const slotClass = [
                'bead-chains-slot',
                placed !== null ? 'bead-chains-slot-filled' : '',
                isMilestone ? 'bead-chains-slot-milestone' : '',
                result === 'correct' ? 'bead-chains-slot-right' : '',
                result === 'wrong' ? 'bead-chains-slot-wrong' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <div className="bead-chains-long-segment" key={k} style={{ left: k * BAR_WIDTH }}>
                  <TenBar beadSize={12} title={`ten-bar ${k + 1}`} />
                  <div className="bead-chains-long-slot-row">
                    <button
                      type="button"
                      className={slotClass}
                      onClick={() => onSlotTap(k)}
                      aria-label={
                        placed === null
                          ? `empty label spot at the end of ten-bar ${k + 1}`
                          : `label spot at the end of ten-bar ${k + 1}, holds ticket ${formatNumber(placed)}`
                      }
                    >
                      {placed !== null ? formatNumber(placed) : ''}
                      {result === 'correct' && (
                        <span className="bead-chains-mark bead-chains-mark-right" aria-hidden="true">✓</span>
                      )}
                      {result === 'wrong' && (
                        <span className="bead-chains-mark bead-chains-mark-wrong" aria-hidden="true">✗</span>
                      )}
                    </button>
                    {isMilestone && <HundredSquare size={40} title={`hundred square at ${formatNumber(value)}`} />}
                  </div>
                </div>
              )
            })}
            {kind === 1000 && (
              <div className="bead-chains-long-finale" style={{ left: spec.bars * BAR_WIDTH + 12 }}>
                <ThousandCube size={64} title="thousand cube" />
              </div>
            )}
          </div>
        </div>

        {complete && (
          <p className="stage-note bead-chains-square-note">
            {kind === 100
              ? '10 bars of 10 make 100 — ten tens are one hundred.'
              : `100 bars of 10 make ${formatNumber(1000)} — one hundred tens are one thousand.`}
          </p>
        )}
      </MaterialShell>

      {showTickets && (
        <section className="bead-chains-tickets-section">
          <div className="material-controls no-print">
            <label>
              <input type="checkbox" checked={bw} onChange={(e) => setBw(e.target.checked)} />
              Ink-friendly B&amp;W
            </label>
            <PrintButton label="Print arrow labels" />
          </div>
          <SheetPreview bw={bw}>
            {pages.map((pageValues, p) => (
              <SheetPage
                key={p}
                title={`Arrow labels — ${kind === 100 ? 'hundred' : 'thousand'} chain${
                  pages.length > 1 ? ` (page ${p + 1} of ${pages.length})` : ''
                }`}
                instructions="Cut along the dashed lines. Lay each label at the end of its ten-bar as your child counts."
                nameDate={false}
              >
                <div className="bead-chains-ticket-grid">
                  {pageValues.map((v) => (
                    <div
                      key={v}
                      className={`bead-chains-print-ticket${
                        v === 1000
                          ? ' bead-chains-print-ticket-thousand'
                          : v % 100 === 0
                            ? ' bead-chains-print-ticket-hundred'
                            : ''
                      }`}
                    >
                      {formatNumber(v)}
                    </div>
                  ))}
                </div>
              </SheetPage>
            ))}
          </SheetPreview>
        </section>
      )}
    </div>
  )
}
