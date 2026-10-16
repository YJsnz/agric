package com.example.ty.embedded;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/** Durable command outbox and uplink inbox. Wire sequence is independent from database identity. */
@Entity @Table(name="embedded_messages", uniqueConstraints=@UniqueConstraint(columnNames={"device_id","message_key"}))
@Getter @Setter @NoArgsConstructor
public class EmbeddedMessage {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="device_id",nullable=false,length=40) private String deviceId;
    @Column(name="message_key",nullable=false,length=90) private String messageKey;
    @Column(nullable=false,length=16) private String kind;
    @Column(nullable=false,length=20) private String status;
    @Column(nullable=false,columnDefinition="TEXT") private String payload;
    @Column(columnDefinition="TEXT") private String receipt;
    private Instant createdAt=Instant.now();
    private Instant expiresAt;
    private Instant completedAt;
    @Version private long version;
}
