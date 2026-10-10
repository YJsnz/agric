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
 await send('Page.navigate',{url:'http://localhost:8090/'});
 await wait("document.getElementById('node-count')?.textContent==='354'");
 assert.equal(await run("document.getElementById('edge-count').textContent"),'1810');
 await run("document.getElementById('search').value='黑星病';document.getElementById('search').dispatchEvent(new Event('input'))");
 assert.ok(await run("document.querySelectorAll('#nodes .node').length>0"));
 await run("document.querySelector('#node-list button').click();document.querySelector('.relation-card').click()");
 assert.match(await run("document.getElementById('detail-content').textContent"),/证据等级/);
 await run("document.getElementById('region').value='泊头市';document.getElementById('region').dispatchEvent(new Event('change'))");
 assert.equal(await run("document.querySelectorAll('#nodes .node').length"),0);
 await run("document.getElementById('search').value='';document.getElementById('search').dispatchEvent(new Event('input'));document.getElementById('find-path').click()");
 await wait("document.getElementById('detail-content').textContent.includes('有向知识路径')");
 assert.equal(await run("document.querySelectorAll('#edges .edge').length"),2);
 await run("document.getElementById('ask-open').click();document.getElementById('question').value='机械损伤与采后腐烂风险';document.getElementById('ask-form').requestSubmit()");
 await wait("document.getElementById('ask-result').textContent.includes('匹配证据')");
 assert.match(await run("document.getElementById('ask-result').textContent"),/机械损伤/);
 await run("document.getElementById('ask-close').click()");
 // Every sidebar control, including stale combinations from the user's screenshot.
 await run("resetFilters();document.getElementById('crop').value='花盖梨';document.getElementById('stage').value='出库期';document.getElementById('entity-type').value='Pest';filter()");
 assert.equal(await run("matching.nodes.length"),0);
 await run("document.querySelector('[data-scenario=all]').click()");
 assert.ok(await run("matching.nodes.length>100 && document.getElementById('crop').value==='' && document.getElementById('stage').value===''") );
 await run("document.querySelector('[data-scenario=scab]').click()");
 assert.ok(await run("matching.edges.length>0 && matching.edges.every(e=>[e.source,e.target].some(id=>label(id).includes('黑星病')))") );
 await run("document.querySelector('[data-scenario=postharvest]').click();document.getElementById('stage').value='出库期';filter()");
 assert.ok(await run("matching.edges.length>0"));
 await run("document.getElementById('clear-filters').click();document.getElementById('kind').value='normative';filter()");
 assert.ok(await run("matching.edges.length>0 && matching.edges.every(e=>e.kind==='normative')"));
 await run("resetFilters();document.getElementById('scope').value='general_pear';filter()");
 assert.ok(await run("matching.edges.length>0 && matching.edges.every(e=>e.scope==='general_pear')"));
 await run("resetFilters();document.getElementById('region').value='泊头市';document.getElementById('crop').value='鸭梨';document.getElementById('stage').value='储藏期';filter()");
 assert.ok(await run("matching.edges.length>0 && matching.edges.every(e=>['梨','鸭梨'].includes(label(e.crop)) && e.stage_ids.some(id=>label(id)==='储藏期') && !e.region.startsWith('US'))"));
 await run("resetFilters();document.getElementById('entity-type').value='Stage';filter()");
 assert.ok(await run("matching.nodes.length>0 && matching.nodes.every(n=>n.type==='Stage')"));
 await run("document.querySelector('#node-list button').click()");
 assert.match(await run("document.getElementById('detail-content').textContent"),/关联知识/);
 await run("resetFilters();document.getElementById('search').value='鸭梨';filter()");
 assert.ok(await run("matching.edges.length>1"));
 await run("resetFilters();document.getElementById('as-of').value='2020-01-01';filter()");
 assert.ok(await run("matching.edges.every(e=>!e.valid_from || e.valid_from<='2020-01-01')"));
 await run("resetFilters();document.getElementById('kind').value='fact';filter();document.getElementById('find-path').click()");
 await wait("document.getElementById('path-status').textContent.includes('没有有向')");
 assert.equal(await run("visible.edges.length"),0);
 await run("resetFilters();document.getElementById('find-path').click()");
 await wait("document.getElementById('path-status').textContent.includes('找到')");
 await mkdir(new URL('./test-artifacts/',import.meta.url),{recursive:true});
 let shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
 await writeFile(new URL('./test-artifacts/v2-desktop.png',import.meta.url),Buffer.from(shot.data,'base64'));
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.ok(await run('document.documentElement.scrollWidth<=window.innerWidth'));
 assert.deepEqual(errors,[]);
 console.log('PASS: counts, search, evidence, regional isolation, directed path, question, mobile layout; no browser exceptions.');
}finally{ws.close();}
