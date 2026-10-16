package com.example.ty.dashboard;

import com.example.ty.dashboard.entity.*;
import com.example.ty.dashboard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.annotation.Order;
import java.time.LocalDateTime;
import java.util.*;

/** Separate project demo; never replaces the original farm or user-edited records. */
@Component @Order(200) @RequiredArgsConstructor
public class YantianDemoInitializer implements ApplicationRunner {
    public static final String FARM_ID="yantian-01";
    private final FarmAssetRepository assets;
    private final FarmDeviceRepository devices;
    private final EnvironmentMetricRepository metrics;
    private final IrrigationUnitRepository irrigation;
    private final FarmAlertRepository alerts;
    private final MetricThresholdRepository thresholds;
    @Override @Transactional public void run(ApplicationArguments args) {
        if(!assets.findByFarmIdOrderById(FARM_ID).isEmpty()) {
            assets.findByFarmIdAndId(FARM_ID,"yt-pear-02").filter(a -> ("鸭梨二号园".equals(a.getName()) || "番茄大棚".equals(a.getName()))).ifPresent(a -> {
                a.setName("番茄大棚"); a.setCrop("番茄"); a.setMetric("番茄 · 演示档案"); a.setType("greenhouse"); a.setGrowthStage("结果期 · 演示"); assets.save(a);
            });
            return;
        }
        var now=LocalDateTime.now();
        assets.saveAll(List.of(
            plot("yt-pear-01","鸭梨一号园","泊头鸭梨",24,38,-16,-8,"待采收 · 演示","12 亩","[[20,257],[319,228],[571,310],[224,400]]"),
            plot("yt-pear-02","番茄大棚","番茄",45,43,0,-8,"待采收 · 演示","10 亩","[[366,285],[790,293],[1050,398],[638,487]]"),
            plot("yt-pear-03","鸭梨观测示范园","泊头鸭梨",34,60,-16,9,"墒情观测 · 演示","8 亩","[[65,404],[636,402],[981,561],[330,780]]"),
            plot("yt-wheat-01","旱碱麦示范田","旱碱麦",32,83,-16,25,"轮作展示 · 演示","16 亩","[[18,836],[626,743],[1150,1020],[0,1020]]"),
            plot("yt-wheat-02","旱碱麦对照田","旱碱麦",67,68,2,25,"轮作展示 · 演示","12 亩","[[669,689],[1220,543],[1372,707],[1071,908]]"),
            plot("yt-jujube-01","金丝小枣示范区","金丝小枣",79,48,18,9,"采后管理 · 演示","6 亩","[[1034,407],[1355,395],[1490,473],[1302,634]]"),
            facility("yt-sorting","鸭梨分选包装中心","device",76,30,18,-12,"采后流程待登记"),
            facility("yt-coldstore","冷链暂存仓","device",94,33,29,-12,"批次追溯待接入"),
            facility("yt-weather","田间气象观测站","station",55,23,0,-25,"气象观测 · 演示"),
            facility("yt-soil","土壤采样服务站","station",61,29,-12,-25,"EC / pH · 演示观测"),
            facility("yt-water","排盐沟渠泵站","water",91,85,29,25,"排水通道 · 演示"),
            facility("yt-valve","果园滴灌阀组","device",22,70,-27,9,"灌溉回执 · 模拟"),
            facility("yt-camera","果园影像采集点","camera",47,56,4,9,"鸭梨视觉模型未接入")
        ));
        metrics.saveAll(List.of(metric("temperature","空气温度",23.6,"°C",now),metric("airHumidity","空气湿度",58,"%",now),metric("soilMoisture","土壤湿度",38,"%",now),metric("soilEC","土壤 EC（演示）",1.8,"mS/cm",now),metric("soilPH","土壤 pH（演示）",8.1,"",now),metric("light","光照强度",720,"lx",now)));
        thresholds.save(MetricThreshold.builder().farmId(FARM_ID).metricKey("soilMoisture").label("演示墒情下限（非农艺标准）").minimumValue(40).enabled(true).updatedAt(now).build());
        for(var row:List.of(new String[]{"yt-weather","田间气象观测站","sensor","鸭梨园北侧"},new String[]{"yt-soil","土壤采样服务站","sensor","果园观测点"},new String[]{"yt-valve","果园滴灌阀组","actuator","鸭梨观测示范园"},new String[]{"yt-water","排盐沟渠泵站","actuator","东侧排水渠"},new String[]{"yt-camera","果园影像采集点","camera","番茄大棚"}))devices.save(FarmDevice.builder().id("dev-"+row[0]).farmId(FARM_ID).entityId(row[0]).name(row[1]).category(row[2]).location(row[3]).online(true).enabled(false).currentValue("演示设备 · 未接真实硬件").lastSeenAt(now).build());
        for(var row:List.of(new String[]{"yt-pear-03","鸭梨观测示范园","34","60"},new String[]{"yt-wheat-01","旱碱麦示范田","32","83"}))irrigation.save(IrrigationUnitEntity.builder().id("irrigation-"+row[0]).farmId(FARM_ID).entityId(row[0]).name(row[1]+"灌溉单元").targetName(row[1]).kind("zone").mapX(Double.parseDouble(row[2])).mapY(Double.parseDouble(row[3])).enabled(false).flowRate(0).durationMinutes(15).updatedAt(now).build());
        alerts.save(FarmAlert.builder().farmId(FARM_ID).entityId("yt-pear-03").title("鸭梨观测示范园：土壤湿度低于演示配置下限").level("预警").status("未处理").occurredAt(now).build());
        alerts.save(FarmAlert.builder().farmId(FARM_ID).entityId("yt-camera").title("鸭梨影像未完成诊断，需补充视觉证据").level("关注").status("未处理").occurredAt(now.minusMinutes(10)).build());
    }
    private FarmAsset plot(String id,String name,String crop,double x,double y,double px,double pz,String stage,String area,String polygon) {
        return FarmAsset.builder().id(id).farmId(FARM_ID).name(name).type(id.equals("yt-pear-02") ? "greenhouse" : "field").status("normal").metric(crop+" · 演示档案").mapX(x).mapY(y).positionX(px).positionY(0d).positionZ(pz).zoneId("zone-"+id).polygonJson(polygon).crop(crop).area(area).growthStage(stage).environmentSummary("演示场景，专项评估需真实观测").build();
    }
    private FarmAsset facility(String id,String name,String type,double x,double y,double px,double pz,String metric) { return FarmAsset.builder().id(id).farmId(FARM_ID).name(name).type(type).status("normal").metric(metric).mapX(x).mapY(y).positionX(px).positionY(0d).positionZ(pz).build(); }
    private EnvironmentMetric metric(String key,String label,double value,String unit,LocalDateTime at) {return EnvironmentMetric.builder().farmId(FARM_ID).metricKey(key).label(label).value(value).previousValue(value).unit(unit).tone("info").measuredAt(at).build();}
}
