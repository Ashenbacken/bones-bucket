import { useAtomValue } from 'jotai'
import { themeAtom } from '@/atoms/store'
import { getCharacter, type Crest, type Metal } from '@/characters/catalog'

interface Props {
  characterId: string
  /** First letter of the collector's name, engraved on the crest. */
  initial?: string
  /** 0 = original gem; higher values shift the hue for duplicate characters. */
  variant?: number
  className?: string
  title?: string
}

const METALS: Record<Metal, [string, string, string]> = {
  pewter: ['#e2e6ec', '#8d939b', '#3a3e45'],
  gold: ['#f6e4a6', '#c9a24a', '#6e5218'],
  bronze: ['#e6b98a', '#a5673a', '#4d2c14'],
  iron: ['#aeb3ba', '#5b6068', '#1c1f24'],
}

const SHAPES: Record<Crest, string> = {
  shield: 'M32 6 L56 14 V34 C56 48 44 56 32 62 C20 56 8 48 8 34 V14 Z',
  round: 'M32 6 A26 26 0 1 1 31.9 6 Z',
  lozenge: 'M32 4 L58 32 L32 60 L6 32 Z',
  banner: 'M8 10 H56 V44 L32 60 L8 44 Z',
}

function Ornament({ kind, metal }: { kind: string; metal: [string, string, string] }) {
  const [hi, mid, lo] = metal
  switch (kind) {
    case 'skull':
      return (
        <g transform="translate(32 6) scale(.55)">
          <path d="M-9 -4a9 8 0 0 1 18 0v5a4 4 0 0 1-3 4v3h-12v-3a4 4 0 0 1-3-4z" fill="#cfcac0" />
          <ellipse cx="-4" cy="-2" rx="2.4" ry="2.8" fill="#0a0b0d" />
          <ellipse cx="4" cy="-2" rx="2.4" ry="2.8" fill="#0a0b0d" />
          <path d="M0 1l-1.5 3h3z" fill="#0a0b0d" />
          <path d="M-4 5h8v3h-8z" fill="#cfcac0" />
          <path d="M-2 5v3M0 5v3M2 5v3" stroke="#0a0b0d" strokeWidth=".8" />
        </g>
      )
    case 'horns':
      return (
        <g fill={mid} stroke={lo} strokeWidth=".6">
          <path d="M22 10c-8-4-12-10-10-16 4 6 8 8 12 10z" />
          <path d="M42 10c8-4 12-10 10-16-4 6-8 8-12 10z" />
          <path d="M22 10c-6-3-9-7-9-11" stroke={hi} strokeWidth=".8" fill="none" />
        </g>
      )
    case 'spikes':
      return (
        <g fill={mid} stroke={lo} strokeWidth=".6">
          <path d="M32 -2l3 10h-6z" />
          <path d="M20 4l6 6-8 1z" />
          <path d="M44 4l-6 6 8 1z" />
        </g>
      )
    case 'wings':
      return (
        <g fill={mid} stroke={lo} strokeWidth=".6">
          <path d="M24 10c-10-4-16-2-20 2 6-1 10 1 14 4z" />
          <path d="M40 10c10-4 16-2 20 2-6-1-10 1-14 4z" />
        </g>
      )
    default:
      return null
  }
}

/**
 * Necromancer theme: an iron skull badge on a hexagonal plate, the initial burning on the brow.
 * The character's gem colour survives as the plate's gem so collectors stay distinguishable.
 */
function SkullBadge({
  characterId,
  letter,
  variant,
  className,
  title,
}: {
  characterId: string
  letter: string
  variant: number
  className?: string
  title?: string
}) {
  const c = getCharacter(characterId)
  const uid = `badge-${c.id}`
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title ?? c.id}
      style={variant ? { filter: `hue-rotate(${variant * 70}deg)` } : undefined}
    >
      <defs>
        <linearGradient id={`${uid}-iron`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a626a" />
          <stop offset="1" stopColor="#24272c" />
        </linearGradient>
      </defs>
      {/* hexagonal plate */}
      <polygon
        points="32,3 56,17 56,45 32,61 8,45 8,17"
        fill="#16181b"
        stroke="#373c42"
        strokeWidth="2.2"
      />
      <polygon
        points="32,7 52,19 52,43 32,57 12,43 12,19"
        fill="none"
        stroke="#0d0e10"
        strokeWidth="1"
      />
      {/* cranium */}
      <path
        d="M18 30c0-13 28-13 28 0 0 6-3 11-8 13v8H26v-8c-5-2-8-7-8-13z"
        fill={`url(#${uid}-iron)`}
        stroke="#111215"
        strokeWidth="1.6"
      />
      {/* angry sockets */}
      <polygon points="22,31 30,33.5 28.5,37.5 22,35" fill="#0d0e10" />
      <polygon points="42,31 34,33.5 35.5,37.5 42,35" fill="#0d0e10" />
      <g style={{ filter: 'drop-shadow(0 0 2px var(--t-glow))' }}>
        <polygon points="24,33 28,34.2 27.4,36 24,34.6" fill="var(--t-glow)" opacity=".85" />
        <polygon points="40,33 36,34.2 36.6,36 40,34.6" fill="var(--t-glow)" opacity=".85" />
      </g>
      {/* nose + teeth */}
      <polygon points="32,39 34.4,44 29.6,44" fill="#0d0e10" />
      <path d="M27 47v4M30.4 47v4M33.8 47v4M37.2 47v4" stroke="#111215" strokeWidth="1.6" />
      <path d="M32 20l-1.6 5 2.4 2.4" stroke="#111215" strokeWidth="1.2" fill="none" />
      {/* gem */}
      <circle cx="32" cy="57" r="2.6" fill={c.gem} stroke="#0d0e10" strokeWidth=".8" />
      {/* initial burning across the face */}
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="'Grenze Gotisch', 'UnifrakturCook', serif"
        fontWeight="800"
        fontSize="27"
        fill="var(--t-glow-hi)"
        stroke="#0d0e10"
        strokeWidth="1.4"
        paintOrder="stroke"
        style={{ filter: 'drop-shadow(0 0 3px var(--t-glow))' }}
      >
        {letter}
      </text>
    </svg>
  )
}

/** Engraved crest medallion: cracked stone field, metal rim, gem, and the collector's initial. */
export function Avatar({ characterId, initial, variant = 0, className, title }: Props) {
  const theme = useAtomValue(themeAtom)
  const c = getCharacter(characterId)
  const metal = METALS[c.metal]
  const [hi, mid, lo] = metal
  const shape = SHAPES[c.crest]
  const uid = `${c.id}-${c.crest}`
  const letter = (initial ?? '?').trim().charAt(0).toUpperCase() || '?'

  if (theme === 'necro') {
    return (
      <SkullBadge
        characterId={characterId}
        letter={letter}
        variant={variant}
        className={className}
        title={title}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title ?? c.id}
      style={variant ? { filter: `hue-rotate(${variant * 70}deg)` } : undefined}
    >
      <defs>
        <linearGradient id={`m-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset=".45" stopColor={mid} />
          <stop offset=".55" stopColor={lo} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <linearGradient id={`s-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4f57" />
          <stop offset="1" stopColor="#1c1f24" />
        </linearGradient>
        <filter id={`n-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="3" seed="3" />
          <feColorMatrix values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .45 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <clipPath id={`c-${uid}`}>
          <path d={shape} />
        </clipPath>
      </defs>
      {/* rim */}
      <path d={shape} fill={`url(#m-${uid})`} stroke="#05070a" strokeWidth="1.2" />
      {/* stone field */}
      <g clipPath={`url(#c-${uid})`}>
        <path
          d={shape}
          fill={`url(#s-${uid})`}
          transform="translate(32 32) scale(.86) translate(-32 -32)"
        />
        <path
          d={shape}
          filter={`url(#n-${uid})`}
          transform="translate(32 32) scale(.86) translate(-32 -32)"
        />
        <path
          d="M14 22l10 8-4 10 12 6M40 14l-6 12 10 8"
          stroke="#000"
          strokeOpacity=".5"
          strokeWidth=".9"
          fill="none"
        />
      </g>
      <path
        d={shape}
        fill="none"
        stroke="#05070a"
        strokeWidth=".8"
        transform="translate(32 32) scale(.86) translate(-32 -32)"
      />
      {/* gem */}
      <circle cx="32" cy="52" r="3.2" fill={c.gem} stroke={lo} strokeWidth=".8" />
      <circle cx="31" cy="51" r="1" fill="#fff" opacity=".7" />
      {/* initial */}
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fontFamily="'Grenze Gotisch', 'UnifrakturCook', serif"
        fontWeight="600"
        fontSize="30"
        fill={c.metal === 'gold' || c.metal === 'bronze' ? '#f1d98a' : '#e2e6ec'}
        stroke="#05070a"
        strokeWidth="1"
        paintOrder="stroke"
        style={{ filter: 'drop-shadow(0 1px 1px #000)' }}
      >
        {letter}
      </text>
      <Ornament kind={c.ornament} metal={metal} />
    </svg>
  )
}
