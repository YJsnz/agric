<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetchObservationHistory, type ObservationHistory } from '@/api/dashboard'
const props=defineProps<{farmId:string;updatedAt:string;metrics:{key:string;label:string}[]}>()
const metric=ref('soilMoisture'), history=ref<ObservationHistory|null>(null), loading=ref(false), error=ref('')
let requestId=0
async function load() {
  const id=++requestId;loading.value=true;error.value=''
  try { const result=await fetchObservationHistory(metric.value,props.farmId);if(id===requestId)history.value=result }
  catch(e) {if(id===requestId){history.value=null;error.value=e instanceof Error?e.message:'读取失败'}}
  finally {if(id===requestId)loading.value=false}
}
watch(()=>[props.farmId,props.updatedAt,metric.value],load,{immediate:true})
const points=computed(()=>history.value?.points||[])
const extent=computed(()=>{const values=points.value.map(p=>p.value);const min=Math.min(...values),max=Math.max(...values);return {min,max,span:max-min||1}})
const line=computed(()=>points.value.map((p,i)=>`${12+i*296/Math.max(1,points.value.length-1)},${96-(p.value-extent.value.min)*72/extent.value.span}`).join(' '))
const time=(value:string)=>new Date(value).toLocaleTimeString('zh-CN',{hour12:false})
const source=(value:string)=>({demo_generator:'自动演示采集',demo_manual:'人工模拟调整',demo_irrigation:'模拟灌溉回执'}[value]||value)
function download() {
  if(!history.value)return
  const url=URL.createObjectURL(new Blob([JSON.stringify(history.value,null,2)],{type:'application/json'}))
  const link=document.createElement('a');link.href=url;link.download=`观测历史-${props.farmId}-${metric.value}.json`;link.click();URL.revokeObjectURL(url)
}
</script>
<template>
  <section class="observation-history" aria-label="已保存观测历史">
    <header><h2>已保存观测历史</h2><select v-model="metric" aria-label="历史观测指标"><option v-for="item in metrics" :key="item.key" :value="item.key">{{ item.label }}</option></select></header>
    <p class="history-note">农场级 · 演示记录 · 最近最多 240 条。时间轴从开始采集累积，不补造历史。</p>
    <p v-if="error" role="alert">{{ error }} <button @click="load">重试</button></p>
    <p v-else-if="!points.length">{{ loading?'读取历史…':'尚未采集记录，首次自动采集后显示。' }}</p>
    <template v-else>
      <div class="history-values"><strong>{{ points[points.length-1].value.toFixed(2) }} <small>{{ points[points.length-1].unit }}</small></strong><span>{{ points.length }} 条已保存记录</span></div>
      <svg v-if="points.length>1" viewBox="0 0 320 115" role="img" :aria-label="`${points[0].label}历史，最低${extent.min.toFixed(2)}，最高${extent.max.toFixed(2)}`"><path d="M12 96H308" stroke="#dfe7e5"/><polyline :points="line" fill="none" stroke="#398267" stroke-width="2" stroke-linejoin="round"/></svg>
      <p v-else>已有 1 条记录；积累更多记录后展示曲线。</p>
      <div class="history-axis"><time>{{ time(points[0].measuredAt) }}</time><time>{{ time(points[points.length-1].measuredAt) }}</time></div>
      <details><summary>查看来源与采集记录</summary><ol><li v-for="point in points.slice(-20).reverse()" :key="point.id"><time>{{ new Date(point.measuredAt).toLocaleString('zh-CN',{hour12:false}) }}</time><strong>{{ point.value.toFixed(2) }} {{ point.unit }}</strong><small>{{ source(point.source) }}</small></li></ol><p>列表展示最近 20 条，导出包含本次查询全部记录。</p></details>
      <button class="history-export" @click="download">导出历史记录</button>
    </template>
  </section>
</template>
<style scoped>
.observation-history{margin-top:22px;padding:16px;border:1px solid #dde6e4;border-radius:12px;background:white;color:#344a43}header{display:flex;align-items:center;justify-content:space-between;gap:8px}h2{font-size:12px;margin:0}select{min-width:0;max-width:155px;font-size:10px;padding:6px;border:1px solid #dce5e1;border-radius:6px;background:#f7faf8;color:inherit}p{font-size:10px;line-height:1.8;color:#87968f}.history-values{display:flex;align-items:center;justify-content:space-between}.history-values strong{font-size:24px;font-weight:550}.history-values small,.history-values span{font-size:10px;color:#89988f}svg{width:100%;display:block}.history-axis{display:flex;justify-content:space-between;font-size:10px;color:#93a097}details{margin-top:14px;font-size:10px}summary{cursor:pointer}ol{list-style:none;padding:0;max-height:220px;overflow:auto}li{display:grid;grid-template-columns:1fr auto;gap:4px;padding:9px 0;border-bottom:1px solid #edf1ee}li small{color:#94a197}button{font:inherit;cursor:pointer}.history-export{margin-top:12px;border:0;background:#eff5f1;color:#42795e;border-radius:6px;padding:8px 12px;font-size:10px}
</style>
