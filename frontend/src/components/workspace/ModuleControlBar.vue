<script setup lang="ts">
import { computed } from 'vue'
import type { BusinessModule } from '@/types'
import { dockModules } from '@/data/farm'

const props = defineProps<{ module: BusinessModule; activeSubLayer: string }>()
defineEmits<{ (event: 'change', key: string): void }>()
const definition = computed(() => dockModules.find(item => item.key === props.module)!)
</script>

<template>
  <Transition name="bar" mode="out-in">
    <section :key="module" class="module-bar">
      <header><span>{{ definition.icon }}</span><div><strong>{{ definition.label }}</strong><small>{{ definition.description }}</small></div></header>
      <i></i>
      <div class="options">
        <button v-for="item in definition.subLayers" :key="item.key" :class="{ active: activeSubLayer === item.key }" @click="$emit('change',item.key)">
          <span>{{ item.label }}</span><b v-if="item.value">{{ item.value }}</b>
        </button>
      </div>
    </section>
  </Transition>
</template>

<style scoped lang="scss">
.module-bar{position:absolute;z-index:19;left:50%;top:112px;transform:translateX(-50%);max-width:min(720px,calc(100vw - 520px));display:flex;align-items:center;gap:12px;padding:6px 8px 6px 13px;border:1px solid rgba(255,255,255,.14);border-radius:16px;background:linear-gradient(135deg,rgba(8,32,26,.82),rgba(12,48,37,.67));color:white;box-shadow:0 12px 32px rgba(0,0,0,.18);backdrop-filter:blur(18px)}header{display:flex;align-items:center;gap:8px;min-width:max-content}header>span{display:grid;place-items:center;width:27px;height:27px;border-radius:8px;background:rgba(122,231,143,.14);color:#84e69b}header div{display:flex;flex-direction:column}header strong{font-size:11px}header small{font-size:8px;color:rgba(255,255,255,.42);margin-top:2px}.module-bar>i{width:1px;height:28px;background:rgba(255,255,255,.12)}.options{display:flex;gap:3px;overflow:auto}.options::-webkit-scrollbar{display:none}.options button{min-width:max-content;border:0;border-radius:10px;padding:7px 9px;background:transparent;color:rgba(255,255,255,.64);font-size:10px;cursor:pointer;transition:.18s}.options button:hover{background:rgba(255,255,255,.08);color:white}.options button.active{background:rgba(103,197,119,.2);color:#a4f0b4;box-shadow:inset 0 0 0 1px rgba(137,237,157,.14)}.options b{margin-left:5px;font-size:9px;color:white}.bar-enter-active,.bar-leave-active{transition:.2s}.bar-enter-from,.bar-leave-to{opacity:0;transform:translate(-50%,-7px)}
@media(max-width:1100px){.module-bar{top:132px;max-width:calc(100vw - 28px)}header small{display:none}}@media(max-width:700px){.module-bar{top:70px;left:12px;right:12px;transform:none;max-width:none}header{display:none}.module-bar>i{display:none}.bar-enter-from,.bar-leave-to{transform:translateY(-5px)}}
</style>
