import * as THREE from 'three'
import type {BridgeSurface} from './orchardNavigation'
import type {OrchardMaterials} from './orchardModels'
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {imageToGround, bounds, inside, type GroundPoint} from './orchardGeometry'

// Procedural assets keep the site available offline and share the parcel projection.
export function buildEnvironment(scene:THREE.Scene, polygons:GroundPoint[][],sitePoints:GroundPoint[],materials:OrchardMaterials){
  const previous=new Set(scene.children)
  const irrigation=new THREE.Group();irrigation.name='irrigation';scene.add(irrigation)
  const palette=new Map<number,THREE.MeshStandardMaterial>()
  const mat=(color:number)=>{if(!palette.has(color))palette.set(color,new THREE.MeshStandardMaterial({color,roughness:.8}));return palette.get(color)!}
  function box(w:number,h:number,d:number,x:number,y:number,z:number,color:number,parent:THREE.Object3D=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function segment(a:GroundPoint,b:GroundPoint,width:number,height:number,y:number,color:number,parent:THREE.Object3D=scene){const m=box(width,height,Math.hypot(b[0]-a[0],b[1]-a[1]),(a[0]+b[0])/2,y,(a[1]+b[1])/2,color,parent);m.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);return m}
  const points=sitePoints.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1])
  const cross=(a:GroundPoint,b:GroundPoint,c:GroundPoint)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
  const lower:GroundPoint[]=[],upper:GroundPoint[]=[]
  for(const p of points){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p)}
  for(const p of points.slice().reverse()){while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p)}
  const hull=lower.slice(0,-1).concat(upper.slice(0,-1)),extent=bounds(points),cx=(extent.minX+extent.maxX)/2,cz=(extent.minZ+extent.maxZ)/2
  const corners:GroundPoint[]=hull.map(([x,z])=>{const length=Math.hypot(x-cx,z-cz);return [x+(x-cx)/length*5,z+(z-cz)/length*5]})
  const outline=new THREE.Shape(corners.map(([x,z])=>new THREE.Vector2(x,-z))),baseGeometry=new THREE.ExtrudeGeometry(outline,{depth:.8,bevelEnabled:false});baseGeometry.rotateX(-Math.PI/2)
  const base=new THREE.Mesh(baseGeometry,[materials.material(0xc6d0bd,'grass'),mat(0x7e995e)]);base.position.y=-.8;base.receiveShadow=true;scene.add(base)
  corners.forEach((a,i)=>{const b=corners[(i+1)%corners.length];segment(a,b,2.5,.09,.12,0xe6d8ba);segment(a,b,.12,.12,1.2,0x8b9b8b);const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/5);for(let j=0;j<n;j++){const t=j/n;box(.16,1.5,.16,a[0]+(b[0]-a[0])*t,.75,a[1]+(b[1]-a[1])*t,0x829782)}})
  for(const polygon of polygons){const b=bounds(polygon);for(let z=b.minZ+2;z<b.maxZ;z+=4){let start:number|null=null;for(let x=b.minX;x<=b.maxX+.5;x+=.5){const hit=x<=b.maxX&&inside([x,z],polygon);if(hit&&start===null)start=x;if(!hit&&start!==null){segment([start,z],[x-.5,z],.055,.055,.25,0x304e45,irrigation);start=null}}}}
  // Canal banks and a service bridge follow the same image-space water corridor.
  const banks=[[[1535,469],[923,1024]],[[1535,676],[825,1024]]] as GroundPoint[][]
  for(const bank of banks){const [a,b]=bank.map(p=>imageToGround(...p));segment(a,b,.8,.5,.05,0xc1c9aa)}
  const a=imageToGround(1190,720),b=imageToGround(1480,740),length=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/length,uz=(b[1]-a[1])/length,nx=uz,nz=-ux
  const bridge:BridgeSurface={start:a,end:b,width:3.5,height:.825,rampLength:3}
  segment(a,b,bridge.width,.35,.65,0xb8bcb4)
  function ramp(from:GroundPoint,to:GroundPoint,fromY:number,toY:number){const w=bridge.width/2,geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([from[0]-nx*w,fromY,from[1]-nz*w,from[0]+nx*w,fromY,from[1]+nz*w,to[0]-nx*w,toY,to[1]-nz*w,to[0]+nx*w,toY,to[1]+nz*w],3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));geometry.setIndex([0,2,1,1,2,3]);geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,mat(0xc7ccb9));mesh.receiveShadow=true;scene.add(mesh)}
  ramp([a[0]-ux*3,a[1]-uz*3],a,.14,bridge.height);ramp(b,[b[0]+ux*3,b[1]+uz*3],bridge.height,.14)
  for(const offset of [-1.65,1.65]){const left:GroundPoint=[a[0]+nx*offset,a[1]+nz*offset],right:GroundPoint=[b[0]+nx*offset,b[1]+nz*offset];segment(left,right,.1,.1,1.8,0x82948d);for(let t=0;t<=1;t+=.2)box(.12,1.2,.12,left[0]+(right[0]-left[0])*t,1.25,left[1]+(right[1]-left[1])*t,0x82948d)}
  // Hundreds of fence and pipe sections should not become hundreds of draw calls.
  function mergeParts(parent:THREE.Object3D,objects:THREE.Object3D[]){
    const batches=new Map<THREE.Material,THREE.BufferGeometry[]>()
    for(const object of objects){if(!(object instanceof THREE.Mesh)||Array.isArray(object.material))continue;object.updateMatrix();const geometry=object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone();geometry.applyMatrix4(object.matrix);if(!batches.has(object.material))batches.set(object.material,[]);batches.get(object.material)!.push(geometry);parent.remove(object);object.geometry.dispose()}
    for(const [material,geometries] of batches){const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!geometry)throw Error('Environment geometry merge failed');const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh)}
  }
  mergeParts(irrigation,irrigation.children.slice());mergeParts(scene,scene.children.filter(o=>!previous.has(o)))
  return {irrigation,boundary:corners,bridges:[bridge]}
}
