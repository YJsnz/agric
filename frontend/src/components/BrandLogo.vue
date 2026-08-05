<script setup lang="ts">
import brandLogo from '@/assets/brand-logo.png'

defineProps<{ compact?: boolean; inverse?: boolean }>()
</script>

<template>
  <div class="brand" :class="{ compact, inverse }">
    <span class="mark" aria-hidden="true"><img :src="brandLogo" alt="" /></span>
    <span v-if="!compact" class="copy"><strong>田言耕智</strong><small>智慧农业 AI 平台</small></span>
  </div>
</template>

<style scoped lang="scss">
.brand { display:flex; align-items:center; gap:11px; min-width:max-content; }
.mark { position:relative; width:43px; height:43px; display:block; flex:none; overflow:hidden; border-radius:11px; background:white; box-shadow:0 2px 10px rgba(8,50,27,.1); }
.mark img { position:absolute; top:0; left:50%; width:138%; max-width:none; transform:translateX(-50%); }
.copy { display:flex; flex-direction:column; line-height:1.15; }
.copy strong { font-family:var(--font-display); font-size:21px; letter-spacing:1px; font-weight:750; }
.copy small { margin-top:4px; font-size:11px; color:var(--text-secondary); letter-spacing:.8px; font-weight:500; }
.inverse .copy strong,.inverse .copy small { color:white; }
.compact .mark { transform:scale(.88); transform-origin:center; }
@media(max-width:720px){ .copy small{display:none}.copy strong{font-size:17px}.mark{width:31px;transform:scale(.8);transform-origin:left center} }
</style>
