import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const tab=await(await fetch('http://127.0.0.1:9229/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)(m);pending.delete(m.id)}};
const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.result.exceptionDetails)throw Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
try{
 await send('Page.enable');
 for(const [width,height]of [[1366,768],[1536,864],[1920,1080]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://localhost:8090/'});
  for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,150));if(await run('!!document.querySelector(".farmer-graph")'))break;}
  const metrics=await run(`(()=>{const selectors=['.farmer-topic-grid','.farmer-symptoms','.farmer-knowledge','.farmer-summary','.farmer-summary-actions','.farmer-advanced'];return {documentFits:document.documentElement.scrollHeight<=innerHeight&&document.documentElement.scrollWidth<=innerWidth,panels:selectors.map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return {s,top:r.top,bottom:r.bottom,scroll:e.scrollHeight,client:e.clientHeight}})}})()`);
  console.log(width,height,JSON.stringify(metrics));assert.equal(metrics.documentFits,true);
  for(const p of metrics.panels){assert.ok(p.top>=0&&p.bottom<=height+1,p.s+' outside viewport');if(p.s==='.farmer-summary')assert.ok(p.scroll<=p.client+1,'Default detail needs scrolling');}
  const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`ai-service/graph_web/test-artifacts/farmer-fit-${width}.png`,Buffer.from(shot.result.data,'base64'));
 }
 console.log('PASS: all main panels and detail actions visible without desktop scrolling.');
}finally{ws.close();await fetch('http://127.0.0.1:9229/json/close/'+tab.id)}
