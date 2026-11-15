import { useMemo } from 'react'
import SectionHeader from './SectionHeader.jsx'

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export default function FireChart({ countryData = [], countryName = 'Country' }) {
  const monthly = useMemo(() => {
    const totals = Array.from({ length: 12 }, () => 0)
    countryData.forEach((fire) => {
      const month = Number(fire.acq_date?.slice(5, 7))
      const frp = Number(fire.frp)
      if (month >= 1 && month <= 12 && Number.isFinite(frp)) {
        totals[month - 1] += frp
      }
    })
    const peak = Math.max(...totals)
    const peakIndex = totals.indexOf(peak)
    const mean = totals.reduce((sum, value) => sum + value, 0) / totals.length
    return { totals, peak, peakIndex, mean }
  }, [countryData])

  const maximum = Math.max(monthly.peak, 1)
  const meanPercent = (monthly.mean / maximum) * 100

  return (
    <section className="mt-6" aria-label={`${countryName} fire trends`}>
      <SectionHeader num="02" title="Trend" />
      <div className="mt-3 border border-line p-3">
        <div className="relative h-[112px]" aria-label="Monthly FRP histogram">
          {[25, 50, 75].map((tick) => (
            <div
              className="pointer-events-none absolute right-0 left-0 border-t border-[#1a1d22]"
              key={tick}
              style={{ bottom: `${tick}%` }}
            />
          ))}
          {monthly.peak > 0 && (
            <div
              className="pointer-events-none absolute right-0 left-0 z-[1] border-t border-dashed border-data/80"
              style={{ bottom: `${meanPercent}%` }}
              aria-label={`Monthly mean: ${monthly.mean.toFixed(1)} MW`}
            />
          )}
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {monthly.totals.map((value, index) => (
              <div
                className="flex h-full min-w-0 flex-1 items-end justify-center"
                key={`${MONTHS[index]}-${index}`}
                title={`${MONTHS[index]}: ${value.toFixed(1)} MW`}
              >
                <span
                  className={`relative z-[2] block w-full max-w-[13px] ${
                    index === monthly.peakIndex && monthly.peak > 0
                      ? 'bg-fire'
                      : 'bg-[#5b6370]'
                  }`}
                  style={{
                    height: `${value ? Math.max((value / maximum) * 100, 2) : 0}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-12 gap-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
          {MONTHS.map((month, index) => (
            <span
              className={
                index === monthly.peakIndex && monthly.peak > 0
                  ? 'text-fire'
                  : ''
              }
              key={`${month}-${index}`}
            >
              {month}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-mute">
        <span className="flex items-center gap-2">
          <i
            className="h-[5px] w-12"
            style={{
              background:
                'linear-gradient(90deg, #7a3a1c 0%, #FF5A1F 65%, #FF3B30 100%)',
            }}
          />
          LOW—HIGH
        </span>
        <span className="flex items-center gap-2">
          <i className="w-6 border-t border-dashed border-data/80" />
          MONTHLY MEAN
        </span>
      </div>
    </section>
  )
}
