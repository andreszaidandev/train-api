import type { GeoCoordinates, StationOption } from '../types'

const EARTH_RADIUS_MILES = 3958.8

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function distanceInMiles(from: GeoCoordinates, to: GeoCoordinates): number {
  const latDistance = toRadians(to.latitude - from.latitude)
  const lonDistance = toRadians(to.longitude - from.longitude)
  const fromLat = toRadians(from.latitude)
  const toLat = toRadians(to.latitude)

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_MILES * c
}

export function findNearestStation(
  stations: StationOption[],
  location: GeoCoordinates,
): { station: StationOption; distanceMiles: number } | null {
  let nearest: { station: StationOption; distanceMiles: number } | null = null

  for (const station of stations) {
    const distanceMiles = distanceInMiles(location, {
      latitude: station.latitude,
      longitude: station.longitude,
    })

    if (!nearest || distanceMiles < nearest.distanceMiles) {
      nearest = { station, distanceMiles }
    }
  }

  return nearest
}
