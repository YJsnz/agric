import * as THREE from 'three'
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import {grid,type GroundPoint} from './orchardGeometry'

const random=(seed:number)=>{const v=Math.sin(seed*12.9898+78.233)*43758.5453;return v-Math.floor(v)}
export function createOrchardMaterials(){
  const wind={value:0};const textures:THREE.Texture[]=[],cache=new Map<string,THREE.MeshStandardMaterial>()
  function texture(kind:'soil'|'bark'|'paving'|'roof'|'fruit'|'grass'){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d')!
    c.fillStyle={soil:'#a49a78',bark:'#827052',paving:'#b6b9b0',roof:'#a2b0ac',fruit:'#d8ca79',grass:'#71886c'}[kind];c.fillRect(0,0,128,128)
    for(let i=0;i<900;i++){const x=random(i+1)*128,y=random(i+501)*128;c.fillStyle=i%2?'#ffffff18':'#182b2522';c.fillRect(x,y,kind==='bark'?1:random(i+29)*3+.4,kind==='bark'?random(i+8)*26:1.3)}
    if(kind==='grass'){for(let i=0;i<1800;i++){const x=random(i+701)*128,y=random(i+1501)*128;c.strokeStyle=i%3?'#45632e1c':'#cfe2ac25';c.lineWidth=.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+(random(i+9)-.5)*3,y-2-random(i+13)*3);c.stroke()}}
    if(kind==='paving'){c.strokeStyle='#63766c44';c.lineWidth=1;for(let x=0;x<=128;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,128);c.stroke()}for(let y=0;y<=128;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(128,y);c.stroke()}}
    if(kind==='roof'){c.strokeStyle='#586d6577';for(let x=0;x<128;x+=8){c.beginPath();c.moveTo(x,0);c.lineTo(x,128);c.stroke()}}
    const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.push(map);return map
  }
  const maps={soil:texture('soil'),bark:texture('bark'),paving:texture('paving'),roof:texture('roof'),fruit:texture('fruit'),grass:texture('grass')}
  function material(color:number,kind?:keyof typeof maps,metalness=0){const key=`${color}-${kind}-${metalness}`;if(!cache.has(key))cache.set(key,new THREE.MeshStandardMaterial({color,map:kind?maps[kind]:null,roughness:metalness?.55:.86,metalness}));return cache.get(key)!}
  return {material,maps,textures,wind}
}
export type OrchardMaterials=ReturnType<typeof createOrchardMaterials>

// Parts are merged by material within each model, retaining its business identity.
export class ModelBuilder{
  readonly group=new THREE.Group()
  private parts=new Map<THREE.Material,THREE.BufferGeometry[]>()
  constructor(private materials:OrchardMaterials){}
  add(geometry:THREE.BufferGeometry,position:THREE.Vector3,color:number,rotation=new THREE.Euler(),kind?:keyof OrchardMaterials['maps'],metal=0){
    const matrix=new THREE.Matrix4().compose(position,new THREE.Quaternion().setFromEuler(rotation),new THREE.Vector3(1,1,1));const transformed=geometry.index?geometry.toNonIndexed():geometry.clone();transformed.applyMatrix4(matrix);geometry.dispose();const mat=this.materials.material(color,kind,metal);if(!this.parts.has(mat))this.parts.set(mat,[]);this.parts.get(mat)!.push(transformed)
  }
  box(w:number,h:number,d:number,x:number,y:number,z:number,color:number,kind?:keyof OrchardMaterials['maps'],rotation=new THREE.Euler()){this.add(new THREE.BoxGeometry(w,h,d),new THREE.Vector3(x,y,z),color,rotation,kind)}
  cylinder(radius:number,height:number,x:number,y:number,z:number,color:number,rotation=new THREE.Euler(),metal=.3){this.add(new THREE.CylinderGeometry(radius,radius,height,12),new THREE.Vector3(x,y,z),color,rotation,undefined,metal)}
  sphere(radius:number,x:number,y:number,z:number,color:number){this.add(new THREE.SphereGeometry(radius,10,6),new THREE.Vector3(x,y,z),color)}
  finish(id?:string){for(const [mat,geometries] of this.parts){const geometry=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!geometry)throw Error('Model geometry merge failed');const mesh=new THREE.Mesh(geometry,mat);mesh.castShadow=true;mesh.receiveShadow=true;if(id)mesh.userData.id=id;this.group.add(mesh)}this.parts.clear();return this.group}
}

export function buildVegetation(polygon:GroundPoint[],kind:'pear'|'jujube'|'wheat',materials:OrchardMaterials){
  const root=new THREE.Group(),wheat=kind==='wheat',points=grid(polygon,wheat?.68:4,wheat?6500:750),dummy=new THREE.Object3D(),color=new THREE.Color()
  if(wheat){
    const stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(.025,.033,1.05,4),materials.material(0xb7a868),points.length*3)
    const grains=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,4,3),materials.material(0xd2b774),points.length*18)
    points.forEach(([x,z],i)=>{for(let k=0;k<3;k++){const px=x+(random(i*3+k)-.5)*.3,pz=z+(random(i*3+k+900)-.5)*.3,h=.8+random(i+30)*.35;dummy.position.set(px,h/2+.18,pz);dummy.rotation.set(.06*Math.sin(i),0,.06*Math.cos(i));dummy.scale.set(1,h,1);dummy.updateMatrix();stems.setMatrixAt(i*3+k,dummy.matrix);for(let n=0;n<6;n++){dummy.position.set(px+(n%2?-.045:.045),h+.18+n*.05,pz);dummy.scale.set(.65,1.2,.6);dummy.updateMatrix();grains.setMatrixAt(i*18+k*6+n,dummy.matrix)}}});root.add(stems,grains);return {root,points:[] as GroundPoint[],occluders:[] as THREE.Object3D[]}
  }
  const trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.24,2,9),materials.material(0xd0c0a1,'bark'),points.length)
  const branches=new THREE.InstancedMesh(new THREE.CylinderGeometry(.055,.1,1,7),materials.material(0xcbb89a,'bark'),points.length*7)
  const foliageMat=materials.material(kind==='pear'?0x739352:0x577941);foliageMat.emissive.setHex(0x28461d);foliageMat.emissiveIntensity=.12
  const clusters=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.58,1),foliageMat,points.length*12)
  const leafGeometry=new THREE.PlaneGeometry(.43,.2,4,2),vertices=leafGeometry.attributes.position
  for(let i=0;i<vertices.count;i++){const x=vertices.getX(i);vertices.setY(i,vertices.getY(i)*Math.max(.08,Math.sin((x/.43+.5)*Math.PI)));vertices.setZ(i,.04*Math.cos(x/.43*Math.PI))}leafGeometry.computeVertexNormals()
  const leafMat=materials.material(kind==='pear'?0x96b469:0x7d9b4b);leafMat.side=THREE.DoubleSide;leafMat.onBeforeCompile=shader=>{shader.uniforms.orchardWind=materials.wind;shader.vertexShader='uniform float orchardWind;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.z += sin(orchardWind + instanceMatrix[3].x * 1.7 + position.x * 3.0) * 0.025;')};leafMat.customProgramCacheKey=()=> 'orchard-leaf-wind-v1' 
  const leaves=new THREE.InstancedMesh(leafGeometry,leafMat,points.length*100)
  const fruitGeometry=kind==='pear'?new THREE.LatheGeometry([[0,0],[.11,.03],[.21,.14],[.22,.27],[.15,.4],[.08,.51],[.04,.56],[0,.56]].map(([x,y])=>new THREE.Vector2(x,y)),14):new THREE.SphereGeometry(.115,8,6)
  const fruits=new THREE.InstancedMesh(fruitGeometry,materials.material(kind==='pear'?0xfff3c2:0xa34531,kind==='pear'?'fruit':undefined),points.length*8)
  const stalks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.017,.023,.17,5),materials.material(0x77603b),points.length*8)
  const align=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0)
  points.forEach(([x,z],i)=>{
    const scale=.88+random(i+200)*.24;dummy.rotation.set(0,i*2.4,0);dummy.position.set(x,1.17,z);dummy.scale.set(scale,1,scale);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix)
    for(let k=0;k<7;k++){const angle=k*2.4+i*.3,start=new THREE.Vector3(x,1.65+k*.11,z),end=new THREE.Vector3(x+Math.sin(angle)*1.35,2.7+(k%3)*.38,z+Math.cos(angle)*1.35),vector=end.clone().sub(start);align.setFromUnitVectors(axis,vector.clone().normalize());dummy.quaternion.copy(align);dummy.position.copy(start.add(end).multiplyScalar(.5));dummy.scale.set(1,vector.length(),1);dummy.updateMatrix();branches.setMatrixAt(i*7+k,dummy.matrix)}
    for(let k=0;k<12;k++){const angle=k*2.4+i*.31,radius=k<3?.35:1.05;dummy.rotation.set(random(k+i)*.7,angle,.2);dummy.position.set(x+Math.sin(angle)*radius,2.7+(k%4)*.32,z+Math.cos(angle)*radius);dummy.scale.set(.9+random(i+k)*.4,.75+random(i+k+9)*.5,1);dummy.updateMatrix();clusters.setMatrixAt(i*12+k,dummy.matrix);color.setHex(kind==='pear'?0x739352:0x577941).multiplyScalar(.8+random(i*12+k)*.4);clusters.setColorAt(i*12+k,color)}
    for(let k=0;k<100;k++){const angle=k*2.399963+i*.31,radius=.75+random(i*100+k)*.9;dummy.position.set(x+Math.sin(angle)*radius,2.5+random(i*100+k+800)*1.35,z+Math.cos(angle)*radius);dummy.rotation.set(random(k+i)*Math.PI,angle,random(k+95)*1.1);dummy.scale.setScalar(.8+random(k+i+900)*.6);dummy.updateMatrix();leaves.setMatrixAt(i*100+k,dummy.matrix);color.setHex(0xffffff).multiplyScalar(.78+random(k+i)*.35);leaves.setColorAt(i*100+k,color)}
    for(let k=0;k<8;k++){const angle=k*2.4+i*.31,radius=1.15+random(i+k)*.25,px=x+Math.sin(angle)*radius,pz=z+Math.cos(angle)*radius,py=2.25+random(i*8+k)*.65;dummy.rotation.set(0,angle,.12*Math.sin(k));dummy.scale.setScalar(.8+random(i+k)*.35);dummy.position.set(px,py,pz);dummy.updateMatrix();fruits.setMatrixAt(i*8+k,dummy.matrix);dummy.position.set(px,py+(kind==='pear'?.59:.17),pz);dummy.scale.set(1,1,1);dummy.updateMatrix();stalks.setMatrixAt(i*8+k,dummy.matrix)}
  })
  trunks.castShadow=branches.castShadow=clusters.castShadow=true;root.add(trunks,branches,clusters,leaves,fruits,stalks)
  return {root,points,occluders:[clusters] as THREE.Object3D[]}
}

export function buildFacility(id:string,kind:'sorting'|'cold'|'soil'|'water',materials:OrchardMaterials){
  const b=new ModelBuilder(materials),small=kind==='soil'||kind==='water',w=small?9:18,d=small?8:12,h=small?4:6,front=d/2
  b.box(w,h,d,0,h/2,0,0xe9e7db);b.box(w+.8,.35,d+.8,0,h+.1,0,kind==='cold'?0x8aa7b2:0xbbc6c0,'roof');b.box(w+.3,.5,d+.3,0,.25,0,0x9ca99d);b.box(w+8,.1,d+8,0,.08,0,0xe4e7dc,'paving')
  // Facade pilasters, rain gutter and a raised service apron.
  for(let x=-w/2+.5;x<w/2;x+=3){b.box(.16,h,.2,x,h/2,front+.08,0xb5c5bb);b.box(.12,h,.2,x,h/2,-front-.08,0xb5c5bb)}
  b.box(w+.5,.18,.22,0,h-.2,front+.3,0x697e73)
  for(const x of [-w/2+.3,w/2-.3])b.cylinder(.07,h-.3,x,(h-.3)/2,front+.3,0x81968b)
  if(small){b.box(1.5,2.5,.15,-2,1.3,front+.13,0x426b5d);b.box(.8,1,.08,-2,1.9,front+.22,0x94b6be);b.sphere(.055,-1.48,1.3,front+.26,0xbac9ad);b.box(2.8,1.4,.15,1.5,2.1,front+.14,0x7fabb0);for(const x of [.15,1.5,2.85])b.box(.065,1.5,.18,x,2.1,front+.25,0xdbe5de);b.box(4,.13,1.3,-.8,3.6,front+.7,0x789a89)}
  else{
    for(const x of [-5,1]){b.box(4.2,3.8,.12,x,2.35,front+.13,0xa8b8b5);for(let y=.6;y<4.3;y+=.28)b.box(4.2,.035,.06,x,y,front+.23,0x667e78);b.box(4.5,.5,2.4,x,.35,front+1.1,0x8c9d92);b.box(.22,1.1,.3,x-2.2,.55,front+2,0xe4b35e);b.box(.22,1.1,.3,x+2.2,.55,front+2,0xe4b35e)}
    b.box(w,.16,3,0,4.8,front+1.4,0x769a88);for(const x of [-8,8])b.cylinder(.085,4.7,x,2.4,front+2.6,0x718a7b)
    for(let x=-w/2+1;x<w/2;x+=2.8){b.box(2.3,1.1,.08,x,4.8,-front-.1,0x8eb2b8);b.box(.08,1.1,.12,x,4.8,-front-.15,0xe4ebe2)}
  }
  // Solar panels include frame and cell grid; equipment has fan and grille details.
  for(let k=0;k<(small?2:5);k++){const x=-w/2+2+k*2.8;b.box(2.4,.09,2.5,x,h+.4,-1,0x748d8a);b.box(2.2,.05,2.3,x,h+.49,-1,0x304f65);for(let j=-1;j<=1;j++)b.box(.025,.025,2.3,x+j*.55,h+.53,-1,0x8ca9b0);for(let j=-1;j<=1;j++)b.box(2.2,.025,.025,x,h+.53,-1+j*.55,0x8ca9b0)}
  for(let k=0;k<(kind==='cold'?3:1);k++){const x=w/2+.6,z=-d/2+2+k*2.2;b.box(1,1.5,1.7,x,1.1,z,0xd1d9d2);b.cylinder(.42,.12,x+.55,1.2,z,0x5c746b,new THREE.Euler(0,0,Math.PI/2));for(let j=0;j<5;j++)b.box(.04,1.3,.04,x+.62,1.2,z-.55+j*.27,0x8c9e94)}
  if(kind==='sorting'||kind==='cold'){
    for(let k=0;k<6;k++){const x=-w/2+1.2+k*.9,z=front+3;b.box(.8,.12,.7,x,.2,z,0xa38d66);for(let j=0;j<3;j++)b.box(.74,.03,.1,x,.28,z-.23+j*.23,0xc5b184);b.box(.68,.55,.6,x,.6,z,kind==='sorting'?0x66885b:0xb2baa0);for(let j=0;j<3;j++)b.box(.02,.34,.6,x-.23+j*.23,.6,z,0x40593f)}
    // Parked produce trailer: wheels, frame, crate deck and tow bar.
    const x=5,z=front+3;b.box(3.5,.18,1.5,x,.6,z,0x476d5b);b.box(3.2,.15,1.4,x,.9,z,0xa9a882);b.box(1.4,.12,.15,x-2.2,.5,z,0x839384);for(const dx of [-1,1])for(const dz of [-.8,.8]){b.cylinder(.4,.25,x+dx,.42,z+dz,0x37453e,new THREE.Euler(Math.PI/2,0,0),0);b.cylinder(.19,.27,x+dx,.42,z+dz,0x9bac9e,new THREE.Euler(Math.PI/2,0,0))}
  }
  if(kind==='water'){
    for(let k=0;k<2;k++){const x=-7-k*3;b.cylinder(1.1,3.2,x,1.8,-1,0x88a69d);b.sphere(1.08,x,3.4,-1,0x88a69d);b.cylinder(.13,3,x,.7,3,0x49695c,new THREE.Euler(Math.PI/2,0,0));b.box(1.4,.8,1,x,.7,front+2,0x4d7f69);b.cylinder(.4,.7,x,1.25,front+2,0x7e9b8b);b.cylinder(.35,.05,x,1.9,front+2,0xbc8150,new THREE.Euler(Math.PI/2,0,0))}
  }
  return {root:b.finish(id),width:w,depth:d}
}

export function buildDevice(id:string,materials:OrchardMaterials){
  const b=new ModelBuilder(materials),weather=id==='yt-weather',valve=id==='yt-valve',height=weather?9:valve?1:5
  if(valve){b.box(2,.15,1.4,0,.1,0,0xb4beb1,'paving');b.box(1.6,.7,1.1,0,.5,0,0x526e61);for(const x of [-.6,.6]){b.cylinder(.08,2,x,.4,0,0x719781,new THREE.Euler(Math.PI/2,0,0));b.cylinder(.25,.05,x,.95,0,0xb58d55)}b.box(.6,.4,.5,0,1.1,0,0xb4c4b6)}
  else{
    b.box(1,.2,1,0,.1,0,0xb7c0b3,'paving');b.cylinder(.1,height,0,height/2,0,0xa5b8ae);b.box(.65,1,.35,0,2.5,0,0xe2e9df);b.box(.2,.1,.03,.1,2.6,.2,0x446c5d);b.box(1.5,.12,1,0,3.7,-.6,0x33546a,undefined,new THREE.Euler(-.25,0,0))
    if(weather){b.box(3,.12,.12,0,7.8,0,0xc4d3c7);for(let j=0;j<5;j++)b.cylinder(.3,.08,-1,7.9+j*.13,0,0xe8eee2);b.cylinder(.07,1,1.2,8.4,0,0x9bb3a4);for(let j=0;j<3;j++){const a=j*Math.PI*2/3;b.sphere(.16,1.2+Math.sin(a)*.55,9,Math.cos(a)*.55,0x849b91);b.box(.65,.04,.04,1.2+Math.sin(a)*.25,9,Math.cos(a)*.25,0xbacbbd,undefined,new THREE.Euler(0,a,0))}b.cylinder(.22,.4,0,8.2,0,0x668177)}
    else{b.box(1,.12,.15,.4,height-.4,0,0xa2b9aa);b.box(.8,.35,.4,.9,height-.2,0,0xd8e3d7);b.cylinder(.12,.08,.9,height-.2,.24,0x263f38,new THREE.Euler(Math.PI/2,0,0));b.box(.9,.06,.5,.9,height+.02,0,0x8ea899)}
  }
  return b.finish(id)
}

