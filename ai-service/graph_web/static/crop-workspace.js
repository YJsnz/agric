/* Graph-centred crop workspace. Category links are navigation, never causal claims. */
(() => {
 const crops=[['wheat','黄骅旱碱麦','🌾','盐碱地特色粮','盐碱地管理','产量提升','病虫害风险','粮食储藏'],['pear','泊头鸭梨','🍐','地理标志产品','病害识别与防治','分选分级标准','采收品质评估','预冷储藏与减损'],['jujube','沧州金丝小枣','🔴','特色干果','栽培管理','产品品质提升','病虫害防治','农技与风险查询'],['vegetable','青县设施蔬菜','🥬','设施农业示范','温室环境','灌溉管理','病虫害知识','生长过程']];
 const groups=[['disease','病虫害',['Disease','Pest','Symptom'],'#ef7777','🐞'],['care','管理措施',['Intervention','PreventionMeasure','AgriculturalPractice'],'#38b879','🌱'],['environment','环境因素',['EnvironmentFactor','Condition','StorageCondition'],'#63aaff','💧'],['stage','生长过程',['GrowthStage','Stage'],'#45b887','🍃'],['storage','品质与采后',['HarvestProcess','PostharvestRisk','QualityIndicator','PhysiologicalDisorder'],'#eba94d','🧺'],['standard','标准与要求',['Requirement'],'#a887dc','▤']];
 const state={crop:'pear',module:'all',enabled:new Set(groups.map(g=>g[0])),expanded:new Set(),selected:null,query:'',list:false,relation:'all',region:'',stage:'',positions:new Map(),view:{x:0,y:0,k:1},epoch:0};
 const main=document.querySelector('main'),legacy=el('div');legacy.hidden=true;while(main.firstChild)legacy.append(main.firstChild);main.append(legacy);document.body.classList.remove('visual-layout');document.body.classList.add('crop-workspace');
 const b=(s,fn,c='')=>{const n=el('button',s,c);n.type='button';n.onclick=fn;return n;};
 const photo=(src,alt)=>{const i=el('img');i.src=src;i.alt=alt;return i;};
 const userMenu=document.querySelector('.user-menu'),userToggle=userMenu.querySelector('summary'),userPanel=el('div',undefined,'cw-user-dropdown');
 userPanel.id='cw-user-dropdown';userToggle.setAttribute('aria-controls',userPanel.id);userToggle.setAttribute('aria-expanded','false');
 [...userMenu.children].filter(n=>n!==userToggle).forEach(n=>userPanel.append(n));userMenu.append(userPanel);
 userMenu.addEventListener('toggle',()=>userToggle.setAttribute('aria-expanded',String(userMenu.open)));
 document.addEventListener('pointerdown',e=>{if(userMenu.open&&!userMenu.contains(e.target))userMenu.open=false;});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&userMenu.open){userMenu.open=false;userToggle.focus();}});
 document.addEventListener('focusin',e=>{if(userMenu.open&&!userMenu.contains(e.target))userMenu.open=false;});
 userPanel.addEventListener('click',e=>{if(e.target.closest('button,a')){userMenu.open=false;if(userPanel.contains(document.activeElement))userToggle.focus();}});
 const board=el('div',undefined,'cw-board');main.prepend(board);
 const hero=el('section',undefined,'cw-hero');hero.append(el('h1','请选择你要了解的作物'),el('p','从作物出发，探索病虫害、环境与生产采后的知识联系'));const cropCards=el('div',undefined,'cw-crops');hero.append(cropCards);board.append(hero);
 const content=el('div',undefined,'cw-content'),panel=el('section',undefined,'cw-panel'),right=el('aside',undefined,'cw-right');content.append(panel,right);board.append(content);
 const heading=el('div',undefined,'cw-heading'),title=el('h2','🌿 全域知识图谱'),subtitle=el('p','按作物和知识类型筛选，点节点展开，点连线查看依据。');const names=el('div');names.append(title,subtitle);heading.append(names);const modes=el('div',undefined,'cw-actions');modes.append(b('知识图谱',()=>{state.list=false;render();}),b('列表视图',()=>{state.list=true;render();}),b('⛶ 全屏',()=>{if(document.fullscreenElement)document.exitFullscreen();else panel.requestFullscreen().catch(()=>{});}),b('⇩ 导出',()=>exportGraph()));heading.append(modes);panel.append(heading);
 const panelBody=el('div',undefined,'cw-panel-body'),filters=el('aside',undefined,'cw-filters'),graphArea=el('div',undefined,'cw-graph-area'),canvas=el('div',undefined,'cw-canvas');graphArea.append(canvas);panelBody.append(filters,graphArea);panel.append(panelBody);
 const status=el('p',undefined,'cw-status');panel.append(status);const info=el('section',undefined,'cw-info cw-box'),risk=el('section',undefined,'cw-risk cw-box');right.append(info,risk);
 const nav=document.querySelector('.navigation');nav.replaceChildren();nav.append(b('⌂　首页',()=>setModule('all'),'cw-home'),el('h3','作物知识服务'));const cropNav=el('div');nav.append(cropNav);nav.append(el('hr'),el('h3','探索助手'));
 for(const [key,name]of [['guide','⌘　如何看图谱'],['recent','◷　最近查看'],['saved','☆　我的收藏'],['sources','▤　资料来源']]){const button=b(name,()=>openHelper(key),'cw-helper');button.dataset.helper=key;nav.append(button);}
 nav.append(el('small','筛选知识类型，请使用图谱内的筛选条件。','cw-helper-hint'));
 const helper=el('dialog',undefined,'cw-helper-dialog');helper.setAttribute('aria-labelledby','cw-helper-title');document.body.append(helper);
 helper.addEventListener('click',e=>{if(e.target===helper){const r=helper.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)helper.close();}});
 let helperTab='',storageAvailable=true;
 function loadLibrary(key){try{const rows=JSON.parse(localStorage.getItem('agric.graph.'+key)||'[]');return Array.isArray(rows)?rows.filter(r=>r&&typeof r.id==='string'&&typeof r.crop==='string').slice(0,200):[];}catch{return [];}}
 let recent=loadLibrary('recent'),saved=loadLibrary('saved');
 function storeLibrary(key,rows){try{localStorage.setItem('agric.graph.'+key,JSON.stringify(rows));storageAvailable=true;}catch{storageAvailable=false;}}
 function isSaved(id){return saved.some(r=>r.crop===state.crop&&r.id===id);}
 function bookmark(n){if(isSaved(n.id))saved=saved.filter(r=>r.crop!==state.crop||r.id!==n.id);else saved=[{crop:state.crop,id:n.id},...saved].slice(0,200);storeLibrary('saved',saved);renderInfo();}
 function revisit(id){const n=nodeById(id);if(!n)return;searchBefore=null;resultId=null;closeSuggestions();helper.close();state.enabled=new Set(groups.map(g=>g[0]));state.module='all';state.region='';state.stage='';state.relation='all';state.query='';search.value='';state.list=false;resetView();state.focusId=id;select(n);render();}
 function openHelper(key){
  helperTab=key;const names={guide:'如何看图谱',recent:'最近查看',saved:'我的收藏',sources:'资料来源'};
  const head=el('div',undefined,'cw-helper-head'),h=el('h2',names[key]);h.id='cw-helper-title';const close=b('×',()=>helper.close());close.setAttribute('aria-label','关闭');head.append(h,close);helper.replaceChildren(head);
  if(key==='guide'){
   for(const [title,text]of [['1 · 找到相关知识','在图谱内部选择知识类型、关系、生育阶段和地区；顶部搜索框可按名称查找。'],['2 · 展开关联','节点下方显示还可展开几项。点击分批展开，再次点击收起；拖拽节点调整位置，滚轮缩放。'],['3 · 核对依据','点击实线查看资料来源与适用条件；分类虚线仅表示导航，不代表因果。'],['4 · 留下有用的知识','选中节点后，在右侧详情点击收藏；最近查看和收藏都按作物分别记录。']]){helper.append(el('h3',title),el('p',text));}
  }else{
   helper.append(el('p',crops.find(c=>c[0]===state.crop)[1]+' · '+(key==='sources'?'当前筛选下真实关系引用的资料':'仅保存在当前浏览器')));
   if(state.crop!=='pear'){helper.append(el('p','该作物尚未收录知识，暂无内容。'));}
   else if(key==='sources'){
    const ids=new Set(scientificEdges().flatMap(e=>e.evidence_ids||[])),sources=data.sources.filter(s=>ids.has(s.id));
    if(!sources.length)helper.append(el('p','当前筛选下暂无资料来源。'));
    for(const source of sources){const row=el('div',undefined,'cw-helper-row');sourceLink(row,source);helper.append(row);}
   }else{
    const rows=(key==='recent'?recent:saved).filter(r=>r.crop===state.crop);
    if(!rows.length)helper.append(el('p',key==='recent'?'还没有查看记录。点击一个图谱节点即可开始。':'还没有收藏。选中节点，在右侧详情点击“收藏此知识”。'));
    if(rows.length&&key==='recent')helper.append(b('清空本作物记录',()=>{recent=recent.filter(r=>r.crop!==state.crop);storeLibrary('recent',recent);openHelper(key);},'cw-clear-recent'));
    for(const entry of rows){const row=el('div',undefined,'cw-helper-row'),n=nodeById(entry.id);const open=b(n?n.name+' →':'该知识已不在当前知识库',()=>revisit(entry.id),'cw-revisit');open.disabled=!n;row.append(open);if(key==='saved')row.append(b('取消收藏',()=>{saved=saved.filter(r=>r!==entry);storeLibrary('saved',saved);renderInfo();openHelper(key);},'cw-unsave'));helper.append(row);}
    if(!storageAvailable)helper.append(el('p','浏览器存储不可用，本次记录仅在当前页面保留。'));
   }
  }
  if(!helper.open)helper.showModal();
 }
 const link=el('a','▣ 拍照识别病虫害\n去数字工作台 →','cw-camera');link.href=`http://${location.hostname}:8081/platform/workspaces/farm-01?module=vision`;nav.append(link);
 document.querySelector('.brand small').textContent='看得懂 · 用得上 · 帮你种好特色农产品';
 for(const c of crops){const card=b('',()=>chooseCrop(c[0]),'cw-crop');card.dataset.cropKey=c[0];card.append(photo(window.CROP_IMAGES[c[0]],c[1]));const name=el('div',undefined,'cw-crop-title');name.append(el('strong',c[2]+' '+c[1]),el('span',c[3]));const glass=el('div',undefined,'cw-crop-glass');glass.append(name);card.append(glass);const features=el('div',undefined,'cw-features');c.slice(4).forEach(v=>features.append(el('span','🌱 '+v)));glass.append(features,el('div','进入知识服务 →','cw-enter'));cropCards.append(card);const n=b(c[2]+'　'+c[1],()=>chooseCrop(c[0]),'cw-crop-nav');n.dataset.cropKey=c[0];cropNav.append(n);}
 filters.append(el('h3','筛选条件'),el('label','选择作物'));const cropSelect=el('select');for(const c of crops)cropSelect.add(new Option(c[1],c[0]));cropSelect.onchange=()=>chooseCrop(cropSelect.value);filters.append(cropSelect,el('h3','知识类型'));
 for(const g of groups){const lab=el('label',undefined,'cw-check'),input=el('input');input.type='checkbox';input.checked=true;input.dataset.group=g[0];input.onchange=()=>{input.checked?state.enabled.add(g[0]):state.enabled.delete(g[0]);state.module='custom';resetView();render();};lab.append(input,el('span',g[1]));filters.append(lab);}
 filters.append(el('h3','关系类型'));const relationSelect=el('select');for(const [k,t]of [['all','全部关系'],['causal','促进 / 抑制 / 风险'],['fact','事实 / 管理要求']])relationSelect.add(new Option(t,k));relationSelect.onchange=()=>{state.relation=relationSelect.value;resetView();render();};filters.append(relationSelect);
 const stageSelect=el('select'),regionSelect=el('select');stageSelect.add(new Option('全部时期',''));regionSelect.add(new Option('全部资料地区',''));stageSelect.onchange=()=>{state.stage=stageSelect.value;resetView();render();};regionSelect.onchange=()=>{state.region=regionSelect.value;resetView();render();};filters.append(el('h3','生育阶段'),stageSelect,el('h3','资料地区'),regionSelect);
 filters.append(el('div','红：促进 / 风险\n绿：抑制 / 干预\n蓝：事实关联\n虚线：分类导航','cw-key'),b('重置筛选',()=>{state.enabled=new Set(groups.map(g=>g[0]));state.module='all';state.region='';state.stage='';state.relation='all';state.query='';search.value='';resetView();render();}));
 
 const oldSearch=$('search'),search=oldSearch.cloneNode(true);oldSearch.replaceWith(search);search.placeholder='搜索知识或输入问题，如：黑星病为什么发生';search.maxLength=180;
 const searchSuggestions=el('div',undefined,'cw-search-suggestions');searchSuggestions.id='cw-search-suggestions';searchSuggestions.hidden=true;$('search-form').append(searchSuggestions);searchSuggestions.setAttribute('role','listbox');search.setAttribute('role','combobox');search.setAttribute('aria-controls',searchSuggestions.id);search.setAttribute('aria-expanded','false');search.setAttribute('aria-autocomplete','list');
 const searchBar=el('div',undefined,'cw-search-state');searchBar.hidden=true;panel.insertBefore(searchBar,panelBody);
 const explainButton=b('解释当前关系',()=>explainGraph(),'cw-explain');modes.prepend(explainButton);
 const aiDialog=el('dialog',undefined,'cw-helper-dialog cw-ai-dialog');aiDialog.setAttribute('aria-label','AI 解读');document.body.append(aiDialog);
 let searchBefore=null,resultId=null,candidateIndex=-1,candidates=[],aiController=null,aiEpoch=0;
 const normalizeSearch=v=>String(v||'').normalize('NFKC').toLowerCase().replace(/[\s，。？！?！、,.（）()：:]/g,'');
 function searchScore(n,q){
  const query=normalizeSearch(q);if(!query)return 0;
  return Math.max(0,...[n.name,...(n.aliases||[])].map(v=>{const name=normalizeSearch(v);if(!name)return 0;if(name===query)return 100;if(name.includes(query))return 85;if(name.length>=2&&query.includes(name))return 75+Math.min(name.length,15);const core=query.replace(/为什么|怎么|如何|容易|发生|原因|防治|请问|什么|导致|的|吗|呢/g,'');if(core.length>=2&&name.includes(core))return 65;const short=name.replace(/^梨/,'');if(short.length>=3&&query.includes(short))return 70; if(query.length>=3&&Math.abs(name.length-query.length)<=1){let previous=Array.from({length:name.length+1},(_,i)=>i);for(let i=1;i<=query.length;i++){const row=[i];for(let j=1;j<=name.length;j++)row[j]=Math.min(row[j-1]+1,previous[j]+1,previous[j-1]+(query[i-1]===name[j-1]?0:1));previous=row;}if(previous[name.length]===1)return 45;}return 0;}));
 }
 function searchMatches(q){return state.crop==='pear'?data.nodes.map(n=>({n,score:searchScore(n,q)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.n.name.localeCompare(b.n.name)).map(r=>r.n):[];}
 function closeSuggestions(){searchSuggestions.hidden=true;search.setAttribute('aria-expanded','false');search.removeAttribute('aria-activedescendant');candidateIndex=-1;}
 function showSuggestions(){
  candidates=searchMatches(search.value).slice(0,8);candidateIndex=-1;searchSuggestions.replaceChildren();search.removeAttribute('aria-activedescendant');
  if(!search.value.trim()){closeSuggestions();return;}
  candidates.forEach((n,i)=>{const btn=b(n.name+' · '+(groupOf(n)?.[1]||n.type),()=>submitSearch(n.id));btn.id='cw-candidate-'+i;btn.setAttribute('role','option');btn.tabIndex=-1;btn.onpointerdown=e=>e.preventDefault();searchSuggestions.append(btn);});
  if(!candidates.length)searchSuggestions.append(el('p',state.crop==='pear'?'未找到候选，可尝试简称或别名。':'该作物尚未收录知识。'));
  searchSuggestions.hidden=false;search.setAttribute('aria-expanded','true');
 }
 search.addEventListener('input',showSuggestions);search.addEventListener('focus',()=>{if(search.value)showSuggestions();});
 search.addEventListener('keydown',e=>{if(e.isComposing)return;if(e.key==='Escape'){closeSuggestions();return;}if(['ArrowDown','ArrowUp'].includes(e.key)&&candidates.length){e.preventDefault();if(searchSuggestions.hidden)showSuggestions();candidateIndex=(candidateIndex+(e.key==='ArrowDown'?1:-1)+candidates.length)%candidates.length;[...searchSuggestions.querySelectorAll('[role=option]')].forEach((n,i)=>{n.classList.toggle('active',i===candidateIndex);n.setAttribute('aria-selected',String(i===candidateIndex));});search.setAttribute('aria-activedescendant','cw-candidate-'+candidateIndex);}if(e.key==='Enter'){e.preventDefault();submitSearch(candidateIndex>=0?candidates[candidateIndex].id:null);}});
 document.addEventListener('pointerdown',e=>{if(!$('search-form').contains(e.target))closeSuggestions();});
 $('search-form').onsubmit=e=>{e.preventDefault();submitSearch();};
 function submitSearch(id=null){
  const q=search.value.trim();if(!q){clearSearch();return;}
  if(!searchBefore)searchBefore={enabled:new Set(state.enabled),module:state.module,region:state.region,stage:state.stage,relation:state.relation};
  resetView();state.query=q;resultId=id;state.list=false;closeSuggestions();render();
 }
 function clearSearch(){resetView();if(searchBefore)Object.assign(state,searchBefore);searchBefore=null;resultId=null;state.query='';search.value='';closeSuggestions();render();}
 function updateSearchBar(){
  explainButton.disabled=state.crop!=='pear'||!current.edges.length;searchBar.hidden=!state.query;searchBar.replaceChildren();if(!state.query)return;
  const all=searchMatches(state.query),edges=scientificEdges(),ids=new Set(edges.flatMap(e=>[e.source,e.target]));const allowed=all.filter(n=>ids.has(n.id)&&(groupOf(n)?state.enabled.has(groupOf(n)[0]):state.enabled.size===groups.length));
  searchBar.append(el('strong','正在查看：'+state.query),el('span',`找到 ${all.length} 项相关知识 · 当前筛选可见 ${allowed.length} 项`),b('清除搜索',clearSearch,'cw-clear-search'));
  if(allowed.length<all.length)searchBar.append(b('放宽筛选',()=>{state.enabled=new Set(groups.map(g=>g[0]));state.region='';state.stage='';state.relation='all';state.module='all';resetView();render();},'cw-relax-search'));
  if(!all.length)searchBar.append(el('small',state.crop==='pear'?'未找到相关知识，请缩短关键词或尝试别名。':'该作物暂无知识数据。'));
  const results=el('div',undefined,'cw-search-results');for(const n of allowed){const btn=b(n.name,()=>{resetView();resultId=n.id;render();select(n);});btn.dataset.resultId=n.id;btn.classList.toggle('active',n.id===resultId);results.append(btn);}searchBar.append(results);
  if(/[?？]|为什么|如何|怎么/.test(state.query)){searchBar.append(b('按问题检索相关知识',()=>submitSearch()),b('AI 解读',()=>explainGraph()));searchBar.lastChild.disabled=!current.edges.length;}
 }
 function cancelExplanation(){aiEpoch++;aiController?.abort();aiController=null;if(aiDialog.open)aiDialog.close();}
 aiDialog.addEventListener('close',()=>{if(!aiDialog.open){aiEpoch++;aiController?.abort();}});
 function locateReference(n){if(!current.nodes.some(v=>v.id===n.id)){aiDialog.close();revisit(n.id);return;}aiDialog.close();select(n);const g=[...canvas.querySelectorAll('.cw-node')].find(g=>g.dataset.id===n.id);g?.classList.add('cw-search-hit');g?.focus({preventScroll:true});}
 async function explainGraph(){
  if(state.crop!=='pear'||!current.edges.length)return;
  aiController?.abort();const controller=new AbortController();aiController=controller;const epoch=++aiEpoch;
  const snapshot={nodes:[...current.nodes],edges:[...current.edges]};const query=state.query||state.selected?.name||snapshot.nodes.slice(0,3).map(n=>n.name).join('、');
  const head=el('div',undefined,'cw-helper-head');head.append(el('h2','AI 解读当前关系'),b('关闭',()=>aiDialog.close()));const answer=el('p','正在结合知识库检索依据…','cw-ai-answer');aiDialog.replaceChildren(head,el('small','按当前图谱发起解读，回答引用可能包含延伸资料；点击引用可查看依据。'),answer);if(!aiDialog.open)aiDialog.showModal();
  const context=snapshot.edges.slice(0,5).map(e=>`${label(e.source)}→${relations[e.relation]||e.relation}→${label(e.target)}`).join('；').slice(0,220);
  const question=`请解读梨知识图谱。问题：${query.slice(0,180)}。当前关系：${context}。区分分类与因果，结合来源和适用条件，证据不足时说明。`.slice(0,500);
  const timeout=setTimeout(()=>controller.abort(),90000);
  try{const response=await fetch('/api/graphrag/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question}),signal:controller.signal});const d=await response.json();if(epoch!==aiEpoch)return;if(!response.ok)throw Error(d.error||'解读服务暂不可用');answer.textContent=d.answer||'当前证据不足以生成解读。';
   const refs=el('div',undefined,'cw-ai-references');const cited=new Set((d.sources||[]).flatMap(s=>(s.citations||[]).flatMap(c=>c.edge_ids||[])));const edges=data.edges.filter(e=>cited.has(e.id));
   for(const e of edges){const row=el('div');row.append(b(`${label(e.source)} → ${relations[e.relation]||e.relation} → ${label(e.target)}`,()=>{aiDialog.close();if(!current.edges.some(v=>v.id===e.id))revisit(e.source);showEvidence(e);}));refs.append(row);}
   const nodeIds=new Set(edges.flatMap(e=>[e.source,e.target]));for(const n of data.nodes.filter(n=>nodeIds.has(n.id)))refs.append(b('定位：'+n.name,()=>locateReference(n)));
   for(const source of d.sources||[]){const row=el('div');sourceLink(row,{...source,id:source.source_id});refs.append(row);}if(refs.childNodes.length)aiDialog.append(el('h3','回答引用的知识与来源'),refs);
  }catch(error){if(epoch===aiEpoch){answer.textContent=error.name==='AbortError'?'解读超时，请重试。':'解读未完成：'+error.message;aiDialog.append(b('重试',explainGraph));}}finally{clearTimeout(timeout);}
 }
 const branches=new Map(), expansionOptions=new Map();
 let graphBox=null;
 function resetView(){cancelExplanation();state.expanded.clear();branches.clear();graphBox=null;state.positions.clear();state.view={x:0,y:0,k:1};state.selected=null;state.focusId=null;}
 function chooseCrop(key){cancelExplanation();searchBefore=null;resultId=null;state.query='';search.value='';closeSuggestions();state.crop=key;resetView();render();}
 function setModule(key){searchBefore=null;resultId=null;closeSuggestions();state.module=key;state.enabled=new Set(key==='all'?groups.map(g=>g[0]):[key]);state.query='';search.value='';resetView();render();}
 const causal=new Set(['CAUSES','PROMOTES','INHIBITS','INCREASES_RISK','REDUCES_RISK','INTERVENTION_FOR','MAY_LEAD_TO','MAY_REDUCE']);
 function scientificEdges(){if(state.crop!=='pear')return[];return data.edges.filter(e=>e.evidence_ids?.length&&e.review_status!=='draft'&&(!state.region||e.region===state.region)&&(!state.stage||(e.stage_ids||[]).includes(state.stage))&&(state.relation==='all'||(state.relation==='causal'?causal.has(e.relation):!causal.has(e.relation))));}
 function groupOf(n){return groups.find(g=>g[2].includes(n?.type));}
 let current={nodes:[],edges:[]};
 function select(n){state.selected=n;if(n&&!n.nav&&state.crop==='pear'){recent=[{crop:state.crop,id:n.id},...recent.filter(r=>r.crop!==state.crop||r.id!==n.id)].slice(0,50);storeLibrary('recent',recent);}renderInfo();}
 function toggle(n,more=false){
  if(!n.nav)select(n);
  const options=expansionOptions.get(n.id)||[];
  if(state.expanded.has(n.id)&&!more){
   const clear=id=>{if(!state.expanded.delete(id))return;for(const child of branches.get(id)||[])clear(child);branches.delete(id);};clear(n.id);
  }else if(options.length){
   state.expanded.add(n.id);
   branches.set(n.id,[...new Set([...(branches.get(n.id)||[]),...options.slice(0,8)])]);
  }else return;
  renderGraph();
 }
 function showEvidence(e){info.replaceChildren(el('h3','关系依据'),el('p',`${label(e.source)} → ${relations[e.relation]||e.relation} → ${label(e.target)}`),el('p',e.conditions?.join('；')||'以原文适用条件为准'),el('small',`地区：${e.region||'未标定'} · 证据等级：${e.evidence_level||'未分级'}`));data.sources.filter(s=>e.evidence_ids.includes(s.id)).forEach(s=>sourceLink(info,s));}
 function renderInfo(){info.replaceChildren(el('h3','知识详情与推理依据'));if(state.crop!=='pear'){info.append(el('p','暂无数据'));return;}const n=state.selected;if(!n){info.append(el('p','点节点查看相关知识，点有向连线查看证据。虚线仅用于分类导航。'));return;}info.append(el('h4',n.name),b(isSaved(n.id)?'★ 已收藏（点击取消）':'☆ 收藏此知识',()=>bookmark(n),'cw-bookmark'));const es=scientificEdges().filter(e=>e.source===n.id||e.target===n.id);es.slice(0,6).forEach(e=>info.append(b(`${label(e.source)} → ${relations[e.relation]||e.relation} → ${label(e.target)}`,()=>showEvidence(e),'cw-evidence')));
 const paths=[];function walk(id,path,seen){if(path.length>=3)return;for(const e of scientificEdges().filter(e=>e.source===id&&causal.has(e.relation))){if(seen.has(e.target))continue;const next=[...path,e];if(next.length>1)paths.push(next);walk(e.target,next,new Set([...seen,e.target]));if(paths.length>=6)return;}}walk(n.id,[],new Set([n.id]));if(paths.length){info.append(el('h4','有向影响路径'));paths.slice(0,3).forEach(path=>{const d=el('details');d.append(el('summary',[label(path[0].source),...path.map(e=>label(e.target))].join(' → ')));path.forEach(e=>d.append(b(relations[e.relation]||e.relation,()=>showEvidence(e))));info.append(d);});}info.append(el('small','知识路径不是数值风险预测；异地梨资料需要本地适用性复核。'));}
 function render(){cropSelect.value=state.crop;stageSelect.value=state.stage;regionSelect.value=state.region;relationSelect.value=state.relation;document.querySelectorAll('[data-crop-key]').forEach(n=>n.classList.toggle('active',n.dataset.cropKey===state.crop));nav.querySelectorAll('[data-module]').forEach(n=>n.classList.toggle('active',n.dataset.module===state.module));filters.querySelectorAll('[data-group]').forEach(n=>n.checked=state.enabled.has(n.dataset.group));title.textContent='🌿 '+(groups.find(g=>g[0]===state.module)?.[1]||'全域')+'知识图谱';subtitle.textContent=crops.find(c=>c[0]===state.crop)[1]+' · 点击展开相关知识，连线颜色区分关系，依据可追溯。';risk.replaceChildren(el('h3','相关风险知识'));if(state.crop==='pear'){risk.append(el('small','知识参考 · 未接入实时监测，不表示当前风险预警'));data.nodes.filter(n=>['PostharvestRisk','PhysiologicalDisorder'].includes(n.type)).slice(0,4).forEach(n=>risk.append(b('◇ '+n.name,()=>{resultId=null;state.query=n.name;search.value=n.name;resetView();state.enabled=new Set(groups.map(g=>g[0]));state.positions.clear();select(n);renderGraph();})));}else risk.append(el('p','暂无数据'));renderGraph();renderInfo();updateSearchBar();}
 function renderGraph(){const existingSvg=canvas.querySelector('#crop-graph');const clearCanvas=()=>canvas.replaceChildren();expansionOptions.clear();if(state.crop!=='pear'){clearCanvas();current={nodes:[],edges:[]};canvas.append(el('div','该作物知识图谱待建设','cw-empty'));status.textContent='暂无已收录知识';return;}
 if(!data.nodes.length){clearCanvas();current={nodes:[],edges:[]};canvas.append(el('div','正在连接知识库；若持续无数据，请检查Neo4j服务。','cw-empty'));status.textContent='知识库尚未加载，不使用演示节点替代。';return;}
 const es=scientificEdges(),degree=new Map();es.forEach(e=>{degree.set(e.source,(degree.get(e.source)||0)+1);degree.set(e.target,(degree.get(e.target)||0)+1);});
 const matched=(state.focusId?[nodeById(state.focusId)].filter(Boolean):data.nodes).filter(n=>degree.has(n.id)&&(groupOf(n)?state.enabled.has(groupOf(n)[0]):state.enabled.size===groups.length)&&(!state.query||(resultId?n.id===resultId:searchScore(n,state.query)>0)));const chosen=new Map(),navEdges=[],groupNodes=[];
 const root={id:'nav:root',name:'泊头鸭梨',type:'Navigation',nav:true};
 for(const g of groups.filter(g=>state.enabled.has(g[0]))){const list=matched.filter(n=>g[2].includes(n.type)).sort((a,b)=>(degree.get(b.id)||0)-(degree.get(a.id)||0));if(!list.length)continue;const gn={id:'nav:'+g[0],name:g[1],type:'Navigation',nav:true,group:g[0]};groupNodes.push(gn);const limit=state.enabled.size===1?12:4;list.slice(0,limit).forEach(n=>{chosen.set(n.id,n);navEdges.push({source:gn.id,target:n.id,nav:true});});navEdges.push({source:root.id,target:gn.id,nav:true});expansionOptions.set(gn.id,list.slice(limit).map(n=>n.id));}
 if(state.query)matched.filter(n=>!groupOf(n)).slice(0,8).forEach(n=>chosen.set(n.id,n));
 if(state.focusId&&nodeById(state.focusId))chosen.set(state.focusId,nodeById(state.focusId));
 // A filtered module keeps a bounded one-hop context instead of isolated entities.
 if(state.enabled.size===1||state.query||state.focusId){const seeds=new Set(chosen.keys());for(const e of es){if(chosen.size>=32)break;if(seeds.has(e.source)||seeds.has(e.target)){chosen.set(e.source,nodeById(e.source));chosen.set(e.target,nodeById(e.target));}}}
 // Traverse only branches reachable from the baseline: collapsed descendants cannot reappear alone.
 const parents=new Map(navEdges.map(e=>[e.target,e.source])),queue=[...groupNodes.map(n=>n.id),...chosen.keys()],visited=new Set();
 for(let i=0;i<queue.length;i++){const id=queue[i];if(visited.has(id))continue;visited.add(id);if(!state.expanded.has(id))continue;for(const child of branches.get(id)||[]){const n=nodeById(child);if(!n)continue;if(!chosen.has(child)){chosen.set(child,n);parents.set(child,id);}if(id.startsWith('nav:'))navEdges.push({source:id,target:child,nav:true});queue.push(child);}}
 for(const [id,options]of expansionOptions)expansionOptions.set(id,options.filter(child=>!chosen.has(child)));
 for(const id of chosen.keys()){const neighbors=new Set();for(const e of es){const other=e.source===id?e.target:e.target===id?e.source:null;if(other&&!chosen.has(other)&&nodeById(other))neighbors.add(other);}expansionOptions.set(id,[...neighbors]);}
 const realEdges=es.filter(e=>chosen.has(e.source)&&chosen.has(e.target));current={nodes:[...chosen.values()].filter(Boolean),edges:realEdges};status.textContent=`显示 ${current.nodes.length} 条知识 / ${realEdges.length} 条真实关系 · 分类虚线不代表农业因果关系`;
 if(!chosen.size){clearCanvas();canvas.append(el('div','当前筛选条件下暂无知识，请调整筛选。','cw-empty'));return;}
 if(state.list){clearCanvas();const list=el('div',undefined,'cw-list');current.nodes.forEach(n=>list.append(b(n.name,()=>select(n))));canvas.append(list);return;}
 const nodes=[root,...groupNodes,...current.nodes],allEdges=[...navEdges,...realEdges];const positions=state.positions;
 // Retain established coordinates. Search free slots only for newly introduced nodes.
 const occupied=nodes.filter(n=>positions.has(n.id)).map(n=>positions.get(n.id));
 function place(id,anchor,angle,radius){if(positions.has(id))return;let candidate,fallback;
  const bounds=graphBox?.split(' ').map(Number);
  search:for(let ring=0;ring<24;ring++)for(let slot=0;slot<24;slot++){
   const a=angle+(slot%2?1:-1)*Math.ceil(slot/2)*Math.PI/12,r=radius+ring*80;
   candidate={x:anchor.x+Math.cos(a)*r,y:anchor.y+Math.sin(a)*r};
   if(occupied.every(p=>Math.hypot(p.x-candidate.x,p.y-candidate.y)>=128)){
    fallback??=candidate;
    if(!bounds||(candidate.x>bounds[0]+75&&candidate.x<bounds[0]+bounds[2]-75&&candidate.y>bounds[1]+75&&candidate.y<bounds[1]+bounds[3]-85)){fallback=candidate;break search;}
   }
  }candidate=fallback||candidate;positions.set(id,candidate);occupied.push(candidate);
 }
 if(!positions.has(root.id)){positions.set(root.id,{x:525,y:365});occupied.push(positions.get(root.id));}
 groupNodes.forEach((g,i)=>place(g.id,positions.get(root.id),-Math.PI/2+i*Math.PI*2/groupNodes.length,240));
 if(!graphBox)groupNodes.forEach((g,i)=>{
  const leaves=navEdges.filter(e=>e.source===g.id).map(e=>e.target);
  leaves.forEach((id,j)=>{const sector=Math.PI*2/groupNodes.length,angle=groupNodes.length===1?j*Math.PI*2/leaves.length:-Math.PI/2+i*sector+(j-(leaves.length-1)/2)*sector/(leaves.length+1);place(id,positions.get(root.id),angle,390);});
 });
 for(const n of nodes){if(positions.has(n.id))continue;const anchor=positions.get(parents.get(n.id))||positions.get(root.id);const angle=Math.atan2(anchor.y-365,anchor.x-525);place(n.id,anchor,angle,155);}
 const svg=existingSvg||svgEl('svg',{role:'group','aria-label':'作物知识图谱'});svg.id='crop-graph';
 const retained=new Map([...svg.querySelectorAll('.cw-node')].map(g=>[g.dataset.id,g]));
 const focused=document.activeElement?.closest?.('.cw-node')?.dataset.id;
 svg.replaceChildren();if(!existingSvg){clearCanvas();canvas.append(svg);}
 function fitBox(){const ps=nodes.map(n=>positions.get(n.id)),minX=Math.min(...ps.map(p=>p.x))-100,minY=Math.min(...ps.map(p=>p.y))-100,maxX=Math.max(...ps.map(p=>p.x))+100,maxY=Math.max(...ps.map(p=>p.y))+100;graphBox=`${minX} ${minY} ${maxX-minX} ${maxY-minY}`;svg.setAttribute('viewBox',graphBox);}
 if(!graphBox)fitBox();else svg.setAttribute('viewBox',graphBox);
 const layer=svgEl('g',{});svg.append(layer);const defs=svgEl('defs',{});svg.prepend(defs);for(const [id,color]of [['red','#ee7777'],['green','#37ad78'],['blue','#6a9fde']]){const marker=svgEl('marker',{id:'cw-arrow-'+id,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto'});marker.append(svgEl('path',{d:'M0 0L10 5L0 10Z',fill:color}));defs.append(marker);}
 const lines=[];for(const e of allEdges){if(!positions.has(e.source)||!positions.has(e.target))continue;const kind=['REDUCES_RISK','INHIBITS','INTERVENTION_FOR'].includes(e.relation)?'green':causal.has(e.relation)?'red':'blue';const line=svgEl('line',{class:e.nav?'cw-nav-edge':'cw-real-edge',stroke:e.nav?'#718c80':{red:'#ee7777',green:'#37ad78',blue:'#6a9fde'}[kind]});if(!e.nav){line.setAttribute('marker-end',`url(#cw-arrow-${kind})`);line.setAttribute('tabindex',0);line.onclick=()=>showEvidence(e);line.onkeydown=v=>{if(v.key==='Enter')showEvidence(e);};const tip=svgEl('title',{});tip.textContent=`${label(e.source)} → ${relations[e.relation]||e.relation} → ${label(e.target)}`;line.append(tip);}lines.push({e,line});layer.append(line);}
 const elements=new Map();nodes.forEach(n=>{const p=positions.get(n.id),g=retained.get(n.id)||svgEl('g',{class:'cw-node',tabindex:0,role:'button'});g.replaceChildren();g.dataset.id=n.id;g.classList.toggle('cw-search-hit',!!state.query&&searchScore(n,state.query)>0);const isRoot=n.id===root.id,group=groups.find(v=>v[0]===n.group)||groupOf(n),r=isRoot?65:n.nav?46:43;g.append(svgEl('circle',{r,fill:isRoot?'#e7f6db':(group?['#fff0ef','#e9f8ee','#edf5ff','#eaf8ef','#fff5e6','#f4effb'][groups.indexOf(group)]:'#eceffa'),stroke:group?.[3]||'#66b68c','stroke-width':1.4}));if(isRoot){const clip=svgEl('clipPath',{id:'cw-crop-clip'});clip.append(svgEl('circle',{cy:-12,r:43}));defs.append(clip);g.append(svgEl('image',{href:window.CROP_IMAGES.pear,x:-43,y:-55,width:86,height:86,preserveAspectRatio:'xMidYMid slice','clip-path':'url(#cw-crop-clip)'}));}else{const icon=svgEl('text',{'text-anchor':'middle',y:-15,class:'cw-icon'});icon.textContent=group?.[4]||'◇';g.append(icon);}const text=svgEl('text',{'text-anchor':'middle',class:'cw-node-label'});const chars=Array.from(n.name),rows=[];for(let i=0;i<chars.length;i+=5)rows.push(chars.slice(i,i+5).join(''));rows.slice(0,3).forEach((s,i)=>{const t=svgEl('tspan',{x:0,y:isRoot?49:(rows.length>2?0:8)+i*13});t.textContent=i===2&&rows.length>3?s.slice(0,4)+'…':s;text.append(t);});g.append(text);const tooltip=svgEl('title',{});tooltip.textContent=n.name;g.append(tooltip);const remaining=(expansionOptions.get(n.id)||[]).length,expanded=state.expanded.has(n.id);
 const caption=isRoot?'分类导航':expanded?'点击收起':remaining?`可展开 ${remaining} 项`:'已显示全部 · 0 项';
 g.dataset.remaining=remaining;g.dataset.expanded=expanded;g.setAttribute('aria-label',n.name+'，'+caption);if(!isRoot)g.setAttribute('aria-expanded',String(expanded));
 const badge=svgEl('text',{'text-anchor':'middle',y:r+16,class:'cw-expand-label'});badge.textContent=caption;g.append(badge);
 if(expanded&&remaining){const more=svgEl('g',{class:'cw-more',role:'button',tabindex:0,'aria-label':`再展开 ${Math.min(8,remaining)} 项，剩余 ${remaining} 项`});more.append(svgEl('rect',{x:-58,y:r+21,width:116,height:20,rx:10,fill:'#e6f5ef'}));const mt=svgEl('text',{'text-anchor':'middle',y:r+35});mt.textContent=`再展开 ${Math.min(8,remaining)} / ${remaining} 项`;more.append(mt);more.onclick=e=>{e.stopPropagation();toggle(n,true);};more.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();toggle(n,true);}};g.append(more);}
 tooltip.textContent=n.name+' · '+caption+(remaining?'（每次最多展开 8 项）':'');g._activate=()=>{if(!isRoot)toggle(n);};g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();g._activate();}};elements.set(n.id,g);layer.append(g);});
 function update(){elements.forEach((g,id)=>{const p=positions.get(id);g.setAttribute('transform',`translate(${p.x},${p.y})`);});for(const {e,line}of lines){const a=positions.get(e.source),b=positions.get(e.target),d=Math.hypot(b.x-a.x,b.y-a.y)||1,k=45;for(const [key,v]of Object.entries({x1:a.x+(b.x-a.x)*k/d,y1:a.y+(b.y-a.y)*k/d,x2:b.x-(b.x-a.x)*k/d,y2:b.y-(b.y-a.y)*k/d}))line.setAttribute(key,v);}}
 const view=()=>layer.setAttribute('transform',`translate(${state.view.x},${state.view.y}) scale(${state.view.k})`),point=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};let drag=null;svg.onpointerdown=e=>{if(e.button!==0||e.target.closest('.cw-real-edge,.cw-more'))return;drag={id:e.target.closest('.cw-node')?.dataset.id,p:point(e),start:point(e),moved:false};svg.setPointerCapture(e.pointerId);};svg.onpointermove=e=>{if(!drag)return;const p=point(e);if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>4)drag.moved=true;if(drag.moved){const dx=p.x-drag.p.x,dy=p.y-drag.p.y;if(drag.id){const n=positions.get(drag.id);n.x+=dx/state.view.k;n.y+=dy/state.view.k;update();}else{state.view.x+=dx;state.view.y+=dy;view();}}drag.p=p;};svg.onpointerup=e=>{const d=drag;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(d&&!d.moved&&d.id)elements.get(d.id)._activate();};svg.onpointercancel=()=>drag=null;svg.onwheel=e=>{e.preventDefault();const p=point(e),old=state.view.k,k=Math.max(.4,Math.min(3,old*(e.deltaY<0?1.12:1/1.12)));state.view.x=p.x-(p.x-state.view.x)*k/old;state.view.y=p.y-(p.y-state.view.y)*k/old;state.view.k=k;view();};update();view();if(focused)elements.get(focused)?.focus({preventScroll:true});canvas.querySelector('.cw-zoom')?.remove();const controls=el('div',undefined,'cw-zoom');controls.append(b('＋',()=>{state.view.k=Math.min(3,state.view.k*1.2);view();}),b('－',()=>{state.view.k=Math.max(.4,state.view.k/1.2);view();}),b('适应画布',()=>{fitBox();state.view={x:0,y:0,k:1};view();}));canvas.append(controls);
 }
 function exportGraph(){const blob=new Blob([JSON.stringify({crop:crops.find(c=>c[0]===state.crop)[1],nodes:current.nodes,edges:current.edges},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='知识子图.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const oldFiltered=dashboardFiltered;dashboardFiltered=function(){oldFiltered();if(stageSelect.options.length===1){data.nodes.filter(n=>['GrowthStage','Stage'].includes(n.type)).forEach(n=>stageSelect.add(new Option(n.name,n.id)));[...new Set(data.edges.map(e=>e.region).filter(Boolean))].forEach(r=>regionSelect.add(new Option(r,r)));}render();};render();
})();
