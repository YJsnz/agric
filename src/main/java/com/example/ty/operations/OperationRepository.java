package com.example.ty.operations;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OperationRepository extends JpaRepository<OperationRecord,Long> {
 List<OperationRecord> findTop200ByFarmIdOrderByCreatedAtDescIdDesc(String farmId);
 List<OperationRecord> findTop10ByFarmIdAndKindOrderByCreatedAtDescIdDesc(String farmId,String kind);
 List<OperationRecord> findByFarmIdAndParentIdOrderByCreatedAtAscIdAsc(String farmId,Long parentId);
}
