import unittest
from collections import defaultdict

from prepare_model_b_weak_dataset import weak_label, paired_split, leakage_check
from prepare_model_b_dataset import clean_rows


class WeakPreparationTests(unittest.TestCase):
    def row(self, day='2015-05-15', treatment='water_stress', plot='16r1', reason='missing_stress_start'):
        return dict(date=day, season=1, plot_id=plot, treatment=treatment,
                    exclude_reason=reason, error='', sha256=str(plot)+day)

    def test_both_treatments_excluded_on_pre_dates(self):
        for treatment,plot in [('control','1r1'),('water_stress','16r1')]:
            r=weak_label(self.row('2015-04-25',treatment,plot))
            self.assertEqual(r['exclude_reason'],'confirmed_pre_stress')
            self.assertEqual(r['usable'],'false')

    def test_candidate_labels_are_weak_not_confirmed(self):
        for treatment, label, plot in [('control','normal','1r1'),('water_stress','water_stress','16r1')]:
            r=weak_label(self.row(treatment=treatment,plot=plot))
            self.assertEqual(r['mapped_label'],label)
            self.assertEqual(r['label_strength'],'weak')
            self.assertEqual(r['label_source'],'treatment_assignment')
            self.assertEqual(r['stress_active'],'unknown')
            self.assertEqual(r['confirmed_stress'],'unknown')

    def test_corrupt_reason_is_not_cleared(self):
        self.assertEqual(weak_label(self.row(reason='corrupt'))['exclude_reason'],'corrupt')

    def test_missing_plot_unknown_phase_and_treatment_rejected(self):
        self.assertEqual(weak_label(self.row(plot=None))['exclude_reason'],'missing_plot_id')
        self.assertEqual(weak_label(self.row(day='2026-01-01'))['exclude_reason'],'unknown_phase')
        self.assertEqual(weak_label(self.row(treatment='unknown'))['exclude_reason'],'unknown_treatment')

    def test_duplicates_and_conflicts_rejected(self):
        a=weak_label(self.row(treatment='control',plot='1r1'))
        b=weak_label(self.row());b['sha256']=a['sha256']
        clean,audit=clean_rows([a,b])
        self.assertEqual(clean,[])
        self.assertEqual(audit['cross_label_exact_duplicate_groups'],1)

    def test_paired_split_is_deterministic_and_preserves_all_plot_dates(self):
        rows=[]
        for number in range(1,31):
            for replicate in [1,2,3]:
                for season,day in [(1,'2015-05-15'),(2,'2016-05-14')]:
                    r=weak_label(self.row(day,'control' if number<=15 else 'water_stress',f'{number}r{replicate}'))
                    r.update(season=season,exclude_reason='',usable='true')
                    rows.append(r)
        split=paired_split(rows)
        self.assertEqual(split,paired_split(rows))
        for unit in ['plot_id','pair_group']:
            assignments=defaultdict(set)
            for r in split:assignments[r[unit]].add(r['split'])
            self.assertTrue(all(len(v)==1 for v in assignments.values()))
        for s,plots in [('train',62),('val',14),('test',14)]:
            group=[r for r in split if r['split']==s]
            self.assertEqual(len({r['plot_id'] for r in group}),plots)
            self.assertEqual({r['mapped_label'] for r in group},{'normal','water_stress'})
            self.assertEqual({r['season'] for r in group},{1,2})

    def test_leakage_check_detects_pre_date_and_hash_leakage(self):
        a=weak_label(self.row());a.update(split='train',target_path='train/a.jpg')
        b=dict(a,split='test',target_path='test/b.jpg',date='2015-04-25')
        checks=leakage_check([a,b])
        self.assertEqual(checks['cross_split_plot'],1)
        self.assertEqual(checks['cross_split_sha256'],1)
        self.assertEqual(checks['confirmed_pre_stress_entered'],1)


if __name__=='__main__':
    unittest.main(verbosity=2)
