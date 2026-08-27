import { STORAGE_KEY } from '@/domain/store'
import { shiftDay, todayKey } from '@/domain/days'
import type { Store } from '@/domain/types'
import { createSeededStore } from '@/domain/seed'

/** Seeds a sample bucket when built with VITE_DEMO=1 and the phone has no data yet. */
export function seedDemo() {
  if (localStorage.getItem(STORAGE_KEY)) return
  const t = todayKey()
  const d = (n: number) => shiftDay(t, -n)
  const store: Store = {
    version: 1,
    collectors: createSeededStore().collectors,
    bones: {
      c1: { [t]: 3, [d(1)]: 2, [d(3)]: 4 },
      c2: { [t]: 1, [d(1)]: 5, [d(2)]: 1 },
      c3: { [t]: 6, [d(2)]: 2, [d(3)]: 1 },
      c4: { [d(1)]: 1, [d(3)]: 2 },
      c5: { [t]: 2, [d(2)]: 3 },
      c6: { [t]: 15, [d(1)]: 1, [d(2)]: 4, [d(3)]: 2 },
      c7: { [t]: 1, [d(3)]: 1 },
    },
    settings: {
      sound: true,
      haptics: true,
      spooky: true,
      dayStartHour: 0,
      theme:
        (['hades', 'necro', 'gilded'] as const).find(
          (t) => t === new URLSearchParams(location.search).get('theme'),
        ) ?? 'crypt',
    },
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}
