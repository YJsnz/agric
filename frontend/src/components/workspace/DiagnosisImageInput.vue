<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ title: string; preview?: string; filename?: string; disabled?: boolean }>()
const emit = defineEmits<{ (e:'select', file:File):void; (e:'remove'):void; (e:'invalid', message:string):void }>()
const input=ref<HTMLInputElement|null>(null)
function choose(files:FileList|null) {
  const f=files?.[0]; if(!f)return
  if(!['image/jpeg','image/png','image/webp'].includes(f.type)||!f.size||f.size>20*1024*1024) return emit('invalid','请选择不超过20 MB的JPG、PNG或WEBP图片。')
  emit('select',f)
}
</script>
<template><section class="diagnosis-card"><h3>{{ title }}</h3><img v-if="preview" :src="preview" :alt="title+'预览'" class="input-preview"><p v-else>未提供该类图像</p><p>{{ filename }}</p><input ref="input" type="file" accept="image/jpeg,image/png,image/webp" :aria-label="title" :disabled="disabled" @change="choose(($event.target as HTMLInputElement).files); ($event.target as HTMLInputElement).value=''" hidden><button type="button" :disabled="disabled" @click="input?.click()">{{ preview?'重新选择':'选择图片' }}</button> <button type="button" v-if="preview" :disabled="disabled" @click="emit('remove')">删除</button></section></template>

