import { useState } from 'react'
import { MaterialShell } from '../../components/MaterialShell'
import { randomSeed } from '../../lib/rng'
import {
  ALL_TILES,
  TILE_COUNT,
  emptyPlacements,
  evaluateSkipCount,
  isBoardComplete,
  misplacedCells,
  nextTileInOrder,
  placeTile,
  remainingTilesShuffled,
  removeTileAt,
  type Placements,
  type SkipCountEvaluation,
} from './model'
import './hundred-board.css'

type Mode = 'order' | 'shuffled' | 'skip'

export default function HundredBoard() {
  const [mode, setMode] = useState<Mode>('order')
  const [placements, setPlacements] = useState<Placements>(emptyPlacements)
  const [selectedTile, setSelectedTile] = useState<number | null>(null)
  const [seed, setSeed] = useState(() => randomSeed())
  /** Misplaced cells at the moment Check was pressed; null = not checked. */
  const [checkedWrong, setCheckedWrong] = useState<number[] | null>(null)
  const [skipN, setSkipN] = useState(2)
  const [taps, setTaps] = useState<ReadonlySet<number>>(() => new Set())
  const [skipEval, setSkipEval] = useState<SkipCountEvaluation | null>(null)

  const clearWork = () => {
    setPlacements(emptyPlacements())
    setSelectedTile(null)
    setCheckedWrong(null)
    setTaps(new Set())
    setSkipEval(null)
  }

  const handleModeChange = (next: Mode) => {
    setMode(next)
    clearWork()
  }

  const handleReset = () => {
    clearWork()
    if (mode === 'shuffled') setSeed(randomSeed())
  }

  const handleCheck = () => {
    if (mode === 'skip') {
      setSkipEval(evaluateSkipCount(skipN, taps))
    } else {
      setCheckedWrong(misplacedCells(placements))
    }
  }

  const handleSkipNChange = (n: number) => {
    setSkipN(n)
    setTaps(new Set())
    setSkipEval(null)
  }

  // In order mode the tray offers exactly the next tile; in shuffled mode the child picks from the pile.
  const orderNext = mode === 'order' ? nextTileInOrder(placements) : null
  const tileToPlace = mode === 'order' ? orderNext : selectedTile
  const pile = mode === 'shuffled' ? remainingTilesShuffled(placements, seed) : []
  const complete = mode !== 'skip' && isBoardComplete(placements)

  const handleCellTap = (cell: number) => {
    if (mode === 'skip') {
      const next = new Set(taps)
      if (next.has(cell)) next.delete(cell)
      else next.add(cell)
      setTaps(next)
      setSkipEval(null)
      return
    }
    setCheckedWrong(null)
    if (placements.has(cell)) {
      // Tap a placed tile to send it back to the tray.
      setPlacements(removeTileAt(placements, cell))
      return
    }
    if (tileToPlace !== null) {
      setPlacements(placeTile(placements, cell, tileToPlace))
      setSelectedTile(null)
    }
  }

  const controls = (
    <>
      <label>
        Mode
        <select value={mode} onChange={(e) => handleModeChange(e.target.value as Mode)}>
          <option value="order">In order</option>
          <option value="shuffled">Shuffled</option>
          <option value="skip">Skip counting</option>
        </select>
      </label>
      {mode === 'skip' && (
        <label>
          Count by
          <select value={skipN} onChange={(e) => handleSkipNChange(Number(e.target.value))}>
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        className="btn"
        onClick={handleCheck}
        disabled={mode === 'skip' ? taps.size === 0 : placements.size === 0}
      >
        Check
      </button>
      <button type="button" className="btn" onClick={handleReset}>
        Reset
      </button>
    </>
  )

  const help =
    mode === 'skip' ? (
      <p>
        Choose a number to count by, then tap every square you land on while skip counting aloud — for counting by{' '}
        {skipN}, that is {skipN}, {skipN * 2}, {skipN * 3}, and so on. Tap a square again to un-mark it. When the child
        is finished, press Check: it marks any multiples that were missed and any squares tapped by mistake, just as
        recounting the real chains would reveal.
      </p>
    ) : (
      <p>
        Tap a tile in the tray, then tap the square on the board where it belongs; tap a placed tile to send it back.
        The board reads left to right, top to bottom, from 1 to 100 — the growing pattern of rows and columns shows the
        child when something looks wrong. Press Check at any time to mark tiles that are not in their true place.
      </p>
    )

  return (
    <MaterialShell mat="felt" controls={controls} help={help}>
      <div className="hundred-board-layout">
        {mode === 'order' && (
          <div className="hundred-board-tray no-print">
            {orderNext !== null ? (
              <>
                <span className="hundred-board-tray-label">
                  Next tile ({TILE_COUNT - placements.size} left in the tray):
                </span>
                <span className="hundred-board-tile hundred-board-selected" aria-label={`next tile ${orderNext}`}>
                  {orderNext}
                </span>
                <span className="hundred-board-tray-label">Tap the square where it belongs.</span>
              </>
            ) : (
              <span className="hundred-board-tray-label">The tray is empty.</span>
            )}
          </div>
        )}
        {mode === 'shuffled' && (
          <div className="hundred-board-tray no-print">
            <span className="hundred-board-tray-label">Tile pile ({pile.length} left):</span>
            <div className="hundred-board-pile" role="listbox" aria-label="shuffled tile pile">
              {pile.map((tile) => (
                <button
                  key={tile}
                  type="button"
                  role="option"
                  aria-selected={selectedTile === tile}
                  className={`hundred-board-tile${selectedTile === tile ? ' hundred-board-selected' : ''}`}
                  onClick={() => setSelectedTile(selectedTile === tile ? null : tile)}
                >
                  {tile}
                </button>
              ))}
              {pile.length === 0 && <span className="hundred-board-tray-label">The pile is empty.</span>}
            </div>
          </div>
        )}

        <div className="hundred-board-grid" role="group" aria-label="hundred board, ten by ten grid">
          {ALL_TILES.map((cell) => {
            if (mode === 'skip') {
              const tapped = taps.has(cell)
              const hit = skipEval !== null && skipEval.correctHits.includes(cell)
              const miss = skipEval !== null && skipEval.misses.includes(cell)
              const wrong = skipEval !== null && skipEval.wrongTaps.includes(cell)
              const cls = [
                'hundred-board-cell',
                'hundred-board-skip',
                tapped ? 'hundred-board-tapped' : '',
                hit ? 'hundred-board-hit' : '',
                miss ? 'hundred-board-miss' : '',
                wrong ? 'hundred-board-wrong' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  key={cell}
                  type="button"
                  className={cls}
                  onClick={() => handleCellTap(cell)}
                  aria-pressed={tapped}
                  aria-label={`${cell}${hit ? ', correct' : ''}${miss ? ', missed multiple' : ''}${wrong ? ', not a multiple' : ''}`}
                >
                  {cell}
                  {hit && <span className="hundred-board-mark hundred-board-mark-check">✓</span>}
                  {wrong && <span className="hundred-board-mark hundred-board-mark-cross">✗</span>}
                  {miss && <span className="hundred-board-mark hundred-board-mark-dot">·</span>}
                </button>
              )
            }
            const tile = placements.get(cell)
            const wrong = checkedWrong !== null && checkedWrong.includes(cell)
            const cls = [
              'hundred-board-cell',
              tile !== undefined ? 'hundred-board-filled' : '',
              wrong ? 'hundred-board-wrong' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={cell}
                type="button"
                className={cls}
                onClick={() => handleCellTap(cell)}
                aria-label={
                  tile !== undefined
                    ? `tile ${tile}${wrong ? ', not in its place' : ''} — tap to return it to the tray`
                    : 'empty square'
                }
              >
                {tile ?? ''}
                {wrong && <span className="hundred-board-mark hundred-board-mark-cross">✗</span>}
              </button>
            )
          })}
        </div>

        {mode !== 'skip' && complete && (
          <p className="hundred-board-message hundred-board-complete">
            All 100 tiles are in place. The board is complete.
          </p>
        )}
        {mode !== 'skip' && !complete && checkedWrong !== null && (
          <p className="hundred-board-message">
            {checkedWrong.length === 0
              ? 'Every tile placed so far is in its true place.'
              : `${checkedWrong.length} ${checkedWrong.length === 1 ? 'tile is' : 'tiles are'} not where ${
                  checkedWrong.length === 1 ? 'it belongs' : 'they belong'
                } — look for the ✗ marks.`}
          </p>
        )}
        {mode === 'skip' && skipEval !== null && (
          <p className="hundred-board-message">
            Counting by {skipN}: found {skipEval.correctHits.length} of{' '}
            {skipEval.correctHits.length + skipEval.misses.length} multiples
            {skipEval.misses.length > 0 && ` — ${skipEval.misses.length} missed (dashed squares)`}
            {skipEval.wrongTaps.length > 0 && ` — ${skipEval.wrongTaps.length} marked that ${
              skipEval.wrongTaps.length === 1 ? 'is' : 'are'
            } not ${skipEval.wrongTaps.length === 1 ? 'a multiple' : 'multiples'} (✗)`}
            .
          </p>
        )}
        {mode === 'skip' && skipEval === null && (
          <p className="stage-note">Tap the squares you say aloud while counting by {skipN}, then press Check.</p>
        )}
      </div>
    </MaterialShell>
  )
}
