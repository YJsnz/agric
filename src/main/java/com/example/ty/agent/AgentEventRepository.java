package com.example.ty.agent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AgentEventRepository extends JpaRepository<AgentEvent,Long> {
    List<AgentEvent> findByRunIdAndSeqGreaterThanOrderBySeq(String runId,long seq);
    long countByRunId(String runId);
}
