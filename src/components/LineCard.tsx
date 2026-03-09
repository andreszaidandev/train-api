import type { CSSProperties, ChangeEvent } from 'react'
import type { ArrivalRow, LineConfig, StationOption } from '../types'

type LineCardProps = {
  lineConfig: LineConfig
  stations: StationOption[]
  selectedStationId: string
  distanceLabel: string
  updatedLabel: string
  arrivals: ArrivalRow[]
  loading: boolean
  error: string | null
  onStationChange: (stationId: string) => void
}

function renderArrivalRow(arrival: ArrivalRow) {
  if (arrival.noPrediction) {
    return (
      <div className="arrival-row no-prediction">
        <span className="arrival-route">{arrival.routeLabel}</span>
        <span className="arrival-destination">{arrival.destination}</span>
        <span className="arrival-empty">No live prediction</span>
      </div>
    )
  }

  return (
    <div className="arrival-row">
      <span className="arrival-route">{arrival.routeLabel}</span>
      <span className="arrival-destination">{arrival.destination}</span>
      <span className="arrival-relative">{arrival.relative}</span>
      <span className="arrival-clock">{arrival.clock}</span>
    </div>
  )
}

function LineCard({
  lineConfig,
  stations,
  selectedStationId,
  distanceLabel,
  updatedLabel,
  arrivals,
  loading,
  error,
  onStationChange,
}: LineCardProps) {
  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onStationChange(event.target.value)
  }

  const cardStyle = {
    '--line-accent': lineConfig.accent,
  } as CSSProperties

  const hasStations = stations.length > 0

  return (
    <article className="line-card" style={cardStyle}>
      <div className="line-card-header">
        <div className="line-chip">{lineConfig.label}</div>
        <label className="station-field">
          <span className="field-label">Station</span>
          <select
            value={selectedStationId}
            onChange={onChange}
            aria-label={`${lineConfig.label} station selector`}
            disabled={!hasStations}
          >
            {stations.map((station) => (
              <option value={station.id} key={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </label>
        <div className="distance-text">{distanceLabel}</div>
      </div>

      <div className="train-hero">
        <img src={lineConfig.image} alt={`${lineConfig.label} Line train`} className="train-image" />
      </div>

      <section className="arrivals">
        {error ? <div className="card-message card-error">{error}</div> : null}
        {!error && loading && arrivals.length === 0 ? <div className="card-message">Loading arrivals...</div> : null}
        {!error && !loading && arrivals.length === 0 ? (
          <div className="card-message">No upcoming live arrivals</div>
        ) : null}
        {!error &&
          arrivals.map((arrival) => (
            <div key={arrival.id} className="arrival-item">
              {renderArrivalRow(arrival)}
            </div>
          ))}
      </section>

      <footer className="line-card-footer">{updatedLabel}</footer>
    </article>
  )
}

export default LineCard
