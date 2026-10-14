import test from 'node:test'
import assert from 'node:assert/strict'
import {TransportPlayback,playbackPath} from './transportPlayback.ts'
const graph={stops:[{id:'a',x:0,y:0},{id:'b',x:100,y:0},{id:'c',x:100,y:100}],roads:[{a:'a',b:'b',legal:true},{a:'b',b:'c',legal:true}]}
const pose=(x,y=0,heading=0)=>({x,y,heading})
test('duplicate 250ms polls do not restart 500ms movement',()=>{
 const p=new TransportPlayback(800)
 p.push(pose(0),'0',0,1,true,false,graph)
 p.push(pose(0),'0',250,1,true,false,graph)
 p.push(pose(20),'1',500,1,true,false,graph)
 p.push(pose(20),'1',750,1,true,false,graph)
 p.push(pose(40),'2',1000,1,true,false,graph)
 p.push(pose(40),'2',1250,1,true,false,graph)
 const points=Array.from({length:31},(_,i)=>p.read(1000+i*16).x)
 for(let i=1;i<points.length;i++)assert.ok(Math.abs(points[i]-points[i-1]-.64)<.00001)
})
test('interpolation follows the junction instead of crossing the field',()=>{
 assert.deepEqual(playbackPath(pose(80),pose(100,20),graph).map(p=>[p.x,p.y]),[[80,0],[100,0],[100,20]])
 const p=new TransportPlayback(0);p.push(pose(80),'a',0,1,true,false,graph);p.push(pose(100,20),'b',100,1,true,false,graph)
 assert.deepEqual(p.read(50),pose(100,0));assert.equal(p.read(75).x,100)
})
test('uneven response arrival times do not change the simulation playback speed',()=>{
 const p=new TransportPlayback(800)
 p.push(pose(0),'a',0,1,true,false,graph,0)
 p.push(pose(20),'b',760,1,true,false,graph,500)
 p.push(pose(40),'c',1120,1,true,false,graph,1000)
 assert.equal(p.read(1200).x,16)
 assert.ok(Math.abs(p.read(1216).x-p.read(1200).x-.64)<.00001)
})
test('emergency stop snaps to authoritative position and stops animation',()=>{
 const p=new TransportPlayback();p.push(pose(0),'a',0,1,true,false,graph);p.push(pose(20),'b',500,1,true,false,graph)
 p.push(pose(20),'stop',550,1,false,true,graph)
 assert.equal(p.read(550).x,20);assert.equal(p.animating(550),false)
})
test('map replacement and illegal connections never blend through parcels',()=>{
 const p=new TransportPlayback();p.push(pose(0),'a',0,1,true,false,graph)
 p.push(pose(100,90),'b',500,2,true,false,graph);assert.equal(p.read(500).y,90)
 assert.deepEqual(playbackPath(pose(50),pose(100,50),{...graph,roads:[{a:'a',b:'b',legal:true}]}),[])
})
