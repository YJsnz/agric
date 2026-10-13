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
try {
await send('Runtime.enable');await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride',{width:1600,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://localhost:8090/'});
await wait("document.getElementById('chat-question')?.tagName==='TEXTAREA'");
await wait("typeof chatBusy!=='undefined'");
const bounds=await run("(()=>{const r=document.querySelector('.chat-card').getBoundingClientRect();return {width:r.width,right:r.right,bottom:r.bottom}})()");
assert.ok(bounds.width>500&&bounds.width<550);assert.ok(bounds.right<=1600&&bounds.bottom<=1000);
await run("window.fetch=async()=>({ok:true,json:async()=>({answer:'测试回答：'+ '长文本'.repeat(1000)})});document.getElementById('chat-question').value='测试问题一';document.getElementById('chat-form').requestSubmit()");
await wait("document.querySelectorAll('.chat-message.assistant').length===1&&!chatBusy");
await run("document.getElementById('chat-question').value='测试问题二';document.getElementById('chat-question').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))");
await wait("document.querySelectorAll('.chat-message.assistant').length===2&&!chatBusy");
assert.equal(await run("document.querySelectorAll('.chat-message.user').length"),2);
assert.equal(await run("document.getElementById('chat-result').scrollWidth<=document.getElementById('chat-result').clientWidth"),true);
assert.equal(await run("document.documentElement.scrollWidth<=innerWidth"),true);
await run("document.getElementById('answer-mode').value='path';document.getElementById('answer-mode').dispatchEvent(new Event('change'))");
assert.equal(await run("document.querySelectorAll('.chat-message').length"),4);
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
assert.equal(await run("document.documentElement.scrollWidth<=innerWidth"),true);
console.log('PASS: right-third sidebar, multiline input, two sends, history, mode switch, desktop/mobile overflow; API mocked.');
}finally{ws.close();}
