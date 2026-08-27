import type { CSSProperties } from 'react'
import { useAtomValue } from 'jotai'
import { themeAtom } from '@/atoms/store'
import crow from '@/assets/themes/gilded/icon-crow.png'

/** Shaded skull for the frame corners; wears a laurel wreath in Hades. */
export function SkullOrnament({
  className,
  style,
  eyes,
}: {
  className?: string
  style?: CSSProperties
  /** Burning eyes (Spooky mode). */
  eyes?: boolean
}) {
  const theme = useAtomValue(themeAtom)
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="skull-bone" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#e7e2d6" />
          <stop offset=".6" stopColor="#b9b2a4" />
          <stop offset="1" stopColor="#5e584e" />
        </radialGradient>
        <radialGradient id="skull-socket" cx=".5" cy=".5" r=".6">
          <stop offset="0" stopColor="#000" />
          <stop offset=".7" stopColor="#0d0b0a" />
          <stop offset="1" stopColor="#3a332c" />
        </radialGradient>
      </defs>
      {/* spiked metal mount */}
      <path d="M2 2h60L44 10 28 8 16 14 10 26 8 44z" fill="var(--t-metal-shade)" />
      <path d="M2 2h60L44 10 28 8z" fill="var(--t-metal-hi)" opacity=".6" />
      <path d="M2 2l14 12-2 12L8 44z" fill="var(--t-metal-lo)" />
      {/* skull */}
      <path
        d="M16 30a16 15 0 0 1 32 0v8a7 7 0 0 1-5 7v6H21v-6a7 7 0 0 1-5-7z"
        fill="url(#skull-bone)"
      />
      <path
        d="M20 26c3-8 21-8 24 0"
        stroke="#fff"
        strokeOpacity=".25"
        strokeWidth="1.5"
        fill="none"
      />
      <ellipse cx="25" cy="32" rx="4.5" ry="5.2" fill="url(#skull-socket)" />
      <ellipse cx="39" cy="32" rx="4.5" ry="5.2" fill="url(#skull-socket)" />
      {eyes && (
        <g className="eyes" style={{ filter: 'drop-shadow(0 0 4px var(--t-glow))' }}>
          <ellipse cx="25" cy="32.5" rx="2" ry="2.2" fill="var(--t-glow)" />
          <ellipse cx="39" cy="32.5" rx="2" ry="2.2" fill="var(--t-glow)" />
        </g>
      )}
      <path d="M32 37l-2.5 5.5h5z" fill="#1a1613" />
      <path d="M23 45h18v6H23z" fill="#c9c2b4" />
      <path d="M26.5 45v6M30 45v6M33.5 45v6M37 45v6" stroke="#2a251f" strokeWidth="1.2" />
      <path d="M22 45h20" stroke="#4a443b" strokeWidth="1" />
      <path d="M36 20l3 5-2 4M22 24l2 4" stroke="#3a332c" strokeWidth=".8" fill="none" />
      {theme === 'hades' && <Laurel />}
    </svg>
  )
}

/** Gold laurel wreath around the skull's brow. */
function Laurel() {
  const leaf = (x: number, y: number, r: number) => (
    <path
      key={`${x}${y}${r}`}
      d="M0 0c3-4 7-4 8 0-1 4-5 4-8 0z"
      transform={`translate(${x} ${y}) rotate(${r})`}
      fill="var(--t-trim)"
      stroke="var(--t-trim-lo)"
      strokeWidth=".5"
    />
  )
  return (
    <g>
      <path
        d="M17 34c-2-8 4-16 15-18 11 2 17 10 15 18"
        fill="none"
        stroke="var(--t-trim-lo)"
        strokeWidth="1.6"
      />
      {leaf(15, 33, -100)}
      {leaf(16, 27, -75)}
      {leaf(19, 21, -50)}
      {leaf(24, 17, -25)}
      {leaf(41, 33, -80)}
      {leaf(42, 27, -105)}
      {leaf(41, 21, -130)}
      {leaf(36, 17, -155)}
    </g>
  )
}

/** Frame trim: gold chain in Crypt, Greek meander band in Hades. */
export function Chain({
  className,
  style,
  vertical,
}: {
  className?: string
  style?: CSSProperties
  vertical?: boolean
}) {
  const theme = useAtomValue(themeAtom)
  const id = `${theme}-${vertical ? 'v' : 'h'}`
  return (
    <svg className={className} style={style} aria-hidden preserveAspectRatio="none">
      <defs>
        {theme === 'necro' ? (
          <pattern
            id={id}
            width={vertical ? 8 : 14}
            height={vertical ? 14 : 8}
            patternUnits="userSpaceOnUse"
          >
            <g transform={vertical ? 'rotate(90 4 4)' : undefined}>
              <rect
                x="1"
                y="1.5"
                width="8"
                height="5"
                rx="1.5"
                fill="#4a525a"
                stroke="#0f1012"
                strokeWidth=".8"
              />
              <path d="M5 0v1.5M5 6.5V8" stroke="#3d444b" strokeWidth="1.6" />
              <rect x="9.5" y="3" width="4" height="2" rx="1" fill="#2c3035" />
            </g>
          </pattern>
        ) : theme === 'hades' ? (
          <pattern
            id={id}
            width={vertical ? 8 : 16}
            height={vertical ? 16 : 8}
            patternUnits="userSpaceOnUse"
          >
            <g transform={vertical ? 'rotate(90 4 4)' : undefined}>
              <rect width="16" height="8" fill="var(--t-metal-lo)" />
              <path
                d="M0 6.5h2v-5h10v3h-6v-1h4v-1h-6v3h10v-5"
                fill="none"
                stroke="var(--t-trim)"
                strokeWidth="1"
              />
            </g>
          </pattern>
        ) : (
          <pattern
            id={id}
            width={vertical ? 8 : 20}
            height={vertical ? 20 : 8}
            patternUnits="userSpaceOnUse"
          >
            <g transform={vertical ? 'rotate(90 4 4)' : undefined}>
              <ellipse
                cx="8"
                cy="4"
                rx="6"
                ry="2.6"
                fill="none"
                stroke="var(--t-trim-lo)"
                strokeWidth="2.4"
              />
              <ellipse
                cx="8"
                cy="4"
                rx="6"
                ry="2.6"
                fill="none"
                stroke="var(--t-trim)"
                strokeWidth="1.1"
              />
              <path
                d="M3.5 3.2q4.5-1.8 9 0"
                stroke="var(--t-trim-hi)"
                strokeWidth=".7"
                fill="none"
              />
              <circle cx="17" cy="4" r="1.6" fill="var(--t-trim-lo)" />
              <circle cx="17" cy="4" r="0.8" fill="var(--t-trim)" />
            </g>
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/** Header crest: spiked gold crest with a bone (Crypt) or an olive wreath around a bone (Hades). */
export function CrestSigil({ className }: { className?: string }) {
  const theme = useAtomValue(themeAtom)
  if (theme === 'gilded') {
    return (
      <img
        src={crow}
        alt=""
        className={className}
        style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
      />
    )
  }
  if (theme === 'necro') {
    return (
      <svg viewBox="0 0 48 40" className={className} aria-hidden>
        <g style={{ filter: 'drop-shadow(0 0 4px var(--t-glow))' }}>
          <path
            d="M14 18a10 9 0 0 1 20 0v5a5 5 0 0 1-4 5v6H18v-6a5 5 0 0 1-4-5z"
            fill="#3d444b"
            stroke="#0f1012"
            strokeWidth="1.2"
          />
          <polygon points="17,19 23,21 22,24 17,22" fill="var(--t-glow)" />
          <polygon points="31,19 25,21 26,24 31,22" fill="var(--t-glow)" />
          <polygon points="24,25 25.8,29 22.2,29" fill="#0d0e10" />
          <path d="M20 31v3M22.7 31v3M25.4 31v3M28 31v3" stroke="#0f1012" strokeWidth="1.2" />
        </g>
        <path d="M4 34h12M32 34h12" stroke="#d8d3c6" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="4" cy="33" r="1.6" fill="#d8d3c6" />
        <circle cx="4" cy="35" r="1.6" fill="#d8d3c6" />
        <circle cx="44" cy="33" r="1.6" fill="#d8d3c6" />
        <circle cx="44" cy="35" r="1.6" fill="#d8d3c6" />
      </svg>
    )
  }
  if (theme === 'hades') {
    return (
      <svg viewBox="0 0 48 40" className={className} aria-hidden>
        <path
          d="M10 30c-6-8-4-20 6-26M38 30c6-8 4-20-6-26"
          fill="none"
          stroke="var(--t-trim-lo)"
          strokeWidth="1.6"
        />
        {[
          [7, 26, -60],
          [5, 19, -85],
          [7, 12, -110],
          [12, 6, -140],
          [41, 26, -120],
          [43, 19, -95],
          [41, 12, -70],
          [36, 6, -40],
        ].map(([x, y, r]) => (
          <path
            key={`${x}-${y}`}
            d="M0 0c3-4 7-4 8 0-1 4-5 4-8 0z"
            transform={`translate(${x} ${y}) rotate(${r})`}
            fill="var(--t-trim)"
            stroke="var(--t-trim-lo)"
            strokeWidth=".5"
          />
        ))}
        <path d="M14 20h20" stroke="#e7e2d6" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="14" cy="18.5" r="2.2" fill="#e7e2d6" />
        <circle cx="14" cy="21.5" r="2.2" fill="#e7e2d6" />
        <circle cx="34" cy="18.5" r="2.2" fill="#e7e2d6" />
        <circle cx="34" cy="21.5" r="2.2" fill="#e7e2d6" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 48 40" className={className} aria-hidden>
      <path
        d="M24 2l8 4 10-2-4 10 4 10-10-2-8 16-8-16-10 2 4-10-4-10 10 2z"
        fill="var(--t-trim-lo)"
      />
      <path d="M24 5l6 3 7-1-3 7 3 7-7-1-6 12-6-12-7 1 3-7-3-7 7 1z" fill="var(--t-trim)" />
      <path d="M24 5l6 3 7-1-3 7-10 1z" fill="var(--t-trim-hi)" opacity=".5" />
      <path d="M14 20h20" stroke="#0a0b0d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="14" cy="18.5" r="2.2" fill="#0a0b0d" />
      <circle cx="14" cy="21.5" r="2.2" fill="#0a0b0d" />
      <circle cx="34" cy="18.5" r="2.2" fill="#0a0b0d" />
      <circle cx="34" cy="21.5" r="2.2" fill="#0a0b0d" />
    </svg>
  )
}
