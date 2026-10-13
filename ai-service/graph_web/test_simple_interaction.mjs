import assert from 'node:assert/strict';
const tabs=await(await fetch('http://127.0.0.1:9229/json')).json(),ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const q=new Map(),errors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){q.get(m.id)(m);q.delete(m.id)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails)};const send=(method,params={})=>new Promise(r=>{q.set(++id,r);ws.send(JSON.stringify({id,method,params}))});const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value};
async function mouse(type,x,y){await send('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});}
async function pos(key){return run(`(()=>{const r=document.querySelector('.simple-node[data-id="${key}"] circle').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)}
async function click(key){const p=await pos(key);await mouse('mousePressed',p.x,p.y);await mouse('mouseReleased',p.x,p.y);}
try{await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1100,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://localhost:8090/'});await new Promise(r=>setTimeout(r,2200));
await run('document.querySelector("#full-knowledge").open=true;document.querySelector(".simple-workspace").scrollIntoView()');
const count=()=>run('document.querySelectorAll(".simple-node").length');assert.equal(await count(),7);
await click('category:disease');assert.equal(await count(),15);await click('category:disease');assert.equal(await count(),7);await click('category:disease');
const key=await run('[...document.querySelectorAll(".simple-node")].map(n=>n.dataset.id).find(id=>id!=="root"&&!id.startsWith("category:"))');
const before=await count();await click(key);assert.ok(await count()>=before);await click(key);assert.equal(await count(),before);
const p=await pos('category:disease'),old=await run('({...simplePositions.get("category:disease")})');await mouse('mousePressed',p.x,p.y);await mouse('mouseMoved',p.x+40,p.y+30);await mouse('mouseReleased',p.x+40,p.y+30);const moved=await run('({...simplePositions.get("category:disease")})');assert.notEqual(old.x,moved.x);assert.equal(await count(),before);
const rect=await run('(()=>{const r=document.querySelector(".simple-canvas svg").getBoundingClientRect();return {x:r.x+10,y:r.y+10}})()');await mouse('mousePressed',rect.x,rect.y);await mouse('mouseMoved',rect.x+25,rect.y+25);await mouse('mouseReleased',rect.x+25,rect.y+25);assert.notEqual(await run('simpleView.x'),0);
await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:rect.x+100,y:rect.y+100,deltaY:-150,deltaX:0});await new Promise(r=>setTimeout(r,100));assert.ok(await run('simpleView.k')>1);
assert.equal(await run('!!document.getElementById("explorer-mode")'),false);assert.equal(await run('getComputedStyle(document.querySelector(".upper")).display'),'grid');assert.equal(await run('getComputedStyle(document.querySelector(".stats")).display'),'grid');assert.equal(errors.length,0);console.log('PASS: unified layout, expand/collapse, node drag, pan, zoom.');
assert.equal(await run('(()=>{const n=simpleScope().nodes.find(n=>n.type==="Disease");focusNode(n);return detailEntity.id===n.id&&!!document.querySelector(`[data-id="${n.id}"]`)})()'),true);
assert.equal(await run('(()=>{const e=simpleScope().edges[0];showEdge(e);return document.getElementById("detail-content").textContent.includes(e.claim)})()'),true);
await run('document.getElementById("entity-type").value="Disease";filter()');assert.equal(await run('simpleScope().nodes.every(n=>n.type==="Disease")'),true);
await run('document.getElementById("entity-type").value="";filter()');
assert.equal(await run('(async()=>{const e=simpleScope().edges[0];document.getElementById("path-start").value=e.source;document.getElementById("path-end").value=e.target;await document.getElementById("find-path").onclick();return !!canvasPath?.length&&document.querySelectorAll(".simple-fact-line").length>0})()'),true);
assert.equal(errors.length,0);console.log('PASS: entity directory focus, details, type filter, path canvas.');

}finally{ws.close()}
