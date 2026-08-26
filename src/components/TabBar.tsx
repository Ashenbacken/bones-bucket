export type Tab = 'bucket' | 'report' | 'settings'

const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  {
    id: 'bucket',
    label: 'Bucket',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M4 8h16l-1.5 12h-13z" />
        <path d="M4 8c0-3 16-3 16 0" />
        <path d="M9 4l1 4M15 4l-1 4" />
      </svg>
    ),
  },
  {
    id: 'report',
    label: 'Report',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
      </svg>
    ),
  },
]

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav aria-label="Main" className="etched etched-quiet mx-auto flex w-full items-stretch p-1.5">
      {TABS.map((t) => {
        const active = t.id === tab
        return (
          <button
            key={t.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(t.id)}
            className={`font-display relative z-10 flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-colors ${
              active ? 'glow-red bg-black/40' : 'text-ivory-2'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}
