package com.example.ty.vision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface VisionReviewRepository extends JpaRepository<VisionReview,Long> {List<VisionReview> findByRecordIdOrderByCreatedAtAscIdAsc(String recordId);}
