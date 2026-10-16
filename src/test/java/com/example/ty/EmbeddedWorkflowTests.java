package com.example.ty;
import com.example.ty.embedded.*;
import com.example.ty.dashboard.DashboardService;
import com.example.ty.dashboard.repository.*;
import com.example.ty.auth.exception.BizException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest @Transactional
class EmbeddedWorkflowTests {
    @Autowired EmbeddedService service;
    @Autowired ObservationRepository observations;
    @Autowired FarmDeviceRepository devices;
    @Autowired DashboardService dashboard;
    @Test void telemetryIsValidatedIdempotentAndPersisted() {
        var sample=new EmbeddedService.Uplink("test-sample",Instant.now(),List.of(new EmbeddedService.Reading("temperature",24.5)));
        long before=observations.count();
        var row=service.ingest("yantian-01","yt-weather",sample);
        assertThat(service.ingest("yantian-01","yt-weather",sample).getId()).isEqualTo(row.getId());
        assertThat(observations.count()).isEqualTo(before+1);
        assertThatThrownBy(()->service.ingest("yantian-01","yt-weather",new EmbeddedService.Uplink("bad",Instant.now(),List.of(new EmbeddedService.Reading("airHumidity",101))))).isInstanceOf(BizException.class);
        assertThatThrownBy(()->service.ingest("farm-01","yt-weather",sample)).isInstanceOf(BizException.class);
    }
    @Test void commandRequiresReceiptBeforeChangingHardwareState() {
        var device=devices.findByFarmIdAndEntityId("yantian-01","yt-valve").orElseThrow();device.setEnabled(false);devices.save(device);
        var command=new EmbeddedService.Command("test-command","SET_ENABLED",1,15);
        var row=service.command("yantian-01","yt-valve",command);
        assertThat(service.command("yantian-01","yt-valve",command).getId()).isEqualTo(row.getId());
        assertThat(device.isEnabled()).isFalse();
        assertThat(service.pending("yantian-01","yt-valve")).extracting(EmbeddedMessage::getId).contains(row.getId());
        assertThat(service.ack("yantian-01","yt-valve",new EmbeddedService.Ack(row.getId(),true,"done")).getStatus()).isEqualTo("ACKED");
        assertThat(device.isEnabled()).isTrue();
        assertThatThrownBy(()->service.ack("yantian-01","yt-water",new EmbeddedService.Ack(row.getId(),true,"forged"))).isInstanceOf(BizException.class);
    }
    @Test void tomatoParcelHasCompleteSelectablePlantRoster() {
        var detail=dashboard.greenhouse("yantian-01","yt-pear-02");
        assertThat(detail.scene().cropModel()).isEqualTo("tomato-vine");
        assertThat(detail.plants()).hasSize(detail.scene().nominalPlantCount());
        assertThat(detail.plants()).extracting(p->p.id()).doesNotHaveDuplicates();
    }
}
