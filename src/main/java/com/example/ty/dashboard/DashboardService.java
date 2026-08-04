package com.example.ty.dashboard;

import com.example.ty.auth.exception.BizException;
import com.example.ty.dashboard.dto.ControlRequest;
import com.example.ty.dashboard.dto.DashboardSnapshot;
import com.example.ty.dashboard.entity.*;
import com.example.ty.dashboard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final FarmAssetRepository assets;
    private final FarmDeviceRepository devices;
    private final EnvironmentMetricRepository metrics;
    private final IrrigationUnitRepository irrigation;
    private final FarmAlertRepository alerts;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public DashboardSnapshot snapshot(String farmId) {
        List<FarmAsset> assetRows = assets.findByFarmIdOrderById(farmId);
        if (assetRows.isEmpty()) throw BizException.notFound("农场不存在");
        List<FarmDevice> deviceRows = devices.findByFarmIdOrderById(farmId);
        List<IrrigationUnitEntity> irrigationRows = irrigation.findByFarmIdOrderById(farmId);
        List<FarmAlert> alertRows = alerts.findTop20ByFarmIdOrderByOccurredAtDesc(farmId);
        Set<String> activeAlertEntityIds = alertRows.stream()
                .filter(item -> !"已恢复".equals(item.getStatus()) && !"已处理".equals(item.getStatus()))
                .map(FarmAlert::getEntityId).filter(java.util.Objects::nonNull).collect(Collectors.toSet());
        int online = (int) deviceRows.stream().filter(FarmDevice::isOnline).count();
        int running = (int) deviceRows.stream().filter(item -> item.isOnline() && item.isEnabled()).count();
        int openAlerts = (int) alertRows.stream().filter(item -> !"已恢复".equals(item.getStatus()) && !"已处理".equals(item.getStatus())).count();
        int health = (int) Math.round(assetRows.stream().filter(item -> item.getHealth() != null).mapToInt(FarmAsset::getHealth).average().orElse(92));

        return new DashboardSnapshot(farmId, "智慧农场01", LocalDateTime.now(), true,
                new DashboardSnapshot.Summary(health, deviceRows.size(), online, running, openAlerts, 82, 38.2),
                assetRows.stream().map(item -> assetDto(item, activeAlertEntityIds)).toList(),
                assetRows.stream().filter(item -> item.getZoneId() != null).map(this::zoneDto).toList(),
                metrics.findByFarmIdOrderById(farmId).stream().map(this::metricDto).toList(),
                deviceRows.stream().map(this::deviceDto).toList(),
                irrigationRows.stream().map(this::irrigationDto).toList(),
                alertRows.stream().map(this::alertDto).toList());
    }

    @Transactional
    public DashboardSnapshot.Device controlDevice(String farmId, String entityId, ControlRequest request) {
        FarmDevice device = devices.findByFarmIdAndEntityId(farmId, entityId).orElseThrow(() -> BizException.notFound("设备不存在"));
        if (!device.isOnline() && request.enabled()) throw BizException.badRequest("离线设备无法开启");
        device.setEnabled(request.enabled());
        device.setLastSeenAt(LocalDateTime.now());
        if ("valve-02".equals(entityId)) device.setCurrentValue(request.enabled() ? "开启 · 12.6m³/h" : "关闭 · 0m³/h");
        return deviceDto(devices.save(device));
    }

    @Transactional
    public DashboardSnapshot.Irrigation controlIrrigation(String farmId, String unitId, ControlRequest request) {
        IrrigationUnitEntity unit = irrigation.findByFarmIdAndId(farmId, unitId).orElseThrow(() -> BizException.notFound("灌溉单元不存在"));
        unit.setEnabled(request.enabled());
        if (request.durationMinutes() != null) unit.setDurationMinutes(request.durationMinutes());
        unit.setFlowRate(request.enabled() ? defaultFlow(unit.getKind()) : 0);
        unit.setUpdatedAt(LocalDateTime.now());
        return irrigationDto(irrigation.save(unit));
    }

    @Transactional
    public DashboardSnapshot.Device selfTestDevice(String farmId, String entityId) {
        FarmDevice device = devices.findByFarmIdAndEntityId(farmId, entityId)
                .orElseThrow(() -> BizException.notFound("设备不存在"));
        if (!device.isOnline()) throw BizException.badRequest("离线设备无法执行自检");
        device.setLastSeenAt(LocalDateTime.now());
        return deviceDto(devices.save(device));
    }

    @Transactional
    public DashboardSnapshot.Alert handleAlert(String farmId, Long alertId) {
        FarmAlert alert = alerts.findById(alertId).filter(item -> farmId.equals(item.getFarmId()))
                .orElseThrow(() -> BizException.notFound("告警不存在"));
        alert.setStatus("已处理");
        FarmAlert saved = alerts.save(alert);
        boolean hasActiveAlert = alerts.findTop20ByFarmIdOrderByOccurredAtDesc(farmId).stream()
                .anyMatch(item -> !item.getId().equals(alertId)
                        && java.util.Objects.equals(item.getEntityId(), alert.getEntityId())
                        && !"已处理".equals(item.getStatus()) && !"已恢复".equals(item.getStatus()));
        if (!hasActiveAlert && alert.getEntityId() != null) {
            assets.findById(alert.getEntityId()).filter(item -> farmId.equals(item.getFarmId())).ifPresent(item -> {
                item.setStatus("normal");
                if (item.getHealth() != null && item.getHealth() < 85) item.setHealth(90);
                assets.save(item);
            });
        }
        return alertDto(saved);
    }

    @Scheduled(initialDelay = 15_000, fixedDelay = 30_000)
    @Transactional
    public void generateVirtualReadings() {
        LocalDateTime now = LocalDateTime.now();
        for (EnvironmentMetric metric : metrics.findByFarmIdOrderById(DashboardDataInitializer.FARM_ID)) {
            metric.setPreviousValue(metric.getValue());
            double drift = switch (metric.getMetricKey()) {
                case "temperature" -> random(-0.18, 0.18);
                case "airHumidity", "soilMoisture" -> random(-0.45, 0.45);
                case "light" -> random(-12, 12);
                case "co2" -> random(-8, 8);
                default -> 0;
            };
            metric.setValue(clamp(metric.getMetricKey(), metric.getValue() + drift));
            metric.setMeasuredAt(now);
        }
        for (FarmDevice device : devices.findByFarmIdOrderById(DashboardDataInitializer.FARM_ID)) {
            if (device.isOnline()) device.setLastSeenAt(now.minusSeconds(ThreadLocalRandom.current().nextInt(0, 13)));
        }
    }

    private DashboardSnapshot.Asset assetDto(FarmAsset item, Set<String> activeAlertEntityIds) {
        String status = item.getStatus();
        if (("warning".equals(status) || "attention".equals(status) || "danger".equals(status))
                && !activeAlertEntityIds.contains(item.getId())) status = "normal";
        return new DashboardSnapshot.Asset(item.getId(),item.getName(),item.getType(),status,item.getMetric(),item.getMapX(),item.getMapY(),item.getHealth(),new DashboardSnapshot.Position(item.getPositionX(),item.getPositionY(),item.getPositionZ()));
    }
    private DashboardSnapshot.Zone zoneDto(FarmAsset item) {
        try { return new DashboardSnapshot.Zone(item.getZoneId(),item.getId(),objectMapper.readValue(item.getPolygonJson(),new TypeReference<List<List<Double>>>(){}),item.getCrop(),item.getArea(),item.getGrowthStage(),item.getEnvironmentSummary()); }
        catch (Exception e) { throw BizException.internalError("地块坐标数据损坏"); }
    }
    private DashboardSnapshot.Metric metricDto(EnvironmentMetric item) {
        double delta=item.getValue()-item.getPreviousValue();
        String value=format(item.getValue(),item.getMetricKey())+item.getUnit();
        String deltaText=Math.abs(delta)<0.05?"稳定":String.format(Locale.ROOT,"%+.1f%s",delta,item.getUnit());
        return new DashboardSnapshot.Metric(item.getMetricKey(),item.getLabel(),value,deltaText,item.getTone(),item.getValue(),item.getUnit(),item.getMeasuredAt());
    }
    private DashboardSnapshot.Device deviceDto(FarmDevice item) { return new DashboardSnapshot.Device(item.getId(),item.getEntityId(),item.getName(),item.getCategory(),item.getLocation(),item.isOnline(),item.isEnabled(),item.getCurrentValue(),lastSeen(item.getLastSeenAt())); }
    private DashboardSnapshot.Irrigation irrigationDto(IrrigationUnitEntity item) { String flow="source".equals(item.getKind())?"水位 82%":String.format(Locale.ROOT,"%.1fm³/h",item.getFlowRate()); return new DashboardSnapshot.Irrigation(item.getId(),item.getEntityId(),item.getName(),item.getTargetName(),item.getKind(),item.getMapX(),item.getMapY(),item.isEnabled(),flow,item.getDurationMinutes()); }
    private DashboardSnapshot.Alert alertDto(FarmAlert item) { return new DashboardSnapshot.Alert(item.getId(),item.getEntityId(),item.getOccurredAt().format(DateTimeFormatter.ofPattern("HH:mm")),item.getTitle(),item.getLevel(),item.getStatus()); }
    private String lastSeen(LocalDateTime at) { long seconds=Math.max(0,Duration.between(at,LocalDateTime.now()).getSeconds()); if(seconds<5)return "刚刚"; if(seconds<60)return seconds+" 秒前"; return seconds/60+" 分钟前"; }
    private String format(double value,String key) { return ("temperature".equals(key)||"co2".equals(key)||"light".equals(key))?String.format(Locale.ROOT,"%.1f",value):String.format(Locale.ROOT,"%.0f",value); }
    private double defaultFlow(String kind) { return switch(kind){case "fertigation"->12.6;case "valve"->10.2;case "zone"->8.4;default->0;}; }
    private double random(double min,double max){return ThreadLocalRandom.current().nextDouble(min,max);}
    private double clamp(String key,double value){return switch(key){case "temperature"->Math.max(20,Math.min(34,value));case "airHumidity"->Math.max(35,Math.min(85,value));case "soilMoisture"->Math.max(25,Math.min(75,value));case "light"->Math.max(0,Math.min(1200,value));case "co2"->Math.max(350,Math.min(1000,value));default->value;};}
}
