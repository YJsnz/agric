package com.example.ty.dashboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "farm_assets")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class FarmAsset {
    @Id @Column(length = 40) private String id;
    @Column(nullable = false, length = 40) private String farmId;
    @Column(nullable = false, length = 100) private String name;
    @Column(nullable = false, length = 30) private String type;
    @Column(nullable = false, length = 30) private String status;
    @Column(nullable = false, length = 120) private String metric;
    private double mapX;
    private double mapY;
    private Integer health;
    private Double positionX;
    private Double positionY;
    private Double positionZ;
    @Column(length = 40) private String zoneId;
    @Column(columnDefinition = "TEXT") private String polygonJson;
    @Column(length = 100) private String crop;
    @Column(length = 50) private String area;
    @Column(length = 60) private String growthStage;
    @Column(length = 100) private String environmentSummary;
}
