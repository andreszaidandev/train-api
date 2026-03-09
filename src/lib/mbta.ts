import type { ArrivalRow, LineConfig, StationOption } from '../types'
import { formatClockTime, formatRelativeArrival } from './time'

const MBTA_API_BASE = 'https://api-v3.mbta.com'

type StopApi = {
  id: string
  attributes: {
    name: string
    latitude: number
    longitude: number
    location_type: number
  }
}

type PredictionApi = {
  id: string
  attributes: {
    arrival_time: string | null
    departure_time: string | null
    direction_id: number | null
  }
  relationships?: {
    route?: { data?: { id: string } | null }
    trip?: { data?: { id: string } | null }
  }
}

type TripIncludedApi = {
  id: string
  type: 'trip'
  attributes?: {
    headsign?: string | null
  }
}

type RouteIncludedApi = {
  id: string
  type: 'route'
  attributes?: {
    direction_destinations?: string[]
  }
}

type UnknownIncludedApi = {
  id: string
  type: string
  attributes?: Record<string, unknown>
}

type IncludedApi = TripIncludedApi | RouteIncludedApi | UnknownIncludedApi

type ApiCollectionResponse<TData> = {
  data: TData[]
  included?: IncludedApi[]
}

function isTripIncluded(item: IncludedApi): item is TripIncludedApi {
  return item.type === 'trip'
}

function isRouteIncluded(item: IncludedApi): item is RouteIncludedApi {
  return item.type === 'route'
}

function getApiKey(): string | null {
  const value = import.meta.env.VITE_MBTA_API_KEY
  return typeof value === 'string' && value.length > 0 ? value : null
}

function buildApiUrl(path: string, params: Record<string, string>): string {
  const url = new URL(path, MBTA_API_BASE)
  const searchParams = new URLSearchParams(params)
  const apiKey = getApiKey()
  if (apiKey) {
    searchParams.set('api_key', apiKey)
  }
  url.search = searchParams.toString()
  return url.toString()
}

async function fetchCollection<TData>(path: string, params: Record<string, string>): Promise<TData[]> {
  const response = await fetch(buildApiUrl(path, params))
  if (!response.ok) {
    throw new Error(`MBTA API request failed (${response.status})`)
  }

  const payload = (await response.json()) as ApiCollectionResponse<TData>
  return payload.data
}

async function fetchCollectionWithIncluded<TData>(
  path: string,
  params: Record<string, string>,
): Promise<ApiCollectionResponse<TData>> {
  const response = await fetch(buildApiUrl(path, params))
  if (!response.ok) {
    throw new Error(`MBTA API request failed (${response.status})`)
  }

  return (await response.json()) as ApiCollectionResponse<TData>
}

export async function fetchStationsForLine(lineConfig: LineConfig): Promise<StationOption[]> {
  const stops = await fetchCollection<StopApi>('/stops', {
    'filter[route]': lineConfig.routeIds.join(','),
    'filter[location_type]': '1',
  })

  const uniqueStations = new Map<string, StationOption>()

  for (const stop of stops) {
    if (stop.attributes.location_type !== 1) {
      continue
    }

    uniqueStations.set(stop.id, {
      id: stop.id,
      name: stop.attributes.name,
      latitude: stop.attributes.latitude,
      longitude: stop.attributes.longitude,
    })
  }

  return Array.from(uniqueStations.values()).sort((left, right) => left.name.localeCompare(right.name))
}

function getRouteLabel(routeId: string): string {
  if (routeId.startsWith('Green-')) {
    const branch = routeId.split('-')[1] ?? ''
    return `Green ${branch}`
  }

  if (routeId === 'Orange') {
    return 'Orange'
  }

  if (routeId === 'Blue') {
    return 'Blue'
  }

  if (routeId === 'Red') {
    return 'Red'
  }

  return routeId
}

function getDirectionDestination(
  directionId: number | null,
  directionDestinations: string[] | undefined,
): string | null {
  if (!directionDestinations || directionDestinations.length === 0) {
    return null
  }

  if (directionId === null || directionId < 0 || directionId >= directionDestinations.length) {
    return directionDestinations[0] ?? null
  }

  return directionDestinations[directionId] ?? null
}

type ArrivalGroup = {
  key: string
  routeLabel: string
  destination: string
  earliestTimeIso: string | null
}

export async function fetchArrivalsForLineAtStation(
  stationId: string,
  lineConfig: LineConfig,
  nowMs = Date.now(),
): Promise<ArrivalRow[]> {
  const payload = await fetchCollectionWithIncluded<PredictionApi>('/predictions', {
    'filter[stop]': stationId,
    'filter[route]': lineConfig.routeIds.join(','),
    include: 'trip,route',
    sort: 'arrival_time',
  })

  const predictions = payload.data
  const included = payload.included ?? []

  const headsignByTripId = new Map<string, string>()
  const directionDestinationsByRouteId = new Map<string, string[]>()

  for (const item of included) {
    if (isTripIncluded(item)) {
      const headsign = item.attributes?.headsign
      if (headsign) {
        headsignByTripId.set(item.id, headsign)
      }
      continue
    }

    if (isRouteIncluded(item)) {
      const directionDestinations = item.attributes?.direction_destinations
      if (directionDestinations && directionDestinations.length > 0) {
        directionDestinationsByRouteId.set(item.id, directionDestinations)
      }
    }
  }

  const grouped = new Map<string, ArrivalGroup>()

  for (const prediction of predictions) {
    const routeId = prediction.relationships?.route?.data?.id
    if (!routeId || !lineConfig.routeIds.includes(routeId)) {
      continue
    }

    const routeLabel = getRouteLabel(routeId)
    const tripId = prediction.relationships?.trip?.data?.id ?? null
    const tripHeadsign = tripId ? headsignByTripId.get(tripId) : null
    const directionDestination = getDirectionDestination(
      prediction.attributes.direction_id,
      directionDestinationsByRouteId.get(routeId),
    )
    const destination = tripHeadsign ?? directionDestination ?? 'Unknown destination'
    const groupKey = `${routeLabel}|${destination}`
    const timeIso = prediction.attributes.arrival_time ?? prediction.attributes.departure_time

    const existing = grouped.get(groupKey)
    if (!existing) {
      grouped.set(groupKey, {
        key: groupKey,
        routeLabel,
        destination,
        earliestTimeIso: timeIso,
      })
      continue
    }

    if (!timeIso) {
      continue
    }

    if (!existing.earliestTimeIso || Date.parse(timeIso) < Date.parse(existing.earliestTimeIso)) {
      existing.earliestTimeIso = timeIso
    }
  }

  const withSortKey = Array.from(grouped.values()).map((group) => {
    const timestamp = group.earliestTimeIso ? Date.parse(group.earliestTimeIso) : Number.POSITIVE_INFINITY
    return {
      group,
      timestamp,
    }
  })

  withSortKey.sort((left, right) => left.timestamp - right.timestamp)

  return withSortKey.map(({ group }) => {
    if (!group.earliestTimeIso) {
      return {
        id: group.key,
        routeLabel: group.routeLabel,
        destination: group.destination,
        noPrediction: true,
      }
    }

    return {
      id: group.key,
      routeLabel: group.routeLabel,
      destination: group.destination,
      relative: formatRelativeArrival(group.earliestTimeIso, nowMs),
      clock: formatClockTime(group.earliestTimeIso),
    }
  })
}
