package com.example.ty.dashboard;

import com.example.ty.dashboard.entity.*;
import com.example.ty.dashboard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DashboardDataInitializer implements ApplicationRunner {
    public static final String FARM_ID = "farm-01";
    private final FarmAssetRepository assets;
    private final FarmDeviceRepository devices;
    private final EnvironmentMetricRepository metrics;
    private final IrrigationUnitRepository irrigation;
    private final FarmAlertRepository alerts;
    private final MetricThresholdRepository thresholds;

    @Override @Transactional
    public void run(ApplicationArguments args) {
        if (assets.count() == 0) seedAssets();
        if (devices.count() == 0) seedDevices();
        if (metrics.count() == 0) seedMetrics();
        if (irrigation.count() == 0) seedIrrigation();
        if (alerts.count() == 0) seedAlerts();
        ensureDemoAlerts();
        if (thresholds.count() == 0) thresholds.save(MetricThreshold.builder().farmId(FARM_ID).metricKey("soilMoisture")
                .label("土壤湿度下限").minimumValue(40).enabled(true).updatedAt(LocalDateTime.now()).build());
    }

    private void seedAssets() {
        assets.saveAll(List.of(
            asset("gh-01","1号番茄温室","greenhouse","normal","健康度 96",25,52,96,-16,0,3,"zone-gh-01","[[238,483],[302,458],[492,522],[503,579],[468,611],[416,620],[238,549]]","樱桃番茄","1,200 ㎡","开花坐果期","26.5°C · 62%"),
            asset("gh-02","2号草莓温室","greenhouse","attention","湿度 42%",32,48,86,-8,0,1,"zone-gh-02","[[350,447],[410,429],[624,478],[634,526],[596,553],[557,563],[350,507]]","红颜草莓","980 ㎡","膨果期","25.8°C · 67%"),
            asset("gh-03","3号黄瓜温室","greenhouse","normal","健康度 92",39,44,92,0,0,-2,"zone-gh-03","[[471,412],[521,395],[715,438],[725,478],[694,506],[660,516],[470,462]]","水果黄瓜","1,080 ㎡","采收期","27.1°C · 59%"),
            asset("gh-04","4号育苗温室","greenhouse","normal","健康度 94",47,41,94,8,0,-5,"zone-gh-04","[[594,385],[649,369],[826,409],[838,446],[810,472],[780,480],[594,428]]","蔬菜育苗","760 ㎡","幼苗期","25.2°C · 70%"),
            asset("gh-05","5号生态温室","greenhouse","normal","健康度 91",58,54,91,7,0,4,"zone-gh-05","[[722,509],[788,483],[991,522],[1009,558],[991,593],[920,620],[721,561]]","生态番茄","1,160 ㎡","营养生长期","26.8°C · 61%"),
            asset("gh-06","6号叶菜温室","greenhouse","normal","健康度 90",54,40,90,16,0,-8,"zone-gh-06","[[698,359],[759,341],[965,388],[981,423],[959,457],[926,470],[697,412]]","水培叶菜","1,050 ㎡","快速生长期","25.9°C · 66%"),
            asset("field-04","4号生菜种植区","field","warning","土壤湿度 32%",43,62,74,4,0,12,"zone-field-04","[[468,580],[707,535],[866,614],[816,657],[665,707],[457,651]]","奶油生菜","2.6 亩","生长期","土壤湿度 32%"),
            asset("field-05","5号露天种植区","field","normal","长势良好",73,60,93,19,0,8,"zone-field-05","[[1000,570],[1273,514],[1339,650],[1212,690],[1071,726],[948,662]]","露天甘蓝","3.1 亩","莲座期","土壤湿度 48%"),
            asset("weather-01","气象站01","station","normal","28.3°C · 2.1m/s",13,40,null,-28,0,-7,null,null,null,null,null,null),
            asset("water-01","蓄水池01","water","normal","水位 82%",17,70,null,-20,0,18,null,null,null,null,null,null),
            asset("fertilizer-01","水肥一体机01","device","normal","EC 1.32mS/cm",67,44,null,15,0,-2,null,null,null,null,null,null),
            asset("pump-02","增压泵站02","device","offline","通信中断 · 6分钟",53,73,null,2,0,9,null,null,null,null,null,null),
            asset("valve-02","灌溉阀门组02","device","normal","流量 12.6m³/h",36,79,null,-10,0,20,null,null,null,null,null,null),
            asset("camera-03","摄像头03","camera","normal","AI 识别在线",69,77,null,15,0,18,null,null,null,null,null,null),
            asset("robot-01","农业机器人01","robot","normal","巡检中 · 82%",60,73,null,24,0,12,null,null,null,null,null,null)
        ));
    }

    private FarmAsset asset(String id,String name,String type,String status,String metric,double x,double y,Integer health,
                            double px,double py,double pz,String zoneId,String polygon,String crop,String area,String stage,String env) {
        return FarmAsset.builder().id(id).farmId(FARM_ID).name(name).type(type).status(status).metric(metric).mapX(x).mapY(y)
                .health(health).positionX(px).positionY(py).positionZ(pz).zoneId(zoneId).polygonJson(polygon).crop(crop)
                .area(area).growthStage(stage).environmentSummary(env).build();
    }

    private void seedDevices() {
        LocalDateTime now = LocalDateTime.now();
        devices.saveAll(List.of(
            device("dev-weather","weather-01","田间气象站 01","sensor","西侧露天区",true,true,"28.3°C · 2.1m/s",now),
            device("dev-camera","camera-03","AI 摄像头 03","camera","东南巡检区",true,true,"1080P · AI 在线",now.minusSeconds(3)),
            device("dev-fertilizer","fertilizer-01","水肥一体机 01","actuator","温室设备区",true,true,"EC 1.32mS/cm",now.minusSeconds(12)),
            device("dev-pump","pump-02","增压泵站 02","actuator","南侧灌溉区",false,false,"通信中断",now.minusMinutes(6)),
            device("dev-valve","valve-02","电磁阀门组 02","actuator","南侧主管网",true,false,"关闭 · 0m³/h",now.minusSeconds(8)),
            device("dev-robot","robot-01","农业巡检机器人 01","robot","5号露天种植区",true,true,"巡检中 · 电量82%",now)
        ));
    }
    private FarmDevice device(String id,String entityId,String name,String category,String location,boolean online,boolean enabled,String value,LocalDateTime seen) {
        return FarmDevice.builder().id(id).farmId(FARM_ID).entityId(entityId).name(name).category(category).location(location).online(online).enabled(enabled).currentValue(value).lastSeenAt(seen).build();
    }
    private void seedMetrics() {
        LocalDateTime now=LocalDateTime.now();
        metrics.saveAll(List.of(metric("temperature","空气温度",28.3,"°C",28.1,"info",now),metric("airHumidity","空气湿度",56,"%",57,"info",now),metric("soilMoisture","土壤湿度",42,"%",46.8,"warning",now),metric("light","光照强度",680,"lx",648,"info",now),metric("co2","CO₂",580,"ppm",576,"success",now)));
    }
    private EnvironmentMetric metric(String key,String label,double value,String unit,double previous,String tone,LocalDateTime at) { return EnvironmentMetric.builder().farmId(FARM_ID).metricKey(key).label(label).value(value).unit(unit).previousValue(previous).tone(tone).measuredAt(at).build(); }
    private void seedIrrigation() {
        LocalDateTime now=LocalDateTime.now();
        irrigation.saveAll(List.of(unit("water-source","water-01","蓄水池总控","全场供水","source",20,69,true,0,18,now),unit("fertigation","fertilizer-01","水肥一体机","温室主管网","fertigation",61,48,true,12.6,18,now),unit("valve-south","valve-02","南区阀门组","4号生菜种植区","valve",35,78,false,0,18,now),unit("zone-field-04","field-04","4号区灌溉单元","奶油生菜 · 2.6亩","zone",43,62,false,0,18,now),unit("zone-field-05","field-05","5号区灌溉单元","露天甘蓝 · 3.1亩","zone",73,59,true,8.4,20,now)));
    }
    private IrrigationUnitEntity unit(String id,String entityId,String name,String target,String kind,double x,double y,boolean enabled,double flow,int duration,LocalDateTime at) { return IrrigationUnitEntity.builder().id(id).farmId(FARM_ID).entityId(entityId).name(name).targetName(target).kind(kind).mapX(x).mapY(y).enabled(enabled).flowRate(flow).durationMinutes(duration).updatedAt(at).build(); }
    private void seedAlerts() {
        LocalDateTime now=LocalDateTime.now();
        alerts.saveAll(List.of(FarmAlert.builder().farmId(FARM_ID).entityId("field-04").title("4号生菜区土壤湿度偏低").level("预警").status("未处理").occurredAt(now.minusMinutes(2)).build(),FarmAlert.builder().farmId(FARM_ID).entityId("gh-02").title("2号温室西侧叶片轻度萎蔫").level("关注").status("处理中").occurredAt(now.minusMinutes(37)).build(),FarmAlert.builder().farmId(FARM_ID).entityId("fertilizer-01").title("水肥一体机 EC 短时偏高").level("提醒").status("已恢复").occurredAt(now.minusHours(2)).build()));
    }

    private void ensureDemoAlerts() {
        addDemoAlertIfMissing("field-05", "5号露天种植区土壤湿度低于 35%", "预警", LocalDateTime.now().minusMinutes(8));
        addDemoAlertIfMissing("gh-02", "2号草莓温室空气温度超过 32°C", "预警", LocalDateTime.now().minusMinutes(15));
    }

    private void addDemoAlertIfMissing(String entityId, String title, String level, LocalDateTime occurredAt) {
        if (alerts.existsByFarmIdAndTitle(FARM_ID, title)) return;
        alerts.save(FarmAlert.builder().farmId(FARM_ID).entityId(entityId).title(title).level(level)
                .status("未处理").occurredAt(occurredAt).build());
    }
}
