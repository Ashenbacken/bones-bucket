import { useEffect, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { themeAtom } from '@/atoms/store'
import { OssuaryBack, OssuaryDefs, OssuaryFront, RelicBone } from './Ossuary'
import { OSSUARY_OVERFLOW, OSSUARY_SLOTS } from './ossuarySlots'

interface Props {
  count: number
  className?: string
}

/** [x, y, tilt] — bone centre and tilt from vertical. First bones sit deep, later ones rise. */
const SLOTS: Array<[number, number, number]> = [
  [60, 46, -8],
  [46, 48, -22],
  [74, 48, 18],
  [38, 50, -32],
  [82, 50, 32],
  [54, 40, 6],
  [68, 40, -10],
  [42, 43, 14],
  [78, 43, -16],
  [60, 34, -3],
  [50, 35, -14],
  [70, 35, 12],
]
/** Past a full bucket, bones pile up on the floor at its foot. Tilt ≈ ±90 lies flat. */
const OVERFLOW: Array<[number, number, number]> = [
  [60, 113, 86],
  [30, 110, 76],
  [90, 110, -76],
  [44, 105, 62],
  [78, 105, -62],
  [22, 116, 84],
  [98, 116, -84],
]

type BoneKind = 'whole' | 'broken' | 'snapped'

/** Bone kinds by slot so the pile reads as mixed relics: roughly every third bone is broken. */
const kindFor = (i: number): BoneKind =>
  i % 3 === 1 ? 'broken' : i % 5 === 4 ? 'snapped' : 'whole'

/**
 * A weathered femur, drawn horizontally around its centre: slightly waisted shaft, two-lobed
 * ends, dirt speckles. Broken kinds lose one end to a jagged fracture with a dark hollow.
 */
function Bone({
  x,
  y,
  tilt,
  fresh,
  kind,
}: {
  x: number
  y: number
  tilt: number
  fresh: boolean
  kind: BoneKind
}) {
  const shaft =
    kind === 'whole'
      ? 'M-17 -3.2 C -8 -2.2, 8 -2.2, 17 -3.2 L 17 3.2 C 8 2.2, -8 2.2, -17 3.2 Z'
      : kind === 'broken'
        ? 'M-17 -3.2 C -8 -2.2, 4 -2.2, 9 -3 L 11.5 -1.6 L 9.5 0.4 L 12 1.8 L 9 3.4 C 4 2.4, -8 2.2, -17 3.2 Z'
        : 'M-17 -3.2 C -10 -2.4, -4 -2.4, 0 -3 L 2.5 -1.4 L 0.5 0.6 L 3 2 L 0 3.4 C -4 2.6, -10 2.2, -17 3.2 Z'
  const hollowX = kind === 'broken' ? 10.2 : 1.2
  const edge = { stroke: '#3a3128', strokeWidth: 0.55 }
  return (
    <g transform={`translate(${x} ${y}) rotate(${90 + tilt})`}>
      <g className={fresh ? 'bone-drop' : undefined}>
        {/* +x points down into the bucket, so mirror broken kinds: intact end down, fracture up */}
        <g transform={kind === 'whole' ? undefined : 'scale(-1 1)'}>
          <path d={shaft} fill="url(#bone-shade)" {...edge} />
          {/* left end: two lobes */}
          <circle cx="-18" cy="-3.4" r="3.9" fill="url(#bone-shade)" {...edge} />
          <circle cx="-17.2" cy="3.2" r="3.4" fill="url(#bone-shade)" {...edge} />
          {kind === 'whole' ? (
            <>
              <circle cx="18" cy="-3.2" r="3.5" fill="url(#bone-shade)" {...edge} />
              <circle cx="17.4" cy="3.4" r="3.9" fill="url(#bone-shade)" {...edge} />
            </>
          ) : (
            /* fracture: dark hollow marrow */
            <ellipse cx={hollowX} cy="0.2" rx="1.6" ry="2.2" fill="#2a211a" />
          )}
          {/* grain line + dirt */}
          <path
            d="M-12 -0.4 C -4 0.4, 4 -0.6, 12 0.2"
            stroke="#8a7a62"
            strokeWidth=".6"
            opacity=".55"
            fill="none"
          />
          <circle cx="-9" cy="1.6" r=".6" fill="#5b4a36" opacity=".7" />
          <circle cx="4" cy="-1.5" r=".5" fill="#5b4a36" opacity=".7" />
          <circle cx="-14" cy="-2.2" r=".45" fill="#5b4a36" opacity=".6" />
        </g>
      </g>
    </g>
  )
}

/**
 * Weathered oak bucket with rusty iron bands; bones stand in it and rise above the rim as the
 * count grows. In the Necro theme the container is a stone ossuary instead.
 */
export function BucketGraphic({ count, className }: Props) {
  const prev = useRef(count)
  const [fresh, setFresh] = useState(false)

  useEffect(() => {
    if (count > prev.current) {
      setFresh(true)
      const t = setTimeout(() => setFresh(false), 900)
      prev.current = count
      return () => clearTimeout(t)
    }
    prev.current = count
  }, [count])

  const theme = useAtomValue(themeAtom)
  const slots = theme === 'necro' ? OSSUARY_SLOTS : SLOTS
  const overflow = theme === 'necro' ? OSSUARY_OVERFLOW : OVERFLOW
  const inside = Math.min(count, slots.length)
  const over = Math.min(Math.max(0, count - slots.length), overflow.length)

  if (theme === 'necro') {
    return (
      <svg
        viewBox="0 0 120 120"
        className={`${className ?? ''} ${fresh ? 'wobble' : ''}`}
        aria-hidden
      >
        <OssuaryDefs />
        <g transform="translate(10 0)">
          <OssuaryBack />
          {slots.slice(0, inside).map(([x, y, tilt], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${tilt})`}>
              <RelicBone seed={i} fresh={fresh && i === inside - 1 && over === 0} />
            </g>
          ))}
          <OssuaryFront />
          {overflow.slice(0, over).map(([x, y, tilt], i) => (
            <g key={`o${i}`} transform={`translate(${x} ${y}) rotate(${tilt})`}>
              <RelicBone seed={i + 5} fresh={fresh && i === over - 1} />
            </g>
          ))}
        </g>
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${className ?? ''} ${fresh ? 'wobble' : ''}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="bucket-wood" x1="0" x2="1">
          <stop offset="0" stopColor="#4a3421" />
          <stop offset=".18" stopColor="#8a6543" />
          <stop offset=".45" stopColor="#b08a5e" />
          <stop offset=".62" stopColor="#95704a" />
          <stop offset=".85" stopColor="#6b4a2e" />
          <stop offset="1" stopColor="#3a2617" />
        </linearGradient>
        <linearGradient id="bucket-rust" x1="0" x2="1">
          <stop offset="0" stopColor="#2a1a12" />
          <stop offset=".3" stopColor="#5a3a26" />
          <stop offset=".5" stopColor="#7a4a2a" />
          <stop offset=".75" stopColor="#4a2c1a" />
          <stop offset="1" stopColor="#1f120c" />
        </linearGradient>
        <linearGradient id="bone-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1ebdd" />
          <stop offset=".5" stopColor="#d3c8b0" />
          <stop offset="1" stopColor="#8c7d66" />
        </linearGradient>
        <radialGradient id="bucket-dark" cx=".5" cy=".5" r=".6">
          <stop offset="0" stopColor="#0d0906" />
          <stop offset="1" stopColor="#2a1c12" />
        </radialGradient>
        <filter id="wood-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".02 .5" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 .1 0 0 0 0 .06 0 0 0 0 .03 0 0 0 .35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      {/* floor shadow */}
      <ellipse cx="60" cy="107" rx="48" ry="4.5" fill="#000" opacity=".55" />
      {/* rope-wrapped iron handle (behind) */}
      <path d="M24 46c-8-24 80-24 72 0" fill="none" stroke="#2a1c12" strokeWidth="3.4" />
      <path
        d="M24 46c-8-24 80-24 72 0"
        fill="none"
        stroke="#7a5a3a"
        strokeWidth="1.6"
        strokeDasharray="1.6 1.4"
      />
      <circle cx="24" cy="46" r="2.6" fill="#3a2a1e" stroke="#0d0906" strokeWidth=".6" />
      <circle cx="96" cy="46" r="2.6" fill="#3a2a1e" stroke="#0d0906" strokeWidth=".6" />
      {/* back rim + dark interior */}
      <ellipse cx="60" cy="46" rx="40" ry="8" fill="url(#bucket-dark)" />
      {slots.slice(0, inside).map(([x, y, tilt], i) => (
        <Bone
          key={i}
          x={x}
          y={y}
          tilt={tilt}
          kind={kindFor(i)}
          fresh={fresh && i === inside - 1 && over === 0}
        />
      ))}
      {/* staves */}
      <path d="M20 48h80l-6 58H26z" fill="url(#bucket-wood)" />
      <path d="M20 48h80l-6 58H26z" filter="url(#wood-grain)" fill="#000" />
      <path
        d="M31 48l-2.6 58M42 48l-1.6 58M53 48l-.6 58M64 48l.6 58M75 48l1.6 58M86 48l2.6 58"
        stroke="#2a1a10"
        strokeWidth="1.1"
        opacity=".75"
      />
      <path
        d="M32.5 48l-2.6 58M54.5 48l-.6 58M76.5 48l1.6 58"
        stroke="#c9a47a"
        strokeWidth=".5"
        opacity=".35"
      />
      {/* knots and weathering */}
      <ellipse cx="47" cy="70" rx="1.6" ry="2.4" fill="#3a2617" opacity=".8" />
      <ellipse cx="47" cy="70" rx=".7" ry="1.1" fill="#1a100a" />
      <ellipse cx="82" cy="92" rx="1.3" ry="2" fill="#3a2617" opacity=".7" />
      <path
        d="M36 60c2 8 1 16 3 24M70 58c-1 10 1 18-1 28"
        stroke="#2a1a10"
        strokeWidth=".5"
        opacity=".5"
        fill="none"
      />
      {/* stamped label */}
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fontFamily="Cinzel, 'Trajan Pro', serif"
        fontWeight="900"
        fontSize="13"
        letterSpacing=".4"
        fill="#1a100a"
        opacity=".82"
      >
        BONES
      </text>
      <g transform="translate(60 88)" fill="#1a100a" opacity=".82">
        <rect x="-10" y="-1.1" width="20" height="2.2" rx="1.1" />
        <circle cx="-10.5" cy="-1.3" r="1.7" />
        <circle cx="-10.5" cy="1.3" r="1.7" />
        <circle cx="10.5" cy="-1.3" r="1.7" />
        <circle cx="10.5" cy="1.3" r="1.7" />
      </g>
      {/* rusty iron bands */}
      <path d="M20.6 56h78.8l-.7 6.5H21.3z" fill="url(#bucket-rust)" />
      <path d="M25.2 93h69.6l-.7 6.5H25.9z" fill="url(#bucket-rust)" />
      <path d="M20.6 56h78.8M25.2 93h69.6" stroke="#9a6a44" strokeWidth=".7" opacity=".7" />
      <path d="M20.6 62.5h78.8M25.2 99.5h69.6" stroke="#0d0906" strokeWidth=".8" opacity=".8" />
      <g fill="#c07a48" opacity=".45">
        <circle cx="34" cy="59" r=".8" />
        <circle cx="61" cy="60.5" r=".6" />
        <circle cx="83" cy="58.5" r=".9" />
        <circle cx="45" cy="96.5" r=".7" />
        <circle cx="72" cy="95.5" r=".8" />
      </g>
      {/* rusty rim */}
      <path d="M20 46a40 8 0 0 0 80 0" fill="none" stroke="#1f120c" strokeWidth="5.5" />
      <path d="M20 46a40 8 0 0 0 80 0" fill="none" stroke="url(#bucket-rust)" strokeWidth="3.4" />
      <path
        d="M22 46.5a38 7 0 0 0 76 0"
        fill="none"
        stroke="#9a6a44"
        strokeWidth=".6"
        opacity=".6"
      />
      {overflow.slice(0, over).map(([x, y, tilt], i) => (
        <Bone
          key={`o${i}`}
          x={x}
          y={y}
          tilt={tilt}
          kind={kindFor(i + 2)}
          fresh={fresh && i === over - 1}
        />
      ))}
    </svg>
  )
}
