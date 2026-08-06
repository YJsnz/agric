import { getToken } from './auth'

export interface LiveWeather {
  source: string
  latitude: number
  longitude: number
  observedAt: string
  temperature: number
  humidity: number
  windSpeed: number
  radiation: number
  weatherCode: number
}

export async function fetchLiveWeather(signal?: AbortSignal) {
  const response = await fetch('/api/weather/current', {
    signal,
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  const payload = await response.json().catch(() => ({})) as LiveWeather & { message?: string }
  if (!response.ok) throw new Error(payload.message || `实时天气读取失败（${response.status}）`)
  return payload
}
