import { CHARACTERS, displayName, freeCharacters, pickCharacter, getCharacter } from './catalog'

describe('catalog', () => {
  it('has unique ids and a {name} slot in every title', () => {
    expect(new Set(CHARACTERS.map((c) => c.id)).size).toBe(CHARACTERS.length)
    for (const c of CHARACTERS) expect(c.title).toContain('{name}')
  })

  it('composes titles in prefix, suffix and epithet forms', () => {
    expect(displayName('Erik', 'digger')).toBe('Erik the Digger')
    expect(displayName('Erik', 'captain')).toBe('Captain Erik')
    expect(displayName('Erik', 'marrowbone')).toBe('Erik Marrowbone')
    expect(displayName('  Erik ', 'lord')).toBe('Lord Erik')
    expect(displayName('Erik', 'does-not-exist')).toBe('Erik')
    expect(displayName('   ', 'digger')).toBe('')
  })

  it('falls back to the unknown character', () => {
    expect(getCharacter('nope').id).toBe('unknown')
  })

  it('never picks a used character while any are free', () => {
    const used = CHARACTERS.slice(1).map((c) => c.id)
    for (let i = 0; i < 20; i++) {
      expect(pickCharacter(used, () => i / 20).id).toBe(CHARACTERS[0].id)
    }
    expect(freeCharacters(used)).toHaveLength(1)
  })

  it('allows duplicates once the pool is exhausted', () => {
    const all = CHARACTERS.map((c) => c.id)
    expect(freeCharacters(all)).toHaveLength(0)
    expect(CHARACTERS).toContain(pickCharacter(all, () => 0.5))
    expect(pickCharacter(all, () => 0.999999).id).toBe(CHARACTERS.at(-1)!.id)
  })
})
