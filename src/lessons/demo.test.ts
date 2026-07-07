import { describe, it, expect } from 'vitest'
import {
  GOLDEN_DEMO_INITIAL,
  STAMP_DEMO_INITIAL,
  applyGoldenDemoActions,
  applyStampDemoActions,
  goldenBeadsDemos,
  planReplay,
  stampGameDemos,
} from './demo'
import { totalValue } from '../lib/placeValue'
import { allOk, regionValue } from '../materials/stamp-game/model'

describe('planReplay', () => {
  it('applies every step from the start on first activation', () => {
    expect(planReplay(-1, 3)).toEqual({ reset: false, apply: [0, 1, 2, 3] })
  })
  it('applies only the new steps when moving forward', () => {
    expect(planReplay(3, 5)).toEqual({ reset: false, apply: [4, 5] })
  })
  it('resets and replays from step 0 when moving backward', () => {
    expect(planReplay(5, 2)).toEqual({ reset: true, apply: [0, 1, 2] })
  })
  it('does nothing when the step is unchanged', () => {
    expect(planReplay(2, 2)).toEqual({ reset: false, apply: [] })
  })
})

describe('golden beads presentation-mode demo actions', () => {
  it('build replaces the mat with the layout of the number', () => {
    const v = applyGoldenDemoActions(GOLDEN_DEMO_INITIAL, [{ do: 'build', payload: 1234 }])
    expect(v.mat).toEqual({ 3: 1, 2: 2, 1: 3, 0: 4 })
  })

  it('add merges a second quantity without exchanging', () => {
    const v = applyGoldenDemoActions(GOLDEN_DEMO_INITIAL, [
      { do: 'build', payload: 1568 },
      { do: 'add', payload: 1679 },
    ])
    expect(v.mat).toEqual({ 3: 2, 2: 11, 1: 13, 0: 17 })
  })

  it('exchangeUp trades ten for one, and an illegal trade is ignored', () => {
    const start = applyGoldenDemoActions(GOLDEN_DEMO_INITIAL, [
      { do: 'build', payload: 1568 },
      { do: 'add', payload: 1679 },
    ])
    const traded = applyGoldenDemoActions(start, [{ do: 'exchangeUp', payload: 0 }])
    expect(traded.mat).toEqual({ 3: 2, 2: 11, 1: 14, 0: 7 })
    expect(applyGoldenDemoActions(traded, [{ do: 'exchangeUp', payload: 0 }]).mat).toEqual(traded.mat) // only 7 units
  })

  it('check marks the mat against the target', () => {
    const v = applyGoldenDemoActions(GOLDEN_DEMO_INITIAL, [
      { do: 'build', payload: 3579 },
      { do: 'check', payload: 3579 },
    ])
    expect(v.check?.allOk).toBe(true)
    const bad = applyGoldenDemoActions(GOLDEN_DEMO_INITIAL, [
      { do: 'build', payload: 3578 },
      { do: 'check', payload: 3579 },
    ])
    expect(bad.check?.allOk).toBe(false)
    expect(bad.check?.places.find((p) => p.power === 0)?.ok).toBe(false)
  })

  it('replays the full golden-beads-addition script to 3,247 with every place ✓', () => {
    let v = GOLDEN_DEMO_INITIAL
    for (const actions of goldenBeadsDemos['golden-beads-addition']) v = applyGoldenDemoActions(v, actions)
    expect(v.mat).toEqual({ 3: 3, 2: 2, 1: 4, 0: 7 })
    expect(totalValue(v.mat)).toBe(3247)
    expect(v.check?.allOk).toBe(true)
  })

  it('is deterministic: two replays of the script give identical views', () => {
    const run = () =>
      goldenBeadsDemos['golden-beads-addition'].reduce((v, a) => applyGoldenDemoActions(v, a), GOLDEN_DEMO_INITIAL)
    expect(run()).toEqual(run())
  })
})

describe('stamp game presentation-mode demo actions', () => {
  it('the static half of the script reads 3,468 with every column ✓', () => {
    let v = STAMP_DEMO_INITIAL
    for (const actions of stampGameDemos['stamp-game-addition'].slice(0, 5)) v = applyStampDemoActions(v, actions)
    expect(v.mat).toEqual({ 3: 3, 2: 4, 1: 6, 0: 8 })
    expect(v.checks !== null && allOk(v.checks)).toBe(true)
  })

  it('the full script ends at 3,247 after three trades, every column ✓', () => {
    let v = STAMP_DEMO_INITIAL
    for (const actions of stampGameDemos['stamp-game-addition']) v = applyStampDemoActions(v, actions)
    expect(v.mat).toEqual({ 3: 3, 2: 2, 1: 4, 0: 7 })
    expect(regionValue(v.mat)).toBe(3247)
    expect(v.checks !== null && allOk(v.checks)).toBe(true)
  })

  it('a refused exchange leaves the view unchanged', () => {
    const v = applyStampDemoActions(STAMP_DEMO_INITIAL, [{ do: 'build', payload: 1325 }])
    expect(applyStampDemoActions(v, [{ do: 'exchangeUp', payload: 0 }])).toEqual(v) // only 5 units
  })

  it('reset returns to the initial free-mode view', () => {
    const v = applyStampDemoActions(STAMP_DEMO_INITIAL, [{ do: 'build', payload: 1325 }, { do: 'reset' }])
    expect(v).toEqual(STAMP_DEMO_INITIAL)
  })

  it('is deterministic: two replays of the script give identical views', () => {
    const run = () =>
      stampGameDemos['stamp-game-addition'].reduce((v, a) => applyStampDemoActions(v, a), STAMP_DEMO_INITIAL)
    expect(run()).toEqual(run())
  })
})
