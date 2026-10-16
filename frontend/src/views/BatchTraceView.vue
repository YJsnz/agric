<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const route=useRoute(),loading=ref(true),error=ref(''),batch=ref<any>(null)
const stages:Record<string,string>={HARVESTED:'已采收',SORTED:'已分选',STORED:'已入库',DISPATCHED:'已出库'}
let generation=0
function time(value:string){if(!value)return '未登记';const date=new Date(value);return Number.isNaN(date.getTime())?'未登记':date.toLocaleString('zh-CN',{hour12:false})}
async function load(){
 const version=++generation;loading.value=true;error.value='';batch.value=null
 const {farm,batch:id,key}=route.query
 if(typeof farm!=='string'||typeof id!=='string'||!/^\d+$/.test(id)||typeof key!=='string'){error.value='追溯码不完整，请重新扫描';loading.value=false;return}
 try{const params=new URLSearchParams({farmId:farm,id,key});const response=await fetch('/api/public/batch-trace?'+params,{referrerPolicy:'no-referrer'});const data=await response.json();if(!response.ok)throw Error(data.message||'暂时无法读取批次');if(version===generation)batch.value=data}catch(e){if(version===generation)error.value=e instanceof Error?e.message:'暂时无法读取批次'}finally{if(version===generation)loading.value=false}
}
watch(()=>route.fullPath,load,{immediate:true})
</script>
<template>
<main class="trace-page"><div class="trace-shell">
 <header><span class="brand">盐田丰语</span><span>农产品批次追溯</span></header>
 <section v-if="loading" class="state" role="status">正在读取批次信息…</section>
 <section v-else-if="error" class="state" role="alert"><h1>暂时无法查看</h1><p>{{error}}</p><button @click="load">重新读取</button></section>
 <template v-else-if="batch">
  <section class="product"><div class="product-top"><span>一批一码</span><span>{{stages[batch.stage]||'已登记'}}</span></div><h1>{{batch.crop||'作物未登记'}}</h1><p>{{batch.title}}</p><div class="batch-number"><small>批次编号</small><strong>{{batch.batchCode}}</strong></div></section>
  <section class="origin"><h2>采集信息</h2><dl><div><dt>采集地点</dt><dd>{{batch.location||'未登记'}}</dd></div><div><dt>采集时间</dt><dd>{{batch.collectedAt?time(batch.collectedAt):batch.collectionDate||'未登记'}}<small v-if="!batch.collectedAt&&batch.collectionDate">仅登记了日期</small></dd></div><div v-if="batch.quantity!=null"><dt>批次数量</dt><dd>{{batch.quantity.toLocaleString('zh-CN')}} {{batch.unit==='kg'?'千克':batch.unit}}</dd></div></dl><p v-if="!batch.collectedAt&&!batch.collectionDate" class="hint">该批次尚未补充采集时间。</p><p class="registered">登记时间：{{time(batch.recordedAt)}}</p></section>
  <section v-if="batch.steps?.length" class="journey"><h2>批次流转</h2><ol><li v-for="(step,index) in batch.steps" :key="index"><strong>{{stages[step.stage]||'已记录'}}</strong><time>{{time(step.recordedAt)}}</time></li></ol></section>
  <footer><span v-if="batch.simulated">演示批次 · 信息来自软件登记</span><span v-else>信息来自生产批次登记</span><p>每一份收获，都有迹可循</p></footer>
 </template>
</div></main>
</template>
<style scoped>
.trace-page{min-height:100dvh;background:#f2f6f1;color:#233f33;font-family:var(--font-sans),sans-serif;padding:0 18px 36px;box-sizing:border-box}.trace-shell{max-width:540px;margin:auto}header{display:flex;justify-content:space-between;align-items:center;padding:26px 2px;font-size:11px;color:#738578}.brand{font-size:17px;font-weight:700;color:#2b6d53;letter-spacing:1px}section{background:white;border:1px solid #e0e9df;border-radius:18px;margin-bottom:16px;padding:24px}.product{background:#285f49;color:#fff;border:0;padding:27px}.product-top{display:flex;justify-content:space-between;font-size:11px;color:#d3e5d8}.product-top>span:first-child{border:1px solid #8bb29b;border-radius:5px;padding:3px 8px}h1{font-size:32px;line-height:1.3;margin:24px 0 10px;font-weight:650}.product>p{font-size:14px;color:#d5e5da;line-height:1.7}.batch-number{margin-top:25px;padding-top:18px;border-top:1px solid #ffffff2b;display:flex;flex-direction:column;gap:7px}.batch-number small{font-size:11px;color:#c7ddcf}.batch-number strong{font-size:14px;overflow-wrap:anywhere;font-weight:500}h2{font-size:15px;margin:0 0 22px}dl{margin:0}dl>div{display:grid;grid-template-columns:82px minmax(0,1fr);gap:14px;margin-top:20px}dt{font-size:12px;color:#829083}dd{font-size:15px;line-height:1.6;margin:0;overflow-wrap:anywhere}dd>small{display:block;font-size:11px;color:#8b978d}.registered{font-size:11px;color:#8b978d;margin:25px 0 0}.hint{font-size:12px;color:#a18251;line-height:1.7}ol{list-style:none;padding:0;margin:0}li{position:relative;margin-left:5px;padding:0 0 24px 23px;border-left:1px solid #dbe6dd}li:before{content:'';position:absolute;left:-4px;top:5px;width:7px;height:7px;border-radius:50%;background:#81a88b}li:last-child{padding-bottom:0;border-color:transparent}li strong{font-size:13px;font-weight:500}time{display:block;font-size:11px;color:#839586;margin-top:6px}footer{text-align:center;color:#8c9d8e;font-size:11px;line-height:1.8;padding:8px}.state{text-align:center;margin-top:30px;font-size:14px}.state h1{font-size:20px}.state button{background:#285f49;color:white;border:0;padding:10px 20px;border-radius:8px;cursor:pointer}@media(min-width:700px){.trace-page{padding-top:22px}.trace-shell{max-width:540px}}
</style>
