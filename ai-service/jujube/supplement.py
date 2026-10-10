"""Idempotent small additions from locally available original passages."""
import json,hashlib
from .build import ROOT,CROP,save
from .compat import level

def main():
    gp=ROOT/'knowledge_graph/graph-v1.json';cp=ROOT/'graphrag_corpus_v1/reviewed_chunks.json'
    g=json.loads(gp.read_text(encoding='utf-8'));cs=json.loads(cp.read_text(encoding='utf-8'))
    def node(name,typ):
        nid=CROP+':'+hashlib.sha256((typ+':'+name).encode()).hexdigest()[:16]
        if not any(n['id']==nid for n in g['nodes']):g['nodes'].append({'id':nid,'name':name,'type':typ,'crop_id':CROP,'crop':['沧州金丝小枣']})
        return nid
    raw=(ROOT/'evidence/raw/J008.txt').read_text(encoding='utf-8')
    start=raw.index('表明，室内离体条件下');end=raw.index('菌1接种发病率最高',start)
    cid='JJC_AUDIT_001'
    if not any(c['chunk_id']==cid for c in cs):
        template=next(c for c in cs if c['metadata']['source_id']=='J008')
        meta={**template['metadata'],'scope':'cross_stage','topic':'机械损伤相关刺伤接种离体试验',
              'locator':{'page':None,'section':'2.3 分离物对枣果致病性的测定','file':'evidence/raw/J008.txt'},
              'applicability':'室内离体接种；不是实际碰伤或储藏场景验证','scope_origin':'production fruit sampled into detached-fruit experiment'}
        c={'chunk_id':cid,'title':template['title'],'text':raw[start:end].strip(),'metadata':meta};cs.append(c)
        subject='刺伤接种（室内离体试验）';obj='接种发病风险（离体果实）'
        template_edge=next(e for e in g['edges'] if e['source_id']=='J008')
        g['edges'].append({**template_edge,'id':'JJE_AUDIT_001','source':node(subject,'FruitCondition'),
                          'target':node(obj,'PostharvestRisk'),'subject':subject,'object':obj,
                          'relation':'INCREASES_RISK_OF','chunk_id':cid,'evidence_text':c['text'],
                          'section':meta['locator']['section'],'locator':meta['locator'],
                          'evidence_ids':['J008',cid],'evidence':[{'id':cid,'source_id':'J008','quote':c['text'],'locator':meta['locator']}],
                          'conditions':['仅室内离体接种试验，不代表自然碰伤或仓储腐败'],
                          'cross_stage':True,'cross_stage_kind':'production_to_detached_experiment_not_storage_validation'})
    for c in cs:
        c['metadata']['evidence_level_compat']=level(c['metadata'])
    for e in g['edges']:
        src=next(s for s in g['sources'] if s['id']==e['source_id'])
        e.update(source_type=src.get('source_type'),year=src.get('year'),original_text=e['evidence_text'],
                 normalized_claim=f"{e['subject']} {e['relation']} {e['object']}",evidence_level_compat=level(e))
    for s in g['sources']:
        levels={c['metadata']['evidence_level_compat'] for c in cs if c['metadata']['source_id']==s['id']}
        s['evidence_levels_compat']=sorted(levels)
    # Observation vocabulary is separate from disease facts. No speculative causal edges.
    labels={'leaf':{'healthy':'健康叶片视觉状态','anthracnose':'炭疽病类视觉表现','powdery_mildew':'白粉病类视觉表现','insect_damage':'虫害损伤视觉表现','yellow_leaf':'黄化视觉表现'},
            'fruit_bruise':{'healthy':'正常果实外观','bruised':'碰伤/机械损伤类视觉表现'},
            'fruit_freshness':{'fresh':'新鲜果实外观','rotten':'腐败/变质类视觉表现'}}
    mapping=[]
    for task,items in labels.items():
        for label,name in items.items():
            typ='VisualSymptom' if task=='leaf' else 'FruitCondition'
            mapping.append({'visual_key':task+':'+label,'node_id':node(name,typ),'node_type':typ,'name':name,
                            'is_diagnosis':False,'mapping_kind':'observation_vocabulary_not_agronomic_fact',
                            'scope':'production' if task=='leaf' else 'postharvest'})
    save(ROOT/'knowledge_graph/jujube_visual_entity_mapping.json',mapping)
    save(gp,g);save(cp,cs)
    ontology=json.loads((ROOT/'knowledge_graph/ontology.json').read_text(encoding='utf-8'))
    ontology.update(node_types=sorted({n['type'] for n in g['nodes']}),relations=sorted({e['relation'] for e in g['edges']}))
    save(ROOT/'knowledge_graph/ontology.json',ontology)
    print({'nodes':len(g['nodes']),'edges':len(g['edges']),'chunks':len(cs),'mappings':len(mapping)})
if __name__=='__main__':main()
