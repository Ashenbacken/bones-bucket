import { useRef, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  clearAllBonesAtom,
  collectorsAtom,
  replaceStoreAtom,
  settingsAtom,
  storeAtom,
  updateCollectorAtom,
} from '@/atoms/store'
import type { Collector, Settings, Store } from '@/domain/types'
import { parseStore, StoreParseError } from '@/domain/store'
import { todayKey } from '@/domain/days'
import { displayName } from '@/characters/catalog'
import { downloadJson, shareJsonFile } from '@/lib/share'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import { CollectorForm } from '@/components/CollectorForm'
import { Dialog } from '@/components/Dialog'
import { HandoffDialog } from '@/components/HandoffDialog'
import { ImportDialog } from '@/components/ImportDialog'
import { Panel } from '@/components/Panel'
import { themeAtom } from '@/atoms/store'
import toggleImg from '@/assets/themes/gilded/toggle.png'
import { CrestSigil } from '@/components/Ornaments'

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const theme = useAtomValue(themeAtom)
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 py-1">
      <span>
        <span className="engraved block font-semibold">{label}</span>
        {hint && <span className="block text-xs text-ivory-3">{hint}</span>}
      </span>
      {theme === 'gilded' ? (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className="h-[45px] w-[78px] shrink-0"
          style={{
            backgroundImage: `url(${toggleImg})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            transform: checked ? 'scaleX(-1)' : undefined,
            filter: checked ? undefined : 'saturate(.4) brightness(.7)',
          }}
        />
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className="etched etched-quiet relative h-8 w-14 shrink-0 rounded-full"
        >
          <span
            className={`absolute top-1 left-0 h-6 w-6 rounded-full transition-all ${
              checked ? 'translate-x-[26px]' : 'translate-x-1'
            }`}
            style={{
              background: checked
                ? 'radial-gradient(circle at 40% 35%, var(--t-gauge-a), var(--t-gauge-b) 60%, var(--t-gauge-c))'
                : 'radial-gradient(circle at 40% 35%, var(--t-metal-mid), var(--t-metal-lo) 70%)',
              boxShadow: checked
                ? '0 0 10px var(--t-glow), inset 0 0 0 1px var(--t-line)'
                : 'inset 0 0 0 1px var(--t-line)',
            }}
          />
        </button>
      )}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel className="p-3">
      <h2 className="font-display glow-gold mb-2 text-xs font-bold tracking-widest uppercase">
        {title}
      </h2>
      {children}
    </Panel>
  )
}

export function SettingsScreen() {
  const store = useAtomValue(storeAtom)
  const collectors = useAtomValue(collectorsAtom)
  const settings = useAtomValue(settingsAtom)
  const setSettings = useSetAtom(settingsAtom)
  const updateCollector = useSetAtom(updateCollectorAtom)
  const clearAllBones = useSetAtom(clearAllBonesAtom)
  const replaceStore = useSetAtom(replaceStoreAtom)

  const [editing, setEditing] = useState<Collector | null>(null)
  const [handoff, setHandoff] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [incoming, setIncoming] = useState<Store | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<Settings>) => setSettings(patch)

  const exportJson = async () => {
    const name = `bones-bucket-${todayKey(new Date(), settings.dayStartHour)}.json`
    if (!(await shareJsonFile(name, store))) downloadJson(name, store)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      setIncoming(parseStore(JSON.parse(await file.text())))
    } catch (e) {
      setImportError(
        e instanceof StoreParseError
          ? `Not a Bones Bucket backup: ${e.message}`
          : 'Could not read that file.',
      )
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      <header className="text-center">
        <CrestSigil className="mx-auto h-8 w-10" />
        <h1 className="font-display glow-red text-3xl leading-none uppercase">Settings</h1>
      </header>

      <Section title="Collectors">
        {collectors.length === 0 && (
          <p className="text-sm text-ivory-2">None yet — add them from the Bucket.</p>
        )}
        <ul className="divide-y divide-black/40">
          {collectors.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setEditing(c)}
                className="flex min-h-12 w-full items-center gap-3 py-1 text-left"
              >
                <Avatar
                  characterId={c.characterId}
                  initial={c.name}
                  className="h-10 w-10 shrink-0"
                />
                <span className="engraved min-w-0 flex-1 truncate font-semibold">
                  {displayName(c.name, c.characterId)}
                </span>
                <span className="text-ivory-3">›</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Theme">
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['crypt', 'Crypt', 'Slate & blood'],
              ['hades', 'Hades', 'Marble & flame'],
              ['necro', 'Necro', 'Obsidian & ghoul-fire'],
              ['gilded', 'Gilded', 'Pixel gold & candle'],
            ] as const
          ).map(([id, label, hint]) => (
            <button
              key={id}
              type="button"
              aria-pressed={settings.theme === id}
              onClick={() => set({ theme: id })}
              className={`etched plaque-press flex min-h-16 flex-col items-center justify-center p-2 ${
                settings.theme === id ? '' : 'etched-quiet'
              }`}
            >
              <span
                className={`font-display relative z-10 text-xs font-bold tracking-widest uppercase ${
                  settings.theme === id ? 'glow-red' : 'text-ivory-2'
                }`}
              >
                {label}
              </span>
              <span className="relative z-10 text-center text-[10px] leading-tight text-ivory-3">
                {hint}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Day boundary">
        <p className="mb-2 text-sm text-ivory-2">
          Bones given after midnight but before this hour still count for the evening before.
        </p>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Earlier"
            disabled={settings.dayStartHour <= 0}
            onClick={() => set({ dayStartHour: settings.dayStartHour - 1 })}
            className="etched etched-quiet plaque-press h-12 w-12 text-xl text-ivory disabled:opacity-30"
          >
            <span className="relative z-10">‹</span>
          </button>
          <div className="text-center">
            <div className="font-display glow-red text-2xl">
              {String(settings.dayStartHour).padStart(2, '0')}:00
            </div>
            <div className="text-xs text-ivory-3">
              {settings.dayStartHour === 0
                ? 'a new day starts at midnight'
                : 'a new day starts here'}
            </div>
          </div>
          <button
            type="button"
            aria-label="Later"
            disabled={settings.dayStartHour >= 12}
            onClick={() => set({ dayStartHour: settings.dayStartHour + 1 })}
            className="etched etched-quiet plaque-press h-12 w-12 text-xl text-ivory disabled:opacity-30"
          >
            <span className="relative z-10">›</span>
          </button>
        </div>
      </Section>

      <Section title="Feel">
        <Toggle
          label="Sound"
          hint="A clunk when a bone lands"
          checked={settings.sound}
          onChange={(v) => set({ sound: v })}
        />
        <Toggle
          label="Haptics"
          hint="Vibrate on tap"
          checked={settings.haptics}
          onChange={(v) => set({ haptics: v })}
        />
        <Toggle
          label="Spooky mode"
          hint="Mist, embers and other visitors"
          checked={settings.spooky}
          onChange={(v) => set({ spooky: v })}
        />
      </Section>

      <Section title="Hand off">
        <p className="mb-2 text-sm text-ivory-2">
          Move the bucket to another phone. The link carries everything; both phones keep a copy.
        </p>
        <Button
          variant="primary"
          onClick={() => setHandoff(true)}
          className="w-full"
          disabled={!collectors.length}
        >
          Hand off the bucket
        </Button>
      </Section>

      <Section title="Backup">
        <div className="flex gap-2">
          <Button onClick={exportJson} className="flex-1" disabled={!store.collectors.length}>
            Export
          </Button>
          <Button onClick={() => fileRef.current?.click()} className="flex-1">
            Import
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
      </Section>

      <Section title="Danger">
        <Button variant="danger" onClick={() => setConfirmClear(true)} className="w-full">
          Empty the bucket
        </Button>
      </Section>

      <p className="text-center text-xs text-ivory-3">
        Bones Bucket v{__APP_VERSION__} · data stays on this phone
        <br />
        Gilded pixel art by{' '}
        <a
          href="https://abyssowl.itch.io/gothic-pixel-ui"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          AbyssOwl
        </a>
      </p>

      {editing && (
        <CollectorForm
          open
          collector={editing}
          onClose={() => setEditing(null)}
          onSave={(input) => {
            updateCollector(editing.id, { name: input.name.trim(), characterId: input.characterId })
            setEditing(null)
          }}
          onRemove={() => {
            updateCollector(editing.id, { removed: true })
            setEditing(null)
          }}
        />
      )}

      {handoff && <HandoffDialog onClose={() => setHandoff(false)} />}

      <ImportDialog
        incoming={incoming}
        error={importError}
        source="file"
        onClose={() => {
          setIncoming(null)
          setImportError(null)
        }}
        onReplace={() => {
          if (incoming) replaceStore(incoming)
          setIncoming(null)
        }}
      />

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} title="Empty the bucket?">
        <p className="text-center text-sm text-ivory-2">
          Removes every bone ever collected, on every day. Collectors and settings stay.
        </p>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={() => setConfirmClear(false)} className="flex-1">
            Keep them
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              clearAllBones()
              setConfirmClear(false)
            }}
            className="flex-1"
          >
            Empty it
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
