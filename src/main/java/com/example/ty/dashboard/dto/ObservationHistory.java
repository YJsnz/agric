package com.example.ty.dashboard.dto;
import java.time.LocalDateTime;
import java.util.List;
public record ObservationHistory(String farmId,String metricKey,String scope,boolean virtualData,int limit,List<Point> points) {
    public record Point(Long id,String label,double value,String unit,String source,LocalDateTime measuredAt) {}
}
