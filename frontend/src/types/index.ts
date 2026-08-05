export type EntityStatus = 'normal' | 'attention' | 'warning' | 'danger' | 'offline'
export type BusinessModule = 'overview' | 'monitoring' | 'environment' | 'devices' | 'irrigation' | 'crops' | 'alerts'
export type ViewMode = 'aerial' | 'digital-twin'

export interface SceneEntity {
  id: string
  name: string
  type: 'field' | 'greenhouse' | 'device' | 'camera' | 'water' | 'robot' | 'station'
  status: EntityStatus
  metric: string
  x: number
  y: number
  health?: number
  position3D?: { x: number; y: number; z: number }
}

export interface FarmZone {
  id: string
  entityId: string
  polygon: Array<[number, number]>
  crop: string
  area: string
  stage: string
  environment: string
}

export interface DockModuleDefinition {
  key: BusinessModule
  label: string
  icon: string
  description: string
  badge?: number
  subLayers: Array<{ key: string; label: string; value?: string }>
}

export interface DeviceRecord {
  id: string
  entityId: string
  name: string
  category: 'sensor' | 'actuator' | 'camera' | 'robot'
  location: string
  online: boolean
  enabled: boolean
  value: string
  lastSeen: string
}

export interface IrrigationUnit {
  id: string
  entityId: string
  name: string
  target: string
  kind: 'source' | 'valve' | 'fertigation' | 'zone'
  x: number
  y: number
  enabled: boolean
  flow: string
  durationMinutes?: number
}

export interface DashboardSummary {
  health: number
  totalDevices: number
  onlineDevices: number
  runningDevices: number
  openAlerts: number
  waterLevel: number
  todayWaterUsage: number
}

export interface DashboardSnapshot {
  farmId: string
  farmName: string
  generatedAt: string
  virtualData: boolean
  summary: DashboardSummary
  entities: SceneEntity[]
  zones: FarmZone[]
  environmentMetrics: Array<MetricItem & { key: string; numericValue: number; unit: string; measuredAt: string }>
  devices: DeviceRecord[]
  irrigationUnits: IrrigationUnit[]
  alerts: Array<{ id: number; entityId?: string; time: string; title: string; level: string; status: string }>
}

export interface GreenhouseDetail {
  farmId: string
  generatedAt: string
  greenhouse: { id: string; name: string; status: EntityStatus; health: number; crop: string; area: string; stage: string; environment: string }
  metrics: Array<{ key: string; label: string; value: number; unit: string; note: string; tone: string }>
  devices: Array<{ id: string; name: string; category: string; online: boolean; enabled: boolean; value: string }>
  plants: Array<{ id: string; zone: string; status: EntityStatus; health: number; height: number; soilMoisture: number }>
  heightTrend: Array<{ date: string; height: number }>
  alerts: DashboardSnapshot['alerts']
  aiSuggestion: string
}

export interface MetricItem {
  label: string
  value: string
  delta?: string
  tone?: 'success' | 'warning' | 'danger' | 'info'
}

export interface PageDefinition {
  key: string
  title: string
  eyebrow: string
  description: string
  primaryAction: string
  metrics: MetricItem[]
  chartTitle: string
  chartSeries: number[]
  columns: string[]
  rows: string[][]
  insight: string
  filters: string[]
}
