package com.example.ty.dashboard.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record MetricSimulationRequest(@NotNull @DecimalMin("0") @DecimalMax("100") Double value) {}
