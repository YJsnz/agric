import unittest,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
sys.path.insert(0,str(ROOT))
from wheat_diagnosis import config
from graphrag.entity_extractor import settings
from unittest.mock import patch

class IntegrationTests(unittest.TestCase):
    def test_submitted_wheat_detector_resolves_to_existing_asset(self):
        self.assertTrue(config.MODEL_C_PATH.is_file())
        self.assertIn('v13',str(config.MODEL_C_PATH))
    def test_local_model_configuration_does_not_reuse_cloud_secret(self):
        with patch.dict('os.environ',{'MULTICROP_LLM_BASE_URL':'http://127.0.0.1:8083/v1',
                                    'MULTICROP_LLM_MODEL':'qwen3-4b-edge','DEEPSEEK_API_KEY':'cloud-secret'}):
            result=settings()
            self.assertEqual(result['DEEPSEEK_BASE_URL'],'http://127.0.0.1:8083/v1')
            self.assertEqual(result['DEEPSEEK_MODEL'],'qwen3-4b-edge')
            self.assertNotEqual(result['DEEPSEEK_API_KEY'],'cloud-secret')
if __name__=='__main__':unittest.main()
