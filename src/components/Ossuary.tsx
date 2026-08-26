/**
 * Necromancer theme container: a hexagonal stone ossuary with a recessed chamber. Relic bones
 * stack up inside; past a full chamber the last one stands in the lid and the rest litter the
 * floor. Same 120×120 box as the bucket so cards keep their layout.
 */

/** A weathered relic: chipped ends, a hairline fracture, slightly uneven shaft. */
export function RelicBone({ fresh, seed }: { fresh: boolean; seed: number }) {
  const chipLeft = seed % 2 === 0
  return (
    <g className={fresh ? 'bone-fall' : undefined}>
      <path
        d="M-16 -2.6 L 14 -2.2 L 16.5 -0.8 L 15 2.4 L -13 2.9 L -16.5 1.2 Z"
        fill="url(#relic-shade)"
        stroke="#1a1c1e"
        strokeWidth=".5"
      />
      <circle
        cx="-16"
        cy="-2.6"
        r="3.4"
        fill="url(#relic-shade)"
        stroke="#1a1c1e"
        strokeWidth=".5"
      />
      <circle
        cx="-15.5"
        cy="2.6"
        r="3"
        fill="url(#relic-shade)"
        stroke="#1a1c1e"
        strokeWidth=".5"
      />
      <circle
        cx="16"
        cy="-2.4"
        r="3.1"
        fill="url(#relic-shade)"
        stroke="#1a1c1e"
        strokeWidth=".5"
      />
      <circle
        cx="15.5"
        cy="2.6"
        r="3.4"
        fill="url(#relic-shade)"
        stroke="#1a1c1e"
        strokeWidth=".5"
      />
      {/* chip */}
      <path
        d={chipLeft ? 'M-12 -2.6 l2.2 1.8 1.6-1.8z' : 'M9 2.9 l2-1.9 1.8 1.9z'}
        fill="#0f1012"
      />
      {/* fracture */}
      <path
        d={seed % 3 === 0 ? 'M-4 -2.4 l1.5 2 -1 2.6' : 'M5 -2.4 l-1.2 1.8 1.4 2.8'}
        stroke="#1a1c1e"
        strokeWidth=".6"
        fill="none"
      />
      <path d="M-11 -0.6 L 11 -0.3" stroke="#6f6b64" strokeWidth=".8" opacity=".5" />
    </g>
  )
}

export function OssuaryDefs() {
  return (
    <defs>
      <linearGradient id="ossuary-stone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2c3035" />
        <stop offset=".5" stopColor="#1a1c1e" />
        <stop offset="1" stopColor="#0f1012" />
      </linearGradient>
      <linearGradient id="ossuary-depth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0d0e10" />
        <stop offset="1" stopColor="#181a1c" />
      </linearGradient>
      <linearGradient id="relic-shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d8d3c6" />
        <stop offset=".55" stopColor="#a9a49a" />
        <stop offset="1" stopColor="#5e584e" />
      </linearGradient>
      <filter id="ghoul-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="2.5"
          floodColor="var(--t-glow)"
          floodOpacity=".55"
        />
      </filter>
    </defs>
  )
}

/** Back half of the ossuary (drawn behind the bones). */
export function OssuaryBack() {
  return (
    <g>
      {/* floor shadow */}
      <ellipse cx="50" cy="114" rx="46" ry="4" fill="#000" opacity=".6" />
      {/* outer sarcophagus frame */}
      <polygon
        points="50,5 85,25 85,95 50,115 15,95 15,25"
        fill="url(#ossuary-stone)"
        stroke="#4a525a"
        strokeWidth="2.5"
        strokeLinejoin="miter"
      />
      {/* chiseled inner bevel */}
      <polygon
        points="50,11 79,27.5 79,92.5 50,109 21,92.5 21,27.5"
        fill="none"
        stroke="#111215"
        strokeWidth="1.2"
      />
      {/* recessed chamber */}
      <polygon
        points="50,15 75,30 75,90 50,105 25,90 25,30"
        fill="url(#ossuary-depth)"
        stroke="#22252a"
        strokeWidth="1.8"
      />
      <polygon
        points="50,15 75,30 75,90 50,105 25,90 25,30"
        fill="none"
        stroke="var(--t-glow)"
        strokeWidth=".6"
        opacity=".25"
      />
    </g>
  )
}

/** Front details of the ossuary (drawn over the bones). */
export function OssuaryFront() {
  return (
    <g>
      {/* gnarly cracks */}
      <path
        d="M15 25 L27.5 32.5 L24 40"
        stroke="#111215"
        strokeWidth="1.2"
        fill="none"
        opacity=".7"
      />
      <path
        d="M85 70 L70 75 L72.5 85 L65 87.5"
        stroke="#111215"
        strokeWidth=".9"
        fill="none"
        opacity=".8"
      />
      <path
        d="M50 115 L50 107.5 L57.5 102.5"
        stroke="#111215"
        strokeWidth="1.2"
        fill="none"
        opacity=".6"
      />
      {/* rivets / spikes */}
      <polygon points="50,2.5 52.5,6 47.5,6" fill="#4a525a" />
      <polygon points="15,25 11.5,26.5 16,29" fill="#4a525a" />
      <polygon points="85,25 88.5,26.5 84,29" fill="#4a525a" />
      <polygon points="15,95 11.5,93.5 16,91" fill="#4a525a" />
      <polygon points="85,95 88.5,93.5 84,91" fill="#4a525a" />
    </g>
  )
}
