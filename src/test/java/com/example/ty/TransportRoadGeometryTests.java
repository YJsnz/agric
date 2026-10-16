package com.example.ty;

import com.example.ty.transport.*;
import com.example.ty.dashboard.entity.FarmAsset;
import com.example.ty.dashboard.repository.FarmAssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class TransportRoadGeometryTests {
 private final ObjectMapper json=new ObjectMapper();
 private final Map<String,TransportStateEntity> rows=new HashMap<>();
 private TransportService service;
 @BeforeEach void setup(){
  TransportRepository repository=mock(TransportRepository.class);
  FarmAssetRepository assets=mock(FarmAssetRepository.class);
  when(repository.findById(anyString())).thenAnswer(i->Optional.ofNullable(rows.get(i.getArgument(0))));
  when(repository.save(any())).thenAnswer(i->{TransportStateEntity row=i.getArgument(0);rows.put(row.getFarmId(),row);return row;});
  when(repository.count()).thenAnswer(i->(long)rows.size());
  when(repository.findAll()).thenAnswer(i->new ArrayList<>(rows.values()));
  var fields=List.of("[[-262,310],[60,273],[334,286],[100,320],[100,345],[-96,350],[-226,342]]","[[123,328],[441,290],[994,411],[994,465],[639,537],[123,374]]","[[-220,368],[-104,363],[6,358],[93,356],[111,390],[639,567],[916,519],[1060,620],[288,820],[-27,482]]","[[-266,1020],[573,794],[903,987],[868,1020]]","[[646,768],[1107,644],[1280,720],[968,951]]","[[1032,472],[1168,452],[1497,537],[1302,676],[1002,525]]","[[-756,399],[-314,372],[-189,464],[-756,531]]");
  when(assets.findByFarmIdOrderById(anyString())).thenReturn(fields.stream().map(p->FarmAsset.builder().type("field").polygonJson(p).build()).toList());
  service=new TransportService(repository,assets,json);
 }
 private void persist(TransportService.State s){rows.put(s.farmId,new TransportStateEntity(s.farmId,json.writeValueAsString(s)));}
 private TransportService.State waitingForVehicle(boolean automatic){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg",automatic));
  var t=s.tasks.get(0);t.status="WAIT_LOAD";persist(s);s=service.control("yantian-01",t.id,"LOAD");
  t=s.tasks.get(0);t.waypoint=t.route.size();s.lastTick=System.currentTimeMillis()-500;persist(s);service.tick();return service.state("yantian-01");
 }
 private TransportService.VehicleSignal signal(TransportService.State s,String event){var t=s.tasks.get(0);return new TransportService.VehicleSignal("vehicle_"+event,t.id,t.destination,t.phase,event,java.time.Instant.now().toString());}
 @Test void mapArrivalNeverCompletesTaskOrBooksInventoryWithoutVehicleSignal(){
  var s=waitingForVehicle(true);assertThat(s.tasks.get(0).status).isEqualTo("WAIT_ARRIVAL");
  for(int i=0;i<3;i++){s.lastTick=System.currentTimeMillis()-500;s.tasks.get(0).handoffAfter=0;persist(s);service.tick();s=service.state("yantian-01");}
  assertThat(s.tasks.get(0).status).isEqualTo("WAIT_ARRIVAL");assertThat(s.ledger).noneMatch(e->e.type.equals("INBOUND"));
  String id=s.tasks.get(0).id;assertThatThrownBy(()->service.control("yantian-01",id,"UNLOAD")).isInstanceOf(RuntimeException.class);
 }
 @Test void vehicleCompletionIsPersistedAndDuplicateRetriesCannotDoubleBook(){
  var s=waitingForVehicle(false);var report=signal(s,"COMPLETED");s=service.vehicleSignal("yantian-01","cart-01",report);
  assertThat(s.tasks.get(0).status).isEqualTo("COMPLETED");assertThat(s.tasks.get(0).confirmationSource).isEqualTo("VEHICLE");
  s=service.vehicleSignal("yantian-01","cart-01",report);assertThat(s.tasks.get(0).vehicleReceipts).hasSize(1);
  assertThat(s.ledger.stream().filter(e->e.type.equals("INBOUND")).count()).isEqualTo(1);
  assertThat(s.inventory.stream().filter(i->i.location.equals("warehouse")&&i.goods.equals("肥料")).findFirst().orElseThrow().available).isEqualTo(10);
 }
 @Test void arrivalOnlyWaitsForUnloadAndCannotAutoInventAReceipt(){
  var s=waitingForVehicle(true);s=service.vehicleSignal("yantian-01","cart-01",signal(s,"ARRIVED"));
  assertThat(s.tasks.get(0).status).isEqualTo("WAIT_UNLOAD");s.tasks.get(0).handoffAfter=0;persist(s);service.tick();s=service.state("yantian-01");
  assertThat(s.tasks.get(0).status).isEqualTo("WAIT_UNLOAD");assertThat(s.ledger).noneMatch(e->e.type.equals("INBOUND"));
 }
 @Test void wrongVehicleWrongDestinationAndConflictingReplayAreRejected(){
  var s=waitingForVehicle(false);var report=signal(s,"ARRIVED");
  assertThatThrownBy(()->service.vehicleSignal("yantian-01","other-cart",report)).hasMessageContaining("车辆不匹配");
  var wrong=new TransportService.VehicleSignal("wrong",report.taskId(),"pear1",report.phase(),"COMPLETED",report.occurredAt());
  assertThatThrownBy(()->service.vehicleSignal("yantian-01","cart-01",wrong)).hasMessageContaining("目的地");
  service.vehicleSignal("yantian-01","cart-01",report);
  var conflict=new TransportService.VehicleSignal(report.messageId(),report.taskId(),report.stopId(),report.phase(),"COMPLETED",report.occurredAt());
  assertThatThrownBy(()->service.vehicleSignal("yantian-01","cart-01",conflict)).hasMessageContaining("内容不同");
 }
 @Test void everyTracedRoadAndEveryLoadingDockIsLegal(){
  assertThat(service.roadStatus("yantian-01")).allSatisfy(r->assertThat(r.get("legal")).as(r.get("id").toString()).isEqualTo(true));
  for(String dock:List.of("pear1","pear2","pear3","wheat","jujube","vegetable"))assertThat(service.preview("yantian-01",dock,"warehouse").get("route")).isNotNull();
  assertThat(service.preview("yantian-01","pear1","pear2").get("route").toString()).contains("south-west","pear-road");
  try{java.nio.file.Files.writeString(java.nio.file.Path.of("target/transport-v5-fixture.json"),json.writeValueAsString(Map.of("state",service.state("yantian-01"),"roadStatus",service.roadStatus("yantian-01"))));}catch(java.io.IOException e){throw new RuntimeException(e);}
 }
 @Test void closuresDetourAndFullyIsolatedWarehouseStopsPlanning(){
  service.road("yantian-01","warehouse--supply",true);
  assertThat(service.preview("yantian-01","supply","warehouse").get("route").toString()).contains("courtyard");
  service.road("yantian-01","parking-road--warehouse",true);
  assertThatThrownBy(()->service.preview("yantian-01","supply","warehouse")).hasMessageContaining("无合法路线");
 }
 @Test void mapUpgradePausesLoadedTransportWithoutChangingInventory(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var task=s.tasks.get(0);task.status="WAIT_LOAD";persist(s);s=service.control("yantian-01",task.id,"LOAD");
  s.mapVersion=4;s.vehicle=new TransportService.Point(1350,389);persist(s);
  s=service.state("yantian-01");assertThat(s.mapVersion).isEqualTo(TransportService.MAP_VERSION);assertThat(s.emergency).isTrue();assertThat(s.tasks.get(0).loaded).isTrue();assertThat(s.tasks.get(0).status).isEqualTo("PAUSED");
  assertThat(s.inventory.stream().filter(i->i.goods.equals("肥料")&&i.location.equals("supply")).findFirst().orElseThrow().available).isEqualTo(1990);
  service.control("yantian-01","cart-01","RELEASE_STOP");service.control("yantian-01",task.id,"RESUME");service.tick();
  var after=service.state("yantian-01");assertThat(after.tasks.get(0).route).endsWith("warehouse");
 }
 @Test void automaticHarvestDeliveryUsesRoadsAndBooksInventoryExactlyOnce(){
  var s=service.create("yantian-01",new TransportService.Create("pear2","warehouse","鸭梨",50,"kg",true));
  String id=s.tasks.get(0).id;int ticks=0;
  for(;ticks<1200;ticks++){
   s=service.state("yantian-01");if(s.tasks.get(0).status.equals("WAIT_ARRIVAL"))s=service.simulateArrival("yantian-01",s.tasks.get(0).id);if(s.tasks.get(0).status.equals("COMPLETED"))break;
   s.lastTick=System.currentTimeMillis()-500;s.tasks.get(0).handoffAfter=0;persist(s);service.tick();
   s=service.state("yantian-01");assertThat(s.tasks.get(0).status).as("tick %s %s",ticks,s.tasks.get(0).notice).isNotEqualTo("BLOCKED");
  }
  assertThat(ticks).isLessThan(1200);assertThat(s.tasks.get(0).status).isEqualTo("COMPLETED");
  assertThat(s.inventory.stream().filter(i->i.location.equals("warehouse")&&i.goods.equals("鸭梨")).findFirst().orElseThrow().available).isEqualTo(50);
  assertThat(s.ledger.stream().filter(e->e.taskId.equals(id)&&e.type.equals("INBOUND")).count()).isEqualTo(1);
  assertThatThrownBy(()->service.control("yantian-01",id,"UNLOAD")).hasMessageContaining("尚未到达");
 }
 @Test void obstacleDetectedBeforeEnteringRoadStopsWhenBackupIsAlsoObstructed(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var task=s.tasks.get(0);task.status="WAIT_LOAD";s.vehicle=new TransportService.Point(1024,423);persist(s);
  service.control("yantian-01",task.id,"LOAD");service.obstacle("yantian-01","warehouse--supply",false);
  service.tick();var after=service.state("yantian-01");assertThat(after.tasks.get(0).status).isEqualTo("BLOCKED");assertThat(after.ledger).noneMatch(e->e.type.equals("INBOUND"));
  assertThat(after.vehicle.x).isEqualTo(1024);assertThat(after.vehicle.y).isEqualTo(423);
 }
 @Test void emergencyStopPreventsLoadingAndInventoryDeduction(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var task=s.tasks.get(0);task.status="WAIT_LOAD";persist(s);service.control("yantian-01","cart-01","STOP");
  assertThatThrownBy(()->service.control("yantian-01",task.id,"LOAD")).hasMessageContaining("急停");
  assertThat(service.state("yantian-01").inventory.stream().filter(i->i.goods.equals("肥料")&&i.location.equals("supply")).findFirst().orElseThrow().available).isEqualTo(2000);
 }
 @Test void emptyShowcaseRoundtripUsesApprovedRoadsAndNeverTouchesInventory(){
  var before=service.state("yantian-01");String inventory=json.writeValueAsString(before.inventory);
  var s=service.control("yantian-01","cart-01","DEMO_DRIVE");var t=s.tasks.get(0);
  assertThat(t.route).contains("pear2","warehouse").endsWith("charge");assertThat(t.quantity).isZero();assertThat(s.ledger).isEmpty();
  for(int i=0;i<1000&&!s.tasks.get(0).status.equals("COMPLETED");i++){if(s.tasks.get(0).status.equals("WAIT_ARRIVAL"))s=service.simulateArrival("yantian-01",s.tasks.get(0).id);s.lastTick=System.currentTimeMillis()-500;persist(s);service.tick();s=service.state("yantian-01");assertThat(s.tasks.get(0).status).isNotEqualTo("BLOCKED");}
  assertThat(s.tasks.get(0).status).isEqualTo("COMPLETED");assertThat(json.writeValueAsString(s.inventory)).isEqualTo(inventory);assertThat(s.ledger).isEmpty();
 }
 @Test void obstacleStopsVehicleAndDoesNotInventWarehouseReceipt(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var t=s.tasks.get(0);t.status="WAIT_LOAD";s.vehicle=new TransportService.Point(1024,423);persist(s);s=service.control("yantian-01",t.id,"LOAD");
  service.obstacle("yantian-01","warehouse--supply",false);s=service.state("yantian-01");s.vehicle=new TransportService.Point(1155,430.5);s.heading=Math.atan2(15,262);s.lastTick=System.currentTimeMillis()-500;persist(s);service.tick();
  s=service.state("yantian-01");assertThat(s.tasks.get(0).status).isEqualTo("BLOCKED");assertThat(s.ledger.stream().filter(e->e.type.equals("INBOUND"))).isEmpty();
 }
}
