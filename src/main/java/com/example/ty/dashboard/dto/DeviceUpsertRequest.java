package com.example.ty.dashboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DeviceUpsertRequest(
        @NotBlank @Size(max = 40) @Pattern(regexp = "[A-Za-z0-9_-]+", message = "设备编号只能包含字母、数字、下划线和连字符") String id,
        @NotBlank @Size(max = 40) @Pattern(regexp = "[A-Za-z0-9_-]+", message = "实体编号只能包含字母、数字、下划线和连字符") String entityId,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Pattern(regexp = "sensor|actuator|camera|robot", message = "设备类别不正确") String category,
        @NotBlank @Size(max = 100) String location,
        Boolean online,
        Boolean enabled,
        @Size(max = 120) String currentValue) {}
