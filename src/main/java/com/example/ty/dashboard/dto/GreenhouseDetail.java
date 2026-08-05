package com.example.ty.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;

public record GreenhouseDetail(
        String farmId,
        LocalDateTime generatedAt,
        Greenhouse greenhouse,
        List<Metric> metrics,
        List<Device> devices,
        List<Plant> plants,
        List<TrendPoint> heightTrend,
        List<DashboardSnapshot.Alert> alerts,
        String aiSuggestion) {

    public record Greenhouse(String id, String name, String status, int health, String crop, String area,
                             String stage, String environment) {}
    public record Metric(String key, String label, double value, String unit, String note, String tone) {}
    public record Device(String id, String name, String category, boolean online, boolean enabled, String value) {}
    public record Plant(String id, String zone, String status, int health, double height, double soilMoisture) {}
    public record TrendPoint(String date, double height) {}
}
