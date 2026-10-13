package com.example.ty.vision;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="vision_reviews") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class VisionReview {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=36) private String recordId;
 @Column(nullable=false,length=24) private String decision;
 @Column(nullable=false,length=2000) private String note;
 @Column(nullable=false) private LocalDateTime createdAt;
}
