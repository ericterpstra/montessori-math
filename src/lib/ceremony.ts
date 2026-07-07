import { playClink } from './sound'

export interface CeremonyStep {
  kind: 'highlight' | 'flyToBank' | 'pause' | 'flyFromBank' | 'commit'
  durationMs: number
  count?: number
}

/** The pure plan for one exchange. Up: 10 pieces out, 1 back. Down: 1 out, 10 back. */
export function ceremonySteps(direction: 'up' | 'down'): CeremonyStep[] {
  const out = direction === 'up' ? 10 : 1
  const back = direction === 'up' ? 1 : 10
  return [
    { kind: 'highlight', durationMs: 300, count: out },
    { kind: 'flyToBank', durationMs: 400, count: out },
    { kind: 'pause', durationMs: 150 },
    { kind: 'flyFromBank', durationMs: 400, count: back },
    { kind: 'commit', durationMs: 0 },
  ]
}

export interface RunCeremonyOptions {
  direction: 'up' | 'down'
  /** The positioned ancestor ghosts are appended to (`.material-stage`). */
  stageEl: HTMLElement
  /** Exactly the pieces that leave (up: the last 10 in the column; down: the last 1). */
  sourceEls: HTMLElement[]
  /** The bank tray element (flight waypoint). */
  bankEl: HTMLElement
  /** The receiving column's pieces container (flight destination). */
  destEl: HTMLElement
  /** Builds the visual for incoming piece i (0-based). Called only for flyFromBank. */
  makeGhost: (i: number) => HTMLElement
  /** Applies the model exchange. Called exactly once, always — even on skip/error. */
  onCommit: () => void
}

const GHOST_STAGGER_MS = 20

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface Point {
  x: number
  y: number
}

/** Center of `el` in stage-local coordinates (stage may scroll horizontally). */
function centerWithin(el: HTMLElement, stageEl: HTMLElement): Point {
  const r = el.getBoundingClientRect()
  const s = stageEl.getBoundingClientRect()
  return {
    x: r.left + r.width / 2 - s.left + stageEl.scrollLeft,
    y: r.top + r.height / 2 - s.top + stageEl.scrollTop,
  }
}

/** Append ghost to the stage with its center on `at`; returns it for animation. */
function placeGhost(ghost: HTMLElement, at: Point, stageEl: HTMLElement, ghosts: HTMLElement[]): HTMLElement {
  ghost.classList.add('ceremony-ghost')
  stageEl.appendChild(ghost)
  const r = ghost.getBoundingClientRect()
  ghost.style.left = `${at.x - r.width / 2}px`
  ghost.style.top = `${at.y - r.height / 2}px`
  ghosts.push(ghost)
  return ghost
}

/**
 * Straight-line flight of every ghost from its current spot to `to`, staggered.
 *
 * The wall-clock race matters: in a hidden tab Chrome finishes animations but
 * never settles their `finished` promises (they resolve on rendering frames),
 * which would hang the ceremony — and the model commit behind it — forever.
 */
async function flyAll(
  flights: Array<{ ghost: HTMLElement; from: Point }>,
  to: Point,
  durationMs: number,
): Promise<void> {
  const anims = flights.map(({ ghost, from }, i) =>
    ghost.animate(
      [
        { transform: 'translate(0px, 0px)' },
        { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px)` },
      ],
      { duration: durationMs, delay: i * GHOST_STAGGER_MS, easing: 'ease-in-out', fill: 'forwards' },
    ),
  )
  const maxMs = durationMs + Math.max(0, flights.length - 1) * GHOST_STAGGER_MS
  await Promise.race([Promise.allSettled(anims.map((a) => a.finished)), wait(maxMs + 150)])
}

function removeGhosts(ghosts: HTMLElement[]): void {
  for (const g of ghosts.splice(0)) g.remove()
}

export async function runCeremony(opts: RunCeremonyOptions): Promise<void> {
  const { direction, stageEl, sourceEls, bankEl, destEl, makeGhost, onCommit } = opts
  let committed = false
  const commit = () => {
    if (!committed) {
      committed = true
      onCommit()
    }
  }

  const skip =
    typeof window === 'undefined' ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
    !stageEl ||
    !bankEl ||
    !destEl ||
    sourceEls.length === 0 ||
    typeof stageEl.animate !== 'function'

  if (skip) {
    playClink() // reduced motion mutes motion, not material sound; sound toggle still governs it
    commit()
    return
  }

  const ghosts: HTMLElement[] = []
  try {
    const sourcePoints = sourceEls.map((el) => centerWithin(el, stageEl))
    const bankPoint = centerWithin(bankEl, stageEl)
    const destPoint = centerWithin(destEl, stageEl)

    for (const step of ceremonySteps(direction)) {
      if (step.kind === 'highlight') {
        for (const el of sourceEls) el.classList.add('ceremony-source')
        await wait(step.durationMs)
      } else if (step.kind === 'flyToBank') {
        const flights = sourceEls.map((el, i) => {
          const ghost = el.cloneNode(true) as HTMLElement
          const r = el.getBoundingClientRect()
          ghost.style.width = `${r.width}px`
          ghost.style.height = `${r.height}px`
          el.classList.remove('ceremony-source')
          el.classList.add('ceremony-hidden')
          return { ghost: placeGhost(ghost, sourcePoints[i], stageEl, ghosts), from: sourcePoints[i] }
        })
        await flyAll(flights, bankPoint, step.durationMs)
        removeGhosts(ghosts)
      } else if (step.kind === 'pause') {
        await wait(step.durationMs)
      } else if (step.kind === 'flyFromBank') {
        const flights = Array.from({ length: step.count ?? 1 }, (_, i) => ({
          ghost: placeGhost(makeGhost(i), bankPoint, stageEl, ghosts),
          from: bankPoint,
        }))
        await flyAll(flights, destPoint, step.durationMs)
        playClink()
        removeGhosts(ghosts)
      }
      // 'commit' has zero duration; the actual commit happens in `finally`.
    }
  } catch {
    /* any DOM surprise degrades to an instant exchange */
  } finally {
    removeGhosts(ghosts)
    for (const el of sourceEls) el.classList.remove('ceremony-source', 'ceremony-hidden')
    commit()
  }
}
