import test,{after} from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import {buildDetailedTransportVehicle} from './transportVehicle3d.ts'
const vehicle=buildDetailedTransportVehicle()
after(()=>vehicle.dispose())
test('vehicle is actual geometry with four articulated wheels, not a billboard',()=>{
 let sprites=0;vehicle.root.traverse(o=>{if(o instanceof THREE.Sprite)sprites++})
 assert.equal(sprites,0);assert.equal(vehicle.wheels.length,4)
 assert.equal(vehicle.wheels.filter(w=>w.front).length,2)
 assert.ok(vehicle.triangles>20000&&vehicle.meshCount<60)
})
test('all four tires contact the same ground plane',()=>{
 for(const wheel of vehicle.wheels){const bounds=new THREE.Box3().setFromObject(wheel.steer);assert.ok(Math.abs(bounds.min.y)<.012)}
})
test('cargo follows loading state and freight type',()=>{
 vehicle.setCargo(false);assert.equal(vehicle.cargo.visible,false)
 for(const [goods,index] of [['鸭梨',0],['肥料',1],['农具工具',2]]){
  vehicle.setCargo(true,goods);assert.equal(vehicle.cargo.visible,true)
  assert.equal(vehicle.cargo.children.filter(g=>g.visible).length,1)
  assert.equal(vehicle.cargo.children[index].visible,true)
 }
})
