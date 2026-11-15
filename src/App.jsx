import { useCallback, useEffect, useMemo, useState } from 'react'
import NeptonChatbot from '../Nace Project/src/components/NeptonChatbot.jsx'
import GlobeView from './components/GlobeView.jsx'
import Header from './components/Header.jsx'
import LeftPanel from './components/LeftPanel.jsx'
import RightPanel from './components/RightPanel.jsx'
import SpaceLoader from './components/SpaceLoader.jsx'
import neptonAvatar from '../Nace Project/src/assets/nepton-avatar.jpg'
import { BRAZIL_BOUNDS } from './data/mapBounds.js'
import { fetchArchiveFires, fetchArchiveMonths } from './services/archiveApi.js'
import { fetchFirmsActiveFires } from './services/firmsApi.js'
import { getFireDateKey, shiftDateKey } from './utils/fireDates.js'

const COUNTRY = { label: 'Brazil', region: 'Amazon' }

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function App() {
  const [confidenceLevel, setConfidenceLevel] = useState('low')
  const [dayNight, setDayNight] = useState('ALL')
  const [selectedFire, setSelectedFire] = useState(null)
  const [selectedDateRange, setSelectedDateRange] = useState(null)
  const [imageryError, setImageryError] = useState(null)
  const [panelsRevealed, setPanelsRevealed] = useState(false)
  const [globeReady, setGlobeReady] = useState(false)
  const [activeDrawer, setActiveDrawer] = useState(null)
  const [dataMode, setDataMode] = useState('archive')
  const [archiveMonths, setArchiveMonths] = useState([])
  const [archiveMonthsLoading, setArchiveMonthsLoading] = useState(true)
  const [archiveMonthsError, setArchiveMonthsError] = useState(null)
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState(null)
  const [archiveFires, setArchiveFires] = useState([])
  const [archiveFiresLoading, setArchiveFiresLoading] = useState(false)
  const [archiveFiresError, setArchiveFiresError] = useState(null)
  const [liveFires, setLiveFires] = useState(null)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveError, setLiveError] = useState(null)
  const revealPanels = useCallback(() => setPanelsRevealed(true), [])
  const markGlobeReady = useCallback(() => setGlobeReady(true), [])
  const handleImageryError = useCallback(
    (error) => setImageryError(error?.message ?? String(error)),
    [],
  )
  const toggleDrawer = useCallback((drawer) => {
    setActiveDrawer((active) => (active === drawer ? null : drawer))
  }, [])
  const focusBounds = BRAZIL_BOUNDS

  // Load the available archive months once; the latest month becomes the initial selection.
  useEffect(() => {
    const controller = new AbortController()

    fetchArchiveMonths({ signal: controller.signal })
      .then((months) => {
        setArchiveMonths(months)
        const month = months[months.length - 1]?.month ?? null
        setSelectedArchiveMonth(month)
        setArchiveFiresLoading(Boolean(month))
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setArchiveMonthsError(error)
      })
      .finally(() => {
        if (!controller.signal.aborted) setArchiveMonthsLoading(false)
      })

    return () => controller.abort()
  }, [])

  // Fetch only the selected month and cancel stale requests when the selection changes.
  useEffect(() => {
    if (!selectedArchiveMonth) return undefined

    const controller = new AbortController()

    fetchArchiveFires(selectedArchiveMonth, { signal: controller.signal })
      .then(setArchiveFires)
      .catch((error) => {
        if (error.name !== 'AbortError') setArchiveFiresError(error)
      })
      .finally(() => {
        if (!controller.signal.aborted) setArchiveFiresLoading(false)
      })

    return () => controller.abort()
  }, [selectedArchiveMonth])

  useEffect(() => {
    if (dataMode !== 'live') return undefined

    const controller = new AbortController()

    fetchFirmsActiveFires(focusBounds, { signal: controller.signal })
      .then(setLiveFires)
      .catch((error) => {
        if (error.name !== 'AbortError') setLiveError(error)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLiveLoading(false)
      })

    return () => controller.abort()
  }, [dataMode, focusBounds])

  const sourceFires = dataMode === 'live' && liveFires !== null && !liveError
    ? liveFires
    : archiveFires

  const minConfidence = { low: 0, mid: 50, high: 80 }[confidenceLevel]
  const calendarFires = useMemo(
    () =>
      sourceFires.filter((fire) => {
        const confidence = Number(fire.confidence)
        const confidenceScore = Number.isFinite(confidence)
          ? confidence
          : ({ L: 30, N: 65, H: 95 }[String(fire.confidence).toUpperCase()] ?? null)
        const matchesConfidence =
          minConfidence === 0 ||
          (confidenceScore !== null && confidenceScore >= minConfidence)
        const matchesDayNight =
          dayNight === 'ALL' || fire.daynight === dayNight
        return (
          matchesConfidence &&
          matchesDayNight
        )
      }),
    [sourceFires, minConfidence, dayNight],
  )

  const defaultDateRange = useMemo(() => {
    const latestDate = calendarFires.reduce((latest, fire) => {
      const dateKey = getFireDateKey(fire.acq_date)
      return dateKey && (!latest || dateKey > latest) ? dateKey : latest
    }, null)
    return latestDate
      ? { start: shiftDateKey(latestDate, -6), end: latestDate }
      : null
  }, [calendarFires])
  const activeDateRange = selectedDateRange ?? defaultDateRange

  const countryFires = useMemo(() => {
    if (!activeDateRange) return []
    return calendarFires.filter((fire) => {
      const dateKey = getFireDateKey(fire.acq_date)
      return dateKey &&
        dateKey >= activeDateRange.start &&
        dateKey <= activeDateRange.end
    })
  }, [activeDateRange, calendarFires]
  )

  const activeFire = useMemo(
    () =>
      selectedFire && countryFires.some((fire) => fire.id === selectedFire.id)
        ? selectedFire
        : null,
    [selectedFire, countryFires],
  )

  const chatContext = useMemo(
    () => ({
      country: COUNTRY.label,
      region: COUNTRY.region,
      minConfidence,
      dayNight: dayNight === 'ALL' ? 'Day and night' : dayNight,
      yearRange: activeDateRange
        ? `${activeDateRange.start}–${activeDateRange.end}`
        : 'Unavailable',
      activeYear: activeDateRange
        ? Number(activeDateRange.end.slice(0, 4))
        : null,
      activeDate: activeDateRange?.end ?? null,
      activeFireCount: countryFires.length,
      selectedHotspot: activeFire?.id ?? null,
      selectedFireInspector: activeFire
        ? {
            id: activeFire.id,
            latitude: activeFire.latitude,
            longitude: activeFire.longitude,
            confidence: activeFire.confidence,
            frp: activeFire.frp,
            sensor: activeFire.sensor || activeFire.satellite,
            acquiredAt: `${activeFire.acq_date} ${activeFire.acq_time} UTC`,
          }
        : null,
    }),
    [activeDateRange, activeFire, countryFires.length, dayNight, minConfidence],
  )

  const averageFrp = useMemo(() => {
    if (!countryFires.length) return 0
    return (
      countryFires.reduce((total, fire) => total + Number(fire.frp || 0), 0) /
      countryFires.length
    )
  }, [countryFires])

  const peakMonth = useMemo(() => {
    const monthlyFrp = new Map()
    countryFires.forEach((fire) => {
      const dateKey = getFireDateKey(fire.acq_date)
      if (!dateKey) return
      const month = Number(dateKey.slice(5, 7))
      monthlyFrp.set(month, (monthlyFrp.get(month) ?? 0) + Number(fire.frp || 0))
    })
    const peak = [...monthlyFrp.entries()].sort((a, b) => b[1] - a[1])[0]
    return peak ? MONTH_NAMES[peak[0] - 1] : '—'
  }, [countryFires])

  const handleSelectFire = useCallback((fire) => {
    setSelectedFire(
      fire
        ? {
            ...fire,
            latitude: fire.latitude ?? fire.lat,
            longitude: fire.longitude ?? fire.lng,
          }
        : null,
    )
  }, [])

  const handleConfidenceLevelChange = useCallback((value) => {
    setConfidenceLevel(value)
    setSelectedFire(null)
  }, [])

  const handleDayNightChange = useCallback((value) => {
    setDayNight(value)
    setSelectedFire(null)
  }, [])

  const handleArchiveMonthChange = useCallback((month) => {
    setSelectedArchiveMonth(month)
    setArchiveFires([])
    setArchiveFiresLoading(true)
    setArchiveFiresError(null)
    setDataMode('archive')
    setSelectedDateRange(null)
    setSelectedFire(null)
  }, [])

  const dataReady = !archiveMonthsLoading && !archiveFiresLoading
  const appReady = dataReady && globeReady
  return (
    <main className="instrument-grid relative h-screen overflow-hidden text-bone">
      <GlobeView
        fireData={countryFires}
        onSelectFire={handleSelectFire}
        onReady={markGlobeReady}
        selectedFire={activeFire}
        ionToken={import.meta.env.VITE_CESIUM_ION_TOKEN}
        onImageryError={handleImageryError}
        focus={focusBounds}
      />
      <div className="instrument-grid-overlay" aria-hidden="true" />
      {activeDrawer && (
        <button
          aria-label="Close open panel"
          className="absolute inset-0 z-10 bg-void/35 xl:hidden"
          onClick={() => setActiveDrawer(null)}
          type="button"
        />
      )}
      <div className="absolute inset-x-0 top-0 z-30">
        <Header dataMode={dataMode} />
      </div>

      <LeftPanel
        animateIn={panelsRevealed}
        drawerOpen={activeDrawer === 'filters'}
        onDrawerToggle={() => toggleDrawer('filters')}
        dayNight={dayNight}
        onDayNightChange={handleDayNightChange}
        confidenceLevel={confidenceLevel}
        onConfidenceLevelChange={handleConfidenceLevelChange}
        detectionCount={countryFires.length}
        countryData={countryFires}
        calendarData={calendarFires}
        archiveMonths={archiveMonths}
        archiveMonthsLoading={archiveMonthsLoading}
        archiveMonthsError={archiveMonthsError}
        selectedArchiveMonth={selectedArchiveMonth}
        onArchiveMonthChange={handleArchiveMonthChange}
        selectedDateRange={activeDateRange}
        onDateRangeChange={(range) => {
          setSelectedDateRange(range)
          setSelectedFire(null)
          setDataMode('archive')
        }}
        countryName={COUNTRY.label}
      />

      <RightPanel
        animateIn={panelsRevealed}
        drawerOpen={activeDrawer === 'activity'}
        onDrawerToggle={() => toggleDrawer('activity')}
        fires={countryFires}
        selectedFire={activeFire}
        onSelectFire={handleSelectFire}
        onFlyTo={handleSelectFire}
        averageFrp={averageFrp}
        peakMonth={peakMonth}
        region={COUNTRY.region}
        imageryError={imageryError}
        dataMode={dataMode}
        onDataModeChange={(mode) => {
          if (mode === dataMode) return
          setSelectedFire(null)
          setSelectedDateRange(null)
          if (mode === 'live') {
            setLiveFires(null)
            setLiveError(null)
            setLiveLoading(true)
          } else {
            setLiveLoading(false)
          }
          setDataMode(mode)
        }}
        liveLoading={liveLoading}
        liveError={liveError}
        usingLiveData={dataMode === 'live' && liveFires !== null && !liveError}
        archiveLoading={archiveFiresLoading}
        archiveError={archiveFiresError || archiveMonthsError}
        selectedArchiveMonth={selectedArchiveMonth}
        archivePeriod={
          archiveMonths.length
            ? `${archiveMonths[0].month.slice(0, 4)}–${archiveMonths[archiveMonths.length - 1].month.slice(0, 4)}`
            : 'unavailable'
        }
      />

      <div className="pointer-events-none absolute bottom-2 left-5 z-10 hidden font-mono text-[8px] uppercase tracking-[0.12em] text-mute lg:block">
        {COUNTRY.region} · {COUNTRY.label}
      </div>
      <SpaceLoader
        dataReady={dataReady}
        globeReady={globeReady}
        isReady={appReady}
        onReveal={revealPanels}
      />
      <NeptonChatbot
        context={chatContext}
        onFlyToHotspot={handleSelectFire}
        avatarSrc={neptonAvatar}
      />
    </main>
  )
}

export default App
