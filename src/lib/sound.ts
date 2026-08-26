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

/** Iron bucket struck: a few detuned metallic partials plus a short clank of noise. */
function clang(ac: AudioContext, out: AudioNode, t: number, gain: number) {
  const partials: Array<[number, number]> = [
    [rand(560, 640), 0.32],
    [rand(1080, 1180), 0.22],
    [rand(1750, 1900), 0.14],
    [rand(2900, 3200), 0.08],
  ]
  for (const [freq, level] of partials) {
    const osc = ac.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    const g = ac.createGain()
    g.gain.setValueAtTime(level * gain, t)
    g.gain.exponentialRampToValueAtTime(0.0005, t + rand(0.22, 0.34))
    osc.connect(g).connect(out)
    osc.start(t)
    osc.stop(t + 0.4)
  }
  const noise = ac.createBufferSource()
  noise.buffer = noiseBuffer(ac, 0.06)
  const hp = ac.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2500
  const g = ac.createGain()
  g.gain.setValueAtTime(0.35 * gain, t)
  g.gain.exponentialRampToValueAtTime(0.0005, t + 0.05)
  noise.connect(hp).connect(g).connect(out)
  noise.start(t)
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

/** A bone lands in the iron bucket and rattles to rest. Synthesised, no asset. */
export function clunk() {
  const ac = context()
  if (!ac) return
  const t0 = ac.currentTime + 0.005
  const out = ac.createGain()
  out.gain.value = 0.8
  out.connect(ac.destination)

  knock(ac, out, t0, 0.9)
  clang(ac, out, t0 + 0.004, 1)

  // the bone settles: a handful of quicker, quieter knocks
  let t = t0 + rand(0.07, 0.1)
  const knocks = 4 + Math.floor(Math.random() * 3)
  for (let i = 0; i < knocks; i++) {
    knock(ac, out, t, 0.7 * (1 - i / knocks) ** 1.4)
    t += rand(0.035, 0.09) * (1 + i * 0.15)
  }
}
