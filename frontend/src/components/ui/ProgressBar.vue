<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number | null
  max?: number
  label?: string
  pendingLabel?: string
  completeLabel?: string
  tone?: 'light' | 'dark'
  compact?: boolean
}>(), {
  max: 100,
  label: '加载进度',
  pendingLabel: '处理中',
  completeLabel: '已完成',
  tone: 'light',
  compact: false
})

const indeterminate = computed(() => props.value === null)
const fraction = computed(() => props.value === null || props.max <= 0 ? 0 : Math.min(1, Math.max(0, props.value / props.max)))
const percent = computed(() => Math.round(fraction.value * 100))
const complete = computed(() => !indeterminate.value && fraction.value >= 1)
const labelId = `progress-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <div class="progress-bar" :class="[tone, { compact }]">
    <div class="progress-head">
      <span :id="labelId">{{ label }}</span>
      <span class="progress-state" aria-hidden="true">
        <b :class="{ visible: indeterminate }">{{ pendingLabel }}</b>
        <b class="percent" :class="{ visible: !indeterminate }">{{ percent }}%</b>
      </span>
    </div>
    <div
      class="track"
      role="progressbar"
      :aria-labelledby="labelId"
      aria-valuemin="0"
      :aria-valuemax="max"
      :aria-valuenow="indeterminate ? undefined : Math.round(fraction * max * 100) / 100"
      :aria-valuetext="indeterminate ? pendingLabel : `${percent}%`"
    >
      <div class="rail">
        <span v-if="!indeterminate" class="fill" :style="{ transform: `scaleX(${fraction})` }"></span>
        <span v-else class="fill indeterminate"></span>
      </div>
    </div>
    <span class="sr-only" aria-live="polite">{{ complete ? completeLabel : indeterminate ? pendingLabel : '' }}</span>
  </div>
</template>

<style scoped lang="scss">
.progress-bar{width:100%;color:#465245}.progress-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}.progress-head>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600}.progress-state{position:relative;display:grid;flex:0 0 auto;justify-items:end;color:#788176}.progress-state b{grid-area:1/1;font-size:11px;font-weight:600;line-height:18px;opacity:0;transform:translateY(3px);transition:opacity .28s ease,transform .35s cubic-bezier(.2,.8,.2,1)}.progress-state b.visible{opacity:1;transform:none}.progress-state .percent{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-variant-numeric:tabular-nums}.track{margin-top:7px;padding:2px;border-radius:5px;background:rgba(44,62,44,.1);box-shadow:inset 0 1px 2px rgba(24,42,26,.13),inset 0 0 0 1px rgba(24,42,26,.05)}.rail{position:relative;height:8px;overflow:hidden;border-radius:3px}.fill{position:absolute;inset:0;display:block;transform-origin:left;border-radius:3px;background:linear-gradient(90deg,#347a4c,#72bb7f);box-shadow:inset 0 1px rgba(255,255,255,.38),inset 0 -1px rgba(19,62,34,.22);transition:transform .55s cubic-bezier(.18,.78,.22,1)}.fill.indeterminate{width:40%;right:auto;animation:indeterminate 1.25s ease-in-out infinite}@keyframes indeterminate{0%{transform:translateX(-105%);opacity:.35}45%{opacity:1}100%{transform:translateX(255%);opacity:.65}}.dark{color:rgba(255,255,255,.86)}.dark .progress-state{color:rgba(255,255,255,.5)}.dark .track{background:rgba(255,255,255,.1);box-shadow:inset 0 1px 2px rgba(0,0,0,.38),inset 0 0 0 1px rgba(255,255,255,.05)}.dark .fill{background:linear-gradient(90deg,#59b774,#91e19d)}.compact .progress-head>span:first-child,.compact .progress-state b{font-size:9px}.compact .track{margin-top:5px}.compact .rail{height:5px}
@media(prefers-reduced-motion:reduce){.fill,.progress-state b{transition:none}.fill.indeterminate{animation:none;transform:scaleX(.45);opacity:.8}}
</style>
