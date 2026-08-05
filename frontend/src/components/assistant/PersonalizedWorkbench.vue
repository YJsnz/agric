<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { alerts, dashboardSummary, deviceRecords, environmentMetrics, irrigationUnits, sceneEntities } from '@/data/farm'
import { handleFarmAlert, setDeviceEnabled, setIrrigationEnabled } from '@/api/dashboard'
import type { AssistantWorkbench, WorkbenchMetricKey, WorkbenchWidget, WorkbenchWidgetSize, WorkbenchWidgetType } from '@/types/workbench'
import WorkbenchWidgetIcon from './WorkbenchWidgetIcon.vue'

const props = defineProps<{ workbench: AssistantWorkbench; initialLibraryOpen?: boolean }>()
const emit = defineEmits<{
  (event: 'add', type: WorkbenchWidgetType): void
  (event: 'remove', id: string): void
  (event: 'update', id: string, changes: Partial<WorkbenchWidget>): void
  (event: 'rename', name: string): void
  (event: 'move', fromId: string, toId: string): void
  (event: 'duplicate'): void
  (event: 'delete'): void
  (event: 'clear'): void
  (event: 'toggle-pin'): void
}>()

const editing = ref(false)
const libraryOpen = ref(Boolean(props.initialLibraryOpen))
const selectedWidgetId = ref<string | null>(null)
const draftName = ref(props.workbench.name)
const selectedWidget = computed(() => props.workbench.widgets.find(item => item.id === selectedWidgetId.value))
const draggedWidgetId = ref<string | null>(null)
const busyIds = ref(new Set<string>())
const propertyPanelRef = ref<HTMLElement | null>(null)
const propertyPanelPosition = ref<{ x: number; y: number } | null>(null)
let propertyPanelDragOffset = { x: 0, y: 0 }
const propertyPanelStyle = computed(() => propertyPanelPosition.value ? {
  left: `${propertyPanelPosition.value.x}px`,
  top: `${propertyPanelPosition.value.y}px`,
  right: 'auto',
  bottom: 'auto'
} : undefined)
const widgetLibrary: Array<{ type: WorkbenchWidgetType; name: string; description: string; icon: string }> = [
  { type: 'summary', name: '农场总览', description: '健康度、设备与今日用水', icon: '览' },
  { type: 'irrigation', name: '大棚灌溉', description: '01—06号大棚横向巡检', icon: '水' },
  { type: 'environment', name: '环境指标', description: '温湿度、光照与 CO₂', icon: '环' },
  { type: 'devices', name: '设备状态', description: '在线率与运行设备', icon: '设' },
  { type: 'alerts', name: '告警列表', description: '集中显示待处理风险', icon: '警' },
  { type: 'greenhouse', name: '单棚卡片', description: '关注一个指定大棚', icon: '棚' },
  { type: 'metric', name: '单指标', description: '自由选择一个核心指标', icon: '数' },
  { type: 'trend', name: '指标趋势', description: '单指标 24 小时趋势', icon: '趋' },
  { type: 'irrigation-schedule', name: '灌溉计划', description: '今日任务、时间和进度', icon: '计' },
  { type: 'crop-tasks', name: '农事任务', description: '分棚展示待办事项', icon: '事' },
  { type: 'ai-insight', name: 'AI 洞察', description: '风险归因和行动建议', icon: '智' }
]

const metricOptions: Array<{ key: WorkbenchMetricKey; label: string }> = [
  { key: 'health', label: '农场健康度' }, { key: 'onlineDevices', label: '在线设备' }, { key: 'waterLevel', label: '蓄水池水位' },
  { key: 'todayWaterUsage', label: '今日用水' }, { key: 'temperature', label: '空气温度' }, { key: 'humidity', label: '空气湿度' },
  { key: 'soilMoisture', label: '土壤湿度' }, { key: 'light', label: '光照强度' }, { key: 'co2', label: 'CO₂' }
]
const trendSeries: Record<WorkbenchMetricKey, number[]> = {
  health: [86,87,88,89,91,90,92,92,91,92,93,92], onlineDevices: [25,26,26,27,27,27,26,27,27,27,27,27], waterLevel: [91,90,89,88,87,86,85,84,84,83,82,82], todayWaterUsage: [2,5,8,11,14,18,21,25,29,32,35,38], temperature: [22,22,23,24,26,27,28,29,29,28,28,28], humidity: [68,66,64,62,60,58,57,55,54,55,56,56], soilMoisture: [51,49,48,46,45,44,42,41,44,43,42,42], light: [120,180,300,440,580,680,720,690,560,390,240,130], co2: [640,630,620,610,600,590,580,570,575,580,580,580]
}

function metricData(key: WorkbenchMetricKey = 'health') {
  const environmentMap: Partial<Record<WorkbenchMetricKey, number>> = { temperature: 0, humidity: 1, soilMoisture: 2, light: 3, co2: 4 }
  if (key in environmentMap) {
    const item = environmentMetrics[environmentMap[key] || 0]
    const raw = Number.parseFloat(item.value)
    const progressScale: Partial<Record<WorkbenchMetricKey, number>> = { temperature: raw / 40 * 100, humidity: raw, soilMoisture: raw, light: raw / 1000 * 100, co2: raw / 1000 * 100 }
    return { label: item.label, value: item.value, delta: item.delta || '稳定', progress: progressScale[key] || raw }
  }
  const values = {
    health: { label: '农场健康度', value: `${dashboardSummary.health} 分`, delta: '+2 分', progress: dashboardSummary.health },
    onlineDevices: { label: '在线设备', value: `${dashboardSummary.onlineDevices}/${dashboardSummary.totalDevices}`, delta: '在线率 96%', progress: dashboardSummary.onlineDevices / dashboardSummary.totalDevices * 100 },
    waterLevel: { label: '蓄水池水位', value: `${dashboardSummary.waterLevel}%`, delta: '-3% 今日', progress: dashboardSummary.waterLevel },
    todayWaterUsage: { label: '今日用水', value: `${dashboardSummary.todayWaterUsage} m³`, delta: '较昨日 -6.4%', progress: 64 }
  }
  return values[key as keyof typeof values] || values.health
}

function trendPoints(widget: WorkbenchWidget) {
  const values = trendSeries[widget.metricKey || 'soilMoisture']
  const min = Math.min(...values), max = Math.max(...values), range = Math.max(1, max - min)
  return values.map((value, index) => `${index * 24},${82 - (value - min) / range * 62}`).join(' ')
}

function sparklinePoints(widget: WorkbenchWidget) {
  const values = trendSeries[widget.metricKey || 'health']
  const min = Math.min(...values), max = Math.max(...values), range = Math.max(1, max - min)
  return values.map((value, index) => `${index * 24},${52 - (value - min) / range * 38}`).join(' ')
}

function greenhouseRows(widget: WorkbenchWidget) {
  return widget.entityIds.map((id, index) => {
    const entity = sceneEntities.find(item => item.id === id)
    const running = entity?.status === 'normal' && index % 3 !== 1
    return { id, name: `${Number(id.slice(-2))}号大棚`, running, moisture: entity?.health ? Math.round(entity.health * .62) : 58, duration: running ? `${12 + index * 2} min` : '待机', flow: running ? `${(2.8 + index * .4).toFixed(1)} m³/h` : '0 m³/h' }
  })
}

function add(type: WorkbenchWidgetType) {
  emit('add', type)
  libraryOpen.value = false
}

function saveName() {
  emit('rename', draftName.value)
  editing.value = false
}

function sizeClass(size: WorkbenchWidgetSize) {
  return `widget-${size}`
}

function startDrag(id: string, event: DragEvent) {
  if (!editing.value) return
  draggedWidgetId.value = id
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function dropOn(id: string) {
  if (draggedWidgetId.value) emit('move', draggedWidgetId.value, id)
  draggedWidgetId.value = null
}

function toggleEntity(entityId: string, checked: boolean) {
  if (!selectedWidget.value) return
  const ids = new Set(selectedWidget.value.entityIds)
  checked ? ids.add(entityId) : ids.delete(entityId)
  emit('update', selectedWidget.value.id, { entityIds: [...ids] })
}

function updateSelected(changes: Partial<WorkbenchWidget>) {
  if (selectedWidget.value) emit('update', selectedWidget.value.id, changes)
}

function startPropertyPanelDrag(event: PointerEvent) {
  if (event.button !== 0 || (event.target as HTMLElement).closest('button, input, select')) return
  const panel = propertyPanelRef.value
  if (!panel) return
  const rect = panel.getBoundingClientRect()
  propertyPanelPosition.value = { x: rect.left, y: rect.top }
  propertyPanelDragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  document.body.classList.add('property-panel-dragging')
  window.addEventListener('pointermove', movePropertyPanel)
  window.addEventListener('pointerup', stopPropertyPanelDrag, { once: true })
  window.addEventListener('pointercancel', stopPropertyPanelDrag, { once: true })
  event.preventDefault()
}

function movePropertyPanel(event: PointerEvent) {
  const panel = propertyPanelRef.value
  if (!panel) return
  const margin = 10
  const maxX = Math.max(margin, window.innerWidth - panel.offsetWidth - margin)
  const maxY = Math.max(margin, window.innerHeight - panel.offsetHeight - margin)
  propertyPanelPosition.value = {
    x: Math.min(maxX, Math.max(margin, event.clientX - propertyPanelDragOffset.x)),
    y: Math.min(maxY, Math.max(margin, event.clientY - propertyPanelDragOffset.y))
  }
}

function stopPropertyPanelDrag() {
  document.body.classList.remove('property-panel-dragging')
  window.removeEventListener('pointermove', movePropertyPanel)
  window.removeEventListener('pointerup', stopPropertyPanelDrag)
  window.removeEventListener('pointercancel', stopPropertyPanelDrag)
}

function exportWorkbench() {
  const blob = new Blob([JSON.stringify(props.workbench, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.workbench.name}.workbench.json`
  link.click()
  URL.revokeObjectURL(url)
}

function confirmAction(message: string, event: 'delete' | 'clear') {
  if (event === 'delete') {
    emit('delete')
    return
  }
  if (!window.confirm(message)) return
  emit('clear')
}

async function toggleDevice(entityId: string, enabled: boolean) {
  busyIds.value.add(entityId)
  try {
    const saved = await setDeviceEnabled(entityId, enabled)
    const target = deviceRecords.find(item => item.entityId === entityId)
    if (target) Object.assign(target, saved)
  } finally { busyIds.value.delete(entityId) }
}

async function toggleIrrigation(unitId: string, enabled: boolean) {
  busyIds.value.add(unitId)
  try {
    const unit = irrigationUnits.find(item => item.id === unitId)
    const saved = await setIrrigationEnabled(unitId, enabled, unit?.durationMinutes || 15)
    if (unit) Object.assign(unit, saved)
  } finally { busyIds.value.delete(unitId) }
}

async function resolveAlert(id?: number) {
  if (!id) return
  busyIds.value.add(`alert-${id}`)
  try {
    const saved = await handleFarmAlert(id)
    const target = alerts.find(item => item.id === id)
    if (target) Object.assign(target, saved)
  } finally { busyIds.value.delete(`alert-${id}`) }
}

watch(() => props.workbench.id, () => {
  draftName.value = props.workbench.name
  selectedWidgetId.value = null
})

onBeforeUnmount(stopPropertyPanelDrag)
</script>

<template>
  <section class="personal-workbench" :class="{ editing }">
    <header class="workbench-head">
      <div>
        <span class="daisy-badge daisy-badge-success daisy-badge-outline">个性化工作台</span>
        <template v-if="editing">
          <input v-model="draftName" class="daisy-input daisy-input-bordered daisy-input-sm title-input" maxlength="18" @keydown.enter="saveName" />
        </template>
        <h2 v-else>{{ workbench.name }}</h2>
        <small>{{ workbench.widgets.length }} 个组件 · 数据实时同步</small>
      </div>
      <div class="head-actions">
        <button v-if="editing" class="daisy-btn daisy-btn-sm daisy-btn-ghost" @click="libraryOpen = true">＋ 添加组件</button>
        <div v-if="editing" class="daisy-dropdown daisy-dropdown-end">
          <button tabindex="0" class="daisy-btn daisy-btn-sm daisy-btn-ghost">管理 ▾</button>
          <ul tabindex="0" class="daisy-dropdown-content daisy-menu management-menu">
            <li><button @click="emit('toggle-pin')">{{ workbench.pinned ? '从 Dock 取消固定' : '固定到 Dock' }}</button></li>
            <li><button @click="emit('duplicate')">创建工作台副本</button></li>
            <li><button @click="exportWorkbench">导出 JSON</button></li>
            <li><button @click="confirmAction('确定清空当前工作台的全部组件吗？', 'clear')">清空组件</button></li>
            <li><button class="danger" @click="confirmAction('确定删除当前工作台吗？此操作无法撤销。', 'delete')">删除工作台</button></li>
          </ul>
        </div>
        <button class="daisy-btn daisy-btn-sm" :class="editing ? 'daisy-btn-success' : 'daisy-btn-ghost'" @click="editing ? saveName() : (editing = true)">{{ editing ? '完成' : '编辑工作台' }}</button>
      </div>
    </header>

    <TransitionGroup v-if="workbench.widgets.length" name="widget" tag="div" class="widget-grid">
      <article v-for="widget in workbench.widgets" :key="widget.id" class="daisy-card widget-card" :class="[sizeClass(widget.size), `widget-type-${widget.type}`, `accent-${widget.accent || 'green'}`, `density-${widget.density || 'comfortable'}`, { selected: selectedWidgetId === widget.id, dragging: draggedWidgetId === widget.id }]" :draggable="editing" @dragstart="startDrag(widget.id, $event)" @dragover.prevent @drop.prevent="dropOn(widget.id)" @dragend="draggedWidgetId = null" @click="editing && (selectedWidgetId = widget.id)">
        <div v-if="editing" class="widget-editor-actions">
          <select :value="widget.size" class="daisy-select daisy-select-bordered daisy-select-xs" @change="emit('update', widget.id, { size: ($event.target as HTMLSelectElement).value as WorkbenchWidgetSize })">
            <option value="small">小</option><option value="medium">中</option><option value="wide">通栏</option>
          </select>
          <button class="daisy-btn daisy-btn-xs daisy-btn-circle daisy-btn-error daisy-btn-outline" @click.stop="emit('remove', widget.id)">×</button>
        </div>

        <template v-if="widget.type === 'irrigation'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="irrigation"/><div><small>例行巡检</small><h3>{{ widget.title }}</h3></div></div><span class="sync-badge"><i></i>实时同步</span></header>
          <div class="irrigation-table">
            <div v-for="row in greenhouseRows(widget)" :key="row.id" class="irrigation-row">
              <strong>{{ row.name }}</strong><span class="daisy-badge" :class="row.running ? 'daisy-badge-success' : 'daisy-badge-ghost'">{{ row.running ? '灌溉中' : '待机' }}</span>
              <div><small>土壤湿度</small><b>{{ row.moisture }}%</b><progress class="daisy-progress daisy-progress-success" :value="row.moisture" max="100"></progress></div>
              <div><small>持续时间</small><b>{{ row.duration }}</b></div><div><small>实时流量</small><b>{{ row.flow }}</b></div>
            </div>
          </div>
        </template>

        <template v-else-if="widget.type === 'summary'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="summary"/><div><small>智慧农场01</small><h3>{{ widget.title }}</h3></div></div></header>
          <div class="summary-layout"><div class="health-donut" :style="`--health:${dashboardSummary.health * 3.6}deg`"><span><strong>{{ dashboardSummary.health }}</strong><small>综合健康</small></span></div><div class="daisy-stats summary-stats">
            <div class="daisy-stat"><div class="daisy-stat-title">健康度</div><div class="daisy-stat-value">{{ dashboardSummary.health }}</div><div class="daisy-stat-desc">运行状态良好</div></div>
            <div class="daisy-stat"><div class="daisy-stat-title">在线设备</div><div class="daisy-stat-value small-value">{{ dashboardSummary.onlineDevices }}/{{ dashboardSummary.totalDevices }}</div><div class="daisy-stat-desc">{{ dashboardSummary.runningDevices }} 台运行中</div></div>
            <div class="daisy-stat"><div class="daisy-stat-title">今日用水</div><div class="daisy-stat-value small-value">{{ dashboardSummary.todayWaterUsage }}</div><div class="daisy-stat-desc">立方米</div></div>
          </div></div>
        </template>

        <template v-else-if="widget.type === 'environment'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="environment"/><div><small>实时传感器</small><h3>{{ widget.title }}</h3></div></div></header>
          <div class="metric-cards"><div v-for="metric in environmentMetrics" :key="metric.label" class="daisy-stat"><span>{{ metric.label }}</span><strong>{{ metric.value }}</strong><small>{{ metric.delta }}</small></div></div>
        </template>

        <template v-else-if="widget.type === 'devices'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="devices"/><div><small>物联网设备</small><h3>{{ widget.title }}</h3></div></div><span class="status-pill warning">{{ deviceRecords.filter(item => !item.online).length }} 台离线</span></header>
          <div class="device-list"><div v-for="device in deviceRecords.slice(0, 5)" :key="device.id"><i :class="{ online: device.online }"></i><span><strong>{{ device.name }}</strong><small>{{ device.location }} · {{ device.value }}</small></span><button class="device-switch" :class="{ on: device.enabled }" :disabled="!device.online || busyIds.has(device.entityId)" @click.stop="toggleDevice(device.entityId, !device.enabled)"><b></b></button></div></div>
        </template>

        <template v-else-if="widget.type === 'alerts'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="alerts"/><div><small>风险中心</small><h3>{{ widget.title }}</h3></div></div><span class="status-pill warning">{{ alerts.filter(item => item.status !== '已恢复').length }} 项待办</span></header>
          <div class="alert-list"><div v-for="alert in alerts" :key="`${alert.time}-${alert.title}`" class="daisy-alert" :class="alert.status === '已恢复' || alert.status === '已处理' ? 'daisy-alert-success' : 'daisy-alert-warning'"><span>!</span><div><strong>{{ alert.title }}</strong><small>{{ alert.time }} · {{ alert.status }}</small></div><button v-if="alert.id && alert.status !== '已恢复' && alert.status !== '已处理'" :disabled="busyIds.has(`alert-${alert.id}`)" @click.stop="resolveAlert(alert.id)">处理</button></div></div>
        </template>

        <template v-else-if="widget.type === 'greenhouse'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="greenhouse"/><div><small>重点关注</small><h3>{{ widget.title }}</h3></div></div></header>
          <div class="greenhouse-focus" v-for="entity in sceneEntities.filter(item => widget.entityIds.includes(item.id))" :key="entity.id"><div class="daisy-radial-progress daisy-text-success" :style="`--value:${entity.health || 0};--size:5.5rem`">{{ entity.health }}</div><div><h4>{{ entity.name }}</h4><p>{{ entity.metric }}</p><span class="daisy-badge daisy-badge-success daisy-badge-outline">{{ entity.status === 'normal' ? '状态良好' : '需要关注' }}</span></div></div>
        </template>

        <template v-else-if="widget.type === 'metric'">
          <header class="widget-title atomic-title"><div><WorkbenchWidgetIcon type="metric"/><div><small>{{ metricData(widget.metricKey).label }}</small><h3>{{ widget.title }}</h3></div></div><span class="live-dot">实时</span></header>
          <div class="single-metric"><div class="metric-value"><strong>{{ metricData(widget.metricKey).value }}</strong><span :class="{ down: metricData(widget.metricKey).delta.includes('-') }">{{ metricData(widget.metricKey).delta }}</span></div><svg viewBox="0 0 264 58" preserveAspectRatio="none"><defs><linearGradient :id="`metric-fill-${widget.id}`" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b9a61" stop-opacity=".22"/><stop offset="1" stop-color="#4b9a61" stop-opacity="0"/></linearGradient></defs><polygon :fill="`url(#metric-fill-${widget.id})`" :points="`0,58 ${sparklinePoints(widget)} 264,58`"/><polyline :points="sparklinePoints(widget)"/></svg><progress class="daisy-progress daisy-progress-success" :value="metricData(widget.metricKey).progress" max="100"></progress><footer><small>阈值 {{ widget.threshold || 40 }}</small><small>每 {{ widget.refreshSeconds || 30 }} 秒刷新</small></footer></div>
        </template>

        <template v-else-if="widget.type === 'trend'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="trend"/><div><small>{{ metricData(widget.metricKey).label }}</small><h3>{{ widget.title }}</h3></div></div><strong class="trend-current">{{ metricData(widget.metricKey).value }}</strong></header>
          <div class="atomic-trend"><svg viewBox="0 0 264 92" preserveAspectRatio="none"><path d="M0 22H264M0 46H264M0 70H264"/><polyline :points="trendPoints(widget)"/></svg><footer><span>00:00</span><span>06:00</span><span>12:00</span><span>现在</span></footer></div>
        </template>

        <template v-else-if="widget.type === 'irrigation-schedule'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="irrigation-schedule"/><div><small>自动灌溉</small><h3>{{ widget.title }}</h3></div></div><span class="status-pill info">3/6 已完成</span></header>
          <div class="schedule-list"><div v-for="(unit,index) in irrigationUnits.slice(0,6)" :key="unit.id"><time>{{ String(7 + index).padStart(2,'0') }}:{{ index % 2 ? '30' : '00' }}</time><i :class="{ done:!unit.enabled && index < 2, running:unit.enabled }"></i><span><strong>{{ unit.name }}</strong><small>{{ unit.target }} · {{ unit.flow }}</small></span><button class="schedule-action" :class="{ stop: unit.enabled }" :disabled="busyIds.has(unit.id)" @click.stop="toggleIrrigation(unit.id, !unit.enabled)">{{ unit.enabled ? '停止' : '启动' }}</button></div></div>
        </template>

        <template v-else-if="widget.type === 'crop-tasks'">
          <header class="widget-title"><div><WorkbenchWidgetIcon type="crop-tasks"/><div><small>生产计划</small><h3>{{ widget.title }}</h3></div></div><span class="status-pill">4 项任务</span></header>
          <div class="task-list"><label v-for="(task,index) in ['02号棚补充滴灌','04号棚检查苗床','05号棚记录长势','06号棚清洗过滤器']" :key="task"><input type="checkbox" class="daisy-checkbox daisy-checkbox-success daisy-checkbox-sm" :checked="index === 2"/><span><strong>{{ task }}</strong><small>{{ index < 2 ? '高优先级' : '今日完成' }} · 负责人 {{ ['李明','王芳','赵强','陈静'][index] }}</small></span></label></div>
        </template>

        <template v-else>
          <header class="widget-title"><div><WorkbenchWidgetIcon type="ai-insight"/><div><small>基于当前工作台</small><h3>{{ widget.title }}</h3></div></div><span class="ai-chip">✦ AI 分析</span></header>
          <div class="insight-card"><strong>当前灌溉节奏整体合理</strong><p>02号棚土壤湿度下降速度高于其他大棚，建议将下一轮灌溉提前约 20 分钟；蓄水池水位足以覆盖今日剩余计划。</p><div><span>风险置信度 86%</span><button class="daisy-btn daisy-btn-xs daisy-btn-success daisy-btn-outline">生成调整方案</button></div></div>
        </template>
      </article>
    </TransitionGroup>

    <button v-else class="empty-canvas" @click="libraryOpen = true"><span>＋</span><strong>这是一个空白工作台</strong><small>从 DaisyUI 农业组件库添加第一张卡片</small></button>

    <Transition name="property-panel">
    <aside v-if="editing && selectedWidget" ref="propertyPanelRef" class="property-panel" :style="propertyPanelStyle">
      <header class="property-panel-handle" title="拖动属性面板" @pointerdown.stop="startPropertyPanelDrag"><div><small>组件属性 · 拖动调整位置</small><strong>{{ selectedWidget.type }}</strong></div><button class="daisy-btn daisy-btn-xs daisy-btn-circle daisy-btn-ghost" @click="selectedWidgetId = null">×</button></header>
      <label><span>标题</span><input :value="selectedWidget.title" class="daisy-input daisy-input-bordered daisy-input-sm" maxlength="24" @input="updateSelected({ title: ($event.target as HTMLInputElement).value })" /></label>
      <label><span>卡片尺寸</span><select :value="selectedWidget.size" class="daisy-select daisy-select-bordered daisy-select-sm" @change="updateSelected({ size: ($event.target as HTMLSelectElement).value as WorkbenchWidgetSize })"><option value="small">小卡片</option><option value="medium">中卡片</option><option value="wide">通栏卡片</option></select></label>
      <label><span>刷新频率</span><select :value="selectedWidget.refreshSeconds || 30" class="daisy-select daisy-select-bordered daisy-select-sm" @change="updateSelected({ refreshSeconds: Number(($event.target as HTMLSelectElement).value) })"><option :value="15">15 秒</option><option :value="30">30 秒</option><option :value="60">1 分钟</option><option :value="300">5 分钟</option></select></label>
      <label v-if="selectedWidget.type === 'metric' || selectedWidget.type === 'trend'"><span>绑定指标</span><select :value="selectedWidget.metricKey || 'health'" class="daisy-select daisy-select-bordered daisy-select-sm" @change="updateSelected({ metricKey: ($event.target as HTMLSelectElement).value as WorkbenchMetricKey })"><option v-for="item in metricOptions" :key="item.key" :value="item.key">{{ item.label }}</option></select></label>
      <label><span>内容密度</span><select :value="selectedWidget.density || 'comfortable'" class="daisy-select daisy-select-bordered daisy-select-sm" @change="updateSelected({ density: ($event.target as HTMLSelectElement).value as 'comfortable' | 'compact' })"><option value="comfortable">舒适</option><option value="compact">紧凑</option></select></label>
      <label v-if="selectedWidget.type === 'metric'"><span>预警阈值</span><input :value="selectedWidget.threshold || 40" type="number" min="0" max="100" class="daisy-input daisy-input-bordered daisy-input-sm" @input="updateSelected({ threshold: Number(($event.target as HTMLInputElement).value) })" /></label>
      <fieldset><legend>强调色</legend><div class="accent-options"><button v-for="color in ['green','blue','amber'] as const" :key="color" :class="[color, { active: selectedWidget?.accent === color }]" @click="updateSelected({ accent: color })"></button></div></fieldset>
      <fieldset v-if="selectedWidget.type === 'irrigation' || selectedWidget.type === 'greenhouse'"><legend>显示大棚</legend><div class="entity-options"><label v-for="entity in sceneEntities.filter(item => item.type === 'greenhouse')" :key="entity.id"><input type="checkbox" class="daisy-checkbox daisy-checkbox-success daisy-checkbox-xs" :checked="selectedWidget.entityIds.includes(entity.id)" @change="toggleEntity(entity.id, ($event.target as HTMLInputElement).checked)" />{{ Number(entity.id.slice(-2)) }}号</label></div></fieldset>
      <p>拖动白板中的卡片可以调整顺序，修改会自动保存。</p>
    </aside>
    </Transition>

    <div class="daisy-drawer daisy-drawer-end component-drawer" :class="{ open: libraryOpen }">
      <input type="checkbox" class="daisy-drawer-toggle" :checked="libraryOpen" />
      <div v-if="libraryOpen" class="drawer-mask" @click="libraryOpen = false"></div>
      <aside class="daisy-drawer-side library-panel">
        <header><div><small>DaisyUI 组件库</small><h3>添加农业组件</h3></div><button class="daisy-btn daisy-btn-sm daisy-btn-circle daisy-btn-ghost" @click="libraryOpen = false">×</button></header>
        <p>选择组件后加入当前白板，可继续调整尺寸和内容。</p>
        <div class="library-grid"><button v-for="item in widgetLibrary" :key="item.type" class="daisy-card daisy-card-bordered" @click="add(item.type)"><WorkbenchWidgetIcon :type="item.type"/><strong>{{ item.name }}</strong><small>{{ item.description }}</small><em>添加到画布 <b>＋</b></em></button></div>
      </aside>
    </div>
  </section>
</template>

<style scoped lang="scss">
.single-metric{display:flex;height:125px;flex-direction:column;justify-content:center}.single-metric>strong{color:#285038;font-size:34px;line-height:1}.single-metric>span{align-self:flex-start;margin:9px 0;color:#48935c;font-size:10px}.single-metric>span.down{color:#ca704b}.single-metric progress{height:6px}.single-metric footer{display:flex;justify-content:space-between;margin-top:8px;color:#899487}.live-dot{color:#438358;font-size:9px}.trend-current{color:#326342;font-size:17px}.atomic-trend svg{width:100%;height:105px}.atomic-trend path{fill:none;stroke:#dfe8dd;stroke-width:1}.atomic-trend polyline{fill:none;stroke:#4d9962;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.atomic-trend footer{display:flex;justify-content:space-between;color:#899487;font-size:8px}.schedule-list{display:flex;flex-direction:column}.schedule-list>div{display:grid;grid-template-columns:38px 10px 1fr auto;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #edf1eb}.schedule-list time{color:#718070;font-size:9px}.schedule-list i{width:8px;height:8px;border-radius:50%;background:#bdc7bc}.schedule-list i.done{background:#55a66b}.schedule-list i.running{background:#4c9db4;box-shadow:0 0 0 4px rgba(76,157,180,.13)}.schedule-list span{display:flex;flex-direction:column}.schedule-list strong{font-size:10px}.schedule-list small,.schedule-list em{color:#899487;font:normal 8px sans-serif}.task-list{display:flex;flex-direction:column;gap:7px}.task-list label{display:flex;align-items:center;gap:9px;padding:8px;border-radius:10px;background:#f4f7f2}.task-list span{display:flex;flex-direction:column}.task-list strong{font-size:10px}.task-list small{margin-top:2px;color:#899487;font-size:8px}.insight-card{padding:13px;border-radius:14px;background:linear-gradient(145deg,#edf6ed,#f8faf7)}.insight-card>strong{color:#2f5b3b;font-size:14px}.insight-card p{margin:8px 0;color:#617064;font-size:10px;line-height:1.7}.insight-card>div{display:flex;align-items:center;justify-content:space-between}.insight-card span{color:#829083;font-size:8px}.density-compact{padding:11px}.density-compact .widget-title{margin-bottom:8px}.density-compact .device-list>div,.density-compact .schedule-list>div{padding:4px 0}
.management-menu{z-index:50;width:190px;padding:7px;border:1px solid #dfe8dd;border-radius:13px;background:#fff;color:#3c5140;box-shadow:0 16px 38px rgba(25,55,31,.18)}.management-menu button{font-size:11px}.management-menu .danger{color:#b64d45}
/* Workbench layout foundation. Keep these rules explicit: later layers only refine them. */
.personal-workbench{min-height:0;flex:1;display:flex;flex-direction:column;padding:0 24px 12px;overflow:hidden}
.workbench-head{display:flex;align-items:center;justify-content:space-between;padding:9px 2px 13px}
.workbench-head h2{margin:7px 0 2px;color:#203f2a;font:700 22px/1.2 var(--font-display)}
.workbench-head small{color:#7c897b;font-size:11px}
.head-actions{display:flex;align-items:center;gap:7px}
.title-input{display:block;margin-top:7px;width:240px;background:white;color:#294631}
.widget-grid{min-height:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-flow:dense;gap:12px;overflow:auto;padding:2px 3px 22px}
.widget-card{position:relative;display:flex;min-width:0;flex-direction:column;grid-column:span 2;padding:16px;border:1px solid rgba(50,85,55,.12);border-top:3px solid #5a9a69;border-radius:19px;background:rgba(255,255,255,.88);box-shadow:0 12px 28px rgba(37,66,40,.08);overflow:hidden;transition:opacity .2s,transform .2s}
.widget-card.accent-blue{border-top-color:#5394a8}.widget-card.accent-amber{border-top-color:#d69a3d}.widget-card.dragging{opacity:.35;transform:scale(.97)}
.widget-small{grid-column:span 1}.widget-medium{grid-column:span 2}.widget-wide{grid-column:1/-1}
.editing .widget-card{cursor:grab;border-style:dashed}.editing .widget-card:active{cursor:grabbing}.editing .widget-card.selected{outline:2px solid #4b9460;outline-offset:2px}
.widget-editor-actions{position:absolute;z-index:3;right:10px;top:10px;display:flex;gap:6px}
.widget-title{display:flex;flex:none;align-items:center;justify-content:space-between;margin-bottom:14px}.widget-title>div{display:flex;align-items:center;gap:10px}.widget-title h3{margin:2px 0 0;color:#284532;font-size:15px}.widget-title small{color:#899387;font-size:9px;letter-spacing:.5px}
.widget-icon{width:36px;height:36px;display:grid;flex:none;place-items:center;border-radius:11px;background:#e9f3e9;color:#3e7b50;font-weight:800}.widget-icon.water{background:#e7f3f6;color:#347e91}.widget-icon.environment{background:#edf3e4;color:#678442}.widget-icon.device{background:#e9eef5;color:#567291}.widget-icon.alert{background:#fff0df;color:#c17627}
.irrigation-table{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.irrigation-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:11px;border:1px solid #e4ebe2;border-radius:13px;background:#f8faf7}.irrigation-row>strong{font-size:12px;color:#314638}.irrigation-row>div{display:flex;flex-direction:column}.irrigation-row>div:nth-of-type(1){grid-column:1/-1}.irrigation-row small{color:#879186;font-size:8px}.irrigation-row b{margin-top:3px;color:#385143;font-size:11px}.irrigation-row progress{height:4px;margin-top:5px}
.summary-stats{width:100%;background:transparent;box-shadow:none}.summary-stats .daisy-stat{padding:15px 10px}.summary-stats .daisy-stat-value{color:#367549;font-size:40px}.summary-stats .small-value{font-size:28px}
.metric-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.metric-cards>div{padding:10px;border-radius:12px;background:#f3f7f1}.metric-cards span,.metric-cards small{font-size:9px;color:#7e897c}.metric-cards strong{display:block;margin:5px 0;color:#31503a;font-size:17px}
.device-list{display:flex;flex-direction:column;gap:5px}.device-list>div{display:flex;align-items:center;gap:8px;padding:7px 5px;border-bottom:1px solid #edf0eb}.device-list i{width:7px;height:7px;flex:none;border-radius:50%;background:#ce695b}.device-list i.online{background:#50a868}.device-list span{min-width:0;display:flex;flex:1;flex-direction:column}.device-list strong,.device-list b{font-size:10px}.device-list small{color:#8b9489;font-size:8px}
.alert-list{display:flex;flex-direction:column;gap:7px}.alert-list .daisy-alert{min-height:0;padding:9px 11px;border-radius:11px;font-size:10px}.alert-list .daisy-alert>div{display:flex;flex-direction:column}.alert-list small{margin-top:2px;font-size:8px}
.greenhouse-focus{display:flex;align-items:center;gap:18px;padding:12px}.greenhouse-focus h4{margin:0;color:#294732;font-size:17px}.greenhouse-focus p{color:#6f7e70;font-size:11px}
.property-panel{position:fixed;z-index:20;right:86px;top:130px;width:260px;padding:16px;border:1px solid rgba(255,255,255,.8);border-radius:18px;background:rgba(249,252,247,.96);box-shadow:0 20px 55px rgba(27,60,34,.2);backdrop-filter:blur(24px)}.property-panel>header{display:flex;align-items:center;justify-content:space-between}.property-panel>header div{display:flex;flex-direction:column}.property-panel>header small,.property-panel label>span,.property-panel legend{color:#7a8779;font-size:9px}.property-panel>header strong{color:#31543a;font-size:13px}.property-panel>label{display:flex;flex-direction:column;gap:4px;margin-top:11px}.property-panel fieldset{margin:12px 0 0;padding:0;border:0}.accent-options{display:flex;gap:8px;margin-top:6px}.accent-options button{width:25px;height:25px;border:3px solid white;border-radius:50%;box-shadow:0 0 0 1px #ccd6ca;cursor:pointer}.accent-options button.active{box-shadow:0 0 0 2px #345f3e}.accent-options .green{background:#559b67}.accent-options .blue{background:#5495aa}.accent-options .amber{background:#d59a3e}.entity-options{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:7px}.entity-options label{display:flex;align-items:center;gap:4px;color:#526052;font-size:10px}.property-panel>p{margin:13px 0 0;color:#8b9589;font-size:9px;line-height:1.5}
.empty-canvas{min-height:280px;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;border:2px dashed #b9c9b8;border-radius:22px;background:rgba(255,255,255,.5);color:#49604c;cursor:pointer}.empty-canvas span{font-size:38px}.empty-canvas strong{font-size:16px}.empty-canvas small{margin-top:7px;color:#879186}
.component-drawer{position:fixed;z-index:60;inset:0;pointer-events:none}.component-drawer.open{pointer-events:auto}.drawer-mask{position:absolute;inset:0;background:rgba(25,45,29,.3);backdrop-filter:blur(3px)}.library-panel{position:absolute;right:0;top:0;bottom:0;width:min(410px,92vw);display:block;padding:23px;background:#f8fbf6;box-shadow:-20px 0 60px rgba(26,49,30,.2);transform:translateX(105%);transition:.25s}.open .library-panel{transform:none}.library-panel>header{display:flex;align-items:center;justify-content:space-between}.library-panel h3{margin:3px 0;font-size:21px}.library-panel header small,.library-panel>p{color:#7d897b;font-size:11px}.library-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.library-grid button{min-height:145px;padding:15px;align-items:flex-start;background:white;color:#314637;text-align:left}.library-grid button>span{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:#eaf3e8;color:#438057;font-weight:800}.library-grid strong{margin-top:8px;font-size:13px}.library-grid small{color:#849083;font-size:9px}.library-grid em{margin-top:auto;color:#418055;font:normal 9px sans-serif}
/* Premium data-card layer: neutral surfaces, semantic color, clearer hierarchy. */
.summary-layout{display:grid;grid-template-columns:112px 1fr;align-items:center;gap:12px}.health-donut{position:relative;width:104px;height:104px;display:grid;place-items:center;border-radius:50%;background:conic-gradient(#4d9b63 var(--health),rgba(61,91,68,.09) 0);animation:donut-in .9s cubic-bezier(.2,.8,.2,1)}.health-donut::before{content:"";position:absolute;inset:10px;border:1px solid rgba(56,99,66,.08);border-radius:50%;background:rgba(250,252,249,.96);box-shadow:inset 0 4px 14px rgba(33,67,41,.06)}.health-donut span{position:relative;display:flex;flex-direction:column;align-items:center}.health-donut strong{color:#254c31;font-size:25px}.health-donut small{color:#879188;font-size:8px}@keyframes donut-in{from{opacity:0;transform:rotate(-35deg) scale(.72)}}.device-switch{position:relative;width:34px;height:19px;padding:0;border:0;border-radius:99px;background:#d3dad3;cursor:pointer;transition:.25s}.device-switch b{position:absolute;left:3px;top:3px;width:13px;height:13px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.18);transition:.25s}.device-switch.on{background:#4c9a62}.device-switch.on b{transform:translateX(15px)}.device-switch:disabled{opacity:.45;cursor:not-allowed}.schedule-action,.alert-list .daisy-alert>button{padding:4px 8px;border:1px solid #cfe1d1;border-radius:8px;background:#f3f9f3;color:#3d7e50;font-size:8px;font-weight:650;cursor:pointer}.schedule-action.stop{border-color:#edcfca;background:#fff3f0;color:#b45f50}.alert-list .daisy-alert>button{margin-left:auto;border-color:#ead8bd;background:#fff;color:#9b6725}.schedule-action:disabled,.alert-list button:disabled{opacity:.45}.widget-card>*{animation:card-content-in .48s cubic-bezier(.2,.8,.2,1) both}@keyframes card-content-in{from{opacity:0;transform:translateY(7px);filter:blur(3px)}}
.widget-grid{gap:14px;padding:4px 5px 26px}.widget-card{isolation:isolate;padding:18px;border:1px solid rgba(31,65,40,.09);border-top:1px solid rgba(31,65,40,.09);border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(248,251,247,.94));box-shadow:0 1px 2px rgba(21,48,29,.04),0 10px 28px rgba(21,48,29,.07);transition:border-color .2s,box-shadow .25s,transform .25s}.widget-card::before{content:"";position:absolute;z-index:-1;inset:0 auto 0 0;width:3px;background:#4b9660;opacity:.8}.widget-card::after{content:"";position:absolute;z-index:-1;right:-45px;top:-55px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(74,150,94,.08),transparent 68%);pointer-events:none}.widget-card.accent-blue::before{background:#478da4}.widget-card.accent-blue::after{background:radial-gradient(circle,rgba(63,143,168,.1),transparent 68%)}.widget-card.accent-amber::before{background:#c78631}.widget-card.accent-amber::after{background:radial-gradient(circle,rgba(199,134,49,.1),transparent 68%)}.widget-card:hover{border-color:rgba(47,103,62,.18);box-shadow:0 2px 4px rgba(21,48,29,.04),0 18px 42px rgba(21,48,29,.11);transform:translateY(-2px)}.widget-title{position:relative;z-index:1;margin-bottom:16px}.widget-title h3{margin-top:3px;color:#203b28;font-size:14px;font-weight:720;letter-spacing:-.1px}.widget-title small{color:#89948a;font-size:9px;font-weight:550;letter-spacing:.8px;text-transform:uppercase}.sync-badge,.status-pill,.ai-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border:1px solid #dce8dc;border-radius:999px;background:#f5f9f4;color:#51705a;font-size:8px;font-weight:650}.sync-badge i{width:6px;height:6px;border-radius:50%;background:#51a56a;box-shadow:0 0 0 3px rgba(81,165,106,.12)}.status-pill.warning{border-color:#f0dfc8;background:#fff8ed;color:#a66c27}.status-pill.info{border-color:#d7e9ef;background:#f2f9fb;color:#397c92}.ai-chip{border-color:#e1dcf1;background:#f7f4ff;color:#67559b}.irrigation-row{padding:12px;border-color:#e8eee7;border-radius:12px;background:rgba(248,250,247,.72);transition:.2s}.irrigation-row:hover{border-color:#cfe0d1;background:#fff;box-shadow:0 7px 18px rgba(31,67,39,.07)}.irrigation-row>strong{font-size:11px}.metric-value{display:flex;align-items:flex-end;justify-content:space-between}.metric-value strong{color:#203e2a;font-size:32px;font-weight:740;letter-spacing:-1px}.metric-value span{margin-bottom:3px;padding:4px 7px;border-radius:999px;background:#edf7ef;color:#438659;font-size:8px;font-weight:650}.metric-value span.down{background:#fff1ed;color:#bf6748}.single-metric{height:132px;justify-content:flex-start}.single-metric>svg{width:100%;height:49px;margin:2px 0 -2px;overflow:visible}.single-metric>svg polyline{fill:none;stroke:#4b9961;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.single-metric progress{height:4px}.atomic-trend{padding:5px 1px}.atomic-trend svg{height:100px}.schedule-list>div{padding:7px 2px}.task-list label{border:1px solid transparent;background:#f7f9f6;transition:.2s}.task-list label:hover{border-color:#dbe7da;background:#fff}.insight-card{position:relative;padding:15px 16px;border:1px solid #e4e0f0;background:linear-gradient(145deg,#faf8ff,#f3f7f2);overflow:hidden}.insight-card::after{content:"✦";position:absolute;right:13px;top:7px;color:rgba(104,84,158,.12);font-size:52px}.insight-card>strong{position:relative;z-index:1;color:#34463a;font-size:13px}.insight-card p{position:relative;z-index:1;color:#637068;font-size:10px}.library-panel{padding:26px;background:linear-gradient(160deg,#fbfdf9,#f2f7f1)}.library-grid{gap:12px}.library-grid button{position:relative;min-height:154px;padding:16px;border-color:#e1e9df;border-radius:15px;background:rgba(255,255,255,.9);box-shadow:0 4px 14px rgba(27,60,34,.04);transition:.22s}.library-grid button:hover{border-color:#bcd3bf;box-shadow:0 13px 28px rgba(27,60,34,.11);transform:translateY(-3px)}.library-grid button>strong{margin-top:10px;color:#2c4734;font-size:12px}.library-grid button>small{margin-top:3px;color:#879187;line-height:1.55}.library-grid button>em{width:100%;display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid #edf1eb;color:#4a8158}.library-grid button>em b{font-size:15px}.summary-stats{border:1px solid #edf1eb;border-radius:14px;background:#fafbf9}.device-list>div{padding:8px 5px}.alert-list .daisy-alert{border:1px solid rgba(195,137,69,.12);background:#fff9ef;color:#604c35;box-shadow:none}
/* Liquid glass surface shared by all workspace cards. */
.widget-card{border-color:rgba(255,255,255,.72);background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(235,244,235,.48));box-shadow:0 18px 46px rgba(22,55,31,.13),inset 0 1px 0 rgba(255,255,255,.94),inset 0 -1px 0 rgba(79,119,87,.08);backdrop-filter:blur(30px) saturate(145%)}.widget-card::after{background:radial-gradient(circle,rgba(255,255,255,.55),transparent 68%)}.irrigation-row,.summary-stats,.task-list label{background:rgba(255,255,255,.48);backdrop-filter:blur(12px)}
/* Large-screen workbench: fewer columns and larger type keep operational data readable. */
.personal-workbench{padding:0 14px 16px}.workbench-head{padding:10px 4px 16px}.workbench-head h2{font-size:25px}.workbench-head small{font-size:12px}
.head-actions :deep(.daisy-btn){min-height:36px;height:36px;font-size:12px}
.widget-grid{grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-flow:dense;grid-auto-rows:340px;align-items:stretch;gap:16px;padding:3px 5px 34px;scrollbar-gutter:stable}
.widget-card{min-width:0;height:340px;min-height:0;padding:20px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:rgba(72,126,84,.32) transparent;border-radius:22px}
.widget-card::-webkit-scrollbar{width:6px}.widget-card::-webkit-scrollbar-track{background:transparent}.widget-card::-webkit-scrollbar-thumb{border-radius:99px;background:rgba(72,126,84,.28)}
.widget-small{grid-column:span 1}.widget-medium{grid-column:span 2}.widget-wide{grid-column:1/-1}
.widget-title{margin-bottom:18px}.widget-title h3{font-size:16px}.widget-title small{font-size:10px}.widget-icon{width:40px;height:40px;border-radius:13px}
.irrigation-table{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.irrigation-row{padding:14px}.irrigation-row>strong{font-size:13px}.irrigation-row small{font-size:10px}.irrigation-row b{font-size:12px}
.summary-layout{grid-template-columns:120px 1fr;gap:16px}.summary-stats .daisy-stat{padding:17px 13px}.summary-stats .daisy-stat-title{font-size:11px}.summary-stats .daisy-stat-value{font-size:42px}.summary-stats .daisy-stat-desc{font-size:10px}
.metric-cards>div{padding:13px}.metric-cards span,.metric-cards small{font-size:10px}.metric-cards strong{font-size:20px}
.single-metric{height:170px}.metric-value strong{font-size:38px}.metric-value span{font-size:10px}.single-metric footer{font-size:10px}
.device-list{gap:7px}.device-list>div{padding:10px 6px}.device-list strong,.device-list b{font-size:12px}.device-list small{font-size:10px}
.schedule-list>div{grid-template-columns:46px 12px 1fr auto;gap:10px;padding:10px 2px}.schedule-list time{font-size:10px}.schedule-list strong{font-size:12px}.schedule-list small,.schedule-list em{font-size:10px}.schedule-action,.alert-list .daisy-alert>button{padding:6px 10px;font-size:10px}
.alert-list{gap:9px}.alert-list .daisy-alert{padding:12px 13px;font-size:12px}.alert-list small{font-size:10px}
.task-list strong{font-size:12px}.task-list small{font-size:10px}.insight-card>strong{font-size:15px}.insight-card p{font-size:12px}.insight-card span{font-size:10px}
/* Size-specific composition keeps the three card sizes meaningfully different. */
.widget-card>*{min-width:0}.widget-title>div,.widget-title>div>div,.device-list span,.schedule-list span,.alert-list .daisy-alert>div{min-width:0}.widget-title h3,.device-list small,.schedule-list small,.alert-list strong,.alert-list small{overflow-wrap:anywhere}.sync-badge,.status-pill,.ai-chip,.schedule-action,.device-switch{flex:0 0 auto}
.widget-small .widget-title{align-items:flex-start;gap:8px}.widget-small .widget-title>div{gap:8px}.widget-small .widget-icon{width:36px;height:36px}.widget-small .sync-badge,.widget-small .status-pill,.widget-small .ai-chip{padding:4px 6px}
.widget-small .irrigation-table{grid-template-columns:1fr}.widget-medium .irrigation-table{grid-template-columns:repeat(2,minmax(0,1fr))}.widget-wide .irrigation-table{grid-template-columns:repeat(3,minmax(0,1fr))}
.widget-small .summary-layout{grid-template-columns:1fr;justify-items:center}.widget-small .summary-stats{display:grid;grid-template-columns:1fr;width:100%}.widget-small .summary-stats .daisy-stat{width:100%;padding:11px 13px}.widget-small .summary-stats .daisy-stat-value{font-size:30px}.widget-medium .summary-layout{grid-template-columns:110px minmax(0,1fr)}
.widget-small .metric-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.widget-small .metric-cards>div{min-width:0;padding:10px}.widget-small .metric-cards strong{font-size:17px;overflow-wrap:anywhere}
.widget-small .greenhouse-focus{align-items:flex-start;flex-direction:column;gap:10px}.widget-small .schedule-list>div{grid-template-columns:42px 10px minmax(0,1fr)}.widget-small .schedule-action{grid-column:3;justify-self:start}.widget-small .alert-list .daisy-alert{align-items:flex-start;flex-wrap:wrap}.widget-small .alert-list .daisy-alert>button{margin-left:25px}
.widget-medium .metric-cards,.widget-wide .metric-cards{grid-template-columns:repeat(3,minmax(0,1fr))}.widget-wide.widget-type-environment .metric-cards{grid-template-columns:repeat(5,minmax(0,1fr))}
.property-panel{position:fixed;max-height:calc(100vh - 20px);overflow:auto;overscroll-behavior:contain}.property-panel-handle{margin:-8px -8px 4px;padding:8px;border-radius:12px;cursor:grab;touch-action:none;user-select:none;transition:background .22s ease}.property-panel-handle:hover{background:rgba(72,126,84,.08)}.property-panel-handle:active{cursor:grabbing;background:rgba(72,126,84,.13)}:global(body.property-panel-dragging){cursor:grabbing!important;user-select:none}:global(body.property-panel-dragging *){cursor:grabbing!important}
@media(max-width:1500px){.widget-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.widget-medium{grid-column:span 2}.widget-wide{grid-column:1/-1}}
@media(max-width:1100px){.widget-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.widget-medium{grid-column:span 2}.widget-wide{grid-column:1/-1}.widget-wide.widget-type-environment .metric-cards{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:760px){.widget-grid{display:flex}.widget-card{width:100%;min-height:240px}.workbench-head h2{font-size:21px}.irrigation-table,.widget-medium .irrigation-table,.widget-wide .irrigation-table{grid-template-columns:1fr}.widget-medium .summary-layout,.widget-wide .summary-layout{grid-template-columns:1fr;justify-items:center}.widget-medium .metric-cards,.widget-wide .metric-cards,.widget-wide.widget-type-environment .metric-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* Motion system for canvas editing and live controls. */
.workbench-head>*{animation:head-enter .46s cubic-bezier(.22,.8,.2,1) both}@keyframes head-enter{from{opacity:0;transform:translateY(-10px);filter:blur(4px)}}
.widget-move,.widget-enter-active,.widget-leave-active{transition:opacity .36s ease,transform .48s cubic-bezier(.22,.8,.2,1),filter .32s ease}
.widget-enter-from{opacity:0;transform:translateY(22px) scale(.94);filter:blur(7px)}.widget-leave-to{opacity:0;transform:scale(.9);filter:blur(5px)}.widget-leave-active{position:absolute}
.widget-card{transition:border-color .28s ease,box-shadow .38s ease,transform .38s cubic-bezier(.22,.8,.2,1),opacity .3s ease,grid-column .42s cubic-bezier(.22,.8,.2,1)}
.widget-card:hover{transform:translateY(-5px)}.editing .widget-card:hover{transform:translateY(-3px) scale(1.004)}
.widget-editor-actions,.title-input{animation:control-pop .3s cubic-bezier(.22,.8,.2,1)}@keyframes control-pop{from{opacity:0;transform:translateY(-7px) scale(.92)}}
.empty-canvas{animation:canvas-enter .55s cubic-bezier(.22,.8,.2,1);transition:border-color .3s ease,background .3s ease,box-shadow .35s ease,transform .38s cubic-bezier(.22,.8,.2,1)}.empty-canvas:hover{transform:translateY(-4px);border-color:#6ba47a;background:rgba(255,255,255,.68);box-shadow:0 20px 48px rgba(24,66,36,.13)}@keyframes canvas-enter{from{opacity:0;transform:scale(.975);filter:blur(7px)}}
.property-panel-enter-active,.property-panel-leave-active{transition:opacity .3s ease,transform .4s cubic-bezier(.22,.8,.2,1),filter .3s ease}.property-panel-enter-from,.property-panel-leave-to{opacity:0;transform:translateX(24px) scale(.96);filter:blur(5px)}
.component-drawer{transition:background .3s ease}.drawer-mask{animation:drawer-mask-in .3s ease}@keyframes drawer-mask-in{from{opacity:0}}.library-panel{transition:transform .48s cubic-bezier(.22,.8,.2,1),box-shadow .4s ease}.open .library-panel{animation:drawer-content-in .55s .08s cubic-bezier(.22,.8,.2,1) both}@keyframes drawer-content-in{from{opacity:.25;filter:blur(6px)}}
.library-grid button,.head-actions button,.management-menu button,.device-switch,.schedule-action,.alert-list button,.accent-options button{transition:color .22s ease,background .24s ease,border-color .24s ease,box-shadow .3s ease,transform .3s cubic-bezier(.22,.8,.2,1),opacity .22s ease}
.head-actions button:hover,.schedule-action:hover,.alert-list button:hover{transform:translateY(-2px)}button:active{transform:scale(.96)!important;transition-duration:.08s!important}
.device-switch b{transition:transform .32s cubic-bezier(.22,.8,.2,1),box-shadow .25s ease}.device-switch.on{box-shadow:0 0 0 4px rgba(76,154,98,.1)}
.daisy-progress::-webkit-progress-value{transition:width .7s cubic-bezier(.22,.8,.2,1)}
@media(prefers-reduced-motion:reduce){.personal-workbench *,.personal-workbench *::before,.personal-workbench *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
</style>
