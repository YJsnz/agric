import {mkdir,writeFile} from 'node:fs/promises'
import * as THREE from '../frontend/node_modules/three/build/three.module.js'
import {GLTFExporter} from '../frontend/node_modules/three/examples/jsm/exporters/GLTFExporter.js'
import {buildDetailedTransportVehicle} from '../frontend/src/components/workspace/transportVehicle3d.ts'
// Three r152's binary exporter expects the browser FileReader API.
globalThis.FileReader=class {
 result=null
 readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}
 readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:'+blob.type+';base64,'+Buffer.from(result).toString('base64');this.onloadend?.()})}
}
const vehicle=buildDetailedTransportVehicle();vehicle.setCargo(true,'鸭梨')
const root=vehicle.root.clone(true),instances=[]
root.traverse(object=>{if(object instanceof THREE.InstancedMesh)instances.push(object)})
// Exporter r152 does not serialize instances: expand only the export copy.
for(const instance of instances){const group=new THREE.Group();group.name='tire-tread';group.applyMatrix4(instance.matrix);const matrix=new THREE.Matrix4();for(let i=0;i<instance.count;i++){instance.getMatrixAt(i,matrix);const mesh=new THREE.Mesh(instance.geometry,instance.material);mesh.applyMatrix4(matrix);group.add(mesh)}instance.parent.add(group);instance.parent.remove(instance)}
const exporter=new GLTFExporter(),buffer=await new Promise((resolve,reject)=>exporter.parse(root,resolve,reject,{binary:true,onlyVisible:true}))
const directory=new URL('../frontend/public/assets/models/',import.meta.url);await mkdir(directory,{recursive:true});const output=new URL('transport-rover-v1.glb',directory);await writeFile(output,Buffer.from(buffer));vehicle.dispose()
console.log(JSON.stringify({file:output.pathname,bytes:buffer.byteLength}))
