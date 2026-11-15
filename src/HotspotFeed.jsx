import { Flame, MapPin, Satellite } from 'lucide-react'

const formatCoordinate = (value) => Number(value).toFixed(2)

export default function HotspotFeed({
  fires,
  selectedFire,
  onSelectFire,
  isLoading,
}) {
  const orderedFires = [...fires].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <section className="side-section feed">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Detection stream</span>
          <h2>Hotspot feed</h2>
        </div>
        <span className="feed__count">{orderedFires.length.toString().padStart(2, '0')}</span>
      </div>

      <div className="feed__list">
        {isLoading ? (
          <p className="feed__empty">Loading regional detections…</p>
        ) : orderedFires.length ? (
          orderedFires.map((fire) => {
            const isSelected = selectedFire?.id === fire.id
            return (
              <button
                type="button"
                key={fire.id}
                className={`feed-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelectFire(fire)}
                aria-pressed={isSelected}
              >
                <span className="feed-item__icon">
                  <Flame size={15} strokeWidth={1.7} />
                </span>
                <span className="feed-item__main">
                  <span className="feed-item__title">
                    <strong>{fire.id}</strong>
                    <span>{fire.date}</span>
                  </span>
                  <span className="feed-item__meta">
                    <span>
                      <MapPin size={11} />
                      {formatCoordinate(fire.lat)}, {formatCoordinate(fire.lng)}
                    </span>
                    <span>
                      <Satellite size={11} />
                      {fire.satellite}
                    </span>
                  </span>
                </span>
                <span className="feed-item__frp">
                  <strong>{Number(fire.frp).toFixed(1)}</strong>
                  <small>MW</small>
                </span>
              </button>
            )
          })
        ) : (
          <p className="feed__empty">No detections match these filters.</p>
        )}
      </div>
    </section>
  )
}
