package com.example.ty.assistant.knowledge;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_documents", uniqueConstraints = @UniqueConstraint(name = "uk_knowledge_document_key", columnNames = "document_key"))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class KnowledgeDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "document_key", nullable = false, length = 80) private String documentKey;
    @Column(nullable = false, length = 160) private String title;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT") private String content;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
}
