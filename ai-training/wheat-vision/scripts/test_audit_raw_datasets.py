import io,unittest,json
from pathlib import Path
from PIL import Image,ImageEnhance
from audit_raw_datasets import BKTree,inspect_image,norm,pair,phash,resolve_label
from verify_dataset_sources import source_variant,Groups

class AuditTests(unittest.TestCase):
    def test_scoped_mapping_does_not_leak(self):
        cfg=json.loads((Path(__file__).resolve().parents[1]/'configs/label_mapping.json').read_text(encoding='utf-8'))
        self.assertEqual(resolve_label(cfg,'nitrogen_rust/Ndeficient.zip::Ndeficient/train/deficiency/a.jpg','nitrogen_rust','deficiency'),'nitrogen_deficiency')
        self.assertEqual(resolve_label(cfg,'nitrogen_rust/WheatLeafRust.zip::WheatLeafRust/test/diseased/a.jpg','nitrogen_rust','diseased'),'rust')
        self.assertEqual(resolve_label(cfg,'other/WheatLeafRust.zip::WheatLeafRust/test/diseased/a.jpg','other','diseased'),'unmapped')
        self.assertEqual(resolve_label(cfg,'nitrogen_rust/Ndeficient.zip::WrongRoot/train/control/a.jpg','nitrogen_rust','control'),'unmapped')
        self.assertEqual(resolve_label(cfg,'other/train/control/a.jpg','other','control'),'unmapped')
    def test_original_variant_is_exact_segment(self):
        row={'source_dataset':'wheat_disease_original','image_path':'Original Dataset.zip::Wheat Disease/Split Dataset/Train/HealthyLeaf/a.jpg'}
        self.assertEqual(source_variant(row),'augmented_or_split')
        row['image_path']='archive.zip::Wheat Disease/Original Dataset/HealthyLeaf/a.jpg'
        self.assertEqual(source_variant(row),'original')
        row={'source_dataset':'nitrogen_rust','image_path':'Ndeficient.zip::Ndeficient/train/control/a.jpg'}
        self.assertEqual(source_variant(row),'original_source_partition')
    def test_near_groups_are_transitive(self):
        groups=Groups(4);groups.union(0,1);groups.union(1,2)
        self.assertEqual(groups.find(0),groups.find(2))
        self.assertNotEqual(groups.find(0),groups.find(3))
    def image(self):
        image=Image.new('RGB',(80,64),'green')
        for x in range(20,45):
            for y in range(13,39):image.putpixel((x,y),(130,95,45))
        return image
    def test_decode_and_mapping(self):
        buf=io.BytesIO();self.image().save(buf,format='PNG')
        r=inspect_image(buf.getvalue(),'a.zip::Original/HealthyLeaf/x.png','a',{norm('Healthy Leaf'):'healthy'})
        self.assertEqual((r['mapped_label'],r['image_status'],r['width']),('healthy','valid',80))
    def test_corrupt_and_unknown(self):
        r=inspect_image(b'not an image','a/train/control/a.jpg','a',{})
        self.assertEqual((r['image_status'],r['mapped_label'],r['split']),('corrupt','unmapped','train'))
    def test_phash_resize(self):
        im=self.image()
        self.assertLessEqual((phash(im)^phash(im.resize((160,128)))).bit_count(),6)
    def test_bktree_matches_exhaustive(self):
        keys=[0,1,3,15,255,123456789,76543210]
        tree=BKTree()
        for k in keys:tree.add(k)
        for q in keys:
            self.assertEqual(set(tree.find(q,6)),{(k,(k^q).bit_count()) for k in keys if (k^q).bit_count()<=6})
    def test_conflict_and_leakage(self):
        a={'image_path':'a','source_dataset':'one','original_label':'Healthy','mapped_label':'healthy','split':'train'}
        b={**a,'image_path':'b','source_dataset':'two','original_label':'Leaf Rust','mapped_label':'rust','split':'test'}
        p=pair(a,b,'exact',0)
        self.assertTrue(p['label_conflict'] and p['cross_split'] and p['cross_dataset'])
        b.update(mapped_label='exclude',original_label='WheatBlast')
        self.assertTrue(pair(a,b,'near',2)['label_conflict'])

if __name__=='__main__':unittest.main()
