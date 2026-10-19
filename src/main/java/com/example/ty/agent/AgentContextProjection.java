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
}
