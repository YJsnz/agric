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
  var fields=List.of("[[12,245],[182,240],[453,304],[18,359]]","[[250,243],[875,316],[1137,365],[900,401],[506,309]]","[[25,412],[365,355],[494,348],[883,452],[1095,559],[321,738],[184,570]]","[[10,861],[594,732],[955,931],[831,1010],[10,1010]]","[[654,722],[1114,580],[1283,652],[985,870]]","[[993,437],[1250,411],[1480,458],[1332,612],[1161,549]]","[[8,501],[123,635],[8,657]]");
  when(assets.findByFarmIdOrderById(anyString())).thenReturn(fields.stream().map(p->FarmAsset.builder().type("field").polygonJson(p).build()).toList());
  service=new TransportService(repository,assets,json);
 }
 private void persist(TransportService.State s){rows.put(s.farmId,new TransportStateEntity(s.farmId,json.writeValueAsString(s)));}
 @Test void everyTracedRoadAndEveryLoadingDockIsLegal(){
  assertThat(service.roadStatus("yantian-01")).allSatisfy(r->assertThat(r.get("legal")).as(r.get("id").toString()).isEqualTo(true));
  for(String dock:List.of("pear1","pear2","pear3","wheat","jujube","vegetable"))assertThat(service.preview("yantian-01",dock,"warehouse").get("route")).isNotNull();
  assertThat(service.preview("yantian-01","pear1","pear2").get("route").toString()).contains("west-bend");
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
  s=service.state("yantian-01");assertThat(s.mapVersion).isEqualTo(6);assertThat(s.emergency).isTrue();assertThat(s.tasks.get(0).loaded).isTrue();assertThat(s.tasks.get(0).status).isEqualTo("PAUSED");
  assertThat(s.inventory.stream().filter(i->i.goods.equals("肥料")&&i.location.equals("supply")).findFirst().orElseThrow().available).isEqualTo(1990);
  service.control("yantian-01","cart-01","RELEASE_STOP");service.control("yantian-01",task.id,"RESUME");service.tick();
  var after=service.state("yantian-01");assertThat(after.tasks.get(0).route).endsWith("warehouse");
 }
 @Test void automaticHarvestDeliveryUsesRoadsAndBooksInventoryExactlyOnce(){
  var s=service.create("yantian-01",new TransportService.Create("pear2","warehouse","鸭梨",50,"kg",true));
  String id=s.tasks.get(0).id;int ticks=0;
  for(;ticks<1200;ticks++){
   s=service.state("yantian-01");if(s.tasks.get(0).status.equals("COMPLETED"))break;
   s.lastTick=System.currentTimeMillis()-500;s.tasks.get(0).handoffAfter=0;persist(s);service.tick();
   s=service.state("yantian-01");assertThat(s.tasks.get(0).status).as("tick %s %s",ticks,s.tasks.get(0).notice).isNotEqualTo("BLOCKED");
  }
  assertThat(ticks).isLessThan(1200);assertThat(s.tasks.get(0).status).isEqualTo("COMPLETED");
  assertThat(s.inventory.stream().filter(i->i.location.equals("warehouse")&&i.goods.equals("鸭梨")).findFirst().orElseThrow().available).isEqualTo(50);
  assertThat(s.ledger.stream().filter(e->e.taskId.equals(id)&&e.type.equals("INBOUND")).count()).isEqualTo(1);
  assertThatThrownBy(()->service.control("yantian-01",id,"UNLOAD")).hasMessageContaining("尚未到达");
 }
 @Test void obstacleDetectedBeforeEnteringRoadUsesWarehouseBackup(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var task=s.tasks.get(0);task.status="WAIT_LOAD";s.vehicle=new TransportService.Point(1190,384);persist(s);
  service.control("yantian-01",task.id,"LOAD");service.obstacle("yantian-01","warehouse--supply",false);
  service.tick();var after=service.state("yantian-01");assertThat(after.tasks.get(0).route).contains("courtyard");assertThat(after.tasks.get(0).status).isEqualTo("RUNNING");
  assertThat(after.vehicle.x).isEqualTo(1190);assertThat(after.vehicle.y).isEqualTo(384);
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
  for(int i=0;i<1000&&!s.tasks.get(0).status.equals("COMPLETED");i++){s.lastTick=System.currentTimeMillis()-500;persist(s);service.tick();s=service.state("yantian-01");assertThat(s.tasks.get(0).status).isNotEqualTo("BLOCKED");}
  assertThat(s.tasks.get(0).status).isEqualTo("COMPLETED");assertThat(json.writeValueAsString(s.inventory)).isEqualTo(inventory);assertThat(s.ledger).isEmpty();
 }
 @Test void obstacleStopsVehicleAndDoesNotInventWarehouseReceipt(){
  var s=service.create("yantian-01",new TransportService.Create("supply","warehouse","肥料",10,"kg"));
  var t=s.tasks.get(0);t.status="WAIT_LOAD";s.vehicle=new TransportService.Point(1190,384);persist(s);s=service.control("yantian-01",t.id,"LOAD");
  service.obstacle("yantian-01","warehouse--supply",false);s=service.state("yantian-01");s.vehicle=new TransportService.Point(1280,394.29);s.heading=Math.atan2(24,210);s.lastTick=System.currentTimeMillis()-500;persist(s);service.tick();
  s=service.state("yantian-01");assertThat(s.tasks.get(0).status).isEqualTo("BLOCKED");assertThat(s.ledger.stream().filter(e->e.type.equals("INBOUND"))).isEmpty();
 }
}
