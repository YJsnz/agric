package com.example.ty;
import com.example.ty.operations.*;
import com.example.ty.dashboard.DashboardService;
import com.example.ty.dashboard.dto.ControlRequest;
import com.example.ty.auth.exception.BizException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.*;
@SpringBootTest @Transactional
class OperationWorkflowTests {
 @Autowired OperationService operations;
 @Autowired OperationRepository records;
 @Autowired DashboardService dashboard;
 @Test void batchHasOrderedDurableTraceAndRejectsSkippedOrCrossFarmTransitions(){
  var batch=operations.create("yantian-01",new OperationService.Create("BATCH","软件测试批次","模拟采收","yt-pear-02",120.0,"kg"));
  assertThat(batch.getStage()).isEqualTo("HARVESTED");
  assertThatThrownBy(()->operations.advance("yantian-01",batch.getId(),new OperationService.Advance("STORED","越级入库"))).isInstanceOf(BizException.class);
  assertThatThrownBy(()->operations.trace("farm-01",batch.getId())).isInstanceOf(BizException.class);
  for(var stage:java.util.List.of("SORTED","STORED","DISPATCHED"))operations.advance("yantian-01",batch.getId(),new OperationService.Advance(stage,"模拟流转说明"));
  assertThat(operations.trace("yantian-01",batch.getId())).extracting(OperationRecord::getStage).containsExactly("HARVESTED","SORTED","STORED","DISPATCHED");
  assertThatThrownBy(()->operations.advance("yantian-01",batch.getId(),new OperationService.Advance("SORTED","重复"))).isInstanceOf(BizException.class);
  assertThat(records.findById(batch.getId()).orElseThrow().isSimulated()).isTrue();
 }
 @Test void acceptsFarmAndGrowthRecordsButNotForgedReceipts(){
  for(var kind:java.util.List.of("AGRONOMY","GROWTH"))assertThat(operations.create("yantian-01",new OperationService.Create(kind,"观察","模拟记录","yt-pear-02",null,null)).getStage()).isEqualTo("RECORDED");
  assertThatThrownBy(()->operations.create("yantian-01",new OperationService.Create("DEVICE_RECEIPT","伪造","记录","yt-pear-02",null,null))).isInstanceOf(BizException.class);
  assertThatThrownBy(()->operations.create("farm-01",new OperationService.Create("AGRONOMY","跨基地","记录","yt-pear-02",null,null))).isInstanceOf(BizException.class);
  assertThatThrownBy(()->operations.create("yantian-01",new OperationService.Create("BATCH","批次","记录","yt-pear-02",Double.NaN,"kg"))).isInstanceOf(BizException.class);
 }
 @Test void irrigationProducesReceiptAndAutomaticAlertRecoveryHistory(){
  dashboard.simulateSoilMoisture("yantian-01",30);
  var unit=dashboard.snapshot("yantian-01").irrigationUnits().stream().filter(u->u.entityId().equals("yt-pear-03")).findFirst().orElseThrow();
  dashboard.controlIrrigation("yantian-01",unit.id(),new ControlRequest(true,18));
  assertThat(operations.list("yantian-01")).anyMatch(r->r.getKind().equals("IRRIGATION_RECEIPT")&&r.getDetail().contains("18"));
  assertThat(operations.list("yantian-01")).anyMatch(r->r.getKind().equals("ALERT_RECEIPT")&&r.getDetail().contains("自动解除"));
 }
}
