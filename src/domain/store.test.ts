import { parseStore, createEmptyStore, StoreParseError, summarize, tryParseStore } from './store'
import { THEMES } from './types'

describe('parseStore', () => {
  it('accepts an empty store', () => {
    expect(parseStore(createEmptyStore())).toEqual(createEmptyStore())
  })

  it('round-trips a populated store', () => {
    const s = createEmptyStore()
    s.collectors.push({ id: 'a', name: 'A', characterId: 'digger', createdAt: 'x' })
    s.bones = { a: { '2026-08-25': 2 } }
    s.settings.sound = false
    expect(parseStore(JSON.parse(JSON.stringify(s)))).toEqual(s)
  })

  it('fills defaults for missing optional fields', () => {
    const s = parseStore({ version: 1, collectors: [{ id: 'a', name: 'A' }] })
    expect(s.collectors[0].characterId).toBe('unknown')
    expect(s.settings).toEqual({
      sound: true,
      haptics: true,
      spooky: true,
      theme: 'crypt',
      dayStartHour: 0,
    })
    expect(
      parseStore({ version: 1, collectors: [], settings: { dayStartHour: 4 } }).settings
        .dayStartHour,
    ).toBe(4)
    expect(
      parseStore({ version: 1, collectors: [], settings: { dayStartHour: 30 } }).settings
        .dayStartHour,
    ).toBe(0)
    expect(
      parseStore({ version: 1, collectors: [], settings: { theme: 'hades' } }).settings.theme,
    ).toBe('hades')
    expect(
      parseStore({ version: 1, collectors: [], settings: { theme: 'nope' } }).settings.theme,
    ).toBe('crypt')
    expect(s.bones).toEqual({})
  })

  it('accepts every known theme', () => {
    for (const theme of THEMES) {
      expect(parseStore({ version: 1, collectors: [], settings: { theme } }).settings.theme).toBe(
        theme,
      )
    }
  })

  it('drops bones for unknown collectors and zero counts', () => {
    const s = parseStore({
      version: 1,
      collectors: [{ id: 'a', name: 'A' }],
      bones: { a: { '2026-08-25': 0, '2026-08-24': 1 }, ghost: { '2026-08-25': 3 } },
    })
    expect(s.bones).toEqual({ a: { '2026-08-24': 1 } })
  })

  it.each([
    [null],
    ['nope'],
    [{ version: 2, collectors: [] }],
    [{ version: 1 }],
    [{ version: 1, collectors: [{ id: 1 }] }],
    [
      {
        version: 1,
        collectors: [
          { id: 'a', name: 'A' },
          { id: 'a', name: 'B' },
        ],
      },
    ],
    [{ version: 1, collectors: [{ id: 'a', name: 'A' }], bones: { a: { 'bad-day': 1 } } }],
    [{ version: 1, collectors: [{ id: 'a', name: 'A' }], bones: { a: { '2026-08-25': -1 } } }],
    [{ version: 1, collectors: [{ id: 'a', name: 'A' }], bones: { a: { '2026-08-25': 1.5 } } }],
  ])('rejects invalid input %#', (input) => {
    expect(() => parseStore(input)).toThrow(StoreParseError)
    expect(tryParseStore(input)).toBeNull()
  })

  it('summarizes', () => {
    const s = createEmptyStore()
    s.collectors.push(
      { id: 'a', name: 'A', characterId: 'x', createdAt: '' },
      { id: 'b', name: 'B', characterId: 'x', createdAt: '', removed: true },
    )
    s.bones = { a: { '2026-08-25': 2, '2026-08-20': 1 }, b: { '2026-08-26': 1 } }
    expect(summarize(s)).toEqual({ collectors: 1, bones: 4, latest: '2026-08-26' })
  })
})
