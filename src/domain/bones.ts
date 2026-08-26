import type { BoneLedger, Collector, DayKey, Store } from './types'
import { compareDays } from './days'

export function countFor(bones: BoneLedger, collectorId: string, day: DayKey): number {
  return bones[collectorId]?.[day] ?? 0
}

export function totalFor(bones: BoneLedger, collectorId: string): number {
  return Object.values(bones[collectorId] ?? {}).reduce((a, b) => a + b, 0)
}

export function addBone(bones: BoneLedger, collectorId: string, day: DayKey, n = 1): BoneLedger {
  const current = countFor(bones, collectorId, day)
  const next = Math.max(0, current + n)
  const days = { ...bones[collectorId] }
  if (next === 0) delete days[day]
  else days[day] = next
  const out = { ...bones, [collectorId]: days }
  if (Object.keys(days).length === 0) delete out[collectorId]
  return out
}

export function removeBone(bones: BoneLedger, collectorId: string, day: DayKey): BoneLedger {
  return addBone(bones, collectorId, day, -1)
}

export function clearDay(bones: BoneLedger, day: DayKey): BoneLedger {
  const out: BoneLedger = {}
  for (const [id, days] of Object.entries(bones)) {
    const rest = { ...days }
    delete rest[day]
    if (Object.keys(rest).length) out[id] = rest
  }
  return out
}

export function dayTotal(bones: BoneLedger, day: DayKey): number {
  return Object.values(bones).reduce((sum, days) => sum + (days[day] ?? 0), 0)
}

/** Every day that has at least one bone, ascending. */
export function activeDays(bones: BoneLedger): DayKey[] {
  const set = new Set<DayKey>()
  for (const days of Object.values(bones)) for (const d of Object.keys(days)) set.add(d)
  return [...set].sort(compareDays)
}

export interface Ranked {
  collector: Collector
  count: number
  /** 1-based; tied collectors share a rank. */
  rank: number
  /** True when this collector is the single top scorer with count > 0. */
  isKing: boolean
}

function rank(collectors: Collector[], score: (c: Collector) => number): Ranked[] {
  const scored = collectors
    .map((collector) => ({ collector, count: score(collector) }))
    .sort((a, b) => b.count - a.count || a.collector.name.localeCompare(b.collector.name))
  const out: Ranked[] = []
  let rankNo = 0
  scored.forEach((s, i) => {
    if (i === 0 || s.count !== scored[i - 1].count) rankNo = i + 1
    out.push({ ...s, rank: rankNo, isKing: false })
  })
  if (out.length && out[0].count > 0 && (out.length === 1 || out[1].count < out[0].count)) {
    out[0].isKing = true
  }
  return out
}

export function activeCollectors(store: Store): Collector[] {
  return store.collectors.filter((c) => !c.removed)
}

export function rankDay(store: Store, day: DayKey, collectors = activeCollectors(store)): Ranked[] {
  return rank(collectors, (c) => countFor(store.bones, c.id, day))
}

export function rankAllTime(store: Store, collectors = activeCollectors(store)): Ranked[] {
  return rank(collectors, (c) => totalFor(store.bones, c.id))
}

/**
 * The sole top scorer for a day, or null when nobody scored or the top is tied.
 * Uses all collectors (including removed) so history is stable.
 */
export function kingOfDay(store: Store, day: DayKey): Collector | null {
  const ranked = rankDay(store, day, store.collectors)
  return ranked[0]?.isKing ? ranked[0].collector : null
}

/** Number of active days a collector ended as sole king. */
export function kingDays(store: Store, collectorId: string): number {
  return activeDays(store.bones).filter((d) => kingOfDay(store, d)?.id === collectorId).length
}

/**
 * Consecutive active days (days with any bones, empty days skipped) up to and including the
 * most recent active day, on which the collector was sole king.
 */
export function streak(store: Store, collectorId: string): number {
  const days = activeDays(store.bones).reverse()
  let n = 0
  for (const d of days) {
    if (kingOfDay(store, d)?.id === collectorId) n++
    else break
  }
  return n
}
