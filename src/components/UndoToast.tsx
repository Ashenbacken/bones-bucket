import { useEffect } from 'react'

const TTL = 5000

interface Props {
  message: string
  /** Changes whenever a new toast should start; restarts the timer and the bar. */
  stamp: number
  onUndo: () => void
  onExpire: () => void
}

export function UndoToast({ message, stamp, onUndo, onExpire }: Props) {
  useEffect(() => {
    const t = setTimeout(onExpire, TTL)
    return () => clearTimeout(t)
  }, [stamp, onExpire])

  return (
    <div
      key={stamp}
      role="status"
      className="etched etched-quiet toast-in relative mx-auto flex w-full max-w-sm items-center gap-3 overflow-hidden py-2 pr-2 pl-4"
    >
      <span className="engraved flex-1 truncate font-semibold">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="font-display glow-red min-h-10 px-4 text-sm font-bold uppercase tracking-widest active:scale-95"
      >
        Undo
      </button>
      <span
        aria-hidden
        className="drain absolute inset-x-1 bottom-1 h-1 origin-left rounded-sm bg-blood-2"
        style={{ animationDuration: `${TTL}ms`, boxShadow: '0 0 6px #ff2b2b' }}
      />
    </div>
  )
}
