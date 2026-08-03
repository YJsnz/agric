<script setup lang="ts">
import { useRouter } from 'vue-router'
defineProps<{ mode: 'assistant' | 'workspace'; dark?: boolean }>()
const router = useRouter()
</script>

<template>
  <div class="mode-switch" :class="{ dark }" aria-label="主模式切换">
    <button :class="{ active: mode === 'assistant' }" @click="router.push('/assistant')"><svg viewBox="0 0 20 20"><path d="M10 2.5 11.4 7 16 8.5 11.4 10 10 14.5 8.6 10 4 8.5 8.6 7 10 2.5Z"/><path d="m15.5 13 .6 1.8 1.9.7-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.7.6-1.8Z"/></svg>智能问农</button>
    <button :class="{ active: mode === 'workspace' }" @click="router.push('/workspaces/farm-01')"><svg viewBox="0 0 20 20"><rect x="2.5" y="3" width="6" height="6" rx="1"/><rect x="11.5" y="3" width="6" height="6" rx="1"/><rect x="2.5" y="12" width="6" height="5" rx="1"/><rect x="11.5" y="12" width="6" height="5" rx="1"/></svg>数据工作台</button>
  </div>
</template>

<style scoped lang="scss">
.mode-switch { padding:5px; display:flex; gap:3px; border-radius:999px; background:rgba(232,233,226,.82); box-shadow:inset 0 1px 2px rgba(0,0,0,.04); backdrop-filter:blur(18px); }
button { border:0; padding:10px 22px; border-radius:999px; display:flex;align-items:center;gap:7px;background:transparent; cursor:pointer; font-weight:700; color:var(--text-secondary); transition:.2s ease; }
button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linejoin:round}
button:first-child svg{fill:currentColor;stroke:none}
button.active { color:white; background:linear-gradient(135deg,#4f6746,#267643); box-shadow:0 7px 18px rgba(44,93,55,.25); }
.dark { background:rgba(255,255,255,.11); border:1px solid rgba(255,255,255,.12); }
.dark button { color:rgba(255,255,255,.72); }.dark button.active{color:white}
@media(max-width:700px){ button{padding:9px 13px;font-size:12px} }
</style>
