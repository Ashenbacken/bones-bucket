import type { HTMLAttributes } from 'react'

/** Grey stone panel with pewter rim and spiked corners. */
export function Panel({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`plaque spiked ${className}`} {...props}>
      <span className="spike tl" />
      <span className="spike tr" />
      <span className="spike bl" />
      <span className="spike br" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
