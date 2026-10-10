# 后续实施路线
1. 资料审核：优先补 W001-W011、W015-W016 全文。
2. 固定 V1 本体，不直接复制泊头鸭梨本体。
3. 按原文抽取 Evidence Card：source_id/region/stage/subject/relation/object/evidence_text/page/section。
4. 构建 graph-v1.json；第一版 100–200 节点、150–300 条高质量关系即可。
5. 自动校验：来源、地区、阶段、数值单位、scope、引用。
6. 导入 Neo4j，建议 crop namespace=`huanghua_hanjianmai`。
7. GraphRAG 文档按“单主题+单阶段+单地区”切块，200–500中文字/块。
8. 建 Vector Index；metadata 至少保留 crop/region/stage/scope/evidence_level/source_id。
9. Query Policy 抽取 crop/region/stage/stress/salinity/moisture/weather/practice/quality_intent。
10. Evidence Fusion 优先级：黄骅 > 沧州 > 河北 > 本地同行评议 > 通用权威 > transfer。
11. 先做纯文本真实测试，不急着做视觉：播种墒情、晚播春促、灌浆干旱、宽幅沟播、原粮质量。
12. 跑通后再封 `/api/wheat/ask` 或 `/api/hanjianmai/diagnose`。
13. 最后接入 AI风险中心和方案推演。
