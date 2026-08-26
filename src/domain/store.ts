import type { Collector, Settings, Store } from './types'
import { isValidDayKey } from './days'

export const STORAGE_KEY = 'bones-bucket:v1'

export const defaultSettings: Settings = {
  sound: true,
  haptics: true,
  spooky: true,
  theme: 'crypt',
}

export function createEmptyStore(): Store {
  return { version: 1, collectors: [], bones: {}, settings: { ...defaultSettings } }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    return crypto.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

export class StoreParseError extends Error {}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

/** Validate untrusted JSON (localStorage, import file, hand-off link) into a Store. */
export function parseStore(input: unknown): Store {
  if (!isObj(input)) throw new StoreParseError('Not an object')
  if (input.version !== 1) throw new StoreParseError(`Unsupported version ${String(input.version)}`)
  if (!Array.isArray(input.collectors)) throw new StoreParseError('Missing collectors')

  const collectors: Collector[] = input.collectors.map((c: unknown, i: number) => {
    if (!isObj(c) || typeof c.id !== 'string' || typeof c.name !== 'string')
      throw new StoreParseError(`Bad collector at ${i}`)
    return {
      id: c.id,
      name: c.name,
      characterId: typeof c.characterId === 'string' ? c.characterId : 'unknown',
      createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date(0).toISOString(),
      ...(c.removed ? { removed: true } : {}),
    }
  })
  const ids = new Set(collectors.map((c) => c.id))
  if (ids.size !== collectors.length) throw new StoreParseError('Duplicate collector ids')

  const bones: Store['bones'] = {}
  if (input.bones !== undefined) {
    if (!isObj(input.bones)) throw new StoreParseError('Bad bones')
    for (const [id, days] of Object.entries(input.bones)) {
      if (!ids.has(id)) continue // orphaned bones are dropped
      if (!isObj(days)) throw new StoreParseError(`Bad ledger for ${id}`)
      const clean: Record<string, number> = {}
      for (const [day, n] of Object.entries(days)) {
        if (!isValidDayKey(day)) throw new StoreParseError(`Bad day ${day}`)
        if (typeof n !== 'number' || !Number.isInteger(n) || n < 0)
          throw new StoreParseError(`Bad count for ${day}`)
        if (n > 0) clean[day] = n
      }
      if (Object.keys(clean).length) bones[id] = clean
    }
  }

  const s = isObj(input.settings) ? input.settings : {}
  const settings: Settings = {
    sound: typeof s.sound === 'boolean' ? s.sound : defaultSettings.sound,
    haptics: typeof s.haptics === 'boolean' ? s.haptics : defaultSettings.haptics,
    spooky: typeof s.spooky === 'boolean' ? s.spooky : defaultSettings.spooky,
    theme: s.theme === 'hades' || s.theme === 'necro' ? s.theme : 'crypt',
  }

  return { version: 1, collectors, bones, settings }
}

export function tryParseStore(input: unknown): Store | null {
  try {
    return parseStore(input)
  } catch {
    return null
  }
}

/** Summary used by import previews. */
export function summarize(store: Store) {
  const collectors = store.collectors.filter((c) => !c.removed).length
  let bones = 0
  let latest: string | null = null
  for (const days of Object.values(store.bones)) {
    for (const [d, n] of Object.entries(days)) {
      bones += n
      if (!latest || d > latest) latest = d
    }
  }
  return { collectors, bones, latest }
}
