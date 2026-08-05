export type WorkbenchWidgetType = 'summary' | 'irrigation' | 'environment' | 'devices' | 'alerts' | 'greenhouse' | 'metric' | 'trend' | 'irrigation-schedule' | 'crop-tasks' | 'ai-insight'
export type WorkbenchWidgetSize = 'small' | 'medium' | 'wide'
export type WorkbenchMetricKey = 'health' | 'onlineDevices' | 'waterLevel' | 'todayWaterUsage' | 'temperature' | 'humidity' | 'soilMoisture' | 'light' | 'co2'

export interface WorkbenchWidget {
  id: string
  type: WorkbenchWidgetType
  title: string
  size: WorkbenchWidgetSize
  entityIds: string[]
  refreshSeconds?: number
  accent?: 'green' | 'blue' | 'amber'
  metricKey?: WorkbenchMetricKey
  density?: 'comfortable' | 'compact'
  showTrend?: boolean
  threshold?: number
}

export interface AssistantWorkbench {
  id: string
  name: string
  icon: string
  widgets: WorkbenchWidget[]
  pinned: boolean
  updatedAt: string
}
