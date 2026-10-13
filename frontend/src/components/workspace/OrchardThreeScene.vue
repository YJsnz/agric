<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { sceneEntities } from '@/data/farm'
const props=defineProps<{selectedId:string|null}>()
const emit=defineEmits<{(e:'select',id:string|null):void}>()
const host=ref<HTMLDivElement>(), failure=ref('')
const labels=ref<Array<{id:string;name:string;x:number;y:number;visible:boolean}>>([])
let renderer:THREE.WebGLRenderer, scene:THREE.Scene, camera:THREE.PerspectiveCamera, controls:OrbitControls, observer:ResizeObserver, frame=0
const surfaces:THREE.Mesh[]=[]
let highlight:THREE.Mesh, lastLabelUpdate=0
const material=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.9})
function box(w:number,h:number,d:number,x:number,z:number,color:number,y=h/2){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function orchard(x:number,z:number,jujube=false){
  const crown=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),material(jujube?0x526d39:0x6e8a45),48)
  const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.14,.2,2.4,6),material(0x927254),48)
  const fruits=new THREE.InstancedMesh(new THREE.SphereGeometry(.17,6,5),material(jujube?0x9b4435:0xe9cc76),96)
  const dummy=new THREE.Object3D();let i=0
  for(let r=0;r<6;r++)for(let c=0;c<8;c++){const px=x-5.7+c*1.65,pz=z-4.8+r*1.9;dummy.position.set(px,2.4,pz);dummy.scale.set(.78,1.05,.8);dummy.updateMatrix();crown.setMatrixAt(i,dummy.matrix);dummy.position.y=1.2;dummy.scale.set(1,1,1);dummy.updateMatrix();trunk.setMatrixAt(i,dummy.matrix);for(let k=0;k<2;k++){dummy.position.set(px+(k?-.4:.4),2.6,pz+.5);dummy.updateMatrix();fruits.setMatrixAt(i*2+k,dummy.matrix)}i++}
  crown.castShadow=true;trunk.castShadow=true;scene.add(crown,trunk,fruits)
}
function wheat(x:number,z:number){const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(.07,.85,.07),material(0xc9af66),600);const d=new THREE.Object3D();for(let r=0;r<20;r++)for(let c=0;c<30;c++){d.position.set(x-6+c*.41,.5,z-5+r*.52);d.updateMatrix();mesh.setMatrixAt(r*30+c,d.matrix)}scene.add(mesh)}
function selectHighlight(){const item=sceneEntities.find(e=>e.id===props.selectedId);if(!highlight||!item?.position3D){if(highlight)highlight.visible=false;return}highlight.visible=true;highlight.position.set(item.position3D.x,.13,item.position3D.z)}
function init(){
  if(!host.value)return
  try{
    scene=new THREE.Scene();scene.background=new THREE.Color(0xd7e2e7);scene.fog=new THREE.Fog(0xd7e2e7,110,200)
    camera=new THREE.PerspectiveCamera(43,1,.1,300);camera.position.set(64,62,74)
    renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.value.appendChild(renderer.domElement)
    scene.add(new THREE.HemisphereLight(0xffffff,0x8e9a79,.85));const sun=new THREE.DirectionalLight(0xfff2da,1.45);sun.position.set(-25,50,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;scene.add(sun)
    box(100,.2,100,0,0,0xc3bc98,0);for(const x of [-34,-8,10,33])box(2,.06,85,x,0,0xb9bbb0,.14);for(const z of [-19,0,18,35])box(85,.06,1.8,0,z,0xb9bbb0,.14)
    box(3,.05,85,38,0,0x6c969f,.15);box(.4,.5,85,36,0,0x929781);box(.4,.5,85,40,0,0x929781)
    for(const e of sceneEntities){if(!e.position3D)continue;const {x,z}=e.position3D;if(e.type==='field'){const m=box(14,.08,12,x,z,e.id.includes('wheat')?0xb9a675:0x879a61,.13);m.userData.id=e.id;surfaces.push(m);if(e.id.includes('wheat'))wheat(x,z);else orchard(x,z,e.id.includes('jujube'))}else if(['yt-sorting','yt-coldstore','yt-soil'].includes(e.id)){const m=box(e.id==='yt-soil'?6:11,3.7,7,x,z,0xf2f0e7);box(e.id==='yt-soil'?6.6:11.6,.35,7.6,x,z,0x758b9a,3.85);m.userData.id=e.id;surfaces.push(m);for(let i=-3;i<=3;i+=3)box(1.6,1.9,.1,x+i,z+3.55,0x7e98a3,1.35)}else if(e.id==='yt-weather'){const m=box(.25,9,.25,x,z,0xc9d4d4);box(3,.2,.3,x,z,0xd8dfde,7.5);m.userData.id=e.id;surfaces.push(m)}else{const m=box(2,1.5,2,x,z,e.type==='water'?0x77959d:0x9daeb0);m.userData.id=e.id;surfaces.push(m)}}
    highlight=new THREE.Mesh(new THREE.PlaneGeometry(14.6,12.6),new THREE.MeshBasicMaterial({color:0x84d5c2,transparent:true,opacity:.25,depthWrite:false}));highlight.rotation.x=-Math.PI/2;scene.add(highlight);selectHighlight()
    controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,2);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=24;controls.maxDistance=130;controls.maxPolarAngle=Math.PI*.46
    observer=new ResizeObserver(()=>{if(!host.value)return;camera.aspect=host.value.clientWidth/host.value.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.value.clientWidth,host.value.clientHeight)});observer.observe(host.value)
    renderer.domElement.addEventListener('pointerdown',rememberPointer);renderer.domElement.addEventListener('pointerup',pick)
    const tick=(time:number)=>{frame=requestAnimationFrame(tick);controls.update();renderer.render(scene,camera);if(time-lastLabelUpdate>100&&host.value){lastLabelUpdate=time;labels.value=sceneEntities.filter(e=>e.position3D && e.type!=='camera' && e.id!=='yt-valve').map(e=>{const p=new THREE.Vector3(e.position3D!.x,4.3,e.position3D!.z).project(camera);return{id:e.id,name:e.name,x:(p.x+1)*50,y:(1-p.y)*50,visible:p.z<1&&Math.abs(p.x)<1&&Math.abs(p.y)<1}})}};tick(0)
  }catch(e){failure.value='3D 初始化失败，可切回实景示意查看地块';renderer?.dispose()}
}
let downX=0,downY=0
function rememberPointer(e:PointerEvent){downX=e.clientX;downY=e.clientY}
function pick(e:PointerEvent){if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)return;const r=renderer.domElement.getBoundingClientRect();const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);emit('select',ray.intersectObjects(surfaces)[0]?.object.userData.id || null)}
function resetView(){camera?.position.set(64,62,74);controls?.target.set(0,0,2)}
function zoomBy(factor:number){if(!camera||!controls)return;const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(factor);if(offset.length()>=24&&offset.length()<=130)camera.position.copy(controls.target).add(offset)}
function focusEntity(id:string){const e=sceneEntities.find(e=>e.id===id);if(e?.position3D&&controls){controls.target.set(e.position3D.x,0,e.position3D.z);camera.position.set(e.position3D.x+18,24,e.position3D.z+25)}}
defineExpose({resetView,zoomBy,focusEntity})
watch(()=>props.selectedId,selectHighlight)
onMounted(init)
onBeforeUnmount(()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();if(renderer){renderer.domElement.removeEventListener('pointerdown',rememberPointer);renderer.domElement.removeEventListener('pointerup',pick)}scene?.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()}});renderer?.dispose()})
</script>
<template><div class="orchard-three"><div ref="host" class="canvas-host" /><div class="three-labels"><button v-for="label in labels.filter(l=>l.visible)" :key="label.id" :style="{left:label.x+'%',top:label.y+'%'}" :class="{selected:selectedId===label.id}" @click="emit('select',label.id)">{{ label.name }}</button></div><p v-if="failure" class="three-help">{{ failure }}</p><p v-else class="three-help">拖动旋转 · 滚轮缩放 · 点击地块查看档案｜盐碱地示范场景，未经 GIS 校准</p></div></template>
<style scoped>.orchard-three,.canvas-host{position:absolute;inset:0}.three-labels{position:absolute;inset:0;pointer-events:none}.three-labels button{position:absolute;transform:translate(-50%,-50%);border:1px solid #ffffff66;border-radius:8px;padding:7px 10px;background:#203c37cc;color:#fff;font-size:10px;pointer-events:auto;cursor:pointer;backdrop-filter:blur(6px)}.three-labels button.selected{background:#477c64;border-color:#a0e5c0}.three-help{position:absolute;bottom:110px;left:180px;padding:7px 12px;border-radius:9px;font-size:10px;color:#3e535a;background:#ffffffb3;pointer-events:none}@media(max-width:700px){.three-labels button{font-size:10px;padding:5px}.three-help{left:12px;bottom:145px;font-size:10px;max-width:290px}}</style>
