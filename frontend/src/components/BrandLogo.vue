<script setup lang="ts">
defineProps<{ compact?: boolean; inverse?: boolean }>()
</script>

<template>
  <div class="brand" :class="{ compact, inverse }">
    <span class="mark" aria-hidden="true"><i></i><b></b><em></em></span>
    <span v-if="!compact" class="copy"><strong>田言耕智</strong><small>智慧农业 AI 平台</small></span>
  </div>
</template>

<style scoped lang="scss">
.brand { display:flex; align-items:center; gap:11px; min-width:max-content; }
.mark { position:relative; width:39px; height:43px; display:block; }
.mark::after { content:""; position:absolute; width:3px; height:32px; background:#214c2f; left:19px; bottom:0; border-radius:3px; transform:rotate(-3deg); }
.mark i,.mark b,.mark em { position:absolute; display:block; width:20px; height:27px; background:linear-gradient(140deg,#91c83d,#24733c); border-radius:100% 0 100% 0; }
.mark i { left:1px; top:8px; transform:rotate(-32deg); }
.mark b { right:0; top:0; transform:scaleX(-1) rotate(-25deg); }
.mark em { right:1px; top:17px; transform:scaleX(-1) rotate(-52deg); width:17px; height:23px; }
.copy { display:flex; flex-direction:column; line-height:1.15; }
.copy strong { font-size:20px; letter-spacing:2px; font-weight:800; }
.copy small { margin-top:4px; font-size:10px; color:var(--text-secondary); letter-spacing:1.5px; }
.inverse .copy strong,.inverse .copy small { color:white; }
.compact .mark { transform:scale(.88); }
@media(max-width:720px){ .copy small{display:none}.copy strong{font-size:17px}.mark{width:31px;transform:scale(.8);transform-origin:left center} }
</style>
