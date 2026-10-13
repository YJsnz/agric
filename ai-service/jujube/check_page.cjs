// Read-only browser smoke test against the running graph service.
const {chromium}=require('../../vision-frontend/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8090/');
  const select=page.locator('select').first();
  const results=[];
  for(const crop of ['jujube','pear','wheat','jujube']){
   const response=page.waitForResponse(r=>r.url().includes('/api/graph?crop='+crop));
   await select.selectOption(crop);const res=await response;
   if(!res.ok())throw Error('graph HTTP '+res.status());
   await page.waitForTimeout(500);
   const count=await page.locator('#crop-graph circle').count();
   if(!count)throw Error('No graph circles for '+crop);
   results.push({crop,circles:count,errors:[...errors]});
  }
  const input=page.getByRole('textbox',{name:'AI 问答问题'});
  if(await input.isDisabled())throw Error('Jujube AI question disabled');
  const out='data/cangzhou_jinsixiaozao/evaluation';
  if(process.argv.includes('--ask')){
   const reply=page.waitForResponse(r=>r.url().endsWith('/api/jujube/ask')&&r.request().method()==='POST',{timeout:300000});
   await input.fill('成熟期连续降雨，为什么容易裂果？');
   await page.getByRole('button',{name:'发送问题',exact:true}).click();
   const response=await reply;if(!response.ok())throw Error('AI API HTTP '+response.status());
   const answer=await response.json();fs.writeFileSync(out+'/real_browser_api.json',JSON.stringify(answer,null,2));
   console.log(JSON.stringify({api_status:answer.status,generation_called:answer.generation_called,grounding:answer.grounding?.passed,citations:answer.citations?.length}));
   await page.waitForTimeout(500);
  }
  await page.screenshot({path:out+'/page.png',fullPage:true});
  fs.writeFileSync(out+'/browser_smoke.json',JSON.stringify({results,errors},null,2));
  console.log(JSON.stringify({results,errors}));
  if(errors.length)throw Error(errors.join('\n'));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
