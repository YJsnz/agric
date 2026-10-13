package com.example.ty.agent;

import com.example.ty.auth.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.*;

@Service @RequiredArgsConstructor
public class AgentStore {
    private final AgentRunRepository runs;
    private final AgentEventRepository events;
    private final ObjectMapper json;
    private final TransactionTemplate transactions;
    public synchronized AgentRun create(Long userId,String question,String model) {
        return create(userId,question,model,"yantian-01");
    }
    public synchronized AgentRun create(Long userId,String question,String model,String farmId) {return create(userId,question,model,farmId,null);}
    public synchronized AgentRun create(Long userId,String question,String model,String farmId,String parentRunId) {
        return transactions.execute(status -> {
            var run=new AgentRun(); run.setId(UUID.randomUUID().toString());run.setUserId(userId);
            run.setQuestion(question);run.setFarmId(farmId);run.setParentRunId(parentRunId);run.setModel(model);run.setStatus("QUEUED");
            run.setCreatedAt(Instant.now());run.setUpdatedAt(Instant.now());runs.save(run);
            append(run.getId(),"run.created",Map.of("message","任务已创建"));
            var steps=new ArrayList<>(List.of("读取基地观测与对象档案","检索资料并保留来源"));
            if(question.matches("(?s).*(环境|湿度|灌溉|阈值|历史|趋势).*"))steps.add("核验配置阈值与观测记录");
            if(question.matches("(?s).*(视觉|图像|检测记录|叶片).*"))steps.add("读取本人视觉记录与模型输出");
            if(question.matches("(?s).*(农事|生长记录|批次|回执|处置记录).*"))steps.add("查询软件业务与追溯记录");
            steps.add("汇总依据、缺失项与建议");
            append(run.getId(),"run.plan",Map.of("steps",steps,"type","任务核验流程"));return run;
        });
    }
    public AgentRun owned(String id,Long owner) {
        return runs.findById(id).filter(r -> r.getUserId().equals(owner)).orElseThrow(() -> BizException.notFound("任务不存在"));
    }
    public List<AgentRun> list(Long user) { return runs.findTop50ByUserIdOrderByCreatedAtDesc(user); }
    public List<AgentEvent> events(String id,Long user,long after) { owned(id,user); return events.findByRunIdAndSeqGreaterThanOrderBySeq(id,after); }
    public boolean cancelled(String id) { return runs.findById(id).map(r -> r.getStatus().equals("CANCELLED")).orElse(true); }
    public synchronized void append(String id,String type,Object payload) {
        transactions.executeWithoutResult(status -> {
            var run=runs.findById(id).orElseThrow();
            if (terminal(run) && !type.startsWith("run.")) return;
            var event=new AgentEvent(); event.setRunId(id);event.setSeq(events.countByRunId(id)+1);
            event.setType(type);event.setTimestamp(Instant.now());event.setPayload(json.writeValueAsString(payload));events.save(event);
        });
    }
    public synchronized void transition(String id,String state,String answer,String error) {
        transactions.executeWithoutResult(status -> {
            var run=runs.findById(id).orElseThrow(); if(terminal(run)) return;
            run.setStatus(state);run.setUpdatedAt(Instant.now()); if(answer!=null)run.setAnswer(answer);if(error!=null)run.setError(error);
            runs.save(run);append(id,"run."+state.toLowerCase(Locale.ROOT),Map.of("message",error==null?state:error));
        });
    }
    private boolean terminal(AgentRun r) { return Set.of("COMPLETED","FAILED","CANCELLED").contains(r.getStatus()); }
    public void recoverInterrupted() {
        for(var r:runs.findByStatusIn(List.of("QUEUED","RUNNING"))) transition(r.getId(),"FAILED",null,"服务重启中断了任务；已完成工具记录保留，可重新发起");
    }
}
