﻿﻿﻿'use strict';
const $ = id => document.getElementById(id);
const types = {Crop:'作物',Region:'产地',Stage:'生产阶段',Disease:'病害',Organ:'器官',Symptom:'症状',State:'状态',Condition:'环境条件',Risk:'风险',Intervention:'干预措施',Metric:'监测指标',Batch:'批次',Observation:'观测'};
Object.assign(types,{Variety:'品种',GrowthStage:'生育阶段',EnvironmentFactor:'环境因素',AgriculturalPractice:'农事操作',PreventionMeasure:'防控措施',QualityIndicator:'品质指标',HarvestProcess:'采收操作',StorageCondition:'储藏条件',PostharvestRisk:'采后风险',Requirement:'技术要求',Pest:'虫害',Pathogen:'病原',PhysiologicalDisorder:'生理障碍'});
const kinds = {fact:'事实关系',workflow:'业务流程',mechanism:'文献机制',hypothesis:'待验证假设',observation:'观测关联'};
Object.assign(kinds,{normative:'标准与指导要求',association:'相关性证据'});
const reviews = {draft:'待审核',transfer_pending:'待本地适用性审核',source_checked:'来源已核对',local_expert_reviewed:'本地专家已审核'};
const scopes = {design:'本体设计与假设',general_pear:'异地梨类参考',local:'国内资料（具体地区见条目）'};
const relations = {PRODUCED_IN:'产于',IS_A:'属于',HAS_STAGE:'包含阶段',NEXT_STAGE:'下一阶段',HAS_DISEASE:'可发生病害',AFFECTS:'侵染部位',HAS_SYMPTOM:'表现症状',PROMOTES:'促进发生',MAY_LEAD_TO:'可能导致',MAY_REDUCE:'可能降低',APPLIES_AT:'应用阶段',MONITORED_BY:'监测指标',INSTANCE_OF:'所属作物',OBSERVED_ON:'观测批次',CANDIDATE_DISEASE:'疑似病害'};
Object.assign(relations,{LOCATED_IN:'产地',HAS_PROCESS:'发生过程',CONTROLLED_BY:'防控目标',OCCURS_AT_STAGE:'适用阶段',INHIBITS:'抑制',AFFECTS:'影响',REQUIRES:'要求',HAS_PEST:'可发生虫害',HAS_DISORDER:'可发生生理障碍',HAS_PATHOGEN:'病原',INCREASES_RISK:'增加风险',INTERVENTION_FOR:'预防措施针对',REDUCES_RISK:'降低风险',ASSOCIATED_WITH:'相关'});
const color = t => ['Crop','Variety','Region','Stage','GrowthStage'].includes(t)?'#60b18c':['EnvironmentFactor','StorageCondition','QualityIndicator','Requirement','Metric','Observation','Batch'].includes(t)?'#70b5ee':['Disease','Pest'].includes(t)?'#e78398':['Intervention','PreventionMeasure','AgriculturalPractice','HarvestProcess','Symptom','Organ'].includes(t)?'#a18ae2':['State','PostharvestRisk','PhysiologicalDisorder'].includes(t)?'#e8b16c':'#78aba7';
let data={nodes:[],edges:[],sources:[]}, visible={nodes:[],edges:[]}, positions=new Map(), selected=null, scenario='all', view={x:0,y:0,k:1};
let matching={nodes:[],edges:[]}, revision=0;
const contextIds=e=>[e.source,e.target,e.crop,...(e.stage_ids||[])];
const nodeById = id => data.nodes.find(n=>n.id===id);
const label = id => nodeById(id)?.name || '未命名实体';
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function svgEl(tag,attrs){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);return n;}
function section(parent,title,text){const s=el('section',undefined,'detail-section');s.append(el('h3',title));if(text)s.append(el('p',text));parent.append(s);return s;}
function badge(parent,text,warn=false){parent.append(el('span',text,'badge'+(warn?' warn':'')));}
function clearSelection(){selected=null;$('detail-content').replaceChildren(el('p','点击图中节点、连线或左侧实体目录，查看知识详情。'));highlight();}
function showNode(n){
 selected={node:n.id};const panel=$('detail-content');panel.replaceChildren();badge(panel,types[n.type]||'其他实体');panel.append(el('h3',n.name,'detail-name'));
 section(panel,'知识说明',n.type==='Observation'?'这是示例感知入口，疑似病害不等于确诊。':n.type==='Batch'?'当前批次为演示结构，不是真实生产记录。':'该实体用于组织农业知识。具体结论与适用范围请查看关联关系及其证据。');
 const related=matching.edges.filter(e=>contextIds(e).includes(n.id));const s=section(panel,`当前条件下的关联知识（${related.length}）`);
 related.forEach(e=>{const b=el('button',`${label(e.source)} → ${relations[e.relation]||'关联'} → ${label(e.target)}`,'relation-card');b.append(el('small',`${kinds[e.kind]||'其他关系'} · ${reviews[e.review_status]||'待审核'}`));b.onclick=()=>showEdge(e);s.append(b);});
 highlight();
}
function showEdge(e){
 selected={edge:e.id};const panel=$('detail-content');panel.replaceChildren();badge(panel,kinds[e.kind]||'其他关系',e.kind==='hypothesis');badge(panel,reviews[e.review_status]||'待审核',e.review_status!=='source_checked');
 panel.append(el('h3',`${label(e.source)} → ${relations[e.relation]||'关联'} → ${label(e.target)}`,'detail-name'));
 section(panel,'关系解释',e.claim||'尚未补充解释');
 section(panel,'适用范围',`${scopes[e.scope]||'待确认'}；${e.region||'地区未标定'}。${e.scope==='general_pear'?'不能直接作为泊头鸭梨已验证结论。':''}`);
 section(panel,'前提条件',e.conditions?.length?e.conditions.join('；'):'尚未补充具体条件。');
 section(panel,'阶段标定',e.stage_ids?.length?e.stage_ids.map(label).join('、'):'资料尚未标定阶段，不代表适用于所有阶段。');
 section(panel,'时间与作物',`生效：${e.valid_from||'未标定'}；作物：${label(e.crop)}`);
 section(panel,'量化结果','当前没有经过标定的风险概率或干预效果数值。');
 const sources=section(panel,'证据来源');
 for(const id of e.evidence_ids||[]){const source=data.sources.find(s=>s.id===id);if(!source){sources.append(el('p','来源记录待补充'));continue;}const card=el('div',undefined,'source');let url;try{url=new URL(source.url);}catch{}if(url&&['http:','https:'].includes(url.protocol)){const a=el('a',source.title);a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';card.append(a);}else card.append(el('p',source.title));card.append(el('p',`${source.scope||'适用范围待确认'} · 证据等级 ${source.evidence_level||'未分级'} · 发布 ${source.published_at||'原文未标定'} · ${source.review_method||'待审核'}`),el('p',`资料定位：${e.locator||'待补充'}`));sources.append(card);}
 highlight();
}
function highlight(){
 const ids=new Set();if(selected?.node){ids.add(selected.node);data.edges.filter(e=>e.source===selected.node||e.target===selected.node).forEach(e=>{ids.add(e.source);ids.add(e.target);});}
 if(selected?.edge){const e=data.edges.find(e=>e.id===selected.edge);if(e){ids.add(e.source);ids.add(e.target);}}
 for(const n of $('nodes').children){n.classList.toggle('selected',selected?.node===n.dataset.id);n.classList.toggle('dim',!!selected&&!ids.has(n.dataset.id));}
 for(const g of $('edges').children){const e=visible.edges.find(e=>e.id===g.dataset.id);if(!e)continue;g.classList.toggle('selected',selected?.edge===e.id);g.classList.toggle('dim',!!selected&&!(selected?.edge===e.id||selected?.node===e.source||selected?.node===e.target));}
}
function layout(){
 const ns=visible.nodes;positions=new Map(ns.map((n,i)=>[n.id,{x:500+280*Math.cos(i*2.39996)*Math.sqrt((i+1)/ns.length),y:350+240*Math.sin(i*2.39996)*Math.sqrt((i+1)/ns.length)}]));
 // Deterministic force layout. No external visualization scripts or network dependencies.
 for(let iteration=0;iteration<120;iteration++){
  const force=new Map(ns.map(n=>[n.id,{x:0,y:0}]));
  for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){const a=positions.get(ns[i].id),b=positions.get(ns[j].id);const dx=a.x-b.x,dy=a.y-b.y,d=Math.max(1,Math.hypot(dx,dy));const f=6000/(d*d);force.get(ns[i].id).x+=dx/d*f;force.get(ns[i].id).y+=dy/d*f;force.get(ns[j].id).x-=dx/d*f;force.get(ns[j].id).y-=dy/d*f;}
  for(const e of visible.edges){const a=positions.get(e.source),b=positions.get(e.target);if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),f=(d-105)*.015;force.get(e.source).x+=dx/d*f;force.get(e.source).y+=dy/d*f;force.get(e.target).x-=dx/d*f;force.get(e.target).y-=dy/d*f;}
  for(const n of ns){const p=positions.get(n.id),f=force.get(n.id);p.x=Math.max(65,Math.min(935,p.x+Math.max(-6,Math.min(6,f.x+(500-p.x)*.002))));p.y=Math.max(55,Math.min(625,p.y+Math.max(-6,Math.min(6,f.y+(350-p.y)*.002))));}
 }
}
function filter(){
 revision++;$('path-status').textContent='';$('ask-result')?.replaceChildren();
 const kind=$('kind').value,scope=$('scope').value,q=$('search').value.trim().toLocaleLowerCase();
 let edges=data.edges.filter(contextMatches).filter(e=>(kind==='all'||e.kind===kind)&&(scope==='all'||(scope==='local'?e.scope==='local'&&['source_checked','local_expert_reviewed'].includes(e.review_status):e.scope===scope)));
 let nodes=data.nodes;
 if(scenario==='postharvest')edges=edges.filter(e=>e.stage_ids?.some(id=>['采收期','储藏期','分选期','运输期','货架期','出库期','包装期'].includes(label(id))));
 if(scenario==='scab')edges=edges.filter(e=>[e.source,e.target].some(id=>label(id).includes('黑星病')));
 if(q){const matches=new Set(nodes.filter(n=>[n.name,types[n.type],...(n.aliases||[])].some(v=>v?.toLocaleLowerCase().includes(q))).map(n=>n.id));edges=edges.filter(e=>contextIds(e).some(id=>matches.has(id)));}
 const endpointIds=new Set(edges.flatMap(contextIds));
 nodes=nodes.filter(n=>endpointIds.has(n.id));
 const typ=$('entity-type').value;
 if(typ){nodes=nodes.filter(n=>n.type===typ);const ids=new Set(nodes.map(n=>n.id));edges=edges.filter(e=>contextIds(e).some(id=>ids.has(id)));}
 matching={nodes:[...nodes],edges:[...edges]};
 const total=nodes.length;
 if(total>100){
  // Select complete linked pairs, not an arbitrary slice of hashed node IDs.
  const chosen=new Set();
  const eligible=new Set(nodes.map(n=>n.id));
  for(const e of edges){const pair=[e.source,e.target].filter(id=>eligible.has(id));const candidate=new Set([...chosen,...pair]);if(candidate.size<=100)pair.forEach(id=>chosen.add(id));}
  for(const n of nodes){if(chosen.size>=100)break;chosen.add(n.id);}
  nodes=nodes.filter(n=>chosen.has(n.id));
 }
 const canvasIds=new Set(nodes.map(n=>n.id));edges=edges.filter(e=>canvasIds.has(e.source)&&canvasIds.has(e.target));
 visible={nodes,edges,total};layout();selected=null;clearSelection();view={x:0,y:0,k:1};setView();render();
 const descriptions=['search','kind','scope','region','crop','stage','entity-type','as-of'].flatMap(id=>{const input=$(id);return input.value&&input.value!=='all'?[input.tagName==='SELECT'?input.selectedOptions[0].textContent:input.value]:[];});
 $('filter-summary').textContent=`匹配 ${total} 个实体、${matching.edges.length} 条知识。${descriptions.join(' · ')}`;
 if(!total){$('empty').replaceChildren(el('p','这些条件下暂无证据记录'),el('small','筛选已生效。可清空筛选或选择下方快捷专题。'));}
}
function render(){
 $('nodes').replaceChildren();$('edges').replaceChildren();$('node-list').replaceChildren();
 $('visible-count').textContent=`匹配 ${visible.total??visible.nodes.length} 个实体，画布显示 ${visible.nodes.length} 个实体（最多 100） · ${visible.edges.length} 条关系`;$('list-count').textContent=matching.nodes.length;
 $('empty').hidden=visible.nodes.length!==0;
 for(const e of visible.edges){const g=svgEl('g',{class:'edge'+(e.kind==='hypothesis'?' hypothesis':''),tabindex:'0',role:'button','aria-label':`${label(e.source)}${relations[e.relation]||'关联'}${label(e.target)}`});g.dataset.id=e.id;g.append(svgEl('line',{'marker-end':'url(#arrow)'}),svgEl('line',{class:'hit'}));const t=svgEl('text',{'text-anchor':'middle'});t.textContent=relations[e.relation]||'关联';g.append(t);g.onclick=()=>showEdge(e);g.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();showEdge(e);}};$('edges').append(g);}
 for(const n of visible.nodes){const g=svgEl('g',{class:'node',tabindex:'0',role:'button','aria-label':n.name});g.dataset.id=n.id;g.append(svgEl('circle',{r:n.type==='Crop'?24:17,fill:color(n.type)}));const t=svgEl('text',{y:36});t.textContent=n.name.length>14?n.name.slice(0,13)+'…':n.name;g.append(t);const title=svgEl('title',{});title.textContent=n.name;g.append(title);g.onkeydown=event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();showNode(n);}};g.onpointerdown=event=>startDrag(event,n);$('nodes').append(g);
 }
 for(const n of matching.nodes){const b=el('button',undefined);const dot=el('i',undefined,'dot');dot.style.background=color(n.type);b.append(dot,el('span',n.name));b.onclick=()=>focusNode(n);$('node-list').append(b);}
 updatePositions();
}
function focusNode(n){
 const edges=[],ids=new Set([n.id]);
 for(const e of matching.edges.filter(e=>contextIds(e).includes(n.id))){
  if(new Set([...ids,e.source,e.target]).size>100)continue;
  edges.push(e);ids.add(e.source);ids.add(e.target);
 }
 visible={nodes:data.nodes.filter(node=>ids.has(node.id)),edges,total:ids.size};
 layout();view={x:0,y:0,k:1};setView();render();showNode(n);
}
function updatePositions(){
 for(const g of $('nodes').children){const p=positions.get(g.dataset.id);g.setAttribute('transform',`translate(${p.x},${p.y})`);}
 for(const g of $('edges').children){const e=visible.edges.find(e=>e.id===g.dataset.id),a=positions.get(e.source),b=positions.get(e.target);if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.max(1,Math.hypot(dx,dy)),r=nodeById(e.target)?.type==='Crop'?28:21;for(const line of g.querySelectorAll('line')){line.setAttribute('x1',a.x);line.setAttribute('y1',a.y);line.setAttribute('x2',b.x-dx/d*r);line.setAttribute('y2',b.y-dy/d*r);}g.querySelector('text').setAttribute('x',(a.x+b.x)/2);g.querySelector('text').setAttribute('y',(a.y+b.y)/2-6);}
}
function setView(){ $('viewport').setAttribute('transform',`translate(${view.x},${view.y}) scale(${view.k})`); }
function point(event){const p=$('graph').createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform($('graph').getScreenCTM().inverse());}
let drag=null;
function startDrag(event,node){if(event.button!==0)return;event.stopPropagation();const p=point(event);drag={node,start:p,last:p,moved:false};$('graph').setPointerCapture(event.pointerId);}
$('graph').onpointerdown=e=>{if(e.button!==0||e.target.closest('.edge'))return;startDrag(e,null);};
$('graph').onpointermove=e=>{if(!drag)return;const p=point(e);if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>3)drag.moved=true;if(drag.node){const n=positions.get(drag.node.id);n.x+=(p.x-drag.last.x)/view.k;n.y+=(p.y-drag.last.y)/view.k;updatePositions();}else{view.x+=p.x-drag.last.x;view.y+=p.y-drag.last.y;setView();}drag.last=p;};
$('graph').onpointerup=e=>{if(!drag)return;if(drag.node&&!drag.moved)showNode(drag.node);drag=null;if($('graph').hasPointerCapture(e.pointerId))$('graph').releasePointerCapture(e.pointerId);};
$('graph').onpointercancel=()=>{drag=null;};
function zoom(f,p={x:500,y:350}){const k=Math.max(.3,Math.min(3,view.k*f));view.x=p.x-(p.x-view.x)*k/view.k;view.y=p.y-(p.y-view.y)*k/view.k;view.k=k;setView();}
$('graph').addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.1:1/1.1,point(e));},{passive:false});
$('zoom-in').onclick=()=>zoom(1.2);$('zoom-out').onclick=()=>zoom(1/1.2);$('reset').onclick=()=>{view={x:0,y:0,k:1};setView();};$('clear').onclick=clearSelection;
for(const id of ['search','kind','scope','region','crop','stage','entity-type','as-of'])$(id).addEventListener(id==='search'?'input':'change',filter);
function resetFilters(topic='all'){
 scenario=topic;
 for(const id of ['search','region','crop','stage','entity-type'])$(id).value='';
 $('kind').value='all';$('scope').value='all';$('as-of').value=new Date().toLocaleDateString('sv-SE');
 document.querySelectorAll('[data-scenario]').forEach(b=>{b.classList.toggle('active',b.dataset.scenario===topic);b.setAttribute('aria-pressed',String(b.dataset.scenario===topic));});
 $('graph-title').textContent=topic==='postharvest'?'生产—采后证据网络':topic==='scab'?'黑星病相关知识':'泊头鸭梨知识网络';filter();
}
$('clear-filters').onclick=()=>resetFilters();
document.querySelectorAll('[data-scenario]').forEach(b=>b.onclick=()=>resetFilters(b.dataset.scenario));
let graphLoadEpoch=0;
async function load(){
 const epoch=++graphLoadEpoch;
 $('reload').disabled=true;$('connection').textContent='正在连接数据库…';$('connection').classList.remove('failed');$('error').hidden=true;
 try{const response=await fetch('/api/graph?crop='+encodeURIComponent(window.activeGraphCrop||'pear'));const result=await response.json();if(epoch!==graphLoadEpoch)return;if(!response.ok)throw Error(result.error||'图谱读取失败');data=result;fillFilters();$('node-count').textContent=data.nodes.length;$('edge-count').textContent=data.counts.total_relationships;$('audit-counts').textContent=`${data.nodes.length} 个领域实体 + ${data.counts.statement_nodes} 条知识记录；${data.edges.length} 条农业关系 + ${data.counts.provenance_edges} 条溯源关系。${data.sources.length} 份来源记录来自 ${data.counts.publication_groups} 个出版分组，不代表同等数量的独立实验。`;$('source-count').textContent=data.sources.length;$('local-count').textContent=data.edges.filter(e=>e.scope==='local'&&['source_checked','local_expert_reviewed'].includes(e.review_status)).length;$('connection').textContent='● 实时数据库已连接';filter();}
 catch(error){if(epoch!==graphLoadEpoch)return;data={nodes:[],edges:[],sources:[]};positions.clear();filter();$('empty').hidden=true;$('error').hidden=false;$('error').textContent=error.message==='Failed to fetch'?'网页服务连接中断，请重启服务后刷新。':error.message;$('connection').textContent='数据库连接失败';$('connection').classList.add('failed');for(const id of ['node-count','edge-count','source-count','local-count'])$(id).textContent='—';}
 finally{$('reload').disabled=false;}
}
$('reload').onclick=load;load();


function constraints(){return {kind:$('kind').value,scope:$('scope').value,region:$('region').value,crop:$('crop').value,stage:$('stage').value,as_of:$('as-of').value};}
function contextMatches(e){const f=constraints();const areas={'泊头市':['泊头市','沧州市','河北省','全国'],'沧州市':['沧州市','河北省','全国'],'河北省':['河北省','全国'],'全国':['全国'],'US-CA':['US-CA']};if(f.region&&!areas[f.region]?.includes(e.region))return false;const crops=f.crop==='泊头鸭梨'?['泊头鸭梨','鸭梨','梨']:f.crop==='鸭梨'?['鸭梨','梨']:[f.crop,'梨'];if(f.crop&&!crops.includes(label(e.crop)))return false;if(f.stage&&!e.stage_ids?.some(id=>label(id)===f.stage))return false;if(f.as_of&&((e.valid_from&&e.valid_from>f.as_of)||(e.valid_to&&e.valid_to<f.as_of)))return false;return true;}
function fillFilters(){for(const [id,type] of [['crop','Crop'],['stage','Stage']]){const old=$(id).value;$(id).replaceChildren(new Option('全部',''));data.nodes.filter(n=>(type==='Crop'?['Crop','Variety']:['Stage','GrowthStage']).includes(n.type)).sort((a,b)=>a.name.localeCompare(b.name,'zh')).forEach(n=>$(id).add(new Option(n.name,n.name)));$(id).value=old;}const old=$('entity-type').value;$('entity-type').replaceChildren(new Option('全部类型',''));[...new Set(data.nodes.map(n=>n.type))].forEach(t=>$('entity-type').add(new Option(types[t]||t,t)));$('entity-type').value=old;for(const id of ['path-start','path-end']){$(id).replaceChildren();data.nodes.slice().sort((a,b)=>a.name.localeCompare(b.name,'zh')).forEach(n=>$(id).add(new Option(n.name,n.id)));}const start=data.nodes.find(n=>n.name==='过低贮藏温度'),end=data.nodes.find(n=>n.name==='果心褐变');if(start)$('path-start').value=start.id;if(end)$('path-end').value=end.id;if(!$('as-of').value)$('as-of').value=new Date().toLocaleDateString('sv-SE');}
async function api(path,args){const response=await fetch(path+'?'+new URLSearchParams({...constraints(),...args}));const result=await response.json();if(epoch!==graphLoadEpoch)return;if(!response.ok)throw Error(result.error||'查询失败');return result;}
function showPaths(parent,paths){if(!paths.length){parent.append(el('p','当前条件下尚无支持的有向路径。未通过反向关系或跨地区知识拼接结论。'));return;}for(const route of paths){const card=section(parent,'有向知识路径',route.map(e=>label(e.source)).concat(label(route.at(-1).target)).join(' → '));route.forEach(e=>{const b=el('button',e.claim,'relation-card');b.onclick=()=>{$('ask-dialog')?.close();showEdge(e);};card.append(b);});}parent.append(el('p','该路径用于证据解释，不代表已验证的因果效应或损耗概率。'));}
$('find-path').onclick=async()=>{
 const panel=$('detail-content'),button=$('find-path'),token=++revision;
 if(!$('path-start').value||!$('path-end').value||$('path-start').value===$('path-end').value){$('path-status').textContent='请选择两个不同的有效实体。';return;}
 button.disabled=true;$('path-status').textContent='正在查询…';panel.replaceChildren(el('p','正在查询…'));
 try{const result=await api('/api/paths',{start:$('path-start').value,end:$('path-end').value});if(token!==revision)return;
 panel.replaceChildren();showPaths(panel,result.paths);$('path-status').textContent=result.paths.length?`找到 ${result.paths.length} 条有向证据路径。`:'当前筛选条件下没有有向证据路径，可清空筛选后重试。';
 const edges=result.paths[0]||[],ids=new Set(edges.flatMap(e=>[e.source,e.target]));visible={edges,nodes:data.nodes.filter(n=>ids.has(n.id)),total:ids.size};layout();view={x:0,y:0,k:1};setView();render();
 if(!edges.length)$('empty').replaceChildren(el('p','未找到符合条件的有向路径'));
 }catch(e){if(token===revision){panel.replaceChildren(el('p',e.message));$('path-status').textContent=e.message;}}finally{button.disabled=false;}
};
if ($('ask-open') && $('ask-form')) {
$('ask-open').onclick=()=>$('ask-dialog').showModal();$('ask-close').onclick=()=>$('ask-dialog')?.close();
$('ask-form').onsubmit=async event=>{event.preventDefault();const panel=$('ask-result'),token=++revision;panel.replaceChildren(el('p','正在检索…'));try{const result=await api('/api/ask',{question:$('question').value});if(token!==revision)return;panel.replaceChildren(el('p',result.explanation),el('small',result.method));showPaths(panel,result.paths);const s=section(panel,'匹配证据');result.edges.forEach(e=>{const b=el('button',e.claim+' · '+e.locator,'relation-card');b.onclick=()=>{$('ask-dialog')?.close();showEdge(e);};s.append(b);});}catch(e){if(token===revision)panel.replaceChildren(el('p',e.message));}};
}

for(const id of ['path-start','path-end'])$(id).addEventListener('change',()=>{revision++;$('path-status').textContent='起点或终点已更改，请重新查询。';});