package com.example.ty.assistant.knowledge;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record KnowledgeDocumentRequest(@NotBlank @Size(max = 160) String title,
                                       @NotBlank @Size(max = 200_000) String content) {}
