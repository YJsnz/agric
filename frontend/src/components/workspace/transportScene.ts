import * as THREE from 'three'
import {imageToGround} from './orchardGeometry'
import {transportHeading,transportAnimating,type TransportState} from '@/api/transport'
import {TransportMotion} from './transportMotion'
import {buildDetailedTransportVehicle} from './transportVehicle3d'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js'
function mapUnit(x:number,y:number){const p=imageToGround(x,y),xp=imageToGround(x+1,y),yp=imageToGround(x,y+1);const ax=xp[0]-p[0],az=xp[1]-p[1],bx=yp[0]-p[0],bz=yp[1]-p[1],tr=ax*ax+az*az+bx*bx+bz*bz,det=ax*bz-az*bx;return Math.sqrt(Math.max(.00001,(tr-Math.sqrt(Math.max(0,tr*tr-4*det*det)))/2))}
export function buildTransportScene(scene:THREE.Scene,renderer:THREE.WebGLRenderer){
 const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(renderer),reflection=generator.fromScene(room,.04)
 room.dispose();generator.dispose()
 const vehicle=buildDetailedTransportVehicle(reflection.texture),{root,chassis,wheels}=vehicle;root.scale.setScalar(1);scene.add(root)
 const animator=new TransportMotion(.95,2.3,4);let pose={leftRoll:0,rightRoll:0,steering:0,bob:0,moving:false,turning:false}
 const obstacleObjects=new Map<string,THREE.Group>();let lastUpdate=performance.now(),mapPosition={x:1320,y:348};
 const roads=new THREE.Group();roads.name='transport-approved-road-corridors';scene.add(roads);let hash=''
 const routeLine=new THREE.Group();routeLine.name='transport-active-route';scene.add(routeLine);let routeHash=''
 function rebuild(s:TransportState,status:{id:string;legal:boolean}[]){const next=s.mapVersion+':'+s.roads.map(r=>r.id+':'+r.blocked+':'+status.find(v=>v.id===r.id)?.legal).join('|');if(next===hash)return;hash=next;for(const child of [...roads.children]){roads.remove(child);const mesh=child as THREE.Mesh;mesh.geometry.dispose();(mesh.material as THREE.Material).dispose()}
  for(const r of s.roads){if(!status.find(v=>v.id===r.id)?.legal)continue;const a=s.stops.find(n=>n.id===r.a)!,b=s.stops.find(n=>n.id===r.b)!;const length=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/length*8,ny=(b.x-a.x)/length*8;const vertices=[[a.x+nx,a.y+ny],[a.x-nx,a.y-ny],[b.x+nx,b.y+ny],[b.x-nx,b.y-ny]].map(([x,y])=>imageToGround(x,y));const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices.flatMap(([x,z])=>[x,.18,z]),3));geo.setIndex([0,1,2,2,1,3]);geo.computeVertexNormals();const material=new THREE.MeshStandardMaterial({color:r.blocked?0xb29e8c:0xc8d2bd,roughness:1,side:THREE.DoubleSide});const mesh=new THREE.Mesh(geo,material);mesh.receiveShadow=true;roads.add(mesh)}
 }
 return {hitTest(ray:THREE.Raycaster){return root.visible?ray.intersectObject(root,true).find(hit=>hit.object instanceof THREE.Mesh&&hit.object.name!=='contact-shadow')?.distance:undefined},dispose(){vehicle.dispose();reflection.dispose();for(const child of routeLine.children){const mesh=child as THREE.Mesh;mesh.geometry.dispose();(mesh.material as THREE.Material).dispose()}},diagnostics:()=>({visible:root.visible,mapX:mapPosition.x,mapY:mapPosition.y,x:root.position.x,z:root.position.z,scale:root.scale.x,routeSegments:routeLine.children.length,yaw:root.rotation.y,direction:0,modelMeshes:vehicle.meshCount,modelTriangles:vehicle.triangles,loaded:vehicle.cargo.visible,leftRoll:pose.leftRoll,rightRoll:pose.rightRoll,steering:pose.steering,moving:pose.moving,turning:pose.turning}),update(s:TransportState|undefined,status:{id:string;legal:boolean}[],position:{x:number;y:number},time=performance.now()){root.visible=!!s;if(!s)return;mapPosition=position;const [x,z]=imageToGround(position.x,position.y);const heading=transportHeading(time),forward=imageToGround(position.x+Math.cos(heading)*5,position.y+Math.sin(heading)*5),groundHeading=Math.atan2(forward[1]-z,forward[0]-x);animator.setMetrics(root.scale.x*.273,root.scale.x*.57,root.scale.x*1.18);pose=animator.update(x,z,groundHeading,time,!s.emergency&&transportAnimating(time),s.mapVersion);root.position.set(x,.18,z);const now=time,dt=Math.min(.5,(now-lastUpdate)/1000);lastUpdate=now;root.rotation.y=-groundHeading
 for(const wheel of wheels){wheel.roll.rotation.z=-(wheel.side>0?pose.rightRoll:pose.leftRoll);wheel.steer.rotation.y=wheel.front?-pose.steering:0}
 chassis.position.y=matchMedia('(prefers-reduced-motion:reduce)').matches?0:pose.bob*.007
 const loaded=s.tasks.find(t=>t.loaded&&['RUNNING','BLOCKED','PAUSED','WAIT_UNLOAD'].includes(t.status));vehicle.setCargo(!!loaded,loaded?.goods)
 rebuild(s,status);
 const active=s.tasks.find(t=>['RUNNING','PAUSED','BLOCKED','WAIT_LOAD','WAIT_UNLOAD'].includes(t.status)),route=active?.route||[]
 const signature=s.mapVersion+':'+route.join('|')+s.roads.filter(r=>r.blocked).map(r=>r.a+':'+r.b).join('|')+status.filter(r=>r.legal).map(r=>r.id).join('|')
 if(signature!==routeHash){
  routeHash=signature
  for(const child of [...routeLine.children]){routeLine.remove(child);const mesh=child as THREE.Mesh;mesh.geometry.dispose();(mesh.material as THREE.Material).dispose()}
  for(let i=1;i<route.length;i++){
   const road=s.roads.find(r=>(r.a===route[i-1]&&r.b===route[i])||(r.b===route[i-1]&&r.a===route[i]))
   if(!road||road.blocked||!status.find(r=>r.id===road.id)?.legal)continue
   const a=s.stops.find(p=>p.id===route[i-1])!,b=s.stops.find(p=>p.id===route[i])!,start=imageToGround(a.x,a.y),end=imageToGround(b.x,b.y)
   const curve=new THREE.LineCurve3(new THREE.Vector3(start[0],.235,start[1]),new THREE.Vector3(end[0],.235,end[1]))
   const line=new THREE.Mesh(new THREE.TubeGeometry(curve,1,.05,6,false),new THREE.MeshBasicMaterial({color:0x397d60,transparent:true,opacity:.88}));routeLine.add(line)
  }
 }

 for(const [id,object] of obstacleObjects)if(!s.obstacles.some(o=>o.id===id)){scene.remove(object);object.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose()}});obstacleObjects.delete(id)}
 for(const obstacle of s.obstacles){let object=obstacleObjects.get(obstacle.id);if(!object){object=new THREE.Group();object.name='transport-obstacle-'+obstacle.id;const material=new THREE.MeshStandardMaterial({color:obstacle.moving?0x608799:0xcc9563,roughness:.8});const body=new THREE.Mesh(obstacle.moving?new THREE.CylinderGeometry(.14,.2,.75,10):new THREE.ConeGeometry(.4,.9,12),material);body.position.y=.45;object.add(body);if(obstacle.moving){const head=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),new THREE.MeshStandardMaterial({color:0xd9c4a7}));head.position.y=1.02;object.add(head)}const position=imageToGround(obstacle.x,obstacle.y);object.position.set(position[0],.18,position[1]);scene.add(object);obstacleObjects.set(obstacle.id,object)}const p=imageToGround(obstacle.x,obstacle.y);object.position.lerp(new THREE.Vector3(p[0],.18,p[1]),1-Math.exp(-dt*9));object.scale.setScalar(mapUnit(obstacle.x,obstacle.y)*obstacle.radius/.6)}
 }}
}
