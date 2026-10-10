<script setup lang="ts">
import { computed } from 'vue'
import type { WheatResult } from '@/api/wheat'
import { wheatGraphUrl } from '@/api/wheat'
const props=defineProps<{ result:WheatResult; previews:Record<string,string> }>()
const terms:Record<string,string>={healthy:'健康叶片',rust:'锈病类视觉症状',leaf_spot_blight:'叶斑/叶枯类视觉症状',nitrogen_deficiency:'缺氮类黄化视觉表现',normal:'正常冠层视觉状态',water_stress:'疑似水分胁迫视觉表现'}
const states:Record<string,string>={candidate:'候选风险',supported_candidate:'证据支持候选',insufficient_evidence:'证据不足'}
const grounding:Record<string,string>={grounded:'已有证据支撑',partially_grounded:'部分结论有证据支撑',insufficient_evidence:'当前证据不足',not_requested:'未请求知识分析'}
const pct=(n:unknown)=>typeof n==='number'?`${(n*100).toFixed(2)}%`:'—'
const evidence=computed(()=>{const items=[...(props.result.citations||[]),...(props.result.knowledge?.evidence||[])];return items.filter((x,i)=>items.findIndex(y=>y.evidence_id===x.evidence_id)===i)})
const text=computed(()=>typeof props.result.assessment==='string'?props.result.assessment:props.result.assessment?.summary||'')
function sourceUrl(e:any){const value=e.url||e.source_metadata?.url;try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:undefined}catch{return undefined}}
function jump(id:string){document.getElementById('wheat-source-'+id)?.scrollIntoView({behavior:'smooth',block:'center'})}
</script>
<template><div>
  <section v-if="result.warnings?.length" class="diagnosis-card warning" role="status"><h3>部分分析能力暂不可用</h3><p v-for="(w,i) in result.warnings" :key="i">{{ w.message }}</p></section>
  <div class="diagnosis-grid"><section v-for="(title,key) in {leaf:'叶片视觉症状',canopy:'冠层状态',head:'麦穗检测'}" :key="key" class="diagnosis-card"><h3>{{ title }}</h3>
    <template v-if="result.visual_observations[key]"><template v-if="key!=='head'"><strong>{{ terms[result.visual_observations[key].class] || result.visual_observations[key].label_zh }}</strong><p>视觉模型得分：{{ pct(key==='leaf'?result.visual_observations[key].score:result.visual_observations[key].visual_score) }}</p><p v-if="key==='canopy'">阈值：{{ result.visual_observations[key].threshold }}<br>模型结果表示冠层视觉表现与花后亏缺灌溉处理组的相似程度，不代表土壤缺水确诊。</p></template>
    <template v-else><strong>检测麦穗数量：{{ result.visual_observations.head.wheat_head_count }}穗</strong><p>平均置信度：{{ pct(result.visual_observations.head.mean_confidence) }}</p><svg v-if="previews.head" class="head-boxes" :viewBox="`0 0 ${result.visual_observations.head.image_width} ${result.visual_observations.head.image_height}`" role="img" aria-label="麦穗检测框"><image :href="previews.head" :width="result.visual_observations.head.image_width" :height="result.visual_observations.head.image_height"/><rect v-for="(b,i) in result.visual_observations.head.boxes" :key="i" :x="b.x1" :y="b.y1" :width="b.x2-b.x1" :height="b.y2-b.y1" fill="none" stroke="#ffc400" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><p>麦穗数量为视觉估计值。</p></template></template>
    <p v-else>{{ result.warnings?.some(w=>w.component===({leaf:'model_a',canopy:'model_b',head:'model_c'}[key]))?'该项分析暂不可用':'未提供该类图像' }}</p>
  </section></div>
  <section class="diagnosis-card"><h2>AI风险研判</h2><p>{{ grounding[result.grounding_status] || result.grounding_status }}</p><p v-if="result.status==='insufficient_evidence'" class="warning">当前证据不足，建议补充现场观测或传感器数据。</p><p class="answer" v-if="text">{{ text }}</p><p v-else>本轮暂无可发布的AI研判，已有视觉结果仍可查看。</p><h3>环境上下文</h3><dl><template v-for="(title,key) in {region:'所在地',growth_stage:'生育阶段',soil_moisture:'土壤含水量（单位未提供）',soil_salinity:'土壤盐分（单位未提供）',temperature:'温度',humidity:'湿度'}" :key="key"><dt>{{ title }}</dt><dd>{{ result.environment_context[key] ?? '未提供' }}</dd></template></dl></section>
  <section class="diagnosis-card"><h2>风险候选</h2><p v-if="!result.candidate_risks?.length">本轮没有风险候选，不代表已排除所有风险。</p><article v-for="(risk,i) in result.candidate_risks" :key="i"><h3>{{ risk.risk }} · {{ states[risk.status] || '候选风险' }}</h3><p>视觉支持：{{ risk.visual_support?'有':'无' }} · 文献支持：{{ risk.knowledge_support?'有':'尚不足' }}</p><p>{{ risk.reason }}</p><p v-for="(check,j) in risk.recommended_checks" :key="j">{{ check }}</p></article><a :href="wheatGraphUrl(result.knowledge?.aligned_entities)" target="_blank" rel="noopener">在知识图谱中查看 ↗</a></section>
  <section class="diagnosis-card"><h2>建议措施</h2><p v-if="!result.recommendations?.length">暂无证据支持的针对性措施。</p><article v-for="(r,i) in result.recommendations" :key="i"><p>{{ r.action }}</p><small>{{ r.basis }}</small><button v-for="id in r.source_ids" :key="id" @click="jump(id)">查看 {{ id }}</button></article></section>
  <section class="diagnosis-card"><h2>文献与引用</h2><p v-if="!evidence.length">暂无可展示的文献证据。</p><article v-for="e in evidence" :key="e.evidence_id" :id="'wheat-source-'+e.source_id"><h3>[{{ e.evidence_id }}] {{ e.title }}</h3><p>{{ e.year||e.source_metadata?.year||'年份未标注' }} · {{ e.source_type||e.source_metadata?.source_type||'来源类型未标注' }} · {{ e.evidence_level||e.metadata?.evidence_level }}</p><p class="answer">{{ e.snippet||e.content }}</p><a v-if="sourceUrl(e)" :href="sourceUrl(e)" target="_blank" rel="noopener noreferrer">查看来源 ↗</a></article></section>
  <section class="diagnosis-card"><h2>使用说明与限制</h2><p v-for="(limit,i) in result.limitations" :key="i">{{ limit }}</p></section>
</div></template>

