<script setup>
import { ref,watch } from 'vue'
import KnowledgeWorkspace from './views/KnowledgeWorkspace.vue'
import DiagnosisPage from './views/DiagnosisPage.vue'
import WheatDiagnosisPage from './views/WheatDiagnosisPage.vue'
import JujubeDiagnosisPage from './views/JujubeDiagnosisPage.vue'
const initial=new URLSearchParams(location.search).get('crop')
const crop = ref(['pear','wheat','jujube','vegetable'].includes(initial)?initial:'pear')
const mode=ref(crop.value==='vegetable'||new URLSearchParams(location.search).get('mode')==='knowledge'?'knowledge':'vision')
watch(crop,()=>{if(crop.value==='vegetable')mode.value='knowledge'})
</script>
<template>
  <header><a class="brand" href="/" aria-label="诊断工作台首页"><span class="brand-mark">叶</span><div>盐田丰语<span>多模态智能诊断</span></div></a><div class="header-right"><span class="version">盐田丰语 / 多作物研判</span><select v-model="crop" aria-label="当前作物"><option value="pear">泊头鸭梨</option><option value="wheat">黄骅旱碱麦</option><option value="jujube">沧州金丝小枣</option><option value="vegetable">青县设施蔬菜 · 知识</option></select></div></header>
  <KnowledgeWorkspace v-if="mode==='knowledge'" :crop="crop"/>
  <DiagnosisPage v-else-if="crop === 'pear'" />
  <WheatDiagnosisPage v-else-if="crop === 'wheat'" />
  <JujubeDiagnosisPage v-else-if="crop === 'jujube'" />
</template>
