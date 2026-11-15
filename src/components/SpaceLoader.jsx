import { useEffect, useState } from 'react'

export default function SpaceLoader({
  dataReady,
  globeReady,
  isReady,
  onReveal,
}) {
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    if (!isReady) return
    onReveal()
  }, [isReady, onReveal])

  if (!isMounted) return null

  const progress = (dataReady ? 45 : 0) + (globeReady ? 45 : 0) + (isReady ? 10 : 0)
  const logs = [
    {
      text: globeReady
        ? 'CESIUM GLOBE RENDERED...'
        : 'RENDERING CESIUM GLOBE...',
      complete: globeReady,
      active: !globeReady,
    },
    {
      text: dataReady
        ? 'LOCAL MODIS & VIIRS SAMPLE ARCHIVE READY...'
        : 'LOADING LOCAL MODIS & VIIRS SAMPLE ARCHIVE...',
      complete: dataReady,
      active: !dataReady,
    },
    {
      text: isReady
        ? 'SYSTEM READY · NEPTON ONLINE'
        : 'CALIBRATING HOTSPOT VISUALIZATION...',
      complete: isReady,
      active: isReady,
    },
  ]

  return (
    <div
      aria-hidden={isReady}
      aria-label="Initializing NEPTON"
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#020308] text-bone transition-opacity duration-1000 ease-out ${
        isReady ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      onTransitionEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.propertyName === 'opacity' &&
          isReady
        ) {
          setIsMounted(false)
        }
      }}
      role="status"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.08) 1px, transparent 1px), radial-gradient(ellipse at 50% 42%, rgba(0,229,255,0.12), transparent 58%)',
          backgroundSize: '48px 48px, 48px 48px, 100% 100%',
          maskImage: 'radial-gradient(ellipse at center, #000 0%, transparent 76%)',
        }}
      />

      <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center px-6">
        <div className="relative mb-8 aspect-square w-[min(56vw,260px)]">
          <div className="radar-sweep absolute inset-[12%] rounded-full" />
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            fill="none"
            viewBox="0 0 240 240"
          >
            <defs>
              <radialGradient id="radar-core-glow">
                <stop stopColor="#00E5FF" stopOpacity=".28" />
                <stop offset="1" stopColor="#00E5FF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="104" stroke="#00E5FF" strokeOpacity=".2" />
            <circle cx="120" cy="120" r="82" stroke="#00E5FF" strokeDasharray="2 7" strokeOpacity=".32" />
            <circle cx="120" cy="120" r="58" stroke="#E8E4DA" strokeOpacity=".16" />
            <circle cx="120" cy="120" r="34" stroke="#00E5FF" strokeOpacity=".2" />
            <path d="M16 120h208M120 16v208M46.5 46.5l147 147M193.5 46.5l-147 147" stroke="#E8E4DA" strokeOpacity=".1" />
            <path d="M120 16v8M224 120h-8M120 224v-8M16 120h8" stroke="#00E5FF" strokeOpacity=".72" />
            <circle cx="120" cy="120" r="22" fill="url(#radar-core-glow)" />
            <g className="radar-orbit">
              <ellipse cx="120" cy="120" rx="96" ry="38" stroke="#00E5FF" strokeDasharray="3 8" strokeOpacity=".38" transform="rotate(-32 120 120)" />
              <path d="m118 18 5 5-5 5-5-5 5-5Z" fill="#00E5FF" />
              <circle cx="46" cy="164" r="2.5" fill="#FF5A1F" />
            </g>
            <circle className="radar-core" cx="120" cy="120" r="4" fill="#00E5FF" />
          </svg>
          <div className="absolute inset-[12%] rounded-full border border-cyan-300/10" />
        </div>

        <div className="mb-6 text-center">
          <p className="font-display text-[28px] font-semibold tracking-[0.38em] text-bone">
            NEPTON
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.26em] text-cyan-300/70">
            Wildfire observation system
          </p>
        </div>

        <div className="w-full border border-white/10 bg-[#080b12]/80 p-4">
          <div
            aria-label="System initialization progress"
            aria-valuemax="100"
            aria-valuemin="0"
            aria-valuenow={progress}
            className="mb-4 h-[2px] overflow-hidden bg-slate-800"
            role="progressbar"
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-cyan-300 to-[#e8e4da] transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div aria-live="polite" className="min-h-[54px] space-y-1">
            {logs.map(({ text, complete, active }) => (
              <p
                className={`truncate font-mono text-[9px] tracking-[0.08em] ${
                  active
                    ? 'text-cyan-200'
                    : complete
                      ? 'text-slate-500'
                      : 'text-slate-700'
                }`}
                key={text}
              >
                <span className="mr-2">{complete ? '✓' : active ? '›' : '·'}</span>
                {text}
              </p>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">
            <span>Boot sequence</span>
            <span className="tabular-nums text-cyan-200">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex justify-between font-mono text-[8px] uppercase tracking-[0.14em] text-slate-600">
        <span>Earth observation · 3D</span>
        <span>MODIS / VIIRS archive</span>
      </div>
    </div>
  )
}
