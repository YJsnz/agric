package com.example.ty.dashboard.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ControlRequest(@NotNull Boolean enabled, @Min(5) @Max(60) Integer durationMinutes) {}
