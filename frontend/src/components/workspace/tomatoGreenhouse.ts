import * as THREE from 'three'
import { bounds, inside, type GroundPoint } from './orchardGeometry'

/** Individual arched bays fit inside the calibrated parcel without changing its perimeter. */
export function buildTomatoGreenhouse(polygon: GroundPoint[], id: string) {
  const group = new THREE.Group()
  const b = bounds(polygon)
  const steel = new THREE.MeshStandardMaterial({ color: 0xc6d7d0, metalness: .8, roughness: .28 })
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xd3e9dc, transparent: true, opacity: .28, roughness: .2, side: THREE.DoubleSide, depthWrite: false })
  const green = new THREE.MeshStandardMaterial({ color: 0x377743, roughness: .85 })
  const red = new THREE.MeshStandardMaterial({ color: 0xcc3925, roughness: .4 })
  const leaf = new THREE.SphereGeometry(.19, 5, 4), fruit = new THREE.SphereGeometry(.09, 7, 5)
  function add(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData.id=id; group.add(mesh); return mesh
  }
  for (let z=b.minZ+3; z<b.maxZ-3; z+=6.5) for(let x=b.minX+2; x<b.maxX-2; x+=4.4) {
    if(![[-2,-3],[2,-3],[-2,3],[2,3]].every(([dx,dz])=>inside([x+dx,z+dz],polygon)))continue
    for(const dz of [-3,-1.5,0,1.5,3]) {
      const points=Array.from({length:17},(_,i)=>new THREE.Vector3(x+2*Math.cos(Math.PI*i/16),.3+2.8*Math.sin(Math.PI*i/16),z+dz))
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.035,5,false),steel,0,0,0)
    }
    const roof=new THREE.CylinderGeometry(2,2,6,24,1,true,0,Math.PI);roof.rotateZ(Math.PI/2);roof.rotateY(Math.PI/2)
    add(roof,glass,x,.3,z).scale.y=1.4
    for(const side of [-1,1]) for(let row=0;row<8;row++) {
      const px=x+side*.95,pz=z-2.6+row*.74
      add(new THREE.CylinderGeometry(.025,.035,1.8,5),green,px,.9,pz)
      for(let level=0;level<4;level++) {
        add(leaf,green,px+side*.18,.55+level*.36,pz).scale.set(1.3,.4,1)
        add(fruit,red,px-side*.15,.6+level*.3,pz+.12)
      }
      add(new THREE.CylinderGeometry(.008,.008,2.7,3),steel,px,1.35,pz)
    }
  }
  return group
}
