package com.example.ty.dashboard.repository;
import com.example.ty.dashboard.entity.EnvironmentMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EnvironmentMetricRepository extends JpaRepository<EnvironmentMetric, Long> { List<EnvironmentMetric> findByFarmIdOrderById(String farmId); }
