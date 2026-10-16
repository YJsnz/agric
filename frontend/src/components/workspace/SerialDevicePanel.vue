<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { getToken } from '@/api/auth'
const props=defineProps<{farmId:string;devices:{entityId:string;name:string;category:string}[]}>()
const selected=ref(props.devices[0]?.entityId||''),rows=ref<any[]>([]),error=ref(''),notice=ref(''),busy=ref(false),action=ref('SAMPLE'),level=ref(50),duration=ref(0)
const controllable=computed(()=>['actuator','robot'].includes(props.devices.find(d=>d.entityId===selected.value)?.category||''))
const options=computed(()=>[{id:'SAMPLE',name:'采集数据'},{id:'SELF_TEST',name:'检查设备'},...(controllable.value?[{id:'OPEN',name:'开启设备'},{id:'CLOSE',name:'关闭设备'},{id:'SET_LEVEL',name:'调节档位'},{id:'STOP',name:'停止运行'}]:[])])
const timed=computed(()=>action.value==='OPEN'||action.value==='SET_LEVEL')
let timer=0,generation=0
async function api(path:string,body?:unknown){const r=await fetch(`/api/farms/${encodeURIComponent(props.farmId)}/embedded/${encodeURIComponent(selected.value)}${path}`,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+getToken(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw Error(data.message||'暂时无法连接设备，请稍后重试');return data}
async function load(){if(!selected.value)return;const current=++generation;try{const data=await api('/messages');if(current===generation){rows.value=data;error.value=''}}catch(e){if(current===generation)error.value=(e as Error).message}}
async function send(){
 if(busy.value||!selected.value)return
 if(action.value==='SET_LEVEL'&&(!Number.isInteger(level.value)||level.value<0||level.value>100)){error.value='请选择 0 至 100 的档位';return}
 if(timed.value&&(!Number.isInteger(duration.value)||duration.value<0||duration.value>3600)){error.value='运行时长请填写 0 至 3600 秒';return}
 busy.value=true;error.value='';notice.value=''
 try{await api('/commands',{requestId:crypto.randomUUID(),action:['OPEN','CLOSE'].includes(action.value)?'SET_ENABLED':action.value,value:action.value==='OPEN'?1:action.value==='SET_LEVEL'?level.value:0,durationSeconds:timed.value?duration.value:0});notice.value='操作已提交，等待设备确认';await load()}catch(e){error.value=(e as Error).message}finally{busy.value=false}
}
const statusNames:Record<string,string>={PENDING:'等待设备确认',ACKED:'操作已确认',FAILED:'操作未完成',TIMED_OUT:'设备暂未响应',RECEIVED:'采样已保存'}
const actionNames:Record<string,string>={SAMPLE:'采集数据',SELF_TEST:'检查设备',SET_LEVEL:'调节档位',STOP:'停止运行'}
const metricNames:Record<string,string>={temperature:'空气温度',airHumidity:'空气湿度',soilMoisture:'土壤湿度',soilTemperature:'土壤温度',co2:'二氧化碳',light:'光照',ph:'酸碱度',ec:'电导率',flow:'流量',battery:'电量'}
const units:Record<string,string>={temperature:'℃',airHumidity:'%',soilMoisture:'%',soilTemperature:'℃',co2:' ppm',light:' lux',ec:' mS/cm',flow:' m³/h',battery:'%'}
function summary(row:any){try{const data=JSON.parse(row.payload);if(Array.isArray(data.readings))return data.readings.filter((r:any)=>metricNames[r.metric]).map((r:any)=>`${metricNames[r.metric]} ${r.value}${units[r.metric]||''}`).join(' · ')||'采集记录';return data.action==='SET_ENABLED'?(data.value===1?'开启设备':'关闭设备'):actionNames[data.action]||'设备操作'}catch{return '设备记录'}}
watch(()=>props.devices.map(d=>d.entityId).join(','),()=>{if(!props.devices.some(d=>d.entityId===selected.value))selected.value=props.devices[0]?.entityId||''})
watch([selected,()=>props.farmId],()=>{generation++;rows.value=[];notice.value='';error.value='';action.value='SAMPLE';duration.value=0;load()},{immediate:true})
watch(action,()=>{error.value='';notice.value='';duration.value=0})
timer=window.setInterval(load,5000);onBeforeUnmount(()=>{clearInterval(timer);generation++})
</script>
<template>
<section class="serial-panel" aria-label="设备操作">
 <header><h3>设备操作</h3><span>以设备反馈为准</span></header>
 <form @submit.prevent="send">
  <label>选择设备<select v-model="selected" :disabled="busy||!devices.length" aria-label="选择设备"><option v-if="!devices.length" value="">暂无可用设备</option><option v-for="d in devices" :key="d.entityId" :value="d.entityId">{{d.name}}</option></select></label>
  <label>操作<select v-model="action" :disabled="busy||!selected" aria-label="选择操作"><option v-for="item in options" :key="item.id" :value="item.id">{{item.name}}</option></select></label>
  <label v-if="action==='SET_LEVEL'" class="level">档位 <span>{{level}}%</span><input v-model.number="level" type="range" min="0" max="100" step="1" :disabled="busy" aria-label="调节档位"></label>
  <details v-if="timed" class="timing"><summary>定时设置（可选）</summary><label>运行时长（秒）<input v-model.number="duration" type="number" min="0" max="3600" step="1" :disabled="busy"></label><small>填 0 表示不设置定时</small></details>
  <button type="submit" :disabled="busy||!selected">{{busy?'正在提交…':'确认操作'}}</button>
 </form>
 <p v-if="error" class="error" role="alert">{{error}}</p><p v-else-if="notice" role="status">{{notice}}</p>
 <p v-if="!rows.length&&!error&&!notice" class="empty">暂无设备反馈</p>
 <details v-if="rows.length" class="history"><summary>最近反馈 <span>{{statusNames[rows[0].status]||'已记录'}}</span></summary><div class="history-list" tabindex="0" aria-label="设备反馈记录"><article v-for="row in rows.slice(0,10)" :key="row.id"><div><strong>{{summary(row)}}</strong><span>{{statusNames[row.status]||'已记录'}}</span></div><time>{{new Date(row.createdAt).toLocaleString('zh-CN',{hour12:false})}}</time></article></div></details>
</section>
</template>
<style scoped>
.serial-panel{margin:12px 23px;padding:16px;border:1px solid var(--ui-border,#dbe7de);border-radius:12px;flex-shrink:0;color:var(--ui-ink,#244c36)}header{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:15px}h3{font-size:14px;margin:0}header>span,.empty,small,time{font-size:10px;color:var(--ui-muted,#698272)}form{display:grid;gap:12px}label{display:block;font-size:11px;color:var(--ui-secondary,#657c6c)}select,input[type=number]{display:block;box-sizing:border-box;width:100%;margin-top:5px;padding:9px 10px;border:1px solid var(--ui-border,#dbe7de);border-radius:8px;background:var(--ui-surface,white);color:var(--ui-ink,#244c36);font:inherit}button{width:100%;padding:11px;background:var(--ui-brand,#286b4b);color:white;border:0;border-radius:8px;font:inherit;font-size:12px;cursor:pointer}button:disabled{opacity:.5;cursor:default}.level>span{float:right;color:var(--ui-brand,#286b4b)}input[type=range]{width:100%;margin:9px 0 0;accent-color:var(--ui-brand,#286b4b)}summary{font-size:11px;cursor:pointer;color:var(--ui-secondary,#657c6c)}.timing label{margin-top:10px}.timing small{display:block;margin-top:5px}p{font-size:11px;line-height:1.7;margin:12px 0 0}.error{color:var(--ui-danger,#b8553f)}.empty{text-align:center}.history{margin-top:14px;border-top:1px solid var(--ui-border,#e5eee8);padding-top:12px}.history summary>span{float:right;font-size:10px;color:var(--ui-muted,#698272)}.history-list{max-height:180px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;margin-top:7px}article{padding:10px 0;border-bottom:1px solid var(--ui-border,#e5eee8)}article>div{display:flex;align-items:start;justify-content:space-between;gap:12px}article strong{font-size:11px;font-weight:500;line-height:1.7}article span{font-size:10px;white-space:nowrap;color:var(--ui-brand,#286b4b)}time{display:block;margin-top:4px}button:focus-visible,select:focus-visible,input:focus-visible,summary:focus-visible,.history-list:focus-visible{outline:2px solid var(--ui-brand,#286b4b);outline-offset:3px}
</style>
