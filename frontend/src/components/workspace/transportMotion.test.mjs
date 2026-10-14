import test from 'node:test'
import assert from 'node:assert/strict'
import {TransportMotion} from './transportMotion.ts'
test('first frame and map relocation never spin wheels',()=>{const a=new TransportMotion();assert.equal(a.update(1400,408,0,1000,true,6).leftRoll,0);const b=a.update(200,500,1,1500,true,7);assert.equal(b.leftRoll,0);assert.equal(b.moving,false)})
test('wheel roll follows distance, then stops when paused',()=>{const a=new TransportMotion();a.update(0,0,0,1000,true,6);const b=a.update(9,0,0,1500,true,6);assert.equal(b.leftRoll,2);assert.equal(b.rightRoll,2);assert.equal(b.moving,true);const c=a.update(9,0,0,2000,false,6);assert.equal(c.leftRoll,2);assert.equal(c.bob,0);assert.equal(c.moving,false)})
test('turning in place counter rotates wheels without translation',()=>{const a=new TransportMotion();a.update(0,0,0,1000,true,6);const b=a.update(0,0,.4,1500,true,6);assert(b.leftRoll<0);assert(b.rightRoll>0);assert(b.steering>0);assert.equal(b.turning,true);assert.equal(b.moving,false)})
test('heading wrap takes short arc and stale samples never create a huge spin',()=>{const a=new TransportMotion();a.update(0,0,Math.PI-.02,1000,true,6);const b=a.update(0,0,-Math.PI+.02,1500,true,6);assert(Math.abs(b.leftRoll)<.1);const c=a.update(20,0,0,5000,true,6);assert.equal(c.leftRoll,b.leftRoll)})
