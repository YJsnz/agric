package com.example.ty;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * SPA 兜底转发：平台采用 history 路由，官网导航直达 /platform/assistant、
 * /platform/workspaces/farm-01 等深链时，把非静态资源的 /platform/** 请求
 * 转发到平台 index.html，由 Vue Router 接管渲染。
 */
@Configuration
public class PlatformSpaForward implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                String uri = request.getRequestURI();
                // 平台静态资源与入口交由各自的处理器处理，其余深链统一转发到平台首页
                if (uri.equals("/platform") || uri.equals("/platform/")
                        || uri.startsWith("/platform/assets/")
                        || uri.equals("/platform/index.html")) {
                    return true;
                }
                request.getRequestDispatcher("/platform/index.html").forward(request, response);
                return false;
            }
        }).addPathPatterns("/platform/**");
    }
}
