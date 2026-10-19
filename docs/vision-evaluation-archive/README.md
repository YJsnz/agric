# 多作物视觉评估归档

2026-10-19；目标分支 `archive/vision-evaluations-20261019`，从 fetch 后的 `origin/main` 建立于独立 worktree，原工作区保留。

## 材料来源

既有评估材料位于本机 `AIC-SmartAgriculture_PART/agric/ai-training/`。按原样复制小型报告、指标、预测 CSV 和混淆矩阵，不修改其内容；复制文件哈希与来源见 CANDIDATE_FILES.csv。已有冻结权重和成熟度模型卡在 main 中，直接复用，不重复提交权重。

用户另授权重新评估番茄叶片冻结 V1，结果单独存于 `tomato-leaf/reevaluation-20261019/`。没有训练、数据集修改或 Test 调参。新运行不能补造缺失的历史评估记录。

- [模型总索引、缺失项及限制](VISION_EVALUATION_INDEX.md)
- [最终提交清单（不含清单自身）](SUBMISSION_FILES.csv)：字节大小、SHA256、Git 跟踪状态、重复内容和敏感模式检查。
- [原始候选来源清单](CANDIDATE_FILES.csv)
- [冻结文件实测 SHA256](MODEL_HASH_CHECK.json)
- [新评测脚本](evaluate_leaf_archive.py)

原报告与脚本中的绝对路径原样保留供溯源；移机运行需自行指定存在的本地模型、Test 及新输出目录。原报告的“官方”“独立”等措辞须结合总索引中的证据限制阅读。

没有新增模型权重、原始图片、训练数据、缓存、环境或业务代码。候选敏感模式检查不输出疑似密钥正文；提交前逐项复核。这里提供评测证据，不声明现场部署验收完成。
