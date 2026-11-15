import { useState } from 'react'
import './BurningCalendar.css'

const MONTHS = [
  { key: 'Jan', full: 'January' },
  { key: 'Feb', full: 'February' },
  { key: 'Mar', full: 'March' },
  { key: 'Apr', full: 'April' },
  { key: 'May', full: 'May' },
  { key: 'Jun', full: 'June' },
  { key: 'Jul', full: 'July' },
  { key: 'Aug', full: 'August' },
  { key: 'Sep', full: 'September' },
  { key: 'Oct', full: 'October' },
  { key: 'Nov', full: 'November' },
  { key: 'Dec', full: 'December' },
]

const getIntensity = (source, key, fallbackKey) => {
  const raw = source?.[key] ?? source?.[fallbackKey] ?? 0
  const value =
    typeof raw === 'object' && raw !== null ? Number(raw.intensity) : Number(raw)

  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
}

const getHeatLevel = (intensity) => {
  if (intensity <= 20) return 'low'
  if (intensity <= 40) return 'mild'
  if (intensity <= 60) return 'moderate'
  if (intensity <= 80) return 'high'
  return 'extreme'
}

export default function BurningCalendar({
  monthlyData = {},
  yearlyData = {},
  peakRiskMonths = [],
  region = 'Amazon',
  initialView = 'months',
  dataLabel = 'Mock fire detections',
  onFilterChange = () => {},
}) {
  const [view, setView] = useState(initialView)
  const [selected, setSelected] = useState(null)

  const peakMonthNames = peakRiskMonths.map((month) =>
    String(month).toLowerCase(),
  )

  const periods =
    view === 'months'
      ? MONTHS.map((month) => ({
          key: month.key,
          label: month.key,
          full: month.full,
          intensity: getIntensity(monthlyData, month.key, month.full),
          peak:
            peakMonthNames.includes(month.key.toLowerCase()) ||
            peakMonthNames.includes(month.full.toLowerCase()),
        }))
      : Object.keys(yearlyData)
          .sort((a, b) => Number(a) - Number(b))
          .map((year) => ({
            key: year,
            label: year,
            full: year,
            intensity: getIntensity(yearlyData, year),
            peak: false,
          }))

  const handleSelect = (type, value, label, intensity) => {
    const filter = { type, value, label, intensity }
    setSelected(filter)
    onFilterChange(filter)
  }

  const handleClear = () => {
    setSelected(null)
    onFilterChange(null)
  }

  return (
    <section className="burning-calendar" aria-label="Burning activity calendar">
      <header className="burning-calendar__header">
        <div>
          <div className="burning-calendar__eyebrow">
            <span className="burning-calendar__live-dot" />
            Fire analytics
          </div>
          <h1 className="burning-calendar__title">Burning activity</h1>
          <p className="burning-calendar__subtitle">
            Historical fire intensity across {region}
          </p>
        </div>

        <div className="burning-calendar__switcher" aria-label="Calendar view">
          {[
            { id: 'months', label: 'Monthly' },
            { id: 'years', label: 'Yearly' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`burning-calendar__switch ${
                view === item.id ? 'is-active' : ''
              }`}
              aria-pressed={view === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {view === 'months' && (
        <div className="burning-calendar__peak">
          <span className="burning-calendar__flame" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3c2 4-1 5-1 8 0 1.5 1 2.5 2.5 2.5S16 12 16 10c3 3 4 5 3 8-1 3-4 4-7 4s-6-2-7-5c-1-4 2-7 4-9-.5 2 .5 3 2 3 2-3 1-5 1-8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="burning-calendar__peak-label">Peak risk</span>
          {peakRiskMonths.map((month) => (
            <span className="burning-calendar__peak-month" key={month}>
              {month}
            </span>
          ))}
        </div>
      )}

      <div
        className={`burning-calendar__grid ${
          view === 'months'
            ? 'burning-calendar__grid--months'
            : 'burning-calendar__grid--years'
        }`}
      >
        {periods.map((period) => {
          const periodType = view === 'months' ? 'month' : 'year'
          const isSelected =
            selected?.type === periodType && selected?.value === period.key

          return (
            <button
              key={period.key}
              type="button"
              title={`${period.full}: ${period.intensity}/100 intensity${
                period.peak ? ` — Peak risk period in ${region}` : ''
              }`}
              aria-label={`${period.full}, fire intensity ${period.intensity} out of 100${
                period.peak ? ', peak risk month' : ''
              }`}
              aria-pressed={isSelected}
              onClick={() =>
                handleSelect(
                  periodType,
                  period.key,
                  period.full,
                  period.intensity,
                )
              }
              className={`burning-calendar__period burning-calendar__period--${getHeatLevel(
                period.intensity,
              )} ${period.peak ? 'is-peak' : ''} ${
                isSelected ? 'is-selected' : ''
              }`}
            >
              <span className="burning-calendar__period-top">
                <span className="burning-calendar__period-label">
                  {period.label}
                </span>
                {period.peak && (
                  <span
                    className="burning-calendar__peak-dot"
                    aria-label="Peak risk"
                  />
                )}
              </span>

              <span className="burning-calendar__intensity">
                <span>{period.intensity}</span>
                <span className="burning-calendar__out-of">/ 100</span>
              </span>
              <span className="burning-calendar__meter" aria-hidden="true">
                <span style={{ width: `${period.intensity}%` }} />
              </span>
              {period.peak && (
                <span className="burning-calendar__peak-tag">Peak</span>
              )}
            </button>
          )
        })}
      </div>

      <footer className="burning-calendar__footer">
        <div className="burning-calendar__legend">
          <p className="burning-calendar__legend-title">Fire intensity</p>
          <div className="burning-calendar__legend-scale">
            <span>Low</span>
            <i className="level-low" />
            <i className="level-mild" />
            <i className="level-moderate" />
            <i className="level-high" />
            <i className="level-extreme" />
            <span>High</span>
          </div>
        </div>

        <div className="burning-calendar__active-filter">
          <div>
            <p className="burning-calendar__legend-title">Active filter</p>
            <p className="burning-calendar__filter-value">
              {selected
                ? `${selected.label} · ${selected.intensity}/100`
                : 'All periods'}
            </p>
          </div>
          {selected && (
            <button
              type="button"
              onClick={handleClear}
              className="burning-calendar__clear"
            >
              Clear
            </button>
          )}
        </div>
      </footer>

      <p className="burning-calendar__note">
        {dataLabel} · Select a period to filter fires on the globe.
      </p>
    </section>
  )
}
