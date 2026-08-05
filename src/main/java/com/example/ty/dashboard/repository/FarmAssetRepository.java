package com.example.ty.dashboard.repository;
import com.example.ty.dashboard.entity.FarmAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface FarmAssetRepository extends JpaRepository<FarmAsset, String> {
    List<FarmAsset> findByFarmIdOrderById(String farmId);
    Optional<FarmAsset> findByFarmIdAndId(String farmId, String id);
}
