package com.example.ty;

import com.example.ty.dashboard.DashboardService;
import com.example.ty.dashboard.YantianDemoInitializer;
import com.example.ty.dashboard.dto.ControlRequest;
import com.example.ty.auth.exception.BizException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest @Transactional
class YantianProjectTests {
    @Autowired DashboardService dashboard;
    @Autowired YantianDemoInitializer initializer;
    @Autowired com.example.ty.dashboard.repository.ObservationRepository observations;
    @Autowired com.example.ty.dashboard.YantianSceneCalibration calibration;
    @Autowired com.example.ty.dashboard.repository.FarmAssetRepository assets;
    @Test void calibrationIsIdempotentAndPreservesEditedBoundaries() {
        var asset=assets.findById("yt-pear-02").orElseThrow();
        asset.setPolygonJson("[[366,285],[790,293],[1050,398],[638,487]]");assets.save(asset);
        calibration.run(null);
        assertThat(asset.getPolygonJson()).isEqualTo("[[123,328],[441,290],[994,411],[994,465],[639,537],[123,374]]");
        var calibrated=asset.getPolygonJson();calibration.run(null);
        assertThat(asset.getPolygonJson()).isEqualTo(calibrated);
        asset.setPolygonJson("[[10,10],[20,10],[20,20],[10,20]]");assets.save(asset);calibration.run(null);
        assertThat(asset.getPolygonJson()).isEqualTo("[[10,10],[20,10],[20,20],[10,20]]");
    }
    @Test void historyQueryBoundsResultsToLatest240Records() {
        observations.deleteAll();
        var start=java.time.LocalDateTime.now().minusHours(1);
        for(int i=0;i<245;i++) observations.save(com.example.ty.dashboard.entity.Observation.builder()
            .farmId("yantian-01").metricKey("soilMoisture").label("土壤湿度").value(i).unit("%")
            .source("demo_manual").measuredAt(start.plusSeconds(i)).build());
        var points=dashboard.observationHistory("yantian-01","soilMoisture").points();
        assertThat(points).hasSize(240);
        assertThat(points.get(0).value()).isEqualTo(5);
        assertThat(points.get(239).value()).isEqualTo(244);
    }
    @Test void savedObservationsAreChronologicalAndFarmScoped() {
        observations.deleteAll();
        dashboard.simulateSoilMoisture("yantian-01",31);
        dashboard.simulateSoilMoisture("yantian-01",45);
        dashboard.simulateSoilMoisture("farm-01",72);
        var history=dashboard.observationHistory("yantian-01","soilMoisture");
        assertThat(history.points()).extracting(p->p.value()).containsExactly(31.0,45.0);
        assertThat(history.points()).allMatch(p->p.source().equals("demo_manual"));
        assertThat(history.scope()).isEqualTo("farm");
        assertThat(history.virtualData()).isTrue();
        assertThat(dashboard.observationHistory("yantian-01","soilPH").points()).isEmpty();
        assertThatThrownBy(()->dashboard.observationHistory("missing","soilMoisture")).isInstanceOf(BizException.class);
        assertThatThrownBy(()->dashboard.observationHistory("yantian-01","missing")).isInstanceOf(BizException.class);
        dashboard.generateVirtualReadings();
        assertThat(dashboard.observationHistory("yantian-01","soilPH").points()).hasSize(1)
            .allMatch(p->p.source().equals("demo_generator"));
    }
    @Test void projectDemoMatchesCropDirectionWithoutReplacingLegacyFarm() {
        var project=dashboard.snapshot("yantian-01");
        assertThat(project.farmName()).isEqualTo("沧州盐碱地示范基地");
        assertThat(project.virtualData()).isTrue();
        assertThat(project.zones()).hasSize(7);
        assertThat(project.zones()).extracting(z->z.crop()).contains("泊头鸭梨","旱碱麦","金丝小枣");
        assertThat(project.entities()).anyMatch(e->"yt-pear-02".equals(e.id()) && e.type().equals("greenhouse"));
        assertThat(project.entities()).extracting(e->e.name()).contains("鸭梨分选包装中心","冷链暂存仓");
        assertThat(project.environmentMetrics()).extracting(m->m.key()).contains("soilEC","soilPH");
        initializer.run(null);
        assertThat(dashboard.snapshot("yantian-01").entities()).hasSameSizeAs(project.entities());
        assertThat(dashboard.snapshot("farm-01").zones()).hasSize(8);
    }
    @Test void deviceControlAndThresholdAlertsStayWithinTheirDemoFarm() {
        assertThatThrownBy(()->dashboard.controlDevice("farm-01","yt-valve",new ControlRequest(true,null))).isInstanceOf(BizException.class);
        dashboard.simulateSoilMoisture("yantian-01",30);
        assertThat(dashboard.snapshot("yantian-01").alerts()).anyMatch(a->"yt-pear-03".equals(a.entityId()));
        assertThat(dashboard.snapshot("yantian-01").alerts()).noneMatch(a->"field-04".equals(a.entityId()));
    }
}
