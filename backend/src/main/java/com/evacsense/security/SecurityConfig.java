package com.evacsense.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig implements WebMvcConfigurer {

    @Autowired
    private RbacInterceptor rbacInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply RBAC interceptor to all endpoints
        registry.addInterceptor(rbacInterceptor).addPathPatterns("/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Match Node's open cors() policy
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
