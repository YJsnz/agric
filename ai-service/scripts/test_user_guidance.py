import unittest
from graphrag.user_guidance import present, concise_answer


class GuidanceTests(unittest.TestCase):
    def test_no_evidence_still_provides_separate_triage(self):
        original={'status':'insufficient_evidence','answer':'证据不足','sources':[], 'grounding':None}
        result=present(original,'梨叶片出现黑色斑点')
        self.assertIn('现在先做',result['user_answer'])
        self.assertFalse(result['general_guidance']['grounded'])
        self.assertEqual(result['general_guidance']['citations'],[])
        for key in original:self.assertEqual(original[key],result[key])

    def test_vision_healthy_not_disease_claim(self):
        r=present({'status':'insufficient_evidence'},'识别结果',{'vision':{'symptom':'healthy'},'context':{'organ':'leaf'}})
        self.assertIn('未识别出明显异常',r['user_answer'])
        self.assertNotIn('叶部病害',r['user_answer'])

    def test_verified_assessment_preserved(self):
        r=present({'status':'insufficient_evidence','preliminary_assessment':{'available':True,'summary':'有引用支持的候选 [E1]'}},'叶片黑斑')
        self.assertIn('有引用支持的候选',r['user_answer'])
        self.assertEqual(r['preliminary_assessment']['summary'],'有引用支持的候选 [E1]')

    def test_audit_sections_not_in_default_answer(self):
        text='1. 结论\n可能相关 [E1]\n2. 依据\n论文\n3. 推理路径\n范围\n4. 建议\n补照片\n5. 来源\nhttps://example.com'
        self.assertEqual(concise_answer(text),'可能相关 \n\n接下来可以做\n补照片')

if __name__=='__main__':unittest.main()
