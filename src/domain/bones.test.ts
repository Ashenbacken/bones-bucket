import {
  addBone,
  removeBone,
  clearDay,
  countFor,
  totalFor,
  activeDays,
  rankDay,
  rankAllTime,
  kingOfDay,
  kingDays,
  streak,
  dayTotal,
} from './bones'
import type { Store, Collector } from './types'
import { createEmptyStore } from './store'

const c = (id: string, name = id): Collector => ({ id, name, characterId: 'hollow', createdAt: '' })

function store(bones: Store['bones'], collectors = [c('a'), c('b'), c('c')]): Store {
  return { ...createEmptyStore(), collectors, bones }
}

describe('ledger', () => {
  it('adds and counts bones', () => {
    let b = addBone({}, 'a', '2026-08-25')
    b = addBone(b, 'a', '2026-08-25')
    b = addBone(b, 'a', '2026-08-24')
    expect(countFor(b, 'a', '2026-08-25')).toBe(2)
    expect(totalFor(b, 'a')).toBe(3)
    expect(countFor(b, 'zzz', '2026-08-25')).toBe(0)
  })

  it('removes bones and prunes empty entries', () => {
    let b = addBone({}, 'a', '2026-08-25')
    b = removeBone(b, 'a', '2026-08-25')
    expect(b).toEqual({})
    expect(removeBone({}, 'a', '2026-08-25')).toEqual({})
  })

  it('does not mutate input', () => {
    const b = addBone({}, 'a', '2026-08-25')
    const snapshot = JSON.stringify(b)
    addBone(b, 'a', '2026-08-25')
    addBone(b, 'b', '2026-08-25')
    expect(JSON.stringify(b)).toBe(snapshot)
  })

  it('clears a day for everyone', () => {
    let b = addBone({}, 'a', '2026-08-25')
    b = addBone(b, 'b', '2026-08-25')
    b = addBone(b, 'b', '2026-08-24')
    expect(clearDay(b, '2026-08-25')).toEqual({ b: { '2026-08-24': 1 } })
  })

  it('lists active days sorted and totals a day', () => {
    const b = { a: { '2026-08-25': 1, '2026-08-20': 2 }, b: { '2026-08-22': 1, '2026-08-25': 3 } }
    expect(activeDays(b)).toEqual(['2026-08-20', '2026-08-22', '2026-08-25'])
    expect(dayTotal(b, '2026-08-25')).toBe(4)
  })
})

describe('ranking', () => {
  it('ranks by count desc with shared ranks on ties, name as tiebreaker for order', () => {
    const s = store({ a: { d: 2 }, b: { d: 5 }, c: { d: 2 } })
    const r = rankDay(s, 'd')
    expect(r.map((x) => [x.collector.id, x.count, x.rank])).toEqual([
      ['b', 5, 1],
      ['a', 2, 2],
      ['c', 2, 2],
    ])
    expect(r[0].isKing).toBe(true)
  })

  it('has no king on a tie or an empty day', () => {
    expect(rankDay(store({ a: { d: 2 }, b: { d: 2 } }), 'd')[0].isKing).toBe(false)
    expect(rankDay(store({}), 'd')[0].isKing).toBe(false)
    expect(kingOfDay(store({}), 'd')).toBeNull()
  })

  it('hides removed collectors from the ranking but keeps history stable', () => {
    const removed = { ...c('b'), removed: true }
    const s = store({ b: { d: 9 }, a: { d: 1 } }, [c('a'), removed])
    expect(rankDay(s, 'd').map((x) => x.collector.id)).toEqual(['a'])
    expect(kingOfDay(s, 'd')?.id).toBe('b')
  })

  it('ranks all-time totals', () => {
    const s = store({ a: { d1: 1, d2: 1 }, b: { d1: 3 } })
    expect(rankAllTime(s).map((x) => [x.collector.id, x.count])).toEqual([
      ['b', 3],
      ['a', 2],
      ['c', 0],
    ])
  })
})

describe('kings and streaks', () => {
  const s = store({
    a: { '2026-08-20': 3, '2026-08-22': 1, '2026-08-24': 2, '2026-08-25': 4 },
    b: { '2026-08-20': 1, '2026-08-21': 2, '2026-08-22': 1, '2026-08-24': 1, '2026-08-25': 1 },
  })

  it('counts days as sole king', () => {
    expect(kingDays(s, 'a')).toBe(3) // 20, 24, 25 (22 is a tie)
    expect(kingDays(s, 'b')).toBe(1) // 21
  })

  it('streak counts consecutive active days as king, skipping empty days', () => {
    expect(streak(s, 'a')).toBe(2) // 25, 24 — then 22 was a tie
    expect(streak(s, 'b')).toBe(0)
    expect(streak(store({}), 'a')).toBe(0)
  })
})
