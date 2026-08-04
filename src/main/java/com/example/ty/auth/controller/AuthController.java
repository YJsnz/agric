package com.example.ty.auth.controller;

import com.example.ty.auth.dto.AuthResponse;
import com.example.ty.auth.dto.LoginRequest;
import com.example.ty.auth.dto.RegisterRequest;
import com.example.ty.auth.dto.UserInfo;
import com.example.ty.auth.entity.User;
import com.example.ty.auth.security.AuthInterceptor;
import com.example.ty.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UserInfo me(HttpServletRequest request) {
        User user = (User) request.getAttribute(AuthInterceptor.CURRENT_USER_ATTR);
        return authService.me(user);
    }
}
