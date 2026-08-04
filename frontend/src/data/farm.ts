import { reactive } from 'vue'
import type { DashboardSnapshot, DashboardSummary, DeviceRecord, DockModuleDefinition, FarmZone, IrrigationUnit, MetricItem, SceneEntity } from '@/types'

export const sceneEntities = reactive<SceneEntity[]>([
  { id: 'gh-01', name: '1号番茄温室', type: 'greenhouse', status: 'normal', metric: '健康度 96', x: 25, y: 52, health: 96, position3D: { x: -16, y: 0, z: 3 } },
  { id: 'gh-02', name: '2号草莓温室', type: 'greenhouse', status: 'attention', metric: '湿度 42%', x: 32, y: 48, health: 86, position3D: { x: -8, y: 0, z: 1 } },
  { id: 'gh-03', name: '3号黄瓜温室', type: 'greenhouse', status: 'normal', metric: '健康度 92', x: 39, y: 44, health: 92, position3D: { x: 0, y: 0, z: -2 } },
  { id: 'gh-04', name: '4号育苗温室', type: 'greenhouse', status: 'normal', metric: '健康度 94', x: 47, y: 41, health: 94, position3D: { x: 8, y: 0, z: -5 } },
  { id: 'gh-06', name: '6号叶菜温室', type: 'greenhouse', status: 'normal', metric: '健康度 90', x: 54, y: 40, health: 90, position3D: { x: 16, y: 0, z: -8 } },
  { id: 'gh-05', name: '5号生态温室', type: 'greenhouse', status: 'normal', metric: '健康度 91', x: 58, y: 54, health: 91, position3D: { x: 7, y: 0, z: 4 } },
  { id: 'field-04', name: '4号生菜种植区', type: 'field', status: 'warning', metric: '土壤湿度 32%', x: 43, y: 62, health: 74, position3D: { x: 4, y: 0, z: 12 } },
  { id: 'field-05', name: '5号露天种植区', type: 'field', status: 'normal', metric: '长势良好', x: 73, y: 60, health: 93, position3D: { x: 19, y: 0, z: 8 } },
  { id: 'weather-01', name: '气象站01', type: 'station', status: 'normal', metric: '28.3°C · 2.1m/s', x: 13, y: 40, position3D: { x: -28, y: 0, z: -7 } },
  { id: 'water-01', name: '蓄水池01', type: 'water', status: 'normal', metric: '水位 82%', x: 17, y: 70, position3D: { x: -20, y: 0, z: 18 } },
  { id: 'fertilizer-01', name: '水肥一体机01', type: 'device', status: 'normal', metric: 'EC 1.32mS/cm', x: 67, y: 44, position3D: { x: 15, y: 0, z: -2 } },
  { id: 'pump-02', name: '增压泵站02', type: 'device', status: 'offline', metric: '通信中断 · 6分钟', x: 53, y: 73, position3D: { x: 2, y: 0, z: 9 } },
  { id: 'valve-02', name: '灌溉阀门组02', type: 'device', status: 'normal', metric: '流量 12.6m³/h', x: 36, y: 79, position3D: { x: -10, y: 0, z: 20 } },
  { id: 'camera-03', name: '摄像头03', type: 'camera', status: 'normal', metric: 'AI 识别在线', x: 69, y: 77, position3D: { x: 15, y: 0, z: 18 } },
  { id: 'robot-01', name: '农业机器人01', type: 'robot', status: 'normal', metric: '巡检中 · 82%', x: 60, y: 73, position3D: { x: 24, y: 0, z: 12 } }
])

export const farmZones = reactive<FarmZone[]>([
  { id: 'zone-gh-01', entityId: 'gh-01', polygon: [[238,483],[302,458],[492,522],[503,579],[468,611],[416,620],[238,549]], crop: '樱桃番茄', area: '1,200 ㎡', stage: '开花坐果期', environment: '26.5°C · 62%' },
  { id: 'zone-gh-02', entityId: 'gh-02', polygon: [[350,447],[410,429],[624,478],[634,526],[596,553],[557,563],[350,507]], crop: '红颜草莓', area: '980 ㎡', stage: '膨果期', environment: '25.8°C · 67%' },
  { id: 'zone-gh-03', entityId: 'gh-03', polygon: [[471,412],[521,395],[715,438],[725,478],[694,506],[660,516],[470,462]], crop: '水果黄瓜', area: '1,080 ㎡', stage: '采收期', environment: '27.1°C · 59%' },
  { id: 'zone-gh-04', entityId: 'gh-04', polygon: [[594,385],[649,369],[826,409],[838,446],[810,472],[780,480],[594,428]], crop: '蔬菜育苗', area: '760 ㎡', stage: '幼苗期', environment: '25.2°C · 70%' },
  { id: 'zone-gh-06', entityId: 'gh-06', polygon: [[698,359],[759,341],[965,388],[981,423],[959,457],[926,470],[697,412]], crop: '水培叶菜', area: '1,050 ㎡', stage: '快速生长期', environment: '25.9°C · 66%' },
  { id: 'zone-gh-05', entityId: 'gh-05', polygon: [[722,509],[788,483],[991,522],[1009,558],[991,593],[920,620],[721,561]], crop: '生态番茄', area: '1,160 ㎡', stage: '营养生长期', environment: '26.8°C · 61%' },
  { id: 'zone-field-04', entityId: 'field-04', polygon: [[468,580],[707,535],[866,614],[816,657],[665,707],[457,651]], crop: '奶油生菜', area: '2.6 亩', stage: '生长期', environment: '土壤湿度 32%' },
  { id: 'zone-field-05', entityId: 'field-05', polygon: [[1000,570],[1273,514],[1339,650],[1212,690],[1071,726],[948,662]], crop: '露天甘蓝', area: '3.1 亩', stage: '莲座期', environment: '土壤湿度 48%' }
])

export const dockModules = reactive<DockModuleDefinition[]>([
  { key: 'overview', label: '总览', icon: '⌂', description: '完整农场与关键状态', subLayers: [{ key: 'health', label: '农场健康', value: '92' }, { key: 'weather', label: '今日天气', value: '28°C' }, { key: 'online', label: '设备在线', value: '96%' }] },
  { key: 'monitoring', label: '监控', icon: '◉', description: '摄像头与 AI 覆盖范围', badge: 3, subLayers: [{ key: 'all-cameras', label: '全部摄像头', value: '12' }, { key: 'ai-events', label: 'AI 事件', value: '3' }, { key: 'coverage', label: '覆盖范围' }] },
  { key: 'environment', label: '环境', icon: '♨', description: '空间环境与热力分布', subLayers: [{ key: 'temperature', label: '温度' }, { key: 'airHumidity', label: '空气湿度' }, { key: 'soilMoisture', label: '土壤湿度' }, { key: 'light', label: '光照' }, { key: 'co2', label: 'CO₂' }] },
  { key: 'devices', label: '设备', icon: '⚙', description: '设备空间位置和运行状态', badge: 1, subLayers: [{ key: 'all-devices', label: '全部设备', value: '28' }, { key: 'sensors', label: '传感器', value: '16' }, { key: 'actuators', label: '执行设备', value: '12' }, { key: 'offline', label: '离线', value: '1' }] },
  { key: 'irrigation', label: '灌溉', icon: '◒', description: '水源、管线、阀门与水流', subLayers: [{ key: 'network', label: '灌溉管网' }, { key: 'flow', label: '实时水流', value: '12.6m³/h' }, { key: 'plans', label: '今日计划', value: '4' }] },
  { key: 'crops', label: '作物', icon: '⌁', description: '品种、生长阶段和健康度', subLayers: [{ key: 'health', label: '健康度' }, { key: 'stage', label: '生长阶段' }, { key: 'maturity', label: '成熟度' }, { key: 'risk', label: '异常区域', value: '1' }] },
  { key: 'alerts', label: '告警', icon: '△', description: '只显示异常对象和风险等级', badge: 3, subLayers: [{ key: 'all-alerts', label: '全部', value: '3' }, { key: 'attention', label: '关注', value: '1' }, { key: 'warning', label: '预警', value: '2' }, { key: 'offline', label: '离线', value: '1' }] }
])

export const environmentMetrics = reactive<MetricItem[]>([
  { label: '空气温度', value: '28.3°C', delta: '+0.2°C' },
  { label: '空气湿度', value: '56%', delta: '-1.0%' },
  { label: '土壤湿度', value: '42%', delta: '-4.8%', tone: 'warning' as const },
  { label: '光照强度', value: '680 lx', delta: '+32 lx' },
  { label: 'CO₂', value: '580 ppm', delta: '正常' }
])

export const deviceRecords = reactive<DeviceRecord[]>([
  { id: 'dev-weather', entityId: 'weather-01', name: '田间气象站 01', category: 'sensor', location: '西侧露天区', online: true, enabled: true, value: '28.3°C · 2.1m/s', lastSeen: '刚刚' },
  { id: 'dev-camera', entityId: 'camera-03', name: 'AI 摄像头 03', category: 'camera', location: '东南巡检区', online: true, enabled: true, value: '1080P · AI 在线', lastSeen: '3 秒前' },
  { id: 'dev-fertilizer', entityId: 'fertilizer-01', name: '水肥一体机 01', category: 'actuator', location: '温室设备区', online: true, enabled: true, value: 'EC 1.32mS/cm', lastSeen: '12 秒前' },
  { id: 'dev-pump', entityId: 'pump-02', name: '增压泵站 02', category: 'actuator', location: '南侧灌溉区', online: false, enabled: false, value: '通信中断', lastSeen: '6 分钟前' },
  { id: 'dev-valve', entityId: 'valve-02', name: '电磁阀门组 02', category: 'actuator', location: '南侧主管网', online: true, enabled: false, value: '关闭 · 0m³/h', lastSeen: '8 秒前' },
  { id: 'dev-robot', entityId: 'robot-01', name: '农业巡检机器人 01', category: 'robot', location: '5号露天种植区', online: true, enabled: true, value: '巡检中 · 电量82%', lastSeen: '刚刚' }
])

export const irrigationUnits = reactive<IrrigationUnit[]>([
  { id: 'water-source', entityId: 'water-01', name: '蓄水池总控', target: '全场供水', kind: 'source', x: 20, y: 69, enabled: true, flow: '水位 82%' },
  { id: 'fertigation', entityId: 'fertilizer-01', name: '水肥一体机', target: '温室主管网', kind: 'fertigation', x: 61, y: 48, enabled: true, flow: '12.6m³/h' },
  { id: 'valve-south', entityId: 'valve-02', name: '南区阀门组', target: '4号生菜种植区', kind: 'valve', x: 35, y: 78, enabled: false, flow: '0m³/h' },
  { id: 'zone-field-04', entityId: 'field-04', name: '4号区灌溉单元', target: '奶油生菜 · 2.6亩', kind: 'zone', x: 43, y: 62, enabled: false, flow: '建议灌溉 18min' },
  { id: 'zone-field-05', entityId: 'field-05', name: '5号区灌溉单元', target: '露天甘蓝 · 3.1亩', kind: 'zone', x: 73, y: 59, enabled: true, flow: '8.4m³/h' }
])

export const alerts = reactive<Array<{ id?: number; entityId?: string; time: string; title: string; level: string; status: string }>>([
  { time: '10:23', title: '4号生菜区土壤湿度偏低', level: '预警', status: '未处理' },
  { time: '09:48', title: '2号温室西侧叶片轻度萎蔫', level: '关注', status: '处理中' },
  { time: '08:12', title: '水肥一体机 EC 短时偏高', level: '提醒', status: '已恢复' }
])

export const dashboardSummary = reactive<DashboardSummary>({
  health: 92, totalDevices: 28, onlineDevices: 27, runningDevices: 18,
  openAlerts: 3, waterLevel: 82, todayWaterUsage: 38.2
})

export function applyDashboard(snapshot: DashboardSnapshot) {
  sceneEntities.splice(0, sceneEntities.length, ...snapshot.entities)
  farmZones.splice(0, farmZones.length, ...snapshot.zones)
  environmentMetrics.splice(0, environmentMetrics.length, ...snapshot.environmentMetrics)
  deviceRecords.splice(0, deviceRecords.length, ...snapshot.devices)
  irrigationUnits.splice(0, irrigationUnits.length, ...snapshot.irrigationUnits)
  alerts.splice(0, alerts.length, ...snapshot.alerts)
  Object.assign(dashboardSummary, snapshot.summary)
  const overview = dockModules.find(item => item.key === 'overview')
  if (overview) {
    overview.subLayers.find(item => item.key === 'health')!.value = String(snapshot.summary.health)
    overview.subLayers.find(item => item.key === 'online')!.value = `${Math.round(snapshot.summary.onlineDevices / Math.max(1, snapshot.summary.totalDevices) * 100)}%`
  }
  const devicesModule = dockModules.find(item => item.key === 'devices')
  if (devicesModule) {
    devicesModule.badge = snapshot.summary.totalDevices - snapshot.summary.onlineDevices
    devicesModule.subLayers.find(item => item.key === 'all-devices')!.value = String(snapshot.summary.totalDevices)
    devicesModule.subLayers.find(item => item.key === 'sensors')!.value = String(snapshot.devices.filter(item => item.category === 'sensor').length)
    devicesModule.subLayers.find(item => item.key === 'actuators')!.value = String(snapshot.devices.filter(item => item.category === 'actuator').length)
    devicesModule.subLayers.find(item => item.key === 'offline')!.value = String(snapshot.summary.totalDevices - snapshot.summary.onlineDevices)
  }
  const alertsModule = dockModules.find(item => item.key === 'alerts')
  if (alertsModule) {
    alertsModule.badge = snapshot.summary.openAlerts
    alertsModule.subLayers.find(item => item.key === 'all-alerts')!.value = String(snapshot.alerts.length)
  }
}
