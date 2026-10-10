import unittest
from build_clean_dataset import BASE,read_csv,clean_rows,assign_groups

class CleanTests(unittest.TestCase):
    def test_actual_empty_reviews_block_build(self):
        v=read_csv(BASE/'reports/model_a_verified_manifest.csv')
        r=read_csv(BASE/'reports/mixed_group_98_review.csv')
        for x in r:x['review_decision']=''
        with self.assertRaisesRegex(ValueError,'Human review incomplete'):clean_rows(v,r)
    def test_group_split_reproducible(self):
        rows=[{'group_id':f'g{i}','mapped_label':c} for c in ['healthy','rust','leaf_spot_blight','nitrogen_deficiency'] for i in range(20)]
        a=assign_groups(rows);self.assertEqual(a,assign_groups(rows));self.assertEqual(set(a),{r['group_id'] for r in rows})
        self.assertEqual(set(a.values()),{'train','val','test'})
    def test_review_cannot_change_identity(self):
        v=read_csv(BASE/'reports/model_a_verified_manifest.csv');r=read_csv(BASE/'reports/mixed_group_98_review.csv')
        for x in r:x.update(review_decision='keep',review_note='synthetic test only')
        r[0]['sha256']='wrong'
        with self.assertRaisesRegex(ValueError,'identity'):clean_rows(v,r)
    def test_keep_does_not_break_group(self):
        v=read_csv(BASE/'reports/model_a_verified_manifest.csv');r=read_csv(BASE/'reports/mixed_group_98_review.csv')
        for x in r:x.update(review_decision='keep',review_note='synthetic test only')
        result=clean_rows(v,r);ids={x['original_path'] for x in r}
        self.assertEqual(len({x['group_id'] for x in result if x['original_path'] in ids}),1)
        # Test in memory only; no review CSV is written.

if __name__=='__main__':unittest.main()
