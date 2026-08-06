package com.example.ty.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "metric_thresholds", uniqueConstraints = @UniqueConstraint(name = "uk_threshold_farm_metric", columnNames = {"farm_id", "metric_key"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MetricThreshold {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "farm_id", nullable = false, length = 40) private String farmId;
    @Column(name = "metric_key", nullable = false, length = 40) private String metricKey;
    @Column(nullable = false, length = 60) private String label;
    @Column(name = "minimum_value", nullable = false) private double minimumValue;
    @Column(nullable = false) private boolean enabled;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
}
