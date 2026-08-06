package com.example.ty.dashboard;

import com.example.ty.dashboard.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farms/{farmId}")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService service;

    @GetMapping("/dashboard")
    public DashboardSnapshot dashboard(@PathVariable String farmId) { return service.snapshot(farmId); }

    @GetMapping("/greenhouses/{greenhouseId}")
    public GreenhouseDetail greenhouse(@PathVariable String farmId, @PathVariable String greenhouseId) {
        return service.greenhouse(farmId, greenhouseId);
    }

    @PatchMapping("/devices/{entityId}")
    public DashboardSnapshot.Device controlDevice(@PathVariable String farmId, @PathVariable String entityId, @Valid @RequestBody ControlRequest request) {
        return service.controlDevice(farmId, entityId, request);
    }

    @PostMapping("/devices")
    public DashboardSnapshot.Device createDevice(@PathVariable String farmId, @Valid @RequestBody DeviceUpsertRequest request) {
        return service.createDevice(farmId, request);
    }

    @PutMapping("/devices/{entityId}")
    public DashboardSnapshot.Device updateDevice(@PathVariable String farmId, @PathVariable String entityId,
                                                  @Valid @RequestBody DeviceUpsertRequest request) {
        return service.updateDevice(farmId, entityId, request);
    }

    @DeleteMapping("/devices/{entityId}")
    public void deleteDevice(@PathVariable String farmId, @PathVariable String entityId) { service.deleteDevice(farmId, entityId); }

    @PostMapping("/zones")
    public DashboardSnapshot.Zone createZone(@PathVariable String farmId, @Valid @RequestBody ZoneUpsertRequest request) {
        return service.createZone(farmId, request);
    }

    @PutMapping("/zones/{entityId}")
    public DashboardSnapshot.Zone updateZone(@PathVariable String farmId, @PathVariable String entityId,
                                              @Valid @RequestBody ZoneUpsertRequest request) {
        return service.updateZone(farmId, entityId, request);
    }

    @DeleteMapping("/zones/{entityId}")
    public void deleteZone(@PathVariable String farmId, @PathVariable String entityId) { service.deleteZone(farmId, entityId); }

    @GetMapping("/thresholds")
    public java.util.List<ThresholdResponse> thresholds(@PathVariable String farmId) { return service.thresholds(farmId); }

    @PutMapping("/thresholds/soil-moisture")
    public ThresholdResponse updateSoilThreshold(@PathVariable String farmId, @Valid @RequestBody ThresholdRequest request) {
        return service.updateSoilThreshold(farmId, request);
    }

    @PostMapping("/simulation/soil-moisture")
    public DashboardSnapshot.Metric simulateSoilMoisture(@PathVariable String farmId,
                                                          @Valid @RequestBody MetricSimulationRequest request) {
        return service.simulateSoilMoisture(farmId, request.value());
    }

    @PatchMapping("/irrigation/{unitId}")
    public DashboardSnapshot.Irrigation controlIrrigation(@PathVariable String farmId, @PathVariable String unitId, @Valid @RequestBody ControlRequest request) {
        return service.controlIrrigation(farmId, unitId, request);
    }

    @PostMapping("/devices/{entityId}/self-test")
    public DashboardSnapshot.Device selfTest(@PathVariable String farmId, @PathVariable String entityId) {
        return service.selfTestDevice(farmId, entityId);
    }

    @PatchMapping("/alerts/{alertId}/handle")
    public DashboardSnapshot.Alert handleAlert(@PathVariable String farmId, @PathVariable Long alertId) {
        return service.handleAlert(farmId, alertId);
    }
}
