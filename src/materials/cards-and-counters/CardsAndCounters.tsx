import { useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { NumberCard } from '../../components/NumberCard'
import { randomSeed } from '../../lib/rng'
import {
  addCounter,
  checkAll,
  classifyOddEven,
  counterPositions,
  isLayoutCorrect,
  newGame,
  pickUpCard,
  placeSelected,
  removeCounter,
  supplyRemaining,
  toggleSelect,
} from './model'
import type { CardsAndCountersState, SlotCheck } from './model'
import './cards-and-counters.css'

export default function CardsAndCounters() {
  const [state, setState] = useState<CardsAndCountersState>(() => newGame(randomSeed()))
  const [marks, setMarks] = useState<readonly SlotCheck[] | null>(null)
  const [reveal, setReveal] = useState(false)

  const supply = supplyRemaining(state)
  const correct = isLayoutCorrect(state)

  function update(next: CardsAndCountersState) {
    if (next === state) return // invalid move — nothing happened
    setState(next)
    setMarks(null)
    setReveal(false)
  }

  function reset() {
    setState(newGame(randomSeed()))
    setMarks(null)
    setReveal(false)
  }

  let hint: string
  if (state.selected !== null) {
    hint = `Now tap a space on the mat to lay down the ${state.selected}.`
  } else if (state.tray.length > 0) {
    hint = 'Tap a card in the tray, then tap a space to lay the cards out in order — 1 to 10.'
  } else if (correct) {
    hint = 'Every card has its counters and the bowl is exactly empty. Try Odd & even.'
  } else {
    hint = 'Tap below each card to add counters from the bowl, one at a time.'
  }

  return (
    <MaterialShell
      mat="felt"
      help={
        <p>
          Tap a card in the tray, then tap a space on the mat to lay the cards 1 through 10 in
          order. Tap the space below a card to add red counters one at a time — they arrange
          themselves in pairs, with an odd counter alone at the bottom. The bowl holds exactly 55
          counters, so if every card gets the right amount, the bowl comes out exactly empty — if
          not, recount together. Use Check to mark each card, and after a correct layout use Odd
          &amp; even to see which numbers block the line and which let it pass.
        </p>
      }
      controls={
        <>
          <button type="button" className="btn" onClick={() => setMarks(checkAll(state))}>
            Check
          </button>
          <button
            type="button"
            className="btn cards-and-counters-btn"
            disabled={!correct}
            onClick={() => setReveal((r) => !r)}
            title={correct ? undefined : 'Finish a correct layout first'}
          >
            {reveal ? 'Hide odd & even' : 'Odd & even'}
          </button>
          <button type="button" className="btn" onClick={reset}>
            Reset
          </button>
        </>
      }
    >
      <div className="bank-tray cards-and-counters-tray">
        <span className="cards-and-counters-tray-label">Cards</span>
        {state.tray.map((v) => (
          <NumberCard
            key={v}
            value={v}
            height={72}
            selected={state.selected === v}
            onClick={() => update(toggleSelect(state, v))}
          />
        ))}
        {state.tray.length === 0 && (
          <span className="cards-and-counters-tray-empty">all cards are on the mat</span>
        )}
        <span className="cards-and-counters-supply" aria-live="polite">
          <span className="cards-and-counters-counter" aria-hidden="true" />
          <strong>{supply}</strong>
          <span>counters left</span>
        </span>
      </div>

      <p className="stage-note cards-and-counters-hint">{hint}</p>

      <div className="cards-and-counters-row">
        {state.slots.map((card, i) => {
          const count = state.counters[i]
          const positions = counterPositions(count)
          const mark = marks?.[i]
          const parity = card !== null ? classifyOddEven(card) : null
          const markOk = mark !== undefined && mark.cardCorrect && mark.countCorrect
          return (
            <div key={i} className="cards-and-counters-column">
              <div className="cards-and-counters-markrow">
                {mark !== undefined && card !== null && (
                  <span
                    className={`cards-and-counters-mark ${
                      markOk ? 'cards-and-counters-mark-ok' : 'cards-and-counters-mark-bad'
                    }`}
                    role="img"
                    aria-label={markOk ? `space ${i + 1} correct` : `space ${i + 1} not right yet`}
                  >
                    {markOk ? '✓' : '✗'}
                  </span>
                )}
              </div>
              {card === null ? (
                <button
                  type="button"
                  className="cards-and-counters-slot"
                  onClick={() => update(placeSelected(state, i))}
                  aria-label={
                    state.selected !== null
                      ? `lay the ${state.selected} card in space ${i + 1}`
                      : `empty card space ${i + 1}`
                  }
                />
              ) : (
                <NumberCard value={card} height={72} onClick={() => update(pickUpCard(state, i))} />
              )}
              <button
                type="button"
                className="cards-and-counters-area"
                onClick={() => update(addCounter(state, i))}
                aria-label={
                  card === null
                    ? `counter space ${i + 1} — lay a card first`
                    : `add a counter under the ${card} card (${count} placed)`
                }
              >
                <span className="cards-and-counters-grid">
                  {reveal && parity !== null && (
                    <span
                      className={`cards-and-counters-line cards-and-counters-line-${parity}`}
                      aria-hidden="true"
                    />
                  )}
                  {positions.map((p, k) => (
                    <span
                      key={k}
                      className="cards-and-counters-counter"
                      style={{
                        gridRow: p.row + 1,
                        gridColumn: p.centered ? '1 / span 2' : p.col + 1,
                        justifySelf: p.centered ? 'center' : undefined,
                      }}
                    />
                  ))}
                  {card !== null && count === 0 && (
                    <span className="cards-and-counters-plus" aria-hidden="true">
                      +
                    </span>
                  )}
                </span>
              </button>
              {reveal && parity !== null && (
                <div className="cards-and-counters-parity">{parity}</div>
              )}
              {count > 0 && !reveal && (
                <button
                  type="button"
                  className="cards-and-counters-remove"
                  onClick={() => update(removeCounter(state, i))}
                  aria-label={`put one counter from space ${i + 1} back in the bowl`}
                >
                  &minus;1
                </button>
              )}
            </div>
          )
        })}
      </div>
    </MaterialShell>
  )
}
