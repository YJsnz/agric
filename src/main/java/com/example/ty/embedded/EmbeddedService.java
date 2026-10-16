package com.example.ty.embedded;

import com.example.ty.auth.exception.BizException;
import com.example.ty.dashboard.entity.Observation;
import com.example.ty.dashboard.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class EmbeddedService {
    private final EmbeddedMessageRepository messages;
    private final FarmDeviceRepository devices;
    private final ObservationRepository observations;
    private final ObjectMapper json;
    public record Reading(String metric,double value) {}
    public record Uplink(String messageId,Instant measuredAt,List<Reading> readings) {}
    public record Command(String requestId,String action,int value,int durationSeconds) {}
    public record Ack(long commandId,boolean success,String detail) {}
    private record Metric(String label,String unit,double min,double max) {}
    private static final Map<String,Metric> METRICS=Map.ofEntries(
        Map.entry("temperature",new Metric("空气温度","℃",-50,100)),
        Map.entry("airHumidity",new Metric("空气湿度","%",0,100)),
        Map.entry("soilMoisture",new Metric("土壤湿度","%",0,100)),
        Map.entry("soilTemperature",new Metric("土壤温度","℃",-50,100)),
        Map.entry("co2",new Metric("二氧化碳","ppm",0,50000)),
        Map.entry("light",new Metric("光照","lux",0,200000)),
        Map.entry("ph",new Metric("酸碱度","pH",0,14)),
        Map.entry("ec",new Metric("电导率","mS/cm",0,30)),
        Map.entry("flow",new Metric("流量","m³/h",0,10000)),
        Map.entry("battery",new Metric("电量","%",0,100)));
    private com.example.ty.dashboard.entity.FarmDevice device(String farm,String id) {
        return devices.findByFarmIdAndEntityId(farm,id).orElseThrow(()->BizException.notFound("设备不存在"));
    }
    private String encode(Object value) {return json.writeValueAsString(value);}
    private void key(String key) {if(key==null||!key.matches("[A-Za-z0-9_-]{1,64}"))throw BizException.badRequest("消息标识须为1–64位字母数字或连字符");}
    @Transactional
    public synchronized EmbeddedMessage ingest(String farm,String id,Uplink input) {
        if(input==null)throw BizException.badRequest("遥测不能为空");
        var d=device(farm,id);key(input.messageId());
        String key="up:"+input.messageId(),payload=encode(input);
        var previous=messages.findByDeviceIdAndMessageKey(d.getId(),key);
        if(previous.isPresent()) {if(!previous.get().getPayload().equals(payload))throw BizException.badRequest("消息标识重复且内容不同");return previous.get();}
        if(input.measuredAt()==null||input.measuredAt().isAfter(Instant.now().plusSeconds(120))||input.measuredAt().isBefore(Instant.now().minus(Duration.ofDays(30))))throw BizException.badRequest("采样时间无效");
        if(input.readings()==null||input.readings().isEmpty()||input.readings().size()>32)throw BizException.badRequest("每包需1–32项采样");
        Set<String> seen=new HashSet<>();
        for(var r:input.readings()) {
            if(r==null||r.metric()==null)throw BizException.badRequest("指标不能为空");
            var m=METRICS.get(r.metric());
            if(m==null||!seen.add(r.metric())||!Double.isFinite(r.value())||r.value()<m.min||r.value()>m.max)throw BizException.badRequest("指标重复、未知或数值越界");
            observations.save(Observation.builder().farmId(farm).metricKey(r.metric()).label(m.label).unit(m.unit).value(r.value()).source("serial:"+id).measuredAt(LocalDateTime.ofInstant(input.measuredAt(),ZoneOffset.UTC)).build());
        }
        d.setOnline(true);d.setLastSeenAt(LocalDateTime.now());d.setCurrentValue("串口遥测 · "+input.readings().size()+"项");devices.save(d);
        var row=new EmbeddedMessage();row.setDeviceId(d.getId());row.setMessageKey(key);row.setKind("TELEMETRY");row.setStatus("RECEIVED");row.setPayload(payload);return messages.save(row);
    }
    @Transactional
    public synchronized EmbeddedMessage command(String farm,String id,Command input) {
        if(input==null)throw BizException.badRequest("指令不能为空");
        var d=device(farm,id);key(input.requestId());
        if(!Set.of("SET_ENABLED","SET_LEVEL","SAMPLE","STOP","SELF_TEST").contains(input.action()==null?"":input.action()))throw BizException.badRequest("不支持的串口指令");
        if(input.value()<0||input.value()>100||input.durationSeconds()<0||input.durationSeconds()>3600||("SET_ENABLED".equals(input.action())&&input.value()>1))throw BizException.badRequest("指令参数越界");
        if(!Set.of("SAMPLE","SELF_TEST").contains(input.action())&&!"actuator".equals(d.getCategory())&&!"robot".equals(d.getCategory()))throw BizException.badRequest("该设备不支持执行器控制");
        String key="cmd:"+input.requestId(),payload=encode(input);var prior=messages.findByDeviceIdAndMessageKey(d.getId(),key);
        if(prior.isPresent()) {if(!prior.get().getPayload().equals(payload))throw BizException.badRequest("请求标识已被其他指令使用");return prior.get();}
        var row=new EmbeddedMessage();row.setDeviceId(d.getId());row.setMessageKey(key);row.setKind("COMMAND");row.setStatus("PENDING");row.setPayload(payload);row.setExpiresAt(Instant.now().plusSeconds(60));row=messages.save(row);
        if(row.getId()>0xffffffffL)throw BizException.badRequest("指令序号已超出串口v1范围，请升级协议");return row;
    }
    @Transactional
    public List<EmbeddedMessage> pending(String farm,String id) {
        var d=device(farm,id);var rows=messages.findTop20ByDeviceIdAndKindAndStatusOrderByIdAsc(d.getId(),"COMMAND","PENDING");
        for(var row:rows)if(row.getExpiresAt().isBefore(Instant.now())){row.setStatus("TIMED_OUT");row.setCompletedAt(Instant.now());}
        return rows.stream().filter(r->r.getStatus().equals("PENDING")).toList();
    }
    @Transactional
    public synchronized EmbeddedMessage ack(String farm,String id,Ack ack) {
        if(ack==null||ack.detail()!=null&&ack.detail().length()>200)throw BizException.badRequest("回执无效或说明过长");
        var d=device(farm,id);var row=messages.findById(ack.commandId()).filter(r->r.getDeviceId().equals(d.getId())&&r.getKind().equals("COMMAND")).orElseThrow(()->BizException.notFound("指令不存在"));
        if(!row.getStatus().equals("PENDING"))return row;
        if(row.getExpiresAt().isBefore(Instant.now()))row.setStatus("TIMED_OUT");
        else {
            row.setStatus(ack.success()?"ACKED":"FAILED");
            if(ack.success()) {var cmd=json.readTree(row.getPayload());if("SET_ENABLED".equals(cmd.path("action").asString()))d.setEnabled(cmd.path("value").asInt()==1);if("STOP".equals(cmd.path("action").asString()))d.setEnabled(false);devices.save(d);}
        }
        row.setReceipt(encode(ack));row.setCompletedAt(Instant.now());return messages.save(row);
    }
    @Transactional
    public List<EmbeddedMessage> history(String farm,String id){
        var rows=messages.findTop100ByDeviceIdOrderByIdDesc(device(farm,id).getId());
        for(var row:rows)if("PENDING".equals(row.getStatus())&&row.getExpiresAt().isBefore(Instant.now())){row.setStatus("TIMED_OUT");row.setCompletedAt(Instant.now());}
        return rows;
    }
}
