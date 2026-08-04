package com.example.ty.auth.exception;

import lombok.Getter;

/** 业务异常：带 HTTP 状态码与错误码，由 GlobalExceptionHandler 统一转成 ApiError */
@Getter
public class BizException extends RuntimeException {

    private final String code;
    private final int status;

    public BizException(String code, String message, int status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public static BizException badRequest(String message) {
        return new BizException("BAD_REQUEST", message, 400);
    }

    public static BizException unauthorized(String message) {
        return new BizException("UNAUTHORIZED", message, 401);
    }

    public static BizException notFound(String message) {
        return new BizException("NOT_FOUND", message, 404);
    }

    public static BizException internalError(String message) {
        return new BizException("INTERNAL_ERROR", message, 500);
    }
}
