<script setup lang="ts">
import {computed,ref,onMounted,onBeforeUnmount} from 'vue'
import {transportState as state,transportRoadStatus,transportPosition,transportHeading,transportAnimating} from '@/api/transport'
import {farmZones} from '@/data/farm'
import TransportRoverSprite from './TransportRoverSprite.vue'
import {TransportMotion} from './transportMotion'
const animator=new TransportMotion(),heading=ref(0),motion=ref({leftRoll:0,rightRoll:0,steering:0,bob:0,moving:false,turning:false}),reduced=ref(false)
const props=defineProps<{overview?:boolean;preview?:string[]}>()
const emit=defineEmits<{(e:'open'):void}>()
const aerial=`${import.meta.env.BASE_URL}assets/yantian-orchard-aerial.png`
const position=ref({x:1320,y:348});let frame=0
onMounted(()=>{const tick=(now:number)=>{position.value=transportPosition(now);heading.value=transportHeading(now);const s=state.value;reduced.value=matchMedia('(prefers-reduced-motion:reduce)').matches;motion.value=animator.update(position.value.x,position.value.y,heading.value,now,!!s&&!s.emergency&&transportAnimating(now),s?.mapVersion||0);frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick)})
onBeforeUnmount(()=>cancelAnimationFrame(frame))
// A modest depth cue keeps distant vehicles proportionate to the aerial background.
const markerScale=computed(()=>Math.max(.62,Math.min(.82,.62+(position.value.y-300)/2000))*(props.overview?2:1))
const markerOffset=computed(()=>Math.max(0,Math.min(90,(position.value.x-1240)*.75)))
const point=(id:string)=>state.value?.stops.find(n=>n.id===id)||{x:0,y:0,id,name:id}
const roadLegal=(id:string)=>transportRoadStatus.value.find(r=>r.id===id)?.legal===true
const roads=computed(()=>state.value?.roads.filter(r=>roadLegal(r.id))||[])
const active=computed(()=>state.value?.tasks.find(t=>['RUNNING','BLOCKED','PAUSED','WAIT_LOAD','WAIT_UNLOAD'].includes(t.status)))
const route=computed(()=>props.preview?.length?props.preview:active.value?.route||[])
const validRoute=computed(()=>route.value.every((id,i)=>i===0||roads.value.some(r=>!r.blocked&&((r.a===id&&r.b===route.value[i-1])||(r.b===id&&r.a===route.value[i-1])))))
const routePoints=computed(()=>validRoute.value?route.value.map(id=>`${point(id).x},${point(id).y}`).join(' '):'')
const docks=['pear1','pear2','pear3','wheat','jujube','vegetable','supply','warehouse','charge']
const dockStops=computed(()=>state.value?.stops.filter(s=>docks.includes(s.id))||[])
</script>
<template>
 <div v-if="state" class="transport-layer" :class="{overview}">
  <svg class="transport-map" :viewBox="overview?'0 220 1536 804':'0 0 1536 1024'" preserveAspectRatio="xMidYMid meet" aria-label="道路标定地图与自动运输车">
   <template v-if="overview"><image :href="aerial" width="1536" height="1024"/><rect x="0" y="220" width="1536" height="804" fill="#f4f8f3" opacity=".32"/><g class="parcels"><polygon v-for="zone in farmZones" :key="zone.id" :points="zone.polygon.map(p=>p.join(',')).join(' ')"/></g></template>
   <g class="roads"><line v-for="road in roads" :key="road.id" :class="{closed:road.blocked}" :x1="point(road.a).x" :y1="point(road.a).y" :x2="point(road.b).x" :y2="point(road.b).y"><title>{{point(road.a).id}} → {{point(road.b).id}}</title></line></g>
   <polyline v-if="routePoints" :points="routePoints" class="route-underlay"/>
   <polyline v-if="routePoints" :points="routePoints" class="planned-route" :class="{moving:active?.status==='RUNNING'&&!preview?.length}"/>
   <g v-for="stop in dockStops" :key="stop.id" class="stop"><circle :cx="stop.x" :cy="stop.y" :r="route.includes(stop.id)?5:3"><title>{{stop.name}}</title></circle><text v-if="overview&&[route[0],route[route.length-1],'warehouse','charge'].includes(stop.id)&&Math.hypot(position.x-stop.x,position.y-stop.y)>30" :x="stop.x" :y="stop.y-15">{{stop.name.replace('装卸点','').replace('采后仓库装卸口','采后仓库')}}</text></g>
   <g v-for="obstacle in state.obstacles" :key="obstacle.id"><circle :cx="obstacle.x" :cy="obstacle.y" :r="obstacle.radius+5" class="obstacle-margin"/><circle :cx="obstacle.x" :cy="obstacle.y" :r="obstacle.radius" class="obstacle"/></g>
   <g class="cart-position" :class="{stopped:state.emergency}" :transform="`translate(${position.x} ${position.y})`" @click.stop="emit('open')" role="button" tabindex="0" aria-label="打开自动运输车控制" @keydown.enter="emit('open')" @keydown.space.prevent="emit('open')">
    <circle r="5" class="safety-envelope"/>
    <path v-if="markerOffset>1" :d="`M0-5H${-markerOffset}`" class="marker-leader"/><g :transform="`translate(${-markerOffset} 0) scale(${markerScale})`" class="rover-marker">
     <ellipse cy="-5" rx="28" ry="5" class="rover-shadow"/>
     <rect x="-44" y="-72" width="88" height="92" class="cart-hit" :transform="`scale(${1/markerScale})`"/>
     <TransportRoverSprite :heading="heading" :motion="motion" :reduced="reduced" :loaded="!!active?.loaded"/>
     <path :transform="`translate(0 -2) rotate(${heading*180/Math.PI})`" d="M5 0h10m-4-3 4 3-4 3" class="heading-arrow"/><text y="15" class="cart-name" :style="{fontSize:(overview?12:12/markerScale)+'px'}">运输车 01</text>
    </g><title>{{state.emergency?'已急停':'点击打开运输控制'}}</title>
   </g>
  </svg>
  <div v-if="overview" class="map-legend"><span><i/>可通行道路</span><span><i class="route"/>任务路线</span><span><i class="closed"/>封闭路段</span><small>沿底图道路标定 · 田地禁止驶入</small></div>
 </div>
</template>
<style scoped>
.transport-layer{position:absolute;inset:0;pointer-events:none;z-index:16}.transport-map{display:block;width:100%;height:100%;overflow:visible}.transport-layer.overview{position:relative;border:1px solid #dfe9e2;border-radius:13px;overflow:hidden;background:#f2f7f3}.overview .transport-map{height:auto;aspect-ratio:1536/804}.parcels polygon{fill:#8faf8020;stroke:#7f9e8555;stroke-width:1;vector-effect:non-scaling-stroke}.roads line{stroke:#f0f5df;stroke-width:1.25;stroke-opacity:.55;stroke-linecap:round;vector-effect:non-scaling-stroke}.overview .roads line{stroke:#456c59;stroke-opacity:.65}.roads line.closed{stroke:#cb8a61;stroke-dasharray:3 4;stroke-opacity:.85}.route-underlay{stroke:#f6fff2;stroke-opacity:.8;stroke-width:4;fill:none;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}.planned-route{stroke:#36765d;stroke-width:1.8;fill:none;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke}.planned-route.moving{stroke-dasharray:5 3;animation:route-flow 1.2s linear infinite}.stop circle{fill:#f4faf2;stroke:#477862;stroke-width:1;vector-effect:non-scaling-stroke}.stop text{font:500 18px var(--font-sans);fill:#2b5b48;text-anchor:middle;paint-order:stroke;stroke:#f6faf0;stroke-width:5;stroke-linejoin:round}.cart-position{pointer-events:auto;cursor:pointer;outline:none}.cart-hit{fill:transparent}.safety-envelope{fill:#e1f0d130;stroke:#8aaa74;stroke-width:.5}.cart-name{font:600 12px var(--font-sans);fill:white;text-anchor:middle;paint-order:stroke;stroke:#245f4d;stroke-width:4;stroke-linejoin:round}.marker-leader{fill:none;stroke:#e6f5de;stroke-width:1;stroke-dasharray:3 3;vector-effect:non-scaling-stroke}.heading-arrow{fill:none;stroke:#d9f3c4;stroke-width:1;stroke-linecap:round}.rover-shadow{fill:#17392f44;filter:blur(2px)}.rover-image{filter:drop-shadow(0 3px 3px #17382f55)}.cart-position:focus-visible .rover-image{filter:drop-shadow(0 0 4px #fff3b2)}.stopped .cart-name{stroke:#9b684c}.obstacle{fill:#c88b59;stroke:white;stroke-width:1}.obstacle-margin{fill:#dfad7622;stroke:#c99162;stroke-width:1;stroke-dasharray:3 4}.map-legend{padding:12px 14px;display:flex;align-items:center;gap:17px;background:#f7faf7;border-top:1px solid #e4ece5;font-size:10px;color:#708a79;flex-wrap:wrap}.map-legend span{display:flex;align-items:center;gap:6px}.map-legend i{width:15px;height:1px;background:#7e9987}.map-legend .route{height:2px;background:#36765d}.map-legend .closed{background:#c88b59}.map-legend small{margin-left:auto;font-size:9px;color:#93a396}@keyframes route-flow{to{stroke-dashoffset:-16}}@media(prefers-reduced-motion:reduce){.planned-route.moving{animation:none}}@media(max-width:600px){.map-legend{gap:10px;padding:9px}.map-legend small{margin-left:0;flex-basis:100%}.overview .stop text{font-size:23px}}
</style>
