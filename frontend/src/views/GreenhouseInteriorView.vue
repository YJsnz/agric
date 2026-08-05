<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'
import UserMenu from '@/components/workspace/UserMenu.vue'
import GreenhouseTwinScene from '@/components/workspace/GreenhouseTwinScene.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import { fetchGreenhouseDetail } from '@/api/dashboard'
import type { GreenhouseDetail } from '@/types'

const route = useRoute(); const router = useRouter()
const detail = ref<GreenhouseDetail>(); const loading = ref(true); const error = ref('')
const mode = ref<'real' | 'twin'>('real'); const selectedPlantId = ref<string | null>(null); const sidebarOpen = ref(true)
const activePanel = ref<'overview' | 'devices' | 'plants'>('overview')
const realVideo = ref<HTMLVideoElement>(); const videoState = ref<'loading' | 'playing' | 'paused' | 'error'>('loading')
let timer = 0
const farmId = computed(() => String(route.params.id || 'farm-01'))
const greenhouseId = computed(() => String(route.params.greenhouseId || 'gh-01'))
const selectedPlant = computed(() => detail.value?.plants.find(item => item.id === selectedPlantId.value))
const onlineDevices = computed(() => detail.value?.devices.filter(item => item.online).length || 0)
const attentionPlants = computed(() => detail.value?.plants.filter(item => item.status !== 'normal').length || 0)
const generatedTime = computed(() => detail.value ? new Date(detail.value.generatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '')
const chartPoints = computed(() => {
  const rows = detail.value?.heightTrend || []; if (!rows.length) return ''
  const values = rows.map(item => item.height); const min = Math.min(...values) - 2; const max = Math.max(...values) + 2
  return rows.map((item, index) => `${index ? 'L' : 'M'}${10 + index * 46},${82 - (item.height - min) / Math.max(1, max - min) * 65}`).join(' ')
})

async function load(silent = false) {
  if (!silent) loading.value = true
  try { detail.value = await fetchGreenhouseDetail(greenhouseId.value, farmId.value); error.value = ''; if (!selectedPlantId.value) selectedPlantId.value = detail.value.plants[0]?.id || null; await nextTick(); if (mode.value === 'real') startRealVideo() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : '大棚数据加载失败' }
  finally { loading.value = false }
}
function back() { router.push(`/workspaces/${farmId.value}`) }
function selectPlant(id: string) { selectedPlantId.value = id; activePanel.value = 'plants' }
async function startRealVideo() {
  await nextTick(); const video = realVideo.value; if (!video) return
  video.muted = true; video.defaultMuted = true; video.playsInline = true; videoState.value = 'loading'
  try { await video.play(); videoState.value = 'playing' } catch { videoState.value = 'paused' }
}
function handleVideoError() { videoState.value = 'error' }
watch(greenhouseId, () => load())
watch(mode, value => { if (value === 'real') startRealVideo() })
onMounted(() => { load(); timer = window.setInterval(() => load(true), 30_000) })
onUnmounted(() => window.clearInterval(timer))
</script>

<template>
  <main class="greenhouse-page">
    <header class="topbar">
      <div class="brand"><button class="back" @click="back">←<span>返回农场</span></button><BrandLogo compact /><i></i><div><small>GREENHOUSE DIGITAL TWIN</small><strong>{{ detail?.greenhouse.name || '大棚内部' }}</strong></div></div>
      <div class="top-actions"><div class="view-toggle"><button :class="{active:mode==='real'}" @click="mode='real'">实景</button><button :class="{active:mode==='twin'}" @click="mode='twin'">数字孪生</button></div><span class="live"><i></i>数据实时同步</span><UserMenu /></div>
    </header>

    <section v-if="detail" class="workspace" :class="{'sidebar-closed':!sidebarOpen}">
      <div class="scene">
        <Transition name="scene" mode="out-in">
          <div v-if="mode==='real'" key="real" class="real-view"><video ref="realVideo" autoplay muted loop playsinline preload="auto" :poster="`${$router.options.history.base}assets/media/greenhouse-monitor-poster.jpg`" @playing="videoState='playing'" @pause="videoState='paused'" @error="handleVideoError"><source :src="`${$router.options.history.base}assets/media/greenhouse-monitor.mp4`" type="video/mp4"></video><button v-if="videoState==='paused'" class="video-play" @click="startRealVideo">▶ 播放棚内实景</button><div class="camera-status" :class="videoState"><i></i>{{ videoState === 'error' ? '实景视频暂不可用 · 已显示最近画面' : videoState === 'playing' ? '棚内摄像头 · AI 识别在线' : '正在连接棚内摄像头' }}</div><div class="scan-line"></div></div>
          <GreenhouseTwinScene v-else :key="`twin-${detail.greenhouse.id}`" :detail="detail" :selected-id="selectedPlantId" @select="selectPlant" />
        </Transition>
        <div class="environment-strip"><article v-for="metric in detail.metrics" :key="metric.key" :class="metric.tone"><small>{{ metric.label }}</small><b>{{ metric.value }}<em>{{ metric.unit }}</em></b><span>{{ metric.note }}</span></article></div>
      </div>

      <aside class="data-sidebar" aria-label="大棚数据侧栏">
        <button class="collapse" :aria-expanded="sidebarOpen" :aria-label="sidebarOpen ? '收起大棚数据侧栏' : '展开大棚数据侧栏'" :title="sidebarOpen ? '收起数据侧栏' : '展开数据侧栏'" @click="sidebarOpen=!sidebarOpen"><span aria-hidden="true"></span></button>
        <div class="sidebar-scroll">
          <div class="summary">
            <div class="summary-copy"><span>{{ detail.greenhouse.area }} / {{ detail.scene.structure }}</span><h2>{{ detail.greenhouse.crop }}</h2><p>{{ detail.greenhouse.stage }}　{{ detail.greenhouse.environment }}</p></div>
            <div class="health" :style="{'--health':detail.greenhouse.health}"><b>{{ detail.greenhouse.health }}</b><small>健康度</small></div>
            <dl><div><dt>栽培</dt><dd>{{ detail.scene.cultivationMode }}</dd></div><div><dt>规模</dt><dd>{{ detail.scene.nominalPlantCount.toLocaleString() }} 株</dd></div><div><dt>同步</dt><dd>{{ generatedTime }}</dd></div></dl>
          </div>

          <nav class="sidebar-tabs" aria-label="大棚数据视图" role="tablist">
            <button id="greenhouse-tab-overview" role="tab" aria-controls="greenhouse-panel-overview" :aria-selected="activePanel==='overview'" :tabindex="activePanel==='overview' ? 0 : -1" :class="{active:activePanel==='overview'}" @click="activePanel='overview'">总览</button>
            <button id="greenhouse-tab-devices" role="tab" aria-controls="greenhouse-panel-devices" :aria-selected="activePanel==='devices'" :tabindex="activePanel==='devices' ? 0 : -1" :class="{active:activePanel==='devices'}" @click="activePanel='devices'">设备 <span>{{ onlineDevices }}/{{ detail.devices.length }}</span></button>
            <button id="greenhouse-tab-plants" role="tab" aria-controls="greenhouse-panel-plants" :aria-selected="activePanel==='plants'" :tabindex="activePanel==='plants' ? 0 : -1" :class="{active:activePanel==='plants'}" @click="activePanel='plants'">植株 <span>{{ detail.plants.length }}</span></button>
          </nav>

          <div v-if="activePanel==='overview'" id="greenhouse-panel-overview" class="panel overview-panel" role="tabpanel" aria-labelledby="greenhouse-tab-overview">
            <section class="profile-section"><header><div><h3>生产画像</h3><small>空间建模参数与当前作业</small></div></header><div class="profile-grid"><div><span>棚型</span><b>{{ detail.scene.structure }}</b></div><div><span>床位 / 行数</span><b>{{ detail.scene.bedCount }} / {{ detail.scene.rowCount }}</b></div><div><span>灌溉系统</span><b>{{ detail.scene.irrigationMode }}</b></div><div><span>在线设备</span><b>{{ onlineDevices }}/{{ detail.devices.length }}</b></div></div></section>
            <section class="trend-section"><header><div><h3>平均株高</h3><small>{{ detail.plants[0]?.cultivar }}，近 7 日</small></div><b>{{ detail.heightTrend[detail.heightTrend.length-1]?.height }}<em> cm</em></b></header><div class="chart"><svg viewBox="0 0 300 92" preserveAspectRatio="none"><path class="area" :d="`${chartPoints} L286,92 L10,92Z`"/><path :d="chartPoints"/></svg><div><span v-for="point in detail.heightTrend" :key="point.date">{{ point.date }}</span></div></div></section>
            <section class="zones-section"><header><div><h3>分区作业</h3><small>覆盖率按当前种植面积计算</small></div></header><div class="zones"><article v-for="zone in detail.zones" :key="zone.id"><b>{{ zone.name }}</b><div><span>{{ zone.task }}</span><em>{{ zone.health }}</em></div><small>{{ zone.crop }}　{{ zone.coverage }}%</small></article></div></section>
            <section class="ai"><span>AI</span><div><b>今日调控建议</b><p>{{ detail.aiSuggestion }}</p></div></section>
            <section class="alert-section"><header><div><h3>最近告警</h3><small>{{ detail.alerts.length ? '需要在本班次内确认' : '当前运行平稳' }}</small></div><b>{{ detail.alerts.length }}</b></header><div v-if="detail.alerts.length" class="alerts"><article v-for="alert in detail.alerts" :key="alert.id"><i>!</i><div><b>{{ alert.title }}</b><small>{{ alert.time }}　{{ alert.status }}</small></div></article></div><p v-else class="empty">当前大棚没有未归档告警</p></section>
          </div>

          <div v-else-if="activePanel==='devices'" id="greenhouse-panel-devices" class="panel device-panel" role="tabpanel" aria-labelledby="greenhouse-tab-devices">
            <header class="panel-heading"><div><h3>棚内设备</h3><p>设备坐标已同步到数字孪生模型。</p></div><strong>{{ onlineDevices }}<small>/{{ detail.devices.length }} 在线</small></strong></header>
            <div class="devices"><article v-for="(device,index) in detail.devices" :key="device.id"><div class="device-index">{{ String(index+1).padStart(2,'0') }}</div><div class="device-copy"><div><b>{{ device.name }}</b><span :class="{running:device.enabled}">{{ device.enabled?'运行':'待机' }}</span></div><p>{{ device.location }}　{{ device.responsibility }}</p><small>{{ device.value }}</small></div><i :class="{online:device.online}" :title="device.online?'在线':'离线'"></i></article></div>
          </div>

          <div v-else id="greenhouse-panel-plants" class="panel plant-panel" role="tabpanel" aria-labelledby="greenhouse-tab-plants">
            <header class="panel-heading"><div><h3>植株巡检</h3><p>选择样本后，模型将定位到对应植株。</p></div><strong>{{ detail.plants.length }}<small>{{ attentionPlants ? `${attentionPlants} 株需关注` : '全部正常' }}</small></strong></header>
            <div v-if="selectedPlant" class="selected-profile"><div class="profile-title"><span>{{ selectedPlant.id }} / {{ selectedPlant.zone }} 区</span><button aria-label="取消植株定位" @click="selectedPlantId=null">取消定位</button></div><h3>{{ selectedPlant.cultivar }}</h3><div class="profile-values"><div><span>健康度</span><b>{{ selectedPlant.health }}</b></div><div><span>株高</span><b>{{ selectedPlant.height }} <small>cm</small></b></div><div><span>基质含水</span><b>{{ selectedPlant.soilMoisture }}<small>%</small></b></div><div><span>株龄</span><b>{{ selectedPlant.ageDays }}<small> 天</small></b></div><div><span>叶面积指数</span><b>{{ selectedPlant.leafAreaIndex }}</b></div><div><span>建模坐标</span><b>{{ selectedPlant.positionX }}, {{ selectedPlant.positionZ }}</b></div></div></div>
            <div class="zone-strip"><div v-for="zone in detail.zones" :key="zone.id"><b>{{ zone.id }} 区</b><span>{{ zone.task }}</span><em>{{ zone.health }}</em></div></div>
            <div class="plants"><button v-for="plant in detail.plants" :key="plant.id" :aria-label="`${plant.id}，${plant.zone} 区，健康度 ${plant.health}${plant.status!=='normal' ? '，需关注' : ''}`" :aria-pressed="selectedPlantId===plant.id" :class="{active:selectedPlantId===plant.id,attention:plant.status!=='normal'}" @click="mode='twin';selectPlant(plant.id)"><b>{{ plant.id }}</b><span>{{ plant.zone }} 区</span><em>{{ plant.health }}</em></button></div>
          </div>
        </div>
      </aside>
    </section>

    <div v-else-if="loading" class="state-card"><ProgressBar :value="null" label="同步大棚数据" pending-label="连接温室数据中心" /></div>
    <div v-else class="state-card error"><b>无法进入大棚</b><p>{{ error }}</p><button @click="load()">重新加载</button><button @click="back">返回农场</button></div>
  </main>
</template>

<style scoped lang="scss">
.greenhouse-page{position:fixed;inset:0;display:flex;flex-direction:column;background:#102d22;color:#f5faf5}.topbar{z-index:20;height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid rgba(255,255,255,.55);background:rgba(246,250,244,.88);box-shadow:0 8px 35px rgba(7,31,18,.12);color:#294a35;backdrop-filter:blur(28px) saturate(155%)}.brand,.top-actions,.brand>div{display:flex;align-items:center}.brand{gap:13px}.brand>i{width:1px;height:30px;background:#d6dfd2}.brand>div{align-items:flex-start;flex-direction:column}.brand small{font-size:8px;letter-spacing:1.4px;color:#6e8975}.brand strong{margin-top:3px;font-size:16px}.back{display:flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid #dbe5d8;border-radius:10px;background:#f7faf5;color:#42644b;cursor:pointer}.back span{font-size:10px}.top-actions{gap:15px}.view-toggle{display:flex;padding:3px;border:1px solid #d9e4d6;border-radius:12px;background:#eef3eb}.view-toggle button{padding:7px 14px;border:0;border-radius:9px;background:transparent;color:#718174;font-size:10px;cursor:pointer}.view-toggle button.active{background:white;color:#2e7245;box-shadow:0 4px 12px rgba(25,68,38,.1)}.live{display:flex;align-items:center;gap:6px;color:#637568;font-size:9px}.live i,.camera-status i{width:7px;height:7px;border-radius:50%;background:#55b970;box-shadow:0 0 0 4px rgba(85,185,112,.12)}.workspace{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) clamp(360px,29vw,440px);transition:grid-template-columns .4s}.workspace.sidebar-closed{grid-template-columns:minmax(0,1fr) 0}.scene{position:relative;min-width:0;overflow:hidden;background:#b8d7cf}.real-view{position:absolute;inset:0;background:#122b22}.real-view video{width:100%;height:100%;object-fit:cover;filter:saturate(.88) contrast(1.03)}.real-view::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,31,21,.18),transparent 28%,transparent 72%,rgba(7,31,21,.13));pointer-events:none}.camera-status{position:absolute;z-index:2;left:20px;top:20px;display:flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid rgba(255,255,255,.25);border-radius:99px;background:rgba(7,35,25,.62);font-size:9px;backdrop-filter:blur(15px)}.scan-line{position:absolute;z-index:2;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#7cff9c,transparent);box-shadow:0 0 12px #6eff94;animation:scan 5s ease-in-out infinite}@keyframes scan{0%,100%{top:12%;opacity:0}10%,90%{opacity:.65}50%{top:88%}}.environment-strip{position:absolute;z-index:5;left:18px;right:18px;bottom:18px;display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.environment-strip article{min-width:0;padding:11px 12px;border:1px solid rgba(255,255,255,.27);border-radius:14px;background:linear-gradient(145deg,rgba(12,48,36,.74),rgba(8,33,27,.58));box-shadow:0 12px 30px rgba(4,25,15,.2);backdrop-filter:blur(20px)}.environment-strip small,.environment-strip span{display:block;font-size:8px;color:rgba(255,255,255,.48)}.environment-strip b{display:block;margin:5px 0 4px;font-size:16px}.environment-strip em{margin-left:2px;font:normal 8px sans-serif}.environment-strip article.warning{border-color:rgba(244,172,67,.48)}.environment-strip article.warning span{color:#ffc06a}.plant-card{position:absolute;z-index:8;left:20px;top:65px;width:290px;padding:15px;border:1px solid rgba(223,255,232,.26);border-radius:17px;background:rgba(9,42,31,.8);box-shadow:0 20px 55px rgba(0,23,12,.3);backdrop-filter:blur(24px)}.plant-card>button{position:absolute;right:10px;top:8px;border:0;background:transparent;color:white;font-size:20px;cursor:pointer}.plant-card>small{font-size:8px;letter-spacing:1.5px;color:#65d989}.plant-card h3{margin:6px 0 12px;font-size:15px}.plant-card>div{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.plant-card span{padding:8px;border-radius:9px;background:rgba(255,255,255,.06);font-size:8px;color:rgba(255,255,255,.47)}.plant-card span b{display:block;margin-top:4px;color:#f1fff4;font-size:11px}.data-sidebar{position:relative;min-width:0;background:linear-gradient(160deg,rgba(17,53,43,.98),rgba(5,27,22,.98));box-shadow:-20px 0 60px rgba(0,20,10,.2);overflow:visible}.sidebar-scroll{height:100%;padding:14px 15px 30px;overflow:auto}.collapse{position:absolute;z-index:3;left:-15px;top:50%;width:30px;height:48px;border:1px solid rgba(255,255,255,.17);border-radius:13px 0 0 13px;background:#174936;color:#8de0a3;font-size:23px;cursor:pointer}.data-sidebar section{margin-bottom:10px;padding:14px;border:1px solid rgba(223,255,231,.1);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025));box-shadow:inset 0 1px rgba(255,255,255,.08)}section>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}section>header h3{margin:0;font-size:12px}section>header small{color:rgba(255,255,255,.4);font-size:8px}.summary{display:flex;align-items:center;justify-content:space-between;background:radial-gradient(circle at 85% 20%,rgba(94,216,126,.18),transparent 38%),linear-gradient(145deg,rgba(61,145,82,.22),rgba(255,255,255,.02))!important}.summary small,.summary span{font-size:9px;color:rgba(255,255,255,.48)}.summary h2{margin:4px 0;font-size:18px}.health{width:66px;height:66px;display:grid;place-items:center;border-radius:50%;background:radial-gradient(#173b2d 55%,transparent 56%),conic-gradient(#61d282 calc(var(--health,92)*1%),rgba(255,255,255,.1) 0)}.health b{align-self:end;font-size:20px}.health small{align-self:start}.chart{height:105px}.chart svg{width:100%;height:80px}.chart path{fill:none;stroke:#6ce38e;stroke-width:2.2;vector-effect:non-scaling-stroke}.chart .area{fill:rgba(84,206,116,.12);stroke:none}.chart>div{display:flex;justify-content:space-between;color:rgba(255,255,255,.3);font-size:7px}.devices article,.alerts article{display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid rgba(255,255,255,.06)}.devices article>i{width:7px;height:7px;border-radius:50%;background:#6b746f}.devices article>i.online{background:#58dc7a}.devices article>div,.alerts article>div{display:flex;flex:1;flex-direction:column}.devices b,.alerts b{font-size:10px}.devices small,.alerts small{margin-top:3px;color:rgba(255,255,255,.4);font-size:8px}.devices article>span{padding:4px 6px;border-radius:7px;background:rgba(255,255,255,.05);color:#89958d;font-size:8px}.devices article>span.running{background:rgba(80,201,111,.12);color:#76df90}.plants{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.plants button{display:flex;flex-direction:column;padding:8px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.035);color:white;text-align:left;cursor:pointer}.plants button.active{border-color:#68dc87;background:rgba(73,178,99,.18)}.plants button.attention{border-color:rgba(236,165,65,.35)}.plants b{font-size:9px}.plants span{margin:3px 0;color:rgba(255,255,255,.35);font-size:7px}.plants em{font:normal 9px sans-serif;color:#69dc87}.ai{display:flex;gap:10px;background:linear-gradient(145deg,rgba(53,135,76,.24),rgba(40,92,73,.08))!important}.ai>span{flex:none;width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#347c4b;color:#9cf1ae;font:700 9px monospace}.ai b{font-size:11px}.ai p,.empty{margin:5px 0 0;color:rgba(255,255,255,.5);font-size:9px;line-height:1.6}.alerts i{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:rgba(235,153,53,.14);color:#f1aa4c;font-style:normal}.scene-enter-active,.scene-leave-active{transition:.4s}.scene-enter-from,.scene-leave-to{opacity:0;filter:blur(5px)}.state-card{position:absolute;left:50%;top:50%;width:340px;transform:translate(-50%,-50%);padding:18px;border-radius:17px;background:white;color:#294a35}.state-card.error{text-align:center}.state-card button{margin:7px 3px 0;padding:8px 11px;border:0;border-radius:8px;background:#e7efe4;color:#31553b;cursor:pointer}
@media(max-width:1000px){.workspace{grid-template-columns:1fr}.data-sidebar{position:absolute;z-index:10;right:8px;top:8px;bottom:8px;width:min(420px,calc(100vw - 22px));border-radius:20px}.workspace.sidebar-closed .data-sidebar{transform:translateX(calc(100% + 14px))}.environment-strip{right:18px;grid-template-columns:repeat(3,1fr)}.environment-strip article:nth-child(n+4){display:none}}@media(max-width:650px){.topbar{padding:0 9px}.brand>i,.brand>div small,.live,.back span{display:none}.top-actions{gap:5px}.view-toggle button{padding:7px 9px}.environment-strip{grid-template-columns:1fr 1fr}.environment-strip article:nth-child(n+3){display:none}.plant-card{left:9px;top:58px;width:calc(100% - 18px)}}
</style>
<style scoped lang="scss">
/* Impeccable polish: a denser, legible control-console hierarchy. */
.workspace{grid-template-columns:minmax(0,1fr) clamp(420px,31vw,500px)}
.data-sidebar{
  --side-bg:#0b2d23;
  --side-surface:#10382b;
  --side-surface-raised:#164534;
  --side-line:rgba(220,244,227,.13);
  --side-text:#f1f8f3;
  --side-muted:#a7bcae;
  --side-faint:#7f9988;
  --side-accent:#73db90;
  --side-warning:#efb55e;
  background:var(--side-bg);
  color:var(--side-text);
  font-variant-numeric:tabular-nums;
  height:100%;
  min-height:0;
}
.sidebar-scroll{position:absolute;inset:0;box-sizing:border-box;height:auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;scrollbar-color:rgba(115,219,144,.38) transparent;touch-action:pan-y;-webkit-overflow-scrolling:touch}
.sidebar-scroll::selection{background:rgba(115,219,144,.28);color:#fff}
.collapse{left:-18px;width:37px;height:52px;border-color:var(--side-line);background:var(--side-surface-raised);box-shadow:0 10px 24px rgba(3,24,16,.24)}
.collapse span{display:block;width:8px;height:8px;margin:auto;border-top:2px solid var(--side-accent);border-right:2px solid var(--side-accent);transform:rotate(45deg);transition:transform .2s ease-out}
.workspace.sidebar-closed .collapse span{transform:rotate(225deg)}
.data-sidebar button:focus-visible{outline:2px solid #a4efb7;outline-offset:2px}

.summary{grid-template-columns:minmax(0,1fr) 72px;gap:16px;padding:22px 22px 18px!important}
.summary-copy>span{color:var(--side-muted);font-size:11px;line-height:1.4}
.summary-copy h2{margin:7px 0 5px;font-size:24px;line-height:1.18;letter-spacing:-.02em}
.summary-copy p{color:var(--side-muted);font-size:11px;line-height:1.45}
.summary dl{gap:12px;padding-top:16px}
.summary dl div{padding-right:0}
.summary dt{color:var(--side-faint);font-size:10px}
.summary dd{margin-top:5px;color:var(--side-text);font-size:11px}
.health{width:72px;height:72px;background:radial-gradient(var(--side-bg) 54%,transparent 56%),conic-gradient(var(--side-accent) calc(var(--health,92)*1%),rgba(255,255,255,.1) 0)}
.health b{font-size:23px}.health small{color:var(--side-muted);font-size:10px}

.sidebar-tabs{position:sticky;z-index:2;top:0;display:grid;grid-template-columns:repeat(3,1fr);padding:8px 14px;border-bottom:1px solid var(--side-line);background:rgba(9,38,29,.97);backdrop-filter:blur(16px)}
.sidebar-tabs button{position:relative;min-height:44px;padding:10px 9px;border:0;border-radius:8px;background:transparent;color:var(--side-muted);font-size:12px;font-weight:600;cursor:pointer;transition:background .2s,color .2s,transform .15s}
.sidebar-tabs button.active{background:rgba(115,219,144,.12);color:#a2edb4}
.sidebar-tabs button.active::after{content:"";position:absolute;right:16px;bottom:5px;left:16px;height:1px;background:var(--side-accent)}
.sidebar-tabs span{margin-left:5px;color:inherit;font-size:10px}

.panel{animation:panel-in .24s cubic-bezier(.22,1,.36,1)}
.data-sidebar .panel section{margin:0;padding:20px 22px;border:0;border-bottom:1px solid var(--side-line);border-radius:0;background:transparent!important;box-shadow:none}
.data-sidebar .panel section>header{margin-bottom:16px}
.data-sidebar .panel section>header>div h3,.panel-heading h3{font-size:14px;line-height:1.3}
.data-sidebar .panel section>header>div small{margin-top:5px;color:var(--side-muted);font-size:10px;line-height:1.45}
.profile-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:0;border-top:1px solid var(--side-line);border-bottom:1px solid var(--side-line);background:transparent}
.profile-grid>div{min-height:62px;padding:12px 0;background:transparent}
.profile-grid>div:nth-child(odd){padding-right:14px;border-right:1px solid var(--side-line)}
.profile-grid>div:nth-child(even){padding-left:14px}
.profile-grid>div:nth-child(n+3){border-top:1px solid var(--side-line)}
.profile-grid span{color:var(--side-faint);font-size:10px}
.profile-grid b{margin-top:7px;font-size:12px}
.trend-section>header>b{color:var(--side-accent);font-size:22px}.trend-section>header>b em{color:var(--side-muted);font-size:10px}
.chart{height:122px}.chart svg{height:92px}.chart>div{color:var(--side-faint);font-size:9px}

.zones{display:block;border:0;border-radius:0}
.zones article{display:grid;grid-template-columns:minmax(78px,.85fr) minmax(0,1.35fr) auto;align-items:center;gap:12px;min-height:52px;padding:10px 0;border:0;border-top:1px solid var(--side-line)}
.zones article:first-child{border-top:0;background:transparent}
.zones article>b{font-size:12px}.zones article>div{display:contents}
.zones article span{color:var(--side-muted);font-size:10px}
.zones article em{justify-self:end;color:var(--side-accent);font-size:13px}
.zones article small{grid-column:1/3;color:var(--side-faint);font-size:9px;margin-top:-8px}
.data-sidebar .panel .ai{grid-template-columns:42px 1fr;gap:13px;margin:14px 16px;padding:16px;border-color:rgba(115,219,144,.2);background:rgba(52,124,75,.14)!important}
.ai>span{width:42px;height:42px;color:#b0efbf;font-size:10px}.ai b{font-size:13px}.ai p{margin-top:6px;color:var(--side-muted);font-size:11px;line-height:1.65}
.alert-section>header>b{color:var(--side-warning);font-size:20px}.empty{color:var(--side-muted);font-size:11px}

.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px;border-bottom:1px solid var(--side-line)}
.panel-heading>div{min-width:0}
.panel-heading h3{font-size:16px}.panel-heading p{max-width:29ch;margin-top:6px;color:var(--side-muted);font-size:11px;line-height:1.45}
.panel-heading>strong{display:flex;flex:none;flex-direction:column;align-items:flex-end;min-width:86px;color:var(--side-accent);font-size:28px;line-height:1}.panel-heading>strong small{margin-top:7px;color:var(--side-muted);font-size:9px;line-height:1.2;white-space:nowrap}
.devices{padding:0 22px}
.devices article{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr) 8px;gap:12px;min-height:78px;padding:15px 0;border:0;border-bottom:1px solid var(--side-line)}
.device-copy>div{display:flex;align-items:center;justify-content:space-between;gap:10px}.device-copy{min-width:0}
.device-index{color:var(--side-faint);font-size:11px}.device-copy b{font-size:13px}.device-copy span{padding:4px 7px;color:var(--side-muted);font-size:9px}
.device-copy p{margin:6px 0 5px;color:var(--side-muted);font-size:10px}.device-copy small{color:#9ddbad;font-size:10px}
.devices article>i{width:8px;height:8px}

.selected-profile{margin:16px 22px 18px;padding:16px;border:1px solid rgba(115,219,144,.3);border-radius:12px;background:rgba(67,153,90,.12)}
.profile-title{display:flex;align-items:center;justify-content:space-between}
.profile-title>span{font-size:10px}.profile-title button{min-height:36px;padding:7px 10px;border:1px solid var(--side-line);border-radius:8px;background:rgba(255,255,255,.055);color:var(--side-muted);font-size:10px;cursor:pointer}.profile-title button:hover{background:rgba(255,255,255,.09);color:var(--side-text)}
.selected-profile h3{margin:8px 0 14px;font-size:18px}
.profile-values{display:grid;grid-template-columns:repeat(2,1fr);gap:0;border-top:1px solid var(--side-line);border-bottom:1px solid var(--side-line);background:transparent}
.profile-values>div{min-height:58px;padding:11px 0;background:transparent}
.profile-values>div:nth-child(odd){padding-right:12px;border-right:1px solid var(--side-line)}
.profile-values>div:nth-child(even){padding-left:12px}.profile-values>div:nth-child(n+3){border-top:1px solid var(--side-line)}
.profile-values span{color:var(--side-faint);font-size:9px}.profile-values b{margin-top:6px;font-size:12px}.profile-values small{color:var(--side-muted);font-size:9px}
.zone-strip{display:grid;grid-template-columns:repeat(3,1fr);margin:0 22px 18px;border:0;border-top:1px solid var(--side-line);border-bottom:1px solid var(--side-line);border-radius:0}
.zone-strip>div{display:flex;min-width:0;flex-direction:column;padding:12px;border-left:1px solid var(--side-line)}.zone-strip>div:first-child{border-left:0}.zone-strip b{font-size:11px}.zone-strip span{overflow:hidden;margin:5px 0;color:var(--side-muted);font-size:9px;text-overflow:ellipsis;white-space:nowrap}.zone-strip em{color:var(--side-accent);font:normal 12px ui-monospace,monospace}
.plant-panel>.plants{grid-template-columns:repeat(3,1fr);gap:8px;padding:0 22px 22px}
.plant-panel>.plants button{position:relative;min-height:64px;padding:11px 12px;border-color:var(--side-line);border-radius:10px;background:rgba(255,255,255,.025)}
.plant-panel>.plants button:hover{background:rgba(255,255,255,.055)}
.plant-panel>.plants button.active{border-color:var(--side-accent);background:rgba(73,178,99,.16)}
.plant-panel>.plants button.attention:not(.active){border-color:rgba(239,181,94,.48)}
.plant-panel>.plants b{font-size:12px}.plant-panel>.plants span{margin:5px 0;color:var(--side-muted);font-size:9px}.plant-panel>.plants em{color:var(--side-accent);font-size:12px}

@media(max-width:1000px){.data-sidebar{width:min(500px,calc(100vw - 22px))}}
@media(max-width:650px){.summary{padding:18px 16px!important}.data-sidebar .panel section,.panel-heading{padding-inline:16px}.devices,.plant-panel>.plants{padding-inline:16px}.selected-profile,.zone-strip{margin-inline:16px}.sidebar-tabs{padding-inline:8px}}
</style>
<style scoped lang="scss">
@media not all {
.workspace{grid-template-columns:minmax(0,1fr) clamp(400px,31vw,478px)}
.data-sidebar{background:#0b2d23;box-shadow:-14px 0 38px rgba(3,25,16,.18)}
.sidebar-scroll{padding:0 0 28px;scrollbar-width:thin;scrollbar-color:rgba(120,202,142,.3) transparent}
.collapse{left:-14px;width:29px;border-radius:10px 0 0 10px;background:#133f30}
.summary{display:grid;grid-template-columns:minmax(0,1fr) 62px;gap:14px;margin:0!important;padding:18px 19px 16px!important;border:0!important;border-bottom:1px solid rgba(206,239,215,.12)!important;border-radius:0!important;background:linear-gradient(145deg,rgba(64,142,84,.18),rgba(10,44,34,0))!important;box-shadow:none!important}
.summary-copy>span{color:rgba(220,240,225,.48);font:9px ui-monospace,monospace}.summary-copy h2{margin:5px 0 4px;font-size:21px;letter-spacing:-.4px}.summary-copy p{margin:0;color:rgba(234,247,237,.58);font-size:9px}.summary dl{grid-column:1/-1;display:grid;grid-template-columns:1.2fr .9fr 1fr;margin:1px 0 0;padding-top:13px;border-top:1px solid rgba(231,248,234,.09)}.summary dl div{min-width:0;padding-right:9px}.summary dt{color:rgba(225,242,229,.38);font-size:8px}.summary dd{overflow:hidden;margin:4px 0 0;color:#eef8f0;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.health{width:60px;height:60px}.health b{font-size:19px}
.sidebar-tabs{position:sticky;z-index:2;top:0;display:grid;grid-template-columns:repeat(3,1fr);padding:7px 12px;border-bottom:1px solid rgba(220,244,227,.11);background:rgba(9,38,29,.94);backdrop-filter:blur(16px)}.sidebar-tabs button{position:relative;padding:9px 8px;border:0;border-radius:8px;background:transparent;color:rgba(229,242,232,.48);font-size:10px;cursor:pointer;transition:background .2s,color .2s,transform .15s}.sidebar-tabs button:hover{color:#f1faf3}.sidebar-tabs button:active{transform:translateY(1px)}.sidebar-tabs button.active{background:rgba(103,203,128,.13);color:#8ae2a0}.sidebar-tabs button.active::after{content:"";position:absolute;right:12px;bottom:4px;left:12px;height:1px;background:#65ce80}.sidebar-tabs span{margin-left:4px;color:inherit;font:8px ui-monospace,monospace}
.panel{animation:panel-in .22s ease-out}@keyframes panel-in{from{opacity:0;transform:translateY(4px)}}
.data-sidebar .panel section{margin:0;padding:16px 19px;border:0;border-bottom:1px solid rgba(225,245,230,.09);border-radius:0;background:transparent!important;box-shadow:none}.data-sidebar .panel section>header{margin-bottom:13px}.data-sidebar .panel section>header>div h3,.panel-heading h3{margin:0;color:#f2f9f3;font-size:12px}.data-sidebar .panel section>header>div small{display:block;margin-top:4px;color:rgba(228,242,231,.4);font-size:8px}
.profile-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:1px;background:rgba(232,248,236,.09)}.profile-grid>div{min-width:0;padding:11px;background:#0e3529}.profile-grid span{display:block;color:rgba(228,242,231,.38);font-size:8px}.profile-grid b{display:block;overflow:hidden;margin-top:6px;color:#eaf6ec;font-size:10px;text-overflow:ellipsis;white-space:nowrap}
.trend-section>header>b{color:#82dda0;font:600 19px ui-monospace,monospace}.trend-section>header>b em{color:rgba(222,240,226,.42);font:normal 8px sans-serif}.chart{height:112px}.chart svg{height:86px}.chart path{stroke-width:1.8}.chart .area{fill:rgba(84,206,116,.09)}
.zones{display:grid;grid-template-columns:1.2fr 1fr 1fr;border:1px solid rgba(223,245,229,.1);border-radius:12px;overflow:hidden}.zones article{min-width:0;padding:11px;border-left:1px solid rgba(223,245,229,.09)}.zones article:first-child{border-left:0;background:rgba(91,189,115,.08)}.zones article>b{font-size:10px}.zones article>div{display:flex;align-items:center;justify-content:space-between;margin:7px 0 5px}.zones article span{overflow:hidden;color:rgba(234,245,237,.58);font-size:8px;text-overflow:ellipsis;white-space:nowrap}.zones article em{color:#70d58c;font:normal 12px ui-monospace,monospace}.zones article small{color:rgba(223,240,227,.34);font-size:7px}
.data-sidebar .panel .ai{display:grid;grid-template-columns:38px 1fr;gap:12px;margin:12px 13px;padding:14px;border:1px solid rgba(103,217,133,.16);border-radius:12px;background:rgba(42,112,63,.16)!important}.ai>span{width:38px;height:38px;border-radius:9px}.ai b{font-size:11px}.ai p{font-size:9px;line-height:1.65}.alert-section>header>b{color:#d9a854;font:18px ui-monospace,monospace}.empty{padding:4px 0 2px;color:rgba(231,244,234,.42)}
.panel-heading{display:flex;align-items:flex-end;justify-content:space-between;padding:19px;border-bottom:1px solid rgba(226,246,231,.09)}.panel-heading p{margin:5px 0 0;color:rgba(228,242,232,.43);font-size:9px}.panel-heading>strong{color:#7cdb96;font:600 24px ui-monospace,monospace}.panel-heading>strong small{display:block;margin-top:2px;color:rgba(228,242,232,.42);font:8px sans-serif;text-align:right}
.devices{padding:0 19px}.devices article{position:relative;display:grid;grid-template-columns:31px minmax(0,1fr) 7px;gap:11px;padding:15px 0;border:0;border-bottom:1px solid rgba(226,245,231,.09)}.device-index{padding-top:2px;color:rgba(225,242,229,.28);font:10px ui-monospace,monospace}.device-copy>div{display:flex;align-items:center;justify-content:space-between;gap:10px}.device-copy b{font-size:11px}.device-copy span{padding:3px 6px;border-radius:5px;background:rgba(255,255,255,.04);color:rgba(228,241,231,.4);font-size:7px}.device-copy span.running{background:rgba(82,193,110,.12);color:#79dc93}.device-copy p{overflow:hidden;margin:5px 0 4px;color:rgba(230,243,233,.45);font-size:8px;text-overflow:ellipsis;white-space:nowrap}.device-copy small{color:#86c99a;font:8px ui-monospace,monospace}.devices article>i{align-self:center;width:6px;height:6px;border-radius:50%;background:#6b746f}.devices article>i.online{background:#58dc7a;box-shadow:0 0 0 3px rgba(88,220,122,.1)}
.selected-profile{margin:14px 19px 16px;padding:14px;border:1px solid rgba(103,220,135,.28);border-radius:12px;background:linear-gradient(145deg,rgba(67,153,90,.18),rgba(255,255,255,.02))}.profile-title{display:flex;align-items:center;justify-content:space-between}.profile-title>span{color:#83db9b;font:8px ui-monospace,monospace}.profile-title button{padding:4px 7px;border:0;border-radius:5px;background:rgba(255,255,255,.06);color:rgba(239,249,241,.58);font-size:7px;cursor:pointer}.selected-profile h3{margin:7px 0 12px;font-size:16px}.profile-values{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(229,246,233,.1)}.profile-values>div{padding:9px;background:#143e31}.profile-values span{display:block;color:rgba(225,241,229,.38);font-size:7px}.profile-values b{display:block;margin-top:5px;color:#f0f8f2;font:600 10px ui-monospace,monospace}.profile-values small{color:rgba(224,240,228,.42);font:7px sans-serif}
.zone-strip{display:grid;grid-template-columns:repeat(3,1fr);margin:0 19px 15px;border:1px solid rgba(225,244,230,.1);border-radius:10px;overflow:hidden}.zone-strip>div{display:flex;min-width:0;flex-direction:column;padding:10px;border-left:1px solid rgba(225,244,230,.08)}.zone-strip>div:first-child{border-left:0}.zone-strip b{font-size:9px}.zone-strip span{overflow:hidden;margin:4px 0;color:rgba(226,241,230,.38);font-size:7px;text-overflow:ellipsis;white-space:nowrap}.zone-strip em{color:#71d78d;font:normal 10px ui-monospace,monospace}.plant-panel>.plants{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:0 19px 18px}.plant-panel>.plants button{border-radius:8px;background:rgba(255,255,255,.025)}
:deep(.twin-host .hint){bottom:88px}
@media(max-width:1000px){.workspace{grid-template-columns:1fr}.data-sidebar{width:min(460px,calc(100vw - 22px))}}@media(max-width:650px){.summary{padding:14px!important}.sidebar-tabs{padding-inline:8px}.data-sidebar .panel section,.panel-heading{padding-inline:14px}.profile-grid{grid-template-columns:1fr 1fr}.devices,.plant-panel>.plants{padding-inline:14px}.selected-profile,.zone-strip{margin-inline:14px}.plant-panel>.plants{grid-template-columns:repeat(3,1fr)}}
@media(prefers-reduced-motion:reduce){.panel{animation:none}.sidebar-tabs button{transition:none}.scan-line{display:none}.camera-status.loading i,.camera-status.paused i{animation:none}}
}
</style>
<style scoped lang="scss">
.topbar{background:rgba(250,252,248,.96);border-bottom-color:rgba(207,220,204,.9);box-shadow:0 8px 28px rgba(7,31,18,.1)}
.real-view video{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;background:url('/platform/assets/media/greenhouse-monitor-poster.jpg') center/cover no-repeat}.video-play{position:absolute;z-index:4;left:50%;top:50%;transform:translate(-50%,-50%);padding:12px 18px;border:1px solid rgba(255,255,255,.46);border-radius:999px;background:rgba(8,42,29,.74);box-shadow:0 18px 46px rgba(0,20,10,.3);color:white;font-size:11px;cursor:pointer;backdrop-filter:blur(18px)}.video-play:hover{background:rgba(27,91,54,.84)}.camera-status.error i{background:#e7a047;box-shadow:0 0 0 4px rgba(231,160,71,.14)}.camera-status.loading i,.camera-status.paused i{background:#d4b04e;animation:camera-pulse 1.2s ease-in-out infinite}@keyframes camera-pulse{50%{opacity:.35;transform:scale(.72)}}
</style>
