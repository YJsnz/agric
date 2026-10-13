<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import ImageUploader from '../components/ImageUploader.vue'
import DiagnosisProgress from '../components/DiagnosisProgress.vue'
import GroundingStatus from '../components/GroundingStatus.vue'
import WheatDecisionSupport from '../components/WheatDecisionSupport.vue'
import FieldReview from '../components/FieldReview.vue'
import { diagnoseWheat } from '../api/wheat'
import { errorMessage } from '../api/diagnosis'
const inputs = [
  { key: 'leaf', name: '叶片', hint: '拍摄清晰的小麦叶片，用于叶部症状识别。' },
  { key: 'canopy', name: '冠层', hint: '拍摄田间小麦冠层，用于亏缺灌溉处理组视觉相似性分析。' },
  { key: 'head', name: '麦穗', hint: '拍摄可见麦穗，用于检测框展示和图中麦穗计数。' },
]
const active = ref('leaf'), files = reactive({ leaf: null, canopy: null, head: null }), previews = reactive({ leaf: '', canopy: '', head: '' })
const context = reactive({ region: '', growth_stage: '', temperature: '', humidity: '', leaf_position: '', field_distribution: '', recent_operations: '', progression: '' })
function continueDiagnosis(answers) { Object.assign(context, answers); submit() }
const knowledgeEnabled = ref(true), busy = ref(false), error = ref(''), result = ref(null)
let controller, revision = 0
function invalidate() { controller?.abort(); revision++; busy.value = false; result.value = null; error.value = '' }
function select(key, file) { invalidate(); if (previews[key]) URL.revokeObjectURL(previews[key]); files[key] = file; previews[key] = file ? URL.createObjectURL(file) : '' }
async function submit() {
  if (!Object.values(files).some(Boolean)) { error.value = '请至少上传一张叶片、冠层或麦穗图片。'; return }
  if (busy.value) return
  const current = ++revision
  controller = new AbortController(); busy.value = true; error.value = ''; result.value = null
  try { const data = await diagnoseWheat(files, context, knowledgeEnabled.value, controller.signal); if (current === revision) result.value = data }
  catch (e) { if (current === revision && e.code !== 'ERR_CANCELED') error.value = errorMessage(e) }
  finally { if (current === revision) busy.value = false }
}
onBeforeUnmount(() => { revision++; controller?.abort(); Object.values(previews).filter(Boolean).forEach(URL.revokeObjectURL) })
const observations = computed(() => result.value?.visual_observations || {})
// Visual hypotheses remain distinct from citation-validated literature claims.
// Do not add disease names absent from the classifier or aligned KG candidates.
const visualPossibilities = computed(() => {
  const items = []
  const leaf = observations.value.leaf
  const directions = {
    leaf_spot_blight: ['叶斑 / 叶枯类问题', '模型将这张图片归为叶斑/叶枯类视觉表现，可先沿这一方向核验；目前还不能区分具体病害，也不能仅凭分类结果确定原因。'],
    rust: ['锈病类问题', '模型输出锈病类视觉表现，这是待核验方向，不能据此确定具体锈病或确认现场发病。'],
    nitrogen_deficiency: ['黄化表现，缺氮原因待核验', '模型输出缺氮类黄化标签，但图片不能确认缺氮；其他原因尚未排除，不应直接据此施肥。'],
  }
  if (leaf && directions[leaf.class]) {
    const [name, explanation] = directions[leaf.class]
    items.push({ name, explanation })
  }
  if (observations.value.canopy?.class === 'water_stress') items.push({ name: '冠层水分胁迫相关视觉表现', explanation: '冠层图像更接近亏缺灌溉实验处理组，可作为进一步核验水分状况的线索，不能确认土壤缺水。' })
  return items
})
const nextActions = computed(() => (result.value?.recommendations || []).filter(item => {
  const action = typeof item === 'string' ? item : item.action
  return action && !(typeof result.value?.assessment === 'string' && result.value.assessment.includes(action))
}))
const status = computed(() => ({ insufficient_evidence: '初步分析', needs_clarification: '需要补充信息', validation_failed: '部分结论未通过核验', ok: '分析完成', success: '分析完成', grounded: '分析完成' }[result.value?.status] || (result.value ? '本轮分析已返回' : '等待图片')))
function score(value) { return Number.isFinite(value) ? value.toFixed(3) : '暂无' }
function safeUrl(value) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null } catch { return null } }
</script>
<template>
<main class="wheat-workbench">
  <section class="hero"><div><div class="eyebrow">黄骅旱碱麦 · 多视角观察</div><h1>看见苗情，<em>循证研判。</em></h1><p>叶片症状 × 冠层表现 × 麦穗检测 · 知识图谱与 GraphRAG</p></div><div class="hero-note"><span class="dot"></span> 三类图片，可单独或联合分析<span>视觉线索 ≠ 病害或缺水确诊</span></div></section>
  <DiagnosisProgress :busy="busy" :result="result" />
  <div class="workspace"><aside>
    <section class="card upload-card"><div class="section-heading"><h2>上传观测图片</h2><span class="tag">任选 1—3 类</span></div>
      <div class="input-tabs" role="tablist" aria-label="小麦图片类型"><button v-for="item in inputs" :key="item.key" role="tab" :aria-selected="active === item.key" :class="{ selected: active === item.key }" @click="active = item.key">{{ item.name }}{{ files[item.key] ? ' ✓' : '' }}</button></div>
      <div v-for="item in inputs" v-show="active === item.key" :key="item.key"><ImageUploader :subject="item.name" :hint="item.hint" :preview="previews[item.key]" :filename="files[item.key]?.name" @select="select(item.key, $event)" @invalid="error = $event" /><button v-if="files[item.key]" class="text-button" @click="select(item.key, null)">移除{{ item.name }}图片</button></div>
      <p class="muted">已选：{{ inputs.filter(item => files[item.key]).map(item => item.name).join('、') || '尚未选择图片' }}</p>
    </section>
    <form class="card" @submit.prevent="submit"><h2>补充田间信息 <small>选填</small></h2><p class="muted">请填写实际种植地；留空的信息保持未知。</p>
      <label>所在地<input v-model="context.region" placeholder="例如：河北省沧州市黄骅市" @input="invalidate" /></label>
      <label>生育阶段<input v-model="context.growth_stage" placeholder="例如：拔节期、灌浆期" @input="invalidate" /></label>
      <div class="form-grid"><label>温度（℃）<input v-model="context.temperature" type="number" step="any" @input="invalidate" /></label><label>湿度（%）<input v-model="context.humidity" type="number" min="0" max="100" step="any" @input="invalidate" /></label></div>
      <label class="knowledge-toggle"><input v-model="knowledgeEnabled" type="checkbox" @change="invalidate" />结合知识图谱与文档证据</label>
      <button class="primary" :disabled="busy">{{ busy ? '诊断流程处理中…' : '开始小麦智能诊断 ↗' }}</button>
    </form>
    <div v-if="error" class="error" role="alert">{{ error }}<button :disabled="busy" @click="submit">重试请求</button></div>
    <p class="note">叶片模型识别症状线索；冠层分数表示处理组视觉相似性；麦穗计数仅代表图中检测到的麦穗。</p>
  </aside><div class="results">
    <section class="card summary-card" aria-live="polite"><div class="section-heading"><span class="eyebrow">AI 综合研判</span><span class="tag">{{ busy ? '正在分析' : status }}</span></div>
      <div v-if="!result" class="summary-empty"><div class="leaf-mark">⌁</div><h2>{{ busy ? '正在分析图片与关联证据' : '从叶片到麦穗，看懂田间表现' }}</h2><p>上传一种或多种图片，结合真实田间信息，获取视觉结果与下一步核验建议。</p><div class="principles"><span>叶片症状</span><span>冠层视觉表现</span><span>麦穗检测计数</span></div></div>
      <template v-else>
        <div v-if="visualPossibilities.length" class="visual-possibilities"><h3>可能相关的方向 <small>视觉线索 · 待核验</small></h3><article v-for="item in visualPossibilities" :key="item.name"><strong>{{ item.name }}</strong><p>{{ item.explanation }}</p></article></div>
        <h3 v-if="visualPossibilities.length">结合资料进一步判断</h3>
        <p class="answer">{{ result.assessment || '本轮暂未获得通过证据核验的综合判断；上面的视觉线索仍可用于下一步现场核验。' }}</p><ul v-if="result.clarification_questions?.length"><li v-for="question in result.clarification_questions" :key="question">{{ question }}</li></ul><h3 v-if="nextActions.length">接下来可以做</h3><ul><li v-for="(item, i) in nextActions" :key="i">{{ typeof item === 'string' ? item : item.action }}</li></ul><p v-for="(warning, i) in result.warnings" :key="i" class="note">{{ typeof warning === 'string' ? warning : warning.message }}</p></template>
    </section>
    <WheatDecisionSupport :support="result?.decision_support" :busy="busy" @continue="continueDiagnosis" />
    <section class="card"><h2>视觉观察</h2><div class="visual-grid"><article v-for="item in inputs" :key="item.key"><span class="eyebrow">{{ item.name }}</span><template v-if="observations[item.key]">
      <template v-if="item.key === 'head'"><h3>检测到 {{ observations.head.wheat_head_count }} 个麦穗</h3><svg v-if="previews.head && observations.head.image_width && observations.head.image_height" class="head-preview" :viewBox="`0 0 ${observations.head.image_width} ${observations.head.image_height}`" role="img" aria-label="麦穗检测框"><image :href="previews.head" :width="observations.head.image_width" :height="observations.head.image_height" /><rect v-for="(box, i) in observations.head.boxes" :key="i" :x="box.x1" :y="box.y1" :width="box.x2-box.x1" :height="box.y2-box.y1" fill="none" stroke="#f5cb42" stroke-width="2" vector-effect="non-scaling-stroke" /></svg><p class="muted">未标定拍摄面积，不换算密度或产量。</p></template>
      <template v-else><h3>{{ observations[item.key].label_zh }}</h3><details><summary>模型信息</summary><p>视觉得分：{{ score(item.key === 'leaf' ? observations.leaf.score : observations.canopy.visual_score) }}</p></details><p v-if="item.key === 'canopy'" class="muted">{{ observations.canopy.interpretation }} 此分数不是缺水概率。</p><p v-else class="muted">分类得分不等于疾病确诊概率。</p></template>
    </template><p v-else class="muted">{{ files[item.key] ? '尚无该类识别结果' : '未上传该类图片' }}</p></article></div></section>
    <div class="two-columns"><section class="card"><h2>候选风险 <small>待核验</small></h2><p v-if="!result?.candidate_risks?.length" class="muted">暂无候选风险</p><article v-for="(item, i) in result?.candidate_risks" :key="i" class="candidate"><strong>{{ item.risk }}</strong><p>{{ item.reason }}</p><ul><li v-for="check in item.recommended_checks" :key="check">{{ check }}</li></ul></article></section>
      <section class="card"><h2>知识关联</h2><p v-if="!result?.knowledge?.aligned_entities?.length" class="muted">暂无已对齐的知识实体</p><div v-for="(entity, i) in result?.knowledge?.aligned_entities" :key="i" class="path">{{ entity.entity }} <span class="tag">{{ entity.entity_type }}</span></div></section></div>
    <details v-if="result" class="card"><summary>查看依据与核查详情（{{ result.citations?.length || 0 }}）</summary><p v-if="result.knowledge?.retrieval" class="muted">图谱检索：{{ result.knowledge.retrieval.graph_status }} / {{ result.knowledge.retrieval.graph_evidence_count }} 条；向量检索：{{ result.knowledge.retrieval.vector_status }} / {{ result.knowledge.retrieval.vector_evidence_count }} 条；生成层：{{ result.generation_called ? '已调用' : '未完成调用' }}。</p><article v-for="(source, i) in result.citations" :key="i" class="source"><strong>{{ source.evidence_id }} · {{ source.title || source.source_id }}</strong><p>{{ source.content }}</p><a v-if="safeUrl(source.url)" :href="safeUrl(source.url)" target="_blank" rel="noopener noreferrer">打开原文 ↗</a></article><GroundingStatus :grounding="result.grounding" /><p v-for="item in result.limitations" :key="item" class="muted">{{ item }}</p><details><summary>查看本轮完整 API 返回</summary><pre>{{ JSON.stringify(result, null, 2) }}</pre></details></details>
    <FieldReview :files="files" :result="result" :context="context" />
  </div></div>
  <footer>农业知识辅助决策 · AI 辅助研判，不替代专业农技人员现场诊断。<span>VISION → KNOWLEDGE → EVIDENCE</span></footer>
</main>
</template>
<style scoped>
.visual-possibilities{background:#f2f6ed;border-radius:10px;padding:12px 18px;margin-top:16px}.visual-possibilities small{font-size:12px;font-weight:400;color:#7e8c7d}.visual-possibilities p{font-size:13px;line-height:1.9}
.input-tabs{display:flex;gap:6px;margin-bottom:14px}.input-tabs button{flex:1;border:1px solid #d9e4d2;background:#f4f7ef;color:#52715b;border-radius:8px;padding:8px}.input-tabs button.selected{background:#216b50;color:white}.text-button{border:0;background:none;color:#806542;padding:6px 0}.knowledge-toggle{display:flex;align-items:center;gap:8px;margin-top:16px}.knowledge-toggle input{width:auto;margin:0}.visual-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.visual-grid article{background:#f2f6ed;border-radius:10px;padding:16px;overflow-wrap:anywhere}.visual-grid h3{font-size:17px}.head-preview{width:100%;height:auto;display:block}.wheat-workbench h3{margin-bottom:8px}.wheat-workbench li{margin:6px 0}@media(max-width:1100px){.visual-grid{grid-template-columns:1fr}}
</style>
