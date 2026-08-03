<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { BusinessModule } from '@/types'
import { sceneEntities } from '@/data/farm'

const props = defineProps<{ activeModule: BusinessModule; activeSubLayer: string; selectedId: string | null }>()
const emit = defineEmits<{ (event: 'select', id: string | null): void }>()
const host = ref<HTMLDivElement>()
const loading = ref(true)
const progress = ref(0)
const loadingText = ref('正在初始化数字孪生…')

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let controls: OrbitControls | undefined
let frame = 0
let raycastTargets: THREE.Object3D[] = []
const animated: Array<{ object: THREE.Object3D; kind: string; seed?: number }> = []
const moduleLayers: Partial<Record<BusinessModule, THREE.Group>> = {}
const entityObjects = new Map<string, THREE.Object3D>()
let hoverHelper: THREE.Box3Helper | undefined
let selectHelper: THREE.Box3Helper | undefined
let hoveredObjectId: string | null = null
const clock = new THREE.Clock()

const modelAssets = [
  { url: '/assets/models/small-farm.glb', position: [-26, 0, -21] as const, size: 9, rotation: .08, id: 'farm-house' },
  { url: '/assets/models/big-barn.glb', position: [25, 0, -20] as const, size: 9, rotation: -1.55, id: 'warehouse-01' },
  { url: '/assets/models/farm-building-a.glb', position: [26, 0, -2] as const, size: 7, rotation: -1.55, id: 'pump-room' },
  { url: '/assets/models/farm-building-b.glb', position: [-26, 0, -2] as const, size: 7, rotation: .05, id: 'service-center' },
  { url: '/assets/models/barn.glb', position: [23, 0, 20] as const, size: 7, rotation: Math.PI, id: 'barn-01' },
  { url: '/assets/models/silo.glb', position: [-25, 0, 22] as const, size: 5.5, rotation: 0, id: 'silo-01' }
]

const spatialLayout: Record<string, [number, number, number]> = {
  'gh-01': [-13, 0, -3], 'gh-02': [-4, 0, -3], 'gh-05': [5, 0, -3],
  'gh-03': [-9, 0, -10], 'gh-04': [0, 0, -10], 'gh-06': [9, 0, -10],
  'field-04': [-6, 0, 13], 'field-05': [8, 0, 13],
  'weather-01': [-16, 0, -13], 'water-01': [-26, 0, 14],
  'fertilizer-01': [15, 0, 4], 'valve-02': [-14, 0, 8],
  'pump-02': [2, 0, 9], 'camera-03': [14, 0, 10], 'robot-01': [15, 0, 17]
}

function entityPosition(id: string, fallback: [number, number, number]): [number, number, number] {
  if (spatialLayout[id]) return spatialLayout[id]
  const position = sceneEntities.find(entity => entity.id === id)?.position3D
  return position ? [position.x, position.y, position.z] : fallback
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

function addRoad(x: number, z: number, width: number, depth: number) {
  if (!scene) return
  const asphalt = createCanvasTexture((ctx, s) => {
    ctx.fillStyle = '#666e69'; ctx.fillRect(0, 0, s, s)
    for (let i = 0; i < 500; i++) { const n = Math.random() * 90 + 60; ctx.fillStyle = `rgba(${n},${n},${n},.1)`; ctx.fillRect(Math.random()*s, Math.random()*s, 2, 2) }
  }, 3)
  const road = new THREE.Mesh(new THREE.BoxGeometry(width, .09, depth), new THREE.MeshStandardMaterial({ map: asphalt, roughness: .96 }))
  road.position.set(x, .05, z); road.receiveShadow = true; scene.add(road)
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xb3b7a7, roughness: .8 })
  if (width > depth) {
    for (const side of [-1,1]) { const curb = new THREE.Mesh(new THREE.BoxGeometry(width,.18,.16),curbMat);curb.position.set(x,.09,z+side*depth/2);scene.add(curb) }
  } else {
    for (const side of [-1,1]) { const curb = new THREE.Mesh(new THREE.BoxGeometry(.16,.18,depth),curbMat);curb.position.set(x+side*width/2,.09,z);scene.add(curb) }
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
  const plant = new THREE.MeshStandardMaterial({ color: 0x4d8d34, roughness: .85 })
  for (const side of [-.9,.9]) {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(7.5,.15,.75),soil);bed.position.set(0,.13,side);group.add(bed)
    for(let i=-7;i<=7;i++){const crop=new THREE.Mesh(new THREE.IcosahedronGeometry(.18,1),plant);crop.scale.set(1,.7,1);crop.position.set(i*.48,.37,side);group.add(crop)}
  }
  const irrigationMat=new THREE.MeshStandardMaterial({color:0x2b9db2,metalness:.5,roughness:.25})
  for(const side of [-1.35,1.35]){const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,7.5,8),irrigationMat);pipe.rotation.z=Math.PI/2;pipe.position.set(0,.42,side);group.add(pipe)}
  const fanHub=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.12,20),new THREE.MeshStandardMaterial({color:0x384c49,metalness:.7,roughness:.3}));fanHub.rotation.z=Math.PI/2;fanHub.position.set(-4.06,1.25,0);group.add(fanHub)
  for(let i=0;i<5;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.04,.5,.13),metal);blade.position.copy(fanHub.position);blade.rotation.x=i*Math.PI*.4;group.add(blade)}
  group.traverse(obj => { if ((obj as THREE.Mesh).isMesh) { obj.userData.id = id; raycastTargets.push(obj) } })
  scene.add(group)
  entityObjects.set(id,group)
  return group
}

function addCropPlot(x: number, z: number, width: number, depth: number, id: string) {
  if (!scene) return
  const group = new THREE.Group(); group.position.set(x, .08, z); group.userData.id = id
  const soil = new THREE.Mesh(new THREE.BoxGeometry(width,.14,depth),new THREE.MeshStandardMaterial({color:0x60472f,roughness:1}));soil.userData.id=id;group.add(soil);raycastTargets.push(soil)
  const cropMat = new THREE.MeshStandardMaterial({ color: 0x65a942, roughness: .9 })
  for(let row=0;row<8;row++) for(let col=0;col<13;col++) {
    const crop=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,1),cropMat);crop.scale.set(1.2,.6,1);crop.position.set(-width/2+.45+col*(width-.9)/12,.25,-depth/2+.38+row*(depth-.76)/7);group.add(crop)
  }
  scene.add(group)
  entityObjects.set(id,group)
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
    if(Math.abs(x)<27 && Math.abs(z)<18 && i%4===0) continue
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
  const rimMat=new THREE.MeshStandardMaterial({color:0xc6c9ba,roughness:.75})
  for(const [x,z,w,d] of [[-26,10.5,10.5,.3],[-26,17.5,10.5,.3],[-31,14,.3,7.3],[-21,14,.3,7.3]]){const rim=new THREE.Mesh(new THREE.BoxGeometry(w,.45,d),rimMat);rim.position.set(x,.12,z);scene.add(rim)}
  const tower=new THREE.Group();const steel=new THREE.MeshStandardMaterial({color:0x91a4a3,metalness:.75,roughness:.3});const tank=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,3,20),steel);tank.position.y=5;tower.add(tank)
  for(const [x,z] of [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,4,6),steel);leg.position.set(x,2,z);tower.add(leg)}tower.position.set(26,0,7);scene.add(tower)
  const irrigation=moduleLayers.irrigation=new THREE.Group();const pipeMat=new THREE.MeshStandardMaterial({color:0x3b8fa1,metalness:.15,roughness:.62})
  for(const [x,z,w,d] of [[-7,12,38,.12],[0,-2,.12,28],[-7,-16,38,.12]]){const pipe=new THREE.Mesh(new THREE.BoxGeometry(w,.11,d),pipeMat);pipe.position.set(x,.25,z);pipe.userData.category='network';irrigation.add(pipe)}
  for(const [x,z] of [[-18,12],[0,12],[11,-16]]){const flow=new THREE.Mesh(new THREE.SphereGeometry(.19,12,8),new THREE.MeshBasicMaterial({color:0xb9fbff}));flow.position.set(x,.37,z);flow.userData.category='flow';irrigation.add(flow);animated.push({object:flow,kind:'flow',seed:x})}
  for(const [x,z] of [[-10,12],[0,-8],[10,-16]]){const plan=new THREE.Mesh(new THREE.CylinderGeometry(.26,.31,.25,16),new THREE.MeshStandardMaterial({color:0xf7c75b,emissive:0x6d4810,emissiveIntensity:.4}));plan.position.set(x,.35,z);plan.userData.category='plans';irrigation.add(plan)}
  scene.add(irrigation);irrigation.visible=false
  animated.push({object:water,kind:'water'})
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
  sceneEntities.filter(entity=>['device','station','robot'].includes(entity.type)&&entity.position3D).forEach((entity,index)=>{const marker=new THREE.Group();const base=new THREE.Mesh(new THREE.CylinderGeometry(.3,.36,.18,16),new THREE.MeshStandardMaterial({color:entity.status==='offline'?0xb8574e:0x4ba66a,emissive:entity.status==='offline'?0x5f110c:0x123e20,emissiveIntensity:.45,metalness:.35,roughness:.32}));const stem=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.9,8),poleMat);stem.position.y=.52;const signal=new THREE.Mesh(new THREE.SphereGeometry(.13,12,8),new THREE.MeshBasicMaterial({color:entity.status==='offline'?0xff6652:0x76f49a}));signal.position.y=1;marker.add(base,stem,signal);marker.position.set(entity.position3D!.x,.12,entity.position3D!.z);marker.userData.category=index%2?'actuators':'sensors';marker.userData.offline=entity.status==='offline';marker.userData.id=entity.id;for(const target of [base,stem,signal]){target.userData.id=entity.id;raycastTargets.push(target)}devices.add(marker);entityObjects.set(entity.id,marker);animated.push({object:signal,kind:'signal',seed:index})})
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
}

async function loadPublicModels() {
  let done=0
  await Promise.allSettled(modelAssets.map(async asset=>{
    await loadAsset(asset);done++;progress.value=Math.round(done/modelAssets.length*100);loadingText.value=`正在加载农场公模 ${done}/${modelAssets.length}`
  }))
  loading.value=false
}

function init() {
  if (!host.value) return
  scene=new THREE.Scene();scene.background=new THREE.Color(0xa6c9cf);scene.fog=new THREE.Fog(0xa9c9c8,38,88)
  camera=new THREE.PerspectiveCamera(42,host.value.clientWidth/host.value.clientHeight,.1,180);camera.position.set(31,31,39)
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(host.value.clientWidth,host.value.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;host.value.appendChild(renderer.domElement)
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.target.set(0,0,1);controls.maxPolarAngle=Math.PI/2.18;controls.minPolarAngle=.28;controls.minDistance=17;controls.maxDistance=72;controls.enablePan=true
  scene.add(new THREE.HemisphereLight(0xeafaff,0x42583a,2.25));const sun=new THREE.DirectionalLight(0xfff2d5,3.2);sun.position.set(-24,42,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-38;sun.shadow.camera.right=38;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.bias=-.00025;scene.add(sun)
  createGround();[-16,5,24].forEach(z=>addRoad(0,z,68,1.8));[-19,19].forEach(x=>addRoad(x,4,1.8,42))
  addTrees();addWaterAndEquipment();addEnvironmentAndAlerts();addOperationalLayers()
  ;['gh-01','gh-02','gh-03','gh-04','gh-06','gh-05'].forEach((id,index)=>{const position=entityPosition(id,[index*8-16,0,0]);addGreenhouse(position[0],position[2],id)})
  const field04=entityPosition('field-04',[-6,0,13]);const field05=entityPosition('field-05',[8,0,13]);addCropPlot(field04[0],field04[2],11,8,'field-04');addCropPlot(field05[0],field05[2],9,7,'field-05')
  renderer.domElement.addEventListener('click',onClick);renderer.domElement.addEventListener('pointermove',onPointerMove);renderer.domElement.addEventListener('pointerleave',clearHover);window.addEventListener('resize',resize);loadPublicModels();animate();updateModuleLayers();setSelectionHelper(props.selectedId)
}

function animate(){frame=requestAnimationFrame(animate);const elapsed=clock.getElapsedTime();controls?.update();for(const item of animated){if(item.kind==='pulse'){const s=1+(Math.sin(elapsed*3)+1)*.35;item.object.scale.setScalar(s);const material=(item.object as THREE.Mesh).material;if(material&&!Array.isArray(material))material.opacity=.72-(s-1)*.55}else if(item.kind==='water'){item.object.position.y=.04+Math.sin(elapsed*1.5)*.015}else if(item.kind==='signal'){const s=.82+(Math.sin(elapsed*3+(item.seed||0))+1)*.18;item.object.scale.setScalar(s)}else if(item.kind==='flow'){item.object.position.y=.37+(Math.sin(elapsed*2.5+(item.seed||0))+.8)*.09}}if(scene&&camera)renderer?.render(scene,camera)}
function resize(){if(!host.value||!camera||!renderer)return;camera.aspect=host.value.clientWidth/host.value.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.value.clientWidth,host.value.clientHeight)}
function onClick(event:MouseEvent){if(!renderer||!camera)return;const rect=renderer.domElement.getBoundingClientRect();const mouse=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(raycastTargets,false)[0];emit('select',hit?.object.userData.id||null)}

function pick(event:PointerEvent){if(!renderer||!camera)return null;const rect=renderer.domElement.getBoundingClientRect();const mouse=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-((event.clientY-rect.top)/rect.height)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(mouse,camera);return ray.intersectObjects(raycastTargets,false)[0]?.object.userData.id as string|undefined}
function onPointerMove(event:PointerEvent){const id=pick(event)||null;renderer!.domElement.style.cursor=id?'pointer':'grab';setHoverHelper(id)}
function clearHover(){setHoverHelper(null)}
function setHoverHelper(id:string|null){if(hoveredObjectId===id)return;hoveredObjectId=id;if(hoverHelper){scene?.remove(hoverHelper);hoverHelper.dispose();hoverHelper=undefined}const object=id?entityObjects.get(id):undefined;if(object&&scene){hoverHelper=new THREE.Box3Helper(new THREE.Box3().setFromObject(object),new THREE.Color(0x7dff9a));scene.add(hoverHelper)}}
function setSelectionHelper(id:string|null){if(selectHelper){scene?.remove(selectHelper);selectHelper.dispose();selectHelper=undefined}const object=id?entityObjects.get(id):undefined;if(object&&scene){selectHelper=new THREE.Box3Helper(new THREE.Box3().setFromObject(object),new THREE.Color(0xc1ffca));scene.add(selectHelper)}}

function updateModuleLayers(){Object.entries(moduleLayers).forEach(([key,group])=>{if(!group)return;group.visible=key===props.activeModule&&key!=='environment';if(!group.visible)return;if(['devices','monitoring'].includes(key))group.children.forEach(child=>child.visible=true);if(key==='crops')group.children.forEach(child=>child.visible=child.userData.category==='health');if(key==='irrigation')group.children.forEach(child=>child.visible=true)});if(props.activeModule==='overview')Object.values(moduleLayers).forEach(group=>group&&(group.visible=false))}

watch(()=>[props.activeModule,props.activeSubLayer],updateModuleLayers)
watch(()=>props.selectedId,setSelectionHelper,{immediate:true})
onMounted(init)
onBeforeUnmount(()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);renderer?.domElement.removeEventListener('click',onClick);renderer?.domElement.removeEventListener('pointermove',onPointerMove);renderer?.domElement.removeEventListener('pointerleave',clearHover);controls?.dispose();scene?.traverse(obj=>{const mesh=obj as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();if(mesh.material){const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];mats.forEach(m=>m.dispose())}});renderer?.dispose();renderer?.domElement.remove();raycastTargets=[];entityObjects.clear()})
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
    <div class="tip"><span>3D</span> 左键旋转 · 右键平移 · 滚轮缩放 · 点击选择</div>
    <div class="quality"><i></i> WEBGL · HIGH QUALITY</div>
  </div>
</template>

<style scoped lang="scss">
.three-scene{position:absolute;inset:0;background:linear-gradient(#9dc5cb,#c7d8c4)}.three-scene canvas{display:block}.three-scene::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(5,30,26,.08),transparent 25%,transparent 75%,rgba(5,25,16,.14))}.loading{position:absolute;z-index:5;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,#264d3b,#102a23 70%);color:white}.loader-mark{width:84px;height:84px;position:relative;display:grid;place-items:center;margin-bottom:20px}.loader-mark i,.loader-mark b{position:absolute;inset:0;border:2px solid rgba(130,226,147,.15);border-top-color:#83e69b;border-radius:50%;animation:spin 1.5s linear infinite}.loader-mark b{inset:9px;border-color:rgba(99,198,225,.12);border-bottom-color:#67cae5;animation-direction:reverse;animation-duration:1s}.loader-mark span{font-size:13px;font-weight:700}.loading strong{font-size:15px;letter-spacing:.5px}.loading small{margin-top:8px;color:rgba(255,255,255,.48)}.progress{width:240px;height:3px;margin-top:22px;background:rgba(255,255,255,.1);border-radius:5px;overflow:hidden}.progress i{display:block;height:100%;background:linear-gradient(90deg,#56b876,#90eb9f);transition:width .25s}.tip{position:absolute;left:50%;top:93px;transform:translateX(-50%);z-index:3;padding:7px 13px;border-radius:999px;background:rgba(7,27,22,.58);color:rgba(255,255,255,.76);font-size:11px;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1)}.tip span{display:inline-block;margin-right:7px;padding:2px 5px;border-radius:5px;background:#32955b;color:white;font-size:9px;font-weight:800}.quality{position:absolute;z-index:3;left:25px;bottom:66px;padding:6px 9px;border-radius:8px;background:rgba(7,27,22,.5);color:rgba(255,255,255,.58);font:9px/1 monospace;letter-spacing:.7px;backdrop-filter:blur(8px)}.quality i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#56df78;box-shadow:0 0 7px #56df78;margin-right:6px}.loading-enter-active,.loading-leave-active{transition:opacity .45s}.loading-enter-from,.loading-leave-to{opacity:0}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:700px){.tip{top:70px;width:max-content;max-width:90vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.quality{display:none}}
</style>
