type TopBarProps = {
  onLocateMe: () => void
  locateStatus: string
  isLocating: boolean
  disabled: boolean
}

function TopBar({ onLocateMe, locateStatus, isLocating, disabled }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="title-group">
        <p className="eyebrow">Boston Rapid Transit</p>
        <h1>MBTA Arrivals Board</h1>
      </div>
      <div className="top-bar-actions">
        <button type="button" className="locate-button" onClick={onLocateMe} disabled={disabled || isLocating}>
          {isLocating ? 'Locating...' : 'Locate Me'}
        </button>
        <span className="status-pill">{locateStatus}</span>
      </div>
    </header>
  )
}

export default TopBar
