import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'wood' | 'parchment' | 'danger' | 'ghost'

const styles: Record<Variant, string> = {
  primary: 'etched plaque-press font-display glow-red uppercase tracking-widest',
  wood: 'etched etched-quiet plaque-press font-display engraved uppercase tracking-widest text-sm',
  parchment: 'etched plaque-press font-display glow-red uppercase tracking-widest',
  danger: 'etched plaque-press font-display glow-red uppercase tracking-widest',
  ghost:
    'font-display text-ivory-2 uppercase tracking-widest text-sm underline-offset-4 hover:underline',
}

export function Button({
  variant = 'wood',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`min-h-12 px-4 py-2 text-base font-bold disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{props.children}</span>
    </button>
  )
}
