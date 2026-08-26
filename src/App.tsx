import { useCallback, useEffect, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { replaceStoreAtom, settingsAtom, storeAtom, themeAtom, todayAtom } from '@/atoms/store'
import { todayKey } from '@/domain/days'
import { decodeHandoff, readHandoffFromHash } from '@/domain/handoff'
import { StoreParseError } from '@/domain/store'
import type { Store } from '@/domain/types'
import { Atmosphere } from '@/components/Atmosphere'
import { ImportDialog } from '@/components/ImportDialog'
import { TabBar, type Tab } from '@/components/TabBar'
import { BucketScreen } from '@/screens/BucketScreen'
import { ReportScreen } from '@/screens/ReportScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'

function useMidnightRollover() {
  const setToday = useSetAtom(todayAtom)
  useEffect(() => {
    const check = () => setToday(todayKey())
    const id = setInterval(check, 30_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [setToday])
}

const THEME_COLOR = { crypt: '#070b12', hades: '#0b0b0e', necro: '#0f1012' }
const THEME_PULSE = { crypt: '#2a0a0c', hades: '#2a1a08', necro: '#0c2a08' }

/** Apply the theme to <html> and warm the browser chrome briefly whenever the bucket changes. */
function useThemeColorPulse() {
  const store = useAtomValue(storeAtom)
  const theme = useAtomValue(themeAtom)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!meta) return
    meta.content = THEME_PULSE[theme]
    const t = setTimeout(() => (meta.content = THEME_COLOR[theme]), 600)
    return () => clearTimeout(t)
  }, [store.bones, theme])
}

function useHandoffFromUrl() {
  const [incoming, setIncoming] = useState<Store | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const payload = readHandoffFromHash(location.hash)
    if (!payload) return
    decodeHandoff(payload)
      .then(setIncoming)
      .catch((e) =>
        setError(
          e instanceof StoreParseError
            ? `This link is not a valid bucket: ${e.message}`
            : 'Could not open this link.',
        ),
      )
  }, [])
  const clear = useCallback(() => {
    setIncoming(null)
    setError(null)
    if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  }, [])
  return { incoming, error, clear }
}

/**
 * Go fullscreen on the first tap when running in a browser tab (installed PWAs are already
 * standalone). Android only honours the portrait lock inside fullscreen, so retry it there.
 * iOS Safari has no document fullscreen API; the call simply doesn't exist and is skipped.
 */
function useFullscreenOnFirstInteraction() {
  useEffect(() => {
    const standalone =
      matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    const root = document.documentElement
    if (standalone || typeof root.requestFullscreen !== 'function') return
    const go = () => {
      cleanup()
      if (document.fullscreenElement) return
      root
        .requestFullscreen({ navigationUI: 'hide' })
        .then(() => {
          const o = screen.orientation as ScreenOrientation & {
            lock?: (o: string) => Promise<void>
          }
          return o?.lock?.('portrait')
        })
        .catch(() => {})
    }
    const cleanup = () => {
      window.removeEventListener('pointerdown', go)
      window.removeEventListener('keydown', go)
    }
    window.addEventListener('pointerdown', go, { once: true })
    window.addEventListener('keydown', go, { once: true })
    return cleanup
  }, [])
}

function useLandscapePhone() {
  const q = '(orientation: landscape) and (max-width: 767px) and (max-height: 500px)'
  const [match, setMatch] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const mq = matchMedia(q)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return match
}

export default function App() {
  const [tab, setTab] = useState<Tab>(() => {
    const t = new URLSearchParams(location.search).get('tab')
    return t === 'report' || t === 'settings' ? t : 'bucket'
  })
  const settings = useAtomValue(settingsAtom)
  const replaceStore = useSetAtom(replaceStoreAtom)
  const handoff = useHandoffFromUrl()
  const landscape = useLandscapePhone()
  useMidnightRollover()
  useThemeColorPulse()
  useFullscreenOnFirstInteraction()

  return (
    <>
      <Atmosphere enabled={settings.spooky} />
      <div
        className="relative z-10 flex h-full flex-col"
        style={{
          paddingTop: 'calc(var(--frame) + var(--sat))',
          paddingLeft: 'calc(var(--frame) + var(--sal))',
          paddingRight: 'calc(var(--frame) + var(--sar))',
          paddingBottom: 'calc(var(--frame) + var(--sab))',
        }}
      >
        <main className="phone-column scrollbar-none w-full flex-1 overflow-y-auto px-3 pt-4 pb-28">
          {tab === 'bucket' && <BucketScreen />}
          {tab === 'report' && <ReportScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </main>
        <div
          className="phone-column fixed inset-x-0 z-20 w-full px-3"
          style={{ bottom: 'calc(var(--frame) + var(--sab) + 8px)' }}
        >
          <TabBar tab={tab} onChange={setTab} />
        </div>
      </div>

      <ImportDialog
        incoming={handoff.incoming}
        error={handoff.error}
        source="link"
        onClose={handoff.clear}
        onReplace={() => {
          if (handoff.incoming) replaceStore(handoff.incoming)
          handoff.clear()
          setTab('bucket')
        }}
      />

      {landscape && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 slate p-6 text-center">
          <svg viewBox="0 0 64 64" className="h-20 w-20 rotate-90 text-ivory">
            <path d="M12 22h40l-4 32H16z" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M12 22c0-6 40-6 40 0" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
          <p className="font-display glow-red text-xl uppercase">Turn the bucket upright</p>
          <p className="text-sm text-ivory-2">Bones only stack in portrait.</p>
        </div>
      )}
    </>
  )
}
