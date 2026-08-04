<script setup lang="ts">
import type { BusinessModule } from '@/types'
import { dockModules } from '@/data/farm'

defineProps<{ active: BusinessModule; showShortcuts?: boolean }>()
defineEmits<{ (event: 'change', module: BusinessModule): void }>()

const iconPaths: Record<BusinessModule, string[]> = {
  overview: ['M3.5 11.5 12 4l8.5 7.5','M5.5 10v9.5h13V10','M9.5 19.5v-6h5v6'],
  monitoring: ['M4 7.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z','m17 10 3-2v8l-3-2','M7 7.5l1-2h4l1 2','M7 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z'],
  environment: ['M12 3a3 3 0 0 0-3 3v7.2a4.5 4.5 0 1 0 6 0V6a3 3 0 0 0-3-3Z','M12 8v7','M18.5 7h2M18.5 11h2M18.5 15h2'],
  devices: ['M9 4h6l.6 2.1 1.6.9 2.1-.6 2 3.4-1.5 1.6v1.8l1.5 1.6-2 3.4-2.1-.6-1.6.9L15 20H9l-.6-2.1-1.6-.9-2.1.6-2-3.4 1.5-1.6v-1.8L2.7 9.2l2-3.4 2.1.6 1.6-.9L9 4Z','M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z'],
  irrigation: ['M12 3c3.5 4.6 5.5 7.3 5.5 10.4a5.5 5.5 0 1 1-11 0C6.5 10.3 8.5 7.6 12 3Z','M9 15c.7 1.1 1.7 1.6 3 1.6','M3 20h18'],
  crops: ['M19.5 4.5C13 4.5 8.6 7.2 7 11.6c-.8 2.4-.3 5.3 1.4 7.9 1-5.7 3.8-9.5 8.4-12','M7.4 13C5.2 12.6 3.6 13.4 2.5 15c2.3-.8 4.2-.5 5.6.8','M8.5 19.5c2.6-1.6 4.4-3.8 5.4-6.6 3.7-.8 5.8-3.6 5.6-8.4'],
  alerts: ['M12 3 2.5 20h19L12 3Z','M12 9v5','M12 17h.01']
}
</script>

<template>
  <nav class="dock" aria-label="农场业务图层">
    <button
      v-for="(item, index) in dockModules"
      :key="item.key"
      :class="{ active: active === item.key }"
      :aria-pressed="active === item.key"
      @click="$emit('change', item.key)"
    >
      <Transition name="keycap"><kbd v-if="showShortcuts" class="shortcut">{{ index + 1 }}</kbd></Transition>
      <span class="tooltip"><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span>
      <span class="icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path v-for="path in iconPaths[item.key]" :key="path" :d="path"/></svg><i v-if="item.badge">{{ item.badge }}</i></span>
      <small class="label">{{ item.label }}</small>
      <em></em>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.dock{position:absolute;z-index:25;left:50%;bottom:18px;transform:translateX(-50%);display:flex;align-items:center;gap:4px;padding:7px 10px;background:linear-gradient(135deg,rgba(238,247,239,.55),rgba(194,218,201,.32));backdrop-filter:blur(34px) saturate(190%);border:1px solid rgba(255,255,255,.68);border-radius:26px;box-shadow:0 22px 65px rgba(6,29,16,.35),inset 0 1px 1px rgba(255,255,255,.95),inset 0 -12px 28px rgba(53,93,64,.08)}.dock::before{content:"";position:absolute;left:14px;right:14px;top:3px;height:45%;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.34),transparent);pointer-events:none}button{position:relative;width:74px;height:58px;border:0;border-radius:20px;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#294c36;cursor:pointer;transition:.2s ease}button:hover{transform:translateY(-3px);background:rgba(255,255,255,.3)}button.active{background:linear-gradient(145deg,rgba(52,124,71,.92),rgba(21,82,46,.9));color:white;box-shadow:0 10px 25px rgba(20,75,41,.35),inset 0 1px 1px rgba(255,255,255,.35),inset 0 -10px 18px rgba(7,42,23,.16)}button.active::before{content:"";position:absolute;inset:2px 5px auto;height:42%;border-radius:15px;background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,.02));pointer-events:none}.shortcut{position:absolute;z-index:2;left:8px;top:7px;display:grid;place-items:center;width:14px;height:14px;padding:0;border:1px solid rgba(38,75,48,.2);border-radius:5px;background:rgba(255,255,255,.28);color:rgba(31,67,42,.58);font:700 8px/1 ui-monospace,monospace;box-shadow:none}.active .shortcut{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.14);color:rgba(255,255,255,.78)}.icon{position:relative;width:25px;height:25px;display:grid;place-items:center}.icon svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}.icon i{position:absolute;right:-10px;top:-6px;min-width:16px;height:16px;padding:0 4px;border:2px solid rgba(255,255,255,.8);border-radius:9px;background:#e66639;color:white;font:700 8px/12px sans-serif;box-shadow:0 3px 8px rgba(178,55,28,.32)}.label{font-size:10px;font-weight:700;letter-spacing:.4px}button>em{position:absolute;bottom:3px;width:4px;height:4px;border-radius:50%;background:transparent}button.active>em{background:#c7f8d0;box-shadow:0 0 8px #b2f5c0}.tooltip{position:absolute;bottom:calc(100% + 14px);left:50%;transform:translate(-50%,6px);width:max-content;max-width:180px;display:flex;flex-direction:column;gap:3px;padding:9px 11px;border:1px solid rgba(255,255,255,.13);border-radius:10px;background:rgba(8,29,23,.92);color:white;text-align:left;box-shadow:0 9px 28px rgba(0,0,0,.3);backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:.16s}.tooltip::after{content:"";position:absolute;top:100%;left:50%;border:5px solid transparent;border-top-color:rgba(8,29,23,.9);transform:translateX(-50%)}.tooltip strong{font-size:11px}.tooltip small{font-size:9px;color:rgba(255,255,255,.58)}button:hover .tooltip{opacity:1;visibility:visible;transform:translate(-50%,0)}
@media(max-width:800px){.dock{max-width:calc(100vw - 24px);overflow:auto;justify-content:flex-start;bottom:11px;padding:7px}.dock::-webkit-scrollbar{display:none}button{min-width:61px;width:61px;height:52px}.tooltip{display:none}.icon svg{width:20px}.label{font-size:10px}}
.keycap-enter-active,.keycap-leave-active{transition:.22s cubic-bezier(.22,.8,.25,1)}.keycap-enter-from,.keycap-leave-to{opacity:0;transform:translateY(4px) scale(.7)}
</style>
