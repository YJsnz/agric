<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { FarmZone, SceneEntity } from '@/types'

type DetectionKind = 'person' | 'crop'
type Detection = {
  id: string
  kind: DetectionKind
  confidence: number
  x: number
  y: number
  width: number
  height: number
}
type DetectionFile = {
  schemaVersion: number
  generatedAt: string | null
  model: { file: string | null; classes: DetectionKind[]; tracker: string }
  video: { file: string; fps: number; width: number; height: number; frameCount: number; duration: number }
  frames: Array<{ index: number; time: number; detections: Detection[] }>
}

const props = defineProps<{ open: boolean; entity?: SceneEntity; zone?: FarmZone }>()
const emit = defineEmits<{
  (event: 'close'): void
  (event: 'action', label: string): void
}>()
const camera = ref(0)
const videoRef = ref<HTMLVideoElement>()
const videoTime = ref(0)
const detectionFile = ref<DetectionFile>()
const detectionState = ref<'loading' | 'ready' | 'pending' | 'error'>('loading')
const cameras = ['入口全景', '种植区 A', '种植区 B']
const VIDEO_URL = `${import.meta.env.BASE_URL}assets/media/greenhouse-monitor.mp4`
const DETECTIONS_URL = `${import.meta.env.BASE_URL}assets/media/greenhouse-monitor.detections.json`
const openedAt = ref(Date.now())
const recording = ref(false)
let recorder: MediaRecorder | undefined
let recordingChunks: Blob[] = []
let frameRequest = 0

const crop = computed(() => props.zone?.crop || (props.entity?.type === 'field' ? '露天作物' : '温室作物'))
const timestamp = computed(() => new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
}).format(new Date(openedAt.value + videoTime.value * 1000)).replaceAll('/', '-'))

const videoFps = computed(() => detectionFile.value?.video.fps || 25)
const frameTotal = computed(() => detectionFile.value?.video.frameCount || 38)
const currentFrameIndex = computed(() => Math.min(
  Math.max(0, frameTotal.value - 1),
  Math.floor(videoTime.value * videoFps.value)
))
const detections = computed<Detection[]>(() => detectionFile.value?.frames[currentFrameIndex.value]?.detections || [])
const yoloReady = computed(() => detectionState.value === 'ready')

const personCount = computed(() => detections.value.filter(item => item.kind === 'person').length)
const cropConfidence = computed(() => Math.round(detections.value
  .filter(item => item.kind === 'crop')
  .reduce((highest, item) => Math.max(highest, item.confidence), 0) * 100))

async function loadDetections() {
  detectionState.value = 'loading'
  try {
    const response = await fetch(DETECTIONS_URL, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json() as DetectionFile
    if (payload.schemaVersion !== 1 || !Array.isArray(payload.frames)) throw new Error('invalid detection schema')
    detectionFile.value = payload
    detectionState.value = payload.frames.length ? 'ready' : 'pending'
  } catch (error) {
    console.warn('YOLO detection data unavailable', error)
    detectionState.value = 'error'
  }
}

function syncFrame() {
  if (!videoRef.value) return
  videoTime.value = videoRef.value.currentTime
  frameRequest = requestAnimationFrame(syncFrame)
}

async function startVideo() {
  void loadDetections()
  await nextTick()
  if (!videoRef.value) return
  cancelAnimationFrame(frameRequest)
  openedAt.value = Date.now()
  videoRef.value.currentTime = 0
  void videoRef.value.play().catch(() => undefined)
  syncFrame()
}

function close() {
  videoRef.value?.pause()
  cancelAnimationFrame(frameRequest)
  emit('close')
}

async function selectCamera(index: number) {
  camera.value = index
  await startVideo()
}

async function toggleFullscreen() {
  const target = videoRef.value?.closest('.video-stage') as HTMLElement | null
  if (!target) return
  try {
    if (!document.fullscreenElement) await target.requestFullscreen()
    else await document.exitFullscreen()
  } catch {
    emit('action', '浏览器未允许进入全屏')
  }
}

function takeSnapshot() {
  const video = videoRef.value
  if (!video || !video.videoWidth) return emit('action', '画面尚未加载完成')
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth; canvas.height = video.videoHeight
  canvas.getContext('2d')?.drawImage(video, 0, 0)
  const link = document.createElement('a')
  link.download = `farm-camera-${Date.now()}.jpg`
  link.href = canvas.toDataURL('image/jpeg', .92); link.click()
  emit('action', '当前监控画面已保存')
}
function toggleRecording() {
  const stream = (videoRef.value as (HTMLVideoElement & { captureStream?: () => MediaStream }) | undefined)?.captureStream?.()
  if (!stream || typeof MediaRecorder === 'undefined') return emit('action', '当前浏览器不支持视频录制')
  if (recording.value) { recorder?.stop(); return }
  recordingChunks = []
  recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '' })
  recorder.ondataavailable = event => { if (event.data.size) recordingChunks.push(event.data) }
  recorder.onstop = () => {
    const link = document.createElement('a'); const url = URL.createObjectURL(new Blob(recordingChunks, { type: 'video/webm' }))
    link.href = url; link.download = `farm-recording-${Date.now()}.webm`; link.click(); URL.revokeObjectURL(url)
    recording.value = false; emit('action', '监控录像已保存')
  }
  recorder.start(); recording.value = true; emit('action', '录像已开始，再次点击即可结束并保存')
}
function openPlayback() {
  if (!videoRef.value) return
  videoRef.value.controls = true; videoRef.value.currentTime = 0; videoRef.value.pause()
  emit('action', '已进入录像回放，可拖动进度条播放')
}

watch(() => props.entity?.id, () => { camera.value = 0 })
watch(() => props.open, open => open ? startVideo() : cancelAnimationFrame(frameRequest))
onBeforeUnmount(() => { cancelAnimationFrame(frameRequest); if (recorder?.state === 'recording') recorder.stop() })
</script>

<template>
  <Transition name="monitor">
    <div v-if="open" class="mask" @click.self="close">
      <section class="modal">
        <header>
          <div><small>LIVE MONITORING · YOLO VISION</small><h2>{{ entity?.name || '园区监控' }}</h2></div>
          <div class="model-state" :class="{pending:!yoloReady}"><span>2 类识别</span><b>{{ yoloReady ? 'YOLO' : '待训练' }}</b></div>
          <div class="live"><i></i>实时画面</div>
          <button aria-label="关闭" @click="close">×</button>
        </header>
        <div class="body">
          <div class="video-stage">
            <video ref="videoRef" :src="VIDEO_URL" autoplay muted loop playsinline preload="auto" />
            <div class="video-shade"></div>
            <div class="scan"></div>
            <div class="camera-meta">
              <span><i></i>CAM-0{{ camera + 1 }}</span>
              <time>{{ timestamp }}</time>
            </div>
            <div class="recognition-state" :class="{pending:!yoloReady}"><i></i>{{ detectionState === 'loading' ? '加载检测数据' : yoloReady ? 'AI 分析中' : '等待 YOLO 结果' }} <span>{{ currentFrameIndex + 1 }}/{{ frameTotal }} FRAME</span></div>
            <div
              v-for="item in detections"
              :key="item.id"
              class="detection-box"
              :class="item.kind"
              :style="{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, height: `${item.height}%` }"
            >
              <span>{{ item.kind === 'person' ? '人员' : '作物' }} {{ Math.round(item.confidence * 100) }}%</span>
              <i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>
            </div>
            <div class="legend"><span class="person"><i></i>人员 {{ yoloReady ? personCount : '--' }}</span><span class="crop"><i></i>作物 {{ yoloReady ? `${cropConfidence}%` : '--' }}</span></div>
            <div class="video-actions">
              <button @click="takeSnapshot">截图</button>
              <button @click="toggleRecording">{{ recording ? '结束录像' : '录像' }}</button>
              <button @click="toggleFullscreen">全屏</button>
            </div>
          </div>
          <aside>
            <div class="camera-tabs">
              <button v-for="(item,index) in cameras" :key="item" :class="{active:camera===index}" @click="selectCamera(index)">
                <span class="camera-icon"><svg viewBox="0 0 24 24"><path d="M4 7.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Zm13 3 5-2v7l-5-2"/></svg></span>
                <span><b>{{ item }}</b><small><i></i>在线 · 1080P</small></span>
                <em>0{{ index + 1 }}</em>
              </button>
            </div>
            <div class="monitor-info">
              <div class="info-title"><h3>AI 实时分析</h3><span>{{ videoFps }} FPS</span></div>
              <div class="stat-grid"><div><small>人员</small><strong>{{ yoloReady ? personCount : '--' }}</strong></div><div><small>作物置信度</small><strong>{{ yoloReady ? `${cropConfidence}%` : '--' }}</strong></div></div>
              <dl>
                <div><dt>当前作物</dt><dd>{{ crop }}</dd></div>
                <div><dt>生长阶段</dt><dd>{{ zone?.stage || '生长期' }}</dd></div>
                <div><dt>环境状态</dt><dd class="normal">正常</dd></div>
                <div><dt>异常事件</dt><dd>0 条</dd></div>
              </dl>
            </div>
            <div class="model-card" :class="{pending:!yoloReady}"><span>Y</span><div><b>目标检测服务</b><small>{{ yoloReady ? `${detectionFile?.model.file} · ${detectionFile?.model.tracker}` : '请先训练并导出检测结果' }}</small></div><i>{{ yoloReady ? '已接入' : '待部署' }}</i></div>
            <button class="playback" @click="openPlayback">查看录像回放 <span>→</span></button>
          </aside>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.mask{position:fixed;z-index:80;inset:0;display:grid;place-items:center;padding:70px 24px;background:rgba(2,14,11,.62);backdrop-filter:blur(9px)}
.modal{width:min(1120px,calc(100vw - 48px));max-height:calc(100vh - 96px);overflow:hidden;border:1px solid rgba(191,255,216,.18);border-radius:24px;background:linear-gradient(145deg,rgba(13,43,34,.97),rgba(5,24,19,.98));color:#fff;box-shadow:0 38px 110px rgba(0,0,0,.52),inset 0 1px rgba(255,255,255,.08)}
header{height:74px;display:flex;align-items:center;padding:0 22px;border-bottom:1px solid rgba(255,255,255,.09)}header small{font-size:9px;letter-spacing:1.8px;color:#65dd91}h2{margin:4px 0 0;font-size:19px}.model-state{display:flex;align-items:center;gap:8px;margin-left:auto;margin-right:12px;padding:6px 9px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.035);font-size:9px;color:rgba(255,255,255,.48)}.model-state b{color:#78e49a;letter-spacing:.8px}.model-state.pending b{color:#efbc62}.live{display:flex;align-items:center;gap:7px;padding:7px 11px;border-radius:99px;background:rgba(64,195,101,.12);color:#82e99c;font-size:10px}.live i,.camera-tabs small i{width:6px;height:6px;border-radius:50%;background:#58e77d;box-shadow:0 0 8px #58e77d}header>button{margin-left:12px;width:36px;height:36px;border:1px solid rgba(255,255,255,.08);border-radius:50%;background:rgba(255,255,255,.07);color:#fff;font-size:22px;cursor:pointer;transition:.2s}header>button:hover{transform:rotate(90deg);background:rgba(255,255,255,.13)}
.body{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:14px;padding:14px}.video-stage{position:relative;aspect-ratio:16/9;align-self:center;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:17px;background:#061a13}.video-stage video{width:100%;height:100%;display:block;object-fit:cover}.video-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,15,11,.2),transparent 30%,transparent 70%,rgba(2,15,11,.38));pointer-events:none}.scan{position:absolute;inset:0;background:linear-gradient(transparent 49%,rgba(95,231,137,.065) 50%,transparent 51%);background-size:100% 7px;pointer-events:none}.camera-meta{position:absolute;left:14px;top:13px;display:flex;gap:8px;align-items:center;font:9px ui-monospace,monospace}.camera-meta span,.camera-meta time,.recognition-state{padding:6px 8px;border:1px solid rgba(255,255,255,.09);border-radius:7px;background:rgba(1,13,9,.62);backdrop-filter:blur(5px)}.camera-meta span{display:flex;align-items:center;gap:6px}.camera-meta i,.recognition-state>i{width:6px;height:6px;border-radius:50%;background:#ff4f4f;box-shadow:0 0 7px #ff4f4f}.camera-meta time{color:rgba(255,255,255,.7)}.recognition-state{position:absolute;right:14px;top:13px;display:flex;align-items:center;gap:6px;font-size:9px;color:#9aefb2}.recognition-state>i{background:#61e788;box-shadow:0 0 7px #61e788}.recognition-state.pending{color:#efc06b}.recognition-state.pending>i{background:#efb34d;box-shadow:0 0 7px #efb34d}.recognition-state span{margin-left:4px;color:rgba(255,255,255,.48);font-family:ui-monospace,monospace}
.detection-box{position:absolute;border:1px solid;transition:left .08s linear,top .08s linear;pointer-events:none}.detection-box>span{position:absolute;left:-1px;top:-20px;padding:4px 7px;border-radius:4px 4px 4px 0;color:#06150e;font:700 9px ui-monospace,monospace;white-space:nowrap}.detection-box.person{border-color:#72f29c;background:rgba(65,234,120,.035)}.detection-box.person>span{background:#72f29c}.detection-box.crop{border-color:#f0c85b;background:rgba(240,200,91,.025)}.detection-box.crop>span{background:#f0c85b}.corner{position:absolute;width:10px;height:10px;border-color:inherit}.tl{left:-2px;top:-2px;border-left:3px solid;border-top:3px solid}.tr{right:-2px;top:-2px;border-right:3px solid;border-top:3px solid}.bl{left:-2px;bottom:-2px;border-left:3px solid;border-bottom:3px solid}.br{right:-2px;bottom:-2px;border-right:3px solid;border-bottom:3px solid}.legend{position:absolute;left:14px;bottom:14px;display:flex;gap:4px;padding:4px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(1,15,10,.68);backdrop-filter:blur(7px)}.legend span{display:flex;align-items:center;gap:6px;padding:5px 7px;font-size:9px;color:rgba(255,255,255,.72)}.legend i{width:7px;height:7px;border-radius:2px}.legend .person i{background:#72f29c}.legend .crop i{background:#f0c85b}.video-actions{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;padding:4px;border:1px solid rgba(255,255,255,.13);border-radius:99px;background:rgba(4,20,16,.75);backdrop-filter:blur(8px)}.video-actions button{border:0;padding:7px 15px;background:transparent;color:#fff;font-size:10px;cursor:pointer}.video-actions button:hover{color:#83eaa1}.video-actions button+button{border-left:1px solid rgba(255,255,255,.12)}
aside{display:flex;min-height:0;flex-direction:column;gap:10px}.camera-tabs{display:flex;flex-direction:column;gap:7px}.camera-tabs button{display:flex;align-items:center;gap:9px;padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035);color:#fff;text-align:left;cursor:pointer;transition:.18s}.camera-tabs button:hover{transform:translateX(-2px);background:rgba(255,255,255,.06)}.camera-tabs button.active{border-color:rgba(102,226,137,.45);background:linear-gradient(100deg,rgba(61,163,91,.18),rgba(61,163,91,.06))}.camera-icon{width:31px;height:31px;display:grid!important;place-items:center;border-radius:9px;background:rgba(255,255,255,.06)}.camera-icon svg{width:17px;fill:none;stroke:currentColor;stroke-width:1.6}.camera-tabs button>span:nth-child(2){display:flex;flex-direction:column}.camera-tabs b{font-size:11px}.camera-tabs small{display:flex;align-items:center;gap:5px;margin-top:3px;font-size:8px;color:rgba(255,255,255,.43)}.camera-tabs em{margin-left:auto;color:rgba(255,255,255,.18);font:10px ui-monospace,monospace}.monitor-info{padding:13px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.025)}.info-title{display:flex;align-items:center;justify-content:space-between}.info-title h3{margin:0;font-size:12px}.info-title span{font:8px ui-monospace,monospace;color:#69de8b}.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:11px 0}.stat-grid div{display:flex;flex-direction:column;padding:9px;border:1px solid rgba(105,222,139,.12);border-radius:9px;background:rgba(67,168,95,.07)}.stat-grid small{font-size:8px;color:rgba(255,255,255,.42)}.stat-grid strong{margin-top:3px;font-size:17px;color:#78e299}.monitor-info dl{margin:0}.monitor-info dl div{display:flex;justify-content:space-between;padding:7px 0;border-top:1px solid rgba(255,255,255,.06)}dt{font-size:9px;color:rgba(255,255,255,.45)}dd{margin:0;font-size:9px}.normal{color:#73e393}.model-card{display:flex;align-items:center;gap:8px;padding:10px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:rgba(255,255,255,.025)}.model-card>span{width:27px;height:27px;display:grid;place-items:center;border-radius:8px;background:#39784d;color:#8af0a6;font-weight:800}.model-card div{display:flex;min-width:0;flex-direction:column}.model-card b{font-size:9px}.model-card small{max-width:145px;margin-top:2px;overflow:hidden;color:rgba(255,255,255,.4);font-size:8px;text-overflow:ellipsis;white-space:nowrap}.model-card>i{margin-left:auto;color:#6edf90;font-size:8px;font-style:normal;white-space:nowrap}.model-card.pending>span{background:#67542f;color:#f1c46d}.model-card.pending>i{color:#efbc62}.playback{margin-top:auto;padding:11px;border:1px solid rgba(105,225,136,.25);border-radius:11px;background:rgba(62,157,86,.12);color:#88eaa0;cursor:pointer;text-align:left}.playback span{float:right}.monitor-enter-active,.monitor-leave-active{transition:.22s}.monitor-enter-from,.monitor-leave-to{opacity:0}.monitor-enter-from .modal,.monitor-leave-to .modal{transform:translateY(12px) scale(.98)}
@media(max-width:850px){.mask{padding:64px 10px}.modal{width:100%;max-height:calc(100vh - 78px);overflow:auto}.body{grid-template-columns:1fr}.camera-tabs{display:grid;grid-template-columns:repeat(3,1fr)}.camera-tabs em{display:none}.model-card{display:none}}
@media(max-width:560px){header{padding:0 14px}.model-state{display:none}.body{padding:9px}.camera-tabs button{padding:7px}.camera-icon{display:none!important}.camera-tabs small{display:none}.video-actions{display:none}.recognition-state{display:none}}
</style>
