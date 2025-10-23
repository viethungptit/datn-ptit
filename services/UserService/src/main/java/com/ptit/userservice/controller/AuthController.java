package com.ptit.userservice.controller;

import com.ptit.userservice.dto.*;
import com.ptit.userservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.CookieValue;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/user-service/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request, HttpServletResponse response) {
        System.out.println("Login attempt for user: " );
        return authService.login(request, response);
    }

    @PostMapping("/refresh")
    public RefreshTokenResponse refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null) {
            throw new RuntimeException("Refresh token is missing");
        }
        return authService.refreshTokenFromCookie(refreshToken);
    }

    @PostMapping("/logout")
    public LogoutResponse logout(@CookieValue(value = "refreshToken", required = false) String refreshToken, HttpServletResponse response) {
        LogoutResponse result = authService.logout(refreshToken);
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return result;
    }

    @PostMapping("/verify-otp")
    public VerifyOtpResponse verifyOtp(@RequestBody VerifyOtpRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/reset-otp")
    public ResetOtpResponse resetOtp(@RequestBody ResetOtpRequest request) {
        return authService.resetOtp(request);
    }

    @PostMapping("/reset-password")
    public ForgotPasswordResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/request-reset-password")
    public void requestResetPassword(@RequestBody RequestResetPasswordRequest request) {
        authService.requestResetPassword(request);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "UserService",
                "timestamp", LocalDateTime.now()
        ));
    }
}
