import { createStore } from 'jotai'
import { clearAllBonesAtom, clearTodayAtom, nowAtom, storeAtom, todayAtom } from './store'
import { createSeededStore } from '@/domain/seed'
import { shiftDay } from '@/domain/days'
import type { Store } from '@/domain/types'

function bucket(): { jotai: ReturnType<typeof createStore>; today: string; yesterday: string } {
  localStorage.clear()
  const jotai = createStore()
  jotai.set(nowAtom, Date.now())
  const today = jotai.get(todayAtom)
  const yesterday = shiftDay(today, -1)
  const s: Store = {
    ...createSeededStore(),
    bones: { c1: { [today]: 2, [yesterday]: 3 }, c2: { [yesterday]: 1 } },
  }
  jotai.set(storeAtom, s)
  return { jotai, today, yesterday }
}

describe('emptying the bucket', () => {
  it('tonight only drops today and keeps earlier days', () => {
    const { jotai, yesterday } = bucket()
    jotai.set(clearTodayAtom)
    expect(jotai.get(storeAtom).bones).toEqual({ c1: { [yesterday]: 3 }, c2: { [yesterday]: 1 } })
    expect(jotai.get(storeAtom).collectors).toHaveLength(7)
  })

  it('all history drops every day', () => {
    const { jotai } = bucket()
    jotai.set(clearAllBonesAtom)
    expect(jotai.get(storeAtom).bones).toEqual({})
    expect(jotai.get(storeAtom).collectors).toHaveLength(7)
  })
})
