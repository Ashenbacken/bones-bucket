import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import type { Collector, DayKey, Settings, Store } from '@/domain/types'
import { newId, STORAGE_KEY, tryParseStore } from '@/domain/store'
import { createSeededStore } from '@/domain/seed'
import { addBone, removeBone } from '@/domain/bones'
import { toDayKey } from '@/domain/days'
import { mergeStores } from '@/domain/merge'

const storage = createJSONStorage<Store>(() => localStorage)
const validated = {
  ...storage,
  getItem: (key: string, initial: Store): Store => {
    const raw = storage.getItem(key, initial)
    return tryParseStore(raw) ?? initial
  },
}

/** First run (nothing saved) starts with the founding collectors and an empty bucket. */
export const storeAtom = atomWithStorage<Store>(STORAGE_KEY, createSeededStore(), validated, {
  getOnInit: true,
})

/** Wall clock, ticked on an interval so the day rolls over while the app is open. */
export const nowAtom = atom<number>(Date.now())

/** Today's key, honouring the configured day boundary. */
export const todayAtom = atom<DayKey>((get) =>
  toDayKey(new Date(get(nowAtom)), get(storeAtom).settings.dayStartHour),
)

export const settingsAtom = atom(
  (get) => get(storeAtom).settings,
  (get, set, patch: Partial<Settings>) => {
    const s = get(storeAtom)
    set(storeAtom, { ...s, settings: { ...s.settings, ...patch } })
  },
)

export const themeAtom = atom((get) => get(storeAtom).settings.theme)

export const collectorsAtom = atom((get) => get(storeAtom).collectors.filter((c) => !c.removed))

export const addCollectorAtom = atom(
  null,
  (get, set, input: { name: string; characterId: string }): Collector => {
    const s = get(storeAtom)
    const collector: Collector = {
      id: newId(),
      name: input.name.trim(),
      characterId: input.characterId,
      createdAt: new Date().toISOString(),
    }
    set(storeAtom, { ...s, collectors: [...s.collectors, collector] })
    return collector
  },
)

export const updateCollectorAtom = atom(
  null,
  (get, set, id: string, patch: Partial<Pick<Collector, 'name' | 'characterId' | 'removed'>>) => {
    const s = get(storeAtom)
    set(storeAtom, {
      ...s,
      collectors: s.collectors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })
  },
)

export interface LastTap {
  collectorId: string
  day: DayKey
  at: number
}
export const lastTapAtom = atom<LastTap | null>(null)

export const giveBoneAtom = atom(null, (get, set, collectorId: string) => {
  const s = get(storeAtom)
  const day = get(todayAtom)
  set(storeAtom, { ...s, bones: addBone(s.bones, collectorId, day) })
  set(lastTapAtom, { collectorId, day, at: Date.now() })
})

export const undoLastAtom = atom(null, (get, set) => {
  const last = get(lastTapAtom)
  if (!last) return
  const s = get(storeAtom)
  set(storeAtom, { ...s, bones: removeBone(s.bones, last.collectorId, last.day) })
  set(lastTapAtom, null)
})

/** Empty the bucket: every bone ever collected is removed; collectors and settings stay. */
export const clearAllBonesAtom = atom(null, (get, set) => {
  const s = get(storeAtom)
  set(storeAtom, { ...s, bones: {} })
  set(lastTapAtom, null)
})

/** Merge a handed-off bucket into this one (see domain/merge). Device settings are kept. */
export const mergeStoreAtom = atom(null, (get, set, incoming: Store) => {
  set(storeAtom, mergeStores(get(storeAtom), incoming))
  set(lastTapAtom, null)
})

/** Replace the whole bucket (import / hand-off). Device settings are kept. */
export const replaceStoreAtom = atom(null, (get, set, incoming: Store) => {
  const s = get(storeAtom)
  set(storeAtom, { ...incoming, settings: s.settings })
  set(lastTapAtom, null)
})
