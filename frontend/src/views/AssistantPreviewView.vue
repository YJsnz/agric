<script setup lang="ts">
import { useRouter } from 'vue-router'
import BrandLogo from '@/components/BrandLogo.vue'
import ModeSwitch from '@/components/ModeSwitch.vue'
const router = useRouter()
</script>
<template><main class="assistant-preview"><header><BrandLogo/><ModeSwitch mode="assistant"/></header><section><span>✦</span><h1>智能问农模块由团队其他成员协作开发</h1><p>当前分支专注于数据工作台主界面的完整视觉和交互。</p><button @click="router.push('/workspaces/farm-01')">返回数据工作台</button></section></main></template>
<style scoped lang="scss">.assistant-preview{min-height:100vh;background:linear-gradient(rgba(249,250,246,.9),rgba(237,241,231,.9)),url('/assets/farm-aerial.png') center/cover}.assistant-preview header{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 30px}.assistant-preview section{height:calc(100vh - 76px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.assistant-preview section>span{font-size:38px;color:#507b51}.assistant-preview h1{font-size:28px;margin:15px 0 8px}.assistant-preview p{color:var(--text-secondary)}.assistant-preview button{margin-top:22px;border:0;border-radius:999px;padding:12px 22px;background:#416b47;color:white;cursor:pointer}</style>
