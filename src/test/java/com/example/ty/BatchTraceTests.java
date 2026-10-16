package com.example.ty;
import com.example.ty.operations.*;
import com.example.ty.dashboard.entity.FarmAsset;
import com.example.ty.dashboard.repository.FarmAssetRepository;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import java.util.*;
import java.time.LocalDateTime;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

class BatchTraceTests {
 @Test void signedCodeSelectsExactBatchAndExposesOnlyItsCollectionInformation(){
  var records=mock(OperationRepository.class);var assets=mock(FarmAssetRepository.class);
  var row=OperationRecord.builder().id(70L).farmId("yantian-01").entityId("yt-pear-02").kind("BATCH").title("番茄首批采收").stage("HARVESTED").createdAt(LocalDateTime.of(2026,10,16,9,30)).detail("{\"crop\":\"番茄\",\"harvestLocation\":\"番茄大棚东区\",\"harvestAt\":\"2026-10-16T01:00:00Z\",\"note\":\"内部备注不公开\"}").build();
  when(records.findById(70L)).thenReturn(Optional.of(row));when(assets.findByFarmIdAndId(anyString(),anyString())).thenReturn(Optional.empty());when(records.findByFarmIdAndParentIdOrderByCreatedAtAscIdAsc(anyString(),anyLong())).thenReturn(List.of());
  var controller=new BatchTraceController(records,assets,new ObjectMapper(),"test-secret-not-for-production-123456");
  var key=controller.share("yantian-01",70).get("key");var result=controller.trace("yantian-01",70,key);
  assertThat(result.crop()).isEqualTo("番茄");assertThat(result.location()).isEqualTo("番茄大棚东区");assertThat(result.collectedAt()).isEqualTo("2026-10-16T01:00:00Z");
  assertThatThrownBy(()->controller.trace("another-farm",70,key)).hasMessageContaining("追溯码无效");
  assertThatThrownBy(()->controller.trace("yantian-01",71,key)).hasMessageContaining("追溯码无效");
  assertThatThrownBy(()->controller.trace("yantian-01",70,"invalid")).hasMessageContaining("追溯码无效");
 }
 @Test void historicalDateIsNotReplacedWithRecordCreationTime(){
  var records=mock(OperationRepository.class);var assets=mock(FarmAssetRepository.class);
  var row=OperationRecord.builder().id(1L).farmId("farm").entityId("plot").kind("BATCH").detail("{\"harvestDate\":\"2026-10-12\"}").createdAt(LocalDateTime.now()).build();
  when(records.findById(1L)).thenReturn(Optional.of(row));when(assets.findByFarmIdAndId("farm","plot")).thenReturn(Optional.of(FarmAsset.builder().name("鸭梨一号园").crop("泊头鸭梨").build()));when(records.findByFarmIdAndParentIdOrderByCreatedAtAscIdAsc(anyString(),anyLong())).thenReturn(List.of());
  var controller=new BatchTraceController(records,assets,new ObjectMapper(),"test-secret-not-for-production-123456");var result=controller.trace("farm",1,controller.share("farm",1).get("key"));
  assertThat(result.collectedAt()).isEmpty();assertThat(result.collectionDate()).isEqualTo("2026-10-12");assertThat(result.location()).isEqualTo("鸭梨一号园");
 }
}
