package com.example.ty.agent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AgentRunRepository extends JpaRepository<AgentRun,String> {
    List<AgentRun> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);
    List<AgentRun> findByStatusIn(List<String> statuses);
}
