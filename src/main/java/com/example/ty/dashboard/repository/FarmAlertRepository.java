package com.example.ty.dashboard.repository;
import com.example.ty.dashboard.entity.FarmAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FarmAlertRepository extends JpaRepository<FarmAlert, Long> {
    List<FarmAlert> findTop20ByFarmIdOrderByOccurredAtDesc(String farmId);
    boolean existsByFarmIdAndEntityIdAndTitleAndStatusNotIn(String farmId, String entityId, String title, List<String> statuses);
    boolean existsByFarmIdAndTitle(String farmId, String title);
}
