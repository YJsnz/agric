package com.example.ty.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "environment_metrics", uniqueConstraints = @UniqueConstraint(columnNames = {"farm_id", "metric_key"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EnvironmentMetric {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "farm_id", nullable = false, length = 40) private String farmId;
    @Column(name = "metric_key", nullable = false, length = 40) private String metricKey;
    @Column(nullable = false, length = 60) private String label;
    private double value;
    @Column(nullable = false, length = 20) private String unit;
    private double previousValue;
    @Column(nullable = false, length = 20) private String tone;
    private LocalDateTime measuredAt;
}
