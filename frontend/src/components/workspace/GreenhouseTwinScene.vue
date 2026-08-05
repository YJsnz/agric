<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GreenhouseDetail } from '@/types'

const props = defineProps<{ plants: GreenhouseDetail['plants']; selectedId?: string | null }>()
const emit = defineEmits<{ (event: 'select', id: string): void }>()
const host = ref<HTMLDivElement>()
const loading = ref(true)
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let renderer: THREE.WebGLRenderer | undefined
let controls: OrbitControls | undefined
let frame = 0
let resizeObserver: ResizeObserver | undefined
const selectable: THREE.Object3D[] = []
const plantGroups = new Map<string, THREE.Object3D>()
let selection: THREE.Box3Helper | undefined

function frameGreenhouse() {
  if (!scene) return
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), new THREE.MeshStandardMaterial({ color: 0x3f5d35, roughness: .96 }))
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)
  const aisle = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 13.5), new THREE.MeshStandardMaterial({ color: 0xb6a789, roughness: 1 }))
  aisle.rotation.x = -Math.PI / 2; aisle.position.y = .012; scene.add(aisle)
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xb8d2c7, metalness: .72, roughness: .25 })
  for (let z = -6; z <= 6; z += 2) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, 0, z), new THREE.Vector3(-6.5, 3.2, z), new THREE.Vector3(0, 5.1, z),
      new THREE.Vector3(6.5, 3.2, z), new THREE.Vector3(8, 0, z)
    ])
    const rib = new THREE.Mesh(new THREE.TubeGeometry(curve, 28, .035, 6, false), frameMaterial); scene.add(rib)
  }
  const cover = new THREE.Mesh(new THREE.BoxGeometry(16.2, 4.7, 13.1), new THREE.MeshPhysicalMaterial({ color: 0xdff9ee, transparent: true, opacity: .12, roughness: .18, transmission: .25, side: THREE.DoubleSide, depthWrite: false }))
  cover.position.y = 2.3; scene.add(cover)
  for (const x of [-4.8, -2.1, 2.1, 4.8]) {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.7, .3, 11.7), new THREE.MeshStandardMaterial({ color: 0x4c321f, roughness: 1 }))
    bed.position.set(x, .16, 0); bed.receiveShadow = true; scene.add(bed)
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 11.5, 7), new THREE.MeshStandardMaterial({ color: 0x202d29, roughness: .7 }))
    pipe.rotation.x = Math.PI / 2; pipe.position.set(x, .36, 0); scene.add(pipe)
  }
  for (const z of [-4.2, 0, 4.2]) {
    const fan = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(.38, .05, 8, 24), frameMaterial)
    const blades = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .08, 8), new THREE.MeshStandardMaterial({ color: 0x4a8064 }))
    blades.rotation.x = Math.PI / 2; fan.add(ring, blades); fan.position.set(7.75, 2.6, z); fan.rotation.y = Math.PI / 2; scene.add(fan)
  }
}

function fallbackPlant(color: THREE.ColorRepresentation) {
  const group = new THREE.Group()
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, .8, 7), new THREE.MeshStandardMaterial({ color: 0x3c7c3e }))
  stem.position.y = .4; group.add(stem)
  for (let i = 0; i < 5; i++) { const leaf = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 5), new THREE.MeshStandardMaterial({ color })); leaf.scale.set(1.5, .32, .75); leaf.position.set((i % 2 ? 1 : -1) * .13, .2 + i * .14, 0); leaf.rotation.z = i % 2 ? -.35 : .35; group.add(leaf) }
  return group
}

async function addPlants() {
  if (!scene) return
  let source: THREE.Object3D | undefined
  try {
    const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/models/potted-plant-02.glb`)
    source = gltf.scene; const box = new THREE.Box3().setFromObject(source); const size = box.getSize(new THREE.Vector3())
    source.scale.setScalar(1.05 / Math.max(size.y, .001)); source.updateMatrixWorld(true)
    const scaledBox = new THREE.Box3().setFromObject(source); source.position.y = -scaledBox.min.y
  } catch { source = undefined }
  const positions = [-4.8, -2.1, 2.1, 4.8]
  props.plants.forEach((plant, index) => {
    const group = new THREE.Group(); const model = source ? source.clone(true) : fallbackPlant(plant.status === 'normal' ? 0x58a64f : 0xb39a42)
    group.add(model); group.position.set(positions[index % 4], .32, -4.7 + Math.floor(index / 4) * 4.7)
    group.userData.id = plant.id; group.traverse(item => { item.userData.id = plant.id; if ((item as THREE.Mesh).isMesh) { (item as THREE.Mesh).castShadow = true; selectable.push(item) } })
    plantGroups.set(plant.id, group); scene!.add(group)
  })
  loading.value = false; updateSelection()
}

function updateSelection() {
  if (!scene) return
  if (selection) { scene.remove(selection); selection.geometry.dispose() }
  const target = props.selectedId ? plantGroups.get(props.selectedId) : undefined
  if (target) { selection = new THREE.Box3Helper(new THREE.Box3().setFromObject(target), new THREE.Color(0x69ed8f)); scene.add(selection) }
}

function init() {
  if (!host.value) return
  scene = new THREE.Scene(); scene.background = new THREE.Color(0xb8d7cf); scene.fog = new THREE.Fog(0xb8d7cf, 18, 42)
  camera = new THREE.PerspectiveCamera(44, host.value.clientWidth / host.value.clientHeight, .1, 80); camera.position.set(13, 9, 16)
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(host.value.clientWidth, host.value.clientHeight); renderer.shadowMap.enabled = true; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; host.value.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 1.4, 0); controls.maxPolarAngle = Math.PI / 2.04; controls.minDistance = 7; controls.maxDistance = 30
  scene.add(new THREE.HemisphereLight(0xf4fff8, 0x354b32, 2.1)); const sun = new THREE.DirectionalLight(0xfff4dc, 3.2); sun.position.set(-8, 15, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun)
  frameGreenhouse(); addPlants()
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2()
  renderer.domElement.addEventListener('click', event => { const rect = renderer!.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1); raycaster.setFromCamera(pointer, camera!); const hit = raycaster.intersectObjects(selectable, true)[0]; if (hit?.object.userData.id) emit('select', hit.object.userData.id) })
  resizeObserver = new ResizeObserver(() => { if (!host.value || !renderer || !camera) return; renderer.setSize(host.value.clientWidth, host.value.clientHeight); camera.aspect = host.value.clientWidth / host.value.clientHeight; camera.updateProjectionMatrix() }); resizeObserver.observe(host.value)
  const animate = () => { frame = requestAnimationFrame(animate); controls?.update(); renderer?.render(scene!, camera!) }; animate()
}

watch(() => props.selectedId, updateSelection)
onMounted(init)
onBeforeUnmount(() => { cancelAnimationFrame(frame); resizeObserver?.disconnect(); controls?.dispose(); renderer?.dispose(); renderer?.domElement.remove(); scene?.traverse(item => { const mesh = item as THREE.Mesh; mesh.geometry?.dispose?.(); if (Array.isArray(mesh.material)) mesh.material.forEach(material => material.dispose()); else mesh.material?.dispose?.() }) })
</script>

<template><div ref="host" class="twin-host"><div v-if="loading" class="loading"><i></i><span>正在载入同学制作的温室植株模型…</span></div><div class="hint">拖拽旋转 · 滚轮缩放 · 点击植株查看档案</div></div></template>

<style scoped lang="scss">
.twin-host{position:absolute;inset:0;overflow:hidden;background:#b8d7cf}.twin-host canvas{display:block}.loading{position:absolute;z-index:3;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px solid rgba(255,255,255,.65);border-radius:14px;background:rgba(240,250,244,.76);color:#345940;font-size:11px;backdrop-filter:blur(20px)}.loading i{width:9px;height:9px;border:2px solid #4c9c63;border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite}.hint{position:absolute;left:18px;bottom:18px;padding:8px 11px;border:1px solid rgba(255,255,255,.28);border-radius:99px;background:rgba(9,39,28,.58);color:rgba(255,255,255,.74);font-size:9px;backdrop-filter:blur(14px)}@keyframes spin{to{transform:rotate(360deg)}}
</style>
