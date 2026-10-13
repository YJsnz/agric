package com.example.ty.agent;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.*;

@Component
public class AgentModelClient {
    private final ObjectMapper json;
    private final String endpoint, model, key;
    private final AgentRuntimeSettings settings;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    public AgentModelClient(ObjectMapper json,
            @Value("${agent.base-url:http://127.0.0.1:11434/v1}") String base,
            @Value("${agent.model:qwen2.5:7b}") String model,
            @Value("${agent.api-key:}") String key, AgentRuntimeSettings settings) {
        this.json=json; this.endpoint=base.replaceAll("/+$", "")+"/chat/completions";
        this.model=model; this.key=key;
        this.settings=settings;
    }
    public String model() { return model; }
    public JsonNode call(List<Map<String,Object>> messages,List<Map<String,Object>> tools) throws Exception {
        var body = Map.of("model",model,"messages",messages,"tools",tools,"stream",false,"temperature",0.1,"max_tokens",settings.maxTokens());
        var builder = HttpRequest.newBuilder(URI.create(endpoint)).timeout(Duration.ofSeconds(180))
            .header("Content-Type","application/json");
        if (!key.isBlank()) builder.header("Authorization","Bearer "+key);
        var response=http.send(builder.POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build(),HttpResponse.BodyHandlers.ofString());
        if (response.statusCode()<200 || response.statusCode()>=300) throw new IllegalStateException("本地模型请求失败（HTTP "+response.statusCode()+"），请检查模型服务与 AGENT_MODEL");
        var message=json.readTree(response.body()).path("choices").path(0).path("message");
        if (message.isMissingNode()) throw new IllegalStateException("模型返回格式无效");
        return message;
    }
}
