import type { DayKey } from './types'

const pad = (n: number) => String(n).padStart(2, '0')

export function toDayKey(date: Date): DayKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayKey(now: Date = new Date()): DayKey {
  return toDayKey(now)
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function shiftDay(key: DayKey, delta: number): DayKey {
  const d = fromDayKey(key)
  d.setDate(d.getDate() + delta)
  return toDayKey(d)
}

export function isValidDayKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
  return toDayKey(fromDayKey(key)) === key
}

export function compareDays(a: DayKey, b: DayKey): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function formatDay(key: DayKey, today: DayKey = todayKey()): string {
  if (key === today) return 'Today'
  if (key === shiftDay(today, -1)) return 'Yesterday'
  const d = fromDayKey(key)
  const sameYear = d.getFullYear() === fromDayKey(today).getFullYear()
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}
