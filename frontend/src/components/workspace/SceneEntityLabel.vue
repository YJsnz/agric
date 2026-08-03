<script setup lang="ts">
import type { SceneEntity } from '@/types'
defineProps<{ entity: SceneEntity; active?: boolean }>()
defineEmits<{ select: []; focus: [] }>()
</script>

<template>
  <button class="entity" :class="[entity.status, { active }]" :style="{ left: entity.x + '%', top: entity.y + '%' }" @click.stop="$emit('select')" @dblclick.stop="$emit('focus')">
    <span class="entity-icon">
      <svg v-if="entity.type === 'camera'" viewBox="0 0 24 24"><path d="M4 8h11v9H4zM15 11l5-2v7l-5-2z"/><circle cx="9.5" cy="12.5" r="2.2"/></svg>
      <svg v-else-if="entity.type === 'water'" viewBox="0 0 24 24"><path d="M12 3c3 4 5 6.6 5 10a5 5 0 0 1-10 0c0-3.4 2-6 5-10Z"/><path d="M9.5 14.5c.7 1.1 1.5 1.5 2.7 1.5"/></svg>
      <svg v-else-if="entity.type === 'robot'" viewBox="0 0 24 24"><rect x="5" y="7" width="14" height="10" rx="3"/><path d="M12 7V4M8 20v-3M16 20v-3"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>
      <svg v-else-if="entity.type === 'station'" viewBox="0 0 24 24"><path d="M12 5v15M8 20h8M7 8a7 7 0 0 1 10 0M9.5 10.5a3.5 3.5 0 0 1 5 0"/><circle cx="12" cy="13" r="1.2"/></svg>
      <svg v-else-if="entity.type === 'field'" viewBox="0 0 24 24"><path d="M4 18c4-7 9-10 16-11M5 13c3 0 5 1 7 4M12 9c2 0 4 .8 6 3"/></svg>
      <svg v-else viewBox="0 0 24 24"><path d="M4 18V9l8-5 8 5v9M8 18v-6h8v6M7 8V5h3"/></svg>
    </span>
    <span><strong>{{ entity.name }}</strong><small>{{ entity.metric }}</small><em><i></i>{{ entity.status === 'warning' ? '预警' : entity.status === 'attention' ? '关注' : '正常' }}</em></span>
  </button>
</template>

<style scoped lang="scss">
.entity{position:absolute;z-index:8;transform:translate(-50%,-50%);display:flex;align-items:flex-start;gap:9px;min-width:128px;padding:10px 12px;border:1px solid rgba(255,255,255,.12);border-radius:13px;background:rgba(10,31,25,.72);backdrop-filter:blur(10px);color:white;text-align:left;box-shadow:0 9px 24px rgba(0,0,0,.18);cursor:pointer;transition:.2s ease}.entity:hover,.entity.active{z-index:10;transform:translate(-50%,-55%) scale(1.04);background:rgba(10,37,29,.9);border-color:rgba(156,255,171,.48)}.entity.active{box-shadow:0 0 0 2px rgba(125,245,135,.55),0 0 28px rgba(80,255,106,.35)}.entity-icon{flex:none;margin-top:1px;width:25px;height:25px;border-radius:8px;display:grid;place-items:center;background:rgba(255,255,255,.1)}.entity-icon svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}.entity>span:last-child{display:flex;flex-direction:column;gap:3px}.entity strong{font-size:13px;white-space:nowrap}.entity small{font-size:11px;color:rgba(255,255,255,.7)}.entity em{font-size:10px;color:#72dc8a;font-style:normal}.entity em i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#4de36e;margin-right:5px;box-shadow:0 0 8px currentColor}.entity.warning em{color:#ffc14d}.entity.warning em i{background:#ffa600}.entity.attention em{color:#ffd36e}.entity.attention em i{background:#e8b531}
@media(max-width:900px){.entity{min-width:0;padding:8px}.entity small,.entity em{display:none}.entity strong{font-size:11px}.entity:nth-of-type(n+7){display:none}}
</style>
