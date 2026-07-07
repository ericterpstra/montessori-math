/**
 * Material sounds — Web Audio API synthesis only. No audio files.
 * The mute preference is deliberately session-only (no persistence).
 */
let enabled = true
let ctx: AudioContext | null = null

export function setSoundEnabled(v: boolean): void {
  enabled = v
}

export function soundEnabled(): boolean {
  return enabled
}

/** Lazy: created on the first play call (always click-driven → autoplay-safe). */
function getContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** One oscillator burst with exponential gain decay. */
function burst(c: AudioContext, freq: number, at: number, peak: number, durS: number, type: OscillatorType): void {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(peak, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + durS)
  osc.connect(gain).connect(c.destination)
  osc.start(at)
  osc.stop(at + durS)
}

/** Glass-bead clink: two high triangle bursts, second 25 ms later, ±3% detune. */
export function playClink(): void {
  if (!enabled) return
  try {
    const c = getContext()
    if (!c) return
    const t = c.currentTime
    const detune = () => 1 + (Math.random() * 0.06 - 0.03)
    burst(c, 2400 * detune(), t, 0.12, 0.08, 'triangle')
    burst(c, 3150 * detune(), t + 0.025, 0.12, 0.08, 'triangle')
  } catch {
    /* sound is never worth crashing over */
  }
}

/** Wood tap: low triangle thump plus a 50 ms bandpass-filtered noise burst. */
export function playTap(): void {
  if (!enabled) return
  try {
    const c = getContext()
    if (!c) return
    const t = c.currentTime
    burst(c, 220, t, 0.18, 0.04, 'triangle')
    const frames = Math.ceil(c.sampleRate * 0.05)
    const buf = c.createBuffer(1, frames, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1
    const src = c.createBufferSource()
    src.buffer = buf
    const filter = c.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 1
    const g = c.createGain()
    g.gain.setValueAtTime(0.1, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    src.connect(filter).connect(g).connect(c.destination)
    src.start(t)
    src.stop(t + 0.05)
  } catch {
    /* no-op */
  }
}

/** Wire slide: one very short quiet sine — 1200 Hz, 25 ms, gain 0.06. */
export function playSlide(): void {
  if (!enabled) return
  try {
    const c = getContext()
    if (!c) return
    burst(c, 1200, c.currentTime, 0.06, 0.025, 'sine')
  } catch {
    /* no-op */
  }
}
