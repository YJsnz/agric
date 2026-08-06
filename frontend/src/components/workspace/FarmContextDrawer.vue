<script setup lang="ts">
import { computed, onMounted, reactive, ref, watchEffect } from 'vue'
import type { BusinessModule, DeviceInput, SceneEntity, ZoneInput } from '@/types'
import { alerts, dashboardSummary, deviceRecords, environmentMetrics, farmZones, irrigationUnits, sceneEntities } from '@/data/farm'
import { createFarmDevice, createFarmZone, deleteFarmDevice, deleteFarmZone, fetchMetricThresholds, handleFarmAlert, runDeviceSelfTest, saveSoilMoistureThreshold, setDeviceEnabled, setIrrigationEnabled, simulateSoilMoisture, updateFarmDevice, updateFarmZone } from '@/api/dashboard'

const props = defineProps<{ entity?: SceneEntity; open: boolean; module: BusinessModule }>()
const emit = defineEmits<{
  (event: 'close'): void
  (event: 'select', id: string): void
  (event: 'action', label: string): void
  (event: 'enter-greenhouse', id: string): void
  (event: 'refresh'): void
  (event: 'irrigate', entityId: string): void
}>()
const devicePower = reactive(Object.fromEntries(deviceRecords.map(item => [item.entityId, item.enabled])) as Record<string, boolean>)
const irrigationPower = reactive(Object.fromEntries(irrigationUnits.map(item => [item.entityId, item.enabled])) as Record<string, boolean>)
watchEffect(() => deviceRecords.forEach(item => { devicePower[item.entityId] = item.enabled }))
watchEffect(() => irrigationUnits.forEach(item => { irrigationPower[item.entityId] = item.enabled }))
const duration = ref(18)
const alertBusyId = ref<number | null>(null)
const selectedDeviceEntityId = ref('')
const deviceEditorOpen = ref(false)
const editingEntityId = ref<string | null>(null)
const deviceSaving = ref(false)
const deleteArmed = ref(false)
const deviceForm = reactive<DeviceInput>({ id: '', entityId: '', name: '', category: 'sensor', location: '', online: true, enabled: false, currentValue: '暂无数据' })
const soilThreshold = ref(40)
const thresholdEnabled = ref(true)
const thresholdSaving = ref(false)
const simulationBusy = ref(false)
const zoneEditorOpen = ref(false)
const editingZoneId = ref<string | null>(null)
const zoneSaving = ref(false)
const zoneDeleteArmed = ref(false)
const zoneForm = reactive<ZoneInput>({ id: '', name: '', crop: '', area: '', stage: '', environment: '', health: 90, mapX: 72, mapY: 68, polygon: [] })
const selectedDevice = computed(() => deviceRecords.find(item => item.entityId === selectedDeviceEntityId.value)
  || deviceRecords.find(item => item.entityId === props.entity?.id) || deviceRecords[0])
const selectedUnit = computed(() => irrigationUnits.find(item => item.entityId === props.entity?.id) || irrigationUnits[0])
const activeSoilAlert = computed(() => alerts.find(item => item.entityId === selectedUnit.value?.entityId
  && item.title.includes('土壤湿度') && !['已处理', '已恢复'].includes(item.status)))
const soilMoisture = computed(() => environmentMetrics.find(item => item.label === '土壤湿度')?.value || '--')
watchEffect(() => { duration.value = selectedUnit.value?.durationMinutes || 18 })
const selectedZone = computed(() => farmZones.find(item => item.entityId === props.entity?.id))
const cropZone = computed(() => selectedZone.value || farmZones[0] || { id: '', entityId: '', polygon: [], crop: '暂无种植区', area: '--', stage: '--', environment: '--' })
const metricIcons = [
  'M12 3a3 3 0 0 0-3 3v7.2a4.5 4.5 0 1 0 6 0V6a3 3 0 0 0-3-3Zm0 5v7',
  'M12 3C8.7 7.4 7 10 7 13a5 5 0 0 0 10 0c0-3-1.7-5.6-5-10Zm-2.5 11.5c.6 1 1.4 1.5 2.7 1.5',
  'M4 17c4-6 9-9 16-10M6 12c3 0 5 1 7 4M12 9c2 0 4 .8 6 3M4 20h16',
  'M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z',
  'M7 17c-2-1-3-2.7-3-5 0-3.3 2.7-6 6-6 .7-1.8 2.4-3 4.5-3C17.5 3 20 5.5 20 9c0 2.1-1.1 4-2.8 5M8 20h8M10 16h4'
]
const title = computed(() => ({ overview: props.entity?.name || '农场运行总览', environment: '农场环境中心', devices: '设备管理中心', irrigation: '智慧灌溉控制', crops: props.entity?.name || '作物生长档案', alerts: '农场告警中心', monitoring: '园区监控' })[props.module])

onMounted(async () => {
  try {
    const threshold = (await fetchMetricThresholds()).find(item => item.metricKey === 'soilMoisture')
    if (threshold) { soilThreshold.value = threshold.minimumValue; thresholdEnabled.value = threshold.enabled }
  } catch (error) { emit('action', error instanceof Error ? error.message : '阈值读取失败') }
})

function openNewDevice() {
  editingEntityId.value = null
  Object.assign(deviceForm, { id: `dev-${Date.now().toString().slice(-6)}`, entityId: '', name: '', category: 'sensor', location: '', online: true, enabled: false, currentValue: '暂无数据' })
  deleteArmed.value = false
  deviceEditorOpen.value = true
}

function polygonAt(x: number, y: number): Array<[number, number]> {
  const cx = x / 100 * 1535; const cy = y / 100 * 1024
  const halfWidth = 92; const halfHeight = 58
  return [[cx-halfWidth,cy-halfHeight],[cx+halfWidth,cy-halfHeight],[cx+halfWidth,cy+halfHeight],[cx-halfWidth,cy+halfHeight]]
    .map(([px,py]) => [Math.round(Math.max(10,Math.min(1525,px))),Math.round(Math.max(10,Math.min(1014,py)))] as [number, number])
}

function openNewZone() {
  const number = Math.max(6, ...farmZones.map(item => Number(item.entityId.match(/\d+$/)?.[0] || 0))) + 1
  editingZoneId.value = null
  Object.assign(zoneForm, { id: `field-${String(number).padStart(2,'0')}`, name: `${number}号种植区`, crop: '', area: '', stage: '定植期', environment: '环境状态正常', health: 90, mapX: 72, mapY: 68, polygon: [] })
  zoneDeleteArmed.value = false; zoneEditorOpen.value = true
}

function openZoneEditor() {
  const zone = selectedZone.value; const item = props.entity
  if (!zone || !item || item.type !== 'field') { openNewZone(); return }
  editingZoneId.value = item.id
  Object.assign(zoneForm, { id: item.id, name: item.name, crop: zone.crop, area: zone.area, stage: zone.stage, environment: zone.environment, health: item.health || 90, mapX: item.x, mapY: item.y, polygon: zone.polygon })
  zoneDeleteArmed.value = false; zoneEditorOpen.value = true
}

async function saveZone() {
  if (!zoneForm.id.trim() || !zoneForm.name.trim() || !zoneForm.crop.trim() || !zoneForm.area.trim() || !zoneForm.stage.trim() || !zoneForm.environment.trim()) { emit('action','请完整填写种植区资料'); return }
  zoneSaving.value = true
  try {
    const payload: ZoneInput = { ...zoneForm, polygon: polygonAt(Number(zoneForm.mapX), Number(zoneForm.mapY)) }
    const saved = editingZoneId.value ? await updateFarmZone(editingZoneId.value, payload) : await createFarmZone(payload)
    const zoneIndex = farmZones.findIndex(item => item.entityId === editingZoneId.value)
    if (zoneIndex >= 0) farmZones.splice(zoneIndex, 1, saved); else farmZones.push(saved)
    const entity: SceneEntity = { id: payload.id, name: payload.name, type: 'field', status: 'normal', metric: payload.environment, x: payload.mapX, y: payload.mapY, health: payload.health, position3D: { x: (payload.mapX-50)*.65, y: 0, z: (payload.mapY-50)*.55 } }
    const entityIndex = sceneEntities.findIndex(item => item.id === editingZoneId.value)
    if (entityIndex >= 0) sceneEntities.splice(entityIndex, 1, entity); else sceneEntities.push(entity)
    editingZoneId.value = saved.entityId; zoneEditorOpen.value = false
    emit('select', saved.entityId); emit('action', `${payload.name}${zoneIndex >= 0 ? '资料和地图位置已更新' : '已添加到农场地图'}`)
  } catch (error) { emit('action', error instanceof Error ? error.message : '种植区保存失败') }
  finally { zoneSaving.value = false }
}

async function removeZone() {
  if (!editingZoneId.value) return
  if (!zoneDeleteArmed.value) { zoneDeleteArmed.value = true; return }
  zoneSaving.value = true
  try {
    await deleteFarmZone(editingZoneId.value)
    const zoneIndex = farmZones.findIndex(item => item.entityId === editingZoneId.value); if (zoneIndex >= 0) farmZones.splice(zoneIndex,1)
    const entityIndex = sceneEntities.findIndex(item => item.id === editingZoneId.value); if (entityIndex >= 0) sceneEntities.splice(entityIndex,1)
    irrigationUnits.filter(item => item.entityId === editingZoneId.value).forEach(item => irrigationUnits.splice(irrigationUnits.indexOf(item),1))
    zoneEditorOpen.value = false; emit('close'); emit('action','种植区已从地图移除，历史告警仍然保留')
  } catch (error) { zoneDeleteArmed.value = false; emit('action', error instanceof Error ? error.message : '种植区删除失败') }
  finally { zoneSaving.value = false }
}

function selectDevice(entityId: string) {
  selectedDeviceEntityId.value = entityId
  emit('select', entityId)
}

function openDeviceEditor() {
  const item = selectedDevice.value
  editingEntityId.value = item.entityId
  Object.assign(deviceForm, { id: item.id, entityId: item.entityId, name: item.name, category: item.category, location: item.location, online: item.online, enabled: item.enabled, currentValue: item.value })
  deleteArmed.value = false
  deviceEditorOpen.value = true
}

async function saveDevice() {
  if (!deviceForm.entityId.trim() || !deviceForm.name.trim() || !deviceForm.location.trim()) { emit('action', '请完整填写实体编号、名称和位置'); return }
  deviceSaving.value = true
  try {
    const updated = editingEntityId.value ? await updateFarmDevice(editingEntityId.value, deviceForm) : await createFarmDevice(deviceForm)
    const index = deviceRecords.findIndex(item => item.entityId === editingEntityId.value)
    if (index >= 0) deviceRecords.splice(index, 1, updated); else deviceRecords.push(updated)
    selectedDeviceEntityId.value = updated.entityId
    devicePower[updated.entityId] = updated.enabled
    dashboardSummary.totalDevices = deviceRecords.length
    dashboardSummary.onlineDevices = deviceRecords.filter(item => item.online).length
    dashboardSummary.runningDevices = deviceRecords.filter(item => item.online && item.enabled).length
    deviceEditorOpen.value = false
    emit('action', `${updated.name}${editingEntityId.value ? '资料已更新' : '已添加到设备中心'}`)
  } catch (error) { emit('action', error instanceof Error ? error.message : '设备保存失败') }
  finally { deviceSaving.value = false }
}

async function removeDevice() {
  if (!deleteArmed.value) { deleteArmed.value = true; return }
  if (!editingEntityId.value) return
  deviceSaving.value = true
  try {
    await deleteFarmDevice(editingEntityId.value)
    const index = deviceRecords.findIndex(item => item.entityId === editingEntityId.value)
    if (index >= 0) deviceRecords.splice(index, 1)
    selectedDeviceEntityId.value = deviceRecords[0]?.entityId || ''
    dashboardSummary.totalDevices = deviceRecords.length
    dashboardSummary.onlineDevices = deviceRecords.filter(item => item.online).length
    dashboardSummary.runningDevices = deviceRecords.filter(item => item.online && item.enabled).length
    deviceEditorOpen.value = false
    emit('action', '设备已解绑并从设备列表移除')
  } catch (error) { emit('action', error instanceof Error ? error.message : '设备解绑失败') }
  finally { deviceSaving.value = false }
}

async function saveThreshold() {
  thresholdSaving.value = true
  try {
    const saved = await saveSoilMoistureThreshold(Number(soilThreshold.value), thresholdEnabled.value)
    soilThreshold.value = saved.minimumValue
    emit('action', saved.enabled ? `土壤湿度低于 ${saved.minimumValue}% 时将自动告警` : '土壤湿度阈值告警已停用')
  } catch (error) { emit('action', error instanceof Error ? error.message : '阈值保存失败') }
  finally { thresholdSaving.value = false }
}

async function runLowMoistureSimulation() {
  simulationBusy.value = true
  try {
    await simulateSoilMoisture(30)
    emit('refresh')
    emit('action', '模拟采集完成：土壤湿度 30%，已触发阈值告警')
  } catch (error) { emit('action', error instanceof Error ? error.message : '湿度模拟失败') }
  finally { simulationBusy.value = false }
}

async function toggleDevice(id: string) {
  const previous = devicePower[id]
  devicePower[id] = !previous
  try {
    const updated = await setDeviceEnabled(id, devicePower[id])
    const record = deviceRecords.find(item => item.entityId === id)
    if (record) Object.assign(record, updated)
    dashboardSummary.runningDevices = deviceRecords.filter(item => item.online && item.enabled).length
    emit('action', `${updated.name}${updated.enabled ? '已开启' : '已关闭'}`)
  } catch (error) {
    devicePower[id] = previous
    emit('action', error instanceof Error ? error.message : '设备控制失败')
  }
}
async function toggleIrrigation(id: string) {
  const unit = irrigationUnits.find(item => item.entityId === id)
  if (!unit) return
  const previous = irrigationPower[id]
  irrigationPower[id] = !previous
  try {
    const updated = await setIrrigationEnabled(unit.id, irrigationPower[id], Number(duration.value))
    Object.assign(unit, updated)
    if (updated.enabled && updated.entityId.startsWith('field-')) {
      emit('refresh')
      emit('action', `${updated.name}已开启，模拟灌溉完成：${updated.target}土壤湿度恢复至 90%`)
      return
    }
    emit('action', `${updated.name}${updated.enabled ? '开始灌溉' : '停止灌溉'}`)
  } catch (error) {
    irrigationPower[id] = previous
    emit('action', error instanceof Error ? error.message : '灌溉控制失败')
  }
}
async function saveIrrigationPlan() {
  const unit = selectedUnit.value
  try {
    const shouldRecoverSoilAlert = Boolean(activeSoilAlert.value)
    const updated = await setIrrigationEnabled(unit.id, shouldRecoverSoilAlert ? true : irrigationPower[unit.entityId], Number(duration.value))
    Object.assign(unit, updated)
    irrigationPower[unit.entityId] = updated.enabled
    if (shouldRecoverSoilAlert) {
      emit('refresh')
      emit('action', `${updated.name}计划已执行，土壤湿度恢复至 90%，低湿告警已自动解除`)
      return
    }
    emit('action', `${updated.name}灌溉计划已保存（${updated.durationMinutes}分钟）`)
  } catch (error) { emit('action', error instanceof Error ? error.message : '计划保存失败') }
}
async function selfTest() {
  try {
    const updated = await runDeviceSelfTest(selectedDevice.value.entityId)
    Object.assign(selectedDevice.value, updated)
    emit('action', `${updated.name}自检通过，通信正常`)
  } catch (error) { emit('action', error instanceof Error ? error.message : '设备自检失败') }
}
async function resolveAlert(id?: number) {
  if (!id) return
  alertBusyId.value = id
  try {
    const updated = await handleFarmAlert(id)
    const item = alerts.find(alert => alert.id === id)
    if (item) Object.assign(item, updated)
    if (item?.entityId && !alerts.some(alert => alert.entityId === item.entityId && !['已处理', '已恢复'].includes(alert.status))) {
      const entity = sceneEntities.find(candidate => candidate.id === item.entityId)
      if (entity) entity.status = 'normal'
    }
    dashboardSummary.openAlerts = alerts.filter(alert => !['已处理', '已恢复'].includes(alert.status)).length
    emit('action', '告警已处理并写入数据库')
  } catch (error) { emit('action', error instanceof Error ? error.message : '告警处理失败') }
  finally { alertBusyId.value = null }
}
function processAlert(item: (typeof alerts)[number]) {
  if (item.title.includes('土壤湿度') && !['已处理', '已恢复'].includes(item.status)) {
    emit('irrigate', item.entityId || 'field-04')
    return
  }
  resolveAlert(item.id)
}
</script>

<template>
  <Transition name="drawer">
    <aside v-if="open" class="drawer" :class="`theme-${module}`" @click.stop>
      <header><div><small>{{ module.toUpperCase() }} CENTER</small><h2>{{ title }}</h2></div><span class="sync"><i></i>数据实时同步</span><button aria-label="关闭" @click="$emit('close')">×</button></header>
      <div v-if="entity?.type === 'greenhouse'" class="greenhouse-entry"><button @click="$emit('enter-greenhouse', entity?.id || '')"><span><b>进入大棚</b><small>实景监控 · 数字孪生 · 植株数据</small></span><strong>→</strong></button></div>

      <div v-if="module === 'environment'" class="content environment-panel">
        <section class="hero-card"><span>综合环境评分</span><strong>92<small>分</small></strong><em>适宜作物生长</em><div class="trend"><i v-for="n in [34,42,39,51,48,62,58,70,68,79,75,86]" :key="n" :style="{height:n+'%'}"></i></div></section>
        <section><div class="section-title"><h3>实时环境</h3><small>虚拟数据 · 30秒更新</small></div><div class="metric-grid"><article v-for="(item,index) in environmentMetrics" :key="item.label" :class="item.tone"><span class="metric-icon"><svg viewBox="0 0 24 24"><path :d="metricIcons[index]"/></svg></span><div><small>{{ item.label }}</small><b>{{ item.value }}</b><em>{{ item.delta }}</em></div></article></div></section>
        <section><div class="section-title"><h3>24 小时趋势</h3><small>温湿度</small></div><div class="line-chart"><svg viewBox="0 0 320 100" preserveAspectRatio="none"><path class="area" d="M0 79 C35 75 42 61 72 65 S112 43 145 51 S193 31 227 40 S278 20 320 25 L320 100H0Z"/><path d="M0 79 C35 75 42 61 72 65 S112 43 145 51 S193 31 227 40 S278 20 320 25"/></svg><div><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>现在</span></div></div></section>
        <section class="advice"><span>AI</span><div><b>环境调控建议</b><p>4号种植区土壤湿度偏低，建议在 17:20 开启滴灌 18 分钟；其余指标处于适宜范围。</p></div></section>
      </div>

      <div v-else-if="module === 'devices'" class="content device-panel">
        <section class="summary-row"><article><small>设备总数</small><b>{{ dashboardSummary.totalDevices }}</b></article><article><small>在线</small><b class="green">{{ dashboardSummary.onlineDevices }}</b></article><article><small>运行中</small><b>{{ dashboardSummary.runningDevices }}</b></article><article><small>异常</small><b class="orange">{{ dashboardSummary.totalDevices-dashboardSummary.onlineDevices }}</b></article></section>
        <section><div class="section-title"><h3>设备列表</h3><button @click="openNewDevice">＋ 添加设备</button></div><div class="device-list"><button v-for="item in deviceRecords" :key="item.id" :class="{active:selectedDevice.entityId===item.entityId}" @click="selectDevice(item.entityId)"><span class="device-symbol" :class="item.category">{{ item.category==='sensor'?'S':item.category==='camera'?'C':item.category==='robot'?'R':'A' }}</span><div><b>{{ item.name }}</b><small>{{ item.location }} · {{ item.value }}</small></div><i :class="{online:item.online}"></i></button></div></section>
        <section class="control-card"><div class="control-head"><div><small>当前设备</small><h3>{{ selectedDevice.name }}</h3></div><label class="switch"><input type="checkbox" :checked="devicePower[selectedDevice.entityId]" @change="toggleDevice(selectedDevice.entityId)"><span></span></label></div><dl><div><dt>运行状态</dt><dd :class="{green:devicePower[selectedDevice.entityId]}">{{ devicePower[selectedDevice.entityId]?'正常运行':'已关闭' }}</dd></div><div><dt>实时数据</dt><dd>{{ selectedDevice.value }}</dd></div><div><dt>最后通信</dt><dd>{{ selectedDevice.lastSeen }}</dd></div><div><dt>控制模式</dt><dd>自动</dd></div></dl><div class="actions"><button @click="selfTest">设备自检</button></div></section>
        <section v-if="deviceEditorOpen" class="device-editor"><div class="section-title"><h3>{{ editingEntityId ? '编辑设备资料' : '登记新设备' }}</h3><button @click="deviceEditorOpen=false">收起</button></div><div class="form-grid"><label><span>设备编号</span><input v-model.trim="deviceForm.id" :disabled="!!editingEntityId" maxlength="40"></label><label><span>实体编号</span><input v-model.trim="deviceForm.entityId" maxlength="40" placeholder="sensor-01"></label><label class="wide"><span>设备名称</span><input v-model.trim="deviceForm.name" maxlength="100" placeholder="土壤墒情传感器 01"></label><label><span>设备类别</span><select v-model="deviceForm.category"><option value="sensor">传感器</option><option value="actuator">执行器</option><option value="camera">摄像头</option><option value="robot">机器人</option></select></label><label><span>在线状态</span><select v-model="deviceForm.online"><option :value="true">在线</option><option :value="false">离线</option></select></label><label class="wide"><span>安装位置</span><input v-model.trim="deviceForm.location" maxlength="100" placeholder="4号种植区东侧"></label><label class="wide"><span>当前读数</span><input v-model.trim="deviceForm.currentValue" maxlength="120" placeholder="42%"></label></div><div class="editor-actions"><button v-if="editingEntityId" class="danger-action" :disabled="deviceSaving" @click="removeDevice">{{ deleteArmed ? '再次点击确认解绑' : '解绑设备' }}</button><button class="save-action" :disabled="deviceSaving" @click="saveDevice">{{ deviceSaving ? '保存中…' : '保存设备' }}</button></div></section>
        <button v-else class="manage-device" @click="openDeviceEditor">编辑当前设备资料</button>
      </div>

      <div v-else-if="module === 'irrigation'" class="content irrigation-panel">
        <section class="water-summary"><div class="water-ring"><b>{{ dashboardSummary.waterLevel }}%</b><small>蓄水量</small></div><dl><div><dt>主管流量</dt><dd>12.6 m³/h</dd></div><div><dt>今日用水</dt><dd>{{ dashboardSummary.todayWaterUsage }} m³</dd></div><div><dt>运行单元</dt><dd>{{ irrigationUnits.filter(item=>item.enabled).length }} / {{ irrigationUnits.length }}</dd></div></dl></section>
        <section><div class="section-title"><h3>灌溉控制单元</h3><small>点击地图或列表选择</small></div><div class="unit-list"><button v-for="unit in irrigationUnits" :key="unit.id" :class="{active:selectedUnit.entityId===unit.entityId}" @click="$emit('select',unit.entityId)"><i :class="{running:irrigationPower[unit.entityId]}"></i><span><b>{{ unit.name }}</b><small>{{ unit.target }}</small></span><em>{{ irrigationPower[unit.entityId]?'运行':'关闭' }}</em></button></div></section>
        <section class="irrigation-control"><div class="control-head"><div><small>选中单元</small><h3>{{ selectedUnit.name }}</h3></div><label class="switch water"><input type="checkbox" :checked="irrigationPower[selectedUnit.entityId]" @change="toggleIrrigation(selectedUnit.entityId)"><span></span></label></div><div v-if="activeSoilAlert" class="irrigation-alert"><b>低湿告警处理中</b><span>当前湿度 {{ soilMoisture }}，需恢复至 {{ soilThreshold }}% 以上才会自动解除告警。</span></div><div class="duration"><span>本次灌溉时长</span><b>{{ duration }} 分钟</b><input v-model="duration" type="range" min="5" max="60"></div><dl><div><dt>灌溉对象</dt><dd>{{ selectedUnit.target }}</dd></div><div><dt>当前流量</dt><dd>{{ selectedUnit.flow }}</dd></div><div><dt>控制策略</dt><dd>土壤墒情联动</dd></div></dl><button class="schedule" @click="saveIrrigationPlan">{{ activeSoilAlert ? '保存并开始灌溉' : '保存灌溉计划' }}</button></section>
        <section class="threshold-panel"><div class="control-head"><div><small>自动告警规则</small><h3>土壤湿度下限</h3></div><label class="switch water"><input v-model="thresholdEnabled" type="checkbox"><span></span></label></div><div class="threshold-value"><strong>{{ soilThreshold }}%</strong><p>实时湿度低于该值时生成告警；恢复到阈值以上后自动标记恢复。</p></div><input v-model.number="soilThreshold" type="range" min="10" max="80" step="1" :disabled="!thresholdEnabled"><div class="threshold-actions"><button class="simulation-action" :disabled="simulationBusy" @click="runLowMoistureSimulation">{{ simulationBusy ? '模拟中…' : '模拟湿度降至 30%' }}</button><button class="schedule" :disabled="thresholdSaving" @click="saveThreshold">{{ thresholdSaving ? '保存中…' : '保存告警阈值' }}</button></div></section>
      </div>

      <div v-else-if="module === 'crops'" class="content crop-panel">
        <section class="zone-management"><div class="section-title"><h3>种植区管理</h3><button @click="openNewZone">＋ 新增种植区</button></div><p>选择地图中的露天种植区后可修改资料和位置。</p><button v-if="entity?.type === 'field' && !zoneEditorOpen" class="manage-device" @click="openZoneEditor">编辑当前种植区</button></section>
        <section v-if="zoneEditorOpen" class="device-editor zone-editor"><div class="section-title"><h3>{{ editingZoneId ? '编辑种植区' : '新增种植区' }}</h3><button @click="zoneEditorOpen=false">收起</button></div><div class="form-grid"><label><span>种植区编号</span><input v-model.trim="zoneForm.id" :disabled="!!editingZoneId" maxlength="40"></label><label><span>健康度</span><input v-model.number="zoneForm.health" type="number" min="0" max="100"></label><label class="wide"><span>种植区名称</span><input v-model.trim="zoneForm.name" maxlength="100"></label><label><span>种植作物</span><input v-model.trim="zoneForm.crop" maxlength="100"></label><label><span>面积</span><input v-model.trim="zoneForm.area" maxlength="50" placeholder="2.6 亩"></label><label><span>生长阶段</span><input v-model.trim="zoneForm.stage" maxlength="60"></label><label><span>环境摘要</span><input v-model.trim="zoneForm.environment" maxlength="100"></label><label><span>地图横坐标 (%)</span><input v-model.number="zoneForm.mapX" type="number" min="2" max="98"></label><label><span>地图纵坐标 (%)</span><input v-model.number="zoneForm.mapY" type="number" min="2" max="98"></label></div><p class="zone-position-tip">保存后将以坐标为中心生成地图边界；可再次调整位置。</p><div class="editor-actions"><button v-if="editingZoneId" class="danger-action" :disabled="zoneSaving" @click="removeZone">{{ zoneDeleteArmed ? '再次点击确认删除' : '删除种植区' }}</button><button class="save-action" :disabled="zoneSaving" @click="saveZone">{{ zoneSaving ? '保存中…' : '保存种植区' }}</button></div></section>
        <section class="crop-hero"><div class="leaf"><svg viewBox="0 0 24 24"><path d="M19.5 4.5C13 4.5 8.6 7.2 7 11.6c-.8 2.4-.3 5.3 1.4 7.9 1-5.7 3.8-9.5 8.4-12M7.4 13C5.2 12.6 3.6 13.4 2.5 15c2.3-.8 4.2-.5 5.6.8"/></svg></div><div><small>{{ cropZone.area }}</small><h3>{{ cropZone.crop }}</h3><span>{{ cropZone.stage }}</span></div><div class="score"><b>{{ entity?.health || 94 }}</b><small>健康度</small></div></section>
        <section><div class="section-title"><h3>生长状态</h3><small>AI 识别</small></div><div class="growth"><article><span>株高</span><b>32.6 cm</b><em>正常</em></article><article><span>叶面积指数</span><b>3.8 LAI</b><em>良好</em></article><article><span>病虫害风险</span><b>低</b><em>无异常</em></article><article><span>预计采收</span><b>18 天</b><em>8月21日</em></article></div></section>
        <section><div class="section-title"><h3>生育进度</h3><small>第 34 天</small></div><div class="stages"><i class="done"></i><i class="done"></i><i class="current"></i><i></i><div><span>定植</span><span>营养生长</span><span>{{ cropZone.stage }}</span><span>采收</span></div></div></section>
        <section><div class="section-title"><h3>今日农事</h3></div><div class="task"><i>✓</i><span><b>完成叶面巡检</b><small>机器人巡检 · 10:30</small></span><em>已完成</em></div><div class="task"><i>○</i><span><b>检查滴灌压力</b><small>计划执行 · 17:20</small></span><em>待执行</em></div></section>
      </div>

      <div v-else class="content overview-panel">
        <section class="summary-row"><article><small>农场健康</small><b class="green">{{ dashboardSummary.health }}</b></article><article><small>在线设备</small><b>{{ Math.round(dashboardSummary.onlineDevices/Math.max(1,dashboardSummary.totalDevices)*100) }}%</b></article><article><small>今日任务</small><b>12</b></article><article><small>待处理</small><b class="orange">{{ dashboardSummary.openAlerts }}</b></article></section>
        <section><div class="section-title"><h3>{{ entity?.name || '重点对象' }}</h3><small>{{ entity?.metric }}</small></div><div v-if="selectedZone" class="overview-card"><div class="leaf"><svg viewBox="0 0 24 24"><path d="M19.5 4.5C13 4.5 8.6 7.2 7 11.6c-.8 2.4-.3 5.3 1.4 7.9 1-5.7 3.8-9.5 8.4-12M7.4 13C5.2 12.6 3.6 13.4 2.5 15c2.3-.8 4.2-.5 5.6.8"/></svg></div><div><b>{{ selectedZone.crop }}</b><small>{{ selectedZone.area }} · {{ selectedZone.stage }}</small><p>{{ selectedZone.environment }}</p></div><strong>{{ entity?.health || 92 }}</strong></div><div v-else class="overview-card object-card"><div class="object-glyph"><svg viewBox="0 0 24 24"><path v-if="entity?.type === 'water'" d="M12 3c3.5 4.7 5.5 7.3 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 10.3 8.5 7.7 12 3Z"/><path v-else-if="entity?.type === 'camera'" d="M4 8h11v9H4zM15 11l5-2v7l-5-2zM8 12.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/><path v-else-if="entity?.type === 'robot'" d="M5 7h14v10H5zM12 7V4M8 20v-3M16 20v-3M9 12h.1M15 12h.1"/><path v-else d="M9 4h6l.6 2.2 1.5.8 2.2-.6 2 3.5-1.6 1.6v1.7l1.6 1.6-2 3.5-2.2-.6-1.5.8L15 20H9l-.6-2.1-1.5-.8-2.2.6-2-3.5 1.6-1.6v-1.7L2.7 9.9l2-3.5 2.2.6 1.5-.8L9 4Zm0 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z"/></svg></div><div><b>{{ entity?.name || '农场对象' }}</b><small>{{ entity?.type === 'water' ? '农业水源设施' : entity?.type === 'camera' ? '视频监控设备' : entity?.type === 'robot' ? '智能巡检设备' : '农业物联网设备' }}</small><p>{{ entity?.metric || '运行状态正常' }}</p></div><strong class="object-state">{{ entity?.status === 'offline' ? '离线' : '在线' }}</strong></div></section>
        <section><div class="section-title"><h3>最新告警</h3></div><article v-for="item in alerts" :key="item.id || item.time" class="alert-item"><span>!</span><div><b>{{ item.title }}</b><small>{{ item.time }} · {{ item.status }}</small></div><button v-if="item.id && !['已处理','已恢复'].includes(item.status)" class="resolve-alert" :disabled="alertBusyId === item.id" @click="processAlert(item)"><i>{{ item.title.includes('土壤湿度') ? '→' : alertBusyId === item.id ? '···' : '✓' }}</i>{{ item.title.includes('土壤湿度') ? '去灌溉处理' : alertBusyId === item.id ? '处理中' : '标记处理' }}</button></article></section>
      </div>
    </aside>
  </Transition>
</template>

<style scoped lang="scss">
.drawer{position:absolute;z-index:24;right:17px;top:109px;bottom:17px;width:clamp(360px,30vw,440px);display:flex;flex-direction:column;color:#f5f9f3;background:linear-gradient(155deg,rgba(10,31,25,.95),rgba(5,24,19,.92));border:1px solid rgba(255,255,255,.14);border-radius:22px;box-shadow:0 25px 70px rgba(0,0,0,.38);backdrop-filter:blur(26px);overflow:hidden}.drawer>header{flex:none;padding:18px 20px 14px;display:flex;align-items:center;border-bottom:1px solid rgba(255,255,255,.08)}.drawer>header div{min-width:0}.drawer>header small{font-size:8px;letter-spacing:1.8px;color:#62d785}.drawer h2{margin:4px 0 0;font-size:19px}.sync{margin-left:auto;display:flex;align-items:center;gap:5px;font-size:8px;color:rgba(255,255,255,.47)}.sync i{width:6px;height:6px;border-radius:50%;background:#57e57a}.drawer>header>button{margin-left:10px;width:32px;height:32px;border:0;border-radius:50%;background:rgba(255,255,255,.07);color:white;font-size:21px;cursor:pointer}.content{padding:0 18px 22px;overflow:auto}.content::-webkit-scrollbar{width:4px}.content::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:5px}.content>section{padding:16px 0;border-bottom:1px solid rgba(255,255,255,.08)}.section-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}.section-title h3,.control-head h3{margin:0;font-size:13px}.section-title small,.control-head small{font-size:8px;color:rgba(255,255,255,.4)}.section-title button{border:0;background:transparent;color:#79df94;font-size:9px;cursor:pointer}.summary-row{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.summary-row article{padding:11px 7px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:rgba(255,255,255,.035)}.summary-row small{display:block;font-size:8px;color:rgba(255,255,255,.4)}.summary-row b{display:block;margin-top:5px;font-size:18px}.green{color:#68df8c!important}.orange{color:#f2aa45!important}.hero-card{position:relative;height:145px;padding:18px!important;border:0!important;border-radius:15px;background:linear-gradient(135deg,rgba(52,127,73,.34),rgba(39,93,70,.1));overflow:hidden}.hero-card>span{font-size:10px;color:rgba(255,255,255,.58)}.hero-card>strong{display:block;font-size:47px;line-height:1.1}.hero-card>strong small{font-size:12px}.hero-card>em{font:normal 10px sans-serif;color:#73e394}.trend{position:absolute;right:14px;bottom:17px;width:52%;height:75px;display:flex;align-items:end;gap:4px}.trend i{flex:1;border-radius:3px 3px 0 0;background:linear-gradient(#77e092,rgba(119,224,146,.08))}.metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.metric-grid article{display:flex;align-items:center;gap:9px;padding:11px;border:1px solid rgba(255,255,255,.07);border-radius:12px;background:rgba(255,255,255,.025)}.metric-icon{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:rgba(70,183,211,.13);color:#65cce5;font:700 10px monospace}.metric-grid article div{display:grid;grid-template-columns:1fr auto;flex:1}.metric-grid small{grid-column:1/3;font-size:8px;color:rgba(255,255,255,.4)}.metric-grid b{font-size:13px;margin-top:3px}.metric-grid em{font:normal 8px sans-serif;color:#69da87;align-self:end}.line-chart{height:125px;padding:10px;border:1px solid rgba(255,255,255,.06);border-radius:12px}.line-chart svg{width:100%;height:90px}.line-chart path{fill:none;stroke:#69df8b;stroke-width:2}.line-chart .area{fill:url(#none);fill:rgba(88,207,119,.1);stroke:none}.line-chart>div{display:flex;justify-content:space-between;color:rgba(255,255,255,.3);font-size:7px}.advice{display:flex;gap:10px}.advice>span{flex:none;width:32px;height:32px;display:grid;place-items:center;border-radius:10px;background:#3e8653;color:#9af0ad;font:700 9px monospace}.advice b{font-size:11px}.advice p{margin:5px 0 0;font-size:9px;line-height:1.7;color:rgba(255,255,255,.5)}.device-list,.unit-list{display:flex;flex-direction:column;gap:6px}.device-list button,.unit-list button{width:100%;display:flex;align-items:center;gap:9px;padding:9px;border:1px solid rgba(255,255,255,.06);border-radius:11px;background:rgba(255,255,255,.025);color:white;text-align:left;cursor:pointer}.device-list button.active,.unit-list button.active{border-color:rgba(104,221,133,.42);background:rgba(61,151,82,.13)}.device-symbol{flex:none;width:31px;height:31px;display:grid;place-items:center;border-radius:9px;background:#294c44;color:#80dda0;font:700 10px monospace}.device-list button div,.unit-list button span{display:flex;flex:1;min-width:0;flex-direction:column}.device-list b,.unit-list b{font-size:10px}.device-list small,.unit-list small{margin-top:3px;font-size:8px;color:rgba(255,255,255,.42);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.device-list button>i{width:7px;height:7px;border-radius:50%;background:#777}.device-list button>i.online,.unit-list i.running{background:#58df7d;box-shadow:0 0 7px #58df7d}.control-card,.irrigation-control{padding:14px!important;margin-top:14px;border:1px solid rgba(108,221,135,.2)!important;border-radius:14px;background:rgba(53,126,72,.09)}.control-head{display:flex;align-items:center;justify-content:space-between}.control-head h3{margin-top:4px}.switch input{display:none}.switch span{position:relative;display:block;width:42px;height:23px;border-radius:99px;background:#4b5651;cursor:pointer;transition:.2s}.switch span::after{content:"";position:absolute;width:17px;height:17px;left:3px;top:3px;border-radius:50%;background:white;transition:.2s}.switch input:checked+span{background:#43a966}.switch input:checked+span::after{transform:translateX(19px)}.switch.water input:checked+span{background:#3b9fb8}.control-card dl,.irrigation-control dl{margin:13px 0 0}.control-card dl div,.irrigation-control dl div{display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid rgba(255,255,255,.06)}dt{font-size:9px;color:rgba(255,255,255,.43)}dd{margin:0;font-size:9px}.actions{display:flex;gap:7px;margin-top:10px}.actions button,.schedule{flex:1;padding:9px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.05);color:white;font-size:9px;cursor:pointer}.water-summary{display:flex;align-items:center;gap:24px}.water-ring{width:78px;height:78px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;background:radial-gradient(circle at center,#12342d 57%,transparent 58%),conic-gradient(#55bdd1 82%,rgba(255,255,255,.08) 0)}.water-ring b{font-size:17px}.water-ring small{font-size:7px;color:rgba(255,255,255,.45)}.water-summary dl{flex:1;margin:0}.water-summary dl div{display:flex;justify-content:space-between;padding:6px 0}.unit-list button>i{flex:none;width:8px;height:8px;border-radius:50%;background:#66706c}.unit-list em{font:normal 8px sans-serif;color:rgba(255,255,255,.45)}.duration{display:grid;grid-template-columns:1fr auto;margin:15px 0}.duration span{font-size:9px;color:rgba(255,255,255,.5)}.duration b{font-size:10px}.duration input{grid-column:1/3;width:100%;accent-color:#56bcd0;margin-top:10px}.schedule{width:100%;margin-top:10px;background:#347e8e;border:0}.crop-hero{display:grid;grid-template-columns:65px 1fr 65px;align-items:center;gap:11px}.leaf{height:65px;display:grid;place-items:center;border-radius:13px;background:linear-gradient(145deg,#71994d,#244b30);font-size:28px}.crop-hero div:nth-child(2){display:flex;flex-direction:column}.crop-hero small{font-size:8px;color:rgba(255,255,255,.42)}.crop-hero h3{margin:5px 0;font-size:16px}.crop-hero span{font-size:9px;color:#76df91}.score{text-align:center}.score b{display:block;font-size:25px;color:#70df8f}.score small{font-size:8px}.growth{display:grid;grid-template-columns:1fr 1fr;gap:7px}.growth article{padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:10px}.growth span,.growth em{display:block;font:normal 8px sans-serif;color:rgba(255,255,255,.4)}.growth b{display:block;margin:5px 0;font-size:12px}.growth em{color:#6edc89}.stages{display:grid;grid-template-columns:repeat(4,1fr);position:relative}.stages::before{content:"";position:absolute;left:11%;right:11%;top:5px;height:2px;background:rgba(255,255,255,.12)}.stages>i{z-index:1;width:11px;height:11px;margin:auto;border:2px solid #50605a;border-radius:50%;background:#183228}.stages>i.done{border-color:#62d783;background:#62d783}.stages>i.current{border-color:#8bf0a3;box-shadow:0 0 0 4px rgba(98,215,131,.14)}.stages>div{grid-column:1/5;display:grid;grid-template-columns:repeat(4,1fr);margin-top:7px;text-align:center;font-size:7px;color:rgba(255,255,255,.43)}.task{display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid rgba(255,255,255,.06)}.task>i{font-style:normal;color:#67db86}.task span{display:flex;flex:1;flex-direction:column}.task b{font-size:10px}.task small{font-size:8px;color:rgba(255,255,255,.4);margin-top:2px}.task em{font:normal 8px sans-serif;color:#65d982}.overview-card{display:grid;grid-template-columns:65px 1fr auto;align-items:center;gap:10px}.overview-card div:nth-child(2){display:flex;flex-direction:column}.overview-card b{font-size:12px}.overview-card small,.overview-card p{font-size:8px;color:rgba(255,255,255,.42);margin:4px 0}.overview-card>strong{font-size:24px;color:#68dc87}.alert-item{display:flex;gap:9px;padding:10px 0;border-top:1px solid rgba(255,255,255,.06)}.alert-item>span{width:23px;height:23px;display:grid;place-items:center;border-radius:7px;background:rgba(239,151,51,.15);color:#f0a344}.alert-item div{display:flex;flex-direction:column}.alert-item b{font-size:9px}.alert-item small{margin-top:3px;font-size:8px;color:rgba(255,255,255,.4)}.drawer-enter-active,.drawer-leave-active{transition:.24s cubic-bezier(.22,.8,.25,1)}.drawer-enter-from,.drawer-leave-to{transform:translateX(calc(100% + 30px));opacity:0}
@media(max-width:1000px){.drawer{top:80px;bottom:82px;right:10px;width:min(410px,calc(100vw - 20px))}}@media(max-width:700px){.drawer{top:auto;bottom:72px;max-height:70vh;width:calc(100vw - 16px);right:8px}.summary-row{grid-template-columns:1fr 1fr}}
</style>
<style scoped lang="scss">
.zone-management>p,.zone-position-tip{margin:0;color:rgba(235,255,241,.52);font-size:9px;line-height:1.6}.zone-position-tip{margin-top:10px}.zone-editor .form-grid{grid-template-columns:1fr 1fr}.zone-editor input[type=number]{font-variant-numeric:tabular-nums}
</style>
<style scoped lang="scss">
.alert-item>div{min-width:0;flex:1}.resolve-alert{flex:none;align-self:center;display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 10px 0 7px;border:1px solid rgba(111,226,145,.22);border-radius:999px;background:linear-gradient(145deg,rgba(72,166,99,.18),rgba(43,113,67,.1));color:#8be8a5;font-size:9px;font-weight:600;white-space:nowrap;cursor:pointer;transition:border-color .18s,background .18s,transform .18s,box-shadow .18s}.resolve-alert i{width:16px;height:16px;display:grid;place-items:center;border-radius:50%;background:rgba(104,220,137,.16);font:normal 700 9px sans-serif}.resolve-alert:hover{border-color:rgba(122,235,154,.5);background:linear-gradient(145deg,rgba(73,181,104,.3),rgba(44,128,72,.18));box-shadow:0 5px 14px rgba(25,110,54,.2);transform:translateY(-1px)}.resolve-alert:active{transform:translateY(0)}.resolve-alert:disabled{opacity:.55;cursor:wait;transform:none;box-shadow:none}
</style>
<style scoped lang="scss">
/* 第二层样式用于统一提升业务抽屉的可读性与液态玻璃质感。 */
.drawer{
  width:clamp(400px,31vw,480px);
  isolation:isolate;
  background:
    radial-gradient(circle at 12% 0,rgba(129,231,165,.18),transparent 28%),
    radial-gradient(circle at 100% 42%,rgba(79,166,184,.12),transparent 34%),
    linear-gradient(150deg,rgba(17,53,43,.82),rgba(5,28,23,.76));
  border-color:rgba(215,255,228,.24);
  box-shadow:0 28px 80px rgba(0,18,11,.46),inset 0 1px 0 rgba(255,255,255,.2),inset 0 -1px 0 rgba(116,213,150,.1);
  backdrop-filter:blur(34px) saturate(155%);
}
.drawer::before{content:"";position:absolute;z-index:0;left:12px;right:12px;top:2px;height:75px;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.12),transparent);pointer-events:none}.drawer>*{position:relative;z-index:1}.drawer>header{padding:20px 22px 16px;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.012));border-bottom-color:rgba(216,255,228,.12)}.drawer>header small{font-size:10px;line-height:1.3;letter-spacing:1.7px}.drawer h2{font-size:22px;line-height:1.25;margin-top:6px}.sync{font-size:10px}.sync i{width:7px;height:7px}.drawer>header>button{width:36px;height:36px;font-size:23px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.08)}
.drawer.theme-environment{background:radial-gradient(circle at 12% 0,rgba(108,229,147,.22),transparent 29%),radial-gradient(circle at 100% 48%,rgba(55,151,139,.14),transparent 37%),linear-gradient(150deg,rgba(14,55,42,.82),rgba(4,29,23,.77))}.drawer.theme-devices{background:radial-gradient(circle at 12% 0,rgba(91,183,221,.2),transparent 29%),radial-gradient(circle at 100% 48%,rgba(64,139,177,.14),transparent 37%),linear-gradient(150deg,rgba(13,48,53,.84),rgba(5,27,30,.78))}.drawer.theme-irrigation{background:radial-gradient(circle at 12% 0,rgba(73,190,216,.23),transparent 29%),radial-gradient(circle at 100% 48%,rgba(41,132,161,.16),transparent 37%),linear-gradient(150deg,rgba(11,48,57,.84),rgba(4,27,32,.78))}.drawer.theme-crops{background:radial-gradient(circle at 12% 0,rgba(166,213,99,.2),transparent 29%),radial-gradient(circle at 100% 48%,rgba(73,151,82,.14),transparent 37%),linear-gradient(150deg,rgba(33,57,32,.85),rgba(7,29,22,.78))}.drawer.theme-alerts{background:radial-gradient(circle at 12% 0,rgba(238,159,75,.19),transparent 29%),linear-gradient(150deg,rgba(57,43,29,.86),rgba(28,25,19,.8))}
.content{padding:2px 18px 24px;scrollbar-color:rgba(152,225,174,.42) transparent;scrollbar-width:thin}.content::-webkit-scrollbar{width:6px}.content::-webkit-scrollbar-thumb{border-radius:99px;background:rgba(152,225,174,.34)}.content>section{position:relative;margin-top:12px;padding:15px!important;border:1px solid rgba(224,255,233,.11)!important;border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 9px 24px rgba(0,18,11,.1);overflow:hidden}.content>section::before{content:"";position:absolute;z-index:0;inset:0 0 auto;height:42%;background:linear-gradient(180deg,rgba(255,255,255,.055),transparent);pointer-events:none}.content>section>*{position:relative;z-index:1}
.environment-panel>section{background:linear-gradient(145deg,rgba(39,122,84,.18),rgba(32,80,67,.08))}.device-panel>section{background:linear-gradient(145deg,rgba(50,105,129,.17),rgba(34,76,75,.08))}.irrigation-panel>section{background:linear-gradient(145deg,rgba(36,119,142,.2),rgba(27,72,79,.08))}.crop-panel>section{background:linear-gradient(145deg,rgba(89,128,55,.2),rgba(39,87,56,.08))}.overview-panel>section{background:linear-gradient(145deg,rgba(71,124,77,.17),rgba(38,76,59,.07))}
.section-title{margin-bottom:13px}.section-title h3,.control-head h3{font-size:15px;line-height:1.35}.section-title small,.control-head small,.section-title button{font-size:10px}.summary-row{padding:10px!important;gap:8px}.summary-row article{padding:12px 9px;border-color:rgba(255,255,255,.11);background:linear-gradient(145deg,rgba(255,255,255,.1),rgba(255,255,255,.035));box-shadow:inset 0 1px rgba(255,255,255,.08)}.summary-row article:nth-child(1){background:linear-gradient(145deg,rgba(77,175,106,.18),rgba(255,255,255,.025))}.summary-row article:nth-child(2){background:linear-gradient(145deg,rgba(63,154,183,.17),rgba(255,255,255,.025))}.summary-row article:nth-child(3){background:linear-gradient(145deg,rgba(146,117,67,.17),rgba(255,255,255,.025))}.summary-row article:nth-child(4){background:linear-gradient(145deg,rgba(189,101,55,.17),rgba(255,255,255,.025))}.summary-row small{font-size:10px;line-height:1.25}.summary-row b{font-size:21px;margin-top:7px}
.hero-card{height:160px!important;padding:20px!important;border:1px solid rgba(152,239,177,.2)!important;background:radial-gradient(circle at 80% 10%,rgba(134,233,162,.22),transparent 35%),linear-gradient(135deg,rgba(49,144,82,.4),rgba(24,78,62,.14))!important}.hero-card>span{font-size:12px}.hero-card>strong{font-size:50px}.hero-card>strong small{font-size:14px}.hero-card>em{font-size:12px}.metric-grid{gap:9px}.metric-grid article{min-height:65px;padding:12px;border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.055)}.metric-grid article:nth-child(1){background:linear-gradient(145deg,rgba(227,128,63,.2),rgba(255,255,255,.03))}.metric-grid article:nth-child(2){background:linear-gradient(145deg,rgba(63,151,206,.2),rgba(255,255,255,.03))}.metric-grid article:nth-child(3){background:linear-gradient(145deg,rgba(50,173,154,.2),rgba(255,255,255,.03))}.metric-grid article:nth-child(4){background:linear-gradient(145deg,rgba(222,174,60,.2),rgba(255,255,255,.03))}.metric-grid article:nth-child(5){background:linear-gradient(145deg,rgba(137,99,190,.2),rgba(255,255,255,.03))}.metric-icon{width:34px;height:34px;font-size:12px}.metric-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.metric-grid small{font-size:10px}.metric-grid b{font-size:15px}.metric-grid em{font-size:10px}.line-chart>div{font-size:9px}.advice{gap:12px}.advice>span{width:36px;height:36px;font-size:11px}.advice b{font-size:13px}.advice p{font-size:11px;line-height:1.65}
.device-list,.unit-list{gap:8px}.device-list button,.unit-list button{min-height:53px;padding:10px 11px;border-color:rgba(255,255,255,.1);background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025))}.device-list button.active,.unit-list button.active{border-color:rgba(111,230,148,.5);background:linear-gradient(145deg,rgba(61,163,95,.28),rgba(47,115,91,.1));box-shadow:inset 0 1px rgba(255,255,255,.13)}.device-symbol{width:35px;height:35px;font-size:12px}.device-list b,.unit-list b{font-size:12px;line-height:1.3}.device-list small,.unit-list small{font-size:10px;line-height:1.35}.unit-list em{font-size:10px}.control-card,.irrigation-control{margin-top:12px!important;background:linear-gradient(145deg,rgba(57,148,91,.2),rgba(35,86,75,.08))!important}.irrigation-control{background:linear-gradient(145deg,rgba(47,146,171,.22),rgba(28,78,85,.08))!important}dt,dd{font-size:11px;line-height:1.4}.control-card dl div,.irrigation-control dl div{padding:9px 0}.actions button,.schedule{padding:11px;font-size:11px}.water-summary{gap:25px}.water-ring{width:86px;height:86px}.water-ring b{font-size:20px}.water-ring small{font-size:9px}.duration span,.duration b{font-size:11px}
.irrigation-alert{display:flex;flex-direction:column;gap:5px;margin-top:13px;padding:11px 12px;border:1px solid rgba(255,183,92,.32);border-radius:11px;background:rgba(218,128,43,.13)}.irrigation-alert b{font-size:10px;color:#ffc47c}.irrigation-alert span{font-size:9px;line-height:1.55;color:rgba(255,244,226,.68)}
.crop-hero{grid-template-columns:72px 1fr 70px}.leaf{height:72px;border:1px solid rgba(181,239,135,.18);background:radial-gradient(circle at 35% 25%,rgba(211,255,174,.28),transparent 35%),linear-gradient(145deg,#6c9d4b,#244e34)}.leaf svg{width:34px;height:34px;fill:none;stroke:#d5ffbd;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.crop-hero small,.crop-hero span,.score small{font-size:10px}.crop-hero h3{font-size:18px}.score b{font-size:28px}.growth{gap:9px}.growth article{padding:12px;border-color:rgba(255,255,255,.1);background:linear-gradient(145deg,rgba(112,157,66,.13),rgba(255,255,255,.025))}.growth span,.growth em{font-size:10px}.growth b{font-size:14px}.stages>div{font-size:9px}.task{padding:11px 0}.task b{font-size:12px}.task small,.task em{font-size:10px}
.overview-card{grid-template-columns:72px 1fr auto;gap:13px}.overview-card b{font-size:14px}.overview-card small,.overview-card p{font-size:11px;line-height:1.45}.overview-card>strong{font-size:27px}.object-glyph{width:64px;height:64px;display:grid!important;place-items:center;border:1px solid rgba(119,213,228,.22);border-radius:16px;background:radial-gradient(circle at 35% 25%,rgba(167,236,247,.2),transparent 34%),linear-gradient(145deg,rgba(50,137,153,.38),rgba(29,75,78,.18));color:#9fe5ef}.object-glyph svg{width:31px;height:31px;fill:none;stroke:currentColor;stroke-width:1.55;stroke-linecap:round;stroke-linejoin:round}.object-state{font-size:13px!important;padding:6px 9px;border-radius:99px;background:rgba(76,194,111,.13);color:#78e39a!important}.alert-item{padding:12px 0}.alert-item>span{width:28px;height:28px}.alert-item b{font-size:11px;line-height:1.4}.alert-item small{font-size:10px}.drawer button:focus-visible,.drawer input:focus-visible{outline:2px solid rgba(145,242,175,.9);outline-offset:2px}
.greenhouse-entry button{width:100%;display:flex;align-items:center;justify-content:space-between;padding:13px 14px;border:1px solid rgba(112,229,145,.3);border-radius:13px;background:linear-gradient(135deg,rgba(64,157,90,.3),rgba(51,116,86,.12));color:#eaffee;text-align:left;cursor:pointer}.greenhouse-entry span{display:flex;flex-direction:column;gap:4px}.greenhouse-entry b{font-size:12px}.greenhouse-entry small{font-size:9px;color:rgba(225,255,234,.5)}.greenhouse-entry strong{font-size:21px;color:#83e89e}.greenhouse-entry button:hover{transform:translateY(-2px);border-color:rgba(126,238,156,.58);box-shadow:0 12px 26px rgba(0,20,9,.2)}
.greenhouse-entry{flex:none;padding:10px 18px 0}
@media(max-width:1000px){.drawer{width:min(440px,calc(100vw - 20px))}}@media(max-width:700px){.drawer{width:calc(100vw - 16px)}.content>section{padding:13px!important}.summary-row{grid-template-columns:1fr 1fr}.drawer h2{font-size:19px}}
</style>
<style scoped lang="scss">
.drawer{bottom:auto;width:clamp(380px,29vw,440px);max-height:calc(100vh - 126px)}
.content{min-height:0}
.manage-device{width:100%;margin-top:10px;padding:11px;border:1px solid rgba(121,223,148,.24);border-radius:12px;background:rgba(65,153,89,.12);color:#8ce7a4;font-size:10px;cursor:pointer}.device-editor{margin-top:10px;padding:15px!important;border:1px solid rgba(113,221,143,.2)!important;border-radius:15px;background:rgba(34,83,60,.24)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.form-grid label{display:flex;min-width:0;flex-direction:column;gap:5px}.form-grid label.wide{grid-column:1/-1}.form-grid label>span{font-size:8px;color:rgba(235,255,241,.52)}.form-grid input,.form-grid select{width:100%;height:35px;padding:0 9px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:#102f25;color:#f5fff7;font-size:10px;box-sizing:border-box}.form-grid input:disabled{opacity:.55}.editor-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.editor-actions button{padding:9px 12px;border:0;border-radius:9px;font-size:9px;cursor:pointer}.save-action{background:#58bd75;color:#082714;font-weight:700}.danger-action{margin-right:auto;background:rgba(224,92,75,.13);color:#ff9f91}.threshold-panel{margin-top:2px}.threshold-value{display:flex;align-items:center;gap:13px;margin:13px 0 8px}.threshold-value strong{font-size:30px;color:#83dcf0;font-variant-numeric:tabular-nums}.threshold-value p{margin:0;color:rgba(230,251,242,.52);font-size:9px;line-height:1.55}.threshold-panel>input[type=range]{width:100%;accent-color:#55bed3}.threshold-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.threshold-actions .schedule{margin:0}.simulation-action{padding:10px;border:1px solid rgba(242,171,80,.28);border-radius:10px;background:rgba(221,133,55,.13);color:#ffc078;font-size:9px;cursor:pointer}.threshold-panel button:disabled,.editor-actions button:disabled{opacity:.55;cursor:wait}
@media(max-width:1000px){.drawer{top:80px;bottom:auto;width:min(420px,calc(100vw - 20px));max-height:calc(100vh - 162px)}}
@media(max-width:700px){.drawer{top:auto;bottom:72px;width:calc(100vw - 16px);max-height:min(70vh,680px)}}
</style>
