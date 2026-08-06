package com.example.ty.dashboard.repository;
import com.example.ty.dashboard.entity.IrrigationUnitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface IrrigationUnitRepository extends JpaRepository<IrrigationUnitEntity, String> {
    List<IrrigationUnitEntity> findByFarmIdOrderById(String farmId);
    Optional<IrrigationUnitEntity> findByFarmIdAndId(String farmId, String id);
    List<IrrigationUnitEntity> findByFarmIdAndEntityId(String farmId, String entityId);
}
