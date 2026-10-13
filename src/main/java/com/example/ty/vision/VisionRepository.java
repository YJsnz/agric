package com.example.ty.vision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface VisionRepository extends JpaRepository<VisionRecord,String> {
    List<VisionRecord> findTop50ByOwnerIdAndFarmIdOrderByCreatedAtDesc(Long ownerId,String farmId);
    List<VisionRecord> findByStatusIn(List<String> statuses);
}
