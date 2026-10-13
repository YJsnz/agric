import assert from 'node:assert/strict';
const tab=await(await fetch('http://127.0.0.1:9229/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const jobs=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){jobs.get(m.id)(m);jobs.delete(m.id);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
const send=(method,params={})=>new Promise(r=>{jobs.set(++id,r);ws.send(JSON.stringify({id,method,params}));});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.result.exceptionDetails,JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
const ready=async()=>{for(let i=0;i<60;i++){if(await run('document.querySelectorAll(".cw-node").length>10'))return;await new Promise(r=>setTimeout(r,100));}throw Error('Graph not loaded');};
try {
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://localhost:8090/'});await ready();
 const before=await run('document.querySelector("header").getBoundingClientRect().height');
 await run('document.querySelector(".user-menu summary").click()');
 assert.equal(await run('document.querySelector("header").getBoundingClientRect().height'),before);
 assert.equal(await run(`(()=>{const p=document.querySelector('.cw-user-dropdown'),r=p.getBoundingClientRect();return r.right<=innerWidth&&r.left>=0&&r.top>=document.querySelector('.user-menu summary').getBoundingClientRect().bottom&&p.contains(document.elementFromPoint(r.x+20,r.y+20));})()`),true);
 await run('document.body.dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}))');assert.equal(await run('document.querySelector(".user-menu").open'),false);
 await run('document.querySelector(".user-menu summary").click();document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))');assert.equal(await run('document.querySelector(".user-menu").open'),false);
 assert.equal(await run('document.activeElement===document.querySelector(".user-menu summary")'),true);
 await run('document.querySelector(".user-menu summary").click();document.querySelector("#reload").click()');assert.equal(await run('document.querySelector(".user-menu").open'),false);
 await ready();assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: dropdown overlay, header stability, viewport bounds, outside click, Escape/focus, refresh action.');
} finally {ws.close();await fetch('http://127.0.0.1:9229/json/close/'+tab.id);}
