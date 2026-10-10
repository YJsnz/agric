<script setup>
import { computed } from 'vue'
import GroundingStatus from './GroundingStatus.vue'
import PreliminaryAssessment from './PreliminaryAssessment.vue'
const props=defineProps({ result:Object, busy:Boolean })
const titles={needs_clarification:'需要补充信息',insufficient_evidence:'证据不足，暂不支持疾病确诊',validation_failed:'本次 AI 研判未通过证据完整性校验',success:'AI综合研判',grounded:'AI综合研判',ok:'AI综合研判',answered:'AI综合研判'}
const title=computed(()=>titles[props.result?.status] || '研判结果')
</script>
<template><section class="card summary-card" aria-live="polite"><div class="section-heading"><span class="eyebrow">EVIDENCE-GROUNDED ANSWER</span><span class="tag">{{ result?.status || '等待图片' }}</span></div><template v-if="result"><h2>{{ result.preliminary_assessment?.available ? "初步候选研判已完成 · 本地证据仍不足" : title }}</h2><PreliminaryAssessment :assessment="result.preliminary_assessment" :local="result.local_conclusion" :observations="result.recommended_observations" :vision="result.vision"/><p v-if="result.status==='validation_failed'" class="note">系统已进行 GraphRAG 分析，但生成结论未通过引用或证据核查，因此没有发布未经充分证据支持的最终结论。</p><p v-if="result.status==='insufficient_evidence'" class="note">已有视觉与候选检索结果仍可查看；当前证据不足以支持可靠的本地疾病结论。</p><div v-if="!result.preliminary_assessment?.available" class="answer">{{ result.graphrag?.answer || '后端未返回回答正文。' }}</div><GroundingStatus :grounding="result.grounding"/><p class="disclaimer">{{ result.disclaimer || 'AI辅助研判，不替代专业农技人员现场诊断。' }}</p></template><div v-else class="summary-empty"><div class="leaf-mark">⌁</div><h2>{{ busy?'正在寻找有据可依的答案':'先看症状，再找证据' }}</h2><p>视觉模型提供线索，知识图谱连接候选风险，<br/>GraphRAG 核查证据与适用范围。</p><div class="principles"><span>不猜测未知环境</span><span>不把候选当确诊</span><span>不发布无据结论</span></div></div></section></template>
