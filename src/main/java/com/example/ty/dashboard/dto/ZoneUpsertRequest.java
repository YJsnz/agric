package com.example.ty.dashboard.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record ZoneUpsertRequest(
        @NotBlank @Size(max = 40) @Pattern(regexp = "[A-Za-z0-9_-]+", message = "种植区编号只能包含字母、数字、下划线和连字符") String id,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String crop,
        @NotBlank @Size(max = 50) String area,
        @NotBlank @Size(max = 60) String stage,
        @NotBlank @Size(max = 100) String environment,
        @Min(0) @Max(100) Integer health,
        @DecimalMin("2") @DecimalMax("98") double mapX,
        @DecimalMin("2") @DecimalMax("98") double mapY,
        @NotNull @Size(min = 3, max = 12) List<@Size(min = 2, max = 2) List<@NotNull Double>> polygon) {}
