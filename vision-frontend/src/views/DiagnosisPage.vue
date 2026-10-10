<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { diagnosePear, errorMessage } from '../api/diagnosis'
import ImageUploader from '../components/ImageUploader.vue'
import DiagnosisProgress from '../components/DiagnosisProgress.vue'
import ContextPanel from '../components/ContextPanel.vue'
import VisionResultCard from '../components/VisionResultCard.vue'
import DiagnosisSummary from '../components/DiagnosisSummary.vue'
import CandidateRiskPanel from '../components/CandidateRiskPanel.vue'
import KnowledgeGraphPanel from '../components/KnowledgeGraphPanel.vue'
import EvidencePanel from '../components/EvidencePanel.vue'
const file=ref(null), preview=ref(''), result=ref(null), busy=ref(false), error=ref(''), revision=ref(0)
let controller, lastContext={}
function select(value) { controller?.abort(); revision.value++; busy.value=false; if(preview.value) URL.revokeObjectURL(preview.value); file.value=value; preview.value=URL.createObjectURL(value); result.value=null; error.value=''; lastContext={} }
async function submit(context={}) {
  if(!file.value) { error.value='请先选择一张叶片图片。'; return }
  if(busy.value) return
  const current=revision.value; controller=new AbortController(); busy.value=true; error.value=''; lastContext=context
  try { const data=await diagnosePear(file.value,context,controller.signal); if(current===revision.value) result.value=data }
  catch(e) { if(current===revision.value && e.code!=='ERR_CANCELED') error.value=errorMessage(e) }
  finally { if(current===revision.value) busy.value=false }
}
onBeforeUnmount(()=>{controller?.abort();if(preview.value)URL.revokeObjectURL(preview.value)})
</script>
<template>
<main><section class="hero"><div><div class="eyebrow">从观察到理解 · 每一步都有依据</div><h1>看见症状，<em>循证研判。</em></h1><p>视觉感知 × 因果知识图谱 × GraphRAG 证据推理</p></div><div class="hero-note"><span class="dot"></span> 当前支持鸭梨叶片<span>症状识别 ≠ 疾病确诊</span></div></section>
<DiagnosisProgress :busy="busy" :result="result"/>
<div class="workspace"><aside><section class="card upload-card"><div class="section-heading"><h2>上传观测图片</h2><span class="tag">叶片 / leaf</span></div><ImageUploader :preview="preview" :filename="file?.name" @select="select" @invalid="error=$event"/><p class="note">视觉模型输出的是症状类别，不等于疾病确诊。</p><button class="primary" :disabled="busy" @click="submit()">{{ busy?'诊断流程处理中…':'开始智能诊断 ↗' }}</button></section><div v-if="error" class="error" role="alert">{{ error }} <button v-if="file" :disabled="busy" @click="submit(lastContext)">重试请求</button></div><ContextPanel v-if="result?.status==='needs_clarification'" :key="revision" :busy="busy" :questions="result.clarification_questions" @continue="submit"/><VisionResultCard :vision="result?.vision"/></aside><div class="results"><DiagnosisSummary :result="result" :busy="busy"/><div class="two-columns"><CandidateRiskPanel :candidates="result?.candidate_ranking"/><KnowledgeGraphPanel :result="result"/></div><EvidencePanel :result="result"/><details v-if="result" class="raw"><summary>查看本轮完整 API 返回</summary><pre>{{ JSON.stringify(result,null,2) }}</pre></details></div></div>
<footer>农业知识辅助决策 · AI辅助研判，不替代专业农技人员现场诊断。<span>VISION → KNOWLEDGE → EVIDENCE</span></footer></main>
</template>
