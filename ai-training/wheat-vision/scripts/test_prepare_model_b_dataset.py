"""Regression tests for metadata uncertainty, date matching and plot leakage."""
import unittest
from prepare_model_b_dataset import parse_directory, parse_plot, label_row, clean_rows, split_rows


class PreparationTests(unittest.TestCase):
    def row(self, label='normal', plot='1r1', day='2015-05-15', digest='abc', **extra):
        return dict(mapped_label=label, plot_id=plot, season=1, date=day,
                    sha256=digest, exclude_reason='', **extra)

    def test_directory_preserves_published_das(self):
        self.assertEqual(parse_directory('2ndS_197DAS_20160520'), (2, 197, '2016-05-20'))
        self.assertEqual(parse_directory('1stS_104DAS_20150305'), (1, 104, '2015-03-05'))
        with self.assertRaises(ValueError):
            parse_directory('2ndS_198DAS_20160230')

    def test_replicate_is_part_of_identity(self):
        self.assertEqual(parse_plot('16r2.JPG'), ('16r2', 'water_stress', 'Chamran'))
        self.assertEqual(parse_plot('1r3.jpg')[0], '1r3')
        self.assertIsNone(parse_plot('arbitrary.jpg')[0])

    def test_no_onset_inference_from_grain_filling(self):
        row = dict(plot_id='16r1', season=1, das=175, treatment='water_stress', growth_stage='Green (grain filling)')
        self.assertEqual(label_row(row, {}), ('unknown', 'unknown', 'missing_stress_start'))

    def test_pre_anthesis_excluded(self):
        row = dict(plot_id='16r1', season=1, das=155, treatment='water_stress', growth_stage='Green (booting)')
        self.assertEqual(label_row(row, {}), ('false', 'exclude_pre_stress', 'pre_stress'))

    def test_control_not_normal_without_time_matched_onset(self):
        row = dict(plot_id='1r1', season=1, das=175, treatment='control', growth_stage='Green (grain filling)')
        self.assertEqual(label_row(row, {}), ('false', 'unknown', 'missing_stress_start'))

    def test_sourced_onset_requires_agreement_between_date_and_das(self):
        row = dict(plot_id='16r1', season=1, das=175, date='2015-05-15',
                   treatment='water_stress', growth_stage='Green (grain filling)')
        metadata = {'stress_start': {'1': {'date': '2015-05-15', 'das': 175}}}
        self.assertEqual(label_row(row, metadata), ('true', 'water_stress', ''))
        metadata['stress_start']['1']['date'] = '2015-05-16'
        self.assertEqual(label_row(row, metadata), ('unknown', 'unknown', 'inconsistent_onset_date_das'))

    def test_exact_cross_label_conflicts_excluded(self):
        rows = [self.row(), self.row(label='water_stress', plot='16r1')]
        clean, audit = clean_rows(rows)
        self.assertFalse(clean)
        self.assertEqual(audit['cross_label_exact_duplicate_groups'], 1)
        self.assertTrue(all(r['exclude_reason'] == 'label_conflict' for r in rows))

    def test_same_date_matching_and_exact_deduplication(self):
        rows = [self.row(), self.row(plot='1r2'),
                self.row(label='water_stress', plot='16r1', digest='def'),
                self.row(day='2015-05-16', digest='ghi')]
        clean, audit = clean_rows(rows)
        self.assertEqual(len(clean), 2)
        self.assertEqual(audit['exact_duplicate_redundant'], 1)
        self.assertEqual(rows[-1]['exclude_reason'], 'unmatched_date')

    def test_split_keeps_replicate_across_seasons_and_covers_classes(self):
        rows = []
        for label, first in [('normal', 1), ('water_stress', 16)]:
            for number in range(first, first + 6):
                for season in [1, 2]:
                    r = self.row(label=label, plot=f'{number}r1', digest=f'{number}-{season}')
                    r['season'] = season
                    rows.append(r)
        split = split_rows(rows)
        self.assertEqual(split, split_rows(rows))
        for plot in {r['plot_id'] for r in split}:
            self.assertEqual(len({r['split'] for r in split if r['plot_id'] == plot}), 1)
        for s in ['train', 'val', 'test']:
            self.assertEqual({r['mapped_label'] for r in split if r['split'] == s}, {'normal', 'water_stress'})
            self.assertEqual({r['season'] for r in split if r['split'] == s}, {1, 2})


if __name__ == '__main__':
    unittest.main(verbosity=2)
