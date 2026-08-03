<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BusinessModule } from '@/types'
import { farmZones, irrigationUnits, sceneEntities } from '@/data/farm'
import SceneEntityLabel from './SceneEntityLabel.vue'

const props = defineProps<{
  selectedId: string | null
  activeModule: BusinessModule
  activeSubLayer: string
  scale: number
  offsetX: number
  offsetY: number
}>()
const emit = defineEmits<{
  (event: 'select', id: string | null): void
  (event: 'focus', id: string): void
}>()
const hoveredId = ref<string | null>(null)

const hoveredZone = computed(() => farmZones.find(zone => zone.entityId === hoveredId.value))
const hoveredEntity = computed(() => sceneEntities.find(entity => entity.id === hoveredId.value))

const visibleEntities = computed(() => {
  if (props.activeModule === 'monitoring') return sceneEntities.filter(entity => ['greenhouse','field'].includes(entity.type))
  if (props.activeModule === 'environment') return []
  if (props.activeModule === 'devices') {
    return sceneEntities.filter(entity => {
      if (props.activeSubLayer === 'offline') return entity.status === 'offline' || entity.id === 'fertilizer-01'
      if (props.activeSubLayer === 'sensors') return entity.type === 'station' || entity.id === 'camera-03'
      if (props.activeSubLayer === 'actuators') return entity.type === 'device' || entity.type === 'robot'
      return ['device','robot','station','camera'].includes(entity.type)
    })
  }
  if (props.activeModule === 'irrigation') return []
  if (props.activeModule === 'crops') return sceneEntities.filter(entity => ['field','greenhouse'].includes(entity.type))
  if (props.activeModule === 'alerts') return sceneEntities.filter(entity => entity.status !== 'normal')
  return sceneEntities
})

function zonePoints(points: Array<[number, number]>) { return points.map(point => point.join(',')).join(' ') }
function setHover(id: string | null) {
  if (hoveredId.value === id) return
  hoveredId.value = id
}
</script>

<template>
  <div class="aerial" @click="$emit('select', null)">
    <div class="scene-plane" :style="{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})` }">
      <svg class="scene-image" viewBox="0 0 1535 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <image href="/assets/farm-aerial.png" width="1535" height="1024" />
      </svg>

      <svg v-if="activeModule === 'irrigation'" class="pipes" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path class="main" d="M15 72 C27 70 34 75 43 65 S58 59 67 49 S78 46 84 35"/>
        <path d="M43 65 L35 50 M57 59 L53 40 M68 49 L62 31 M70 51 L77 64"/>
      </svg>
      <div v-if="activeModule === 'monitoring'" class="monitoring-hint"><i></i><span><strong>园区监控选择</strong><small>选择任意温室或种植区查看实时监控</small></span></div>
      <div v-if="activeModule === 'irrigation'" class="irrigation-units">
        <button v-for="unit in irrigationUnits" :key="unit.id" :class="[{running:unit.enabled},unit.kind]" :style="{left:unit.x+'%',top:unit.y+'%'}" @click.stop="$emit('select',unit.entityId)">
          <span><svg viewBox="0 0 24 24"><path d="M12 3c3.5 4.7 5.5 7.3 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 10.3 8.5 7.7 12 3Z"/><path d="M9 15c.7 1.1 1.6 1.6 3 1.6"/></svg></span><b>{{ unit.name }}</b><small>{{ unit.enabled ? '运行中' : '已关闭' }}</small>
        </button>
      </div>
      <div v-if="activeModule === 'alerts'" class="alerts-layer"><i class="alert-ring field"></i><i class="alert-ring greenhouse"></i></div>

      <svg class="zones" viewBox="0 0 1535 1024" preserveAspectRatio="xMidYMid slice">
        <g
          v-for="zone in farmZones"
          :key="zone.id"
          :class="{
            hovered: hoveredId === zone.entityId,
            selected: selectedId === zone.entityId,
            selectable: activeModule === 'monitoring',
            crop: activeModule === 'crops',
            alert: activeModule === 'alerts' && sceneEntities.find(entity => entity.id === zone.entityId)?.status !== 'normal'
          }"
        >
          <polygon class="zone-shape" :points="zonePoints(zone.polygon)" />
          <polygon
            class="zone-hit"
            :points="zonePoints(zone.polygon)"
            @pointerenter="setHover(zone.entityId)"
            @pointerleave="setHover(null)"
            @click.stop="$emit('select', zone.entityId)"
            @dblclick.stop="$emit('focus', zone.entityId)"
          />
        </g>
      </svg>

      <SceneEntityLabel
        v-for="entity in visibleEntities"
        :key="entity.id"
        :entity="entity"
        :active="selectedId === entity.id"
        @mouseenter="setHover(entity.id)"
        @mouseleave="setHover(null)"
        @select="$emit('select',entity.id)"
        @focus="$emit('focus',entity.id)"
      />

      <Transition name="preview">
        <div v-if="hoveredZone && hoveredEntity" class="zone-preview" :style="{ left: Math.min(82, hoveredEntity.x + 7) + '%', top: Math.max(20, hoveredEntity.y - 7) + '%' }">
          <div class="preview-head"><span>{{ hoveredEntity.type === 'greenhouse' ? '温室' : '地块' }}</span><i :class="hoveredEntity.status"></i></div>
          <strong>{{ hoveredEntity.name }}</strong>
          <dl><div><dt>种植</dt><dd>{{ hoveredZone.crop }}</dd></div><div><dt>面积</dt><dd>{{ hoveredZone.area }}</dd></div><div><dt>阶段</dt><dd>{{ hoveredZone.stage }}</dd></div><div><dt>环境</dt><dd>{{ hoveredZone.environment }}</dd></div></dl>
          <footer><span>健康度</span><b>{{ hoveredEntity.health }}</b><em>单击查看详情 →</em></footer>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
.aerial{position:absolute;inset:0;overflow:hidden;background:#213d2c}.scene-plane{position:absolute;inset:-3%;transition:transform .38s cubic-bezier(.22,.8,.25,1);transform-origin:center;will-change:transform}.scene-image{position:absolute;z-index:0;inset:0;width:100%;height:100%;display:block}.aerial::after{content:"";position:absolute;z-index:20;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,17,13,.08),transparent 25%,transparent 70%,rgba(0,17,13,.12)),linear-gradient(180deg,rgba(0,20,27,.08),transparent 30%,rgba(0,20,12,.17))}
.zones{position:absolute;z-index:7;inset:0;width:100%;height:100%;overflow:hidden;pointer-events:none}.zone-shape{fill:transparent;stroke:transparent;stroke-width:2;vector-effect:non-scaling-stroke;pointer-events:none;transition:fill .08s linear,stroke .08s linear}.zone-hit{fill:rgba(0,0,0,.001);stroke:rgba(0,0,0,.001);stroke-width:18;vector-effect:non-scaling-stroke;pointer-events:all;cursor:pointer}.zones g.hovered .zone-shape{fill:rgba(75,235,108,.2);stroke:#8dffa4;stroke-width:2.5}.zones g.selected .zone-shape{fill:rgba(70,223,99,.16);stroke:#c2ffcb;stroke-width:2}.zones g.selectable .zone-shape{fill:rgba(23,104,74,.1);stroke:rgba(146,255,183,.62);stroke-width:1.5}.zones g.crop .zone-shape{fill:rgba(75,194,90,.08);stroke:rgba(175,255,184,.55);stroke-width:1.5}.zones g.alert .zone-shape{fill:rgba(255,145,39,.18);stroke:#ffb33d;stroke-width:2.5}.zones g.hovered .zone-shape,.zones g.selected.hovered .zone-shape{fill:rgba(75,235,108,.23);stroke:#9affad;stroke-width:3}
.heatmap{position:absolute;inset:0;z-index:3;mix-blend-mode:screen;opacity:.53;background:radial-gradient(circle at 54% 67%,rgba(255,91,37,.63),transparent 13%),radial-gradient(circle at 45% 43%,rgba(231,210,34,.48),transparent 17%),radial-gradient(circle at 63% 48%,rgba(66,226,135,.34),transparent 20%);animation:fade .6s}.heatmap.temperature{filter:hue-rotate(-18deg) saturate(1.2)}.heatmap.airHumidity{filter:hue-rotate(95deg)}.heatmap.light{filter:hue-rotate(15deg) brightness(1.2)}.heatmap.co2{filter:hue-rotate(55deg)}.heatmap i,.heatmap b,.heatmap em{position:absolute;border:1px solid rgba(255,255,255,.5);border-radius:50%;filter:blur(2px)}.heatmap i{width:23%;height:12%;left:43%;top:57%;background:rgba(255,73,28,.22)}.heatmap b{width:28%;height:15%;left:35%;top:27%;background:rgba(230,222,44,.18)}.heatmap em{width:26%;height:16%;left:57%;top:40%;background:rgba(62,226,122,.16)}
.pipes{position:absolute;z-index:5;inset:0;width:100%;height:100%;pointer-events:none}.pipes path{fill:none;stroke:rgba(69,178,202,.9);stroke-width:.34;stroke-linecap:round;vector-effect:non-scaling-stroke}.pipes .main{stroke:#60b9cc;stroke-width:.58}.monitoring-hint{position:absolute;z-index:12;left:50%;top:19%;transform:translateX(-50%);display:flex;align-items:center;gap:9px;padding:9px 13px;border:1px solid rgba(255,255,255,.22);border-radius:12px;background:rgba(7,35,27,.82);color:white}.monitoring-hint i{width:8px;height:8px;border-radius:50%;background:#71e590}.monitoring-hint span{display:flex;flex-direction:column}.monitoring-hint strong{font-size:11px}.monitoring-hint small{font-size:9px;color:rgba(255,255,255,.55);margin-top:2px}.irrigation-units{position:absolute;z-index:13;inset:0;pointer-events:none}.irrigation-units button{position:absolute;transform:translate(-50%,-50%);min-width:112px;display:grid;grid-template-columns:28px 1fr;grid-template-rows:auto auto;column-gap:7px;padding:8px 10px;border:1px solid rgba(139,202,218,.45);border-radius:12px;background:rgba(8,38,42,.9);color:white;text-align:left;pointer-events:auto;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.2)}.irrigation-units button:hover{border-color:#8bd5e4;transform:translate(-50%,-53%)}.irrigation-units button>span{grid-row:1/3;width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#244d54;color:#70cadd}.irrigation-units svg{width:17px;fill:none;stroke:currentColor;stroke-width:1.7}.irrigation-units b{font-size:10px}.irrigation-units small{font-size:8px;color:#9cabb0}.irrigation-units button.running small{color:#75dda0}.alerts-layer{position:absolute;z-index:5;inset:0;pointer-events:none}.alert-ring{position:absolute;border:3px solid #ffb02e;border-radius:50%;box-shadow:0 0 18px #ff842e,0 0 44px rgba(255,107,37,.5);animation:pulse 1.7s ease-out infinite}.alert-ring.field{left:42%;top:56%;width:24%;height:24%}.alert-ring.greenhouse{left:30%;top:38%;width:21%;height:20%;animation-delay:.6s}
.zone-preview{position:absolute;z-index:18;width:236px;padding:13px 14px 11px;color:white;background:rgba(8,35,27,.96);border:1px solid rgba(139,255,164,.28);border-radius:14px;box-shadow:0 12px 28px rgba(0,0,0,.3);pointer-events:none;contain:layout paint}.preview-head{display:flex;justify-content:space-between;color:rgba(255,255,255,.42);font-size:9px;letter-spacing:1px}.preview-head i{width:7px;height:7px;border-radius:50%;background:#58e67c;box-shadow:0 0 8px #58e67c}.preview-head i.warning,.preview-head i.attention{background:#ffae2e;box-shadow:0 0 8px #ffae2e}.zone-preview>strong{display:block;font-size:14px;margin:5px 0 9px}.zone-preview dl{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0;padding:10px 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}.zone-preview dl div{display:flex;flex-direction:column;gap:2px}.zone-preview dt{font-size:8px;color:rgba(255,255,255,.43)}.zone-preview dd{font-size:10px;margin:0}.zone-preview footer{display:flex;align-items:baseline;gap:6px;padding-top:8px}.zone-preview footer span{font-size:9px;color:rgba(255,255,255,.45)}.zone-preview footer b{font-size:17px;color:#8aea9c}.zone-preview footer em{margin-left:auto;font:normal 8px sans-serif;color:#77dc8b}.preview-enter-active,.preview-leave-active{transition:opacity .1s}.preview-enter-from,.preview-leave-to{opacity:0}
@keyframes flow{to{stroke-dashoffset:-2.2}}@keyframes pulse{0%{opacity:.95;transform:scale(.84)}80%,100%{opacity:.08;transform:scale(1.18)}}@keyframes nodePulse{50%{opacity:.48;transform:scale(1.25)}}@keyframes fade{from{opacity:0}}
@media(max-width:900px){.zone-preview{display:none}.zone-shape{stroke-width:2}.monitoring-hint{top:16%}.irrigation-units button{min-width:0}.irrigation-units button b,.irrigation-units button small{display:none}}
</style>
