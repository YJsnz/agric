// Node 22+ and Edge launched with --remote-debugging-port=9229.
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const tabs=await (await fetch('http://127.0.0.1:9229/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let serial=0;const pending=new Map(),errors=[];
ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function run(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function wait(expression){for(let i=0;i<100;i++){if(await run(expression))return;await new Promise(r=>setTimeout(r,150));}throw Error('Timed out: '+expression);}
try{
await send('Runtime.enable');await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1050,deviceScaleFactor:1,mobile:false});
errors.length=0;
await send('Page.navigate',{url:'http://localhost:8090/'});
await wait("document.getElementById('node-count')?.textContent==='32'");
assert.equal(await run("document.querySelectorAll('#nodes .node').length"),32);
await run("Array.from(document.querySelectorAll('#node-list button')).find(b=>b.textContent.includes('梨黑星病')).click()");
assert.match(await run("document.getElementById('detail-content').textContent"),/梨黑星病/);
await run("document.querySelector('.relation-card').click()");
assert.match(await run("document.getElementById('detail-content').textContent"),/证据来源/);
await run("document.getElementById('search').value='不存在的实体';document.getElementById('search').dispatchEvent(new Event('input'))");
assert.equal(await run("document.getElementById('empty').hidden"),false);
await run("document.getElementById('search').value='黑星病';document.getElementById('search').dispatchEvent(new Event('input'))");
assert.ok(await run("document.querySelectorAll('#nodes .node').length>0 && document.querySelectorAll('#nodes .node').length<32"));
await run("document.getElementById('search').value='';document.getElementById('search').dispatchEvent(new Event('input'));document.getElementById('scope').value='local';document.getElementById('scope').dispatchEvent(new Event('change'))");
assert.equal(await run("document.querySelectorAll('#edges .edge').length"),1);
assert.equal(await run("document.querySelectorAll('#nodes .node').length"),2);
await run("document.querySelector('[data-scenario=postharvest]').click()");
assert.ok(await run("document.querySelectorAll('#edges .hypothesis').length>0"));
await run("document.querySelector('[data-scenario=all]').click();document.getElementById('zoom-in').click()");
assert.match(await run("document.getElementById('viewport').getAttribute('transform')"),/scale\(1.2\)/);
await run("document.getElementById('reset').click()");
const before=await run("document.querySelector('#nodes .node').getAttribute('transform')");
const b=await run("(()=>{const r=document.querySelector('#nodes circle').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
await send('Input.dispatchMouseEvent',{type:'mousePressed',x:b.x,y:b.y,button:'left',clickCount:1});
await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:b.x+40,y:b.y+20,button:'left',buttons:1});
await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:b.x+40,y:b.y+20,button:'left',clickCount:1});
assert.notEqual(await run("document.querySelector('#nodes .node').getAttribute('transform')"),before);
await run("Array.from(document.querySelectorAll('#node-list button')).find(b=>b.textContent.includes('梨黑星病')).click()");
await mkdir(new URL('./test-artifacts/',import.meta.url),{recursive:true});
let shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
await writeFile(new URL('./test-artifacts/desktop.png',import.meta.url),Buffer.from(shot.data,'base64'));
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
assert.ok(await run('document.documentElement.scrollWidth<=window.innerWidth'));
shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
await writeFile(new URL('./test-artifacts/mobile.png',import.meta.url),Buffer.from(shot.data,'base64'));
await run("window.fetch=async()=>({ok:false,json:async()=>({error:'数据库连接测试失败'})});document.getElementById('reload').click()");
await wait("!document.getElementById('error').hidden");
assert.equal(await run("document.querySelectorAll('#nodes .node').length"),0);
assert.match(await run("document.getElementById('error').textContent"),/数据库连接测试失败/);
assert.deepEqual(errors,[]);
console.log('PASS: live graph, details, search, scope, scenarios, zoom, drag, mobile, error state; no browser exceptions.');
}finally{ws.close();}
