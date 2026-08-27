import { useCallback, useMemo, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  addCollectorAtom,
  collectorsAtom,
  giveBoneAtom,
  lastTapAtom,
  settingsAtom,
  storeAtom,
  todayAtom,
  undoLastAtom,
} from '@/atoms/store'
import { countFor, rankDay } from '@/domain/bones'
import { displayName } from '@/characters/catalog'
import { buzz } from '@/lib/haptics'
import { bucketMaterial, clunk } from '@/lib/sound'
import { Avatar } from '@/components/Avatar'
import { BucketGraphic } from '@/components/BucketGraphic'
import { Crown } from '@/components/Crown'
import { CollectorForm } from '@/components/CollectorForm'
import { UndoToast } from '@/components/UndoToast'
import { Button } from '@/components/Button'
import { Panel } from '@/components/Panel'
import { CrestSigil } from '@/components/Ornaments'

export function BucketScreen() {
  const store = useAtomValue(storeAtom)
  const collectors = useAtomValue(collectorsAtom)
  const today = useAtomValue(todayAtom)
  const settings = useAtomValue(settingsAtom)
  const giveBone = useSetAtom(giveBoneAtom)
  const undo = useSetAtom(undoLastAtom)
  const addCollector = useSetAtom(addCollectorAtom)
  const lastTap = useAtomValue(lastTapAtom)
  const setLastTap = useSetAtom(lastTapAtom)
  const [adding, setAdding] = useState(false)

  const ranked = useMemo(() => rankDay(store, today), [store, today])
  const kingId = ranked[0]?.isKing ? ranked[0].collector.id : null
  const variants = useMemo(() => {
    const seen: Record<string, number> = {}
    const out: Record<string, number> = {}
    for (const c of collectors) {
      out[c.id] = seen[c.characterId] ?? 0
      seen[c.characterId] = out[c.id] + 1
    }
    return out
  }, [collectors])

  const tap = (id: string) => {
    giveBone(id)
    if (settings.haptics) buzz()
    if (settings.sound) clunk(bucketMaterial(settings.theme))
  }
  const expire = useCallback(() => setLastTap(null), [setLastTap])
  const lastCollector = lastTap && store.collectors.find((c) => c.id === lastTap.collectorId)

  return (
    <div className="flex flex-col gap-3">
      <header className="text-center">
        <CrestSigil className="mx-auto h-8 w-10" />
        <h1 className="font-display glow-red text-3xl leading-none uppercase">Bones Bucket</h1>
        <p className="mt-1 text-sm text-ivory-2">
          {collectors.length
            ? 'Tap a collector to give a bone.'
            : 'Collect the bones. Own the evidence.'}
        </p>
      </header>

      {collectors.length === 0 ? (
        <Panel className="mt-4 p-6 text-center">
          <BucketGraphic count={0} className="mx-auto h-36 w-36" />
          <p className="mt-2 text-ivory-2">No collectors yet. Somebody has to be slow first.</p>
          <Button variant="primary" onClick={() => setAdding(true)} className="mt-4">
            Add the first collector
          </Button>
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {collectors.map((c) => {
            const count = countFor(store.bones, c.id, today)
            const isKing = c.id === kingId
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => tap(c.id)}
                aria-label={`Give a bone to ${c.name}`}
                className="plaque spiked plaque-press flex min-h-56 flex-col items-center p-3 pt-4 text-center"
              >
                <span className="spike tl" />
                <span className="spike tr" />
                <span className="spike bl" />
                <span className="spike br" />
                <div className="relative z-10 flex w-full flex-col items-center">
                  <div className="relative">
                    {isKing && (
                      <Crown
                        key={kingId}
                        animate
                        className="absolute -top-3 -right-4 z-10 w-9 rotate-12"
                      />
                    )}
                    <Avatar
                      characterId={c.characterId}
                      initial={c.name}
                      variant={variants[c.id]}
                      className="h-16 w-16"
                    />
                  </div>
                  <BucketGraphic count={count} className="-mt-2 h-28 w-28" />
                  <div
                    className={`font-display -mt-2 text-4xl leading-none ${count ? 'glow-red' : 'text-ivory-3'}`}
                  >
                    {count}
                  </div>
                  <div className="engraved mt-1 w-full truncate text-sm font-bold leading-tight">
                    {displayName(c.name, c.characterId)}
                  </div>
                </div>
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="plaque spiked plaque-press flex min-h-56 flex-col items-center justify-center p-3 text-ivory-2"
          >
            <span className="spike tl" />
            <span className="spike tr" />
            <span className="spike bl" />
            <span className="spike br" />
            <span className="relative z-10 flex flex-col items-center">
              <span className="font-display glow-gold text-5xl leading-none">+</span>
              <span className="font-display mt-2 text-xs font-bold tracking-widest uppercase">
                Add collector
              </span>
            </span>
          </button>
        </div>
      )}

      {lastTap && lastCollector && (
        <div
          className="fixed inset-x-0 z-30 px-4"
          style={{ bottom: 'calc(var(--frame) + var(--sab) + 88px)' }}
        >
          <UndoToast
            stamp={lastTap.at}
            message={`Bone for ${lastCollector.name}`}
            onUndo={undo}
            onExpire={expire}
          />
        </div>
      )}

      {adding && (
        <CollectorForm
          open
          onClose={() => setAdding(false)}
          onSave={(input) => {
            addCollector(input)
            setAdding(false)
          }}
        />
      )}
    </div>
  )
}
