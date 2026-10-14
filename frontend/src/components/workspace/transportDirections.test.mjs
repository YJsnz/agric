import test from 'node:test'
import assert from 'node:assert/strict'
import {transportDirection,observerHeading} from './transportDirections.ts'
test('all eight road headings select their matching sprite views',()=>{
 for(let i=0;i<8;i++)assert.equal(transportDirection(-i*Math.PI/4),i)
})
test('heading wrap and full turns preserve the same view',()=>{
 assert.equal(transportDirection(-Math.PI),transportDirection(Math.PI))
 assert.equal(transportDirection(.1),transportDirection(.1+Math.PI*2))
})
test('orbiting the 3D camera changes the visible side of a stationary rover',()=>{
 assert.equal(transportDirection(observerHeading(0,0,2,5)),0)
 assert.equal(transportDirection(observerHeading(0,5,2,0)),6)
 assert.equal(transportDirection(observerHeading(0,0,2,-5)),4)
 assert.equal(transportDirection(observerHeading(0,-5,2,0)),2)
})
