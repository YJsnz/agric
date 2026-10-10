<script setup>defineProps({ busy: Boolean, result: Object })
const stages=['AI视觉感知','Vision → KG','候选风险分析','GraphRAG检索','AI综合研判']
</script>
<template><section class="process" :aria-busy="busy"><div class="process-heading"><span class="eyebrow">MULTIMODAL DIAGNOSIS</span><span aria-live="polite">{{ busy ? '诊断流程处理中' : result ? '本轮处理已返回' : '从一张叶片，开始寻找证据' }}</span></div><ol><li v-for="(stage,i) in stages" :key="stage"><span>{{ String(i+1).padStart(2,'0') }}</span>{{ stage }}</li></ol><p v-if="busy" class="muted">正在等待真实模型与证据服务返回。流程动画仅作提示，不代表后端实时阶段或完成百分比。</p></section></template>
