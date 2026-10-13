<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'
const route=useRoute()
const crop=computed(()=>['pear','wheat','jujube','vegetable'].includes(String(route.query.crop))?String(route.query.crop):'pear')
const extra=computed(()=>new URLSearchParams({entity:String(route.query.entity||''),question:String(route.query.question||'').slice(0,500)}).toString())
const mode=computed(()=>route.query.mode==='knowledge'?'knowledge':'vision')
</script>
<template><section class="multicrop-frame"><iframe :src="`/multicrop/index.html?crop=${crop}&mode=${mode}&${extra}`" title="多作物视觉与知识工作台"/></section></template>
<style scoped>.multicrop-frame{height:100dvh;min-height:600px;padding-top:68px;box-sizing:border-box;background:var(--ui-bg,#f4f7f6)}iframe{display:block;border:0;width:100%;height:100%}</style>
