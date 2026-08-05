package com.example.ty.dashboard;

import com.example.ty.dashboard.dto.ControlRequest;
import com.example.ty.dashboard.dto.DashboardSnapshot;
import com.example.ty.dashboard.dto.GreenhouseDetail;
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
