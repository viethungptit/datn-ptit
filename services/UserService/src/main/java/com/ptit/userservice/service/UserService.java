package com.ptit.userservice.service;

import com.ptit.userservice.config.EventPublisher;
import com.ptit.userservice.dto.*;
import com.ptit.userservice.entity.OtpToken;
import com.ptit.userservice.entity.User;
import com.ptit.userservice.exception.BusinessException;
import com.ptit.userservice.exception.ResourceNotFoundException;
import com.ptit.userservice.repository.OtpTokenRepository;
import com.ptit.userservice.repository.UserRepository;
import com.ptit.userservice.repository.CandidateRepository;
import com.ptit.userservice.repository.EmployerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.util.*;
import java.util.stream.Collectors;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private OtpTokenRepository otpTokenRepository;
    @Autowired
    private CandidateRepository candidateRepository;
    @Autowired
    private EmployerRepository employerRepository;
    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private EventPublisher eventPublisher;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    public UserResponse updateUser(UUID userId, UserUpdateAdminRequest request, String currentUserId, boolean isAdmin) {
        if (!isAdmin && !userId.equals(UUID.fromString(currentUserId))) {
            throw new AccessDeniedException("Bạn không thể chỉnh sửa thông tin của người khác");
        }
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        existingUser.setFullName(request.getFullName());
        existingUser.setPhone(request.getPhone());
        existingUser.setRole(request.getRole());
        userRepository.save(existingUser);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId)
                        .actorRole("ADMIN")
                        .action("UPDATE_USER")
                        .targetType("USER")
                        .targetId(existingUser.getUserId().toString())
                        .description(String.format("Quản trị viên %s đã cập nhật thông tin người dùng %s", currentUserId, existingUser.getUserId()))
                        .build()
        );
        return toResponse(existingUser);
    }

    public UserResponse createUser(UserRequest request, String currentUserId) {
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (!existingUser.isDeleted()) {
                throw new DataIntegrityViolationException("Email đã tồn tại trên hệ thống");
            } else {
                existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
                existingUser.setFullName(request.getFullName());
                existingUser.setPhone(request.getPhone());
                existingUser.setRole(request.getRole());
                existingUser.setDeleted(false);
                existingUser.setActive(true);
                existingUser.setCreatedAt(LocalDateTime.now());
                userRepository.save(existingUser);
                return toResponse(existingUser);
            }
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(true)
                .isDeleted(false)
                .createdAt(LocalDateTime.now())
                .build();
        userRepository.save(user);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId)
                        .actorRole("ADMIN")
                        .action("CREATE_USER")
                        .targetType("USER")
                        .targetId(user.getUserId().toString())
                        .description(String.format("Quản trị viên %s đã tạo người dùng %s", currentUserId, user.getUserId()))
                        .build()
        );
        return toResponse(user);
    }

    public void deleteUser(UUID userId, String currentUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        user.setDeleted(true);
        user.setActive(false);
        userRepository.save(user);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId)
                        .actorRole("ADMIN")
                        .action("DELETE_USER")
                        .targetType("USER")
                        .targetId(user.getUserId().toString())
                        .description(String.format("Quản trị viên %s đã xóa người dùng %s", currentUserId, user.getUserId()))
                        .build()
        );
    }

    public UserResponse getUser(UUID userId, String currentUserId, boolean isPrivilegedUser) {
        if (!isPrivilegedUser && !userId.equals(UUID.fromString(currentUserId))) {
            throw new AccessDeniedException("Bạn không thể chỉnh sửa thông tin của người khác");
        }
        User user = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return toResponse(user);
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .filter(u -> !u.isDeleted())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    public Page<UserResponse> listUsersPaged(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return userRepository.findAllByIsDeletedFalse(pageRequest)
                .map(this::toResponse);
    }
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return toResponse(user);
    }

    public UserResponse getUserByUserId(UUID userId) {
        User user = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setActive(user.isActive());
        response.setDeleted(user.isDeleted());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    @Transactional
    public ForgotPasswordResponse changePassword(ChangePasswordRequest request, String currentUserId, boolean isAdmin) {
        Optional<User> userOpt = userRepository.findById(UUID.fromString(currentUserId));
        if (userOpt.isEmpty()) throw new ResourceNotFoundException("Không tìm thấy người dùng");
        User user = userOpt.get();
        if (!isAdmin && !user.getUserId().equals(UUID.fromString(currentUserId))) {
            throw new AccessDeniedException("Bạn không thể thay đổi mật khẩu của người khác");
        }
        if (!passwordEncoder.matches(request.oldPassword, user.getPassword())) {
            throw new BusinessException("Mật khẩu hiện tại sai");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userRepository.save(user);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId)
                        .actorRole("USER")
                        .action("CHANGE_PASSWORD")
                        .targetType("USER")
                        .targetId(currentUserId)
                        .description(String.format("Người dùng %s đã đổi mật khẩu trên hệ thống", currentUserId))
                        .build()
        );

        return new ForgotPasswordResponse("Đổi mật khẩu thành công");
    }

    public UserResponse updateUserMe(UUID currentUserId, UserUpdateRequest request){
        User existingUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        existingUser.setFullName(request.getFullName());
        existingUser.setPhone(request.getPhone());
        userRepository.save(existingUser);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("USER")
                        .action("UPDATE_USER_PROFILE")
                        .targetType("USER")
                        .targetId(currentUserId.toString())
                        .description(String.format("Người dùng %s đã cập nhật thông tin cá nhân", currentUserId))
                        .build()
        );

        return toResponse(existingUser);
    }

    public UserResponse getUserMe(UUID currentUserId) {
        User user = userRepository.findById(currentUserId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        UserResponse response = toResponse(user);
        // attach profile data depending on role
        if (user.getRole() == User.Role.candidate) {
            candidateRepository.findByUser_UserId(currentUserId)
                    .ifPresent(candidate -> response.setCandidate(userProfileService.toCandidateResponse(candidate)));
        }
        else if (user.getRole() == User.Role.employer) {
            employerRepository.findByUser_UserId(currentUserId)
                    .ifPresent(employer -> {
                        response.setEmployer(userProfileService.toEmployerResponse(employer));
                        if (employer.getCompany() != null) {
                            response.setCompany(userProfileService.toCompanyResponse(employer.getCompany()));
                        }
                    });
        }
        return response;
    }
}
