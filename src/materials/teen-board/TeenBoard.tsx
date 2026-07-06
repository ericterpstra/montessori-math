import { useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { NumberCard } from '../../components/NumberCard'
import { BeadBar, TenBar } from '../../components/beads'
import {
  UNIT_VALUES,
  addTenBar,
  allRowsMatch,
  availableCards,
  availableColoredBars,
  availableTenBars,
  cardInCorrectRow,
  createBoard,
  placeCard,
  placeColoredBar,
  removeCard,
  removeColoredBar,
  removeTenBar,
  rowBeadsComplete,
  rowMatches,
  rowSymbolValue,
  sequenceComplete,
} from './model'
import type { RowState, TeenBoardMode } from './model'
import './teen-board.css'

type Selection =
  | { kind: 'card'; value: number }
  | { kind: 'ten-bar' }
  | { kind: 'colored'; size: number }
  | null

function sameSelection(a: Selection, b: Selection): boolean {
  if (!a || !b || a.kind !== b.kind) return false
  if (a.kind === 'card' && b.kind === 'card') return a.value === b.value
  if (a.kind === 'colored' && b.kind === 'colored') return a.size === b.size
  return true
}

export default function TeenBoard() {
  const [mode, setMode] = useState<TeenBoardMode>('symbols')
  const [board, setBoard] = useState(createBoard)
  const [selection, setSelection] = useState<Selection>(null)

  const cards = availableCards(board)
  const bars = availableColoredBars(board)
  const tenBarsLeft = availableTenBars(board)
  const done = mode === 'symbols' ? sequenceComplete(board) : allRowsMatch(board)

  function reset() {
    setBoard(createBoard())
    setSelection(null)
  }

  function toggleSelection(next: Selection) {
    setSelection((cur) => (sameSelection(cur, next) ? null : next))
  }

  function applyToRow(rowIndex: number) {
    if (!selection) return
    if (selection.kind === 'card') {
      setBoard(placeCard(board, selection.value, rowIndex))
    } else if (selection.kind === 'ten-bar') {
      if (availableTenBars(board) > 0) setBoard(addTenBar(board, rowIndex))
    } else {
      setBoard(placeColoredBar(board, selection.size, rowIndex))
    }
    setSelection(null)
  }

  function tapSlat(rowIndex: number) {
    if (selection) applyToRow(rowIndex)
    else if (board.rows[rowIndex].card !== null) setBoard(removeCard(board, rowIndex))
  }

  function markFor(row: RowState, rowIndex: number): 'ok' | 'wrong' | null {
    if (mode === 'symbols') {
      if (row.card === null) return null
      return cardInCorrectRow(row, rowIndex) ? 'ok' : 'wrong'
    }
    if (rowMatches(row)) return 'ok'
    if (rowBeadsComplete(row) || row.tenBars > 1) return 'wrong'
    return null
  }

  return (
    <MaterialShell
      help={
        <p>
          Tap a card in the tray, then tap a slat on the board: the card slides over the zero and 10
          becomes a teen number. In <strong>Symbols &amp; beads</strong> mode, tap the golden ten-bar or a
          colored bead bar, then tap the + beside a row to lay out the quantity — a check mark appears
          when the beads and the numeral say the same number. Tap any placed card or bar to put it back,
          and use Reset to start over.
        </p>
      }
      controls={
        <>
          <label>
            Mode{' '}
            <select
              value={mode}
              onChange={(e) => {
                const next = e.target.value as TeenBoardMode
                setMode(next)
                if (next === 'symbols') setSelection((cur) => (cur && cur.kind !== 'card' ? null : cur))
              }}
            >
              <option value="symbols">Symbols (build 11–19)</option>
              <option value="symbols-beads">Symbols &amp; beads</option>
            </select>
          </label>
          <button type="button" className="btn" onClick={reset}>
            Reset
          </button>
        </>
      }
    >
      <div className="bank-tray teen-board-tray">
        <span className="teen-board-tray-label">Unit cards</span>
        {UNIT_VALUES.map((n) => {
          const inTray = cards.includes(n)
          const isSelected = selection?.kind === 'card' && selection.value === n
          return (
            <button
              key={n}
              type="button"
              className={`bank-item${isSelected ? ' teen-board-selected' : ''}`}
              onClick={() => toggleSelection({ kind: 'card', value: n })}
              disabled={!inTray}
              aria-pressed={isSelected}
              aria-label={inTray ? `unit card ${n}` : `unit card ${n} (on the board)`}
            >
              {inTray ? <NumberCard value={n} height={44} asDiv /> : <span className="teen-board-slot" />}
            </button>
          )
        })}
      </div>

      {mode === 'symbols-beads' && (
        <div className="bank-tray teen-board-tray">
          <span className="teen-board-tray-label">Beads</span>
          <button
            type="button"
            className={`bank-item${selection?.kind === 'ten-bar' ? ' teen-board-selected' : ''}`}
            onClick={() => toggleSelection({ kind: 'ten-bar' })}
            disabled={tenBarsLeft === 0}
            aria-pressed={selection?.kind === 'ten-bar'}
            aria-label={`golden ten-bar, ${tenBarsLeft} left in the supply`}
          >
            <TenBar beadSize={12} />
          </button>
          <span className="teen-board-supply-count">× {tenBarsLeft}</span>
          {UNIT_VALUES.map((n) => {
            const inSupply = bars.includes(n)
            const isSelected = selection?.kind === 'colored' && selection.size === n
            return (
              <button
                key={n}
                type="button"
                className={`bank-item${isSelected ? ' teen-board-selected' : ''}`}
                onClick={() => toggleSelection({ kind: 'colored', size: n })}
                disabled={!inSupply}
                aria-pressed={isSelected}
                aria-label={inSupply ? `colored bar of ${n}` : `colored bar of ${n} (on the mat)`}
              >
                {inSupply ? (
                  <BeadBar n={n} beadSize={12} />
                ) : (
                  <span className="teen-board-slot teen-board-slot-bar" style={{ width: n * 12 }} />
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="teen-board-rows" role="group" aria-label="teen board">
        {board.rows.map((row, i) => {
          const mark = markFor(row, i)
          return (
            <div key={i} className="teen-board-row">
              <button
                type="button"
                className="teen-board-slat"
                onClick={() => tapSlat(i)}
                aria-label={
                  selection
                    ? `row ${i + 1}, reads ${rowSymbolValue(row)}; tap to place the selected piece here`
                    : row.card !== null
                      ? `row ${i + 1}, reads ${rowSymbolValue(row)}; tap to take the card off`
                      : `row ${i + 1}, reads 10`
                }
              >
                <span className="teen-board-digit">1</span>
                {row.card !== null ? (
                  <NumberCard value={row.card} height={52} asDiv />
                ) : (
                  <span className="teen-board-digit">0</span>
                )}
              </button>

              {mode === 'symbols-beads' && (
                <div className="teen-board-beads">
                  {Array.from({ length: row.tenBars }, (_, k) => (
                    <button
                      key={`ten-${k}`}
                      type="button"
                      className="teen-board-piece"
                      onClick={() => setBoard(removeTenBar(board, i))}
                      aria-label={`ten-bar beside row ${i + 1}; tap to put it back`}
                    >
                      <TenBar beadSize={12} />
                    </button>
                  ))}
                  {row.coloredBar !== null && (
                    <button
                      type="button"
                      className="teen-board-piece"
                      onClick={() => setBoard(removeColoredBar(board, i))}
                      aria-label={`bar of ${row.coloredBar} beside row ${i + 1}; tap to put it back`}
                    >
                      <BeadBar n={row.coloredBar} beadSize={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="teen-board-drop"
                    onClick={() => applyToRow(i)}
                    disabled={!selection}
                    aria-label={`lay the selected piece beside row ${i + 1}`}
                  >
                    +
                  </button>
                </div>
              )}

              <span
                className={`teen-board-mark${mark ? ` teen-board-${mark}` : ''}`}
                role={mark ? 'img' : undefined}
                aria-label={mark === 'ok' ? 'matches' : mark === 'wrong' ? 'does not match' : undefined}
                aria-hidden={mark ? undefined : true}
              >
                {mark === 'ok' ? '✓' : mark === 'wrong' ? '✗' : ''}
              </span>
            </div>
          )
        })}
      </div>

      <p className="stage-note">
        {mode === 'symbols'
          ? done
            ? 'The board reads 11 to 19. Read it out loud, top to bottom.'
            : 'Build the teens in order: 11 at the top, down to 19 at the bottom.'
          : done
            ? 'Every row of beads matches its numeral. Count a row out loud to prove it.'
            : 'Each row needs its card, one golden ten-bar, and the colored bar that matches.'}
      </p>
    </MaterialShell>
  )
}
