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
.view-switch{position:absolute;right:24px;top:120px;z-index:16;display:flex;height:44px;padding:4px;background:rgba(13,40,32,.65);border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px rgba(255,255,255,.12),0 10px 28px rgba(3,24,18,.18);backdrop-filter:blur(15px);border-radius:999px;transition:right .25s,opacity .2s,transform .2s}.view-switch.shifted{right:calc(clamp(360px,30vw,440px) + 32px)}button{min-width:61px;border:0;background:transparent;color:rgba(255,255,255,.75);padding:8px 16px;border-radius:999px;cursor:pointer}button.active{background:linear-gradient(145deg,#238b51,#116d3c);color:white;box-shadow:0 6px 18px rgba(11,94,48,.5),inset 0 1px rgba(255,255,255,.25)}@media(max-width:1000px){.view-switch,.view-switch.shifted{left:12px;right:auto;top:84px}.view-switch.shifted{opacity:0;pointer-events:none;transform:translateY(-8px)}}@media(max-width:700px){.view-switch,.view-switch.shifted{top:70px}}
</style>
<style scoped lang="scss">
.view-switch.shifted{left:25px;right:auto;top:109px}
@media(max-width:1000px){.view-switch.shifted{left:12px;right:auto;top:84px;opacity:0;pointer-events:none;transform:translateY(-8px)}}
</style>
