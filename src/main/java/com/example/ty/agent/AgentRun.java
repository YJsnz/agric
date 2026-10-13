package com.example.ty.agent;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name = "agent_runs", indexes = @Index(columnList = "userId,createdAt"))
@Getter @Setter
public class AgentRun {
    @Id private String id;
    @Column(nullable=false) private Long userId;
    @Column(nullable=false, length=2000) private String question;
    private String farmId;
    private String parentRunId;
    private String status;
    private String model;
    @Lob @Column(columnDefinition="LONGTEXT") private String answer;
    private String error;
    private Instant createdAt;
    private Instant updatedAt;
}
