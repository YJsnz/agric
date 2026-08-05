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
const realVideo = ref<HTMLVideoElement>(); const videoState = ref<'loading' | 'playing' | 'paused' | 'error'>('loading')
let timer = 0
const farmId = computed(() => String(route.params.id || 'farm-01'))
const greenhouseId = computed(() => String(route.params.greenhouseId || 'gh-01'))
const selectedPlant = computed(() => detail.value?.plants.find(item => item.id === selectedPlantId.value))
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
function selectPlant(id: string) { selectedPlantId.value = id }
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
          <GreenhouseTwinScene v-else key="twin" :plants="detail.plants" :selected-id="selectedPlantId" @select="selectPlant" />
        </Transition>
        <div class="environment-strip"><article v-for="metric in detail.metrics" :key="metric.key" :class="metric.tone"><small>{{ metric.label }}</small><b>{{ metric.value }}<em>{{ metric.unit }}</em></b><span>{{ metric.note }}</span></article></div>
        <div v-if="selectedPlant" class="plant-card"><button @click="selectedPlantId=null">×</button><small>PLANT PROFILE</small><h3>{{ selectedPlant.id }} · {{ selectedPlant.zone }}区</h3><div><span>健康度<b>{{ selectedPlant.health }}</b></span><span>株高<b>{{ selectedPlant.height }} cm</b></span><span>基质含水率<b>{{ selectedPlant.soilMoisture }}%</b></span></div></div>
      </div>

      <aside class="data-sidebar">
        <button class="collapse" @click="sidebarOpen=!sidebarOpen">{{ sidebarOpen ? '›' : '‹' }}</button>
        <div class="sidebar-scroll">
          <section class="summary"><div><small>{{ detail.greenhouse.area }}</small><h2>{{ detail.greenhouse.crop }}</h2><span>{{ detail.greenhouse.stage }} · {{ detail.greenhouse.environment }}</span></div><div class="health"><b>{{ detail.greenhouse.health }}</b><small>健康度</small></div></section>
          <section><header><h3>平均株高</h3><small>后端近 7 日数据</small></header><div class="chart"><svg viewBox="0 0 300 92" preserveAspectRatio="none"><path class="area" :d="`${chartPoints} L286,92 L10,92Z`"/><path :d="chartPoints"/></svg><div><span v-for="point in detail.heightTrend" :key="point.date">{{ point.date }}</span></div></div></section>
          <section><header><h3>关键设备</h3><small>{{ detail.devices.filter(item=>item.online).length }}/{{ detail.devices.length }} 在线</small></header><div class="devices"><article v-for="device in detail.devices" :key="device.id"><i :class="{online:device.online}"></i><div><b>{{ device.name }}</b><small>{{ device.value }}</small></div><span :class="{running:device.enabled}">{{ device.enabled?'运行':'待机' }}</span></article></div></section>
          <section><header><h3>植株巡检</h3><small>点击定位到数字孪生</small></header><div class="plants"><button v-for="plant in detail.plants" :key="plant.id" :class="{active:selectedPlantId===plant.id,attention:plant.status!=='normal'}" @click="mode='twin';selectPlant(plant.id)"><b>{{ plant.id }}</b><span>{{ plant.zone }}区</span><em>{{ plant.health }}</em></button></div></section>
          <section class="ai"><span>AI</span><div><b>调控建议</b><p>{{ detail.aiSuggestion }}</p></div></section>
          <section><header><h3>最近告警</h3><small>{{ detail.alerts.length }} 条</small></header><div v-if="detail.alerts.length" class="alerts"><article v-for="alert in detail.alerts" :key="alert.id"><i>!</i><div><b>{{ alert.title }}</b><small>{{ alert.time }} · {{ alert.status }}</small></div></article></div><p v-else class="empty">当前大棚无未归档告警</p></section>
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
.topbar{background:rgba(250,252,248,.96);border-bottom-color:rgba(207,220,204,.9);box-shadow:0 8px 28px rgba(7,31,18,.1)}
.real-view video{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;background:url('/platform/assets/media/greenhouse-monitor-poster.jpg') center/cover no-repeat}.video-play{position:absolute;z-index:4;left:50%;top:50%;transform:translate(-50%,-50%);padding:12px 18px;border:1px solid rgba(255,255,255,.46);border-radius:999px;background:rgba(8,42,29,.74);box-shadow:0 18px 46px rgba(0,20,10,.3);color:white;font-size:11px;cursor:pointer;backdrop-filter:blur(18px)}.video-play:hover{background:rgba(27,91,54,.84)}.camera-status.error i{background:#e7a047;box-shadow:0 0 0 4px rgba(231,160,71,.14)}.camera-status.loading i,.camera-status.paused i{background:#d4b04e;animation:camera-pulse 1.2s ease-in-out infinite}@keyframes camera-pulse{50%{opacity:.35;transform:scale(.72)}}
</style>
