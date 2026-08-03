<script setup lang="ts">
import type { ViewMode } from '@/types'
defineProps<{ modelValue: ViewMode; drawerOpen?: boolean }>()
defineEmits<{ 'update:modelValue': [mode: ViewMode] }>()
</script>
<template>
  <div class="view-switch" :class="{ shifted: drawerOpen }">
    <button :class="{ active: modelValue === 'aerial' }" @click="$emit('update:modelValue', 'aerial')">实景</button>
    <button :class="{ active: modelValue === 'digital-twin' }" @click="$emit('update:modelValue', 'digital-twin')">3D</button>
  </div>
</template>
<style scoped lang="scss">
.view-switch{position:absolute;right:24px;top:120px;z-index:16;display:flex;padding:4px;background:rgba(13,40,32,.65);border:1px solid rgba(255,255,255,.13);backdrop-filter:blur(15px);border-radius:999px;transition:right .25s}.view-switch.shifted{right:calc(clamp(340px,29vw,420px) + 24px)}button{border:0;background:transparent;color:rgba(255,255,255,.75);padding:8px 18px;border-radius:999px;cursor:pointer}button.active{background:#147340;color:white;box-shadow:0 6px 18px rgba(11,94,48,.5)}@media(max-width:1000px){.view-switch,.view-switch.shifted{right:12px;top:84px}}
</style>
