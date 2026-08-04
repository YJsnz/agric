package com.example.ty.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

@Data
public class RegisterRequest {

    @NotBlank(message = "请输入称呼")
    @Size(max = 100, message = "称呼不能超过 100 字")
    private String name;

    @NotBlank(message = "请输入邮箱")
    @Email(message = "邮箱格式不正确")
    @Size(max = 255, message = "邮箱过长")
    private String email;

    @NotBlank(message = "请输入密码")
    @Size(min = 6, max = 64, message = "密码长度需在 6-64 位之间")
    @ToString.Exclude
    private String password;
}
