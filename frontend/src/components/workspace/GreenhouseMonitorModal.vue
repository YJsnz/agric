<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FarmZone, SceneEntity } from '@/types'

const props = defineProps<{ open: boolean; entity?: SceneEntity; zone?: FarmZone }>()
defineEmits<{ close: []; action: [label: string] }>()
const camera = ref(0)
const cameras = ['入口全景', '种植区 A', '种植区 B']
watch(() => props.entity?.id, () => { camera.value = 0 })
const crop = computed(() => props.zone?.crop || (props.entity?.type === 'field' ? '露天作物' : '温室作物'))
</script>

<template>
  <Transition name="monitor">
    <div v-if="open" class="mask" @click.self="$emit('close')">
      <section class="modal">
        <header>
          <div><small>LIVE MONITORING · AI ONLINE</small><h2>{{ entity?.name || '园区监控' }}</h2></div>
          <div class="live"><i></i>实时</div><button aria-label="关闭" @click="$emit('close')">×</button>
        </header>
        <div class="body">
          <div class="video">
            <img src="/assets/farm-aerial.png" alt="园区实时监控画面" />
            <div class="scan"></div><span class="timestamp">CAM-0{{ camera + 1 }}　2026-08-03 16:35:28</span>
            <div class="ai-box one"><b>作物长势</b><small>健康 94%</small></div>
            <div class="ai-box two"><b>人员</b><small>0</small></div>
            <div class="video-actions"><button @click="$emit('action','已截取当前监控画面')">截图</button><button @click="$emit('action','录像任务已开始')">录像</button><button @click="$emit('action','已切换至全屏监控')">全屏</button></div>
          </div>
          <aside>
            <div class="camera-tabs"><button v-for="(item,index) in cameras" :key="item" :class="{active:camera===index}" @click="camera=index"><i></i><span><b>{{ item }}</b><small>在线 · 1080P</small></span></button></div>
            <div class="monitor-info"><h3>AI 分析</h3><dl><div><dt>当前作物</dt><dd>{{ crop }}</dd></div><div><dt>生长阶段</dt><dd>{{ zone?.stage || '生长期' }}</dd></div><div><dt>环境</dt><dd>{{ zone?.environment || '正常' }}</dd></div><div><dt>今日事件</dt><dd class="warning">1 条关注</dd></div></dl></div>
            <button class="playback" @click="$emit('action','正在打开监控回放')">查看录像回放 →</button>
          </aside>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.mask{position:fixed;z-index:80;inset:0;display:grid;place-items:center;padding:80px 24px;background:rgba(2,16,12,.55);backdrop-filter:blur(7px)}.modal{width:min(1050px,calc(100vw - 48px));max-height:calc(100vh - 110px);overflow:hidden;border:1px solid rgba(255,255,255,.2);border-radius:24px;background:linear-gradient(145deg,rgba(12,38,31,.98),rgba(6,25,21,.97));color:white;box-shadow:0 35px 100px rgba(0,0,0,.5)}header{height:70px;display:flex;align-items:center;padding:0 22px;border-bottom:1px solid rgba(255,255,255,.09)}header small{font-size:8px;letter-spacing:1.6px;color:#65d98a}h2{margin:3px 0 0;font-size:18px}.live{margin-left:auto;display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:99px;background:rgba(64,195,101,.12);color:#82e99c;font-size:10px}.live i{width:7px;height:7px;border-radius:50%;background:#58e77d;box-shadow:0 0 8px #58e77d}header>button{margin-left:12px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.08);color:white;font-size:22px;cursor:pointer}.body{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:14px;padding:14px}.video{position:relative;min-height:510px;overflow:hidden;border-radius:16px;background:#071a14}.video>img{width:100%;height:100%;object-fit:cover;filter:brightness(.72) saturate(.85);transform:scale(1.35)}.scan{position:absolute;inset:0;background:linear-gradient(transparent 49%,rgba(95,231,137,.08) 50%,transparent 51%);background-size:100% 7px;pointer-events:none}.timestamp{position:absolute;left:15px;top:14px;padding:5px 8px;border-radius:6px;background:rgba(0,0,0,.48);font:9px monospace}.ai-box{position:absolute;padding:7px 9px;border:1px solid #63df8a;border-radius:5px;background:rgba(11,49,34,.52);display:flex;flex-direction:column}.ai-box::before,.ai-box::after{content:"";position:absolute;width:8px;height:8px;border-color:#a0ffba}.ai-box b{font-size:9px}.ai-box small{font-size:8px;color:#89efa6}.ai-box.one{left:38%;top:42%;width:130px;height:75px}.ai-box.two{right:16%;top:28%}.video-actions{position:absolute;left:50%;bottom:15px;transform:translateX(-50%);display:flex;padding:4px;border:1px solid rgba(255,255,255,.13);border-radius:99px;background:rgba(4,20,16,.72)}.video-actions button{border:0;padding:7px 15px;background:transparent;color:white;font-size:10px;cursor:pointer}.video-actions button+button{border-left:1px solid rgba(255,255,255,.12)}aside{display:flex;flex-direction:column;gap:12px}.camera-tabs{display:flex;flex-direction:column;gap:7px}.camera-tabs button{display:flex;align-items:center;gap:9px;padding:11px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035);color:white;text-align:left;cursor:pointer}.camera-tabs button.active{border-color:rgba(102,226,137,.45);background:rgba(61,163,91,.14)}.camera-tabs i{width:9px;height:9px;border-radius:50%;background:#58d87b}.camera-tabs span{display:flex;flex-direction:column}.camera-tabs b{font-size:11px}.camera-tabs small{font-size:8px;color:rgba(255,255,255,.43);margin-top:3px}.monitor-info{padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:14px}.monitor-info h3{margin:0 0 12px;font-size:13px}.monitor-info dl{margin:0}.monitor-info dl div{display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid rgba(255,255,255,.06)}dt{font-size:9px;color:rgba(255,255,255,.45)}dd{margin:0;font-size:10px}.warning{color:#f5b24e}.playback{margin-top:auto;padding:11px;border:1px solid rgba(105,225,136,.25);border-radius:11px;background:rgba(62,157,86,.12);color:#88eaa0;cursor:pointer}.monitor-enter-active,.monitor-leave-active{transition:.22s}.monitor-enter-from,.monitor-leave-to{opacity:0}.monitor-enter-from .modal,.monitor-leave-to .modal{transform:translateY(12px) scale(.98)}
@media(max-width:760px){.mask{padding:70px 10px}.modal{width:100%;max-height:calc(100vh - 85px);overflow:auto}.body{grid-template-columns:1fr}.video{min-height:360px}.camera-tabs{display:grid;grid-template-columns:repeat(3,1fr)}.camera-tabs button{padding:8px}.camera-tabs small{display:none}}
</style>
