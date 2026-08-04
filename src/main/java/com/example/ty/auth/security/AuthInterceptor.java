package com.example.ty.auth.security;

import com.example.ty.auth.dto.ApiError;
import com.example.ty.auth.entity.User;
import com.example.ty.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Optional;

/**
 * JWT 认证拦截器：校验 Authorization: Bearer &lt;token&gt;，
 * 通过后把当前用户放到 request attribute，controller 直接取用。
 * 公共接口（登录/注册等）在 {@link #isPublic} 中放行。
 */
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    public static final String CURRENT_USER_ATTR = "currentUser";

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (HttpMethod.OPTIONS.matches(request.getMethod()) || isPublic(request.getRequestURI())) {
            return true;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            writeError(response, 401, "未登录或登录已过期");
            return false;
        }

        Long userId = jwtService.parseUserId(header.substring(7));
        if (userId == null) {
            writeError(response, 401, "未登录或登录已过期");
            return false;
        }

        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            writeError(response, 401, "账号不存在");
            return false;
        }

        request.setAttribute(CURRENT_USER_ATTR, user.get());
        return true;
    }

    private boolean isPublic(String path) {
        return path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/face-login");
        // 后续公共接口（作物字典、公开数据等）在此追加
    }

    private void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), new ApiError("UNAUTHORIZED", message));
    }
}
