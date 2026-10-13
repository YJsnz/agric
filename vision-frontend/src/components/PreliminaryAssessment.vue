<script setup>
defineProps({ assessment: Object, local: Object, observations: Array, vision: Object })
</script>
<template>
  <section v-if="assessment?.available" class="preliminary-card">
    <span class="eyebrow">PRELIMINARY RISK ASSESSMENT</span>
    <h2>初步风险研判</h2>
    <p class="muted">当前视觉症状：{{ vision?.symptom_cn || '未返回' }} · 以下为证据支持的候选，不构成本地疾病结论。</p>
    <p class="answer">{{ assessment.summary }}</p>
    <h3>可能相关风险</h3>
    <article v-for="risk in assessment.candidate_risks || []" :key="risk.candidate_name" class="candidate">
      <strong>{{ risk.candidate_name }}</strong>
      <p>{{ risk.assessment }}</p>
      <span v-for="id in risk.evidence_ids" :key="id" class="tag">{{ id }}</span>
      <p v-for="scope in risk.applicability || []" :key="scope.evidence_id" class="muted">{{ scope.evidence_id }} · {{ scope.scope?.status || '适用范围请查看原证据' }}</p>
    </article>
    <h3>支持依据</h3>
    <p v-for="(point,i) in assessment.supporting_points || []" :key="i" class="answer">{{ typeof point==='string' ? point : point.text }}</p>
    <h3>仍需核实</h3>
    <p v-for="(point,i) in assessment.uncertainties || []" :key="i">{{ point }}</p>
    <h3>通用核验建议</h3>
    <p v-for="(point,i) in observations || []" :key="i" class="answer">{{ point }}</p>
    <div class="note"><strong>本地结论</strong><p>{{ local?.reason || '证据不足，暂不支持泊头本地疾病结论。' }}</p></div>
  </section>
</template>
<style scoped>.preliminary-card{margin:18px 0;padding:18px;background:#f2f6ed;border:1px solid #d7e3cb;border-radius:12px}.preliminary-card h3{font-size:13px;margin:18px 0 8px}.preliminary-card p{font-size:13px;white-space:pre-wrap}.tag{margin-right:6px}</style>
