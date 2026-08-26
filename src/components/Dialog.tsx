import { useEffect, type ReactNode } from 'react'
import { CrestSigil } from './Ornaments'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Dialog({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="plaque spiked phone-column toast-in w-full max-h-[88dvh] overflow-y-auto p-4 pt-6"
        style={{ paddingBottom: 'calc(1rem + var(--sab))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="spike tl" />
        <span className="spike tr" />
        <span className="spike bl" />
        <span className="spike br" />
        <CrestSigil className="absolute -top-4 left-1/2 z-20 h-9 w-11 -translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="font-display glow-red mb-3 text-center text-lg uppercase tracking-widest">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  )
}
