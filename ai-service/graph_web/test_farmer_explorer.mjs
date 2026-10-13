import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const tab=await(await fetch('http://127.0.0.1:9229/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)(m);pending.delete(m.id)}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails)};
const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.result.exceptionDetails)throw Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
async function load(url){await send('Page.navigate',{url});for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,200));if(await run('!!document.querySelector(".farmer-graph-node")'))return;}throw Error('Farmer UI did not initialize');}
try{
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1536,height:1024,deviceScaleFactor:1,mobile:false});await load('http://localhost:8090/');
 assert.equal(await run('document.querySelectorAll(".farmer-topic img").length'),6);
 assert.equal(await run('document.querySelectorAll(".farmer-symptom").length'),4);
 assert.equal(await run('document.querySelector("#full-knowledge").open'),false);
 assert.equal(await run('Array.from(document.querySelectorAll(".farmer-topic img")).every(i=>i.complete&&i.naturalWidth>0)'),true);
 await send('Page.captureScreenshot',{format:'png'}).then(r=>writeFile('ai-service/graph_web/test-artifacts/farmer-desktop.png',Buffer.from(r.result.data,'base64')));
 // Symptom choices derive candidates from actual HAS_SYMPTOM edges.
 await run('document.querySelector("[data-symptom=黑色小斑点]").click()');
 assert.equal(await run('document.querySelector(".farmer-candidate").textContent.includes("梨细菌性花枯病")'),true);
 assert.equal(await run('document.querySelector(".farmer-summary").textContent.includes("梨细菌性花枯病")'),true);
 await run('document.querySelector("[data-symptom=大片褐色斑]").click()');
 assert.equal(await run('document.querySelectorAll(".farmer-candidate").length'),0);
 assert.equal(await run('document.querySelector(".farmer-candidates").textContent.includes("暂无直接关联")'),true);
 await run('document.querySelector("[data-symptom=叶片卷曲]").click()');
 assert.ok(await run('document.querySelectorAll(".farmer-candidate").length')>0);
 // Search can open graph knowledge without imposing an empty literal graph filter.
 await run('document.getElementById("search").value="黑星病";document.getElementById("search-form").requestSubmit()');
 assert.ok(await run('document.querySelectorAll(".farmer-search-result").length')>0);
 await run('Array.from(document.querySelectorAll(".farmer-search-result")).find(b=>b.textContent==="黑星病 →").click()');
 assert.equal(await run('document.querySelectorAll(".farmer-summary .reference-photo-grid img").length'),3);
 for(const tab of ['cause','conditions','spread','care','related'])await run(`document.querySelector('[data-knowledge-tab="${tab}"]').click()`);
 assert.ok(await run('document.querySelectorAll(".farmer-graph-edge").length')>0);
 await run('document.querySelector(".farmer-graph-edge").dispatchEvent(new MouseEvent("click",{bubbles:true}))');
 assert.equal(await run('document.getElementById("tool-dialog").open'),true);
 assert.equal(await run('!!document.querySelector("#tool-content a")'),true);await run('document.getElementById("tool-dialog").close()');
 // Enter toggles the chosen node in this page; no route change.
 const before=await run('location.href');await run('document.querySelectorAll(".farmer-graph-node")[1].dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}))');assert.equal(await run('location.href'),before);
 await run('document.querySelector("[data-section=management]").click()');assert.ok(await run('document.querySelectorAll(".farmer-browse-card").length')>0);
 await load('http://localhost:8090/?problem=leaf_curl&from=vision');
 assert.equal(await run('document.querySelector(".farmer-symptom.active").dataset.symptom'),'叶片卷曲');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
 await send('Page.captureScreenshot',{format:'png'}).then(r=>writeFile('ai-service/graph_web/test-artifacts/farmer-mobile.png',Buffer.from(r.result.data,'base64')));
 // UI round trip with a browser-only auth fixture. This does NOT validate real authentication.
 const fixture=await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.port==='8081'){
   sessionStorage.setItem('ty_token','farmer-ui-test-only');
   const originalFetch=window.fetch;window.fetch=(input,init)=>{
     const path=new URL(typeof input==='string'?input:input.url,location.href).pathname;
     if(path==='/api/auth/me')return Promise.resolve(new Response(JSON.stringify({id:0,name:'UI Test',email:'ui@example.invalid',role:'USER',faceBound:false}),{status:200,headers:{'Content-Type':'application/json'}}));
     if(path.startsWith('/api/farms/'))return Promise.resolve(new Response(JSON.stringify({message:'UI fixture: dashboard not requested'}),{status:503,headers:{'Content-Type':'application/json'}}));
     return originalFetch(input,init);
   };
 }`});
 await send('Emulation.setDeviceMetricsOverride',{width:1536,height:1024,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'http://localhost:8081/platform/workspaces/farm-01?module=vision'});
 for(let i=0;i<50;i++){await new Promise(r=>setTimeout(r,200));if(await run('!!document.querySelector(".knowledge-bridge select")'))break;}
 assert.equal(await run('!!document.querySelector(".knowledge-bridge select")'),true);
 await run('(()=>{const s=document.querySelector(".knowledge-bridge select");s.value="leaf_spot";s.dispatchEvent(new Event("change",{bubbles:true}));})()');
 await new Promise(r=>setTimeout(r,50));
 const returnUrl=await run('document.querySelector(".knowledge-bridge a").href');assert.ok(returnUrl.includes('problem=leaf_spot'));assert.ok(returnUrl.includes('from=manual_observation'));
 await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:fixture.result.identifier});await run('sessionStorage.removeItem("ty_token");sessionStorage.removeItem("ty_user")');
 await load(returnUrl);assert.equal(await run('document.querySelector(".farmer-symptom.active").dataset.symptom'),'黑色小斑点');
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: photos, symptom/evidence matching, empty data, five tabs, search, references, same-page graph, navigation, incoming result, mobile widths; no JS errors.');
}finally{ws.close();await fetch('http://127.0.0.1:9229/json/close/'+tab.id)}
