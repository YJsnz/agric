package com.example.ty.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="farm_observations", indexes=@Index(name="idx_observation_farm_metric_time", columnList="farm_id,metric_key,measured_at"))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Observation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="farm_id",nullable=false,length=40) private String farmId;
    @Column(name="metric_key",nullable=false,length=40) private String metricKey;
    @Column(nullable=false,length=60) private String label;
    private double value;
    @Column(nullable=false,length=20) private String unit;
    @Column(nullable=false,length=40) private String source;
    @Column(name="measured_at",nullable=false) private LocalDateTime measuredAt;
}
