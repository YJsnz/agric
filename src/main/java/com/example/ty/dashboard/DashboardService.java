package com.example.ty.dashboard;

import com.example.ty.auth.exception.BizException;
import com.example.ty.dashboard.dto.ControlRequest;
import com.example.ty.dashboard.dto.DashboardSnapshot;
import com.example.ty.dashboard.dto.GreenhouseDetail;
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
import java.time.LocalDate;

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

    @Transactional(readOnly = true)
    public GreenhouseDetail greenhouse(String farmId, String greenhouseId) {
        FarmAsset greenhouse = assets.findByFarmIdAndId(farmId, greenhouseId)
                .filter(item -> "greenhouse".equals(item.getType()))
                .orElseThrow(() -> BizException.notFound("大棚不存在"));
        int index = greenhouseIndex(greenhouseId);
        GreenhouseDetail.SceneProfile sceneProfile = greenhouseScene(index);
        List<EnvironmentMetric> readings = metrics.findByFarmIdOrderById(farmId);
        List<GreenhouseDetail.Metric> detailMetrics = readings.stream().map(item -> {
            double value = item.getValue() + switch (item.getMetricKey()) {
                case "temperature" -> (index - 3) * .18;
                case "airHumidity" -> (index % 3 - 1) * 2.0;
                case "soilMoisture" -> greenhouseId.equals("gh-02") ? -7.0 : (index % 2 == 0 ? 2.0 : 0.0);
                case "light" -> index * 7.0;
                case "co2" -> index * 5.0;
                default -> 0.0;
            };
            String note = "soilMoisture".equals(item.getMetricKey()) && value < 40 ? "需要关注" : "适宜";
            String tone = "需要关注".equals(note) ? "warning" : item.getTone();
            return new GreenhouseDetail.Metric(item.getMetricKey(), item.getLabel(), round(value, 1), item.getUnit(), note, tone);
        }).toList();
        List<GreenhouseDetail.Device> greenhouseDevices = greenhouseDevices(greenhouseId, index, sceneProfile);
        int baseHealth = greenhouse.getHealth() == null ? 92 : greenhouse.getHealth();
        int columns = sceneProfile.bedCount();
        int sampleRows = (int) Math.ceil(12.0 / columns);
        double baseHeight = switch (index) { case 1 -> 148; case 2 -> 24; case 3 -> 172; case 4 -> 12; case 5 -> 68; case 6 -> 29; default -> 60; };
        String cultivar = switch (index) { case 1 -> "千禧红"; case 2 -> "红颜"; case 3 -> "津优 35"; case 4 -> "砧木苗"; case 5 -> "普罗旺斯"; case 6 -> "奶油生菜"; default -> greenhouse.getCrop(); };
        List<GreenhouseDetail.Plant> plantRows = java.util.stream.IntStream.range(0, 12).mapToObj(i -> {
            int column = i % columns;
            int row = i / columns;
            double x = columns == 1 ? 0 : -6.2 + column * (12.4 / (columns - 1));
            double z = sampleRows == 1 ? 0 : -4.6 + row * (9.2 / (sampleRows - 1));
            int health = Math.max(70, baseHealth - i % 5);
            return new GreenhouseDetail.Plant("P-" + String.format(Locale.ROOT, "%02d", i + 1),
                    String.valueOf((char) ('A' + Math.min(2, row))), health < 85 ? "attention" : "normal",
                    health, round(baseHeight + (i % 4 - 1.5) * Math.max(1.2, baseHeight * .025), 1),
                    round(44 + (i * 3 + index) % 17, 1), cultivar, 18 + index * 7 + i % 4,
                    round(.8 + index * .22 + i % 3 * .08, 2), round(x, 2), round(z, 2));
        }).toList();
        LocalDate today = LocalDate.now();
        List<GreenhouseDetail.TrendPoint> trend = java.util.stream.IntStream.range(0, 7).mapToObj(i ->
                new GreenhouseDetail.TrendPoint(today.minusDays(6L - i).format(DateTimeFormatter.ofPattern("MM-dd")),
                        round(baseHeight * .88 + i * (baseHeight * .02), 1))).toList();
        List<DashboardSnapshot.Alert> greenhouseAlerts = alerts.findTop20ByFarmIdOrderByOccurredAtDesc(farmId).stream()
                .filter(item -> greenhouseId.equals(item.getEntityId())).map(this::alertDto).toList();
        GreenhouseDetail.Greenhouse summary = new GreenhouseDetail.Greenhouse(greenhouse.getId(), greenhouse.getName(),
                greenhouse.getStatus(), baseHealth, greenhouse.getCrop(), greenhouse.getArea(),
                greenhouse.getGrowthStage(), greenhouse.getEnvironmentSummary());
        String suggestion = greenhouseId.equals("gh-02")
                ? "西侧土壤含水率偏低，建议 16:00 开启滴灌 15 分钟，并复查叶片蒸腾状态。"
                : "棚内环境处于适宜区间，建议维持当前通风与水肥策略，今日傍晚完成一次叶面巡检。";
        List<GreenhouseDetail.Zone> zoneRows = greenhouseZones(index, greenhouse.getCrop(), baseHealth);
        return new GreenhouseDetail(farmId, LocalDateTime.now(), summary, sceneProfile, detailMetrics, greenhouseDevices,
                zoneRows, plantRows, trend, greenhouseAlerts, suggestion);
    }

    private GreenhouseDetail.SceneProfile greenhouseScene(int index) {
        return switch (index) {
            case 1 -> new GreenhouseDetail.SceneProfile("双拱薄膜棚", "高垄土培", "tomato-vine", 4, 8, 640, "压力补偿滴灌");
            case 2 -> new GreenhouseDetail.SceneProfile("连栋保温棚", "高架基质栽培", "strawberry", 4, 8, 1820, "滴箭水肥循环");
            case 3 -> new GreenhouseDetail.SceneProfile("单体拱棚", "吊蔓土培", "cucumber-vine", 4, 8, 720, "膜下滴灌");
            case 4 -> new GreenhouseDetail.SceneProfile("智能育苗棚", "穴盘潮汐育苗", "seedling-tray", 6, 12, 4608, "潮汐苗床");
            case 5 -> new GreenhouseDetail.SceneProfile("生态日光温室", "有机高垄栽培", "bush-tomato", 4, 8, 580, "滴灌与覆草保墒");
            case 6 -> new GreenhouseDetail.SceneProfile("多跨水培棚", "NFT 水培", "leafy-hydroponic", 6, 12, 2160, "营养液闭环循环");
            default -> new GreenhouseDetail.SceneProfile("标准薄膜棚", "土培", "mixed-crop", 4, 8, 600, "滴灌");
        };
    }

    private List<GreenhouseDetail.Device> greenhouseDevices(String greenhouseId, int index, GreenhouseDetail.SceneProfile scene) {
        String irrigationName = switch (index) { case 2 -> "基质回液机组"; case 4 -> "潮汐供液泵"; case 6 -> "营养液循环泵"; default -> "水肥一体机"; };
        String cropDevice = switch (index) { case 1, 3 -> "自动卷膜器"; case 2 -> "除湿热泵"; case 4 -> "育苗补光灯"; case 5 -> "昆虫诱捕监测器"; case 6 -> "溶氧控制器"; default -> "环境控制器"; };
        String cropCategory = switch (index) { case 1, 3 -> "vent"; case 2 -> "dehumidifier"; case 4 -> "grow-light"; case 5 -> "trap"; case 6 -> "oxygenator"; default -> "controller"; };
        return List.of(
                new GreenhouseDetail.Device(greenhouseId + "-fertigation", irrigationName, "fertigation", true, true, "EC 1.32 mS/cm", "西北设备间", scene.irrigationMode(), -7.1, .5, -5.1),
                new GreenhouseDetail.Device(greenhouseId + "-valve", "分区灌溉阀组", "irrigation", true, index % 2 == 1, index % 2 == 1 ? "8.4 m³/h" : "待机", "栽培区入口", "控制 A-C 区供液", -5.8, .35, 5.7),
                new GreenhouseDetail.Device(greenhouseId + "-fan", "环流风机组", "fan", true, true, "自动 42%", "东侧立柱", "均衡冠层温湿度", 7.7, 2.8, 0),
                new GreenhouseDetail.Device(greenhouseId + "-sensor", "冠层传感器", "sensor", true, true, "12 秒前", "棚内中心", "温湿度与 CO₂ 采集", 0, 2.2, 0),
                new GreenhouseDetail.Device(greenhouseId + "-camera", "AI 巡检相机", "camera", true, true, "识别在线", "南侧横梁", "病虫害与长势识别", 0, 3.7, 5.8),
                new GreenhouseDetail.Device(greenhouseId + "-crop", cropDevice, cropCategory, true, index != 3, index == 3 ? "待机" : "策略运行", "北侧控制区", "匹配" + scene.cultivationMode(), 5.9, index == 4 ? 3.2 : 1.0, -5.3)
        );
    }

    private List<GreenhouseDetail.Zone> greenhouseZones(int index, String crop, int health) {
        String[] tasks = switch (index) {
            case 1 -> new String[]{"疏花绑蔓", "坐果巡检", "采前水肥"};
            case 2 -> new String[]{"匍匐茎整理", "授粉检查", "果实转色"};
            case 3 -> new String[]{"落蔓整枝", "雌花计数", "分批采收"};
            case 4 -> new String[]{"出苗统计", "炼苗通风", "移栽筛选"};
            case 5 -> new String[]{"有机覆草", "天敌释放", "果穗巡检"};
            case 6 -> new String[]{"根系检查", "营养液校准", "批次采收"};
            default -> new String[]{"日常巡检", "环境复核", "作业记录"};
        };
        return java.util.stream.IntStream.range(0, 3).mapToObj(i -> new GreenhouseDetail.Zone(
                String.valueOf((char) ('A' + i)), (char) ('A' + i) + " 区", crop, tasks[i],
                Math.max(72, health - i * 2), round(31.8 + i * 1.4, 1))).toList();
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
    private int greenhouseIndex(String id) { try { return Integer.parseInt(id.substring(id.length() - 2)); } catch (Exception ignored) { return 1; } }
    private double round(double value, int places) { double scale = Math.pow(10, places); return Math.round(value * scale) / scale; }
}
