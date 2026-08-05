import { computed, ref } from 'vue'
import type { AssistantWorkbench, WorkbenchWidget, WorkbenchWidgetType } from '@/types/workbench'

const greenhouseIds = ['gh-01', 'gh-02', 'gh-03', 'gh-04', 'gh-05', 'gh-06']

const defaultWorkbenches: AssistantWorkbench[] = [
  {
    id: 'daily-irrigation',
    name: '每日灌溉巡检',
    icon: '水',
    pinned: true,
    updatedAt: new Date().toISOString(),
    widgets: [
      { id: 'daily-irrigation-grid', type: 'irrigation', title: '01—06号大棚灌溉状态', size: 'wide', entityIds: greenhouseIds, refreshSeconds: 30, accent: 'blue' },
      { id: 'daily-water', type: 'metric', title: '今日用水', size: 'small', entityIds: [], metricKey: 'todayWaterUsage', refreshSeconds: 30, accent: 'blue', showTrend: true },
      { id: 'daily-moisture', type: 'metric', title: '平均土壤湿度', size: 'small', entityIds: greenhouseIds, metricKey: 'soilMoisture', refreshSeconds: 30, accent: 'green', threshold: 40 },
      { id: 'daily-schedule', type: 'irrigation-schedule', title: '今日灌溉计划', size: 'medium', entityIds: greenhouseIds, refreshSeconds: 60, accent: 'blue' },
      { id: 'daily-alerts', type: 'alerts', title: '需要关注', size: 'medium', entityIds: [], refreshSeconds: 30, accent: 'amber', density: 'compact' }
    ]
  }
]

const workbenches = ref<AssistantWorkbench[]>(JSON.parse(JSON.stringify(defaultWorkbenches)))
const activeWorkbenchId = ref(workbenches.value[0]?.id || '')

export function useAssistantWorkbenches() {
  const activeWorkbench = computed(() => workbenches.value.find(item => item.id === activeWorkbenchId.value) || workbenches.value[0])
  const pinnedWorkbenches = computed(() => workbenches.value.filter(item => item.pinned))

  function replaceWorkbenches(value: AssistantWorkbench[]) {
    workbenches.value = Array.isArray(value) ? value : JSON.parse(JSON.stringify(defaultWorkbenches))
    activeWorkbenchId.value = workbenches.value[0]?.id || ''
  }

  function selectWorkbench(id: string) {
    if (workbenches.value.some(item => item.id === id)) activeWorkbenchId.value = id
  }

  function createWorkbench(name = '我的农业工作台') {
    const id = `workbench-${Date.now()}`
    workbenches.value.push({ id, name, icon: '田', widgets: [], pinned: true, updatedAt: new Date().toISOString() })
    activeWorkbenchId.value = id
    return id
  }

  function createRoutineWorkbench(name: string, widgets: Array<{ type: WorkbenchWidgetType; options?: Partial<WorkbenchWidget> }>) {
    const existing = workbenches.value.find(item => item.name === name)
    if (existing) {
      activeWorkbenchId.value = existing.id
      return existing.id
    }
    const id = createWorkbench(name)
    widgets.forEach(item => addWidget(item.type, item.options))
    return id
  }

  function renameActiveWorkbench(name: string) {
    if (!activeWorkbench.value || !name.trim()) return
    activeWorkbench.value.name = name.trim().slice(0, 18)
    activeWorkbench.value.updatedAt = new Date().toISOString()
  }

  function addWidget(type: WorkbenchWidgetType, options: Partial<WorkbenchWidget> = {}) {
    if (!activeWorkbench.value) createWorkbench()
    const target = activeWorkbench.value
    if (!target) return
    const defaults: Record<WorkbenchWidgetType, Pick<WorkbenchWidget, 'title' | 'size' | 'entityIds'>> = {
      summary: { title: '农场实时总览', size: 'medium', entityIds: [] },
      irrigation: { title: '01—06号大棚灌溉状态', size: 'wide', entityIds: greenhouseIds },
      environment: { title: '环境实时指标', size: 'medium', entityIds: [] },
      devices: { title: '设备运行状态', size: 'medium', entityIds: [] },
      alerts: { title: '待处理告警', size: 'medium', entityIds: [] },
      greenhouse: { title: '大棚状态卡', size: 'small', entityIds: options.entityIds || ['gh-01'] },
      metric: { title: '农场关键指标', size: 'small', entityIds: [] },
      trend: { title: '24小时变化趋势', size: 'medium', entityIds: [] },
      'irrigation-schedule': { title: '今日灌溉计划', size: 'medium', entityIds: greenhouseIds },
      'crop-tasks': { title: '今日农事任务', size: 'medium', entityIds: greenhouseIds },
      'ai-insight': { title: 'AI 农情洞察', size: 'medium', entityIds: [] }
    }
    const item = defaults[type]
    target.widgets.push({ id: `widget-${Date.now()}-${Math.random().toString(16).slice(2)}`, type, refreshSeconds: 30, accent: type.includes('irrigation') ? 'blue' : type === 'alerts' ? 'amber' : 'green', density: 'comfortable', showTrend: true, metricKey: type === 'trend' ? 'soilMoisture' : type === 'metric' ? 'health' : undefined, ...item, ...options })
    target.updatedAt = new Date().toISOString()
  }

  function ensureWidget(type: WorkbenchWidgetType, options: Partial<WorkbenchWidget> = {}) {
    const target = activeWorkbench.value
    const entityIds = options.entityIds || []
    const existing = target?.widgets.find(item => item.type === type && (!entityIds.length || entityIds.every(id => item.entityIds.includes(id))))
    if (existing) {
      if (options.title) existing.title = options.title
      return existing.id
    }
    addWidget(type, options)
    return activeWorkbench.value?.widgets.at(-1)?.id
  }

  function removeWidget(id: string) {
    if (!activeWorkbench.value) return
    activeWorkbench.value.widgets = activeWorkbench.value.widgets.filter(item => item.id !== id)
  }

  function updateWidget(id: string, changes: Partial<WorkbenchWidget>) {
    const widget = activeWorkbench.value?.widgets.find(item => item.id === id)
    if (widget) Object.assign(widget, changes)
  }

  function moveWidget(fromId: string, toId: string) {
    const widgets = activeWorkbench.value?.widgets
    if (!widgets || fromId === toId) return
    const fromIndex = widgets.findIndex(item => item.id === fromId)
    const toIndex = widgets.findIndex(item => item.id === toId)
    if (fromIndex < 0 || toIndex < 0) return
    const [moved] = widgets.splice(fromIndex, 1)
    widgets.splice(toIndex, 0, moved)
    if (activeWorkbench.value) activeWorkbench.value.updatedAt = new Date().toISOString()
  }

  function duplicateActiveWorkbench() {
    if (!activeWorkbench.value) return
    const copy = JSON.parse(JSON.stringify(activeWorkbench.value)) as AssistantWorkbench
    copy.id = `workbench-${Date.now()}`
    copy.name = `${copy.name} 副本`.slice(0, 18)
    copy.updatedAt = new Date().toISOString()
    copy.widgets.forEach((item, index) => { item.id = `widget-${Date.now()}-${index}` })
    workbenches.value.push(copy)
    activeWorkbenchId.value = copy.id
  }

  function deleteWorkbench(id: string) {
    const deletedIndex = workbenches.value.findIndex(item => item.id === id)
    if (deletedIndex < 0) return
    workbenches.value = workbenches.value.filter(item => item.id !== id)
    if (activeWorkbenchId.value === id) {
      activeWorkbenchId.value = workbenches.value[Math.min(deletedIndex, workbenches.value.length - 1)]?.id || ''
    }
  }

  function deleteActiveWorkbench() {
    if (activeWorkbench.value) deleteWorkbench(activeWorkbench.value.id)
  }

  function clearActiveWorkbench() {
    if (activeWorkbench.value) activeWorkbench.value.widgets = []
  }

  function toggleActivePinned() {
    if (activeWorkbench.value) activeWorkbench.value.pinned = !activeWorkbench.value.pinned
  }

  function importWorkbench(value: unknown) {
    const source = value as Partial<AssistantWorkbench>
    if (!source || typeof source.name !== 'string' || !Array.isArray(source.widgets)) throw new Error('工作台文件格式不正确')
    const allowedTypes: WorkbenchWidgetType[] = ['summary', 'irrigation', 'environment', 'devices', 'alerts', 'greenhouse', 'metric', 'trend', 'irrigation-schedule', 'crop-tasks', 'ai-insight']
    const widgets = source.widgets.filter(item => item && allowedTypes.includes(item.type)).map((item, index) => ({
      ...item,
      id: `widget-${Date.now()}-${index}`,
      title: String(item.title || '农业组件').slice(0, 24),
      size: ['small', 'medium', 'wide'].includes(item.size) ? item.size : 'medium',
      entityIds: Array.isArray(item.entityIds) ? item.entityIds.filter(id => typeof id === 'string') : []
    })) as WorkbenchWidget[]
    const id = `workbench-${Date.now()}`
    workbenches.value.push({ id, name: `${source.name}（导入）`.slice(0, 18), icon: String(source.icon || '田').slice(0, 1), pinned: true, widgets, updatedAt: new Date().toISOString() })
    activeWorkbenchId.value = id
  }

  return { workbenches, activeWorkbenchId, activeWorkbench, pinnedWorkbenches, replaceWorkbenches, selectWorkbench, createWorkbench, createRoutineWorkbench, renameActiveWorkbench, addWidget, ensureWidget, removeWidget, updateWidget, moveWidget, duplicateActiveWorkbench, deleteWorkbench, deleteActiveWorkbench, clearActiveWorkbench, toggleActivePinned, importWorkbench }
}
