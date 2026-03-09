import { useCallback, useState } from 'react'
import type { GeoCoordinates } from '../types'

type UseGeolocationResult = {
  isLocating: boolean
  requestLocation: () => Promise<GeoCoordinates>
}

function toErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) {
    return 'Location permission denied'
  }

  if (error.code === error.TIMEOUT) {
    return 'Location request timed out'
  }

  return 'Unable to retrieve location'
}

export function useGeolocation(): UseGeolocationResult {
  const [isLocating, setIsLocating] = useState(false)

  const requestLocation = useCallback(() => {
    return new Promise<GeoCoordinates>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not available in this browser'))
        return
      }

      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false)
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          setIsLocating(false)
          reject(new Error(toErrorMessage(error)))
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0,
        },
      )
    })
  }, [])

  return {
    isLocating,
    requestLocation,
  }
}
