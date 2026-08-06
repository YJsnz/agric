<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { environmentMetrics } from '@/data/farm'
import { fetchLiveWeather, type LiveWeather } from '@/api/weather'
defineEmits<{ detail: [] }>()
const metric = (key: string) => computed(() => environmentMetrics.find(item => (item as { key?: string }).key === key)?.value || '--')
const sensorTemperature = metric('temperature')
const sensorHumidity = metric('airHumidity')
const weather = ref<LiveWeather | null>(null)
const loading = ref(false)
const error = ref('')
let refreshTimer = 0
let controller: AbortController | undefined
const temperature = computed(() => weather.value ? `${weather.value.temperature.toFixed(1)}°C` : sensorTemperature.value)
const humidity = computed(() => weather.value ? `${Math.round(weather.value.humidity)}%` : sensorHumidity.value)
const wind = computed(() => weather.value ? `${weather.value.windSpeed.toFixed(1)}m/s` : '2.1m/s')
const radiation = computed(() => weather.value ? `${Math.round(weather.value.radiation)}W/m²` : '--')
const observedLabel = computed(() => {
  if (loading.value && !weather.value) return '正在连接实时天气…'
  if (!weather.value) return error.value ? '农场传感器 · 天气服务暂不可用' : '农场传感器数据'
  const time = new Date(weather.value.observedAt)
  const label = Number.isNaN(time.getTime()) ? weather.value.observedAt.slice(11, 16) : time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return `${weather.value.source} · ${label} 更新`
})

async function refreshWeather() {
  controller?.abort()
  controller = new AbortController()
  loading.value = true
  error.value = ''
  try { weather.value = await fetchLiveWeather(controller.signal) }
  catch (reason) {
    if ((reason as Error).name !== 'AbortError') error.value = reason instanceof Error ? reason.message : '实时天气读取失败'
  } finally { loading.value = false }
}

onMounted(() => {
  void refreshWeather()
  refreshTimer = window.setInterval(refreshWeather, 10 * 60 * 1000)
})
onBeforeUnmount(() => { controller?.abort(); window.clearInterval(refreshTimer) })
</script>

<template>
  <section class="weather glass-dark">
    <div class="summary"><span class="sun"><i v-for="n in 8" :key="n"></i></span><div><strong>{{ temperature }}</strong><small :title="error">{{ observedLabel }}</small></div></div>
    <div class="facts"><span>湿度 <b>{{ humidity }}</b></span><span>风速 <b>{{ wind }}</b></span><span>辐射 <b>{{ radiation }}</b></span></div>
    <button @click="$emit('detail')">查看更多 <span>→</span></button>
  </section>
</template>

<style scoped lang="scss">
.weather{position:absolute;z-index:12;left:25px;top:109px;width:289px;padding:18px 18px 14px;color:white}.glass-dark{background:linear-gradient(145deg,rgba(19,39,34,.82),rgba(12,31,27,.62));border:1px solid rgba(255,255,255,.11);border-radius:19px;box-shadow:0 18px 42px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.06);backdrop-filter:blur(18px)}.summary{display:flex;align-items:center;gap:18px}.sun{position:relative;width:43px;height:43px;display:block;border-radius:50%;background:#ffb424;box-shadow:0 0 19px rgba(255,179,28,.42);transform:scale(.55)}.sun i{position:absolute;left:19px;top:-15px;width:5px;height:12px;border-radius:4px;background:#ffb424;transform-origin:3px 36px;transform:rotate(calc(var(--n)*45deg))}.sun i:nth-child(1){--n:0}.sun i:nth-child(2){--n:1}.sun i:nth-child(3){--n:2}.sun i:nth-child(4){--n:3}.sun i:nth-child(5){--n:4}.sun i:nth-child(6){--n:5}.sun i:nth-child(7){--n:6}.sun i:nth-child(8){--n:7}.summary div{display:flex;flex-direction:column}.summary strong{font-size:31px}.summary small{margin-top:3px;color:rgba(255,255,255,.66)}.facts{display:flex;gap:15px;font-size:12px;margin:12px 0;color:rgba(255,255,255,.72)}.facts b{font-weight:500;color:white;margin-left:3px}.weather button{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:white;border-radius:999px;padding:8px 13px;cursor:pointer;transition:.18s}.weather button:hover{background:rgba(255,255,255,.13);transform:translateX(2px)}
@media(max-width:760px){.weather{left:12px;top:75px;width:195px;padding:12px}.summary .sun{font-size:30px}.summary strong{font-size:23px}.facts span:nth-child(n+2){display:none}}
</style>
