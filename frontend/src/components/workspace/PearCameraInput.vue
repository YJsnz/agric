<script setup lang="ts">
import {ref,nextTick,onBeforeUnmount} from 'vue'
const props=defineProps<{enabled:boolean;infer:(file:File)=>Promise<void>}>()
const video=ref<HTMLVideoElement>(),devices=ref<MediaDeviceInfo[]>([]),deviceId=ref(''),state=ref<'off'|'starting'|'ready'>('off'),error=ref(''),continuous=ref(false),analyzing=ref(false),lastCapture=ref('')
let stream:MediaStream|undefined,generation=0,cycle=0,disposed=false,wakeTimer=0,wake: (()=>void)|undefined
function stop(){generation++;cycle++;continuous.value=false;state.value='off';clearTimeout(wakeTimer);wake?.();wake=undefined;stream?.getTracks().forEach(track=>track.stop());stream=undefined;if(video.value)video.value.srcObject=null}
async function start(){
  stop();error.value='';state.value='starting';const current=generation
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw Error('摄像头需要 HTTPS 或 localhost，请使用安全地址打开工作台。')
    const media=await navigator.mediaDevices.getUserMedia({audio:false,video:deviceId.value?{deviceId:{exact:deviceId.value},width:{ideal:1280},height:{ideal:720}}:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}})
    if(disposed||current!==generation){media.getTracks().forEach(track=>track.stop());return}
    stream=media;await nextTick();if(!video.value)throw Error('摄像头预览未就绪')
    video.value.srcObject=media;await video.value.play()
    if(disposed||current!==generation)return
    const available=await navigator.mediaDevices.enumerateDevices();if(disposed||current!==generation)return
    devices.value=available.filter(d=>d.kind==='videoinput');deviceId.value=media.getVideoTracks()[0]?.getSettings().deviceId||deviceId.value
    media.getVideoTracks()[0]?.addEventListener('ended',()=>{if(current===generation){stop();error.value='摄像头已断开，请重新连接。'}})
    state.value='ready'
  }catch(e){if(current!==generation||disposed)return;stop();const name=(e as Error).name;error.value=name==='NotAllowedError'?'摄像头权限被拒绝。请在浏览器地址栏允许摄像头后重试。':name==='NotFoundError'?'未找到摄像头，请连接 USB 摄像头或检查设备。':name==='NotReadableError'?'摄像头被其他应用占用，请释放后重试。':(e as Error).message}
}
async function capture(){
  if(analyzing.value||!props.enabled||state.value!=='ready')return
  const current=generation;analyzing.value=true;error.value=''
  try{
    const source=video.value;if(!source||source.readyState<2||!source.videoWidth)throw Error('摄像头画面尚未就绪，请稍后重试。')
    const scale=Math.min(1,1600/Math.max(source.videoWidth,source.videoHeight)),canvas=document.createElement('canvas');canvas.width=Math.round(source.videoWidth*scale);canvas.height=Math.round(source.videoHeight*scale)
    const context=canvas.getContext('2d');if(!context)throw Error('无法采集摄像头画面');context.drawImage(source,0,0,canvas.width,canvas.height)
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('摄像头采样失败')),'image/jpeg',.9))
    if(current!==generation||disposed)return
    lastCapture.value=new Date().toLocaleTimeString('zh-CN',{hour12:false});await props.infer(new File([blob],`摄像头采样-${Date.now()}.jpg`,{type:'image/jpeg'}))
  }catch(e){if(!disposed&&current===generation){error.value=(e as Error).message;continuous.value=false}}
  finally{analyzing.value=false}
}
async function toggleContinuous(){
  if(continuous.value){cycle++;continuous.value=false;clearTimeout(wakeTimer);wake?.();wake=undefined;return}
  continuous.value=true;const current=generation,loop=++cycle
  while(continuous.value&&!disposed&&current===generation&&loop===cycle){
    if(document.hidden||!props.enabled){continuous.value=false;break}
    await capture()
    if(!continuous.value||current!==generation||loop!==cycle||disposed)break
    await new Promise<void>(resolve=>{wake=resolve;wakeTimer=window.setTimeout(()=>{wake=undefined;resolve()},5000)})
  }
}
function visibility(){if(document.hidden)stop()}
document.addEventListener('visibilitychange',visibility)
onBeforeUnmount(()=>{disposed=true;stop();document.removeEventListener('visibilitychange',visibility)})
</script>
<template>
  <section class="camera-input" aria-label="摄像头病虫害检测">
    <div class="camera-heading"><div><h2>摄像头输入</h2><p>对准清晰梨叶近照，采样画面交由本地模型检测。</p></div><span :class="{on:state==='ready'}">{{ state==='ready'?'摄像头已连接':state==='starting'?'正在连接':'摄像头未开启' }}</span></div>
    <div class="camera-preview"><video ref="video" autoplay muted playsinline aria-label="摄像头实时预览"/><p v-if="state!=='ready'">{{ state==='starting'?'等待摄像头授权…':'开启摄像头后显示实时预览' }}</p><time v-if="lastCapture">最近采样 {{ lastCapture }}</time></div>
    <div class="camera-controls"><select v-if="devices.length" v-model="deviceId" aria-label="选择摄像头" :disabled="analyzing||state==='starting'" @change="start"><option v-for="(device,i) in devices" :key="device.deviceId" :value="device.deviceId">{{ device.label||`摄像头 ${i+1}` }}</option></select>
      <button v-if="state==='off'" @click="start">开启摄像头</button><button v-else @click="stop">关闭摄像头</button>
      <button :disabled="state!=='ready'||!enabled||analyzing||continuous" @click="capture">{{ analyzing?'正在推理…':'采集一帧并检测' }}</button>
      <button :disabled="state!=='ready'||(!continuous&&(!enabled||analyzing))" :aria-pressed="continuous" @click="toggleContinuous">{{ continuous?'停止连续检测':'开始连续检测' }}</button>
    </div>
    <p v-if="error" class="camera-error" role="alert">{{ error }}</p><p class="camera-note">连续检测逐帧等待结果，再间隔 5 秒采样。检测框对应下方保存的采样图，不叠加到变化中的预览。关闭窗口或切到后台会释放摄像头。</p>
  </section>
</template>
<style scoped>
.camera-input{margin-bottom:22px;padding-bottom:20px;border-bottom:1px solid #dce5e8}.camera-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.camera-heading h2{font-size:15px;margin:0}.camera-heading p,.camera-note{font-size:10px;line-height:1.7;color:#85959c}.camera-heading>span{font-size:10px;color:#88979e;white-space:nowrap}.camera-heading>span.on{color:#458666}.camera-preview{position:relative;aspect-ratio:16/9;max-height:310px;background:#152726;border-radius:12px;overflow:hidden;display:grid;place-items:center}.camera-preview video{display:block;width:100%;height:100%;object-fit:contain}.camera-preview>p{position:absolute;color:#acbeb8;font-size:12px}.camera-preview time{position:absolute;bottom:10px;left:10px;padding:5px 9px;background:#172a27c9;color:#d8e6df;border-radius:5px;font-size:10px}.camera-controls{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.camera-controls button,.camera-controls select{font:inherit;font-size:11px;padding:8px 10px;border:1px solid #d4e1dc;border-radius:7px;background:#fff;color:#476a58}.camera-controls select{max-width:100%;min-width:0}.camera-controls button[aria-pressed=true]{background:var(--ui-brand);color:white}.camera-controls button:disabled{opacity:.5;cursor:default}.camera-controls button{cursor:pointer}.camera-controls :focus-visible{outline:2px solid var(--ui-brand);outline-offset:3px}.camera-error{font-size:11px;color:#a46148;background:#faede4;padding:10px;border-radius:7px}@media(max-width:700px){.camera-heading{align-items:flex-start}.camera-heading p{max-width:220px}.camera-controls button{flex:1;white-space:nowrap}}
</style>
<style scoped>.camera-preview{width:100%;height:clamp(160px,30vw,310px);aspect-ratio:auto;display:block}.camera-preview video{position:absolute;inset:0;min-width:0;min-height:0}.camera-preview>p{inset:0;display:grid;place-items:center;margin:0}</style>
