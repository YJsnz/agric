<script setup lang="ts">
defineEmits<{ zoomIn: []; zoomOut: []; reset: []; layers: []; measure: [] }>()
</script>
<template>
  <aside class="toolbar">
    <button aria-label="指南针" title="指北并复位" @click="$emit('reset')"><span class="compass">N</span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="m14.8 9.2-1.5 4.1-4.1 1.5 1.5-4.1 4.1-1.5Z"/></svg></button>
    <button aria-label="复位视角" title="复位视角" @click="$emit('reset')"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/><circle cx="12" cy="12" r="2"/></svg></button>
    <button aria-label="图层" title="图层管理" @click="$emit('layers')"><svg viewBox="0 0 24 24"><path d="m12 4 8 4-8 4-8-4 8-4Z"/><path d="m5 12 7 3.5 7-3.5M5 16l7 3.5 7-3.5"/></svg></button>
    <i></i>
    <button aria-label="放大" title="放大" @click="$emit('zoomIn')"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg></button>
    <button aria-label="缩小" title="缩小" @click="$emit('zoomOut')"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg></button>
    <i></i>
    <button aria-label="测量" title="距离测量" @click="$emit('measure')"><svg viewBox="0 0 24 24"><path d="m7 18 10-12M5 15l4 4M15 5l4 4M9.5 13.5l1.6 1.6M12 10.8l1.6 1.6"/></svg></button>
  </aside>
</template>
<style scoped lang="scss">
.toolbar{position:absolute;z-index:15;right:calc(clamp(0px, 29vw, 420px) + 22px);top:171px;display:flex;flex-direction:column;gap:5px;padding:6px;background:rgba(10,31,25,.64);border:1px solid rgba(255,255,255,.12);border-radius:999px;backdrop-filter:blur(14px);transition:right .25s}.toolbar button{position:relative;width:43px;height:43px;border:0;border-radius:50%;display:grid;place-items:center;background:transparent;color:white;cursor:pointer;transition:.18s}.toolbar button:hover{background:rgba(255,255,255,.12);transform:scale(1.05)}.toolbar button svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.toolbar i{height:1px;background:rgba(255,255,255,.12);margin:0 7px}.compass{position:absolute;font:700 7px sans-serif;top:3px;left:19px;color:#8bf0a0}
.toolbar.drawer-closed{right:22px}@media(max-width:1000px){.toolbar{right:12px;top:160px}}@media(max-width:700px){.toolbar{display:none}}
</style>
