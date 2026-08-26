import { toDayKey, shiftDay, isValidDayKey, formatDay, fromDayKey, compareDays } from './days'

describe('days', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(toDayKey(new Date(2026, 7, 25, 23, 59))).toBe('2026-08-25')
    expect(toDayKey(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01')
  })

  it('round-trips through fromDayKey', () => {
    expect(toDayKey(fromDayKey('2026-02-28'))).toBe('2026-02-28')
  })

  it('shifts across month and year boundaries', () => {
    expect(shiftDay('2026-08-31', 1)).toBe('2026-09-01')
    expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31')
    expect(shiftDay('2024-02-28', 1)).toBe('2024-02-29')
  })

  it('validates keys strictly', () => {
    expect(isValidDayKey('2026-08-25')).toBe(true)
    expect(isValidDayKey('2026-13-01')).toBe(false)
    expect(isValidDayKey('2026-02-30')).toBe(false)
    expect(isValidDayKey('26-08-25')).toBe(false)
    expect(isValidDayKey('')).toBe(false)
  })

  it('compares lexically', () => {
    expect(compareDays('2026-08-25', '2026-08-26')).toBeLessThan(0)
    expect(compareDays('2026-08-25', '2026-08-25')).toBe(0)
  })

  it('names today and yesterday', () => {
    expect(formatDay('2026-08-25', '2026-08-25')).toBe('Today')
    expect(formatDay('2026-08-24', '2026-08-25')).toBe('Yesterday')
    expect(formatDay('2026-08-20', '2026-08-25')).not.toMatch(/Today|Yesterday/)
  })
})
