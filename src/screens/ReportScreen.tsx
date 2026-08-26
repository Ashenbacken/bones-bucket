import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { storeAtom, themeAtom, todayAtom } from '@/atoms/store'
import {
  activeDays,
  kingDays,
  kingOfDay,
  rankAllTime,
  rankDay,
  streak,
  dayTotal,
} from '@/domain/bones'
import { compareDays, formatDay, shiftDay } from '@/domain/days'
import { displayName } from '@/characters/catalog'
import { taglineFor } from '@/lib/taglines'
import { Avatar } from '@/components/Avatar'
import { Crown } from '@/components/Crown'
import { CrestSigil } from '@/components/Ornaments'

type Mode = 'day' | 'all'

export function ReportScreen() {
  const store = useAtomValue(storeAtom)
  const today = useAtomValue(todayAtom)
  const theme = useAtomValue(themeAtom)
  const [mode, setMode] = useState<Mode>('day')
  const [day, setDay] = useState(today)

  const days = useMemo(() => activeDays(store.bones), [store])
  const earliest = days[0] ?? today
  const ranked = useMemo(
    () => (mode === 'day' ? rankDay(store, day) : rankAllTime(store)),
    [store, day, mode],
  )
  const king =
    mode === 'day' ? kingOfDay(store, day) : ranked[0]?.isKing ? ranked[0].collector : null
  const kingTitle = king ? displayName(king.name, king.characterId) : null
  const tagline = taglineFor(mode === 'day' ? day : 'all-time', kingTitle, theme)
  const yesterdayKing =
    mode === 'day' && day === today ? kingOfDay(store, shiftDay(today, -1)) : null
  const total =
    mode === 'day' ? dayTotal(store.bones, day) : ranked.reduce((a, r) => a + r.count, 0)
  const max = ranked[0]?.count ?? 0

  return (
    <div className="flex flex-col gap-3">
      <header className="text-center">
        <CrestSigil className="mx-auto h-8 w-10" />
        <h1 className="font-display glow-red text-3xl leading-none uppercase">The Report</h1>
      </header>

      <div className="etched etched-quiet flex p-1.5">
        {(['day', 'all'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`font-display relative z-10 min-h-11 flex-1 rounded-sm text-xs font-bold tracking-widest uppercase ${
              mode === m ? 'glow-red bg-black/40' : 'text-ivory-2'
            }`}
          >
            {m === 'day' ? 'By day' : 'All time'}
          </button>
        ))}
      </div>

      {mode === 'day' && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous day"
            disabled={compareDays(day, earliest) <= 0}
            onClick={() => setDay(shiftDay(day, -1))}
            className="etched etched-quiet plaque-press h-12 w-12 text-xl text-ivory disabled:opacity-30"
          >
            <span className="relative z-10">‹</span>
          </button>
          <div className="text-center">
            <div className="font-display engraved text-lg uppercase">{formatDay(day, today)}</div>
            <div className="text-xs text-ivory-3">
              {total} bone{total === 1 ? '' : 's'}
            </div>
          </div>
          <button
            type="button"
            aria-label="Next day"
            disabled={day === today}
            onClick={() => setDay(shiftDay(day, 1))}
            className="etched etched-quiet plaque-press h-12 w-12 text-xl text-ivory disabled:opacity-30"
          >
            <span className="relative z-10">›</span>
          </button>
        </div>
      )}

      <p className="etched px-3 py-2 text-center text-sm font-semibold italic text-ivory">
        {tagline}
      </p>

      {ranked.length === 0 && (
        <p className="mt-6 text-center text-ivory-2">No collectors yet. Add some in the Bucket.</p>
      )}
      {ranked.length > 0 && total === 0 && (
        <p className="mt-2 text-center text-sm text-ivory-3">Clean bucket. Suspicious.</p>
      )}

      <ol className="flex flex-col gap-1">
        {ranked.map((r) => {
          const isKing = king?.id === r.collector.id
          return (
            <li
              key={r.collector.id}
              className={`plaque flex items-center gap-3 p-2 pr-4 ${isKing ? 'z-10' : ''}`}
            >
              <div className="relative z-10 flex w-full items-center gap-3">
                <span className="font-display w-6 text-center text-lg text-ivory-3">{r.rank}</span>
                <div className="relative shrink-0">
                  {isKing && <Crown className="absolute -top-2 -right-3 z-10 w-7 rotate-12" />}
                  <Avatar
                    characterId={r.collector.characterId}
                    initial={r.collector.name}
                    className="h-12 w-12"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="engraved truncate font-bold leading-tight">
                    {displayName(r.collector.name, r.collector.characterId)}
                  </div>
                  <div className="gauge mt-1.5" aria-hidden>
                    <i style={{ ['--p' as string]: max ? r.count / max : 0 }} />
                  </div>
                  {mode === 'all' && (
                    <div className="mt-1 text-xs text-ivory-3">
                      Bone King {kingDays(store, r.collector.id)}×
                      {streak(store, r.collector.id) > 1 &&
                        ` · ${streak(store, r.collector.id)}-night streak`}
                    </div>
                  )}
                </div>
                <div className={`font-display text-3xl ${r.count ? 'glow-red' : 'text-ivory-3'}`}>
                  {r.count}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {yesterdayKing && (
        <p className="text-center text-xs text-ivory-3">
          Reigning from yesterday: {displayName(yesterdayKing.name, yesterdayKing.characterId)}
        </p>
      )}
    </div>
  )
}
