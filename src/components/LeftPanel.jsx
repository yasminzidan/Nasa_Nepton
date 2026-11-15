import SectionHeader from './SectionHeader.jsx'
import FilterPanel from './FilterPanel.jsx'
import FireChart from './FireChart.jsx'
import EcoMetricsCard from './EcoMetricsCard.jsx'
import FireCalendarFilter from './FireCalendarFilter.jsx'

export default function LeftPanel({
  animateIn = false,
  drawerOpen = false,
  onDrawerToggle,
  dayNight,
  onDayNightChange,
  confidenceLevel,
  onConfidenceLevelChange,
  detectionCount,
  countryData,
  calendarData,
  archiveMonths,
  archiveMonthsLoading,
  archiveMonthsError,
  selectedArchiveMonth,
  onArchiveMonthChange,
  selectedDateRange,
  onDateRangeChange,
  countryName,
}) {
  return (
    <aside
      className={`mission-panel mission-panel--left absolute left-5 top-[68px] bottom-5 z-20 w-[320px] ${
        animateIn ? 'panel-enter-left' : ''
      } ${
        drawerOpen ? 'mission-panel--open' : ''
      }`}
    >
      <div
        className="corner-brackets interactive-card h-full border border-line bg-panel p-5 max-lg:h-auto max-lg:p-4"
      >
        <button
          aria-expanded={drawerOpen}
          aria-controls="filters-panel-content"
          className="mission-panel-toggle interactive-surface mb-0 flex min-h-11 w-full items-center justify-between border-b border-line pb-3 text-left font-display text-[15px] uppercase tracking-[0.16em] text-bone xl:hidden"
          onClick={onDrawerToggle}
          type="button"
        >
          <span className="xl:hidden">Filters</span>
          <span className="hidden xl:inline">01 / Filters &amp; trend</span>
          <span className="font-mono text-[9px] text-mute">
            {drawerOpen ? 'CLOSE' : 'OPEN'}
          </span>
        </button>
        <div
          id="filters-panel-content"
          className={`panel-scroll h-full overflow-y-auto pr-1 pt-4 max-lg:max-h-[calc(100vh-130px)] xl:pt-0 ${
            drawerOpen ? 'block' : 'hidden'
          } xl:block`}
        >
          <SectionHeader num="01" title="Filters" />
          <FireCalendarFilter
            fires={calendarData}
            months={archiveMonths}
            monthsLoading={archiveMonthsLoading}
            monthsError={archiveMonthsError}
            selectedMonth={selectedArchiveMonth}
            onMonthChange={onArchiveMonthChange}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={onDateRangeChange}
          />
          <FilterPanel
            dayNight={dayNight}
            onDayNightChange={onDayNightChange}
            confidenceLevel={confidenceLevel}
            onConfidenceLevelChange={onConfidenceLevelChange}
            detectionCount={detectionCount}
          />
          <div className="mt-5 border-t border-line pt-5">
            <FireChart countryData={countryData} countryName={countryName} />
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <EcoMetricsCard fires={countryData} />
          </div>
        </div>
      </div>
    </aside>
  )
}
