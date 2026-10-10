<script setup>
import { reactive, ref } from 'vue'
defineProps({ busy: Boolean, questions: Array })
const emit=defineEmits(['continue'])
const selection=ref(''), other=ref('')
const values=reactive({scene:'',growth_stage:'',temperature:'',humidity:'',rainfall:''})
function submit() { const region=selection.value==='other'?other.value.trim():selection.value; if(region) emit('continue',{...values,region}) }
</script>
<template><section class="context-card"><span class="eyebrow">补充上下文 · 由你提供</span><h2>还差一个关键信息</h2><p>为了匹配适用于当地的农技和病害证据，请补充当前种植或储藏所在地。</p><ul v-if="questions?.length"><li v-for="q in questions" :key="q">{{ q }}</li></ul><form @submit.prevent="submit"><label>所在地<select v-model="selection" required aria-label="所在地"><option value="" disabled>请选择实际所在地</option><option value="河北省沧州市泊头市">河北省沧州市泊头市</option><option value="other">其他地区</option></select></label><label v-if="selection==='other'">实际地区<input v-model="other" required maxlength="200" placeholder="请输入实际种植或储藏所在地" /></label><details><summary>补充更多实际信息（可选）</summary><div class="form-grid"><label>场景<input v-model="values.scene" maxlength="200" placeholder="如：果园" /></label><label>生育期<input v-model="values.growth_stage" maxlength="100" placeholder="未知请留空" /></label><label>温度 ℃<input v-model="values.temperature" type="number" step="any" /></label><label>相对湿度 %<input v-model="values.humidity" type="number" min="0" max="100" step="any" /></label><label>降雨量 mm<input v-model="values.rainfall" type="number" min="0" step="any" /></label></div></details><button class="primary" :disabled="busy || !selection || (selection==='other' && !other.trim())">{{ busy?'研判中…':'继续智能研判 →' }}</button></form></section></template>
