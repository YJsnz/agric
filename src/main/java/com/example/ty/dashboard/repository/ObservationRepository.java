package com.example.ty.dashboard.repository;
import com.example.ty.dashboard.entity.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ObservationRepository extends JpaRepository<Observation,Long> {
    List<Observation> findTop240ByFarmIdAndMetricKeyOrderByMeasuredAtDescIdDesc(String farmId,String metricKey);
}
