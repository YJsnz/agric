package com.example.ty.dashboard.dto;

import java.time.LocalDateTime;
import java.util.List;

public record DashboardSnapshot(
        String farmId,
        String farmName,
        LocalDateTime generatedAt,
        boolean virtualData,
        Summary summary,
        List<Asset> entities,
        List<Zone> zones,
        List<Metric> environmentMetrics,
        List<Device> devices,
        List<Irrigation> irrigationUnits,
        List<Alert> alerts) {

    public record Summary(int health, int totalDevices, int onlineDevices, int runningDevices, int openAlerts,
                          double waterLevel, double todayWaterUsage) {}
    public record Position(double x, double y, double z) {}
    public record Asset(String id, String name, String type, String status, String metric, double x, double y,
                        Integer health, Position position3D) {}
    public record Zone(String id, String entityId, List<List<Double>> polygon, String crop, String area,
                       String stage, String environment) {}
    public record Metric(String key, String label, String value, String delta, String tone,
                         double numericValue, String unit, LocalDateTime measuredAt) {}
    public record Device(String id, String entityId, String name, String category, String location,
                         boolean online, boolean enabled, String value, String lastSeen) {}
    public record Irrigation(String id, String entityId, String name, String target, String kind, double x,
                             double y, boolean enabled, String flow, int durationMinutes) {}
    public record Alert(Long id, String entityId, String time, String title, String level, String status) {}
}
