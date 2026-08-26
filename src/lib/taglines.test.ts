import { taglineFor, TAGLINES } from './taglines'

describe('taglines', () => {
  it('is deterministic per day', () => {
    expect(taglineFor('2026-08-25', 'X')).toBe(taglineFor('2026-08-25', 'X'))
  })
  it('never leaves a {king} placeholder when there is no king', () => {
    for (let d = 1; d <= 31; d++) {
      expect(taglineFor(`2026-08-${String(d).padStart(2, '0')}`, null)).not.toContain('{king}')
    }
  })
  it('adds Greek lines in Hades and still never leaks the placeholder', () => {
    const seen = new Set<string>()
    for (let d = 1; d <= 31; d++) {
      const line = taglineFor(`2026-09-${String(d).padStart(2, '0')}`, null, 'hades')
      expect(line).not.toContain('{king}')
      seen.add(line)
    }
    expect(
      [...seen].some((l) => l.includes('Charon') || l.includes('Oracle') || l.includes('Abandon')),
    ).toBe(true)
  })

  it('substitutes the king', () => {
    const withKing = TAGLINES.filter((t) => t.includes('{king}'))
    expect(withKing.length).toBeGreaterThan(0)
    let seen = false
    for (let d = 1; d <= 31; d++) {
      const line = taglineFor(`2026-07-${String(d).padStart(2, '0')}`, 'Erik the Digger')
      expect(line).not.toContain('{king}')
      if (line.includes('Erik the Digger')) seen = true
    }
    expect(seen).toBe(true)
  })
})
