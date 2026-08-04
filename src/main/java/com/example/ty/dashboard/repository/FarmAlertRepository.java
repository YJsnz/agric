package com.example.ty.dashboard.repository;
import com.example.ty.dashboard.entity.FarmAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FarmAlertRepository extends JpaRepository<FarmAlert, Long> { List<FarmAlert> findTop20ByFarmIdOrderByOccurredAtDesc(String farmId); }
