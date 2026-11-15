import { useMemo } from 'react'
import { Flame, Leaf, Sprout, Trees } from 'lucide-react'

const SECONDS_PER_HOUR = 3600
const DRY_FUEL_KG_PER_FRP_MJ = 0.368
const CO2_KG_PER_DRY_FUEL_KG = 1.65
const CO2_TONNES_PER_FRP_MW_HOUR =
  (SECONDS_PER_HOUR * DRY_FUEL_KG_PER_FRP_MJ * CO2_KG_PER_DRY_FUEL_KG) / 1000

const AREA_TIERS = [
  { maxFrp: 10, hectares: 0.5 },
  { maxFrp: 50, hectares: 1.5 },
  { maxFrp: 100, hectares: 3 },
  { maxFrp: Infinity, hectares: 6 },
]

const RECOVERY_TIERS = [
  { maxFrp: 10, range: '3–6' },
  { maxFrp: 50, range: '6–10' },
  { maxFrp: 100, range: '8–12' },
  { maxFrp: Infinity, range: '12–20' },
]

function confidenceWeight(confidence) {
  if (typeof confidence === 'string') {
    const normalized = confidence.trim().toLowerCase()
    const namedConfidence = {
      h: 0.9,
      high: 0.9,
      n: 0.65,
      nominal: 0.65,
      l: 0.4,
      low: 0.4,
    }
    if (Object.prototype.hasOwnProperty.call(namedConfidence, normalized)) {
      return namedConfidence[normalized]
    }

    confidence = Number.parseFloat(normalized.replace('%', ''))
  }

  const value = Number(confidence)
  if (!Number.isFinite(value)) return 1
  if (value > 0 && value <= 1) return value
  return Math.min(Math.max(value, 0), 100) / 100
}

function Metric({ icon: Icon, label, value, unit, accent }) {
  return (
    <div className="min-w-0 border border-line bg-panel p-3">
      <div className="flex items-center gap-1.5">
        <Icon aria-hidden="true" className={`h-3.5 w-3.5 ${accent}`} />
        <span className="truncate font-mono text-[9px] uppercase tracking-[0.12em] text-mute">
          {label}
        </span>
      </div>
      <strong className={`mt-2 block truncate font-display text-[26px] font-semibold leading-none tabular-nums ${accent}`}>
        {value}
      </strong>
      <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-dim">
        {unit}
      </span>
    </div>
  )
}

export default function EcoMetricsCard({ fires = [] }) {
  const metrics = useMemo(() => {
    const observations = fires.flatMap((fire) => {
      const frp = Number(fire.frp)
      return Number.isFinite(frp) && frp >= 0
        ? [{ frp, confidence: confidenceWeight(fire.confidence) }]
        : []
    })

    if (observations.length === 0) {
      return { carbonTonnes: null, areaHectares: null, recoveryRange: null }
    }

    const confidenceTotal = observations.reduce(
      (total, fire) => total + fire.confidence,
      0,
    )
    const weightedFrp = observations.reduce(
      (total, fire) => total + fire.frp * fire.confidence,
      0,
    )
    const meanFrp =
      confidenceTotal > 0
        ? weightedFrp / confidenceTotal
        : observations.reduce((total, fire) => total + fire.frp, 0) /
          observations.length

    const carbonTonnes = observations.reduce(
      (total, fire) =>
        total +
        fire.frp *
          CO2_TONNES_PER_FRP_MW_HOUR *
          fire.confidence,
      0,
    )
    const areaHectares = observations.reduce((total, fire) => {
      const tier = AREA_TIERS.find((item) => fire.frp < item.maxFrp)
      return total + tier.hectares * fire.confidence
    }, 0)
    const recoveryRange =
      RECOVERY_TIERS.find((tier) => meanFrp < tier.maxFrp)?.range ?? null

    return { carbonTonnes, areaHectares, recoveryRange }
  }, [fires])

  const formatValue = (value) =>
    value === null
      ? '—'
      : new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)

  return (
    <section
      aria-labelledby="eco-metrics-title"
      className="interactive-card border border-line bg-panel p-4"
    >
      <header className="mb-3 flex items-center gap-2.5 border-b border-line pb-3">
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center border border-line">
          <Leaf aria-hidden="true" className="h-4 w-4 text-data" />
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 h-1.5 w-1.5 animate-pulse bg-data"
          />
        </span>
        <div className="min-w-0">
          <h2
            className="font-mono text-[9px] font-semibold uppercase leading-4 tracking-[0.1em] text-bone"
            id="eco-metrics-title"
          >
            ECO-IMPACT &amp; CLIMATE TELEMETRY
          </h2>
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-mute">
            {fires.length} ARCHIVE DETECTIONS
          </p>
        </div>
      </header>

      <div aria-live="polite" className="grid grid-cols-2 gap-2">
        <Metric
          accent="text-fire"
          icon={Flame}
          label="CO₂ release"
          unit="t · 1h FRP scenario"
          value={formatValue(metrics.carbonTonnes)}
        />
        <Metric
          accent="text-data"
          icon={Trees}
          label="Canopy proxy"
          unit="ha · modeled"
          value={formatValue(metrics.areaHectares)}
        />
        <div className="col-span-2 flex items-center justify-between gap-3 border border-line bg-panel px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Sprout aria-hidden="true" className="h-4 w-4 shrink-0 text-data" />
            <div className="min-w-0">
              <span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-mute">
                Ecosystem recovery scenario
              </span>
              <span className="block font-mono text-[8px] text-dim">
                FRP-tier model · years
              </span>
            </div>
          </div>
          <strong className="shrink-0 font-mono text-lg font-medium tabular-nums text-emerald-300">
            {metrics.recoveryRange ? `${metrics.recoveryRange} y` : '—'}
          </strong>
        </div>
      </div>

      <details className="group mt-3 border-t border-line pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center font-mono text-[8px] uppercase tracking-[0.14em] text-dim transition-colors hover:text-bone focus-visible:outline focus-visible:outline-1 focus-visible:outline-data">
          Model assumptions
        </summary>
        <p className="mt-2 font-mono text-[9px] leading-4 text-mute">
          CO₂ assumes one hour of FRP persistence (0.368 kg dry fuel/MJ; 1.65 kg
          CO₂/kg fuel). Area assigns 0.5/1.5/3/6 ha per detection across the
          &lt;10/&lt;50/&lt;100/≥100 MW FRP tiers, weighted by confidence.
          Recovery uses confidence-weighted mean archive FRP. These are scenario
          proxies, not measured burn scars or observed regrowth, and not an
          official NASA emissions or burn-area product; validate locally.
        </p>
      </details>
    </section>
  )
}
