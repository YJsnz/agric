<script setup>
import { ref } from 'vue'
import DiagnosisPage from './views/DiagnosisPage.vue'
import WheatDiagnosisPage from './views/WheatDiagnosisPage.vue'
import JujubeDiagnosisPage from './views/JujubeDiagnosisPage.vue'
const crop = ref('pear')
</script>
<template>
  <header><a class="brand" href="/" aria-label="诊断工作台首页"><span class="brand-mark">叶</span><div>沧州特色农产品<span>多模态智能诊断</span></div></a><div class="header-right"><span class="version">独立诊断工作台 / V1</span><select v-model="crop" aria-label="当前作物"><option value="pear">泊头鸭梨</option><option value="wheat">黄骅旱碱麦</option><option value="jujube">沧州金丝小枣</option><option disabled>青县设施蔬菜 · 敬请期待</option></select></div></header>
  <DiagnosisPage v-if="crop === 'pear'" />
  <WheatDiagnosisPage v-else-if="crop === 'wheat'" />
  <JujubeDiagnosisPage v-else-if="crop === 'jujube'" />
</template>
