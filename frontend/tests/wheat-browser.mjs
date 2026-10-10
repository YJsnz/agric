import {createRequire} from 'node:module'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import assert from 'node:assert/strict'
const require=createRequire(new URL('../../vision-frontend/package.json',import.meta.url))
const {chromium}=require('@playwright/test')
const real=process.argv.includes('--real')
const artifact=JSON.parse(await readFile(new URL('../../ai-service/wheat_diagnosis/tests/artifacts/real_full_diagnosis.json',import.meta.url),'utf8'))
const output=new URL('./artifacts/',import.meta.url);await mkdir(output,{recursive:true})
const browser=await chromium.launch({channel:'msedge',headless:true})
const page=await browser.newPage({viewport:{width:1440,height:1000}})
const errors=[];page.on('pageerror',e=>errors.push(e.message))
// Authentication only is a fixture; real mode does NOT intercept wheat APIs.
await page.addInitScript(()=>localStorage.setItem('ty_token','browser-test-session'))
await page.route('**/api/auth/me',r=>r.fulfill({json:{id:0,name:'联调测试',role:'USER'}}))
const records={mode:real?'real wheat APIs; auth fixture':'UI fixtures',cases:{}}
try{
 for(const [name,fields] of Object.entries({leaf_only:['leaf'],canopy_only:['canopy'],head_only:['head'],all_with_context:['leaf','canopy','head']})){
  if(!real){await page.unroute('**/api/wheat/diagnose');await page.route('**/api/wheat/diagnose',async r=>{assert(r.request().headers()['content-type'].includes('multipart/form-data'));await r.fulfill({json:artifact.cases[name].response})})}
  await page.goto('http://127.0.0.1:5174/platform/crops/wheat/vision')
  for(const field of fields)await page.locator('input[type=file]').nth(['leaf','canopy','head'].indexOf(field)).setInputFiles(artifact.input_paths[field+'_image'])
  if(name==='all_with_context'){
   await page.getByLabel('生育阶段').selectOption('灌浆期')
   for(const [label,value] of [['土壤含水量','18.2'],['土壤盐分','2.1'],['温度','31.5'],['湿度','72']])await page.getByLabel(label,{exact:false}).fill(value)
  }
  const response=page.waitForResponse(r=>r.url().endsWith('/api/wheat/diagnose'),{timeout:420000})
  await page.getByRole('button',{name:'开始分析',exact:true}).click()
  const res=await response;assert.equal(res.status(),200);const body=await res.json()
  await page.getByRole('heading',{name:'AI风险研判',exact:true}).waitFor()
  assert.equal(body.environment_context.region,null)
  if(body.status==='insufficient_evidence')assert(await page.getByText('当前证据不足，建议补充现场观测或传感器数据。').isVisible())
  if(fields.includes('head')){
   const svg=page.locator('svg.head-boxes');assert.equal(await svg.locator('rect').count(),body.visual_observations.head.boxes.length)
   assert.equal(await svg.getAttribute('viewBox'),`0 0 ${body.visual_observations.head.image_width} ${body.visual_observations.head.image_height}`)
  }
  await page.waitForTimeout(800) // allow existing page transition to settle for screenshots
  await page.screenshot({path:new URL(`${real?'real':'mock'}-${name}.png`,output).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true})
  records.cases[name]={http:res.status(),status:body.status,grounding:body.grounding_status,citations:body.citations.length,warnings:body.warnings,response:body}
  console.log('PASS',real?'real':'mock',name,res.status(),body.grounding_status)
 }
 await page.getByRole('link',{name:'进入AI风险分析'}).click()
 await page.getByRole('heading',{name:'黄骅旱碱麦 · AI风险详情'}).waitFor()
 const href=await page.getByRole('link',{name:'在知识图谱中查看'}).getAttribute('href');assert(new URL(href).searchParams.get('crop')==='wheat')
 await page.waitForTimeout(800)
 await page.screenshot({path:new URL(`${real?'real':'mock'}-risk.png`,output).pathname.replace(/^\/([A-Z]:)/,'$1'),fullPage:true})
 if(!real){
  await page.unroute('**/api/wheat/diagnose')
  const fixture=structuredClone(artifact.cases.leaf_only.response);fixture.warnings=[{component:'graphrag',message:'LLM generation unavailable'}];fixture.assessment=null
  await page.route('**/api/wheat/diagnose',r=>r.fulfill({json:fixture}))
  await page.goto('http://127.0.0.1:5174/platform/crops/wheat/vision');await page.locator('input[type=file]').first().setInputFiles(artifact.input_paths.leaf_image)
  await page.getByRole('button',{name:'开始分析',exact:true}).click();await page.getByText('部分分析能力暂不可用').waitFor()
  assert(await page.getByText('锈病类视觉症状',{exact:true}).isVisible())
  records.warningRendering=true
  await page.unroute('**/api/wheat/diagnose')
  await page.route('**/api/wheat/diagnose',r=>r.fulfill({status:500,json:{detail:'测试服务暂不可用'}}))
  await page.getByRole('button',{name:'开始分析',exact:true}).click()
  await page.getByRole('alert').filter({hasText:'测试服务暂不可用'}).waitFor()
  records.http500Rendering=true
 }
 const graph=await browser.newPage()
 await graph.goto(href)
 await graph.locator('.cw-crop[data-crop-key="wheat"].active').waitFor()
 const target=new URL(href).searchParams.get('node')
 if(target)await graph.locator('.cw-info h4').filter({hasText:'锈病'}).waitFor()
 records.kgDeepLink=true;await graph.close()
 assert.deepEqual(errors,[]);records.pageErrors=errors
}finally{await writeFile(new URL(real?'real-results.json':'ui-results.json',output),JSON.stringify(records,null,2));await browser.close()}
