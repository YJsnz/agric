from graphrag.ranking import rank_evidence

def test_baseline_preserves_evidence_without_neural_scores(monkeypatch):
    monkeypatch.setenv('MULTICROP_RANKING_MODE','baseline')
    candidate={'candidate_id':'doc1','kind':'document_chunk','chunk':{'title':'鸭梨虫害资料','section':'叶片','text':'叶片虫害损伤记录','rank':1,'evidence_level':'A'}}
    result=rank_evidence('鸭梨虫害损伤',[candidate])
    assert result['model']=='graph-vector-lexical-baseline'
    assert result['results'][0]['chunk']==candidate['chunk']
    assert 'reranker_score' not in result['results'][0]
    assert result['results'][0]['lexical_score']>0

def test_missing_model_uses_declared_baseline(monkeypatch):
    monkeypatch.setenv('MULTICROP_RANKING_MODE','neural')
    def missing():
        raise FileNotFoundError('missing')
    monkeypatch.setattr('graphrag.ranking.get_reranker',missing)
    assert rank_evidence('鸭梨',[])['model']=='graph-vector-lexical-baseline'
