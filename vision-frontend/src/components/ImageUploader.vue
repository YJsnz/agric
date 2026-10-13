<script setup>
import { ref } from 'vue'
defineProps({ preview: String, filename: String, subject: { type: String, default: '叶片' }, hint: { type: String, default: '请上传清晰的鸭梨叶片图片。当前 V1 仅支持叶片；果实与枝梢暂不支持。' } })
const emit = defineEmits(['select', 'invalid'])
const input = ref(null), dragging = ref(false)
function choose(files) {
  dragging.value = false
  const file = files?.[0]
  if (!file) return
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return emit('invalid', '只支持 JPG、PNG、WEBP 图片。')
  if (!file.size || file.size > 20 * 1024 * 1024) return emit('invalid', '请选择非空且不超过 20 MB 的图片。')
  emit('select', file)
}
</script>
<template>
  <div class="upload-area" :class="{ dragging, 'has-image': preview }" @dragover.prevent="dragging=true" @dragleave.prevent="dragging=false" @drop.prevent="choose($event.dataTransfer.files)">
    <img v-if="preview" :src="preview" :alt="`待诊断${subject}图片预览`" />
    <button type="button" class="upload-target" @click="input.click()">
      <template v-if="!preview"><span class="upload-symbol">↥</span><strong>把{{ subject }}图片放在这里</strong><span>拖拽上传，或点击选择图片</span><small>JPG / PNG / WEBP · 最大 20 MB</small></template>
      <template v-else><span class="replace-label">更换图片 ↗</span></template>
    </button>
    <input ref="input" type="file" accept="image/jpeg,image/png,image/webp" :aria-label="`上传${subject}图片`" @change="choose($event.target.files); $event.target.value=''" />
  </div>
  <p v-if="filename" class="filename">{{ filename }}</p>
  <p class="muted">{{ hint }}</p>
</template>
