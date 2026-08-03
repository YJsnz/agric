<script setup lang="ts">
defineProps<{ message: string; show: boolean }>()
</script>
<template><Transition name="toast"><div v-if="show" class="toast"><span>✓</span>{{ message }}</div></Transition></template>
<style scoped lang="scss">
.toast{position:fixed;z-index:100;left:50%;top:82px;transform:translateX(-50%);background:rgba(24,42,31,.92);color:white;padding:11px 18px;border-radius:999px;box-shadow:var(--shadow-md);font-size:14px;backdrop-filter:blur(14px)}
.toast span{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#79a65f;margin-right:9px}.toast-enter-active,.toast-leave-active{transition:.2s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translate(-50%,-8px)}
</style>
