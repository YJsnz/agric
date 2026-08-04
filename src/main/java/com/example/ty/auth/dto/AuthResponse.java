package com.example.ty.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

@Data
@AllArgsConstructor
public class AuthResponse {

    @ToString.Exclude
    private String token;
    private UserInfo user;
}
