<script setup lang="ts">
import { computed,onMounted,onBeforeUnmount,ref,nextTick } from 'vue'
import PearCameraInput from './PearCameraInput.vue'
import {visionReviews,visionReview,type VisionReview,visionModel,visionList,visionUpload,visionGet,visionImage,type VisionModel,type VisionRecord} from '@/api/vision'
const props=defineProps<{embedded?:boolean;farmId:string;selectedId:string|null;plots:{entityId:string;crop:string}[];names:Record<string,string>}>()
const emit=defineEmits<{(e:'close'):void;(e:'ask',question:string):void}>()
const panel=ref<HTMLElement>(),previousFocus=document.activeElement as HTMLElement|null
function trap(event:KeyboardEvent){if(event.key!=='Tab')return;const nodes=Array.from(panel.value?.querySelectorAll<HTMLElement>('button:not([disabled]),select,a[href],input:not([hidden])')||[]).filter(e=>e.offsetParent!==null);const first=nodes[0],last=nodes[nodes.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}
const eligible=computed(()=>props.plots.filter(p=>p.crop==='泊头鸭梨'))
const plot=ref(eligible.value.some(p=>p.entityId===props.selectedId)?props.selectedId||'':eligible.value[0]?.entityId||'')
const model=ref<VisionModel>(),records=ref<VisionRecord[]>([]),active=ref<VisionRecord>(),image=ref(''),error=ref(''),busy=ref(false),input=ref<HTMLInputElement>()
const pending=computed(()=>active.value&&['QUEUED','RUNNING'].includes(active.value.status))
const inputMode=ref<'upload'|'camera'>('upload')
const reviews=ref<VisionReview[]>([]),reviewNote=ref(''),reviewDecision=ref('CONFIRMED'),reviewBusy=ref(false),recordQuery=ref('')
const filteredRecords=computed(()=>records.value.filter(r=>`${r.filename} ${r.plotId} ${state(r.status)}`.includes(recordQuery.value.trim())))
async function saveReview(){if(!active.value||reviewBusy.value||!reviewNote.value.trim())return;const id=active.value.id;reviewBusy.value=true;try{await visionReview(id,reviewDecision.value,reviewNote.value.trim());const result=await visionReviews(id);if(active.value?.id===id){reviews.value=result;reviewNote.value=''}}catch(e){error.value=(e as Error).message}finally{reviewBusy.value=false}}
const state=(status:string)=>({QUEUED:'排队中',RUNNING:'本地推理中',COMPLETED:'检测完成',NEEDS_REVIEW:'需要重新采集或人工复核',FAILED:'任务失败'}[status]||status)
let timer=0,disposed=false,imageGeneration=0
async function select(row:VisionRecord){
  active.value=row;error.value='';reviews.value=[];reviewNote.value='';const generation=++imageGeneration
  visionReviews(row.id).then(result=>{if(!disposed&&generation===imageGeneration)reviews.value=result}).catch(e=>{if(generation===imageGeneration)error.value=e.message})
  if(image.value)URL.revokeObjectURL(image.value);image.value=''
  try{const url=await visionImage(row.id);if(disposed||generation!==imageGeneration)URL.revokeObjectURL(url);else image.value=url}catch(e){if(!disposed&&generation===imageGeneration)error.value=(e as Error).message}
}
async function reload(){records.value=await visionList(props.farmId)}
async function upload(event:Event){
  const file=(event.target as HTMLInputElement).files?.[0];if(!file)return
  await uploadFile(file)
}
async function sample(){
  busy.value=true
  try{const response=await fetch(`${import.meta.env.BASE_URL}assets/vision/pear-leaf-example.jpg`);if(!response.ok)throw Error('样例图像读取失败');await uploadFile(new File([await response.blob()],'公开梨叶样例.jpg',{type:'image/jpeg'}))}catch(e){error.value=(e as Error).message}finally{busy.value=false}
}
async function uploadFile(file:File){
  if(file.size>8*1024*1024){error.value='图像不能超过 8 MB';return}
  busy.value=true;error.value=''
  try{const row=await visionUpload(props.farmId,plot.value,file);await reload();await select(row);return row}catch(e){error.value=(e as Error).message}finally{busy.value=false;if(input.value)input.value.value=''}
}
async function inferCamera(file:File){
  const created=await uploadFile(file);if(!created)throw Error(error.value||'摄像头采样提交失败')
  let row=created
  while(!disposed&&['QUEUED','RUNNING'].includes(row.status)){
    await new Promise(resolve=>setTimeout(resolve,800));if(disposed)return
    row=await visionGet(created.id);if(active.value?.id===row.id)active.value=row
    const index=records.value.findIndex(item=>item.id===row.id);if(index>=0)records.value[index]=row
  }
  if(row.status==='FAILED')throw Error(row.error||'视觉推理失败')
}
async function poll(){
  if(!active.value||!pending.value)return
  try{const row=await visionGet(active.value.id);if(disposed||active.value?.id!==row.id)return;active.value=row;const index=records.value.findIndex(r=>r.id===row.id);if(index>=0)records.value[index]=row}catch(e){error.value=(e as Error).message}
}
function ask(){if(active.value)emit('ask',`查询我的鸭梨视觉记录 ${active.value.id}，结合当前地块观测与检索资料给出复核建议。请调用 get_vision_records；区分梨叶症状置信度与病害概率，不推断病斑面积或农药剂量。`)}
function download(){if(!active.value)return;const url=URL.createObjectURL(new Blob([JSON.stringify({record:active.value,reviews:reviews.value},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`梨叶视觉-${active.value.id}.json`;a.click();URL.revokeObjectURL(url)}
onMounted(async()=>{await nextTick();panel.value?.focus();try{model.value=await visionModel();await reload();if(disposed)return;if(records.value[0])await select(records.value[0]);if(!disposed)timer=window.setInterval(poll,2000)}catch(e){if(!disposed)error.value=(e as Error).message}})
onBeforeUnmount(()=>{disposed=true;clearInterval(timer);if(image.value)URL.revokeObjectURL(image.value);previousFocus?.focus()})
</script>
<template>
  <Teleport to="body" :disabled="embedded">
  <div class="vision-backdrop" :class="{embedded}" @click.self="emit('close')" @keydown.esc="emit('close')">
    <section ref="panel" @keydown="!embedded && trap($event)" class="vision-panel" :data-record-id="active?.id" :role="embedded ? 'region' : 'dialog'" :aria-modal="embedded ? undefined : true" aria-label="鸭梨视觉工作室" tabindex="-1">
      <header><div><small>盐田丰语 · 病虫害检测</small><h1>鸭梨病虫害检测 <span>梨叶近照</span></h1></div><button aria-label="关闭视觉工作室" @click="emit('close')">×</button></header>
      <div class="vision-layout">
        <aside><label>关联地块<select v-model="plot" aria-label="视觉关联地块"><option v-for="p in eligible" :key="p.entityId" :value="p.entityId">{{ names[p.entityId]||p.entityId }}</option></select></label>
          <div class="input-modes" aria-label="检测输入方式"><button :aria-pressed="inputMode==='upload'" @click="inputMode='upload'">图片上传</button><button :aria-pressed="inputMode==='camera'" @click="inputMode='camera'">摄像头</button></div>
          <button v-if="inputMode==='upload'" class="upload" :disabled="!model?.ready||busy||pending||!plot" @click="input?.click()">{{ busy?'上传中…':'＋ 上传梨叶图像' }}</button><input ref="input" type="file" accept="image/png,image/jpeg" hidden @change="upload" />
          <button v-if="inputMode==='upload'" class="sample-button" :disabled="!model?.ready||busy||pending||!plot" @click="sample">试用公开梨叶样例</button><p class="sample-source">样例来自 <a href="https://huggingface.co/datasets/salahkhenfer/pear-pests-dataset" target="_blank" rel="noopener">公开梨叶数据集 ↗</a> · CC BY 4.0</p>
          <p>PNG / JPEG · 最大 8 MB<br/>请拍摄清晰叶片近照，保留完整叶片与症状。</p>
          <div class="model-note"><i :class="{ready:model?.ready}"/>{{ model?.ready?'本地模型已就绪':model?.message||'正在检查模型' }}<small>{{ model?.manifest?.modelId }}</small></div>
          <h2>我的检测记录 <small>{{ records.length }}</small></h2>
          <input v-model="recordQuery" class="record-search" aria-label="搜索视觉历史" placeholder="搜索图像、地块或状态"><div class="record-list"><button v-for="row in filteredRecords" :key="row.id" class="record" :class="{selected:active?.id===row.id}" @click="select(row)"><strong>{{ row.filename }}</strong><span>{{ state(row.status) }}</span><time>{{ new Date(row.createdAt).toLocaleString('zh-CN',{hour12:false}) }}</time></button></div>
          <p v-if="!records.length">上传后，图像和结果会保存在本机，刷新可继续查看。</p>
        </aside>
        <main><p v-if="error" class="error" role="alert">{{ error }}</p>
          <PearCameraInput v-if="inputMode==='camera'" :enabled="!!model?.ready&&!busy&&!pending&&!!plot" :infer="inferCamera" />
          <template v-if="active"><div class="result-head"><div><h2>{{ names[active.plotId]||active.plotId }}</h2><p>{{ state(active.status) }}</p></div><span v-if="active.result">{{ active.result.durationMs }} ms</span></div>
            <div class="image-stage"><svg v-if="image" :viewBox="`0 0 ${active.result?.imageWidth||1024} ${active.result?.imageHeight||768}`" role="img" aria-label="梨叶原图与模型检测框"><image :href="image" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"/><g v-for="(d,i) in active.result?.detections||[]" :key="i"><rect :x="d.box[0]" :y="d.box[1]" :width="d.box[2]-d.box[0]" :height="d.box[3]-d.box[1]" fill="none" stroke="#b6fa78" :stroke-width="Math.max(2,(active.result?.imageWidth||640)/300)"/><text :x="d.box[0]+4" :y="Math.max(20,d.box[1]-6)" fill="#e6ffcc" stroke="#1c3925" stroke-width=".6" :font-size="Math.max(14,(active.result?.imageWidth||640)/45)">{{ i+1 }} · {{ d.label }} {{ (d.confidence*100).toFixed(1) }}%</text></g></svg><div v-if="pending" class="infer-overlay"><i/><span>正在执行本地模型推理</span></div></div>
            <p v-if="active.error" class="error">{{ active.error }}</p>
            <div v-if="active.result" class="result-details"><h2>检测结果 <small>{{ active.result.detections.length }} 个候选对象</small></h2><article v-for="(d,i) in active.result.detections" :key="i"><span>{{ i+1 }}</span><strong>{{ d.label }}</strong><small>{{ d.className }}</small><b>{{ (d.confidence*100).toFixed(1) }}% <em>模型置信度</em></b></article><p v-for="warning in active.result.warnings" :key="warning" class="warning">{{ warning }}</p></div>
            <div class="limitations"><strong>结果解释边界</strong><p>公开梨叶模型，尚未经过泊头鸭梨独立验证。未检出不能证明无病；当前不支持果实质检、航拍诊断、病斑面积和病害概率。</p><details><summary>查看模型与图像来源</summary><p>原图 SHA-256：{{ active.sha256 }}</p><p>模型：{{ active.result?.modelId||model?.manifest?.modelId }}</p><p>模型 SHA-256：{{ active.result?.modelSha256 }}</p><a v-if="model?.manifest" :href="model.manifest.source" target="_blank" rel="noopener">开源模型与数据出处 ↗</a></details></div>
            <section v-if="active && ['COMPLETED','NEEDS_REVIEW'].includes(active.status)" class="visual-review"><h2>软件人工复核</h2><p>保存对图像与模型候选的复核意见，保留原始模型输出。</p><article v-for="item in reviews" :key="item.id"><strong>{{ item.decision==='CONFIRMED'?'已核对候选结果':'建议重新采集' }}</strong><time>{{ new Date(item.createdAt).toLocaleString('zh-CN',{hour12:false}) }}</time><p>{{ item.note }}</p></article><label>复核结论<select v-model="reviewDecision"><option value="CONFIRMED">已核对候选结果</option><option value="RESAMPLE">建议重新采集</option></select></label><label>复核说明<textarea v-model="reviewNote" rows="2" maxlength="2000" placeholder="说明图像质量、候选结果及下一步处理"></textarea></label><button :disabled="reviewBusy||!reviewNote.trim()" @click="saveReview">{{ reviewBusy?'保存中…':'保存复核' }}</button></section><footer><button @click="download">导出检测记录</button><button class="primary" :disabled="!active.result" @click="ask">交给 Agent 核验 →</button></footer>
          </template>
          <div v-else class="vision-empty"><span>🍐</span><h2>让观测有图像依据</h2><p>上传梨叶近照，查看真实模型检测框、候选症状与置信度。<br/>图像留在本机，结果关联到选定地块。</p></div>
        </main>
      </div>
    </section>
  </div>
  </Teleport>
</template>
<style scoped>
.vision-backdrop{position:fixed;inset:0;z-index:130;background:#0e1b29aa;backdrop-filter:blur(12px);display:grid;place-items:center;padding:24px}.vision-panel{width:min(1120px,100%);height:min(820px,90vh);background:var(--ui-subtle);color:var(--ui-ink);border:1px solid #fff8;border-radius:22px;box-shadow:0 30px 100px #0005;display:flex;flex-direction:column;overflow:hidden;font-family:var(--font-sans)}header{display:flex;align-items:center;justify-content:space-between;padding:22px 28px;border-bottom:1px solid #e3e9ec}header small{font-size:10px;color:#8b999f}h1{font-size:22px;margin:6px 0 0}h1 span{font-size:10px;font-weight:400;color:#5a816d;background:#e6eee8;padding:5px 8px;border-radius:6px;margin-left:8px}button{cursor:pointer;font:inherit;border:1px solid #dce4e7;background:white;border-radius:9px;padding:9px 13px;color:inherit}button:disabled{opacity:.5;cursor:default}header>button{font-size:22px;line-height:1;border:0;background:#eaf0f2}.vision-layout{display:grid;grid-template-columns:265px 1fr;flex:1;min-height:0}aside{padding:23px;border-right:1px solid #e0e8eb;overflow:auto}label{font-size:11px;color:#75858c;display:block}select{display:block;width:100%;padding:10px;margin:8px 0 13px;border:1px solid #d9e3e5;border-radius:8px;background:white;color:#34534a;font:inherit}.upload{width:100%;background:var(--ui-brand);border:0;color:white;font-size:12px}p{font-size:11px;color:#86949c;line-height:1.8}.model-note{padding:12px 0;border-bottom:1px solid #dfe7e9;font-size:10px;color:#9a7c4d}.model-note i{display:inline-block;width:6px;height:6px;background:#bf9255;border-radius:50%;margin-right:5px}.model-note i.ready{background:#5aab75}.model-note small{display:block;font-size:10px;color:#9aa5aa;word-break:break-all;margin-top:5px}h2{font-size:13px;font-weight:600;margin:20px 0 12px}h2 small{font-weight:400;font-size:10px;color:#91a0a6;margin-left:8px}.record{display:block;width:100%;border-color:transparent;background:none;text-align:left;padding:12px 9px;border-bottom-color:#e4eaec;border-radius:8px;font-size:11px}.record.selected{background:#eaf1ed;border-color:#d5e3dc}.record strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:550}.record span{display:block;font-size:10px;color:#6b907d;margin-top:6px}.record time{display:block;font-size:10px;color:#94a1a7;margin-top:4px}main{min-width:0;overflow:auto;padding:24px 28px}.result-head{display:flex;justify-content:space-between;align-items:center}.result-head h2{margin:0}.result-head p{margin:5px 0 13px}.result-head>span{font-size:10px;color:#9eaaad}.image-stage{background:#172728;border-radius:13px;overflow:hidden;position:relative;min-height:180px;display:grid;place-items:center}.image-stage svg{display:block;width:100%;max-height:365px}.infer-overlay{position:absolute;inset:0;background:#14252ccc;display:flex;justify-content:center;align-items:center;gap:10px;color:white;font-size:12px}.infer-overlay i{width:20px;height:20px;border:2px solid #fff4;border-top-color:white;border-radius:50%;animation:spin 1s linear infinite}.result-details article{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #e1e8eb;font-size:11px}.result-details article>span{color:#7b9989}.result-details article>small{color:#9aa7ac;flex:1}.result-details b{font-weight:500;color:#50886d}.result-details em{font-size:10px;font-style:normal;color:#9baba3}.limitations{padding:14px 16px;border-radius:10px;background:#eaf0f2;margin-top:18px;font-size:11px}.limitations strong{color:#5c757d}.limitations p{margin:8px 0;word-break:break-all}.limitations details{color:#6b818a;font-size:10px}.limitations summary{cursor:pointer}.limitations a{color:#4c7669}.warning{padding:10px;background:#faf0df;color:#9d7b49;border-radius:7px}.error{padding:10px;background:#f8e7df;color:#ad6e50;border-radius:7px}footer{display:flex;justify-content:space-between;margin-top:18px;gap:10px;font-size:11px}.primary{background:var(--ui-brand);color:white;border-color:transparent}.vision-empty{text-align:center;display:grid;place-content:center;min-height:400px}.vision-empty>span{font-size:48px}.vision-empty h2{font-size:21px}.vision-empty p{line-height:2}.vision-panel button:focus-visible,.vision-panel select:focus-visible{outline:2px solid var(--ui-brand);outline-offset:3px}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:700px){.vision-backdrop{padding:8px}.vision-panel{height:95vh;border-radius:16px}.vision-layout{display:flex;flex-direction:column;overflow:auto}aside{overflow:visible;padding:16px;border-right:0;border-bottom:1px solid #e0e8eb}.record{display:inline-block;width:180px;vertical-align:top}.vision-layout main{overflow:visible;padding:18px}.result-details article{flex-wrap:wrap}.result-details article>small{display:none}header{padding:17px}h1{font-size:18px}.vision-empty{min-height:220px}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<style scoped>.sample-button{width:100%;margin-top:8px;font-size:11px;background:#edf2ee;color:#5a7d68;border-color:#dce7df}.sample-source{font-size:10px;margin:8px 0}.sample-source a{color:#6e897d}</style>
<style scoped>.input-modes{display:flex;gap:6px;margin-bottom:13px}.input-modes button{flex:1;font-size:11px;padding:8px}.input-modes button[aria-pressed=true]{background:#e2eee7;border-color:#abcbb8;color:var(--ui-brand)}</style>
<style scoped>.record-list{min-width:0;max-width:100%}@media(max-width:700px){.record-list{display:flex;overflow-x:auto;gap:8px}.record-list .record{flex:0 0 180px}.sample-source{display:none}}</style>

<style scoped>.record-search,.visual-review textarea{box-sizing:border-box;width:100%;font:inherit;font-size:11px;padding:9px;border:1px solid var(--ui-border);border-radius:8px;background:var(--ui-subtle);color:var(--ui-ink)}.visual-review{border-top:1px solid var(--ui-border);margin-top:18px;padding-top:4px}.visual-review article{padding:10px 0;border-bottom:1px solid var(--ui-border)}.visual-review article strong{font-size:11px}.visual-review time{display:block;font-size:10px;color:var(--ui-muted);margin-top:4px}.visual-review textarea{display:block;margin:8px 0 12px}.visual-review p{white-space:pre-wrap;overflow-wrap:anywhere}</style>

<style scoped>
.vision-backdrop.embedded{position:static;display:block;padding:0;background:none;backdrop-filter:none}.embedded .vision-panel{width:100%;height:auto;border:0;border-radius:0;box-shadow:none;background:transparent;overflow:visible}.embedded .vision-panel>header{display:none}.embedded .vision-layout{display:flex;flex-direction:column;overflow:visible}.embedded aside{padding:0 0 16px;border-right:0;overflow:visible}.embedded .vision-layout main{padding:16px 0;overflow:visible}.embedded .vision-empty{min-height:150px}.embedded .vision-empty h2{font-size:15px}.embedded .record{display:inline-block;width:100%;}.embedded .result-head{flex-wrap:wrap}.embedded footer{flex-wrap:wrap}
</style>
