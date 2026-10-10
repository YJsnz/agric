<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FarmTopBar from '@/components/workspace/FarmTopBar.vue'
import FarmBusinessDock from '@/components/workspace/FarmBusinessDock.vue'
import DiagnosisImageInput from '@/components/workspace/DiagnosisImageInput.vue'
import WheatDiagnosisResult from '@/components/workspace/WheatDiagnosisResult.vue'
import { diagnoseWheat } from '@/api/wheat'
import { wheatDiagnosis as state } from '@/stores/wheatDiagnosis'
import { useWorkspaceStore } from '@/stores/workspace'
import type { BusinessModule } from '@/types'
const workspace = useWorkspaceStore()
function openModule(module: BusinessModule) { workspace.selectModule(module); router.push('/workspaces/farm-01') }
const router=useRouter(),route=useRoute()
const files=reactive<Record<string,File>>({}), previews=reactive<Record<string,string>>({})
const context=reactive<Record<string,string>>({growth_stage:'',soil_moisture:'',soil_salinity:'',temperature:'',humidity:'',region:''})
const busy=ref(false),error=ref(''),knowledge=ref(true)
let controller:AbortController|undefined
function choose(key:string,file?:File){if(previews[key])URL.revokeObjectURL(previews[key]);delete files[key];delete previews[key];if(file){files[key]=file;previews[key]=URL.createObjectURL(file)}state.result=null}
async function submit(){
  if(!Object.keys(files).length&&!Object.values(context).some(v=>String(v).trim())){error.value='请至少提供一张图片或环境上下文。';return}
  busy.value=true;error.value='';state.result=null;controller=new AbortController()
  const body=new FormData();Object.entries(files).forEach(([k,f])=>body.append(k+'_image',f));Object.entries(context).forEach(([k,v])=>{if(String(v).trim())body.append(k,String(v).trim())});body.append('knowledge_enabled',String(knowledge.value))
  try{state.result=await diagnoseWheat(body,controller.signal);Object.values(state.previews).forEach(URL.revokeObjectURL);state.previews={};Object.entries(files).forEach(([k,f])=>state.previews[k]=URL.createObjectURL(f))}
  catch(e){error.value=e instanceof Error&&e.name==='AbortError'?'请求已取消或超时，可重新提交。':e instanceof Error?e.message:'网络连接失败，请重试。'}finally{busy.value=false}
}
onBeforeUnmount(()=>{controller?.abort();Object.values(previews).forEach(URL.revokeObjectURL)})
</script>
<template><div class="wheat-page"><FarmTopBar/><main><RouterLink to="/workspaces/farm-01">← 返回作物工作台</RouterLink><h1>黄骅旱碱麦 · {{ route.name==='wheat-risk'?'AI风险详情':'AI视觉识别' }}</h1><p>视觉观测与知识研判，不替代实地诊断。</p>
<template v-if="route.name!=='wheat-risk'"><form @submit.prevent="submit"><div class="diagnosis-grid"><DiagnosisImageInput v-for="(title,key) in {leaf:'叶片图片',canopy:'冠层图片',head:'麦穗图片'}" :key="key" :title="title" :preview="previews[key]" :filename="files[key]?.name" :disabled="busy" @select="choose(key,$event)" @remove="choose(key)" @invalid="error=$event"/></div>
<fieldset class="diagnosis-card" :disabled="busy"><legend>环境上下文（选填）</legend><div class="context-grid"><label>生育阶段<select v-model="context.growth_stage"><option value="">未知/未提供</option><option v-for="s in ['播种期','越冬期','返青期','拔节期','抽穗期','灌浆期','收获期']" :key="s">{{ s }}</option></select></label><label>所在地<input v-model="context.region" maxlength="200" placeholder="填写实际种植地，不自动推断"></label><label v-for="(title,key) in {soil_moisture:'土壤含水量（单位未提供）',soil_salinity:'土壤盐分（单位未提供）',temperature:'温度',humidity:'湿度'}" :key="key">{{ title }}<input v-model="context[key]" type="number" step="any" :min="key==='temperature'?undefined:0" :max="key==='humidity'?100:undefined"></label></div><label><input v-model="knowledge" type="checkbox">结合知识图谱与文档进行AI研判</label></fieldset><button class="primary" :disabled="busy">{{ busy?'正在进行视觉分析与知识检索...':'开始分析' }}</button><button v-if="busy" type="button" @click="controller?.abort()">取消</button></form>
<p v-if="busy" role="status">本次流程：视觉识别 → 知识图谱检索 → GraphRAG证据融合 → AI风险分析（非实时进度）</p><p v-if="error" role="alert" class="warning">{{ error }}</p></template>
<template v-if="state.result"><RouterLink v-if="route.name!=='wheat-risk'" class="risk-link" :to="{name:'wheat-risk',query:{crop:'wheat'}}">进入AI风险分析 →</RouterLink><WheatDiagnosisResult :result="state.result" :previews="state.previews"/></template><p v-else-if="route.name==='wheat-risk'">暂无本轮诊断结果，请先<RouterLink :to="{name:'wheat-vision'}">上传图片分析</RouterLink>。</p>
</main><FarmBusinessDock active="crops" @change="openModule"/></div></template>
<style>
.wheat-page{min-height:100vh;background:linear-gradient(130deg,#edf5e9,#dbeae1);color:#234835}.wheat-page main{max-width:1200px;margin:auto;padding:35px 24px 120px}.wheat-page h1{font-size:28px;margin:18px 0}.wheat-page h2{font-size:21px}.wheat-page h3{font-size:17px;margin-bottom:12px}.diagnosis-card{background:rgba(255,255,255,.85);border:1px solid #d4e4d8;border-radius:20px;padding:22px;margin:18px 0;overflow-wrap:anywhere}.diagnosis-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.context-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:20px}.wheat-page input:not([type=checkbox]),.wheat-page select{display:block;width:100%;padding:10px;border:1px solid #b7cfc0;border-radius:8px;margin-top:6px}.wheat-page button,.risk-link{border:1px solid #9bbda9;border-radius:10px;padding:9px 16px;background:#edf6ed;cursor:pointer}.wheat-page .primary{background:#286c45;color:white}.wheat-page button:disabled{opacity:.55;cursor:wait}.input-preview{width:100%;height:170px;object-fit:contain}.head-boxes{width:100%;height:auto;max-height:400px}.wheat-page .answer{white-space:pre-wrap;line-height:1.8}.wheat-page article{border-top:1px solid #dce7df;padding:16px 0}.wheat-page a{color:#166944;text-decoration:underline}.wheat-page .warning{color:#825518;background:#fff6df;padding:14px;border-radius:10px}.wheat-page dl{display:grid;grid-template-columns:1fr 1fr;gap:8px}.risk-link{display:inline-block;margin-top:20px}@media(max-width:760px){.diagnosis-grid,.context-grid{grid-template-columns:1fr}.wheat-page main{padding:24px 14px 120px}}
</style>
