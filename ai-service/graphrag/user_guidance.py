"""Plain-language presentation; general triage is NOT grounded evidence."""
import re
from .symptom_scope import LEAF


def concise_answer(answer):
    parts = re.split(r'(?:^|\n)\s*[1-5][.．、]\s*(?:结论|依据|推理路径|建议|来源)\s*\n?', answer or '')
    text = '\n\n'.join([parts[1].strip(), '接下来可以做\n' + parts[4].strip()]) if len(parts) >= 6 else (answer or '')
    text = re.sub(r'\[E\d+\]', '', text)
    text = re.sub(r'[ \t]+([，。；！？])', r'\1', text)
    return text.strip()


def present(result, question, diagnosis_context=None):
    """Add a display layer without changing status, citations or audited facts."""
    context = diagnosis_context or {}
    vision = context.get('vision') or {}
    vision = vision.get('vision', vision)
    symptom = vision.get('symptom')
    leaf = context.get('context', {}).get('organ') == 'leaf' or bool(LEAF.search(question))
    guidance = None
    if leaf and result.get('status') in ('insufficient_evidence', 'needs_clarification', 'validation_failed'):
        if symptom == 'healthy':
            summary = '本次图片未识别出明显异常症状，但不能据此排除早期问题。'
        elif symptom == 'curl' or '卷叶' in question:
            summary = '先按卷叶现象排查，检查卷叶内是否有虫体，并回顾近期浇水、喷药和施肥变化。仅凭卷叶外观不能确定原因。'
        elif symptom == 'slug':
            summary = '图片提供了虫害损伤线索。先查看叶缘缺口、叶背虫体及新鲜取食痕迹，不能仅凭分类标签确定害虫种类。'
        else:
            summary = '可以先从叶部病害、虫害损伤和近期喷药或肥害三个方向排查。叶片斑点只是症状，尚不能确定是哪一种病，也不能确定一定由病害引起。'
        steps = ['拍一张整株照片，以及同一片叶子的正面、背面近照。',
                 '观察斑点是否扩大，有没有霉层、轮纹、虫体或叶缘缺口。',
                 '记录开始出现的时间、受影响植株数量，以及近期降雨、浇水、喷药和施肥情况。',
                 '暂不只凭这次结果选药；若持续扩展或多株出现，请带照片或样本请当地农技人员复核。']
        guidance = {'available': True, 'basis': 'general_triage_not_retrieved_evidence',
                    'notice': '通用初步排查，不是确诊，也不是已获本地证据支持的结论。',
                    'summary': summary, 'next_steps': steps, 'citations': [], 'grounded': False}
    answer = concise_answer(result.get('answer', ''))
    if guidance:
        assessment = result.get('preliminary_assessment') or {}
        supported = concise_answer(assessment.get('summary', '')) if assessment.get('available') else ''
        audit = result.get('grounding') or result.get('grounding_audit') or {}
        if not supported and result.get('sources') and audit.get('passed'):
            supported = concise_answer(result.get('answer', ''))
        if supported:
            answer = supported + '\n\n这是初步分析，具体原因还需结合叶片表现和现场情况判断。'
        else:
            answer = '先这样排查\n' + guidance['summary'] + '\n\n现在先做\n' + '\n'.join('• ' + s for s in guidance['next_steps']) + '\n\n' + guidance['notice']
        questions = result.get('clarification_questions') or []
        if questions: answer += '\n\n还需补充\n' + '\n'.join(questions)
    return {**result, 'user_answer': answer, 'general_guidance': guidance}
