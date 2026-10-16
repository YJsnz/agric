package com.example.ty;
import com.example.ty.dashboard.*;
import com.example.ty.dashboard.entity.FarmAsset;
import com.example.ty.dashboard.repository.FarmAssetRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;
class SceneCalibrationTests {
 @Test void apiSerializedDecimalCoordinatesAreRecalibrated(){
  var repository=mock(FarmAssetRepository.class);when(repository.findByFarmIdAndId(anyString(),anyString())).thenReturn(Optional.empty());
  var zone=FarmAsset.builder().id("yt-vegetable-demo").polygonJson("[[1230.0,630.0],[1330.0,600.0],[1420.0,670.0],[1320.0,705.0]]").mapX(86d).mapY(63d).build();
  when(repository.findByFarmIdAndId("yantian-01","yt-vegetable-demo")).thenReturn(Optional.of(zone));new YantianSceneCalibration(repository).run(null);
  assertThat(zone.getPolygonJson()).isEqualTo("[[-756,399],[-314,372],[-189,464],[-756,531]]");assertThat(zone.getMapX()).isEqualTo(-28.125);assertThat(zone.getMapY()).isEqualTo(43.9453);
 }
 @Test void unrelatedCustomParcelIsNotOverwrittenOnRestart(){
  var repository=mock(FarmAssetRepository.class);when(repository.findByFarmIdAndId(anyString(),anyString())).thenReturn(Optional.empty());
  var zone=FarmAsset.builder().id("yt-pear-01").polygonJson("[[25,250],[100,250],[50,300]]").build();when(repository.findByFarmIdAndId("yantian-01","yt-pear-01")).thenReturn(Optional.of(zone));
  new YantianSceneCalibration(repository).run(null);assertThat(zone.getPolygonJson()).isEqualTo("[[25,250],[100,250],[50,300]]");verify(repository,never()).save(any());
 }
 @Test void previouslyCalibratedGreenhouseMigratesOnceAndRetainsItsIdentity(){
  var repository=mock(FarmAssetRepository.class);when(repository.findByFarmIdAndId(anyString(),anyString())).thenReturn(Optional.empty());
  var zone=FarmAsset.builder().id("yt-pear-02").type("greenhouse").name("番茄大棚").polygonJson("[[250,243],[875,316],[1137,365],[900,401],[506,309]]").build();
  when(repository.findByFarmIdAndId("yantian-01","yt-pear-02")).thenReturn(Optional.of(zone));
  var calibration=new YantianSceneCalibration(repository);calibration.run(null);
  assertThat(zone.getPolygonJson()).isEqualTo("[[123,328],[441,290],[994,411],[994,465],[639,537],[123,374]]");
  assertThat(zone.getId()).isEqualTo("yt-pear-02");assertThat(zone.getType()).isEqualTo("greenhouse");assertThat(zone.getName()).isEqualTo("番茄大棚");
  calibration.run(null);verify(repository,times(1)).save(zone);
 }
}
