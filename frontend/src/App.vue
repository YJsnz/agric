<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ModeSwitch from '@/components/ModeSwitch.vue'

const route = useRoute()
const platformMode = computed(() => route.path.startsWith('/assistant') ? 'assistant' : 'workspace')
</script>

<template>
  <div class="platform-mode-anchor">
    <ModeSwitch :mode="platformMode" />
  </div>
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </Transition>
  </RouterView>
</template>

<style scoped lang="scss">
.platform-mode-anchor{position:fixed;z-index:120;left:50%;top:14px;transform:translateX(-50%);padding:5px;border:1px solid rgba(255,255,255,.78);border-radius:999px;background:linear-gradient(135deg,rgba(238,247,239,.8),rgba(210,226,213,.68));box-shadow:0 16px 42px rgba(7,35,20,.22),inset 0 1px rgba(255,255,255,.95);backdrop-filter:blur(30px) saturate(175%);transition:box-shadow .35s ease,background .35s ease}
.platform-mode-anchor:hover{box-shadow:0 20px 52px rgba(7,35,20,.28),inset 0 1px rgba(255,255,255,.95)}
@media(max-width:700px){.platform-mode-anchor{top:11px}}
</style>
