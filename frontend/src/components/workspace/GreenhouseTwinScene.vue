<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createDetailedCrop, loadDetailedFoliage } from './greenhouseCropModels'
import type { GreenhouseDetail } from '@/types'

const props = defineProps<{ detail: GreenhouseDetail; selectedId?: string | null }>()
const emit = defineEmits<{ (event: 'select', id: string): void }>()
const host = ref<HTMLDivElement>()
const loading = ref(true)
const loadError = ref('')
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let renderer: THREE.WebGLRenderer | undefined
let controls: OrbitControls | undefined
let frame = 0
let resizeObserver: ResizeObserver | undefined
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const selectable: THREE.Object3D[] = []
const plantGroups = new Map<string, THREE.Object3D>()
const rotors: THREE.Object3D[] = []
let selection: THREE.Box3Helper | undefined
let focusTarget: THREE.Vector3 | undefined
let focusCamera: THREE.Vector3 | undefined

const standard = (color: THREE.ColorRepresentation, roughness = .72, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness })

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) {
  const item = new THREE.Mesh(geometry, material)
  item.position.set(x, y, z)
  item.castShadow = true
  item.receiveShadow = true
  return item
}

function addGreenhouseStructure() {
  if (!scene) return
  const profile = props.detail.scene
  const floorColor = profile.cropModel === 'leafy-hydroponic' ? 0x718679 : 0x51694a
  const floor = mesh(new THREE.PlaneGeometry(18, 14), standard(floorColor, .96))
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)

  const aisle = mesh(new THREE.PlaneGeometry(1.75, 13.5), standard(0xb6ad96, 1), 0, .014, 0)
  aisle.rotation.x = -Math.PI / 2
  scene.add(aisle)

  const frameMaterial = standard(0xaec7bd, .25, .72)
  for (let z = -6; z <= 6; z += 1.5) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, 0, z), new THREE.Vector3(-6.6, 3.35, z), new THREE.Vector3(0, 5.2, z),
      new THREE.Vector3(6.6, 3.35, z), new THREE.Vector3(8, 0, z)
    ])
    scene.add(mesh(new THREE.TubeGeometry(curve, 32, .032, 7, false), frameMaterial))
  }
  for (const x of [-7.95, 0, 7.95]) {
    const rail = mesh(new THREE.CylinderGeometry(.028, .028, 12.3, 7), frameMaterial, x, x === 0 ? 5.16 : .15, 0)
    rail.rotation.x = Math.PI / 2
    scene.add(rail)
  }
  const cover = mesh(new THREE.BoxGeometry(16.15, 4.8, 13.05), new THREE.MeshPhysicalMaterial({
    color: 0xd9f2e8, transparent: true, opacity: .1, roughness: .15, transmission: .3,
    side: THREE.DoubleSide, depthWrite: false
  }), 0, 2.38, 0)
  scene.add(cover)

  const bedWidth = profile.bedCount > 4 ? 1.25 : 1.65
  for (let i = 0; i < profile.bedCount; i++) {
    const x = profile.bedCount === 1 ? 0 : -6.2 + i * (12.4 / (profile.bedCount - 1))
    const isHydro = profile.cropModel === 'leafy-hydroponic'
    const isNursery = profile.cropModel === 'seedling-tray'
    const bed = mesh(
      new THREE.BoxGeometry(bedWidth, isHydro ? .62 : isNursery ? .72 : .32, 11.5),
      standard(isHydro ? 0xe3e7df : isNursery ? 0x7a8b81 : 0x5a3822, isHydro ? .35 : .92, isHydro ? .14 : 0),
      x, isHydro ? .52 : isNursery ? .58 : .17, 0
    )
    scene.add(bed)
    if (!isNursery) {
      const pipe = mesh(new THREE.CylinderGeometry(.032, .032, 11.35, 7), standard(isHydro ? 0x5e8878 : 0x1b2b27, .6), x, isHydro ? .84 : .37, 0)
      pipe.rotation.x = Math.PI / 2
      scene.add(pipe)
    }
  }

  if (['tomato-vine', 'cucumber-vine'].includes(profile.cropModel)) {
    for (let i = 0; i < profile.bedCount; i++) {
      const x = -6.2 + i * (12.4 / Math.max(1, profile.bedCount - 1))
      const wire = mesh(new THREE.CylinderGeometry(.018, .018, 11.6, 6), standard(0x7c9188, .35, .6), x, 3.7, 0)
      wire.rotation.x = Math.PI / 2
      scene.add(wire)
    }
  }
}

function plantBaseY() {
  if (props.detail.scene.cropModel === 'leafy-hydroponic') return .86
  if (props.detail.scene.cropModel === 'seedling-tray') return .96
  return .34
}

async function addPlants() {
  if (!scene || !renderer) return
  try {
    const foliage = await loadDetailedFoliage(`${import.meta.env.BASE_URL}assets/models/potted-plant-02.glb`)
    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
    foliage.traverse(item => {
      const rendered = item as THREE.Mesh
      const sourceMaterials = rendered.isMesh ? (Array.isArray(rendered.material) ? rendered.material : [rendered.material]) : []
      sourceMaterials.forEach(material => {
        const pbr = material as THREE.MeshStandardMaterial
        for (const texture of [pbr.map, pbr.normalMap, pbr.roughnessMap]) if (texture) texture.anisotropy = maxAnisotropy
      })
    })
    props.detail.plants.forEach((plant, index) => {
      const group = new THREE.Group()
      const model = createDetailedCrop(props.detail.scene.cropModel, foliage, index * 97 + 31, plant.status)
      group.add(model)
      group.position.set(plant.positionX, plantBaseY(), plant.positionZ)
      group.userData.id = plant.id
      group.traverse(item => { item.userData.id = plant.id; if ((item as THREE.Mesh).isMesh) selectable.push(item) })
      plantGroups.set(plant.id, group)
      scene!.add(group)
    })

    const samplePositions = props.detail.plants.map(plant => new THREE.Vector2(plant.positionX, plant.positionZ))
    const bedCount = props.detail.scene.bedCount
    const fillerRows = bedCount > 4 ? [-3.1, -1.55, 0, 1.55, 3.1] : [-3.15, -1.55, 1.55, 3.15]
    let fillerIndex = 0
    for (let bed = 0; bed < bedCount; bed++) {
      const x = bedCount === 1 ? 0 : -6.2 + bed * (12.4 / (bedCount - 1))
      for (const z of fillerRows) {
        if (samplePositions.some(position => position.distanceTo(new THREE.Vector2(x, z)) < .62)) continue
        const filler = createDetailedCrop(props.detail.scene.cropModel, foliage, 1000 + fillerIndex * 131, 'normal')
        filler.position.set(x, plantBaseY(), z)
        filler.traverse(item => { const rendered = item as THREE.Mesh; if (rendered.isMesh) rendered.castShadow = fillerIndex % 2 === 0 })
        scene!.add(filler)
        fillerIndex++
      }
    }
    loading.value = false
    updateSelection(false)
  } catch (reason) {
    loading.value = false
    loadError.value = reason instanceof Error ? reason.message : '高精度作物资产加载失败'
  }
}

function fanModel() {
  const group = new THREE.Group()
  const ring = mesh(new THREE.TorusGeometry(.42, .05, 8, 26), standard(0x8fa89f, .3, .7))
  const rotor = new THREE.Group()
  for (let i = 0; i < 4; i++) {
    const blade = mesh(new THREE.BoxGeometry(.28, .055, .09), standard(0x477b65, .48), .17, 0, 0)
    blade.rotation.z = i * Math.PI / 2
    rotor.add(blade)
  }
  rotor.add(mesh(new THREE.CylinderGeometry(.07, .07, .1, 10), standard(0x2d5948, .4), 0, 0, 0))
  ring.rotation.y = Math.PI / 2; rotor.rotation.y = Math.PI / 2
  group.add(ring, rotor); rotors.push(rotor)
  return group
}

function deviceModel(category: string) {
  const group = new THREE.Group()
  const metal = standard(0x91aaa1, .3, .65)
  if (category === 'fan') return fanModel()
  if (category === 'fertigation' || category === 'oxygenator' || category === 'dehumidifier') {
    group.add(mesh(new THREE.CylinderGeometry(.38, .44, 1.15, 18), metal, 0, .58, 0))
    group.add(mesh(new THREE.BoxGeometry(.48, .48, .46), standard(0x315d4c, .4), .52, .3, 0))
    group.add(mesh(new THREE.CylinderGeometry(.035, .035, 1.05, 7), standard(0x286b58, .45), .24, .2, 0))
    return group
  }
  if (category === 'irrigation') {
    group.add(mesh(new THREE.CylinderGeometry(.08, .08, 1.1, 9), metal, 0, .3, 0))
    group.children[0].rotation.z = Math.PI / 2
    for (let i = -2; i <= 2; i++) group.add(mesh(new THREE.CylinderGeometry(.055, .055, .45, 8), standard(i === 0 ? 0xd09b42 : 0x477c69, .5), i * .2, .3, 0))
    return group
  }
  if (category === 'grow-light') {
    for (let i = -2; i <= 2; i++) group.add(mesh(new THREE.BoxGeometry(1.6, .05, .08), new THREE.MeshStandardMaterial({ color: 0xdde4d7, emissive: 0xe4b3c3, emissiveIntensity: .9 }), 0, i * .22, 0))
    return group
  }
  if (category === 'camera') {
    group.add(mesh(new THREE.BoxGeometry(.36, .23, .28), standard(0xd7dfda, .3), 0, 0, 0))
    const lens = mesh(new THREE.CylinderGeometry(.08, .08, .08, 12), standard(0x182c27, .2), 0, 0, .17); lens.rotation.x = Math.PI / 2; group.add(lens)
    return group
  }
  if (category === 'vent') {
    group.add(mesh(new THREE.BoxGeometry(.7, 1.1, .35), standard(0x6f8d80, .35, .4), 0, .55, 0))
    return group
  }
  if (category === 'trap') {
    group.add(mesh(new THREE.BoxGeometry(.48, .62, .025), new THREE.MeshStandardMaterial({ color: 0xe4c94e, emissive: 0x6b5b12, emissiveIntensity: .3 }), 0, .32, 0))
    return group
  }
  group.add(mesh(new THREE.CylinderGeometry(.025, .035, 1.8, 7), metal, 0, .9, 0))
  group.add(mesh(new THREE.BoxGeometry(.28, .38, .22), standard(0x315f4d, .35), 0, 1.65, 0))
  return group
}

function addDevices() {
  if (!scene) return
  props.detail.devices.forEach(device => {
    const model = deviceModel(device.category)
    model.position.set(device.positionX, device.positionY, device.positionZ)
    model.traverse(item => { if ((item as THREE.Mesh).isMesh) { (item as THREE.Mesh).castShadow = true; (item as THREE.Mesh).receiveShadow = true } })
    scene!.add(model)
  })
}

function focusPlant(target: THREE.Object3D) {
  if (!camera || !controls) return
  const bounds = new THREE.Box3().setFromObject(target)
  const center = bounds.getCenter(new THREE.Vector3())
  center.y = Math.max(.6, center.y)
  const direction = camera.position.clone().sub(controls.target).normalize()
  const distance = Math.max(3.8, bounds.getSize(new THREE.Vector3()).length() * 2.2)
  focusTarget = center
  focusCamera = center.clone().add(direction.multiplyScalar(distance))
  if (reduceMotion) {
    controls.target.copy(focusTarget)
    camera.position.copy(focusCamera)
    focusTarget = undefined; focusCamera = undefined
  }
}

function updateSelection(focus = false) {
  if (!scene) return
  if (selection) { scene.remove(selection); selection.geometry.dispose() }
  const target = props.selectedId ? plantGroups.get(props.selectedId) : undefined
  if (target) {
    selection = new THREE.Box3Helper(new THREE.Box3().setFromObject(target).expandByScalar(.08), new THREE.Color(0x69ed8f))
    scene.add(selection)
    if (focus) focusPlant(target)
  }
}

function init() {
  if (!host.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xaccbc2)
  scene.fog = new THREE.Fog(0xaccbc2, 20, 43)
  camera = new THREE.PerspectiveCamera(43, host.value.clientWidth / host.value.clientHeight, .1, 80)
  camera.position.set(13.5, 9.5, 16.5)
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.setSize(host.value.clientWidth, host.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  host.value.appendChild(renderer.domElement)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.target.set(0, 1.45, 0)
  controls.maxPolarAngle = Math.PI / 2.03
  controls.minDistance = 7
  controls.maxDistance = 30
  scene.add(new THREE.HemisphereLight(0xf4fff8, 0x354b32, 2.2))
  const sun = new THREE.DirectionalLight(0xfff4dc, 3.1)
  sun.position.set(-8, 15, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); scene.add(sun)
  addGreenhouseStructure(); addPlants(); addDevices()

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  renderer.domElement.addEventListener('click', event => {
    const rect = renderer!.domElement.getBoundingClientRect()
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    raycaster.setFromCamera(pointer, camera!)
    const hit = raycaster.intersectObjects(selectable, true)[0]
    if (hit?.object.userData.id) {
      const id = hit.object.userData.id as string
      const target = plantGroups.get(id)
      if (target) focusPlant(target)
      emit('select', id)
    }
  })
  resizeObserver = new ResizeObserver(() => {
    if (!host.value || !renderer || !camera) return
    renderer.setSize(host.value.clientWidth, host.value.clientHeight)
    camera.aspect = host.value.clientWidth / host.value.clientHeight
    camera.updateProjectionMatrix()
  })
  resizeObserver.observe(host.value)
  const animate = () => {
    frame = requestAnimationFrame(animate)
    if (!reduceMotion) rotors.forEach(rotor => { rotor.rotation.x += .025 })
    if (focusTarget && focusCamera && camera && controls) {
      controls.target.lerp(focusTarget, .09)
      camera.position.lerp(focusCamera, .09)
      if (controls.target.distanceTo(focusTarget) < .015 && camera.position.distanceTo(focusCamera) < .02) {
        focusTarget = undefined; focusCamera = undefined
      }
    }
    controls?.update(); renderer?.render(scene!, camera!)
  }
  animate()
}

watch(() => props.selectedId, () => updateSelection(true))
onMounted(init)
onBeforeUnmount(() => {
  cancelAnimationFrame(frame); resizeObserver?.disconnect(); controls?.dispose(); renderer?.dispose(); renderer?.domElement.remove()
  scene?.traverse(item => { const rendered = item as THREE.Mesh; rendered.geometry?.dispose?.(); if (Array.isArray(rendered.material)) rendered.material.forEach(material => material.dispose()); else rendered.material?.dispose?.() })
})
</script>

<template>
  <div ref="host" class="twin-host">
    <div v-if="loading" class="loading"><i></i><span>正在载入万面级 PBR 作物资产</span></div>
    <div v-else-if="loadError" class="loading error"><span>{{ loadError }}</span></div>
    <div class="scene-meta"><b>{{ detail.scene.structure }}</b><span>高精度 PBR / {{ detail.scene.bedCount }} 床位 / {{ detail.scene.nominalPlantCount.toLocaleString() }} 株</span></div>
    <div class="hint">拖拽旋转　滚轮缩放　点击植株查看档案</div>
  </div>
</template>

<style scoped lang="scss">
.twin-host{position:absolute;inset:0;overflow:hidden;background:#accbc2}.twin-host canvas{display:block}.loading{position:absolute;z-index:3;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:10px;padding:12px 16px;border:1px solid rgba(255,255,255,.65);border-radius:12px;background:rgba(240,250,244,.82);color:#345940;font-size:11px;backdrop-filter:blur(20px)}.loading.error{border-color:rgba(193,92,65,.28);background:rgba(252,242,237,.9);color:#8a4938}.loading i{width:9px;height:9px;border:2px solid #4c9c63;border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite}.scene-meta{position:absolute;left:18px;top:18px;display:flex;flex-direction:column;padding-left:10px;border-left:2px solid #398b55;color:#244c36}.scene-meta b{font-size:11px}.scene-meta span{margin-top:3px;color:rgba(28,67,46,.62);font:8px ui-monospace,monospace}.hint{position:absolute;left:18px;bottom:18px;padding:8px 11px;border:1px solid rgba(255,255,255,.28);border-radius:8px;background:rgba(9,39,28,.58);color:rgba(255,255,255,.78);font-size:9px;backdrop-filter:blur(14px)}@keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.loading i{animation:none}}
</style>
