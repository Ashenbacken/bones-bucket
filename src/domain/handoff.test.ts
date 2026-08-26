import { encodeHandoff, decodeHandoff, buildHandoffUrl, readHandoffFromHash } from './handoff'
import { createEmptyStore, StoreParseError } from './store'
import type { Store } from './types'

function sample(): Store {
  const s = createEmptyStore()
  s.collectors.push(
    { id: 'a1', name: 'A', characterId: 'digger', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'b2', name: 'B', characterId: 'captain', createdAt: '2026-01-01T00:00:00.000Z' },
  )
  for (let i = 1; i <= 28; i++) {
    const d = `2026-02-${String(i).padStart(2, '0')}`
    s.bones.a1 = { ...s.bones.a1, [d]: (i % 4) + 1 }
    s.bones.b2 = { ...s.bones.b2, [d]: (i % 3) + 1 }
  }
  s.settings.sound = false
  return s
}

describe('handoff codec', () => {
  it('round-trips collectors and bones, but not device settings', async () => {
    const s = sample()
    const payload = await encodeHandoff(s)
    expect(payload[0]).toBe('d')
    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/)
    const back = await decodeHandoff(payload)
    expect(back.collectors).toEqual(s.collectors)
    expect(back.bones).toEqual(s.bones)
    expect(back.settings).toEqual(createEmptyStore().settings)
  })

  it('falls back to raw encoding without CompressionStream', async () => {
    const CS = globalThis.CompressionStream
    // @ts-expect-error simulate old browser
    globalThis.CompressionStream = undefined
    try {
      const payload = await encodeHandoff(sample())
      expect(payload[0]).toBe('r')
      expect((await decodeHandoff(payload)).bones).toEqual(sample().bones)
    } finally {
      globalThis.CompressionStream = CS
    }
  })

  it('keeps a month of bones for two people well under a QR-friendly size', async () => {
    const payload = await encodeHandoff(sample())
    expect(payload.length).toBeLessThan(600)
  })

  it('rejects garbage', async () => {
    await expect(decodeHandoff('x123')).rejects.toThrow(StoreParseError)
    await expect(decodeHandoff('r' + btoa('{"nope":1}'))).rejects.toThrow(StoreParseError)
    await expect(decodeHandoff('r' + btoa('not json'))).rejects.toThrow(StoreParseError)
  })

  it('builds and reads hash urls', () => {
    const url = buildHandoffUrl('dABC_-1', 'https://x.test/bones/?q=1#old')
    expect(url).toBe('https://x.test/bones/?q=1#h=dABC_-1')
    expect(readHandoffFromHash('#h=dABC_-1')).toBe('dABC_-1')
    expect(readHandoffFromHash('h=dABC_-1')).toBe('dABC_-1')
    expect(readHandoffFromHash('#other')).toBeNull()
    expect(readHandoffFromHash('#h=bad$chars')).toBeNull()
    expect(readHandoffFromHash('')).toBeNull()
  })
})
