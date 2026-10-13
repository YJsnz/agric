<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ModeSwitch from '@/components/ModeSwitch.vue'

const route = useRoute()
const platformMode = computed(() => route.path.startsWith('/assistant') ? 'assistant' : route.path === '/multicrop' ? 'knowledge' : 'workspace')
const modeInsideTopbar = computed(() => route.path.includes('/greenhouses/'))
</script>

<template>
  <div class="platform-mode-anchor" :class="{ 'in-topbar': modeInsideTopbar, 'agent-topbar': route.path === '/assistant', 'knowledge-topbar': route.path === '/multicrop' }">
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
.platform-mode-anchor.in-topbar{top:10px;padding:0;border:0;background:transparent;box-shadow:none;backdrop-filter:none}
.platform-mode-anchor.in-topbar:hover{box-shadow:none}
@media(max-width:700px){.platform-mode-anchor{top:11px}}
.platform-mode-anchor.agent-topbar{top:10px;padding:0;border:1px solid var(--ui-brand-soft);background:var(--ui-subtle);box-shadow:0 3px 16px #18244008;backdrop-filter:blur(18px)}
.platform-mode-anchor.knowledge-topbar{top:10px;padding:0;border:1px solid var(--ui-brand-soft);background:var(--ui-subtle);box-shadow:0 3px 16px #18244008;backdrop-filter:blur(18px)}
@media(max-width:799px){.platform-mode-anchor.agent-topbar{top:62px;z-index:20}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
:global(body:has(.agent-app.dark)) .platform-mode-anchor.agent-topbar{background:#292b31;border-color:#41434b}:global(body:has(.agent-app.dark)) :deep(.mode-switch){background:#292b31}:global(body:has(.agent-app.dark)) :deep(.mode-switch button){color:#b5b9c8}:global(body:has(.agent-app.dark)) :deep(.mode-switch button.active){color:white}
</style>
