import { clearAuth, getToken } from './auth'
import type { DashboardSnapshot, DeviceRecord, GreenhouseDetail, IrrigationUnit } from '@/types'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401) {
      clearAuth()
      window.location.replace('/#/sign-in')
    }
    throw new Error(data.message || `请求失败（${response.status}）`)
  }
  return data as T
}

export function fetchDashboard(farmId = 'farm-01') {
  return request<DashboardSnapshot>(`/farms/${farmId}/dashboard`)
}

export function fetchGreenhouseDetail(greenhouseId: string, farmId = 'farm-01') {
  return request<GreenhouseDetail>(`/farms/${farmId}/greenhouses/${greenhouseId}`)
}

export function setDeviceEnabled(entityId: string, enabled: boolean, farmId = 'farm-01') {
  return request<DeviceRecord>(`/farms/${farmId}/devices/${entityId}`, {
    method: 'PATCH', body: JSON.stringify({ enabled })
  })
}

export function setIrrigationEnabled(unitId: string, enabled: boolean, durationMinutes: number, farmId = 'farm-01') {
  return request<IrrigationUnit>(`/farms/${farmId}/irrigation/${unitId}`, {
    method: 'PATCH', body: JSON.stringify({ enabled, durationMinutes })
  })
}

export function runDeviceSelfTest(entityId: string, farmId = 'farm-01') {
  return request<DeviceRecord>(`/farms/${farmId}/devices/${entityId}/self-test`, { method: 'POST' })
}

export function handleFarmAlert(alertId: number, farmId = 'farm-01') {
  return request<DashboardSnapshot['alerts'][number]>(`/farms/${farmId}/alerts/${alertId}/handle`, { method: 'PATCH' })
}
