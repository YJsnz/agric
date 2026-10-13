// Normal Edge navigation for public pages; never bypass certificate errors.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const manifest=(await readFile(new URL('botou_yali_graphrag_corpus_v1/metadata/source_manifest.jsonl',root),'utf8')).trim().split('\n').map(JSON.parse);
const version=await (await fetch('http://127.0.0.1:9229/json/version')).json();
const ws=new WebSocket(version.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let serial=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}};
function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,sessionId}));});}
const results=[];
try {for(const item of manifest.filter(r=>(process.argv.includes('--paper')?['PAPER_004']:['GOV_001','GOV_002','UNI_001']).includes(r.id))){
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 try{
  const nav=await send('Page.navigate',{url:item.url},sessionId);
  await new Promise(r=>setTimeout(r,2500));
  const r=await send('Runtime.evaluate',{expression:'JSON.stringify({url:location.href,title:document.title,html:document.documentElement.outerHTML,text:document.body.innerText})',returnByValue:true},sessionId);
  const data=JSON.parse(r.result.value);
  const dir=new URL(`data/documents/${item.category}/${item.id}/`,root);await mkdir(dir,{recursive:true});
  const status=nav.errorText||data.url.startsWith('chrome-error:')?'navigation_failed':'downloaded_pending_review';
  if(status==='downloaded_pending_review'){await writeFile(new URL('browser.html',dir),data.html);await writeFile(new URL('browser.txt',dir),data.text);}
  if(item.id==='PAPER_004'&&status==='downloaded_pending_review'){
   const pdf=await send('Runtime.evaluate',{expression:`(async()=>{const r=await fetch('/CN/article/downloadArticleFile.do?attachType=PDF&id=9726');const b=new Uint8Array(await r.arrayBuffer());return {status:r.status,prefix:new TextDecoder().decode(b.slice(0,5)),base64:btoa(Array.from(b,x=>String.fromCharCode(x)).join(''))}})()`,returnByValue:true,awaitPromise:true},sessionId);
   const result=pdf.result.value;if(result?.prefix==='%PDF-'){await writeFile(new URL('original.pdf',dir),Buffer.from(result.base64,'base64'));results.push({source_id:item.id,status:'pdf_downloaded',url:data.url});}else results.push({source_id:item.id,status:'pdf_unavailable',http_status:result?.status});
  }
  results.push({source_id:item.id,status,url:data.url,title:data.title,error:nav.errorText||null,characters:data.text.length});
 }finally{await send('Target.closeTarget',{targetId});}
}}finally{ws.close();}
await writeFile(new URL(`data/processed/acquisition/${process.argv.includes('--paper')?'browser-paper':'browser'}.results.json`,root),JSON.stringify(results,null,2));console.log(results);
