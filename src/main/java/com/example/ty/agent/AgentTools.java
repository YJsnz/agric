package com.example.ty.agent;

import com.example.ty.dashboard.DashboardService;
import com.example.ty.assistant.knowledge.KnowledgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import java.util.*;

@Component @RequiredArgsConstructor
public class AgentTools {
    private final DashboardService dashboard;
    private final com.example.ty.operations.OperationService operations;
    private final KnowledgeService knowledge;
    private final com.example.ty.vision.VisionService vision;
    private final com.example.ty.multicrop.MultiCropClient multicrop;
    public List<Map<String,Object>> schemas() {
        return List.of(schema("get_business_records","读取本基地已保存的农事、生长、批次流转、灌排和告警模拟回执；只读",Map.of()),schema("get_farm_context","查询共享演示农场的当前环境、地块、设备与告警；数据是演示数据",Map.of()),
            schema("query_crop_knowledge","读取指定作物的知识图谱与证据研判；番茄叶片症状和果实成熟度视觉识别可在作物工作台使用，本工具不执行图像推理",Map.of("crop",Map.of("type","string","enum",List.of("pear","wheat","jujube","vegetable")),"question",Map.of("type","string","description","最长500字的作物问题"))),
            schema("retrieve_evidence","按关键词检索已有农业资料，返回可引用的来源；当前不是 GraphRAG",Map.of("query",Map.of("type","string","description","与用户问题相关的检索语句"))),
            schema("analyze_environment","按已配置的土壤湿度阈值核验当前值，不计算病害概率",Map.of()),
            schema("get_vision_records","读取当前用户在所选基地的已保存梨叶视觉记录，置信度不是病害概率",Map.of("recordId",Map.of("type","string","description","可选视觉记录 ID；留空读取最近记录"))));
    }
    private Map<String,Object> schema(String name,String description,Map<String,Object> properties) {
        return Map.of("type","function","function",Map.of("name",name,"description",description,"parameters",
            Map.of("type","object","properties",properties,"required",name.equals("get_vision_records")?List.of():new ArrayList<>(properties.keySet()),"additionalProperties",false)));
    }
    public Object execute(String name,JsonNode args,String farmId) {
        return execute(name,args,farmId,null);
    }
    public Object execute(String name,JsonNode args,String farmId,Long ownerId) {
        if (!args.isObject()) throw new IllegalArgumentException("工具参数必须是对象");
        for(var k:args.propertyNames()) { if (!(name.equals("retrieve_evidence") && k.equals("query")) && !(name.equals("get_vision_records")&&k.equals("recordId")) && !(name.equals("query_crop_knowledge")&&Set.of("crop","question").contains(k))) throw new IllegalArgumentException("工具包含未知参数"); }
        return switch(name) {
            case "query_crop_knowledge" -> multicrop.ask(args.path("crop").asString(),args.path("question").asString());
            case "get_vision_records" -> {
                if(ownerId==null)throw new IllegalArgumentException("视觉查询缺少用户身份");
                String id=args.path("recordId").asString("");
                var rows=vision.list(ownerId,farmId).stream().limit(3).toList();
                if(!id.isBlank()) {if(!id.matches("[0-9a-fA-F-]{36}"))throw new IllegalArgumentException("视觉记录 ID 格式不正确");var record=vision.get(id,ownerId);if(!record.farmId().equals(farmId))throw new IllegalArgumentException("视觉记录不属于当前基地");rows=List.of(record);}
                yield Map.of("records",rows,"limitations","只读取用户本人已有检测记录，不执行新推理；梨叶公开模型未经鸭梨独立验证");
            }
            case "get_farm_context" -> dashboard.snapshot(farmId);
            case "get_business_records" -> operations.toolContext(farmId);
            case "retrieve_evidence" -> {
                String query=args.path("query").asString("");
                if(query.isBlank() || query.length()>1200) throw new IllegalArgumentException("检索语句须为 1–1200 字符");
                yield Map.of("retrieval_type","keyword_baseline","evidence",knowledge.search(query,4));
            }
            case "analyze_environment" -> {
                var snapshot=dashboard.snapshot(farmId);
                var thresholds=dashboard.thresholds(farmId);
                var checks=new ArrayList<Map<String,Object>>();
                for(var threshold:thresholds) for(var metric:snapshot.environmentMetrics()) {
                    if(metric.key().equals(threshold.metricKey()) && threshold.enabled()) checks.add(Map.of(
                        "metric",metric.label(),"value",metric.numericValue(),"unit",metric.unit(),
                        "minimum",threshold.minimumValue(),"below_minimum",metric.numericValue()<threshold.minimumValue()));
                }
                yield Map.of("rule_version","configured-minimum-v1","virtual_data",snapshot.virtualData(),"checks",checks,
                    "soil_moisture_history",dashboard.observationHistory(farmId,"soilMoisture"),
                    "limitations","历史仅为已保存的农场级演示观测，不能代表每个地块；梨叶视觉需单独查询 get_vision_records，不计算病害概率");
            }
            default -> throw new IllegalArgumentException("工具不在农业白名单中");
        };
    }
}
