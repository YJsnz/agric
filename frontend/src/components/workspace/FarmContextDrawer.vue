<script setup lang="ts">
import OperationJournal from './OperationJournal.vue'
import ObservationHistory from './ObservationHistory.vue'
import {useWorkspaceStore} from '@/stores/workspace'
import { computed, onMounted, reactive, ref, watchEffect } from 'vue'
import type { BusinessModule, DeviceInput, SceneEntity, ZoneInput } from '@/types'
import { alerts, dashboardSummary, deviceRecords, environmentMetrics, farmZones, irrigationUnits, sceneEntities } from '@/data/farm'
import { createFarmDevice, createFarmZone, deleteFarmDevice, deleteFarmZone, fetchMetricThresholds, handleFarmAlert, runDeviceSelfTest, saveSoilMoistureThreshold, setDeviceEnabled, setIrrigationEnabled, simulateSoilMoisture, updateFarmDevice, updateFarmZone } from '@/api/dashboard'

const workspace=useWorkspaceStore()
const props = defineProps<{ entity?: SceneEntity; open: boolean; module: BusinessModule }>()
const emit = defineEmits<{
  (event: 'transport'): void
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
const soilEC = computed(()=>environmentMetrics.find(item=>(item as {key?:string}).key==='soilEC')?.value || '—')
const soilPH = computed(()=>environmentMetrics.find(item=>(item as {key?:string}).key==='soilPH')?.value || '—')
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
const title = computed(() => ({ overview: props.entity?.name || '农场运行总览', environment: '土壤墒情与环境', devices: '设施与设备管理', irrigation: '灌排管理', crops: props.entity?.name || '种植档案', alerts: '告警与复核', monitoring: '园区监控' })[props.module])

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
    if (updated.enabled && (updated.kind==='zone'||updated.entityId.startsWith('field-'))) {
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
      <header><div><small>盐田丰语 · 数据工作台</small><h2>{{ title }}</h2></div><button aria-label="关闭" @click="$emit('close')">×</button></header>
      <div class="source-strip"><span><i></i>共享演示数据</span><button @click="$emit('refresh')">刷新观测</button></div><p class="sync-time">农场观测与业务档案 · 每 30 秒同步</p>
      <div v-if="entity?.type === 'greenhouse'" class="greenhouse-entry"><button @click="$emit('enter-greenhouse', entity?.id || '')"><span><b>进入大棚</b><small>实景监控 · 数字孪生 · 植株数据</small></span><strong>→</strong></button></div>

      <div v-if="module === 'environment'" class="content environment-panel">
        <section class="hero-card"><span>环境观测与配置核验</span><strong>{{ environmentMetrics.length }}<small>项</small></strong><em>当前值快照 · 不计算综合风险评分</em></section>
        <section><div class="section-title"><h3>实时环境</h3><small>虚拟数据 · 30秒更新</small></div><div class="metric-grid"><article v-for="(item,index) in environmentMetrics" :key="item.label" :class="item.tone"><span class="metric-icon"><svg viewBox="0 0 24 24"><path :d="metricIcons[index % metricIcons.length]"/></svg></span><div><small>{{ item.label }}</small><b>{{ item.value }}</b><em>{{ item.delta }}</em></div></article></div></section>
        <ObservationHistory v-if="workspace.snapshot" :farm-id="workspace.snapshot.farmId" :updated-at="workspace.snapshot.generatedAt" :metrics="workspace.snapshot.environmentMetrics" />
        <section class="advice"><span>AI</span><div><b>观测与阈值口径</b><p>当前土壤湿度 {{ soilMoisture }}，配置下限 {{ soilThreshold }}%。阈值仅用于演示核验，灌溉时长需结合真实土壤、作物阶段与水分条件复核；当前不生成病害概率。</p></div></section>
      </div>

      <div v-else-if="module === 'devices'" class="content device-panel">
        <button v-if="workspace.snapshot?.farmId==='yantian-01'" class="transport-entry" @click="emit('transport')"><span>自动导航运输车</span><small>地块配送 · 仓储交接 · 路线规划</small><b>进入控制中心 ↗</b></button><OperationJournal kind="devices" :entity-id="entity?.id" />
        <section class="summary-row"><article><small>设备总数</small><b>{{ dashboardSummary.totalDevices }}</b></article><article><small>在线</small><b class="green">{{ dashboardSummary.onlineDevices }}</b></article><article><small>运行中</small><b>{{ dashboardSummary.runningDevices }}</b></article><article><small>异常</small><b class="orange">{{ dashboardSummary.totalDevices-dashboardSummary.onlineDevices }}</b></article></section>
        <section><div class="section-title"><h3>设备列表</h3><button @click="openNewDevice">＋ 添加设备</button></div><div class="device-list"><button v-for="item in deviceRecords" :key="item.id" :class="{active:selectedDevice.entityId===item.entityId}" @click="selectDevice(item.entityId)"><span class="device-symbol" :class="item.category">{{ item.category==='sensor'?'S':item.category==='camera'?'C':item.category==='robot'?'R':'A' }}</span><div><b>{{ item.name }}</b><small>{{ item.location }} · {{ item.value }}</small></div><i :class="{online:item.online}"></i></button></div></section>
        <section class="control-card"><div class="control-head"><div><small>当前设备</small><h3>{{ selectedDevice.name }}</h3></div><label class="switch"><input type="checkbox" :checked="devicePower[selectedDevice.entityId]" @change="toggleDevice(selectedDevice.entityId)"><span></span></label></div><dl><div><dt>运行状态</dt><dd :class="{green:devicePower[selectedDevice.entityId]}">{{ devicePower[selectedDevice.entityId]?'正常运行':'已关闭' }}</dd></div><div><dt>实时数据</dt><dd>{{ selectedDevice.value }}</dd></div><div><dt>最后通信</dt><dd>{{ selectedDevice.lastSeen }}</dd></div><div><dt>控制模式</dt><dd>自动</dd></div></dl><div class="actions"><button @click="selfTest">设备自检</button></div></section>
        <section v-if="deviceEditorOpen" class="device-editor"><div class="section-title"><h3>{{ editingEntityId ? '编辑设备资料' : '登记新设备' }}</h3><button @click="deviceEditorOpen=false">收起</button></div><div class="form-grid"><label><span>设备编号</span><input v-model.trim="deviceForm.id" :disabled="!!editingEntityId" maxlength="40"></label><label><span>实体编号</span><input v-model.trim="deviceForm.entityId" maxlength="40" placeholder="sensor-01"></label><label class="wide"><span>设备名称</span><input v-model.trim="deviceForm.name" maxlength="100" placeholder="土壤墒情传感器 01"></label><label><span>设备类别</span><select v-model="deviceForm.category"><option value="sensor">传感器</option><option value="actuator">执行器</option><option value="camera">摄像头</option><option value="robot">机器人</option></select></label><label><span>在线状态</span><select v-model="deviceForm.online"><option :value="true">在线</option><option :value="false">离线</option></select></label><label class="wide"><span>安装位置</span><input v-model.trim="deviceForm.location" maxlength="100" placeholder="4号种植区东侧"></label><label class="wide"><span>当前读数</span><input v-model.trim="deviceForm.currentValue" maxlength="120" placeholder="42%"></label></div><div class="editor-actions"><button v-if="editingEntityId" class="danger-action" :disabled="deviceSaving" @click="removeDevice">{{ deleteArmed ? '再次点击确认解绑' : '解绑设备' }}</button><button class="save-action" :disabled="deviceSaving" @click="saveDevice">{{ deviceSaving ? '保存中…' : '保存设备' }}</button></div></section>
        <button v-else class="manage-device" @click="openDeviceEditor">编辑当前设备资料</button>
      </div>

      <div v-else-if="module === 'irrigation'" class="content irrigation-panel">
        <OperationJournal kind="irrigation" :entity-id="entity?.id" />
        <section class="water-summary"><div class="water-ring"><b>{{ dashboardSummary.waterLevel }}%</b><small>蓄水量</small></div><dl><div><dt>主管流量</dt><dd>12.6 m³/h</dd></div><div><dt>今日用水</dt><dd>{{ dashboardSummary.todayWaterUsage }} m³</dd></div><div><dt>运行单元</dt><dd>{{ irrigationUnits.filter(item=>item.enabled).length }} / {{ irrigationUnits.length }}</dd></div></dl></section>
        <section><div class="section-title"><h3>灌溉控制单元</h3><small>点击地图或列表选择</small></div><div class="unit-list"><button v-for="unit in irrigationUnits" :key="unit.id" :class="{active:selectedUnit.entityId===unit.entityId}" @click="$emit('select',unit.entityId)"><i :class="{running:irrigationPower[unit.entityId]}"></i><span><b>{{ unit.name }}</b><small>{{ unit.target }}</small></span><em>{{ irrigationPower[unit.entityId]?'运行':'关闭' }}</em></button></div></section>
        <section class="irrigation-control"><div class="control-head"><div><small>选中单元</small><h3>{{ selectedUnit.name }}</h3></div><label class="switch water"><input type="checkbox" :checked="irrigationPower[selectedUnit.entityId]" @change="toggleIrrigation(selectedUnit.entityId)"><span></span></label></div><div v-if="activeSoilAlert" class="irrigation-alert"><b>低湿告警处理中</b><span>当前湿度 {{ soilMoisture }}，需恢复至 {{ soilThreshold }}% 以上才会自动解除告警。</span></div><div class="duration"><span>本次灌溉时长</span><b>{{ duration }} 分钟</b><input v-model="duration" type="range" min="5" max="60"></div><dl><div><dt>灌溉对象</dt><dd>{{ selectedUnit.target }}</dd></div><div><dt>当前流量</dt><dd>{{ selectedUnit.flow }}</dd></div><div><dt>控制策略</dt><dd>土壤墒情联动</dd></div></dl><button class="schedule" @click="saveIrrigationPlan">{{ activeSoilAlert ? '保存并开始灌溉' : '保存灌溉计划' }}</button></section>
        <section class="threshold-panel"><div class="control-head"><div><small>自动告警规则</small><h3>土壤湿度下限</h3></div><label class="switch water"><input v-model="thresholdEnabled" type="checkbox"><span></span></label></div><div class="threshold-value"><strong>{{ soilThreshold }}%</strong><p>实时湿度低于该值时生成告警；恢复到阈值以上后自动标记恢复。</p></div><input v-model.number="soilThreshold" type="range" min="10" max="80" step="1" :disabled="!thresholdEnabled"><div class="threshold-actions"><button class="simulation-action" :disabled="simulationBusy" @click="runLowMoistureSimulation">{{ simulationBusy ? '模拟中…' : '模拟湿度降至 30%' }}</button><button class="schedule" :disabled="thresholdSaving" @click="saveThreshold">{{ thresholdSaving ? '保存中…' : '保存告警阈值' }}</button></div></section>
      </div>

      <div v-else-if="module === 'crops'" class="content crop-panel">
        <OperationJournal kind="crops" :entity-id="entity?.id" />
        <section class="zone-management"><div class="section-title"><h3>种植区管理</h3><button @click="openNewZone">＋ 新增种植区</button></div><p>选择地图中的露天种植区后可修改资料和位置。</p><button v-if="entity?.type === 'field' && !zoneEditorOpen" class="manage-device" @click="openZoneEditor">编辑当前种植区</button></section>
        <section v-if="zoneEditorOpen" class="device-editor zone-editor"><div class="section-title"><h3>{{ editingZoneId ? '编辑种植区' : '新增种植区' }}</h3><button @click="zoneEditorOpen=false">收起</button></div><div class="form-grid"><label><span>种植区编号</span><input v-model.trim="zoneForm.id" :disabled="!!editingZoneId" maxlength="40"></label><label><span>健康度</span><input v-model.number="zoneForm.health" type="number" min="0" max="100"></label><label class="wide"><span>种植区名称</span><input v-model.trim="zoneForm.name" maxlength="100"></label><label><span>种植作物</span><input v-model.trim="zoneForm.crop" maxlength="100"></label><label><span>面积</span><input v-model.trim="zoneForm.area" maxlength="50" placeholder="2.6 亩"></label><label><span>生长阶段</span><input v-model.trim="zoneForm.stage" maxlength="60"></label><label><span>环境摘要</span><input v-model.trim="zoneForm.environment" maxlength="100"></label><label><span>地图横坐标 (%)</span><input v-model.number="zoneForm.mapX" type="number" min="2" max="98"></label><label><span>地图纵坐标 (%)</span><input v-model.number="zoneForm.mapY" type="number" min="2" max="98"></label></div><p class="zone-position-tip">保存后将以坐标为中心生成地图边界；可再次调整位置。</p><div class="editor-actions"><button v-if="editingZoneId" class="danger-action" :disabled="zoneSaving" @click="removeZone">{{ zoneDeleteArmed ? '再次点击确认删除' : '删除种植区' }}</button><button class="save-action" :disabled="zoneSaving" @click="saveZone">{{ zoneSaving ? '保存中…' : '保存种植区' }}</button></div></section>
        <section class="crop-hero"><div class="leaf"><svg viewBox="0 0 24 24"><path d="M19.5 4.5C13 4.5 8.6 7.2 7 11.6c-.8 2.4-.3 5.3 1.4 7.9 1-5.7 3.8-9.5 8.4-12M7.4 13C5.2 12.6 3.6 13.4 2.5 15c2.3-.8 4.2-.5 5.6.8"/></svg></div><div><small>{{ cropZone.area }}</small><h3>{{ cropZone.crop }}</h3><span>{{ cropZone.stage }}</span></div><div class="score"><b>{{ entity?.health ?? '—' }}</b><small>演示评分</small></div></section>
        <section><div class="section-title"><h3>鸭梨专项观测</h3><small>软件演示</small></div><div class="growth"><article><span>土壤 EC</span><b>{{ soilEC }}</b><em>{{ soilEC === '—' ? '缺少土壤测量' : '农场级演示样本' }}</em></article><article><span>土壤 pH</span><b>{{ soilPH }}</b><em>{{ soilPH === '—' ? '缺少土壤测量' : '农场级演示样本' }}</em></article><article><span>病虫害检测</span><b>候选复核</b><em>独立入口采样与保存意见</em></article><article><span>采后批次</span><b>软件追溯</b><em>上方登记批次与流转</em></article></div></section>
        <section><div class="section-title"><h3>地块记录范围</h3><small>当前档案</small></div><p class="zone-position-tip">已登记生育期：{{ cropZone.stage }}。农事、生长观察与采后批次在上方登记与追溯；地图评分为原演示指标，不作为病害概率。</p></section>
      </div>

      <div v-else class="content overview-panel">
        <OperationJournal v-if="module==='alerts'" kind="alerts" :entity-id="entity?.id" />
        <section class="summary-row"><article><small>农场健康</small><b class="green">{{ dashboardSummary.health }}</b></article><article><small>在线设备</small><b>{{ Math.round(dashboardSummary.onlineDevices/Math.max(1,dashboardSummary.totalDevices)*100) }}%</b></article><article><small>管理地块</small><b>{{ farmZones.length }}</b></article><article><small>待处理</small><b class="orange">{{ dashboardSummary.openAlerts }}</b></article></section>
        <section><div class="section-title"><h3>{{ entity?.name || '重点对象' }}</h3><small>{{ entity?.metric }}</small></div><div v-if="selectedZone" class="overview-card"><div class="leaf"><svg viewBox="0 0 24 24"><path d="M19.5 4.5C13 4.5 8.6 7.2 7 11.6c-.8 2.4-.3 5.3 1.4 7.9 1-5.7 3.8-9.5 8.4-12M7.4 13C5.2 12.6 3.6 13.4 2.5 15c2.3-.8 4.2-.5 5.6.8"/></svg></div><div><b>{{ selectedZone.crop }}</b><small>{{ selectedZone.area }} · {{ selectedZone.stage }}</small><p>{{ selectedZone.environment }}</p></div><strong>{{ entity?.health ?? '—' }}</strong></div><div v-else class="overview-card object-card"><div class="object-glyph"><svg viewBox="0 0 24 24"><path v-if="entity?.type === 'water'" d="M12 3c3.5 4.7 5.5 7.3 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 10.3 8.5 7.7 12 3Z"/><path v-else-if="entity?.type === 'camera'" d="M4 8h11v9H4zM15 11l5-2v7l-5-2zM8 12.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/><path v-else-if="entity?.type === 'robot'" d="M5 7h14v10H5zM12 7V4M8 20v-3M16 20v-3M9 12h.1M15 12h.1"/><path v-else d="M9 4h6l.6 2.2 1.5.8 2.2-.6 2 3.5-1.6 1.6v1.7l1.6 1.6-2 3.5-2.2-.6-1.5.8L15 20H9l-.6-2.1-1.5-.8-2.2.6-2-3.5 1.6-1.6v-1.7L2.7 9.9l2-3.5 2.2.6 1.5-.8L9 4Zm0 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z"/></svg></div><div><b>{{ entity?.name || '农场对象' }}</b><small>{{ entity?.type === 'water' ? '农业水源设施' : entity?.type === 'camera' ? '视频监控设备' : entity?.type === 'robot' ? '智能巡检设备' : '农业物联网设备' }}</small><p>{{ entity?.metric || '运行状态正常' }}</p></div><strong class="object-state">{{ entity?.status === 'offline' ? '离线' : '在线' }}</strong></div></section>
        <section><div class="section-title"><h3>最新告警</h3></div><article v-for="item in alerts" :key="item.id || item.time" class="alert-item"><span>!</span><div><b>{{ item.title }}</b><small>{{ item.time }} · {{ item.status }}</small></div><button v-if="item.id && !['已处理','已恢复'].includes(item.status)" class="resolve-alert" :disabled="alertBusyId === item.id" @click="processAlert(item)"><i>{{ item.title.includes('土壤湿度') ? '→' : alertBusyId === item.id ? '···' : '✓' }}</i>{{ item.title.includes('土壤湿度') ? '去灌溉处理' : alertBusyId === item.id ? '处理中' : '标记处理' }}</button></article></section>
      </div>
      <footer><span>观测与建议分开记录</span><span>演示工作台</span></footer>
    </aside>
  </Transition>
</template>

<style scoped>
.drawer{position:absolute;z-index:24;right:20px;top:94px;bottom:102px;width:420px;display:flex;flex-direction:column;overflow:hidden;background:var(--ui-panel);color:var(--ui-ink);border:1px solid var(--ui-border);border-radius:var(--ui-radius-panel);box-shadow:var(--ui-shadow-panel);font-family:var(--ui-font)}
button,input,select{font:inherit;color:inherit}button{cursor:pointer}button:disabled,input:disabled{opacity:.55;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--ui-brand);outline-offset:3px}
.drawer>header{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:22px 23px 12px;flex:none}.drawer>header small{font-size:10px;color:var(--ui-muted);letter-spacing:.5px}.drawer h2{font-size:20px;font-weight:650;line-height:1.4;margin:5px 0 0;letter-spacing:-.3px}.drawer>header>button{display:grid;place-items:center;width:32px;height:32px;flex:none;border:0;border-radius:9px;background:var(--ui-brand-soft);font-size:24px;color:var(--ui-secondary)}
.source-strip{display:flex;justify-content:space-between;align-items:center;padding:0 23px}.source-strip>span{display:flex;align-items:center;gap:6px;color:var(--ui-warning);font-size:10px}.source-strip i{width:5px;height:5px;border-radius:50%;background:var(--ui-warning)}.source-strip button,.section-title button{background:none;border:0;color:var(--ui-brand);font-size:10px;padding:5px 0}.sync-time{padding:0 23px;margin:4px 0 18px;color:var(--ui-muted);font-size:10px}
.content{flex:1;overflow:auto;min-height:0;padding:0 23px 20px;scrollbar-width:thin;scrollbar-color:var(--ui-border) transparent}.content>section{margin:0 0 18px;padding:16px;border:1px solid var(--ui-border);border-radius:12px;background:var(--ui-panel)}.section-title,.control-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}.section-title h3,.control-head h3{font-size:12px;font-weight:650;line-height:1.5;margin:0}.section-title small,.control-head small{font-size:10px;color:var(--ui-muted)}
.summary-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.summary-row article{min-width:0;border-bottom:1px solid var(--ui-border);padding-bottom:10px}.summary-row small{font-size:10px;color:var(--ui-muted)}.summary-row b{display:block;font-size:24px;font-weight:600;margin-top:6px;font-variant-numeric:tabular-nums}.green{color:var(--ui-success)}.orange{color:var(--ui-warning)}
.hero-card{display:flex;flex-direction:column;gap:8px;background:var(--ui-subtle)!important}.hero-card>span{font-size:12px;color:var(--ui-secondary)}.hero-card>strong{font-size:38px;font-weight:600;line-height:1.2}.hero-card strong small{font-size:12px;margin-left:6px;color:var(--ui-muted)}.hero-card em{font-size:10px;font-style:normal;color:var(--ui-muted)}
.metric-grid,.growth{display:grid;grid-template-columns:1fr 1fr;gap:10px}.metric-grid article,.growth article{display:flex;align-items:center;gap:9px;padding:12px;border:1px solid var(--ui-border);border-radius:10px;background:var(--ui-subtle);min-width:0}.metric-grid small,.growth span{display:block;font-size:10px;color:var(--ui-muted)}.metric-grid b,.growth b{display:block;font-size:18px;font-weight:600;margin:5px 0;font-variant-numeric:tabular-nums}.metric-grid em,.growth em{display:block;font:normal 10px var(--ui-font);color:var(--ui-secondary);line-height:1.6}.metric-icon,.device-symbol{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:8px;background:var(--ui-brand-soft);color:var(--ui-brand);font-size:12px}.metric-icon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.growth article{display:block}
.advice{display:flex;gap:10px;background:var(--ui-subtle)!important}.advice>span{color:var(--ui-brand);font-size:12px}.advice b{font-size:12px}.advice p,.zone-management>p,.zone-position-tip{font-size:10px;line-height:1.8;color:var(--ui-muted);margin:6px 0 0}
.device-list,.unit-list{display:flex;flex-direction:column;gap:8px}.device-list button,.unit-list button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:12px;border:1px solid var(--ui-border);border-radius:10px;background:var(--ui-panel);min-width:0}.device-list button.active,.unit-list button.active{background:var(--ui-brand-soft);border-color:var(--ui-brand-border)}.device-list button:hover,.unit-list button:hover{background:var(--ui-hover)}.device-list button>div,.unit-list button>span{flex:1;min-width:0}.device-list b,.unit-list b{font-size:12px;display:block;font-weight:600}.device-list small,.unit-list small{font-size:10px;display:block;color:var(--ui-muted);line-height:1.7;margin-top:3px}.device-list i,.unit-list i{width:6px;height:6px;border-radius:50%;background:var(--ui-muted);flex:none}.device-list i.online,.unit-list i.running{background:var(--ui-success)}.unit-list em{font-style:normal;font-size:10px;color:var(--ui-secondary)}
dl{margin:0;flex:1}dl>div{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--ui-border)}dl>div:last-child{border:0}dt,dd{font-size:11px;line-height:1.5;margin:0}dt{color:var(--ui-muted)}dd{text-align:right}.switch{position:relative;display:block;width:34px;height:20px;flex:none}.switch input{position:absolute;opacity:0;width:100%;height:100%;margin:0}.switch span{display:block;width:100%;height:100%;background:var(--ui-border);border-radius:20px;pointer-events:none;transition:background .2s}.switch span:before{content:'';display:block;position:absolute;left:3px;top:3px;width:14px;height:14px;background:white;border-radius:50%;transition:transform .2s}.switch input:checked+span{background:var(--ui-brand)}.switch input:checked+span:before{transform:translateX(14px)}.switch input:focus-visible+span{outline:2px solid var(--ui-brand);outline-offset:3px}
.actions{display:flex;gap:8px;margin-top:12px}.actions button,.manage-device,.simulation-action,.editor-actions button{padding:10px 12px;border:1px solid var(--ui-border);border-radius:9px;background:var(--ui-subtle);font-size:11px;color:var(--ui-brand)}.manage-device{width:100%;margin:0 0 18px}.schedule,.save-action{background:var(--ui-brand)!important;color:white!important;border:0!important;border-radius:9px;padding:11px 12px;font-size:11px}.schedule{width:100%;margin-top:12px}.schedule:hover,.save-action:hover{background:var(--ui-brand-hover)!important}.actions button:hover,.manage-device:hover{background:var(--ui-hover)}
.water-summary{display:flex;align-items:center;gap:20px}.water-ring{display:flex;flex-direction:column;align-items:center;justify-content:center;width:82px;height:82px;flex:none;border:6px solid var(--ui-brand-soft);border-radius:50%;color:var(--ui-brand)}.water-ring b{font-size:21px}.water-ring small{font-size:10px;color:var(--ui-muted)}.duration{display:grid;grid-template-columns:1fr auto;gap:10px;margin:16px 0}.duration span,.duration b{font-size:11px}.duration span{color:var(--ui-muted)}.duration input{grid-column:1/-1;width:100%;accent-color:var(--ui-brand)}.threshold-value{display:flex;gap:13px;align-items:center;margin:15px 0}.threshold-value strong{font-size:30px;color:var(--ui-brand)}.threshold-value p{margin:0;font-size:10px;line-height:1.8;color:var(--ui-muted)}.threshold-panel>input{width:100%;accent-color:var(--ui-brand)}.threshold-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.threshold-actions .schedule{margin:0}.irrigation-alert{display:flex;flex-direction:column;gap:5px;margin:12px 0;padding:12px;border:1px solid var(--ui-border);border-radius:10px;background:var(--ui-subtle)}.irrigation-alert b{font-size:11px;color:var(--ui-warning)}.irrigation-alert span{font-size:10px;color:var(--ui-secondary);line-height:1.8}
.crop-hero,.overview-card{display:grid;grid-template-columns:56px 1fr auto;align-items:center;gap:12px}.leaf,.object-glyph{width:56px;height:56px;display:grid;place-items:center;border-radius:12px;background:var(--ui-brand-soft);color:var(--ui-brand)}.leaf svg,.object-glyph svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.crop-hero small,.overview-card small,.overview-card p,.score small{font-size:10px;color:var(--ui-muted);line-height:1.7}.crop-hero h3{font-size:18px;margin:4px 0}.crop-hero span{font-size:11px;color:var(--ui-brand)}.score{text-align:center}.score b{display:block;font-size:26px;font-weight:600;color:var(--ui-brand)}.overview-card b{font-size:13px}.overview-card>strong{font-size:24px;color:var(--ui-brand)}.overview-card>strong.object-state{font-size:11px}.overview-card div:nth-child(2){display:flex;flex-direction:column}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.form-grid label{display:flex;flex-direction:column;gap:6px;min-width:0}.form-grid label.wide{grid-column:1/-1}.form-grid label>span{font-size:10px;color:var(--ui-muted)}.form-grid input,.form-grid select{width:100%;box-sizing:border-box;height:36px;padding:0 9px;border:1px solid var(--ui-border);border-radius:8px;background:var(--ui-subtle);font-size:11px;color:var(--ui-ink)}.editor-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}.danger-action{margin-right:auto;color:var(--ui-danger)!important}
.alert-item{display:flex;align-items:flex-start;gap:10px;padding:14px 0;border-top:1px solid var(--ui-border)}.alert-item>span{display:grid;place-items:center;width:26px;height:26px;flex:none;border-radius:8px;background:var(--ui-subtle);color:var(--ui-warning)}.alert-item>div{flex:1;min-width:0}.alert-item b{font-size:12px;line-height:1.6;display:block}.alert-item small{display:block;font-size:10px;color:var(--ui-muted);line-height:1.8;margin-top:4px}.resolve-alert{display:flex;gap:5px;align-items:center;align-self:center;flex:none;border:1px solid var(--ui-brand-border);border-radius:8px;padding:7px;background:var(--ui-brand-soft);color:var(--ui-brand);font-size:10px}.resolve-alert i{font-style:normal}.greenhouse-entry{padding:0 23px 15px;flex:none}.greenhouse-entry button{display:flex;justify-content:space-between;width:100%;padding:12px;border:1px solid var(--ui-brand-border);border-radius:10px;background:var(--ui-brand-soft);color:var(--ui-brand)}.greenhouse-entry span{display:flex;flex-direction:column;gap:4px;text-align:left}.greenhouse-entry small{font-size:10px;color:var(--ui-muted)}
footer{display:flex;justify-content:space-between;gap:8px;padding:14px 23px;border-top:1px solid var(--ui-border);font-size:10px;color:var(--ui-muted);flex:none}.drawer-enter-active,.drawer-leave-active{transition:transform .24s var(--ui-ease),opacity .24s var(--ui-ease)}.drawer-enter-from,.drawer-leave-to{transform:translateX(24px);opacity:0}
@media(max-width:1000px){.drawer{right:12px;width:370px}}@media(max-width:700px){.drawer{top:124px;bottom:88px;right:10px;left:10px;width:auto;border-radius:16px}.drawer>header{padding:18px 18px 10px}.drawer h2{font-size:18px}.content{padding:0 18px 16px}.source-strip{padding:0 18px}.sync-time{padding:0 18px}.summary-row{grid-template-columns:1fr 1fr}.alert-item{flex-wrap:wrap}.resolve-alert{margin-left:36px}footer{padding:12px 18px}}
</style>
<style scoped>.transport-entry{width:100%;text-align:left;padding:17px;border:1px solid var(--ui-brand-soft);border-radius:12px;background:var(--ui-brand-soft);display:flex;flex-direction:column;gap:8px;color:var(--ui-brand);cursor:pointer;font-family:var(--font-sans);margin-bottom:17px}.transport-entry>span{font-size:14px;font-weight:600}.transport-entry small{font-size:10px;color:#8ca093}.transport-entry b{font-size:10px;font-weight:500}</style>