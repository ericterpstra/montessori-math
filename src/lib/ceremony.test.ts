import { describe, it, expect } from 'vitest'
import { ceremonySteps, runCeremony } from './ceremony'

describe('ceremonySteps', () => {
  it('up: highlights and flies 10 out, brings 1 back', () => {
    expect(ceremonySteps('up')).toEqual([
      { kind: 'highlight', durationMs: 300, count: 10 },
      { kind: 'flyToBank', durationMs: 400, count: 10 },
      { kind: 'pause', durationMs: 150 },
      { kind: 'flyFromBank', durationMs: 400, count: 1 },
      { kind: 'commit', durationMs: 0 },
    ])
  })

  it('down mirrors up: 1 out, 10 back', () => {
    expect(ceremonySteps('down')).toEqual([
      { kind: 'highlight', durationMs: 300, count: 1 },
      { kind: 'flyToBank', durationMs: 400, count: 1 },
      { kind: 'pause', durationMs: 150 },
      { kind: 'flyFromBank', durationMs: 400, count: 10 },
      { kind: 'commit', durationMs: 0 },
    ])
  })

  it('plans exactly 1250ms in both directions', () => {
    const total = (d: 'up' | 'down') => ceremonySteps(d).reduce((s, x) => s + x.durationMs, 0)
    expect(total('up')).toBe(1250)
    expect(total('down')).toBe(1250)
  })
})

describe('runCeremony without a DOM', () => {
  it('skips straight to onCommit exactly once and resolves', async () => {
    let commits = 0
    const nil = null as unknown as HTMLElement
    await runCeremony({
      direction: 'up',
      stageEl: nil,
      sourceEls: [],
      bankEl: nil,
      destEl: nil,
      makeGhost: () => nil,
      onCommit: () => {
        commits += 1
      },
    })
    expect(commits).toBe(1)
  })
})
