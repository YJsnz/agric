"""Independent manifest/folder verification; never writes dataset files."""
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(name):
    with (ROOT/'reports'/name).open(encoding='utf-8-sig', newline='') as stream:
        return list(csv.DictReader(stream))


def main():
    raw = read('model_a_raw_manifest.csv')
    clean = read('model_a_clean_manifest.csv')
    by_id = {r['image_id']: r for r in clean}
    assert len(by_id) == len(clean)
    assert {r['image_id'] for r in raw if r['usable']=='True'} == set(by_id)
    for row in clean:
        assert row['usable']=='True' and not row['exclude_reason']
        path=ROOT/row['target_path']
        assert path.is_file()
        assert path.parent.name == row['mapped_class']
        assert path.parent.parent.name == row['split']
        assert path.stat().st_size == Path(row['original_path']).stat().st_size
    for field in ('sha256','pixel_sha256','leakage_group'):
        memberships=defaultdict(set)
        for row in clean: memberships[row[field]].add(row['split'])
        assert all(len(splits)==1 for splits in memberships.values()),field
    pairs=read('model_a_near_duplicate_candidates.csv')
    cross_pairs=0
    for pair in pairs:
        if pair['image_a'] in by_id and pair['image_b'] in by_id:
            cross_pairs += by_id[pair['image_a']]['split'] != by_id[pair['image_b']]['split']
    assert cross_pairs==0
    expected={str((ROOT/r['target_path']).resolve()) for r in clean}
    actual={str(p.resolve()) for p in (ROOT/'data/jujube_leaf_classifier').rglob('*') if p.is_file()}
    assert expected==actual
    summary=json.loads((ROOT/'reports/model_a_audit_summary.json').read_text(encoding='utf-8'))
    assert summary['clean_total']==len(clean)
    assert summary['classes']==dict(Counter(r['mapped_class'] for r in clean))
    print(json.dumps({'verified':True,'raw_rows':len(raw),'clean_rows':len(clean),'cross_split_candidate_pairs':cross_pairs,
                      'five_classes_all_splits':all(len({r['mapped_class'] for r in clean if r['split']==s})==5 for s in ['train','val','test']),
                      'two_sources_all_splits':all(len({r['source_dataset'] for r in clean if r['split']==s})==2 for s in ['train','val','test'])},indent=2))


if __name__=='__main__': main()
