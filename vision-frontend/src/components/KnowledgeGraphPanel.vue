<script setup>
import { computed } from 'vue'
import ReasoningPathPanel from './ReasoningPathPanel.vue'
const props=defineProps({result:Object})
const names=computed(()=>[...new Set((props.result?.candidate_ranking||[]).map(c=>c.candidate_name))])
</script>
<template><section class="card"><span class="eyebrow">03 / KNOWLEDGE CONNECTIONS</span><h2>知识关系</h2><ReasoningPathPanel v-if="result?.reasoning_paths?.length" :paths="result.reasoning_paths"/><template v-else-if="result"><p class="muted">诊断流程关系展示 · 不是已验证因果链</p><div class="data-chain"><span>{{ result.vision?.crop }}</span><b>↓</b><span>{{ result.context?.organ === 'leaf'?'叶片':result.context?.organ || '部位未知' }} · {{ result.vision?.symptom_cn }}</span><b>↓ 候选检索</b><div><span v-for="name in names" :key="name">{{ name }}</span><span v-if="!names.length">未返回候选</span></div></div></template><p v-else class="empty">这里将呈现实际返回的关系路径与诊断数据链。</p></section></template>
