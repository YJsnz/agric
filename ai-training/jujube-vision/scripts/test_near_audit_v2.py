import unittest
import numpy as np
from audit_near_duplicates_v2 import ssim
from finalize_near_audit_v2 import ROOT, REPORTS, REVIEW, ALLOWED, read
import hashlib
import json
from collections import Counter


class SimilarityTests(unittest.TestCase):
    def test_ssim_identity_and_symmetry(self):
        rng=np.random.default_rng(42)
        a=rng.random((128,128),dtype=np.float32)
        b=rng.random((128,128),dtype=np.float32)
        self.assertAlmostEqual(ssim(a,a),1.0,places=5)
        self.assertAlmostEqual(ssim(a,b),ssim(b,a),places=5)
        self.assertLess(ssim(a,b),0.1)

    def test_constant_background_is_not_identity_evidence(self):
        a=np.ones((128,128),dtype=np.float32)*.8
        b=a.copy(); a[55:70,55:70]=.2; b[55:70,55:70]=.4
        self.assertGreater(ssim(a,b),.9)
        self.assertFalse(np.array_equal(a,b))


class AuditArtifactTests(unittest.TestCase):
    def test_status_totals_and_review_provenance(self):
        pairs = read(REPORTS/'model_a_near_duplicate_candidates_v2.csv')
        summary = json.loads((REPORTS/'model_a_near_duplicate_summary_v2.json').read_text())
        self.assertEqual(len(pairs), 14749)
        self.assertEqual(dict(Counter(r['review_status'] for r in pairs)), summary['statuses'])
        self.assertTrue(all(r['review_status'] in ALLOWED for r in pairs))
        reviewed = {(r['image_a'],r['image_b']) for r in read(REVIEW/'sample_review.csv')}
        for r in pairs:
            if r['review_status'] in {'confirmed_near_duplicate','background_similarity'}:
                self.assertIn((r['image_a'],r['image_b']), reviewed)
                self.assertTrue(r['reviewer'])

    def test_conflicts_quarantined_in_manifest_not_relabelled(self):
        old = {r['image_id']:r for r in read(REPORTS/'model_a_raw_manifest.csv')}
        clean = {r['image_id']:r for r in read(REPORTS/'model_a_clean_manifest.csv')}
        current = read(REPORTS/'model_a_manifest_v2.csv')
        new_conflicts = []
        for r in current:
            self.assertEqual(r['mapped_class'],old[r['image_id']]['mapped_class'])
            if r['audit_review_status']=='needs_expert_review':
                self.assertEqual(r['training_eligible_v2'],'False')
                if r['image_id'] in clean:
                    new_conflicts.append(r['image_id'])
            if r['image_id'] in clean:
                self.assertEqual(r['existing_split'],clean[r['image_id']]['split'])
        self.assertEqual(len(new_conflicts),4)

    def test_confirmed_groups_do_not_cross_split(self):
        groups = read(REPORTS/'model_a_duplicate_groups_v2.csv')
        self.assertTrue(groups)
        for g in groups:
            self.assertEqual(g['cross_split'],'False')
            self.assertLessEqual(len(set(filter(None,g['splits'].split(';')))),1)
        rows = read(REPORTS/'model_a_manifest_v2.csv')
        self.assertTrue(any(not r['duplicate_group_id'] for r in rows))

    def test_original_files_unchanged(self):
        before = json.loads((REVIEW/'before_state.json').read_text())
        for name,value in before.items():
            if name in ('raw_tree','training_tree'):
                folder=ROOT/('raw' if name=='raw_tree' else 'data/jujube_leaf_classifier')
                current=sorted([[str(p.relative_to(ROOT)),p.stat().st_size,p.stat().st_mtime_ns] for p in folder.rglob('*') if p.is_file()])
                self.assertEqual(current,sorted(value))
            else:
                self.assertEqual(hashlib.sha256((ROOT/name).read_bytes()).hexdigest(),value)


if __name__=='__main__':unittest.main()
