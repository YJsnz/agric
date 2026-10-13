# 沧州金丝小枣 KG V1
核心实体：Crop, Variety, Region, GrowthStage, Disease, Pest, Pathogen, Symptom, EnvironmentFactor, WeatherRisk, AgriculturalPractice, HarvestProcess, StorageCondition, PostharvestRisk, QualityIndicator, Source, KGStatement。
核心关系：LOCATED_IN, HAS_VARIETY, HAS_DISEASE, HAS_PEST, HAS_PATHOGEN, HAS_SYMPTOM, OCCURS_AT_STAGE, PROMOTES, INHIBITS, AFFECTS, ASSOCIATED_WITH, INCREASES_RISK, REDUCES_RISK, CONTROLLED_BY, INTERVENTION_FOR, REQUIRES, RECOMMENDS, HAS_PARAMETER, HAS_QUALITY_INDICATOR, APPLIES_TO, APPLIES_IN, DAMAGES, IS_VARIETY_OF。
主线：气象→生育阶段→裂果/浆烂/产量品质；病虫害→症状/受害部位→防控；水质/土壤→灌溉→风险；采收→干制/贮藏→采后风险。
禁止：无证据CAUSES；废止标准标current；外地通用资料标本地；题录自动扩写；生产/采后串线。
