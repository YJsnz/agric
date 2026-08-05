<script setup lang="ts">
import type { WorkbenchWidgetType } from '@/types/workbench'

defineProps<{ type: WorkbenchWidgetType }>()
</script>

<template>
  <span class="widget-icon" :class="`icon-${type}`">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <template v-if="type === 'irrigation' || type === 'irrigation-schedule'">
        <path d="M12 3c3.4 4.5 5.3 7 5.3 10.1a5.3 5.3 0 1 1-10.6 0C6.7 10 8.6 7.5 12 3Z"/><path d="M9.5 15.2c.6.9 1.4 1.3 2.5 1.3"/>
      </template>
      <template v-else-if="type === 'trend'">
        <path d="M4 18V6M4 18h16"/><path d="m7 14 3-4 3 2 5-6"/><path d="m15 6h3v3"/>
      </template>
      <template v-else-if="type === 'metric' || type === 'summary'">
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V8"/>
      </template>
      <template v-else-if="type === 'environment'">
        <path d="M12 3a3 3 0 0 0-3 3v7.2a4.5 4.5 0 1 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M12 8v7"/>
      </template>
      <template v-else-if="type === 'devices'">
        <path d="M9 4h6l.6 2.1 1.7 1 2.1-.6 2 3.5-1.6 1.6v1.8l1.6 1.6-2 3.5-2.1-.6-1.7 1L15 20H9l-.6-2.1-1.7-1-2.1.6-2-3.5 1.6-1.6v-1.8L2.6 10l2-3.5 2.1.6 1.7-1L9 4Z"/><circle cx="12" cy="12" r="3"/>
      </template>
      <template v-else-if="type === 'alerts'">
        <path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/>
      </template>
      <template v-else-if="type === 'greenhouse'">
        <path d="M3 20V9l9-6 9 6v11M3 9h18M8 20V9M16 20V9M3 15h18"/>
      </template>
      <template v-else-if="type === 'crop-tasks'">
        <rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/><path d="m6.5 12 .8.8 1.6-1.7"/>
      </template>
      <template v-else>
        <path d="M12 3a6 6 0 0 0-3.8 10.6c.8.7 1.3 1.5 1.4 2.4h4.8c.1-.9.6-1.7 1.4-2.4A6 6 0 0 0 12 3Z"/><path d="M9.5 19h5M10.5 22h3"/><path d="M12 7v5M9.5 9.5h5"/>
      </template>
    </svg>
  </span>
</template>

<style scoped>
.widget-icon{width:40px;height:40px;display:grid;place-items:center;flex:none;border:1px solid rgba(35,93,54,.1);border-radius:12px;background:linear-gradient(145deg,#eff7ef,#e3f0e5);color:#37784b;box-shadow:inset 0 1px rgba(255,255,255,.9)}.widget-icon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}.icon-irrigation,.icon-irrigation-schedule{border-color:rgba(39,120,148,.12);background:linear-gradient(145deg,#edf8fb,#dfeff4);color:#347f98}.icon-alerts{border-color:rgba(183,106,32,.12);background:linear-gradient(145deg,#fff8eb,#faecd5);color:#b66c25}.icon-ai-insight{border-color:rgba(91,74,157,.12);background:linear-gradient(145deg,#f4f1ff,#e9e3fa);color:#6b58a7}.icon-devices{background:linear-gradient(145deg,#f1f5fa,#e5ecf3);color:#56738d}
</style>
