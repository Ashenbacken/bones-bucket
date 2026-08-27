import type { BoneLedger, Collector, Store } from './types'

const norm = (name: string) => name.trim().toLocaleLowerCase()

export interface MergePreview {
  /** Collectors that will be added because nobody local matched them. */
  newCollectors: number
  /** Bones that will be added on top of the local ledger. */
  addedBones: number
}

/**
 * Merge a handed-off bucket into the local one.
 *
 * Collectors match by id, then by name (case-insensitive); unmatched ones are added. Local
 * names/characters win for matched people. Bones take the HIGHER count per person per day: a
 * handed-off bucket shares its past with yours, so days you both tracked must not double-count,
 * while days only the other phone tracked come across in full.
 */
export function mergeStores(local: Store, incoming: Store): Store {
  const byId = new Map(local.collectors.map((c) => [c.id, c]))
  const byName = new Map(local.collectors.map((c) => [norm(c.name), c]))
  const idMap = new Map<string, string>() // incoming id -> local id
  const collectors: Collector[] = [...local.collectors]

  for (const c of incoming.collectors) {
    const match = byId.get(c.id) ?? byName.get(norm(c.name))
    if (match) {
      idMap.set(c.id, match.id)
      // someone removed locally but active on the other phone comes back
      if (match.removed && !c.removed) {
        const i = collectors.findIndex((x) => x.id === match.id)
        collectors[i] = { ...match, removed: undefined }
        delete collectors[i].removed
      }
    } else {
      let id = c.id
      while (byId.has(id) || collectors.some((x) => x.id === id)) id = `${id}-m`
      const added = { ...c, id }
      collectors.push(added)
      byId.set(id, added)
      byName.set(norm(c.name), added)
      idMap.set(c.id, id)
    }
  }

  const bones: BoneLedger = {}
  for (const [id, days] of Object.entries(local.bones)) bones[id] = { ...days }
  for (const [incomingId, days] of Object.entries(incoming.bones)) {
    const id = idMap.get(incomingId)
    if (!id) continue
    const target = (bones[id] ??= {})
    for (const [day, n] of Object.entries(days)) target[day] = Math.max(target[day] ?? 0, n)
  }

  return { ...local, collectors, bones }
}

export function previewMerge(local: Store, incoming: Store): MergePreview {
  const merged = mergeStores(local, incoming)
  const total = (b: BoneLedger) =>
    Object.values(b).reduce((s, d) => s + Object.values(d).reduce((a, n) => a + n, 0), 0)
  return {
    newCollectors: merged.collectors.length - local.collectors.length,
    addedBones: total(merged.bones) - total(local.bones),
  }
}
