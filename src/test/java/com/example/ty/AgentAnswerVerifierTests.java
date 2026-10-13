package com.example.ty;
import com.example.ty.agent.AgentAnswerVerifier;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
class AgentAnswerVerifierTests {
 private final ObjectMapper json=new ObjectMapper();private final AgentAnswerVerifier verifier=new AgentAnswerVerifier();
 @Test void wrongBatchSummaryIsReplacedWithSavedFacts() throws Exception {
  var facts=json.readTree("{\"batches\":[{\"id\":3,\"title\":\"秋季采收\",\"stageLabel\":\"已出库\",\"quantity\":100,\"unit\":\"kg\",\"plotId\":\"yt-pear-02\"}]}");
  var corrected=verifier.verifyBusiness("生长观察属于批次，尚未采收",facts,null);
  assertThat(corrected).contains("秋季采收","已出库","100.0 kg","未检索到匹配资料").doesNotContain("生长观察属于批次");
  assertThat(verifier.verifyBusiness("缺失批次",facts,json.readTree("{\"evidence\":[{\"source\":\"软件操作参考\"}]}"))).contains("软件操作参考");
  assertThat(verifier.verifyBusiness("批次 #3 秋季采收已出库",facts,null)).isEqualTo("批次 #3 秋季采收已出库");
 }
 @Test void absenceOfBatchRecordsDoesNotBecomeInventedBatch() throws Exception {
  assertThat(verifier.verifyBusiness("已有库存100公斤",json.readTree("{\"batches\":[]}"),null)).contains("尚无已登记").doesNotContain("100");
 }
}
