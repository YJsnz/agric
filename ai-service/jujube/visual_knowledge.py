"""Evidence-backed differential lookup, never a disease diagnosis."""
import hashlib,json
from .build import ROOT,CROP,save
from .compat import level

# Each entry is a search/differentiation rule, not a causal claim about an uploaded image.
RULES=[
 ('powder','JV004','Powdery mildew can be identified','and shoots,','白粉状物核验方向','美国大学观赏植物资料，仅迁移白粉状外观的观察线索；不是金丝小枣白粉病或病原鉴定依据。','叶片表面和嫩梢是否确有白色粉状覆盖？',['powdery_mildew']),
 ('iron','JV001','果树黄叶病，是由于','引起落叶。','果树缺铁性黄叶方向','新梢嫩叶先黄、叶脉仍绿时再核验；资料针对一般果树，不是金丝小枣确诊依据。','黄叶是否先从新梢嫩叶出现，叶脉是否仍绿？',['yellow_leaf']),
 ('mosaic','JV001','（一）表现症状不同：','早期落叶。','花叶/斑驳方向','原文描述黄绿相间斑驳；单纯黄化不能确定病毒病。','叶片是均匀黄化，还是黄绿相间斑驳？',['yellow_leaf']),
 ('broom','JV002','其次是枝叶丛生。','冬季自然枯死而不脱落；','枣疯病伴随症状排查','仅在黄化同时伴随丛枝、叶片卷曲等表现时值得现场排查，不从一张黄叶图推断枣疯病。','是否同时出现异常细小丛枝、叶片匙状卷曲？',['yellow_leaf']),
 ('rust','JV003','（一）枣锈病：','干枯脱落。','枣锈病叶背表现排查','原文描述叶背小点随后凸起；这是鉴别线索，不是图像已检测到的特征。','叶背是否有由淡绿色小点变成暗黄褐色的凸起？',['yellow_leaf','anthracnose']),
 ('anthracnose','JV003','（三）枣炭疽病：','病果味苦。','炭疽病相关方向','资料确认可侵染叶片，但具体病斑描述属于果实；不能把果实症状转写成叶片鉴别特征。','是否也有果实异常？叶片症状仍需单独现场核验。',['anthracnose']),
 ('looper','JV003','幼虫为害嫩芽，','危害，','枣尺蠖等食叶虫方向','外地枣树资料的食叶害虫方向；不能由损伤分类确定虫种。','嫩芽、叶片或花蕾上是否能找到幼虫？',['insect_damage']),
 ('roller','JV003','以幼虫为害叶片、花、果实，','为害。','枣粘虫卷叶方向','原文描述幼虫缀叶卷苞，需看到伴随表现才能进一步排查。','是否存在缀叶卷苞，或果柄附近蛀入痕迹？',['insect_damage'])]

def main():
 gp=ROOT/'knowledge_graph/graph-v1.json';cp=ROOT/'graphrag_corpus_v1/reviewed_chunks.json'
 g=json.loads(gp.read_text(encoding='utf-8'));chunks=json.loads(cp.read_text(encoding='utf-8'))
 sources=json.loads((ROOT/'evidence/visual_sources.json').read_text(encoding='utf-8'))
 mapping=json.loads((ROOT/'knowledge_graph/jujube_visual_entity_mapping.json').read_text(encoding='utf-8'))
 def node(name,typ):
  nid=CROP+':'+hashlib.sha256((typ+':'+name).encode()).hexdigest()[:16]
  if not any(n['id']==nid for n in g['nodes']):g['nodes'].append(dict(id=nid,name=name,type=typ,crop_id=CROP,crop=['枣/果树排查方向']))
  return nid
 rules=[]
 for key,sid,start,end,name,scope,question,labels in RULES:
  src=next(s for s in sources if s['id']==sid);raw=(ROOT/src['local_path']).read_text(encoding='utf-8')
  a=raw.index(start);b=raw.index(end,a)+len(end);quote=raw[a:b];cid='JVC_'+key
  loc=dict(file=src['local_path'],section=start,page=None,char_start=a,char_end=b)
  m=dict(crop=CROP,region=src['region'],growth_stage=None,stage_unknown=True,scope='production',organ='leaf',topic=name,
   source_id=sid,locator=loc,evidence_level='transfer_pending',evidence_level_compat='L4',standard_status='not_a_standard',
   review_status='verbatim_verified',source_sha256=src['sha256'],purpose='candidate_assessment_only',
   transfer_review='symptom_comparison_only',applicability=scope,source_crop='观赏植物' if sid=='JV004' else '一般果树' if sid=='JV001' else '枣树',visual_labels=labels)
  c=dict(chunk_id=cid,title=src['title'],text=quote,metadata=m)
  chunks=[x for x in chunks if x['chunk_id']!=cid]+[c]
  candidate=node(name,'DifferentialCandidate')
  for label in labels:
   visual=next(x for x in mapping if x['visual_key']=='leaf:'+label)
   eid='JVE_'+key+'_'+label
   e=dict(id=eid,source=visual['node_id'],target=candidate,subject=visual['name'],object=name,relation='PROMPTS_DIFFERENTIAL_CHECK',
    kind='reviewed_differential_rule_not_diagnosis',source_id=sid,source_ids=[sid],title=src['title'],region=src['region'],crop=['枣/果树排查方向'],crop_id=CROP,
    growth_stage=None,evidence_text=quote,page=None,section=start,evidence_level='transfer_pending',evidence_level_compat='L4',review_status='verbatim_verified',
    chunk_id=cid,locator=loc,conditions=[scope],evidence_ids=[sid,cid],evidence=[dict(id=cid,source_id=sid,quote=quote,locator=loc)],
    source_type=src['source_type'],year=src['year'],original_text=quote,normalized_claim=visual['name']+' prompts checking '+name)
   g['edges']=[x for x in g['edges'] if x['id']!=eid]+[e]
  rules.append(dict(id=key,chunk_id=cid,candidate=name,applicability=scope,question=question,visual_labels=labels,relation_kind='differential_not_diagnostic'))
 g['sources']=[s for s in g['sources'] if s['id'] not in {x['id'] for x in sources}]+sources
 from .validate import validate
 validate(g,chunks)
 save(gp,g);save(cp,chunks);save(ROOT/'knowledge_graph/visual_differential_rules.json',rules)
 ontology=json.loads((ROOT/'knowledge_graph/ontology.json').read_text(encoding='utf-8'))
 ontology.update(node_types=sorted({n['type'] for n in g['nodes']}),relations=sorted({e['relation'] for e in g['edges']}));save(ROOT/'knowledge_graph/ontology.json',ontology)
 print(validate(g,chunks))

def differential(evidence,label):
 p=ROOT/'knowledge_graph/visual_differential_rules.json'
 if not p.exists():return []
 rules=json.loads(p.read_text(encoding='utf-8'));out=[]
 for rule in rules:
  hit=next((e for e in evidence if e.get('chunk_id')==rule['chunk_id']),None)
  if label in rule['visual_labels'] and hit:
   out.append({**rule,'evidence_ids':[hit['evidence_id']],'evidence_level':hit['evidence_level'],'region':hit['region'],
    'evidence_text':hit['original_text'],'source_id':hit['source_id'],'is_diagnosis':False})
 return out
if __name__=='__main__':main()
