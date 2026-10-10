import assert from 'node:assert/strict';
const tab=await(await fetch('http://127.0.0.1:9229/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const jobs=new Map(),errors=[];
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){jobs.get(m.id)(m);jobs.delete(m.id);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);};
const send=(method,params={})=>new Promise(r=>{jobs.set(++id,r);ws.send(JSON.stringify({id,method,params}));});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.result.exceptionDetails,JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
const ready=async()=>{for(let i=0;i<60;i++){if(await run('document.querySelectorAll(".cw-node").length>10'))return;await new Promise(r=>setTimeout(r,100));}throw Error('Graph not loaded');};
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://localhost:8090/'});await ready();
 await run(`window.aiCalls=0;window.originalFetch=fetch;window.fetch=(url,options)=>{if(url==='/api/graphrag/ask'){aiCalls++;const e=data.edges.find(e=>e.evidence_ids?.length),s=data.sources.find(s=>e.evidence_ids.includes(s.id));return Promise.resolve(new Response(JSON.stringify({answer:'测试解读：引用当前知识依据。',sources:[{source_id:s.id,title:s.title,url:s.url,citations:[{edge_ids:[e.id]}]}]}),{status:200,headers:{'Content-Type':'application/json'}}));}return originalFetch(url,options);};window.query=q=>{const input=document.querySelector('#search');input.value=q;input.dispatchEvent(new Event('input',{bubbles:true}));};window.submit=()=>document.querySelector('#search-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));`);
 await run(`query('黑星')`);assert.ok(await run(`document.querySelectorAll('.cw-search-suggestions [role=option]').length`)>0);
 await run('submit()');assert.ok(await run('document.querySelectorAll(".cw-search-hit").length')>0);assert.ok(await run('document.querySelectorAll(".cw-real-edge").length')>0);assert.equal(await run('aiCalls'),0);
 await run(`document.querySelector('.cw-clear-search').click();query('黑星病为什么容易发生');submit()`);assert.ok(await run('document.querySelectorAll(".cw-search-hit").length')>0,'question extraction');
 await run(`document.querySelector('.cw-clear-search').click();query('黑星');document.querySelectorAll('.cw-filters input[data-group]').forEach(n=>{if(n.checked)n.click()});submit()`);
 assert.ok(await run('!!document.querySelector(".cw-relax-search")'));assert.equal(await run('document.querySelectorAll(".cw-node").length'),0);
 await run(`document.querySelector('.cw-relax-search').click()`);assert.ok(await run('document.querySelectorAll(".cw-node").length')>1);
 await run(`window.beforeAI=document.querySelector('#crop-graph').outerHTML;document.querySelector('.cw-explain').click()`);
 for(let i=0;i<30;i++){if(await run('document.querySelectorAll(".cw-ai-references button").length>0'))break;await new Promise(r=>setTimeout(r,50));}
 assert.equal(await run('aiCalls'),1);assert.equal(await run('document.querySelector("#crop-graph").outerHTML===beforeAI'),true,'AI does not mutate graph');assert.ok(await run('document.querySelectorAll(".cw-ai-references button").length')>0);
 await run(`document.querySelector('.cw-ai-dialog').close();window.fetch=(url,options)=>url==='/api/graphrag/ask'?Promise.resolve(new Response(JSON.stringify({error:'测试服务不可用'}),{status:503})):originalFetch(url,options);document.querySelector('.cw-explain').click()`);
 for(let i=0;i<30;i++){if(await run(`document.querySelector('.cw-ai-answer').textContent.includes('测试服务不可用')`))break;await new Promise(r=>setTimeout(r,50));}
 assert.ok(await run(`document.querySelector('.cw-ai-answer').textContent.includes('测试服务不可用')`));assert.equal(await run('document.querySelector("#crop-graph").outerHTML===beforeAI'),true,'failure preserves graph');
 await run(`document.querySelector('.cw-ai-dialog').close();document.querySelector('.cw-clear-search').click()`);assert.equal(await run('document.querySelectorAll(".cw-filters input:checked").length'),0,'clear restores pre-search filters');
 await run(`document.querySelector('.cw-home').click();query('zzzznotfound');submit()`);assert.equal(await run('document.querySelectorAll(".cw-node").length'),0);assert.equal(await run('document.querySelector(".cw-explain").disabled'),true);
 await run(`document.querySelector('.cw-crop[data-crop-key=wheat]').click();query('黑星');submit()`);assert.equal(await run('document.querySelectorAll(".cw-node").length'),0);assert.equal(await run('document.querySelectorAll(".cw-search-suggestions [role=option]").length'),0);
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: suggestions, keyword/question subgraphs, no implicit AI calls, filter relaxation/restoration, explicit AI references without graph mutation, no-match and empty crops.');
}finally{ws.close();await fetch('http://127.0.0.1:9229/json/close/'+tab.id);}
