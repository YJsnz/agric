package com.example.ty.dashboard;

import com.example.ty.dashboard.repository.FarmAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/** Recalibrate known demo revisions against the expanded panorama; preserve custom boundaries.
 * Scene coordinates: u = previewX * 1.5 - 768, v = previewY * 1.5 (2048px preview).
 * The same polygons drive aerial hit testing, the digital twin and transport exclusion zones. */
@Component @Order(210) @RequiredArgsConstructor
public class YantianSceneCalibration implements ApplicationRunner {
    private final FarmAssetRepository assets;
    private record Boundary(String id,String oldPolygon,String polygon,double x,double y) {}
    private static final java.util.Set<String> PREVIOUS=java.util.Set.of("[[25,412],[365,355],[494,348],[883,452],[1104,535],[321,738],[184,570]]","[[12,242],[190,229],[482,304],[18,365]]","[[224,237],[887,310],[1167,374],[858,418],[509,332]]","[[22,406],[370,357],[1100,544],[313,732],[173,568]]","[[8,851],[602,716],[970,920],[841,1020],[8,1020]]","[[642,710],[1118,567],[1304,652],[989,883]]","[[1010,435],[1273,404],[1498,452],[1338,597],[1160,552]]","[[1230,630],[1330,600],[1420,670],[1320,705]]");
    private static final java.util.Set<String> PANORAMA_PREDECESSORS=java.util.Set.of("[[-220,368],[-104,363],[6,358],[93,356],[129,417],[624,567],[916,519],[1060,620],[288,820],[-27,482]]","[[-201,386],[104,396],[624,567],[916,519],[1060,620],[288,820],[-27,482]]","[[-262,310],[60,273],[334,286],[100,320],[100,345],[-96,350]]","[[-262,310],[60,273],[334,286],[100,320],[100,354],[-96,358]]","[[-201,375],[104,387],[624,556],[916,510],[1060,620],[288,820],[-27,482]]","[[-201,386],[104,396],[624,556],[916,510],[1060,620],[288,820],[-27,482]]","[[1016,465],[1168,452],[1497,537],[1302,676],[952,525]]","[[1032,472],[1168,452],[1497,537],[1302,676],[972,532]]","[[12,245],[182,240],[453,304],[18,359]]","[[250,243],[875,316],[1137,365],[900,401],[506,309]]","[[25,412],[365,355],[494,348],[883,452],[1095,559],[321,738],[184,570]]","[[10,861],[594,732],[955,931],[831,1010],[10,1010]]","[[654,722],[1114,580],[1283,652],[985,870]]","[[993,437],[1250,411],[1480,458],[1332,612],[1161,549]]","[[8,501],[123,635],[8,657]]");
    private static final List<Boundary> BOUNDARIES=List.of(
        new Boundary("yt-pear-01","[[20,257],[319,228],[571,310],[224,400]]","[[-262,310],[60,273],[334,286],[100,320],[100,345],[-96,350],[-226,342]]",-3.125,31.2012),
        new Boundary("yt-pear-02","[[366,285],[790,293],[1050,398],[638,487]]","[[123,328],[441,290],[994,411],[994,465],[639,537],[123,374]]",34.9609,40.7227),
        new Boundary("yt-pear-03","[[65,404],[636,402],[981,561],[330,780]]","[[-220,368],[-104,363],[6,358],[93,356],[111,390],[639,567],[916,519],[1060,620],[288,820],[-27,482]]",28.9062,61.6699),
        new Boundary("yt-wheat-01","[[18,836],[626,743],[1150,1020],[0,1020]]","[[-266,1020],[573,794],[903,987],[868,1020]]",30.0781,91.6992),
        new Boundary("yt-wheat-02","[[669,689],[1220,543],[1372,707],[1071,908]]","[[646,768],[1107,644],[1280,720],[968,951]]",62.6953,76.4648),
        new Boundary("yt-jujube-01","[[1034,407],[1355,395],[1490,473],[1302,634]]","[[1032,472],[1168,452],[1497,537],[1302,676],[1002,525]]",81.25,53.6133),
        new Boundary("yt-vegetable-demo","[[1230,630],[1330,600],[1420,670],[1320,705]]","[[-756,399],[-314,372],[-189,464],[-756,531]]",-28.125,43.9453)
    );
    @Override @Transactional public void run(ApplicationArguments args) {
        assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,"yt-camera").filter(a->"鸭梨视觉模型未接入".equals(a.getMetric())).ifPresent(a->{a.setMetric("支持手动上传 · 摄像设备待接入");assets.save(a);});
        // Move only original demo anchors; retain manually positioned facilities.
        assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,"yt-sorting").filter(a->Double.valueOf(76d).equals(a.getMapX()) && Double.valueOf(30d).equals(a.getMapY())).ifPresent(a->{a.setMapX(76.953125);a.setMapY(35.888671875);assets.save(a);});
        assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,"yt-coldstore").filter(a->Double.valueOf(94d).equals(a.getMapX()) && Double.valueOf(33d).equals(a.getMapY())).ifPresent(a->{a.setMapX(90.625);a.setMapY(38.232421875);assets.save(a);});
        assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,"yt-weather").filter(a->Double.valueOf(55d).equals(a.getMapX()) && Double.valueOf(23d).equals(a.getMapY())).ifPresent(a->{a.setMapX(54.00390625);a.setMapY(30.76171875);assets.save(a);});
        assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,"yt-soil").filter(a->Double.valueOf(61d).equals(a.getMapX()) && Double.valueOf(29d).equals(a.getMapY())).ifPresent(a->{a.setMapX(56.4453125);a.setMapY(35.888671875);assets.save(a);});
        assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,"yt-water").filter(a->Double.valueOf(91d).equals(a.getMapX()) && Double.valueOf(85d).equals(a.getMapY())).ifPresent(a->{a.setMapX(88.4765625);a.setMapY(91.552734375);assets.save(a);});
        for(var boundary:BOUNDARIES) assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,boundary.id()).ifPresent(asset->{
            if(asset.getPolygonJson()==null)return;
            String current=asset.getPolygonJson().replaceAll("\\s","").replaceAll("\\.0+(?=[,\\]])","");
            boolean intermediateWheat=boundary.id().equals("yt-wheat-01") && current.equals("[[8,851],[602,716],[929,1020],[8,1020]]");
            if(!boundary.oldPolygon().equals(current) && !intermediateWheat && !PREVIOUS.contains(current) && !PANORAMA_PREDECESSORS.contains(current))return;
            asset.setPolygonJson(boundary.polygon());
            asset.setMapX(boundary.x());asset.setMapY(boundary.y());
            assets.save(asset);
        });
    }
}
