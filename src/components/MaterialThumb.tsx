import { memo } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { Bead, BeadBar, HundredSquare, Skittle, ThousandCube } from './beads'
import { IconGlyph } from './Icon'
import { cardColor } from './NumberCard'
import { STAMP_COLOR } from './StampTile'
import type { StampValue } from './StampTile'

/**
 * MaterialThumb: a 72×48 "plate" (paper mat, ink hairline, inner line)
 * holding a tiny drawing of one virtual material, used at the start of
 * contents rows (/materials, /ages, home). Every drawing is laid out on a
 * 62×38 grid and every colour is a token: material tokens (--bead-*, --pv-*,
 * --golden*, --wood*, --inset-frame, --fraction-shade) for the material,
 * chrome tokens (--card, --ink, --line-strong …) for paper and card stock.
 * Beads, bars, squares, cubes and skittles are the beads.tsx primitives;
 * number cards and stamps use NumberCard's cardColor() and StampTile's
 * STAMP_COLOR (those two components render HTML, which cannot sit inside
 * an SVG, so their shapes are redrawn here with the same colour rules).
 * Decorative: the plate is aria-hidden; the row's text names the material.
 */

const f = (n: number) => Math.round(n * 100) / 100

/** Tint of a place-value colour on card stock (charts, checkerboard squares). */
const tint = (c: string) => `color-mix(in srgb, ${c} 42%, var(--card))`

interface RectProps {
  x: number
  y: number
  w: number
  h: number
  fill: string
  rx?: number
  stroke?: string
  sw?: number
  opacity?: number
  /** [degrees, cx, cy] */
  rotate?: [number, number, number]
}

function Rect({ x, y, w, h, fill, rx, stroke, sw, opacity, rotate }: RectProps) {
  return (
    <rect
      x={f(x)}
      y={f(y)}
      width={f(w)}
      height={f(h)}
      rx={rx}
      style={{ fill }}
      stroke={stroke}
      strokeWidth={sw}
      opacity={opacity}
      transform={rotate ? `rotate(${rotate.join(' ')})` : undefined}
    />
  )
}

function Line({ x1, y1, x2, y2, stroke, sw, dash }: { x1: number; y1: number; x2: number; y2: number; stroke: string; sw: number; dash?: string }) {
  return <line x1={f(x1)} y1={f(y1)} x2={f(x2)} y2={f(y2)} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />
}

function Dot({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  return <circle cx={f(x)} cy={f(y)} r={r} style={{ fill }} />
}

/** A numeral centred on x with its baseline at y (number-card figures: --font-numeral). */
function Num({ x, y, size, fill, children }: { x: number; y: number; size: number; fill: string; children: ReactNode }) {
  return (
    <text x={f(x)} y={f(y)} fontSize={size} textAnchor="middle" style={{ fill, fontFamily: 'var(--font-numeral)', fontWeight: 700 }}>
      {children}
    </text>
  )
}

/** One bead of radius r centred at (x, y): the beads.tsx <Bead> (r = 0.45 × size). */
function B({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const size = r / 0.45
  return (
    <g transform={`translate(${f(x - size / 2)} ${f(y - size / 2)})`}>
      <Bead size={f(size)} fill={fill} />
    </g>
  )
}

/** A beads.tsx <BeadBar> whose first bead is centred at (x, y), bead pitch d.
 *  With no fill it takes the authentic bead-stair colour for n. */
function Bar({ x, y, n, d, fill, vertical }: { x: number; y: number; n: number; d: number; fill?: string; vertical?: boolean }) {
  return (
    <g transform={`translate(${f(x - d / 2)} ${f(y - d / 2)})`}>
      <BeadBar n={n} beadSize={d} fill={fill} vertical={vertical} />
    </g>
  )
}

/** A wooden board: --wood with a --wood-dark edge. */
function Board({ x, y, w, h, fill = 'var(--wood)' }: { x: number; y: number; w: number; h: number; fill?: string }) {
  return <Rect x={x} y={y} w={w} h={h} fill={fill} rx={1.2} stroke="var(--wood-dark)" sw={0.7} />
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ---------------------------------------------------------------------
   The 21 materials. Keys are material slugs (src/materials/registry.ts).
   --------------------------------------------------------------------- */

function BeadStairArt() {
  // bars 1–9 stacked like the stair, each in its own bead-stair colour
  return (
    <>
      {range(9).map((i) => (
        <Bar key={i} x={14.5} y={3.2 + i * 3.95} n={i + 1} d={3.95} />
      ))}
    </>
  )
}

function CardsAndCountersArt() {
  // numeral cards 1–5 with red counters paired beneath (odd one centred)
  return (
    <>
      {range(5).map((k) => {
        const n = k + 1
        const x = 4 + k * 11.6
        return (
          <g key={k}>
            <Rect x={x} y={2.5} w={9.4} h={11} fill="var(--card)" rx={1} stroke="var(--line-strong)" sw={0.5} />
            <Num x={x + 4.7} y={11} size={8} fill="var(--ink)">
              {n}
            </Num>
            {range(n).map((i) => {
              const odd = n % 2 === 1 && i === n - 1
              const dx = odd ? 0 : i % 2 ? 2.1 : -2.1
              return <B key={i} x={x + 4.7 + dx} y={19 + Math.floor(i / 2) * 4.4} r={1.75} fill="var(--bead-1)" />
            })}
          </g>
        )
      })}
    </>
  )
}

function TeenBoardArt() {
  // Seguin board A with a 3 card slid over the second 10 → 13, plus 10+3 and 10+4 in beads
  return (
    <>
      <Board x={3} y={2.5} w={30} h={33} />
      {range(4).map((r) => {
        const y = 5 + r * 7.8
        return (
          <g key={r}>
            <Rect x={5.5} y={y} w={25} h={6} fill="var(--card)" rx={0.6} />
            <Num x={14} y={y + 5} size={5.6} fill="var(--ink)">
              1
            </Num>
            {r === 1 ? (
              <>
                <Rect x={18} y={y - 0.6} w={7.2} h={7.2} fill="var(--card)" rx={0.6} stroke="var(--line-strong)" sw={0.5} />
                <Num x={21.6} y={y + 5} size={5.6} fill="var(--ink)">
                  3
                </Num>
              </>
            ) : (
              <Num x={21.6} y={y + 5} size={5.6} fill="var(--ink)">
                0
              </Num>
            )}
          </g>
        )
      })}
      <Bar x={40} y={5.3} n={10} d={2.95} fill="var(--golden)" vertical />
      <Bar x={44.4} y={5.3} n={3} d={2.95} vertical />
      <Bar x={51} y={5.3} n={10} d={2.95} fill="var(--golden)" vertical />
      <Bar x={55.4} y={5.3} n={4} d={2.95} vertical />
    </>
  )
}

function TenBoardArt() {
  // Seguin board B (10–40) and three golden ten-bars
  return (
    <>
      <Board x={3} y={2.5} w={30} h={33} />
      {['10', '20', '30', '40'].map((t, r) => {
        const y = 5 + r * 7.8
        return (
          <g key={t}>
            <Rect x={5.5} y={y} w={25} h={6} fill="var(--card)" rx={0.6} />
            <Num x={18} y={y + 5} size={5.6} fill="var(--ink)">
              {t}
            </Num>
          </g>
        )
      })}
      {range(3).map((k) => (
        <Bar key={k} x={40 + k * 4.2} y={5.3} n={10} d={2.95} fill="var(--golden)" vertical />
      ))}
    </>
  )
}

function HundredBoardArt() {
  // tiles 1–45 laid on the 10×10 board; two loose tiles beside it
  const empty = 'color-mix(in srgb, var(--wood-dark) 45%, var(--wood))'
  return (
    <>
      <Board x={12} y={1.5} w={36} h={35} />
      {range(100).map((i) => (
        <Rect key={i} x={13.4 + (i % 10) * 3.34} y={2.9 + Math.floor(i / 10) * 3.24} w={2.9} h={2.8} fill={i < 46 ? 'var(--card)' : empty} rx={0.3} />
      ))}
      <Rect x={51} y={10} w={5} h={5} fill="var(--card)" rx={0.4} stroke="var(--line-strong)" sw={0.4} rotate={[-12, 53.5, 12.5]} />
      <Rect x={52} y={20} w={5} h={5} fill="var(--card)" rx={0.4} stroke="var(--line-strong)" sw={0.4} rotate={[9, 54.5, 22.5]} />
    </>
  )
}

function BeadChainsArt() {
  // a light-blue 5-chain folded in three rows, with its arrow tickets
  const d = 2.75
  const rows = [9, 20, 31]
  return (
    <>
      {rows.map((y, r) => {
        const x0 = r % 2 ? 53 - 15 * d + d / 2 : 9 + d / 2
        return range(3).map((b) => <Bar key={`${r}-${b}`} x={x0 + b * 5 * d} y={y} n={5} d={d} />)
      })}
      <path
        d={`M${f(9 + 15 * d)} 9c4.5 0 4.5 11 0 11M${f(53 - 15 * d)} 20c-4.5 0-4.5 11 0 11`}
        fill="none"
        stroke="var(--bead-wire)"
        strokeWidth={0.7}
      />
      {[9 + 5 * d, 9 + 10 * d, 9 + 15 * d].map((x) => (
        <Rect key={x} x={x - 3} y={1.6} w={6} h={3.6} fill="var(--card)" stroke="var(--pv-ten)" sw={0.6} />
      ))}
    </>
  )
}

function GoldenBeadsArt() {
  // true proportions: the cube's face, the square's side and the bar are all
  // ten unit beads long (18 grid units; bead pitch 1.8), bottoms on one line
  const base = 30.5
  return (
    <>
      <g transform={`translate(5 ${f(base - 22.32)})`}>
        <ThousandCube size={22.32} />
      </g>
      <g transform={`translate(29.8 ${f(base - 18)})`}>
        <HundredSquare size={18} />
      </g>
      <Bar x={51.2} y={base - 18 + 0.9} n={10} d={1.8} fill="var(--golden)" vertical />
      <B x={55.5} y={base - 0.9} r={0.81} fill="var(--golden)" />
    </>
  )
}

function NumberCardsArt() {
  // 1000 / 200 / 30 / 4 stacked right-aligned: width ∝ digits (0.62 × height
  // per digit, as NumberCard), numerals in their place colour via cardColor()
  const h = 8
  return (
    <>
      {[1000, 200, 30, 4].map((v, i) => {
        const w = h * 0.62 * String(v).length
        const y = 1.6 + i * 8.9
        return (
          <g key={v}>
            <Rect x={41 - w} y={y} w={w} h={h} fill="var(--card)" rx={0.6} stroke="var(--line-strong)" sw={0.45} />
            <Num x={41 - w / 2} y={y + 6.3} size={6.4} fill={cardColor(v)}>
              {v}
            </Num>
          </g>
        )
      })}
    </>
  )
}

function SnakeGameArt() {
  // a snake of 3, 7, 5 | 8, 6 bars turning at the right; counted off into a golden ten and a 4
  const d = 3
  const top: [number, number][] = [
    [8, 3],
    [17, 7],
    [38, 5],
  ]
  const bottom: [number, number][] = [
    [32, 8],
    [14, 6],
  ]
  return (
    <>
      {top.map(([x, n]) => (
        <Bar key={n} x={x} y={7} n={n} d={d} />
      ))}
      <path d="M51.5 7c4.5 0 4.5 11 0 11" fill="none" stroke="var(--bead-wire)" strokeWidth={0.7} />
      {bottom.map(([x, n]) => (
        <Bar key={n} x={x} y={18} n={n} d={d} />
      ))}
      <Bar x={8} y={30.5} n={10} d={d} />
      <Bar x={41} y={30.5} n={4} d={d} />
    </>
  )
}

/** Shared frame of the two strip boards: card, 13 columns, coloured number row. */
function StripBoardFrame({ numberColor }: { numberColor: (col: number) => string }) {
  const cw = 56 / 13
  return (
    <>
      <Rect x={3} y={3} w={56} h={32} fill="var(--card)" stroke="var(--wood-dark)" sw={1} />
      {range(12).map((c) => (
        <Line key={c} x1={3 + (c + 1) * cw} y1={3} x2={3 + (c + 1) * cw} y2={35} stroke="var(--line-strong)" sw={0.3} />
      ))}
      {range(13).map((c) => (
        <Rect key={c} x={3.8 + c * cw} y={4} w={cw - 1.6} h={2.2} fill={numberColor(c)} opacity={0.8} />
      ))}
    </>
  )
}

function AdditionStripBoardArt() {
  // numbers 1–10 red, 11–18 blue; blue first-addend strips with red strips after them
  const cw = 56 / 13
  const strip = (y: number, n: number, fill: string, off: number) => (
    <Rect key={`${y}-${off}`} x={3.4 + off * cw} y={y} w={n * cw - 0.8} h={4.2} fill={fill} rx={0.5} />
  )
  return (
    <>
      <StripBoardFrame numberColor={(c) => (c < 10 ? 'var(--pv-hundred)' : 'var(--pv-ten)')} />
      <Line x1={3 + 10 * cw} y1={3} x2={3 + 10 * cw} y2={35} stroke="var(--pv-hundred)" sw={0.9} />
      {strip(12, 5, 'var(--pv-ten)', 0)}
      {strip(12, 4, 'var(--pv-hundred)', 5)}
      {strip(20, 3, 'var(--pv-ten)', 0)}
      {strip(20, 6, 'var(--pv-hundred)', 3)}
      {strip(28, 7, 'var(--pv-ten)', 0)}
    </>
  )
}

function SubtractionStripBoardArt() {
  // numbers 1–9 blue, 10–18 red; natural-wood cover strip and blue strips
  const cw = 56 / 13
  return (
    <>
      <StripBoardFrame numberColor={(c) => (c < 9 ? 'var(--pv-ten)' : 'var(--pv-hundred)')} />
      <Rect x={3.4 + 9 * cw} y={3.4} w={4 * cw - 0.8} h={3.6} fill="var(--wood)" stroke="var(--wood-dark)" sw={0.4} />
      <Rect x={3.4} y={12} w={4 * cw - 0.8} h={4.2} fill="var(--pv-ten)" rx={0.5} />
      <Rect x={3.4 + 4 * cw} y={12} w={5 * cw - 0.8} h={4.2} fill="var(--wood)" rx={0.5} stroke="var(--wood-dark)" sw={0.4} />
      <Rect x={3.4} y={20} w={6 * cw - 0.8} h={4.2} fill="var(--pv-ten)" rx={0.5} />
      <Rect x={3.4} y={28} w={2 * cw - 0.8} h={4.2} fill="var(--pv-ten)" rx={0.5} />
    </>
  )
}

function MultiplicationBeadBoardArt() {
  // the 6 card in the slot, 4 rows × 6 red beads laid in the holes, the red counter above
  return (
    <>
      <Board x={15} y={1.5} w={33} h={35} fill="var(--paper-warm)" />
      {range(100).map((i) => {
        const r = Math.floor(i / 10)
        const c = i % 10
        const x = 18 + c * 3
        const y = 6 + r * 3
        return r < 4 && c < 6 ? <B key={i} x={x} y={y} r={1.3} fill="var(--bead-1)" /> : <Dot key={i} x={x} y={y} r={0.6} fill="var(--line-strong)" />
      })}
      <Dot x={33} y={3.3} r={1.3} fill="var(--bead-1)" />
      <Rect x={4} y={13} w={8} h={10} fill="var(--card)" rx={0.6} stroke="var(--line-strong)" sw={0.45} />
      <Num x={8} y={20.6} size={7} fill="var(--ink)">
        6
      </Num>
    </>
  )
}

function DivisionBoardArt() {
  // four green skittles (beads.tsx Skittle) with green unit beads shared out beneath
  const k = 17 / 48
  return (
    <>
      <Board x={8} y={12} w={46} h={24} fill="var(--paper-warm)" />
      {range(4).map((i) => (
        <g key={i} transform={`translate(${f(14 + i * 7 - 12 * k)} -0.18)`}>
          <Skittle height={17} />
        </g>
      ))}
      {range(45).map((i) => {
        const r = Math.floor(i / 9)
        const c = i % 9
        const x = 14 + c * 4.8
        const y = 16 + r * 4.3
        return c < 4 && r < 3 ? <B key={i} x={x} y={y} r={1.45} fill="var(--pv-unit)" /> : <Dot key={i} x={x} y={y} r={0.6} fill="var(--line-strong)" />
      })}
    </>
  )
}

/** Shared 11×11 chart grid: header row blue, header column red, cells on card stock. */
function ChartGrid({ cell, dot }: { cell: (r: number, c: number) => string; dot: (r: number, c: number) => boolean }) {
  const cs = 3.2
  const x0 = 14
  const y0 = 2.5
  return (
    <>
      {range(121).map((i) => {
        const r = Math.floor(i / 11)
        const c = i % 11
        if (r === 0 && c === 0) return null
        const x = x0 + c * cs
        const y = y0 + r * cs
        const fill = r === 0 ? tint('var(--pv-ten)') : c === 0 ? tint('var(--pv-hundred)') : cell(r, c)
        return (
          <g key={i}>
            <Rect x={x} y={y} w={cs} h={cs} fill={fill} stroke="var(--line-strong)" sw={0.22} />
            {r > 0 && c > 0 && dot(r, c) && <Dot x={x + cs / 2} y={y + cs / 2} r={0.45} fill="var(--ink-soft)" />}
          </g>
        )
      })}
    </>
  )
}

function AdditionChartsArt() {
  // the working chart: filled triangle of sums (r + c ≤ 11)
  return <ChartGrid cell={(r, c) => (r + c <= 11 ? 'var(--card)' : 'var(--paper-warm)')} dot={(r, c) => r + c <= 11} />
}

function MultiplicationChartsArt() {
  // the "two fingers" meeting at 6 × 7, the meeting cell boxed in ink
  const hit = (r: number, c: number) => (r === 6 && c <= 7) || (c === 7 && r <= 6)
  return (
    <>
      <ChartGrid cell={(r, c) => (hit(r, c) ? tint('var(--pv-unit)') : 'var(--card)')} dot={() => true} />
      <Rect x={14 + 7 * 3.2} y={2.5 + 6 * 3.2} w={3.2} h={3.2} fill="none" stroke="var(--ink)" sw={0.7} />
    </>
  )
}

function StampGameArt() {
  // 2 thousands, 3 hundreds, 4 tens, 5 units stamps (STAMP_COLOR) above the wooden tray
  const cols: [StampValue, number][] = [
    [1000, 2],
    [100, 3],
    [10, 4],
    [1, 5],
  ]
  const s = 5.8
  return (
    <>
      {cols.map(([value, n], k) =>
        range(n).map((i) => {
          const x = 5 + k * 14 + (i % 2) * 6.4
          const y = 3 + Math.floor(i / 2) * 7.2
          // StampTile's own numeral ratios: 0.26 / 0.30 / 0.36 of the tile
          const size = s * (value >= 1000 ? 0.26 : value >= 100 ? 0.3 : 0.36)
          return (
            <g key={`${value}-${i}`}>
              <Rect x={x} y={y} w={s} h={s} fill={STAMP_COLOR[value]} rx={0.7} stroke="var(--bead-outline)" sw={0.35} />
              <text x={f(x + s / 2)} y={f(y + s / 2 + size * 0.36)} fontSize={f(size)} textAnchor="middle" style={{ fill: 'var(--card)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                {value}
              </text>
            </g>
          )
        }),
      )}
      <Rect x={3} y={26.5} w={56} h={9} fill="var(--wood)" rx={1} stroke="var(--wood-dark)" sw={0.6} />
      {[1, 2, 3].map((k) => (
        <Line key={k} x1={3 + k * 14} y1={27} x2={3 + k * 14} y2={35} stroke="var(--wood-dark)" sw={0.6} />
      ))}
    </>
  )
}

function BeadFrameArt() {
  // small bead frame: units, tens, hundreds, thousands wires, some beads moved right
  const wires: [number, string][] = [
    [3, 'var(--pv-unit)'],
    [6, 'var(--pv-ten)'],
    [2, 'var(--pv-hundred)'],
    [1, 'var(--pv-thousand)'],
  ]
  return (
    <>
      <Rect x={5} y={2.5} w={52} h={33} fill="var(--card)" rx={1} stroke="var(--wood)" sw={2.6} />
      {wires.map(([right, c], r) => {
        const y = 9 + r * 6.6
        return (
          <g key={r}>
            <Line x1={6.5} y1={y} x2={55.5} y2={y} stroke="var(--bead-wire)" sw={0.5} />
            {range(10 - right).map((i) => (
              <B key={`l${i}`} x={9 + i * 2.95} y={y} r={1.38} fill={c} />
            ))}
            {range(right).map((j) => (
              <B key={`r${j}`} x={53 - j * 2.95} y={y} r={1.38} fill={c} />
            ))}
          </g>
        )
      })}
    </>
  )
}

function CheckerboardArt() {
  // 7 × 5 squares coloured by place value from the bottom right, with bead bars on it
  const pv = ['var(--pv-unit)', 'var(--pv-ten)', 'var(--pv-hundred)']
  const cs = 6.5
  return (
    <>
      <Rect x={6} y={2} w={50} h={34} fill="var(--wood)" rx={1} stroke="var(--wood-dark)" sw={1.6} />
      {range(35).map((i) => {
        const r = Math.floor(i / 7)
        const c = i % 7
        return <Rect key={i} x={8.2 + c * cs} y={4 + r * cs} w={cs - 0.4} h={cs - 0.4} fill={tint(pv[(6 - c + (4 - r)) % 3])} />
      })}
      <Bar x={8.2 + 5 * cs + 1.2} y={4 + 4 * cs + 3} n={4} d={1.1} />
      <Bar x={8.2 + 4 * cs + 1.2} y={4 + 3 * cs + 3} n={3} d={1.3} />
      <Bar x={8.2 + 6 * cs + 1.2} y={4 + 3 * cs + 2} n={6} d={0.85} />
    </>
  )
}

function RacksAndTubesArt() {
  // a rack of unit/ten/hundred beads beside three test tubes with coloured caps
  const racks: [string, number][] = [
    ['var(--pv-unit)', 7],
    ['var(--pv-ten)', 5],
    ['var(--pv-hundred)', 8],
  ]
  const tubes: [string, number][] = [
    ['var(--pv-unit)', 7],
    ['var(--pv-ten)', 4],
    ['var(--pv-hundred)', 6],
  ]
  return (
    <>
      <Board x={3} y={4} w={27} h={30} />
      {racks.map(([c, n], r) => {
        const y = 10 + r * 9
        return (
          <g key={r}>
            <Line x1={5} y1={y} x2={28} y2={y} stroke="var(--wood-dark)" sw={0.6} />
            {range(n).map((i) => (
              <B key={i} x={7 + i * 2.6} y={y} r={1.2} fill={c} />
            ))}
          </g>
        )
      })}
      {tubes.map(([c, n], k) => {
        const x = 36 + k * 8.4
        return (
          <g key={k}>
            <Rect x={x} y={5} w={6.2} h={30} fill="var(--card)" rx={3} stroke="var(--line-strong)" sw={0.5} />
            <Rect x={x - 0.4} y={3.2} w={7} h={3} fill={c} rx={0.8} />
            {range(n).map((i) => (
              <B key={i} x={x + 1.75 + (i % 2) * 2.7} y={31.5 - Math.floor(i / 2) * 2.8} r={1.25} fill={c} />
            ))}
          </g>
        )
      })}
    </>
  )
}

function FractionCirclesArt() {
  // a green metal frame holding a circle with three red quarters in place; one quarter loose
  return (
    <>
      <Rect x={5} y={3} w={32} h={32} fill="var(--inset-frame)" rx={2.2} />
      <Dot x={21} y={19} r={12.6} fill="color-mix(in srgb, var(--inset-frame) 70%, var(--ink))" />
      <path d="M21 19V6.4A12.6 12.6 0 1 1 8.4 19z" style={{ fill: 'var(--fraction-shade)' }} stroke="var(--card)" strokeWidth={0.6} />
      <path d="M21 19v12.6M21 19H33.6" fill="none" stroke="var(--card)" strokeWidth={0.6} />
      <path d="M44 29V16.4A12.6 12.6 0 0 1 56.6 29z" style={{ fill: 'var(--fraction-shade)' }} stroke="var(--bead-outline)" strokeWidth={0.3} transform="rotate(-10 50 23)" />
    </>
  )
}

function DecimalBoardArt() {
  // unit | tenths | hundredths | thousandths columns in their pale place colours, the decimal point after the unit
  const cols = ['var(--pv-unit)', 'var(--pv-tenth)', 'var(--pv-hundredth)', 'var(--pv-thousandth)']
  const counts = [1, 3, 2, 4]
  return (
    <>
      <Rect x={3} y={3} w={56} h={32} fill="var(--card)" rx={1} stroke="var(--line-strong)" sw={0.5} />
      {cols.map((c, k) => {
        const x = 3 + k * 14
        return (
          <g key={k}>
            <Rect x={x + 0.6} y={3.6} w={12.8} h={4.2} fill={c} />
            {k > 0 && <Line x1={x} y1={3} x2={x} y2={35} stroke="var(--line-strong)" sw={0.4} />}
            {range(counts[k]).map((i) => {
              const bx = x + 4 + (i % 2) * 5.5
              const by = 13 + Math.floor(i / 2) * 6.5
              return k === 0 ? (
                <Rect key={i} x={bx - 1.4} y={by - 2.8} w={7.4} h={7.4} fill="var(--pv-unit)" rx={0.6} />
              ) : (
                <B key={i} x={bx} y={by} r={2.1} fill={c} />
              )
            })}
          </g>
        )
      })}
      <Dot x={16.9} y={33} r={1.1} fill="var(--ink)" />
    </>
  )
}

/* ---------------------------------------------------------------------
   Glyphs for things that are not materials.
   --------------------------------------------------------------------- */

function SheetArt() {
  // a worksheet with its answer key tucked behind
  return (
    <>
      <Rect x={24} y={4.5} w={22} h={30} fill="var(--paper-warm)" stroke="var(--line-strong)" sw={0.5} rotate={[6, 35, 20]} />
      <Rect x={16} y={3} w={23} h={31.5} fill="var(--card)" stroke="var(--line-strong)" sw={0.5} />
      <Line x1={18.5} y1={7} x2={36.5} y2={7} stroke="var(--ink)" sw={0.8} />
      {range(9).map((i) => {
        const x = 19 + (i % 3) * 6.3
        const y = 11 + Math.floor(i / 3) * 7.2
        return (
          <g key={i}>
            <Line x1={x + 1} y1={y} x2={x + 4} y2={y} stroke="var(--ink-soft)" sw={0.7} />
            <Line x1={x} y1={y + 2} x2={x + 4} y2={y + 2} stroke="var(--ink-soft)" sw={0.7} />
            <Line x1={x} y1={y + 3.6} x2={x + 4.2} y2={y + 3.6} stroke="var(--ink)" sw={0.45} />
          </g>
        )
      })}
    </>
  )
}

function KitArt() {
  // a sheet of dashed cut lines with one piece cut out, the piece, and scissors
  return (
    <>
      <Rect x={6} y={3} w={30} h={32} fill="var(--card)" stroke="var(--line-strong)" sw={0.5} />
      {[1, 2].map((c) => (
        <Line key={`v${c}`} x1={6 + c * 10} y1={3} x2={6 + c * 10} y2={35} stroke="var(--ink-soft)" sw={0.45} dash="1.4 1" />
      ))}
      {[1, 2].map((r) => (
        <Line key={`h${r}`} x1={6} y1={3 + r * 10.67} x2={36} y2={3 + r * 10.67} stroke="var(--ink-soft)" sw={0.45} dash="1.4 1" />
      ))}
      <Rect x={27} y={24.4} w={8.4} h={9.9} fill="var(--paper-warm)" />
      <Rect x={40} y={21} w={9.6} h={10.4} fill="var(--card)" stroke="var(--line-strong)" sw={0.5} rotate={[-14, 45, 26]} />
      <g transform="translate(40 3) scale(0.62)" fill="none" stroke="var(--ink)" strokeWidth={1.8} strokeLinecap="round">
        <IconGlyph name="scissors" />
      </g>
    </>
  )
}

function AlbumArt() {
  // an album page: title, rule, margin heads and rubric step numerals
  return (
    <>
      <Rect x={14} y={2.5} w={34} h={33} fill="var(--card)" stroke="var(--line-strong)" sw={0.5} />
      <Line x1={20} y1={7} x2={42} y2={7} stroke="var(--ink)" sw={1.1} />
      <Line x1={17} y1={10} x2={45} y2={10} stroke="var(--ink)" sw={0.4} />
      {range(4).map((r) => {
        const y = 14 + r * 5.3
        return (
          <g key={r}>
            <Line x1={17} y1={y} x2={22} y2={y} stroke="var(--ink)" sw={0.7} />
            <text x={25.6} y={f(y + 1.2)} fontSize={3.4} textAnchor="middle" style={{ fill: 'var(--accent)', fontStyle: 'italic', fontFamily: 'var(--font-numeral)' }}>
              {r + 1}
            </text>
            <Line x1={28} y1={y} x2={44 - (r % 2) * 5} y2={y} stroke="var(--ink-soft)" sw={0.55} />
            <Line x1={28} y1={y + 2.2} x2={41 - (r % 3) * 3} y2={y + 2.2} stroke="var(--ink-soft)" sw={0.55} />
          </g>
        )
      })}
    </>
  )
}

/** Every drawing, keyed by material slug (or glyph key). Exported for the coverage test. */
export const THUMB_ART: Readonly<Record<string, () => ReactElement>> = {
  'bead-stair': BeadStairArt,
  'cards-and-counters': CardsAndCountersArt,
  'teen-board': TeenBoardArt,
  'ten-board': TenBoardArt,
  'hundred-board': HundredBoardArt,
  'bead-chains': BeadChainsArt,
  'golden-beads': GoldenBeadsArt,
  'number-cards': NumberCardsArt,
  'snake-game': SnakeGameArt,
  'addition-strip-board': AdditionStripBoardArt,
  'subtraction-strip-board': SubtractionStripBoardArt,
  'multiplication-bead-board': MultiplicationBeadBoardArt,
  'division-board': DivisionBoardArt,
  'addition-charts': AdditionChartsArt,
  'multiplication-charts': MultiplicationChartsArt,
  'stamp-game': StampGameArt,
  'bead-frame': BeadFrameArt,
  checkerboard: CheckerboardArt,
  'racks-and-tubes': RacksAndTubesArt,
  'fraction-circles': FractionCirclesArt,
  'decimal-board': DecimalBoardArt,
  sheet: SheetArt,
  kit: KitArt,
  album: AlbumArt,
}

/** The non-material glyphs. */
export const THUMB_GLYPHS = ['sheet', 'kit', 'album'] as const

export function hasThumb(slug: string): boolean {
  return Object.hasOwn(THUMB_ART, slug)
}

/** Fallback for a material with no drawing yet: its strand's bead bar (golden ten without a strand). */
function FallbackArt({ n }: { n?: number }) {
  const count = n && n >= 1 && n <= 9 ? n : 10
  const d = count === 10 ? 5 : 5.5
  return <Bar x={(62 - count * d) / 2 + d / 2} y={19} n={count} d={d} />
}

export interface MaterialThumbProps {
  /** A material slug from src/materials/registry.ts, or 'sheet' | 'kit' | 'album'. */
  slug: string
  /** Strand order (1–7) for the fallback plate when `slug` has no drawing yet. */
  strandOrder?: number
  className?: string
}

/** A 72×48 mounted plate with a live-token miniature of the material.
 *  Memoized: the drawings are static, so /ages tab switches skip them. */
export const MaterialThumb = memo(function MaterialThumb({ slug, strandOrder, className }: MaterialThumbProps) {
  const Art = hasThumb(slug) ? THUMB_ART[slug] : null
  return (
    <span className={`plate${className ? ` ${className}` : ''}`} aria-hidden="true" data-thumb={Art ? slug : 'fallback'}>
      <svg className="plate-art" viewBox="0 0 62 38" width={62} height={38}>
        {Art ? <Art /> : <FallbackArt n={strandOrder} />}
      </svg>
    </span>
  )
})
