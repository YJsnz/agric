package com.example.ty.assistant.knowledge;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {
    Optional<KnowledgeDocument> findByDocumentKey(String documentKey);
    List<KnowledgeDocument> findAllByOrderByUpdatedAtDesc();
}
