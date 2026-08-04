package com.example.ty.dashboard.repository;
import com.example.ty.dashboard.entity.FarmAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FarmAssetRepository extends JpaRepository<FarmAsset, String> { List<FarmAsset> findByFarmIdOrderById(String farmId); }
