<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import ImageUploader from '../components/ImageUploader.vue'
import { diagnoseJujube, healthJujube, jujubeError, failureLabels } from '../api/jujube'
const tasks={leaf:'叶片病害/胁迫分析',fruit_bruise:'果实碰伤/机械损伤分析',fruit_freshness:'果实新鲜/腐败分析'}
const statuses={supported:'有证据支持',preliminary:'初步判断',insufficient_evidence:'当前证据不足'}
const levels={L1:'沧州/沧县本地证据',L2:'河北区域证据',L3:'同作物权威通用证据',L4:'迁移证据'}
const fields={temperature:'温度',humidity:'湿度',storage_temperature:'储藏温度',storage_humidity:'储藏湿度',storage_days:'储藏天数',harvest_method:'采收方式',transport_condition:'运输条件',notes:'其他观察'}
const task=ref('leaf'),file=ref(null),preview=ref(''),result=ref(null),error=ref(''),loading=ref(false),health=ref(null),healthError=ref(''),context=ref({})
const observations=ref({})
let controller,revision=0
const healthController=new AbortController()
function clear(){revision++;controller?.abort();result.value=null;error.value='';loading.value=false}
function changeTask(value){clear();task.value=value;context.value={};observations.value={}}
function select(value){clear();observations.value={};if(preview.value)URL.revokeObjectURL(preview.value);file.value=value;preview.value=URL.createObjectURL(value)}
function continueCheck(){
 const supplied=Object.entries(observations.value).filter(([,v])=>v?.trim()).map(([q,v])=>q+' 用户观察：'+v.trim()).join('\n')
 if(!supplied)return
 context.value.notes=supplied;submit()
}
async function submit(){
 if(!file.value){error.value='请先上传图片';return}
 clear();const current=revision;controller=new AbortController();loading.value=true
 try{const data=await diagnoseJujube(file.value,task.value,context.value,controller.signal);if(current===revision)result.value=data}
 catch(e){if(current===revision&&e.code!=='ERR_CANCELED')error.value=jujubeError(e)}
 finally{if(current===revision)loading.value=false}
}
onMounted(async()=>{try{health.value=await healthJujube(healthController.signal)}catch(e){if(e.code!=='ERR_CANCELED')healthError.value='服务状态暂不可查询'}})
onBeforeUnmount(()=>{clear();healthController.abort();if(preview.value)URL.revokeObjectURL(preview.value)})
const evidence=computed(()=>{
 const map=new Map();for(const e of [...(result.value?.reasoning?.evidence||[]),...(result.value?.reasoning?.citations||[])])map.set(e.evidence_id||e.source_id,e)
 return [...map.values()]
})
function pathText(path){
 const edges=result.value?.reasoning?.knowledge_graph?.edges||[]
 return (path.edge_ids||[]).map(id=>{const e=edges.find(x=>x.id===id);return e?`${e.subject} → ${e.relation} → ${e.object}`:id}).join('；') || (path.node_ids||[]).join(' → ')
}
function safeUrl(url){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
const show=value=>Array.isArray(value)?value.join('、'):value||'未注明'
</script>
<template>
<main class="jujube-page">
 <section class="hero"><div><div class="eyebrow">从观察到理解 · 每一步都有依据</div><h1>金丝小枣 AI 视觉风险分析</h1><p>叶片病害/胁迫、果实碰伤与采后新鲜度智能分析</p></div></section>
 <section class="card task-picker" aria-label="枣视觉任务"><button v-for="(label,key) in tasks" :key="key" :aria-pressed="task===key" :class="{primary:task===key}" @click="changeTask(key)">{{label}}</button></section>
 <div class="workspace"><aside><section class="card upload-card"><h2>上传观测图片</h2><ImageUploader :preview="preview" :filename="file?.name" :subject="task==='leaf'?'枣叶片':'枣果实'" hint="请上传清晰的目标图片，避免背景遮挡。" @select="select" @invalid="error=$event"/>
 <details><summary>补充环境与观察信息（选填）</summary><label v-for="(label,key) in fields" :key="key" class="context-field">{{label}}<input v-model="context[key]" :aria-label="label" placeholder="未提供"/></label></details>
 <button class="primary" :disabled="loading" @click="submit">{{loading?'分析中…':'开始枣风险分析 ↗'}}</button><p v-if="error" class="error" role="alert">{{error}}</p></section>
 <section class="card"><h2>服务状态</h2><p v-if="healthError">{{healthError}}</p><template v-if="health"><p>Vision：{{Object.values(health.vision_models||{}).every(m=>m.loaded)?'已加载':'部分不可用'}}</p><p>KG：{{health.kg?.status}} · {{health.kg?.backend}}</p><p>GraphRAG：{{health.graphrag?.status}}</p><p>LLM：{{health.llm?.status}} {{health.llm?.configured?'（已配置）':'（未配置）'}}</p></template></section></aside>
 <div class="results" aria-live="polite"><section v-if="!result" class="card"><h2>{{loading?'正在结合视觉与知识证据分析':'先看表现，再核验风险'}}</h2><p>选择任务并上传图片后，查看视觉线索与证据支持的分析。</p></section>
 <template v-else>
 <div v-if="result.degraded" class="note" role="status">AI解释服务暂不可用，当前展示结构化视觉与知识证据。<p>{{failureLabels[result.degraded_mode]||result.degraded_mode}}</p></div>
 <section class="card visual-card"><h2>视觉观察</h2><h3>{{result.visual.label_zh}}</h3><p>{{result.visual.class}} · 模型 {{result.visual.model_version}}</p><p>分类得分：{{Number(result.visual.confidence).toFixed(3)}} · {{result.visual.confidence_level}}</p><p>该结果为视觉模型分类证据，不等同于疾病确诊或品质最终判定。</p><p>确诊标记：{{result.visual.is_diagnosis?'是':'否'}}</p><p v-if="result.visual.confidence_level==='low'" class="note">当前视觉证据较弱，建议结合环境条件、症状特征及知识证据进一步判断。</p><p>关联视觉实体：{{result.mapped_entity?.name||'未映射'}}</p></section>
 <section v-if="result.reasoning.differential_assessment?.available" class="card differential-card"><h2>{{task==='leaf'?'先排查这几个方向':'采后核验与处理'}}</h2><p>下面是资料支持的核验方向，不代表照片已经显示这些特征。</p>
 <article v-for="direction in result.reasoning.differential_assessment.directions" :key="direction.id"><h3>{{direction.candidate}}</h3><p>{{direction.applicability}}</p><p class="muted">{{levels[direction.evidence_level]||'资料参考'}} · {{show(direction.region)}} · [{{direction.evidence_ids.join('、')}}]</p></article>
 <template v-if="result.reasoning.differential_assessment.actions?.length"><h3>满足条件后可以做</h3><article v-for="action in result.reasoning.differential_assessment.actions" :key="action.text"><p>{{action.text}} [{{action.evidence_ids.join('、')}}]</p><p class="muted">适用条件：{{action.condition}}</p></article></template>
 <h3>补充这几项观察，再继续分析</h3><label v-for="question in result.reasoning.differential_assessment.questions" :key="question" class="context-field">{{question}}<input v-model="observations[question]" :aria-label="question" placeholder="如实填写；不清楚可以留空"/></label>
 <button class="primary" :disabled="loading||!Object.values(observations).some(v=>v?.trim())" @click="continueCheck">根据补充观察继续分析</button><p class="muted">{{task==='leaf'?'本地病因尚未确认；目前不据此推荐具体药剂或补肥剂量。':'鲜枣通用资料不等于沧州本地验证；请先核实鲜枣或干枣、品种及贮藏条件。'}}</p></section>
 <section class="card risk-card"><div class="section-heading"><h2>结合观察进一步判断</h2><span class="tag">{{statuses[result.reasoning.status]||result.reasoning.status}}</span></div><p class="answer">{{result.reasoning.answer}}</p></section>
 <section class="card"><h2>知识图谱路径</h2><p v-if="!result.reasoning.paths?.length">当前图谱未检索到充分关联路径。</p><p v-for="(path,i) in result.reasoning.paths" :key="i" class="path">{{pathText(path)}}<small>来源：{{show(path.source_ids)}}</small></p></section>
 <section class="card evidence-card"><h2>证据与引用</h2><p v-if="!evidence.length">当前未获得可用的引用证据。</p><details v-for="(e,i) in evidence" :key="i"><summary>[{{e.evidence_id}}] {{e.title}}</summary><p>{{e.source_id}} · {{e.evidence_level}} · {{e.source_type==='model_card'?'模型使用边界（非农业病因证据）':levels[e.evidence_level]||e.evidence_level}}</p><p>地区：{{show(e.region)}}</p><p class="excerpt">{{e.original_text||e.content||e.snippet}}</p><a v-if="safeUrl(e.url)" :href="safeUrl(e.url)" target="_blank" rel="noopener noreferrer">打开原文 ↗</a></details></section>
 </template></div></div>
 <footer>视觉风险辅助分析 · 不用于食品安全、可食用性或储藏寿命判定。</footer>
</main>
</template>
<style scoped>
.task-picker{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px}.task-picker button{padding:12px 16px;flex:1;min-width:200px;width:auto;margin:0;border:1px solid #dce6db;border-radius:10px;background:#f3f7f0;color:#25483c}.task-picker button.primary{background:#236b53;color:white}.context-field{display:block;margin:12px 0}.context-field input{display:block;width:100%;padding:10px}.answer,.excerpt{white-space:pre-wrap;overflow-wrap:anywhere}.card{margin-bottom:20px}.card details{padding:12px 0}.path small{display:block}.upload-card>.primary{margin-top:20px;width:100%}
</style>
