<script setup lang="ts">
import {ref,onMounted,onBeforeUnmount,watch} from 'vue'
import rover from '@/assets/transport/rover-side-v2.png'
import {acquireTransportSprite} from './transportSpriteRenderer'
import type {MotionFrame} from './transportMotion'
const props=defineProps<{heading:number;motion:MotionFrame;reduced:boolean;loaded:boolean}>()
const canvas=ref<HTMLCanvasElement>(),ready=ref(false),direction=ref(0)
let surface:Awaited<ReturnType<typeof acquireTransportSprite>>|undefined,lastDraw=-Infinity,lastPose='',transitioning=false,disposed=false
function draw(force=false){
 const now=performance.now()
 if(!surface||!canvas.value||(!force&&now-lastDraw<33))return
 const pose=[props.heading,props.motion.leftRoll,props.motion.rightRoll,props.motion.steering,props.reduced?0:props.motion.bob].map(v=>v.toFixed(3)).join(':')+props.loaded
 if(!force&&pose===lastPose&&!transitioning)return
 lastPose=pose
 const result=surface.draw(canvas.value,props.heading,props.motion,props.reduced,props.loaded);transitioning=result.transitioning;direction.value=result.direction;lastDraw=now;ready.value=true
}
onMounted(async()=>{try{const next=await acquireTransportSprite();if(disposed){next.release();return}surface=next;draw(true)}catch(error){console.warn('运输车方向标记不可用',error)}})
watch(()=>[props.heading,props.motion,props.loaded,props.reduced],()=>draw())
onBeforeUnmount(()=>{disposed=true;surface?.release()})
</script>
<template><g class="rover-sprite" :data-moving="motion.moving" :data-turning="motion.turning" :data-body-heading="heading.toFixed(4)" :data-direction-frame="direction" :data-wheel-phase="motion.leftRoll.toFixed(3)" :data-wheel-right-phase="motion.rightRoll.toFixed(3)" :data-steering="motion.steering.toFixed(4)">
 <image v-if="!ready" :href="rover" x="-44" y="-72" width="88" height="72" preserveAspectRatio="xMidYMid meet"/>
 <foreignObject x="-44" y="-64" width="88" height="72" class="rover-body-view">
  <canvas ref="canvas" xmlns="http://www.w3.org/1999/xhtml" width="264" height="216" class="rover-image" aria-label="随道路切换八个朝向的写实运输车"/>
 </foreignObject>
</g></template>
<style scoped>.rover-body-view{overflow:visible;pointer-events:none}.rover-image{display:block;width:88px;height:72px;filter:drop-shadow(0 2px 2px #17382f55)}</style>
