import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const tabs=await (await fetch('http://127.0.0.1:9229/json')).json();
const tab=tabs.find(t=>t.type==='page'&&t.url.startsWith('http://localhost:8090'))||tabs.find(t=>t.type==='page'&&t.url==='about:blank');
const ws=new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
let serial=0;const pending=new Map(),errors=[];
ws.onmessage=event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function run(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function wait(expression){for(let i=0;i<120;i++){if(await run(expression))return;await new Promise(r=>setTimeout(r,150));}throw Error('Timed out: '+expression);}
try{
await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1608,height:1065,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://localhost:8090/'});
await wait("Number(document.getElementById('node-count')?.textContent)>0 && chosenCrop==='泊头鸭梨'");
assert.equal(await run('document.documentElement.scrollWidth<=window.innerWidth'),true);
await mkdir(new URL('./test-artifacts/',import.meta.url),{recursive:true});
const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(new URL('./test-artifacts/dashboard.png',import.meta.url),Buffer.from(shot.data,'base64'));
for(const name of ['黄骅旱碱麦','沧州金丝小枣','设施蔬菜']){await run(`document.querySelector('[data-crop="${name}"]').click()`);assert.equal(await run('matching.edges.length'),0);assert.match(await run("document.getElementById('empty').textContent"),/尚无已审核/);}
await run("document.querySelector('[data-crop=泊头鸭梨]').click()");
await run("document.getElementById('crop').value='黄骅旱碱麦';document.getElementById('crop').dispatchEvent(new Event('change'))");assert.equal(await run('matching.edges.length'),0);
await run("document.getElementById('crop').value='鸭梨';document.getElementById('crop').dispatchEvent(new Event('change'))");assert.ok(await run('matching.edges.length>0'));
for(const name of ['all','production','disease','environment','harvest','storage','risk','intervention']){await run(`document.querySelector('[data-view="${name}"]').click()`);assert.ok(await run('matching.nodes.length>0'),name);}
await run("navigate('all');document.querySelector('#nodes .node').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}))");
for(const tab of ['basic','relations','time','evidence']){await run(`document.querySelector('[data-tab="${tab}"]').click()`);assert.ok(await run("document.getElementById('detail-content').textContent.length>0"));}
for(const tool of ['statistics','ontology','compare','export']){await run(`openTool('${tool}')`);assert.equal(await run("document.getElementById('tool-dialog').open"),true);if(tool==='compare'){await run("document.querySelector('#tool-content button').click()");assert.match(await run("document.getElementById('tool-content').textContent"),/关联知识/);}await run("document.getElementById('tool-dialog').close()");}
const downloads=new URL(`./test-artifacts/downloads-${Date.now()}/`,import.meta.url);await mkdir(downloads,{recursive:true});await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:fileURLToPath(downloads)});
await run("openTool('export');document.querySelector('#tool-content button').click();document.querySelectorAll('#tool-content button')[1].click()");
let exported;for(let i=0;i<30;i++){try{exported=JSON.parse(await readFile(new URL('农业知识子图.json',downloads),'utf8'));await readFile(new URL('农业知识图谱.svg',downloads),'utf8');break;}catch{await new Promise(r=>setTimeout(r,100));}}
assert.ok(exported?.edges.length>0);assert.ok(exported.sources.length>0);assert.match(await readFile(new URL('农业知识图谱.svg',downloads),'utf8'),/<svg/);await run("document.getElementById('tool-dialog').close()");
await run("document.getElementById('image-more').click()");assert.match(await run("document.getElementById('tool-content').textContent"),/尚未收录/);await run("document.getElementById('tool-dialog').close();document.getElementById('user-info').click()");assert.match(await run("document.getElementById('tool-content').textContent"),/访客/);await run("document.getElementById('tool-dialog').close()");
await run("document.getElementById('advanced-open').click();document.getElementById('region').value='泊头市';document.getElementById('stage').value='储藏期';document.getElementById('advanced-apply').click()");assert.ok(await run("matching.edges.every(e=>e.stage_ids.some(id=>label(id)==='储藏期'))"));
await run("navigate('all');openTool('path');document.getElementById('find-path').click()");await wait("document.getElementById('path-status').textContent.startsWith('找到')");assert.ok(await run("document.querySelectorAll('#path-preview .path-step').length>=2"));await run("document.getElementById('path-dialog').close()");
await run("document.getElementById('chat-question').value='机械损伤与采后腐烂风险';document.getElementById('chat-form').requestSubmit()");await wait("document.querySelector('#chat-result .relation-card')!==null");
await run("document.getElementById('answer-mode').value='path';document.getElementById('answer-mode').dispatchEvent(new Event('change'))");await wait("document.getElementById('chat-result').textContent.includes('路径')");
await run("document.getElementById('directory-open').click()");assert.ok(await run("document.querySelectorAll('#node-list button').length>0"));await run("document.querySelector('#node-list button').click()");assert.equal(await run("document.getElementById('directory-dialog').open"),false);
await run("document.getElementById('zoom-in').click();document.getElementById('minimap-button').click()");assert.match(await run("document.getElementById('viewport').getAttribute('transform')"),/scale\(1\)/);
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});assert.ok(await run('document.documentElement.scrollWidth<=window.innerWidth'));
assert.deepEqual(errors,[]);console.log('PASS: reference dashboard layout, crops, all views, detail tabs, tools, advanced filters, paths, chat, directory, minimap, mobile.');
}finally{ws.close();}
