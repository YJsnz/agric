import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const materials = {
  stem: new THREE.MeshStandardMaterial({ color: 0x356a3c, roughness: .82 }),
  youngStem: new THREE.MeshStandardMaterial({ color: 0x5b914d, roughness: .78 }),
  tomatoRed: new THREE.MeshPhysicalMaterial({ color: 0xc83f32, roughness: .42, clearcoat: .24 }),
  tomatoOrange: new THREE.MeshPhysicalMaterial({ color: 0xe38d34, roughness: .46, clearcoat: .2 }),
  berryRed: new THREE.MeshPhysicalMaterial({ color: 0xb92f35, roughness: .5, clearcoat: .18 }),
  berryYoung: new THREE.MeshStandardMaterial({ color: 0xe7d46d, roughness: .68 }),
  cucumber: new THREE.MeshPhysicalMaterial({ color: 0x3b793c, roughness: .62, clearcoat: .08 }),
  flowerWhite: new THREE.MeshStandardMaterial({ color: 0xf1eee1, roughness: .75, side: THREE.DoubleSide }),
  flowerYellow: new THREE.MeshStandardMaterial({ color: 0xe5bd35, roughness: .7, side: THREE.DoubleSide }),
  tray: new THREE.MeshStandardMaterial({ color: 0x252d29, roughness: .72 }),
  substrate: new THREE.MeshStandardMaterial({ color: 0x34261c, roughness: 1 })
}

const tomatoGeometry = new THREE.SphereGeometry(.085, 18, 14)
const cherryGeometry = new THREE.SphereGeometry(.064, 16, 12)
const calyxGeometry = new THREE.ConeGeometry(.078, .045, 5)
const cucumberGeometry = new THREE.CapsuleGeometry(.062, .36, 8, 16)
const petalGeometry = new THREE.SphereGeometry(.055, 10, 6)
const seedlingCellGeometry = new THREE.CylinderGeometry(.055, .045, .055, 10)

function seeded(seed: number) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let result = value
    result = Math.imul(result ^ result >>> 15, result | 1)
    result ^= result + Math.imul(result ^ result >>> 7, result | 61)
    return ((result ^ result >>> 14) >>> 0) / 4294967296
  }
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, position: THREE.Vector3) {
  const item = new THREE.Mesh(geometry, material)
  item.position.copy(position)
  item.castShadow = true
  item.receiveShadow = true
  return item
}

function tube(points: THREE.Vector3[], radius: number, material = materials.stem) {
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), Math.max(8, points.length * 7), radius, 7, false), material, new THREE.Vector3())
}

function tintAttention(root: THREE.Object3D) {
  root.traverse(item => {
    const rendered = item as THREE.Mesh
    if (!rendered.isMesh) return
    if (Array.isArray(rendered.material)) {
      rendered.material = rendered.material.map(material => {
        const copy = material.clone() as THREE.MeshStandardMaterial
        copy.color?.multiply(new THREE.Color(0xb29a58))
        return copy
      })
    } else if (rendered.material) {
      const copy = rendered.material.clone() as THREE.MeshStandardMaterial
      copy.color?.multiply(new THREE.Color(0xb29a58))
      rendered.material = copy
    }
  })
}

function canopy(source: THREE.Object3D, scale: THREE.Vector3, yaw: number, status: string) {
  const copy = source.clone(true)
  copy.scale.copy(scale)
  copy.rotation.y = yaw
  copy.traverse(item => {
    const rendered = item as THREE.Mesh
    if (!rendered.isMesh) return
    rendered.castShadow = true
    rendered.receiveShadow = true
    const materialList = Array.isArray(rendered.material) ? rendered.material : [rendered.material]
    materialList.forEach(material => {
      const foliageMaterial = material as THREE.MeshStandardMaterial
      foliageMaterial.side = THREE.DoubleSide
      foliageMaterial.alphaTest = .18
      foliageMaterial.color?.set(0x87b77f)
      foliageMaterial.roughness = .72
    })
  })
  if (status !== 'normal') tintAttention(copy)
  return copy
}

function flower(color: 'white' | 'yellow', scale = 1) {
  const group = new THREE.Group()
  const material = color === 'white' ? materials.flowerWhite : materials.flowerYellow
  for (let index = 0; index < 5; index++) {
    const angle = index / 5 * Math.PI * 2
    const petal = mesh(petalGeometry, material, new THREE.Vector3(Math.cos(angle) * .055, Math.sin(angle) * .055, 0))
    petal.scale.set(1.35, .58, .25)
    petal.rotation.z = angle
    group.add(petal)
  }
  const center = mesh(cherryGeometry, materials.flowerYellow, new THREE.Vector3(0, 0, .018))
  center.scale.setScalar(.38)
  group.add(center)
  group.scale.setScalar(scale)
  return group
}

function tomatoFruit(size: number, ripe: boolean) {
  const group = new THREE.Group()
  const fruit = mesh(size < .08 ? cherryGeometry : tomatoGeometry, ripe ? materials.tomatoRed : materials.tomatoOrange, new THREE.Vector3())
  fruit.scale.setScalar(size / .085)
  const calyx = mesh(calyxGeometry, materials.youngStem, new THREE.Vector3(0, size * .88, 0))
  calyx.rotation.x = Math.PI
  calyx.scale.setScalar(size / .085)
  group.add(fruit, calyx)
  return group
}

function strawberryFruit(ripe: boolean) {
  const profile = [
    new THREE.Vector2(.012, -.13), new THREE.Vector2(.075, -.08), new THREE.Vector2(.098, .01),
    new THREE.Vector2(.082, .1), new THREE.Vector2(.026, .145), new THREE.Vector2(0, .15)
  ]
  const group = new THREE.Group()
  const berry = mesh(new THREE.LatheGeometry(profile, 20), ripe ? materials.berryRed : materials.berryYoung, new THREE.Vector3())
  berry.rotation.z = Math.PI
  const crown = mesh(calyxGeometry, materials.youngStem, new THREE.Vector3(0, .145, 0))
  crown.rotation.x = Math.PI
  group.add(berry, crown)
  return group
}

function tomatoVine(source: THREE.Object3D, random: () => number, status: string, bush = false) {
  const group = new THREE.Group()
  const height = bush ? 1.25 : 2.5
  const lean = (random() - .5) * .16
  group.add(tube([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean * .35, height * .34, 0),
    new THREE.Vector3(-lean * .4, height * .7, .04), new THREE.Vector3(lean, height, 0)
  ], bush ? .032 : .025))
  const foliage = canopy(source, bush ? new THREE.Vector3(.9, 1.15, .9) : new THREE.Vector3(.66, 2.05, .66), random() * Math.PI * 2, status)
  foliage.position.y = bush ? .1 : .12
  group.add(foliage)
  const clusters = bush ? 4 : 5
  for (let clusterIndex = 0; clusterIndex < clusters; clusterIndex++) {
    const side = clusterIndex % 2 ? 1 : -1
    const y = .38 + clusterIndex * (bush ? .19 : .39)
    const branchEnd = new THREE.Vector3(side * (.24 + random() * .08), y - .05, (random() - .5) * .16)
    group.add(tube([new THREE.Vector3(0, y + .08, 0), branchEnd], .012, materials.youngStem))
    const fruitCount = bush ? 3 : 4
    for (let fruitIndex = 0; fruitIndex < fruitCount; fruitIndex++) {
      const fruit = tomatoFruit(bush ? .095 : .072, clusterIndex + fruitIndex > 1)
      fruit.position.copy(branchEnd).add(new THREE.Vector3((fruitIndex - 1.5) * .075, -.06 - fruitIndex % 2 * .06, (fruitIndex % 2 ? 1 : -1) * .05))
      fruit.rotation.set(random() * .3, random() * Math.PI, random() * .2)
      group.add(fruit)
    }
    if (!bush && clusterIndex % 2 === 0) {
      const blossom = flower('yellow', .65)
      blossom.position.set(-side * .18, y + .15, .08)
      blossom.rotation.y = side * Math.PI / 2
      group.add(blossom)
    }
  }
  if (!bush) group.add(tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3.55, 0)], .006, materials.flowerWhite))
  return group
}

function strawberry(source: THREE.Object3D, random: () => number, status: string) {
  const group = new THREE.Group()
  const foliage = canopy(source, new THREE.Vector3(.72, .48, .72), random() * Math.PI * 2, status)
  foliage.position.y = .04
  group.add(foliage)
  for (let index = 0; index < 7; index++) {
    const angle = index / 7 * Math.PI * 2 + random() * .22
    const radius = .2 + random() * .18
    const top = new THREE.Vector3(Math.cos(angle) * radius * .58, .28 + random() * .12, Math.sin(angle) * radius * .58)
    const end = new THREE.Vector3(Math.cos(angle) * radius, .08 + random() * .12, Math.sin(angle) * radius)
    group.add(tube([new THREE.Vector3(0, .14, 0), top, end], .009, materials.youngStem))
    if (index < 5) {
      const berry = strawberryFruit(index !== 0)
      berry.position.copy(end); berry.scale.setScalar(.72 + random() * .18); berry.rotation.z = (random() - .5) * .25
      group.add(berry)
    } else {
      const blossom = flower('white', .72)
      blossom.position.copy(end); blossom.rotation.x = -Math.PI / 2 + .25
      group.add(blossom)
    }
  }
  return group
}

function cucumberVine(source: THREE.Object3D, random: () => number, status: string) {
  const group = new THREE.Group()
  const lean = (random() - .5) * .2
  group.add(tube([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(.06, .75, 0),
    new THREE.Vector3(-.05, 1.5, .04), new THREE.Vector3(lean, 2.65, 0)
  ], .026))
  const foliage = canopy(source, new THREE.Vector3(.8, 2.28, .8), random() * Math.PI * 2, status)
  foliage.position.y = .08
  group.add(foliage)
  for (let index = 0; index < 5; index++) {
    const side = index % 2 ? 1 : -1
    const y = .48 + index * .42
    const branch = new THREE.Vector3(side * (.2 + random() * .13), y, (random() - .5) * .12)
    group.add(tube([new THREE.Vector3(0, y + .12, 0), branch], .012, materials.youngStem))
    const fruit = mesh(cucumberGeometry, materials.cucumber, branch.clone().add(new THREE.Vector3(0, -.2, .03)))
    fruit.rotation.z = .08 * side; fruit.scale.setScalar(.85 + random() * .25); group.add(fruit)
    if (index > 2) {
      const blossom = flower('yellow', .72)
      blossom.position.copy(branch).add(new THREE.Vector3(side * .08, .08, 0)); blossom.rotation.y = side * Math.PI / 2; group.add(blossom)
    }
  }
  group.add(tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 3.55, 0)], .006, materials.flowerWhite))
  return group
}

function seedlingTray(source: THREE.Object3D, random: () => number, status: string) {
  const group = new THREE.Group()
  const tray = mesh(new THREE.BoxGeometry(1.02, .09, .78, 2, 1, 2), materials.tray, new THREE.Vector3(0, .045, 0))
  group.add(tray)
  for (let column = -2; column <= 2; column++) for (let row = -1; row <= 1; row++) {
    const position = new THREE.Vector3(column * .19, .1, row * .23)
    group.add(mesh(seedlingCellGeometry, materials.substrate, position))
  }
  for (let column = -1; column <= 1; column++) {
    const sproutRow = canopy(source, new THREE.Vector3(.18, .2 + random() * .045, .22), random() * Math.PI * 2, status)
    sproutRow.position.set(column * .3, .115, 0)
    group.add(sproutRow)
  }
  return group
}

function leafyHydroponic(source: THREE.Object3D, random: () => number, status: string) {
  const group = new THREE.Group()
  const first = canopy(source, new THREE.Vector3(.72, .58, .72), random() * Math.PI * 2, status)
  const second = canopy(source, new THREE.Vector3(.58, .44, .58), random() * Math.PI * 2, status)
  second.rotation.z = .18; second.position.set(.03, .03, -.02)
  group.add(first, second)
  return group
}

export async function loadDetailedFoliage(url: string) {
  const gltf = await new GLTFLoader().loadAsync(url)
  const leaves = gltf.scene.getObjectByName('potted_plant_02_leaves')?.clone(true)
  if (!leaves) throw new Error('高精度叶片节点不存在')
  const normalized = new THREE.Group()
  normalized.add(leaves)
  normalized.updateMatrixWorld(true)
  const initialBox = new THREE.Box3().setFromObject(normalized)
  const center = initialBox.getCenter(new THREE.Vector3())
  leaves.position.x -= center.x
  leaves.position.z -= center.z
  leaves.position.y -= initialBox.min.y
  normalized.updateMatrixWorld(true)
  const size = new THREE.Box3().setFromObject(normalized).getSize(new THREE.Vector3())
  normalized.scale.setScalar(1 / Math.max(size.y, .001))
  normalized.updateMatrixWorld(true)
  return normalized
}

export function createDetailedCrop(type: string, foliage: THREE.Object3D, seed: number, status = 'normal') {
  const random = seeded(seed)
  const plant = (() => {
    switch (type) {
      case 'tomato-vine': return tomatoVine(foliage, random, status)
      case 'strawberry': return strawberry(foliage, random, status)
      case 'cucumber-vine': return cucumberVine(foliage, random, status)
      case 'seedling-tray': return seedlingTray(foliage, random, status)
      case 'bush-tomato': return tomatoVine(foliage, random, status, true)
      case 'leafy-hydroponic': return leafyHydroponic(foliage, random, status)
      default: return leafyHydroponic(foliage, random, status)
    }
  })()
  const variance = .92 + random() * .16
  plant.scale.multiplyScalar(variance)
  plant.rotation.y = (random() - .5) * .24
  return plant
}
