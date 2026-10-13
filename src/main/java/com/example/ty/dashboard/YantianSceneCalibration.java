package com.example.ty.dashboard;

import com.example.ty.dashboard.repository.FarmAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/** Upgrade only the untouched v1 demo geometry. Coordinates are image pixels, not GIS. */
@Component @Order(210) @RequiredArgsConstructor
public class YantianSceneCalibration implements ApplicationRunner {
    private final FarmAssetRepository assets;
    private record Boundary(String id,String oldPolygon,String polygon,double x,double y) {}
    private static final List<Boundary> BOUNDARIES=List.of(
        new Boundary("yt-pear-01","[[20,257],[319,228],[571,310],[224,400]]","[[12,242],[190,229],[482,304],[18,365]]",16,29),
        new Boundary("yt-pear-02","[[366,285],[790,293],[1050,398],[638,487]]","[[224,237],[887,310],[1167,374],[858,418],[509,332]]",46,32),
        new Boundary("yt-pear-03","[[65,404],[636,402],[981,561],[330,780]]","[[22,406],[370,357],[1100,544],[313,732],[173,568]]",34,51),
        new Boundary("yt-wheat-01","[[18,836],[626,743],[1150,1020],[0,1020]]","[[8,851],[602,716],[970,920],[841,1020],[8,1020]]",28,87),
        new Boundary("yt-wheat-02","[[669,689],[1220,543],[1372,707],[1071,908]]","[[642,710],[1118,567],[1304,652],[989,883]]",66,69),
        new Boundary("yt-jujube-01","[[1034,407],[1355,395],[1490,473],[1302,634]]","[[1010,435],[1273,404],[1498,452],[1338,597],[1160,552]]",83,48)
    );
    @Override @Transactional public void run(ApplicationArguments args) {
        assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,"yt-camera").filter(a->"鸭梨视觉模型未接入".equals(a.getMetric())).ifPresent(a->{a.setMetric("支持手动上传 · 摄像设备待接入");assets.save(a);});
        for(var boundary:BOUNDARIES) assets.findByFarmIdAndId(YantianDemoInitializer.FARM_ID,boundary.id()).ifPresent(asset->{
            boolean intermediateWheat=boundary.id().equals("yt-wheat-01") && asset.getPolygonJson().equals("[[8,851],[602,716],[929,1020],[8,1020]]");
            if(!boundary.oldPolygon().equals(asset.getPolygonJson()) && !intermediateWheat)return;
            asset.setPolygonJson(boundary.polygon());
            asset.setMapX(boundary.x());asset.setMapY(boundary.y());
            assets.save(asset);
        });
    }
}
