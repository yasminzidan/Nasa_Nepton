import { useEffect, useState } from 'react'

const formatUtc = () =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())

export default function Header({ dataMode = 'archive' }) {
  const [utcTime, setUtcTime] = useState(formatUtc)

  useEffect(() => {
    const timer = window.setInterval(() => setUtcTime(formatUtc()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <header className="relative z-30 grid h-12 grid-cols-[1fr_auto_1fr] border-b border-line bg-void/90 text-bone max-lg:grid-cols-[1fr_auto]">
      <div className="flex min-w-0 items-center gap-3 border-r border-line px-4 max-sm:px-2">
        <svg
          aria-hidden="true"
          className="h-7 w-7 shrink-0 text-bone"
          viewBox="0 0 32 32"
          fill="none"
        >
          <circle cx="16" cy="16" r="10" stroke="currentColor" />
          <ellipse
            cx="16"
            cy="16"
            rx="14"
            ry="5"
            transform="rotate(-32 16 16)"
            stroke="currentColor"
          />
          <rect x="22" y="6" width="3" height="3" fill="#FF5A1F" />
        </svg>
        <span className="whitespace-nowrap font-display text-[22px] font-semibold tracking-[0.34em] max-sm:text-[18px] max-sm:tracking-[0.28em]">
          NEPTON
        </span>
        <span className="h-6 w-px shrink-0 bg-line-strong max-md:hidden" />
        <span className="flex items-center gap-2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.12em] text-mute max-md:hidden">
          <i className="h-[6px] w-[6px] animate-pulse bg-fire" aria-hidden="true" />
          NASA SPACE APPS 2026
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 border-r border-line px-4 max-sm:gap-1 max-sm:px-2">
        <span className="instrument-label max-sm:hidden">Region</span>
        <span className="font-mono text-[11px] uppercase tracking-wide text-bone">
          Brazil
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-3 px-4 font-mono text-[9px] uppercase tracking-[0.12em] text-mute max-lg:hidden">
        <span>{dataMode === 'live' ? 'MODIS + VIIRS Live' : 'MODIS + VIIRS Archive'}</span>
        <span className="border border-line-strong px-2 py-1 text-bone">
          {dataMode === 'live' ? '48H WINDOW' : '2006—2026'}
        </span>
        <span className="border-l border-line pl-3 tabular-nums text-bone">
          {utcTime} UTC
        </span>
      </div>
    </header>
  )
}
