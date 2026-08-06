package com.example.ty.dashboard.dto;

import java.time.LocalDateTime;

public record ThresholdResponse(String metricKey, String label, double minimumValue, boolean enabled, LocalDateTime updatedAt) {}
