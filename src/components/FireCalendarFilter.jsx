import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { dateKeyDistance, getFireDateKey, shiftDateKey } from '../utils/fireDates.js'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const RISK_COLORS = ['#1e293b', '#06b6d4', '#eab308', '#f97316', '#ef4444']
const formatMonthName = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  })
}

const formatDate = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function FireCalendarFilter({
  fires = [],
  months = [],
  monthsLoading = false,
  monthsError = null,
  selectedMonth = null,
  onMonthChange,
  selectedDateRange = null,
  onDateRangeChange,
}) {
  const { dailyActivity, monthCounts, maxDailyActivity } = useMemo(() => {
    const activity = new Map()
    const activeDaysByMonth = new Map()

    fires.forEach((fire) => {
      const dateKey = getFireDateKey(fire.acq_date)
      if (!dateKey) return

      const monthKey = dateKey.slice(0, 7)
      activeDaysByMonth.set(
        monthKey,
        (activeDaysByMonth.get(monthKey) ?? 0) + 1,
      )

      const day = activity.get(dateKey) ?? { count: 0, frp: 0 }
      const frp = Number(fire.frp)
      day.count += 1
      if (Number.isFinite(frp) && frp > 0) day.frp += frp
      activity.set(dateKey, day)
    })

    let maxActivity = 0
    activity.forEach((day) => {
      maxActivity = Math.max(maxActivity, day.frp > 0 ? day.frp : day.count)
    })

    return {
      dailyActivity: activity,
      monthCounts: activeDaysByMonth,
      maxDailyActivity: maxActivity,
    }
  }, [fires])

  const [rangeAnchor, setRangeAnchor] = useState(null)
  const activeRangeAnchor = rangeAnchor?.fires === fires
    ? rangeAnchor.dateKey
    : null
  const visibleMonth = selectedMonth ?? months[months.length - 1]?.month ?? null
  const selectedMonthIndex = months.findIndex((item) => item.month === visibleMonth)
  const monthDetails = months[selectedMonthIndex]
  const monthKey = visibleMonth ?? ''
  const [, monthValue] = monthKey.split('-').map(Number)
  const [year] = monthKey.split('-').map(Number)
  const daysInMonth = visibleMonth ? new Date(year, monthValue, 0).getDate() : 0
  const firstWeekday = visibleMonth
    ? (new Date(year, monthValue - 1, 1).getDay() + 6) % 7
    : 0
  const calendarCells = visibleMonth
    ? [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
      ]
    : []

  const selectDate = (dateKey) => {
    if (!activeRangeAnchor) {
      setRangeAnchor({ dateKey, fires })
      onDateRangeChange({ start: dateKey, end: dateKey })
      return
    }

    const distance = dateKeyDistance(activeRangeAnchor, dateKey)
    const cappedDate = Math.abs(distance) > 6
      ? shiftDateKey(activeRangeAnchor, Math.sign(distance) * 6)
      : dateKey
    onDateRangeChange({
      start: activeRangeAnchor < cappedDate ? activeRangeAnchor : cappedDate,
      end: activeRangeAnchor < cappedDate ? cappedDate : activeRangeAnchor,
    })
    setRangeAnchor(null)
  }

  const shiftMonth = (amount) => {
    const nextMonth = months[selectedMonthIndex + amount]
    if (nextMonth) {
      setRangeAnchor(null)
      onDateRangeChange(null)
      onMonthChange(nextMonth.month)
    }
  }

  const selectMonth = (month) => {
    if (month && month !== visibleMonth) {
      setRangeAnchor(null)
      onDateRangeChange(null)
      onMonthChange(month)
    }
  }

  return (
    <section aria-label="Daily fire activity calendar" className="mt-5 border-t border-line pt-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-[12px] uppercase tracking-[0.14em] text-bone">
            Fire calendar
          </h3>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-mute">
            Select a date range · max 7 days
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous month"
            className="interactive-surface grid h-11 w-11 place-items-center border border-line text-mute hover:text-bone disabled:cursor-not-allowed disabled:opacity-40"
            disabled={selectedMonthIndex <= 0}
            onClick={() => shiftMonth(-1)}
            type="button"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <button
            aria-label="Next month"
            className="interactive-surface grid h-11 w-11 place-items-center border border-line text-mute hover:text-bone disabled:cursor-not-allowed disabled:opacity-40"
            disabled={selectedMonthIndex < 0 || selectedMonthIndex >= months.length - 1}
            onClick={() => shiftMonth(1)}
            type="button"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h4 aria-live="polite" className="flex items-center gap-2 font-mono text-[11px] font-medium text-bone">
          <span>{visibleMonth ? formatMonthName(visibleMonth) : 'Archive months'}</span>
          <select
            aria-label="Select archive month"
            className="interactive-surface min-h-11 border border-line bg-panel px-2 font-mono text-[11px] text-bone"
            disabled={monthsLoading || months.length === 0}
            onChange={(event) => selectMonth(event.target.value)}
            value={visibleMonth ?? ''}
          >
            {!visibleMonth && <option value="">Select a month</option>}
            {months.map(({ month }) => (
              <option className="bg-void text-bone" key={month} value={month}>
                {formatMonthName(month)}
              </option>
            ))}
          </select>
        </h4>
        <span className="font-mono text-[9px] text-mute">
          {monthDetails
            ? `${monthDetails.count.toLocaleString()} fires`
            : visibleMonth && monthCounts.has(visibleMonth)
              ? `${monthCounts.get(visibleMonth)} active days`
              : 'No detections'}
        </span>
      </div>

      {monthsLoading && (
        <p className="mb-2 font-mono text-[9px] text-data" role="status">
          Loading archive months…
        </p>
      )}
      {monthsError && (
        <p className="mb-2 font-mono text-[9px] leading-4 text-alert" role="alert">
          Could not load archive months. {monthsError.message}
        </p>
      )}
      {!monthsLoading && !monthsError && months.length === 0 && (
        <p className="mb-2 font-mono text-[9px] text-mute">
          No archived fire months are available.
        </p>
      )}

      <div
        className="grid grid-cols-7 gap-1"
        role="group"
        aria-label={visibleMonth ? formatMonthName(visibleMonth) : 'Archive dates'}
      >
        {WEEKDAYS.map((weekday) => (
          <span
            aria-hidden="true"
            className="pb-1 text-center font-mono text-[8px] uppercase text-mute"
            key={weekday}
          >
            {weekday}
          </span>
        ))}
        {calendarCells.map((day, index) => {
          if (day === null) {
            return <span aria-hidden="true" className="h-7" key={`empty-${index}`} />
          }

          const dateKey = `${visibleMonth}-${String(day).padStart(2, '0')}`
          const activity = dailyActivity.get(dateKey)
          const value = activity
            ? activity.frp > 0
              ? activity.frp
              : activity.count
            : 0
          const tier =
            value === 0 || maxDailyActivity === 0
              ? 0
              : Math.min(4, Math.ceil((value / maxDailyActivity) * 4))
          const isInRange = selectedDateRange &&
            dateKey >= selectedDateRange.start &&
            dateKey <= selectedDateRange.end
          const isRangeEndpoint = selectedDateRange &&
            (dateKey === selectedDateRange.start || dateKey === selectedDateRange.end)
          const title = activity
            ? `${dateKey} · ${activity.count} hotspot${activity.count === 1 ? '' : 's'} · ${activity.frp.toFixed(1)} MW FRP · Risk level ${tier}`
            : `${dateKey} · No detected fires`

          return (
            <button
              aria-label={title}
              aria-pressed={Boolean(isInRange)}
              className={`interactive-surface grid h-11 min-w-0 place-items-center border font-mono text-[10px] tabular-nums ${
                isRangeEndpoint
                  ? 'border-cyan-200 shadow-[0_0_0_1px_#67e8f9,0_0_12px_rgb(6_182_212/35%)]'
                  : isInRange
                    ? 'border-cyan-200/50'
                    : 'border-white/5 hover:border-white/40'
              } ${tier === 0 ? 'text-white' : 'text-void'}`}
              key={dateKey}
              onClick={() => selectDate(dateKey)}
              style={{ backgroundColor: RISK_COLORS[tier] }}
              title={title}
              type="button"
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div aria-label="Fire intensity levels from none to critical" className="flex items-center gap-1">
          {RISK_COLORS.map((color, tier) => (
            <span
              aria-label={`Risk level ${tier}`}
              className="h-2.5 w-2.5 border border-white/10"
              key={color}
              style={{ backgroundColor: color }}
              title={`Level ${tier}`}
            />
          ))}
          <span className="ml-1 font-mono text-[8px] uppercase text-mute">Intensity</span>
        </div>
      </div>

      <div className="mt-3 flex min-h-8 items-center justify-between gap-2 border-t border-line pt-2">
        <p aria-live="polite" className="min-w-0 truncate font-mono text-[9px] text-mute">
          {activeRangeAnchor
            ? `Start · ${formatDate(activeRangeAnchor)} · select end`
            : selectedDateRange
              ? `Filtered · ${formatDate(selectedDateRange.start)} – ${formatDate(selectedDateRange.end)}`
              : 'No dates available'}
        </p>
        {selectedDateRange && (
          <button
            className="interactive-surface flex min-h-11 shrink-0 items-center gap-1 border border-line px-2 font-mono text-[8px] uppercase tracking-[0.08em] text-cyan-200 hover:text-bone"
            onClick={() => {
              setRangeAnchor(null)
              onDateRangeChange(null)
            }}
            type="button"
          >
            <RotateCcw size={10} aria-hidden="true" />
            Latest
          </button>
        )}
      </div>
    </section>
  )
}
