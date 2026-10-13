import { clearAuth, getToken } from './auth'
import type { DashboardSnapshot, DeviceInput, DeviceRecord, FarmZone, GreenhouseDetail, IrrigationUnit, MetricThreshold, ZoneInput } from '@/types'

let activeFarmId = 'yantian-01'
export function setActiveFarm(farmId:string) { activeFarmId=farmId }
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

export function fetchDashboard(farmId = activeFarmId) {
  setActiveFarm(farmId)
  return request<DashboardSnapshot>(`/farms/${farmId}/dashboard`)
}

export interface ObservationHistory {
  farmId:string; metricKey:string; scope:string; virtualData:boolean; limit:number;
  points:{id:number;label:string;value:number;unit:string;source:string;measuredAt:string}[]
}
export function fetchObservationHistory(metricKey:string,farmId=activeFarmId) {
  return request<ObservationHistory>(`/farms/${encodeURIComponent(farmId)}/observations?metricKey=${encodeURIComponent(metricKey)}`)
}

export function fetchGreenhouseDetail(greenhouseId: string, farmId = activeFarmId) {
  return request<GreenhouseDetail>(`/farms/${farmId}/greenhouses/${greenhouseId}`)
}

export function setDeviceEnabled(entityId: string, enabled: boolean, farmId = activeFarmId) {
  return request<DeviceRecord>(`/farms/${farmId}/devices/${entityId}`, {
    method: 'PATCH', body: JSON.stringify({ enabled })
  })
}

export function setIrrigationEnabled(unitId: string, enabled: boolean, durationMinutes: number, farmId = activeFarmId) {
  return request<IrrigationUnit>(`/farms/${farmId}/irrigation/${unitId}`, {
    method: 'PATCH', body: JSON.stringify({ enabled, durationMinutes })
  })
}

export function runDeviceSelfTest(entityId: string, farmId = activeFarmId) {
  return request<DeviceRecord>(`/farms/${farmId}/devices/${entityId}/self-test`, { method: 'POST' })
}

export function handleFarmAlert(alertId: number, farmId = activeFarmId) {
  return request<DashboardSnapshot['alerts'][number]>(`/farms/${farmId}/alerts/${alertId}/handle`, { method: 'PATCH' })
}

export function createFarmDevice(device: DeviceInput, farmId = activeFarmId) {
  return request<DeviceRecord>(`/farms/${farmId}/devices`, { method: 'POST', body: JSON.stringify(device) })
}

export function updateFarmDevice(entityId: string, device: DeviceInput, farmId = activeFarmId) {
  return request<DeviceRecord>(`/farms/${farmId}/devices/${entityId}`, { method: 'PUT', body: JSON.stringify(device) })
}

export function deleteFarmDevice(entityId: string, farmId = activeFarmId) {
  return request<void>(`/farms/${farmId}/devices/${entityId}`, { method: 'DELETE' })
}

export function createFarmZone(zone: ZoneInput, farmId = activeFarmId) {
  return request<FarmZone>(`/farms/${farmId}/zones`, { method: 'POST', body: JSON.stringify(zone) })
}

export function updateFarmZone(entityId: string, zone: ZoneInput, farmId = activeFarmId) {
  return request<FarmZone>(`/farms/${farmId}/zones/${entityId}`, { method: 'PUT', body: JSON.stringify(zone) })
}

export function deleteFarmZone(entityId: string, farmId = activeFarmId) {
  return request<void>(`/farms/${farmId}/zones/${entityId}`, { method: 'DELETE' })
}

export function fetchMetricThresholds(farmId = activeFarmId) {
  return request<MetricThreshold[]>(`/farms/${farmId}/thresholds`)
}

export function saveSoilMoistureThreshold(minimumValue: number, enabled: boolean, farmId = activeFarmId) {
  return request<MetricThreshold>(`/farms/${farmId}/thresholds/soil-moisture`, {
    method: 'PUT', body: JSON.stringify({ minimumValue, enabled })
  })
}

export function simulateSoilMoisture(value = 30, farmId = activeFarmId) {
  return request<DashboardSnapshot['environmentMetrics'][number]>(`/farms/${farmId}/simulation/soil-moisture`, {
    method: 'POST', body: JSON.stringify({ value })
  })
}

export interface OperationRecord {id:number;farmId:string;entityId:string;kind:string;title:string;detail:string;stage:string;operatorName?:string;parentId?:number;quantity?:number;unit?:string;createdAt:string;simulated:boolean}
export const fetchOperations = (farmId=activeFarmId) => request<OperationRecord[]>(`/farms/${farmId}/operations`)
export const createOperation = (input:{kind:string;entityId:string;title:string;detail:string;quantity?:number;unit?:string},farmId=activeFarmId) => request<OperationRecord>(`/farms/${farmId}/operations`,{method:'POST',body:JSON.stringify(input)})
export const advanceBatch = (id:number,stage:string,detail:string,farmId=activeFarmId) => request<OperationRecord>(`/farms/${farmId}/operations/${id}/advance`,{method:'POST',body:JSON.stringify({stage,detail})})
export const fetchBatchTrace = (id:number,farmId=activeFarmId) => request<OperationRecord[]>(`/farms/${farmId}/operations/${id}/trace`)
