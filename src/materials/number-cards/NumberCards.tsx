import { useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { NumberCard } from '../../components/NumberCard'
import { createRng, randomSeed } from '../../lib/rng'
import type { RNG } from '../../lib/rng'
import {
  allCorrect,
  bankColumns,
  checkSelection,
  expandedParts,
  expansionText,
  randomTarget,
  removeCard,
  selectCard,
  selectionFromNumber,
  stackReading,
} from './model'
import type { CardPlace, PlaceCheck, Selection } from './model'
import './number-cards.css'

type Mode = 'free' | 'build' | 'expand'
type View = 'expanded' | 'composed'

const CARD_HEIGHT = 72
const BANK_CARD_HEIGHT = 44

/** Cards laid side by side: 3000 · 200 · 50 · 1. */
function ExpandedRow({ parts, onRemove }: { parts: number[]; onRemove?: (place: CardPlace) => void }) {
  if (parts.length === 0) {
    return (
      <div className="number-cards-expanded">
        <span className="number-cards-empty">Tap cards in the bank above to lay them here.</span>
      </div>
    )
  }
  return (
    <div className="number-cards-expanded">
      {parts.map((value) => {
        const place = (String(value).length - 1) as CardPlace
        return (
          <NumberCard
            key={value}
            value={value}
            height={CARD_HEIGHT}
            asDiv={!onRemove}
            onClick={onRemove ? () => onRemove(place) : undefined}
          />
        )
      })}
    </div>
  )
}

/** Cards stacked largest on the bottom, right edges aligned, so they read as one number. */
function ComposedStack({ parts, reading }: { parts: number[]; reading: string }) {
  if (parts.length === 0) {
    return (
      <div className="number-cards-composed">
        <span className="number-cards-empty">Tap cards in the bank above to stack them here.</span>
      </div>
    )
  }
  const widest = Math.round(CARD_HEIGHT * 0.62 * String(parts[0]).length)
  return (
    <div
      className="number-cards-composed"
      role="img"
      aria-label={`Cards stacked to read ${reading}`}
      style={{ width: widest, height: CARD_HEIGHT }}
    >
      {parts.map((value, i) => (
        <div key={value} className="number-cards-stack-card" style={{ zIndex: i + 1 }}>
          <NumberCard value={value} height={CARD_HEIGHT} asDiv />
        </div>
      ))}
    </div>
  )
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <>
      <button
        type="button"
        className="number-cards-btn"
        aria-pressed={view === 'expanded'}
        onClick={() => onChange('expanded')}
      >
        Side by side
      </button>
      <button
        type="button"
        className="number-cards-btn"
        aria-pressed={view === 'composed'}
        onClick={() => onChange('composed')}
      >
        Stacked
      </button>
    </>
  )
}

function CheckResults({ checks }: { checks: PlaceCheck[] }) {
  return (
    <>
      <div className="number-cards-checks">
        {checks.map((c) => (
          <span
            key={c.place}
            className={`number-cards-check ${c.correct ? 'number-cards-check-ok' : 'number-cards-check-err'}`}
          >
            {c.label} {c.correct ? '✓' : '✗'}
          </span>
        ))}
      </div>
      <p className="number-cards-check-note">
        {allCorrect(checks)
          ? 'Every place matches. Read the number aloud, then try a new one.'
          : 'Look again at each place marked ✗ — fix it, then check once more.'}
      </p>
    </>
  )
}

export default function NumberCards() {
  const [rng] = useState<RNG>(() => createRng(randomSeed()))
  const [mode, setMode] = useState<Mode>('free')
  const [selection, setSelection] = useState<Selection>({})
  const [view, setView] = useState<View>('expanded')
  const [target, setTarget] = useState<number>(() => randomTarget(rng))
  const [checks, setChecks] = useState<PlaceCheck[] | null>(null)

  const changeMode = (next: Mode) => {
    setMode(next)
    setSelection({})
    setChecks(null)
    setView(next === 'expand' ? 'composed' : 'expanded')
    if (next !== 'free') setTarget(randomTarget(rng))
  }

  const newTarget = () => {
    setTarget(randomTarget(rng))
    setSelection({})
    setChecks(null)
    if (mode === 'expand') setView('composed')
  }

  const reset = () => {
    setSelection({})
    setChecks(null)
    setView(mode === 'expand' ? 'composed' : 'expanded')
  }

  const tapBank = (place: CardPlace, digit: number) => {
    setSelection((sel) => selectCard(sel, place, digit))
    setChecks(null)
  }

  const removeFromWorkspace = (place: CardPlace) => {
    setSelection((sel) => removeCard(sel, place))
    setChecks(null)
  }

  // In Expand It mode the workspace shows the target's own cards; otherwise the child's.
  const shown: Selection = mode === 'expand' ? selectionFromNumber(target) : selection
  const parts = expandedParts(shown)
  const reading = stackReading(shown)

  const controls = (
    <>
      <label>
        Mode
        <select value={mode} onChange={(e) => changeMode(e.target.value as Mode)}>
          <option value="free">Free compose</option>
          <option value="build">Read &amp; build</option>
          <option value="expand">Expand it</option>
        </select>
      </label>
      {mode !== 'free' && (
        <button type="button" className="number-cards-btn" onClick={newTarget}>
          New number
        </button>
      )}
      <button type="button" className="number-cards-btn" onClick={reset}>
        Reset
      </button>
    </>
  )

  const help = (
    <p>
      Tap a card in the bank to bring it to the mat — one card for each place, so tapping a second tens card swaps out
      the first. Switch between <strong>Side by side</strong> and <strong>Stacked</strong> to see how 3000, 200, 50,
      and 1 become 3251. In <strong>Read &amp; build</strong>, build the number shown and press Check to see which
      places match. In <strong>Expand it</strong>, read the stacked number and say its parts out loud before you
      reveal them.
    </p>
  )

  return (
    <MaterialShell controls={controls} help={help} mat="felt">
      {mode === 'build' && (
        <div className="number-cards-target">
          <span className="number-cards-target-label">Build this number</span>
          <span className="number-cards-target-value">{target}</span>
        </div>
      )}
      {mode === 'expand' && (
        <p className="stage-note number-cards-prompt">
          Read the stacked number aloud, then say how many thousands, hundreds, tens, and units are hiding in it —
          only then press <strong>Show the parts</strong> to see if you were right.
        </p>
      )}

      {mode !== 'expand' && (
        <div className="bank-tray number-cards-bank">
          {bankColumns().map((col) => (
            <div key={col.place} className="number-cards-bank-col">
              <span className="number-cards-bank-label">{col.label}</span>
              {col.cards.map((value, i) => (
                <NumberCard
                  key={value}
                  value={value}
                  height={BANK_CARD_HEIGHT}
                  selected={selection[col.place] === i + 1}
                  onClick={() => tapBank(col.place, i + 1)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="number-cards-workspace">
        <div className="number-cards-workspace-head">
          <span className="number-cards-workspace-title">
            {mode === 'expand' ? 'The number' : 'Your cards'}
          </span>
          {mode === 'expand' ? (
            <button
              type="button"
              className="number-cards-btn"
              onClick={() => setView(view === 'composed' ? 'expanded' : 'composed')}
            >
              {view === 'composed' ? 'Show the parts' : 'Stack it back up'}
            </button>
          ) : (
            <ViewToggle view={view} onChange={setView} />
          )}
          {mode === 'build' && (
            <button
              type="button"
              className="number-cards-btn"
              onClick={() => setChecks(checkSelection(selection, target))}
            >
              Check
            </button>
          )}
        </div>

        {view === 'expanded' ? (
          <ExpandedRow parts={parts} onRemove={mode === 'expand' ? undefined : removeFromWorkspace} />
        ) : (
          <ComposedStack parts={parts} reading={reading} />
        )}

        {mode === 'expand' && view === 'expanded' && parts.length > 0 && (
          <p className="number-cards-check-note">
            {reading} is {expansionText(shown)}. Were your parts the same?
          </p>
        )}

        {mode === 'build' && checks && <CheckResults checks={checks} />}
      </div>
    </MaterialShell>
  )
}
