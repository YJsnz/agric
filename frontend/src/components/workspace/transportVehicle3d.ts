import * as THREE from 'three'
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {mergeGeometries,mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Model units are metres in the local rig; the scene adapter sets its map scale.
// +X is the nose, Y is up, and all four tire contact points have Y=0.
export function buildDetailedTransportVehicle(environment?:THREE.Texture){
 const root=new THREE.Group();root.name='transport-cart-01'
 const chassis=new THREE.Group();chassis.name='sprung-body';root.add(chassis)
 const materials:THREE.Material[]=[],textures:THREE.Texture[]=[]
 const material=(color:number,roughness=.55,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness,envMap:environment??null,envMapIntensity:.65});materials.push(m);return m}
 const paint=new THREE.MeshPhysicalMaterial({color:0x20563c,metalness:.42,roughness:.28,clearcoat:.8,clearcoatRoughness:.25,envMap:environment??null,envMapIntensity:.75});materials.push(paint)
 const cream=material(0xe9e5d3,.38,.1),rubber=material(0x202624,.9),frame=material(0x303a36,.55,.5),silver=material(0xbcc7bf,.3,.8),rim=material(0x426d4c,.32,.65),glass=material(0x153641,.22,.6),black=material(0x111c1a,.42,.25)
 const led=material(0xe6f4ed,.25);led.emissive.setHex(0xc2e9dd);led.emissiveIntensity=1.1
 const red=material(0xb63524,.3);red.emissive.setHex(0xb52a16);red.emissiveIntensity=.3
 const batches=new Map<THREE.Group,Map<THREE.Material,THREE.BufferGeometry[]>>()
 function part(group:THREE.Group,geometry:THREE.BufferGeometry,mat:THREE.Material,x=0,y=0,z=0,rx=0,ry=0,rz=0){
  const transform=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1))
  const g=geometry.index?geometry.toNonIndexed():geometry;g.applyMatrix4(transform)
  if(g!==geometry)geometry.dispose()
  if(!batches.has(group))batches.set(group,new Map());const bucket=batches.get(group)!
  if(!bucket.has(mat))bucket.set(mat,[]);bucket.get(mat)!.push(g)
 }
 function box(group:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material,r=.02,rz=0){part(group,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w*.2,h*.2,d*.2)),mat,x,y,z,0,0,rz)}
 function cylinder(group:THREE.Group,r:number,h:number,x:number,y:number,z:number,mat:THREE.Material,axis:'x'|'y'|'z'='y',segments=24){part(group,new THREE.CylinderGeometry(r,r,h,segments),mat,x,y,z,axis==='z'?Math.PI/2:0,0,axis==='x'?Math.PI/2:0)}
 function sphere(group:THREE.Group,r:number,x:number,y:number,z:number,mat:THREE.Material,sx=1,sy=1,sz=1){const g=new THREE.SphereGeometry(r,12,8);g.scale(sx,sy,sz);part(group,g,mat,x,y,z)}
 // Undercarriage rails, battery enclosure and soft-edged bumper.
 box(chassis,1.76,.12,.86,0,.34,0,frame,.035)
 box(chassis,.9,.15,.68,-.12,.245,0,black,.035)
 for(const z of [-.4,.4])box(chassis,1.48,.055,.055,-.03,.245,z,silver)
 box(chassis,.13,.14,1.05,.91,.33,0,rubber,.045)
 box(chassis,.12,.12,.98,-.92,.39,0,frame,.03)
 // A curved hood profile rather than a collection of rectangular blocks.
 const hood=new THREE.Shape();hood.moveTo(.01,.46);hood.lineTo(.01,.8);hood.quadraticCurveTo(.1,.93,.29,.91);hood.lineTo(.78,.83);hood.quadraticCurveTo(.92,.8,.94,.62);hood.lineTo(.94,.45);hood.closePath()
 const hull=new THREE.ExtrudeGeometry(hood,{depth:.88,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:12});hull.translate(0,0,-.44);part(chassis,hull,paint)
 box(chassis,.11,.34,.91,.943,.62,0,cream,.045)
 for(const z of [-.29,.29]){box(chassis,.016,.038,.22,1.002,.71,z,black,.012);box(chassis,.018,.013,.18,1.013,.712,z,led,.005)}
 for(const z of [-.22,0,.22]){cylinder(chassis,z===0?.044:.024,.018,1.01,.58,z,black,'x');cylinder(chassis,z===0?.027:.012,.02,1.023,.58,z,glass,'x')}
 box(chassis,.019,.04,.22,1.01,.47,0,black,.012)
 for(const z of [-.25,.25]){box(chassis,.45,.008,.012,.44,.89,z,frame,.002);for(let i=0;i<7;i++)box(chassis,.012,.15,.015,.1,.65,z*1.87+i*.002,black,.002)}
 // Lidar with layered glass band, collars, and mounting plate.
 cylinder(chassis,.12,.02,.46,.905,0,black);cylinder(chassis,.105,.11,.46,.97,0,glass)
 cylinder(chassis,.111,.024,.46,1.037,0,cream);cylinder(chassis,.11,.017,.46,.916,0,cream)
 for(let i=0;i<16;i++){const a=i*Math.PI/8;box(chassis,.006,.074,.006,.46+Math.cos(a)*.106,.971,Math.sin(a)*.106,silver,.001)}
 // Side maker plate uses a local texture; no remote model or texture fetches.
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=96;const ctx=canvas.getContext('2d')!
  ctx.fillStyle='#214b37';ctx.fillRect(0,0,256,96);ctx.fillStyle='#e0e6d5';ctx.font='600 30px sans-serif';ctx.textAlign='center';ctx.fillText('盐田丰语',128,44);ctx.font='18px sans-serif';ctx.fillStyle='#abbda8';ctx.fillText('YT • AUTONOMOUS 01',128,74)
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture)
  const label=material(0xffffff,.55);label.map=texture
  for(const side of [-1,1])part(chassis,new THREE.PlaneGeometry(.37,.14),label,.39,.58,side*.477,0,side<0?Math.PI:0)
 }
 // Rear bed: raised panel edges, latches, hinge barrels and stainless fasteners.
 box(chassis,1.05,.1,.98,-.43,.57,0,paint,.03)
 for(const z of [-.47,.47]){
  box(chassis,1.04,.28,.055,-.43,.75,z,paint,.025)
  box(chassis,.83,.15,.013,-.43,.748,z*1.072,frame,.012)
  box(chassis,.75,.11,.014,-.43,.748,z*1.09,paint,.012)
  box(chassis,1.075,.025,.064,-.43,.897,z,frame,.012)
  for(const x of [-.91,-.42,.04]){box(chassis,.04,.25,.016,x,.74,z*1.09,silver,.006);for(const y of [.64,.83])sphere(chassis,.009,x,y,z*1.116,silver)}
 }
 box(chassis,.065,.28,.94,-.98,.75,0,paint,.024)
 box(chassis,.018,.17,.77,-1.018,.744,0,frame,.018)
 box(chassis,.018,.125,.7,-1.03,.748,0,paint,.015)
 for(const z of [-.31,.31]){cylinder(chassis,.023,.12,-1.027,.61,z,silver,'z');box(chassis,.028,.062,.13,-1.028,.48,z,red,.008)}
 // Soft contact shadow remains readable in the low-power scene mode.
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d')!,gradient=ctx.createRadialGradient(64,64,8,64,64,62)
  gradient.addColorStop(0,'rgba(10,25,18,.34)');gradient.addColorStop(.65,'rgba(10,25,18,.19)');gradient.addColorStop(1,'rgba(10,25,18,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128)
  const texture=new THREE.CanvasTexture(canvas);textures.push(texture);const mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});materials.push(mat)
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.45,1.55),mat);shadow.name='contact-shadow';shadow.rotation.x=-Math.PI/2;shadow.position.y=.002;root.add(shadow)
 }
 // Modelled fender arches follow the four tire envelopes.
 for(const x of [-.59,.59])for(const z of [-.55,.55]){
  const arch=new THREE.Shape();arch.moveTo(.34,0);arch.absarc(0,0,.34,0,Math.PI,false);arch.lineTo(-.29,0);arch.absarc(0,0,.29,Math.PI,0,true);arch.closePath()
  const g=new THREE.ExtrudeGeometry(arch,{depth:.27,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:20});g.translate(0,0,-.135);part(chassis,g,frame,x,.273,z)
  cylinder(chassis,.018,.19,x,.34,z*.58,silver,'z')
  const springPoints=Array.from({length:41},(_,i)=>new THREE.Vector3(x+Math.sin(i/40*Math.PI*12)*.024,.33+i/40*.2,z*.75+Math.cos(i/40*Math.PI*12)*.024))
  part(chassis,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(springPoints),40,.006,5,false),silver)
  cylinder(chassis,.013,.22,x,.42,z*.75,black)
 }
 const wheels:{steer:THREE.Group;roll:THREE.Group;front:boolean;side:number}[]=[]
 for(const x of [-.59,.59])for(const z of [-.57,.57]){
  const steer=new THREE.Group(),roll=new THREE.Group();steer.position.set(x,.273,z);steer.add(roll);root.add(steer);steer.name=x>0?'front-steering-wheel':'rear-drive-wheel'
  const profile=[new THREE.Vector2(.145,-.114),new THREE.Vector2(.205,-.112),new THREE.Vector2(.24,-.09),new THREE.Vector2(.255,-.055),new THREE.Vector2(.257,0),new THREE.Vector2(.255,.055),new THREE.Vector2(.24,.09),new THREE.Vector2(.205,.112),new THREE.Vector2(.145,.114)]
  part(roll,new THREE.LatheGeometry(profile,48),rubber,0,0,0,Math.PI/2)
  cylinder(roll,.151,.232,0,0,0,rim,'z',32)
  for(const side of [-1,1]){
   part(roll,new THREE.TorusGeometry(.151,.011,8,40),silver,0,0,side*.122)
   cylinder(roll,.057,.012,0,0,side*.132,black,'z')
   cylinder(roll,.037,.018,0,0,side*.143,rim,'z')
   for(let i=0;i<6;i++){const a=i*Math.PI/3;box(roll,.075,.025,.014,Math.cos(a)*.092,Math.sin(a)*.092,side*.126,silver,.004,a);sphere(roll,.009,Math.cos(a)*.052,Math.sin(a)*.052,side*.154,silver)}
  }
  // Chevron tread blocks are one instanced draw per wheel.
  const tread=new THREE.InstancedMesh(new RoundedBoxGeometry(.053,.027,.086,1,.004),rubber,64),dummy=new THREE.Object3D()
  let n=0;for(let i=0;i<32;i++)for(const side of [-1,1]){const a=i*Math.PI/16;dummy.position.set(Math.cos(a)*.255,Math.sin(a)*.255,side*.057);dummy.rotation.set(0,side*.38,a+Math.PI/2);dummy.updateMatrix();tread.setMatrixAt(n++,dummy.matrix)}
  tread.instanceMatrix.needsUpdate=true;tread.castShadow=true;roll.add(tread)
  wheels.push({steer,roll,front:x>0,side:z>0?1:-1})
 }
 // Cargo is a real task state: an empty bed remains empty until LOAD.
 const cargo=new THREE.Group(),produce=new THREE.Group(),bags=new THREE.Group(),tools=new THREE.Group();cargo.name='task-cargo';cargo.add(produce,bags,tools);chassis.add(cargo)
 const timber=material(0xb18b55,.85),timberEdge=material(0x765733,.9),leaf=material(0x467839,.75),pear=material(0xc6ba61,.68),tomato=material(0xb45237,.6),sack=material(0xd5cfb1,.95)
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d')!
  ctx.fillStyle='#ad8858';ctx.fillRect(0,0,256,128)
  for(let i=0;i<100;i++){ctx.strokeStyle=i%3?'#76513044':'#dcc39b66';ctx.lineWidth=i%5? .7:1.5;ctx.beginPath();for(let x=0;x<=256;x+=8){const y=i*1.28+Math.sin(x*.025+i*.8)*1.8+Math.sin(x*.08+i)*.5;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;textures.push(texture);timber.map=texture;timber.color.setHex(0xffffff)
 }
 for(const z of [-.22,.22]){
  box(produce,.76,.03,.38,-.43,.655,z,timber,.009)
  for(const side of [-1,1])for(let row=0;row<3;row++){
   box(produce,.79,.064,.022,-.43,.705+row*.075,z+side*.19,timber,.005)
   box(produce,.025,.064,.37,-.43+side*.385,.705+row*.075,z,timber,.004)
  }
  for(const x of [-.79,-.07])for(const side of [-1,1]){box(produce,.025,.25,.028,x,.755,z+side*.18,timberEdge,.004);for(const y of [.69,.82])sphere(produce,.006,x,y,z+side*.195,black)}
  for(let i=0;i<12;i++){const px=-.73+(i%4)*.19,pz=z+Math.floor(i/4)*.105-.105; sphere(produce,.064,px,.92,pz,z<0?pear:tomato,1,z<0?1.2:1,1);if(z<0)cylinder(produce,.005,.033,px,.997,pz,timberEdge);sphere(produce,.042,px,.968,pz,leaf,1.5,.15,.65)}
 }
 for(const x of [-.68,-.22])for(const z of [-.2,.2]){box(bags,.39,.22,.33,x,.73,z,sack,.06);box(bags,.35,.008,.012,x,.843,z,leaf,.003)}
 for(const z of [-.2,.08,.29]){cylinder(tools,.015,.62,-.5,.73,z,timber,'x');box(tools,.12,.1,.11,-.13,.73,z,silver,.02)}
 // Bake static parts by material; articulated wheel groups remain independent.
 for(const [group,bucket] of batches)for(const [mat,geometries] of bucket){const merged=mergeGeometries(geometries)!;const geometry=mergeVertices(merged,1e-5);merged.dispose();geometries.forEach(g=>g.dispose());const mesh=new THREE.Mesh(geometry,mat);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh)}
 let meshCount=0,triangles=0;root.traverse(o=>{if(o instanceof THREE.Mesh){meshCount++;triangles+=(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3*(o instanceof THREE.InstancedMesh?o.count:1)}})
 return {root,chassis,wheels,cargo,meshCount,triangles,setCargo(loaded:boolean,goods=''){cargo.visible=loaded;const cropColor=/鸭梨/.test(goods)?0xc6ba61:/小枣/.test(goods)?0x9d4426:0xb45237;tomato.color.setHex(cropColor);pear.color.setHex(/小枣/.test(goods)?0x9d4426:0xc6ba61);const type=/肥料|种子|农资/.test(goods)?'bags':/工具/.test(goods)?'tools':'produce';produce.visible=type==='produce';bags.visible=type==='bags';tools.visible=type==='tools'},dispose(){const geometries=new Set<THREE.BufferGeometry>();root.traverse(o=>{if(o instanceof THREE.Mesh)geometries.add(o.geometry)});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose())}}
}
