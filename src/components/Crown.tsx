/** Mark of the Bone King: an iron skull with burning eyes. */
export function Crown({ className, animate }: { className?: string; animate?: boolean }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={`${className ?? ''} ${animate ? 'shimmer' : ''}`}
      role="img"
      aria-label="Bone King"
    >
      <defs>
        <radialGradient id="king-iron" cx=".4" cy=".3" r=".8">
          <stop offset="0" stopColor="#c5cad1" />
          <stop offset=".6" stopColor="#5b6068" />
          <stop offset="1" stopColor="#1c1f24" />
        </radialGradient>
      </defs>
      <path d="M4 4l6 6 4-4 6 4 6-4 4 4 6-6-2 14H6z" fill="#8a6a24" />
      <path d="M6 16h28l-2 4H8z" fill="#c9a24a" />
      <path
        d="M10 18a10 9 0 0 1 20 0v6a5 5 0 0 1-3 4v5H13v-5a5 5 0 0 1-3-4z"
        fill="url(#king-iron)"
      />
      <ellipse cx="15.5" cy="21" rx="3" ry="3.4" fill="#0a0b0d" />
      <ellipse cx="24.5" cy="21" rx="3" ry="3.4" fill="#0a0b0d" />
      <circle
        cx="15.5"
        cy="21"
        r="1.4"
        fill="#ff3a3a"
        style={{ filter: 'drop-shadow(0 0 3px #ff2b2b)' }}
      />
      <circle
        cx="24.5"
        cy="21"
        r="1.4"
        fill="#ff3a3a"
        style={{ filter: 'drop-shadow(0 0 3px #ff2b2b)' }}
      />
      <path d="M20 24l-1.5 3h3z" fill="#0a0b0d" />
      <path d="M14 29h12v4H14z" fill="#9aa0a8" />
      <path d="M17 29v4M20 29v4M23 29v4" stroke="#1c1f24" strokeWidth="1" />
    </svg>
  )
}
