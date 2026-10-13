import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../../vision-frontend/package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1536,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const live=process.argv.includes('--live');const results=[];
try{
 if(!live){
  await page.route('**/api/graphrag/ask',route=>{
   const q=route.request().postDataJSON().question;
   assert(q.includes('泊头鸭梨'));assert(!q.includes('所在地'));
   return route.fulfill({json:{status:'needs_clarification',answer:'请补充所在地。',clarification_questions:['请补充种植所在地。']}});
  });
  await page.route('**/api/wheat/ask',async route=>{
   assert(route.request().postDataJSON().question.includes('黄骅旱碱麦'));
   await new Promise(r=>setTimeout(r,300));
   await route.fulfill({json:{status:'insufficient_evidence',user_answer:'先观察叶片正反面，并补充清晰照片。',answer:'测试证据回答 [E1]',sources:[{title:'测试来源',url:'https://example.com/source',evidence_id:'E1'}],grounding:{passed:true}}});
  });
 }
 await page.goto('http://127.0.0.1:8090/');
 await page.locator('.cw-qa textarea').waitFor();
 assert.equal(await page.locator('.cw-risk').count(),0);
 for(const [crop,question] of [['pear','梨黑星病与高湿有什么关系？'],['wheat','黄骅旱碱麦收获后，原粮质量主要应该关注哪些指标？']]){
  await page.locator(`.cw-crop[data-crop-key="${crop}"]`).click();
  await page.locator('.cw-qa textarea').fill(question);
  if(live)await page.locator('.cw-qa input').fill(crop==='pear'?'河北省沧州市泊头市':'河北省沧州市黄骅市');
  const responsePromise=page.waitForResponse(r=>r.url().endsWith(crop==='pear'?'/api/graphrag/ask':'/api/wheat/ask'),{timeout:310000});
  await page.locator('.cw-qa button[type=submit]').click();
  const response=await responsePromise;assert.equal(response.status(),200);
  const result=await response.json();
  await page.waitForFunction(()=>!document.querySelector('.cw-qa button[type=submit]').disabled,{},{timeout:310000});
  assert((await page.locator('.cw-qa-output').innerText()).includes(result.user_answer||result.answer));
  results.push({crop,http_status:response.status(),result});
 }
 await page.locator('.cw-crop[data-crop-key="pear"]').click();
 assert((await page.locator('.cw-qa-output').innerText()).includes(results[0].result.user_answer||results[0].result.answer));
 await page.locator('.cw-crop[data-crop-key="jujube"]').click();
 assert(await page.locator('.cw-qa button[type=submit]').isDisabled());
 await page.locator('.cw-crop[data-crop-key="wheat"]').click();
 if(!live)assert.equal(await page.locator('.cw-qa-output a').getAttribute('href'),'https://example.com/source');
 assert.deepEqual(errors,[]);
 if(!live){
  const geoPage=await browser.newPage();
  await geoPage.context().grantPermissions(['geolocation']);
  await geoPage.context().setGeolocation({latitude:38.37,longitude:117.33});
  await geoPage.route('https://nominatim.openstreetmap.org/**',r=>r.fulfill({json:{address:{state:'河北省',city:'沧州市',town:'黄骅市'}}}));
  await geoPage.goto('http://127.0.0.1:8090/');
  await geoPage.waitForFunction(()=>document.querySelector('.cw-qa-location-status')?.textContent.includes('电脑定位：河北省沧州市黄骅市'));
  assert.equal(await geoPage.locator('.cw-qa input').inputValue(),'河北省沧州市黄骅市');
  await geoPage.locator('.cw-qa input').fill('手动所在地');
  await geoPage.locator('.cw-qa-locate').click();
  await geoPage.waitForFunction(()=>!document.querySelector('.cw-qa-locate').disabled);
  assert.equal(await geoPage.locator('.cw-qa input').inputValue(),'手动所在地');
  await geoPage.close();
 }
 await page.screenshot({path:`data/huanghua_hanjianmai/evaluation/graph-qa-panel-${live?'live':'ui-fixture'}.png`,fullPage:true});
 await writeFile(`data/huanghua_hanjianmai/evaluation/graph-qa-${live?'live':'ui'}.json`,JSON.stringify({passed:true,live,results,errors},null,2));
 console.log(JSON.stringify({passed:true,live,results:results.map(({crop,http_status,result:r})=>({crop,http_status,status:r.status,generation_called:r.generation_called,citations:r.sources?.length,grounding:r.grounding?.passed}))}));
}finally{await browser.close();}
