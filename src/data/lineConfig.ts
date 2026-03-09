import blueTrain from '../assets/blue.png'
import greenTrain from '../assets/Green.png'
import orangeTrain from '../assets/orange.png'
import redTrain from '../assets/red.png'
import type { CardState, LineConfig, LineKey, StationOption } from '../types'

export const LINE_ORDER: LineKey[] = ['green', 'orange', 'blue', 'red']

export const LINE_CONFIG: Record<LineKey, LineConfig> = {
  green: {
    line: 'green',
    label: 'Green',
    accent: '#46c965',
    image: greenTrain,
    routeIds: ['Green-B', 'Green-C', 'Green-D', 'Green-E'],
    fallbackStationId: 'place-boyls',
    fallbackStationName: 'Boylston',
  },
  orange: {
    line: 'orange',
    label: 'Orange',
    accent: '#f7a638',
    image: orangeTrain,
    routeIds: ['Orange'],
    fallbackStationId: 'place-state',
    fallbackStationName: 'State',
  },
  blue: {
    line: 'blue',
    label: 'Blue',
    accent: '#4ca8ff',
    image: blueTrain,
    routeIds: ['Blue'],
    fallbackStationId: 'place-state',
    fallbackStationName: 'State',
  },
  red: {
    line: 'red',
    label: 'Red',
    accent: '#ff5a5a',
    image: redTrain,
    routeIds: ['Red'],
    fallbackStationId: 'place-pktrm',
    fallbackStationName: 'Park Street',
  },
}

export function createEmptyStationMap(): Record<LineKey, StationOption[]> {
  return {
    green: [],
    orange: [],
    blue: [],
    red: [],
  }
}

export function createDefaultSelectionMap(): Record<LineKey, string> {
  return {
    green: LINE_CONFIG.green.fallbackStationId,
    orange: LINE_CONFIG.orange.fallbackStationId,
    blue: LINE_CONFIG.blue.fallbackStationId,
    red: LINE_CONFIG.red.fallbackStationId,
  }
}

export function createInitialCardStateMap(): Record<LineKey, CardState> {
  const initialState: CardState = {
    arrivals: [],
    loading: false,
    error: null,
    updatedAt: null,
  }

  return {
    green: { ...initialState },
    orange: { ...initialState },
    blue: { ...initialState },
    red: { ...initialState },
  }
}
