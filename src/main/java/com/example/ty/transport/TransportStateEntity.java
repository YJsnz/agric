package com.example.ty.transport;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="transport_states") @Getter @Setter @NoArgsConstructor
public class TransportStateEntity {
 @Id private String farmId;
 @Version private Long version;
 @Column(columnDefinition="LONGTEXT") private String payload;
 public TransportStateEntity(String farmId,String payload){this.farmId=farmId;this.payload=payload;}
}
