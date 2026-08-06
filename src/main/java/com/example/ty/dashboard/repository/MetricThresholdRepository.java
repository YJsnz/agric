package com.example.ty.dashboard.repository;

import com.example.ty.dashboard.entity.MetricThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface MetricThresholdRepository extends JpaRepository<MetricThreshold, Long> {
    List<MetricThreshold> findByFarmIdOrderByMetricKey(String farmId);
    Optional<MetricThreshold> findByFarmIdAndMetricKey(String farmId, String metricKey);
}
