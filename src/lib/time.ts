export function formatRelativeArrival(isoTime: string, nowMs = Date.now()): string {
  const timestamp = Date.parse(isoTime)
  if (Number.isNaN(timestamp)) {
    return '--'
  }

  const diffMs = timestamp - nowMs
  if (diffMs <= 30_000) {
    return 'Due'
  }

  const minutes = Math.max(1, Math.ceil(diffMs / 60_000))
  return `${minutes} min`
}

export function formatClockTime(isoTime: string): string {
  const date = new Date(isoTime)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatUpdatedAgo(updatedAt: number | null, nowMs: number): string {
  if (!updatedAt) {
    return 'Waiting for live data'
  }

  const secondsAgo = Math.max(0, Math.floor((nowMs - updatedAt) / 1000))
  return `Updated ${secondsAgo} sec ago`
}
