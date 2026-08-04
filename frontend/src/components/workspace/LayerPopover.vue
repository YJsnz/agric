<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'change', key: string, on: boolean): void }>()
const items = ref([
  { key: 'zones', label: '地块边界', on: true }, { key: 'devices', label: '设备标签', on: true }, { key: 'cameras', label: '摄像头覆盖', on: false },
  { key: 'irrigation', label: '灌溉管网', on: false }, { key: 'alerts', label: '告警位置', on: true }
])
</script>
<template><Transition name="pop"><div v-if="open" class="layers"><strong>场景图层</strong><label v-for="item in items" :key="item.key"><span>{{ item.label }}</span><input v-model="item.on" type="checkbox" @change="emit('change',item.key,item.on)" /><i></i></label></div></Transition></template>
<style scoped lang="scss">
.layers{position:absolute;z-index:28;right:84px;top:214px;width:190px;padding:15px;background:rgba(246,248,241,.9);border:1px solid rgba(255,255,255,.6);border-radius:18px;box-shadow:var(--shadow-md);backdrop-filter:blur(22px)}.layers strong{display:block;margin-bottom:9px}.layers label{display:flex;align-items:center;justify-content:space-between;padding:9px 0;font-size:13px;border-top:1px solid var(--border-soft);cursor:pointer}.layers input{display:none}.layers i{width:31px;height:18px;background:#c8cec3;border-radius:999px;position:relative}.layers i::after{content:"";position:absolute;width:14px;height:14px;background:white;border-radius:50%;left:2px;top:2px;transition:.2s}.layers input:checked+i{background:#4d754e}.layers input:checked+i::after{left:15px}.pop-enter-active,.pop-leave-active{transition:.18s}.pop-enter-from,.pop-leave-to{opacity:0;transform:translateX(8px)}
</style>
