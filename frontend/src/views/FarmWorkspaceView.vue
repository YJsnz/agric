<script setup lang="ts">
import { computed, ref } from 'vue'
import FarmTopBar from '@/components/workspace/FarmTopBar.vue'
import WeatherCard from '@/components/workspace/WeatherCard.vue'
import AerialFarmScene from '@/components/workspace/AerialFarmScene.vue'
import ThreeFarmScene from '@/components/workspace/ThreeFarmScene.vue'
import ViewSwitcher from '@/components/workspace/ViewSwitcher.vue'
import SceneToolbar from '@/components/workspace/SceneToolbar.vue'
import FarmBusinessDock from '@/components/workspace/FarmBusinessDock.vue'
import FarmContextDrawer from '@/components/workspace/FarmContextDrawer.vue'
import GreenhouseMonitorModal from '@/components/workspace/GreenhouseMonitorModal.vue'
import LayerPopover from '@/components/workspace/LayerPopover.vue'
import ToastMessage from '@/components/ToastMessage.vue'
import FarmAiAssistant from '@/components/workspace/FarmAiAssistant.vue'
import { useWorkspaceStore } from '@/stores/workspace'
import { farmZones } from '@/data/farm'
import type { BusinessModule } from '@/types'

const store = useWorkspaceStore()
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const toast = ref('')
const toastVisible = ref(false)
const notificationsOpen = ref(false)
const monitorOpen = ref(false)
const firstPersonActive = ref(false)
const assistantOpen = ref(false)
const threeScene = ref<{ resumeAfterOverlay: () => void } | null>(null)
let toastTimer = 0

const sceneLabel = computed(() => store.viewMode === 'aerial' ? '智慧农场01 · 实景总览' : '智慧农场01 · 数字孪生')
const monitorZone = computed(() => farmZones.find(zone => zone.entityId === store.selectedEntityId))
const assistantContext = computed(() => {
  const moduleLabels: Record<BusinessModule, string> = {overview:'总览',monitoring:'监控',environment:'环境',devices:'设备',irrigation:'灌溉',crops:'作物',alerts:'告警'}
  const selected = store.selectedEntity
  return `${sceneLabel.value} · ${moduleLabels[store.activeModule]}${selected ? ` · 当前对象：${selected.name}（${selected.metric}）` : ''}`
})

function showToast(message: string) {
  toast.value = message; toastVisible.value = true; window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => toastVisible.value = false, 2200)
}
function resetView(){scale.value=1;offsetX.value=0;offsetY.value=0;showToast('已恢复农场全景视角')}
function focusEntity(id:string){store.selectEntity(id);scale.value=1.18;offsetX.value=id==='field-04'?-35:15;offsetY.value=-12;showToast('已聚焦选中对象')}
function selectEntity(id:string|null){
  if (store.activeModule === 'monitoring' && id && farmZones.some(zone => zone.entityId === id)) {
    store.selectedEntityId = id; store.drawerOpen = false; monitorOpen.value = true; return
  }
  store.selectEntity(id)
}
function handleModule(module: BusinessModule){
  const labels: Record<BusinessModule, string> = {overview:'总览',monitoring:'监控',environment:'环境',devices:'设备',irrigation:'灌溉',crops:'作物',alerts:'告警'}
  monitorOpen.value = false; store.selectModule(module)
  if (module === 'monitoring') { store.selectedEntityId = null; store.drawerOpen = false }
  else if (module === 'environment') { store.selectedEntityId = null; store.drawerOpen = true }
  else if (module === 'devices') store.selectEntity('fertilizer-01')
  else if (module === 'irrigation') store.selectEntity('water-01')
  else if (module === 'crops') store.selectEntity('gh-01')
  else store.drawerOpen = true
  showToast(`已进入“${labels[module]}”业务中心`)
}
function closeDrawer(){store.drawerOpen=false;threeScene.value?.resumeAfterOverlay()}
function closeMonitor(){monitorOpen.value=false;threeScene.value?.resumeAfterOverlay()}
function handleAssistantOpen(open:boolean){assistantOpen.value=open;if(!open)threeScene.value?.resumeAfterOverlay()}
</script>

<template>
  <main class="workspace" :class="{ 'drawer-open': store.drawerOpen }">
    <Transition name="scene" mode="out-in">
      <AerialFarmScene v-if="store.viewMode === 'aerial'" key="aerial" :selected-id="store.selectedEntityId" :active-module="store.activeModule" :active-sub-layer="store.activeSubLayer" :scale="scale" :offset-x="offsetX" :offset-y="offsetY" @select="selectEntity" @focus="focusEntity" />
      <ThreeFarmScene v-else ref="threeScene" key="three" :active-module="store.activeModule" :active-sub-layer="store.activeSubLayer" :selected-id="store.selectedEntityId" :drawer-open="store.drawerOpen" :overlay-open="store.drawerOpen || monitorOpen || assistantOpen" @select="selectEntity" @module="handleModule" @walk="firstPersonActive=$event" />
    </Transition>

    <FarmTopBar dark @search="showToast(`正在搜索：${$event}`)" @notify="notificationsOpen = !notificationsOpen" />
    <WeatherCard :class="{ 'detail-mode-hidden': store.drawerOpen }" @detail="handleModule('environment')" />
    <div class="scene-name"><span class="status-dot"></span>{{ sceneLabel }}</div>

    <ViewSwitcher v-model="store.viewMode" :drawer-open="store.drawerOpen" />
    <SceneToolbar :class="{ 'drawer-closed': !store.drawerOpen }" @zoom-in="scale=Math.min(1.4,scale+.1)" @zoom-out="scale=Math.max(.85,scale-.1)" @reset="resetView" @layers="store.layersOpen=!store.layersOpen" @measure="showToast('测量工具已开启，请选择两个位置')" />
    <LayerPopover :open="store.layersOpen" />

    <Transition name="notice-panel">
      <aside v-if="notificationsOpen" class="notifications">
        <header><strong>消息通知</strong><button @click="notificationsOpen=false">×</button></header>
        <article><i class="warning">△</i><div><b>土壤湿度持续偏低</b><small>4号生菜种植区 · 2分钟前</small></div></article>
        <article><i>✓</i><div><b>机器人巡检任务完成</b><small>农业机器人01 · 18分钟前</small></div></article>
        <button class="all">查看全部消息</button>
      </aside>
    </Transition>

    <FarmContextDrawer :entity="store.selectedEntity" :open="store.drawerOpen" :module="store.activeModule" @close="closeDrawer" @select="selectEntity" @action="showToast($event)" />
    <FarmBusinessDock :active="store.activeModule" :show-shortcuts="firstPersonActive" @change="handleModule" />
    <GreenhouseMonitorModal :open="monitorOpen" :entity="store.selectedEntity" :zone="monitorZone" @close="closeMonitor" @action="showToast($event)" />
    <FarmAiAssistant :open="assistantOpen" :context="assistantContext" @update:open="handleAssistantOpen" />
    <ToastMessage :show="toastVisible" :message="toast" />
  </main>
</template>

<style scoped lang="scss">
.workspace{position:fixed;inset:0;overflow:hidden;background:#173a2b}.scene-enter-active,.scene-leave-active{transition:opacity .65s ease,filter .65s ease,transform .65s ease}.scene-enter-from{opacity:0;filter:blur(8px);transform:scale(1.025)}.scene-leave-to{opacity:0;filter:blur(7px);transform:scale(.985)}.scene-name{position:absolute;z-index:11;left:25px;bottom:31px;padding:8px 12px;border-radius:999px;background:rgba(8,29,23,.55);color:rgba(255,255,255,.78);font-size:11px;backdrop-filter:blur(10px)}.notifications{position:absolute;z-index:40;right:72px;top:68px;width:290px;padding:14px;background:rgba(245,247,240,.94);border:1px solid rgba(255,255,255,.7);border-radius:17px;box-shadow:var(--shadow-lg);backdrop-filter:blur(24px)}.notifications header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.notifications header button{border:0;background:transparent;font-size:22px;cursor:pointer}.notifications article{display:flex;gap:10px;padding:12px 4px;border-top:1px solid var(--border-soft)}.notifications article i{font-style:normal;color:#4c895c}.notifications article i.warning{color:#e4952d}.notifications article div{display:flex;flex-direction:column;gap:4px}.notifications article b{font-size:12px}.notifications article small{font-size:10px;color:var(--text-tertiary)}.notifications .all{width:100%;border:0;border-radius:9px;padding:9px;background:#e8ece2;color:#3e5b44;cursor:pointer}.notice-panel-enter-active,.notice-panel-leave-active{transition:.2s}.notice-panel-enter-from,.notice-panel-leave-to{opacity:0;transform:translateY(-7px)}
.detail-mode-hidden{opacity:0;pointer-events:none;transform:translateY(-8px);transition:opacity .22s,transform .22s}.drawer-open .scene-name{opacity:0;pointer-events:none}
@media(max-width:1000px){.scene-name{display:none}}
@media(max-width:700px){.notifications{right:10px;top:65px;width:calc(100vw - 20px)}}
</style>
