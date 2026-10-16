package com.example.ty.operations;

import com.example.ty.auth.exception.BizException;
import com.example.ty.dashboard.repository.FarmAssetRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/** Printed QR codes expose only the signed batch's read-only trace summary. */
@RestController
public class BatchTraceController {
    private final OperationRepository records;
    private final FarmAssetRepository assets;
    private final ObjectMapper json;
    private final byte[] secret;
    public BatchTraceController(OperationRepository records, FarmAssetRepository assets, ObjectMapper json,
                                @Value("${app.jwt.secret}") String secret) {
        this.records=records;this.assets=assets;this.json=json;this.secret=secret.getBytes(StandardCharsets.UTF_8);
    }
    private String sign(String farm, long id) {
        try {
            Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(secret,"HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(("batch-trace:v1:"+farm+":"+id).getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {throw new IllegalStateException("Cannot sign batch trace",e);}
    }
    private OperationRecord batch(String farm,long id) {
        return records.findById(id).filter(r->farm.equals(r.getFarmId()) && "BATCH".equals(r.getKind()))
            .orElseThrow(()->BizException.notFound("未找到对应批次"));
    }
    @GetMapping("/api/farms/{farmId}/operations/{id}/share")
    public Map<String,String> share(@PathVariable String farmId,@PathVariable long id) {
        batch(farmId,id);
        return Map.of("key",sign(farmId,id));
    }
    public record Step(String stage,String recordedAt) {}
    public record Summary(String batchCode,String title,String crop,String location,String collectedAt,
                          String collectionDate,String recordedAt,String stage,Double quantity,String unit,
                          boolean simulated,List<Step> steps) {}
    @GetMapping("/api/public/batch-trace")
    public Summary trace(@RequestParam String farmId,@RequestParam long id,@RequestParam String key) {
        if (key.length()!=43 || !MessageDigest.isEqual(sign(farmId,id).getBytes(StandardCharsets.US_ASCII),key.getBytes(StandardCharsets.US_ASCII)))
            throw BizException.notFound("追溯码无效，请重新扫描");
        var row=batch(farmId,id);
        var asset=assets.findByFarmIdAndId(farmId,row.getEntityId());
        String crop=asset.map(a->a.getCrop()).orElse("未登记"),location=asset.map(a->a.getName()).orElse("未登记");
        String collected="",date="";
        try {
            var detail=json.readTree(row.getDetail());
            if (detail.isObject()) {
                crop=detail.path("crop").asString(crop);
                location=detail.path("harvestLocation").asString(location);
                collected=detail.path("harvestAt").asString("");
                date=detail.path("harvestDate").asString("");
            }
        } catch (Exception ignored) { /* Historical notes were plain text. */ }
        var steps=records.findByFarmIdAndParentIdOrderByCreatedAtAscIdAsc(farmId,id).stream()
            .map(event->new Step(event.getStage(),event.getCreatedAt().toString())).toList();
        return new Summary("YT-"+farmId+"-"+id,row.getTitle(),crop,location,collected,date,
            row.getCreatedAt().toString(),row.getStage(),row.getQuantity(),row.getUnit(),row.isSimulated(),steps);
    }
}
