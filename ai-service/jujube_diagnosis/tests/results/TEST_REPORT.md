# 第一阶段测试记录

运行命令：`.venv/Scripts/python.exe -m pytest jujube_diagnosis/tests -q`
结果：10 passed；Ultralytics 8.3.40；device=cpu。
三个真实冻结模型全部加载并通过接口TestClient执行真实样例推理，完整响应保存在leaf.json、fruit_bruise.json、fruit_freshness.json。
检查了health、非法task、非图片、缺少image、缺少task；模型不可用与推理异常使用故障注入验证503/500响应。
没有使用真实样例结果评价模型整体准确率；本次属于服务集成测试。
B1冻结副本缺失，已从原runs按字节恢复，SHA256与此前冻结值一致；A/B2权重未修改。
没有调用KG/GraphRAG，没有修改pear/wheat或前端，没有训练。
