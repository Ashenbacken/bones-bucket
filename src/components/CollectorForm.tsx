import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import type { Collector } from '@/domain/types'
import { CHARACTERS, displayName, freeCharacters, pickCharacter } from '@/characters/catalog'
import { collectorsAtom } from '@/atoms/store'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Dialog } from './Dialog'

interface Props {
  open: boolean
  onClose: () => void
  /** When set, the form edits this collector instead of creating one. */
  collector?: Collector
  onSave: (input: { name: string; characterId: string }) => void
  onRemove?: () => void
}

export function CollectorForm({ open, onClose, collector, onSave, onRemove }: Props) {
  const collectors = useAtomValue(collectorsAtom)
  const usedIds = useMemo(
    () => collectors.filter((c) => c.id !== collector?.id).map((c) => c.characterId),
    [collectors, collector],
  )
  const [name, setName] = useState(collector?.name ?? '')
  const [characterId, setCharacterId] = useState(
    () => collector?.characterId ?? pickCharacter(usedIds).id,
  )
  const [choosing, setChoosing] = useState(false)

  const preview = displayName(name || 'Someone', characterId)
  const canSave = name.trim().length > 0

  const reroll = () => {
    const pool = freeCharacters([...usedIds, characterId])
    const next = pool.length ? pickCharacter([...usedIds, characterId]) : pickCharacter(usedIds)
    setCharacterId(next.id)
  }

  const options = CHARACTERS.map((c) => ({ c, taken: usedIds.includes(c.id) })).sort(
    (a, b) => Number(a.taken) - Number(b.taken),
  )

  return (
    <Dialog open={open} onClose={onClose} title={collector ? 'Edit collector' : 'New collector'}>
      <label className="block">
        <span className="font-display glow-gold text-xs font-bold tracking-widest uppercase">
          Name
        </span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSave && onSave({ name, characterId })}
          maxLength={24}
          placeholder="First name"
          enterKeyHint="done"
          className="etched etched-quiet engraved mt-1 w-full px-3 py-3 text-lg font-semibold outline-none placeholder:text-ivory-3"
        />
      </label>

      <div className="etched etched-quiet mt-4 flex items-center gap-3 p-3">
        <Avatar characterId={characterId} initial={name} className="h-20 w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[10px] font-bold tracking-widest text-ivory-3 uppercase">
            Will be known as
          </div>
          <div className="engraved truncate text-lg font-bold leading-tight">{preview}</div>
        </div>
        <button
          type="button"
          onClick={reroll}
          aria-label="Pick another character"
          className="etched plaque-press flex h-12 w-12 shrink-0 items-center justify-center text-2xl"
        >
          <span className="relative z-10">🎲</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setChoosing((v) => !v)}
        className="mt-2 w-full py-2 text-sm font-semibold text-ivory-2 underline-offset-4 hover:underline"
      >
        {choosing ? 'Hide characters' : 'Choose a character instead'}
      </button>

      {choosing && (
        <div className="etched etched-quiet grid max-h-64 grid-cols-2 gap-2 overflow-y-auto p-2">
          {options.map(({ c, taken }) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCharacterId(c.id)}
              aria-pressed={c.id === characterId}
              className={`flex items-center gap-2 rounded-sm p-1.5 text-left ${
                c.id === characterId ? 'bg-blood-3 ring-1 ring-blood' : 'hover:bg-white/5'
              } ${taken ? 'opacity-40' : ''}`}
            >
              <Avatar characterId={c.id} initial={name || '?'} className="h-10 w-10 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {displayName(name || 'Someone', c.id)}
                </span>
                {taken && (
                  <span className="text-[10px] tracking-wide text-ivory-3 uppercase">taken</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {collector && onRemove && (
          <Button variant="danger" onClick={onRemove} className="flex-1">
            Remove
          </Button>
        )}
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!canSave}
          onClick={() => onSave({ name, characterId })}
          className="flex-1"
        >
          {collector ? 'Save' : 'Add'}
        </Button>
      </div>
    </Dialog>
  )
}
