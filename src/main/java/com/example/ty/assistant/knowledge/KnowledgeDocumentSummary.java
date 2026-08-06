package com.example.ty.assistant.knowledge;

import java.time.LocalDateTime;

public record KnowledgeDocumentSummary(String key, String title, int characters, int chunks, LocalDateTime updatedAt) {}
