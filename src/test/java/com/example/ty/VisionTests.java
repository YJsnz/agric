package com.example.ty;
import com.example.ty.vision.*;
import com.example.ty.agent.AgentTools;
import com.example.ty.auth.exception.BizException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
@SpringBootTest @Transactional
class VisionTests {
    @Autowired VisionService vision;@Autowired VisionRepository records;
    @Autowired AgentTools tools;@Autowired ObjectMapper json;
    @Test void recordsAndAgentToolAreOwnerAndFarmScoped() {
        var id=UUID.randomUUID().toString();records.save(VisionRecord.builder().id(id).ownerId(991112L)
            .farmId("yantian-01").plotId("yt-pear-01").status("COMPLETED").createdAt(LocalDateTime.now())
            .resultJson("{\"modelId\":\"test-model\",\"detections\":[]}").build());
        assertThat(vision.list(991112L,"yantian-01")).hasSize(1);
        assertThat(vision.list(991113L,"yantian-01")).isEmpty();
        assertThat(vision.list(991112L,"farm-01")).isEmpty();
        assertThatThrownBy(()->vision.get(id,991113L)).isInstanceOf(BizException.class);
        assertThatThrownBy(()->vision.image(id,991113L)).isInstanceOf(BizException.class);
        assertThat(json.valueToTree(tools.execute("get_vision_records",json.readTree("{}"),"yantian-01",991112L)).path("records").size()).isEqualTo(1);
        assertThat(json.valueToTree(tools.execute("get_vision_records",json.readTree("{\"recordId\":\""+id+"\"}"),"yantian-01",991112L)).path("records").get(0).path("id").asString()).isEqualTo(id);
        assertThatThrownBy(()->tools.execute("get_vision_records",json.readTree("{\"recordId\":\""+id+"\"}"),"farm-01",991112L)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->tools.execute("get_vision_records",json.readTree("{}"),"yantian-01")).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void reviewPreservesOriginalResultAndRejectsOtherOwners() {
        var id=UUID.randomUUID().toString();records.save(VisionRecord.builder().id(id).ownerId(991115L).farmId("yantian-01").plotId("yt-pear-01").status("COMPLETED").createdAt(LocalDateTime.now()).resultJson("{\"detections\":[]}").build());
        assertThatThrownBy(()->vision.review(id,991116L,new VisionService.ReviewInput("CONFIRMED","测试"))).isInstanceOf(BizException.class);
        vision.review(id,991115L,new VisionService.ReviewInput("CONFIRMED","已核对图像"));
        vision.review(id,991115L,new VisionService.ReviewInput("RESAMPLE","应重新采集"));
        assertThat(vision.reviews(id,991115L)).extracting(VisionReview::getDecision).containsExactly("CONFIRMED","RESAMPLE");
        assertThat(vision.owned(id,991115L).getResultJson()).isEqualTo("{\"detections\":[]}");
    }
    @Test void serviceRestartMarksIncompleteTasksAsFailed() {
        var id=UUID.randomUUID().toString();records.save(VisionRecord.builder().id(id).ownerId(991114L)
            .farmId("yantian-01").status("QUEUED").createdAt(LocalDateTime.now()).build());
        vision.recover();assertThat(vision.get(id,991114L).status()).isEqualTo("FAILED");
        assertThat(vision.get(id,991114L).error()).contains("重启");
    }
}
