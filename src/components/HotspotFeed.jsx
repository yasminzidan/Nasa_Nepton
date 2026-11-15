import { useMemo } from 'react'

const coordinate = (value) => Number(value).toFixed(2)

export default function HotspotFeed({
  fires,
  selectedFire,
  onSelectFire,
  region,
  live = false,
  loading = false,
}) {
  const orderedFires = useMemo(
    () => [...fires].sort((a, b) => b.acq_date.localeCompare(a.acq_date)),
    [fires],
  )

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-fire">
        <span className="flex items-center gap-2">
          <i className="h-[6px] w-[6px] bg-fire" aria-hidden="true" />
          {live ? 'NASA FIRMS · LIVE' : 'Archive'}
        </span>
        <span className="text-mute">
          {orderedFires.length.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="feed-scroll max-h-[34vh] overflow-y-auto">
        {loading ? (
          <p className="py-4 font-mono text-[10px] text-mute" role="status">
            Loading fire points…
          </p>
        ) : orderedFires.length ? (
          orderedFires.map((fire, index) => {
            const isSelected = selectedFire?.id === fire.id
            const isHighestSeverity = Number(fire.frp) >= 100
            return (
              <button
                aria-pressed={isSelected}
                className={`interactive-surface grid min-h-11 w-full grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-2 border-b border-[#1a1d22] border-l-2 px-2 py-3 text-left active:scale-[0.99] focus-visible:z-10 ${
                  isSelected
                    ? 'border-l-fire bg-[#15171d]'
                    : 'border-l-line-strong'
                }`}
                key={fire.id}
                onClick={() => onSelectFire(fire)}
                type="button"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[11px] text-bone">
                    {fire.id} · {fire.region || region}
                  </span>
                  <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.08em] text-mute">
                    {coordinate(fire.latitude)}, {coordinate(fire.longitude)} ·{' '}
                    {fire.acq_date} {fire.acq_time} UTC
                  </span>
                </span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    isHighestSeverity ? 'text-alert' : 'text-fire'
                  }`}
                >
                  {Number(fire.frp).toFixed(1)}
                  <small className="ml-1 text-[9px] text-mute">MW</small>
                </span>
              </button>
            )
          })
        ) : (
          <p className="py-4 font-mono text-[10px] text-mute">
            No detections match these parameters.
          </p>
        )}
      </div>
    </div>
  )
}
