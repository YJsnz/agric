package com.example.ty.dashboard.repository;
import com.example.ty.dashboard.entity.FarmDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface FarmDeviceRepository extends JpaRepository<FarmDevice, String> {
    List<FarmDevice> findByFarmIdOrderById(String farmId);
    Optional<FarmDevice> findByFarmIdAndEntityId(String farmId, String entityId);
    long countByFarmId(String farmId);
}
