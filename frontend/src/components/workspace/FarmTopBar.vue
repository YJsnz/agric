<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'
import ModeSwitch from '@/components/ModeSwitch.vue'

defineProps<{ dark?: boolean }>()
const emit = defineEmits<{
  (event: 'search', value: string): void
  (event: 'notify'): void
}>()
const router = useRouter()
const query = ref('')

function onSearch() {
  if (query.value.trim()) emit('search', query.value.trim())
}
function openFullscreen() { document.documentElement.requestFullscreen?.() }
</script>

<template>
  <header class="topbar" :class="{ dark }">
    <div class="left">
      <BrandLogo :inverse="dark" />
      <button class="farm-select">智慧农场01 <svg viewBox="0 0 20 20"><path d="m6 8 4 4 4-4"/></svg></button>
    </div>
    <ModeSwitch mode="workspace" :dark="dark" class="modes" />
    <div class="right">
      <form class="search" @submit.prevent="onSearch">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg><input v-model="query" aria-label="全局搜索" placeholder="搜索设备、地块、数据…" />
      </form>
      <button class="time"><span>今天</span> 08:00–18:00 <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18"/></svg></button>
      <button class="top-icon notice" aria-label="通知" @click="$emit('notify')"><svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9.5 21h5"/></svg><i>3</i></button>
      <button class="top-icon" aria-label="全屏" @click="openFullscreen"><svg viewBox="0 0 24 24"><path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5"/></svg></button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.topbar{height:78px;padding:13px 25px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;position:absolute;z-index:30;inset:0 0 auto;background:linear-gradient(180deg,rgba(235,245,247,.9),rgba(235,245,247,.4) 70%,transparent);color:#15251c}
.left,.right{display:flex;align-items:center;gap:13px}.right{justify-content:flex-end}.farm-select,.time,.search{height:44px;border:1px solid rgba(255,255,255,.34);background:rgba(255,255,255,.3);backdrop-filter:blur(18px);border-radius:999px;color:inherit}.farm-select{padding:0 16px 0 18px;border:0;font-weight:650;cursor:pointer;display:flex;align-items:center;gap:8px}.farm-select svg{width:14px}.search{width:min(230px,18vw);display:flex;align-items:center;padding:0 13px;gap:8px}.search>svg{width:19px;flex:none}.search input{border:0;outline:0;background:transparent;width:100%;color:inherit}.search input::placeholder{color:currentColor;opacity:.72}.time{padding:0 13px 0 15px;cursor:pointer;display:flex;align-items:center;gap:7px}.time span{opacity:.75}.time svg{width:18px}.top-icon{position:relative;width:42px;height:42px;border:0;background:transparent;cursor:pointer;color:inherit;display:grid;place-items:center}.top-icon svg{width:21px}.topbar svg{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.notice i{position:absolute;right:1px;top:0;display:grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#df372f;color:white;font:700 10px sans-serif}.dark{background:linear-gradient(180deg,rgba(5,22,18,.76),rgba(5,22,18,.35) 72%,transparent);color:white}.dark .farm-select,.dark .time,.dark .search{background:rgba(7,35,28,.32);border-color:rgba(255,255,255,.14)}
@media(max-width:1100px){.search{display:none}.time span{display:none}.topbar{grid-template-columns:1fr auto}.modes{order:3}.right{display:none}}
@media(max-width:700px){.topbar{height:64px;padding:8px 12px}.farm-select{display:none}.modes{justify-self:end}.left :deep(.copy){display:none}}
</style>
