import * as THREE from 'three'
import type {OrchardMaterials} from './orchardModels'
import type {GroundPoint} from './orchardGeometry'

// Leaflets are instanced separately from the low-detail mound silhouette.
export function addGardenUnderstory(root:THREE.Group,points:GroundPoint[],materials:OrchardMaterials){
  const leafGeometry=new THREE.PlaneGeometry(.3,.12,2,1),vertices=leafGeometry.attributes.position
  for(let i=0;i<vertices.count;i++){const x=vertices.getX(i);vertices.setY(i,vertices.getY(i)*(Math.abs(x)>.1?.1:1));vertices.setZ(i,.035*Math.cos(x/.3*Math.PI))}leafGeometry.computeVertexNormals()
  const material=materials.material(0x7a9964);material.side=THREE.DoubleSide
  const leaves=new THREE.InstancedMesh(leafGeometry,material,points.length*60),stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(.009,.018,1,4),materials.material(0x657e4b),points.length*6),dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),color=new THREE.Color()
  points.forEach(([x,z],i)=>{for(let k=0;k<6;k++){const angle=k*Math.PI/3+i*.73,start=new THREE.Vector3(x,.12,z),end=new THREE.Vector3(x+Math.sin(angle)*.58,.48+(k%3)*.08,z+Math.cos(angle)*.58),vector=end.clone().sub(start);dummy.position.copy(start.clone().add(end).multiplyScalar(.5));dummy.quaternion.setFromUnitVectors(up,vector.clone().normalize());dummy.scale.set(1,vector.length(),1);dummy.updateMatrix();stems.setMatrixAt(i*6+k,dummy.matrix);for(let n=0;n<5;n++)for(let side=0;side<2;side++){const t=.25+n*.14,offset=(side===0?-1:1)*(.17-n*.018);dummy.position.copy(start).addScaledVector(vector,t);dummy.position.x+=Math.cos(angle)*offset;dummy.position.z-=Math.sin(angle)*offset;dummy.rotation.set(-Math.PI/2+.25,0,angle+(side===0?-.65:.65));dummy.scale.setScalar(1-n*.09);dummy.updateMatrix();const index=i*60+k*10+n*2+side;leaves.setMatrixAt(index,dummy.matrix);color.setHex(i%4===0?0xadc68c:0xffffff).multiplyScalar(.85+(i%7)*.025);leaves.setColorAt(index,color)}}})
  leaves.name='garden-leaflets';leaves.userData.fineDetail=true;stems.userData.fineDetail=true;root.add(stems,leaves)
}
