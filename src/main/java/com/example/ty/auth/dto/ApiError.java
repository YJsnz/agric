package com.example.ty.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/** 统一错误响应结构 */
@Data
@AllArgsConstructor
public class ApiError {

    private String code;
    private String message;
}
