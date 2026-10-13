package com.example.ty.vision;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="vision_records",indexes=@Index(name="idx_vision_owner_farm",columnList="owner_id,farm_id"))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class VisionRecord {
    @Id @Column(length=36) private String id;
    @Column(name="owner_id",nullable=false) private Long ownerId;
    @Column(name="farm_id",nullable=false,length=40) private String farmId;
    @Column(length=40) private String plotId;
    @Column(nullable=false,length=30) private String status;
    @Column(length=64) private String sha256;
    @Column(length=200) private String filename;
    private int width;private int height;
    @Column(length=2000) private String error;
    @Lob @Column(columnDefinition="LONGTEXT") private String resultJson;
    private LocalDateTime createdAt;private LocalDateTime completedAt;
}
