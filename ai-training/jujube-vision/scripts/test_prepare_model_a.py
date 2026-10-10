"""Preparation regression tests on temporary synthetic files only."""
import tempfile
import unittest
from pathlib import Path
from PIL import Image
from prepare_model_a import audit, Groups, split_groups, CLASSES, SOURCES


class PreparationTests(unittest.TestCase):
    def test_class_paths_augmentation_and_corruption(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for folder, expected, excluded in [('Healthy Leaf','healthy',''), ('Original/Powdery_Mildew','powdery_mildew',''), ('Augmented/Yellow Leaf','yellow_leaf','augmented'), ('Certificate','unknown','unknown_class')]:
                path = root/folder/'sample.png'; path.parent.mkdir(parents=True)
                Image.new('RGB', (30,20), 'green').save(path)
                row = audit(('test_source',root,path))
                self.assertEqual(row['mapped_class'],expected)
                self.assertEqual(row['exclude_reason'],excluded)
                self.assertEqual(len(row['phash']),16)
                self.assertEqual((row['width'],row['height']),(30,20))
            broken = root/'Healthy Leaf/broken.jpg'; broken.write_bytes(b'invalid')
            self.assertIn('corrupt',audit(('test_source',root,broken))['exclude_reason'])

    def test_transitive_groups(self):
        groups = Groups(4); groups.union(0,1); groups.union(1,3)
        self.assertEqual(groups.find(0),groups.find(3))
        self.assertNotEqual(groups.find(0),groups.find(2))

    def test_deterministic_group_stratification(self):
        rows, groups = [], {}
        for source in SOURCES:
            for cls in CLASSES:
                for j in range(12):
                    ids=[]
                    for _ in range(2):
                        ids.append(len(rows)); rows.append({'source_dataset':source,'mapped_class':cls})
                    groups[f'{source}:{cls}:{j}']=ids
        result=split_groups(groups,rows)
        self.assertEqual(result,split_groups(groups,rows))
        for split in range(3):
            members=[rows[i] for g,ids in groups.items() if result[g]==split for i in ids]
            self.assertEqual({r['mapped_class'] for r in members},set(CLASSES))
            self.assertEqual({r['source_dataset'] for r in members},set(SOURCES))


if __name__ == '__main__': unittest.main()
