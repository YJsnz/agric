package com.example.ty.dashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_alerts")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class FarmAlert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 40) private String farmId;
    @Column(length = 40) private String entityId;
    @Column(nullable = false, length = 160) private String title;
    @Column(nullable = false, length = 20) private String level;
    @Column(nullable = false, length = 20) private String status;
    private LocalDateTime occurredAt;
}
