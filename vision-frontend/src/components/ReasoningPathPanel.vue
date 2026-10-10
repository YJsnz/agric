<script setup>defineProps({ paths:{type:Array,default:()=>[]} })</script>
<template><div class="path" v-for="(path,i) in paths" :key="i"><template v-if="Array.isArray(path)"><span v-for="(node,j) in path" :key="j">{{ j?' → ':'' }}{{ node }}</span></template><pre v-else>{{ JSON.stringify(path,null,2) }}</pre></div></template>
