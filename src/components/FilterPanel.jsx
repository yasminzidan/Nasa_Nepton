const ACQUISITIONS = [
  { value: 'D', label: 'Day' },
  { value: 'N', label: 'Night' },
  { value: 'ALL', label: 'Both' },
]

const CONFIDENCE_LEVELS = [
  { value: 'low', label: 'Low', threshold: 0 },
  { value: 'mid', label: 'Mid', threshold: 50 },
  { value: 'high', label: 'High', threshold: 80 },
]

export default function FilterPanel({
  dayNight,
  onDayNightChange,
  confidenceLevel,
  onConfidenceLevelChange,
  detectionCount,
}) {
  return (
    <div className="mt-5">
      <fieldset className="mt-6 border-0 p-0">
        <legend className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
          Acquisition
        </legend>
        <div className="flex">
          {ACQUISITIONS.map(({ value, label }, index) => {
            const active = dayNight === value
            return (
              <button
                aria-pressed={active}
                className={`interactive-surface -ml-px min-h-11 flex-1 border border-[#2c3037] font-mono text-[10px] uppercase tracking-[0.14em] first:ml-0 focus-visible:z-10 ${
                  active
                    ? 'z-[1] border-data bg-data/10 text-data'
                    : 'text-mute'
                }`}
                key={value}
                onClick={() => onDayNightChange(value)}
                type="button"
                style={index === 0 ? { marginLeft: 0 } : undefined}
              >
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-0 border-t border-line p-0 pt-4">
        <legend className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
          Min confidence
        </legend>
        <div className="flex">
          {CONFIDENCE_LEVELS.map(({ value, label, threshold }, index) => {
            const active = confidenceLevel === value
            return (
              <button
                aria-label={`${label} confidence, minimum ${threshold}%`}
                aria-pressed={active}
                className={`interactive-surface -ml-px min-h-11 flex-1 border border-[#2c3037] font-mono text-[10px] uppercase tracking-[0.14em] first:ml-0 focus-visible:z-10 ${
                  active
                    ? 'z-[1] border-fire bg-fire/10 text-fire'
                    : 'text-mute'
                }`}
                key={value}
                onClick={() => onConfidenceLevelChange(value)}
                type="button"
                style={index === 0 ? { marginLeft: 0 } : undefined}
              >
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-mute">
        <span
          className="h-[6px] w-[6px] bg-bone"
          aria-hidden="true"
        />
        {detectionCount} detections
      </div>
    </div>
  )
}
