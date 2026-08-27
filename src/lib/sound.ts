import type { Theme } from '@/domain/types'

let ctx: AudioContext | null = null

function context(): AudioContext | null {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

function noiseBuffer(ac: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ac.sampleRate * seconds)
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  return buf
}

/**
 * Bone dropped into the stone sarcophagus: a hard, dry crack with a couple of stony partials that
 * die almost at once, and a faint low hum from the chamber. No ring — stone does not sing.
 */
function clack(ac: AudioContext, out: AudioNode, t: number, gain: number) {
  const partials: Array<[number, number, number]> = [
    [rand(950, 1150), 0.3, rand(0.05, 0.08)],
    [rand(1900, 2300), 0.18, rand(0.03, 0.05)],
    [rand(3300, 3900), 0.1, rand(0.02, 0.035)],
  ]
  for (const [freq, level, decay] of partials) {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    const g = ac.createGain()
    g.gain.setValueAtTime(level * gain, t)
    g.gain.exponentialRampToValueAtTime(0.0005, t + decay)
    osc.connect(g).connect(out)
    osc.start(t)
    osc.stop(t + decay + 0.02)
  }
  // the crack itself: a very short, bright burst
  const noise = ac.createBufferSource()
  noise.buffer = noiseBuffer(ac, 0.03)
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = rand(2800, 4200)
  bp.Q.value = 1.2
  const g = ac.createGain()
  g.gain.setValueAtTime(0.7 * gain, t)
  g.gain.exponentialRampToValueAtTime(0.0005, t + 0.018)
  noise.connect(bp).connect(g).connect(out)
  noise.start(t)
  // the chamber: a quiet low hum that fades quickly
  const hum = ac.createOscillator()
  hum.type = 'sine'
  hum.frequency.setValueAtTime(rand(115, 150), t)
  const hg = ac.createGain()
  hg.gain.setValueAtTime(0.14 * gain, t + 0.004)
  hg.gain.exponentialRampToValueAtTime(0.0005, t + rand(0.16, 0.22))
  hum.connect(hg).connect(out)
  hum.start(t)
  hum.stop(t + 0.25)
}

/** Fast limiter: the echo's returns land on top of the knocks at random, so clamp the peaks. */
function limiter(ac: AudioContext, out: AudioNode): AudioNode {
  const comp = ac.createDynamicsCompressor()
  comp.threshold.value = -10
  comp.knee.value = 4
  comp.ratio.value = 16
  comp.attack.value = 0.001
  comp.release.value = 0.08
  comp.connect(out)
  return comp
}

/** Short slap-back so the rattle sounds like it happens inside a stone box. */
function chamber(ac: AudioContext, out: AudioNode): AudioNode {
  const input = ac.createGain()
  const delay = ac.createDelay(0.1)
  delay.delayTime.value = 0.034
  const feedback = ac.createGain()
  feedback.gain.value = 0.32
  const damp = ac.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.value = 2600
  const wet = ac.createGain()
  wet.gain.value = 0.35
  input.connect(out)
  input.connect(delay).connect(damp).connect(feedback).connect(delay)
  damp.connect(wet).connect(out)
  return input
}

/** One dry, hollow bone knock: resonant noise burst with a little low body. */
function knock(ac: AudioContext, out: AudioNode, t: number, gain: number) {
  const noise = ac.createBufferSource()
  noise.buffer = noiseBuffer(ac, 0.04)
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = rand(1400, 3200)
  bp.Q.value = 7
  const g = ac.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0005, t + rand(0.03, 0.05))
  noise.connect(bp).connect(g).connect(out)
  noise.start(t)

  const body = ac.createOscillator()
  body.type = 'triangle'
  body.frequency.setValueAtTime(rand(260, 420), t)
  body.frequency.exponentialRampToValueAtTime(120, t + 0.04)
  const bg = ac.createGain()
  bg.gain.setValueAtTime(gain * 0.6, t)
  bg.gain.exponentialRampToValueAtTime(0.0005, t + 0.045)
  body.connect(bg).connect(out)
  body.start(t)
  body.stop(t + 0.06)
}

/** Oak bucket struck: a low hollow body note with a couple of woody partials and a soft slap. */
function thud(ac: AudioContext, out: AudioNode, t: number, gain: number) {
  const fundamental = rand(165, 205)
  const partials: Array<[number, number, number]> = [
    [fundamental, 0.45, rand(0.12, 0.17)],
    [fundamental * rand(1.9, 2.1), 0.22, rand(0.07, 0.1)],
    [fundamental * rand(3.4, 3.8), 0.1, rand(0.04, 0.06)],
  ]
  for (const [freq, level, decay] of partials) {
    const osc = ac.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq * 1.06, t)
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.03) // the staves give a little
    const g = ac.createGain()
    g.gain.setValueAtTime(level * gain, t)
    g.gain.exponentialRampToValueAtTime(0.0005, t + decay)
    osc.connect(g).connect(out)
    osc.start(t)
    osc.stop(t + decay + 0.02)
  }
  // the slap of bone on wood: a dull, low-passed burst instead of iron's bright clank
  const noise = ac.createBufferSource()
  noise.buffer = noiseBuffer(ac, 0.05)
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1100
  lp.Q.value = 0.8
  const g = ac.createGain()
  g.gain.setValueAtTime(0.4 * gain, t)
  g.gain.exponentialRampToValueAtTime(0.0005, t + 0.04)
  noise.connect(lp).connect(g).connect(out)
  noise.start(t)
}

/** What the bones land in: the oak bucket, or Necro's stone sarcophagus. */
export type Material = 'wood' | 'stone'
export const bucketMaterial = (theme: Theme): Material => (theme === 'necro' ? 'stone' : 'wood')

/** A bone lands in the bucket and rattles to rest. Synthesised, no asset. */
export function clunk(material: Material = 'wood') {
  const ac = context()
  if (!ac) return
  const t0 = ac.currentTime + 0.005
  const master = ac.createGain()
  master.gain.value = material === 'stone' ? 1.05 : 0.8
  master.connect(ac.destination)
  const out = material === 'stone' ? chamber(ac, limiter(ac, master)) : master

  if (material === 'wood') {
    knock(ac, out, t0, 0.9)
    thud(ac, out, t0 + 0.003, 1)
  } else {
    // stone is hard and the chamber echo adds back on top, so the strike itself is quieter
    knock(ac, out, t0, 0.6)
    clack(ac, out, t0 + 0.002, 0.55)
  }

  // the bone settles: a handful of quicker, quieter knocks
  let t = t0 + rand(0.07, 0.1)
  const knocks = 4 + Math.floor(Math.random() * 3)
  for (let i = 0; i < knocks; i++) {
    knock(ac, out, t, 0.7 * (1 - i / knocks) ** 1.4)
    t += rand(0.035, 0.09) * (1 + i * 0.15)
  }
}
