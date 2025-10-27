package com.ptit.userservice.service;

import com.ptit.userservice.dto.*;
import com.ptit.userservice.entity.*;
import com.ptit.userservice.exception.BusinessException;
import com.ptit.userservice.exception.ResourceNotFoundException;
import com.ptit.userservice.exception.UnauthorizedException;
import com.ptit.userservice.repository.*;
import com.ptit.userservice.config.JwtUtil;
import com.ptit.userservice.config.EventPublisher;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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

    @Value("${jwt.refreshExpirationMs}")
    private int refreshTokenDurationMs;

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
                throw new DataIntegrityViolationException("Email đã tồn tại trong hệ thống");
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
                Map<String, Object> data = new HashMap<>();
                data.put("name", existingUser.getFullName());
                data.put("otp", otpCode);
                data.put("email", existingUser.getEmail());

                Map<String, Object> event = new HashMap<>();
                event.put("event_type", registerRoutingKey);
                event.put("to", existingUser.getEmail());
                event.put("data", data);

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

    private LocalDateTime calculateRefreshTokenExpiry() {
        long expirySeconds = refreshTokenDurationMs / 1000;
        return LocalDateTime.now().plusSeconds(expirySeconds);
    }

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        if (request.email == null || request.email.trim().isEmpty()) {
            throw new BusinessException("Email không được bỏ trống");
        }
        if (request.password == null || request.password.trim().isEmpty()) {
            throw new BusinessException("Mật khẩu không được bỏ trống");
        }
        Optional<User> userOpt = userRepository.findByEmailAndIsDeletedFalse(request.email);
        if (userOpt.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            throw new BusinessException("Sai mật khẩu");
        }
        if (!user.isActive()) {
            throw new BusinessException("Tài khoản chưa được xác thực");
        }
        String accessToken = jwtUtil.generateToken(user);
        String refreshTokenStr = jwtUtil.generateRefreshToken(user);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenStr);
        refreshToken.setExpiresAt(calculateRefreshTokenExpiry());
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);
        Cookie cookie = new Cookie("refreshToken", refreshTokenStr);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        int expirySeconds = refreshTokenDurationMs / 1000;
        cookie.setMaxAge(expirySeconds);
        response.addCookie(cookie);

        LoginResponse result = new LoginResponse();
        result.accessToken = accessToken;
        return result;
    }

    @Transactional
    public RefreshTokenResponse refreshTokenFromCookie(String refreshToken) {
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(refreshToken);
        if (tokenOpt.isEmpty() || tokenOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenOpt.ifPresent(token -> refreshTokenRepository.deleteById(token.getTokenId()));
            throw new UnauthorizedException("Refresh token đã hết hạn hoặc không hợp lệ");
        }
        User user = tokenOpt.get().getUser();
        String newAccessToken = jwtUtil.generateToken(user);
        LoginResponse result = new LoginResponse();
        RefreshTokenResponse response = new RefreshTokenResponse();
        response.accessToken = newAccessToken;
        return response;
    }

    @Transactional
    public LogoutResponse logout(String refreshToken) {
        refreshTokenRepository.deleteByToken(refreshToken);
        // TODO: Send event to AdminService
        LogoutResponse response = new LogoutResponse();
        response.message = "Đăng xuất thành công";
        return response;
    }


    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy người dùng");
        User user = userOpt.get();
        Optional<OtpToken> otpOpt = otpTokenRepository.findTopByUser_EmailOrderByCreatedAtDesc(request.email);
        if (otpOpt.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy OTP");
        OtpToken otp = otpOpt.get();
        if (otp.isUsed()) throw new RuntimeException("OTP đã được sử dụng");
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) throw new RuntimeException("OTP hết hạn");
        if (!otp.getOtpCode().equals(request.otp)) throw new RuntimeException("Sai OTP");
        otp.setUsed(true);
        otpTokenRepository.save(otp);
        user.setActive(true);
        userRepository.save(user);
        // TODO: Send event to AdminService
        VerifyOtpResponse response = new VerifyOtpResponse();
        response.message = "Xác thực OTP thành công";
        return response;
    }

    @Transactional
    public ResetOtpResponse resetOtp(ResetOtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy người dùng");
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
        Map<String, Object> data = new HashMap<>();
        data.put("name", user.getFullName());
        data.put("otp", otpCode);
        data.put("email", user.getEmail());

        Map<String, Object> event = new HashMap<>();
        event.put("event_type", registerRoutingKey);
        event.put("to", user.getEmail());
        event.put("data", data);
        eventPublisher.publish(notificationExchange, registerRoutingKey, event);

        ResetOtpResponse response = new ResetOtpResponse();
        response.otp = otpCode;
        return response;
    }

    @Transactional
    public void requestResetPassword(RequestResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmailAndIsDeletedFalse(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy người dùng");
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
        Map<String, Object> data = new HashMap<>();
        data.put("name", user.getFullName());
        data.put("otp", otpCode);
        data.put("email", user.getEmail());

        Map<String, Object> event = new HashMap<>();
        event.put("event_type", resetPasswordRoutingKey);
        event.put("to", user.getEmail());
        event.put("data", data);
        eventPublisher.publish(notificationExchange, resetPasswordRoutingKey, event);
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmailAndIsDeletedFalse(request.email);
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy người dùng");
        User user = userOpt.get();
        Optional<OtpToken> otpOpt = otpTokenRepository.findTopByUser_EmailOrderByCreatedAtDesc(request.email);
        if (otpOpt.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy OTP");
        OtpToken otp = otpOpt.get();
        if (otp.isUsed()) throw new BusinessException("OTP đã được sử dụng");
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) throw new BusinessException("OTP đã hết hạn");
        if (!otp.getOtpCode().equals(request.otp)) throw new BusinessException("Sai OTP");
        otp.setUsed(true);
        otpTokenRepository.save(otp);
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);
        return new ForgotPasswordResponse("Đặt lại mật khẩu thành công");
    }
}
