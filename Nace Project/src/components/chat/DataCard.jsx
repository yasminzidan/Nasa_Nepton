import { ArrowRight } from 'lucide-react';

export default function DataCard({ hotspot, onFlyToHotspot }) {
  if (!hotspot) return null;

  const rows = [
    { label: 'FRP', value: hotspot.frp || '—', valueClass: 'text-alert' },
    { label: 'Confidence', value: hotspot.confidence || '—', valueClass: 'text-bone' },
    { label: 'Sensor', value: hotspot.sensor || '—', valueClass: 'text-bone' },
  ];

  return (
    <div className="mt-2.5 border border-line-strong bg-surface p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="lb text-fire">Top Cluster</span>
        <span className="lb text-bone">{hotspot.id || 'HOTSPOT'}</span>
      </div>

      <div className="mt-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-dotted border-line-soft py-1.5 last:border-b-0">
            <span className="lb text-dim">{row.label}</span>
            <span className={`font-mono text-[11px] ${row.valueClass}`}>{row.value}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onFlyToHotspot && onFlyToHotspot(hotspot)}
        className="mt-3 flex h-[30px] w-full items-center justify-center gap-2 bg-bone px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-void transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-bone focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span>Fly to hotspot</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
}
