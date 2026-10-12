"""Exact-name alignment against existing tomato nodes; never creates nodes."""
LEAF = {
    'bacterial_spot': [('细菌性斑点病', ('番茄细菌性斑点病',))],
    'bacterial_spot_and_leaf_miner': [('细菌性斑点病', ('番茄细菌性斑点病',)), ('潜叶虫', ('潜叶虫', '斑潜蝇'))],
    'healthy': [('健康叶片外观', ('健康叶片',))],
    'leaf_miner': [('潜叶虫', ('潜叶虫', '斑潜蝇'))],
    'powdery_mildew': [('白粉病类视觉表现', ('番茄白粉病',))],
    'powdery_mildew_and_leaf_miner': [('白粉病类视觉表现', ('番茄白粉病',)), ('潜叶虫', ('潜叶虫', '斑潜蝇'))],
    'whitefly': [('粉虱类视觉表现', ('粉虱',))],
}
STAGES = {'green': '绿熟阶段', 'breakers': '破色阶段', 'turning': '转色阶段',
          'pink': '粉红阶段', 'light_red': '浅红阶段', 'red': '红熟阶段'}

def align(visual, graph):
    targets = LEAF[visual['class']] if visual['task'] == 'leaf' else [(STAGES[visual['class']], (STAGES[visual['class']],))]
    matched, unmapped = [], []
    for label, names in targets:
        nodes = [n for n in graph['nodes'] if '番茄' in n.get('crop', []) and n['name'] in names]
        if nodes:
            matched.extend({**n, 'visual_component': label, 'alignment_only': True, 'is_diagnosis': False} for n in nodes)
        else:
            unmapped.append({'visual_component': label, 'class': visual['class'], 'reason': 'no_corresponding_tomato_node'})
    return {'matched_entities': matched, 'unmapped_entities': unmapped}
