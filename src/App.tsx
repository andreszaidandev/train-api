import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import LineCard from './components/LineCard'
import TopBar from './components/TopBar'
import {
  createDefaultSelectionMap,
  createEmptyStationMap,
  createInitialCardStateMap,
  LINE_CONFIG,
  LINE_ORDER,
} from './data/lineConfig'
import { useGeolocation } from './hooks/useGeolocation'
import { distanceInMiles, findNearestStation } from './lib/geo'
import { fetchArrivalsForLineAtStation, fetchStationsForLine } from './lib/mbta'
import { formatUpdatedAgo } from './lib/time'
import type { GeoCoordinates, LineKey } from './types'

function App() {
  const [stationsByLine, setStationsByLine] = useState(createEmptyStationMap)
  const [selectedStations, setSelectedStations] = useState<Record<LineKey, string>>(createDefaultSelectionMap)
  const [cardStateByLine, setCardStateByLine] = useState(createInitialCardStateMap)
  const [isBootstrappingStations, setIsBootstrappingStations] = useState(true)
  const [userLocation, setUserLocation] = useState<GeoCoordinates | null>(null)
  const [locateStatus, setLocateStatus] = useState('Using default stations')
  const [now, setNow] = useState(() => Date.now())
  const refreshRequestIdRef = useRef(0)
  const { isLocating, requestLocation } = useGeolocation()

  useEffect(() => {
    const labelInterval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(labelInterval)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadStations = async () => {
      setIsBootstrappingStations(true)

      try {
        const lineStationEntries = await Promise.all(
          LINE_ORDER.map(async (line) => [line, await fetchStationsForLine(LINE_CONFIG[line])] as const),
        )

        if (!active) {
          return
        }

        const nextStations = createEmptyStationMap()
        for (const [line, stations] of lineStationEntries) {
          nextStations[line] = stations
        }

        setStationsByLine(nextStations)
        setSelectedStations((current) => {
          const next = { ...current }

          for (const line of LINE_ORDER) {
            const lineStations = nextStations[line]
            const fallbackStationId = LINE_CONFIG[line].fallbackStationId
            const hasCurrentSelection = lineStations.some((station) => station.id === current[line])

            if (hasCurrentSelection) {
              next[line] = current[line]
              continue
            }

            if (lineStations.some((station) => station.id === fallbackStationId)) {
              next[line] = fallbackStationId
              continue
            }

            next[line] = lineStations[0]?.id ?? ''
          }

          return next
        })
      } catch {
        if (active) {
          setLocateStatus('Unable to load MBTA station catalog')
        }
      } finally {
        if (active) {
          setIsBootstrappingStations(false)
        }
      }
    }

    void loadStations()

    return () => {
      active = false
    }
  }, [])

  const refreshPredictions = useCallback(async () => {
    if (isBootstrappingStations) {
      return
    }

    const linesToRefresh = LINE_ORDER.filter((line) => selectedStations[line].length > 0)
    if (linesToRefresh.length === 0) {
      return
    }

    const refreshRequestId = refreshRequestIdRef.current + 1
    refreshRequestIdRef.current = refreshRequestId
    const requestedAt = Date.now()

    setCardStateByLine((current) => {
      const next = { ...current }

      for (const line of linesToRefresh) {
        next[line] = {
          ...current[line],
          loading: true,
          error: null,
        }
      }

      return next
    })

    const responses = await Promise.all(
      linesToRefresh.map(async (line) => {
        try {
          const arrivals = await fetchArrivalsForLineAtStation(selectedStations[line], LINE_CONFIG[line], requestedAt)
          return { line, arrivals, error: null as string | null }
        } catch {
          return { line, arrivals: [], error: 'Unable to load arrivals' }
        }
      }),
    )

    if (refreshRequestId !== refreshRequestIdRef.current) {
      return
    }

    const completedAt = Date.now()
    setCardStateByLine((current) => {
      const next = { ...current }

      for (const response of responses) {
        next[response.line] = {
          arrivals: response.arrivals,
          loading: false,
          error: response.error,
          updatedAt: completedAt,
        }
      }

      return next
    })
  }, [isBootstrappingStations, selectedStations])

  useEffect(() => {
    if (isBootstrappingStations) {
      return
    }

    void refreshPredictions()
    const refreshInterval = window.setInterval(() => {
      void refreshPredictions()
    }, 10000)

    return () => {
      window.clearInterval(refreshInterval)
    }
  }, [isBootstrappingStations, refreshPredictions])

  const resetToFallbackStations = useCallback(() => {
    setSelectedStations((current) => {
      const next = { ...current }

      for (const line of LINE_ORDER) {
        const fallbackStationId = LINE_CONFIG[line].fallbackStationId
        const lineStations = stationsByLine[line]
        if (lineStations.some((station) => station.id === fallbackStationId)) {
          next[line] = fallbackStationId
          continue
        }

        next[line] = lineStations[0]?.id ?? current[line]
      }

      return next
    })
  }, [stationsByLine])

  const handleLocateMe = useCallback(async () => {
    if (isBootstrappingStations) {
      return
    }

    setLocateStatus('Requesting location...')
    try {
      const location = await requestLocation()
      setUserLocation(location)

      setSelectedStations((current) => {
        const next = { ...current }
        for (const line of LINE_ORDER) {
          const nearest = findNearestStation(stationsByLine[line], location)
          if (nearest) {
            next[line] = nearest.station.id
          }
        }
        return next
      })

      setLocateStatus('Using nearest stations for each line')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to get location'
      setUserLocation(null)
      resetToFallbackStations()
      setLocateStatus(`${message}. Using default stations`)
    }
  }, [isBootstrappingStations, requestLocation, resetToFallbackStations, stationsByLine])

  const handleStationChange = useCallback((line: LineKey, stationId: string) => {
    setSelectedStations((current) => ({
      ...current,
      [line]: stationId,
    }))
  }, [])

  const getDistanceLabel = (line: LineKey): string => {
    if (!userLocation) {
      return selectedStations[line] === LINE_CONFIG[line].fallbackStationId ? 'Default station' : 'Manual station'
    }

    const selectedStation = stationsByLine[line].find((station) => station.id === selectedStations[line])
    if (!selectedStation) {
      return 'Location active'
    }

    const miles = distanceInMiles(userLocation, {
      latitude: selectedStation.latitude,
      longitude: selectedStation.longitude,
    })
    return `${miles.toFixed(1)} miles`
  }

  return (
    <main className="app-shell">
      <TopBar
        onLocateMe={() => {
          void handleLocateMe()
        }}
        locateStatus={locateStatus}
        isLocating={isLocating}
        disabled={isBootstrappingStations}
      />
      <section className="cards-grid">
        {LINE_ORDER.map((line) => {
          const lineConfig = LINE_CONFIG[line]
          const cardState = cardStateByLine[line]
          const updatedLabel = formatUpdatedAgo(cardState.updatedAt, now)
          const distanceLabel = getDistanceLabel(line)

          return (
            <LineCard
              key={line}
              lineConfig={lineConfig}
              stations={stationsByLine[line]}
              selectedStationId={selectedStations[line]}
              distanceLabel={distanceLabel}
              updatedLabel={updatedLabel}
              arrivals={cardState.arrivals}
              loading={cardState.loading}
              error={cardState.error}
              onStationChange={(stationId) => handleStationChange(line, stationId)}
            />
          )
        })}
      </section>
      <div className="footer-note">
        Live MBTA predictions refresh every 10 seconds. Location can be re-requested with Locate Me.
      </div>
    </main>
  )
}

export default App
