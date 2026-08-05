package com.example.ty.assistant.state;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AssistantStateDto(
        @NotNull String workbenchesJson,
        @NotNull String conversationsJson,
        LocalDateTime updatedAt
) {}
