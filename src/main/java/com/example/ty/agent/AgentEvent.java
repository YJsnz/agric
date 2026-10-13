package com.example.ty.agent;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name="agent_events", uniqueConstraints=@UniqueConstraint(columnNames={"runId","seq"}))
@Getter @Setter
public class AgentEvent {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String runId;
    private long seq;
    private String type;
    private Instant timestamp;
    @Lob @Column(columnDefinition="LONGTEXT") private String payload;
}
