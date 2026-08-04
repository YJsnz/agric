package com.example.ty.dashboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_devices")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class FarmDevice {
    @Id @Column(length = 40) private String id;
    @Column(nullable = false, length = 40) private String farmId;
    @Column(nullable = false, unique = true, length = 40) private String entityId;
    @Column(nullable = false, length = 100) private String name;
    @Column(nullable = false, length = 30) private String category;
    @Column(nullable = false, length = 100) private String location;
    private boolean online;
    private boolean enabled;
    @Column(nullable = false, length = 120) private String currentValue;
    private LocalDateTime lastSeenAt;
}
