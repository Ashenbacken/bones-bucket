import type { Collector, Store } from './types'
import { createEmptyStore } from './store'

/** The founding collectors. Present on a fresh install; more can always be added. */
export const FOUNDING_COLLECTORS: ReadonlyArray<Pick<Collector, 'id' | 'name' | 'characterId'>> = [
  { id: 'c1', name: 'Erik', characterId: 'digger' },
  { id: 'c2', name: 'Filip', characterId: 'captain' },
  { id: 'c4', name: 'Jan', characterId: 'raven' },
  { id: 'c7', name: 'Marcus', characterId: 'howler' },
  { id: 'c6', name: 'Örten', characterId: 'inspector' },
  { id: 'c3', name: 'Hans', characterId: 'lord' },
  { id: 'c5', name: 'Asken', characterId: 'marrowbone' },
]

/** Store used when the phone has no saved data yet: the founders, an empty bucket. */
export function createSeededStore(now: Date = new Date()): Store {
  const createdAt = now.toISOString()
  return {
    ...createEmptyStore(),
    collectors: FOUNDING_COLLECTORS.map((c) => ({ ...c, createdAt })),
  }
}
