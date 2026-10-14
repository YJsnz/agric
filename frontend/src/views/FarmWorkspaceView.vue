<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FarmTopBar from '@/components/workspace/FarmTopBar.vue'
import WeatherCard from '@/components/workspace/WeatherCard.vue'
import AerialFarmScene from '@/components/workspace/AerialFarmScene.vue'
import OrchardThreeScene from '@/components/workspace/OrchardDigitalTwin.vue'
import {imageToGround} from '@/components/workspace/orchardGeometry'
import {visionList} from '@/api/vision'
import TransportCenter from '@/components/workspace/TransportCenter.vue'
import {useTransport} from '@/api/transport'
import PostHarvestCenter from '@/components/workspace/PostHarvestCenter.vue'
import PearVisionPanel from '@/components/workspace/PearVisionPanel.vue'
import ThreeFarmScene from '@/components/workspace/ThreeFarmScene.vue'
import ViewSwitcher from '@/components/workspace/ViewSwitcher.vue'
import SceneToolbar from '@/components/workspace/SceneToolbar.vue'
import FarmBusinessDock from '@/components/workspace/FarmBusinessDock.vue'
import AgricultureDataPanel from '@/components/workspace/AgricultureDataPanel.vue'
import FarmContextDrawer from '@/components/workspace/FarmContextDrawer.vue'
import GreenhouseMonitorModal from '@/components/workspace/GreenhouseMonitorModal.vue'
import LayerPopover from '@/components/workspace/LayerPopover.vue'
import ToastMessage from '@/components/ToastMessage.vue'
import FarmAiAssistant from '@/components/workspace/FarmAiAssistant.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { alerts, dashboardSummary, farmZones, sceneEntities } from '@/data/farm'
import type { BusinessModule } from '@/types'

const store = useWorkspaceStore()
const route = useRoute()
const router = useRouter()
const legacy = computed(() => route.params.id === 'legacy-farm-01')
const farmId = computed(() => legacy.value ? 'farm-01' : 'yantian-01')
let refreshTimer = 0
onMounted(() => {
  store.selectedEntityId = legacy.value ? 'field-04' : null
  store.drawerOpen = false
  store.activeModule = 'overview'
  store.loadDashboard(false, farmId.value).catch(error => showToast(error instanceof Error ? error.message : '虚拟数据加载失败'))
  refreshTimer = window.setInterval(() => store.loadDashboard(true, farmId.value).catch(() => undefined), 30_000)
})
onUnmounted(() => window.clearInterval(refreshTimer))
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const toast = ref('')
const toastVisible = ref(false)
const notificationsOpen = ref(false)
const monitorOpen = ref(false)
const visionOpen = ref(false)
const transportOpen=ref(false)
let stopTransport=()=>{}
onMounted(()=>{if(!legacy.value)stopTransport=useTransport()});onUnmounted(()=>stopTransport())
const postharvestOpen=ref(route.query.postharvest==='trace')
const traceBatch=computed(()=>Number(route.query.batch)>0?Number(route.query.batch):undefined)
const visionNames = computed(()=>Object.fromEntries(sceneEntities.map(e=>[e.id,e.name])))
const visionCounts=ref<Record<string,number>>({})
async function loadVisionCounts(){if(legacy.value)return;try{const rows=await visionList(farmId.value),counts:Record<string,number>={};for(const row of rows)if(row.result)counts[row.plotId]=(counts[row.plotId]||0)+1;visionCounts.value=counts}catch{visionCounts.value={}}}
function closeVision(){visionOpen.value=false;loadVisionCounts()}
function openVision(id:string){store.selectedEntityId=id;store.drawerOpen=false;visionOpen.value=true}
onMounted(loadVisionCounts)
const firstPersonActive = ref(false)
const assistantOpen = ref(false)
const measuring = ref(false)
const measureStart = ref<string | null>(null)
const layerVisibility = ref<Record<string, boolean>>({ zones:true, devices:true, cameras:false, irrigation:false, alerts:true })
const orchardScene = ref<{resetView:()=>void;zoomBy:(factor:number)=>void;focusEntity:(id:string)=>void}>()
const aerialScene = ref<{focusOffset:(id:string,scale:number)=>{x:number;y:number}}>()
const threeScene = ref<{ resumeAfterOverlay: () => void } | null>(null)
let toastTimer = 0

const sceneLabel = computed(() => `${store.snapshot?.farmName || '智慧农场01'} · ${store.viewMode === 'aerial' ? '实景示意' : '3D 场景'} · ${store.snapshot?.virtualData !== false ? '演示' : '业务'}数据`)
const monitorZone = computed(() => farmZones.find(zone => zone.entityId === store.selectedEntityId))
const assistantContext = computed(() => {
  const moduleLabels: Record<BusinessModule, string> = {overview:'数据',monitoring:'监控',environment:'墒情',devices:'设施',irrigation:'灌排',crops:'种植',alerts:'告警'}
  const selected = store.selectedEntity
  return `${sceneLabel.value} · ${moduleLabels[store.activeModule]}${selected ? ` · 当前对象：${selected.name}（${selected.metric}）` : ''}`
})

function showToast(message: string) {
  toast.value = message; toastVisible.value = true; window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => toastVisible.value = false, 2200)
}
function resetView(){orchardScene.value?.resetView();scale.value=1;offsetX.value=0;offsetY.value=0;showToast('已恢复农场全景视角')}
function focusEntity(id:string){
  store.selectEntity(id);orchardScene.value?.focusEntity(id);scale.value=1.18
  const offset=!legacy.value ? aerialScene.value?.focusOffset(id,scale.value) : undefined
  offsetX.value=offset?.x ?? (id==='field-04'?-35:15);offsetY.value=offset?.y ?? -12
  showToast('已聚焦选中对象')
}
function selectEntity(id:string|null){
  if (measuring.value && id) {
    if (!measureStart.value) { measureStart.value = id; showToast('已选择起点，请选择终点'); return }
    const start = sceneEntities.find(item => item.id === measureStart.value)
    const end = sceneEntities.find(item => item.id === id)
    if(!legacy.value&&start&&end){const a=imageToGround(start.x*15.36,start.y*10.24),b=imageToGround(end.x*15.36,end.y*10.24);showToast(`${start.name} 至 ${end.name}：${Math.hypot(a[0]-b[0],a[1]-b[1]).toFixed(1)} 场景单位（非实测距离）`);measuring.value=false;measureStart.value=null;return}
    if (start?.position3D && end?.position3D) {
      const dx=start.position3D.x-end.position3D.x, dy=start.position3D.y-end.position3D.y, dz=start.position3D.z-end.position3D.z
      showToast(`${start.name} 至 ${end.name}：${Math.sqrt(dx*dx+dy*dy+dz*dz).toFixed(1)} ${legacy.value ? '米（演示）' : '场景单位（非实测距离）'}`)
    } else showToast('所选对象缺少空间坐标')
    measuring.value=false; measureStart.value=null; return
  }
  if (store.activeModule === 'monitoring' && id && farmZones.some(zone => zone.entityId === id)) {
    store.selectedEntityId = id; store.drawerOpen = false; monitorOpen.value = true; return
  }
  store.selectEntity(id)
}
function searchEntity(query:string) {
  const normalized = query.toLowerCase()
  const found = sceneEntities.find(item => `${item.name} ${item.metric} ${item.type}`.toLowerCase().includes(normalized))
  if (!found) return showToast(`未找到“${query}”`)
  focusEntity(found.id)
}
function startMeasure(){measuring.value=true;measureStart.value=null;store.drawerOpen=false;showToast('测距模式：请选择两个地图对象')}
function showAllAlerts(){notificationsOpen.value=false;handleModule('alerts')}
function isActiveSoilAlert(item: (typeof alerts)[number]) {
  return item.title.includes('土壤湿度') && !['已处理', '已恢复'].includes(item.status)
}
function openIrrigationForAlert(entityId = legacy.value ? 'field-04' : 'yt-pear-03') {
  notificationsOpen.value = false
  monitorOpen.value = false
  store.selectModule('irrigation')
  store.selectEntity(entityId)
  showToast('已定位观测对象；灌溉控制为演示操作，请先核验阈值与地块条件')
}
function openAlert(item: (typeof alerts)[number]) {
  if (isActiveSoilAlert(item)) { openIrrigationForAlert(item.entityId || 'field-04'); return }
  notificationsOpen.value = false
  monitorOpen.value = false
  store.selectModule('alerts')
  if (item.entityId) store.selectEntity(item.entityId)
  else store.drawerOpen = true
  showToast(item.entityId ? '已定位告警对象，请在右侧处理' : '已打开告警处理栏目')
}
async function refreshDashboard() {
  try { await store.loadDashboard(true, farmId.value) }
  catch (error) { showToast(error instanceof Error ? error.message : '数据同步失败') }
}
function handleModule(module: BusinessModule){
  const labels: Record<BusinessModule, string> = {overview:'数据',monitoring:'监控',environment:'墒情',devices:'设施',irrigation:'灌排',crops:'种植',alerts:'告警'}
  monitorOpen.value = false; store.selectModule(module)
  if (module === 'monitoring') { store.drawerOpen = false;store.selectedEntityId=null }
  else if (module === 'environment') { store.selectedEntityId = null; store.drawerOpen = true }
  else if (module === 'devices') store.selectEntity(legacy.value ? 'fertilizer-01' : 'yt-valve')
  else if (module === 'irrigation') store.selectEntity(legacy.value ? 'water-01' : 'yt-water')
  else if (module === 'crops') store.selectEntity(farmZones.some(zone=>zone.entityId===store.selectedEntityId) ? store.selectedEntityId : farmZones[0]?.entityId || 'gh-01')
  else store.drawerOpen = true
  showToast(`已进入“${labels[module]}”业务中心`)
}
function closeDrawer(){store.drawerOpen=false;resetView();threeScene.value?.resumeAfterOverlay()}
function closeMonitor(){monitorOpen.value=false;threeScene.value?.resumeAfterOverlay()}
function enterGreenhouse(id:string){router.push(`/workspaces/${String(route.params.id || 'farm-01')}/greenhouses/${id}`)}
function handleAssistantOpen(open:boolean){assistantOpen.value=open;if(!open)threeScene.value?.resumeAfterOverlay()}
function askAgent(prompt:string){router.push({path:'/assistant',query:{prompt,farmId:farmId.value}})}
</script>

<template>
  <main class="workspace" :class="{ 'drawer-open': store.drawerOpen }">
    <Transition name="scene" mode="out-in">
      <AerialFarmScene @transport="transportOpen=true" ref="aerialScene" :project-mode="!legacy" v-if="store.viewMode === 'aerial'" key="aerial" :selected-id="store.selectedEntityId" :active-module="store.activeModule" :active-sub-layer="store.activeSubLayer" :scale="scale" :offset-x="offsetX" :offset-y="offsetY" :layers="store.snapshot?.farmId === farmId ? layerVisibility : { zones:false,devices:false,cameras:false,irrigation:false,alerts:false }" @select="selectEntity" @focus="focusEntity" />
      <ThreeFarmScene v-else-if="legacy" ref="threeScene" key="three" :active-module="store.activeModule" :active-sub-layer="store.activeSubLayer" :selected-id="store.selectedEntityId" :drawer-open="store.drawerOpen" :overlay-open="store.drawerOpen || monitorOpen || assistantOpen" @select="selectEntity" @module="handleModule" @walk="firstPersonActive=$event" @enter-greenhouse="enterGreenhouse" />
      <OrchardThreeScene @transport="transportOpen=true" @walk="firstPersonActive=$event" @module="handleModule" :layers="layerVisibility" :overlay-open="store.drawerOpen || monitorOpen || assistantOpen || visionOpen || postharvestOpen || transportOpen" :vision-counts="visionCounts" @vision="openVision" ref="orchardScene" v-else-if="store.snapshot?.farmId === farmId" :selected-id="store.selectedEntityId" @select="selectEntity" />
    </Transition>

    <Transition name="data-loading">
      <div v-if="store.loading && !store.lastSyncedAt" class="data-loading-card">
        <ProgressBar :value="null" label="同步智慧农场数据" pending-label="连接数据中心" />
      </div>
    </Transition>

    <TransportCenter v-if="transportOpen && !legacy" @close="transportOpen=false"/>
    <PostHarvestCenter v-if="postharvestOpen && store.snapshot" :snapshot="store.snapshot" :initial-batch="traceBatch" @close="postharvestOpen=false" @ask="askAgent"/>
    <PearVisionPanel v-if="visionOpen && !legacy" :farm-id="farmId" :selected-id="store.selectedEntityId" :plots="farmZones" :names="visionNames" @close="closeVision" @ask="askAgent" />
    <FarmTopBar :farm-name="store.snapshot?.farmName" :legacy="legacy" @farm="router.push($event === 'farm-01' ? '/workspaces/legacy-farm-01' : '/workspaces/farm-01')" :notification-count="dashboardSummary.openAlerts" @search="searchEntity" @notify="notificationsOpen = !notificationsOpen" />
    <WeatherCard :class="{ 'detail-mode-hidden': store.drawerOpen || (!legacy && firstPersonActive) }" @detail="handleModule('environment')" />
    <div class="scene-name"><span class="status-dot"></span>{{ sceneLabel }}</div>

    <ViewSwitcher v-model="store.viewMode" :drawer-open="store.drawerOpen" />
    <button v-if="scale !== 1 || offsetX !== 0 || offsetY !== 0" class="return-overview" @click="resetView">↶ 返回全景</button>
    <SceneToolbar :class="{ 'drawer-closed': !store.drawerOpen }" @zoom-in="store.viewMode === 'digital-twin' && !legacy ? orchardScene?.zoomBy(.9) : scale=Math.min(1.4,scale+.1)" @zoom-out="store.viewMode === 'digital-twin' && !legacy ? orchardScene?.zoomBy(1.1) : scale=Math.max(.85,scale-.1)" @reset="resetView" @layers="store.layersOpen=!store.layersOpen" @measure="startMeasure" />
    <LayerPopover :open="store.layersOpen" @change="(key,on)=>layerVisibility[key]=on" />

    <Transition name="notice-panel">
      <aside v-if="notificationsOpen" class="notifications">
        <header><strong>消息通知</strong><button @click="notificationsOpen=false">×</button></header>
        <article v-for="item in alerts.slice(0,3)" :key="item.id || item.time"><i :class="{warning:item.status!=='已处理'&&item.status!=='已恢复'}">△</i><div><b>{{ item.title }}</b><small>{{ item.time }} · {{ item.status }}</small></div><button class="notice-action" @click="openAlert(item)">{{ item.status === '已处理' || item.status === '已恢复' ? '查看' : '处理' }}</button></article>
        <button class="all" @click="showAllAlerts">查看全部消息</button>
      </aside>
    </Transition>

    <Transition name="data-panel"><AgricultureDataPanel v-if="store.drawerOpen && store.activeModule === 'overview'" :snapshot="store.snapshot" :entity="store.selectedEntity" :loading="store.loading" :error="store.loadError" @vision="openVision(store.selectedEntityId || farmZones[0]?.entityId || 'yt-pear-01')" @close="closeDrawer" @refresh="refreshDashboard" @module="handleModule" @select="selectEntity" @ask="askAgent" /></Transition>
    <FarmContextDrawer @transport="transportOpen=true" :entity="store.selectedEntity" :open="store.drawerOpen && store.activeModule !== 'overview'" :module="store.activeModule" @close="closeDrawer" @select="selectEntity" @action="showToast($event)" @refresh="refreshDashboard" @irrigate="openIrrigationForAlert" @enter-greenhouse="enterGreenhouse" />
    <FarmBusinessDock @postharvest="postharvestOpen=true" :active="store.activeModule" :show-shortcuts="firstPersonActive" :show-vision="!legacy" :vision-active="visionOpen" @vision="visionOpen=true;monitorOpen=false;store.drawerOpen=false" @change="handleModule" />
    <GreenhouseMonitorModal :open="monitorOpen" :entity="store.selectedEntity" :zone="monitorZone" @close="closeMonitor" @action="showToast($event)" />
    <FarmAiAssistant :compact="!legacy" :farm-id="farmId" :open="assistantOpen" :context="assistantContext" @update:open="handleAssistantOpen" />
    <ToastMessage :show="toastVisible" :message="toast" />
  </main>
</template>

<style scoped lang="scss">
.return-overview{position:absolute;z-index:35;left:20px;top:176px;display:flex;align-items:center;gap:8px;padding:11px 16px;border:1px solid rgba(255,255,255,.55);border-radius:999px;background:rgba(247,250,246,.94);color:var(--ui-brand);font:600 13px var(--font-sans);box-shadow:0 6px 22px #102f2526;backdrop-filter:blur(14px);cursor:pointer;transition:background .2s,transform .2s}.return-overview:hover{background:white;transform:translateY(-1px)}.return-overview:focus-visible{outline:2px solid var(--ui-brand);outline-offset:3px}@media(max-width:700px){.return-overview{left:12px;top:148px;padding:9px 13px;font-size:12px}}@media(prefers-reduced-motion:reduce){.return-overview{transition:none}}
.workspace{position:fixed;inset:0;overflow:hidden;background:#173a2b}.scene-enter-active,.scene-leave-active{transition:opacity .65s ease,filter .65s ease,transform .65s ease}.scene-enter-from{opacity:0;filter:blur(8px);transform:scale(1.025)}.scene-leave-to{opacity:0;filter:blur(7px);transform:scale(.985)}.scene-name{position:absolute;z-index:11;left:25px;bottom:31px;padding:8px 12px;border-radius:999px;background:rgba(8,29,23,.55);color:rgba(255,255,255,.78);font-size:11px;backdrop-filter:blur(10px)}.notifications{position:absolute;z-index:40;right:72px;top:68px;width:310px;padding:14px;background:rgba(245,247,240,.94);border:1px solid rgba(255,255,255,.7);border-radius:17px;box-shadow:var(--shadow-lg);backdrop-filter:blur(24px)}.notifications header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.notifications header button{border:0;background:transparent;font-size:22px;cursor:pointer}.notifications article{display:flex;align-items:center;gap:10px;padding:12px 4px;border-top:1px solid var(--border-soft)}.notifications article i{font-style:normal;color:#4c895c}.notifications article i.warning{color:#e4952d}.notifications article div{min-width:0;display:flex;flex:1;flex-direction:column;gap:4px}.notifications article b{font-size:12px}.notifications article small{font-size:10px;color:var(--text-tertiary)}.notice-action{flex:none;padding:6px 8px;border:1px solid #d6e2d4!important;border-radius:8px;background:#f7faf5!important;color:var(--ui-brand);font-size:10px!important;cursor:pointer}.notifications .all{width:100%;border:0;border-radius:9px;padding:9px;background:#e8ece2;color:#3e5b44;cursor:pointer}.notice-panel-enter-active,.notice-panel-leave-active{transition:.2s}.notice-panel-enter-from,.notice-panel-leave-to{opacity:0;transform:translateY(-7px)}
.detail-mode-hidden{opacity:0;pointer-events:none;transform:translateY(-8px);transition:opacity .22s,transform .22s}.drawer-open .scene-name{opacity:0;pointer-events:none}
.data-loading-card{position:absolute;z-index:55;left:50%;top:94px;transform:translateX(-50%);width:min(360px,calc(100vw - 32px));padding:13px 15px;border:1px solid rgba(255,255,255,.76);border-radius:15px;background:rgba(247,250,245,.92);box-shadow:0 18px 50px rgba(7,35,20,.25);backdrop-filter:blur(24px)}.data-loading-enter-active,.data-loading-leave-active{transition:.3s}.data-loading-enter-from,.data-loading-leave-to{opacity:0;transform:translate(-50%,-10px) scale(.96)}
@media(max-width:1000px){.scene-name{display:none}}
@media(max-width:700px){.notifications{right:10px;top:65px;width:calc(100vw - 20px)}}
.data-panel-enter-active,.data-panel-leave-active{transition:opacity .24s,transform .32s cubic-bezier(.22,1,.36,1)}.data-panel-enter-from,.data-panel-leave-to{opacity:0;transform:translateX(18px)}
</style>
