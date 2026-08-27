import type { DayKey, Theme } from '@/domain/types'

/** `{king}` is replaced with the day's shame leader; lines without it work for any day. */
export const TAGLINES = [
  'No excuses. No creative accounting.',
  'Every bone tells a story. {king} has a novel.',
  'The fuller the bucket, the stronger the statement.',
  '{king} owns the evidence.',
  'Nobody talks their way out of the bucket.',
  'The beer was right there, {king}.',
  'Slow hands, full bucket.',
  'One very visible measure of who came out on top. Sorry, {king}.',
  'Bones don’t lie.',
  'Drink faster. The bucket is watching.',
]

/** Extra lines for the Hades theme — bones collected under Greek skies. */
export const HADES_TAGLINES = [
  'Charon takes bones, not coins.',
  'Even Sisyphus finished his drink, {king}.',
  'The Oracle foresaw this. Everyone did.',
  'Dionysus is not impressed, {king}.',
  'Abandon excuses, all ye who enter here.',
]

/** Extra lines for the Necromancer theme. */
export const NECRO_TAGLINES = [
  'The dead keep count.',
  'Your bones will outlast your excuses, {king}.',
  'Rise, drink, repeat.',
  'The ossuary is never full. Nice try, {king}.',
  'Something stirs in the bucket.',
]

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Deterministic per day so everyone looking at the phone sees the same line. */
export function taglineFor(day: DayKey, king: string | null, theme: Theme = 'crypt'): string {
  const extra = theme === 'hades' ? HADES_TAGLINES : theme === 'necro' ? NECRO_TAGLINES : []
  const all = [...TAGLINES, ...extra]
  const pool = king ? all : all.filter((t) => !t.includes('{king}'))
  const line = pool[hash(day) % pool.length]
  return king ? line.replace('{king}', king) : line
}
