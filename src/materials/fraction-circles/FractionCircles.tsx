import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import {
  BANK_WHOLES,
  DENOMINATORS,
  EQUIVALENCE_TARGETS,
  canLift,
  canLiftFromBank,
  checkEquivalence,
  countOf,
  familiesOn,
  familyName,
  formatFraction,
  formatMixed,
  fraction,
  fractionName,
  lift,
  liftFromBank,
  mixedName,
  remainingInFrame,
  returnAt,
  toMixed,
} from './model'
import type { EquivalenceCheck, Fraction } from './model'
import './fraction-circles.css'

type Mode = 'explore' | 'equivalence' | 'add'

const TAU = Math.PI * 2
/** Sectors start at 12 o'clock and sweep clockwise. */
const START = -Math.PI / 2

function polar(cx: number, cy: number, r: number, angle: number): string {
  return `${(cx + r * Math.cos(angle)).toFixed(2)} ${(cy + r * Math.sin(angle)).toFixed(2)}`
}

/** SVG path for a pie sector (sweep < 2π). */
function sectorPath(cx: number, cy: number, r: number, start: number, sweep: number): string {
  const large = sweep > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${polar(cx, cy, r, start)} A ${r} ${r} 0 ${large} 1 ${polar(cx, cy, r, start + sweep)} Z`
}

interface PlacedSector {
  /** Index into the mat array. */
  index: number
  den: number
  circle: number
  start: number
  sweep: number
}

/** Lay mat sectors around dashed work circles, spilling onto a new circle when full. */
function placeSectors(mat: readonly number[]): { sectors: PlacedSector[]; circles: number } {
  const sectors: PlacedSector[] = []
  const EPS = 1e-9
  let circle = 0
  let used = 0
  mat.forEach((den, index) => {
    const sweep = TAU / den
    if (used + sweep > TAU + EPS) {
      circle += 1
      used = 0
    }
    sectors.push({ index, den, circle, start: START + used, sweep })
    used += sweep
  })
  return { sectors, circles: circle + 1 }
}

function InsetFrame({ den, remaining }: { den: number; remaining: number }) {
  const sweep = TAU / den
  return (
    <svg viewBox="0 0 100 100" className="fraction-circles-inset-svg" aria-hidden="true">
      <rect x={1} y={1} width={98} height={98} rx={8} fill="var(--ink-soft)" />
      <circle cx={50} cy={50} r={41} fill="var(--card)" />
      {den === 1
        ? remaining > 0 && <circle cx={50} cy={50} r={39} fill="var(--bead-1)" stroke="var(--card)" strokeWidth={1.5} />
        : Array.from({ length: remaining }, (_, i) => (
            <path
              key={i}
              d={sectorPath(50, 50, 39, START + i * sweep, sweep)}
              fill="var(--bead-1)"
              stroke="var(--card)"
              strokeWidth={1.5}
            />
          ))}
    </svg>
  )
}

export default function FractionCircles() {
  const [mode, setMode] = useState<Mode>('explore')
  const [showSymbols, setShowSymbols] = useState(true)
  const [mat, setMat] = useState<number[]>([])
  const [lastDen, setLastDen] = useState<number | null>(null)
  const [target, setTarget] = useState<Fraction>(EQUIVALENCE_TARGETS[0])
  const [addDen, setAddDen] = useState(8)
  const [eqResult, setEqResult] = useState<EquivalenceCheck | null>(null)

  function clearMat() {
    setMat([])
    setLastDen(null)
    setEqResult(null)
  }

  function onLift(den: number) {
    if (mode === 'add') {
      if (den !== addDen || !canLiftFromBank(mat, den)) return
      setMat(liftFromBank(mat, den))
    } else {
      if (!canLift(mat, den)) return
      setMat(lift(mat, den))
    }
    setLastDen(den)
    setEqResult(null)
  }

  function onReturn(index: number) {
    setLastDen(mat[index])
    setMat(returnAt(mat, index))
    setEqResult(null)
  }

  function onReturnLast(den: number) {
    const index = mat.lastIndexOf(den)
    if (index !== -1) onReturn(index)
  }

  function keyActivate(e: KeyboardEvent<SVGElement>, fn: () => void) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  }

  const frameDisabled = (den: number): boolean =>
    mode === 'add' ? den !== addDen || !canLiftFromBank(mat, den) : !canLift(mat, den)

  const families = familiesOn(mat)
  const { sectors, circles } = placeSectors(mat)
  const matWidth = circles * 220
  const addCount = countOf(mat, addDen)
  const addTotal = fraction(addCount, addDen)

  const stageNote =
    mode === 'explore'
      ? 'Tap a frame to lift one piece onto the mat below. Tap a piece on the mat to put it back.'
      : mode === 'equivalence'
        ? `Lift pieces from one family — not the ${familyName(target.den, true)} themselves — and lay them in the dashed outline until it is exactly full. Then tap Check.`
        : `Only the ${familyName(addDen, true)} box is open, and it holds spare pieces — enough for ${BANK_WHOLES} whole circles. Place your first number of pieces, then the second, and count them all.`

  return (
    <MaterialShell
      mat="felt"
      help={
        <p>
          These are the ten fraction circles: one whole and its families of halves, thirds, on up to tenths, each cut into
          equal red pieces. Tap a frame to lift a piece onto the mat, and tap a piece on the mat (or its Return button) to
          put it back. Use <strong>Explore &amp; name</strong> to learn each piece&rsquo;s name, <strong>Equivalence</strong> to
          rebuild one piece from a different family, and <strong>Add &amp; subtract</strong> to join and take away pieces of
          the same family. The circle itself is the check: pieces that don&rsquo;t belong leave a gap or spill past the outline.
        </p>
      }
      controls={
        <>
          <label>
            Activity
            <select value={mode} onChange={(e) => { setMode(e.target.value as Mode); clearMat() }} aria-label="activity">
              <option value="explore">Explore &amp; name</option>
              <option value="equivalence">Equivalence</option>
              <option value="add">Add &amp; subtract</option>
            </select>
          </label>
          {mode === 'equivalence' && (
            <label>
              Fill this piece
              <select
                value={target.den}
                onChange={(e) => {
                  const den = Number(e.target.value)
                  setTarget(EQUIVALENCE_TARGETS.find((t) => t.den === den) ?? EQUIVALENCE_TARGETS[0])
                  clearMat()
                }}
                aria-label="target piece"
              >
                {EQUIVALENCE_TARGETS.map((t) => (
                  <option key={t.den} value={t.den}>
                    {fractionName(t.num, t.den)} ({formatFraction(t)})
                  </option>
                ))}
              </select>
            </label>
          )}
          {mode === 'add' && (
            <label>
              Family
              <select
                value={addDen}
                onChange={(e) => { setAddDen(Number(e.target.value)); clearMat() }}
                aria-label="fraction family"
              >
                {DENOMINATORS.filter((d) => d > 1).map((d) => (
                  <option key={d} value={d}>
                    {familyName(d, true)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="fraction-circles-toggle">
            <input type="checkbox" checked={showSymbols} onChange={(e) => setShowSymbols(e.target.checked)} />
            Show symbols
          </label>
          <button type="button" className="btn" onClick={clearMat}>
            Reset
          </button>
        </>
      }
    >
      <p className="stage-note">{stageNote}</p>

      <div className="fraction-circles-frames" role="group" aria-label="the ten fraction circle frames, whole through tenths">
        {DENOMINATORS.map((den) => (
          <div
            key={den}
            className={`fraction-circles-frame${mode === 'add' && den !== addDen ? ' fraction-circles-frame-dim' : ''}`}
          >
            <button
              type="button"
              className="fraction-circles-inset"
              disabled={frameDisabled(den)}
              onClick={() => onLift(den)}
              aria-label={`lift one ${familyName(den)} onto the mat`}
            >
              <InsetFrame den={den} remaining={mode === 'add' ? den : remainingInFrame(mat, den)} />
            </button>
            <span className="fraction-circles-frame-label">
              {den === 1 ? 'whole' : familyName(den, true)}
              {showSymbols && den > 1 ? ` · 1/${den}` : ''}
            </span>
          </div>
        ))}
      </div>

      <svg
        className="fraction-circles-mat"
        viewBox={`0 0 ${matWidth} 220`}
        width={matWidth}
        height={220}
        role="group"
        aria-label={`work mat with ${mat.length} ${mat.length === 1 ? 'piece' : 'pieces'}`}
      >
        {Array.from({ length: circles }, (_, k) => (
          <circle
            key={k}
            cx={110 + 220 * k}
            cy={110}
            r={100}
            fill="none"
            stroke="var(--paper)"
            strokeWidth={1.5}
            strokeDasharray="4 6"
            opacity={0.7}
          />
        ))}
        {sectors.map((s) => {
          const cx = 110 + 220 * s.circle
          const label = `return one ${familyName(s.den)} to its frame`
          const common = {
            className: 'fraction-circles-mat-sector',
            fill: 'var(--bead-1)',
            stroke: 'var(--card)',
            strokeWidth: 2,
            role: 'button',
            tabIndex: 0,
            'aria-label': label,
            onClick: () => onReturn(s.index),
            onKeyDown: (e: KeyboardEvent<SVGElement>) => keyActivate(e, () => onReturn(s.index)),
          }
          return s.den === 1 ? (
            <circle key={s.index} cx={cx} cy={110} r={97} {...common} />
          ) : (
            <path key={s.index} d={sectorPath(cx, 110, 97, s.start, s.sweep)} {...common} />
          )
        })}
        {mode === 'equivalence' && (
          <path
            d={sectorPath(110, 110, 100, START, TAU / target.den)}
            fill="none"
            stroke="var(--paper)"
            strokeWidth={2.5}
            strokeDasharray="7 5"
            pointerEvents="none"
          />
        )}
      </svg>

      {families.length > 0 && (
        <div className="fraction-circles-chips">
          {families.map((den) => (
            <button key={den} type="button" className="btn" onClick={() => onReturnLast(den)}>
              Return a {familyName(den)} ({countOf(mat, den)} out)
            </button>
          ))}
        </div>
      )}

      {mode === 'explore' && (
        <div className="fraction-circles-panel">
          {lastDen === null ? (
            <p className="fraction-circles-panel-hint">
              Lift a piece and its name appears here. Every piece in a frame is the same size — count how many make the
              whole circle.
            </p>
          ) : (
            <>
              <p className="fraction-circles-panel-name">
                {fractionName(1, lastDen)}
                {showSymbols && <span className="fraction-circles-panel-symbol">{`1/${lastDen}`}</span>}
              </p>
              {countOf(mat, lastDen) > 0 && (
                <p className="fraction-circles-panel-sub">
                  On the mat: {fractionName(countOf(mat, lastDen), lastDen)}
                  {showSymbols ? ` — ${countOf(mat, lastDen)}/${lastDen}` : ''}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {mode === 'equivalence' && (
        <div className="fraction-circles-panel">
          <p className="fraction-circles-panel-hint">
            Can another family make {fractionName(target.num, target.den)}
            {showSymbols ? ` (${formatFraction(target)})` : ''} exactly? Fill the dashed outline, then tap Check.
          </p>
          <button type="button" className="btn primary" onClick={() => setEqResult(checkEquivalence(target, mat))}>
            Check
          </button>
          {eqResult && (
            <ul className="fraction-circles-notes" aria-live="polite">
              {eqResult.correct ? (
                <li className="fraction-circles-note-ok">
                  Exactly full — {fractionName(countOf(mat, eqResult.families[0]), eqResult.families[0])} make{' '}
                  {fractionName(target.num, target.den)}
                  {showSymbols
                    ? ` (${countOf(mat, eqResult.families[0])}/${eqResult.families[0]} = ${formatFraction(target)})`
                    : ''}
                  . Clear the mat and try another family.
                </li>
              ) : (
                <>
                  {eqResult.comparison === 'empty' && (
                    <li className="fraction-circles-note-hint">
                      The outline is still empty — lift pieces from one family to fill it.
                    </li>
                  )}
                  {eqResult.families.length > 1 && (
                    <li className="fraction-circles-note-hint">
                      Pieces from {eqResult.families.length} different families are mixed together — use just one family.
                    </li>
                  )}
                  {eqResult.usesTargetFamily && (
                    <li className="fraction-circles-note-hint">
                      Those are {familyName(target.den, true)} — the puzzle is to fill the outline with a{' '}
                      <em>different</em> family.
                    </li>
                  )}
                  {eqResult.comparison === 'under' && (
                    <li className="fraction-circles-note-hint">Not full yet — part of the outline still shows.</li>
                  )}
                  {eqResult.comparison === 'over' && (
                    <li className="fraction-circles-note-hint">Too much — the pieces spill past the outline.</li>
                  )}
                </>
              )}
            </ul>
          )}
        </div>
      )}

      {mode === 'add' && (
        <div className="fraction-circles-panel">
          {addCount === 0 ? (
            <p className="fraction-circles-panel-hint">
              Place your first number of pieces, then your second — for 5/8 + 6/8, place five eighths, then six more. The
              total appears here; take pieces away to subtract.
            </p>
          ) : (
            <>
              <p className="fraction-circles-panel-name">
                {fractionName(addCount, addDen)}
                {showSymbols && <span className="fraction-circles-panel-symbol">{`${addCount}/${addDen}`}</span>}
              </p>
              {addCount >= addDen && (
                <p className="fraction-circles-panel-sub">
                  The pieces make a full circle: that is {mixedName(toMixed(addTotal))}
                  {showSymbols ? ` — ${formatMixed(toMixed(addTotal))}` : ''}.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </MaterialShell>
  )
}
