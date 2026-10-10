"""Reviewed fresh-fruit handling checks, separate from leaf disease hypotheses."""
import json,hashlib
from .build import ROOT,CROP,save
KEYS=['fruit_bruise:bruised','fruit_bruise:healthy','fruit_freshness:fresh','fruit_freshness:rotten']
RULES=[
 ('surface','JF002','专家提醒，应该选择','坚挺饱满。','先检查果皮和果柄','鲜枣外观核验：查看果皮完整性、碰伤、黑斑、虫眼及果柄处是否软烂；不是食品安全检测。','这是鲜枣还是干枣？果皮或果柄处是否破损、黑斑或软烂？',None),
 ('sort','JF001','鲜枣贮藏过程中的主要侵染性病害','是防控病害的重要措施。','确认伤果后再分选','拟入库贮藏的鲜枣，人工确认有机械伤或病虫损伤时，按原文从入贮果中剔除；不能仅凭模型分数判废或判定能否食用。','是否准备入库贮藏？异常是单果还是同一批多果？','若人工确认是拟入库鲜枣中的机械伤果或病虫果，将其从入贮果中分选出来；不要仅按图片分数决定可食用性。'),
 ('handling','JF001','根据果实大小对鲜枣进行分级','减少机械损伤。','减少再次碰压','用于鲜枣分级搬运；已有碰伤不代表腐败已经发生。','采收、分级或运输时是否发生跌落、碰撞或挤压？','分级搬运鲜枣时轻拿轻放，减少新增机械损伤。'),
 ('stack','JF001','码垛时应考虑纸箱承重','或塌垛。','检查箱体承重和堆码','用于箱装鲜枣堆码；照片无法提供箱体承重和受压情况。','是否箱装堆码？下层箱体有无变形或受压？','箱装鲜枣堆码时核对纸箱承重，防止下层果实被压伤或塌垛。'),
 ('softening','JF001','枣果实贮藏过程中极易发酵软化','减少机械损伤。','区分软化褐变与损伤','资料列出发酵软化、褐变及微生物侵染等采后问题；不能由 rotten 标签识别具体病原或判定食用安全。','是否发生软化、果肉褐变？采后经过多久，储藏温度和包装方式是什么？',None),
 ('maturity','JF002','鲜枣在成熟的过程中','却在下降，','核对成熟变化','鲜枣成熟时颜色和软度也会变化；不能将变红或单一颜色变化直接等同腐败。','颜色变化是逐渐均匀变红，还是局部异常斑块并伴随软化？',None),
 ('precool','JF001','当天采收的鲜枣','当天预冷或入库。','核对采后时间与冷链','适用于计划贮藏的鲜枣，不适用于任意干枣或家庭环境；本轮不输出温度阈值与储藏期限。','当天采收后是否已预冷或入库？','若为计划贮藏的当天采收鲜枣，按鲜枣保鲜规程安排当天预冷或入库，并核实品种与设施条件。')]
def main():
 gp=ROOT/'knowledge_graph/graph-v1.json';cp=ROOT/'graphrag_corpus_v1/reviewed_chunks.json'
 g=json.loads(gp.read_text(encoding='utf-8'));cs=json.loads(cp.read_text(encoding='utf-8'))
 sources=json.loads((ROOT/'evidence/fruit_sources.json').read_text(encoding='utf-8'))
 # Local logistics news is retained for context only, not imported as agronomic proof.
 used=[s for s in sources if s['id'] in ('JF001','JF002')]
 maps=json.loads((ROOT/'knowledge_graph/jujube_visual_entity_mapping.json').read_text(encoding='utf-8'))
 rules=[]
 for key,sid,start,end,name,scope,question,action in RULES:
  src=next(s for s in used if s['id']==sid);raw=(ROOT/src['local_path']).read_text(encoding='utf-8')
  # HTML inline elements split words across lines. Match whitespace-insensitively,
  # but retain the exact original excerpt and original character offsets.
  positions=[i for i,c in enumerate(raw) if not c.isspace()]
  compact=''.join(raw[i] for i in positions)
  a0=compact.index(''.join(start.split()));end0=''.join(end.split())
  b0=compact.index(end0,a0)+len(end0)
  a=positions[a0];b=positions[b0-1]+1;quote=raw[a:b];cid='JFC_'+key
  loc=dict(file=src['local_path'],page=None,section=start,char_start=a,char_end=b)
  m=dict(crop=CROP,region=src['region'],growth_stage='采后',stage_unknown=False,scope='postharvest',organ='fruit',topic=name,
   source_id=sid,locator=loc,evidence_level='general_authoritative',evidence_level_compat='L3',standard_status='technical_guidance_not_mandatory_standard',
   review_status='verbatim_verified',source_sha256=src['sha256'],purpose='conditional_postharvest_checks',
   postharvest_review='fresh_fruit_handling_only',applicability=scope,source_crop='鲜枣',visual_keys=KEYS)
  cs=[c for c in cs if c['chunk_id']!=cid]+[dict(chunk_id=cid,title=src['title'],text=quote,metadata=m)]
  nid=CROP+':'+hashlib.sha256(('PostharvestCheck:'+name).encode()).hexdigest()[:16]
  if not any(n['id']==nid for n in g['nodes']):g['nodes'].append(dict(id=nid,name=name,type='PostharvestCheck',crop_id=CROP,crop=['鲜枣']))
  for vk in KEYS:
   visual=next(v for v in maps if v['visual_key']==vk);eid='JFE_'+key+'_'+vk.replace(':','_')
   e=dict(id=eid,source=visual['node_id'],target=nid,subject=visual['name'],object=name,relation='PROMPTS_POSTHARVEST_CHECK',kind='reviewed_handling_check_not_causal_diagnosis',
    source_id=sid,source_ids=[sid],title=src['title'],region=src['region'],crop=['鲜枣'],crop_id=CROP,growth_stage='采后',
    evidence_text=quote,original_text=quote,page=None,section=start,evidence_level='general_authoritative',evidence_level_compat='L3',
    review_status='verbatim_verified',chunk_id=cid,locator=loc,conditions=[scope],evidence_ids=[sid,cid],
    evidence=[dict(id=cid,source_id=sid,quote=quote,locator=loc)],source_type=src['source_type'],year=src['year'],normalized_claim=visual['name']+' prompts checking '+name)
   g['edges']=[e0 for e0 in g['edges'] if e0['id']!=eid]+[e]
  rules.append(dict(id='fruit_'+key,chunk_id=cid,candidate=name,applicability=scope,question=question,visual_keys=KEYS,
                    action=action,relation_kind='conditional_handling_not_diagnosis'))
 g['sources']=[s for s in g['sources'] if s['id'] not in {s['id'] for s in used}]+used
 from .validate import validate
 validate(g,cs);save(gp,g);save(cp,cs);save(ROOT/'knowledge_graph/fruit_check_rules.json',rules)
 ontology=json.loads((ROOT/'knowledge_graph/ontology.json').read_text(encoding='utf-8'))
 ontology.update(node_types=sorted({n['type'] for n in g['nodes']}),relations=sorted({e['relation'] for e in g['edges']}));save(ROOT/'knowledge_graph/ontology.json',ontology)
 print(validate(g,cs))

def assessment(evidence,visual_key):
 p=ROOT/'knowledge_graph/fruit_check_rules.json'
 if not p.exists():return None
 rules=json.loads(p.read_text(encoding='utf-8'));directions=[]
 for r in rules:
  e=next((e for e in evidence if e.get('chunk_id')==r['chunk_id']),None)
  if e and visual_key in r['visual_keys']:directions.append({**r,'evidence_ids':[e['evidence_id']],'evidence_level':e['evidence_level'],'region':e['region'],'source_id':e['source_id'],'is_diagnosis':False})
 question_order=['surface','handling','softening'] if visual_key.startswith('fruit_bruise:') else ['surface','softening','maturity']
 return dict(available=bool(directions),kind='postharvest_checks',directions=directions,
  questions=[d['question'] for key in question_order for d in directions if d['id']=='fruit_'+key],
  actions=[dict(text=d['action'],evidence_ids=d['evidence_ids'],condition=d['applicability']) for d in directions if d['action']],
  local_verified=False,notice='鲜枣通用资料；不是沧州本地病因验证。先确认果实形态与现场条件。')
if __name__=='__main__':main()
