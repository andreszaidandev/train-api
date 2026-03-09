export type LineKey = 'green' | 'orange' | 'blue' | 'red'

export type ArrivalRow = {
  id: string
  routeLabel: string
  destination: string
  relative?: string
  clock?: string
  noPrediction?: boolean
}

export type StationOption = {
  id: string
  name: string
  latitude: number
  longitude: number
}

export type LineConfig = {
  line: LineKey
  label: string
  accent: string
  image: string
  routeIds: string[]
  fallbackStationId: string
  fallbackStationName: string
}

export type CardState = {
  arrivals: ArrivalRow[]
  loading: boolean
  error: string | null
  updatedAt: number | null
}

export type GeoCoordinates = {
  latitude: number
  longitude: number
}
