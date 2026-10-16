package com.example.ty;
import com.example.ty.transport.*;
import com.example.ty.auth.exception.BizException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import static org.assertj.core.api.Assertions.*;
@SpringBootTest @Transactional
class TransportWorkflowTests {
 @Autowired TransportService service;
 @Autowired TransportRepository repository;
 @Autowired ObjectMapper json;
 @Autowired com.example.ty.dashboard.DashboardService dashboard;
 @Test void blockedRoadCannotBeUsedAndUnknownFarmIsRejected(){
  service.state("yantian-01");
  assertThat(service.preview("yantian-01","supply","warehouse").get("route")).isNotNull();
  service.road("yantian-01","warehouse--supply",true);
  assertThat(service.preview("yantian-01","supply","warehouse").get("route").toString()).contains("courtyard");
  service.road("yantian-01","parking-road--warehouse",true);
  assertThatThrownBy(()->service.preview("yantian-01","supply","warehouse")).isInstanceOf(BizException.class);
  assertThatThrownBy(()->service.state("other-farm")).isInstanceOf(BizException.class);
 }
 @Test void reservesCancelsAndRejectsInvalidLoadWithoutInventoryChanges(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var t=s.tasks.get(s.tasks.size()-1);
  assertThat(s.inventory.stream().filter(i->i.location.equals("supply")&&i.goods.equals("肥料")).findFirst().orElseThrow().reserved).isEqualTo(10);
  assertThatThrownBy(()->service.control("yantian-01",t.id,"UNLOAD")).isInstanceOf(BizException.class);
  s=service.control("yantian-01",t.id,"CANCEL");
  assertThat(s.inventory.stream().filter(i->i.location.equals("supply")&&i.goods.equals("肥料")).findFirst().orElseThrow().reserved).isZero();
  assertThatThrownBy(()->service.control("yantian-01",t.id,"CANCEL")).isInstanceOf(BizException.class);
 }
 @Test void unloadConfirmationIsIdempotentAndDoesNotDoubleBook(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var t=s.tasks.get(s.tasks.size()-1);t.status="WAIT_LOAD";
  persist(s);s=service.control("yantian-01",t.id,"LOAD");
  assertThat(s.tasks.get(s.tasks.size()-1).loaded).isTrue();
  t=s.tasks.get(s.tasks.size()-1);t.status="WAIT_ARRIVAL";persist(s);
  s=service.vehicleSignal("yantian-01","cart-01",new TransportService.VehicleSignal("test-arrival",t.id,t.destination,"DELIVERY","ARRIVED",java.time.Instant.now().toString()));
  s=service.control("yantian-01",t.id,"UNLOAD");
  assertThat(s.inventory.stream().filter(i->i.location.equals("warehouse")&&i.goods.equals("肥料")).findFirst().orElseThrow().available).isEqualTo(10);
  String completedId=t.id;assertThatThrownBy(()->service.control("yantian-01",completedId,"UNLOAD")).isInstanceOf(BizException.class);
  assertThat(service.state("yantian-01").ledger.stream().filter(e->e.type.equals("INBOUND")).count()).isEqualTo(1);
 }
 @Test void shortRemainingDistanceReachesRoadCheckpointWithoutDeadlock(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var t=s.tasks.get(s.tasks.size()-1);t.status="RUNNING";t.route=new java.util.ArrayList<>(java.util.List.of("charge","parking-road","warehouse","supply"));t.waypoint=1;
  var start=s.stops.stream().filter(n->n.id.equals("charge")).findFirst().orElseThrow();var goal=s.stops.stream().filter(n->n.id.equals("parking-road")).findFirst().orElseThrow();double length=Math.hypot(goal.x-start.x,goal.y-start.y);
  s.vehicle=new TransportService.Point(goal.x-(goal.x-start.x)/length*2.5,goal.y-(goal.y-start.y)/length*2.5);s.heading=Math.atan2(goal.y-start.y,goal.x-start.x);s.speed=0;s.lastTick=System.currentTimeMillis()-500;persist(s);
  service.tick();var result=service.state("yantian-01");
  assertThat(Math.hypot(result.vehicle.x-goal.x,result.vehicle.y-goal.y)).isLessThan(.3);
  assertThat(result.tasks.get(result.tasks.size()-1).waypoint).isEqualTo(2);
 }
 @Test void changingParcelBoundaryCannotCreateRouteThroughField(){
  service.state("yantian-01");
  dashboard.createZone("yantian-01",new com.example.ty.dashboard.dto.ZoneUpsertRequest("transport-test-field","测试禁行地块","鸭梨","1 亩","测试","演示",90,84,38,java.util.List.of(java.util.List.of(1257d,408d),java.util.List.of(1317d,408d),java.util.List.of(1317d,468d),java.util.List.of(1257d,468d))));
  assertThatThrownBy(()->service.preview("yantian-01","supply","warehouse")).isInstanceOf(BizException.class);
 }
 private void persist(TransportService.State s){var row=repository.findById("yantian-01").orElseThrow();row.setPayload(json.writeValueAsString(s));repository.saveAndFlush(row);}
}
