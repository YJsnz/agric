package com.example.ty;
import com.example.ty.agent.*;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;

class AgentContextProjectionTests {
    @Test void edgeProjectionRetainsFactsAndSourcesWithoutMutatingAuditResult() {
        var json=new ObjectMapper();
        var projection=new AgentContextProjection(json,new AgentRuntimeSettings(1,2,4096,512));
        var raw=json.readTree("{\"farmId\":\"demo\",\"entities\":[{\"id\":\"plot\",\"metric\":\"32%\",\"x\":12}],\"zones\":[{\"id\":\"z\",\"polygon\":[[1,2]],\"crop\":\"鸭梨\"}]}");
        var compact=json.valueToTree(projection.project("get_farm_context",raw));
        assertThat(compact.path("entities").get(0).path("metric").asString()).isEqualTo("32%");
        assertThat(compact.path("entities").get(0).has("x")).isFalse();
        assertThat(compact.path("zones").get(0).has("polygon")).isFalse();
        assertThat(raw.path("entities").get(0).has("x")).isTrue();
        var evidence=Map.of("retrieval_type","keyword","evidence",java.util.List.of(Map.of("source","实际资料","content","测".repeat(500),"score",1)));
        var excerpt=json.valueToTree(projection.project("retrieve_evidence",evidence)).path("evidence").get(0);
        assertThat(excerpt.path("source").asString()).isEqualTo("实际资料");
        assertThat(excerpt.path("content").asString()).hasSize(300);
        assertThat(excerpt.path("excerptTruncated").asBoolean()).isTrue();
    }
}
