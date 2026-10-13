package com.example.ty.operations;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="operation_records") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class OperationRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Version private Long version;
 @Column(nullable=false,length=40) private String farmId;
 @Column(length=40) private String entityId;
 @Column(nullable=false,length=24) private String kind;
 @Column(nullable=false,length=160) private String title;
 @Column(nullable=false,length=2000) private String detail;
 @Column(nullable=false,length=24) private String stage;
 private Long parentId;
 private Double quantity;
 @Column(length=20) private String unit;
 @Column(length=100) private String operatorName;
 @Column(nullable=false) private LocalDateTime createdAt;
 @Column(nullable=false) private boolean simulated;
}
