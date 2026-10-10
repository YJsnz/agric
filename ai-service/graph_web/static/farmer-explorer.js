/* Farmer-facing projection of the existing graph. No synthetic scientific edges. */
(() => {
 const state={problem:'leaf',symptom:null,candidate:null,tab:'cause',expanded:new Set(),section:'symptoms'};
 const main=document.querySelector('main'),oldEntry=document.querySelector('.visual-entry');
 const workspaceUrl=new URL(`http://${location.hostname}:8081/platform/workspaces/farm-01`);workspaceUrl.searchParams.set('module','vision');
 const workLink=(text)=>{const a=el('a',text,'farmer-camera');a.href=workspaceUrl.href;return a;};
 const button=(text,fn,cls='')=>{const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;};
 const picture=(photo,alt,cls='')=>{if(!photo)return el('div','🌿',`farmer-placeholder ${cls}`);const img=el('img',undefined,cls);img.src=photo.src;img.alt=alt;return img;};
 const pretty=n=>n?.name==='梨黑星病'?'黑星病':n?.name||'请选择要了解的知识';
 const scope=()=>matching.nodes;
 const edgeList=()=>matching.edges.filter(e=>e.evidence_ids?.length && e.review_status!=='draft');
 const neighbors=id=>edgeList().filter(e=>e.source===id||e.target===id);
 const other=(e,id)=>nodeById(e.source===id?e.target:e.source);
 const hasType=(n,ts)=>!!n&&ts.includes(n.type);
 const byName=name=>scope().find(n=>n.name===name);
 const refs=window.GRAPH_ILLUSTRATIONS||{};
 const leafChoices=[
  {label:'黑色小斑点',hint:'叶子上有很多黑色小点',photo:refs['黑色小斑点'],names:['叶片黑色斑点']},
  {label:'大片褐色斑',hint:'叶子出现较大的褐色斑块',photo:refs['大片褐色斑'],names:['大片褐色斑']},
  {label:'叶片卷曲',hint:'叶子卷起来、发皱变形',photo:refs['叶片卷曲'],names:['叶片卷曲','叶片皱缩扭曲','叶缘上卷']},
  {label:'看不出来',hint:'不确定，想先看看所有类型',photo:refs['健康叶参考'],names:[],unsure:true}
 ];
 document.body.classList.add('farmer-page');
 const advanced=el('details',undefined,'farmer-advanced');advanced.id='full-knowledge';advanced.append(el('summary','查看完整知识图谱与资料工具'));
 for(const selector of ['.knowledge-stats','.graph-intro','.upper','.bottom-grid','#audit-counts']){const n=main.querySelector(selector);if(n)advanced.append(n);}
 main.append(advanced);oldEntry.hidden=true;
 const page=el('section',undefined,'farmer-explorer');main.prepend(page);
 const hero=el('div',undefined,'farmer-hero');hero.append(el('h1','🍃 我遇到啥问题？'),el('p','点一下图片，找到和你家梨树相似的情况，了解可能原因和处理方法。'));
 const topics=el('div',undefined,'farmer-topic-grid');hero.append(topics);page.append(hero);
 const grid=el('div',undefined,'farmer-content'),left=el('div',undefined,'farmer-left'),symptoms=el('section',undefined,'farmer-symptoms farmer-panel'),knowledge=el('section',undefined,'farmer-knowledge farmer-panel'),detail=el('aside',undefined,'farmer-summary farmer-panel');
 left.append(symptoms,knowledge);grid.append(left,detail);page.append(grid);
 const browse=el('section',undefined,'farmer-browse farmer-panel');browse.hidden=true;page.append(browse);
 const nav=document.querySelector('.navigation'),legacyNav=el('details',undefined,'farmer-legacy-nav');legacyNav.append(el('summary','作物与更多工具'));while(nav.firstChild)legacyNav.append(nav.firstChild);
 const navItems=[['home','⌂','首页'],['symptoms','☘','按症状找原因'],['questions','♧','梨树常见问题'],['management','🌱','种植管理知识'],['diseases','♧','病虫害图鉴'],['stages','♧','生长过程'],['storage','▣','采收与储藏'],['environment','☀','气候与环境'],['faq','☏','常见问答']];
 for(const [key,icon,name]of navItems){const b=button(`${icon}　${name}`,()=>openSection(key),'farmer-nav');b.dataset.section=key;nav.append(b);}
 const camera=workLink('看不出来？\n去拍照识别　➜');camera.classList.add('farmer-camera-card');camera.prepend(el('span','👨‍🌾','farmer-farmer-icon'));camera.append(el('small','数字工作台 · AI视觉模块'));nav.append(camera,legacyNav);
 document.querySelector('.brand small').textContent='让梨树种得好、果子品质高';
 $('search').placeholder='搜索病虫害、管理方法（例如：黑星病、套袋、施肥、剪枝…）';
 document.querySelector('header .workspace-link').href=workspaceUrl.href;
 document.querySelector('header .workspace-link').textContent='↗ 切换到数字工作台';
 help.onclick=()=>{ $('tool-title').textContent='看图找知识';$('tool-content').replaceChildren(el('p','1. 先选果子、叶片、虫子等情况，再点最像的症状图片。'),el('p','2. 查看资料中与症状相关的病虫害。图片相似不代表确诊。'),el('p','3. 切换发生条件、传播途径或防治方法，点连线或“查看依据”读原始资料。'),el('p','4. 不确定时可跳转数字工作台。现有视觉模块的识别能力以工作台实际模型为准。'));openDialog('tool-dialog');};
 function selectProblem(id){state.problem=id;state.symptom=null;state.candidate=null;state.tab='cause';state.expanded.clear();state.section='symptoms';render();}
 for(const topic of visualTopics){const b=button('',()=>selectProblem(topic.id),'farmer-topic');b.dataset.problem=topic.id;b.append(picture(window.GRAPH_TOPIC_IMAGES?.[topic.icon],topic.title),el('span','🍃','farmer-topic-icon'),el('strong',topic.title),el('small',topic.hint));topics.append(b);}
 function choices(){if(['leaf','curl'].includes(state.problem))return leafChoices;const topic=visualTopics.find(t=>t.id===state.problem);return scope().filter(n=>topic.types.includes(n.type)&&(!topic.terms.length||topic.terms.some(t=>n.name.includes(t)))).slice(0,8).map(n=>({label:n.name,hint:'查看资料中的相关知识',names:[n.name],photo:graphImage(n.name)}));}
 function matches(){return (state.symptom?.names||[]).map(byName).filter(Boolean);}
 function candidates(){const ns=matches(),ids=new Set(ns.map(n=>n.id)),found=new Map();for(const n of ns)if(hasType(n,['Disease','Pest','PhysiologicalDisorder']))found.set(n.id,n);for(const e of edgeList()){if(e.relation!=='HAS_SYMPTOM')continue;if(ids.has(e.target)&&hasType(nodeById(e.source),['Disease','Pest','PhysiologicalDisorder']))found.set(e.source,nodeById(e.source));}return [...found.values()];}
 function pick(c){state.symptom=c;state.expanded.clear();state.tab='cause';state.candidate=candidates()[0]||matches()[0]||null;render();}
 function full(n){advanced.open=true;if(n)focusNode(n);advanced.scrollIntoView({behavior:'smooth'});}
 function evidence(e){showEdge(e);$('tool-title').textContent='这条知识的依据';$('tool-content').replaceChildren(...Array.from($('detail-content').childNodes,n=>n.cloneNode(true)));openDialog('tool-dialog');}
 function contextEdges(n){if(!n)return[];const direct=neighbors(n.id),process=new Set(direct.filter(e=>e.relation==='HAS_PROCESS').map(e=>other(e,n.id)?.id));return edgeList().filter(e=>e.source===n.id||e.target===n.id||process.has(e.source)||process.has(e.target));}
 function relatedEdges(n){const all=contextEdges(n);if(state.tab==='conditions')return all.filter(e=>[nodeById(e.source),nodeById(e.target)].some(n=>hasType(n,['EnvironmentFactor','StorageCondition','Condition','GrowthStage'])));if(state.tab==='spread')return all.filter(e=>[e.source,e.target].some(id=>/传播|侵染|孢子|病原|越冬/.test(label(id))));if(state.tab==='care')return all.filter(e=>['CONTROLLED_BY','INTERVENTION_FOR','RECOMMENDS','REDUCES_RISK','INHIBITS'].includes(e.relation));if(state.tab==='cause')return all.filter(e=>!['HAS_DISEASE','HAS_PEST','HAS_SYMPTOM'].includes(e.relation));return all;}
 function relationText(e){return `${label(e.source)} · ${relations[e.relation]||'关联'} · ${label(e.target)}`;}
 function renderSymptoms(){symptoms.replaceChildren();const head=el('div',undefined,'farmer-panel-head');head.append(button('← 返回',()=>{state.symptom=null;state.candidate=null;render();},'farmer-back'),el('div'));head.lastChild.append(el('h2',state.problem==='leaf'?'🍃 你的叶子更像哪一种？':state.problem==='curl'?'🍃 叶子是什么样的？':'🍃 你看到的更像哪一种？'),el('p','点一张最像的图片，查看相关知识。'));head.append(workLink('▣ 看不出来？去拍照识别'));symptoms.append(head);
 const list=el('div',undefined,'farmer-symptom-grid');for(const c of choices()){const b=button('',()=>pick(c),'farmer-symptom');b.dataset.symptom=c.label;b.classList.toggle('active',state.symptom?.label===c.label);b.setAttribute('aria-pressed',String(state.symptom?.label===c.label));b.append(picture(c.photo,c.label),el('strong',c.label),el('small',c.hint));if(state.symptom?.label===c.label)b.append(el('span','✓','farmer-check'));list.append(b);}if(!list.children.length)list.append(el('p','当前条件下暂未收录，可在完整资料中继续查找。'));symptoms.append(list);}
 function renderKnowledge(){knowledge.replaceChildren();const tabs=el('div',undefined,'farmer-tabs');for(const [key,name]of [['cause','可能的原因'],['conditions','发生条件'],['spread','传播途径'],['care','防治方法'],['related','相关知识']]){const b=button(name,()=>{state.tab=key;state.expanded.clear();renderKnowledge();},state.tab===key?'active':'');b.dataset.knowledgeTab=key;tabs.append(b);}knowledge.append(tabs);
 const body=el('div',undefined,'farmer-knowledge-body'),list=el('div',undefined,'farmer-candidates');list.append(el('h3','相关病虫害'));const found=candidates();
 for(const n of found){const b=button('',()=>{state.candidate=n;state.expanded.clear();renderKnowledge();renderSummary();},'farmer-candidate');b.classList.toggle('active',n.id===state.candidate?.id);b.append(picture(graphImage(n.name),n.name),el('span',pretty(n)),el('span','›'));list.append(b);}
 if(!found.length)list.append(el('p',state.symptom?'暂无直接关联记录，不能据此确定病因。':'先选症状，或查看图鉴参考。'));
 list.append(button('查看更多病虫害',()=>openSection('diseases'),'farmer-more'));body.append(list);const canvas=el('div',undefined,'farmer-relation-area');body.append(canvas);knowledge.append(body);
 const n=state.candidate;if(!n){canvas.append(el('div',state.symptom?.unsure?'不确定也没关系，先查看病虫害图鉴，或前往数字工作台。':'选一张症状图，看看资料怎么说。','farmer-empty'));return;}
 if(!found.some(v=>v.id===n.id))canvas.append(el('small','图鉴参考 · 不代表与当前症状已建立关联','farmer-reference-note'));
 const edges=relatedEdges(n);if(state.tab==='care'||state.tab==='spread'){const steps=el('div',undefined,'farmer-steps');edges.slice(0,10).forEach((e,i)=>{const card=el('article');card.append(el('b',String(i+1)),el('div',relationText(e)),button('查看依据',()=>evidence(e)));steps.append(card);});if(!edges.length)steps.append(el('p','当前资料尚未提供这部分有证据的知识。'));canvas.append(steps);return;}
 renderGraph(canvas,n,edges);canvas.append(el('div','🔵 环境条件　 🟠 发生过程　 🟡 症状与影响　 🟢 相关对象','farmer-legend'));}
 function renderGraph(parent,center,baseEdges){
 const all=[...baseEdges.slice(0,8)];for(const id of state.expanded)for(const e of neighbors(id).slice(0,6))if(!all.some(a=>a.id===e.id))all.push(e);
 const nodes=new Map([[center.id,center]]);for(const e of all){nodes.set(e.source,nodeById(e.source));nodes.set(e.target,nodeById(e.target));}
 const svg=svgEl('svg',{viewBox:'0 0 760 350',role:'group','aria-label':'当前知识关系图'});svg.classList.add('farmer-graph');parent.append(svg);const layer=svgEl('g',{});svg.append(layer);const pos=new Map([[center.id,{x:380,y:175}]]),others=[...nodes.values()].filter(n=>n&&n.id!==center.id);
 others.forEach((n,i)=>{const side=i%2, row=Math.floor(i/2),count=Math.ceil(others.length/2);pos.set(n.id,{x:side?610:150,y:count<=3?65+row*108:35+row*280/(count-1)});});
 const lines=[];for(const e of all){if(!pos.has(e.source)||!pos.has(e.target))continue;const line=svgEl('line',{class:'farmer-graph-edge',tabindex:0,role:'button','aria-label':relationText(e)+'，查看依据'});line.onclick=()=>evidence(e);line.onkeydown=v=>{if(v.key==='Enter')evidence(e);};const title=svgEl('title',{});title.textContent=relationText(e);line.append(title);layer.append(line);lines.push({line,e});}
 const groups=new Map();for(const [id,n]of nodes){if(!n)continue;const g=svgEl('g',{class:'farmer-graph-node',tabindex:0,role:'button','aria-label':n.name+'，点击展开或收起'});g.dataset.node=id;const isCenter=id===center.id;
 if(isCenter){g.append(svgEl('circle',{r:70,fill:'#e4f6e7',stroke:'#b8ebc4'}));const photo=graphImage(n.name);if(photo){const defs=svgEl('defs',{}),clip=svgEl('clipPath',{id:'farmer-center-clip'});clip.append(svgEl('circle',{cy:-18,r:44}));defs.append(clip);g.append(defs,svgEl('image',{href:photo.src,x:-44,y:-62,width:88,height:88,'clip-path':'url(#farmer-center-clip)',preserveAspectRatio:'xMidYMid slice'}));}const text=svgEl('text',{'text-anchor':'middle',y:46});text.textContent=pretty(n);g.append(text);
 }else{const env=hasType(n,['EnvironmentFactor','Condition','StorageCondition']),sym=hasType(n,['Symptom','QualityIndicator']);g.append(svgEl('rect',{x:-105,y:-27,width:210,height:54,rx:27,fill:env?'#e2f3ff':sym?'#fff5d8':'#e9f6e6'}));const icon=svgEl('text',{x:-80,y:7,'font-size':25});icon.textContent=env?'💧':sym?'🍂':'🌿';g.append(icon);const txt=svgEl('text',{x:15,y:5,'text-anchor':'middle'});txt.textContent=n.name.length>12?n.name.slice(0,11)+'…':n.name;g.append(txt);const title=svgEl('title',{});title.textContent=n.name;g.append(title);}
 const toggle=()=>{state.expanded.has(id)?state.expanded.delete(id):state.expanded.add(id);renderKnowledge();};g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}};g._toggle=toggle;groups.set(id,g);layer.append(g);}
 function update(){for(const[id,g]of groups){const p=pos.get(id);g.setAttribute('transform',`translate(${p.x},${p.y})`);}for(const {line,e}of lines){const a=pos.get(e.source),b=pos.get(e.target);for(const [k,v]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))line.setAttribute(k,v);}}update();
 let drag=null,transform={x:0,y:0,k:1};const point=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());},view=()=>layer.setAttribute('transform',`translate(${transform.x},${transform.y}) scale(${transform.k})`);
 svg.onpointerdown=e=>{if(e.button!==0||e.target.closest('.farmer-graph-edge'))return;drag={id:e.target.closest('[data-node]')?.dataset.node,p:point(e),start:point(e),moved:false};svg.setPointerCapture(e.pointerId);};
 svg.onpointermove=e=>{if(!drag)return;const p=point(e);if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>4)drag.moved=true;if(drag.moved){const dx=p.x-drag.p.x,dy=p.y-drag.p.y;if(drag.id){const n=pos.get(drag.id);n.x+=dx/transform.k;n.y+=dy/transform.k;update();}else{transform.x+=dx;transform.y+=dy;view();}}drag.p=p;};
 svg.onpointerup=e=>{if(!drag)return;const d=drag;drag=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(!d.moved&&d.id)groups.get(d.id)._toggle();};svg.onpointercancel=()=>drag=null;
 svg.addEventListener('wheel',e=>{e.preventDefault();const p=point(e),k=Math.max(.45,Math.min(2.5,transform.k*(e.deltaY<0?1.1:1/1.1)));transform.x=p.x-(p.x-transform.x)*k/transform.k;transform.y=p.y-(p.y-transform.y)*k/transform.k;transform.k=k;view();},{passive:false});
 if(!all.length)parent.append(el('p','当前标签下暂无关联记录。可切换“相关知识”查看。'));
 parent.append(el('small','点击知识展开，点击连线查看依据；可拖动、缩放。连线表示原文关系，不都代表因果。','farmer-graph-hint'));
 }
 function renderSummary(){detail.replaceChildren();const n=state.candidate;detail.append(el('h2',pretty(n)),el('span',n?'知识参考':'等待选择','farmer-tag'));if(!n){detail.append(el('p','从左边选择症状，查看可能相关的病虫害及来源。'));return;}
 const photo=graphImage(n.name);detail.append(picture(photo,n.name,'farmer-main-photo'));if(photo)detail.append(el('small','用户提供／参考图片，仅供对照','farmer-muted'));
 const edges=contextEdges(n),sym=neighbors(n.id).filter(e=>e.relation==='HAS_SYMPTOM').map(e=>label(e.target));detail.append(el('p',sym.length?`资料记载的表现包括：${sym.slice(0,3).join('、')}。`:'具体适用条件与处理方法，请查看下方知识及原始依据。'));
 const gallery=window.GRAPH_IMAGE_GALLERIES?.[['梨黑星病','黑星病'].includes(n.name)?'黑星病':n.name];if(gallery){detail.append(el('h3','▎ 症状参考'));const strip=el('div',undefined,'reference-photo-grid');for(const p of gallery)strip.append(referenceFigure(p,p.caption));detail.append(strip);}
 const stages=[...new Set(edges.flatMap(e=>(e.stage_ids||[]).map(label)))],env=[...new Set(edges.flatMap(e=>[nodeById(e.source),nodeById(e.target)]).filter(v=>hasType(v,['EnvironmentFactor','Condition'])).map(v=>v.name))];
 for(const [title,value] of [['◷ 适用时期',stages.slice(0,3).join('、')||'资料未标定'],['☂ 相关环境',env.slice(0,3).join('、')||'暂无直接环境记录'],['▧ 资料范围',[...new Set(edges.map(e=>e.region))].join('、')||'待补充']]){const row=el('p',undefined,'farmer-summary-row');row.append(el('b',title+'：'),el('span',value));detail.append(row);}
 detail.append(el('p','异地梨类资料需结合当地品种与条件复核。','farmer-muted'));const actions=el('div',undefined,'farmer-summary-actions');actions.append(button('查看防治方法 →',()=>{state.tab='care';renderKnowledge();},'primary'),button('查看详细知识 →',()=>full(n)));detail.append(actions);const ids=new Set(edges.flatMap(e=>e.evidence_ids||[]));const sources=el('details',undefined,'farmer-sources');sources.append(el('summary',`查看资料来源（${ids.size}）`));for(const s of data.sources.filter(s=>ids.has(s.id)))sourceLink(sources,s);detail.append(sources);}
 function openSection(key){state.section=key;render();if(['symptoms','home'].includes(key)){page.scrollIntoView({behavior:'smooth'});return;}browse.replaceChildren(el('h2',navItems.find(v=>v[0]===key)?.[2]||'搜索结果'));const ts={management:['AgriculturalPractice','PreventionMeasure','Intervention'],diseases:['Disease','Pest','PhysiologicalDisorder'],stages:['GrowthStage'],storage:['HarvestProcess','StorageCondition','PostharvestRisk'],environment:['EnvironmentFactor','Condition']};const list=el('div',undefined,'farmer-browse-grid');let ns=scope().filter(n=>ts[key]?.includes(n.type)||(!ts[key]&&n.type==='Symptom'));for(const n of ns.slice(0,100)){const b=button('',()=>{state.candidate=n;state.symptom=null;state.section='symptoms';state.tab='related';state.expanded.clear();render();},'farmer-browse-card');b.append(picture(graphImage(n.name),n.name),el('strong',key==='faq'||key==='questions'?`${n.name}，了解哪些知识？`:pretty(n)));list.append(b);}if(!ns.length)list.append(el('p','当前资料尚未收录这一类内容。'));browse.append(list);}
 function render(){grid.hidden=!['home','symptoms'].includes(state.section);browse.hidden=!grid.hidden;for(const b of nav.querySelectorAll('[data-section]'))b.classList.toggle('active',b.dataset.section===state.section);for(const b of topics.children){b.classList.toggle('active',b.dataset.problem===state.problem);b.setAttribute('aria-pressed',String(b.dataset.problem===state.problem));}renderSymptoms();renderKnowledge();renderSummary();}
 const searchForm=$('search-form');$('search').removeEventListener('input',filter); // legacy filtering listeners are bypassed for the farmer search field below
 const searchInput=$('search').cloneNode(true);$('search').replaceWith(searchInput);
 searchForm.onsubmit=e=>{e.preventDefault();const q=searchInput.value.trim();if(!q)return;const terms=[q,...q.replace(/梨树|怎么|如何|为什么|什么时候|怎么办|有|的|了|呢/g,' ').split(/\s+/).filter(v=>v.length>1)];if(/黑点|黑斑|叶斑/.test(q)){selectProblem('leaf');pick(leafChoices[0]);return;}if(/卷叶|卷起来|卷曲/.test(q)){selectProblem('curl');pick(leafChoices[2]);return;}const ns=scope().filter(n=>[n.name,...(n.aliases||[])].some(s=>terms.some(t=>s.includes(t))));state.section='search';render();browse.replaceChildren(el('h2',`“${q}”的相关知识`));for(const n of ns.slice(0,40))browse.append(button(pretty(n)+' →',()=>{state.candidate=n;state.section='symptoms';state.symptom=null;state.tab='related';render();},'farmer-search-result'));if(!ns.length)browse.append(el('p','没有找到相关资料，请换一个词，例如“修剪”“储藏”。'));};
 const oldFiltered=dashboardFiltered;dashboardFiltered=function(){oldFiltered();if(state.candidate&&!scope().some(n=>n.id===state.candidate.id))state.candidate=null;render();};
 let initialized=false;const init=()=>{if(initialized||!data.nodes.length)return;initialized=true;const p=new URLSearchParams(location.search),incoming=p.get('problem')||p.get('symptom');const mapping={leaf_spot:'leaf',leaf_curl:'curl',pest:'pest',healthy:'leaf',fruit:'fruit',storage:'storage'};if(incoming&&mapping[incoming]){state.problem=mapping[incoming];if(incoming==='leaf_spot')pick(leafChoices[0]);else if(incoming==='leaf_curl')pick(leafChoices[2]);else if(incoming==='healthy')pick(leafChoices[3]);}else{state.candidate=byName('梨黑星病')||null;}render();};
 const filteredInit=dashboardFiltered;dashboardFiltered=function(){filteredInit();init();};render();init();
})();
