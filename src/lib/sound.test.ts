import { describe, expect, it } from 'vitest'
import { THEMES } from '@/domain/types'
import { bucketMaterial, clunk } from './sound'

describe('bucketMaterial', () => {
  it('uses stone only for the Necro sarcophagus; every bucket theme is wood', () => {
    expect(bucketMaterial('necro')).toBe('stone')
    for (const theme of THEMES.filter((t) => t !== 'necro'))
      expect(bucketMaterial(theme)).toBe('wood')
  })

  it('clunk is a no-op without Web Audio', () => {
    expect(() => clunk('wood')).not.toThrow()
    expect(() => clunk('stone')).not.toThrow()
  })
})
