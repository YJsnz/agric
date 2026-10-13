package com.example.ty;

import com.example.ty.agent.*;
import com.example.ty.auth.exception.BizException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tools.jackson.databind.ObjectMapper;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = "AGENT_ENGINE=legacy")
class AgentRuntimeTests {
    @Autowired AgentRuntime runtime;
    @Autowired AgentStore store;
    @Autowired AgentTools tools;
    @Autowired ObjectMapper json;
    @Autowired AgentRunRepository runs;
    @Autowired AgentEventRepository events;
    @MockitoBean AgentModelClient model;

    @Test void executesRealToolsAndPersistsTheirResults() throws Exception {
        when(model.model()).thenReturn("test-model");
        when(model.call(anyList(),anyList())).thenReturn(
            json.readTree("""
                {"role":"assistant","content":null,"tool_calls":[
                {"id":"one","type":"function","function":{"name":"get_farm_context","arguments":"{}"}},
                {"id":"two","type":"function","function":{"name":"retrieve_evidence","arguments":"{\\"query\\":\\"灌溉\\"}"}}]}
                """),json.readTree("{\"role\":\"assistant\",\"content\":\"依据演示农场和资料分析，不能用于真实生产。\"}"));
        var run=runtime.create(991001L,"查询环境并检索资料");
        try {
            long deadline=System.currentTimeMillis()+15000;
            while(!Set.of("COMPLETED","FAILED").contains(store.owned(run.getId(),991001L).getStatus()) && System.currentTimeMillis()<deadline) Thread.sleep(50);
            assertThat(store.owned(run.getId(),991001L).getStatus()).isEqualTo("COMPLETED");
            var log=store.events(run.getId(),991001L,0);
            assertThat(log.stream().filter(e->e.getType().equals("tool.completed"))).hasSize(2);
            assertThat(log.stream().map(AgentEvent::getSeq)).containsExactlyElementsOf(java.util.stream.LongStream.rangeClosed(1,log.size()).boxed().toList());
            assertThat(store.events(run.getId(),991001L,log.get(log.size()-1).getSeq())).isEmpty();
        } finally { cleanup(run); }
    }
    @Test void isolatesRunsAndPreservesCancellation() {
        var run=store.create(991002L,"取消测试","test-model");
        try {
            assertThatThrownBy(()->store.events(run.getId(),991003L,0)).isInstanceOf(BizException.class);
            assertThatThrownBy(()->runtime.cancel(run.getId(),991003L)).isInstanceOf(BizException.class);
            runtime.cancel(run.getId(),991002L);
            store.transition(run.getId(),"COMPLETED","迟到结果",null);
            store.append(run.getId(),"tool.completed",Map.of("result","迟到结果"));
            assertThat(store.owned(run.getId(),991002L).getStatus()).isEqualTo("CANCELLED");
            assertThat(store.owned(run.getId(),991002L).getAnswer()).isNull();
            assertThat(store.events(run.getId(),991002L,0)).hasSize(3);
        } finally { cleanup(run); }
    }
    @Test void followupAndRetryKeepOwnershipAndOriginalHistory() throws Exception {
        when(model.model()).thenReturn("test-model");
        when(model.call(anyList(),anyList())).thenThrow(new IllegalStateException("测试模型未连接"));
        var parent=store.create(991020L,"查询农事记录","test-model","yantian-01");
        AgentRun child=null,retried=null;
        try {
            assertThatThrownBy(()->runtime.followup(parent.getId(),991020L,"继续说明")).isInstanceOf(BizException.class);
            store.transition(parent.getId(),"COMPLETED","原回答仅作历史摘要",null);
            assertThatThrownBy(()->runtime.followup(parent.getId(),991021L,"继续说明")).isInstanceOf(BizException.class);
            child=runtime.followup(parent.getId(),991020L,"说明采后批次");
            assertThat(child.getParentRunId()).isEqualTo(parent.getId());
            assertThat(child.getFarmId()).isEqualTo("yantian-01");
            assertThat(child.getQuestion()).contains("本次追问：说明采后批次","重新调用工具");
            long deadline=System.currentTimeMillis()+10000;
            while(!"FAILED".equals(store.owned(child.getId(),991020L).getStatus())&&System.currentTimeMillis()<deadline)Thread.sleep(50);
            retried=runtime.retry(child.getId(),991020L);
            assertThat(retried.getParentRunId()).isEqualTo(child.getId());
            assertThat(retried.getId()).isNotEqualTo(child.getId());
            deadline=System.currentTimeMillis()+10000;
            while(!"FAILED".equals(store.owned(retried.getId(),991020L).getStatus())&&System.currentTimeMillis()<deadline)Thread.sleep(50);
            assertThat(store.owned(parent.getId(),991020L).getAnswer()).isEqualTo("原回答仅作历史摘要");
        } finally { if(retried!=null)cleanup(retried);if(child!=null)cleanup(child);cleanup(parent); }
    }
    @Test void refusesUnregisteredToolsAndUnknownParameters() throws Exception {
        assertThatThrownBy(()->tools.execute("shell",json.readTree("{}"),"farm-01")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->tools.execute("get_farm_context",json.readTree("{\"farmId\":\"other\"}"),"farm-01")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->runtime.create(991001L," ")).isInstanceOf(BizException.class);
    }
    private void cleanup(AgentRun run) { events.deleteAll(events.findByRunIdAndSeqGreaterThanOrderBySeq(run.getId(),0));runs.deleteById(run.getId()); }
}
