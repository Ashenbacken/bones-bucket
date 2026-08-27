import { useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { themeAtom } from '@/atoms/store'
import { Chain, SkullOrnament } from './Ornaments'
import { pixelAssets } from '@/assets/themes/pixel'

const MOTES = Array.from({ length: 14 }, (_, i) => ({
  left: `${4 + ((i * 29) % 92)}%`,
  duration: `${9 + ((i * 7) % 8)}s`,
  delay: `${-((i * 5) % 13)}s`,
  sway: `${((i % 3) - 1) * 26}px`,
}))

/**
 * Fixed layer behind the UI: cracked slate, mist, vignette, ember flicker, rising sparks, a rare
 * raven, and the iron frame with skull corners and chain trim. Never intercepts input.
 */
export function Atmosphere({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(document.visibilityState === 'visible')
  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  const paused = !enabled || !visible
  const theme = useAtomValue(themeAtom)
  const pixel = pixelAssets(theme)

  return (
    <div
      aria-hidden
      className={`slate pointer-events-none fixed inset-0 z-0 overflow-hidden ${paused ? 'no-motion' : ''}`}
    >
      {/* Off: still stone. On: mist, sparks, lightning, a raven — all behind the frame. */}
      {enabled && <div className="fog fog-a" />}
      {enabled && <div className="fog fog-b" />}
      <div className="vignette" />
      {enabled && <div className="lightning" />}
      {enabled &&
        MOTES.map((m, i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: m.left,
              animationDuration: m.duration,
              animationDelay: m.delay,
              ['--sway' as string]: m.sway,
            }}
          />
        ))}
      {enabled && (
        <svg className="raven" viewBox="0 0 64 24">
          <path
            d="M2 14c8-6 14-8 22-6 4-6 10-6 14 0 8-2 16 0 24 6-8-2-16-1-22 2-2 4-8 6-12 2-6 2-16 1-26-4z"
            fill="#000"
          />
        </svg>
      )}
      {pixel ? <PixelFrame src={pixel.frame} /> : <Frame eyes={enabled} />}
      {enabled && <div className="ember-glow" />}
    </div>
  )
}

const rail =
  'linear-gradient(180deg, var(--t-metal-hi) 0, var(--t-metal-mid) 18%, var(--t-metal-lo) 45%, var(--t-metal-shade) 70%, var(--t-line) 100%)'
const railV =
  'linear-gradient(90deg, var(--t-metal-hi) 0, var(--t-metal-mid) 18%, var(--t-metal-lo) 45%, var(--t-metal-shade) 70%, var(--t-line) 100%)'

/** Pixel-art frame around the viewport, 9-sliced from the kit's 24px border set. */
function PixelFrame({ src }: { src: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        borderStyle: 'solid',
        borderWidth:
          'calc(var(--frame) + var(--sat)) calc(var(--frame) + var(--sar)) calc(var(--frame) + var(--sab)) calc(var(--frame) + var(--sal))',
        borderImage: `url(${src}) 28 repeat`,
        imageRendering: 'pixelated',
        boxShadow: 'inset 0 0 24px 6px rgb(0 0 0 / .8)',
      }}
    />
  )
}

function Frame({ eyes }: { eyes: boolean }) {
  const top = 'calc(var(--frame) + var(--sat))'
  const bottom = 'calc(var(--frame) + var(--sab))'
  const left = 'calc(var(--frame) + var(--sal))'
  const right = 'calc(var(--frame) + var(--sar))'
  return (
    <>
      {/* rails */}
      <div className="absolute inset-x-0 top-0" style={{ height: top, background: rail }} />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: bottom, background: rail, transform: 'scaleY(-1)' }}
      />
      <div className="absolute inset-y-0 left-0" style={{ width: left, background: railV }} />
      <div
        className="absolute inset-y-0 right-0"
        style={{ width: right, background: railV, transform: 'scaleX(-1)' }}
      />
      {/* chain trim along the inner edge of each rail */}
      <Chain className="absolute inset-x-12 h-2" style={{ top: `calc(${top} - 6px)` }} />
      <Chain className="absolute inset-x-12 h-2" style={{ bottom: `calc(${bottom} - 6px)` }} />
      <Chain vertical className="absolute inset-y-12 w-2" style={{ left: `calc(${left} - 6px)` }} />
      <Chain
        vertical
        className="absolute inset-y-12 w-2"
        style={{ right: `calc(${right} - 6px)` }}
      />
      {/* skull corners */}
      <SkullOrnament
        eyes={eyes}
        className="absolute h-14 w-14"
        style={{ top: `calc(${top} - 12px)`, left: `calc(${left} - 12px)` }}
      />
      <SkullOrnament
        eyes={eyes}
        className="absolute h-14 w-14"
        style={{
          top: `calc(${top} - 12px)`,
          right: `calc(${right} - 12px)`,
          transform: 'scaleX(-1)',
        }}
      />
      <SkullOrnament
        eyes={eyes}
        className="absolute h-14 w-14"
        style={{
          bottom: `calc(${bottom} - 12px)`,
          left: `calc(${left} - 12px)`,
          transform: 'scaleY(-1)',
        }}
      />
      <SkullOrnament
        eyes={eyes}
        className="absolute h-14 w-14"
        style={{
          bottom: `calc(${bottom} - 12px)`,
          right: `calc(${right} - 12px)`,
          transform: 'scale(-1)',
        }}
      />
      {/* inner shadow so content looks sunk behind the frame */}
      <div
        className="absolute"
        style={{ top, bottom, left, right, boxShadow: 'inset 0 0 24px 6px rgb(0 0 0 / .8)' }}
      />
    </>
  )
}
