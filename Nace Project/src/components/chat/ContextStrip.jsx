export default function ContextStrip({ context = {} }) {
  const chips = [
    context.country || 'Global',
    `CONF ≥ ${context.minConfidence || 65}%`,
    context.dayNight || 'Day/Night',
    context.activeYear || context.yearRange || '2006–2026',
  ];

  if (Number.isFinite(context.activeFireCount)) {
    chips.push(`FIRES ${context.activeFireCount}`);
  }

  if (context.selectedHotspot) {
    chips.push(`HOTSPOT ${context.selectedHotspot}`);
  }

  return (
    <div className="flex items-center gap-2 border-b border-line px-4 py-[9px] overflow-hidden">
      <span className="lb shrink-0 text-fire">Context</span>
      <div className="flex min-w-0 gap-2 overflow-hidden">
        {chips.map((chip) => (
          <span
            key={chip}
            className="shrink-0 border border-line-soft px-[7px] py-[3px] font-mono text-[9px] uppercase tracking-[0.06em] text-bone"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
