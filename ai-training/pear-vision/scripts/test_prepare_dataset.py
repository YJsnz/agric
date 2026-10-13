import argparse
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image
from prepare_dataset import CLASSES, check_yolo, prepare


class PreparationTests(unittest.TestCase):
    def test_splits_duplicates_annotations_and_reproducibility(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            source, labels = root/'leaves', root/'labels'
            labels.mkdir()
            for category, name in enumerate(CLASSES):
                (source/name).mkdir(parents=True)
                for i in range(10):
                    Image.new('RGB', (12, 12), (category*50, i*20, 10)).save(source/name/f'{name}{i}.png')
                    (labels/f'{name}{i}.txt').write_text('0 0.5 0.5 0.4 0.4\n')
            original = source/'curl/curl0.png'
            (source/'curl/duplicate.png').write_bytes(original.read_bytes())
            (source/'spot/conflict.png').write_bytes(original.read_bytes())
            (source/'healthy/broken.jpg').write_bytes(b'not an image')
            (labels/'slug1.txt').write_text('0 NaN 0.5 0.4 0.4')
            (labels/'orphan.txt').write_text('0 0.5 0.5 0.2 0.2')
            manifests = []
            for index in range(2):
                output = root/f'prepared{index}'
                args = argparse.Namespace(source=source, labels=labels, output=output,
                                          ratios=(.8,.1,.1), seed=42, yolo_nc=1,
                                          check_only=False, strict=False)
                with contextlib.redirect_stdout(io.StringIO()):
                    self.assertEqual(prepare(args), 0)
                report = json.loads((output/'report.json').read_text())
                rows = json.loads((output/'manifest.json').read_text())
                self.assertEqual(report['usable_images'], 39)
                for issue in ('conflicting_class_duplicate', 'corrupt_image', 'invalid_label', 'orphan_label'):
                    self.assertIn(issue, report['issue_counts'])
                self.assertEqual(len({r['hash'] for r in rows}), len(rows))
                self.assertTrue(all((output/r['destination']).exists() for r in rows))
                self.assertTrue(all(all(n > 0 for n in splits.values()) for splits in report['split_counts'].values()))
                manifests.append(rows)
                with self.assertRaises(ValueError):
                    prepare(args)  # no destructive overwrite
            self.assertEqual(manifests[0], manifests[1])

    def test_box_validation(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp)/'box.txt'
            for row in ['1 0.5 0.5 0.2 0.2', '0 0.9 0.5 0.5 0.2', '0 0.5 0.5 0 1', '0 inf 0.5 1 1', '0 1 2']:
                path.write_text(row)
                self.assertTrue(check_yolo(path, 1)[1])
            path.write_text('')
            self.assertEqual(check_yolo(path, 1), ([], []))


if __name__ == '__main__':
    unittest.main()
