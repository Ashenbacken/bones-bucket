import { mergeStores, previewMerge } from './merge'
import { createEmptyStore } from './store'
import type { Collector, Store } from './types'

const c = (id: string, name: string, extra: Partial<Collector> = {}): Collector => ({
  id,
  name,
  characterId: 'hollow',
  createdAt: '',
  ...extra,
})
const store = (collectors: Collector[], bones: Store['bones']): Store => ({
  ...createEmptyStore(),
  collectors,
  bones,
})

describe('mergeStores', () => {
  it('takes the higher count per person per day and keeps local identity', () => {
    const local = store([c('a', 'Erik', { characterId: 'digger' })], { a: { d1: 3, d2: 1 } })
    const incoming = store([c('a', 'Eric', { characterId: 'captain' })], { a: { d2: 4, d3: 2 } })
    const m = mergeStores(local, incoming)
    expect(m.collectors).toEqual(local.collectors)
    expect(m.bones).toEqual({ a: { d1: 3, d2: 4, d3: 2 } })
  })

  it('matches by name when ids differ and remaps bones', () => {
    const local = store([c('a', 'Erik')], { a: { d1: 1 } })
    const incoming = store([c('zz', ' erik ')], { zz: { d1: 2, d2: 1 } })
    const m = mergeStores(local, incoming)
    expect(m.collectors.map((x) => x.id)).toEqual(['a'])
    expect(m.bones).toEqual({ a: { d1: 2, d2: 1 } })
  })

  it('treats a matching id as the same person even after a rename, and adds newcomers', () => {
    const local = store([c('a', 'Erik')], {})
    const incoming = store([c('a', 'Eric R'), c('b', 'Maja')], { a: { d1: 2 }, b: { d1: 1 } })
    const m = mergeStores(local, incoming)
    expect(m.collectors.map((x) => [x.id, x.name])).toEqual([
      ['a', 'Erik'],
      ['b', 'Maja'],
    ])
    expect(m.bones).toEqual({ a: { d1: 2 }, b: { d1: 1 } })
  })

  it('revives a locally removed collector who is active on the other phone', () => {
    const local = store([c('a', 'Erik', { removed: true })], {})
    const incoming = store([c('a', 'Erik')], { a: { d1: 1 } })
    const m = mergeStores(local, incoming)
    expect(m.collectors[0].removed).toBeUndefined()
  })

  it('keeps local settings and does not mutate inputs', () => {
    const local = store([c('a', 'Erik')], { a: { d1: 1 } })
    local.settings.sound = false
    const incoming = store([c('a', 'Erik')], { a: { d1: 5 } })
    const snap = JSON.stringify(local)
    const m = mergeStores(local, incoming)
    expect(m.settings.sound).toBe(false)
    expect(JSON.stringify(local)).toBe(snap)
  })

  it('previews what a merge adds', () => {
    const local = store([c('a', 'Erik')], { a: { d1: 3 } })
    const incoming = store([c('a', 'Erik'), c('b', 'Maja')], { a: { d1: 1, d2: 2 }, b: { d1: 4 } })
    expect(previewMerge(local, incoming)).toEqual({ newCollectors: 1, addedBones: 6 })
  })
})
