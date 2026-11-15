import { ArrowRight } from 'lucide-react'

const Row = ({ label, value, valueClassName = '' }) => (
  <div className="flex items-center justify-between gap-3 border-b border-dotted border-[#2c3037] py-[7px]">
    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
      {label}
    </span>
    <strong
      className={`text-right font-mono text-[11px] font-normal text-bone ${valueClassName}`}
    >
      {value}
    </strong>
  </div>
)

export default function HotspotInspector({ fire, onFlyTo }) {
  return (
    <div className="mt-4">
      {fire ? (
        <div className="inspector-reveal" key={fire.id}>
          <div className="space-y-0">
            <Row
              label="Coordinates"
              value={`${Number(fire.latitude).toFixed(3)}, ${Number(fire.longitude).toFixed(3)}`}
            />
            <Row
              label="Confidence"
              value={
                fire.confidence === null || fire.confidence === undefined
                  ? '—'
                  : Number.isFinite(Number(fire.confidence))
                  ? `${fire.confidence}%`
                  : fire.confidence
              }
            />
            <Row
              label="FRP"
              value={`${Number(fire.frp).toFixed(1)} MW`}
              valueClassName={
                Number(fire.frp) >= 100 ? 'text-alert' : 'text-fire'
              }
            />
            <Row label="Sensor" value={fire.sensor || fire.satellite} />
            <Row
              label="Acquired"
              value={`${fire.acq_date} ${fire.acq_time} UTC`}
            />
          </div>
          <button
            className="interactive-cta mt-4 flex min-h-11 w-full items-center justify-between border border-fire/50 bg-fire/10 px-3 font-mono text-[11px] tracking-[0.16em] text-fire hover:border-data hover:bg-[#0b2833] hover:text-[#a5f3fc] active:bg-[#062f39] active:text-[#cffafe]"
            onClick={() => onFlyTo(fire)}
            type="button"
          >
            FLY TO HOTSPOT
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <p className="border border-line px-3 py-4 font-mono text-[10px] uppercase leading-5 tracking-[0.08em] text-mute">
          Select a hotspot to inspect coordinates and
          acquisition details.
        </p>
      )}
    </div>
  )
}
