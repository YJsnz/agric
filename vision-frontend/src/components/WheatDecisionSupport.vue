<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({ support: Object, busy: Boolean })
const emit = defineEmits(['continue'])
const answers = reactive({})
watch(() => props.support, () => { Object.keys(answers).forEach(key => delete answers[key]) })
function submit() { emit('continue', Object.fromEntries(Object.entries(answers).filter(([,v]) => String(v).trim()))) }
</script>
<template><section v-if="support" class="card"><h2>下一步田间排查</h2>
  <p>{{ support.next_step }}</p>
  <form v-if="support.questions?.length" @submit.prevent="submit"><label v-for="question in support.questions" :key="question.id">{{ question.text }}<select v-if="question.options.length" v-model="answers[question.id]"><option value="">暂不填写</option><option v-for="option in question.options" :value="option.value" :key="option.value">{{ option.label }}</option></select><input v-else v-model="answers[question.id]" maxlength="500" /></label><button class="primary" :disabled="busy || !Object.values(answers).some(Boolean)">补充观察，继续研判</button></form>
  <h3>现在可以做</h3><ul><li v-for="item in support.immediate_actions" :key="item">{{ item }}</li></ul>
  <h3>满足条件后再采取措施</h3><p>{{ support.conditional_action_gap }}</p>
  <h3 v-if="support.professional_checks?.length">需要现场核验</h3><ul><li v-for="item in support.professional_checks" :key="item">{{ item }}</li></ul>
  <details><summary>本次已记录的观察</summary><pre>{{ support.user_observations }}</pre><p>{{ support.rule_scope }}</p></details>
</section></template>
