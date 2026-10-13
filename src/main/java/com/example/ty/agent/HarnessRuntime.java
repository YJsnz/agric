package com.example.ty.agent;

import lombok.RequiredArgsConstructor;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

/** Uses the official SDK/profile; Java owns authentication, tool execution and durable UI records. */
@Component @RequiredArgsConstructor
public class HarnessRuntime {
    private final AgentStore store;
    private final AgentTools tools;
    private final AgentAnswerVerifier verifier;
    private final ObjectMapper json;
    private final AgentRuntimeSettings settings;
    private final AgentContextProjection projection;
    @Value("${AGENT_ENGINE:harness}") private String engine;
    @Value("${AGENT_BASE_URL:http://127.0.0.1:11434/v1}") private String baseUrl;
    @Value("${AGENT_API_KEY:}") private String apiKey;
    @Value("${AGENT_MODEL:qwen2.5:7b}") private String model;
    @Value("${AGENT_NODE:node}") private String node;
    @Value("${AGENT_TIMEOUT_SECONDS:600}") private int timeoutSeconds;
    private final ConcurrentMap<String,Process> processes = new ConcurrentHashMap<>();
    public boolean enabled() { return "harness".equalsIgnoreCase(engine); }
    public void cancel(String id) { var p=processes.get(id); if(p!=null) kill(p); }
    @PreDestroy public void close() { processes.values().forEach(this::kill); }
    private void kill(Process p) { p.descendants().forEach(h -> h.destroyForcibly()); p.destroyForcibly(); }
    public void execute(AgentRun run) {
        Process process=null; Path errors=null;
        var used=new HashSet<String>();
        tools.jackson.databind.JsonNode businessFacts=null,evidenceFacts=null;
        try {
            if(store.cancelled(run.getId()))return;
            store.transition(run.getId(),"RUNNING",null,null);
            errors=Files.createTempFile("agric-harness-", ".log");
            process=new ProcessBuilder(node,"agent-runtime/run.mjs").redirectError(errors.toFile()).start();
            processes.put(run.getId(),process);
            if(store.cancelled(run.getId())) { kill(process);return; }
            final Process owned=process;
            var timeout=CompletableFuture.delayedExecutor(Math.max(60,Math.min(900,timeoutSeconds))+20,TimeUnit.SECONDS);
            timeout.execute(() -> { if(owned.isAlive())kill(owned); });
            try(var writer=new BufferedWriter(new OutputStreamWriter(process.getOutputStream(),StandardCharsets.UTF_8));
                var reader=new BufferedReader(new InputStreamReader(process.getInputStream(),StandardCharsets.UTF_8))) {
                writer.write(json.writeValueAsString(Map.of("runId",run.getId(),"question",run.getQuestion(),"model",model,"baseUrl",baseUrl,"apiKey",apiKey,"timeoutSeconds",Math.max(60,Math.min(900,timeoutSeconds)),"contextTokens",settings.contextTokens(),"maxTokens",settings.maxTokens())));writer.newLine();writer.flush();
                String line;int calls=0;
                while((line=reader.readLine())!=null) {
                    if(store.cancelled(run.getId())) {kill(process);return;}
                    var message=json.readTree(line);String type=message.path("type").asString("");
                    if(type.equals("runtime.ready"))store.append(run.getId(),"runtime.ready",Map.of("engine",message.path("engine").asString("deepseek-harness"),"version","0.2.0-rc.2"));
                    else if(type.equals("harness.event")) {
                        var notification=message.path("notification");
                        if(notification.path("method").asString("").equals("session.event")) {
                            store.append(run.getId(),"harness.event",json.convertValue(notification.path("params"),Map.class));
                            if(notification.path("params").path("event").path("type").asString("").equals("request/header"))store.append(run.getId(),"model.started",Map.of("round",calls+1,"model",model));
                        }
                    } else if(type.equals("tool.request")) {
                        if(++calls>20)throw new IllegalStateException("工具调用达到任务上限");
                        String name=message.path("name").asString(""),id=message.path("id").asString("");
                        store.append(run.getId(),"tool.started",Map.of("tool",name,"call_id",id));
                        Map<String,Object> response=new HashMap<>();response.put("type","tool.response");response.put("id",id);
                        try {var result=tools.execute(name,message.path("args"),run.getFarmId(),run.getUserId());used.add(name);if(name.equals("get_business_records"))businessFacts=json.valueToTree(result);if(name.equals("retrieve_evidence"))evidenceFacts=json.valueToTree(result);response.put("result",result);store.append(run.getId(),"tool.completed",Map.of("tool",name,"call_id",id,"result",result));}
                        catch(Exception e){response.put("error","工具参数或执行失败");store.append(run.getId(),"tool.failed",Map.of("tool",name,"call_id",id,"message","工具参数或执行失败"));}
                        if(response.containsKey("result"))response.put("result",projection.project(name,response.get("result")));
                        writer.write(json.writeValueAsString(response));writer.newLine();writer.flush();
                    } else if(type.equals("completed")) {
                        String answer=message.path("answer").asString("");
                        boolean needsEnvironment=run.getQuestion().matches("(?s).*(环境|湿度|灌溉|阈值|历史|趋势).*");
                        boolean needsBusiness=run.getQuestion().matches("(?s).*(农事|生长记录|批次|回执|处置记录).*");
                        boolean needsVision=run.getQuestion().matches("(?s).*(视觉|图像|检测记录|叶片).*");
                        if(run.getQuestion().matches("(?s).*(小麦|旱碱麦|小枣|青县|番茄|黄瓜).*")&&!used.contains("query_crop_knowledge"))
                            throw new IllegalStateException("模型未核验指定作物知识，不能将梨基地演示数据当作该作物结论");
                        if(answer.isBlank()||!used.containsAll(Set.of("get_farm_context","retrieve_evidence"))||(needsEnvironment&&!used.contains("analyze_environment"))||(needsVision&&!used.contains("get_vision_records"))||(needsBusiness&&!used.contains("get_business_records")))throw new IllegalStateException("模型未完成必要的数据与资料核验，请重试或明确任务范围");
                        String checked=verifier.verifyBusiness(answer,run.getQuestion().contains("批次")?businessFacts:null,evidenceFacts);
                        if(!checked.equals(answer))store.append(run.getId(),"answer.corrected",Map.of("message","模型遗漏批次事实，已改用保存记录摘要"));
                        answer=checked;
                        store.transition(run.getId(),"COMPLETED","【软件演示】以下基于演示观测、保存记录与检索资料。\n\n"+answer,null);return;
                    } else if(type.equals("failed"))throw new IllegalStateException("Harness 执行失败，请检查本地模型、Node 版本与运行时日志");
                }
                throw new IllegalStateException("Harness 运行时已退出或超时，请重新发起任务");
            }
        } catch(Exception e) { if(!store.cancelled(run.getId()))store.transition(run.getId(),"FAILED",null,e instanceof IllegalStateException?e.getMessage():"无法启动 Harness，请运行 npm ci --prefix agent-runtime 并检查 Node 24+"); }
        finally {processes.remove(run.getId());if(process!=null&&process.isAlive())try{if(!process.waitFor(10,TimeUnit.SECONDS))kill(process);}catch(InterruptedException e){Thread.currentThread().interrupt();kill(process);}if(errors!=null)try{Files.deleteIfExists(errors);}catch(IOException ignored){} }
    }
}
