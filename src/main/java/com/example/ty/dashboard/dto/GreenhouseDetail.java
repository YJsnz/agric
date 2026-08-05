package com.example.ty.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;

public record GreenhouseDetail(
        String farmId,
        LocalDateTime generatedAt,
        Greenhouse greenhouse,
        SceneProfile scene,
        List<Metric> metrics,
        List<Device> devices,
        List<Zone> zones,
        List<Plant> plants,
        List<TrendPoint> heightTrend,
        List<DashboardSnapshot.Alert> alerts,
        String aiSuggestion) {

    public record Greenhouse(String id, String name, String status, int health, String crop, String area,
                             String stage, String environment) {}
    public record SceneProfile(String structure, String cultivationMode, String cropModel, int bedCount,
                               int rowCount, int nominalPlantCount, String irrigationMode) {}
    public record Metric(String key, String label, double value, String unit, String note, String tone) {}
    public record Device(String id, String name, String category, boolean online, boolean enabled, String value,
                         String location, String responsibility, double positionX, double positionY, double positionZ) {}
    public record Zone(String id, String name, String crop, String task, int health, double coverage) {}
    public record Plant(String id, String zone, String status, int health, double height, double soilMoisture,
                        String cultivar, int ageDays, double leafAreaIndex, double positionX, double positionZ) {}
    public record TrendPoint(String date, double height) {}
}
