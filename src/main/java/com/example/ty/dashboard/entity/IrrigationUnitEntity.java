package com.example.ty.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "irrigation_units")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class IrrigationUnitEntity {
    @Id @Column(length = 40) private String id;
    @Column(nullable = false, length = 40) private String farmId;
    @Column(nullable = false, unique = true, length = 40) private String entityId;
    @Column(nullable = false, length = 100) private String name;
    @Column(nullable = false, length = 100) private String targetName;
    @Column(nullable = false, length = 30) private String kind;
    private double mapX;
    private double mapY;
    private boolean enabled;
    private double flowRate;
    private int durationMinutes;
    private LocalDateTime updatedAt;
}
