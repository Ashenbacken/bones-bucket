import { createSeededStore, FOUNDING_COLLECTORS } from './seed'
import { parseStore } from './store'
import { CHARACTERS } from '@/characters/catalog'

describe('seed', () => {
  it('has seven founders with unique ids and characters from the catalog', () => {
    expect(FOUNDING_COLLECTORS).toHaveLength(7)
    expect(FOUNDING_COLLECTORS.map((c) => c.name)).toEqual([
      'Erik',
      'Filip',
      'Jan',
      'Marcus',
      'Örten',
      'Hans',
      'Asken',
    ])
    expect(new Set(FOUNDING_COLLECTORS.map((c) => c.id)).size).toBe(7)
    expect(new Set(FOUNDING_COLLECTORS.map((c) => c.characterId)).size).toBe(7)
    const known = new Set(CHARACTERS.map((c) => c.id))
    for (const c of FOUNDING_COLLECTORS) expect(known.has(c.characterId)).toBe(true)
  })

  it('produces a valid store with an empty bucket', () => {
    const s = createSeededStore(new Date(2026, 7, 26))
    expect(parseStore(JSON.parse(JSON.stringify(s)))).toEqual(s)
    expect(s.bones).toEqual({})
    expect(s.collectors.every((c) => !c.removed)).toBe(true)
  })
})
