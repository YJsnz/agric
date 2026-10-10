import assert from 'node:assert/strict';
const tab=await(await fetch('http://127.0.0.1:9229/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const jobs=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){jobs.get(m.id)(m);jobs.delete(m.id);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
const send=(method,params={})=>new Promise(r=>{jobs.set(++id,r);ws.send(JSON.stringify({id,method,params}));});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.result.exceptionDetails,JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
const ready=async()=>{for(let i=0;i<60;i++){if(await run('document.querySelectorAll(".cw-node").length>10'))return;await new Promise(r=>setTimeout(r,100));}throw Error('Graph not loaded');};
let backup;
try{
 await send('Page.enable');await send('Runtime.enable');await send('Page.navigate',{url:'http://localhost:8090/'});await ready();
 backup=await run(`['recent','saved'].map(k=>localStorage.getItem('agric.graph.'+k))`);
 assert.equal(await run('document.querySelectorAll(".cw-module").length'),0);
 assert.equal(await run('document.querySelectorAll(".cw-helper").length'),4);
 await run(`document.querySelector('[data-helper=guide]').click()`);assert.equal(await run('document.querySelector(".cw-helper-dialog").open'),true);await run('document.querySelector(".cw-helper-dialog").close()');
 const selected=await run(`(()=>{const n=[...document.querySelectorAll('.cw-node')].find(n=>!n.dataset.id.startsWith('nav:'));n.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return n.dataset.id;})()`);
 await run(`document.querySelector('[data-helper=recent]').click()`);assert.ok(await run('document.querySelectorAll(".cw-revisit").length')>0);
 await run('document.querySelector(".cw-revisit").click()');assert.equal(await run('document.querySelector(".cw-helper-dialog").open'),false);
 assert.ok(await run(`!![...document.querySelectorAll('.cw-node')].find(n=>n.dataset.id===${JSON.stringify(selected)})`));
 await run('document.querySelector(".cw-bookmark").click()');
 if(!await run(`JSON.parse(localStorage.getItem('agric.graph.saved')).some(r=>r.id===${JSON.stringify(selected)})`))await run('document.querySelector(".cw-bookmark").click()');
 await send('Page.reload',{ignoreCache:true});await new Promise(r=>setTimeout(r,400));await ready();
 await run(`document.querySelector('[data-helper=saved]').click()`);assert.ok(await run('document.querySelectorAll(".cw-revisit").length')>0);
 await run('document.querySelector(".cw-revisit").click()');assert.ok(await run('document.querySelector(".cw-bookmark").textContent.includes("★")'));
 await run(`document.querySelector('[data-helper=sources]').click()`);assert.ok(await run('document.querySelectorAll(".cw-helper-dialog a").length')>0);await run('document.querySelector(".cw-helper-dialog").close()');
 await run(`document.querySelector('.cw-crop[data-crop-key=wheat]').click();document.querySelector('[data-helper=saved]').click()`);assert.equal(await run('document.querySelectorAll(".cw-revisit").length'),0);await run('document.querySelector(".cw-helper-dialog").close()');
 await run(`document.querySelector('.cw-crop[data-crop-key=pear]').click();document.querySelector('[data-helper=recent]').click();document.querySelector('.cw-clear-recent').click()`);assert.equal(await run('document.querySelectorAll(".cw-revisit").length'),0);
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: helper navigation, guide, recent/revisit, bookmark persistence, actual sources, crop isolation, clear history.');
}finally{
 if(backup)await run(`['recent','saved'].forEach((k,i)=>{const value=${JSON.stringify(backup)}[i];if(value===null)localStorage.removeItem('agric.graph.'+k);else localStorage.setItem('agric.graph.'+k,value);})`);
 ws.close();await fetch('http://127.0.0.1:9229/json/close/'+tab.id);
}
