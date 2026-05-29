package com.evacsense.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.evacsense.model.User;
import com.evacsense.repository.UserRepository;
import com.evacsense.service.JwtService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class RbacInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Preflight CORS requests bypass security interceptor
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        
        // Retrieve @RequireRole annotation on method or class
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
        }

        // If no security annotation, bypass
        if (requireRole == null) {
            return true;
        }

        // 1. Verify Authorization Header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Access Denied. No token provided.", 
                    "Authorization header is missing or malformed.");
            return false;
        }

        String token = authHeader.substring(7);
        Claims claims;

        // 2. Decode and Validate Token
        try {
            claims = jwtService.verifyToken(token);
        } catch (Exception e) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed.", e.getMessage());
            return false;
        }

        String userId = claims.getSubject();
        Optional<User> userOpt = userRepository.findById(userId);

        // 3. Verify user account exists
        if (userOpt.isEmpty()) {
            sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access Forbidden.", 
                    "User account associated with this token does not exist.");
            return false;
        }

        User user = userOpt.get();

        // 4. Verify account status
        if ("locked".equals(user.getStatus())) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("status", "locked");
            errorMap.put("message", "Your account is locked due to multiple failed login attempts.");
            errorMap.put("errors", Arrays.asList("Account status is locked. Please contact your system administrator."));
            response.getWriter().write(objectMapper.writeValueAsString(errorMap));
            return false;
        }

        // 5. Verify allowed roles if specified
        String[] allowedRoles = requireRole.value();
        if (allowedRoles.length > 0) {
            boolean isAuthorized = Arrays.asList(allowedRoles).contains(user.getRole());
            if (!isAuthorized) {
                sendError(response, HttpServletResponse.SC_FORBIDDEN, "Access Forbidden. Insufficient permissions.", 
                        "Role '" + user.getRole() + "' is not authorized to access this resource.");
                return false;
            }
        }

        // Set contextual attributes for downstream controllers
        request.setAttribute("currentUser", user);
        request.setAttribute("tokenData", claims);
        request.setAttribute("token", token);

        return true;
    }

    private void sendError(HttpServletResponse response, int httpStatus, String message, String detail) throws IOException {
        response.setStatus(httpStatus);
        response.setContentType("application/json");
        Map<String, Object> errorMap = new HashMap<>();
        errorMap.put("status", "error");
        errorMap.put("message", message);
        errorMap.put("errors", Arrays.asList(detail));
        response.getWriter().write(objectMapper.writeValueAsString(errorMap));
    }
}
