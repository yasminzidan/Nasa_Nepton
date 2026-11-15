import SectionHeader from './SectionHeader.jsx'
import MetricsGrid from './MetricsGrid.jsx'
import HotspotFeed from './HotspotFeed.jsx'
import HotspotInspector from './HotspotInspector.jsx'

export default function RightPanel({
  animateIn = false,
  drawerOpen = false,
  onDrawerToggle,
  fires,
  selectedFire,
  onSelectFire,
  onFlyTo,
  averageFrp,
  peakMonth,
  region,
  imageryError,
  dataMode,
  onDataModeChange,
  liveLoading,
  liveError,
  usingLiveData,
  archiveLoading,
  archiveError,
  selectedArchiveMonth,
  archivePeriod,
}) {
  return (
    <aside
      className={`mission-panel mission-panel--right absolute right-5 top-[68px] bottom-5 z-20 w-[320px] ${
        animateIn ? 'panel-enter-right' : ''
      } ${
        drawerOpen ? 'mission-panel--open' : ''
      }`}
    >
      <div
        className="corner-brackets interactive-card h-full border border-line bg-panel p-5 max-lg:h-auto max-lg:p-4"
      >
        <button
          aria-expanded={drawerOpen}
          aria-controls="activity-panel-content"
          className="mission-panel-toggle interactive-surface mb-0 flex min-h-11 w-full items-center justify-between border-b border-line pb-3 text-left font-display text-[15px] uppercase tracking-[0.16em] text-bone xl:hidden"
          onClick={onDrawerToggle}
          type="button"
        >
          <span className="xl:hidden">Activity</span>
          <span className="hidden xl:inline">03 / Activity</span>
          <span className="font-mono text-[9px] text-mute">
            {drawerOpen ? 'CLOSE' : 'OPEN'}
          </span>
        </button>
        <div
          id="activity-panel-content"
          className={`panel-scroll h-full overflow-y-auto pr-1 pt-4 max-lg:max-h-[calc(100vh-130px)] xl:pt-0 ${
            drawerOpen ? 'block' : 'hidden'
          } xl:block`}
        >
          <div className="mb-5 border-b border-line pb-4">
            <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.12em] text-mute">
              <span>Detection source</span>
              {liveLoading && dataMode === 'live' && (
                <span className="flex items-center gap-2 text-fire" role="status">
                  <i className="h-3 w-3 animate-spin rounded-full border border-fire/30 border-t-fire" aria-hidden="true" />
                  Updating
                </span>
              )}
              {archiveLoading && dataMode === 'archive' && (
                <span className="flex items-center gap-2 text-data" role="status">
                  <i className="h-3 w-3 animate-spin rounded-full border border-data/30 border-t-data" aria-hidden="true" />
                  Loading
                </span>
              )}
            </div>
            <div className="grid grid-cols-2">
              <button
                aria-pressed={dataMode === 'live'}
                className={`interactive-surface min-h-11 border border-line-strong px-2 font-mono text-[9px] uppercase tracking-[0.08em] ${
                  dataMode === 'live' ? 'border-fire bg-fire/10 text-fire' : 'text-mute'
                }`}
                onClick={() => onDataModeChange('live')}
                type="button"
              >
                Live feed · NASA FIRMS
              </button>
              <button
                aria-pressed={dataMode === 'archive'}
                className={`interactive-surface min-h-11 border border-l-0 border-line-strong px-2 font-mono text-[9px] uppercase tracking-[0.08em] ${
                  dataMode === 'archive' ? 'border-data bg-data/10 text-data' : 'text-mute'
                }`}
                onClick={() => onDataModeChange('archive')}
                type="button"
              >
                Archive · {archivePeriod}
              </button>
            </div>
            {dataMode === 'live' && liveError && (
              <p className="mt-2 border border-alert/50 p-2 font-mono text-[9px] leading-4 text-alert" role="alert">
                Live feed unavailable. Showing archive data instead. {liveError.message}
              </p>
            )}
            {dataMode === 'live' && !liveError && !usingLiveData && !liveLoading && (
              <p className="mt-2 font-mono text-[9px] leading-4 text-mute">
                Showing archive data while the live feed loads.
              </p>
            )}
            {dataMode === 'archive' && archiveError && (
              <p className="mt-2 border border-alert/50 p-2 font-mono text-[9px] leading-4 text-alert" role="alert">
                {selectedArchiveMonth
                  ? `Archive data for ${selectedArchiveMonth} is unavailable.`
                  : 'Archive months are unavailable.'}{' '}
                {archiveError.message}
              </p>
            )}
          </div>
          <SectionHeader num="03" title="Metrics" />
          <MetricsGrid
            archiveDetections={fires.length}
            averageFrp={averageFrp}
            peakMonth={peakMonth}
          />
          <div className="mt-5 border-t border-line pt-5">
            <SectionHeader num="04" title={dataMode === 'live' && usingLiveData ? 'Live feed' : 'Archive feed'} />
            <HotspotFeed
              fires={fires}
              selectedFire={selectedFire}
              onSelectFire={onSelectFire}
              region={region}
              live={dataMode === 'live' && usingLiveData}
              loading={dataMode === 'archive' && archiveLoading}
            />
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <SectionHeader
              num="05"
              title="Inspector"
              rightSlot={
                selectedFire ? (
                  <span className="font-mono text-[9px] text-mute">
                    {selectedFire.id}
                  </span>
                ) : null
              }
            />
            <HotspotInspector fire={selectedFire} onFlyTo={onFlyTo} />
          </div>
          {imageryError && (
            <p className="mt-4 border border-alert/60 p-2 font-mono text-[10px] text-alert" role="alert">
              Imagery provider error: {imageryError}
            </p>
          )}
          <p className="mt-5 border-t border-line pt-3 font-mono text-[8px] uppercase leading-4 tracking-[0.08em] text-dim">
            Imagery attribution: Esri, Maxar, Earthstar Geographics · Cesium ion
          </p>
        </div>
      </div>
    </aside>
  )
}
