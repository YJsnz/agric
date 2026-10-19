package com.example.ty.agent;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.util.*;

/** Trim rendering-only payloads for small-context edge models; audit results remain complete. */
@Component @RequiredArgsConstructor
public class AgentContextProjection {
    private final ObjectMapper json;
    private final AgentRuntimeSettings settings;

    public Object project(String tool,Object result) {
        // Keep tool payloads bounded even when the remote model supports a larger
        // context window. Larger contexts should prevent truncation, not reintroduce
        // geometry and long evidence passages into every model turn.
        JsonNode root=json.valueToTree(result);
        if(tool.equals("get_farm_context")) {
            var output=pick(root,"farmId","farmName","generatedAt","virtualData","summary","environmentMetrics","alerts");
            output.put("entities",rows(root.path("entities"),"id","name","type","status","metric"));
            output.put("zones",rows(root.path("zones"),"id","entityId","crop","area","stage","environment"));
            output.put("devices",rows(root.path("devices"),"id","entityId","name","online","enabled","value"));
            output.put("irrigationUnits",rows(root.path("irrigationUnits"),"id","entityId","name","target","enabled","flow"));
            output.put("contextProjection","edge-no-rendering-geometry");
            return output;
        }
        if(tool.equals("retrieve_evidence")) {
            var output=pick(root,"retrieval_type");
            var evidence=new ArrayList<Map<String,Object>>();
            for(var item:root.path("evidence")) {
                var row=pick(item,"source","score");
                String content=item.path("content").asString();
                row.put("content",content.substring(0,Math.min(300,content.length())));
                row.put("excerptTruncated",content.length()>300);
                evidence.add(row);
            }
            output.put("evidence",evidence);
            output.put("contextProjection","edge-source-preserving-excerpts");
            return output;
        }
        if(tool.equals("analyze_environment")) {
            var output=pick(root,"rule_version","virtual_data","limitations");
            output.put("checks",json.convertValue(root.path("checks"),Object.class));
            var history=root.path("soil_moisture_history");
            var points=history.path("points");
            var recent=new ArrayList<JsonNode>();
            for(var point:points)recent.add(point);
            int start=Math.max(0,recent.size()-8);
            var historySummary=pick(history,"farmId","metricKey","scope","virtualData","limit");
            historySummary.put("totalPoints",recent.size());
            historySummary.put("points",rows(recent.subList(start,recent.size()),"label","value","unit","source","measuredAt"));
            historySummary.put("pointsTruncated",start>0);
            output.put("soil_moisture_history",historySummary);
            output.put("contextProjection","recent-eight-observations");
            return output;
        }
        if(tool.equals("query_crop_knowledge")) {
            var output=pick(root,"domain","crop","status","retrieval_query","disclaimer","context");
            var answer=root.path("grounded_answer");
            if(answer.isObject()) {
                var concise=pick(answer,"sufficient","conclusion","basis","reasoning","advice","citations");
                output.put("grounded_answer",concise);
            } else if(root.has("answer")) {
                output.put("answer",truncate(root.path("answer").asString(),2400));
            }
            var citations=new ArrayList<Map<String,Object>>();
            for(var citation:root.path("citations")) {
                if(citations.size()==3)break;
                var row=pick(citation,"evidence_id","source_id","title","authority","page","url");
                String content=citation.path("content").asString();
                if(!content.isBlank())row.put("content",truncate(content,500));
                citations.add(row);
            }
            if(!citations.isEmpty())output.put("citations",citations);
            var preliminary=root.path("preliminary_assessment");
            if(preliminary.isObject()) {
                var summary=pick(preliminary,"available");
                if(preliminary.has("summary"))summary.put("summary",truncate(preliminary.path("summary").asString(),900));
                summary.put("supporting_points",limitedText(preliminary.path("supporting_points"),3,700));
                summary.put("uncertainties",limitedText(preliminary.path("uncertainties"),3,700));
                output.put("preliminary_assessment",summary);
            }
            output.put("contextProjection","grounded-answer-and-citations");
            return output;
        }
        return result;
    }

    private Map<String,Object> pick(JsonNode node,String... fields) {
        var output=new LinkedHashMap<String,Object>();
        for(String field:fields)if(node.has(field))output.put(field,json.convertValue(node.path(field),Object.class));
        return output;
    }
    private List<Map<String,Object>> rows(JsonNode nodes,String... fields) {
        var output=new ArrayList<Map<String,Object>>();
        for(var node:nodes)output.add(pick(node,fields));
        return output;
    }
    private List<Map<String,Object>> rows(List<JsonNode> nodes,String... fields) {
        var output=new ArrayList<Map<String,Object>>();
        for(var node:nodes)output.add(pick(node,fields));
        return output;
    }
    private List<String> limitedText(JsonNode values,int limit,int maxLength) {
        var output=new ArrayList<String>();
        if(values.isArray())for(var value:values) { if(output.size()==limit)break;output.add(truncate(value.asString(),maxLength)); }
        return output;
    }
    private String truncate(String value,int maxLength) {
        return value.length()<=maxLength?value:value.substring(0,maxLength)+"…";
    }
}
