package com.ptit.userservice.service;

import com.ptit.userservice.dto.*;
import com.ptit.userservice.entity.*;
import com.ptit.userservice.exception.BusinessException;
import com.ptit.userservice.exception.ResourceNotFoundException;
import com.ptit.userservice.repository.*;
import com.ptit.userservice.config.JwtUtil;
import com.ptit.userservice.config.EventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private OtpTokenRepository otpTokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private EventPublisher eventPublisher;

    @Value("${notification.exchange}")
    private String notificationExchange;

    @Value("${notification.user.register.routing-key}")
    private String registerRoutingKey;

    @Value("${notification.user.reset-password.routing-key}")
    private String resetPasswordRoutingKey;


    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        Optional<User> existingUserOpt = userRepository.findByEmail(request.email);
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (!existingUser.isDeleted()) {
                throw new DataIntegrityViolationException("Email already exists");
            } else {
                existingUser.setPassword(passwordEncoder.encode(request.password));
                existingUser.setFullName(request.fullName);
                existingUser.setPhone(request.phone);
                existingUser.setRole(User.Role.valueOf(request.role));
                existingUser.setActive(false);
                existingUser.setDeleted(false);
                existingUser.setCreatedAt(LocalDateTime.now());
                userRepository.save(existingUser);

                // Generate OTP
                String otpCode = String.format("%06d", (int)(Math.random() * 1000000));
                OtpToken otp = new OtpToken();
                otp.setUser(existingUser);
                otp.setOtpCode(otpCode);
                otp.setUsed(false);
                otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
                otp.setCreatedAt(LocalDateTime.now());
                otpTokenRepository.save(otp);

                // Send event
                Map<String, Object> event = new HashMap<>();
                event.put("email", existingUser.getEmail());
                event.put("name", existingUser.getFullName());
                event.put("otp", otpCode);
                event.put("event_type", registerRoutingKey);
                eventPublisher.publish(notificationExchange, registerRoutingKey, event);

                // Response
                RegisterResponse response = new RegisterResponse();
                response.userId = existingUser.getUserId().toString();
                response.email = existingUser.getEmail();
                response.fullName = existingUser.getFullName();
                response.role = existingUser.getRole().name();
                response.status = "inactive";
                response.isDeleted = false;
                response.createdAt = existingUser.getCreatedAt();
                return response;
            }
        }

        // Email does not exist, create new user
        User user = new User();
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setFullName(request.fullName);
        user.setPhone(request.phone);
        user.setRole(User.Role.valueOf(request.role));
        user.setActive(false);
        user.setDeleted(false);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate OTP
        String otpCode = String.format("%06d", (int)(Math.random() * 1000000));
        OtpToken otp = new OtpToken();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setUsed(false);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setCreatedAt(LocalDateTime.now());
        otpTokenRepository.save(otp);

        // Send event
        Map<String, Object> event = new HashMap<>();
        event.put("email", user.getEmail());
        event.put("name", user.getFullName());
        event.put("otp", otpCode);
        event.put("event_type", registerRoutingKey);
        eventPublisher.publish(notificationExchange, registerRoutingKey, event);

        // Response
        RegisterResponse response = new RegisterResponse();
        response.userId = user.getUserId().toString();
        response.email = user.getEmail();
        response.fullName = user.getFullName();
        response.role = user.getRole().name();
        response.status = "inactive";
        response.isDeleted = false;
        response.createdAt = user.getCreatedAt();
        return response;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmailAndIsDeletedFalse(request.email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.password, userOpt.get().getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        if (!userOpt.get().isActive()){
            throw new BusinessException("Account not verified");
        }
        User user = userOpt.get();
        String accessToken = jwtUtil.generateToken(user);
        String refreshTokenStr = jwtUtil.generateRefreshToken(user);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenStr);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);
        // TODO: Send event to AdminService

        LoginResponse response = new LoginResponse();
        response.accessToken = accessToken;
        response.refreshToken = refreshTokenStr;
        response.userId = user.getUserId().toString();
        response.role = user.getRole().name();
        return response;
    }

    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(request.refreshToken);
        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenOpt.ifPresent(token -> refreshTokenRepository.deleteById(token.getTokenId()));
            throw new RuntimeException("Invalid or expired refresh token");
        }
        User user = tokenOpt.get().getUser();
        String newAccessToken = jwtUtil.generateToken(user);
        RefreshTokenResponse response = new RefreshTokenResponse();
        response.accessToken = newAccessToken;
        return response;
    }

    @Transactional
    public LogoutResponse logout(LogoutRequest request) {
        refreshTokenRepository.deleteByToken(request.refreshToken);
        // TODO: Send event to AdminService
        LogoutResponse response = new LogoutResponse();
        response.message = "Logged out successfully";
        return response;
    }

    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("User not found");
        User user = userOpt.get();
        Optional<OtpToken> otpOpt = otpTokenRepository.findTopByUser_EmailOrderByCreatedAtDesc(request.email);
        if (otpOpt.isEmpty()) throw new ResourceNotFoundException("OTP not found");
        OtpToken otp = otpOpt.get();
        if (otp.isUsed()) throw new RuntimeException("OTP already used");
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) throw new RuntimeException("OTP expired, request new OTP");
        if (!otp.getOtpCode().equals(request.otp)) throw new RuntimeException("Invalid OTP");
        otp.setUsed(true);
        otpTokenRepository.save(otp);
        user.setActive(true);
        userRepository.save(user);
        // TODO: Send event to AdminService
        VerifyOtpResponse response = new VerifyOtpResponse();
        response.message = "Verify OTP successfully";
        return response;
    }

    @Transactional
    public ResetOtpResponse resetOtp(ResetOtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("User not found");
        User user = userOpt.get();
        String otpCode = String.format("%06d", (int)(Math.random()*1000000));
        OtpToken otp = new OtpToken();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setUsed(false);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setCreatedAt(LocalDateTime.now());
        otpTokenRepository.save(otp);

        // TODO: Send event to NotificationService
        Map<String, Object> event = new HashMap<>();
        event.put("email", user.getEmail());
        event.put("name", user.getFullName());
        event.put("otp", otpCode);
        event.put("event_type", registerRoutingKey);
        eventPublisher.publish(notificationExchange, registerRoutingKey, event);

        ResetOtpResponse response = new ResetOtpResponse();
        response.otp = otpCode;
        return response;
    }

    @Transactional
    public ForgotPasswordResponse changePassword(ChangePasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmailAndIsDeletedFalse(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("User not found");
        User user = userOpt.get();
        if (!passwordEncoder.matches(request.oldPassword, user.getPassword())) {
            throw new BusinessException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);
        return new ForgotPasswordResponse("Password changed successfully");
    }

    @Transactional
    public void requestResetPassword(RequestResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmailAndIsDeletedFalse(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("User not found");
        User user = userOpt.get();
        String otpCode = String.format("%06d", (int)(Math.random() * 1000000));
        OtpToken otp = new OtpToken();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setUsed(false);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setCreatedAt(LocalDateTime.now());
        otpTokenRepository.save(otp);
        // Send OTP event to RabbitMQ
        Map<String, Object> event = new HashMap<>();
        event.put("email", user.getEmail());
        event.put("name", user.getFullName());
        event.put("otp", otpCode);
        event.put("event_type", resetPasswordRoutingKey);
        eventPublisher.publish(notificationExchange, resetPasswordRoutingKey, event);
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmailAndIsDeletedFalse(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("User not found");
        User user = userOpt.get();
        Optional<OtpToken> otpOpt = otpTokenRepository.findTopByUser_EmailOrderByCreatedAtDesc(request.email);
        if (otpOpt.isEmpty()) throw new ResourceNotFoundException("OTP not found");
        OtpToken otp = otpOpt.get();
        if (otp.isUsed()) throw new BusinessException("OTP already used");
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) throw new BusinessException("OTP expired");
        if (!otp.getOtpCode().equals(request.otp)) throw new BusinessException("Invalid OTP");
        otp.setUsed(true);
        otpTokenRepository.save(otp);
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);
        return new ForgotPasswordResponse("Password reset successful");
    }
}
