const Metric = ({ label, value, unit, accent = false }) => (
  <div className="interactive-card min-w-0 px-3 first:pl-0 last:pr-0">
    <span className="block min-h-7 font-mono text-[9px] uppercase leading-3 tracking-[0.1em] text-mute">
      {label}
    </span>
    <strong
      className={`block truncate font-display text-[32px] font-semibold leading-none tabular-nums ${
        accent ? 'text-fire' : 'text-bone'
      }`}
    >
      {value}
    </strong>
    <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-mute">
      {unit}
    </span>
  </div>
)

export default function MetricsGrid({
  archiveDetections,
  averageFrp,
  peakMonth,
}) {
  return (
    <div className="mt-4 grid grid-cols-3 divide-x divide-line border border-line px-3 py-4">
      <Metric
        label="Archive detections"
        value={archiveDetections}
        unit="detections"
      />
      <Metric
        label="Avg FRP"
        value={averageFrp.toFixed(1)}
        unit="MW"
        accent
      />
      <Metric
        label="Peak month"
        value={peakMonth.slice(0, 3)}
        unit={peakMonth}
      />
    </div>
  )
}
