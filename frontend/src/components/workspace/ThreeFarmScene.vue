<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { BusinessModule } from '@/types'
import { sceneEntities } from '@/data/farm'

const props = defineProps<{ activeModule: BusinessModule; activeSubLayer: string; selectedId: string | null; drawerOpen?: boolean; overlayOpen?: boolean }>()
const emit = defineEmits<{ (event: 'select', id: string | null): void; (event: 'module', module: BusinessModule): void; (event: 'walk', active: boolean): void }>()
const host = ref<HTMLDivElement>()
const loading = ref(true)
const progress = ref(0)
const loadingText = ref('正在初始化数字孪生…')
const walkMode = ref(false)
const pointerLocked = ref(false)
const farmTime = ref('--:--:--')
const dayPeriod = ref('同步时间')

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let controls: OrbitControls | undefined
let fpsControls: PointerLockControls | undefined
let frame = 0
let raycastTargets: THREE.Object3D[] = []
const animated: Array<{ object: THREE.Object3D; kind: string; seed?: number }> = []
const moduleLayers: Partial<Record<BusinessModule, THREE.Group>> = {}
const entityObjects = new Map<string, THREE.Object3D>()
let hoverHelper: THREE.Box3Helper | undefined
let selectHelper: THREE.Box3Helper | undefined
let hoveredObjectId: string | null = null
let pointerPickScheduled = false
let lastWalkPick = 0
type WalkCollider = { id:string; minX:number; maxX:number; minZ:number; maxZ:number }
const walkColliders:WalkCollider[]=[]
let selectionMarkerGroup:THREE.Group|undefined
let selectionMarkerTexture:THREE.CanvasTexture|undefined
let savedCameraFov=42
let unlockingForOverlay=false
const clock = new THREE.Clock()
let elapsedTime = 0
const pressedKeys = new Set<string>()
const savedCameraPosition = new THREE.Vector3()
const savedControlTarget = new THREE.Vector3()
let roadMaterial: THREE.MeshStandardMaterial | undefined
let curbMaterial: THREE.MeshStandardMaterial | undefined
let roadMarkMaterial: THREE.MeshStandardMaterial | undefined
let hemisphere: THREE.HemisphereLight | undefined
let sun: THREE.DirectionalLight | undefined
let cloudField: THREE.Points | undefined
let starField: THREE.Points | undefined
let lastClockSecond = -1
let lastShadowMinute = -1
let normalPixelRatio = 1

type CropKind = 'tomato' | 'strawberry' | 'cucumber' | 'seedling' | 'leafy' | 'goldTomato'

const greenhouseCrops: Record<string, CropKind> = {
  'gh-01': 'tomato',
  'gh-02': 'strawberry',
  'gh-03': 'cucumber',
  'gh-04': 'seedling',
  'gh-05': 'goldTomato',
  'gh-06': 'leafy'
}
const moduleShortcuts: Record<string, BusinessModule> = {
  Digit1: 'overview', Digit2: 'monitoring', Digit3: 'environment', Digit4: 'devices',
  Digit5: 'irrigation', Digit6: 'crops', Digit7: 'alerts'
}

const cropGeometry = {
  stem: new THREE.CylinderGeometry(.025, .035, .62, 6),
  leaf: new THREE.SphereGeometry(.13, 7, 5),
  fruit: new THREE.SphereGeometry(.075, 8, 6),
  berry: new THREE.ConeGeometry(.075, .12, 8),
  cucumber: new THREE.CapsuleGeometry(.045, .2, 4, 7)
}
const cropMaterial = {
  stem: new THREE.MeshStandardMaterial({ color: 0x39723c, roughness: .9 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x55a849, roughness: .88 }),
  leafDark: new THREE.MeshStandardMaterial({ color: 0x347d3d, roughness: .9 }),
  tomato: new THREE.MeshStandardMaterial({ color: 0xd94a35, roughness: .62 }),
  goldTomato: new THREE.MeshStandardMaterial({ color: 0xf2a934, roughness: .62 }),
  strawberry: new THREE.MeshStandardMaterial({ color: 0xe94735, roughness: .72 }),
  cucumber: new THREE.MeshStandardMaterial({ color: 0x4c913c, roughness: .8 }),
  seedling: new THREE.MeshStandardMaterial({ color: 0x78c858, roughness: .9 })
}

const modelAssets = [
  { url: '/platform/assets/models/small-farm.glb', position: [-26, 0, -21] as const, size: 9, rotation: .08, id: 'farm-house' },
  { url: '/platform/assets/models/big-barn.glb', position: [25, 0, -20] as const, size: 9, rotation: -1.55, id: 'warehouse-01' },
  { url: '/platform/assets/models/farm-building-a.glb', position: [26, 0, -2] as const, size: 7, rotation: -1.55, id: 'pump-room' },
  { url: '/platform/assets/models/farm-building-b.glb', position: [-26, 0, -2] as const, size: 7, rotation: .05, id: 'service-center' },
  { url: '/platform/assets/models/barn.glb', position: [23, 0, 20] as const, size: 7, rotation: Math.PI, id: 'barn-01' },
  { url: '/platform/assets/models/silo.glb', position: [-25, 0, 22] as const, size: 5.5, rotation: 0, id: 'silo-01' },
  { url: '/platform/assets/models/round-rover.glb', position: [10, 0, 21] as const, size: 2.2, rotation: -Math.PI/2, id: 'robot-01' }
]

const spatialLayout: Record<string, [number, number, number]> = {
  // 航拍图中 1→6 号温室由左前方向右后方递进，5号位于右前方独立区域。
  'gh-01': [-12, 0, 6], 'gh-02': [-8, 0, 0], 'gh-03': [-4, 0, -6],
  'gh-04': [0, 0, -12], 'gh-06': [4, 0, -18], 'gh-05': [8, 0, 6],
  // 航拍图下方为露天种植区，水池在西南，设备集中在东侧和南侧道路。
  'field-04': [-3, 0, 15], 'field-05': [14, 0, 15],
  'weather-01': [-22, 0, -11], 'water-01': [-25, 0, 17],
  'fertilizer-01': [15, 0, -8], 'valve-02': [-10, 0, 23],
  'pump-02': [2, 0, 21], 'camera-03': [17, 0, 21], 'robot-01': [10, 0, 21]
}

function entityPosition(id: string, fallback: [number, number, number]): [number, number, number] {
  if (spatialLayout[id]) return spatialLayout[id]
  const position = sceneEntities.find(entity => entity.id === id)?.position3D
  return position ? [position.x, position.y, position.z] : fallback
}

function addWalkCollider(id:string,minX:number,maxX:number,minZ:number,maxZ:number){
  const existing=walkColliders.findIndex(item=>item.id===id);const collider={id,minX,maxX,minZ,maxZ}
  if(existing>=0)walkColliders[existing]=collider;else walkColliders.push(collider)
}
function addBoxCollider(id:string,box:THREE.Box3,padding=.18){
  addWalkCollider(id,box.min.x-padding,box.max.x+padding,box.min.z-padding,box.max.z+padding)
}
function walkPositionBlocked(x:number,z:number){
  const radius=.38
  return walkColliders.some(item=>x+radius>item.minX&&x-radius<item.maxX&&z+radius>item.minZ&&z-radius<item.maxZ)
}

function ensureSelectionMarkerTexture(){
  if(selectionMarkerTexture)return selectionMarkerTexture
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d')!
  const glow=ctx.createRadialGradient(64,52,6,64,58,58);glow.addColorStop(0,'rgba(255,90,74,.72)');glow.addColorStop(1,'rgba(255,45,35,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,128,128)
  ctx.fillStyle='#ff493d';ctx.strokeStyle='rgba(255,238,232,.95)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(64,104);ctx.lineTo(31,42);ctx.quadraticCurveTo(64,25,97,42);ctx.closePath();ctx.fill();ctx.stroke()
  selectionMarkerTexture=new THREE.CanvasTexture(canvas);selectionMarkerTexture.colorSpace=THREE.SRGBColorSpace;return selectionMarkerTexture
}

function selectableIds(module:BusinessModule){
  const greenhouses=['gh-01','gh-02','gh-03','gh-04','gh-05','gh-06'];const fields=['field-04','field-05']
  if(module==='monitoring')return [...greenhouses,...fields,'camera-03']
  if(module==='environment')return ['weather-01',...fields]
  if(module==='devices')return ['fertilizer-01','valve-02','pump-02','camera-03','robot-01']
  if(module==='irrigation')return ['water-01','valve-02','pump-02','fertilizer-01',...fields]
  if(module==='crops')return [...greenhouses,...fields]
  if(module==='alerts')return ['field-04','gh-02','fertilizer-01']
  return props.selectedId?[props.selectedId]:[]
}

function refreshSelectionMarkers(){
  if(!scene)return
  if(!selectionMarkerGroup){selectionMarkerGroup=new THREE.Group();selectionMarkerGroup.name='walk-selection-markers';scene.add(selectionMarkerGroup)}
  selectionMarkerGroup.children.forEach(child=>(child as THREE.Sprite).material?.dispose());selectionMarkerGroup.clear();selectionMarkerGroup.visible=walkMode.value
  if(!walkMode.value)return
  selectableIds(props.activeModule).forEach((id,index)=>{
    const object=entityObjects.get(id);if(!object)return
    const box=new THREE.Box3().setFromObject(object);if(box.isEmpty())return
    const material=new THREE.SpriteMaterial({map:ensureSelectionMarkerTexture(),transparent:true,depthTest:false,depthWrite:false,opacity:.92})
    const marker=new THREE.Sprite(material);const selected=id===props.selectedId;marker.scale.setScalar(.12)
    marker.position.set((box.min.x+box.max.x)/2,box.max.y+(selected?.92:.68),(box.min.z+box.max.z)/2);marker.userData.baseY=marker.position.y;marker.userData.seed=index*.7;marker.userData.targetScale=selected?1.05:.78;marker.renderOrder=20;selectionMarkerGroup!.add(marker)
  })
}

function createCanvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, repeat = 1) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')!
  draw(ctx, 512)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeat, repeat)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer?.capabilities.getMaxAnisotropy() || 1
  return texture
}

function createCropPlant(kind: CropKind, index = 0) {
  const group = new THREE.Group()
  const addLeaf = (x: number, y: number, z: number, scale = 1, material = cropMaterial.leaf) => {
    const leaf = new THREE.Mesh(cropGeometry.leaf, material)
    leaf.position.set(x, y, z)
    leaf.scale.set(1.25 * scale, .42 * scale, .7 * scale)
    leaf.rotation.y = Math.atan2(z, x)
    leaf.rotation.z = -.18 + (index % 3) * .1
    group.add(leaf)
  }
  if (kind === 'leafy') {
    for (let i = 0; i < 7; i++) {
      const angle = i / 7 * Math.PI * 2
      addLeaf(Math.cos(angle) * .09, .13 + (i % 2) * .035, Math.sin(angle) * .09, .9, i % 2 ? cropMaterial.leafDark : cropMaterial.leaf)
    }
    group.scale.setScalar(.92)
    return group
  }
  if (kind === 'seedling') {
    const stem = new THREE.Mesh(cropGeometry.stem, cropMaterial.stem)
    stem.scale.set(.65, .34, .65); stem.position.y = .11; group.add(stem)
    addLeaf(-.055, .22, 0, .62, cropMaterial.seedling)
    addLeaf(.055, .22, 0, .62, cropMaterial.seedling)
    group.scale.setScalar(.72)
    return group
  }
  if (kind === 'strawberry') {
    for (let i = 0; i < 5; i++) {
      const angle = i / 5 * Math.PI * 2
      addLeaf(Math.cos(angle) * .06, .15, Math.sin(angle) * .06, .75, cropMaterial.leafDark)
    }
    const berry = new THREE.Mesh(cropGeometry.berry, cropMaterial.strawberry)
    berry.position.set((index % 2 ? 1 : -1) * .08, .1, .08); berry.rotation.z = Math.PI; group.add(berry)
    return group
  }
  const stem = new THREE.Mesh(cropGeometry.stem, cropMaterial.stem)
  stem.position.y = .31; group.add(stem)
  addLeaf(-.1, .32, .02, .75); addLeaf(.1, .45, -.02, .8, cropMaterial.leafDark)
  if (kind === 'cucumber') {
    const fruit = new THREE.Mesh(cropGeometry.cucumber, cropMaterial.cucumber)
    fruit.position.set(index % 2 ? -.09 : .09, .28, .02); fruit.rotation.z = .18; group.add(fruit)
  } else {
    const fruitMat = kind === 'goldTomato' ? cropMaterial.goldTomato : cropMaterial.tomato
    for (let i = 0; i < 2; i++) {
      const fruit = new THREE.Mesh(cropGeometry.fruit, fruitMat)
      fruit.position.set((i ? 1 : -1) * .075, .25 + i * .08, .04); group.add(fruit)
    }
  }
  return group
}

function addCropBatch(parent: THREE.Group, kind: CropKind, positions: THREE.Vector3[], scale: number) {
  const batches = new Map<string, { geometry: THREE.BufferGeometry; material: THREE.Material; matrices: THREE.Matrix4[] }>()
  positions.forEach((position,index) => {
    const plant = createCropPlant(kind,index)
    plant.position.copy(position);plant.scale.multiplyScalar(scale);plant.updateMatrixWorld(true)
    plant.traverse(object => {
      const mesh = object as THREE.Mesh
      if(!mesh.isMesh || Array.isArray(mesh.material))return
      const key=`${mesh.geometry.uuid}:${mesh.material.uuid}`
      const batch=batches.get(key)||{geometry:mesh.geometry,material:mesh.material,matrices:[]}
      batch.matrices.push(mesh.matrixWorld.clone());batches.set(key,batch)
    })
  })
  batches.forEach(batch=>{
    const mesh=new THREE.InstancedMesh(batch.geometry,batch.material,batch.matrices.length)
    batch.matrices.forEach((matrix,index)=>mesh.setMatrixAt(index,matrix))
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);mesh.receiveShadow=true;parent.add(mesh)
  })
}

function createCropBadge(kind: CropKind) {
  const labels:Record<CropKind,string>={tomato:'番茄',strawberry:'草莓',cucumber:'黄瓜',seedling:'育苗',leafy:'叶菜',goldTomato:'生态番茄'}
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256
  const ctx=canvas.getContext('2d')!;const gradient=ctx.createRadialGradient(92,65,12,128,128,130)
  gradient.addColorStop(0,'#6ecb71');gradient.addColorStop(1,'#194c32');ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(128,128,124,0,Math.PI*2);ctx.fill()
  ctx.save();ctx.translate(128,104);ctx.lineCap='round';ctx.lineJoin='round'
  const leaf=(x:number,y:number,r:number,angle:number)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#78d66c';ctx.beginPath();ctx.ellipse(0,0,r,r*.46,0,0,Math.PI*2);ctx.fill();ctx.restore()}
  if(kind==='cucumber'){
    ctx.rotate(-.25);ctx.fillStyle='#75bc4e';ctx.beginPath();ctx.roundRect(-25,-56,50,112,25);ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';for(let y=-34;y<45;y+=22){ctx.beginPath();ctx.arc(-12,y,3,0,Math.PI*2);ctx.fill()}
  }else if(kind==='seedling'){
    ctx.fillStyle='#b87346';ctx.beginPath();ctx.moveTo(-34,24);ctx.lineTo(28,24);ctx.lineTo(20,66);ctx.lineTo(-25,66);ctx.closePath();ctx.fill();ctx.strokeStyle='#62bc58';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(0,26);ctx.lineTo(0,-32);ctx.stroke();leaf(-18,-24,24,-.4);leaf(18,-38,24,.35)
  }else if(kind==='leafy'){
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;leaf(Math.cos(a)*19,Math.sin(a)*19,34,a)}ctx.fillStyle='#9ae27b';ctx.beginPath();ctx.arc(0,0,23,0,Math.PI*2);ctx.fill()
  }else if(kind==='strawberry'){
    ctx.fillStyle='#ee5144';ctx.beginPath();ctx.moveTo(-45,-30);ctx.bezierCurveTo(-47,20,-20,61,0,72);ctx.bezierCurveTo(25,52,48,15,44,-30);ctx.quadraticCurveTo(0,-54,-45,-30);ctx.fill();for(let i=0;i<10;i++){ctx.fillStyle='#ffe27a';ctx.beginPath();ctx.arc(-26+(i%4)*17,-14+Math.floor(i/4)*23,2.5,0,Math.PI*2);ctx.fill()}leaf(-17,-39,24,-.45);leaf(17,-39,24,.45)
  }else{
    ctx.fillStyle=kind==='goldTomato'?'#f2a735':'#e84e3d';ctx.beginPath();ctx.arc(0,4,58,0,Math.PI*2);ctx.fill();for(let i=0;i<5;i++){const a=i/5*Math.PI*2;leaf(Math.cos(a)*18,-48+Math.sin(a)*10,21,a)}
  }
  ctx.fillStyle='#173d2a';ctx.beginPath();ctx.arc(-16,0,5,0,Math.PI*2);ctx.arc(16,0,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#173d2a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,10,20,.2,Math.PI-.2);ctx.stroke();ctx.restore()
  ctx.fillStyle='rgba(245,255,241,.94)';ctx.font='700 25px sans-serif';ctx.textAlign='center';ctx.fillText(labels[kind],128,226)
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace
  const badge=new THREE.Group();badge.position.set(4.12,1.48,0);badge.rotation.y=Math.PI/2
  const portrait=new THREE.Mesh(new THREE.CircleGeometry(.47,36),new THREE.MeshStandardMaterial({map:texture,roughness:.55,metalness:.02,emissive:0x163b24,emissiveIntensity:.12}))
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.5,.045,8,32),new THREE.MeshStandardMaterial({color:0xd9e5d0,metalness:.65,roughness:.25}))
  badge.add(portrait,rim);return badge
}

function ensureRoadMaterials() {
  if (roadMaterial) return
  const asphalt = createCanvasTexture((ctx, s) => {
    ctx.fillStyle = '#58605d'; ctx.fillRect(0, 0, s, s)
    let seed = 48271
    for (let i = 0; i < 3600; i++) {
      seed = (seed * 16807) % 2147483647; const x = seed % s
      seed = (seed * 16807) % 2147483647; const y = seed % s
      const tone = 70 + seed % 55
      ctx.fillStyle = `rgba(${tone},${tone + 2},${tone},${.08 + (seed % 12) / 100})`
      ctx.fillRect(x, y, 1 + seed % 3, 1 + seed % 2)
    }
    ctx.strokeStyle = 'rgba(38,43,41,.25)'; ctx.lineWidth = 1.2
    for (let i = 0; i < 8; i++) {
      const x = (i * 71 + 43) % s; const y = (i * 117 + 29) % s
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 24, y + 8); ctx.lineTo(x + 36, y - 6); ctx.stroke()
    }
    ctx.fillStyle = 'rgba(30,34,33,.09)'; ctx.fillRect(s * .22, 0, 7, s); ctx.fillRect(s * .72, 0, 6, s)
  }, 4)
  roadMaterial = new THREE.MeshStandardMaterial({ map: asphalt, color: 0xaeb5b1, roughness: .92, metalness: .02 })
  curbMaterial = new THREE.MeshStandardMaterial({ color: 0xc5cabd, roughness: .75 })
  roadMarkMaterial = new THREE.MeshStandardMaterial({ color: 0xe7e3c3, roughness: .72, emissive: 0x3b392a, emissiveIntensity: .05 })
}

function createGround() {
  if (!scene) return
  const grass = createCanvasTexture((ctx, s) => {
    ctx.fillStyle = '#5f843f'; ctx.fillRect(0, 0, s, s)
    let seed = 7123
    for (let i = 0; i < 9000; i++) {
      seed = (seed * 16807) % 2147483647
      const x = seed % s; seed = (seed * 16807) % 2147483647
      const y = seed % s; const light = 26 + seed % 18
      ctx.fillStyle = `hsla(${88 + seed % 20},${30 + seed % 25}%,${light}%,.22)`
      ctx.fillRect(x, y, 1 + seed % 2, 2 + seed % 3)
    }
  }, 7)
  const geometry = new THREE.PlaneGeometry(82, 62, 32, 24)
  const positions = geometry.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i); const y = positions.getY(i)
    const edge = Math.max(Math.abs(x) / 41, Math.abs(y) / 31)
    const rise = Math.max(0, edge - .72) * 8 + Math.sin(x * .18) * Math.cos(y * .16) * .18
    positions.setZ(i, rise)
  }
  geometry.computeVertexNormals()
  const ground = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: grass, roughness: .98, color: 0xb5c796 }))
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.name = 'terrain'; scene.add(ground)

  const underlay = new THREE.Mesh(new THREE.CylinderGeometry(47, 48, 2.2, 64), new THREE.MeshStandardMaterial({ color: 0x334f2f, roughness: 1 }))
  underlay.position.y = -1.35; scene.add(underlay)
}

function createSkyDetails(){
  if(!scene)return
  const cloudCanvas=document.createElement('canvas');cloudCanvas.width=cloudCanvas.height=128;const ctx=cloudCanvas.getContext('2d')!
  const gradient=ctx.createRadialGradient(64,64,8,64,64,60);gradient.addColorStop(0,'rgba(255,255,255,.95)');gradient.addColorStop(.55,'rgba(245,252,249,.72)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128)
  const cloudTexture=new THREE.CanvasTexture(cloudCanvas);const cloudGeometry=new THREE.BufferGeometry();const cloudPositions:number[]=[]
  for(let i=0;i<8;i++){const x=-48+(i*19)%96;const y=17+(i%4)*2.4;const z=-42+(i*29)%78;cloudPositions.push(x,y,z,x+3.8,y+.45,z+.2,x-3.5,y-.25,z-.1)}
  cloudGeometry.setAttribute('position',new THREE.Float32BufferAttribute(cloudPositions,3))
  cloudField=new THREE.Points(cloudGeometry,new THREE.PointsMaterial({map:cloudTexture,size:9.5,transparent:true,opacity:.64,depthWrite:false,color:0xf1faf5,sizeAttenuation:true}));scene.add(cloudField)
  const starPositions:number[]=[];let seed=31991
  for(let i=0;i<280;i++){seed=seed*16807%2147483647;const theta=seed/2147483647*Math.PI*2;seed=seed*16807%2147483647;const radius=65+(seed%1800)/100;seed=seed*16807%2147483647;const y=14+(seed%3800)/100;starPositions.push(Math.cos(theta)*radius,y,Math.sin(theta)*radius)}
  const starGeometry=new THREE.BufferGeometry();starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3))
  starField=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xe8f4ff,size:.22,transparent:true,opacity:0,depthWrite:false}));scene.add(starField)
}

function updateDayNight(force=false){
  if(!scene||!renderer||!sun||!hemisphere)return
  const now=new Date();if(!force&&now.getSeconds()===lastClockSecond)return;lastClockSecond=now.getSeconds()
  farmTime.value=now.toLocaleTimeString('zh-CN',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'})
  const hour=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600
  const solar=Math.sin((hour-6)/12*Math.PI);const daylight=THREE.MathUtils.smoothstep(Math.max(0,solar),0,.78)
  dayPeriod.value=hour<5?'深夜':hour<7?'晨曦':hour<17.5?'日间':hour<19.5?'黄昏':'夜间'
  const phase=(hour-6)/12*Math.PI;sun.position.set(Math.cos(phase)*42,Math.max(3,Math.sin(phase)*43),Math.sin(phase)*18)
  sun.intensity=.08+daylight*3.12;sun.color.set(hour>17&&hour<20?0xffb16e:hour>5&&hour<8?0xffc886:0xfff2d5)
  hemisphere.intensity=.3+daylight*1.95
  const night=new THREE.Color(0x071521);const day=new THREE.Color(0xa6c9cf);const twilight=new THREE.Color(0x8b766e)
  const sky=night.clone().lerp(day,daylight);if((hour>5&&hour<7.3)||(hour>17.3&&hour<20))sky.lerp(twilight,.28)
  scene.background=sky;scene.fog?.color.copy(sky);renderer.toneMappingExposure=.62+daylight*.46
  if(cloudField){const material=cloudField.material as THREE.PointsMaterial;material.opacity=.16+daylight*.52;material.color.set(daylight>.15?0xf2faf5:0x526675)}
  if(starField){const material=starField.material as THREE.PointsMaterial;material.opacity=Math.max(0,.9-daylight*1.6);starField.visible=material.opacity>.02}
  if(now.getMinutes()!==lastShadowMinute){lastShadowMinute=now.getMinutes();renderer.shadowMap.needsUpdate=true}
}

function addRoad(x: number, z: number, width: number, depth: number) {
  if (!scene) return
  ensureRoadMaterials()
  const road = new THREE.Mesh(new THREE.BoxGeometry(width, .09, depth), roadMaterial!)
  road.position.set(x, .05, z); road.receiveShadow = true; scene.add(road)
  if (width > depth) {
    for (const side of [-1,1]) { const curb = new THREE.Mesh(new THREE.BoxGeometry(width,.18,.16),curbMaterial!);curb.position.set(x,.09,z+side*depth/2);scene.add(curb) }
    for (let offset = -width / 2 + 1; offset < width / 2 - .5; offset += 2.4) { const mark = new THREE.Mesh(new THREE.BoxGeometry(1.1,.025,.055),roadMarkMaterial!);mark.position.set(x+offset,.112,z);scene.add(mark) }
  } else {
    for (const side of [-1,1]) { const curb = new THREE.Mesh(new THREE.BoxGeometry(.16,.18,depth),curbMaterial!);curb.position.set(x+side*width/2,.09,z);scene.add(curb) }
    for (let offset = -depth / 2 + 1; offset < depth / 2 - .5; offset += 2.4) { const mark = new THREE.Mesh(new THREE.BoxGeometry(.055,.025,1.1),roadMarkMaterial!);mark.position.set(x,.112,z+offset);scene.add(mark) }
  }
}

function addGreenhouse(x: number, z: number, id: string, rotation = 0) {
  if (!scene) return
  const group = new THREE.Group(); group.position.set(x, 0, z); group.rotation.y = rotation; group.userData.id = id
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xc8eee0, metalness: 0, roughness: .08, transmission: .5, transparent: true, opacity: .52, thickness: .08, side: THREE.DoubleSide, depthWrite: false })
  const metal = new THREE.MeshStandardMaterial({ color: 0xdde4df, metalness: .75, roughness: .28 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(8, 1.8, 3.6), glass); base.position.y = .95; base.castShadow = true; group.add(base)
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 8, 32, 1, false, 0, Math.PI), glass)
  roof.rotation.z = Math.PI/2; roof.position.y = 1.82; roof.castShadow = true; group.add(roof)
  for (let i = -4; i <= 4; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(1.81, .035, 5, 18, Math.PI), metal)
    rib.rotation.y = Math.PI/2; rib.position.set(i, 1.82, 0); group.add(rib)
  }
  for (const side of [-1,1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(8,.06,.06),metal);rail.position.set(0,1.05,side*1.82);group.add(rail)
    for (let i=-4;i<=4;i++){const post=new THREE.Mesh(new THREE.BoxGeometry(.045,1.8,.045),metal);post.position.set(i,.92,side*1.81);group.add(post)}
  }
  for(const end of [-1,1]){const frame=new THREE.Mesh(new THREE.BoxGeometry(.06,1.8,3.62),metal);frame.position.set(end*3.98,.92,0);group.add(frame)}
  const doorFrame=new THREE.Mesh(new THREE.BoxGeometry(.08,1.45,1.05),metal);doorFrame.position.set(4.05,.75,0);group.add(doorFrame)
  const soil = new THREE.MeshStandardMaterial({ color: 0x5a3f27, roughness: 1 })
  const cropKind = greenhouseCrops[id] || 'leafy'
  const cropPositions:THREE.Vector3[]=[]
  for (const side of [-.9,.9]) {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(7.5,.15,.75),soil);bed.position.set(0,.13,side);group.add(bed)
    for(let i=-7;i<=7;i++)cropPositions.push(new THREE.Vector3(i*.48,.2,side))
  }
  const cropScale = cropKind === 'seedling' ? .82 : cropKind === 'strawberry' ? .9 : .78
  addCropBatch(group,cropKind,cropPositions,cropScale)
  const irrigationMat=new THREE.MeshStandardMaterial({color:0x2b9db2,metalness:.5,roughness:.25})
  for(const side of [-1.35,1.35]){const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,7.5,8),irrigationMat);pipe.rotation.z=Math.PI/2;pipe.position.set(0,.42,side);group.add(pipe)}
  const fanFrame = new THREE.Group();fanFrame.position.set(-4.08,1.28,0);fanFrame.rotation.z=Math.PI/2
  const fanRotor = new THREE.Group()
  const fanDark=new THREE.MeshStandardMaterial({color:0x314542,metalness:.72,roughness:.26})
  const fanHub=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.16,16),fanDark);fanRotor.add(fanHub)
  for(let i=0;i<6;i++){
    const angle=i*Math.PI/3
    const blade=new THREE.Mesh(new THREE.BoxGeometry(.12,.06,.46),fanDark)
    blade.position.set(Math.sin(angle)*.23,0,Math.cos(angle)*.23);blade.rotation.y=angle;blade.rotation.z=.2;fanRotor.add(blade)
  }
  const guard=new THREE.Mesh(new THREE.TorusGeometry(.52,.025,7,28),metal);guard.rotation.x=Math.PI/2
  fanFrame.add(fanRotor,guard);group.add(fanFrame);animated.push({object:fanRotor,kind:'fan',seed:Object.keys(greenhouseCrops).indexOf(id)})
  const controller=new THREE.Group();controller.position.set(-4.1,.75,1.15)
  const controllerBody=new THREE.Mesh(new THREE.BoxGeometry(.16,.52,.62),new THREE.MeshStandardMaterial({color:0x53635f,metalness:.38,roughness:.32}))
  const screen=new THREE.Mesh(new THREE.BoxGeometry(.175,.22,.34),new THREE.MeshStandardMaterial({color:0x183934,emissive:0x27c879,emissiveIntensity:.38,roughness:.25}));screen.position.y=.08
  const led=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),new THREE.MeshBasicMaterial({color:0x64f49a}));led.position.set(-.1,-.15,.18)
  const conduit=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.72,7),new THREE.MeshStandardMaterial({color:0x3a4a47,metalness:.55,roughness:.35}));conduit.position.set(0,-.58,0)
  controller.add(controllerBody,screen,led,conduit);group.add(controller);animated.push({object:led,kind:'signal',seed:id.charCodeAt(id.length-1)})
  group.add(createCropBadge(cropKind))
  const gutterMat=new THREE.MeshStandardMaterial({color:0xb8c9c4,metalness:.7,roughness:.3})
  for(const side of [-1,1]){const gutter=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,8.05,8),gutterMat);gutter.rotation.z=Math.PI/2;gutter.position.set(0,1.82,side*1.8);group.add(gutter)}
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(.1,10,7),new THREE.MeshStandardMaterial({color:0xe8fff0,emissive:0x7bff9f,emissiveIntensity:.65}));lamp.position.set(4.16,2.12,.72);group.add(lamp)
  group.traverse(obj => { if ((obj as THREE.Mesh).isMesh) obj.userData.id = id })
  raycastTargets.push(base,roof)
  scene.add(group)
  entityObjects.set(id,group)
  addWalkCollider(id,x-4.28,x+4.28,z-2.08,z+2.08)
  return group
}

function addCropPlot(x: number, z: number, width: number, depth: number, id: string, kind: CropKind) {
  if (!scene) return
  const group = new THREE.Group(); group.position.set(x, .08, z); group.userData.id = id
  const soil = new THREE.Mesh(new THREE.BoxGeometry(width,.14,depth),new THREE.MeshStandardMaterial({color:0x60472f,roughness:1}));soil.userData.id=id;group.add(soil);raycastTargets.push(soil)
  const positions:THREE.Vector3[]=[]
  for(let row=0;row<8;row++) for(let col=0;col<13;col++)positions.push(new THREE.Vector3(-width/2+.45+col*(width-.9)/12,.2,-depth/2+.38+row*(depth-.76)/7))
  addCropBatch(group,kind,positions,.8)
  scene.add(group)
  entityObjects.set(id,group)
  addWalkCollider(id,x-width/2-.15,x+width/2+.15,z-depth/2-.15,z+depth/2+.15)
}

function addTrees() {
  if (!scene) return
  const count = 150
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.08,.11,.65,6),new THREE.MeshStandardMaterial({color:0x5c472f}),count)
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.42,1),new THREE.MeshStandardMaterial({color:0x376b36,roughness:.9}),count)
  const dummy = new THREE.Object3D(); let index=0
  for(let i=0;i<count;i++){
    const edge=i<80; const lane=i%4
    let x,z
    if(edge){const side=i%2?1:-1;x=side*(31+(i%7)*.45);z=-25+(i%40)*1.25}else{x=-27+(i%35)*1.6;z=[-18,-4,10,23][lane] + (i%3)*.25}
    if(Math.abs(x)<19 && z>-23 && z<22) continue
    const s=.75+(i%5)*.08;dummy.position.set(x,.35*s,z);dummy.scale.set(s,s,s);dummy.updateMatrix();trunks.setMatrixAt(index,dummy.matrix)
    dummy.position.y=.95*s;dummy.scale.set(s,1.15*s,s);dummy.updateMatrix();crowns.setMatrixAt(index,dummy.matrix);index++
  }
  trunks.count=crowns.count=index;trunks.castShadow=crowns.castShadow=true;scene.add(trunks,crowns)
}

function addWaterAndEquipment() {
  if (!scene) return
  const waterMat = new THREE.MeshPhysicalMaterial({ color:0x1f9bb1,roughness:.1,metalness:.05,transmission:.08,transparent:true,opacity:.92 })
  const waterPosition=entityPosition('water-01',[-26,0,14]);const water = new THREE.Mesh(new THREE.BoxGeometry(10,.35,7),waterMat);water.position.set(waterPosition[0],.02,waterPosition[2]);water.userData.id='water-01';raycastTargets.push(water);scene.add(water)
  entityObjects.set('water-01',water)
  addWalkCollider('water-01',waterPosition[0]-5.25,waterPosition[0]+5.25,waterPosition[2]-3.75,waterPosition[2]+3.75)
  const rimMat=new THREE.MeshStandardMaterial({color:0xc6c9ba,roughness:.75})
  for(const [x,z,w,d] of [[-25,13.5,10.5,.3],[-25,20.5,10.5,.3],[-30,17,.3,7.3],[-20,17,.3,7.3]]){const rim=new THREE.Mesh(new THREE.BoxGeometry(w,.45,d),rimMat);rim.position.set(x,.12,z);scene.add(rim)}
  const tower=new THREE.Group();const steel=new THREE.MeshStandardMaterial({color:0x91a4a3,metalness:.75,roughness:.3});const tank=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,3,20),steel);tank.position.y=5;tower.add(tank)
  for(const [x,z] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,4,6),steel);leg.position.set(x,2,z);tower.add(leg)}tower.position.set(26,0,7);scene.add(tower)
  const irrigation=moduleLayers.irrigation=new THREE.Group();const pipeMat=new THREE.MeshStandardMaterial({color:0x3b8fa1,metalness:.15,roughness:.62})
  const pipeSegments=[[ -22,17,6,.12],[-19,13.5,.12,7],[0,10,38,.12],[-12,8,.12,4],[-8,5,.12,10],[-4,2,.12,16],[0,-1,.12,22],[4,-4,.12,28],[8,8,.12,4]]
  for(const [x,z,w,d] of pipeSegments){const pipe=new THREE.Mesh(new THREE.BoxGeometry(w,.11,d),pipeMat);pipe.position.set(x,.25,z);pipe.userData.category='network';irrigation.add(pipe)}
  for(const [x,z] of [[-19,14],[0,10],[4,-8]]){const flow=new THREE.Mesh(new THREE.SphereGeometry(.19,12,8),new THREE.MeshBasicMaterial({color:0xb9fbff}));flow.position.set(x,.37,z);flow.userData.category='flow';irrigation.add(flow);animated.push({object:flow,kind:'flow',seed:x})}
  for(const [x,z] of [[-12,8],[-4,2],[8,8]]){const plan=new THREE.Mesh(new THREE.CylinderGeometry(.26,.31,.25,16),new THREE.MeshStandardMaterial({color:0xf7c75b,emissive:0x6d4810,emissiveIntensity:.4}));plan.position.set(x,.35,z);plan.userData.category='plans';irrigation.add(plan)}
  scene.add(irrigation);irrigation.visible=false
  animated.push({object:water,kind:'water'})

  const machineSteel=new THREE.MeshStandardMaterial({color:0x7d9695,metalness:.72,roughness:.28});const machineBlue=new THREE.MeshStandardMaterial({color:0x287f9a,metalness:.36,roughness:.35});const machineDark=new THREE.MeshStandardMaterial({color:0x263b3b,metalness:.55,roughness:.3})
  const valvePosition=entityPosition('valve-02',[-10,0,23]);const gate=new THREE.Group();gate.position.set(...valvePosition);gate.userData.id='valve-02'
  const gateBase=new THREE.Mesh(new THREE.BoxGeometry(2.5,.22,1.35),new THREE.MeshStandardMaterial({color:0xaab8b2,roughness:.72}));gateBase.position.y=.12
  const gateWater=new THREE.Mesh(new THREE.BoxGeometry(1.55,.1,1.38),waterMat);gateWater.position.y=.25
  const gatePlate=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.15,.12),machineSteel);gatePlate.position.set(0,.82,0)
  const gateStem=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,1.2,10),machineSteel);gateStem.position.y=1.72
  const gateWheel=new THREE.Mesh(new THREE.TorusGeometry(.36,.055,8,24),new THREE.MeshStandardMaterial({color:0xe6a33a,metalness:.45,roughness:.32}));gateWheel.rotation.x=Math.PI/2;gateWheel.position.y=2.25
  const gatePanel=new THREE.Mesh(new THREE.BoxGeometry(.48,.64,.28),machineDark);gatePanel.position.set(.86,1.42,.3)
  const gateScreen=new THREE.Mesh(new THREE.BoxGeometry(.32,.2,.03),new THREE.MeshStandardMaterial({color:0x143d3b,emissive:0x41e39b,emissiveIntensity:.55}));gateScreen.position.set(.86,1.52,.455)
  gate.add(gateBase,gateWater,gatePlate,gateStem,gateWheel,gatePanel,gateScreen);gate.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.isMesh){mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.id='valve-02'}});raycastTargets.push(gateBase,gatePanel);scene.add(gate);entityObjects.set('valve-02',gate);addWalkCollider('valve-02',valvePosition[0]-1.45,valvePosition[0]+1.45,valvePosition[2]-.9,valvePosition[2]+.9)

  const pumpPosition=entityPosition('pump-02',[2,0,21]);const pumpUnit=new THREE.Group();pumpUnit.position.set(...pumpPosition);pumpUnit.userData.id='pump-02'
  const pumpPad=new THREE.Mesh(new THREE.BoxGeometry(2.6,.18,1.7),new THREE.MeshStandardMaterial({color:0x9eaaa5,roughness:.75}));pumpPad.position.y=.09
  const motor=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,1.25,20),machineBlue);motor.rotation.z=Math.PI/2;motor.position.set(-.35,.65,0)
  const motorCap=new THREE.Mesh(new THREE.CylinderGeometry(.32,.4,.3,18),machineDark);motorCap.rotation.z=Math.PI/2;motorCap.position.set(.43,.65,0)
  const outlet=new THREE.Mesh(new THREE.TorusGeometry(.43,.12,10,22,Math.PI*1.5),machineSteel);outlet.rotation.y=Math.PI/2;outlet.position.set(.72,.75,.38)
  const pumpPanel=new THREE.Mesh(new THREE.BoxGeometry(.6,1,.4),machineDark);pumpPanel.position.set(-.9,.7,.55)
  const pumpLed=new THREE.Mesh(new THREE.SphereGeometry(.055,9,7),new THREE.MeshBasicMaterial({color:0x5eff8e}));pumpLed.position.set(-.9,.87,.765)
  pumpUnit.add(pumpPad,motor,motorCap,outlet,pumpPanel,pumpLed);pumpUnit.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.isMesh){mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.id='pump-02'}});raycastTargets.push(pumpPad,motor,pumpPanel);animated.push({object:pumpLed,kind:'signal',seed:4});scene.add(pumpUnit);entityObjects.set('pump-02',pumpUnit);addWalkCollider('pump-02',pumpPosition[0]-1.5,pumpPosition[0]+1.5,pumpPosition[2]-1.05,pumpPosition[2]+1.05)
}

function addEnvironmentAndAlerts() {
  if (!scene) return
  const environment=moduleLayers.environment=new THREE.Group()
  const discGeo=new THREE.CircleGeometry(6,48);const colors=[0xff7042,0xf4d648,0x4ddc89]
  ;[[-2,-3],[10,10],[-12,9]].forEach(([x,z],i)=>{const disc=new THREE.Mesh(discGeo,new THREE.MeshBasicMaterial({color:colors[i],transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));disc.rotation.x=-Math.PI/2;disc.position.set(x,.32,z);environment.add(disc)})
  environment.visible=false;scene.add(environment)
  const alerts=moduleLayers.alerts=new THREE.Group();const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.75,32),new THREE.MeshBasicMaterial({color:0xff922f,transparent:true,opacity:.9,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;const alertPosition=entityPosition('field-04',[4,0,12]);ring.position.set(alertPosition[0],.45,alertPosition[2]);alerts.add(ring);alerts.visible=false;scene.add(alerts);animated.push({object:ring,kind:'pulse'})
}

function addOperationalLayers(){
  if(!scene)return
  const monitoring=moduleLayers.monitoring=new THREE.Group();const devices=moduleLayers.devices=new THREE.Group();const crops=moduleLayers.crops=new THREE.Group()
  const poleMat=new THREE.MeshStandardMaterial({color:0xced9d5,metalness:.7,roughness:.3});const lensMat=new THREE.MeshStandardMaterial({color:0x273a3a,metalness:.35,roughness:.18})
  const cameraPositions=[entityPosition('camera-03',[15,0,18]),[-3,0,-1] as [number,number,number],[12,0,-7] as [number,number,number]]
  cameraPositions.forEach((position,index)=>{const id=index===0?'camera-03':`camera-0${index+4}`;const cameraGroup=new THREE.Group();const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,2.4,8),poleMat);pole.position.y=1.2;const head=new THREE.Mesh(new THREE.BoxGeometry(.55,.3,.3),lensMat);head.position.set(.18,2.35,0);head.rotation.y=-.5;const cone=new THREE.Mesh(new THREE.ConeGeometry(3.4,7,32,1,true),new THREE.MeshBasicMaterial({color:0x55e6a0,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false}));cone.rotation.z=-Math.PI/2;cone.position.set(3.5,1.6,0);cameraGroup.add(pole,head,cone);cameraGroup.position.set(...position);cameraGroup.userData.category=index===0?'ai-events':'coverage';cameraGroup.userData.id=id;for(const target of [pole,head]){target.userData.id=id;raycastTargets.push(target)}monitoring.add(cameraGroup);if(index===0)entityObjects.set(id,cameraGroup)})
  monitoring.visible=false;scene.add(monitoring)
  sceneEntities.filter(entity=>['device','station','robot'].includes(entity.type)&&entity.position3D&&!['robot-01','valve-02','pump-02'].includes(entity.id)).forEach((entity,index)=>{const marker=new THREE.Group();const base=new THREE.Mesh(new THREE.CylinderGeometry(.3,.36,.18,16),new THREE.MeshStandardMaterial({color:entity.status==='offline'?0xb8574e:0x4ba66a,emissive:entity.status==='offline'?0x5f110c:0x123e20,emissiveIntensity:.45,metalness:.35,roughness:.32}));const stem=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.9,8),poleMat);stem.position.y=.52;const signal=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),new THREE.MeshBasicMaterial({color:entity.status==='offline'?0xff6652:0x76f49a}));signal.position.y=1;marker.add(base,stem,signal);marker.position.set(entity.position3D!.x,.12,entity.position3D!.z);marker.userData.category=index%2?'actuators':'sensors';marker.userData.offline=entity.status==='offline';marker.userData.id=entity.id;for(const target of [base,stem,signal]){target.userData.id=entity.id;raycastTargets.push(target)}devices.add(marker);if(!entityObjects.has(entity.id))entityObjects.set(entity.id,marker);animated.push({object:signal,kind:'signal',seed:index})})
  devices.visible=false;scene.add(devices)
  for(const id of ['field-04','field-05']){const position=entityPosition(id,[0,0,0]);for(const [category,color,scale] of [['health',id==='field-04'?0xf0b23c:0x65df82,1],['stage',0x55b9e8,.94],['maturity',0xe8c455,.88],['risk',0xff6b48,.8]] as const){if(category==='risk'&&id!=='field-04')continue;const outline=new THREE.Mesh(new THREE.BoxGeometry((id==='field-04'?11:9)*scale,.07,(id==='field-04'?8:6)*scale),new THREE.MeshBasicMaterial({color,transparent:true,opacity:category==='risk'?.34:.2}));outline.position.set(position[0],.31+(1-scale)*.1,position[2]);outline.userData.category=category;crops.add(outline)}}crops.visible=false;scene.add(crops)
}

async function loadAsset(asset: typeof modelAssets[number]) {
  if (!scene) return
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(asset.url)
  const model = gltf.scene
  model.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3())
  const uniform = asset.size / Math.max(size.x, size.z, .001)
  model.scale.setScalar(uniform)
  model.position.set(-center.x*uniform,-box.min.y*uniform,-center.z*uniform)
  const wrapper = new THREE.Group();wrapper.position.set(asset.position[0],asset.position[1],asset.position[2]);wrapper.rotation.y=asset.rotation;wrapper.userData.id=asset.id;wrapper.add(model)
  model.traverse(obj=>{const mesh=obj as THREE.Mesh;if(mesh.isMesh){mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.id=asset.id;raycastTargets.push(mesh);if(Array.isArray(mesh.material))mesh.material.forEach(m=>m.side=THREE.FrontSide)}})
  scene.add(wrapper)
  entityObjects.set(asset.id,wrapper)
  wrapper.updateMatrixWorld(true);addBoxCollider(asset.id,new THREE.Box3().setFromObject(wrapper),asset.id==='robot-01'?.12:.22)
}

async function loadPublicModels() {
  let done=0
  await Promise.allSettled(modelAssets.map(async asset=>{
    await loadAsset(asset);done++;progress.value=Math.round(done/modelAssets.length*100);loadingText.value=`正在加载农场公模 ${done}/${modelAssets.length}`
  }))
  if(renderer){renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true}refreshSelectionMarkers()
  loading.value=false
}

function init() {
  if (!host.value) return
  scene=new THREE.Scene();scene.background=new THREE.Color(0xa6c9cf);scene.fog=new THREE.Fog(0xa9c9c8,38,88)
  camera=new THREE.PerspectiveCamera(42,host.value.clientWidth/host.value.clientHeight,.1,180);camera.position.set(31,31,39)
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});normalPixelRatio=Math.min(devicePixelRatio,1.45);renderer.setPixelRatio(normalPixelRatio);renderer.setSize(host.value.clientWidth,host.value.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;host.value.appendChild(renderer.domElement)
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.target.set(0,0,1);controls.maxPolarAngle=Math.PI/2.18;controls.minPolarAngle=.28;controls.minDistance=17;controls.maxDistance=72;controls.enablePan=true
  fpsControls=new PointerLockControls(camera,renderer.domElement);fpsControls.pointerSpeed=.72;fpsControls.addEventListener('lock',onPointerLock);fpsControls.addEventListener('unlock',onPointerUnlock)
  hemisphere=new THREE.HemisphereLight(0xeafaff,0x42583a,2.25);scene.add(hemisphere);sun=new THREE.DirectionalLight(0xfff2d5,3.2);sun.position.set(-24,42,18);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-38;sun.shadow.camera.right=38;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.bias=-.00025;scene.add(sun)
  createSkyDetails();createGround();[-22,-15,-9,-3,3,10,24].forEach(z=>addRoad(0,z,38,1.45));[-19,19].forEach(x=>addRoad(x,2,1.6,48))
  addTrees();addWaterAndEquipment();addEnvironmentAndAlerts();addOperationalLayers()
  ;['gh-01','gh-02','gh-03','gh-04','gh-06','gh-05'].forEach((id,index)=>{const position=entityPosition(id,[index*8-16,0,0]);addGreenhouse(position[0],position[2],id)})
  const field04=entityPosition('field-04',[-3,0,15]);const field05=entityPosition('field-05',[14,0,15]);addCropPlot(field04[0],field04[2],11,8,'field-04','leafy');addCropPlot(field05[0],field05[2],9,7,'field-05','leafy')
  renderer.domElement.addEventListener('click',onClick);renderer.domElement.addEventListener('pointermove',onPointerMove);renderer.domElement.addEventListener('pointerleave',clearHover);window.addEventListener('resize',resize);window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);updateDayNight(true);loadPublicModels();animate();updateModuleLayers();setSelectionHelper(props.selectedId)
}

function animate(){
  frame=requestAnimationFrame(animate)
  const delta=Math.min(clock.getDelta(),.05);elapsedTime+=delta
  if(walkMode.value&&fpsControls?.isLocked&&camera){
    let forward=(pressedKeys.has('KeyW')?1:0)-(pressedKeys.has('KeyS')?1:0)
    let right=(pressedKeys.has('KeyD')?1:0)-(pressedKeys.has('KeyA')?1:0)
    const length=Math.hypot(forward,right)||1;forward/=length;right/=length
    const speed=pressedKeys.has('ShiftLeft')||pressedKeys.has('ShiftRight')?9.5:5.2
    const previous=camera.position.clone()
    fpsControls.moveForward(forward*speed*delta);fpsControls.moveRight(right*speed*delta)
    const proposed=camera.position.clone();camera.position.copy(previous)
    const nextX=THREE.MathUtils.clamp(proposed.x,-34,34);if(!walkPositionBlocked(nextX,previous.z))camera.position.x=nextX
    const nextZ=THREE.MathUtils.clamp(proposed.z,-27,27);if(!walkPositionBlocked(camera.position.x,nextZ))camera.position.z=nextZ
    camera.position.y=1.7
  }else controls?.update()
  updateDayNight();if(cloudField)cloudField.rotation.y+=delta*.0025
  for(const item of animated){
    if(item.kind==='pulse'){
      const s=1+(Math.sin(elapsedTime*3)+1)*.35;item.object.scale.setScalar(s)
      const material=(item.object as THREE.Mesh).material;if(material&&!Array.isArray(material))material.opacity=.72-(s-1)*.55
    }else if(item.kind==='water')item.object.position.y=.04+Math.sin(elapsedTime*1.5)*.015
    else if(item.kind==='signal'){const s=.82+(Math.sin(elapsedTime*3+(item.seed||0))+1)*.18;item.object.scale.setScalar(s)}
    else if(item.kind==='flow')item.object.position.y=.37+(Math.sin(elapsedTime*2.5+(item.seed||0))+.8)*.09
    else if(item.kind==='fan')item.object.rotation.y-=delta*(5.5+(item.seed||0)*.22)
  }
  if(selectionMarkerGroup?.visible)selectionMarkerGroup.children.forEach(marker=>{const target=marker.userData.targetScale||.78;const pulse=1+Math.sin(elapsedTime*3.2+(marker.userData.seed||0))*.07;marker.scale.setScalar(THREE.MathUtils.lerp(marker.scale.x,target*pulse,.12));marker.position.y=marker.userData.baseY+Math.sin(elapsedTime*2.4+(marker.userData.seed||0))*.1})
  if(scene&&camera)renderer?.render(scene,camera)
}
function resize(){if(!host.value||!camera||!renderer)return;camera.aspect=host.value.clientWidth/host.value.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.value.clientWidth,host.value.clientHeight)}
function raycastAt(mouse: THREE.Vector2){if(!camera)return undefined;const ray=new THREE.Raycaster();ray.far=walkMode.value?14:180;ray.setFromCamera(mouse,camera);return ray.intersectObjects(raycastTargets,false)[0]}
function onClick(event:MouseEvent){
  if(!renderer||!camera)return
  if(walkMode.value&&!fpsControls?.isLocked){fpsControls?.lock();return}
  const rect=renderer.domElement.getBoundingClientRect();const mouse=walkMode.value?new THREE.Vector2(0,0):new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1)
  emit('select',raycastAt(mouse)?.object.userData.id||null)
}

function pick(event:PointerEvent){if(!renderer||!camera)return null;const rect=renderer.domElement.getBoundingClientRect();const mouse=walkMode.value?new THREE.Vector2(0,0):new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);return raycastAt(mouse)?.object.userData.id as string|undefined}
function onPointerMove(event:PointerEvent){const now=performance.now();if(pointerPickScheduled||(walkMode.value&&now-lastWalkPick<90))return;if(walkMode.value)lastWalkPick=now;pointerPickScheduled=true;const x=event.clientX,y=event.clientY;requestAnimationFrame(()=>{pointerPickScheduled=false;if(!renderer)return;const synthetic={clientX:x,clientY:y} as PointerEvent;const id=pick(synthetic)||null;renderer.domElement.style.cursor=walkMode.value?'crosshair':id?'pointer':'grab';setHoverHelper(id)})}
function clearHover(){setHoverHelper(null)}
function setHoverHelper(id:string|null){if(hoveredObjectId===id)return;hoveredObjectId=id;if(hoverHelper){scene?.remove(hoverHelper);hoverHelper.dispose();hoverHelper=undefined}const object=id?entityObjects.get(id):undefined;if(object&&scene){hoverHelper=new THREE.Box3Helper(new THREE.Box3().setFromObject(object),new THREE.Color(0x7dff9a));scene.add(hoverHelper)}}
function setSelectionHelper(id:string|null){if(selectHelper){scene?.remove(selectHelper);selectHelper.dispose();selectHelper=undefined}const object=id?entityObjects.get(id):undefined;if(object&&scene){selectHelper=new THREE.Box3Helper(new THREE.Box3().setFromObject(object),new THREE.Color(0xc1ffca));scene.add(selectHelper)}}

function enterWalkMode(){
  if(!camera||!controls||!fpsControls)return
  savedCameraPosition.copy(camera.position);savedControlTarget.copy(controls.target)
  savedCameraFov=camera.fov;unlockingForOverlay=false;walkMode.value=true;controls.enabled=false;clearHover();renderer?.setPixelRatio(Math.min(devicePixelRatio,1.12));camera.fov=58;camera.updateProjectionMatrix();resize()
  camera.position.set(-18,1.7,13);camera.lookAt(-11,1.15,6)
  fpsControls.pointerSpeed=.88;refreshSelectionMarkers();emit('walk',true);fpsControls.lock()
}
function leaveWalkMode(unlock=true){
  if(!walkMode.value)return
  walkMode.value=false;pointerLocked.value=false;unlockingForOverlay=false;pressedKeys.clear();clearHover();refreshSelectionMarkers();emit('walk',false)
  if(unlock&&fpsControls?.isLocked)fpsControls.unlock()
  renderer?.setPixelRatio(normalPixelRatio);if(camera)camera.fov=savedCameraFov;resize();if(camera&&controls){camera.position.copy(savedCameraPosition);controls.target.copy(savedControlTarget);controls.enabled=true;controls.update()}
}
function onPointerLock(){pointerLocked.value=true}
function onPointerUnlock(){
  pointerLocked.value=false
  if(!walkMode.value)return
  if(unlockingForOverlay||props.overlayOpen){unlockingForOverlay=false;pressedKeys.clear();return}
  leaveWalkMode(false)
}
function onKeyDown(event:KeyboardEvent){
  if(!walkMode.value)return
  const module=moduleShortcuts[event.code];if(module){event.preventDefault();emit('module',module);return}
  if(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight'].includes(event.code)){event.preventDefault();pressedKeys.add(event.code)}
}
function onKeyUp(event:KeyboardEvent){pressedKeys.delete(event.code)}
function resumeAfterOverlay(){if(walkMode.value&&!fpsControls?.isLocked){unlockingForOverlay=false;fpsControls?.lock()}}
defineExpose({resumeAfterOverlay})

function updateModuleLayers(){Object.entries(moduleLayers).forEach(([key,group])=>{if(!group)return;group.visible=key===props.activeModule&&key!=='environment';if(!group.visible)return;if(['devices','monitoring'].includes(key))group.children.forEach(child=>child.visible=true);if(key==='crops')group.children.forEach(child=>child.visible=child.userData.category==='health');if(key==='irrigation')group.children.forEach(child=>child.visible=true)});if(props.activeModule==='overview')Object.values(moduleLayers).forEach(group=>group&&(group.visible=false));refreshSelectionMarkers()}

watch(()=>[props.activeModule,props.activeSubLayer],updateModuleLayers)
watch(()=>props.selectedId,id=>{setSelectionHelper(id);refreshSelectionMarkers()},{immediate:true})
watch(()=>props.overlayOpen,open=>{
  if(!walkMode.value||!fpsControls)return
  if(open&&fpsControls.isLocked){unlockingForOverlay=true;pressedKeys.clear();fpsControls.unlock();return}
  if(!open&&!fpsControls.isLocked)requestAnimationFrame(()=>{if(walkMode.value&&!props.overlayOpen&&!fpsControls?.isLocked)fpsControls?.lock()})
})
onMounted(init)
onBeforeUnmount(()=>{
  cancelAnimationFrame(frame);if(walkMode.value)emit('walk',false);window.removeEventListener('resize',resize);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp)
  renderer?.domElement.removeEventListener('click',onClick);renderer?.domElement.removeEventListener('pointermove',onPointerMove);renderer?.domElement.removeEventListener('pointerleave',clearHover)
  if(fpsControls?.isLocked)fpsControls.unlock();fpsControls?.removeEventListener('lock',onPointerLock);fpsControls?.removeEventListener('unlock',onPointerUnlock);fpsControls?.dispose();controls?.dispose()
  scene?.traverse(obj=>{const mesh=obj as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();if(mesh.material){const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];mats.forEach(m=>m.dispose())}})
  renderer?.dispose();renderer?.domElement.remove();raycastTargets=[];entityObjects.clear();walkColliders.length=0
})
</script>

<template>
  <div ref="host" class="three-scene">
    <Transition name="loading">
      <div v-if="loading" class="loading">
        <div class="loader-mark"><i></i><b></b><span>{{ progress }}%</span></div>
        <strong>{{ loadingText }}</strong>
        <small>正在组合地形、温室、建筑与农业资产</small>
        <div class="progress"><i :style="{width:progress+'%'}"></i></div>
      </div>
    </Transition>
    <div v-if="!walkMode" class="tip"><span>3D</span> 左键旋转 · 右键平移 · 滚轮缩放 · 点击选择</div>
    <Transition name="walk-control">
      <button v-if="!walkMode && !loading" class="walk-toggle" :class="{ 'drawer-open': drawerOpen }" type="button" @click.stop="enterWalkMode">
        <span class="walk-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.4"/><path d="M9.2 9.1 12 7.5l2.8 1.6 1.9 3.3M12 8v5.1m0 0-3.2 6.2m3.2-6.2 4.3 5.5M9.1 10.2l-2.8 3.2"/></svg>
        </span>
        <span><b>第一人称巡场</b><small>沉浸式管理农场</small></span>
        <kbd>WASD</kbd>
      </button>
    </Transition>
    <Transition name="walk-hud">
      <div v-if="walkMode" class="walk-hud">
        <div class="crosshair"><i></i><b></b></div>
        <div v-if="!pointerLocked && !overlayOpen" class="resume-hint" @click="fpsControls?.lock()"><b>巡场已暂停</b><span>点击继续 · 再按 Esc 退出</span></div>
        <div class="walk-guide"><strong>巡场模式</strong><span><kbd>WASD</kbd> 移动</span><span><kbd>鼠标</kbd> 观察</span><span><kbd>Shift</kbd> 加速</span><span><kbd>1–7</kbd> 切换业务</span><span><kbd>左键</kbd> 选择设施</span></div>
        <button class="walk-exit" type="button" @click.stop="leaveWalkMode()">退出巡场 <kbd>Esc</kbd></button>
      </div>
    </Transition>
    <div class="world-time"><i :class="dayPeriod"></i><span>{{ dayPeriod }}</span><b>{{ farmTime }}</b><small>真实时间同步</small></div>
    <div class="quality"><i></i> WEBGL · HIGH QUALITY</div>
  </div>
</template>

<style scoped lang="scss">
.three-scene{position:absolute;inset:0;background:linear-gradient(#9dc5cb,#c7d8c4)}.three-scene canvas{display:block}.three-scene::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(5,30,26,.08),transparent 25%,transparent 75%,rgba(5,25,16,.14))}.loading{position:absolute;z-index:5;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,#264d3b,#102a23 70%);color:white}.loader-mark{width:84px;height:84px;position:relative;display:grid;place-items:center;margin-bottom:20px}.loader-mark i,.loader-mark b{position:absolute;inset:0;border:2px solid rgba(130,226,147,.15);border-top-color:#83e69b;border-radius:50%;animation:spin 1.5s linear infinite}.loader-mark b{inset:9px;border-color:rgba(99,198,225,.12);border-bottom-color:#67cae5;animation-direction:reverse;animation-duration:1s}.loader-mark span{font-size:13px;font-weight:700}.loading strong{font-size:15px;letter-spacing:.5px}.loading small{margin-top:8px;color:rgba(255,255,255,.48)}.progress{width:240px;height:3px;margin-top:22px;background:rgba(255,255,255,.1);border-radius:5px;overflow:hidden}.progress i{display:block;height:100%;background:linear-gradient(90deg,#56b876,#90eb9f);transition:width .25s}.tip{position:absolute;left:50%;top:93px;transform:translateX(-50%);z-index:3;padding:7px 13px;border-radius:999px;background:rgba(7,27,22,.58);color:rgba(255,255,255,.76);font-size:11px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1)}.tip span{display:inline-block;margin-right:7px;padding:2px 5px;border-radius:5px;background:#32955b;color:white;font-size:9px;font-weight:800}.quality{position:absolute;z-index:3;left:25px;bottom:66px;padding:6px 9px;border-radius:8px;background:rgba(7,27,22,.5);color:rgba(255,255,255,.58);font:9px/1 monospace;letter-spacing:.7px;backdrop-filter:blur(8px)}.quality i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#56df78;box-shadow:0 0 7px #56df78;margin-right:6px}.world-time{position:absolute;z-index:4;left:25px;bottom:91px;display:grid;grid-template-columns:auto auto;align-items:center;column-gap:7px;padding:8px 11px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(7,27,22,.54);color:white;backdrop-filter:blur(13px)}.world-time>i{grid-row:1/3;width:9px;height:9px;border-radius:50%;background:#ffd264;box-shadow:0 0 12px #ffd264}.world-time>i.夜间,.world-time>i.深夜{background:#8ab9ff;box-shadow:0 0 12px #8ab9ff}.world-time>i.晨曦,.world-time>i.黄昏{background:#ff9c68;box-shadow:0 0 12px #ff9c68}.world-time span{font-size:8px;color:rgba(255,255,255,.54)}.world-time b{font:700 13px/1.2 ui-monospace,monospace;letter-spacing:.6px}.world-time small{grid-column:1/3;margin-top:4px;font-size:7px;color:rgba(255,255,255,.35)}.loading-enter-active,.loading-leave-active{transition:opacity .45s}.loading-enter-from,.loading-leave-to{opacity:0}
.walk-toggle{position:absolute;z-index:16;right:168px;top:120px;display:flex;align-items:center;gap:9px;height:44px;min-width:190px;padding:4px 9px 4px 5px;color:#effff4;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:linear-gradient(135deg,rgba(20,56,46,.78),rgba(8,35,30,.62));box-shadow:inset 0 1px rgba(255,255,255,.16),0 10px 28px rgba(3,24,18,.2);backdrop-filter:blur(18px) saturate(140%);cursor:pointer;transition:right .25s,transform .22s,opacity .2s}.walk-toggle.drawer-open{right:calc(clamp(360px,30vw,440px) + 168px)}.walk-toggle:hover{transform:translateY(-2px);border-color:rgba(120,244,159,.58);box-shadow:inset 0 1px rgba(255,255,255,.24),0 14px 40px rgba(3,24,18,.32),0 0 18px rgba(80,222,125,.13)}.walk-icon{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:50%;background:linear-gradient(145deg,#65d888,#2c8d55);box-shadow:inset 0 1px rgba(255,255,255,.35),0 5px 15px rgba(26,135,74,.3)}.walk-icon svg{width:21px;height:21px;fill:none;stroke:#fff;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.walk-toggle>span:nth-child(2){display:flex;flex:1;flex-direction:column;align-items:flex-start}.walk-toggle b{font-size:12px;line-height:1.35;white-space:nowrap}.walk-toggle small{font-size:8px;color:rgba(230,255,238,.5);white-space:nowrap}kbd{padding:2px 5px;border:1px solid rgba(255,255,255,.19);border-bottom-color:rgba(255,255,255,.3);border-radius:5px;background:rgba(255,255,255,.08);color:rgba(245,255,248,.72);font:8px/1.3 ui-monospace,monospace;box-shadow:inset 0 -1px rgba(0,0,0,.18)}.walk-hud{position:absolute;z-index:26;inset:0;pointer-events:none}.crosshair{position:absolute;left:50%;top:50%;width:26px;height:26px;transform:translate(-50%,-50%);filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))}.crosshair::after{content:"";position:absolute;left:11px;top:11px;width:4px;height:4px;border:1px solid rgba(205,255,219,.95);border-radius:50%}.crosshair i,.crosshair b{position:absolute;background:rgba(222,255,232,.9)}.crosshair i{left:0;right:0;top:13px;height:1px}.crosshair b{top:0;bottom:0;left:13px;width:1px}.walk-guide{position:absolute;left:50%;bottom:84px;display:flex;align-items:center;gap:13px;transform:translateX(-50%);padding:9px 14px;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:linear-gradient(135deg,rgba(8,35,29,.73),rgba(16,52,43,.57));box-shadow:inset 0 1px rgba(255,255,255,.15),0 12px 36px rgba(0,0,0,.2);color:rgba(240,255,245,.74);font-size:10px;backdrop-filter:blur(18px) saturate(135%)}.walk-guide strong{padding-right:12px;border-right:1px solid rgba(255,255,255,.14);color:#7bed9c;font-size:11px}.walk-guide span{display:flex;align-items:center;gap:5px;white-space:nowrap}.walk-exit{position:absolute;left:24px;top:120px;pointer-events:auto;padding:9px 12px;border:1px solid rgba(255,255,255,.2);border-radius:11px;background:rgba(12,38,33,.72);color:rgba(255,255,255,.82);font-size:11px;backdrop-filter:blur(14px);cursor:pointer}.walk-exit:hover{border-color:rgba(126,238,160,.55);color:white}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:1000px){.walk-toggle{left:150px;right:auto;top:84px;min-width:0;width:46px;padding:5px}.walk-toggle.drawer-open{right:auto;opacity:0;pointer-events:none;transform:translateY(-8px)}.walk-toggle>span:nth-child(2),.walk-toggle>kbd{display:none}.walk-guide span:nth-last-child(-n+2){display:none}}@media(max-width:700px){.tip{top:70px;width:max-content;max-width:90vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.quality{display:none}.walk-toggle{top:119px;left:12px}.walk-guide{bottom:74px}.walk-exit{top:70px;right:14px}}
</style>
<style scoped lang="scss">
.walk-toggle.drawer-open{opacity:0;pointer-events:none;transform:translateY(-8px)}
.walk-control-enter-active,.walk-control-leave-active{transition:.24s cubic-bezier(.22,.8,.25,1)}.walk-control-enter-from,.walk-control-leave-to{opacity:0;transform:translateY(-8px) scale(.96)}.walk-hud-enter-active,.walk-hud-leave-active{transition:opacity .32s ease}.walk-hud-enter-from,.walk-hud-leave-to{opacity:0}.walk-hud-enter-from .walk-guide,.walk-hud-leave-to .walk-guide{transform:translate(-50%,10px)}
.resume-hint{position:absolute;left:50%;top:50%;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:auto;transform:translate(-50%,42px);padding:10px 15px;border:1px solid rgba(255,255,255,.2);border-radius:13px;background:rgba(7,29,24,.76);box-shadow:0 14px 36px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.15);color:white;backdrop-filter:blur(16px);cursor:pointer;animation:resume-in .24s ease}.resume-hint b{font-size:11px}.resume-hint span{font-size:8px;color:rgba(255,255,255,.55)}@keyframes resume-in{from{opacity:0;transform:translate(-50%,50px) scale(.96)}}
</style>
