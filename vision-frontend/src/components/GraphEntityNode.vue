<script setup>
import { computed } from 'vue'
import { nodeAppearance } from './graphAppearance'
import pear from '../assets/graph/pear.png'
import wheat from '../assets/graph/wheat.png'
import jujube from '../assets/graph/jujube.png'
import vegetable from '../assets/graph/vegetables.png'
const props=defineProps({node:{type:Object,required:true},crop:String,x:Number,y:Number,active:Boolean})
defineEmits(['select'])
const style=computed(()=>nodeAppearance(props.node,props.crop))
const photo=computed(()=>props.node.type==='Crop'?({pear,wheat,jujube,vegetable})[props.crop]:null)
const name=computed(()=>String(props.node.name||props.node.id||''))
const lines=computed(()=>{
  const chars=Array.from(name.value),rows=[]
  for(let i=0;i<chars.length;i+=6) rows.push(chars.slice(i,i+6).join(''))
  return rows.slice(0,3).map((row,i)=>i===2&&rows.length>3?row.slice(0,5)+'…':row)
})
</script>
<template>
  <g class="entity-node" :class="{active}" :transform="`translate(${x},${y})`" role="button" tabindex="0" :aria-label="`探索 ${name}`" @click="$emit('select')" @keydown.enter.prevent="$emit('select')" @keydown.space.prevent="$emit('select')">
    <circle v-if="active" r="60" :fill="style.fill" opacity=".5"/>
    <circle class="node-disc" :r="active?51:43" :fill="style.fill" :stroke="style.stroke" :stroke-width="active?2.5:1.4"/>
    <svg v-if="photo" x="-22" y="-36" width="44" height="44" viewBox="0 0 44 44" style="clip-path:circle(50%)"><image :href="photo" width="44" height="44" preserveAspectRatio="xMidYMid slice"/></svg>
    <text v-else class="node-icon" y="-10" aria-hidden="true">{{style.icon}}</text>
    <text class="node-title"><tspan v-for="(line,index) in lines" :key="index" x="0" :y="(photo?20:8)+index*13">{{line}}</tspan></text>
    <title>{{name}} · {{node.type||'知识实体'}}</title>
  </g>
</template>
<style scoped>
.entity-node{cursor:pointer;outline:none}.node-disc{filter:drop-shadow(0 3px 5px #21423812);transition:stroke-width .15s,filter .15s}.entity-node:hover .node-disc,.entity-node:focus-visible .node-disc{stroke-width:3;filter:drop-shadow(0 4px 7px #21423830)}text{text-anchor:middle;pointer-events:none}.node-icon{font-size:25px;font-family:'Segoe UI Emoji','Apple Color Emoji',sans-serif}.node-title{fill:#214238;font-size:11px;font-weight:500}.active .node-title{font-weight:600}@media(prefers-reduced-motion:reduce){.node-disc{transition:none}}
</style>
